import { Navigation } from "@/components/navigation"
import { DoctorProfiles } from "@/components/doctor-profiles"

export default function DoctorsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-foreground text-balance">Meet Our Medical Team</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Our board-certified physicians and healthcare professionals are dedicated to providing exceptional care with
            compassion and expertise.
          </p>
        </div>
        <DoctorProfiles />
      </div>
    </main>
  )
}
