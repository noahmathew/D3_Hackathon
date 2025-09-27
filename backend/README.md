# Healthcare Backend API

A comprehensive backend service for healthcare management with ML-powered forecasting and optimization capabilities.

## 🚀 Features

### Core Healthcare Features
- **Patient Authentication & Management**
- **Appointment Scheduling & Optimization**
- **Doctor Profiles & Availability**
- **Patient Portal & Medical Records**

### 🤖 ML-Powered Advanced Features
- **ED Triage Flow Optimization** - Real-time triage queue assignments
- **Operating Room Scheduling** - Quantum-inspired surgical optimization
- **Patient Transportation Routing** - Optimal ambulance & transport routing
- **Enhanced Appointment Forecasting** - ML-powered optimal time predictions
- **Predictive Analytics** - Capacity planning and resource forecasting
- **Real-time Patient Flow Optimization** - Multi-department coordination

## 📊 Data Sources

The system analyzes four comprehensive datasets:

1. **Forecasting Dataset** (721 records): Patient arrivals, flu/covid cases, staff levels
2. **OR Scheduling Dataset** (51 records): Surgery procedures, durations, surgeon assignments  
3. **Transport Routing Dataset** (81 records): Patient transport between departments
4. **Triage Dataset** (101 records): Emergency department patient flow, severity scores, bed availability

## 🛠️ Installation

1. **Install Node.js Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up ML Models (Optional but Recommended):**
   ```bash
   ./setup-ml.sh
   ```
   
   Or manually:
   ```bash
   cd ml_models
   pip3 install -r requirements.txt
   ```

3. **Environment Setup:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. **Start Production Server:**
   ```bash
   npm start
   ```

6. **Test ML Features:**
   ```bash
   curl http://localhost:3001/api/ml/health
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new patient
- `POST /api/auth/login` - Patient login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Appointments
- `GET /api/appointments/patient/:id` - Get patient appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `PATCH /api/appointments/:id/cancel` - Cancel appointment

### Forecasting & Optimization
- `GET /api/forecasting/optimal-times` - Get optimal appointment times
- `GET /api/forecasting/capacity` - Get capacity forecast
- `POST /api/forecasting/optimize-appointment` - Optimize appointment
- `POST /api/optimization/schedule` - Get scheduling recommendations
- `GET /api/optimization/resources` - Resource optimization
- `POST /api/optimization/surgical` - Surgical optimization

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/patient-flow` - Patient flow analysis
- `GET /api/analytics/resource-utilization` - Resource utilization
- `GET /api/analytics/predictions` - Predictive analytics

### 🤖 ML-Enhanced Endpoints
- `GET /api/ml/health` - ML service health check
- `GET /api/ml/appointments/optimal-times` - ML-powered appointment forecasting
- `POST /api/ml/emergency/triage-optimization` - ED triage flow optimization
- `POST /api/ml/surgery/schedule-optimization` - OR scheduling optimization
- `POST /api/ml/transport/routing-optimization` - Transport routing optimization
- `GET /api/ml/analytics/dashboard` - Comprehensive ML analytics dashboard
- `POST /api/ml/patient-flow/optimize` - Real-time patient flow optimization
- `GET /api/ml/analytics/predictive-capacity` - Predictive capacity planning

## 🧠 ML Forecasting Features

### Optimal Time Prediction
- Analyzes historical patient arrival patterns
- Considers staff efficiency and capacity
- Provides confidence scores and reasoning
- Accounts for disease burden (flu/covid cases)

### Capacity Forecasting
- Predicts hospital capacity by day
- Identifies optimal vs. busy periods
- Provides recommendations for scheduling

### Surgical Optimization
- Estimates procedure durations based on historical data
- Recommends recovery bed requirements
- Optimizes surgical scheduling

## 📈 Analytics Capabilities

- **Patient Flow Analysis**: Hourly distribution, peak hours, wait times
- **Resource Utilization**: Staff, equipment, and room utilization
- **Predictive Analytics**: Future patient volume, staff requirements
- **Trend Analysis**: Historical patterns and seasonal trends

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: Frontend application URL

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable via environment variables

## 🚀 Getting Started

1. **Start the backend server:**
   ```bash
   npm run dev
   ```

2. **Test the API:**
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Get optimal appointment times:**
   ```bash
   curl "http://localhost:3001/api/forecasting/optimal-times?date=2024-12-20&doctor=Dr.%20Sarah%20Smith"
   ```

## 📊 Example API Responses

### Optimal Times Response
```json
{
  "success": true,
  "data": {
    "date": "2024-12-20",
    "doctor": "Dr. Sarah Smith",
    "optimalSlots": [
      {
        "time": "14:00",
        "efficiency": 0.9,
        "estimatedWaitTime": 2.0,
        "score": 8.2,
        "recommendation": "Excellent afternoon slot"
      }
    ],
    "confidence": "High",
    "reasoning": ["Best time slot: 14:00", "Staff levels are adequate"]
  }
}
```

### Capacity Forecast Response
```json
{
  "success": true,
  "data": {
    "capacity": "Low",
    "recommendation": "Excellent time for appointments"
  }
}
```

## 🔮 Future Enhancements

- **Database Integration**: Replace in-memory storage with PostgreSQL
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced ML Models**: TensorFlow.js integration for more sophisticated predictions
- **External APIs**: Weather, holiday, and event data integration
- **Mobile API**: Optimized endpoints for mobile applications

## 🛡️ Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting and CORS protection
- Helmet.js security headers
- Input validation and sanitization

## 📝 License

MIT License - see LICENSE file for details
