import psycopg
with psycopg.connect('postgresql://postgres:postgres@localhost:5433/order') as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT to_char(created_at, 'YYYY-MM') as month, sum(total_amount) FROM orders WHERE payment_status = 'PAID' GROUP BY month ORDER BY month")
        rows = cur.fetchall()
        for r in rows:
            print(f"{r[0]}: {r[1]:,.0f} VND")
