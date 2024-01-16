const express = require("express");
const router = express.Router();
// const User = require('../models/users');
const Role = require('../models/roles');
const checkUserRole = require('../middleware/checkRole');

//Danh Sach Role
router.get('/listRole', async function (req, res, next) {
    // try {
    //     const roles = await Role.find({isDeleted:false}).exec();
    //     res.render("Role_list", {
    //         title: "Role's List",
    //         roles: roles,
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
        };
        const roles = await Role.paginate({ isDeleted: false }, options);
        // const products = await Product.find({isDeleted:false}).populate('category').exec();
        res.render("Role_list", {
            title: "Role's List",
            roles: roles.docs,
            currentPage: roles.page,
            totalPages: roles.totalPages,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
  });
//Create Role
router.get("/createRole",checkUserRole('Admin'),(req,res)=>{
    res.render("Role_create",{
        title:"Create Role",
    });
});
router.post("/createRole",async(req,res)=>{
    if (!req.body.name) {      
        req.session.message = {
            type: 'danger',
            message: 'Vui lòng điền Name!'
        };
        return res.redirect("/role/createRole");
    }   
    else
    {
        req.session.name = req.body.name;     
    }
    const role = new Role({
        name:req.body.name,
    });
    try{
       await role.save();
       req.session.message = {
        type: 'success',
        message:'Role created successfully!'
    };
    res.redirect("/role/listRole");
    }catch(err){
        res.json({message:err.message,type:'danger'});
    }  
});
//Edit Role
router.get("/edit/:id",checkUserRole('Admin'),async(req,res)=>{
    try{
        let id = req.params.id;
        const role = await Role.findById(id).exec();
        console.log(role);
        if(role == null){
            res.redirect("/");
        }else{
        res.render("Role_edit",{
            title:"Edit Role",
            role:role,
        })
    }
    }catch(err){
        res.redirect("/");
    }
});
router.post("/updateRole/:id", async (req, res) => {
    try {
        let id = req.params.id;

        const result = await Role.findByIdAndUpdate(id, {
            name: req.body.name,
        });
        if (!result) {
            res.json({ message: 'Role not found', type: 'danger' });
            return;
        }
        req.session.message = {
            type: 'success',
            message: 'Role updated successfully!',
        };
        res.redirect('/Role/listRole');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});
//Delete Role
router.get('/deleteRole/:id',checkUserRole('Admin'),async(req,res)=>{
    try{
        let id = req.params.id;
        const result = await Role.findById(id);   
        result.isDeleted = true;
        await result.save();
        req.session.message = {
            type: 'info',
            message: 'Role deleted successfully!',
        };
        res.redirect('/role/listRole');

    }catch(err){
        res.json({ message: err.message});
    }
});
  
  module.exports = router;