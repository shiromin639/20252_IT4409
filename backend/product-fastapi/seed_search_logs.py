import asyncio
import random
from datetime import datetime, timedelta
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.core.db import engine
from app.models.search_log import SearchLog

# Popular keywords and some typos/empty results
KEYWORDS = [
    ("MSI", 1.0),
    ("ThinkPad", 0.9),
    ("Gaming Laptop", 0.8),
    ("RTX 4060", 0.7),
    ("MacBook", 0.7),
    ("Dell XPS", 0.6),
    ("Asus ROG", 0.5),
    ("HP Envy", 0.4),
    ("OLED", 0.4),
    ("Core i9", 0.3),
    # No result keywords
    ("macbook m5", 0.1),
    ("rtx 5090", 0.05),
    ("lenovo yoga folding", 0.05),
]

async def seed_search_logs():
    async with AsyncSession(engine) as session:
        # Check if already seeded
        result = await session.execute(select(SearchLog).limit(1))
        if result.scalars().first():
            print("Search logs database already seeded. Skipping.")
            return

        print("Seeding search logs...")
        
        now = datetime.utcnow()
        logs_to_insert = []
        
        # Total searches: ~5000 over 90 days
        for _ in range(5000):
            # Pick a random day in the last 90 days
            days_ago = random.randint(0, 89)
            # Pick a random time in that day
            hours_ago = random.randint(0, 23)
            minutes_ago = random.randint(0, 59)
            
            created_at = now - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
            
            # Pick a random keyword based on weight
            total_weight = sum(w for _, w in KEYWORDS)
            rand_val = random.uniform(0, total_weight)
            current_weight = 0
            selected_keyword = KEYWORDS[0][0]
            
            for kw, w in KEYWORDS:
                current_weight += w
                if rand_val <= current_weight:
                    selected_keyword = kw
                    break
                    
            # Determine result count (if it's a known no-result, 0)
            result_count = 0
            if selected_keyword not in ["macbook m5", "rtx 5090", "lenovo yoga folding"]:
                result_count = random.randint(1, 15)
                
            # Randomly assign a user_id (about 30% of searches are authenticated)
            user_id = random.randint(1, 10) if random.random() < 0.3 else None
            
            log = SearchLog(
                user_id=user_id,
                keyword=selected_keyword.lower(),
                result_count=result_count,
                created_at=created_at
            )
            logs_to_insert.append(log)
            
        session.add_all(logs_to_insert)
        await session.commit()
        print(f"Seeded {len(logs_to_insert)} search logs.")

if __name__ == "__main__":
    asyncio.run(seed_search_logs())
