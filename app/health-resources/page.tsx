import { Navigation } from "@/components/navigation"
import { HealthResources } from "@/components/health-resources"

export default function HealthResourcesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-foreground text-balance">Health Education Resources</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Stay informed about your health with our comprehensive collection of educational materials, wellness tips,
            and preventive care information.
          </p>
        </div>
        <HealthResources />
      </div>
    </main>
  )
}
