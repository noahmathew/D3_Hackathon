"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

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
  appointments: Appointment[]
  medicalRecords: MedicalRecord[]
}

export interface Appointment {
  id: string
  date: string
  time: string
  doctor: string
  appointmentType: string
  reason: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

export interface MedicalRecord {
  id: string
  date: string
  doctor: string
  diagnosis: string
  treatment: string
  notes: string
}

interface AuthContextType {
  patient: Patient | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (patientData: Omit<Patient, 'id' | 'appointments' | 'medicalRecords'>) => Promise<boolean>
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void
  updateAppointment: (id: string, updates: Partial<Appointment>) => void
  getAllAppointments: () => Appointment[]
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock patient data for demonstration
const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1985-06-15',
    insurance: 'Blue Cross Blue Shield',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '(555) 987-6543',
    isNewPatient: false,
    appointments: [
      {
        id: '1',
        date: '2024-01-15',
        time: '10:00 AM',
        doctor: 'Dr. Sarah Smith',
        appointmentType: 'Annual Physical',
        reason: 'Routine checkup',
        status: 'completed',
        notes: 'All vitals normal, continue current medications'
      },
      {
        id: '2',
        date: '2024-02-20',
        time: '2:30 PM',
        doctor: 'Dr. Michael Johnson',
        appointmentType: 'Follow-up Visit',
        reason: 'Blood pressure follow-up',
        status: 'scheduled'
      },
      {
        id: '3',
        date: '2024-12-15',
        time: '10:00 AM',
        doctor: 'Dr. Sarah Smith',
        appointmentType: 'Consultation',
        reason: 'General checkup',
        status: 'scheduled'
      },
      {
        id: '4',
        date: '2024-12-15',
        time: '2:00 PM',
        doctor: 'Dr. Sarah Smith',
        appointmentType: 'Follow-up',
        reason: 'Medication review',
        status: 'scheduled'
      }
    ],
    medicalRecords: [
      {
        id: '1',
        date: '2024-01-15',
        doctor: 'Dr. Sarah Smith',
        diagnosis: 'Hypertension',
        treatment: 'Lisinopril 10mg daily',
        notes: 'Blood pressure well controlled with current medication'
      }
    ]
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    phone: '(555) 234-5678',
    dateOfBirth: '1990-03-22',
    insurance: 'Aetna',
    emergencyContact: 'Bob Smith',
    emergencyPhone: '(555) 876-5432',
    isNewPatient: true,
    appointments: [
      {
        id: '5',
        date: '2024-12-15',
        time: '11:00 AM',
        doctor: 'Dr. Michael Johnson',
        appointmentType: 'Initial Consultation',
        reason: 'New patient evaluation',
        status: 'scheduled'
      },
      {
        id: '6',
        date: '2024-12-16',
        time: '9:30 AM',
        doctor: 'Dr. Emily Williams',
        appointmentType: 'Checkup',
        reason: 'Annual physical',
        status: 'scheduled'
      }
    ],
    medicalRecords: []
  }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [globalAppointments, setGlobalAppointments] = useState<Appointment[]>([])

  // Initialize global appointments store
  useEffect(() => {
    const allAppointments: Appointment[] = []
    mockPatients.forEach(patient => {
      allAppointments.push(...patient.appointments)
    })
    setGlobalAppointments(allAppointments)
  }, [])

  // Check for existing login on mount
  useEffect(() => {
    const savedPatient = localStorage.getItem('patient')
    if (savedPatient) {
      setPatient(JSON.parse(savedPatient))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock authentication - in real app, this would be an API call
    const foundPatient = mockPatients.find(p => p.email === email)
    
    if (foundPatient && password === 'password123') { // Mock password
      setPatient(foundPatient)
      localStorage.setItem('patient', JSON.stringify(foundPatient))
      return true
    }
    
    return false
  }

  const register = async (patientData: Omit<Patient, 'id' | 'appointments' | 'medicalRecords'>): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if email already exists
    const existingPatient = mockPatients.find(p => p.email === patientData.email)
    if (existingPatient) {
      return false
    }
    
    // Create new patient
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(),
      appointments: [],
      medicalRecords: []
    }
    
    mockPatients.push(newPatient)
    setPatient(newPatient)
    localStorage.setItem('patient', JSON.stringify(newPatient))
    return true
  }

  const logout = () => {
    setPatient(null)
    localStorage.removeItem('patient')
  }

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    if (!patient) return
    
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString()
    }
    
    // Add to global appointments store
    setGlobalAppointments(prev => [...prev, newAppointment])
    
    const updatedPatient = {
      ...patient,
      appointments: [...patient.appointments, newAppointment]
    }
    
    setPatient(updatedPatient)
    localStorage.setItem('patient', JSON.stringify(updatedPatient))
  }

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    if (!patient) return
    
    const updatedAppointments = patient.appointments.map(apt =>
      apt.id === id ? { ...apt, ...updates } : apt
    )
    
    const updatedPatient = {
      ...patient,
      appointments: updatedAppointments
    }
    
    // Update global appointments store
    setGlobalAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, ...updates } : apt)
    )
    
    setPatient(updatedPatient)
    localStorage.setItem('patient', JSON.stringify(updatedPatient))
  }

  const getAllAppointments = () => {
    return globalAppointments
  }

  const value = {
    patient,
    login,
    logout,
    register,
    addAppointment,
    updateAppointment,
    getAllAppointments,
    isAuthenticated: !!patient,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
