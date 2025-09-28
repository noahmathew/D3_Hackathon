"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarIcon, ClockIcon, BrainIcon, ZapIcon, UsersIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { apiService, MLAppointmentForecast } from '@/lib/api-enhanced'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { 
  generateDoctorAvailability, 
  getAvailableDates, 
  getAvailableTimeSlots,
  isTimeSlotAvailable,
  getDoctorInfo,
  DoctorAvailability
} from '@/lib/doctor-availability'

interface SmartAppointmentBookingProps {
  className?: string
}

interface TimeSlot {
  time: string
  available: boolean
  reason?: string
  forecast?: {
    optimal_score: number
    estimated_wait_time: number
    efficiency: number
    recommendation: string
  }
}

export function SmartAppointmentBooking({ className }: SmartAppointmentBookingProps) {
  const { patient, isAuthenticated, addAppointment } = useAuth()
  const [mlHealth, setMLHealth] = useState<{ ml_service_available: boolean; models_loaded: boolean }>({
    ml_service_available: false,
    models_loaded: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  // Doctor availability data
  const [doctorAvailability, setDoctorAvailability] = useState<DoctorAvailability[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [timeSlotForecast, setTimeSlotForecast] = useState<any>(null)
  const [quantumDelayInfo, setQuantumDelayInfo] = useState<any>(null)

  // Form data
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    time: '',
    appointmentType: 'General Consultation',
    reason: '',
    notes: ''
  })

  // Current step in the booking process
  const [currentStep, setCurrentStep] = useState<'doctor' | 'date' | 'time' | 'details'>('doctor')

  const appointmentTypes = [
    'General Consultation',
    'Follow-up',
    'Urgent Care',
    'Preventative Care',
    'Specialist Referral',
    'Annual Checkup'
  ]

  // Initialize doctor availability data
  useEffect(() => {
    const availability = generateDoctorAvailability()
    setDoctorAvailability(availability)
  }, [])

  // Check ML service health
  useEffect(() => {
    const checkMLServiceHealth = async () => {
      try {
        const response = await apiService.getMLHealth()
        setMLHealth(response.data)
      } catch (error) {
        console.error('Failed to fetch ML service health:', error)
        setMLHealth({ ml_service_available: false, models_loaded: false })
      }
    }
    checkMLServiceHealth()
  }, [])

  // Handle doctor selection
  const handleDoctorSelect = (doctorId: string) => {
    setFormData(prev => ({ ...prev, doctor: doctorId, date: '', time: '' }))
    setSelectedTimeSlot(null)
    setTimeSlotForecast(null)
    
    const dates = getAvailableDates(doctorId, doctorAvailability)
    setAvailableDates(dates)
    setAvailableTimeSlots([])
    setCurrentStep('date')
  }

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setFormData(prev => ({ ...prev, date, time: '' }))
    setSelectedTimeSlot(null)
    setTimeSlotForecast(null)
    
    const timeSlots = getAvailableTimeSlots(formData.doctor, date, doctorAvailability)
    setAvailableTimeSlots(timeSlots)
    setCurrentStep('time')
  }

  // Handle time slot selection
  const handleTimeSlotSelect = async (timeSlot: TimeSlot) => {
    if (!timeSlot.available) return
    
    setFormData(prev => ({ ...prev, time: timeSlot.time }))
    setSelectedTimeSlot(timeSlot)
    
    // Get ML forecast for the selected time slot
    if (mlHealth.ml_service_available && mlHealth.models_loaded) {
      setIsLoading(true)
      try {
        const forecast = await apiService.getOptimalAppointmentTimes(
          formData.date,
          formData.doctor,
          formData.appointmentType,
          {}, // patient preferences
          0,  // flu cases
          0,  // covid cases
          0   // staff on duty
        )
        
        // Find the forecast for the selected time slot
        const slotForecast = forecast.data?.all_slots?.find(
          (slot: any) => slot.time === timeSlot.time
        )
        
        if (slotForecast) {
          setTimeSlotForecast(slotForecast)
        }
      } catch (error) {
        console.error('Failed to get ML forecast:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    setCurrentStep('details')
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      setBookingError('Please log in to book an appointment')
      return
    }

    if (!selectedTimeSlot) {
      setBookingError('Please select an appointment time')
      return
    }

    setIsLoading(true)
    setBookingError(null)
    setShowSuccessAlert(false)

    try {
      const appointmentData = {
        patientId: patient?.id || '',
        date: formData.date,
        time: formData.time,
        doctor: formData.doctor,
        type: formData.appointmentType,
        reason: formData.reason,
        notes: formData.notes,
        status: 'scheduled' as const
      }

      await addAppointment(appointmentData)
      
      // Call quantum scheduler to predict delays
      try {
        const quantumResponse = await fetch('/api/ml/quantum/delay-prediction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointment_time: formData.time,
            doctor_id: formData.doctor,
            severity_score: 5 // Default severity score
          }),
        })

        if (quantumResponse.ok) {
          const quantumResult = await quantumResponse.json()
          setQuantumDelayInfo(quantumResult.data)
        }
      } catch (quantumError) {
        console.error('Quantum delay prediction failed:', quantumError)
        // Continue with appointment booking even if quantum prediction fails
      }
      
      setShowSuccessAlert(true)
      setBookingError(null)
      
      // Reset form
      setFormData({
        doctor: '',
        date: '',
        time: '',
        appointmentType: 'General Consultation',
        reason: '',
        notes: ''
      })
      setSelectedTimeSlot(null)
      setTimeSlotForecast(null)
      setCurrentStep('doctor')
      
    } catch (error) {
      console.error('Failed to book appointment:', error)
      setBookingError('An error occurred while booking your appointment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Get time slot speed feedback
  const getTimeSlotSpeed = (forecast: any) => {
    if (!forecast) return 'unknown'
    
    const waitTime = forecast.estimated_wait_time
    if (waitTime <= 15) return 'fast'
    if (waitTime <= 30) return 'okay'
    return 'slow'
  }

  // Get speed badge variant
  const getSpeedBadgeVariant = (speed: string) => {
    switch (speed) {
      case 'fast': return 'default'
      case 'okay': return 'secondary'
      case 'slow': return 'destructive'
      default: return 'outline'
    }
  }

  // Get speed badge text
  const getSpeedBadgeText = (speed: string) => {
    switch (speed) {
      case 'fast': return 'Fast'
      case 'okay': return 'Okay'
      case 'slow': return 'Slow'
      default: return 'Unknown'
    }
  }

  // Get doctor name from ID
  const getDoctorName = (doctorId: string) => {
    const doctor = doctorAvailability.find(d => d.doctorId === doctorId)
    return doctor?.doctorName || doctorId
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BrainIcon className="h-6 w-6 text-primary" />
            <CardTitle>Smart Appointment Booking</CardTitle>
            {mlHealth.ml_service_available && (
              <Badge variant="default" className="ml-auto">
                <ZapIcon className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            )}
          </div>
          <CardDescription>
            Book your appointment with AI-powered scheduling and availability checking
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isAuthenticated && (
            <Alert>
              <UsersIcon className="h-4 w-4" />
              <AlertDescription>
                Please log in to book an appointment. <a href="/patient-portal" className="underline">Go to Patient Portal</a>
              </AlertDescription>
            </Alert>
          )}

          {showSuccessAlert && (
            <Alert className="border-green-200 bg-green-50">
              <CalendarIcon className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Appointment Booked Successfully!</strong><br />
                Your appointment with {getDoctorName(formData.doctor)} on {formData.date} at {formData.time} has been confirmed. 
                You can view it in your <a href="/patient-portal" className="underline font-medium">Patient Portal</a>.
              </AlertDescription>
            </Alert>
          )}

      {quantumDelayInfo && (
        <Alert className="border-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <BrainIcon className="h-5 w-5 text-purple-600" />
          <AlertDescription>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-purple-800 text-lg">
                  🧠 QUANTUM STATUS
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  quantumDelayInfo.delay_expected 
                    ? 'bg-orange-100 text-orange-800 border border-orange-300' 
                    : 'bg-green-100 text-green-800 border border-green-300'
                }`}>
                  {quantumDelayInfo.delay_expected 
                    ? `DELAY EST. ${quantumDelayInfo.estimated_delay_minutes} MIN`
                    : 'ON-TIME'
                  }
                </div>
              </div>
              <div>
                {quantumDelayInfo.delay_expected ? (
                  <>
                    <div className="font-medium text-orange-800">⚠️ Potential delay expected</div>
                    <div className="text-sm text-orange-600 mt-1">Reason: {quantumDelayInfo.reason}</div>
                  </>
                ) : (
                  <>
                    <div className="font-medium text-green-800">✅ Your appointment is expected to be on time</div>
                    <div className="text-sm text-green-600 mt-1">Reason: {quantumDelayInfo.reason}</div>
                  </>
                )}
              </div>
              <div className="text-xs text-purple-600 font-medium">
                Powered by Grover's Quantum Algorithm
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

          {bookingError && (
            <Alert variant="destructive">
              <AlertDescription>
                {bookingError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Doctor Selection */}
            {currentStep === 'doctor' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <h3 className="text-lg font-semibold">Select a Doctor</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctorAvailability.map((doctor) => (
                    <Card 
                      key={doctor.doctorId}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.doctor === doctor.doctorId ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleDoctorSelect(doctor.doctorId)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{doctor.doctorName}</h4>
                            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Working: {doctor.workingDays.map(d => 
                                ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
                              ).join(', ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Hours: {doctor.workingHours.start}:00 - {doctor.workingHours.end}:00
                            </p>
                          </div>
                          {formData.doctor === doctor.doctorId && (
                            <CheckCircleIcon className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date Selection */}
            {currentStep === 'date' && formData.doctor && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <h3 className="text-lg font-semibold">Select a Date</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentStep('doctor')}
                  >
                    Change Doctor
                  </Button>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Selected: <strong>{getDoctorName(formData.doctor)}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Available dates starting today (next 30 days):
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {availableDates.slice(0, 12).map((date) => {
                    const isToday = date === new Date().toISOString().split('T')[0]
                    return (
                      <Button
                        key={date}
                        type="button"
                        variant={formData.date === date ? "default" : "outline"}
                        className={`text-xs ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => handleDateSelect(date)}
                      >
                        <div className="flex flex-col items-center">
                          {new Date(date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          {isToday && (
                            <span className="text-[10px] font-medium text-blue-600">TODAY</span>
                          )}
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Time Slot Selection */}
            {currentStep === 'time' && formData.date && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <h3 className="text-lg font-semibold">Select a Time Slot</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentStep('date')}
                  >
                    Change Date
                  </Button>
                </div>

                {formData.date === new Date().toISOString().split('T')[0] && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Booking for Today
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      You can book an appointment for today! Available time slots are shown below.
                    </p>
                  </div>
                )}
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>{getDoctorName(formData.doctor)}</strong> - {new Date(formData.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableTimeSlots.map((slot) => {
                    const speed = slot.forecast ? getTimeSlotSpeed(slot.forecast) : 'unknown'
                    return (
                      <Card
                        key={slot.time}
                        className={`cursor-pointer transition-all ${
                          slot.available 
                            ? selectedTimeSlot?.time === slot.time
                              ? 'ring-2 ring-primary bg-primary/5'
                              : 'hover:bg-accent/50'
                            : 'opacity-60 bg-muted cursor-not-allowed'
                        }`}
                        onClick={() => handleTimeSlotSelect(slot)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm">{slot.time}</div>
                            <div className="flex items-center gap-1">
                              {slot.available ? (
                                <>
                                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                  {slot.forecast && (
                                    <Badge 
                                      variant={getSpeedBadgeVariant(speed)} 
                                      className="text-xs"
                                    >
                                      {getSpeedBadgeText(speed)}
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <XCircleIcon className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>
                          {slot.available ? (
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Available</div>
                              {slot.forecast && (
                                <>
                                  <div>Wait: ~{slot.forecast.estimated_wait_time} min</div>
                                  <div>Score: {slot.forecast.optimal_score.toFixed(1)}/10</div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              {slot.reason}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Appointment Details */}
            {currentStep === 'details' && selectedTimeSlot && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <h3 className="text-lg font-semibold">Appointment Details</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentStep('time')}
                  >
                    Change Time
                  </Button>
                </div>

                {/* Selected Time Slot with Forecast */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ClockIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Selected Time Slot</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-medium">{selectedTimeSlot.time}</span>
                        {timeSlotForecast && (
                          <Badge variant={getSpeedBadgeVariant(getTimeSlotSpeed(timeSlotForecast))}>
                            {getSpeedBadgeText(getTimeSlotSpeed(timeSlotForecast))}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-blue-700">
                        <strong>{getDoctorName(formData.doctor)}</strong> • {new Date(formData.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>

                      {timeSlotForecast && (
                        <div className="text-sm text-blue-700 space-y-1">
                          <div>Estimated wait: ~{timeSlotForecast.estimated_wait_time} minutes</div>
                          <div>Efficiency: {timeSlotForecast.efficiency.toFixed(1)}/10</div>
                          <div className="text-xs">{timeSlotForecast.recommendation}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Appointment Details Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointmentType">Appointment Type</Label>
                    <Select
                      value={formData.appointmentType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Visit</Label>
                    <Input
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Brief description of your concern"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional information you'd like to share..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isAuthenticated || !selectedTimeSlot || isLoading}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {isLoading ? 'Booking...' : 'Book Appointment'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}