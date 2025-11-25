import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 50;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function calculateDerivedMetrics(patient, monitoring) {
    const vitals = monitoring.vitalSigns;

    let bmi = 25;
    if (patient.weight && patient.height) {
        const heightInMeters = patient.height / 100;
        bmi = patient.weight / (heightInMeters * heightInMeters);
    }

    const pulsePressure = vitals.bloodPressure.systolic - vitals.bloodPressure.diastolic;
    const map = vitals.bloodPressure.diastolic + (pulsePressure / 3);
    const hrv = 50;

    return { bmi, pulsePressure, map, hrv };
}

export async function getRiskPrediction(patient, monitoring) {
    return new Promise((resolve, reject) => {
        const derived = calculateDerivedMetrics(patient, monitoring);
        const vitals = monitoring.vitalSigns;

        const patientData = {
            'Heart Rate': vitals.heartRate || 0,
            'Respiratory Rate': vitals.respiratoryRate || 0,
            'Body Temperature': vitals.temperature || 0,
            'Oxygen Saturation': vitals.oxygenSaturation || 0,
            'Systolic Blood Pressure': vitals.bloodPressure.systolic || 0,
            'Diastolic Blood Pressure': vitals.bloodPressure.diastolic || 0,
            'Age': calculateAge(patient.dateOfBirth),
            'Derived_BMI': derived.bmi,
            'Derived_HRV': derived.hrv,
            'Derived_Pulse_Pressure': derived.pulsePressure,
            'Derived_MAP': derived.map
        };

        const scriptPath = path.join(__dirname, 'predict.py');
        const python = spawn('python3', [scriptPath, JSON.stringify(patientData)]);

        let dataString = '';
        let errorString = '';

        python.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        python.on('close', (code) => {
            if (code !== 0) {
                console.error('Python error:', errorString);
                reject(new Error('Prediction failed: ' + errorString));
            } else {
                try {
                    const result = JSON.parse(dataString);
                    resolve(result);
                } catch (err) {
                    console.error('Parse error:', dataString);
                    reject(new Error('Failed to parse prediction result'));
                }
            }
        });
    });
}