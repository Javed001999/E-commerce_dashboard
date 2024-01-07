const mongoose = require('mongoose');

   //for create Schema
const productSchema = new mongoose.Schema({
    name:String,
    price:String,
    category:String,
    userId:String,
    company:String
});
   // for create Model
module.exports = mongoose.model('products',productSchema);














