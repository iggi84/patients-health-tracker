import { create } from "zustand";

export const usePatientStore = create((set) => ({
  patients: [],

  // Set patients state
  setPatients: (patients) => set({ patients }),

  // Fetch patients from the backend
  fetchPatients: async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${API_URL}/patients/`);
      const data = await response.json();
      if (data.success) {
        set({ patients: data.data });
      } else {
        console.error("Failed to fetch patients:", data.message);
      }
    } catch (error) {
      console.error("Error fetching patients:", error.message);
    }
  },

  // Create a new patient
  createPatient: async (newPatient) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const fullUrl = `${API_URL}/patient/`; // Combine base URL with endpoint
    console.log("Creating patients from URL:", fullUrl);

    if (!newPatient.name || !newPatient.age) {
      return { success: false, message: "Name and age are required." };
    }

    // Prepare request payload to match backend structure
    const payload = {
      name: newPatient.name,
      age: newPatient.age,
      contactInfo: {
        email: newPatient.email || "", // Default to empty string if not provided
        phone: newPatient.phone || "", // Default to empty string if not provided
      },
      medicalHistory: newPatient.medicalHistory || [], // Default to empty array
      assignedDeviceId: newPatient.assignedDeviceId || null, // Default to null
    };

    try {
      const response = await fetch(`${API_URL}/patient/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        set((state) => ({ patients: [...state.patients, data.data] }));
        return { success: true, message: "Patient created successfully" };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error("Error creating patient:", error.message);
      return { success: false, message: error.message };
    }
  },

  // Delete a patient
  deletePatient: async (patientId) => {
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${API_URL}/patient/${patientId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        set((state) => ({
          patients: state.patients.filter((patient) => patient._id !== patientId),
        }));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error("Error deleting patient:", error.message);
      return { success: false, message: "Server error" };
    }
  },

  // Update an existing patient
  updatePatient: async (patientId, updatedPatient) => {
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${API_URL}/patient/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPatient),
      });
      const data = await response.json();
      if (data.success) {
        set((state) => ({
          patients: state.patients.map((patient) =>
            patient._id === patientId ? data.data : patient
          ),
        }));
        return { success: true, message: "Patient updated successfully" };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error("Error updating patient:", error.message);
      return { success: false, message: "Server error" };
    }
  },
}));
