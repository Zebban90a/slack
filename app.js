const express = require('express')
const path = require('path')
const mongoose = require("mongoose");
const passport = require("passport")
const LocalStrategy = require('passport-local')
const bodyParser = require('body-parser')
const passportLocalMongoose = require("passport-local-mongoose")
const User = require("./models/user");
const Chat = require('./models/chat')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')

const http = require('http')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended:true }))

mongoose.connect("mongodb://localhost:27017/slack");

app.use(express.static(path.join(__dirname, 'public')));

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
    successRedirect:"/dashboard",
    failureRedirect:"/login"
}),function (req, res){
});

app.get("/dashboard",isLoggedIn ,(req,res) =>{
    res.render("dashboard");
})

app.get('/chat', (req,res) => {
    res.render('chat')
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

const botName = 'chatbot'

//kör när en användare connectar
io.on('connection', socket => {
    console.log('new connection')
    //till alla utom aktuell användare
    socket.broadcast.emit('message', formatMessage(botName,'A user has joined the chat'))

    //När en användare disconnectar
    socket.on('disconnect', () => {
        io.emit('message', formatMessage(botName,'A user has left the chat'))
    })

    //kolla efter chatMessage
    socket.on('chatMessage', (msg) => {
        io.emit('message', formatMessage('USER', msg))
        //spara ner i mongoDB
        let chatMessage = new Chat({message: msg, nickname: 'anonymjävel'})
        chatMessage.save()
    })

    

})


server.listen(3000, () => {
    console.log('server running at 3000')
})