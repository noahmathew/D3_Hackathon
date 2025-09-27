import { Navigation } from "@/components/navigation"
import { SmartAppointmentBooking } from "@/components/smart-appointment-booking"

export default function AppointmentsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-foreground text-balance">Book Your Appointment</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Schedule your visit with our experienced healthcare professionals. Choose your preferred date, time, and
            doctor.
          </p>
        </div>
            <div>
              <SmartAppointmentBooking />
            </div>
      </div>
    </main>
  )
}
