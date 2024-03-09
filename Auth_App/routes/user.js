const express = require('express');
const router = express.Router();

const { login ,signup, auth, isStudent, isAdmin} = require('../controllers/Auth');

router.post("/login" , login);
router.post("/signup" , signup);

// Protected Routes:
router.get('/student' , auth , isStudent , (req , res)=>{
    res.status(200).json({
        success:true,
        message:"Student Authorised Sccessfully",
    })
});
router.get('/admin' , auth , isAdmin , (req , res)=>{
    res.status(200).json({
        success:true,
        message:"Admin Authorised Sccessfully",
    })
});


module.exports=router;