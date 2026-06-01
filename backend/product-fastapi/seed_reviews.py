import asyncio
import random
from faker import Faker
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.db import engine
from app.models.review import Review, ReviewStatus
from app.models.product import Product

fake = Faker('vi_VN')

# Realistic tech review comments
REVIEW_COMMENTS = {
    5: [
        "Sản phẩm tuyệt vời, rất đáng tiền.",
        "Máy chạy rất nhanh, mượt mà. Giao hàng cực nhanh.",
        "Màn hình đẹp, pin trâu, chơi game không bị nóng.",
        "Rất ưng ý, thiết kế đẹp và sang trọng.",
        "Nhân viên tư vấn nhiệt tình, máy đúng như mô tả.",
        "Cấu hình mạnh mẽ, phù hợp cho công việc lập trình và đồ hoạ.",
        "Chất lượng build quá tốt trong tầm giá.",
        "Bàn phím gõ sướng, touchpad nhạy."
    ],
    4: [
        "Sản phẩm tốt nhưng giao hàng hơi chậm.",
        "Máy xài ổn, pin không trâu như quảng cáo nhưng đủ dùng.",
        "Mọi thứ đều hoàn hảo trừ việc hơi nặng.",
        "Tốt trong tầm giá, màn hình hơi ám vàng một xíu.",
        "Chơi game tốt, tản nhiệt hơi ồn.",
        "Khá hài lòng với sản phẩm này."
    ],
    3: [
        "Tạm ổn, không có gì nổi bật.",
        "Xài một thời gian thấy máy hơi nóng.",
        "Phù hợp với nhu cầu cơ bản, giá hơi cao.",
        "Chất lượng bình thường, camera hơi mờ.",
        "Thiết kế bình thường, màn hình góc nhìn hẹp."
    ],
    2: [
        "Máy chạy chậm, thi thoảng bị đơ.",
        "Pin quá yếu, phải cắm sạc liên tục.",
        "Giao hàng chậm, đóng gói không cẩn thận.",
        "Không đáng tiền, khuyên mọi người cân nhắc kỹ."
    ],
    1: [
        "Hàng lỗi, đã yêu cầu đổi trả.",
        "Quá tệ, sập nguồn liên tục.",
        "Chất lượng build ọp ẹp, không xứng đáng giá tiền.",
        "Bảo hành chậm chạp, máy mua về lỗi màn hình."
    ]
}

REVIEW_TITLES = {
    5: ["Tuyệt vời", "Cực kỳ hài lòng", "Rất đáng tiền", "Máy rất tốt", "Đỉnh của chóp"],
    4: ["Tốt", "Hài lòng", "Khá ổn", "Đáng mua"],
    3: ["Bình thường", "Tạm được", "Không như kỳ vọng"],
    2: ["Hơi thất vọng", "Chưa xứng với giá tiền", "Pin yếu"],
    1: ["Thất vọng", "Sản phẩm lỗi", "Không nên mua"]
}

async def generate_reviews():
    async with AsyncSession(engine, expire_on_commit=False) as session:
        print("Fetching products...")
        # Get all products
        products = (await session.exec(select(Product))).all()
        if not products:
            print("No products found. Run seed.py first.")
            return

        print(f"Found {len(products)} products. Generating reviews...")

        # We will use user IDs 1 to 300 assuming they were seeded
        user_ids = list(range(1, 301))
        
        total_reviews = 0
        
        for product in products:
            # Generate 5-20 reviews per product
            num_reviews = random.randint(5, 20)
            product_reviews = []
            
            # Select random users without replacement to avoid duplicate reviews from same user
            reviewers = random.sample(user_ids, min(num_reviews, len(user_ids)))
            
            for user_id in reviewers:
                # Realistic rating distribution: mostly 5 and 4 stars
                rating = random.choices([5, 4, 3, 2, 1], weights=[60, 25, 8, 4, 3])[0]
                
                title = random.choice(REVIEW_TITLES[rating])
                comment = random.choice(REVIEW_COMMENTS[rating])
                
                # Add some random extra text occasionally
                if random.random() < 0.3:
                    comment += " " + fake.sentence()
                
                review = Review(
                    product_id=product.id,
                    user_id=user_id,
                    rating=rating,
                    title=title,
                    comment=comment,
                    is_verified_purchase=random.random() < 0.8, # 80% are verified
                    review_status=ReviewStatus.ACTIVE
                )
                product_reviews.append(review)
            
            # Add to session
            for r in product_reviews:
                session.add(r)
                total_reviews += 1
                
            # Calculate and update product stats
            if product_reviews:
                avg_rating = sum(r.rating for r in product_reviews) / len(product_reviews)
                product.average_rating = round(avg_rating, 1)
                product.total_reviews = len(product_reviews)
                session.add(product)

            # Don't commit here to avoid expiring other products
            # await session.commit()
            
        print("Committing all reviews to database...")
        await session.commit()
        
        print(f"Successfully generated {total_reviews} reviews and updated product statistics!")

if __name__ == "__main__":
    asyncio.run(generate_reviews())
