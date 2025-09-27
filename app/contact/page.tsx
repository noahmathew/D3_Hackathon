import { ContactForm } from "@/components/contact-form"
import { LocationInfo } from "@/components/location-info"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Get in touch with our healthcare team. We're here to help with your medical needs and answer any questions
            you may have.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <ContactForm />
          <LocationInfo />
        </div>
      </div>
    </div>
  )
}
