var mongoose = require('mongoose');
mongoose.connect("mongodb+srv://Admin:minnu@mongodb01.irdlb.mongodb.net/Booking?retryWrites=true&w=majority",{useNewUrlParser:true,useCreateIndex:true, useUnifiedTopology: true},function(err,db){
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    } else {
        console.log('Connected to Doctor successfully!');
    }
});
const Doctor={
    doctor_id:{
        type :mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    speciality:{
        type: String,
        required: true
    },
    experience:{
        type: String,
        required: true
    },
    gender:{
        type: String,
        required: true
    },
    language:{
        type: String,
        required: true
    },
    qualification:{
        type: String,
        required: true
    },
    working_hours:{
        type: String,
        required: true
    },
    fees:{
        type: Number,
        required: true
    },
    hospital_id:{
        type :mongoose.Schema.Types.ObjectId, 
        ref: 'Hospital'
    }
};
 
module.exports = mongoose.model('Doctor', Doctor);