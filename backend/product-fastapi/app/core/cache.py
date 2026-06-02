import json
import logging
from typing import Any, Optional, Callable
import redis.asyncio as redis
from app.core.config import settings

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

# Initialize Redis client. If REDIS_URL is not set or connection fails, we'll handle it gracefully.
redis_client = None
if settings.REDIS_URL:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def get_cache(key: str) -> Optional[Any]:
    if not redis_client:
        return None
    try:
        val = await redis_client.get(key)
        if val:
            logger.info(f"CACHE HIT - key: {key}")
            return json.loads(val)
        logger.info(f"CACHE MISS - key: {key}")
        return None
    except Exception as e:
        logger.error(f"Redis GET error for key {key}: {e}")
        return None

async def set_cache(key: str, value: Any, ttl: int = 3600) -> None:
    if not redis_client:
        return
    try:
        val_str = json.dumps(value)
        await redis_client.setex(key, ttl, val_str)
        logger.info(f"CACHE SET - key: {key}, ttl: {ttl}")
    except Exception as e:
        logger.error(f"Redis SET error for key {key}: {e}")

async def invalidate_cache(key: str) -> None:
    if not redis_client:
        return
    try:
        await redis_client.delete(key)
        logger.info(f"CACHE INVALIDATED - key: {key}")
    except Exception as e:
        logger.error(f"Redis DELETE error for key {key}: {e}")

async def invalidate_cache_pattern(pattern: str) -> None:
    if not redis_client:
        return
    try:
        cursor = '0'
        count = 0
        while cursor != 0:
            cursor, keys = await redis_client.scan(cursor=cursor, match=pattern, count=100)
            if keys:
                await redis_client.delete(*keys)
                count += len(keys)
        logger.info(f"CACHE INVALIDATED - pattern: {pattern}, matched: {count} keys")
    except Exception as e:
        logger.error(f"Redis SCAN/DELETE error for pattern {pattern}: {e}")
