import mongoose from "mongoose";

const monitoringSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    metrics: {
      heartRate: {
        type: Number,
        required: true,
        min: 40, // Assuming minimum heart rate for monitoring
        max: 200, // Assuming maximum heart rate for monitoring
      },
      oxygenSaturation: {
        type: Number,
        required: true,
        min: 70, // Minimum acceptable oxygen saturation
        max: 100, // Maximum oxygen saturation percentage
      },
      bloodPressure: {
        systolic: {
          type: Number,
          required: true,
          min: 10, // Minimum systolic value
          max: 250, // Maximum systolic value
        },
        diastolic: {
          type: Number,
          required: true,
          min: 10, // Minimum diastolic value
          max: 180, // Maximum diastolic value
        },
      },
      temperature: {
        type: Number,
        required: true,
        min: 35, // Minimum temperature in Celsius
        max: 42, // Maximum temperature in Celsius
      },
    },
    alertGenerated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alert", // Link to an alert if one is generated
    },
    monitoringTimestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Monitoring = mongoose.model("Monitoring", monitoringSchema);
export default Monitoring;
