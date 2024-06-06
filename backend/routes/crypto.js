const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

router.get('/cryptocurrency/quotes/latest', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/v1/cryptocurrency/quotes/latest`, {
            params: req.query,
            headers: {
                'X-CMC_PRO_API_KEY': API_KEY
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cryptocurrency data', error });
    }
});

router.get('/cryptocurrency/info', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/v1/cryptocurrency/info`, {
            params: req.query,
            headers: {
                'X-CMC_PRO_API_KEY': API_KEY
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cryptocurrency info', error });
    }
});

module.exports = router;
