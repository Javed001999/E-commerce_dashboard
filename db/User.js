const mongoose = require('mongoose');

   //for create Schema
const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
});
   // for create Model
module.exports = mongoose.model('users',userSchema);





