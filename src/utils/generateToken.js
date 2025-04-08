const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, userId: user.userId },
        process.env.JWT_SECRET,
        { expiresIn: '90d' }
    );
};

module.exports = generateToken;
