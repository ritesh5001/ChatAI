const User = require('../models/user.model');
const jwt = require('jsonwebtoken');


async function authUser(req, res, next) {
    // Support both cookie (web) and Authorization header (mobile)
    const token = req.cookies?.token || 
                  (req.headers.authorization?.startsWith('Bearer ') 
                    ? req.headers.authorization.slice(7) 
                    : null);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Unathorized' });
        }

        req.user = user;
        next();
    }
    catch {
        res.status(401).json({ message: 'Unathorized' })
    }
}

module.exports = {
    authUser
}