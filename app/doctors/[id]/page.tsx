import { Navigation } from "@/components/navigation"
import { DoctorDetailProfile } from "@/components/doctor-detail-profile"
import { notFound } from "next/navigation"

// This would typically come from a database
const doctors = [
  {
    id: "dr-smith",
    name: "Dr. Sarah Smith",
    title: "MD, Family Medicine",
    specialty: "Family Medicine",
    image: "/doctor-female-2.png",
    experience: "15+ years",
    education: [
      "MD - Harvard Medical School",
      "Residency - Johns Hopkins Hospital",
      "Board Certified - American Board of Family Medicine",
    ],
    specialties: ["Preventive Care", "Chronic Disease Management", "Women's Health", "Pediatrics"],
    languages: ["English", "Spanish"],
    availability: "Monday - Friday",
    bio: "Dr. Smith is a dedicated family physician with over 15 years of experience providing comprehensive healthcare to patients of all ages. She specializes in preventive care and chronic disease management, with a particular focus on women's health and pediatric care. Dr. Smith believes in building long-term relationships with her patients and their families, providing personalized care that addresses both immediate health concerns and long-term wellness goals.",
    awards: ["Top Doctor 2023", "Patient Choice Award", "Excellence in Family Medicine"],
    phone: "(555) 123-4567",
    email: "dr.smith@healthcareplus.com",
    officeHours: {
      Monday: "8:00 AM - 5:00 PM",
      Tuesday: "8:00 AM - 5:00 PM",
      Wednesday: "8:00 AM - 5:00 PM",
      Thursday: "8:00 AM - 5:00 PM",
      Friday: "8:00 AM - 3:00 PM",
    },
    procedures: [
      "Annual Physical Exams",
      "Immunizations",
      "Chronic Disease Management",
      "Minor Procedures",
      "Health Screenings",
    ],
    philosophy:
      "I believe in treating the whole person, not just the symptoms. My approach focuses on preventive care, patient education, and building strong doctor-patient relationships that last a lifetime.",
  },
  // Add other doctors here...
]

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  const doctor = doctors.find((d) => d.id === params.id)

  if (!doctor) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <DoctorDetailProfile doctor={doctor} />
    </main>
  )
}
