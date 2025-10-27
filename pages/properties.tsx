import { useState } from "react"
import { useUserStore } from "@/store/userStore"
import { Package, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PropertiesView } from "@/components/PropertiesView"
import { VehicleView } from "@/components/VehicleView"

type ViewType = "properties" | "vehicle" | null

export default function Properties() {
  const userId = useUserStore((s) => s.userId)
  const [view, setView] = useState<ViewType>("properties")

  return (
    <main className="bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-20">
              <div className="px-2 py-3">
                <h2 className="text-sm font-semibold px-2">My Properties</h2>
              </div>
              <div>
                <Button
                  variant={view === "properties" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setView("properties")}
                >
                  <Package /> My Properties
                </Button>
                <Button
                  variant={view === "vehicle" ? "default" : "ghost"}
                  className="mt-2 w-full justify-start"
                  onClick={() => setView("vehicle")}
                >
                  <Car /> Vehicle
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="col-span-3 flex flex-col">
            {view && (
              <div>
                {view === "properties" ? (
                  <PropertiesView userId={userId!} />
                ) : view === "vehicle" ? (
                  <VehicleView userId={userId!} />
                ) : null}
              </div>
            )}

            {!view && (
              <div className="text-center text-muted-foreground py-8">
                Select an option from the sidebar to view data
              </div>
            )}
          </div>

          <div className="hidden md:block" />
        </div>
      </div>
    </main>
  )
}