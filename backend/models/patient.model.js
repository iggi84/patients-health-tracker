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
  dateOfBirth: {
      type: Date,
      required: false,
      default: null
    },
  weight: {
      type: Number,
      required: false,
      default: null,
      min: [0, "Weight must be positive"]
    },
  height: {
      type: Number,
      required: false,
      default: null,
      min: [0, "Height must be positive"]
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
      trim: true
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
    type: String, // Changed from ObjectId to String
    trim: true,
    default: null, // Optional field
  }
}, {
  timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
