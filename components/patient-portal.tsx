"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"

export function PatientPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })

  // Mock patient data
  const patientData = {
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    dateOfBirth: "January 15, 1985",
    address: "123 Main Street, City, ST 12345",
    insurance: "Blue Cross Blue Shield",
    emergencyContact: "Jane Smith - (555) 987-6543",
  }

  const upcomingAppointments = [
    {
      id: 1,
      date: "March 15, 2024",
      time: "10:00 AM",
      doctor: "Dr. Sarah Smith",
      type: "Annual Physical",
      status: "confirmed",
    },
    {
      id: 2,
      date: "April 2, 2024",
      time: "2:30 PM",
      doctor: "Dr. Michael Johnson",
      type: "Follow-up",
      status: "pending",
    },
  ]

  const testResults = [
    {
      id: 1,
      test: "Complete Blood Count",
      date: "February 28, 2024",
      status: "completed",
      doctor: "Dr. Sarah Smith",
      result: "Normal",
    },
    {
      id: 2,
      test: "Cholesterol Panel",
      date: "February 28, 2024",
      status: "completed",
      doctor: "Dr. Sarah Smith",
      result: "Slightly Elevated",
    },
    {
      id: 3,
      test: "Chest X-Ray",
      date: "March 5, 2024",
      status: "pending",
      doctor: "Dr. Michael Johnson",
      result: "Pending",
    },
  ]

  const messages = [
    {
      id: 1,
      from: "Dr. Sarah Smith",
      subject: "Test Results Available",
      date: "March 1, 2024",
      preview: "Your recent blood work results are now available...",
      unread: true,
    },
    {
      id: 2,
      from: "HealthCare Plus Billing",
      subject: "Payment Reminder",
      date: "February 28, 2024",
      preview: "This is a friendly reminder about your outstanding balance...",
      unread: false,
    },
  ]

  const bills = [
    {
      id: 1,
      date: "February 15, 2024",
      service: "Annual Physical Exam",
      amount: "$250.00",
      status: "paid",
      insurance: "$200.00",
      balance: "$50.00",
    },
    {
      id: 2,
      date: "March 1, 2024",
      service: "Lab Work - Blood Panel",
      amount: "$180.00",
      status: "pending",
      insurance: "$144.00",
      balance: "$36.00",
    },
  ]

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login - in real app, this would authenticate with backend
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Patient Portal Login</CardTitle>
            <CardDescription>Access your medical records, appointments, and more</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
              <div className="text-center space-y-2">
                <Button variant="link" className="text-sm">
                  Forgot Password?
                </Button>
                <div className="text-sm text-muted-foreground">
                  New patient?{" "}
                  <Button variant="link" className="p-0 h-auto">
                    Create Account
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {patientData.name}</h1>
            <p className="text-muted-foreground">Manage your healthcare information and appointments</p>
          </div>
          <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
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
                <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                <p className="text-xs text-muted-foreground">Next: March 15, 2024</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Chest X-Ray pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">From Dr. Sarah Smith</p>
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
                {upcomingAppointments.slice(0, 2).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div>
                      <div className="font-medium">{appointment.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.date} at {appointment.time}
                      </div>
                      <div className="text-sm text-muted-foreground">{appointment.doctor}</div>
                    </div>
                    <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Test Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {testResults.slice(0, 2).map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div>
                      <div className="font-medium">{result.test}</div>
                      <div className="text-sm text-muted-foreground">{result.date}</div>
                      <div className="text-sm text-muted-foreground">{result.doctor}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={result.status === "completed" ? "default" : "secondary"}>{result.result}</Badge>
                    </div>
                  </div>
                ))}
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
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">{appointment.type}</h3>
                        <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {appointment.date}
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
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <h2 className="text-2xl font-bold">Test Results</h2>

          <div className="space-y-4">
            {testResults.map((result) => (
              <Card key={result.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">{result.test}</h3>
                        {result.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{result.date}</span>
                        <span>{result.doctor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Result:</span>
                        <Badge
                          variant={
                            result.result === "Normal"
                              ? "default"
                              : result.result === "Pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {result.result}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {result.status === "completed" && (
                        <>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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

          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id} className={message.unread ? "border-primary" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${message.unread ? "text-primary" : ""}`}>{message.subject}</h3>
                        {message.unread && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">From: {message.from}</div>
                      <div className="text-sm text-muted-foreground">{message.date}</div>
                      <p className="text-muted-foreground">{message.preview}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Read
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <h2 className="text-2xl font-bold">Billing & Payments</h2>

          <div className="space-y-4">
            {bills.map((bill) => (
              <Card key={bill.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">{bill.service}</h3>
                        <Badge variant={bill.status === "paid" ? "default" : "secondary"}>{bill.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{bill.date}</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total: </span>
                          <span className="font-medium">{bill.amount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Insurance: </span>
                          <span className="font-medium">{bill.insurance}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Balance: </span>
                          <span className="font-medium">{bill.balance}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      {bill.status === "pending" && (
                        <Button size="sm">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                    <Label className="text-sm text-muted-foreground">Full Name</Label>
                    <div className="font-medium">{patientData.name}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Date of Birth</Label>
                    <div className="font-medium">{patientData.dateOfBirth}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Address</Label>
                  <div className="font-medium">{patientData.address}</div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{patientData.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>{patientData.email}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
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
                  <div className="font-medium">{patientData.insurance}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Emergency Contact</Label>
                  <div className="font-medium">{patientData.emergencyContact}</div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button variant="outline" className="w-full bg-transparent">
                    Update Insurance
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
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
