import hashlib
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlmodel import select, func, col

from app.api.deps import SessionDep
from app.models.search_log import SearchLog
from app.core.cache import get_cache, set_cache

router = APIRouter()

@router.get("/stats")
async def get_search_stats(session: SessionDep):
    cache_key = "admin:search:stats"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    seven_days_ago = now - timedelta(days=7)

    total_searches = await session.execute(select(func.count(SearchLog.id)))
    total_searches = total_searches.scalar() or 0

    unique_keywords = await session.execute(select(func.count(func.distinct(SearchLog.keyword))))
    unique_keywords = unique_keywords.scalar() or 0

    searches_today = await session.execute(
        select(func.count(SearchLog.id)).where(SearchLog.created_at >= today_start)
    )
    searches_today = searches_today.scalar() or 0

    searches_last_7_days = await session.execute(
        select(func.count(SearchLog.id)).where(SearchLog.created_at >= seven_days_ago)
    )
    searches_last_7_days = searches_last_7_days.scalar() or 0

    result = {
        "total_searches": total_searches,
        "unique_keywords": unique_keywords,
        "searches_today": searches_today,
        "searches_last_7_days": searches_last_7_days
    }
    await set_cache(cache_key, result, ttl=300)
    return result

@router.get("/top-keywords")
async def get_top_keywords(session: SessionDep):
    cache_key = "admin:search:top-keywords"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    # Top 20 keywords
    statement = (
        select(SearchLog.keyword, func.count(SearchLog.id).label("count"))
        .group_by(SearchLog.keyword)
        .order_by(func.count(SearchLog.id).desc())
        .limit(20)
    )
    results = await session.execute(statement)
    
    data = [{"keyword": row[0], "count": row[1]} for row in results.all()]
    await set_cache(cache_key, data, ttl=300)
    return data

@router.get("/no-results")
async def get_no_results(session: SessionDep):
    cache_key = "admin:search:no-results"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    statement = (
        select(SearchLog.keyword, func.count(SearchLog.id).label("count"))
        .where(SearchLog.result_count == 0)
        .group_by(SearchLog.keyword)
        .order_by(func.count(SearchLog.id).desc())
        .limit(20)
    )
    results = await session.execute(statement)
    
    data = [{"keyword": row[0], "count": row[1]} for row in results.all()]
    await set_cache(cache_key, data, ttl=300)
    return data

@router.get("/trends")
async def get_search_trends(session: SessionDep):
    cache_key = "admin:search:trends"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    
    # We group by date. For postgres, func.date() works.
    statement = (
        select(func.date(SearchLog.created_at).label("date"), func.count(SearchLog.id).label("volume"))
        .where(SearchLog.created_at >= thirty_days_ago)
        .group_by(func.date(SearchLog.created_at))
        .order_by(func.date(SearchLog.created_at))
    )
    
    results = await session.execute(statement)
    
    data = [{"date": str(row[0]), "volume": row[1]} for row in results.all()]
    await set_cache(cache_key, data, ttl=300)
    return data
