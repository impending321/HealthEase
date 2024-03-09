const bcrypt = require('bcryptjs');
const User = require('../models/User');

const jwt = require('jsonwebtoken');

require("dotenv").config();

// signup
exports.signup = async (req ,res)=>{
    try{
        // get data
        const {name , email , password , role} = req.body;
        //check if user exists
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User Already Exists",
            });
        }

        // secure password
        // hashing
        try{
            const hashedPassword = await bcrypt.hash(password , 10);
            // create and save the user
            const savedProfile = await User.create({
                name , email , password:hashedPassword , role
            });
        }
        catch(err){
            return res.status(400).json({
                success:false,
                message:"Error in Hashing the Password",
            });
        }

        return res.status(200).json({
            success:true,
            message:"User created Successfully",
        });
    }
    catch(error){
        console.log(error);
        console.error(error);
        res.status(500).json({
            success:false,
            data:error,
            message:"Internal Server Error",
        })
    }
}

exports.login = async(req , res)=>{
    try{
        const {email , password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Please fill all the details"
            });
        }

        let user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User not registered"
            });
        }

        const payload = {
            email:user.email,
            id:user._id,
            role:user.role,
        };

        if( await bcrypt.compare(password , user.password)){
            // password matched
            let token = jwt.sign(payload , process.env.JWT_SECRET_KEY,
                {
                    expiresIn:"2h",
                });
            
            // convert the user to object using .toObject() method and add the token field
            // and make the pwd field undefined to prevent any hacking or other issue.
            user = user.toObject();
            user.token = token;
            user.password=undefined;

            const options={
                expires: new Date ( Date.now() + 3*24*60*60*1000),
                httpOnly:true
            }
            
            res.cookie("tokenCookie" , token , options).status(200).json({
                success:true,
                message:"User Logged in Succeddfully",
                token, 
                user,
            });

        }
        else{
            return res.status(403).json({
                success:false,
                message:"Password Incorrect"
            });
        }
    }
    catch(error){
        console.log(error);
        console.error(error);
        res.status(500).json({
            success:false,
            data:error,
            message:"Problem Logging In",
        })
    }
};

exports.auth = (req , res , next) => {
    try{
        // extract the token from the request.
        const token = req.body.token;

        // check if token present or not.
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token not found",
            });
        }

        try{
            // decode the token and get the payload of the JWT token:
            const decodedToken = jwt.verify(token , process.env.JWT_SECRET_KEY );
            console.log(decodedToken);
            // when we got the decoded token then insert it in the req with user to use for further authentication and authorisation like in isStudent or isAdmin middleware
            req.user = decodedToken;
        } catch(err){
            console.log(err);
            return res.status(401).json({
                success:false,
                message:"Token is INVALID",
            })
        }
        next();

    } catch(error){
        console.log(error);
        return res.status(401).json({
            success:false,
            message:"Something Went Wrong",
        });
    }
};

exports.isStudent = (req ,res , next)=>{
    try{

        const role = req.user.role;

        if(role !== "Student"){
            return res.status(403).json({
                success:false,
                message:"This is a protected route for students",
            });
        }

        next();
    }
    catch(err){
        console.log(error);
        return res.status(401).json({
            success:false,
            message:"Something Went Wrong in Student Auth",
        });
    }
}

exports.isAdmin = (req ,res , next)=>{
    try{
        const role = req.user.role;
        if(role !== "Admin"){
            return res.status(403).json({
                success:false,
                message:"This is protected Route For Admins",
            })
        }
        next();
    }
    catch(err){
        console.log(error);
        return res.status(401).json({
            success:false,
            message:"Something Went Wrong in Student Auth",
        });
    }
};