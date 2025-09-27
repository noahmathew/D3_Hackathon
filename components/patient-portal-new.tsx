"use client"

import type React from "react"
import { useState } from "react"
import { format } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Calendar,
  FileText,
  MessageSquare,
  CreditCard,
  Download,
  Eye,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  LogOut,
  Stethoscope,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export function PatientPortal() {
  const { patient, logout, updateAppointment, isAuthenticated, isLoading } = useAuth()
  const [showLogin, setShowLogin] = useState(true)
  const [rescheduleAppointment, setRescheduleAppointment] = useState<any>(null)
  const [cancelAppointment, setCancelAppointment] = useState<any>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

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
      </div>
    )
  }

  if (!patient) return null

  const upcomingAppointments = patient.appointments.filter(apt => apt.status === 'scheduled')
  const completedAppointments = patient.appointments.filter(apt => apt.status === 'completed')
  const cancelledAppointments = patient.appointments.filter(apt => apt.status === 'cancelled')

  const handleReschedule = (appointmentId: string, newDate: string, newTime: string) => {
    updateAppointment(appointmentId, {
      date: newDate,
      time: newTime,
      notes: `Rescheduled from original appointment`
    })
    setRescheduleAppointment(null)
    alert('Appointment rescheduled successfully!')
  }

  const handleCancel = (appointmentId: string) => {
    updateAppointment(appointmentId, {
      status: 'cancelled'
    })
    setCancelAppointment(null)
    alert('Appointment cancelled successfully!')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-muted-foreground">Manage your healthcare information and appointments</p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingAppointments.filter(apt => apt.status !== 'cancelled').length}</div>
                <p className="text-xs text-muted-foreground">
                  {upcomingAppointments.filter(apt => apt.status !== 'cancelled').length > 0 ? `Next: ${format(new Date(upcomingAppointments[0].date), 'MMM d, yyyy')}` : 'No upcoming appointments'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patient.medicalRecords.length}</div>
                <p className="text-xs text-muted-foreground">Available records</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patient.appointments.filter(apt => apt.status !== 'cancelled').length}</div>
                <p className="text-xs text-muted-foreground">{completedAppointments.length} completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAppointments.filter(apt => apt.status !== 'cancelled').slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div>
                      <div className="font-medium">{appointment.appointmentType}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(appointment.date), 'EEEE, MMM d, yyyy')} at {appointment.time}
                      </div>
                      <div className="text-sm text-muted-foreground">{appointment.doctor}</div>
                    </div>
                    <Badge variant="default">Scheduled</Badge>
                  </div>
                ))}
                {upcomingAppointments.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Medical Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.medicalRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div>
                      <div className="font-medium">{record.diagnosis}</div>
                      <div className="text-sm text-muted-foreground">{format(new Date(record.date), 'MMM d, yyyy')}</div>
                      <div className="text-sm text-muted-foreground">{record.doctor}</div>
                    </div>
                    <Badge variant="outline">{record.treatment}</Badge>
                  </div>
                ))}
                {patient.medicalRecords.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No medical records available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Appointments</h2>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule New
            </Button>
          </div>

          <div className="space-y-4">
            {patient.appointments.filter(apt => apt.status !== 'cancelled').map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">{appointment.appointmentType}</h3>
                        <Badge 
                          variant={
                            appointment.status === "completed" ? "default" : 
                            appointment.status === "scheduled" ? "secondary" : 
                            "destructive"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(appointment.date), 'EEEE, MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {appointment.doctor}
                        </div>
                      </div>
                      {appointment.reason && (
                        <div className="text-sm text-muted-foreground">
                          Reason: {appointment.reason}
                        </div>
                      )}
                      {appointment.notes && (
                        <div className="text-sm text-muted-foreground">
                          Notes: {appointment.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === 'scheduled' && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reschedule Appointment</DialogTitle>
                                <DialogDescription>
                                  Reschedule your appointment with {appointment.doctor}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>New Date</Label>
                                  <Input 
                                    type="date" 
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setRescheduleAppointment({
                                      ...appointment,
                                      newDate: e.target.value
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label>New Time</Label>
                                  <Select onValueChange={(value) => setRescheduleAppointment(prev => ({
                                    ...prev,
                                    newTime: value
                                  }))}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select new time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                                      <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                                      <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                                      <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                                      <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                                      <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button 
                                  onClick={() => {
                                    if (rescheduleAppointment?.newDate && rescheduleAppointment?.newTime) {
                                      // Ensure date is in correct format (YYYY-MM-DD)
                                      const dateValue = rescheduleAppointment.newDate
                                      handleReschedule(appointment.id, dateValue, rescheduleAppointment.newTime)
                                    }
                                  }}
                                  className="w-full"
                                >
                                  Confirm Reschedule
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel your appointment with {appointment.doctor} on {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')} at {appointment.time}?
                                  <br /><br />
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleCancel(appointment.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Cancel Appointment
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {patient.appointments.filter(apt => apt.status !== 'cancelled').length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
                  <p className="text-muted-foreground mb-4">Schedule your first appointment to get started</p>
                  <Button>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Medical Records Tab */}
        <TabsContent value="records" className="space-y-6">
          <h2 className="text-2xl font-bold">Medical Records</h2>

          <div className="space-y-4">
            {patient.medicalRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">{record.diagnosis}</h3>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{format(new Date(record.date), 'MMM d, yyyy')}</span>
                        <span>{record.doctor}</span>
                      </div>
                      <div className="space-y-1">
                        <div>
                          <span className="text-sm text-muted-foreground">Treatment: </span>
                          <span className="font-medium">{record.treatment}</span>
                        </div>
                        {record.notes && (
                          <div>
                            <span className="text-sm text-muted-foreground">Notes: </span>
                            <span>{record.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {patient.medicalRecords.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No medical records yet</h3>
                  <p className="text-muted-foreground">Your medical records will appear here after your appointments</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Messages</h2>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>

          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-muted-foreground">Messages from your healthcare providers will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <h2 className="text-2xl font-bold">My Profile</h2>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">First Name</Label>
                    <div className="font-medium">{patient.firstName}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Last Name</Label>
                    <div className="font-medium">{patient.lastName}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date of Birth</Label>
                  <div className="font-medium">{format(new Date(patient.dateOfBirth), 'MMMM d, yyyy')}</div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>{patient.email}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Edit Information
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insurance & Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Insurance Provider</Label>
                  <div className="font-medium">{patient.insurance || 'Not specified'}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Emergency Contact</Label>
                  <div className="font-medium">{patient.emergencyContact || 'Not specified'}</div>
                </div>
                {patient.emergencyPhone && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Emergency Phone</Label>
                    <div className="font-medium">{patient.emergencyPhone}</div>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Update Insurance
                  </Button>
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
