import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, Heart, Stethoscope, Shield, Clock } from "lucide-react"
import Link from "next/link"

export function ServicesSection() {
  const services = [
    {
      icon: Calendar,
      title: "Easy Appointment Booking",
      description: "Schedule appointments online 24/7 with our convenient booking system.",
      href: "/appointments",
    },
    {
      icon: User,
      title: "Patient Portal",
      description: "Access your medical records, test results, and communicate with your care team.",
      href: "/patient-portal",
    },
    {
      icon: Stethoscope,
      title: "Expert Medical Care",
      description: "Our board-certified physicians provide comprehensive healthcare services.",
      href: "/doctors",
    },
    {
      icon: Heart,
      title: "Preventive Care",
      description: "Regular check-ups and screenings to keep you healthy and prevent illness.",
      href: "/health-resources",
    },
    {
      icon: Shield,
      title: "Emergency Services",
      description: "24/7 emergency care with rapid response and advanced medical equipment.",
      href: "/contact",
    },
    {
      icon: Clock,
      title: "Flexible Hours",
      description: "Extended hours and weekend availability to fit your busy schedule.",
      href: "/appointments",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground text-balance">
            Comprehensive Healthcare Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            From routine check-ups to specialized care, we provide a full range of medical services to keep you and your
            family healthy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary/80" asChild>
                  <Link href={service.href}>Learn More →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
