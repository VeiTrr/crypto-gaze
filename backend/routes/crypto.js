const express = require('express');
const axios = require('axios');
const router = express.Router();
const API_URL = process.env.API_URL.replace(/\/$/, ''); // Ensure no trailing slash
const API_KEY = process.env.API_KEY;

router.all('/*', async (req, res) => {
    const { path, method, body, query } = req;
    const apiPath = path.replace(/^\//, '');
    const requestUrl = `${API_URL}/${apiPath}`;
    const headers = { 'X-CMC_PRO_API_KEY': API_KEY };

    const axiosConfig = {
        method,
        url: requestUrl,
        headers
    };


    if (Object.keys(body).length > 0) {
        axiosConfig.data = body;
    }
    if (Object.keys(query).length > 0) {
        axiosConfig.params = query;
    }

    try {
        const response = await axios(axiosConfig);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('\nError during request forwarding:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error forwarding request', error: error.response ? error.response.data : error.message });
    }
});

module.exports = router;