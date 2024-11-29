import mongoose from "mongoose";

const patientSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Patient name is required"],
    trim: true,
    minlength: [2, "Patient name must be at least 3 characters long"],
    maxlength: [100, "Patient name must be less than 100 characters"]
  },
  age: {
    type: Number,
    required: [true, "Patient age is required"],
    min: [0, "Age must be a positive number"],
    max: [150, "Age must be less than or equal to 150"]
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/.+@.+\..+/, "Please enter a valid email address"]
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"]
    }
  },
  medicalHistory: {
    type: Array,
    default: [],
    validate: {
      validator: function (v) {
        return Array.isArray(v);
      },
      message: "Medical history must be an array"
    }
  },
  assignedDeviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
    validate: {
      validator: mongoose.isValidObjectId,
      message: "Invalid device ID"
    }
  }
}, {
  timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
