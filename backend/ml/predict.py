#!/usr/bin/env python3
"""
Risk Prediction Script

Loads the trained model and makes predictions on new patient data.
Can be called from command line or imported as a module.
"""

import joblib
import json
import numpy as np
import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def load_model():
    model_path = os.path.join(SCRIPT_DIR, 'risk_model.pkl')
    features_path = os.path.join(SCRIPT_DIR, 'features.json')
    metadata_path = os.path.join(SCRIPT_DIR, 'model_metadata.json')
    
    model = joblib.load(model_path)
    
    with open(features_path, 'r') as f:
        features_data = json.load(f)
        feature_names = features_data['features']
    
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    
    return model, feature_names, metadata


def prepare_features(patient_data, feature_names):
    features = []
    for feature_name in feature_names:
        if feature_name not in patient_data:
            raise ValueError(f"Missing required feature: {feature_name}")
        features.append(patient_data[feature_name])
    
    return np.array([features])


def identify_risk_factors(patient_data):
    risk_factors = []

    hr = patient_data.get('Heart Rate', 0)
    if hr > 100:
        risk_factors.append({
            'factor': 'Tachycardia',
            'value': f'{hr} bpm',
            'severity': 'high' if hr > 120 else 'moderate',
            'explanation': f'Elevated heart rate ({hr} bpm) indicates cardiac stress'
        })
    elif hr < 60 and hr > 0:
        risk_factors.append({
            'factor': 'Bradycardia',
            'value': f'{hr} bpm',
            'severity': 'high' if hr < 50 else 'moderate',
            'explanation': f'Low heart rate ({hr} bpm) may indicate heart block'
        })

    rr = patient_data.get('Respiratory Rate', 0)
    if rr > 20:
        risk_factors.append({
            'factor': 'Tachypnea',
            'value': f'{rr} breaths/min',
            'severity': 'high' if rr > 25 else 'moderate',
            'explanation': f'Elevated respiratory rate ({rr}) indicates respiratory distress'
        })

    temp = patient_data.get('Body Temperature', 0)
    if temp > 37.5:
        risk_factors.append({
            'factor': 'Fever',
            'value': f'{temp} C',
            'severity': 'high' if temp > 39 else 'moderate',
            'explanation': f'Elevated temperature ({temp}C) suggests infection'
        })
    elif temp < 36.5 and temp > 0:
        risk_factors.append({
            'factor': 'Hypothermia',
            'value': f'{temp} C',
            'severity': 'high' if temp < 35 else 'moderate',
            'explanation': f'Low temperature ({temp}C) indicates poor perfusion'
        })

    o2 = patient_data.get('Oxygen Saturation', 0)
    if o2 < 95 and o2 > 0:
        risk_factors.append({
            'factor': 'Hypoxemia',
            'value': f'{o2}%',
            'severity': 'critical' if o2 < 90 else 'high',
            'explanation': f'Low oxygen saturation ({o2}%) requires immediate attention'
        })

    sbp = patient_data.get('Systolic Blood Pressure', 0)
    dbp = patient_data.get('Diastolic Blood Pressure', 0)
    
    if sbp > 140:
        risk_factors.append({
            'factor': 'Hypertension',
            'value': f'{sbp}/{dbp} mmHg',
            'severity': 'critical' if sbp > 180 else 'moderate',
            'explanation': f'Elevated blood pressure ({sbp}/{dbp}) increases cardiovascular risk'
        })
    elif sbp < 90 and sbp > 0:
        risk_factors.append({
            'factor': 'Hypotension',
            'value': f'{sbp}/{dbp} mmHg',
            'severity': 'high' if sbp < 80 else 'moderate',
            'explanation': f'Low blood pressure ({sbp}/{dbp}) suggests shock or dehydration'
        })

    bmi = patient_data.get('Derived_BMI', 0)
    if bmi > 30:
        risk_factors.append({
            'factor': 'Obesity',
            'value': f'BMI {bmi}',
            'severity': 'high' if bmi > 40 else 'moderate',
            'explanation': f'Obesity (BMI {bmi}) increases risk for multiple conditions'
        })

    hrv = patient_data.get('Derived_HRV', 0)
    if hrv < 50 and hrv > 0:
        risk_factors.append({
            'factor': 'Low Heart Rate Variability',
            'value': f'{hrv} ms',
            'severity': 'high' if hrv < 20 else 'moderate',
            'explanation': f'Low HRV ({hrv} ms) indicates poor autonomic function'
        })

    map_val = patient_data.get('Derived_MAP', 0)
    if map_val > 110:
        risk_factors.append({
            'factor': 'Elevated Mean Arterial Pressure',
            'value': f'{map_val} mmHg',
            'severity': 'moderate',
            'explanation': f'High MAP ({map_val}) indicates hypertensive state'
        })
    elif map_val < 70 and map_val > 0:
        risk_factors.append({
            'factor': 'Low Mean Arterial Pressure',
            'value': f'{map_val} mmHg',
            'severity': 'high',
            'explanation': f'Low MAP ({map_val}) suggests inadequate organ perfusion'
        })
    
    return risk_factors


def predict(patient_data, return_dict=True):

    model, feature_names, metadata = load_model()
    X = prepare_features(patient_data, feature_names)

    prediction = model.predict(X)[0]
    probabilities = model.predict_proba(X)[0]
    confidence = probabilities.max()

    risk_mapping = metadata.get('risk_mapping', {})
    if risk_mapping:
        reverse_mapping = {v: k for k, v in risk_mapping.items()}
        risk_level = reverse_mapping.get(prediction, f"Category {prediction}")
    else:
        risk_level = f"Category {prediction}"

    risk_factors = identify_risk_factors(patient_data)
    
    result = {
        'riskLevel': risk_level,
        'confidence': float(confidence),
        'riskFactors': risk_factors,
        'probabilities': {
            reverse_mapping.get(i, f"Category {i}"): float(prob) 
            for i, prob in enumerate(probabilities)
        } if risk_mapping else {}
    }
    
    return result


def main():
    
    if len(sys.argv) > 1:
        try:
            patient_data = json.loads(sys.argv[1])
            result = predict(patient_data, return_dict=True)
            print(json.dumps(result))
        except Exception as e:
            error_result = {'error': str(e)}
            print(json.dumps(error_result))
            sys.exit(1)
    else:
        sample_patient = {
            'Heart Rate': 105,
            'Respiratory Rate': 24,
            'Body Temperature': 38.5,
            'Oxygen Saturation': 92,
            'Systolic Blood Pressure': 160,
            'Diastolic Blood Pressure': 95,
            'Age': 68,
            'Derived_BMI': 32,
            'Derived_HRV': 25,
            'Derived_Pulse_Pressure': 65,
            'Derived_MAP': 116
        }
        
        print("Testing model with sample patient data")
        print("=" * 60)
        
        result = predict(sample_patient, return_dict=True)
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
