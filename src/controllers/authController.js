const User = require('../models/User');

const generateToken = require('../utils/generateToken');

// Register New User
exports.register = async (req, res) => {
    const { userId, password } = req.body;

    try {
        const existingUser = await User.findOne({ userId });
        if (existingUser) {
            return res.status(400).json({ status: false, message: 'User already exists' });
        }
        const newUser = await User.create({ userId, password, isAdmin:true });
        res.status(201).json({ status: true, message: 'User registered successfully', userId: newUser.userId });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
};

// User Login
exports.login = async (req, res) => {
    const { userId, password } = req.body;
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        const isMatch = await user.comparePassword(password); 
        if (isMatch) {
            const token = generateToken(user);
            res.status(200).json({status:true, message: 'Login successful', token });
        } else {
            res.status(401).json({ status: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
};
