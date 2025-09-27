import { Navigation } from "@/components/navigation"
import { PatientPortal } from "@/components/patient-portal"

export default function PatientPortalPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <PatientPortal />
    </main>
  )
}
