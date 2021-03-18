const express = require('express')
const mongoose = require("mongoose");
const passport = require("passport")
const LocalStrategy = require('passport-local')
const bodyParser = require('body-parser')
const passportLocalMongoose = require("passport-local-mongoose")
const User = require("./models/user");

const app = express()

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended:true }))

mongoose.connect("mongodb://localhost:27017/slack");

app.use(require("express-session")({
secret:"secreeet",
    resave: false,          
    saveUninitialized:false    
}));

passport.serializeUser(User.serializeUser());   //encoding    
passport.deserializeUser(User.deserializeUser());  //decoding
passport.use(new LocalStrategy(User.authenticate()));

app.use(passport.initialize());
app.use(passport.session());

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login",passport.authenticate("local",{
    successRedirect:"/userprofile",
    failureRedirect:"/login"
}),function (req, res){
});

app.get("/userprofile",isLoggedIn ,(req,res) =>{
    res.render("userprofile");
})

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post('/register', (req,res) => {
    User.register(new User({
        username: req.body.username,
        email: req.body.email}),
        req.body.password, function(err,user) {
            //om error
            if(err){
                console.log(err);
                res.render("register");
            }
            //annars
            passport.authenticate("local")(req,res,function(){
            res.redirect("/login");
            })  
        })
})

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/login");
});

//om man är inloggad , annars redirecta till /login
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(3000, () => {
    console.log('server running at 3000')
})