const jwt = require('jsonwebtoken')

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

        next();
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports ={
    auth
}
