import mongoose from "mongoose";

const monitoringSchema = mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",

    },
    vitalSigns: {
      heartRate: {
        type: Number,

        default: 0,// Current heart rate value
      },
      respiratoryRate: {
            type: Number,
            default: 0,
        },
      oxygenSaturation: {
        type: Number,

        default: 0,
      },
      bloodPressure: {
        systolic: {
          type: Number,

          default: 0,
        },
        diastolic: {
          type: Number,

          default: 0,
        },
      },
      temperature: {
        type: Number,

        default: 0.0,
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
