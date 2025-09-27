#!/usr/bin/env python3
"""
Simple test to verify Python ML service communication
"""

import json
import sys

def main():
    """Simple test that returns a basic response"""
    try:
        # Read request from stdin
        input_data = sys.stdin.read()
        request_data = json.loads(input_data)
        
        # Simple response
        response = {
            'success': True,
            'type': 'test',
            'data': {
                'optimal_slots': [
                    {
                        'time': '09:00',
                        'optimal_score': 9.5,
                        'estimated_wait_time': 15,
                        'efficiency': 8.5,
                        'recommendation': 'Excellent time slot with low wait times'
                    },
                    {
                        'time': '10:30',
                        'optimal_score': 8.2,
                        'estimated_wait_time': 20,
                        'efficiency': 7.8,
                        'recommendation': 'Good time slot with moderate wait times'
                    },
                    {
                        'time': '14:00',
                        'optimal_score': 7.1,
                        'estimated_wait_time': 25,
                        'efficiency': 7.2,
                        'recommendation': 'Fair time slot, some wait expected'
                    }
                ],
                'forecasting_confidence': 'High',
                'insights': [
                    'Morning slots show the best efficiency',
                    'Wait times are typically lower before 11 AM',
                    'This doctor has good availability today'
                ]
            },
            'timestamp': '2025-09-27T22:30:00Z'
        }
        
        # Output response to stdout
        print(json.dumps(response, indent=2))
        
    except Exception as e:
        error_response = {
            'success': False,
            'error': f'Test error: {str(e)}',
            'timestamp': '2025-09-27T22:30:00Z'
        }
        print(json.dumps(error_response, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
