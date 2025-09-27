import { Button } from "@/components/ui/button"
import { Calendar, Shield, Heart } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-background to-accent/20 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Your Health, Our Priority
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                Comprehensive healthcare services with compassionate care. Book appointments, access your records, and
                connect with our experienced medical professionals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/appointments">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/patient-portal">Patient Portal</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Patients Served</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Emergency Care</div>
              </div>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/20 rounded-2xl p-8 flex items-center justify-center">
              <img
                src="/professional-healthcare-team-in-modern-medical-fac.jpg"
                alt="Healthcare professionals in modern medical facility"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {/* Floating cards */}
            <div className="absolute -top-4 -left-4 bg-card border border-border rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Certified Care</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Compassionate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
