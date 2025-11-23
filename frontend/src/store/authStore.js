// frontend/src/store/authStore.js
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = create((set, get) => ({
    user: null,
    accessToken: null,
    idToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    // Initialize auth state from localStorage
    initAuth: async () => {
        const accessToken = localStorage.getItem("accessToken");
        const idToken = localStorage.getItem("idToken");

        if (accessToken && idToken) {
            set({ accessToken, idToken });
            // Verify token and get user info
            await get().fetchUser();
        } else {
            set({ isLoading: false });
        }
    },

    // Exchange code for tokens
    exchangeCodeForTokens: async (code) => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`${API_URL}/auth/token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            });

            const data = await response.json();

            if (!data.success) {
                // Don't log "invalid_grant" errors (code already used/expired)
                if (!data.message?.includes("invalid_grant")) {
                    console.error("Token exchange error:", data.message);
                }
                throw new Error(data.message || "Token exchange failed");
            }

            const { access_token, id_token, refresh_token } = data.data;

            // Store tokens
            localStorage.setItem("accessToken", access_token);
            localStorage.setItem("idToken", id_token);
            if (refresh_token) {
                localStorage.setItem("refreshToken", refresh_token);
            }

            set({
                accessToken: access_token,
                idToken: id_token,
                error: null
            });

            // Fetch user info
            await get().fetchUser();

            return { success: true };

        } catch (error) {
            // Only set error state for non-invalid_grant errors
            if (!error.message?.includes("invalid_grant")) {
                console.error("Token exchange error:", error);
                set({ isLoading: false, error: error.message });
            } else {
                set({ isLoading: false });
            }
            return { success: false, message: error.message };
        }
    },

    // Fetch current user info
    fetchUser: async () => {
        // Use ID token for /auth/me (it has user info + groups)
        const idToken = get().idToken || localStorage.getItem("idToken");

        if (!idToken) {
            set({ isLoading: false, isAuthenticated: false });
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    "Authorization": `Bearer ${idToken}`
                }
            });

            const data = await response.json();

            if (data.success) {
                set({
                    user: data.data,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });
            } else {
                // Token invalid - clear everything
                get().logout();
            }

        } catch (error) {
            console.error("Fetch user error:", error);
            get().logout();
        }
    },

    // Get login URL
    getLoginUrl: () => {
        const domain = "opto-health.auth.ap-southeast-2.amazoncognito.com";
        const clientId = "5iq87lifnfavppb1mcstdfn2vt";
        const redirectUri = encodeURIComponent("http://localhost:5173/callback");
        const scopes = "openid+email+profile";

        return `https://${domain}/login?client_id=${clientId}&response_type=code&scope=${scopes}&redirect_uri=${redirectUri}`;
    },

    // Logout
    logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("idToken");
        localStorage.removeItem("refreshToken");

        set({
            user: null,
            accessToken: null,
            idToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
        });
    },

    // Get logout URL and clear local state
    performLogout: () => {
        get().logout();

        const domain = "opto-health.auth.ap-southeast-2.amazoncognito.com";
        const clientId = "5iq87lifnfavppb1mcstdfn2vt";
        const logoutUri = encodeURIComponent("http://localhost:5173/");

        window.location.href = `https://${domain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
    },

    // Check if user has a specific role
    hasRole: (role) => {
        const user = get().user;
        if (!user) return false;
        return user.role === role || (user.groups && user.groups.includes(role));
    },

    // Check if user is admin
    isAdmin: () => get().hasRole("Admin"),

    // Check if user is doctor
    isDoctor: () => get().hasRole("Doctor") || get().hasRole("Admin")
}));