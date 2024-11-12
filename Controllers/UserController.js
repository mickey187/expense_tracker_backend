const User = require('../models/User');

const createUser = async(req, res) => {
    try {
        console.log("ell");
        
        const newUser = new User(req.body);
        await newUser.save();
        return res.status(201).json({message: "success",error:false, data: newUser});
    } catch (error) {
        console.error("failed to create user: "+error);
        
        return res.status(500).json({message: "failed to create user: "+error.message,error:true });
    }
}

const getUserById = async(req, res) => {
    try {
        const {userId} = req.params;
        console.log("userId", userId);
        const user = await User.findById(userId);
        return res.status(201).json({message: "success",error:false, data: user});
    } catch (error) {
        return res.status(500).json({message: "failed to find user: "+error.message,error:true });
    }
}

module.exports = { createUser, getUserById };