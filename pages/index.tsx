import { useEffect } from "react"
import { useRouter } from "next/router"
import { Building2, Users, DollarSign, Shield, Bell, Wrench } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserStore } from "@/store/userStore"

export default function HomePage() {
  const router = useRouter()
  const { userId } = useUserStore()

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (userId) {
      router.push("/dashboard")
    }
  }, [userId, router])

  const features = [
    {
      icon: Users,
      title: "Resident Management",
      description: "Manage resident profiles, apartments, and access control",
    },
    {
      icon: Building2,
      title: "Property Management",
      description: "Track properties, lost items, and property reports",
    },
    {
      icon: DollarSign,
      title: "Fee Collection",
      description: "Handle billing, invoices, and financial transactions",
    },
    {
      icon: Shield,
      title: "Security & Access",
      description: "Monitor access control and security reports",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Send announcements and manage communications",
    },
    {
      icon: Wrench,
      title: "Building Services",
      description: "Manage service catalog and handle service requests",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - System Information */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground flex aspect-square size-12 items-center justify-center rounded-lg">
                  <Building2 className="size-6" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Apartment Management System</h1>
                  <p className="text-muted-foreground text-lg mt-1">
                    Comprehensive solution for modern apartment complexes
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
                Streamline your apartment complex operations with our integrated management platform.
                From resident profiles to billing, property management to security - everything you need
                in one place.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-lg">
                          <Icon className="size-5" />
                        </div>
                        <CardTitle className="text-base">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Role-based access:</span> Admin, Police, Accountant
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Reports & Analytics:</span> Financial, Security, General
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome Back</CardTitle>
                  <CardDescription>
                    Sign in to access your apartment management dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LoginForm />
                </CardContent>
              </Card>
              
              {/* Quick Links */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Need help? Contact your system administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
