const express = require('express');
const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use(express.json());

const dbConnect = require("./config/database");
dbConnect.connect(); 

const user = require('./routes/user');
app.use("/api/v1" , user);

app.listen(PORT , ()=>{
    console.log("Server Started");
})

app.get("/" , (req,res)=>{
    console.log(`Server Started at port ${PORT}`);
    res.send("<h1>Hello</h1>");
} )