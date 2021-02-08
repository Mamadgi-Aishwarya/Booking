var mongoose = require('mongoose');
mongoose.connect("mongodb+srv://Admin:minnu@mongodb01.irdlb.mongodb.net/Booking?retryWrites=true&w=majority",{useNewUrlParser:true,useCreateIndex:true, useUnifiedTopology: true},function(err,db){
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    } else {
        console.log('Connected to Appointment successfully!');
    }
});
const Appointment={
    hospital_id:{
        type :mongoose.Schema.Types.ObjectId, 
        ref: 'Hospital'
    },
    doctor_id:{
        type :mongoose.Schema.Types.ObjectId, 
        ref: 'Doctor'
    },
    user_id:{
        type :mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    time_slot:{
        type: String,
        required: true
    },
    appointment_date:{
        type: Date,
        required :true
    }
};
 
module.exports = mongoose.model('Appointment', Appointment);