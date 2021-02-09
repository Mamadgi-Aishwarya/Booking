const express = require('express');
const bodyParser = require('body-parser');
const bcrypt=require('bcrypt');
const sanitizeHtml=require('sanitize-html');
const passport = require("passport");
const User=require('../Models/User');
const Appointment=require('../Models/Appointment');
const Doctor=require('../Models/Doctor');
const Hospital=require('../Models/Hospital');
const mail=require('../Mail');
const auth=require('../Authentication/authenticate');
var moment = require('moment');
const { deleteOne } = require('../Models/User');

const DoctorRouter = express.Router();
DoctorRouter.use(bodyParser.json());
DoctorRouter.use(passport.initialize());
DoctorRouter.use(passport.session());

function sanitize(text){
    var ans=sanitizeHtml(text,{
      allowedTags: [ ],
      allowedAttributes: {}
    });
    return ans;
}
DoctorRouter.route("/adddoctor").get(auth.checkIsAdmin,function(req,res){
  res.render('doctors');
  })
  .post(async function(req,res){
  try{
   await  User.findOne({email: sanitize(req.body.email)})
    .then(async (user) => {
      if(user != null) {
         req.flash('error',"Email already exists.Try with another email");
        res.redirect('/doctor/adddoctor');
      }
      else{
    const hashedPassword=await bcrypt.hash( sanitize(req.body.password),10);
    const user=new User({
      role: sanitize(req.body.role),
      name: sanitize(req.body.name),
      email: sanitize(req.body.email),
      password: sanitize(hashedPassword),
      phone: sanitize(req.body.phone)
    })
    await user.save(); 
    const doctor=new Doctor({
      doctor_id:mongoose.Types.ObjectId(user._id),
      hospital_id:mongoose.Types.ObjectId(req.body.hospitals),
      speciality: sanitize(req.body.speciality),
      experience: sanitize(req.body.experience),
      gender: sanitize(req.body.genderchoice),
      language: sanitize(req.body.language),
      qualification: sanitize(req.body.qualification),
      working_hours: sanitize(req.body.working_hours),
      fees: sanitize(req.body.fees)
    })
   await doctor.save();
   mail(req,res,req.body.email,'Your username is '+req.body.name+' and your password is '+req.body.password+'. Have a nice day!',"Your account is created successfully!Password is sent to your mail",'/user/login',"Your account is created successfully!Could not send email!",'/user/register');  
    }
    })}
    catch(err){
       req.flash('error',"WRONGGG!Try again!");
       console.log(err);
       res.redirect('/doctor/adddoctor');
    };
});

DoctorRouter.route("/dashboard").get(auth.checkIsDoctor,async function(req,res){
  //var d=moment().format('YYYY-MM-DD');
  var d=new Date()
  var d=moment(d).format("YYYY-M-D");
  var d_id;
  await Doctor.find({doctor_id:req.user.id}).then((doctor,err)=>{
   d_id=doctor[0].id;
  })
  console.log("doctor dasdboard"+d_id+" "+d);
  await Appointment.find({doctor_id: d_id, appointment_date:d}).populate('user_id','name').then((data,err)=>{
    console.log("doctor data"+data);
    res.render('doctor_dashboard',{data: data});
  })
})
 DoctorRouter.route("/:AppId/delete").post(auth.checkIsDoctor,async function(req,res){
  const requestedTitle=sanitize(req.params.AppId);
  console.log("hiiii delete"+requestedTitle);
  var user_email;
   Appointment.find({_id:requestedTitle}).populate('user_id').then( function(result,err){
     user_email=result[0].user_id.email;
     console.log("email "+user_email);
   Appointment.deleteOne({_id:requestedTitle}).then(function(r,err){console.log("Success deleted")}).catch(err=> req.flash('error',"App not deleted"));
    console.log(req.user.email+","+user_email);
   mail(req,res,req.user.email+","+user_email,'Your appointment on '+d+' at '+ req.body.time_slot +' is cancelled.',"Appointment cancelled successfully",'/doctor/dashboard',"Appointment not cancelled.Please retry again",'/doctor/dashboard');  
    req.flash('success',"Appointment cancelled successfully!");
    res.redirect('/doctor/dashboard');
  }).catch(err=> req.flash('error',"Something went wrong!Try again!"));
  });
module.exports = DoctorRouter;