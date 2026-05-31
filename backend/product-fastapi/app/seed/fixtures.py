def get_categories():
    return [
        {"id": 1, "name": "Gaming Laptops", "slug": "gaming-laptops", "description": "High-performance laptops for gaming and creators."},
        {"id": 2, "name": "Office Laptops", "slug": "office-laptops", "description": "Reliable and efficient laptops for business and everyday use."},
        {"id": 3, "name": "Ultrabooks", "slug": "ultrabooks", "description": "Thin, light, and premium laptops for maximum portability."},
        {"id": 4, "name": "Creator Laptops", "slug": "creator-laptops", "description": "Color-accurate displays and dedicated graphics for creative professionals."},
        {"id": 5, "name": "MacBooks", "slug": "macbooks", "description": "Apple laptops powered by advanced M-series silicon."}
    ]

# Brand constraints mapping to avoid nonsensical combinations
BRAND_TEMPLATES = {
    "Gaming Laptops": ["ASUS", "Lenovo", "Dell", "Acer", "MSI"],
    "Office Laptops": ["Lenovo", "Dell", "HP", "Acer"],
    "Ultrabooks": ["Dell", "ASUS", "HP", "Lenovo"],
    "Creator Laptops": ["ASUS", "Dell", "Lenovo", "MSI"],
    "MacBooks": ["Apple"]
}

# General specifications arrays to pull from, organized by Tier
CPUS = {
    "Budget": ["Intel Core i3-1215U", "Intel Core i3-1315U", "AMD Ryzen 3 7320U"],
    "Mid-range": ["Intel Core i5-12450H", "Intel Core i5-1335U", "Intel Core i5-13420H", "AMD Ryzen 5 7520U", "AMD Ryzen 5 7535HS"],
    "High-end": ["Intel Core i7-1355U", "Intel Core i7-13700H", "Intel Core Ultra 7 155H", "AMD Ryzen 7 7735HS", "AMD Ryzen 7 7840HS"],
    "Premium": ["Intel Core i9-13900H", "Intel Core i9-13980HX", "Intel Core Ultra 9 185H", "AMD Ryzen 9 7945HX"],
    "Apple": {
        "High-end": ["Apple M2", "Apple M3"],
        "Premium": ["Apple M3 Pro", "Apple M3 Max"]
    }
}

GPUS = {
    "Budget": ["Intel UHD Graphics", "AMD Radeon Graphics"],
    "Mid-range": ["Intel Iris Xe Graphics", "AMD Radeon 610M", "NVIDIA GeForce RTX 3050 4GB", "NVIDIA GeForce RTX 4050 6GB"],
    "High-end": ["NVIDIA GeForce RTX 4060 8GB", "NVIDIA GeForce RTX 4070 8GB", "Intel Arc Graphics"],
    "Premium": ["NVIDIA GeForce RTX 4080 12GB", "NVIDIA GeForce RTX 4090 16GB", "NVIDIA RTX 3500 Ada Generation"],
    "Apple": {
        "High-end": ["8-core GPU", "10-core GPU"],
        "Premium": ["14-core GPU", "30-core GPU", "40-core GPU"]
    }
}

DISPLAYS = {
    "Budget": ["14\" FHD (1920x1080) TN", "15.6\" FHD (1920x1080) IPS", "14\" WUXGA (1920x1200) IPS"],
    "Mid-range": ["15.6\" FHD 144Hz IPS", "14\" WUXGA 100% sRGB", "16\" WUXGA 165Hz IPS"],
    "High-end": ["14\" 2.8K (2880x1800) OLED 90Hz", "15.6\" QHD (2560x1440) 165Hz", "16\" QHD+ 240Hz IPS"],
    "Premium": ["14\" 3K OLED 120Hz", "16\" 4K UHD+ (3840x2400) OLED", "18\" QHD+ (2560x1600) Mini LED 240Hz"],
    "Apple": {
        "High-end": ["13.6\" Liquid Retina (2560x1664)", "15.3\" Liquid Retina (2880x1864)"],
        "Premium": ["14.2\" Liquid Retina XDR (3024x1964) 120Hz", "16.2\" Liquid Retina XDR (3456x2234) 120Hz"]
    }
}

IMAGE_URLS = {
    "Gaming Laptops": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
    "Office Laptops": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    "Ultrabooks": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
    "Creator Laptops": "https://images.unsplash.com/photo-1618424181497-157f25b6ce5e?w=800&q=80",
    "MacBooks": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"
}
