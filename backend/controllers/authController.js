const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
}

exports.registerUser = async (req, res) => {
    // Destructure the request body to get the user details
    // and assign default values to the fields if they are not provided
    // console.log(req.body);
    const {fullname , email , password , profileImageUrl} = req.body;

    // validation check for the missing fields
    if (!fullname || !email || !password) {
        return res.status(400).json({message: 'Please fill all the fields'});
    }
    
    try{
        //  check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'User already exists'});
        }
        // create new user
        const user = await User.create({
            fullname,
            email,
            password,
            profileImageUrl
        })
        res.status(201).json({
            _id: user._id,
            user,
            token: generateToken(user._id),
        });
    }catch(error){
        res.status(500).json({message: 'Error creating user' , error: error.message});
    }
}

exports.loginUser = async (req, res) => {
    // Destructure the request body to get the user details
    const {email , password} = req.body;

    // validation check for the missing fields
    if (!email || !password) {
        return res.status(400).json({message: 'Provide the Credentials to login'});
    }

    try{
        //  check if user already exists
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'User does not exist'});
        }
        // Now this means the user exists, so we need to check the password
        const isPasswordMatched = await user.comparePassword(password);
        if(!isPasswordMatched){
            return res.status(400).json({message: 'Invalid Credentials'});
        }
        // If the password matches, we can return the user details and token
        res.status(200).json({
            _id: user._id,
            user,
            token: generateToken(user._id),
        });
    }catch(error){
        res.status(500).json({message: 'Error logging in user' , error: error.message});
    }
}

exports.getUserInfo = async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select('-password');

        if(!user){
            return res.status(404).json({message: 'User not found'});
        }

        res.status(200).json(user);
    }catch(error){
        res.status(500).json({message: 'Error getting user info' , error: error.message});
    }
}