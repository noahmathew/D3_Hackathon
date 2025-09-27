import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Phone, Mail, Award, GraduationCap, Clock, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Doctor {
  id: string
  name: string
  title: string
  specialty: string
  image: string
  experience: string
  education: string[]
  specialties: string[]
  languages: string[]
  availability: string
  bio: string
  awards: string[]
  phone: string
  email: string
  officeHours: Record<string, string>
  procedures: string[]
  philosophy: string
}

interface DoctorDetailProfileProps {
  doctor: Doctor
}

export function DoctorDetailProfile({ doctor }: DoctorDetailProfileProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/doctors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Doctors
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={doctor.image || "/placeholder.svg"}
                    alt={doctor.name}
                    className="w-48 h-48 rounded-lg object-cover border-4 border-primary/10"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{doctor.name}</h1>
                    <p className="text-xl text-primary font-medium">{doctor.title}</p>
                    <p className="text-muted-foreground">{doctor.specialty}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {doctor.experience} experience
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1">5.0 (127 reviews)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button size="lg" asChild>
                      <Link href={`/appointments?doctor=${doctor.id}`}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg">
                      <Phone className="w-4 h-4 mr-2" />
                      {doctor.phone}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About Dr. {doctor.name.split(" ").pop()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{doctor.bio}</p>

              <div className="bg-accent/50 p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Medical Philosophy</h4>
                <p className="text-muted-foreground italic">"{doctor.philosophy}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Education & Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Education & Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {doctor.education.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Awards & Recognition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Awards & Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {doctor.awards.map((award, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                    <Award className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-medium text-foreground">{award}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Procedures & Services */}
          <Card>
            <CardHeader>
              <CardTitle>Procedures & Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {doctor.procedures.map((procedure, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-muted-foreground">{procedure}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href={`/appointments?doctor=${doctor.id}`}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Link>
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Phone className="w-4 h-4 mr-2" />
                Call Office
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Office Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Office Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(doctor.officeHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between">
                  <span className="text-muted-foreground">{day}</span>
                  <span className="font-medium">{hours}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle>Languages Spoken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((language) => (
                  <Badge key={language} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{doctor.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <div className="text-muted-foreground">
                  <div>123 Medical Center Drive</div>
                  <div>Suite 100, City, ST 12345</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
