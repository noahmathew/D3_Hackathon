import math
import pandas as pd
import numpy as np
import json
import sys
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class QuantumScheduler:
    def __init__(self):
        self.patient_queue = None
        self.grover_results = None
        self.load_patient_queue()
    
    def load_patient_queue(self):
        """Load current patient queue from CSV"""
        try:
            self.patient_queue = pd.read_csv('../../data/patient_queue_dataset.csv')
            # Ensure priority calculation
            self.patient_queue['priority_score'] = self.calculate_priority_scores()
            print("✅ Patient queue loaded successfully", file=sys.stderr)
        except Exception as e:
            print(f"❌ Error loading patient queue: {e}", file=sys.stderr)
            self.patient_queue = pd.DataFrame()
    
    def calculate_priority_scores(self):
        """Calculate priority scores based on severity, emergency status, and wait time"""
        if self.patient_queue.empty:
            return []
        
        # Normalize severity scores (0-10 scale)
        sev_vals = pd.to_numeric(self.patient_queue['severity_score'], errors='coerce').fillna(5.0)
        sev_norm = (sev_vals - sev_vals.min()) / (sev_vals.max() - sev_vals.min()) if sev_vals.max() != sev_vals.min() else np.ones(len(sev_vals))
        
        # Emergency department bonus
        is_er = self.patient_queue['department'].str.contains('ER|Emergency', case=False, na=False)
        er_bonus = is_er.astype(int) * 1.0
        
        # Wait time penalty (longer wait = higher priority)
        wait_time = pd.to_numeric(self.patient_queue['wait_time_minutes'], errors='coerce').fillna(20)
        wait_norm = (wait_time - wait_time.min()) / (wait_time.max() - wait_time.min()) if wait_time.max() != wait_time.min() else np.zeros(len(wait_time))
        
        # Critical conditions bonus
        critical_conditions = ['Stroke', 'Heart Attack', 'Trauma', 'Gunshot', 'Burn', 'Overdose', 'Severe Allergic Reaction']
        is_critical = self.patient_queue['condition'].str.contains('|'.join(critical_conditions), case=False, na=False)
        critical_bonus = is_critical.astype(int) * 0.8
        
        # Calculate final priority score
        priority = sev_norm + er_bonus + wait_norm + critical_bonus
        
        return priority.values
    
    def run_grover_algorithm(self, top_k=10, iterations=None):
        """Run Grover's algorithm to find highest priority patients"""
        if self.patient_queue.empty:
            return {'success': False, 'error': 'No patient data available'}
        
        try:
            # Prepare data
            patients = self.patient_queue['patient_id'].astype(str).tolist()
            N = len(patients)
            
            if N == 0:
                return {'success': False, 'error': 'Empty patient dataset'}
            
            # Calculate number of qubits needed
            n_qubits = math.ceil(math.log2(N)) if N > 1 else 1
            dim = 2**n_qubits
            
            # Get top priority indices
            top_indices = self.patient_queue.sort_values('priority_score', ascending=False).head(min(top_k, N)).index.tolist()
            
            # Marked states for Grover algorithm
            marked = np.zeros(dim, dtype=bool)
            for i in top_indices:
                if i < dim:
                    marked[i] = True
            
            M = np.sum(marked)  # Number of marked items
            
            # Calculate optimal iterations if not specified
            if iterations is None:
                theta = math.asin(math.sqrt(M/dim)) if M > 0 else 0
                iterations = max(1, round(math.pi/(4*theta) - 0.5)) if theta > 0 else 1
            
            print(f"Running Grover with {n_qubits} qubits, {M} marked states, {iterations} iterations", file=sys.stderr)
            
            # Grover simulation
            state = np.ones(dim, dtype=complex) / math.sqrt(dim)
            
            # Run Grover iterations
            for _ in range(iterations):
                # Oracle: flip phase of marked states
                state[marked] *= -1
                
                # Diffusion: reflect around mean
                mean_val = np.mean(state)
                state = 2 * mean_val - state
            
            # Calculate probabilities
            probs = np.abs(state)**2
            sorted_indices = np.argsort(probs)[::-1]
            
            # Get results
            found_indices = [idx for idx in sorted_indices if idx < N][:top_k]
            grover_patients = self.patient_queue.loc[found_indices].copy() if found_indices else pd.DataFrame()
            
            # Store results
            self.grover_results = {
                'algorithm': 'Grover',
                'n_qubits': int(n_qubits),
                'iterations': int(iterations),
                'marked_states': int(M),
                'top_patients': grover_patients.to_dict('records') if not grover_patients.empty else [],
                'probabilities': {str(idx): float(probs[idx]) for idx in found_indices[:10]},
                'classical_top': self.patient_queue.sort_values('priority_score', ascending=False).head(top_k).to_dict('records')
            }
            
            return {
                'success': True,
                'grover_results': self.grover_results,
                'quantum_advantage': self.calculate_quantum_advantage()
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def calculate_quantum_advantage(self):
        """Calculate theoretical quantum advantage over classical search"""
        if self.patient_queue.empty:
            return 0
        
        N = len(self.patient_queue)
        M = len(self.grover_results.get('top_patients', []))
        
        if M == 0:
            return 0
        
        # Classical search complexity: O(N/M)
        # Quantum search complexity: O(sqrt(N/M))
        classical_ops = N / M if M > 0 else N
        quantum_ops = math.sqrt(N / M) if M > 0 else math.sqrt(N)
        
        advantage = classical_ops / quantum_ops if quantum_ops > 0 else 1
        
        return {
            'speedup_factor': float(advantage),
            'classical_complexity': float(classical_ops),
            'quantum_complexity': float(quantum_ops),
            'theoretical_advantage': f"{advantage:.2f}x faster than classical"
        }
    
    def predict_appointment_delay(self, appointment_time, doctor_id, severity_score=5):
        """Predict if an appointment will be delayed based on current queue"""
        if self.patient_queue.empty:
            return {
                'success': False,
                'delay_expected': False,
                'estimated_delay_minutes': 0,
                'reason': 'No queue data available'
            }
        
        try:
            # Run Grover algorithm to get current priority queue
            grover_result = self.run_grover_algorithm(top_k=15)
            
            if not grover_result['success']:
                return {
                    'success': False,
                    'delay_expected': False,
                    'estimated_delay_minutes': 0,
                    'reason': 'Quantum scheduler unavailable'
                }
            
            # Calculate current system load
            total_patients = len(self.patient_queue)
            high_priority_patients = len([p for p in self.patient_queue['priority_score'] if p > 0.7])
            critical_patients = len([p for p in self.patient_queue['priority_score'] if p > 0.9])
            
            # Calculate average wait time
            avg_wait_time = self.patient_queue['wait_time_minutes'].mean()
            
            # Determine delay probability based on queue status
            delay_probability = 0.0
            estimated_delay = 0
            
            if critical_patients > 5:
                # High critical patient load
                delay_probability = 0.8
                estimated_delay = 30 + (critical_patients * 5)
            elif high_priority_patients > 10:
                # Moderate high priority load
                delay_probability = 0.6
                estimated_delay = 20 + (high_priority_patients * 2)
            elif total_patients > 20:
                # General busy period
                delay_probability = 0.4
                estimated_delay = 15 + (total_patients * 0.5)
            elif avg_wait_time > 25:
                # Above average wait times
                delay_probability = 0.3
                estimated_delay = 10 + (avg_wait_time * 0.3)
            
            # Adjust based on appointment severity
            if severity_score >= 8:
                # High priority appointment - less likely to be delayed
                delay_probability *= 0.5
                estimated_delay *= 0.7
            elif severity_score >= 6:
                # Medium priority appointment
                delay_probability *= 0.8
                estimated_delay *= 0.9
            
            # Final decision
            delay_expected = delay_probability > 0.5
            final_delay = max(0, int(estimated_delay)) if delay_expected else 0
            
            # Generate reason
            if delay_expected:
                if critical_patients > 5:
                    reason = f"High number of critical patients ({critical_patients}) requiring immediate attention"
                elif high_priority_patients > 10:
                    reason = f"Multiple high-priority patients ({high_priority_patients}) in queue"
                elif total_patients > 20:
                    reason = f"Busy period with {total_patients} patients currently waiting"
                else:
                    reason = f"Above-average wait times ({avg_wait_time:.0f} min) in the system"
            else:
                reason = "Normal operating conditions - appointment should be on time"
            
            return {
                'success': True,
                'delay_expected': delay_expected,
                'estimated_delay_minutes': int(final_delay),
                'delay_probability': float(delay_probability),
                'reason': reason,
                'queue_status': {
                    'total_patients': int(total_patients),
                    'critical_patients': int(critical_patients),
                    'high_priority_patients': int(high_priority_patients),
                    'average_wait_time': float(round(avg_wait_time, 1)),
                    'quantum_scheduler_used': True,
                    'grover_algorithm_results': grover_result.get('grover_results', {})
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'delay_expected': False,
                'estimated_delay_minutes': 0,
                'reason': f'Error in delay prediction: {str(e)}'
            }
    
    def get_queue_status(self):
        """Get current queue status for monitoring"""
        if self.patient_queue.empty:
            return {'success': False, 'error': 'No queue data available'}
        
        try:
            # Run Grover algorithm
            grover_result = self.run_grover_algorithm(top_k=10)
            
            queue_stats = {
                'total_patients': int(len(self.patient_queue)),
                'critical_patients': int(len([p for p in self.patient_queue['priority_score'] if p > 0.9])),
                'high_priority_patients': int(len([p for p in self.patient_queue['priority_score'] if p > 0.7])),
                'average_wait_time': float(round(self.patient_queue['wait_time_minutes'].mean(), 1)),
                'max_wait_time': int(self.patient_queue['wait_time_minutes'].max()),
                'departments': {k: int(v) for k, v in self.patient_queue['department'].value_counts().to_dict().items()},
                'grover_algorithm': grover_result.get('grover_results', {}) if grover_result['success'] else {},
                'last_updated': datetime.now().isoformat()
            }
            
            return {
                'success': True,
                'queue_status': queue_stats
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

if __name__ == "__main__":
    # Test the quantum scheduler
    scheduler = QuantumScheduler()
    
    # Test delay prediction
    result = scheduler.predict_appointment_delay(
        appointment_time="14:00",
        doctor_id="dr-smith",
        severity_score=6
    )
    
    print(json.dumps(result, indent=2))
