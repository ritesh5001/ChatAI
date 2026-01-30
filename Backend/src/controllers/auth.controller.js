const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cookie options for cross-origin
const cookieOptions = {
    httpOnly: true,
    secure: true, // Required for sameSite: 'none'
    sameSite: 'none', // Required for cross-origin cookies
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

async function registerUser(req, res) {
    try {
        const { fullName: { firstName, lastName }, email, password } = req.body;

        const isUserAlreadyExist = await User.findOne({ where: { email } });

        if (isUserAlreadyExist) {
            return res.status(400).json({ message: "user already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashPassword
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        res.cookie("token", token, cookieOptions);

        res.status(201).json({
            message: "User Registered Succecfully",
            user: {
                email: user.email,
                _id: user.id,
                fullName: {
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            }
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: "invalid email and password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            message: "user logged in succesfully",
            user: {
                email: user.email,
                _id: user.id,
                fullName: {
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function logoutUser(req, res) {
    res.clearCookie("token", cookieOptions);
    res.status(200).json({ message: "Logged out successfully" });
}

module.exports = {
    registerUser, loginUser, logoutUser
}