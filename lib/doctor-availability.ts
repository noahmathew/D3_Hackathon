// Doctor availability data structure
export interface DoctorAvailability {
  doctorId: string
  doctorName: string
  specialty: string
  workingDays: number[] // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  workingHours: {
    start: number // Hour in 24h format (e.g., 9 for 9 AM)
    end: number   // Hour in 24h format (e.g., 17 for 5 PM)
  }
  availableTimeSlots: {
    [date: string]: {
      [hour: string]: {
        available: boolean
        reason?: string
        forecast?: {
          optimal_score: number
          estimated_wait_time: number
          efficiency: number
          recommendation: string
        }
      }
    }
  }
}

// Generate realistic forecast data based on healthcare patterns
const generateRealisticForecast = (hour: number, dayOfWeek: number, specialty: string) => {
  // Base patterns for different times of day
  let baseWaitTime = 15
  let baseScore = 7
  let baseEfficiency = 7.5
  
  // Morning slots (9-11 AM) - typically good
  if (hour >= 9 && hour <= 11) {
    baseWaitTime = 12 + Math.random() * 8 // 12-20 minutes
    baseScore = 8 + Math.random() * 2 // 8-10
    baseEfficiency = 8 + Math.random() * 1.5 // 8-9.5
  }
  // Mid-morning (11 AM - 1 PM) - moderate
  else if (hour >= 11 && hour <= 13) {
    baseWaitTime = 18 + Math.random() * 12 // 18-30 minutes
    baseScore = 6 + Math.random() * 2 // 6-8
    baseEfficiency = 6.5 + Math.random() * 1.5 // 6.5-8
  }
  // Afternoon (1-4 PM) - typically good
  else if (hour >= 13 && hour <= 16) {
    baseWaitTime = 10 + Math.random() * 10 // 10-20 minutes
    baseScore = 7.5 + Math.random() * 2 // 7.5-9.5
    baseEfficiency = 7.5 + Math.random() * 1.5 // 7.5-9
  }
  // Late afternoon (4-5 PM) - can be busy
  else if (hour >= 16 && hour <= 17) {
    baseWaitTime = 20 + Math.random() * 15 // 20-35 minutes
    baseScore = 5 + Math.random() * 2 // 5-7
    baseEfficiency = 6 + Math.random() * 1.5 // 6-7.5
  }
  
  // Weekend adjustments
  if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
    baseWaitTime *= 0.8 // Shorter waits on weekends
    baseScore += 1 // Better scores on weekends
    baseEfficiency += 0.5
  }
  
  // Specialty adjustments
  if (specialty === 'Cardiology') {
    baseWaitTime *= 1.2 // Cardiologists often have longer appointments
    baseScore -= 0.5
  } else if (specialty === 'Pediatrics') {
    baseWaitTime *= 0.9 // Pediatric appointments tend to be quicker
    baseScore += 0.3
  } else if (specialty === 'Emergency' || specialty === 'Urgent Care') {
    baseWaitTime *= 1.5 // Emergency/urgent care can have longer waits
    baseScore -= 1
  }
  
  // Add some randomness
  const waitTime = Math.max(5, Math.round(baseWaitTime + (Math.random() - 0.5) * 10))
  const optimalScore = Math.max(1, Math.min(10, baseScore + (Math.random() - 0.5) * 2))
  const efficiency = Math.max(1, Math.min(10, baseEfficiency + (Math.random() - 0.5) * 2))
  
  // Generate recommendation based on score and wait time
  let recommendation = 'Standard availability'
  if (optimalScore >= 8 && waitTime <= 15) {
    recommendation = 'Excellent - Minimal wait time expected'
  } else if (optimalScore >= 6 && waitTime <= 25) {
    recommendation = 'Good - Reasonable wait time'
  } else if (optimalScore >= 4 && waitTime <= 35) {
    recommendation = 'Fair - Moderate wait time expected'
  } else {
    recommendation = 'Busy - Longer wait time possible'
  }
  
  return {
    optimal_score: Math.round(optimalScore * 10) / 10,
    estimated_wait_time: waitTime,
    efficiency: Math.round(efficiency * 10) / 10,
    recommendation
  }
}

// Generate fake availability data for doctors
export const generateDoctorAvailability = (): DoctorAvailability[] => {
  const doctors = [
    { id: 'dr-smith', name: 'Dr. Sarah Smith', specialty: 'Internal Medicine' },
    { id: 'dr-johnson', name: 'Dr. Michael Johnson', specialty: 'Cardiology' },
    { id: 'dr-williams', name: 'Dr. Emily Williams', specialty: 'Pediatrics' },
    { id: 'dr-brown', name: 'Dr. David Brown', specialty: 'Orthopedics' },
    { id: 'dr-davis', name: 'Dr. Lisa Davis', specialty: 'Dermatology' }
  ]

  const availability: DoctorAvailability[] = []

  doctors.forEach(doctor => {
    // Generate working days (Monday to Friday for most, some work weekends)
    const workingDays = [1, 2, 3, 4, 5] // Monday to Friday
    if (Math.random() > 0.7) {
      workingDays.push(6) // Some work Saturdays
    }

    // Generate working hours (most work 9-17, some have different hours)
    const startHour = Math.random() > 0.8 ? 8 : 9
    const endHour = Math.random() > 0.8 ? 18 : 17

    const doctorAvailability: DoctorAvailability = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      workingDays,
      workingHours: { start: startHour, end: endHour },
      availableTimeSlots: {}
    }

    // Generate availability for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()

      // Skip if doctor doesn't work on this day
      if (!workingDays.includes(dayOfWeek)) {
        continue
      }

      // Skip weekends for most doctors (except those who work weekends)
      if (dayOfWeek === 0 && !workingDays.includes(0)) {
        continue
      }

      doctorAvailability.availableTimeSlots[dateString] = {}

      // Generate hourly slots from start to end hour
      for (let hour = startHour; hour < endHour; hour++) {
        const hourString = `${hour.toString().padStart(2, '0')}:00`
        
        // Randomly make some slots unavailable
        const isAvailable = Math.random() > 0.3 // 70% chance of being available
        
        if (!isAvailable) {
          const reasons = [
            'Already booked',
            'Lunch break',
            'Surgery scheduled',
            'Consultation',
            'Research time',
            'Administrative work'
          ]
          doctorAvailability.availableTimeSlots[dateString][hourString] = {
            available: false,
            reason: reasons[Math.floor(Math.random() * reasons.length)]
          }
        } else {
          // Generate realistic forecast data based on healthcare patterns
          const forecast = generateRealisticForecast(hour, dayOfWeek, doctor.specialty)
          
          doctorAvailability.availableTimeSlots[dateString][hourString] = {
            available: true,
            forecast
          }
        }
      }
    }

    availability.push(doctorAvailability)
  })

  return availability
}

// Get available dates for a specific doctor
export const getAvailableDates = (doctorId: string, availability: DoctorAvailability[]): string[] => {
  const doctor = availability.find(d => d.doctorId === doctorId)
  if (!doctor) return []

  return Object.keys(doctor.availableTimeSlots).sort()
}

// Get available time slots for a specific doctor and date
export const getAvailableTimeSlots = (
  doctorId: string, 
  date: string, 
  availability: DoctorAvailability[]
): { time: string; available: boolean; reason?: string; forecast?: any }[] => {
  const doctor = availability.find(d => d.doctorId === doctorId)
  if (!doctor || !doctor.availableTimeSlots[date]) return []

  return Object.entries(doctor.availableTimeSlots[date]).map(([time, slot]) => ({
    time,
    available: slot.available,
    reason: slot.reason,
    forecast: slot.forecast
  }))
}

// Check if a specific time slot is available
export const isTimeSlotAvailable = (
  doctorId: string,
  date: string,
  time: string,
  availability: DoctorAvailability[]
): boolean => {
  const doctor = availability.find(d => d.doctorId === doctorId)
  if (!doctor || !doctor.availableTimeSlots[date] || !doctor.availableTimeSlots[date][time]) {
    return false
  }
  return doctor.availableTimeSlots[date][time].available
}

// Get doctor information
export const getDoctorInfo = (doctorId: string, availability: DoctorAvailability[]) => {
  return availability.find(d => d.doctorId === doctorId)
}
