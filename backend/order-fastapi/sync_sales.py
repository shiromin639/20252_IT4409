from app.core.db import engine
from sqlmodel import Session, select
from app.models.order_item import OrderItem
import urllib.request, json

with Session(engine) as session:
    items = session.exec(select(OrderItem)).all()
    print(f'Syncing {len(items)} order items to product service...')
    for item in items:
        url = f'http://product-service:8000/products/{item.product_id}/increment-sales'
        payload = json.dumps({'quantity': item.quantity}).encode('utf-8')
        try:
            req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req)
        except Exception as e:
            print(f'Failed {item.product_id}: {e}')
    print('Done!')
