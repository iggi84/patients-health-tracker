// backend/middleware/cognitoVerifier.js
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import dotenv from "dotenv";

dotenv.config();

const {
    COGNITO_CLIENT_ID,
    COGNITO_ISSUER,
    COGNITO_JWKS_URI
} = process.env;

let jwksCache = null;
let jwksCacheAt = 0;
const JWKS_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getJwks() {
    const now = Date.now();

    // Use cached keys if still fresh
    if (jwksCache && now - jwksCacheAt < JWKS_TTL_MS) {
        return jwksCache;
    }

    const res = await fetch(COGNITO_JWKS_URI);
    if (!res.ok) {
        throw new Error(`Failed to fetch JWKS: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.keys) {
        throw new Error("JWKS payload has no 'keys' field");
    }

    jwksCache = data.keys;
    jwksCacheAt = now;
    return jwksCache;
}

/**
 * Verify ID token (contains user info like email, groups)
 * Use this for authentication and getting user details
 */
export async function verifyCognitoIdToken(token) {
    if (!token) {
        throw new Error("No token provided");
    }

    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
        throw new Error("Invalid JWT header");
    }

    const kid = decodedHeader.header.kid;
    const keys = await getJwks();
    const jwk = keys.find((k) => k.kid === kid);
    if (!jwk) {
        throw new Error("Matching JWK not found for kid");
    }

    const pem = jwkToPem(jwk);

    // ID token has "aud" (audience) = client_id
    const verified = jwt.verify(token, pem, {
        algorithms: ["RS256"],
        issuer: COGNITO_ISSUER,
        audience: COGNITO_CLIENT_ID
    });

    return verified;
}

/**
 * Verify access token (for API authorization)
 * Use this when you need to verify API access
 */
export async function verifyCognitoAccessToken(token) {
    if (!token) {
        throw new Error("No token provided");
    }

    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
        throw new Error("Invalid JWT header");
    }

    const kid = decodedHeader.header.kid;
    const keys = await getJwks();
    const jwk = keys.find((k) => k.kid === kid);
    if (!jwk) {
        throw new Error("Matching JWK not found for kid");
    }

    const pem = jwkToPem(jwk);

    // Access token doesn't have "aud", verify issuer only
    const verified = jwt.verify(token, pem, {
        algorithms: ["RS256"],
        issuer: COGNITO_ISSUER
    });

    // Verify client_id in payload manually
    if (verified.client_id !== COGNITO_CLIENT_ID) {
        throw new Error("Invalid client_id in access token");
    }

    return verified;
}

/**
 * Role guard helper to plug into routes after requireAuth
 * Example:
 *   router.get('/admin', requireAuth, requireRole('Admin'), handler)
 */
export function requireRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthenticated" });
        }

        const groups = req.user["cognito:groups"] || [];
        const customRole = req.user["custom:role"];

        const hasRole =
            (Array.isArray(groups) && groups.includes(requiredRole)) ||
            customRole === requiredRole;

        if (!hasRole) {
            return res.status(403).json({ message: "Forbidden: insufficient role" });
        }

        next();
    };
}
