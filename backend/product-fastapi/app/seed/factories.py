import random
from decimal import Decimal
from faker import Faker
from app.seed.fixtures import BRAND_TEMPLATES, CPUS, GPUS, DISPLAYS, IMAGE_URLS, get_categories

# Initialize Faker with a fixed seed for deterministic yet realistic outputs
fake = Faker("en_US")
Faker.seed(42)
random.seed(42)

def generate_specifications(tier: str, brand: str) -> dict:
    if brand == "Apple":
        cpu = random.choice(CPUS["Apple"][tier])
        gpu = random.choice(GPUS["Apple"][tier])
        display = random.choice(DISPLAYS["Apple"][tier])
        os = "macOS"
        weight = f"{round(random.uniform(1.2, 2.1), 2)}kg"
        battery = "70Wh"
    else:
        cpu = random.choice(CPUS[tier])
        gpu = random.choice(GPUS[tier])
        display = random.choice(DISPLAYS[tier])
        os = "Windows 11 Home"
        weight = f"{round(random.uniform(1.2, 2.5), 2)}kg"
        battery = "65Wh" if tier in ["Budget", "Mid-range"] else "90Wh"

    if tier == "Budget":
        ram = "8GB"
        storage = "256GB SSD"
    elif tier == "Mid-range":
        ram = "16GB"
        storage = "512GB SSD"
    elif tier == "High-end":
        ram = random.choice(["16GB", "32GB"])
        storage = "1TB SSD"
    else: # Premium
        ram = random.choice(["32GB", "64GB"])
        storage = random.choice(["1TB SSD", "2TB SSD"])

    return {
        "cpu": cpu,
        "gpu": gpu,
        "ram": ram,
        "storage": storage,
        "display": display,
        "weight": weight,
        "battery": battery,
        "os": os
    }

def get_tier_and_price(category_name: str, brand: str) -> tuple[str, float]:
    # Determine possible tiers based on category
    if "Office" in category_name:
        tier = random.choices(["Budget", "Mid-range", "High-end"], weights=[40, 40, 20])[0]
        ranges = {"Budget": (10, 14), "Mid-range": (14, 19), "High-end": (19, 25)}
    elif "Gaming" in category_name:
        tier = random.choices(["Mid-range", "High-end", "Premium"], weights=[30, 50, 20])[0]
        ranges = {"Mid-range": (25, 35), "High-end": (35, 50), "Premium": (50, 70)}
    elif "Ultrabook" in category_name:
        tier = random.choices(["Mid-range", "High-end", "Premium"], weights=[40, 40, 20])[0]
        ranges = {"Mid-range": (20, 28), "High-end": (28, 36), "Premium": (36, 45)}
    elif "Creator" in category_name:
        tier = random.choices(["Mid-range", "High-end", "Premium"], weights=[20, 50, 30])[0]
        ranges = {"Mid-range": (35, 45), "High-end": (45, 60), "Premium": (60, 80)}
    elif "MacBook" in category_name:
        tier = random.choices(["High-end", "Premium"], weights=[50, 50])[0]
        ranges = {"High-end": (25, 45), "Premium": (45, 90)}
    else:
        tier = "Mid-range"
        ranges = {"Mid-range": (15, 25)}

    # Brand overrides for tier distribution
    if brand == "Apple":
        tier = random.choices(["High-end", "Premium"], weights=[50, 50])[0]
        ranges = {"High-end": (25, 45), "Premium": (45, 90)}
    elif brand == "Acer":
        if tier == "Premium": tier = "High-end"
    elif brand == "MSI" and tier == "Budget":
        tier = "Mid-range"

    # Generate base price in Millions VND
    min_p, max_p = ranges[tier]
    base_price_millions = random.uniform(min_p, max_p)

    # Apply Brand Modifiers
    if brand == "Apple":
        base_price_millions *= 1.15
    elif brand == "Dell":
        base_price_millions *= 1.05
    elif brand == "Acer":
        base_price_millions *= 0.90
        
    return tier, base_price_millions * 1_000_000

def generate_products(count: int = 60) -> list[dict]:
    products = []
    categories = get_categories()
    
    for i in range(1, count + 1):
        category = categories[i % len(categories)]
        cat_name = category["name"]
        
        brand = random.choice(BRAND_TEMPLATES.get(cat_name, ["Unknown"]))
        
        series_suffix = fake.word().capitalize() + " " + str(random.choice([13, 14, 15, 16, 17]))
        if brand == "Apple":
            series_name = "MacBook Pro" if i % 2 == 0 else "MacBook Air"
        elif brand == "ASUS":
            series_name = "ROG" if "Gaming" in cat_name else "Zenbook"
        elif brand == "Lenovo":
            series_name = "Legion" if "Gaming" in cat_name else "ThinkPad"
        elif brand == "Dell":
            series_name = "Alienware" if "Gaming" in cat_name else "XPS"
        elif brand == "HP":
            series_name = "Omen" if "Gaming" in cat_name else "Spectre"
        elif brand == "Acer":
            series_name = "Predator" if "Gaming" in cat_name else "Swift"
        elif brand == "MSI":
            series_name = "Stealth" if "Gaming" in cat_name else "Prestige"
        else:
            series_name = series_suffix
            
        product_name = f"{brand} {series_name} {series_suffix}"
        
        # Get Tier and Price (sale price)
        tier, sale_price = get_tier_and_price(cat_name, brand)
        
        # Discounts & Original Price
        is_on_sale = random.random() > 0.6 # 40% chance of being on sale
        discount_percent = random.randint(5, 25) if is_on_sale else 0
        
        # If on sale, original_price > sale_price.
        if is_on_sale:
            original_price_val = sale_price / (1 - (discount_percent / 100))
        else:
            original_price_val = sale_price

        # Round to nearest 10,000 VND for realism (e.g. 15,490,000)
        sale_price = round(sale_price / 10000) * 10000
        original_price_val = round(original_price_val / 10000) * 10000

        price = Decimal(str(sale_price))
        original_price = Decimal(str(original_price_val)) if is_on_sale else None
        
        specs = generate_specifications(tier, brand)
        image_url = IMAGE_URLS.get(cat_name, "https://via.placeholder.com/600x400?text=Laptop")

        slug = f"{brand}-{series_name}-{series_suffix}-{i}".lower().replace(" ", "-")
        sku = f"LAP-{brand[:3].upper()}-{i:04d}"

        products.append({
            "id": i,
            "name": product_name,
            "slug": slug,
            "sku": sku,
            "brand": brand,
            "description": fake.paragraph(nb_sentences=4),
            "price": price,
            "original_price": original_price,
            "rating": round(random.uniform(4.1, 5.0), 1),
            "reviews_count": random.randint(20, 3000),
            "discount_percent": discount_percent,
            "is_featured": random.random() > 0.8,
            "is_bestseller": random.random() > 0.85,
            "category_id": category["id"],
            "image_url": image_url,
            "specifications": specs,
            "is_active": True
        })
        
    return products
