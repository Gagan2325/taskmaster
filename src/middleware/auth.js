var jwt = require('jsonwebtoken');
const User=require('../model/userSchema');

// Middleware to verify JWT token

async function verifyToken(req, res, next) {

    const token = req.cookies.token;

    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, async(err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        var userinfo = await User.findOne({_id: user.id}).select("-password");
        req.user = userinfo;
        next();
     
    });
}

module.exports = verifyToken;

// Import and use the middleware in your routes