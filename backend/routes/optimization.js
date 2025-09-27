const express = require('express');
const router = express.Router();
const forecastingService = require('../services/forecastingService');

// Get optimal scheduling recommendations
router.post('/schedule', async (req, res) => {
  try {
    const { 
      patientId, 
      doctorId, 
      appointmentType, 
      urgency = 'medium',
      preferences = {},
      dateRange = 7 // days to look ahead
    } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({
        error: 'Missing required parameters: patientId and doctorId'
      });
    }

    // Generate recommendations for the next week
    const recommendations = [];
    const today = new Date();
    
    for (let i = 1; i <= dateRange; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      const prediction = forecastingService.predictOptimalTimes(dateString, doctorId, appointmentType);
      
      if (prediction.optimalSlots.length > 0) {
        recommendations.push({
          date: dateString,
          dayOfWeek: checkDate.toLocaleDateString('en-US', { weekday: 'long' }),
          optimalSlots: prediction.optimalSlots.slice(0, 3), // Top 3 slots
          capacity: forecastingService.getCapacityForecast(dateString),
          confidence: prediction.confidence,
          reasoning: prediction.reasoning
        });
      }
    }

    // Sort by overall score (combination of slot scores and capacity)
    recommendations.sort((a, b) => {
      const scoreA = a.optimalSlots[0]?.score || 0;
      const scoreB = b.optimalSlots[0]?.score || 0;
      const capacityA = a.capacity.capacity === 'Low' ? 2 : a.capacity.capacity === 'Medium' ? 1 : 0;
      const capacityB = b.capacity.capacity === 'Low' ? 2 : b.capacity.capacity === 'Medium' ? 1 : 0;
      
      return (scoreB + capacityB) - (scoreA + capacityA);
    });

    res.json({
      success: true,
      data: {
        patientId,
        doctorId,
        appointmentType,
        urgency,
        recommendations,
        personalizedAdvice: generatePersonalizedAdvice(recommendations, preferences, urgency)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({
      error: 'Failed to generate optimization recommendations',
      message: error.message
    });
  }
});

// Get resource optimization suggestions
router.get('/resources', async (req, res) => {
  try {
    const { date, department } = req.query;
    
    if (!date) {
      return res.status(400).json({
        error: 'Date parameter is required'
      });
    }

    const capacityForecast = forecastingService.getCapacityForecast(date);
    const trends = await getResourceTrends(date);
    
    const optimization = {
      date,
      department: department || 'General',
      capacity: capacityForecast,
      recommendations: generateResourceRecommendations(capacityForecast, trends),
      staffSuggestions: generateStaffSuggestions(capacityForecast),
      equipmentSuggestions: generateEquipmentSuggestions(capacityForecast)
    };

    res.json({
      success: true,
      data: optimization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Resource optimization error:', error);
    res.status(500).json({
      error: 'Failed to generate resource optimization',
      message: error.message
    });
  }
});

// Get surgical optimization recommendations
router.post('/surgical', async (req, res) => {
  try {
    const { 
      procedure, 
      surgeon, 
      date, 
      patientUrgency = 'medium',
      availableResources = {}
    } = req.body;

    if (!procedure || !surgeon || !date) {
      return res.status(400).json({
        error: 'Missing required parameters: procedure, surgeon, date'
      });
    }

    const surgicalRec = forecastingService.getSurgicalRecommendations(procedure, surgeon);
    const capacityForecast = forecastingService.getCapacityForecast(date);
    
    const optimization = {
      procedure,
      surgeon,
      date,
      patientUrgency,
      estimatedDuration: surgicalRec.duration,
      needsRecoveryBed: surgicalRec.needsRecoveryBed,
      confidence: surgicalRec.confidence,
      recommendations: generateSurgicalRecommendations(surgicalRec, capacityForecast, patientUrgency),
      resourceRequirements: generateResourceRequirements(surgicalRec, availableResources),
      schedulingAdvice: generateSchedulingAdvice(surgicalRec, capacityForecast)
    };

    res.json({
      success: true,
      data: optimization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Surgical optimization error:', error);
    res.status(500).json({
      error: 'Failed to generate surgical optimization',
      message: error.message
    });
  }
});

// Helper functions
function generatePersonalizedAdvice(recommendations, preferences, urgency) {
  const advice = [];
  
  if (urgency === 'high') {
    advice.push('High urgency detected - prioritize earliest available slots');
  }
  
  if (preferences.timeOfDay) {
    const preferredDay = recommendations.find(rec => 
      rec.optimalSlots.some(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        if (preferences.timeOfDay === 'morning') return hour < 12;
        if (preferences.timeOfDay === 'afternoon') return hour >= 12 && hour < 17;
        if (preferences.timeOfDay === 'evening') return hour >= 17;
        return false;
      })
    );
    
    if (preferredDay) {
      advice.push(`Your preferred time of day is available on ${preferredDay.dayOfWeek}`);
    }
  }
  
  const bestDay = recommendations[0];
  if (bestDay && bestDay.capacity.capacity === 'Low') {
    advice.push(`Best day: ${bestDay.dayOfWeek} - Hospital capacity is low`);
  }
  
  return advice;
}

function generateResourceRecommendations(capacityForecast, trends) {
  const recommendations = [];
  
  if (capacityForecast.capacity === 'High') {
    recommendations.push('Consider additional staff allocation');
    recommendations.push('Prepare for extended wait times');
    recommendations.push('Optimize patient flow through triage');
  } else if (capacityForecast.capacity === 'Low') {
    recommendations.push('Good opportunity for routine procedures');
    recommendations.push('Consider scheduling maintenance tasks');
  }
  
  return recommendations;
}

function generateStaffSuggestions(capacityForecast) {
  if (capacityForecast.capacity === 'High') {
    return {
      additionalStaff: 'Consider 2-3 additional staff members',
      shiftCoverage: 'Ensure adequate coverage during peak hours',
      specialistAvailability: 'Verify specialist availability'
    };
  }
  
  return {
    additionalStaff: 'Current staffing appears adequate',
    shiftCoverage: 'Normal coverage sufficient',
    specialistAvailability: 'Standard specialist availability'
  };
}

function generateEquipmentSuggestions(capacityForecast) {
  if (capacityForecast.capacity === 'High') {
    return {
      equipmentCheck: 'Verify all equipment is operational',
      backupEquipment: 'Prepare backup equipment for high-demand items',
      maintenanceSchedule: 'Avoid scheduled maintenance during peak hours'
    };
  }
  
  return {
    equipmentCheck: 'Standard equipment check recommended',
    backupEquipment: 'Normal backup equipment levels',
    maintenanceSchedule: 'Maintenance can proceed as scheduled'
  };
}

function generateSurgicalRecommendations(surgicalRec, capacityForecast, urgency) {
  const recommendations = [];
  
  if (surgicalRec.needsRecoveryBed && capacityForecast.capacity === 'High') {
    recommendations.push('Consider rescheduling - recovery bed availability may be limited');
  }
  
  if (urgency === 'high') {
    recommendations.push('High urgency - prioritize immediate scheduling');
  }
  
  if (surgicalRec.confidence === 'High') {
    recommendations.push(`Duration estimate is highly reliable (${surgicalRec.duration} minutes)`);
  }
  
  return recommendations;
}

function generateResourceRequirements(surgicalRec, availableResources) {
  return {
    duration: surgicalRec.duration,
    recoveryBed: surgicalRec.needsRecoveryBed,
    anesthesiaTeam: 'Required',
    surgicalTeam: 'Required',
    estimatedResources: {
      staff: surgicalRec.duration > 120 ? 'Extended team' : 'Standard team',
      equipment: 'Standard surgical equipment',
      recovery: surgicalRec.needsRecoveryBed ? 'Recovery bed required' : 'No recovery bed needed'
    }
  };
}

function generateSchedulingAdvice(surgicalRec, capacityForecast) {
  const advice = [];
  
  if (capacityForecast.capacity === 'Low') {
    advice.push('Ideal time for scheduling - low hospital capacity');
  } else if (capacityForecast.capacity === 'High') {
    advice.push('Consider alternative scheduling - high hospital capacity');
  }
  
  if (surgicalRec.duration > 180) {
    advice.push('Long procedure - consider early morning scheduling');
  }
  
  return advice;
}

async function getResourceTrends(date) {
  // This would implement actual trend analysis
  // For now, return mock data
  return {
    staffTrend: 'stable',
    equipmentTrend: 'operational',
    capacityTrend: 'normal'
  };
}

module.exports = router;
