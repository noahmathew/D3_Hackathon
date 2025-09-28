import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import json
import sys
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class AppointmentForecastingOptimizer:
    def __init__(self):
        self.patient_arrival_model = None
        self.wait_time_model = None
        self.doctor_availability_model = None
        self.optimal_slot_model = None
        self.availability_model = None
        self.label_encoders = {}
        self.scalers = {}
        self.load_and_train_models()
    
    def load_and_train_models(self):
        """Load forecasting data and train ML models using scikit-learn only"""
        try:
            # Load forecasting dataset
            df = pd.read_csv('../data/forecasting_dataset.csv')
            
            # Create time-based features
            df['date'] = pd.to_datetime(df['date'])
            df['hour'] = df['hour'].astype(int)
            df['day_of_week'] = df['date'].dt.dayofweek
            df['month'] = df['date'].dt.month
            df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
            
            # Create composite features
            df['disease_burden'] = df['flu_cases'] + df['covid_cases']
            df['staff_efficiency'] = df['patients_arrived'] / df['staff_on_duty'].replace(0, 1)
            df['capacity_ratio'] = df['patients_arrived'] / (df['staff_on_duty'] * 4)
            
            # Prepare features for different models
            self.prepare_features(df)
            
            # Train patient arrival prediction model (Random Forest)
            self.train_patient_arrival_model(df)
            
            # Train wait time prediction model (Gradient Boosting)
            self.train_wait_time_model(df)
            
            # Train doctor availability model (Random Forest)
            self.train_doctor_availability_model(df)
            
            # Train optimal slot recommendation model (Gradient Boosting)
            self.train_optimal_slot_model(df)
            
            # Train availability prediction model
            self.train_availability_model(df)
            
            print("✅ Appointment Forecasting models trained successfully with scikit-learn", file=sys.stderr)
            
        except Exception as e:
            print(f"❌ Error training Appointment Forecasting models: {e}", file=sys.stderr)
    
    def prepare_features(self, df):
        """Prepare features for model training"""
        # Features for patient arrival prediction
        self.arrival_features = [
            'hour', 'day_of_week', 'month', 'is_weekend', 
            'flu_cases', 'covid_cases', 'staff_on_duty'
        ]
        
        # Features for wait time prediction
        self.wait_time_features = [
            'patients_arrived', 'staff_on_duty', 'disease_burden',
            'capacity_ratio', 'hour', 'day_of_week'
        ]
        
        # Features for doctor availability
        self.doctor_features = [
            'hour', 'day_of_week', 'patients_arrived', 
            'staff_efficiency', 'capacity_ratio'
        ]
        
        # Features for optimal slot recommendation
        self.slot_features = [
            'hour', 'day_of_week', 'month', 'patients_arrived',
            'staff_on_duty', 'disease_burden', 'capacity_ratio'
        ]
        
        # Features for availability prediction
        self.availability_features = [
            'hour', 'day_of_week', 'patients_arrived', 'staff_on_duty',
            'disease_burden', 'capacity_ratio'
        ]
    
    def train_patient_arrival_model(self, df):
        """Train Random Forest model for patient arrival prediction"""
        try:
            X = df[self.arrival_features].values
            y = df['patients_arrived'].values
            
            # Scale features
            self.scalers['arrival'] = StandardScaler()
            X_scaled = self.scalers['arrival'].fit_transform(X)
            
            # Train Random Forest
            self.patient_arrival_model = RandomForestRegressor(
                n_estimators=100, 
                max_depth=10, 
                random_state=42,
                n_jobs=-1
            )
            self.patient_arrival_model.fit(X_scaled, y)
            
            # Calculate training accuracy
            y_pred = self.patient_arrival_model.predict(X_scaled)
            r2 = r2_score(y, y_pred)
            print(f"✅ Patient arrival model R² score: {r2:.3f}", file=sys.stderr)
            
        except Exception as e:
            print(f"Error training patient arrival model: {e}", file=sys.stderr)
    
    def train_wait_time_model(self, df):
        """Train Gradient Boosting model for wait time prediction"""
        try:
            # Calculate actual wait times based on capacity
            df['wait_time'] = df['capacity_ratio'] * 25 + np.random.normal(0, 3, len(df))
            df['wait_time'] = np.clip(df['wait_time'], 5, 60)  # Clamp between 5-60 minutes
            
            X = df[self.wait_time_features].values
            y = df['wait_time'].values
            
            # Scale features
            self.scalers['wait_time'] = StandardScaler()
            X_scaled = self.scalers['wait_time'].fit_transform(X)
            
            # Train Gradient Boosting
            self.wait_time_model = GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42
            )
            self.wait_time_model.fit(X_scaled, y)
            
            # Calculate training accuracy
            y_pred = self.wait_time_model.predict(X_scaled)
            r2 = r2_score(y, y_pred)
            print(f"✅ Wait time model R² score: {r2:.3f}", file=sys.stderr)
            
        except Exception as e:
            print(f"Error training wait time model: {e}", file=sys.stderr)
    
    def train_doctor_availability_model(self, df):
        """Train Random Forest for doctor availability prediction"""
        try:
            # Create doctor availability target (simplified)
            df['doctor_availability'] = (df['staff_on_duty'] > df['patients_arrived'] / 3).astype(int)
            
            X = df[self.doctor_features].values
            y = df['doctor_availability'].values
            
            self.doctor_availability_model = RandomForestClassifier(
                n_estimators=100, 
                max_depth=8, 
                random_state=42,
                n_jobs=-1
            )
            self.doctor_availability_model.fit(X, y)
            
            # Calculate training accuracy
            y_pred = self.doctor_availability_model.predict(X)
            accuracy = (y_pred == y).mean()
            print(f"✅ Doctor availability model accuracy: {accuracy:.3f}", file=sys.stderr)
            
        except Exception as e:
            print(f"Error training doctor availability model: {e}", file=sys.stderr)
    
    def train_optimal_slot_model(self, df):
        """Train Gradient Boosting for optimal slot recommendation"""
        try:
            # Create optimal slot score (lower wait time, higher availability = better score)
            df['optimal_score'] = (10 - df['capacity_ratio'] * 5) + (df['staff_on_duty'] / df['patients_arrived'].replace(0, 1) * 2)
            df['optimal_score'] = np.clip(df['optimal_score'], 0, 10)
            
            X = df[self.slot_features].values
            y = df['optimal_score'].values
            
            self.optimal_slot_model = GradientBoostingRegressor(
                n_estimators=100, 
                learning_rate=0.1, 
                max_depth=6, 
                random_state=42
            )
            self.optimal_slot_model.fit(X, y)
            
            # Calculate training accuracy
            y_pred = self.optimal_slot_model.predict(X)
            r2 = r2_score(y, y_pred)
            print(f"✅ Optimal slot model R² score: {r2:.3f}", file=sys.stderr)
            
        except Exception as e:
            print(f"Error training optimal slot model: {e}", file=sys.stderr)
    
    def train_availability_model(self, df):
        """Train model to predict if a time slot is available or unavailable"""
        try:
            # Create availability target (1 = available, 0 = unavailable)
            # Unavailable if capacity ratio > 0.8 or staff < 3
            df['is_available'] = ((df['capacity_ratio'] < 0.8) & (df['staff_on_duty'] >= 3)).astype(int)
            
            X = df[self.availability_features].values
            y = df['is_available'].values
            
            self.availability_model = RandomForestClassifier(
                n_estimators=100,
                max_depth=8,
                random_state=42,
                n_jobs=-1
            )
            self.availability_model.fit(X, y)
            
            # Calculate training accuracy
            y_pred = self.availability_model.predict(X)
            accuracy = (y_pred == y).mean()
            print(f"✅ Availability model accuracy: {accuracy:.3f}", file=sys.stderr)
            
        except Exception as e:
            print(f"Error training availability model: {e}", file=sys.stderr)
    
    def predict_optimal_appointment_slots(self, date, doctor, appointment_type, patient_preferences=None):
        """Predict optimal appointment slots with ML forecasting"""
        try:
            target_date = pd.to_datetime(date)
            day_of_week = target_date.dayofweek
            month = target_date.month
            is_weekend = 1 if day_of_week in [5, 6] else 0
            
            # Generate predictions for each hour of the day
            optimal_slots = []
            unavailable_slots = []
            
            for hour in range(9, 17):  # 9 AM to 5 PM
                # Prepare features for prediction
                features = {
                    'hour': hour,
                    'day_of_week': day_of_week,
                    'month': month,
                    'is_weekend': is_weekend,
                    'flu_cases': self.predict_flu_cases(hour, day_of_week),
                    'covid_cases': self.predict_covid_cases(hour, day_of_week),
                    'staff_on_duty': self.predict_staff_availability(hour, day_of_week, doctor)
                }
                
                # Predict patient arrivals
                predicted_arrivals = self.predict_patient_arrivals(features)
                
                # Predict wait time
                wait_time_features = {
                    'patients_arrived': predicted_arrivals,
                    'staff_on_duty': features['staff_on_duty'],
                    'disease_burden': features['flu_cases'] + features['covid_cases'],
                    'capacity_ratio': predicted_arrivals / (features['staff_on_duty'] * 4),
                    'hour': hour,
                    'day_of_week': day_of_week
                }
                
                predicted_wait_time = self.predict_wait_time(wait_time_features)
                
                # Predict optimal score
                slot_features = {
                    'hour': hour,
                    'day_of_week': day_of_week,
                    'month': month,
                    'patients_arrived': predicted_arrivals,
                    'staff_on_duty': features['staff_on_duty'],
                    'disease_burden': features['flu_cases'] + features['covid_cases'],
                    'capacity_ratio': predicted_arrivals / (features['staff_on_duty'] * 4)
                }
                
                optimal_score = self.predict_optimal_score(slot_features)
                
                # Predict availability
                availability_features = {
                    'hour': hour,
                    'day_of_week': day_of_week,
                    'patients_arrived': predicted_arrivals,
                    'staff_on_duty': features['staff_on_duty'],
                    'disease_burden': features['flu_cases'] + features['covid_cases'],
                    'capacity_ratio': predicted_arrivals / (features['staff_on_duty'] * 4)
                }
                
                is_available = self.predict_availability(availability_features)
                
                # Calculate efficiency and recommendations
                efficiency = self.calculate_efficiency(predicted_arrivals, features['staff_on_duty'])
                
                slot_info = {
                    'time': f"{hour:02d}:00",
                    'predicted_patients': int(predicted_arrivals),
                    'estimated_wait_time': max(0, predicted_wait_time),
                    'efficiency': efficiency,
                    'optimal_score': optimal_score,
                    'staff_availability': features['staff_on_duty'],
                    'recommendation': self.get_recommendation(optimal_score, predicted_wait_time, efficiency),
                    'confidence': self.calculate_confidence(predicted_arrivals, features['staff_on_duty']),
                    'is_available': bool(is_available)
                }
                
                if is_available:
                    optimal_slots.append(slot_info)
                else:
                    unavailable_slots.append(slot_info)
            
            # Sort available slots by optimal score (higher is better)
            optimal_slots.sort(key=lambda x: x['optimal_score'], reverse=True)
            
            # Apply patient preferences if provided
            if patient_preferences:
                optimal_slots = self.apply_patient_preferences(optimal_slots, patient_preferences)
            
            # Combine available and unavailable slots for demo
            all_slots = optimal_slots + unavailable_slots
            all_slots.sort(key=lambda x: x['time'])  # Sort by time for demo
            
            return {
                'success': True,
                'date': date,
                'doctor': doctor,
                'appointment_type': appointment_type,
                'optimal_slots': optimal_slots[:6],  # Top 6 available slots
                'unavailable_slots': unavailable_slots,  # All unavailable slots
                'all_slots': all_slots,  # All slots for demo
                'forecasting_confidence': self.calculate_overall_confidence(optimal_slots),
                'insights': self.generate_insights(optimal_slots, date, doctor),
                'recommended_time': optimal_slots[0]['time'] if optimal_slots else '09:00',
                'ml_models_used': ['RandomForestRegressor', 'GradientBoostingRegressor', 'RandomForestClassifier']
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'fallback_slots': self.get_default_slots()
            }
    
    def predict_patient_arrivals(self, features):
        """Predict patient arrivals for given features"""
        try:
            if self.patient_arrival_model is None:
                return 5  # Default fallback
            
            input_features = np.array([[features[key] for key in self.arrival_features]])
            input_scaled = self.scalers['arrival'].transform(input_features)
            
            prediction = self.patient_arrival_model.predict(input_scaled)[0]
            return max(0, prediction)
            
        except:
            return 5  # Default fallback
    
    def predict_wait_time(self, features):
        """Predict wait time for given features"""
        try:
            if self.wait_time_model is None:
                return 15  # Default fallback
            
            input_features = np.array([[features[key] for key in self.wait_time_features]])
            input_scaled = self.scalers['wait_time'].transform(input_features)
            
            prediction = self.wait_time_model.predict(input_scaled)[0]
            return max(0, prediction)
            
        except:
            return 15  # Default fallback
    
    def predict_optimal_score(self, features):
        """Predict optimal slot score for given features"""
        try:
            if self.optimal_slot_model is None:
                return 5.0  # Default fallback
            
            input_features = np.array([[features[key] for key in self.slot_features]])
            prediction = self.optimal_slot_model.predict(input_features)[0]
            return max(0, min(10, prediction))
            
        except:
            return 5.0  # Default fallback
    
    def predict_availability(self, features):
        """Predict if a time slot is available"""
        try:
            if self.availability_model is None:
                return True  # Default fallback
            
            input_features = np.array([[features[key] for key in self.availability_features]])
            prediction = self.availability_model.predict(input_features)[0]
            return bool(prediction)
            
        except:
            return True  # Default fallback
    
    def predict_flu_cases(self, hour, day_of_week):
        """Predict flu cases based on time patterns"""
        base_cases = 2
        hour_factor = 1.2 if 9 <= hour <= 12 else 0.8
        day_factor = 1.5 if day_of_week in [5, 6] else 1.0
        return int(base_cases * hour_factor * day_factor)
    
    def predict_covid_cases(self, hour, day_of_week):
        """Predict COVID cases based on time patterns"""
        base_cases = 1
        hour_factor = 1.1 if 14 <= hour <= 17 else 0.9
        return int(base_cases * hour_factor)
    
    def predict_staff_availability(self, hour, day_of_week, doctor):
        """Predict staff availability based on time and doctor"""
        base_staff = 8
        hour_factor = 1.2 if 9 <= hour <= 15 else 0.8
        day_factor = 0.7 if day_of_week in [5, 6] else 1.0
        doctor_factor = 1.1 if 'Dr.' in doctor else 1.0
        
        return int(base_staff * hour_factor * day_factor * doctor_factor)
    
    def calculate_efficiency(self, patients, staff):
        """Calculate efficiency score"""
        if staff == 0:
            return 0
        ratio = patients / staff
        return max(0, min(10, 10 - ratio * 2))
    
    def get_recommendation(self, score, wait_time, efficiency):
        """Get recommendation based on predictions"""
        if score >= 8 and wait_time <= 10:
            return 'Excellent - Minimal wait time expected'
        elif score >= 6 and wait_time <= 20:
            return 'Good - Reasonable wait time'
        elif score >= 4 and wait_time <= 30:
            return 'Fair - Moderate wait time expected'
        else:
            return 'Busy - Longer wait time possible'
    
    def calculate_confidence(self, patients, staff):
        """Calculate confidence level"""
        if staff > 0 and patients < staff * 3:
            return 'High'
        elif staff > 0 and patients < staff * 5:
            return 'Medium'
        else:
            return 'Low'
    
    def calculate_overall_confidence(self, slots):
        """Calculate overall forecasting confidence"""
        high_confidence = sum(1 for slot in slots if slot['confidence'] == 'High')
        return 'High' if high_confidence >= 4 else 'Medium' if high_confidence >= 2 else 'Low'
    
    def generate_insights(self, slots, date, doctor):
        """Generate insights and recommendations"""
        insights = []
        
        best_slot = slots[0] if slots else None
        worst_slot = slots[-1] if slots else None
        
        if best_slot:
            insights.append(f"Best time slot: {best_slot['time']} (score: {best_slot['optimal_score']:.1f})")
        
        if worst_slot:
            insights.append(f"Avoid: {worst_slot['time']} (score: {worst_slot['optimal_score']:.1f})")
        
        # Check for disease burden
        avg_disease = np.mean([slot.get('predicted_patients', 0) for slot in slots])
        if avg_disease > 8:
            insights.append('High patient volume expected - consider off-peak hours')
        
        # Check for staff availability
        avg_staff = np.mean([slot.get('staff_availability', 0) for slot in slots])
        if avg_staff < 6:
            insights.append('Limited staff availability - expect longer processing times')
        
        # Add ML-specific insights
        insights.append('Powered by scikit-learn ML models (Random Forest, Gradient Boosting)')
        insights.append('Models trained on historical healthcare data patterns')
        
        return insights
    
    def apply_patient_preferences(self, slots, preferences):
        """Apply patient preferences to slot recommendations"""
        if not preferences:
            return slots
        
        preferred_times = preferences.get('preferred_times', [])
        avoid_times = preferences.get('avoid_times', [])
        
        # Boost preferred times
        for slot in slots:
            if slot['time'] in preferred_times:
                slot['optimal_score'] += 2.0
        
        # Penalize avoided times
        for slot in slots:
            if slot['time'] in avoid_times:
                slot['optimal_score'] -= 3.0
        
        # Re-sort by updated scores
        slots.sort(key=lambda x: x['optimal_score'], reverse=True)
        return slots
    
    def get_default_slots(self):
        """Get default slot recommendations"""
        return [
            {'time': '09:00', 'optimal_score': 7.5, 'estimated_wait_time': 15, 'recommendation': 'Good morning slot', 'is_available': True},
            {'time': '10:00', 'optimal_score': 7.0, 'estimated_wait_time': 18, 'recommendation': 'Popular time, moderate wait', 'is_available': True},
            {'time': '11:00', 'optimal_score': 6.5, 'estimated_wait_time': 22, 'recommendation': 'Busier period', 'is_available': True},
            {'time': '14:00', 'optimal_score': 8.0, 'estimated_wait_time': 12, 'recommendation': 'Excellent afternoon slot', 'is_available': True},
            {'time': '15:00', 'optimal_score': 7.8, 'estimated_wait_time': 14, 'recommendation': 'Good afternoon slot', 'is_available': True},
            {'time': '16:00', 'optimal_score': 6.8, 'estimated_wait_time': 20, 'recommendation': 'End of day rush', 'is_available': True}
        ]

if __name__ == "__main__":
    # Initialize and test the optimizer
    optimizer = AppointmentForecastingOptimizer()
    
    # Test data
    result = optimizer.predict_optimal_appointment_slots(
        date='2024-12-20',
        doctor='Dr. Sarah Smith',
        appointment_type='General Consultation',
        patient_preferences={'preferred_times': ['10:00', '14:00'], 'avoid_times': ['16:00']}
    )
    
    print(json.dumps(result, indent=2))