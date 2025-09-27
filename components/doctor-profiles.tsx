import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Phone, Award, Clock } from "lucide-react"
import Link from "next/link"

export function DoctorProfiles() {
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
      bio: "Dr. Smith is a dedicated family physician with over 15 years of experience providing comprehensive healthcare to patients of all ages. She specializes in preventive care and chronic disease management, with a particular focus on women's health and pediatric care.",
      awards: ["Top Doctor 2023", "Patient Choice Award", "Excellence in Family Medicine"],
      phone: "(555) 123-4567",
      email: "dr.smith@healthcareplus.com",
    },
    {
      id: "dr-johnson",
      name: "Dr. Michael Johnson",
      title: "MD, Internal Medicine",
      specialty: "Internal Medicine",
      image: "/professional-male-doctor-in-white-coat.jpg",
      experience: "12+ years",
      education: [
        "MD - Stanford University School of Medicine",
        "Residency - Mayo Clinic",
        "Board Certified - American Board of Internal Medicine",
      ],
      specialties: ["Diabetes Management", "Hypertension", "Heart Disease", "Preventive Medicine"],
      languages: ["English"],
      availability: "Tuesday - Saturday",
      bio: "Dr. Johnson is an experienced internist who focuses on adult medicine and complex medical conditions. He has extensive experience in managing diabetes, cardiovascular disease, and other chronic conditions.",
      awards: ["Excellence in Internal Medicine", "Research Achievement Award"],
      phone: "(555) 123-4568",
      email: "dr.johnson@healthcareplus.com",
    },
    {
      id: "dr-williams",
      name: "Dr. Emily Williams",
      title: "MD, Pediatrics",
      specialty: "Pediatrics",
      image: "/professional-female-pediatrician-with-children.jpg",
      experience: "10+ years",
      education: [
        "MD - University of California, San Francisco",
        "Pediatric Residency - Children's Hospital of Philadelphia",
        "Board Certified - American Board of Pediatrics",
      ],
      specialties: ["Child Development", "Immunizations", "Adolescent Medicine", "Behavioral Health"],
      languages: ["English", "French"],
      availability: "Monday - Thursday",
      bio: "Dr. Williams is a compassionate pediatrician who provides comprehensive care for children from birth through adolescence. She has a special interest in child development and behavioral health.",
      awards: ["Pediatrician of the Year", "Community Service Award"],
      phone: "(555) 123-4569",
      email: "dr.williams@healthcareplus.com",
    },
    {
      id: "dr-brown",
      name: "Dr. David Brown",
      title: "MD, Cardiology",
      specialty: "Cardiology",
      image: "/professional-male-cardiologist-with-stethoscope.jpg",
      experience: "18+ years",
      education: [
        "MD - Johns Hopkins School of Medicine",
        "Cardiology Fellowship - Cleveland Clinic",
        "Board Certified - American Board of Cardiovascular Disease",
      ],
      specialties: ["Heart Disease", "Cardiac Catheterization", "Preventive Cardiology", "Heart Failure"],
      languages: ["English", "German"],
      availability: "Monday - Wednesday, Friday",
      bio: "Dr. Brown is a highly experienced cardiologist specializing in the diagnosis and treatment of heart conditions. He has performed thousands of cardiac procedures and is recognized for his expertise in preventive cardiology.",
      awards: ["Top Cardiologist", "Innovation in Cardiac Care", "Lifetime Achievement Award"],
      phone: "(555) 123-4570",
      email: "dr.brown@healthcareplus.com",
    },
    {
      id: "dr-davis",
      name: "Dr. Lisa Davis",
      title: "MD, Dermatology",
      specialty: "Dermatology",
      image: "/professional-female-dermatologist-examining-patien.jpg",
      experience: "8+ years",
      education: [
        "MD - Northwestern University Feinberg School of Medicine",
        "Dermatology Residency - University of Michigan",
        "Board Certified - American Board of Dermatology",
      ],
      specialties: ["Skin Cancer Screening", "Cosmetic Dermatology", "Acne Treatment", "Psoriasis"],
      languages: ["English", "Italian"],
      availability: "Tuesday - Friday",
      bio: "Dr. Davis is a skilled dermatologist who provides comprehensive skin care services. She specializes in both medical and cosmetic dermatology, with a focus on skin cancer prevention and treatment.",
      awards: ["Rising Star in Dermatology", "Patient Satisfaction Excellence"],
      phone: "(555) 123-4571",
      email: "dr.davis@healthcareplus.com",
    },
    {
      id: "dr-wilson",
      name: "Dr. Robert Wilson",
      title: "MD, Orthopedic Surgery",
      specialty: "Orthopedic Surgery",
      image: "/professional-male-orthopedic-surgeon.jpg",
      experience: "20+ years",
      education: [
        "MD - Duke University School of Medicine",
        "Orthopedic Surgery Residency - Hospital for Special Surgery",
        "Board Certified - American Board of Orthopedic Surgery",
      ],
      specialties: ["Joint Replacement", "Sports Medicine", "Spine Surgery", "Trauma Surgery"],
      languages: ["English"],
      availability: "Monday, Wednesday, Thursday",
      bio: "Dr. Wilson is a renowned orthopedic surgeon with two decades of experience in treating musculoskeletal conditions. He specializes in joint replacement surgery and sports medicine.",
      awards: ["Surgeon of Excellence", "Innovation in Orthopedic Surgery", "Top Doctor"],
      phone: "(555) 123-4572",
      email: "dr.wilson@healthcareplus.com",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Filters/Search could go here */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 relative">
                <img
                  src={doctor.image || "/placeholder.svg"}
                  alt={doctor.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/10"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <CardTitle className="text-xl">{doctor.name}</CardTitle>
              <CardDescription className="text-primary font-medium">{doctor.title}</CardDescription>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {doctor.experience} experience
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Specialties */}
              <div>
                <h4 className="font-medium text-sm text-foreground mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-1">
                  {doctor.specialties.slice(0, 3).map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {doctor.specialties.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{doctor.specialties.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h4 className="font-medium text-sm text-foreground mb-2">Languages</h4>
                <p className="text-sm text-muted-foreground">{doctor.languages.join(", ")}</p>
              </div>

              {/* Availability */}
              <div>
                <h4 className="font-medium text-sm text-foreground mb-2">Availability</h4>
                <p className="text-sm text-muted-foreground">{doctor.availability}</p>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href={`/appointments?doctor=${doctor.id}`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href={`/doctors/${doctor.id}`}>View Full Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <h3 className="text-2xl font-bold text-foreground mb-4">Can't Find the Right Specialist?</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          We work with a network of trusted specialists and can help you find the right care for your needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/contact">
              <Phone className="w-4 h-4 mr-2" />
              Contact Us
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/appointments">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Consultation
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
