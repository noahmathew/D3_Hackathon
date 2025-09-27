const express = require('express');
const router = express.Router();
const mlService = require('../services/mlService');

// Enhanced Appointment Forecasting with ML
router.get('/appointments/optimal-times', async (req, res) => {
  try {
    const { date, doctor, appointment_type } = req.query;
    const patient_preferences = req.query.patient_preferences ? 
      JSON.parse(req.query.patient_preferences) : {};

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required'
      });
    }

    const result = await mlService.predictOptimalAppointmentSlots(
      date,
      doctor || 'Dr. Smith',
      appointment_type || 'General Consultation',
      patient_preferences
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Appointment forecasting error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// ED Triage Optimization
router.post('/emergency/triage-optimization', async (req, res) => {
  try {
    const { current_patients, available_staff, bed_status } = req.body;

    if (!current_patients || !Array.isArray(current_patients)) {
      return res.status(400).json({
        success: false,
        error: 'current_patients array is required'
      });
    }

    const result = await mlService.optimizeEDTriage(
      current_patients,
      available_staff || 5,
      bed_status || {}
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ED Triage optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Operating Room Scheduling Optimization
router.post('/surgery/schedule-optimization', async (req, res) => {
  try {
    const { surgeries, available_or_slots, staff_availability } = req.body;

    if (!surgeries || !Array.isArray(surgeries)) {
      return res.status(400).json({
        success: false,
        error: 'surgeries array is required'
      });
    }

    const result = await mlService.optimizeORScheduling(
      surgeries,
      available_or_slots || [],
      staff_availability || {}
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OR Scheduling optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Patient Transport Routing Optimization
router.post('/transport/routing-optimization', async (req, res) => {
  try {
    const { transport_requests, available_transport_teams, ambulance_availability } = req.body;

    if (!transport_requests || !Array.isArray(transport_requests)) {
      return res.status(400).json({
        success: false,
        error: 'transport_requests array is required'
      });
    }

    const result = await mlService.optimizeTransportRouting(
      transport_requests,
      available_transport_teams || [],
      ambulance_availability || {}
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Transport routing optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// ML Service Health Check
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await mlService.healthCheck();
    
    res.json({
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ML Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'ML service health check failed',
      details: error.message
    });
  }
});

// Comprehensive Healthcare Analytics Dashboard
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const { date_range, department } = req.query;
    
    // This would typically aggregate data from multiple ML models
    const dashboardData = {
      emergency_department: {
        current_patients: 12,
        average_wait_time: 18,
        triage_efficiency: 85,
        crowding_risk: 'Medium'
      },
      operating_rooms: {
        scheduled_surgeries: 8,
        utilization_rate: 78,
        idle_time_reduction: 22,
        bottleneck_alerts: 2
      },
      transport_services: {
        active_transports: 5,
        average_completion_time: 12,
        priority_compliance: 92,
        resource_utilization: 75
      },
      appointment_scheduling: {
        bookings_today: 45,
        optimal_slot_accuracy: 88,
        patient_satisfaction: 4.2,
        forecast_confidence: 'High'
      }
    };

    res.json({
      success: true,
      data: dashboardData,
      ml_enhanced: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics dashboard',
      details: error.message
    });
  }
});

// Real-time Patient Flow Optimization
router.post('/patient-flow/optimize', async (req, res) => {
  try {
    const { 
      emergency_patients, 
      scheduled_appointments, 
      surgery_queue, 
      transport_requests 
    } = req.body;

    // This would use multiple ML models to optimize overall patient flow
    const optimizationResult = {
      emergency_optimization: await mlService.optimizeEDTriage(
        emergency_patients || [], 5, {}
      ),
      appointment_optimization: await mlService.predictOptimalAppointmentSlots(
        new Date().toISOString().split('T')[0], 'Dr. System', 'General'
      ),
      surgery_optimization: await mlService.optimizeORScheduling(
        surgery_queue || [], [], {}
      ),
      transport_optimization: await mlService.optimizeTransportRouting(
        transport_requests || [], [], {}
      ),
      overall_recommendations: [
        'Reduce ED crowding by 15% through optimized triage',
        'Improve OR utilization by scheduling shorter procedures first',
        'Optimize transport routes to reduce travel time by 20%',
        'Adjust appointment scheduling to balance patient flow'
      ]
    };

    res.json({
      success: true,
      data: optimizationResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Patient flow optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize patient flow',
      details: error.message
    });
  }
});

// Predictive Analytics for Capacity Planning
router.get('/analytics/predictive-capacity', async (req, res) => {
  try {
    const { forecast_days = 7, department = 'all' } = req.query;
    
    // This would use time series forecasting to predict capacity needs
    const capacityForecast = {
      emergency_department: {
        predicted_patients: [45, 52, 38, 61, 47, 55, 49],
        recommended_staff: [8, 9, 7, 10, 8, 9, 8],
        bed_requirements: [12, 14, 10, 16, 13, 15, 13]
      },
      operating_rooms: {
        predicted_surgeries: [6, 8, 5, 9, 7, 8, 6],
        anesthesia_team_needs: [4, 5, 3, 6, 4, 5, 4],
        recovery_bed_demand: [8, 10, 6, 12, 9, 11, 8]
      },
      patient_transport: {
        predicted_requests: [12, 15, 9, 18, 14, 16, 13],
        transport_team_utilization: [75, 85, 65, 95, 80, 90, 78]
      }
    };

    res.json({
      success: true,
      data: capacityForecast,
      forecast_period: `${forecast_days} days`,
      confidence_level: 'High',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Predictive capacity analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate capacity forecast',
      details: error.message
    });
  }
});

module.exports = router;
