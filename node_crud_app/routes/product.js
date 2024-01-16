const express = require("express");
const router = express.Router();
// const User = require('../models/users');
// var modelProduct = require('../Service/product');
// var modelCategory = require('../Service/category');
const Category = require('../models/categories');
const Product = require('../models/products');
const multer = require('multer');
const fs = require("fs");
const checkUserRole = require('../middleware/checkRole');

var storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./uploads");
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
});
var upload = multer({
    storage: storage,
}).single("image");

//Danh Sach Cate
router.get('/listProduct', async function (req, res, next) {
    
    try {
        const page = req.query.page || 1; // Trang hiện tại, mặc định là 1
        const limit = 4; // Số sản phẩm hiển thị trên mỗi trang
        const options = {
            page: page,
            limit: limit,
            populate: 'category',
        };
        const products = await Product.paginate({ isDeleted: false }, options);
        // const products = await Product.find({isDeleted:false}).populate('category').exec();
        res.render("Product_list", {
            title: "Product's List",
            products: products.docs,
            currentPage: products.page,
            totalPages: products.totalPages,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
  });
  router.get('/detailProduct/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const product = await Product.findById(id).populate('category').exec();       
        res.render("Product_detail",{
            title:"Product_Detail",
            product:product,
    })
    } catch (err) {
      res.status(500).json({ message: err.message });
    }   
  });
//Create 
router.get('/createProduct',checkUserRole('Admin'), async (req, res) => {
    try {
      const categories = await Category.find();        
      res.render("Product_create",{
        title:"Create Product",
        categories:categories,
        name: req.session.name || '',
        price: req.session.price || '',
        quantity: req.session.quantity || '',
    })
    } catch (err) {
      res.status(500).json({ message: err.message });
    }   
  });
router.post("/createProduct",upload,async(req,res)=>{ 
    if (!req.body.name) {      
        req.session.message = {
            type: 'danger',
            message: 'Vui lòng điền Name!'
        };
        return res.redirect("/product/createProduct");
    }
    else
    {
        req.session.name = req.body.name;     
    }
    if (!req.body.price || parseFloat(req.body.price) <= 0) {      
        req.session.message = {
            type: 'danger',
            message: 'Giá tiền không hợp lệ!'
        };
        return res.redirect("/product/createProduct");
    }
    else
    {
        req.session.price = req.body.price;     
    }   
    if (!req.body.quantity || parseFloat(req.body.quantity) < 0) {      
        req.session.message = {
            type: 'danger',
            message: 'Số lượng không hợp lệ!'
        };
        return res.redirect("/product/createProduct");
    }
    else
    {
        req.session.quantity = req.body.quantity;     
    }  
    const product = new Product({
        name:req.body.name,
        price:req.body.price,
        quantity:req.body.quantity,
        category:req.body.category,
        image:req.file.filename,
    });
    try{
       await product.save();
       req.session.message = {
        type: 'success',
        message:'Product created successfully!'
    };
    res.redirect("/product/listProduct");
    }catch(err){
        res.json({message:err.message,type:'danger'});
    }  
});
//Edit cate
router.get("/editProduct/:id",checkUserRole('Admin'),async(req,res)=>{
    try{
        let id = req.params.id;
        const product = await Product.findById(id).populate('category').exec();
        const categories = await Category.find();
        console.log(product);
        if(product == null){
            res.redirect("/product/listProduct");
        }else{
        res.render("Product_edit",{
            title:"Edit Product",
            product:product,
            categories:categories,
        })
    }
    }catch(err){
        res.redirect("/");
    }
});
router.post("/updateProduct/:id", upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync("./uploads/" + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }
        const result = await Product.findByIdAndUpdate(id, {
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            category:req.body.category,
            image: new_image,
        });
        if (!result) {
            res.json({ message: 'Product not found', type: 'danger' });
            return;
        }
        req.session.message = {
            type: 'success',
            message: 'Product updated successfully!',
        };
        res.redirect('/product/listProduct');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});
//Delete cate
router.get('/deleteProduct/:id',checkUserRole('Admin'),async(req,res)=>{
    try{
        let id = req.params.id;
        const result = await Product.findById(id);   
        result.isDeleted = true;
        await result.save();
        req.session.message = {
            type: 'info',
            message: 'Product deleted successfully!',
        };
        res.redirect('/product/listProduct');

    }catch(err){
        res.json({ message: err.message});
    }
});
  module.exports = router;