let jwt = require('jsonwebtoken');

let validateToken = (req, res, next) => {
    try {
    
        let token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Token missing" });

        let decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Verified token:", decodedToken);

        req.user = decodedToken;
        next();
    } catch (err) {
        console.log("JWT error:", err);
        res.status(401).json({ error: "Token expired or invalid! Please login again" });
    }
};

module.exports = validateToken;
