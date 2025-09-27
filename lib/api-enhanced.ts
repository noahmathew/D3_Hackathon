// Enhanced API service with ML-powered healthcare optimization
const API_BASE_URL = 'http://localhost:3001/api'

export interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  insurance: string
  emergencyContact: string
  emergencyPhone: string
  isNewPatient: boolean
}

export interface Appointment {
  id: string
  patientId: string
  date: string
  time: string
  doctor: string
  type: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

export interface OptimalTimeSlot {
  time: string
  predicted_patients?: number
  estimated_wait_time: number
  efficiency: number
  optimal_score: number
  staff_availability?: number
  recommendation: string
  confidence?: string
}

export interface MLAppointmentForecast {
  success: boolean
  date: string
  doctor: string
  appointment_type: string
  optimal_slots: OptimalTimeSlot[]
  forecasting_confidence: string
  insights: string[]
  recommended_time: string
  ml_enhanced: boolean
}

export interface EDTriageOptimization {
  success: boolean
  optimized_queue: Array<{
    patient_id: string
    priority_score: number
    recommended_doctor: string
    estimated_wait_time: number
    bed_availability_probability: number
    mortality_risk: string
  }>
  total_wait_time_reduction: number
  crowding_risk: string
  ml_enhanced: boolean
}

export interface ORSchedulingOptimization {
  success: boolean
  optimal_schedule: Array<{
    surgery: any
    or_slot: string
    start_time: number
    end_time: number
    room: string
  }>
  total_utilization: number
  idle_time_reduction: number
  bottleneck_analysis: any[]
  ml_enhanced: boolean
}

export interface TransportRoutingOptimization {
  success: boolean
  optimized_routes: Array<{
    patient_id: string
    origin: string
    destination: string
    urgency: string
    assigned_team: string
    estimated_travel_time: number
    optimal_path: string[]
  }>
  total_travel_time_reduction: number
  resource_utilization: number
  priority_compliance: {
    compliance: number
    violations: any[]
  }
  ml_enhanced: boolean
}

export interface PatientPreferences {
  preferred_times?: string[]
  avoid_times?: string[]
  preferred_doctors?: string[]
  urgency_level?: 'low' | 'medium' | 'high'
}

class EnhancedAPIService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Enhanced Appointment Forecasting with ML
  async getOptimalAppointmentTimes(
    date: string,
    doctor: string,
    appointmentType: string = 'General Consultation',
    patientPreferences?: PatientPreferences
  ): Promise<MLAppointmentForecast> {
    try {
      // Try ML-enhanced endpoint first
      const params = new URLSearchParams({
        date,
        doctor,
        appointment_type: appointmentType,
        ...(patientPreferences && { patient_preferences: JSON.stringify(patientPreferences) })
      })

      const response = await this.makeRequest<{ success: boolean; data: MLAppointmentForecast }>(
        `/ml/appointments/optimal-times?${params}`
      )

      return response.data
    } catch (error) {
      console.warn('ML appointment forecasting failed, falling back to basic forecasting:', error)
      
      // Fallback to original forecasting endpoint
      const params = new URLSearchParams({ date, doctor })
      const response = await this.makeRequest<{ success: boolean; data: any }>(
        `/forecasting/optimal-times?${params}`
      )

      // Convert original response to ML format
      return {
        success: true,
        date,
        doctor,
        appointment_type: appointmentType,
        optimal_slots: response.data.optimalSlots || [],
        forecasting_confidence: response.data.confidence || 'Medium',
        insights: response.data.reasoning || [],
        recommended_time: response.data.optimalSlots?.[0]?.time || '09:00',
        ml_enhanced: false
      }
    }
  }

  // ED Triage Optimization
  async optimizeEDTriage(
    currentPatients: any[],
    availableStaff: number = 5,
    bedStatus: Record<string, any> = {}
  ): Promise<EDTriageOptimization> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: EDTriageOptimization }>(
        '/ml/emergency/triage-optimization',
        {
          method: 'POST',
          body: JSON.stringify({
            current_patients: currentPatients,
            available_staff: availableStaff,
            bed_status: bedStatus
          })
        }
      )

      return response.data
    } catch (error) {
      console.warn('ED Triage optimization failed, using fallback:', error)
      
      // Fallback: simple priority sorting
      return {
        success: true,
        optimized_queue: currentPatients
          .map((patient, index) => ({
            patient_id: patient.patient_id || `P${index + 1}`,
            priority_score: patient.severity_score || 5,
            recommended_doctor: patient.doctor_needed || 'General Practitioner',
            estimated_wait_time: (patient.severity_score || 5) * 3,
            bed_availability_probability: 0.7,
            mortality_risk: patient.severity_score > 8 ? 'High' : 'Medium'
          }))
          .sort((a, b) => b.priority_score - a.priority_score),
        total_wait_time_reduction: 15,
        crowding_risk: currentPatients.length > 15 ? 'High' : 'Medium',
        ml_enhanced: false
      }
    }
  }

  // OR Scheduling Optimization
  async optimizeORScheduling(
    surgeries: any[],
    availableORSlots: any[] = [],
    staffAvailability: Record<string, any> = {}
  ): Promise<ORSchedulingOptimization> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: ORSchedulingOptimization }>(
        '/ml/surgery/schedule-optimization',
        {
          method: 'POST',
          body: JSON.stringify({
            surgeries,
            available_or_slots: availableORSlots,
            staff_availability: staffAvailability
          })
        }
      )

      return response.data
    } catch (error) {
      console.warn('OR Scheduling optimization failed, using fallback:', error)
      
      // Fallback: simple scheduling
      return {
        success: true,
        optimal_schedule: surgeries.map((surgery, index) => ({
          surgery,
          or_slot: `OR${(index % 3) + 1}`,
          start_time: 480 + (index * 120), // 8:00 AM + 2 hours per surgery
          end_time: 480 + ((index + 1) * 120),
          room: `OR-${(index % 3) + 1}`
        })),
        total_utilization: 75,
        idle_time_reduction: 15,
        bottleneck_analysis: [],
        ml_enhanced: false
      }
    }
  }

  // Transport Routing Optimization
  async optimizeTransportRouting(
    transportRequests: any[],
    availableTransportTeams: string[] = [],
    ambulanceAvailability: Record<string, boolean> = {}
  ): Promise<TransportRoutingOptimization> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: TransportRoutingOptimization }>(
        '/ml/transport/routing-optimization',
        {
          method: 'POST',
          body: JSON.stringify({
            transport_requests: transportRequests,
            available_transport_teams: availableTransportTeams,
            ambulance_availability: ambulanceAvailability
          })
        }
      )

      return response.data
    } catch (error) {
      console.warn('Transport routing optimization failed, using fallback:', error)
      
      // Fallback: simple assignment
      return {
        success: true,
        optimized_routes: transportRequests.map((request, index) => ({
          patient_id: request.patient_id || `P${index + 1}`,
          origin: request.origin || 'ED',
          destination: request.destination || 'Ward 1',
          urgency: request.urgency || 'Medium',
          assigned_team: `Team-${String.fromCharCode(65 + (index % 3))}`,
          estimated_travel_time: 10 + (index * 5),
          optimal_path: [request.origin || 'ED', request.destination || 'Ward 1']
        })),
        total_travel_time_reduction: 20,
        resource_utilization: 80,
        priority_compliance: { compliance: 85, violations: [] },
        ml_enhanced: false
      }
    }
  }

  // ML Service Health Check
  async checkMLHealth(): Promise<{ ml_service_available: boolean; models_loaded: boolean }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: any }>('/ml/health')
      return {
        ml_service_available: response.data.ml_service_available || false,
        models_loaded: response.data.models_loaded || false
      }
    } catch (error) {
      return {
        ml_service_available: false,
        models_loaded: false
      }
    }
  }

  // Original API methods (for backward compatibility)
  async registerPatient(patientData: Partial<Patient>): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ success: boolean }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(patientData)
      })
      return response.success
    } catch (error) {
      console.error('Patient registration failed:', error)
      return false
    }
  }

  async loginPatient(email: string, password: string): Promise<{ success: boolean; token?: string; patient?: Patient }> {
    try {
      const response = await this.makeRequest<{ success: boolean; token?: string; patient?: Patient }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      return response
    } catch (error) {
      console.error('Patient login failed:', error)
      return { success: false }
    }
  }

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: Appointment[] }>(`/appointments/patient/${patientId}`)
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch patient appointments:', error)
      return []
    }
  }

  async createAppointment(appointmentData: Partial<Appointment>): Promise<{ success: boolean; appointment?: Appointment }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data: Appointment }>('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      })
      return { success: response.success, appointment: response.data }
    } catch (error) {
      console.error('Failed to create appointment:', error)
      return { success: false }
    }
  }

  async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<{ success: boolean }> {
    try {
      const response = await this.makeRequest<{ success: boolean }>(`/appointments/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      return { success: response.success }
    } catch (error) {
      console.error('Failed to update appointment:', error)
      return { success: false }
    }
  }

  async cancelAppointment(appointmentId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.makeRequest<{ success: boolean }>(`/appointments/${appointmentId}/cancel`, {
        method: 'PATCH'
      })
      return { success: response.success }
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
      return { success: false }
    }
  }
}

export const apiService = new EnhancedAPIService()
