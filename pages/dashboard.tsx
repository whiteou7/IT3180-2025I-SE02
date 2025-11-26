import Link from "next/link"
import {
  Building2,
  Users,
  DollarSign,
  Bell,
  ArrowRight,
  Shield,
  Lock,
  FileText,
  PackageSearch,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/userStore"

export default function DashboardPage() {
  const { userId, role, fullName } = useUserStore()

  const isAdmin = role === "admin"
  const isPolice = role === "police"
  const isAccountant = role === "accountant"
  const isTenant = role === "tenant"

  const allQuickActions = [
    {
      title: "Resident Profiles",
      description: "View and manage resident information",
      icon: Users,
      href: "/residents/profiles",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      tenant: true,
      admin: true,
    },
    {
      title: "Properties",
      description: "Manage apartment properties",
      icon: Building2,
      href: "/property",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
      tenant: true,
      admin: true,
    },
    {
      title: "Billing Center",
      description: "Handle fees and invoices",
      icon: DollarSign,
      href: "/billing",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      tenant: true,
      admin: true,
      accountant: true,
    },
    {
      title: "Announcements",
      description: "View public announcements",
      icon: Bell,
      href: "/communication/announcements",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      tenant: true,
      admin: true,
      police: true,
      accountant: true,
    },
    {
      title: "Access Control",
      description: "Manage access permissions and security",
      icon: Lock,
      href: "/residents/access-control",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950",
      tenant: true,
      admin: true,
      police: true,
    },
    {
      title: "Document Management",
      description: "View and manage resident documents",
      icon: FileText,
      href: "/residents/documents",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
      tenant: true,
      admin: true,
      police: true,
    },
    {
      title: "Lost Property",
      description: "Report and track lost items",
      icon: PackageSearch,
      href: "/property/lost-property",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      tenant: true,
      admin: true,
      police: true,
    },
    {
      title: "Security Reports",
      description: "View security and access reports",
      icon: BarChart3,
      href: "/reports/security",
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
      admin: true,
      police: true,
    },
    {
      title: "Financial Reports",
      description: "View financial analytics and reports",
      icon: BarChart3,
      href: "/reports/financial",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      admin: true,
      accountant: true,
    },
  ]

  // Filter quick actions based on role (same logic as Sidebar.tsx)
  const filteredActions = allQuickActions.filter((action) => {
    return (
      (!action.admin && !action.police && !action.accountant && !action.tenant) || // No restrictions
      (action.admin && isAdmin) ||
      (action.police && isPolice) ||
      (action.accountant && isAccountant) ||
      (action.tenant && isTenant)
    )
  })

  // Limit to maximum 4 quick actions per role
  const quickActions = filteredActions.slice(0, 4)

  if (!userId) {
    return null
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {fullName || "User"}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your apartment management system
        </p>
        {role && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mt-2">
            <Shield className="size-4" />
            Role: {role.charAt(0).toUpperCase() + role.slice(1)}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`${action.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
                      <Icon className={`${action.color} size-6`} />
                    </div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      Go to page
                      <ArrowRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
