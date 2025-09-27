const express = require('express');
const router = express.Router();

// In-memory storage for demo (replace with database in production)
let appointments = [
  {
    id: '1',
    patientId: '1',
    date: '2024-12-15',
    time: '10:00',
    doctor: 'Dr. Sarah Smith',
    appointmentType: 'Consultation',
    reason: 'General checkup',
    status: 'scheduled',
    notes: 'Insurance: Blue Cross Blue Shield'
  },
  {
    id: '2',
    patientId: '1',
    date: '2024-12-15',
    time: '14:00',
    doctor: 'Dr. Sarah Smith',
    appointmentType: 'Follow-up',
    reason: 'Medication review',
    status: 'scheduled',
    notes: 'Insurance: Blue Cross Blue Shield'
  }
];

let nextId = 3;

// Get all appointments for a patient
router.get('/patient/:patientId', (req, res) => {
  try {
    const { patientId } = req.params;
    const patientAppointments = appointments.filter(apt => apt.patientId === patientId);
    
    res.json({
      success: true,
      data: patientAppointments,
      count: patientAppointments.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get all appointments for a doctor
router.get('/doctor/:doctorId', (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctorAppointments = appointments.filter(apt => apt.doctor === doctorId);
    
    res.json({
      success: true,
      data: doctorAppointments,
      count: doctorAppointments.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctor appointments' });
  }
});

// Get appointments for a specific date
router.get('/date/:date', (req, res) => {
  try {
    const { date } = req.params;
    const dateAppointments = appointments.filter(apt => apt.date === date);
    
    res.json({
      success: true,
      data: dateAppointments,
      count: dateAppointments.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch date appointments' });
  }
});

// Create new appointment
router.post('/', (req, res) => {
  try {
    const { patientId, date, time, doctor, appointmentType, reason, notes } = req.body;
    
    if (!patientId || !date || !time || !doctor) {
      return res.status(400).json({ 
        error: 'Missing required fields: patientId, date, time, doctor' 
      });
    }

    // Check for conflicts
    const conflict = appointments.find(apt => 
      apt.date === date && 
      apt.time === time && 
      apt.doctor === doctor &&
      apt.status === 'scheduled'
    );

    if (conflict) {
      return res.status(409).json({ 
        error: 'Appointment conflict: This time slot is already booked',
        conflictingAppointment: conflict
      });
    }

    const newAppointment = {
      id: nextId.toString(),
      patientId,
      date,
      time,
      doctor,
      appointmentType: appointmentType || 'General Consultation',
      reason: reason || '',
      status: 'scheduled',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    nextId++;

    res.status(201).json({
      success: true,
      data: newAppointment,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const appointmentIndex = appointments.findIndex(apt => apt.id === id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check for conflicts if date/time/doctor is being changed
    if (updates.date || updates.time || updates.doctor) {
      const existingAppointment = appointments[appointmentIndex];
      const checkDate = updates.date || existingAppointment.date;
      const checkTime = updates.time || existingAppointment.time;
      const checkDoctor = updates.doctor || existingAppointment.doctor;
      
      const conflict = appointments.find(apt => 
        apt.id !== id &&
        apt.date === checkDate && 
        apt.time === checkTime && 
        apt.doctor === checkDoctor &&
        apt.status === 'scheduled'
      );

      if (conflict) {
        return res.status(409).json({ 
          error: 'Appointment conflict: This time slot is already booked',
          conflictingAppointment: conflict
        });
      }
    }

    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: appointments[appointmentIndex],
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Cancel appointment
router.patch('/:id/cancel', (req, res) => {
  try {
    const { id } = req.params;
    
    const appointmentIndex = appointments.findIndex(apt => apt.id === id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointments[appointmentIndex].status = 'cancelled';
    appointments[appointmentIndex].cancelledAt = new Date().toISOString();

    res.json({
      success: true,
      data: appointments[appointmentIndex],
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Complete appointment
router.patch('/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const appointmentIndex = appointments.findIndex(apt => apt.id === id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointments[appointmentIndex].status = 'completed';
    appointments[appointmentIndex].completedAt = new Date().toISOString();
    if (notes) {
      appointments[appointmentIndex].completionNotes = notes;
    }

    res.json({
      success: true,
      data: appointments[appointmentIndex],
      message: 'Appointment completed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete appointment' });
  }
});

// Delete appointment
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const appointmentIndex = appointments.findIndex(apt => apt.id === id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointments.splice(appointmentIndex, 1);

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Get appointment statistics
router.get('/stats/overview', (req, res) => {
  try {
    const totalAppointments = appointments.length;
    const scheduledAppointments = appointments.filter(apt => apt.status === 'scheduled').length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;

    // Calculate daily averages
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.date === today).length;

    res.json({
      success: true,
      data: {
        total: totalAppointments,
        scheduled: scheduledAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        today: todayAppointments,
        completionRate: totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0,
        cancellationRate: totalAppointments > 0 ? Math.round((cancelledAppointments / totalAppointments) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointment statistics' });
  }
});

module.exports = router;
