from app.api.deps import SessionDep
from fastapi import APIRouter, HTTPException
from app.api.deps import SessionDep, OptionalUserId
from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from sqlmodel import col, func, select, or_, text
from sqlalchemy import cast, String
from app.models.category import Category
from app.models.product import (
    Product,
    ProductCreate,
    ProductPublic,
    ProductUpdate,
    ProductsPublic,
)
from app.models.search_log import SearchLog

import cloudinary
import cloudinary.uploader
from app.core.config import settings
from app.core.cache import get_cache, set_cache, invalidate_cache, invalidate_cache_pattern
import hashlib
import json
import re
SYNONYMS = {
    "choi game": "gaming",
    "game": "gaming",
    "do hoa": "creator",
    "đồ họa": "creator",
    "van phong": "office",
    "văn phòng": "office"
}

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

router = APIRouter(tags=["product"])

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Read the file content
    content = await file.read()
    
    try:
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            content,
            folder="ecommerce_products",
            resource_type="image"
        )
        return {"secure_url": upload_result["secure_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/products", response_model=ProductPublic)
async def create_product(session: SessionDep, product_in: ProductCreate):
    category = await session.get(Category, product_in.category_id)
    if not category:
        raise HTTPException(
            status_code=404,
            detail=f"Category with id {product_in.category_id} not found",
        )
    product = Product.model_validate(product_in)
    session.add(product)
    await session.commit()
    await session.refresh(product)
    await invalidate_cache_pattern("products:list:*")
    return product

@router.get("/products", response_model=ProductsPublic)
async def read_products(
    session: SessionDep, 
    background_tasks: BackgroundTasks,
    skip: int = 0, 
    limit: int = 100,
    q: str | None = None,
    category_id: int | None = None,
    brand: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    sort_by: str | None = "newest",
    user_id: OptionalUserId = None
):
    # Construct cache key based on query params
    query_params = {
        "skip": skip,
        "limit": limit,
        "q": q,
        "category_id": category_id,
        "brand": brand,
        "min_price": min_price,
        "max_price": max_price,
        "sort_by": sort_by
    }
    query_hash = hashlib.md5(json.dumps(query_params, sort_keys=True).encode()).hexdigest()
    cache_key = f"products:list:{query_hash}"
    
    cached_data = await get_cache(cache_key)
    if cached_data:
        return ProductsPublic(**cached_data)

    query = select(Product).join(Category, isouter=True)
    
    if q:
        print(f"[SEARCH] Incoming query: '{q}'")
        q_clean = q.strip().lower()
        
        # Apply semantic translation
        for synonym, replacement in SYNONYMS.items():
            if synonym in q_clean:
                q_clean = q_clean.replace(synonym, replacement)
                
        print(f"[SEARCH] Normalized query: '{q_clean}'")
        
        # Remove special characters to avoid FTS syntax errors
        q_clean = re.sub(r'[^\w\s]', '', q_clean)
        
        # Build prefix match string: "lap top" -> "lap:* & top:*"
        terms = [f"{term}:*" for term in q_clean.split() if term]
        if terms:
            search_terms = ' & '.join(terms)
            tsquery = func.to_tsquery('simple', func.f_unaccent(search_terms))
            
            # Combine FTS with ILIKE on category name for cross-entity matching
            fts_condition = Product.search_vector.op('@@')(tsquery)
            category_condition = func.f_unaccent(Category.name).ilike(f"%{q_clean}%")
            
            query = query.where(or_(fts_condition, category_condition))
            
            # Calculate rank and add to SELECT
            rank = func.ts_rank(Product.search_vector, tsquery).label("rank")
            query = query.add_columns(rank)
            
            # Override sort_by if q is present, order by rank DESC
            sort_by = "rank"
            query = query.order_by(text("rank DESC"))
    if category_id is not None:
        query = query.where(Product.category_id == category_id)
    if brand:
        # Use case-insensitive filtering on the top-level brand column
        query = query.where(func.lower(Product.brand) == func.lower(brand))
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
        
    count_statement = select(func.count()).select_from(query.subquery())
    count = await session.exec(count_statement)
    count = count.one()
    
    if sort_by == "price_asc":
        query = query.order_by(col(Product.price).asc())
    elif sort_by == "price_desc":
        query = query.order_by(col(Product.price).desc())
    else:
        query = query.order_by(col(Product.created_at).desc())
        
    query = query.offset(skip).limit(limit)
    
    if q:
        from app.core.db import engine
        compiled_query = query.compile(engine, compile_kwargs={"literal_binds": False})
        print(f"[SEARCH] Generated SQL:\n{compiled_query}")
    
    products = await session.execute(query)
    products = products.all()
    products_public = []
    for row in products:
        if q:
            # When q is present, row is a tuple (Product, rank)
            p = row[0]
            r = row[1]
            print(f"FTS Match: '{q}' -> Product ID: {p.id}, Name: '{p.name}', Rank: {r:.4f}")
        else:
            p = row[0]
            
        products_public.append(ProductPublic.model_validate(p))
        
    result = ProductsPublic(data=products_public, count=count)
    if q:
        print(f"[SEARCH] Total results count: {count}")
    
    await set_cache(cache_key, result.model_dump(mode="json"), ttl=600)

    if q and q.strip():
        async def save_search_log(uid: int | None, keyword: str, result_count: int):
            from app.core.db import engine
            from sqlmodel.ext.asyncio.session import AsyncSession
            from app.core.cache import invalidate_cache_pattern
            
            async with AsyncSession(engine) as bg_session:
                log = SearchLog(user_id=uid, keyword=keyword.strip().lower(), result_count=result_count)
                bg_session.add(log)
                await bg_session.commit()
                await invalidate_cache_pattern("admin:search:*")

        background_tasks.add_task(save_search_log, user_id, q, count)

    return result


@router.get("/products/search/suggestions", response_model=list[str])
async def search_suggestions(session: SessionDep, q: str):
    if not q or len(q.strip()) < 2:
        return []
        
    q_clean = q.strip()
    
    # We use basic ILIKE prefix match on name for quick autocomplete suggestions
    # You can later replace this with trigram search if typo-tolerance is needed.
    query = (
        select(Product.name)
        .where(col(Product.name).ilike(f"%{q_clean}%"))
        .limit(10)
    )
    
    names = await session.exec(query)
    # Deduplicate and return
    return list(dict.fromkeys(names.all()))

@router.get("/brands", response_model=list[str])
async def read_brands(session: SessionDep):
    statement = select(Product.brand).distinct()
    brands = await session.exec(statement)
    return [b for b in brands.all() if b]


@router.get("/categories/{category_id}/products", response_model=ProductsPublic)
async def read_products_by_category_id(
    session: SessionDep, category_id: int, skip: int = 0, limit: int = 100
):
    count_statement = (
        select(func.count())
        .select_from(Product)
        .where(Product.category_id == category_id)
    )
    count = await session.exec(count_statement)
    count = count.one()
    statement = (
        select(Product)
        .order_by(col(Product.created_at).desc())
        .where(Product.category_id == category_id)
        .offset(skip)
        .limit(limit)
    )
    products = await session.exec(statement)
    products = products.all()
    products_public = [ProductPublic.model_validate(product) for product in products]
    return ProductsPublic(data=products_public, count=count)


@router.get("/products/{product_id}", response_model=ProductPublic)
async def read_product(session: SessionDep, product_id: int):
    cache_key = f"product:{product_id}"
    cached_data = await get_cache(cache_key)
    if cached_data:
        return ProductPublic(**cached_data)

    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=404, detail=f"Product with id: {product_id} not found"
        )
        
    await set_cache(cache_key, ProductPublic.model_validate(product).model_dump(mode="json"), ttl=3600)
    return product


@router.put("/products/{product_id}", response_model=ProductPublic)
async def update_product(
    session: SessionDep, product_id: int, product_in: ProductUpdate
):
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=404, detail=f"Product with id: {product_id} not found"
        )
    update_dict = product_in.model_dump(exclude_unset=True)
    _ = product.sqlmodel_update(update_dict)
    session.add(product)
    await session.commit()
    await session.refresh(product)
    
    await invalidate_cache(f"product:{product_id}")
    await invalidate_cache_pattern("products:list:*")
    
    return product


@router.delete("/products/{product_id}")
async def delete_product(session: SessionDep, product_id: int):
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=404, detail=f"Product with id: {product_id} not found"
        )
    await session.delete(product)
    await session.commit()
    
    await invalidate_cache(f"product:{product_id}")
    await invalidate_cache_pattern("products:list:*")
    
    return {"message": "Delete product successfully"}

from pydantic import BaseModel
class IncrementSalesRequest(BaseModel):
    quantity: int

@router.post("/products/{product_id}/increment-sales")
async def increment_sales(session: SessionDep, product_id: int, request: IncrementSalesRequest):
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=404, detail=f"Product with id: {product_id} not found"
        )
    product.total_sold += request.quantity
    
    # Optionally update best_seller flag if it passes a threshold
    if product.total_sold > 50:
        product.is_bestseller = True
        
    session.add(product)
    await session.commit()
    return {"message": "Sales incremented successfully"}

