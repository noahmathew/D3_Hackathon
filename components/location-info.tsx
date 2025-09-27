import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Clock, Car, Bus, Navigation } from "lucide-react"

export function LocationInfo() {
  return (
    <div className="space-y-6">
      {/* Main Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Our Location
          </CardTitle>
          <CardDescription>Visit us at our main healthcare facility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <div className="font-semibold">HealthCare Plus Medical Center</div>
                <div className="text-muted-foreground">
                  123 Medical Center Drive
                  <br />
                  Suite 100
                  <br />
                  Springfield, ST 12345
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-1" />
              <div>
                <div className="font-semibold">Phone</div>
                <div className="text-muted-foreground">(555) 123-4567</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-1" />
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-muted-foreground">info@healthcareplus.com</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent">
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </Button>
          </div>
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
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monday - Friday</span>
            <span className="font-medium">8:00 AM - 6:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Saturday</span>
            <span className="font-medium">9:00 AM - 2:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sunday</span>
            <span className="font-medium">Closed</span>
          </div>
          <div className="pt-3 border-t border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Emergency Line</span>
              <span className="font-medium text-primary">24/7 Available</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transportation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Getting Here
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Car className="w-5 h-5 text-primary mt-1" />
            <div>
              <div className="font-semibold">By Car</div>
              <div className="text-sm text-muted-foreground">
                Free parking available in our main lot. Valet parking available for patients with mobility needs.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Bus className="w-5 h-5 text-primary mt-1" />
            <div>
              <div className="font-semibold">Public Transportation</div>
              <div className="text-sm text-muted-foreground">
                Bus routes 15, 22, and 45 stop directly in front of our building. Metro station is 0.3 miles away.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            For medical emergencies, call 911 immediately. For urgent but non-emergency medical concerns:
          </p>
          <Button variant="destructive" className="w-full">
            <Phone className="w-4 h-4 mr-2" />
            Emergency Line: (555) 911-HELP
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
