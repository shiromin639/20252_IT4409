import os
import random
from datetime import datetime, timedelta
import psycopg
from faker import Faker

print("🚀 Starting Analytics Seeding...")

fake = Faker()
Faker.seed(42)
random.seed(42)

# Database credentials
DB_HOST = os.environ.get("POSTGRES_SERVER", "localhost")
DB_PORT = int(os.environ.get("POSTGRES_PORT", "5433" if DB_HOST == "localhost" else "5432"))
DB_USER = os.environ.get("POSTGRES_USER", "postgres")
DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "postgres")

def get_conn(db_name):
    return psycopg.connect(
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{db_name}"
    )

def main():
    # ---------------------------------------------------------
    # 1. Fetch real products to map to orders
    # ---------------------------------------------------------
    print("📦 Fetching active products from 'product' database...")
    products = []
    with get_conn("product") as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, price, brand FROM products WHERE is_active = true")
            rows = cur.fetchall()
            for r in rows:
                products.append({
                    "id": r[0],
                    "name": r[1],
                    "price": float(r[2]),
                    "brand": str(r[3]).lower()
                })
    print(f"   -> Found {len(products)} active products.")
    if not products:
        print("❌ No products found! Cannot seed orders. Please seed products first.")
        return

    # Categorize products for realistic purchasing behavior
    gaming_laptops = [p for p in products if "gaming" in p["name"].lower() or "nitro" in p["name"].lower() or "legion" in p["name"].lower() or "rog" in p["name"].lower()]
    macbooks = [p for p in products if "macbook" in p["name"].lower()]
    office_laptops = [p for p in products if p not in gaming_laptops and p not in macbooks]
    
    if not gaming_laptops: gaming_laptops = products
    if not macbooks: macbooks = products
    if not office_laptops: office_laptops = products

    # ---------------------------------------------------------
    # 2. Cleanup & Create Users
    # ---------------------------------------------------------
    print("👥 Generating users in 'user' database...")
    seeded_user_ids = []
    
    with get_conn("user") as conn:
        with conn.cursor() as cur:
            # Idempotency check: Delete old seeded users and get their IDs for cascading manual deletion if needed
            cur.execute("SELECT id FROM \"user\" WHERE username LIKE 'seed_analytics_%'")
            old_seeded_user_ids = [r[0] for r in cur.fetchall()]
            if old_seeded_user_ids:
                print(f"   -> Found {len(old_seeded_user_ids)} old seeded users. We will delete their orders, then delete the users.")
                # We defer deleting users until we delete their orders!
        
        # Now connect to Order DB and delete orders for old seeded users
        if old_seeded_user_ids:
            with get_conn("order") as order_conn:
                with order_conn.cursor() as order_cur:
                    # Execute ANY to match old seeded users
                    order_cur.execute("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ANY(%s))", (old_seeded_user_ids,))
                    order_cur.execute("DELETE FROM orders WHERE user_id = ANY(%s)", (old_seeded_user_ids,))
                order_conn.commit()
            print("   -> Cleared old seeded orders successfully.")
            
            # Now safe to delete old seeded users
            with conn.cursor() as cur:
                cur.execute("DELETE FROM \"user\" WHERE id = ANY(%s)", (old_seeded_user_ids,))
            conn.commit()
            print("   -> Cleared old seeded users successfully.")

        # Generate 400 new users
        with conn.cursor() as cur:
            user_data = []
            now = datetime.utcnow()
            for i in range(400):
                username = f"seed_analytics_{i}_{fake.user_name()}"
                fullname = fake.name()
                # Dummy password hash
                hashed_password = "dummy_hash_for_seed"
                user_data.append((username, True, False, fullname, hashed_password, now))
                
            for idx, data in enumerate(user_data):
                cur.execute(
                    "INSERT INTO \"user\" (username, is_active, is_superuser, fullname, hashed_password, created_at) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                    data
                )
                seeded_user_ids.append(cur.fetchone()[0])
        conn.commit()
    print(f"   -> Generated {len(seeded_user_ids)} new users.")

    # ---------------------------------------------------------
    # 3. Generate Orders and Order Items
    # ---------------------------------------------------------
    print("🛒 Generating realistic orders in 'order' database...")
    total_orders = 800
    statuses = ["delivered", "shipped", "confirmed", "pending", "cancelled"]
    status_weights = [0.75, 0.10, 0.05, 0.05, 0.05]
    
    order_records = []
    order_item_records = []
    
    # Store product sales manually to update product DB later
    product_sales_qty = {p["id"]: 0 for p in products}

    # Generate dates across 180 days
    today = datetime.utcnow()
    start_date = today - timedelta(days=180)
    
    for order_idx in range(total_orders):
        user_id = random.choice(seeded_user_ids)
        status = random.choices(statuses, weights=status_weights, k=1)[0]
        
        # Payment details
        payment_method = random.choices(["COD", "VNPAY"], weights=[0.7, 0.3])[0]
        
        # If cancelled or pending, payment status varies
        if status == "cancelled":
            payment_status = random.choices(["PENDING", "FAILED"], weights=[0.5, 0.5])[0]
        elif status == "pending":
            payment_status = "PENDING"
        elif status in ["shipped", "delivered"]:
            payment_status = "PAID"
        else:
            payment_status = random.choice(["PENDING", "PAID"])

        # Create a realistic date
        # Random day, but apply spikes
        is_spike = False
        random_days_ago = random.randint(0, 180)
        order_date = today - timedelta(days=random_days_ago)
        
        # Weekend probability increase (Saturday=5, Sunday=6)
        if order_date.weekday() in [5, 6] and random.random() < 0.6:
            # 60% chance to force it to be a gaming laptop if it's a weekend
            selected_products = random.choices(gaming_laptops, k=1)
        elif 30 <= random_days_ago <= 40: # Black Friday-ish spike
            selected_products = random.choices(products, k=random.randint(1, 3))
        else:
            selected_products = random.choices(office_laptops + macbooks + products, k=1)
            
        # Decide quantities (mostly 1, sometimes 2-3)
        total_amount = 0.0
        items_for_this_order = []
        for p in selected_products:
            # MacBooks rarely bought in bulk
            if p in macbooks:
                qty = 1
            else:
                qty = random.choices([1, 2, 3], weights=[0.8, 0.15, 0.05], k=1)[0]
                
            unit_price = p["price"]
            total_amount += qty * unit_price
            items_for_this_order.append({
                "product_id": p["id"],
                "quantity": qty,
                "unit_price": unit_price
            })
            
            # Increment sold count if the order is PAID
            if payment_status == "PAID":
                product_sales_qty[p["id"]] += qty

        paid_at = order_date if payment_status == "PAID" else None
        
        # We assign an arbitrary ID to map order_items locally before insert
        order_records.append((
            user_id, status, total_amount, "Fake Address, VN", payment_method, payment_status,
            f"VNPAY_SEED_{order_idx}" if payment_method == "VNPAY" else None,
            paid_at, order_date, order_date, items_for_this_order
        ))
        
    # Sort orders chronologically to simulate natural DB insertion
    order_records.sort(key=lambda x: x[8]) # order_date

    with get_conn("order") as conn:
        with conn.cursor() as cur:
            for rec in order_records:
                cur.execute("""
                    INSERT INTO orders (user_id, status, total_amount, shipping_address, payment_method, payment_status, payment_transaction_id, paid_at, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
                """, rec[:-1])
                new_order_id = cur.fetchone()[0]
                
                # Insert items
                items_to_insert = []
                for item in rec[-1]:
                    items_to_insert.append((new_order_id, item["product_id"], item["quantity"], item["unit_price"]))
                    
                cur.executemany("""
                    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                    VALUES (%s, %s, %s, %s)
                """, items_to_insert)
        conn.commit()
    print(f"   -> Generated {len(order_records)} orders successfully.")

    # ---------------------------------------------------------
    # 4. Update Products total_sold
    # ---------------------------------------------------------
    print("🔄 Updating product total_sold counts in 'product' database...")
    with get_conn("product") as conn:
        with conn.cursor() as cur:
            # We add to existing total_sold, or if we want exact numbers, we might just set it.
            # But the user said: "Do NOT clear or delete existing... Preserve all real test data... Update total_sold from actual generated order data".
            # So we add the newly generated sales to the existing total_sold.
            for pid, qty in product_sales_qty.items():
                if qty > 0:
                    cur.execute("UPDATE products SET total_sold = COALESCE(total_sold, 0) + %s WHERE id = %s", (qty, pid))
        conn.commit()
    print("   -> Updated product sales successfully.")
    
    print("\n✅ Analytics Seeding Completed Successfully!")
    print(f"📊 Summary:")
    print(f"  - Total Users Generated: {len(seeded_user_ids)}")
    print(f"  - Total Orders Generated: {len(order_records)}")
    
if __name__ == "__main__":
    main()
