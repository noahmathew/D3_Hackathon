"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Clock, Phone, Mail, MapPin, Calendar as CalendarIcon2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"

export function AppointmentBooking() {
  const { patient, addAppointment, getAllAppointments, isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || "",
    lastName: patient?.lastName || "",
    email: patient?.email || "",
    phone: patient?.phone || "",
    dateOfBirth: patient?.dateOfBirth || "",
    doctor: "",
    appointmentType: "",
    timeSlot: "",
    reason: "",
    isNewPatient: patient?.isNewPatient || false,
    insurance: patient?.insurance || "",
    emergencyContact: patient?.emergencyContact || "",
    emergencyPhone: patient?.emergencyPhone || "",
  })

  const doctors = [
    { id: "dr-smith", name: "Dr. Sarah Smith", specialty: "Family Medicine" },
    { id: "dr-johnson", name: "Dr. Michael Johnson", specialty: "Internal Medicine" },
    { id: "dr-williams", name: "Dr. Emily Williams", specialty: "Pediatrics" },
    { id: "dr-brown", name: "Dr. David Brown", specialty: "Cardiology" },
    { id: "dr-davis", name: "Dr. Lisa Davis", specialty: "Dermatology" },
  ]

  const appointmentTypes = [
    "Annual Physical",
    "Follow-up Visit",
    "Consultation",
    "Urgent Care",
    "Preventive Care",
    "Specialist Referral",
  ]

  // Generate months array
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Generate years array (current year + 2 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i)

  // Generate days based on selected month and year
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1)

  // Time slots with availability simulation
  const allTimeSlots = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
  ]

  // Get available time slots based on date and doctor
  const getAvailableTimeSlots = (date: Date, doctor: string) => {
    // Get all existing appointments
    const allAppointments = getAllAppointments()
    
    // Format date to match appointment date format (avoid timezone issues)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    
    // Find appointments for this specific date and doctor
    const conflictingAppointments = allAppointments.filter(apt => 
      apt.date === dateString && 
      apt.doctor === doctor &&
      apt.status === 'scheduled' // Only check scheduled appointments
    )
    
    // Get occupied time slots
    const occupiedSlots = conflictingAppointments.map(apt => apt.time)
    
    // Mock availability logic - in real app, this would check against database
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    if (isWeekend) {
      return [] // No weekend appointments
    }
    
    // Filter out occupied time slots and return available ones
    const availableSlots = allTimeSlots.filter(slot => !occupiedSlots.includes(slot))
    
    return availableSlots
  }

  // Handle date selection changes
  const handleDateChange = (month: number, day: number, year: number) => {
    setSelectedMonth(month)
    setSelectedDay(day)
    setSelectedYear(year)

    const newDate = new Date(year, month, day)
    setSelectedDate(newDate)

    // Get doctor name from ID
    const selectedDoctor = doctors.find(d => d.id === formData.doctor)
    const doctorName = selectedDoctor ? selectedDoctor.name : ""

    // Update available time slots when date changes
    const availableSlots = getAvailableTimeSlots(newDate, doctorName)
    setAvailableTimeSlots(availableSlots)

    // Reset time slot selection if current selection is not available
    if (!availableSlots.includes(formData.timeSlot)) {
      setFormData(prev => ({ ...prev, timeSlot: "" }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) {
      alert("Please select a date for your appointment.")
      return
    }
    if (!formData.timeSlot) {
      alert("Please select a time slot for your appointment.")
      return
    }
    if (!formData.doctor) {
      alert("Please select a doctor for your appointment.")
      return
    }
    
    // Get doctor name from ID
    const selectedDoctor = doctors.find(d => d.id === formData.doctor)
    if (!selectedDoctor) {
      alert("Please select a valid doctor.")
      return
    }
    
    // Create appointment object with proper date format (avoid timezone issues)
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    
    const appointment = {
      date: dateString, // Format: YYYY-MM-DD (local date, no timezone conversion)
      time: formData.timeSlot,
      doctor: selectedDoctor.name, // Store doctor name, not ID
      appointmentType: formData.appointmentType,
      reason: formData.reason,
      status: 'scheduled' as const,
      notes: `Insurance: ${formData.insurance || 'Not specified'}`
    }
    
    
    // Add appointment to patient's record
    addAppointment(appointment)
    
    // Reset form
    setFormData({
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      email: patient?.email || "",
      phone: patient?.phone || "",
      dateOfBirth: patient?.dateOfBirth || "",
      doctor: "",
      appointmentType: "",
      timeSlot: "",
      reason: "",
      isNewPatient: patient?.isNewPatient || false,
      insurance: patient?.insurance || "",
      emergencyContact: patient?.emergencyContact || "",
      emergencyPhone: patient?.emergencyPhone || "",
    })
    setSelectedDate(undefined)
    setSelectedMonth(new Date().getMonth())
    setSelectedDay(new Date().getDate())
    setSelectedYear(new Date().getFullYear())
    setAvailableTimeSlots([])
    
    alert("Appointment scheduled successfully! You can view it in your Patient Portal.")
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Update available time slots when doctor changes
    if (field === "doctor" && selectedDate) {
      const selectedDoctor = doctors.find(d => d.id === value)
      const doctorName = selectedDoctor ? selectedDoctor.name : ""
      
      const availableSlots = getAvailableTimeSlots(selectedDate, doctorName)
      setAvailableTimeSlots(availableSlots)
      
      // Reset time slot selection if current selection is not available
      if (!availableSlots.includes(formData.timeSlot)) {
        setFormData(prev => ({ ...prev, timeSlot: "" }))
      }
    }
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        {showLogin ? (
          <LoginForm 
            onSuccess={() => {}} 
            onSwitchToRegister={() => setShowLogin(false)}
          />
        ) : (
          <RegisterForm 
            onSuccess={() => {}} 
            onSwitchToLogin={() => setShowLogin(true)}
          />
        )}
        <div className="mt-6 p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Please log in to book an appointment.</strong><br />
            Your appointments will be saved to your Patient Portal.
          </p>
        </div>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
            <strong>Demo Tip:</strong> Try booking for December 15th, 2024 with Dr. Sarah Smith to see conflict checking in action!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Booking Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon2 className="w-5 h-5 text-primary" />
              Appointment Details
            </CardTitle>
            <CardDescription>Please fill out all required information to schedule your appointment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newPatient"
                    checked={formData.isNewPatient}
                    onCheckedChange={(checked) => handleInputChange("isNewPatient", checked as boolean)}
                  />
                  <Label htmlFor="newPatient">I am a new patient</Label>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Appointment Information</h3>

                <div className="space-y-2">
                  <Label>Select Doctor *</Label>
                  <Select value={formData.doctor} onValueChange={(value) => handleInputChange("doctor", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Appointment Type *</Label>
                  <Select
                    value={formData.appointmentType}
                    onValueChange={(value) => handleInputChange("appointmentType", value)}
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
                  <Label>Preferred Date *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={selectedMonth.toString()} onValueChange={(value) => handleDateChange(parseInt(value), selectedDay, selectedYear)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedDay.toString()} onValueChange={(value) => handleDateChange(selectedMonth, parseInt(value), selectedYear)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedYear.toString()} onValueChange={(value) => handleDateChange(selectedMonth, selectedDay, parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedDate && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {format(selectedDate, "EEEE, MMMM do, yyyy")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Preferred Time *</Label>
                  {selectedDate && formData.doctor ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {allTimeSlots.map((time) => {
                          const isAvailable = availableTimeSlots.includes(time)
                          const isSelected = formData.timeSlot === time
                          
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => isAvailable ? handleInputChange("timeSlot", time) : null}
                              disabled={!isAvailable}
                              className={cn(
                                "px-3 py-2 text-sm rounded-md border transition-colors",
                                isSelected && isAvailable
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : isAvailable
                                    ? "bg-background hover:bg-accent hover:text-accent-foreground border-border"
                                    : "bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50"
                              )}
                            >
                              {time}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-background border border-border rounded"></div>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-muted rounded"></div>
                          <span>Unavailable</span>
                        </div>
                      </div>
                      {availableTimeSlots.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {availableTimeSlots.length} available time slots
                        </p>
                      )}
                  {availableTimeSlots.length === 0 && (
                    <p className="text-sm text-destructive">
                      No available time slots for this date and doctor
                    </p>
                  )}
                    </div>
                  ) : selectedDate && !formData.doctor ? (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Please select a doctor first to see available time slots
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Please select a date first to see available time slots
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mt-6">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please describe the reason for your visit..."
                    value={formData.reason}
                    onChange={(e) => handleInputChange("reason", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Insurance & Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="insurance">Insurance Provider</Label>
                  <Input
                    id="insurance"
                    placeholder="e.g., Blue Cross Blue Shield"
                    value={formData.insurance}
                    onChange={(e) => handleInputChange("insurance", e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                <CalendarIcon2 className="w-4 h-4 mr-2" />
                Request Appointment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Information */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Office Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monday - Friday</span>
              <span className="font-medium">8:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saturday</span>
              <span className="font-medium">9:00 AM - 2:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sunday</span>
              <span className="font-medium">Closed</span>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emergency</span>
                <span className="font-medium text-primary">24/7 Available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-primary mt-1" />
              <div>
                <div className="font-medium">(555) 123-4567</div>
                <div className="text-sm text-muted-foreground">Main Office</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-primary mt-1" />
              <div>
                <div className="font-medium">appointments@healthcareplus.com</div>
                <div className="text-sm text-muted-foreground">Email</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-1" />
              <div>
                <div className="font-medium">123 Medical Center Drive</div>
                <div className="text-sm text-muted-foreground">Suite 100, City, ST 12345</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• We'll confirm your appointment within 24 hours</p>
            <p>• Please arrive 15 minutes early for check-in</p>
            <p>• Bring your insurance card and ID</p>
            <p>• New patients should arrive 30 minutes early</p>
            <p>• We accept most major insurance plans</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
