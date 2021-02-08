var mongoose = require('mongoose');
mongoose.connect("mongodb+srv://Admin:minnu@mongodb01.irdlb.mongodb.net/Booking?retryWrites=true&w=majority",{useNewUrlParser:true,useCreateIndex:true, useUnifiedTopology: true},function(err,db){
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    } else {
        console.log('Connected to Hospital successfully!');
    }
});
const Hospital={
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }
};
 
module.exports = mongoose.model('Hospital', Hospital);