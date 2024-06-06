const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const cryptoRoutes = require('./routes/crypto');
const config = require('config');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cryptogaze';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);

app.get('/api/routes', (req, res) => {
    let routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) {
            routes.push({
                method: Object.keys(middleware.route.methods)[0].toUpperCase(),
                path: middleware.route.path
            });
        } else if (middleware.name === 'router') {
            const baseRoute = middleware.regexp.toString().replace('/^\\', '').replace('\\/?(?=\\/|$)/i', '').replace(/\\/g, '');
            middleware.handle.stack.forEach(handler => {
                if (handler.route) {
                    routes.push({
                        method: Object.keys(handler.route.methods)[0].toUpperCase(),
                        path: baseRoute + handler.route.path
                    });
                }
            });
        }
    });
    res.json({ routes });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Resource not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
