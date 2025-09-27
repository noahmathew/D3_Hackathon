#!/usr/bin/env python3
"""
Healthcare ML Service - Main entry point for all ML models
Handles requests from Node.js backend and routes to appropriate ML models
"""

import json
import sys
import os
from datetime import datetime
import numpy as np

# Import ML models
from ed_triage_optimizer import EDTriageOptimizer
from or_scheduling_optimizer import ORSchedulingOptimizer
from transport_routing_optimizer import TransportRoutingOptimizer
from appointment_forecasting_optimizer import AppointmentForecastingOptimizer

def convert_to_json_serializable(obj):
    """Convert numpy/TensorFlow types to JSON-serializable Python types"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_to_json_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_json_serializable(item) for item in obj]
    else:
        return obj

class HealthcareMLService:
    def __init__(self):
        """Initialize all ML models"""
        try:
            # Redirect all output to stderr to avoid interfering with JSON output
            print("🤖 Initializing Healthcare ML Service...", file=sys.stderr)
            
            self.ed_optimizer = EDTriageOptimizer()
            self.or_optimizer = ORSchedulingOptimizer()
            self.transport_optimizer = TransportRoutingOptimizer()
            self.appointment_optimizer = AppointmentForecastingOptimizer()
            
            print("✅ All ML models initialized successfully", file=sys.stderr)
            
        except Exception as e:
            print(f"❌ Error initializing ML service: {e}", file=sys.stderr)
            sys.exit(1)
    
    def handle_request(self, request_data):
        """Handle incoming requests and route to appropriate models"""
        try:
            request_type = request_data.get('type')
            
            if request_type == 'ed_triage_optimization':
                return self.handle_ed_triage_optimization(request_data)
            
            elif request_type == 'or_scheduling_optimization':
                return self.handle_or_scheduling_optimization(request_data)
            
            elif request_type == 'transport_routing_optimization':
                return self.handle_transport_routing_optimization(request_data)
            
            elif request_type == 'appointment_forecasting':
                return self.handle_appointment_forecasting(request_data)
            
            else:
                return {
                    'success': False,
                    'error': f'Unknown request type: {request_type}',
                    'available_types': [
                        'ed_triage_optimization',
                        'or_scheduling_optimization', 
                        'transport_routing_optimization',
                        'appointment_forecasting'
                    ]
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Error handling request: {str(e)}',
                'timestamp': datetime.now().isoformat()
            }
    
    def handle_ed_triage_optimization(self, request_data):
        """Handle ED Triage optimization requests"""
        try:
            current_patients = request_data.get('current_patients', [])
            available_staff = request_data.get('available_staff', 5)
            bed_status = request_data.get('bed_status', {})
            
            result = self.ed_optimizer.optimize_triage_queue(
                current_patients, available_staff, bed_status
            )
            
            return {
                'success': True,
                'type': 'ed_triage_optimization',
                'result': result,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'ED Triage optimization error: {str(e)}',
                'timestamp': datetime.now().isoformat()
            }
    
    def handle_or_scheduling_optimization(self, request_data):
        """Handle OR Scheduling optimization requests"""
        try:
            surgeries = request_data.get('surgeries', [])
            available_or_slots = request_data.get('available_or_slots', [])
            staff_availability = request_data.get('staff_availability', {})
            
            result = self.or_optimizer.quantum_inspired_optimization(
                surgeries, available_or_slots, staff_availability
            )
            
            return {
                'success': True,
                'type': 'or_scheduling_optimization',
                'result': result,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'OR Scheduling optimization error: {str(e)}',
                'timestamp': datetime.now().isoformat()
            }
    
    def handle_transport_routing_optimization(self, request_data):
        """Handle Transport Routing optimization requests"""
        try:
            transport_requests = request_data.get('transport_requests', [])
            available_transport_teams = request_data.get('available_transport_teams', [])
            ambulance_availability = request_data.get('ambulance_availability', {})
            
            result = self.transport_optimizer.optimize_transport_routing(
                transport_requests, available_transport_teams, ambulance_availability
            )
            
            return {
                'success': True,
                'type': 'transport_routing_optimization',
                'result': result,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Transport Routing optimization error: {str(e)}',
                'timestamp': datetime.now().isoformat()
            }
    
    def handle_appointment_forecasting(self, request_data):
        """Handle Appointment Forecasting requests"""
        try:
            date = request_data.get('date')
            doctor = request_data.get('doctor', 'Dr. Smith')
            appointment_type = request_data.get('appointment_type', 'General Consultation')
            patient_preferences = request_data.get('patient_preferences', {})
            
            result = self.appointment_optimizer.predict_optimal_appointment_slots(
                date, doctor, appointment_type, patient_preferences
            )
            
            return {
                'success': True,
                'type': 'appointment_forecasting',
                'result': result,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Appointment Forecasting error: {str(e)}',
                'timestamp': datetime.now().isoformat()
            }

def main():
    """Main entry point for the ML service"""
    try:
        # Initialize the ML service
        ml_service = HealthcareMLService()
        
        # Read request from stdin
        input_data = sys.stdin.read()
        request_data = json.loads(input_data)
        
        # Process the request
        response = ml_service.handle_request(request_data)
        
        # Convert numpy types to JSON-serializable types
        response = convert_to_json_serializable(response)
        
        # Output response to stdout
        print(json.dumps(response, indent=2))
        
    except Exception as e:
        error_response = {
            'success': False,
            'error': f'ML Service error: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }
        print(json.dumps(error_response, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
