import { Navigation } from "@/components/navigation"
import { HealthcareOperationsDashboard } from "@/components/healthcare-operations-dashboard"

export default function OperationsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-foreground text-balance">Healthcare Operations Dashboard</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            AI-powered optimization and real-time monitoring across all healthcare departments.
          </p>
        </div>
        <div>
          <HealthcareOperationsDashboard />
        </div>
      </div>
    </main>
  )
}
