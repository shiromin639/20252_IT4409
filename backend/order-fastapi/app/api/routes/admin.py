from typing import List, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter
from sqlmodel import select, func, col

from app.api.deps import SessionDep
from app.models.order import Order
from app.models.order_item import OrderItem
from app.core.services import ProductService, UserService

router = APIRouter(tags=["admin"])

@router.get("/stats")
def get_stats(session: SessionDep) -> Dict[str, Any]:
    # Total revenue from paid orders
    statement = select(func.sum(Order.total_amount)).where(Order.payment_status == "PAID")
    total_revenue = session.exec(statement).one() or 0
    
    # Total orders
    total_orders = session.exec(select(func.count(Order.id))).one()
    
    # Total customers and products from other services
    total_customers = UserService.get_total_users()
    products_response = ProductService.get_all_products()
    total_products = products_response.get("count", 0)
    
    return {
        "total_revenue": float(total_revenue),
        "total_orders": total_orders,
        "total_customers": total_customers,
        "total_products": total_products
    }

@router.get("/revenue/daily")
def get_daily_revenue(session: SessionDep) -> List[Dict[str, Any]]:
    # Get revenue by day for the last 7 days
    # SQLite/PostgreSQL date grouping via func.date
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Group by date part of created_at
    statement = (
        select(
            func.date(Order.created_at).label("date"),
            func.sum(Order.total_amount).label("revenue")
        )
        .where(Order.payment_status == "PAID")
        .where(Order.created_at >= seven_days_ago)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at).asc())
    )
    
    results = session.exec(statement).all()
    
    return [
        {"date": str(row.date), "revenue": float(row.revenue)}
        for row in results
    ]

@router.get("/best-sellers")
def get_best_sellers(session: SessionDep) -> List[Dict[str, Any]]:
    # Aggregate quantity from order items of paid orders
    sold_col = func.sum(OrderItem.quantity).label("sold")
    statement = (
        select(
            OrderItem.product_id,
            sold_col
        )
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.payment_status == "PAID")
        .group_by(OrderItem.product_id)
        .order_by(sold_col.desc())
        .limit(10)
    )
    
    results = session.exec(statement).all()
    
    # Fetch products to map names
    products_response = ProductService.get_all_products()
    product_map = {p["id"]: p["name"] for p in products_response.get("data", [])}
    
    return [
        {
            "product_id": row.product_id,
            "product_name": product_map.get(row.product_id, f"Product #{row.product_id}"),
            "sold": int(row.sold)
        }
        for row in results
    ]

@router.get("/revenue-by-brand")
def get_revenue_by_brand(session: SessionDep) -> List[Dict[str, Any]]:
    statement = (
        select(
            OrderItem.product_id,
            func.sum(OrderItem.quantity * OrderItem.unit_price).label("revenue")
        )
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.payment_status == "PAID")
        .group_by(OrderItem.product_id)
    )
    
    results = session.exec(statement).all()
    
    # Fetch products to map brands
    products_response = ProductService.get_all_products()
    brand_map = {p["id"]: p.get("brand", "Unknown") for p in products_response.get("data", [])}
    
    revenue_by_brand = {}
    for row in results:
        brand = brand_map.get(row.product_id, "Unknown")
        # Ensure proper capitalization if needed, or group case-insensitively
        brand_key = str(brand).capitalize() if brand else "Unknown"
        revenue_by_brand[brand_key] = revenue_by_brand.get(brand_key, 0) + float(row.revenue)
        
    # Format to array and sort
    sorted_brands = sorted(
        [{"brand": k, "revenue": v} for k, v in revenue_by_brand.items()],
        key=lambda x: x["revenue"],
        reverse=True
    )
    
    return sorted_brands
