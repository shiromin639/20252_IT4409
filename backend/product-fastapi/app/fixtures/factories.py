import random

def generate_laptops():
    random.seed(42) # Deterministic generation
    laptops = []
    
    # Base templates for generating realistic variations
    gaming_templates = [
        {"brand": "ASUS", "series": "ROG Strix G15", "gpu": "RTX 4070", "cpu": "Intel Core i9-13900H", "ram": "32GB", "storage": "1TB SSD", "display": "15.6\\\" QHD 165Hz", "weight": "2.3kg"},
        {"brand": "ASUS", "series": "ROG Zephyrus G14", "gpu": "RTX 4060", "cpu": "AMD Ryzen 9 7940HS", "ram": "16GB", "storage": "1TB SSD", "display": "14\\\" QHD 165Hz", "weight": "1.65kg"},
        {"brand": "Lenovo", "series": "Legion Pro 7i", "gpu": "RTX 4080", "cpu": "Intel Core i9-13900HX", "ram": "32GB", "storage": "2TB SSD", "display": "16\\\" WQXGA 240Hz", "weight": "2.8kg"},
        {"brand": "Dell", "series": "Alienware m18", "gpu": "RTX 4090", "cpu": "Intel Core i9-13980HX", "ram": "64GB", "storage": "4TB SSD", "display": "18\\\" QHD+ 165Hz", "weight": "4.04kg"},
        {"brand": "Acer", "series": "Predator Helios 16", "gpu": "RTX 4070", "cpu": "Intel Core i7-13700HX", "ram": "16GB", "storage": "1TB SSD", "display": "16\\\" WQXGA 240Hz", "weight": "2.6kg"},
        {"brand": "MSI", "series": "Raider GE78", "gpu": "RTX 4080", "cpu": "Intel Core i9-13980HX", "ram": "32GB", "storage": "2TB SSD", "display": "17.3\\\" QHD 240Hz", "weight": "3.1kg"}
    ]
    
    office_templates = [
        {"brand": "Lenovo", "series": "ThinkPad T14", "gpu": "Intel Iris Xe", "cpu": "Intel Core i5-1335U", "ram": "16GB", "storage": "512GB SSD", "display": "14\\\" WUXGA", "weight": "1.32kg"},
        {"brand": "Dell", "series": "Latitude 7440", "gpu": "Intel Iris Xe", "cpu": "Intel Core i7-1355U", "ram": "16GB", "storage": "512GB SSD", "display": "14\\\" FHD+", "weight": "1.33kg"},
        {"brand": "HP", "series": "EliteBook 840 G10", "gpu": "Intel Iris Xe", "cpu": "Intel Core i7-1355U", "ram": "16GB", "storage": "1TB SSD", "display": "14\\\" WUXGA", "weight": "1.36kg"},
        {"brand": "Acer", "series": "TravelMate P6", "gpu": "Intel Iris Xe", "cpu": "Intel Core i5-1335U", "ram": "16GB", "storage": "512GB SSD", "display": "14\\\" WUXGA", "weight": "1.05kg"},
        {"brand": "Lenovo", "series": "IdeaPad Slim 5", "gpu": "Intel Iris Xe", "cpu": "Intel Core i5-1335U", "ram": "8GB", "storage": "512GB SSD", "display": "16\\\" WUXGA", "weight": "1.89kg"}
    ]
    
    ultrabook_templates = [
        {"brand": "Dell", "series": "XPS 13 Plus", "gpu": "Intel Iris Xe", "cpu": "Intel Core i7-1360P", "ram": "16GB", "storage": "1TB SSD", "display": "13.4\\\" OLED 3.5K", "weight": "1.26kg"},
        {"brand": "ASUS", "series": "Zenbook S 13 OLED", "gpu": "Intel Iris Xe", "cpu": "Intel Core i7-1355U", "ram": "16GB", "storage": "1TB SSD", "display": "13.3\\\" 2.8K OLED", "weight": "1.0kg"},
        {"brand": "HP", "series": "Spectre x360 14", "gpu": "Intel Iris Xe", "cpu": "Intel Core i7-1355U", "ram": "16GB", "storage": "1TB SSD", "display": "13.5\\\" 3K2K OLED", "weight": "1.36kg"},
        {"brand": "Lenovo", "series": "Yoga 9i", "gpu": "Intel Iris Xe", "cpu": "Intel Core i7-1360P", "ram": "16GB", "storage": "1TB SSD", "display": "14\\\" 4K OLED", "weight": "1.4kg"}
    ]
    
    macbook_templates = [
        {"brand": "Apple", "series": "MacBook Air M2", "gpu": "8-core GPU", "cpu": "Apple M2", "ram": "8GB", "storage": "256GB SSD", "display": "13.6\\\" Liquid Retina", "weight": "1.24kg"},
        {"brand": "Apple", "series": "MacBook Air M3", "gpu": "10-core GPU", "cpu": "Apple M3", "ram": "16GB", "storage": "512GB SSD", "display": "15.3\\\" Liquid Retina", "weight": "1.51kg"},
        {"brand": "Apple", "series": "MacBook Pro 14", "gpu": "14-core GPU", "cpu": "Apple M3 Pro", "ram": "18GB", "storage": "512GB SSD", "display": "14.2\\\" Liquid Retina XDR", "weight": "1.61kg"},
        {"brand": "Apple", "series": "MacBook Pro 16", "gpu": "30-core GPU", "cpu": "Apple M3 Max", "ram": "36GB", "storage": "1TB SSD", "display": "16.2\\\" Liquid Retina XDR", "weight": "2.16kg"}
    ]
    
    categories_map = {
        1: (gaming_templates, [1299.99, 1499.99, 1799.99, 2199.99, 2499.99, 3299.99, 3999.99], "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80"),
        2: (office_templates, [699.99, 799.99, 899.99, 1099.99, 1299.99], "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"),
        3: (ultrabook_templates, [1199.99, 1399.99, 1599.99, 1899.99], "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80"),
        4: (macbook_templates, [999.99, 1299.99, 1499.99, 1999.99, 2499.99, 3499.99], "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80")
    }
    
    product_id = 1
    for category_id, (templates, prices, image) in categories_map.items():
        # Generate 10 laptops per category
        for i in range(10):
            template = random.choice(templates)
            price = random.choice(prices)
            
            # Tweak specs slightly to create distinct models
            ram_variant = random.choice(["8GB", "16GB", "32GB"]) if category_id != 4 else template["ram"]
            storage_variant = random.choice(["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"]) if category_id != 4 else template["storage"]
            
            # Special case for macbooks so we don't mess up their base specs too much
            if category_id != 4:
                template = dict(template) # copy
                template["ram"] = ram_variant
                template["storage"] = storage_variant
            
            # Adjust price based on RAM/Storage
            if "32GB" in template["ram"] or "64GB" in template["ram"]:
                price += 300
            if "1TB" in template["storage"]:
                price += 150
            elif "2TB" in template["storage"] or "4TB" in template["storage"]:
                price += 400
                
            name = f"{template['brand']} {template['series']} ({template['cpu']}, {template['ram']}, {template['storage']})"
            slug = name.lower().replace(" ", "-").replace(",", "").replace("(", "").replace(")", "").replace('"', "")
            # Ensure unique slug
            slug = f"{slug}-{product_id}"
            sku = f"LAP-{template['brand'][:3].upper()}-{product_id:04d}"
            
            laptops.append({
                "id": product_id,
                "name": name,
                "slug": slug,
                "sku": sku,
                "description": f"Experience unparalleled performance with the {template['brand']} {template['series']}. Featuring a powerful {template['cpu']} processor and {template['gpu']} graphics, this laptop is designed to handle demanding tasks with ease.",
                "price": price,
                "original_price": round(price * 1.15, 2) if random.random() > 0.5 else None, # 50% chance of being on sale
                "category_id": category_id,
                "is_active": True,
                "specifications": {
                    "brand": template["brand"],
                    "cpu": template["cpu"],
                    "gpu": template["gpu"],
                    "ram": template["ram"],
                    "storage": template["storage"],
                    "display": template["display"],
                    "weight": template["weight"],
                    "os": "macOS" if template["brand"] == "Apple" else "Windows 11 Home",
                    "image_url": image
                }
            })
            product_id += 1
            
    return laptops

def generate_categories():
    return [
        {"id": 1, "name": "Gaming Laptops", "slug": "gaming-laptops", "description": "High-performance laptops for gaming and creators."},
        {"id": 2, "name": "Office Laptops", "slug": "office-laptops", "description": "Reliable and efficient laptops for business and everyday use."},
        {"id": 3, "name": "Ultrabooks", "slug": "ultrabooks", "description": "Thin, light, and premium laptops for maximum portability."},
        {"id": 4, "name": "MacBooks", "slug": "macbooks", "description": "Apple laptops powered by advanced M-series silicon."}
    ]
