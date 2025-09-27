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
import { CalendarIcon, ClockIcon, BrainIcon, ZapIcon, UsersIcon } from 'lucide-react'
import { apiService, MLAppointmentForecast, OptimalTimeSlot, PatientPreferences } from '@/lib/api-enhanced'
import { useAuth } from '@/contexts/auth-context'

interface SmartAppointmentBookingProps {
  className?: string
}

export function SmartAppointmentBooking({ className }: SmartAppointmentBookingProps) {
  const { patient, isAuthenticated } = useAuth()
  const [mlHealth, setMLHealth] = useState<{ ml_service_available: boolean; models_loaded: boolean }>({
    ml_service_available: false,
    models_loaded: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [forecast, setForecast] = useState<MLAppointmentForecast | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<OptimalTimeSlot | null>(null)
  const [showPreferences, setShowPreferences] = useState(false)
  const [patientPreferences, setPatientPreferences] = useState<PatientPreferences>({})

  // Form data
  const [formData, setFormData] = useState({
    date: '',
    doctor: '',
    appointmentType: 'General Consultation',
    reason: '',
    preferredTime: '',
    notes: ''
  })

  const doctors = [
    { id: 'dr-smith', name: 'Dr. Sarah Smith', specialty: 'Internal Medicine' },
    { id: 'dr-johnson', name: 'Dr. Michael Johnson', specialty: 'Cardiology' },
    { id: 'dr-williams', name: 'Dr. Emily Williams', specialty: 'Pediatrics' },
    { id: 'dr-brown', name: 'Dr. David Brown', specialty: 'Orthopedics' },
    { id: 'dr-davis', name: 'Dr. Lisa Davis', specialty: 'Dermatology' }
  ]

  const appointmentTypes = [
    'General Consultation',
    'Follow-up Visit',
    'Annual Checkup',
    'Urgent Care',
    'Specialist Referral',
    'Vaccination',
    'Lab Results Review'
  ]

  useEffect(() => {
    checkMLHealth()
    if (patient) {
      setFormData(prev => ({
        ...prev,
        doctor: patient.appointments?.[0]?.doctor || '',
        preferredTime: patient.appointments?.[0]?.time || ''
      }))
    }
  }, [patient])

  const checkMLHealth = async () => {
    try {
      const health = await apiService.checkMLHealth()
      setMLHealth(health)
    } catch (error) {
      console.error('Failed to check ML health:', error)
    }
  }

  const handleDateChange = async (date: string) => {
    setFormData(prev => ({ ...prev, date }))
    
    if (date && formData.doctor) {
      await getOptimalTimes(date, formData.doctor, formData.appointmentType)
    }
  }

  const handleDoctorChange = async (doctor: string) => {
    setFormData(prev => ({ ...prev, doctor }))
    
    if (formData.date && doctor) {
      await getOptimalTimes(formData.date, doctor, formData.appointmentType)
    }
  }

  const getOptimalTimes = async (date: string, doctor: string, appointmentType: string) => {
    if (!date || !doctor) return

    setIsLoading(true)
    try {
      const result = await apiService.getOptimalAppointmentTimes(
        date,
        doctor,
        appointmentType,
        patientPreferences
      )
      setForecast(result)
    } catch (error) {
      console.error('Failed to get optimal times:', error)
      setForecast(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSlotSelect = (slot: OptimalTimeSlot) => {
    setSelectedSlot(slot)
    setFormData(prev => ({ ...prev, preferredTime: slot.time }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      alert('Please log in to book an appointment')
      return
    }

    if (!selectedSlot) {
      alert('Please select an appointment time')
      return
    }

    setIsLoading(true)
    try {
      const appointmentData = {
        patientId: patient?.id || '',
        date: formData.date,
        time: selectedSlot.time,
        doctor: formData.doctor,
        type: formData.appointmentType,
        status: 'scheduled' as const,
        notes: formData.reason
      }

      const result = await apiService.createAppointment(appointmentData)
      
      if (result.success) {
        alert('Appointment booked successfully!')
        // Reset form
        setFormData({
          date: '',
          doctor: '',
          appointmentType: 'General Consultation',
          reason: '',
          preferredTime: '',
          notes: ''
        })
        setForecast(null)
        setSelectedSlot(null)
      } else {
        alert('Failed to book appointment. Please try again.')
      }
    } catch (error) {
      console.error('Failed to book appointment:', error)
      alert('An error occurred while booking your appointment.')
    } finally {
      setIsLoading(false)
    }
  }

  const getSlotBadgeVariant = (score: number) => {
    if (score >= 8) return 'default' // Excellent
    if (score >= 6) return 'secondary' // Good
    if (score >= 4) return 'outline' // Fair
    return 'destructive' // Poor
  }

  const getSlotBadgeText = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Busy'
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
            Get AI-powered recommendations for the best appointment times based on historical data and current conditions.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor</Label>
                <Select value={formData.doctor} onValueChange={handleDoctorChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.name}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentType">Appointment Type</Label>
                <Select 
                  value={formData.appointmentType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreferences(!showPreferences)}
              >
                <BrainIcon className="h-4 w-4 mr-2" />
                {showPreferences ? 'Hide' : 'Show'} AI Preferences
              </Button>
            </div>

            {showPreferences && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Optimization Preferences</CardTitle>
                  <CardDescription>
                    Help the AI find the best appointment time for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preferred Times</Label>
                      <Select 
                        value={patientPreferences.preferred_times?.[0] || ''} 
                        onValueChange={(value) => setPatientPreferences(prev => ({ 
                          ...prev, 
                          preferred_times: value ? [value] : [] 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">Morning (9:00 AM)</SelectItem>
                          <SelectItem value="10:00">Late Morning (10:00 AM)</SelectItem>
                          <SelectItem value="14:00">Afternoon (2:00 PM)</SelectItem>
                          <SelectItem value="15:00">Late Afternoon (3:00 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Urgency Level</Label>
                      <Select 
                        value={patientPreferences.urgency_level || 'medium'} 
                        onValueChange={(value: 'low' | 'medium' | 'high') => setPatientPreferences(prev => ({ 
                          ...prev, 
                          urgency_level: value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Flexible timing</SelectItem>
                          <SelectItem value="medium">Medium - Prefer optimal times</SelectItem>
                          <SelectItem value="high">High - Need earliest available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {forecast && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-primary" />
                    <CardTitle>AI-Recommended Time Slots</CardTitle>
                    <Badge variant={forecast.ml_enhanced ? 'default' : 'secondary'}>
                      {forecast.forecasting_confidence} Confidence
                    </Badge>
                  </div>
                  <CardDescription>
                    Based on historical data, current conditions, and your preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {forecast.optimal_slots.map((slot, index) => (
                      <Card
                        key={slot.time}
                        className={`cursor-pointer transition-all ${
                          selectedSlot?.time === slot.time
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:bg-accent/50'
                        }`}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{slot.time}</div>
                            <Badge variant={getSlotBadgeVariant(slot.optimal_score)}>
                              {getSlotBadgeText(slot.optimal_score)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Wait: ~{slot.estimated_wait_time} min</div>
                            <div>Efficiency: {slot.efficiency.toFixed(1)}/10</div>
                            {slot.predicted_patients && (
                              <div>Patients: {slot.predicted_patients}</div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {slot.recommendation}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {forecast.insights.length > 0 && (
                    <Alert>
                      <BrainIcon className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-1">AI Insights:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {forecast.insights.map((insight, index) => (
                            <li key={index}>{insight}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Getting AI recommendations...</span>
                </div>
              </div>
            )}

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

            {!isAuthenticated && (
              <Alert>
                <AlertDescription>
                  <strong>Step 1:</strong> Please log in to your patient portal first.
                  <a href="/patient-portal" className="underline ml-1">Go to Patient Portal</a>
                </AlertDescription>
              </Alert>
            )}

            {isAuthenticated && !selectedSlot && !showPreferences && (
              <Alert>
                <AlertDescription>
                  <strong>Step 2:</strong> Click "Show AI Preferences" above to see available time slots and select one.
                </AlertDescription>
              </Alert>
            )}

            {isAuthenticated && !selectedSlot && showPreferences && (
              <Alert>
                <AlertDescription>
                  <strong>Step 3:</strong> Select a recommended time slot from the AI suggestions above.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!isAuthenticated || !selectedSlot || isLoading}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {isLoading ? 'Booking...' : 
               !isAuthenticated ? 'Please Log In First' :
               !selectedSlot ? 'Select a Time Slot First' :
               'Book Smart Appointment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
