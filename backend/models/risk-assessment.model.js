import mongoose from "mongoose";

const riskAssessmentSchema = mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
        index: true
    },
    riskLevel: {
        type: String,
        required: true,
        enum: ["Low Risk", "High Risk"]
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    riskFactors: {
        type: Array,
        default: []
    },
    probabilities: {
        type: Object,
        required: true
    },
    // Snapshot of vital signs at time of assessment (for audit trail)
    vitalSignsSnapshot: {
        heartRate: Number,
        respiratoryRate: Number,
        bloodPressure: {
            systolic: Number,
            diastolic: Number
        },
        oxygenSaturation: Number,
        temperature: Number
    },
    // Patient metadata at time of assessment
    patientMetadata: {
        age: Number,
        weight: Number,
        height: Number,
        bmi: Number
    },
    assessmentTimestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
riskAssessmentSchema.index({ patientId: 1, assessmentTimestamp: -1 });

const RiskAssessment = mongoose.model('RiskAssessment', riskAssessmentSchema);
export default RiskAssessment;