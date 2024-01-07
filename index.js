const express = require('express');
require('./db/config');
const User = require('./db/User');
const Product = require('./db/Product');
const cors = require('cors');

const Jwt = require('jsonwebtoken');
const jwtKey = 'e-comm'

const app = express();

app.use(express.json());
// middleware
app.use(cors());

app.post("/register", async (req, resp) => {
   let user = new User(req.body);
   let result = await user.save();
    // Remove Password from Register 
   result = result.toObject();
   delete result.password;
   Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
      if (err) {
         resp.send({ result: "something went wrong, please try after sometime" })
      }
      resp.send({ result, auth: token });
   })
})

// Login API in Node.js

app.post('/login', async (req, resp) => {
   console.log(req.body);
   if (req.body.password && req.body.email) {
      //  Remove Password from login API 
      let user = await User.findOne(req.body).select("-password");
      if (user) {
         //  define the key for authentication
         Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
            if (err) {
               resp.send({ result: "something went wrong, please try after sometime" })
            }
            resp.send({ user, auth: token });
         })
      } else {
         resp.send({ result: "No user Found" })
      }
   }
   else {
      resp.send({ result: "No user Found" })
   }
});

// Make Route for add Product
app.post('/add-product', verifyToken, async (req, resp) => {
   let product = new Product(req.body);
   let result = await product.save();
   resp.send(result);
});

// Product list API
app.get("/products", verifyToken, async (req, resp) => {
   let products = await Product.find();
   if (products.length > 0) {
      resp.send(products);
   }
   else {
      resp.send({ result: "No Products found" })
   }
});

// Delete Product API
app.delete("/product/:id", verifyToken, async (req, resp) => {
   // resp.send(req.params.id);
   const result = await Product.deleteOne({ _id: req.params.id })
   resp.send(result);
});

// API for get single Product
app.get("/product/:id", verifyToken, async (req, resp) => {
   let result = await Product.findOne({ _id: req.params.id })
   if (result) {
      resp.send(result);
   } else {
      resp.send({ result: "No Record Found" });
   }
});

//  API for update Product
app.put("/product/:id", verifyToken, async (req, resp) => {
   let result = await Product.updateOne(
      { _id: req.params.id },
      { $set: req.body }
   )
   resp.send(result);
});

// Search API for Product
app.get("/search/:key", verifyToken, async (req, resp) => {
   let result = await Product.find({
      "$or": [
         { name: { $regex: req.params.key } },
         { company: { $regex: req.params.key } }
      ]
   })
   resp.send(result);
});

//  make middleware for verifying token
// function verifyToken(req, resp, next) {
//    // let token = req.headers['authorization'];
//    // if (token) {
//    //    token = token.split(' ')[1];
//    //    console.log("middleware called if", token);
//    //    Jwt.verify(token, jwtKey, (err, valid) => {
//    //       if (err) {
//    //          resp.status(401).send({ result: "Please provide valid token" });

//    //       } else {
//    //          next();
//    //       }
//    //    })
//    // } else {
//    //    resp.status(403).send({ result: "Please add token with header" });
//    // }
//    console.log("Middleware called")
//    next();
// }

// make middleware for verifying token
function verifyToken(req, resp, next) {
   let token = req.headers['authorization'];
   if (token) {
      token = token.split(' ')[1];
      //console.log("middleware called if", token)
      Jwt.verify(token, jwtKey, (err, valid) => {
         if (err) {
            resp.status(401).send({ result: "Please provide valid token" })
         } else {
            next();
         }
      })

   } else {
      resp.status(403).send({ result: "Please add token with header" })
   }
   //console.log("middleware called", token)

}
app.listen(5000);

















