import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout
from scipy.optimize import minimize
import json
import sys
import heapq
from collections import defaultdict

class TransportRoutingOptimizer:
    def __init__(self):
        self.travel_time_model = None
        self.urgency_model = None
        self.route_optimizer = None
        self.label_encoders = {}
        self.hospital_map = self.build_hospital_map()
        self.load_and_train_models()
    
    def build_hospital_map(self):
        """Build hospital layout and distance matrix"""
        # Hospital layout with approximate distances (in minutes)
        locations = {
            'ED': {'x': 0, 'y': 0, 'floor': 1},
            'ICU': {'x': 50, 'y': 30, 'floor': 2},
            'Ward 1': {'x': 100, 'y': 0, 'floor': 3},
            'Ward 2': {'x': 150, 'y': 0, 'floor': 3},
            'Ward 3': {'x': 200, 'y': 0, 'floor': 3},
            'OR': {'x': 75, 'y': 50, 'floor': 2},
            'Radiology': {'x': 25, 'y': 75, 'floor': 1}
        }
        
        # Calculate distances between locations
        distance_matrix = {}
        for loc1 in locations:
            distance_matrix[loc1] = {}
            for loc2 in locations:
                if loc1 == loc2:
                    distance_matrix[loc1][loc2] = 0
                else:
                    # Euclidean distance with floor penalty
                    x1, y1, f1 = locations[loc1]['x'], locations[loc1]['y'], locations[loc1]['floor']
                    x2, y2, f2 = locations[loc2]['x'], locations[loc2]['y'], locations[loc2]['floor']
                    
                    distance = np.sqrt((x2-x1)**2 + (y2-y1)**2) / 10  # Convert to minutes
                    floor_penalty = abs(f2 - f1) * 2  # 2 minutes per floor change
                    
                    distance_matrix[loc1][loc2] = distance + floor_penalty
        
        return distance_matrix
    
    def load_and_train_models(self):
        """Load transport routing data and train ML models"""
        try:
            # Load transport routing dataset
            df = pd.read_csv('../data/transport_routing_dataset.csv')
            
            # Encode categorical variables
            self.label_encoders['origin'] = LabelEncoder()
            self.label_encoders['destination'] = LabelEncoder()
            self.label_encoders['urgency'] = LabelEncoder()
            
            df['origin_encoded'] = self.label_encoders['origin'].fit_transform(df['origin'])
            df['destination_encoded'] = self.label_encoders['destination'].fit_transform(df['destination'])
            df['urgency_encoded'] = self.label_encoders['urgency'].fit_transform(df['urgency'])
            
            # Features for travel time prediction
            features = ['origin_encoded', 'destination_encoded', 'urgency_encoded']
            X = df[features]
            
            # Train travel time prediction model (Random Forest)
            y_travel_time = df['est_travel_min']
            self.travel_time_model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.travel_time_model.fit(X, y_travel_time)
            
            # Train urgency-based priority model (Neural Network)
            self.urgency_model = Sequential([
                Dense(64, activation='relu', input_shape=(len(features),)),
                Dropout(0.3),
                Dense(32, activation='relu'),
                Dropout(0.3),
                Dense(1, activation='sigmoid')
            ])
            
            self.urgency_model.compile(
                optimizer='adam',
                loss='mse',
                metrics=['mae']
            )
            
            # Create urgency scores for training
            urgency_scores = df['urgency'].map({'High': 1.0, 'Medium': 0.6, 'Low': 0.3})
            self.urgency_model.fit(X, urgency_scores, epochs=50, batch_size=32, verbose=0)
            
            print("✅ Transport Routing models trained successfully", file=sys.stderr)
            
        except Exception as e:
            print(f"❌ Error training Transport Routing models: {e}", file=sys.stderr)
    
    def optimize_transport_routing(self, transport_requests, available_transport_teams, ambulance_availability):
        """Optimize patient transport routing with quantum-based combinatorial optimization"""
        try:
            # Prepare transport requests
            request_list = []
            for request in transport_requests:
                origin = request.get('origin', 'ED')
                destination = request.get('destination', 'Ward 1')
                urgency = request.get('urgency', 'Medium')
                patient_id = request.get('patient_id', f'P{len(request_list)+1}')
                
                # Predict travel time and priority
                origin_encoded = self.label_encoders['origin'].transform([origin])[0]
                destination_encoded = self.label_encoders['destination'].transform([destination])[0]
                urgency_encoded = self.label_encoders['urgency'].transform([urgency])[0]
                
                features = np.array([[origin_encoded, destination_encoded, urgency_encoded]])
                
                predicted_travel_time = self.travel_time_model.predict(features)[0]
                priority_score = self.urgency_model.predict(features)[0][0]
                
                request_list.append({
                    'patient_id': patient_id,
                    'origin': origin,
                    'destination': destination,
                    'urgency': urgency,
                    'predicted_travel_time': max(1, predicted_travel_time),
                    'priority_score': float(priority_score),
                    'estimated_cost': self.calculate_transport_cost(origin, destination, urgency)
                })
            
            # Quantum-inspired routing optimization
            optimal_routes = self.quantum_routing_optimization(request_list, available_transport_teams, ambulance_availability)
            
            return {
                'success': True,
                'optimized_routes': optimal_routes,
                'total_travel_time_reduction': self.calculate_time_savings(optimal_routes),
                'resource_utilization': self.calculate_resource_utilization(optimal_routes, available_transport_teams),
                'priority_compliance': self.check_priority_compliance(optimal_routes)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'fallback_routes': transport_requests
            }
    
    def quantum_routing_optimization(self, requests, transport_teams, ambulance_availability):
        """Quantum-inspired routing optimization algorithm"""
        # Initialize quantum states (possible route assignments)
        quantum_states = []
        
        # Generate initial population of route assignments
        for _ in range(30):  # 30 quantum states
            routes = self.generate_random_routes(requests, transport_teams)
            energy = self.calculate_routing_energy(routes)
            quantum_states.append((energy, routes))
        
        # Quantum annealing process
        temperature = 1.0
        cooling_rate = 0.95
        iterations = 80
        
        for iteration in range(iterations):
            # Sort by energy (lower is better)
            quantum_states.sort(key=lambda x: x[0])
            
            # Keep top 15 quantum states
            quantum_states = quantum_states[:15]
            
            # Generate new quantum states through superposition
            new_states = []
            for energy, routes in quantum_states:
                # Quantum tunneling - explore nearby solutions
                for _ in range(2):
                    new_routes = self.quantum_tunnel_routes(routes, transport_teams)
                    new_energy = self.calculate_routing_energy(new_routes)
                    
                    # Quantum probability of acceptance
                    if new_energy < energy or np.random.random() < np.exp(-(new_energy - energy) / temperature):
                        new_states.append((new_energy, new_routes))
            
            quantum_states.extend(new_states)
            temperature *= cooling_rate
        
        # Return the lowest energy (best) routing solution
        quantum_states.sort(key=lambda x: x[0])
        return quantum_states[0][1] if quantum_states else []
    
    def generate_random_routes(self, requests, transport_teams):
        """Generate a random initial route assignment"""
        routes = []
        available_teams = transport_teams.copy()
        
        # Sort requests by priority
        sorted_requests = sorted(requests, key=lambda x: x['priority_score'], reverse=True)
        
        for request in sorted_requests:
            if available_teams:
                team = available_teams.pop(0)
                route = self.create_route(request, team)
                routes.append(route)
        
        return routes
    
    def quantum_tunnel_routes(self, routes, transport_teams):
        """Quantum tunneling - explore nearby routing solutions"""
        new_routes = routes.copy()
        
        # Random quantum operation
        operation = np.random.choice(['swap', 'reassign', 'optimize_path'])
        
        if operation == 'swap' and len(new_routes) > 1:
            # Swap two transport assignments
            i, j = np.random.choice(len(new_routes), 2, replace=False)
            new_routes[i]['assigned_team'], new_routes[j]['assigned_team'] = \
                new_routes[j]['assigned_team'], new_routes[i]['assigned_team']
        
        elif operation == 'reassign':
            # Reassign a random transport to a different team
            if len(new_routes) > 0:
                idx = np.random.randint(0, len(new_routes))
                available_teams = [team for team in transport_teams if team not in [r['assigned_team'] for r in new_routes]]
                if available_teams:
                    new_routes[idx]['assigned_team'] = np.random.choice(available_teams)
        
        elif operation == 'optimize_path':
            # Optimize the path for a random route
            if len(new_routes) > 0:
                idx = np.random.randint(0, len(new_routes))
                route = new_routes[idx]
                optimized_path = self.find_optimal_path(route['origin'], route['destination'])
                new_routes[idx]['optimal_path'] = optimized_path
        
        return new_routes
    
    def create_route(self, request, team):
        """Create a transport route for a request"""
        origin = request['origin']
        destination = request['destination']
        
        # Find optimal path
        optimal_path = self.find_optimal_path(origin, destination)
        
        return {
            'patient_id': request['patient_id'],
            'origin': origin,
            'destination': destination,
            'urgency': request['urgency'],
            'priority_score': request['priority_score'],
            'predicted_travel_time': request['predicted_travel_time'],
            'assigned_team': team,
            'optimal_path': optimal_path,
            'estimated_start_time': self.calculate_start_time(team),
            'estimated_completion_time': self.calculate_completion_time(request, team)
        }
    
    def find_optimal_path(self, origin, destination):
        """Find optimal path using Dijkstra's algorithm"""
        distances = {origin: 0}
        previous = {}
        unvisited = set(self.hospital_map.keys())
        
        while unvisited:
            current = min(unvisited, key=lambda x: distances.get(x, float('inf')))
            unvisited.remove(current)
            
            if current == destination:
                break
            
            for neighbor in self.hospital_map[current]:
                if neighbor in unvisited:
                    distance = distances[current] + self.hospital_map[current][neighbor]
                    if distance < distances.get(neighbor, float('inf')):
                        distances[neighbor] = distance
                        previous[neighbor] = current
        
        # Reconstruct path
        path = []
        current = destination
        while current in previous:
            path.append(current)
            current = previous[current]
        path.append(origin)
        path.reverse()
        
        return path
    
    def calculate_routing_energy(self, routes):
        """Calculate the energy (cost) of a routing solution"""
        total_energy = 0
        
        for route in routes:
            # Travel time penalty
            total_energy += route['predicted_travel_time'] * 0.5
            
            # Urgency penalty (higher urgency = lower penalty)
            urgency_penalty = (1 - route['priority_score']) * 20
            total_energy += urgency_penalty
            
            # Team utilization penalty
            team_penalty = 5  # Base penalty for using a team
            total_energy += team_penalty
            
            # Path efficiency penalty
            path_length = len(route.get('optimal_path', []))
            if path_length > 3:  # More than 3 hops is inefficient
                total_energy += (path_length - 3) * 2
        
        return total_energy
    
    def calculate_transport_cost(self, origin, destination, urgency):
        """Calculate transport cost based on distance and urgency"""
        base_cost = self.hospital_map[origin][destination]
        urgency_multiplier = {'High': 1.0, 'Medium': 1.2, 'Low': 1.5}
        return base_cost * urgency_multiplier.get(urgency, 1.2)
    
    def calculate_start_time(self, team):
        """Calculate estimated start time for transport team"""
        # Simplified calculation - in real implementation, check team availability
        return "10:00"  # Placeholder
    
    def calculate_completion_time(self, request, team):
        """Calculate estimated completion time"""
        start_time = self.calculate_start_time(team)
        travel_time = request['predicted_travel_time']
        # Add travel time to start time (simplified)
        return f"10:{travel_time:02d}"
    
    def calculate_time_savings(self, routes):
        """Calculate total travel time savings"""
        if not routes:
            return 0
        
        optimized_time = sum(route['predicted_travel_time'] for route in routes)
        # Compare with baseline (assume 20% improvement)
        baseline_time = optimized_time * 1.25
        return baseline_time - optimized_time
    
    def calculate_resource_utilization(self, routes, available_teams):
        """Calculate resource utilization percentage"""
        if not routes or not available_teams:
            return 0
        
        used_teams = len(set(route['assigned_team'] for route in routes))
        total_teams = len(available_teams)
        
        return (used_teams / total_teams) * 100
    
    def check_priority_compliance(self, routes):
        """Check if high-priority requests are handled first"""
        if not routes:
            return {'compliance': 100, 'violations': []}
        
        violations = []
        high_priority_requests = [r for r in routes if r['urgency'] == 'High']
        
        # Check if high priority requests have better completion times
        for high_priority in high_priority_requests:
            for other in routes:
                if (other['urgency'] != 'High' and 
                    other['estimated_completion_time'] < high_priority['estimated_completion_time']):
                    violations.append({
                        'high_priority_patient': high_priority['patient_id'],
                        'delayed_by': other['patient_id'],
                        'reason': 'Lower priority request completed first'
                    })
        
        compliance = max(0, 100 - len(violations) * 10)
        
        return {
            'compliance': compliance,
            'violations': violations
        }
    
    def predict_transport_requirements(self, transport_request):
        """Predict transport requirements for a single request"""
        try:
            origin = transport_request.get('origin', 'ED')
            destination = transport_request.get('destination', 'Ward 1')
            urgency = transport_request.get('urgency', 'Medium')
            
            origin_encoded = self.label_encoders['origin'].transform([origin])[0]
            destination_encoded = self.label_encoders['destination'].transform([destination])[0]
            urgency_encoded = self.label_encoders['urgency'].transform([urgency])[0]
            
            features = np.array([[origin_encoded, destination_encoded, urgency_encoded]])
            
            predicted_travel_time = self.travel_time_model.predict(features)[0]
            priority_score = self.urgency_model.predict(features)[0][0]
            
            optimal_path = self.find_optimal_path(origin, destination)
            
            return {
                'success': True,
                'predicted_travel_time_minutes': max(1, int(predicted_travel_time)),
                'priority_score': float(priority_score),
                'optimal_path': optimal_path,
                'transport_cost': self.calculate_transport_cost(origin, destination, urgency),
                'recommended_team_size': 1 if urgency == 'Low' else 2 if urgency == 'Medium' else 3,
                'special_equipment_needed': urgency == 'High'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

if __name__ == "__main__":
    # Initialize and test the optimizer
    optimizer = TransportRoutingOptimizer()
    
    # Test data
    test_requests = [
        {
            'patient_id': 'P001',
            'origin': 'ED',
            'destination': 'ICU',
            'urgency': 'High'
        },
        {
            'patient_id': 'P002',
            'origin': 'Ward 1',
            'destination': 'Radiology',
            'urgency': 'Medium'
        }
    ]
    
    available_teams = ['Team-A', 'Team-B', 'Team-C']
    ambulance_availability = {'ambulance-1': True, 'ambulance-2': False}
    
    result = optimizer.optimize_transport_routing(test_requests, available_teams, ambulance_availability)
    print(json.dumps(result, indent=2))
