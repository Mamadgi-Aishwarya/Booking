const express = require('express');
const bodyParser = require('body-parser');
const bcrypt=require('bcrypt');
const nodemailer = require('nodemailer');
const Mail = require('nodemailer/lib/mailer');
require('dotenv').config();
function sendMail(req,res,user_email,text,success_msg,success_route,failure_msg,failure_route){
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, 
        pass: process.env.PASSWORD
    }
  });
  console.log(user_email);
  // Step 2
  let mailOptions = {
    from: process.env.EMAIL, // TODO: email sender
    to: user_email, // TODO: email receiver
    subject: 'Medico',
    text: text
  };
  // Step 3
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      req.flash('error',failure_msg);
      console.log(err);
      res.redirect(failure_route);
        }
    else{
    req.flash('success',success_msg);
    res.redirect(success_route);
    }
  });
}
module.exports = sendMail;