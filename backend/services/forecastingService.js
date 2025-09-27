const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

class ForecastingService {
  constructor() {
    this.forecastingData = [];
    this.schedulingData = [];
    this.transportData = [];
    this.loadData();
  }

  async loadData() {
    try {
      // Load forecasting data
      await this.loadCSVData(
        path.join(__dirname, '../../data/forecasting_dataset.csv'),
        this.forecastingData
      );
      
      // Load scheduling data
      await this.loadCSVData(
        path.join(__dirname, '../../data/or_scheduling_dataset.csv'),
        this.schedulingData
      );
      
      // Load transport data
      await this.loadCSVData(
        path.join(__dirname, '../../data/transport_routing_dataset.csv'),
        this.transportData
      );
      
      console.log('📊 Healthcare datasets loaded successfully');
      console.log(`- Forecasting data: ${this.forecastingData.length} records`);
      console.log(`- Scheduling data: ${this.schedulingData.length} records`);
      console.log(`- Transport data: ${this.transportData.length} records`);
    } catch (error) {
      console.error('Error loading datasets:', error);
    }
  }

  loadCSVData(filePath, targetArray) {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          targetArray.push(row);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // Predict optimal appointment times based on historical data
  predictOptimalTimes(date, doctor, appointmentType) {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = targetDate.getHours();
    
    // Get historical data for similar conditions
    const historicalData = this.forecastingData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getDay() === dayOfWeek;
    });

    if (historicalData.length === 0) {
      return this.getDefaultOptimalTimes();
    }

    // Calculate average patient arrivals by hour
    const hourlyAverages = this.calculateHourlyAverages(historicalData);
    
    // Calculate staff efficiency
    const staffEfficiency = this.calculateStaffEfficiency(historicalData);
    
    // Calculate disease burden impact
    const diseaseImpact = this.calculateDiseaseImpact(historicalData);
    
    // Generate optimal time slots
    const optimalSlots = this.generateOptimalSlots(hourlyAverages, staffEfficiency, diseaseImpact);
    
    return {
      date: date,
      doctor: doctor,
      appointmentType: appointmentType,
      optimalSlots: optimalSlots,
      confidence: this.calculateConfidence(historicalData.length),
      reasoning: this.generateReasoning(hourlyAverages, staffEfficiency, diseaseImpact)
    };
  }

  calculateHourlyAverages(data) {
    const hourlyStats = {};
    
    for (let hour = 0; hour < 24; hour++) {
      const hourData = data.filter(record => parseInt(record.hour) === hour);
      
      if (hourData.length > 0) {
        const avgPatients = hourData.reduce((sum, record) => sum + parseInt(record.patients_arrived), 0) / hourData.length;
        const avgStaff = hourData.reduce((sum, record) => sum + parseInt(record.staff_on_duty), 0) / hourData.length;
        const waitTime = avgPatients / avgStaff; // Simplified wait time calculation
        
        hourlyStats[hour] = {
          avgPatients: Math.round(avgPatients),
          avgStaff: Math.round(avgStaff),
          estimatedWaitTime: Math.round(waitTime * 10) / 10,
          efficiency: avgStaff > 0 ? Math.round((avgPatients / avgStaff) * 100) / 100 : 0
        };
      }
    }
    
    return hourlyStats;
  }

  calculateStaffEfficiency(data) {
    const totalPatients = data.reduce((sum, record) => sum + parseInt(record.patients_arrived), 0);
    const totalStaff = data.reduce((sum, record) => sum + parseInt(record.staff_on_duty), 0);
    
    return totalStaff > 0 ? totalPatients / totalStaff : 1;
  }

  calculateDiseaseImpact(data) {
    const totalFluCases = data.reduce((sum, record) => sum + parseInt(record.flu_cases), 0);
    const totalCovidCases = data.reduce((sum, record) => sum + parseInt(record.covid_cases), 0);
    const totalPatients = data.reduce((sum, record) => sum + parseInt(record.patients_arrived), 0);
    
    const diseaseBurden = (totalFluCases + totalCovidCases) / totalPatients;
    return Math.min(diseaseBurden, 1); // Cap at 1.0
  }

  generateOptimalSlots(hourlyAverages, staffEfficiency, diseaseImpact) {
    const slots = [];
    const preferredHours = [9, 10, 11, 14, 15, 16]; // Preferred appointment hours
    
    for (const hour of preferredHours) {
      if (hourlyAverages[hour]) {
        const efficiency = hourlyAverages[hour].efficiency;
        const waitTime = hourlyAverages[hour].estimatedWaitTime;
        
        // Calculate score (lower is better for wait time, higher is better for efficiency)
        const score = (efficiency * 0.7) + ((10 - waitTime) * 0.3);
        
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          efficiency: Math.round(efficiency * 100) / 100,
          estimatedWaitTime: waitTime,
          score: Math.round(score * 100) / 100,
          recommendation: this.getRecommendation(score, waitTime, efficiency)
        });
      }
    }
    
    // Sort by score (higher is better)
    return slots.sort((a, b) => b.score - a.score);
  }

  getRecommendation(score, waitTime, efficiency) {
    if (score > 7) return 'Excellent - Minimal wait time expected';
    if (score > 5) return 'Good - Reasonable wait time';
    if (score > 3) return 'Fair - Moderate wait time expected';
    return 'Busy - Longer wait time possible';
  }

  calculateConfidence(dataPoints) {
    if (dataPoints > 50) return 'High';
    if (dataPoints > 20) return 'Medium';
    return 'Low';
  }

  generateReasoning(hourlyAverages, staffEfficiency, diseaseImpact) {
    const insights = [];
    
    // Find best and worst hours
    const hours = Object.keys(hourlyAverages).map(h => parseInt(h));
    const bestHour = hours.reduce((best, hour) => 
      hourlyAverages[hour].efficiency > hourlyAverages[best].efficiency ? hour : best
    );
    const worstHour = hours.reduce((worst, hour) => 
      hourlyAverages[hour].efficiency < hourlyAverages[worst].efficiency ? hour : worst
    );
    
    insights.push(`Best time slot: ${bestHour}:00 (efficiency: ${hourlyAverages[bestHour].efficiency})`);
    insights.push(`Avoid: ${worstHour}:00 (efficiency: ${hourlyAverages[worstHour].efficiency})`);
    
    if (diseaseImpact > 0.1) {
      insights.push('High disease burden detected - expect longer processing times');
    }
    
    if (staffEfficiency < 1.5) {
      insights.push('Staff levels are adequate for expected patient volume');
    } else {
      insights.push('Staff may be stretched thin - consider off-peak hours');
    }
    
    return insights;
  }

  getDefaultOptimalTimes() {
    return {
      optimalSlots: [
        { time: '09:00', efficiency: 0.8, estimatedWaitTime: 2.5, score: 7.5, recommendation: 'Good morning slot' },
        { time: '10:00', efficiency: 0.7, estimatedWaitTime: 3.0, score: 6.4, recommendation: 'Popular time, moderate wait' },
        { time: '11:00', efficiency: 0.6, estimatedWaitTime: 4.0, score: 5.2, recommendation: 'Busier period' },
        { time: '14:00', efficiency: 0.9, estimatedWaitTime: 2.0, score: 8.2, recommendation: 'Excellent afternoon slot' },
        { time: '15:00', efficiency: 0.8, estimatedWaitTime: 2.5, score: 7.5, recommendation: 'Good afternoon slot' },
        { time: '16:00', efficiency: 0.7, estimatedWaitTime: 3.5, score: 6.1, recommendation: 'End of day rush' }
      ],
      confidence: 'Low',
      reasoning: ['Using default recommendations - insufficient historical data']
    };
  }

  // Get hospital capacity predictions
  getCapacityForecast(date) {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    
    const historicalData = this.forecastingData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getDay() === dayOfWeek;
    });

    if (historicalData.length === 0) {
      return { capacity: 'Unknown', recommendation: 'Insufficient data for prediction' };
    }

    const avgPatients = historicalData.reduce((sum, record) => sum + parseInt(record.patients_arrived), 0) / historicalData.length;
    const avgStaff = historicalData.reduce((sum, record) => sum + parseInt(record.staff_on_duty), 0) / historicalData.length;
    
    const capacityRatio = avgPatients / avgStaff;
    
    if (capacityRatio < 1.5) return { capacity: 'Low', recommendation: 'Excellent time for appointments' };
    if (capacityRatio < 2.5) return { capacity: 'Medium', recommendation: 'Normal capacity expected' };
    return { capacity: 'High', recommendation: 'Consider rescheduling to less busy times' };
  }

  // Get surgical scheduling recommendations
  getSurgicalRecommendations(procedure, surgeon) {
    const surgicalData = this.schedulingData.filter(record => 
      record.procedure === procedure && record.surgeon === surgeon
    );

    if (surgicalData.length === 0) {
      return { duration: 120, recommendation: 'Standard procedure time' };
    }

    const avgDuration = surgicalData.reduce((sum, record) => sum + parseInt(record.duration_min), 0) / surgicalData.length;
    const needsRecoveryBed = surgicalData.filter(record => record.recovery_bed_needed === 'True').length / surgicalData.length;

    return {
      duration: Math.round(avgDuration),
      needsRecoveryBed: needsRecoveryBed > 0.5,
      confidence: surgicalData.length > 5 ? 'High' : 'Medium',
      recommendation: `Based on ${surgicalData.length} similar procedures`
    };
  }
}

module.exports = new ForecastingService();
