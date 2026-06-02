from app.api.deps import SessionDep
from fastapi import APIRouter, HTTPException
from sqlmodel import col, func, select, or_
from sqlalchemy import cast, String
from app.models.category import Category
from app.models.product import (
    Product,
    ProductCreate,
    ProductPublic,
    ProductUpdate,
    ProductsPublic,
)

from fastapi import APIRouter, HTTPException, UploadFile, File
import cloudinary
import cloudinary.uploader
from app.core.config import settings
from app.core.cache import get_cache, set_cache, invalidate_cache, invalidate_cache_pattern
import hashlib
import json

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
    skip: int = 0, 
    limit: int = 100,
    q: str | None = None,
    category_id: int | None = None,
    brand: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    sort_by: str | None = "newest"
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
        import unicodedata
        def remove_accents(input_str: str) -> str:
            input_str = input_str.replace('đ', 'd').replace('Đ', 'D')
            nfkd_form = unicodedata.normalize('NFKD', input_str)
            return nfkd_form.encode('ASCII', 'ignore').decode('utf-8')

        q_lower = q.lower().strip()
        q_normalized = remove_accents(q_lower)
        
        # Keyword mapping to support broader searches (using normalized keys)
        keyword_map = {
            "gaming": ["Gaming Laptop", "gaming"],
            "game": ["Gaming Laptop", "gaming"],
            "choi game": ["Gaming Laptop", "gaming"],
            
            "office": ["Office Laptop", "office"],
            "van phong": ["Office Laptop", "office"],
            
            "ultrabook": ["Ultrabook", "ultrabook"],
            
            "creator": ["Creator Laptop", "creator"],
            "do hoa": ["Creator Laptop", "creator"],
            "designer": ["Creator Laptop", "creator"],
            "design": ["Creator Laptop", "creator"],
            
            "lap trinh": ["Office Laptop", "Creator Laptop", "MacBook", "ThinkPad"],
            "programming": ["Office Laptop", "Creator Laptop", "MacBook", "ThinkPad"],
            "developer": ["Office Laptop", "Creator Laptop", "MacBook", "ThinkPad"],
            
            "hoc tap": ["Office Laptop"],
            "sinh vien": ["Office Laptop"],
            "student": ["Office Laptop"],
            
            "workstation": ["Workstation", "workstation"],
            
            "macbook": ["Apple", "MacBook", "macbook"],
            "apple": ["Apple", "MacBook", "macbook"]
        }
        
        # Default to searching both the exact lowercase query and the unaccented version
        search_terms = keyword_map.get(q_normalized, list(set([q_lower, q_normalized])))
        
        conditions = []
        for term in search_terms:
            conditions.extend([
                col(Product.name).ilike(f"%{term}%"),
                col(Product.description).ilike(f"%{term}%"),
                col(Product.brand).ilike(f"%{term}%"),
                col(Category.name).ilike(f"%{term}%"),
                cast(Product.specifications, String).ilike(f"%{term}%")
            ])
            
        query = query.where(or_(*conditions))
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
    
    products = await session.exec(query)
    products = products.all()
    products_public = [ProductPublic.model_validate(product) for product in products]
    result = ProductsPublic(data=products_public, count=count)
    
    await set_cache(cache_key, result.model_dump(mode="json"), ttl=600)
    return result


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

