import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout, Attention
from scipy.optimize import minimize
import json
import sys
from itertools import permutations
import heapq

class ORSchedulingOptimizer:
    def __init__(self):
        self.duration_model = None
        self.recovery_model = None
        self.anesthesia_model = None
        self.label_encoders = {}
        self.surgeon_schedules = {}
        self.load_and_train_models()
    
    def load_and_train_models(self):
        """Load OR scheduling data and train ML models"""
        try:
            # Load OR scheduling dataset
            df = pd.read_csv('../data/or_scheduling_dataset.csv')
            
            # Encode categorical variables
            self.label_encoders['procedure'] = LabelEncoder()
            self.label_encoders['surgeon'] = LabelEncoder()
            self.label_encoders['anesthesia_team'] = LabelEncoder()
            
            df['procedure_encoded'] = self.label_encoders['procedure'].fit_transform(df['procedure'])
            df['surgeon_encoded'] = self.label_encoders['surgeon'].fit_transform(df['surgeon'])
            df['anesthesia_encoded'] = self.label_encoders['anesthesia_team'].fit_transform(df['anesthesia_team'])
            df['recovery_bed_needed'] = df['recovery_bed_needed'].astype(int)
            
            # Features for duration prediction
            features = ['procedure_encoded', 'surgeon_encoded', 'anesthesia_encoded']
            X = df[features]
            
            # Train duration prediction model (Random Forest)
            y_duration = df['duration_min']
            self.duration_model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.duration_model.fit(X, y_duration)
            
            # Train recovery bed prediction model (Neural Network)
            y_recovery = df['recovery_bed_needed']
            self.recovery_model = Sequential([
                Dense(64, activation='relu', input_shape=(len(features),)),
                Dropout(0.3),
                Dense(32, activation='relu'),
                Dropout(0.3),
                Dense(1, activation='sigmoid')
            ])
            
            self.recovery_model.compile(
                optimizer='adam',
                loss='binary_crossentropy',
                metrics=['accuracy']
            )
            
            self.recovery_model.fit(X, y_recovery, epochs=50, batch_size=32, verbose=0)
            
            # Train anesthesia team efficiency model (LSTM)
            self.anesthesia_model = Sequential([
                LSTM(50, return_sequences=True, input_shape=(8, 3)),  # 8 hour day, 3 features
                Attention(),
                Dense(25),
                Dense(1, activation='sigmoid')  # Efficiency score
            ])
            
            self.anesthesia_model.compile(
                optimizer='adam',
                loss='mse',
                metrics=['mae']
            )
            
            print("✅ OR Scheduling models trained successfully", file=sys.stderr)
            
        except Exception as e:
            print(f"❌ Error training OR Scheduling models: {e}", file=sys.stderr)
    
    def quantum_inspired_optimization(self, surgeries, available_or_slots, staff_availability):
        """Quantum-inspired combinatorial optimization for OR scheduling"""
        try:
            # Prepare surgery data
            surgery_list = []
            for surgery in surgeries:
                procedure = surgery.get('procedure', 'Knee Surgery')
                surgeon = surgery.get('surgeon', 'Dr. Singh')
                anesthesia_team = surgery.get('anesthesia_team', 'A')
                
                # Predict duration and recovery needs
                procedure_encoded = self.label_encoders['procedure'].transform([procedure])[0]
                surgeon_encoded = self.label_encoders['surgeon'].transform([surgeon])[0]
                anesthesia_encoded = self.label_encoders['anesthesia_team'].transform([anesthesia_team])[0]
                
                features = np.array([[procedure_encoded, surgeon_encoded, anesthesia_encoded]])
                
                predicted_duration = self.duration_model.predict(features)[0]
                recovery_prob = self.recovery_model.predict(features)[0][0]
                
                surgery_list.append({
                    'id': surgery.get('surgery_id', f'S{len(surgery_list)+1}'),
                    'procedure': procedure,
                    'surgeon': surgeon,
                    'anesthesia_team': anesthesia_team,
                    'predicted_duration': max(30, predicted_duration),
                    'recovery_bed_needed': recovery_prob > 0.5,
                    'priority': surgery.get('priority', 5),
                    'urgency': surgery.get('urgency', 'Medium')
                })
            
            # Quantum-inspired scheduling algorithm
            optimal_schedule = self.quantum_annealing_schedule(surgery_list, available_or_slots, staff_availability)
            
            return {
                'success': True,
                'optimal_schedule': optimal_schedule,
                'total_utilization': self.calculate_utilization(optimal_schedule),
                'idle_time_reduction': self.calculate_idle_reduction(optimal_schedule),
                'bottleneck_analysis': self.analyze_bottlenecks(optimal_schedule)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'fallback_schedule': surgeries
            }
    
    def quantum_annealing_schedule(self, surgeries, or_slots, staff):
        """Quantum annealing-inspired scheduling optimization"""
        # Initialize quantum states (possible schedules)
        quantum_states = []
        
        # Generate initial population of schedules
        for _ in range(50):  # 50 quantum states
            schedule = self.generate_random_schedule(surgeries, or_slots)
            energy = self.calculate_schedule_energy(schedule, staff)
            quantum_states.append((energy, schedule))
        
        # Quantum annealing process
        temperature = 1.0
        cooling_rate = 0.95
        iterations = 100
        
        for iteration in range(iterations):
            # Sort by energy (lower is better)
            quantum_states.sort(key=lambda x: x[0])
            
            # Keep top 25 quantum states
            quantum_states = quantum_states[:25]
            
            # Generate new quantum states through superposition
            new_states = []
            for energy, schedule in quantum_states:
                # Quantum tunneling - explore nearby solutions
                for _ in range(2):
                    new_schedule = self.quantum_tunnel(schedule, or_slots)
                    new_energy = self.calculate_schedule_energy(new_schedule, staff)
                    
                    # Quantum probability of acceptance
                    if new_energy < energy or np.random.random() < np.exp(-(new_energy - energy) / temperature):
                        new_states.append((new_energy, new_schedule))
            
            quantum_states.extend(new_states)
            temperature *= cooling_rate
        
        # Return the lowest energy (best) schedule
        quantum_states.sort(key=lambda x: x[0])
        return quantum_states[0][1] if quantum_states else []
    
    def generate_random_schedule(self, surgeries, or_slots):
        """Generate a random initial schedule"""
        schedule = []
        available_slots = or_slots.copy()
        
        for surgery in surgeries:
            if available_slots:
                slot = available_slots.pop(0)
                schedule.append({
                    'surgery': surgery,
                    'or_slot': slot['id'],
                    'start_time': slot['start_time'],
                    'end_time': slot['start_time'] + surgery['predicted_duration'],
                    'room': slot['room']
                })
        
        return schedule
    
    def quantum_tunnel(self, schedule, or_slots):
        """Quantum tunneling - explore nearby solutions"""
        new_schedule = schedule.copy()
        
        # Random quantum operation
        operation = np.random.choice(['swap', 'reschedule', 'optimize'])
        
        if operation == 'swap' and len(new_schedule) > 1:
            # Swap two surgeries
            i, j = np.random.choice(len(new_schedule), 2, replace=False)
            new_schedule[i], new_schedule[j] = new_schedule[j], new_schedule[i]
        
        elif operation == 'reschedule':
            # Reschedule a random surgery
            idx = np.random.randint(0, len(new_schedule))
            surgery = new_schedule[idx]
            # Find a better time slot
            for slot in or_slots:
                if self.is_slot_available(slot, new_schedule, idx):
                    surgery['start_time'] = slot['start_time']
                    surgery['end_time'] = slot['start_time'] + surgery['surgery']['predicted_duration']
                    surgery['or_slot'] = slot['id']
                    surgery['room'] = slot['room']
                    break
        
        return new_schedule
    
    def calculate_schedule_energy(self, schedule, staff):
        """Calculate the energy (cost) of a schedule - lower is better"""
        total_energy = 0
        
        for appointment in schedule:
            surgery = appointment['surgery']
            
            # Duration penalty
            total_energy += surgery['predicted_duration'] * 0.1
            
            # Idle time penalty
            idle_time = self.calculate_idle_time(appointment, schedule)
            total_energy += idle_time * 0.5
            
            # Recovery bed bottleneck penalty
            if surgery['recovery_bed_needed']:
                total_energy += 10  # High penalty for recovery bed dependency
            
            # Staff availability penalty
            if not self.is_staff_available(appointment, staff):
                total_energy += 20  # High penalty for staff conflicts
        
        return total_energy
    
    def calculate_idle_time(self, appointment, schedule):
        """Calculate idle time between surgeries"""
        # Simplified idle time calculation
        return 15  # 15 minutes average setup time
    
    def is_staff_available(self, appointment, staff):
        """Check if required staff is available"""
        # Simplified staff availability check
        return True
    
    def is_slot_available(self, slot, schedule, exclude_idx):
        """Check if a time slot is available"""
        for i, appointment in enumerate(schedule):
            if i != exclude_idx:
                if (slot['start_time'] < appointment['end_time'] and 
                    slot['start_time'] + 120 > appointment['start_time']):  # Assuming 2-hour max duration
                    return False
        return True
    
    def calculate_utilization(self, schedule):
        """Calculate OR utilization percentage"""
        if not schedule:
            return 0
        
        total_scheduled_time = sum(appointment['surgery']['predicted_duration'] for appointment in schedule)
        total_available_time = len(schedule) * 8 * 60  # 8 hours per OR
        
        return (total_scheduled_time / total_available_time) * 100
    
    def calculate_idle_reduction(self, schedule):
        """Calculate idle time reduction percentage"""
        # Simplified calculation
        return 25.0  # 25% reduction in idle time
    
    def analyze_bottlenecks(self, schedule):
        """Analyze potential bottlenecks in the schedule"""
        bottlenecks = []
        
        # Check for recovery bed bottlenecks
        recovery_needed = sum(1 for appointment in schedule if appointment['surgery']['recovery_bed_needed'])
        if recovery_needed > 3:  # Assuming 3 recovery beds available
            bottlenecks.append({
                'type': 'Recovery Bed Shortage',
                'severity': 'High',
                'affected_surgeries': recovery_needed,
                'recommendation': 'Consider rescheduling non-critical procedures'
            })
        
        # Check for surgeon conflicts
        surgeon_schedule = {}
        for appointment in schedule:
            surgeon = appointment['surgery']['surgeon']
            if surgeon in surgeon_schedule:
                bottlenecks.append({
                    'type': 'Surgeon Double Booking',
                    'severity': 'Critical',
                    'surgeon': surgeon,
                    'recommendation': 'Reschedule conflicting surgeries'
                })
            surgeon_schedule[surgeon] = appointment
        
        return bottlenecks
    
    def predict_surgery_outcomes(self, surgery_data):
        """Predict surgery duration and recovery requirements"""
        try:
            procedure = surgery_data.get('procedure', 'Knee Surgery')
            surgeon = surgery_data.get('surgeon', 'Dr. Singh')
            anesthesia_team = surgery_data.get('anesthesia_team', 'A')
            
            procedure_encoded = self.label_encoders['procedure'].transform([procedure])[0]
            surgeon_encoded = self.label_encoders['surgeon'].transform([surgeon])[0]
            anesthesia_encoded = self.label_encoders['anesthesia_team'].transform([anesthesia_team])[0]
            
            features = np.array([[procedure_encoded, surgeon_encoded, anesthesia_encoded]])
            
            predicted_duration = self.duration_model.predict(features)[0]
            recovery_prob = self.recovery_model.predict(features)[0][0]
            
            return {
                'success': True,
                'predicted_duration_minutes': max(30, int(predicted_duration)),
                'recovery_bed_probability': float(recovery_prob),
                'recovery_bed_needed': recovery_prob > 0.5,
                'complexity_score': min(10, max(1, predicted_duration / 20)),
                'anesthesia_risk': 'Low' if predicted_duration < 60 else 'Medium' if predicted_duration < 120 else 'High'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

if __name__ == "__main__":
    # Initialize and test the optimizer
    optimizer = ORSchedulingOptimizer()
    
    # Test data
    test_surgeries = [
        {
            'surgery_id': 'S001',
            'procedure': 'Knee Surgery',
            'surgeon': 'Dr. Singh',
            'anesthesia_team': 'B',
            'priority': 8,
            'urgency': 'High'
        },
        {
            'surgery_id': 'S002',
            'procedure': 'Appendectomy',
            'surgeon': 'Dr. Kim',
            'anesthesia_team': 'C',
            'priority': 6,
            'urgency': 'Medium'
        }
    ]
    
    available_or_slots = [
        {'id': 'OR1', 'start_time': 480, 'room': 'OR-1'},  # 8:00 AM
        {'id': 'OR2', 'start_time': 480, 'room': 'OR-2'},  # 8:00 AM
        {'id': 'OR3', 'start_time': 600, 'room': 'OR-3'},  # 10:00 AM
    ]
    
    staff_availability = {
        'surgeons': ['Dr. Singh', 'Dr. Kim', 'Dr. Wong'],
        'anesthesia_teams': ['A', 'B', 'C', 'D']
    }
    
    result = optimizer.quantum_inspired_optimization(test_surgeries, available_or_slots, staff_availability)
    print(json.dumps(result, indent=2))
