const express = require('express')
const path = require('path')
const mongoose = require("mongoose");
const passport = require("passport")
const LocalStrategy = require('passport-local')
const bodyParser = require('body-parser')
const passportLocalMongoose = require("passport-local-mongoose")
const User = require("./models/user");
const Chat = require('./models/chat')
const Room = require('./models/room')
const socketio = require('socket.io')
const fileUpload = require("express-fileupload")
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    date_string
  } = require('./utils/users');

const http = require('http');


let rooms = []
let room = {}


const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended:true }))

mongoose.connect("mongodb://localhost:27017/slack" , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))


app.use(
    fileUpload({
      createParentPath: true,
      safeFileNames: true, // to get rid of unwanted characters
    })
  )

app.use(require("express-session")({
secret:"secret",
    resave: true,          
    saveUninitialized:true    
}));

passport.serializeUser(User.serializeUser());   //encoding    
passport.deserializeUser(User.deserializeUser());  //decoding
passport.use(new LocalStrategy(User.authenticate()));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req,res) => {
    res.redirect('/login')
})

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login",passport.authenticate("local",{
    successRedirect:"/dashboard",
    failureRedirect:"/login"
}))

app.get("/dashboard",isLoggedIn , async(req,res) =>{
    let username = req.user.username
    let profilepicture = req.user.profilpic
    console.log(profilepicture)
   await Room.find({}, function(err, rooms) {
        
        if(err) {
            console.log(err)
        } else {
            User.find({}, function(err, users) {
                res.render('dashboard', {rooms: rooms, username: username, users: users, room: room, profilepicture: profilepicture})
            })
        }
    })
    
})

app.get('/change', isLoggedIn, (req,res) => {
    let currentUser = req.user.username
    let currentEmail = req.user.email
    
    res.render('profilpage', {currentUser, currentEmail} )
})

//ändra användare && lägg till fil
app.post('/change/:username', isLoggedIn, async(req,res) => {
    let newUser = req.body.username
    let newEmail = req.body.email
    let username = req.user.username
    

    try {
        if (req.files) {
            let profilepicture = req.files.picupload
            let file_name = `/uploads/${username}_profilPic.jpg`
           await profilepicture.mv(`.${file_name}`)
        User.findOneAndUpdate(
        {username: username}, 
        { $set: { username: newUser, email: newEmail,profilpic: file_name} },
        { new: true },
        (error, data) => {
          if (error) {
            console.log("error")
          } else {
            console.log(data)
            
          }
        }
      )
      res.redirect('/dashboard')
    
} else {
    res.end("<h1>No file uploaded</h1>")
  }
} catch (error) {}
})

app.post('/channel', (req,res) => {
    
    let room = new Room({
    room_name: req.body.channel
    })
    room.save()
    console.log(room)
    res.redirect('/dashboard')
})



app.get('/channel/:id',isLoggedIn , async(req,res) => {
    let username = req.user.username
    let profilepicture = req.user.profilpic
    console.log(req.params.id)

    await Chat.find({room: req.params.id}, (error, data) => {
        if(error) return console.log(error)
        chats = data
        
    })

    await Room.findOne({_id: req.params.id}, (error, data) => {
        if(error) return console.log(error)
        room = data
    })

    await  Room.find({}, function(error, data) {
        if(error) return console.log(error)
        rooms = data
    })  
    await User.find({}, function(error, data) {   
        if (error) return console.log(error) 
        users = data        
    })   

    res.render('roompage', {room: room, rooms: rooms, username: username, users: users, profilepicture: profilepicture, chats: chats})
       
})

app.get("/channel/delete/:id",  (req, res) => {
    Room.findByIdAndDelete(req.params.id, function (err) {
        if(err) console.log(err);
        console.log("Successful deletion");
        res.redirect('/dashboard')
    })
  });


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

//kör när en användare connectar
let users = [];

io.on('connection', (socket) => {
    console.log('New WS connection')
    
    //skickar socket till frontend
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        console.log(user)
        socket.join(user.room);
        
        
    })
    
    

    //lyssna på chatmeddelanden
    socket.on('chatMessage', ({msg, username}) => {

        
        
        let chatMessage = new Chat({message: msg, nickname: username, room: room})
        console.log(room)
        chatMessage.save()

        const user = getCurrentUser(socket.id);


    // på frontendsidan ta ''message'
        io.to(user.room).emit('message', ({msg, username}))
        
      });

    

      //runs when client disconnects
    socket.on('disconnect', () => {
        console.log('user disconected')
       /* const user = userLeave(socket.id)

        if(user) {
            io.to(user.room).emit(
                'message', 'Dagge has left the chat'
            )
        }*/
    })


})


server.listen(3000, () => {
    console.log('server running at 3000')
})