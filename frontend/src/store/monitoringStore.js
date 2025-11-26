import { create } from "zustand";

export const useMonitoringStore = create((set) => ({
    monitoringData: [],

    // Set monitoring data
    setMonitoringData: (data) => set({ monitoringData: data }),

    // Fetch all monitoring data
    fetchMonitoringData: async () => {
        const API_URL = import.meta.env.VITE_API_URL;
        const idToken = localStorage.getItem("idToken");

        try {
            const response = await fetch(`${API_URL}/monitoring/`, {
                headers: {
                    "Authorization": `Bearer ${idToken}`
                }
            });
            const data = await response.json();
            if (data.success) {
                set({ monitoringData: data.data });
            } else {
                console.error("Failed to fetch monitoring data:", data.message);
            }
        } catch (error) {
            console.error("Error fetching monitoring data:", error.message);
        }
    },

    // Fetch monitoring data by patient ID
    fetchMonitoringDataByPatientId: async (patientId) => {
        const API_URL = import.meta.env.VITE_API_URL;
        const idToken = localStorage.getItem("idToken");

        try {
            const response = await fetch(`${API_URL}/monitoring/${patientId}`, {
                headers: {
                    "Authorization": `Bearer ${idToken}`
                }
            });
            const data = await response.json();
            if (data.success) {
                set({ monitoringData: data.data });
            } else {
                console.error("Failed to fetch monitoring data:", data.message);
            }
        } catch (error) {
            console.error("Error fetching monitoring data by patient ID:", error.message);
        }
    },

    // Create monitoring data
    createMonitoringData: async (newData) => {
        const API_URL = import.meta.env.VITE_API_URL;
        const idToken = localStorage.getItem("idToken");

        try {
            const response = await fetch(`${API_URL}/monitoring/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify(newData),
            });
            const data = await response.json();
            if (data.success) {
                set((state) => ({ monitoringData: [...state.monitoringData, data.data] }));
                return { success: true, message: "Monitoring data created successfully" };
            }
            return { success: false, message: data.message };
        } catch (error) {
            console.error("Error creating monitoring data:", error.message);
            return { success: false, message: error.message };
        }
    },
}));