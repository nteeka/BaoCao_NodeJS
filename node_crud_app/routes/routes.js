const express = require("express");
const router = express.Router();
const User = require('../models/users');
const Role = require('../models/roles');
const Cart = require('../models/cart');
const multer = require('multer');
const fs = require("fs");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const checkUserRole = require('../middleware/checkRole');
// const axios = require('axios');
// const ZEROBOUNCE_API_KEY = '55d938cf7d494740b77f7fae9c5ee9a0';

//upload pic and store
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

//danh sach USER
router.get("/", async (req, res) => {
    // try {
    //     const users = await User.find().exec();
    //     res.render("User_list", {
    //         title: "List User",
    //         users: users,
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
        const users = await User.paginate({},options);
        res.render("User_list", {
            title: "List User",
            users: users.docs,
            currentPage: users.page,
            totalPages: users.totalPages,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
    
});
//Create USER
router.get("/add",checkUserRole('Admin'),async(req,res)=>{
    const role = await Role.find({isDeleted: false});        
    res.render("User_create",{
        title:"Add Users",
        roles:role,
        name: req.session.name || '',
        email: req.session.email || '',
        phone: req.session.phone || '',
    });
});
router.post("/add",upload,async(req,res)=>{   
    if (!req.body.name) {      
        req.session.message = {
            type: 'danger',
            message: 'Vui lòng điền Name!'
        };
        return res.redirect("/add");
    }
    else
    {
        req.session.name = req.body.name;     
    }
    if (!req.body.email) {
        req.session.message = {
            type: 'danger',
            message: 'Vui lòng điền Email!'
        };
        return res.redirect("/add");
    }
    else
    {
        req.session.email = req.body.email;     
    }
    const phoneRegex = /^0\d{9}$/;
    if (!req.body.phone) {
        req.session.message = {
            type: 'danger',
            message: 'Vui lòng điền Phone!'
        };
        return res.redirect("/add");
    }
    else if (!phoneRegex.test(req.body.phone)) {
        req.session.message = {
            type: 'danger',
            message: 'Số điện thoại không hợp lệ!'
        };
        req.session.phone = req.body.phone;
        return res.redirect("/add");
    }
    else
    {
        req.session.phone = req.body.phone;     
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);  
    const user = new User({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        image:req.file.filename,
        role:req.body.role,
        password:hashedPassword,
    });
    try{
       await user.save();
       req.session.message = {
        type: 'success',
        message:'User added successfully!'
    };
    res.redirect("/");
    }catch(err){
        res.json({message:err.message,type:'danger'});
    }  
});

//Edit User
router.get("/edit/:id",checkUserRole('Admin'),async(req,res)=>{
    try{
        let id = req.params.id;
        const user = await User.findById(id).exec();
        console.log(user);
        if(user == null){
            res.redirect("/");
        }else{
        res.render("User_edit",{
            title:"Edit User",
            user:user,
        })
    }
    }catch(err){
        res.redirect("/");
    }
});
router.post("/update/:id", upload, async (req, res) => {
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
        if (!req.body.name) {      
        req.session.message = {
            type: 'danger',
            message: 'Vui lòng điền Name!'
        };
        return res.redirect("/add");
        }
        if (!req.body.email) {
            req.session.message = {
                type: 'danger',
                message: 'Vui lòng điền Email!'
            };
            return res.redirect("/add");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(req.body.email)) {
            req.session.message = {
            type: 'danger',
            message: 'Định dạng Email không hợp lệ!'
        };
            return res.redirect("/add");
        }
        const phoneRegex = /^0\d{9}$/;
        if (!req.body.phone) {
            req.session.message = {
                type: 'danger',
                message: 'Vui lòng điền Phone!'
            };
            return res.redirect("/add");
        }
        else if (!phoneRegex.test(req.body.phone)) {
                req.session.message = {
                type: 'danger',
                message: 'Số điện thoại không hợp lệ!'
                };
            req.session.phone = req.body.phone;
            return res.redirect("/add");
        }
    
        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        if (!result) {
            res.json({ message: 'User not found', type: 'danger' });
            return;
        }

        req.session.message = {
            type: 'success',
            message: 'User updated successfully!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

//Delete USer
router.get('/delete/:id',async(req,res)=>{
    try{
        let id = req.params.id;
        const result = await User.findByIdAndDelete(id);
        if(result && result.image !== ''){
            try{
                fs.unlinkSync('./uploads'+result.image);
            }catch(err){
                console.log(err);
            }
        }
        req.session.message = {
            type: 'info',
            message: 'User deleted successfully!',
        };
        return res.redirect('/');

    }catch(err){
        res.json({ message: err.message});
    }
});

//Register
router.get("/register_form", async (req, res) => {
    try {
        // const users = await User.find().exec();
        res.render("register_form", {
            title: "register_form",
            errorMessage: null,
            sessionName: req.session.name || '',
            sessionEmail: req.session.email || '',
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});
router.post("/register", async (req, res) => {
    try {
        
        const { name, email, password, repeatPassword } = req.body;
        if (password !== repeatPassword) {
            req.session.name = req.body.name || '';
            req.session.email = req.body.email || '';
            return res.status(400).render("register_form", {
                title: "register_form",
                errorMessage: "Password is not match.",
                sessionName: req.session.name || '',
                sessionEmail: req.session.email || '',
            });
        }
        // Check if the password meets the strength criteria
        const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordStrengthRegex.test(password)) {
            req.session.name = req.body.name || '';
            req.session.email = req.body.email || '';
            return res.status(400).render("register_form", {
                title: "register_form",
                errorMessage: "Password is not strong enough. It must contain at least 8 characters, one lowercase letter, one uppercase letter, one number, and one special character.",
                sessionName: req.session.name || '',
                sessionEmail: req.session.email || '',
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            req.session.name = req.body.name || '';
            req.session.email = req.body.email || '';
            return res.status(400).render("register_form", {
                title: "register_form",
                errorMessage: "Invalid Email.",
                sessionName: req.session.name || '',
                sessionEmail: req.session.email || '',
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        req.session.message = {
            type: 'success',
            message:'User register successfully!'
        };
        req.session.name = null;
        req.session.email = null;
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error);
    }
});

//Manager USER
router.get("/account/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.render("User_Account", {
            title: "User",
            user: user,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});
router.post("/updateUser/:id", upload, async (req, res) => {
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
        if (!req.body.name) {      
        req.session.message = {
            type: 'danger',
            message: 'Vui lòng điền Name!'
        };
        return res.redirect("/account/" + id);
        }
        if (!req.body.email) {
            req.session.message = {
                type: 'danger',
                message: 'Vui lòng điền Email!'
            };
            return res.redirect("/account/" + id);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(req.body.email)) {
            req.session.message = {
            type: 'danger',
            message: 'Định dạng Email không hợp lệ!'
            };
            return res.redirect("/account/" + id);
        }
        const phoneRegex = /^0\d{9}$/;
        if (!req.body.phone) {
            req.session.message = {
                type: 'danger',
                message: 'Vui lòng điền Phone!'
            };
            return res.redirect("/account/" + id);
        }
        else if (!phoneRegex.test(req.body.phone)) {
                req.session.message = {
                type: 'danger',
                message: 'Số điện thoại không hợp lệ!'
                };
            req.session.phone = req.body.phone;
            return res.redirect("/account/" + id);
        }
    
        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        if (!result) {
            res.json({ message: 'User not found', type: 'danger' });
            return;
        }

        req.session.message = {
            type: 'success',
            message: 'User updated successfully!',
        };
        return res.redirect("/account/" + id);
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});
router.post("/changePassword/:id", async (req, res) => {
    try {
        let id = req.params.id;
        const result = await User.findById(id);
        const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordStrengthRegex.test(req.body.newPassword)) {
            req.session.message = {
                type: 'danger',
                message: 'Password is not strong enough. It must contain at least 8 characters, one lowercase letter, one uppercase letter, one number, and one special character.',
                };
            return res.redirect("/account/" + id);
        }
        if (await bcrypt.compare(req.body.oldPassword,result.password )) { 
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
            result.password = hashedPassword;
            await result.save();
            req.session.message = {
                type: 'success',
                message: 'Password changed successfully!'
                };
            return res.redirect("/account/" + id);
        } else {
            req.session.message = {
                type: 'danger',
                message: 'Password not match!'
                };
            return res.redirect("/account/" + id);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});



//Login
router.get("/login_form", async (req, res) => {
    try {
        // const users = await User.find().exec();
        res.render("login_form", {
            title: "login_form",
            errorMessage: null,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('role');
        if (user && await bcrypt.compare(password, user.password)) {          
            // You can set up session or token here based on your authentication method
            req.session.user = user;
            const userId = user._id;
            const cart = await Cart.find({ userId }).populate({
                path: 'productId',
                populate: { path: 'category', model: 'Category' }
            }).exec();
            req.session.countCart = cart.length;
            req.session.roleName = user.role.name;
            res.redirect('/product/listProduct'); // Redirect to home or user dashboard after successful login
        } else {
            // res.status(400).send('Invalid email or password');
            res.render('login_form', {title: "login_form", errorMessage: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

//Logout
router.get("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            // Handle error - you might want to log this or send a custom response
            res.status(500).send('Error occurred during logout');
        } else {
            // Redirect to the login page or home page after logout
            res.redirect('/login_form');
        }
    });
});

//Send mail
const sendEmail = async (email, subject, text) => {
    // Set up transporter with your email configuration
    const transporter = nodemailer.createTransport({
        // Example using Gmail
        service: 'gmail',
        auth: {
            user: 'nteeka2002@gmail.com',
            pass: 'http yabn liqi pijk'
        }
    });

    // Mail options
    await transporter.sendMail({
        from: 'nteeka2002@gmail.com',
        to: email,
        subject: subject,
        text: text
    });
};
//forgot Pass
router.get("/forgot-password_form", async (req, res) => {
    try {
        // const users = await User.find().exec();
        res.render("forgot-password_form", {
            title: "forgot-password_form",
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        // Create a token
        // const token = jwt.sign({ id: user._id }, 'your-secret-key', { expiresIn: '1h' });
        const nonce = crypto.randomBytes(16).toString('hex');
        const token = jwt.sign(
            { id: user.id, nonce: nonce }, 
            'your-secret-key', 
            { expiresIn: '10m' }
        );
        // Send email with the token
        // const resetLink = `http://localhost:5000/reset-password/${token}`;
        const resetLink = `http://localhost:5000/reset-password-form/${token}`;

        sendEmail(user.email, 'Password Reset', `Please use the following link to reset your password: ${resetLink}`);

        res.send("Password reset link sent to your email if it exists in our system.");
    } else {
        res.status(404).send("User not found");
    }
});
router.get("/reset-password-form/:token", (req, res) => {
    const { token } = req.params;
    try {
        // Verify the token is valid
        jwt.verify(token, 'your-secret-key');
        // Render the password reset form with the token
        res.render("reset-password-form", {token});
    } catch (error) {
        res.status(400).send("Invalid or expired token");
    }
});
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        const user = await User.findById(decoded.id).exec();    
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        if (user) {
                  
            user.password = hashedPassword;
            await user.save();
            res.send("Password has been successfully reset.");
        } else {
            res.status(404).send("Invalid token or user not found");
        }
    } catch (error) {
        res.status(400).send("Invalid or expired token");
    }
});







module.exports = router;