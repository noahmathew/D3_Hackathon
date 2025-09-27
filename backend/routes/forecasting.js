const express = require('express');
const router = express.Router();
const forecastingService = require('../services/forecastingService');

// Get optimal appointment times
router.get('/optimal-times', async (req, res) => {
  try {
    const { date, doctor, appointmentType } = req.query;
    
    if (!date || !doctor) {
      return res.status(400).json({ 
        error: 'Missing required parameters: date and doctor are required' 
      });
    }

    const prediction = forecastingService.predictOptimalTimes(date, doctor, appointmentType);
    
    res.json({
      success: true,
      data: prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Forecasting error:', error);
    res.status(500).json({ 
      error: 'Failed to generate optimal time predictions',
      message: error.message 
    });
  }
});

// Get capacity forecast for a specific date
router.get('/capacity', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        error: 'Missing required parameter: date' 
      });
    }

    const forecast = forecastingService.getCapacityForecast(date);
    
    res.json({
      success: true,
      data: forecast,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Capacity forecasting error:', error);
    res.status(500).json({ 
      error: 'Failed to generate capacity forecast',
      message: error.message 
    });
  }
});

// Get surgical scheduling recommendations
router.get('/surgical-recommendations', async (req, res) => {
  try {
    const { procedure, surgeon } = req.query;
    
    if (!procedure || !surgeon) {
      return res.status(400).json({ 
        error: 'Missing required parameters: procedure and surgeon are required' 
      });
    }

    const recommendations = forecastingService.getSurgicalRecommendations(procedure, surgeon);
    
    res.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Surgical recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to generate surgical recommendations',
      message: error.message 
    });
  }
});

// Get comprehensive appointment optimization
router.post('/optimize-appointment', async (req, res) => {
  try {
    const { 
      date, 
      doctor, 
      appointmentType, 
      patientPreferences = {},
      urgency = 'medium' 
    } = req.body;
    
    if (!date || !doctor) {
      return res.status(400).json({ 
        error: 'Missing required parameters: date and doctor are required' 
      });
    }

    // Get optimal times
    const optimalTimes = forecastingService.predictOptimalTimes(date, doctor, appointmentType);
    
    // Get capacity forecast
    const capacityForecast = forecastingService.getCapacityForecast(date);
    
    // Combine results with patient preferences
    const optimization = {
      date: date,
      doctor: doctor,
      appointmentType: appointmentType,
      urgency: urgency,
      optimalSlots: optimalTimes.optimalSlots,
      capacityForecast: capacityForecast,
      confidence: optimalTimes.confidence,
      reasoning: optimalTimes.reasoning,
      recommendations: generatePersonalizedRecommendations(
        optimalTimes.optimalSlots, 
        capacityForecast, 
        patientPreferences, 
        urgency
      )
    };
    
    res.json({
      success: true,
      data: optimization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Appointment optimization error:', error);
    res.status(500).json({ 
      error: 'Failed to optimize appointment',
      message: error.message 
    });
  }
});

// Helper function to generate personalized recommendations
function generatePersonalizedRecommendations(optimalSlots, capacityForecast, preferences, urgency) {
  const recommendations = [];
  
  // Urgency-based recommendations
  if (urgency === 'high') {
    recommendations.push('High urgency: Consider the earliest available slot');
  } else if (urgency === 'low') {
    recommendations.push('Low urgency: You can choose based on convenience');
  }
  
  // Capacity-based recommendations
  if (capacityForecast.capacity === 'Low') {
    recommendations.push('Hospital capacity is low - excellent time for appointments');
  } else if (capacityForecast.capacity === 'High') {
    recommendations.push('High hospital capacity - expect longer wait times');
  }
  
  // Time-based recommendations
  const bestSlot = optimalSlots[0];
  if (bestSlot && bestSlot.score > 7) {
    recommendations.push(`Best recommended time: ${bestSlot.time} - ${bestSlot.recommendation}`);
  }
  
  // Patient preference considerations
  if (preferences.timeOfDay) {
    const preferredSlots = optimalSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      if (preferences.timeOfDay === 'morning') return hour < 12;
      if (preferences.timeOfDay === 'afternoon') return hour >= 12 && hour < 17;
      if (preferences.timeOfDay === 'evening') return hour >= 17;
      return true;
    });
    
    if (preferredSlots.length > 0) {
      recommendations.push(`Your preferred time of day has ${preferredSlots.length} optimal slots available`);
    }
  }
  
  return recommendations;
}

// Get historical trends for analytics
router.get('/trends', async (req, res) => {
  try {
    const { days = 30, metric = 'patients_arrived' } = req.query;
    
    const trends = {
      dailyAverages: calculateDailyAverages(days, metric),
      hourlyPatterns: calculateHourlyPatterns(days, metric),
      weeklyPatterns: calculateWeeklyPatterns(days, metric),
      diseaseTrends: calculateDiseaseTrends(days),
      staffEfficiency: calculateStaffEfficiency(days)
    };
    
    res.json({
      success: true,
      data: trends,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Trends analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze trends',
      message: error.message 
    });
  }
});

// Helper functions for trend analysis
function calculateDailyAverages(days, metric) {
  // This would implement daily average calculations
  // For now, return mock data
  return {
    average: 15.2,
    trend: 'increasing',
    change: '+2.3%'
  };
}

function calculateHourlyPatterns(days, metric) {
  // This would implement hourly pattern analysis
  return {
    peakHours: [10, 14, 16],
    lowHours: [8, 12, 18],
    pattern: 'bimodal'
  };
}

function calculateWeeklyPatterns(days, metric) {
  // This would implement weekly pattern analysis
  return {
    busiestDay: 'Monday',
    quietestDay: 'Friday',
    weekendPattern: 'reduced'
  };
}

function calculateDiseaseTrends(days) {
  // This would implement disease trend analysis
  return {
    fluTrend: 'stable',
    covidTrend: 'decreasing',
    overallHealth: 'good'
  };
}

function calculateStaffEfficiency(days) {
  // This would implement staff efficiency analysis
  return {
    averageEfficiency: 0.75,
    trend: 'improving',
    recommendations: ['Consider additional staff during peak hours']
  };
}

module.exports = router;
