"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BrainIcon, 
  ActivityIcon, 
  UsersIcon, 
  ClockIcon, 
  ZapIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-react'
import { 
  apiService, 
  EDTriageOptimization, 
  ORSchedulingOptimization, 
  TransportRoutingOptimization,
  MLAppointmentForecast 
} from '@/lib/api-enhanced'

interface HealthcareOperationsDashboardProps {
  className?: string
}

export function HealthcareOperationsDashboard({ className }: HealthcareOperationsDashboardProps) {
  const [mlHealth, setMLHealth] = useState<{ ml_service_available: boolean; models_loaded: boolean }>({
    ml_service_available: false,
    models_loaded: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [edOptimization, setEDOptimization] = useState<EDTriageOptimization | null>(null)
  const [orOptimization, setOROptimization] = useState<ORSchedulingOptimization | null>(null)
  const [transportOptimization, setTransportOptimization] = useState<TransportRoutingOptimization | null>(null)
  const [appointmentForecast, setAppointmentForecast] = useState<MLAppointmentForecast | null>(null)

  useEffect(() => {
    checkMLHealth()
    loadDashboardData()
  }, [])

  const checkMLHealth = async () => {
    try {
      const health = await apiService.checkMLHealth()
      setMLHealth(health)
    } catch (error) {
      console.error('Failed to check ML health:', error)
    }
  }

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load sample data for demonstration
      await Promise.all([
        loadEDOptimization(),
        loadOROptimization(),
        loadTransportOptimization(),
        loadAppointmentForecast()
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadEDOptimization = async () => {
    try {
      const samplePatients = [
        { patient_id: 'P001', severity_score: 8, condition: 'Stroke', doctor_needed: 'Cardiologist' },
        { patient_id: 'P002', severity_score: 3, condition: 'Fever', doctor_needed: 'General Practitioner' },
        { patient_id: 'P003', severity_score: 6, condition: 'Fracture', doctor_needed: 'Orthopedist' }
      ]
      
      const result = await apiService.optimizeEDTriage(samplePatients, 5, { icu: 2, general: 8 })
      setEDOptimization(result)
    } catch (error) {
      console.error('Failed to load ED optimization:', error)
    }
  }

  const loadOROptimization = async () => {
    try {
      const sampleSurgeries = [
        { surgery_id: 'S001', procedure: 'Knee Surgery', surgeon: 'Dr. Singh', anesthesia_team: 'B', priority: 8 },
        { surgery_id: 'S002', procedure: 'Appendectomy', surgeon: 'Dr. Kim', anesthesia_team: 'C', priority: 6 }
      ]
      
      const availableSlots = [
        { id: 'OR1', start_time: 480, room: 'OR-1' },
        { id: 'OR2', start_time: 480, room: 'OR-2' }
      ]
      
      const result = await apiService.optimizeORScheduling(sampleSurgeries, availableSlots, {})
      setOROptimization(result)
    } catch (error) {
      console.error('Failed to load OR optimization:', error)
    }
  }

  const loadTransportOptimization = async () => {
    try {
      const sampleRequests = [
        { patient_id: 'P001', origin: 'ED', destination: 'ICU', urgency: 'High' },
        { patient_id: 'P002', origin: 'Ward 1', destination: 'Radiology', urgency: 'Medium' }
      ]
      
      const result = await apiService.optimizeTransportRouting(sampleRequests, ['Team-A', 'Team-B'], {})
      setTransportOptimization(result)
    } catch (error) {
      console.error('Failed to load transport optimization:', error)
    }
  }

  const loadAppointmentForecast = async () => {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split('T')[0]
      
      const result = await apiService.getOptimalAppointmentTimes(dateString, 'Dr. Sarah Smith', 'General Consultation')
      setAppointmentForecast(result)
    } catch (error) {
      console.error('Failed to load appointment forecast:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'default'
      default: return 'outline'
    }
  }

  const getMLBadge = (mlEnhanced: boolean) => (
    <Badge variant={mlEnhanced ? 'default' : 'outline'} className="ml-2">
      <BrainIcon className="h-3 w-3 mr-1" />
      {mlEnhanced ? 'AI Enhanced' : 'Fallback'}
    </Badge>
  )

  return (
    <div className={className}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BrainIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Healthcare Operations Dashboard</h2>
          {mlHealth.ml_service_available && (
            <Badge variant="default">
              <ZapIcon className="h-3 w-3 mr-1" />
              ML Active
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          AI-powered optimization across all healthcare departments
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="surgery">Surgery</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ED Triage Efficiency</CardTitle>
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {edOptimization ? `${100 - edOptimization.crowding_risk === 'High' ? 60 : 85}%` : '--'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Wait time reduced by {edOptimization?.total_wait_time_reduction || 0} minutes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">OR Utilization</CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orOptimization ? `${orOptimization.total_utilization}%` : '--'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Idle time reduced by {orOptimization?.idle_time_reduction || 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transport Efficiency</CardTitle>
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {transportOptimization ? `${transportOptimization.resource_utilization}%` : '--'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Travel time reduced by {transportOptimization?.total_travel_time_reduction || 0} minutes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointment Accuracy</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {appointmentForecast ? `${appointmentForecast.forecasting_confidence === 'High' ? 92 : 78}%` : '--'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {appointmentForecast?.forecasting_confidence || 'Medium'} confidence
                </p>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <BrainIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>AI Status:</strong> {mlHealth.ml_service_available ? 
                'All ML models are active and providing enhanced optimization' : 
                'ML models are unavailable, using fallback algorithms'}
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Emergency Department Triage
                {edOptimization && getMLBadge(edOptimization.ml_enhanced)}
              </CardTitle>
              <CardDescription>
                Real-time triage queue optimization balancing severity, staff, and bed availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {edOptimization ? (
                <>
                  <div className="flex items-center gap-4">
                    <Badge variant={getStatusColor(edOptimization.crowding_risk)}>
                      Crowding Risk: {edOptimization.crowding_risk}
                    </Badge>
                    <Badge variant="outline">
                      Wait Time Reduction: {edOptimization.total_wait_time_reduction} min
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Optimized Patient Queue:</h4>
                    <div className="space-y-2">
                      {edOptimization.optimized_queue.map((patient, index) => (
                        <div key={patient.patient_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={getStatusColor(patient.mortality_risk)}>
                              #{index + 1}
                            </Badge>
                            <div>
                              <div className="font-medium">{patient.patient_id}</div>
                              <div className="text-sm text-muted-foreground">
                                {patient.recommended_doctor}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">Score: {patient.priority_score.toFixed(1)}</div>
                            <div className="text-sm text-muted-foreground">
                              Wait: {patient.estimated_wait_time} min
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Loading ED optimization data...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surgery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Operating Room Scheduling
                {orOptimization && getMLBadge(orOptimization.ml_enhanced)}
              </CardTitle>
              <CardDescription>
                Quantum-inspired optimization for surgical scheduling and resource allocation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {orOptimization ? (
                <>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      Utilization: {orOptimization.total_utilization}%
                    </Badge>
                    <Badge variant="outline">
                      Idle Time Reduction: {orOptimization.idle_time_reduction}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Optimized Surgical Schedule:</h4>
                    <div className="space-y-2">
                      {orOptimization.optimal_schedule.map((appointment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">
                              {appointment.or_slot}
                            </Badge>
                            <div>
                              <div className="font-medium">{appointment.surgery.procedure}</div>
                              <div className="text-sm text-muted-foreground">
                                {appointment.surgery.surgeon}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{appointment.room}</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.floor(appointment.start_time / 60)}:{(appointment.start_time % 60).toString().padStart(2, '0')} - 
                              {Math.floor(appointment.end_time / 60)}:{(appointment.end_time % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {orOptimization.bottleneck_analysis.length > 0 && (
                    <Alert>
                      <AlertTriangleIcon className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-1">Bottleneck Analysis:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {orOptimization.bottleneck_analysis.map((bottleneck, index) => (
                            <li key={index}>{bottleneck.type}: {bottleneck.recommendation}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Loading OR optimization data...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transport" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Patient Transport Routing
                {transportOptimization && getMLBadge(transportOptimization.ml_enhanced)}
              </CardTitle>
              <CardDescription>
                Optimized ambulance and intra-hospital patient transport routing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {transportOptimization ? (
                <>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      Resource Utilization: {transportOptimization.resource_utilization}%
                    </Badge>
                    <Badge variant="outline">
                      Time Savings: {transportOptimization.total_travel_time_reduction} min
                    </Badge>
                    <Badge variant={getStatusColor(transportOptimization.priority_compliance.compliance > 90 ? 'low' : 'medium')}>
                      Priority Compliance: {transportOptimization.priority_compliance.compliance}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Optimized Transport Routes:</h4>
                    <div className="space-y-2">
                      {transportOptimization.optimized_routes.map((route, index) => (
                        <div key={route.patient_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={getStatusColor(route.urgency)}>
                              {route.urgency}
                            </Badge>
                            <div>
                              <div className="font-medium">{route.patient_id}</div>
                              <div className="text-sm text-muted-foreground">
                                {route.origin} → {route.destination}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{route.assigned_team}</div>
                            <div className="text-sm text-muted-foreground">
                              {route.estimated_travel_time} min
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {transportOptimization.priority_compliance.violations.length > 0 && (
                    <Alert>
                      <XCircleIcon className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-1">Priority Violations:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {transportOptimization.priority_compliance.violations.map((violation, index) => (
                            <li key={index}>{violation.reason}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Loading transport optimization data...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button onClick={loadDashboardData} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Refreshing Data...
            </>
          ) : (
            <>
              <ActivityIcon className="h-4 w-4 mr-2" />
              Refresh Dashboard
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
