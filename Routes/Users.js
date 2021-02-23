const express = require('express');
const bodyParser = require('body-parser');
const bcrypt=require('bcrypt');
var mongoose = require('mongoose');
const sanitizeHtml=require('sanitize-html');
const passport = require("passport");
const User=require('../Models/User');
const Doctor=require('../Models/Doctor');
const Appointment=require('../Models/Appointment');
const Hospital=require('../Models/Hospital');
const auth=require('../Authentication/authenticate');
const mail=require('../Mail');
var moment = require('moment');


require('dotenv').config();

const UserRouter = express.Router();
UserRouter.use(bodyParser.json());
UserRouter.use(passport.initialize());
UserRouter.use(passport.session());

function sanitize(text){
  var ans=sanitizeHtml(text,{
    allowedTags: [ ],
    allowedAttributes: {}
  });
  return ans;
}

 UserRouter.route("/register").get(function(req,res){
  res.render('register');
  })
  .post(async function(req,res){
  try{
   await  User.findOne({email: sanitize(req.body.email)})
    .then(async (user) => {
      if(user != null) {
         req.flash('error',"Email already exists.Try with another email");
        res.redirect('/user/register');
      }
      else{
    const hashedPassword=await bcrypt.hash( sanitize(req.body.password),10);
    const user=new User({
      name: sanitize(req.body.name),
      email: sanitize(req.body.email),
      password: sanitize(hashedPassword),
      phone: sanitize(req.body.phone)
    })
   await user.save(); 
   mail(req,res,req.body.email,'Your username is '+req.body.name+' and your password is '+req.body.password+'. Have a nice day!',"Your account is created successfully!Password is sent to your mail",'/user/login',"Your account is created successfully!Could not send email!",'/user/register');  
  }
    })}
    catch(err){
       req.flash('error',"WRONGGG!Try again!");
       console.log(err);
       res.redirect('/user/register');
    };
});
UserRouter.route("/login").get(function(req,res){
    res.render('login');
  })
  .post(passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/user/login',
    failureFlash:true
  }))
  
UserRouter.route("/logout").get(auth.checkAuthenticated,function(req,res){
    req.flash('success',"You logged out successfully");
     req.session.destroy();
     res.clearCookie('session-id');
     res.redirect('/');
});

UserRouter.route("/dashboard").get(auth.checkAuthenticated,function(req,res){
  Appointment.find({user_id: req.user.id}).populate({
    path: 'doctor_id',
    model: 'Doctor',
    populate: {
      path: 'doctor_id',
      model: 'User'
    }
  }).populate('hospital_id').then((data,err)=>{
    res.render('patient_dashboard',{data: data});
  })
});
UserRouter.route("/filter").post(async function(req,res){
  console.log(req.body.gender+" "+req.body.doctor);
  var e=req.body.experience;
  if(e== "elow"){
    Doctor.find({ gender: req.body.gender||"Male", speciality:req.body.doctor }).sort([["experience",1]]).populate('doctor_id','name id').populate('hospital_id').then((doctors,err)=>{
      console.log(doctors);
       res.render("book",{doctor:doctors});
     }).catch(err=>   req.flash('error',"Something went wrong!Try again!"));
  }
  else{
  Doctor.find({ gender: req.body.gender||"Male", speciality:req.body.doctor }).sort([["experience",-1]]).populate('doctor_id','name id').populate('hospital_id').then((doctors,err)=>{
   console.log(doctors);
    res.render("book",{doctor:doctors});
  }).catch(err=>   req.flash('error',"Something went wrong!Try again!"));
}
});

UserRouter.route("/:AppId/delete").post(auth.checkAuthenticated,async function(req,res){
  const requestedTitle=sanitize(req.params.AppId);
  console.log("hiiii delete"+requestedTitle);
  var user_email;
   Appointment.find({_id:requestedTitle}).populate('doctor_id').then( function(result,err){
     user_email=result[0].user_id.email;
     console.log("email "+user_email);
   Appointment.deleteOne({_id:requestedTitle}).then(function(r,err){console.log("Success deleted")}).catch(err=> req.flash('error',"App not deleted"));
    console.log(req.user.email+","+user_email);
   mail(req,res,req.user.email+","+user_email,'Your appointment on '+d+' at '+ req.body.time_slot +' is cancelled.',"Appointment cancelled successfully",'/doctor/dashboard',"Appointment not cancelled.Please retry again",'/doctor/dashboard');  
    req.flash('success',"Appointment cancelled successfully!");
    res.redirect('/doctor/dashboard');
  }).catch(err=> req.flash('error',"Something went wrong!Try again!"));
  });

  UserRouter.route("/booking").get(auth.checkAuthenticated,function(req,res){
    Doctor.find().populate('doctor_id','name id').populate('hospital_id').then((doctors,err)=>{
      res.render("book",{doctor:doctors});
    }).catch(err=>   req.flash('error',"Something went wrong!Try again!"));
  }).post(async function(req,res){
    // console.log("bodyyyy "+JSON.stringify(req.body))
    console.log(req.body);
    var d=moment(new Date(req.body.date_selected)).format("YYYY-M-D");
    console.log(d);
     var a=new Appointment({
     hospital_id:mongoose.Types.ObjectId(req.body.hospital_id),
     doctor_id:mongoose.Types.ObjectId(req.body.doctor_id),
     user_id:req.user.id,
     time_slot:req.body.time_slot,
     appointment_date:d
   })
   await a.save().then(console.log("succcesss")).catch(err=>{console.log(err)});
   await mail(req,res,req.user.email,'Your appointment is confirmed on '+d+' at '+ req.body.time_slot +'. Have a nice day!',"Appointment booked successfully",'/user/dashboard',"Appointment not booked.Please retry again",'/booking');  
     res.redirect("/user/dashboard");
   });   
   UserRouter.route("/time_slots").post(function(req,res){
    console.log(req.body.doctor+" "+req.body.app_date);
    items=Appointment.find({doctor_id: req.body.doctor, appointment_date: req.body.app_date}).then((slots,err)=>{
      let data=JSON.stringify(slots);
      //console.log("data "+data);
     return res.json({data: data})
    }).catch(err=>   req.flash('error',"Something went wrong!Try again!"))
  });
  
  
  
  
  
  
  //var a=new Appointment({hospital_id:mongoose.Types.ObjectId('600d3c106c153f06743eddc1'),doctor_id:mongoose.Types.ObjectId('600d5c5b8508ae1c18114975'),user_id:mongoose.Types.ObjectId('600c58f0de29d424b8e2581e'),time_slot:"2:30-3:30",appointment_date:new Date("2021-2-18")})
  //a.save()

module.exports = UserRouter;

  
