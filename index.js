// IMPORTS
const mongoose = require("mongoose");
const express = require("express");
const layouts = require("express-ejs-layouts");
const connectFlash = require("connect-flash");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const expressValidator = require("express-validator");
const passport=require("passport"); //npm i passport passport-local-mongoose -S
const methodOverride = require("method-override");
const router = require("./routes/index");

// IMPORTING MODELS
const User = require("./models/user"); 

//INITIALIZING APP
const app = express();

//CONNECTING TO DATABASE
mongoose.connect("mongodb://127.0.0.1:27017/brandeis_saa"); //had to change localhost bc wasn't working until I changed it to this
const db=mongoose.connection;
db.once("open", ()=> {
    console.log("Connected to the database!");
});

// SETTING UP EJS LAYOUT + OTHER EXPRESS MODULES
app.set("port", process.env.PORT || 8080);
app.set("view engine", "ejs");
app.use(layouts);
app.use(express.static("public"));
app.use(express.urlencoded({extended: false})); 
app.use(express.json());
app.use(
    methodOverride("_method", {
        methods: ["POST", "GET"],
    })
);

//FLASH MESSAGES
app.use(connectFlash());
app.use(expressValidator());
app.use(
  expressSession({
    secret: "secret_passcode",
    cookie: { maxAge: 4000000 },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cookieParser("secret_passcode"));

//PASSPORT/VALIDATION SET UP
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//FLASH + AUTHENTICATION
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

//ROUTING
app.use("/", router);

//CHAT SERVER
const server = app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});

const io = require("socket.io")(server);
require("./controllers/chatController")(io);