#!/bin/bash

echo "🤖 Setting up Healthcare ML Models..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

echo "✅ Python 3 and pip3 are available"

# Navigate to ml_models directory
cd ml_models

# Install Python dependencies
echo "📦 Installing Python ML dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Python dependencies installed successfully"
else
    echo "❌ Failed to install Python dependencies"
    echo "💡 Try running: pip3 install --user -r requirements.txt"
    exit 1
fi

# Test ML service
echo "🧪 Testing ML service..."
python3 ml_service.py << EOF
{"type": "appointment_forecasting", "date": "2024-12-20", "doctor": "Dr. Test"}
EOF

if [ $? -eq 0 ]; then
    echo "✅ ML service test passed"
else
    echo "⚠️  ML service test failed, but dependencies are installed"
    echo "💡 ML features will use fallback mode"
fi

echo ""
echo "🎉 Healthcare ML Models setup complete!"
echo ""
echo "📋 Available ML Features:"
echo "  • ED Triage Flow Optimization"
echo "  • Operating Room Scheduling (Quantum-inspired)"
echo "  • Patient Transportation Routing"
echo "  • Enhanced Appointment Forecasting"
echo ""
echo "🚀 Start the backend server with: npm start"
echo "📊 ML endpoints will be available at: /api/ml/*"
echo ""
echo "💡 If ML models fail to load, the system will automatically use fallback algorithms"
