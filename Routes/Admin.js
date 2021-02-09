const express = require('express');
const bodyParser = require('body-parser');
const bcrypt=require('bcrypt');
const sanitizeHtml=require('sanitize-html');
const passport = require("passport");
const User=require('../Models/User');
const auth=require('../Authentication/authenticate');
const Doctor=require('../Models/Doctor');
const AdminRouter = express.Router();
AdminRouter.use(bodyParser.json());
AdminRouter.use(passport.initialize());
AdminRouter.use(passport.session());

function sanitize(text){
    var ans=sanitizeHtml(text,{
      allowedTags: [ ],
      allowedAttributes: {}
    });
    return ans;
}
AdminRouter.route("/userlogs").get(auth.checkIsAdmin,async function(req,res){
  var doctors=[];
  var patients=[];
  await Doctor.find().populate('doctor_id','name id').then((doctors_list,err)=>{
  doctors.push(doctors_list);
  }).catch(err=> req.flash('error',"Something went wrong!Try again!"));
  await User.find({ role:'patient'}).populate('doctor_id').then((users,err)=> {
  patients.push(users);
  })
  res.render('userlogs', {users: patients[0], doctors: doctors[0]} );
});

module.exports = AdminRouter;