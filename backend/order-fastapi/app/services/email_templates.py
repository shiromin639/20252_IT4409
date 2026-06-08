from datetime import datetime
from typing import Dict, Any, List

def format_currency(amount: float) -> str:
    return f"{amount:,.0f} VND".replace(",", ".")
from app.core.config import settings
def format_date(date_str: str) -> str:
    try:
        # Assuming ISO format like "2023-10-27T10:00:00"
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return dt.strftime("%d/%m/%Y %H:%M")
    except Exception:
        return date_str

def _get_base_html(title: str, content_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; line-height: 1.6;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px; margin: 0 auto;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #e60012; padding: 30px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">TechLap</h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">{title}</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            {content_html}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0 0 10px 0; color: #333333; font-weight: 600; font-size: 16px;">Cảm ơn quý khách đã mua sắm tại TechLap!</p>
                            <p style="margin: 0 0 5px 0; color: #666666; font-size: 14px;">Email hỗ trợ: support@techlap.vn | Hotline: 1900 1234</p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">&copy; {datetime.now().year} TechLap. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

def get_order_confirmation_template(payload: Dict[str, Any]) -> str:
    items_html = ""
    for item in payload.get('items', []):
        img_url = item.get('image_url', 'https://via.placeholder.com/60')
        items_html += f"""
        <tr>
            <td style="padding: 15px; border-bottom: 1px solid #eeeeee; width: 60px;">
                <img src="{img_url}" alt="{item.get('product_name')}" width="60" style="border-radius: 4px; display: block;">
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #eeeeee;">
                <p style="margin: 0; font-weight: 600; color: #333333;">{item.get('product_name')}</p>
                <p style="margin: 5px 0 0 0; color: #666666; font-size: 14px;">Số lượng: {item.get('quantity')}</p>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #eeeeee; text-align: right; color: #333333; font-weight: 600;">
                {format_currency(item.get('price', 0))}
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #eeeeee; text-align: right; color: #e60012; font-weight: 600;">
                {format_currency(item.get('price', 0) * item.get('quantity', 1))}
            </td>
        </tr>
        """
        
    shipping_fee = payload.get('shipping_fee', 0)
    discount = payload.get('discount', 0)
    total_amount = payload.get('total_amount', 0)
    subtotal = total_amount - shipping_fee + discount

    content = f"""
    <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">Xin chào <strong>{payload.get('customer_name')}</strong>,</p>
    <p style="margin: 0 0 30px 0; color: #555555; font-size: 15px;">Đơn hàng <strong>#{payload.get('order_id')}</strong> của bạn đã được xác nhận và đang được xử lý.</p>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
        <tr>
            <td width="50%" valign="top" style="padding-right: 15px;">
                <h3 style="color: #333333; font-size: 14px; text-transform: uppercase; margin: 0 0 10px 0; border-bottom: 2px solid #e60012; padding-bottom: 5px; display: inline-block;">Thông tin đơn hàng</h3>
                <p style="margin: 0 0 5px 0; color: #555555; font-size: 14px;"><strong>Mã đơn:</strong> #{payload.get('order_id')}</p>
                <p style="margin: 0 0 5px 0; color: #555555; font-size: 14px;"><strong>Ngày đặt:</strong> {format_date(payload.get('order_date', ''))}</p>
            </td>
            <td width="50%" valign="top" style="padding-left: 15px;">
                <h3 style="color: #333333; font-size: 14px; text-transform: uppercase; margin: 0 0 10px 0; border-bottom: 2px solid #e60012; padding-bottom: 5px; display: inline-block;">Thanh toán</h3>
                <p style="margin: 0 0 5px 0; color: #555555; font-size: 14px;"><strong>Phương thức:</strong> {payload.get('payment_method')}</p>
                <p style="margin: 0 0 5px 0; color: #555555; font-size: 14px;"><strong>Trạng thái:</strong> {payload.get('payment_status', 'Chưa thanh toán')}</p>
                {f'<p style="margin: 0 0 5px 0; color: #555555; font-size: 14px;"><strong>Mã GD:</strong> {payload.get("transaction_id")}</p>' if payload.get('transaction_id') else ''}
            </td>
        </tr>
    </table>
    
    <h3 style="color: #333333; font-size: 14px; text-transform: uppercase; margin: 0 0 10px 0; border-bottom: 2px solid #e60012; padding-bottom: 5px; display: inline-block;">Giao hàng đến</h3>
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 30px; border: 1px solid #eeeeee;">
        <p style="margin: 0 0 5px 0; color: #333333; font-weight: 600; font-size: 15px;">{payload.get('recipient_name', payload.get('customer_name'))}</p>
        <p style="margin: 0 0 5px 0; color: #555555; font-size: 14px;"><strong>SĐT:</strong> {payload.get('phone_number', 'Không có')}</p>
        <p style="margin: 0; color: #555555; font-size: 14px;"><strong>Địa chỉ:</strong> {payload.get('shipping_address')}</p>
    </div>

    <h3 style="color: #333333; font-size: 14px; text-transform: uppercase; margin: 0 0 10px 0; border-bottom: 2px solid #e60012; padding-bottom: 5px; display: inline-block;">Chi tiết sản phẩm</h3>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; border-collapse: collapse;">
        <thead>
            <tr>
                <th colspan="2" style="padding: 12px 15px; background-color: #f4f5f7; color: #333333; text-align: left; font-size: 14px; border-radius: 4px 0 0 4px;">Sản phẩm</th>
                <th style="padding: 12px 15px; background-color: #f4f5f7; color: #333333; text-align: right; font-size: 14px;">Đơn giá</th>
                <th style="padding: 12px 15px; background-color: #f4f5f7; color: #333333; text-align: right; font-size: 14px; border-radius: 0 4px 4px 0;">Thành tiền</th>
            </tr>
        </thead>
        <tbody>
            {items_html}
        </tbody>
    </table>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 40px;">
        <tr>
            <td width="50%"></td>
            <td width="50%">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td style="padding: 8px 0; color: #555555; font-size: 14px;">Tạm tính:</td>
                        <td style="padding: 8px 0; text-align: right; color: #333333; font-weight: 600;">{format_currency(subtotal)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #555555; font-size: 14px;">Phí vận chuyển:</td>
                        <td style="padding: 8px 0; text-align: right; color: #333333; font-weight: 600;">{format_currency(shipping_fee)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #555555; font-size: 14px; border-bottom: 1px solid #eeeeee;">Giảm giá:</td>
                        <td style="padding: 8px 0; text-align: right; color: #333333; font-weight: 600; border-bottom: 1px solid #eeeeee;">- {format_currency(discount)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 15px 0 0 0; color: #333333; font-size: 16px; font-weight: 700;">Tổng cộng:</td>
                        <td style="padding: 15px 0 0 0; text-align: right; color: #e60012; font-size: 20px; font-weight: 700;">{format_currency(total_amount)}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    
    <div style="text-align: center;">
        <a href="{settings.FRONTEND_URL}/profile/orders/{payload.get('order_id')}" style="display: inline-block; background-color: #e60012; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.3s;">Xem đơn hàng</a>
    </div>
    """
    return _get_base_html("Xác nhận đơn hàng", content)

def get_payment_success_template(payload: Dict[str, Any]) -> str:
    content = f"""
    <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; width: 64px; height: 64px; background-color: #e8f5e9; border-radius: 50%; line-height: 64px; text-align: center; margin-bottom: 15px;">
            <span style="color: #4caf50; font-size: 32px; font-weight: bold;">&#10003;</span>
        </div>
        <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 24px;">Thanh toán thành công!</h2>
        <p style="color: #555555; margin: 0; font-size: 15px;">Đơn hàng <strong>#{payload.get('order_id')}</strong> của bạn đã được thanh toán.</p>
    </div>
    
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin-bottom: 30px; border: 1px solid #eeeeee; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #555555; font-size: 14px;">Số tiền đã thanh toán</p>
        <p style="margin: 0; color: #e60012; font-size: 28px; font-weight: 700;">{format_currency(payload.get('amount', 0))}</p>
    </div>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
        <tr>
            <td style="padding: 8px 0; color: #555555; font-size: 14px;">Mã đơn hàng:</td>
            <td style="padding: 8px 0; text-align: right; color: #333333; font-weight: 600;">#{payload.get('order_id')}</td>
        </tr>
        <tr>
            <td style="padding: 8px 0; color: #555555; font-size: 14px;">Phương thức thanh toán:</td>
            <td style="padding: 8px 0; text-align: right; color: #333333; font-weight: 600;">VNPay</td>
        </tr>
        {f'<tr><td style="padding: 8px 0; color: #555555; font-size: 14px;">Mã giao dịch:</td><td style="padding: 8px 0; text-align: right; color: #333333; font-weight: 600;">{payload.get("transaction_id")}</td></tr>' if payload.get('transaction_id') else ''}
    </table>
    
    <div style="text-align: center;">
        <a href="{settings.FRONTEND_URL}/profile/orders/{payload.get('order_id')}" style="display: inline-block; background-color: #e60012; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">Xem đơn hàng</a>
    </div>
    """
    return _get_base_html("Thanh toán thành công", content)

def get_shipping_status_template(payload: Dict[str, Any]) -> str:
    status_mapping = {
        "shipped": "đang được giao đến bạn",
        "delivered": "đã được giao thành công",
        "cancelled": "đã bị hủy"
    }
    
    status_title_mapping = {
        "shipped": "Đơn hàng đang giao",
        "delivered": "Đơn hàng đã giao",
        "cancelled": "Đơn hàng đã hủy"
    }
    
    status = payload.get('status', '').lower()
    status_text = status_mapping.get(status, f"được cập nhật trạng thái: {status}")
    title = status_title_mapping.get(status, "Cập nhật đơn hàng")
    
    icon_color = "#e60012"
    if status == "delivered":
        icon_color = "#4caf50"
    
    content = f"""
    <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; width: 64px; height: 64px; background-color: {icon_color}15; border-radius: 50%; line-height: 64px; text-align: center; margin-bottom: 15px;">
            <span style="color: {icon_color}; font-size: 32px; font-weight: bold;">&#128168;</span>
        </div>
        <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 24px;">{title}</h2>
        <p style="color: #555555; margin: 0; font-size: 15px;">Xin chào <strong>{payload.get('customer_name')}</strong>,</p>
        <p style="color: #555555; margin: 10px 0 0 0; font-size: 15px;">Đơn hàng <strong>#{payload.get('order_id')}</strong> của bạn {status_text}.</p>
    </div>
    
    <div style="text-align: center;">
        <a href="{settings.FRONTEND_URL}/profile/orders/{payload.get('order_id')}" style="display: inline-block; background-color: #e60012; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">Theo dõi đơn hàng</a>
    </div>
    """
    return _get_base_html(title, content)
