const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/products');
const checkLogin = require('../middleware/checkLogin');
// Route hiển thị giỏ hàng

router.get('/view-cart/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        // const cart = await Cart.find({ userId }).exec();
        // const cart = await Cart.find({ userId }).populate('productId').exec();
        const cart = await Cart.find({ userId }).populate({
            path: 'productId',
            populate: { path: 'category', model: 'Category' }
        }).exec();
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        let subtotal = 0;

        // Tính tổng giá trị (subtotal) cho tất cả sản phẩm trong giỏ hàng
        cart.forEach(item => {
            const product = item.productId;
            subtotal += product.price * item.quantity;
        });
        res.render("view-cart", {
            title: "view-cart",
            cart: cart,
            subtotal: subtotal,
        });
        // res.render('view-cart', { title:"View cart",cart });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// router.get('/update-cart/:userId/:productId', async (req, res) => {
//     const userId = req.params.userId;
//     const productId = req.params.productId;
//     const { quantity } = req.body;

//     try {
//         // Tìm sản phẩm trong giỏ hàng của người dùng
//         const cartItem = await Cart.findOne({ userId, productId }).populate('productId').exec();

//         if (!cartItem) {
//             return res.status(404).json({ message: 'Cart item not found' });
//         }

//         // Cập nhật số lượng mới
//         cartItem.quantity = quantity;

//         // Lưu thay đổi vào cơ sở dữ liệu
//         await cartItem.save();

//         // Chuyển hướng hoặc trả về thông báo cập nhật thành công
//         res.redirect('/cart/view-cart/' + userId);
//     } catch (error) {
//         console.error('Error updating cart item:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });
router.post('/update-cart/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const cartUpdates = req.body.cart;

        for (const update of cartUpdates) {
            const { productId, quantity } = update;
            const userCart = await Cart.findOne({ userId, productId });

            if (userCart) {
                userCart.quantity = quantity;
                await userCart.save();
            }
        }

        return res.redirect('/cart/view-cart/' + userId);
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route để thêm sản phẩm vào giỏ hàng
router.get('/add-to-cart/:productId',checkLogin, async (req, res) => {
    const productId = req.params.productId;
    const user = req.session.user;
    const userId = user._id;
  
    try {
      // Kiểm tra xem sản phẩm có tồn tại không
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      }
      // Kiểm tra xem giỏ hàng của user đã có sản phẩm này chưa
      let cartItem = await Cart.findOne({ userId, productId });
  
      if (cartItem) {
        // Nếu đã có, tăng số lượng
        cartItem.quantity += 1;
        
      } else {
        req.session.countCart++;
        // Nếu chưa có, tạo một bản ghi mới
        cartItem = new Cart({
          userId,
          productId,
          quantity: 1,
        });
      }
  
      // Lưu hoặc cập nhật thông tin giỏ hàng
      await cartItem.save();
      req.session.message = {
        type: 'success',
        message: 'Thêm vào giỏ hàng thành công!'
    };
        return res.redirect('/cart/view-cart/' + userId);
    //   return res.status(200).json({ message: 'Sản phẩm đã được thêm vào giỏ hàng' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Đã có lỗi xảy ra' });
    }
  });
  router.get('/deleteOne/:id',async(req,res)=>{
    try{
        const user = req.session.user;
        const userId = user._id;
        let id = req.params.id;
        await Cart.findOneAndDelete({ productId: id, userId: userId });
        //??
        req.session.countCart--;
        req.session.message = {
            type: 'success',
            message: 'Product deleted from cart successfully!',
        };
        return res.redirect('/cart/view-cart/' + userId);

    }catch(err){
        res.json({ message: err.message});
    }
});
router.get('/deleteAll',async(req,res)=>{
    try{
        const user = req.session.user;
        const userId = user._id;
        let id = req.params.id;
        await Cart.deleteMany({ userId });  
        req.session.countCart = 0;
        req.session.message = {
            type: 'success',
            message: 'All product deleted from cart successfully!',
        };
        return res.redirect('/cart/view-cart/' + userId);

    }catch(err){
        res.json({ message: err.message});
    }
});
router.get('/thankyou', async (req, res) => {
    try {
        // const cart = await Cart.find({ userId }).exec();
        // const cart = await Cart.find({ userId }).populate('productId').exec();
        const user = req.session.user;
        const userId = user._id;
        let id = req.params.id;
        await Cart.deleteMany({ userId });  
        req.session.countCart = 0;
        res.render("view-thanks", {
            title: "view-thanks",
        });
        // res.render('view-cart', { title:"View cart",cart });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;