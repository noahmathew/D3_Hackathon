import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

import tensorflow as tf
from keras.models import Sequential
from keras.layers import Dense, LSTM, Dropout
TENSORFLOW_AVAILABLE = True

import json
import sys

class EDTriageOptimizer:
    def __init__(self):
        self.triage_model = None
        self.severity_model = None
        self.bed_availability_model = None
        self.label_encoders = {}
        self.load_and_train_models()
    
    def load_and_train_models(self):
        """Load triage data and train ML models"""
        try:
            # Load triage dataset
            df = pd.read_csv('../data/triage_dataset.csv')
            
            # Prepare features
            df['hour'] = pd.to_datetime(df['arrival_time']).dt.hour
            df['day_of_week'] = pd.to_datetime(df['arrival_time']).dt.dayofweek
            
            # Encode categorical variables
            self.label_encoders['condition'] = LabelEncoder()
            self.label_encoders['doctor_needed'] = LabelEncoder()
            
            df['condition_encoded'] = self.label_encoders['condition'].fit_transform(df['condition'])
            df['doctor_encoded'] = self.label_encoders['doctor_needed'].fit_transform(df['doctor_needed'])
            df['bed_available'] = df['bed_available'].astype(int)
            
            # Features for triage optimization
            features = ['hour', 'day_of_week', 'severity_score', 'condition_encoded', 'doctor_encoded']
            X = df[features]
            
            # Train severity prediction model (Random Forest)
            y_severity = df['severity_score']
            self.severity_model = RandomForestClassifier(n_estimators=100, random_state=42)
            self.severity_model.fit(X, y_severity)
            
            # Train bed availability prediction model (Neural Network or fallback)
            y_bed = df['bed_available']
            if TENSORFLOW_AVAILABLE:
                self.bed_availability_model = Sequential([
                    Dense(64, activation='relu', input_shape=(len(features),)),
                    Dropout(0.3),
                    Dense(32, activation='relu'),
                    Dropout(0.3),
                    Dense(1, activation='sigmoid')
                ])
                
                self.bed_availability_model.compile(
                    optimizer='adam',
                    loss='binary_crossentropy',
                    metrics=['accuracy']
                )
                
                X_train, X_test, y_train, y_test = train_test_split(X, y_bed, test_size=0.2, random_state=42)
                self.bed_availability_model.fit(X_train, y_train, epochs=50, batch_size=32, verbose=0)
                
                # Train triage queue optimization model (LSTM for time series)
                self.triage_model = Sequential([
                    LSTM(50, return_sequences=True, input_shape=(24, 5)),  # 24 hours, 5 features
                    LSTM(50),
                    Dense(25),
                    Dense(1, activation='sigmoid')  # Queue priority score
                ])
                
                self.triage_model.compile(
                    optimizer='adam',
                    loss='binary_crossentropy',
                    metrics=['accuracy']
                )
            else:
                # Fallback to RandomForest for bed availability
                self.bed_availability_model = RandomForestClassifier(n_estimators=100, random_state=42)
                self.bed_availability_model.fit(X, y_bed)
                self.triage_model = None
            
            print("✅ ED Triage models trained successfully", file=sys.stderr)
            
        except Exception as e:
            print(f"❌ Error training ED Triage models: {e}", file=sys.stderr)
    
    def optimize_triage_queue(self, current_patients, available_staff, bed_status):
        """Optimize triage queue assignments in real-time"""
        try:
            recommendations = []
            
            for patient in current_patients:
                # Prepare patient features
                hour = pd.to_datetime(patient.get('arrival_time', '12:00')).hour
                day_of_week = pd.to_datetime(patient.get('arrival_time', '12:00')).dayofweek
                condition = patient.get('condition', 'Fever')
                doctor_needed = patient.get('doctor_needed', 'General Practitioner')
                
                # Encode categorical variables
                condition_encoded = self.label_encoders['condition'].transform([condition])[0]
                doctor_encoded = self.label_encoders['doctor_needed'].transform([doctor_needed])[0]
                
                # Predict severity and bed availability
                features = np.array([[hour, day_of_week, patient.get('severity_score', 5), condition_encoded, doctor_encoded]])
                
                severity_pred = self.severity_model.predict(features)[0]
                if TENSORFLOW_AVAILABLE:
                    bed_prob = self.bed_availability_model.predict(features)[0][0]
                else:
                    bed_prob = self.bed_availability_model.predict_proba(features)[0][1]
                
                # Calculate priority score
                priority_score = (
                    severity_pred * 0.4 +  # Severity weight
                    (1 - bed_prob) * 0.3 +  # Bed availability weight
                    patient.get('severity_score', 5) * 0.3  # Current severity
                )
                
                recommendations.append({
                    'patient_id': patient.get('patient_id', 'Unknown'),
                    'priority_score': float(priority_score),
                    'recommended_doctor': doctor_needed,
                    'estimated_wait_time': max(0, priority_score * 15),  # Minutes
                    'bed_availability_probability': float(bed_prob),
                    'mortality_risk': 'High' if severity_pred > 8 else 'Medium' if severity_pred > 5 else 'Low'
                })
            
            # Sort by priority score (higher = more urgent)
            recommendations.sort(key=lambda x: x['priority_score'], reverse=True)
            
            return {
                'success': True,
                'optimized_queue': recommendations,
                'total_wait_time_reduction': sum([r['estimated_wait_time'] for r in recommendations]),
                'crowding_risk': 'Low' if len(current_patients) < 10 else 'Medium' if len(current_patients) < 20 else 'High'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'fallback_queue': current_patients
            }
    
    def predict_optimal_triage_assignment(self, patient_data):
        """Predict optimal triage assignment for a single patient"""
        try:
            hour = pd.to_datetime(patient_data.get('arrival_time', '12:00')).hour
            condition = patient_data.get('condition', 'Fever')
            doctor_needed = patient_data.get('doctor_needed', 'General Practitioner')
            
            condition_encoded = self.label_encoders['condition'].transform([condition])[0]
            doctor_encoded = self.label_encoders['doctor_needed'].transform([doctor_needed])[0]
            
            features = np.array([[hour, 0, patient_data.get('severity_score', 5), condition_encoded, doctor_encoded]])
            
            severity_pred = self.severity_model.predict(features)[0]
            if TENSORFLOW_AVAILABLE:
                bed_prob = self.bed_availability_model.predict(features)[0][0]
            else:
                bed_prob = self.bed_availability_model.predict_proba(features)[0][1]
            
            return {
                'success': True,
                'predicted_severity': int(severity_pred),
                'bed_availability_probability': float(bed_prob),
                'recommended_triage_level': 'Critical' if severity_pred > 8 else 'Urgent' if severity_pred > 5 else 'Non-urgent',
                'estimated_processing_time': max(5, severity_pred * 3)  # Minutes
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

if __name__ == "__main__":
    # Initialize and test the optimizer
    optimizer = EDTriageOptimizer()
    
    # Test data
    test_patients = [
        {
            'patient_id': 'P001',
            'arrival_time': '14:30',
            'severity_score': 8,
            'condition': 'Stroke',
            'doctor_needed': 'Cardiologist'
        },
        {
            'patient_id': 'P002', 
            'arrival_time': '14:35',
            'severity_score': 3,
            'condition': 'Fever',
            'doctor_needed': 'General Practitioner'
        }
    ]
    
    result = optimizer.optimize_triage_queue(test_patients, 5, {'icu': 2, 'general': 8})
    print(json.dumps(result, indent=2))
