require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.DB_URI,{useNewUrlParser:true, useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error',(error)=>console.log(error));
db.once('open',()=>console.log("Connected to the database!"));

app.use(express.urlencoded({extended:false}));
app.use(express.json());

// app.use(session({
//     secret:'my secret key',
//     saveUninitialized:true,
//     resave:false,
// }))

app.use(session({
    secret: 'your_secret_key', // Replace with a real secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use((req, res, next) => {
    // Attach the session user to res.locals
    if (req.session.user) {
        res.locals.user = req.session.user;
    } else {
        res.locals.user = null;
    }
    next();
});
app.use((req, res, next) => {
    if (req.session.roleName) {
        res.locals.roleName = req.session.roleName;
    } else {
        res.locals.roleName = null;
    }
    next();
});
app.use((req, res, next) => {
    if (req.session.countCart) {
        res.locals.countCart = req.session.countCart;
    } else {
        res.locals.countCart = 0;
    }
    next();
});
app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static("uploads"));

app.set("view engine","ejs");
var categoryRouter = require('./routes/category');
var roleRouter = require('./routes/role');
var productRouter = require('./routes/product');
var cartRouter = require('./routes/cart');
app.use("",require("./routes/routes"));
app.use('/category',categoryRouter);
app.use('/product',productRouter);
app.use('/role',roleRouter);
app.use('/cart',cartRouter);
app.use('/uploads', express.static('uploads'));
app.listen(PORT,()=>{
    console.log(`Server started at http://localhost:${PORT}`);
});