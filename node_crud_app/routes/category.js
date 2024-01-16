const express = require("express");
const router = express.Router();
// const User = require('../models/users');
// var modelProduct = require('../Service/product');
// var modelCategory = require('../Service/category');
const Category = require('../models/categories');
const checkUserRole = require('../middleware/checkRole');
//Danh Sach Cate
router.get('/listCate', async function (req, res, next) {
    // console.log(req.query);
    // var categoriesAll = await modelCategory.getAll(req.query);
    // responseData.responseReturn(res, 200, true, categoriesAll);
    // try {
    //     const cates = await Category.find({isDeleted:false}).exec();
    //     res.render("Cate_list", {
    //         title: "Category's List",
    //         cates: cates,
    //     });
    // } catch (err) {
    //     res.json({ message: err.message });
    // }
    try {
        const page = req.query.page || 1; // Trang hiện tại, mặc định là 1
        const limit = 2; // Số sản phẩm hiển thị trên mỗi trang
        const options = {
            page: page,
            limit: limit,
            // populate: 'category',
        };
        const cates = await Category.paginate({isDeleted:false},options);
        res.render("Cate_list", {
            title: "Category's List",
            cates: cates.docs,
            currentPage: cates.page,
            totalPages: cates.totalPages,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
  });
//Create USER
router.get("/createCate",checkUserRole('Admin'),(req,res)=>{
    res.render("Cate_create",{
        title:"Create Cate",
    });
});
router.post("/createCate",async(req,res)=>{
    if (!req.body.name) {      
        req.session.message = {
            type: 'danger',
            message: 'Vui lòng điền Name!'
        };
        return res.redirect("/category/createCate");
    }   
    else
    {
        req.session.name = req.body.name;     
    }
    const cate = new Category({
        name:req.body.name,
        order:req.body.order,
    });
    try{
       await cate.save();
       req.session.message = {
        type: 'success',
        message:'Cate created successfully!'
    };
    res.redirect("/category/listCate");
    }catch(err){
        res.json({message:err.message,type:'danger'});
    }  
});
//Edit cate
router.get("/edit/:id",checkUserRole('Admin'),async(req,res)=>{
    try{
        let id = req.params.id;
        const cate = await Category.findById(id).exec();
        console.log(cate);
        if(cate == null){
            res.redirect("/");
        }else{
        res.render("Cate_edit",{
            title:"Edit cate",
            cate:cate,
        })
    }
    }catch(err){
        res.redirect("/");
    }
});
router.post("/updateCategory/:id", async (req, res) => {
    try {
        let id = req.params.id;

        const result = await Category.findByIdAndUpdate(id, {
            name: req.body.name,
            order: req.body.order,
        });
        if (!result) {
            res.json({ message: 'Category not found', type: 'danger' });
            return;
        }
        req.session.message = {
            type: 'success',
            message: 'Category updated successfully!',
        };
        res.redirect('/category/listCate');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});
//Delete cate
router.get('/deleteCategory/:id',checkUserRole('Admin'),async(req,res)=>{
    try{
        let id = req.params.id;
        const result = await Category.findById(id);   
        result.isDeleted = true;
        await result.save();
        req.session.message = {
            type: 'info',
            message: 'Category deleted successfully!',
        };
        res.redirect('/category/listCate');

    }catch(err){
        res.json({ message: err.message});
    }
});

  
  module.exports = router;