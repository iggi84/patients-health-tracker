import mongoose from "mongoose";

const alertSchema = mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: [true, "Patient ID is required"],
    validate: {
      validator: mongoose.isValidObjectId,
      message: "Invalid Patient ID"
    }
  },
  alertType: {
    type: String,
    required: [true, "Alert type is required"],
    enum: {
      values: ["Critical", "Warning", "Info"],
      message: "Alert type must be 'Critical', 'Warning', or 'Info'"
    }
  },
  message: {
    type: String,
    required: [true, "Alert message is required"],
    trim: true,
    minlength: [10, "Alert message must be at least 10 characters long"],
    maxlength: [200, "Alert message must be less than 200 characters"]
  },
  isAcknowledged: {
    type: Boolean,
    default: false
  },
  triggeredAt: {
    type: Date,
    required: [true, "Triggered time is required"],
    default: Date.now
  }
}, {
  timestamps: true
});

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
