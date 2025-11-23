// frontend/src/store/userStore.js
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useUserStore = create((set) => ({
    users: [],
    groups: [],
    isLoading: false,

    // Fetch all users
    fetchUsers: async () => {
        set({ isLoading: true });
        const idToken = localStorage.getItem("idToken");

        try {
            const response = await fetch(`${API_URL}/users/`, {
                headers: {
                    "Authorization": `Bearer ${idToken}`
                }
            });

            const data = await response.json();

            if (data.success) {
                set({ users: data.data, isLoading: false });
            } else {
                console.error("Failed to fetch users:", data.message);
                set({ isLoading: false });
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            set({ isLoading: false });
        }
    },

    // Fetch available groups
    fetchGroups: async () => {
        const idToken = localStorage.getItem("idToken");

        try {
            const response = await fetch(`${API_URL}/users/groups`, {
                headers: {
                    "Authorization": `Bearer ${idToken}`
                }
            });

            const data = await response.json();

            if (data.success) {
                set({ groups: data.data });
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    },

    // Create new user
    createUser: async (userData) => {
        const idToken = localStorage.getItem("idToken");

        try {
            const response = await fetch(`${API_URL}/users/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                return { success: true, message: "User created successfully" };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Error creating user:", error);
            return { success: false, message: error.message };
        }
    },

    // Update user role
    updateUser: async (username, updateData) => {
        const idToken = localStorage.getItem("idToken");

        try {
            const response = await fetch(`${API_URL}/users/${username}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (data.success) {
                return { success: true, message: "User updated successfully" };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Error updating user:", error);
            return { success: false, message: error.message };
        }
    },

    // Delete user
    deleteUser: async (username) => {
        const idToken = localStorage.getItem("idToken");

        try {
            const response = await fetch(`${API_URL}/users/${username}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${idToken}`
                }
            });

            const data = await response.json();

            if (data.success) {
                set((state) => ({
                    users: state.users.filter((user) => user.username !== username)
                }));
                return { success: true, message: "User deleted successfully" };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            return { success: false, message: error.message };
        }
    },

    // Reset user password
    resetPassword: async (username, newPassword) => {
        const idToken = localStorage.getItem("idToken");

        try {
            const response = await fetch(`${API_URL}/users/${username}/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify({ newPassword })
            });

            const data = await response.json();

            if (data.success) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            return { success: false, message: error.message };
        }
    }
}));