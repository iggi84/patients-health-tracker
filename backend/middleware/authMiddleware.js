// backend/middleware/authMiddleware.js
import { verifyCognitoIdToken } from './cognitoVerifier.js';

export async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Missing or invalid Authorization header' });
        }

        const token = authHeader.replace('Bearer ', '').trim();

        // Use ID token for authentication (contains user info + groups)
        const decoded = await verifyCognitoIdToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Auth error:', err);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}