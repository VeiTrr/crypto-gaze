const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const path = require('path');

require('dotenv').config({path: path.resolve(__dirname, '../.env')});

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;


const router = express.Router();

const generateTokens = async (user) => {

    const accessToken = jwt.sign({id: user._id, username: user.username}, JWT_SECRET, {expiresIn: '1d'});
    const refreshToken = jwt.sign({id: user._id, username: user.username}, REFRESH_SECRET, {expiresIn: '30d'});

    await RefreshToken.findOneAndDelete({userId: user._id});

    const refreshTokenDocument = new RefreshToken({token: refreshToken, userId: user._id});
    await refreshTokenDocument.save();

    return {accessToken, refreshToken};
};

router.post('/register', async (req, res) => {
    const {username, password} = req.body;
    try {
        const existingUser = await User.findOne({username});
        if (existingUser) {
            return res.status(400).json({message: 'Username already exists'});
        }

        const newUser = new User({username, password: password});
        await newUser.save();

        const tokens = await generateTokens(newUser);
        res.status(201).json({message: 'User registered successfully', ...tokens});
    } catch (error) {
        res.status(500).json({message: 'Error registering user', error});
    }
});

router.post('/login', async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await User.findOne({username});
        if (user) {
            if (user.matchPassword(password)) {
                const tokens = await generateTokens(user);
                res.status(200).json({message: 'Login successful', ...tokens});
            } else {
                res.status(401).json({message: 'Password incorrect'});
            }
        } else {
            res.status(401).json({message: 'Invalid credentials'});
        }
    } catch (error) {
        res.status(500).json({message: 'Error logging in', error});
    }
});

router.post('/refresh', async (req, res) => {
    const {refreshToken} = req.body;
    if (!refreshToken) {
        return res.status(401).json({message: 'No refresh token provided'});
    }

    try {
        const refreshTokenDocument = await RefreshToken.findOne({token: refreshToken});
        if (!refreshTokenDocument) {
            return res.status(403).json({message: 'Invalid refresh token'});
        }

        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const tokens = await generateTokens({_id: decoded.id, username: decoded.username});

        await RefreshToken.findOneAndDelete({token: refreshToken});

        res.status(200).json(tokens);
    } catch (error) {
        res.status(403).json({message: 'Invalid refresh token', error});
    }
});

router.get('/user', async (req, res) => {
    const authHeader = req.headers.authorization;
    let user = null;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message: 'No token provided'});
    }

    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(403).json({message: 'Invalid token', error});
    }
});

router.put('/user/avatar', async (req, res) => {
    const {avatar} = req.body;
    const authHeader = req.headers.authorization;
    let user = null;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message: 'No token provided'});
    }

    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        user.avatar = avatar;
        await user.save();
        res.status(200).json({message: 'Avatar updated successfully'});
    } catch (error) {
        res.status(500).json({message: 'Error updating avatar', error});
    }
});

router.put('/user/favorites', async (req, res) => {
    const {favorites} = req.body;
    const authHeader = req.headers.authorization;
    let user = null;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message: 'No token provided'});
    }

    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        user.favorites = favorites;
        await user.save();
        res.status(200).json({message: 'Favorites updated successfully'});
    } catch (error) {
        res.status(500).json({message: 'Error updating favorites', error});
        console.log(error);
    }
});

router.get('/user/details', async (req, res) => {
    const {username} = req.body;
    try {
        const user = await User.findOne({username}).select('avatar favorites');
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: 'Error fetching user details', error});
    }
});

module.exports = router;
