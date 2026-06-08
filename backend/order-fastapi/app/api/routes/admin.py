from typing import List, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter
from sqlmodel import select, func, col
from fastapi.concurrency import run_in_threadpool
from app.core.cache import get_cache, set_cache

from app.api.deps import SessionDep
from app.models.order import Order
from app.models.order_item import OrderItem
from app.core.services import ProductService, UserService, InventoryService

router = APIRouter(tags=["admin"])

@router.get("/stats")
async def get_stats(session: SessionDep) -> Dict[str, Any]:
    cache_key = "admin:stats"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    def _fetch():
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
        
    data = await run_in_threadpool(_fetch)
    await set_cache(cache_key, data, 300)
    return data

@router.get("/revenue/daily")
async def get_daily_revenue(session: SessionDep) -> List[Dict[str, Any]]:
    cache_key = "admin:revenue_daily"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    def _fetch():
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
        
    data = await run_in_threadpool(_fetch)
    await set_cache(cache_key, data, 300)
    return data

@router.get("/best-sellers")
async def get_best_sellers(session: SessionDep) -> List[Dict[str, Any]]:
    cache_key = "admin:best_sellers"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    def _fetch():
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
        
    data = await run_in_threadpool(_fetch)
    await set_cache(cache_key, data, 300)
    return data

@router.get("/revenue-by-brand")
async def get_revenue_by_brand(session: SessionDep) -> List[Dict[str, Any]]:
    cache_key = "admin:revenue_brand"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    def _fetch():
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
        
    data = await run_in_threadpool(_fetch)
    await set_cache(cache_key, data, 300)
    return data

@router.get("/dashboard")
async def get_dashboard(session: SessionDep) -> Dict[str, Any]:
    cache_key = "admin:dashboard"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    def _fetch():
        # 1. Total revenue
        rev_statement = select(func.sum(Order.total_amount)).where(Order.payment_status == "PAID")
        total_revenue = float(session.exec(rev_statement).one() or 0)
        
        # 2. Total orders
        total_orders = session.exec(select(func.count(Order.id))).one() or 0
        
        # 3. External counts
        total_users = UserService.get_total_users() or 0
        products_response = ProductService.get_all_products() or {"data": [], "count": 0}
        total_products = products_response.get("count", 0)
        product_map = {p["id"]: p for p in products_response.get("data", [])}
        
        # 4. Revenue last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        daily_rev_statement = (
            select(
                func.date(Order.created_at).label("date"),
                func.sum(Order.total_amount).label("revenue")
            )
            .where(Order.payment_status == "PAID")
            .where(Order.created_at >= seven_days_ago)
            .group_by(func.date(Order.created_at))
            .order_by(func.date(Order.created_at).asc())
        )
        daily_results = session.exec(daily_rev_statement).all()
        revenue_last_7_days = [{"date": str(row.date), "revenue": float(row.revenue)} for row in daily_results]

        # 5. Recent orders
        recent_statement = select(Order).order_by(Order.created_at.desc()).limit(5)
        recent_orders = [
            {
                "id": o.id,
                "user_id": o.user_id,
                "total_amount": float(o.total_amount),
                "status": o.status,
                "created_at": o.created_at.isoformat() if o.created_at else None
            }
            for o in session.exec(recent_statement).all()
        ]

        # 6. Top products
        sold_col = func.sum(OrderItem.quantity).label("sold")
        rev_col = func.sum(OrderItem.quantity * OrderItem.unit_price).label("revenue")
        top_statement = (
            select(OrderItem.product_id, sold_col, rev_col)
            .join(Order, Order.id == OrderItem.order_id)
            .where(Order.payment_status == "PAID")
            .group_by(OrderItem.product_id)
            .order_by(sold_col.desc())
            .limit(5)
        )
        top_results = session.exec(top_statement).all()
        top_products = [
            {
                "product_id": row.product_id,
                "product_name": product_map.get(row.product_id, {}).get("name", f"Product #{row.product_id}"),
                "sold": int(row.sold),
                "revenue": float(row.revenue)
            }
            for row in top_results
        ]

        # 7. Low stock products
        low_stock_raw = InventoryService.get_low_stock(10)
        low_stock_products = []
        for inv in low_stock_raw:
            pid = inv.get("product_id")
            rem = inv.get("quantity", 0) - inv.get("reserved_quantity", 0)
            low_stock_products.append({
                "product_id": pid,
                "product_name": product_map.get(pid, {}).get("name", f"Product #{pid}"),
                "remaining": rem
            })

        # 8. Order status summary
        status_statement = select(Order.status, func.count(Order.id)).group_by(Order.status)
        status_results = session.exec(status_statement).all()
        order_status_summary = [{"status": row[0], "count": row[1]} for row in status_results]

        return {
            "totalRevenue": total_revenue,
            "totalOrders": total_orders,
            "totalProducts": total_products,
            "totalUsers": total_users,
            "revenueLast7Days": revenue_last_7_days,
            "recentOrders": recent_orders,
            "topProducts": top_products,
            "lowStockProducts": low_stock_products,
            "orderStatusSummary": order_status_summary
        }
        
    data = await run_in_threadpool(_fetch)
    await set_cache(cache_key, data, 300)
    return data

