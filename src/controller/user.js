const express = require('express');
const router = express.Router();
var validator = require('validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const User = require('../model/userSchema');

const roles = ['1', '2', '3']; // Example roles: 1 - User, 2 - Moderator, 3 - Admin

router.post('/signup', async(req, res) => {

    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    if (!validator.isLength(req.body.password, { min: 8 })) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' });
    }
    if(req.body.password !== req.body.confirmpassword){
        return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }

    if (!validator.isStrongPassword(req.body.password, {
            minLength: 8,
            minLowercase: 1,    
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })) {
        return res.status(400).json({ success: false, error: 'Password is not strong enough. It should contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol.' });
    }

    if (!validator.isLength(req.body.name, { min: 3 })) {
        return res.status(400).json({ success: false, error: 'Invalid name' });
    }

    

  

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    if(!roles.includes(req.body.role)){
        return res.status(400).json({ success: false, error: 'Role is not valid' });
    }



    try {
        // Save user to the database
        const user = new User(req.body);

        // Save the user to the database
        const UserInfo = await user.save();

        const token = jwt.sign({ id: UserInfo._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true });

        res.json({ success: true, msg: "Sign up successfully", UserInfo });
    } catch (error) {
        console.error('Signup error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }



});

router.post('/signin', async(req, res) => {

    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!validator.isLength(req.body.password, { min: 8 })) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    try {

        // Find the user by email   
        const user = await User.findOne({ email: req.body.email });

        // Check if user exists
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate and return a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true });
        res.json({ success: true, user });

    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({ error: error.message });
    }

});

router.post("/logout", async(req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.send("Logout Successful!!");
});




module.exports = router;