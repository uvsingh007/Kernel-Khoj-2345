const jwt = require('jsonwebtoken');
//const { redis } = require('../controller/redis.controller');

const auth = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.status(401).json({ msg: 'No token provided' });
        }

        const decoded = jwt.verify(token, 'namrata');
        if (!decoded) {
            return res.status(401).json({ msg: 'Invalid token' });
        }
        const redisToken = await redis.get(decoded.email);
        if (redisToken !== token) {
            return res.status(401).json({ msg: 'Token not found in Redis. Please login again.' });
        }

        next();
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports ={
    auth
}
