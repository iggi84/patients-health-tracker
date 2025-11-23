// backend/routes/auth.route.js
import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const {
    COGNITO_DOMAIN,
    COGNITO_CLIENT_ID,
    COGNITO_REDIRECT_URI,
    COGNITO_LOGOUT_URI
} = process.env;

// Exchange authorization code for tokens
router.post("/token", async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, message: "Authorization code is required" });
    }

    try {
        const tokenUrl = `https://${COGNITO_DOMAIN}/oauth2/token`;

        const params = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: COGNITO_CLIENT_ID,
            redirect_uri: COGNITO_REDIRECT_URI,
            code: code
        });

        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Token exchange error:", data);
            return res.status(400).json({
                success: false,
                message: data.error_description || "Token exchange failed"
            });
        }

        // Return tokens to frontend
        res.json({
            success: true,
            data: {
                access_token: data.access_token,
                id_token: data.id_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
                token_type: data.token_type
            }
        });

    } catch (error) {
        console.error("Token exchange error:", error);
        res.status(500).json({ success: false, message: "Server error during token exchange" });
    }
});

// Get current user info (protected route)
router.get("/me", requireAuth, (req, res) => {
    const user = req.user;

    // Extract role from cognito:groups
    const groups = user["cognito:groups"] || [];
    let role = "Doctor"; // default role

    if (groups.includes("Admin")) {
        role = "Admin";
    } else if (groups.includes("Doctor")) {
        role = "Doctor";
    }

    res.json({
        success: true,
        data: {
            sub: user.sub,
            email: user.email || user.username,
            username: user.username || user["cognito:username"],
            role: role,
            groups: groups
        }
    });
});

// Get login URL
router.get("/login-url", (req, res) => {
    const loginUrl = `https://${COGNITO_DOMAIN}/login?client_id=${COGNITO_CLIENT_ID}&response_type=code&scope=openid+email+profile&redirect_uri=${encodeURIComponent(COGNITO_REDIRECT_URI)}`;

    res.json({
        success: true,
        data: { loginUrl }
    });
});

// Get logout URL
router.get("/logout-url", (req, res) => {
    const logoutUrl = `https://${COGNITO_DOMAIN}/logout?client_id=${COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent(COGNITO_LOGOUT_URI)}`;

    res.json({
        success: true,
        data: { logoutUrl }
    });
});

export default router;