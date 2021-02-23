const express = require("express");
const path = require('path');
const bodyParser = require("body-parser");
const ejs = require("ejs");
var passport = require('passport');
var mongoose = require('mongoose');
const session = require('express-session');
const userRouter=require('./Routes/Users');
const DoctorRouter=require('./Routes/Doctors');
const AdminRouter=require('./Routes/Admin');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// Express Middleware for serving static files
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret:"secret",
  resave:false, //this means session variables are not resaved if nothing/ is changed
  saveUninitialized:false, //this means we dont want to save empty value in session if there is no value 
 cookie:{maxAge:315360000}
}))

app.use(passport.initialize());
app.use(passport.session());
const flash = require('connect-flash');

app.use(flash());
const initializePassport=require('./Authentication/passport-config')(passport);
const auth=require('./Authentication/authenticate');
app.use(function(req, res, next) {
  // make all error and success flash messages available from all templates
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");

  // make user session data available from within view templates
  res.locals.user = req.user;
  next();
})


app.get("/",function(req,res){
    res.render("home");
});  

app.use('/user', userRouter);
app.use('/doctor', DoctorRouter);
app.use('/admin', AdminRouter);
app.listen(3000, function() {
  console.log("Server started on port 3000");
});

//mongoose.Types.ObjectId('4edd40c86762e0fb12000003');