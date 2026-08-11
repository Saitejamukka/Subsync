import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'subsync_secret_jwt_key_2026';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Sign in required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token. Please sign in again.' });
    }
    req.user = user; // { id, email, name }
    next();
  });
};
