const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart'); // Import cái khuôn mẫu Giỏ hàng đã tạo ở Bước 2

const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL

// 1. API: THÊM HOẶC CẬP NHẬT SẢN PHẨM VÀO GIỎ HÀNG
// Phương thức: POST
router.post('/', async (req, res) => {
  try {
    // Lấy thông tin từ client gửi lên 
    const { userId, productId, quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Số lượng sản phẩm phải lớn hơn 0" });
    }

    // Tìm xem user này đã có giỏ hàng trong Database chưa
    let cart = await Cart.findOne({ userId: userId });
    let currentQuantityInCart = 0;

    if (cart) {
      // Nếu đã có giỏ hàng, tìm xem sản phẩm này đang có sẵn bao nhiêu cái trong giỏ
      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      if (itemIndex > -1) {
        currentQuantityInCart = cart.items[itemIndex].quantity;
      }
    }

    // Tính tổng số lượng khách muốn mua (số đang có trong giỏ + số vừa thêm)
    const totalRequestedQuantity = currentQuantityInCart + quantity;

    try {
      const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL;
      // Gọi API sang Inventory Service để lấy số tồn kho
      const inventoryResponse = await axios.get(`${INVENTORY_SERVICE_URL}/${productId}`);
      const stockAvailable = inventoryResponse.data.stock;

      // Chặn lại nếu tổng số lượng muốn mua vượt quá số hàng trong kho
      if (totalRequestedQuantity > stockAvailable) {
        return res.status(400).json({ 
          message: "Không đủ hàng trong kho", 
          stockAvailable: stockAvailable,
          requestedQuantity: totalRequestedQuantity
        });
      }
    } catch (inventoryError) {
      if (inventoryError.response && inventoryError.response.status === 404) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại trong kho" });
      }
      return res.status(500).json({ message: "Lỗi khi kết nối với hệ thống quản lý kho" });
    }


    if (cart) {
      // Nếu có giỏ hàng rồi, kiểm tra xem sản phẩm này đã có trong giỏ chưa
      let itemIndex = cart.items.findIndex(item => item.productId === productId);

      if (itemIndex > -1) {
        // Sản phẩm đã tồn tại -> Cộng thêm số lượng mới vào số lượng cũ
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Sản phẩm chưa có -> Thêm sản phẩm mới vào mảng items
        cart.items.push({ productId, quantity });
      }
      // Lưu lại thay đổi vào DB
      cart = await cart.save();
      return res.status(200).json(cart);
    } else {
      // Nếu user chưa có giỏ hàng -> Tạo giỏ hàng mới tinh
      const newCart = await Cart.create({
        userId,
        items: [{ productId, quantity }]
      });
      return res.status(201).json(newCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi thêm vào giỏ hàng" });
  }
});

// 2. API: LẤY THÔNG TIN GIỎ HÀNG CỦA USER
// Phương thức: GET
// Giả sử URL của Product Service bạn tìm được là:
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;

router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng trống" });
    }

    // --- ĐOẠN LOGIC MỚI: LẤY CHI TIẾT SẢN PHẨM ---
    // Duyệt qua từng item trong giỏ hàng để lấy thông tin từ Product Service
    const enrichedItems = await Promise.all(cart.items.map(async (item) => {
      try {
        // Gọi API sang Product Service
        const response = await axios.get(`${PRODUCT_SERVICE_URL}/${item.productId}`);
        const productDetail = response.data;

        return {
          productId: item.productId,
          quantity: item.quantity,
          name: productDetail.name,   // Ví dụ: MSI Bravo 15
          price: productDetail.price, // Ví dụ: 18000000
          // image: productDetail.image  // Nếu có
        };
      } catch (err) {
        // Nếu không gọi được Product Service, trả về thông tin cơ bản
        return { ...item._doc, message: "Không thể lấy thông tin chi tiết" };
      }
    }));

    // Trả về kết quả đã được "làm giàu" thông tin
    res.status(200).json({
      userId: cart.userId,
      items: enrichedItems,
      totalItems: enrichedItems.length
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
});

// 3. API: XÓA 1 SẢN PHẨM KHỎI GIỎ HÀNG
// Phương thức: DELETE
router.delete('/:userId/item/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    // Lọc bỏ sản phẩm cần xóa ra khỏi mảng items
    cart.items = cart.items.filter(item => item.productId !== productId);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi xóa sản phẩm" });
  }
});

// Xuất router ra để index.js có thể dùng được
module.exports = router;
