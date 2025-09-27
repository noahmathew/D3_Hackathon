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

export function AppointmentBooking() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    doctor: "",
    appointmentType: "",
    timeSlot: "",
    reason: "",
    isNewPatient: false,
    insurance: "",
    emergencyContact: "",
    emergencyPhone: "",
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

  // Simulate available time slots based on date and doctor
  const getAvailableTimeSlots = (date: Date, doctor: string) => {
    // Simulate some slots being unavailable
    const unavailableSlots = ["9:00 AM", "2:30 PM", "4:00 PM"] // Example unavailable slots
    return allTimeSlots.filter(slot => !unavailableSlots.includes(slot))
  }

  // Handle date selection changes
  const handleDateChange = (month: number, day: number, year: number) => {
    setSelectedMonth(month)
    setSelectedDay(day)
    setSelectedYear(year)
    
    const newDate = new Date(year, month, day)
    setSelectedDate(newDate)
    
    // Update available time slots when date changes
    const availableSlots = getAvailableTimeSlots(newDate, formData.doctor)
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
    
    // Handle form submission
    console.log("Appointment booking:", { ...formData, date: selectedDate })
    alert("Appointment request submitted! We'll contact you within 24 hours to confirm.")
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Update available time slots when doctor changes
    if (field === "doctor" && selectedDate) {
      const availableSlots = getAvailableTimeSlots(selectedDate, value as string)
      setAvailableTimeSlots(availableSlots)
      
      // Reset time slot selection if current selection is not available
      if (!availableSlots.includes(formData.timeSlot)) {
        setFormData(prev => ({ ...prev, timeSlot: "" }))
      }
    }
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
                  <Select value={formData.timeSlot} onValueChange={(value) => handleInputChange("timeSlot", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedDate ? "Select available time" : "Select a date first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDate && availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      ) : selectedDate && availableTimeSlots.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No available slots for this date
                        </div>
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Please select a date first
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedDate && availableTimeSlots.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {availableTimeSlots.length} available time slots
                    </p>
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
