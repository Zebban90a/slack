const mongoose = require("mongoose");

// plugin som gör det enklare att skapa login
const passportLocalMongoose = require("passport-local-mongoose");
const UserSchema = new mongoose.Schema({
    username:String,
    email: String,
    profilpic: {type: String, default: "/uploads/vad-är-jpg-220x162.jpg" },
    password:String
}) ;
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",UserSchema);