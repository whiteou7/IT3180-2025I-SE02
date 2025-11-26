import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import {
  Building2,
  Users,
  DollarSign,
  Bell,
  Settings,
  BarChart3,
  ArrowRight,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/userStore"

interface DashboardStats {
  totalResidents?: number
  totalProperties?: number
  pendingBills?: number
  recentAnnouncements?: number
}

export default function DashboardPage() {
  const { userId, role, fullName } = useUserStore()

  const quickActions = [
    {
      title: "Resident Profiles",
      description: "View and manage resident information",
      icon: Users,
      href: "/residents/profiles",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Properties",
      description: "Manage apartment properties",
      icon: Building2,
      href: "/property",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Billing Center",
      description: "Handle fees and invoices",
      icon: DollarSign,
      href: "/billing",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Announcements",
      description: "View public announcements",
      icon: Bell,
      href: "/notifications/announcements",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ]

  const mainSections = [
    {
      title: "Resident Management",
      description: "Manage residents, apartments, and access control",
      icon: Users,
      href: "/residents/profiles",
      items: [
        { label: "Resident Profiles", href: "/residents/profiles" },
        { label: "Apartment Directory", href: "/residents/apartments" },
        { label: "Access Control", href: "/residents/access-control" },
        { label: "Document Management", href: "/residents/documents" },
      ],
    },
    {
      title: "Property Management",
      description: "Track properties and lost items",
      icon: Building2,
      href: "/property",
      items: [
        { label: "Properties", href: "/property" },
        { label: "Lost Property", href: "/property/lost-property" },
      ],
    },
    {
      title: "Reports & Analytics",
      description: "View system reports and analytics",
      icon: BarChart3,
      href: "/reports/general",
      items: [
        { label: "General Reports", href: "/reports/general", admin: true },
        { label: "Financial Reports", href: "/reports/financial", admin: true, accountant: true },
        { label: "Security Reports", href: "/reports/security", admin: true, police: true },
      ],
    },
  ]

  const isAdmin = role === "admin"
  const isPolice = role === "police"
  const isAccountant = role === "accountant"

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
