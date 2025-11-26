"use client"

import * as React from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  Bell,
  Wrench,
  Settings,
  BarChart3,
  ChevronRight,
  LogIn,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useUserStore } from "@/store/userStore"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Resident Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Resident Profiles",
          url: "/residents/profiles",
        },
        {
          title: "Apartment Directory",
          url: "/residents/apartments",
        },
        {
          title: "Access Control",
          url: "/residents/access-control",
        },
        {
          title: "Document Management",
          url: "/residents/documents",
        },
        {
          title: "Residence Status",
          url: "/residents/status",
          admin: true
        },
      ],
    },
    {
      title: "Property Management",
      url: "#",
      icon: Building2,
      items: [
        {
          title: "Properties",
          url: "/property",
        },
        {
          title: "Lost Property",
          url: "/property/lost-property",
        },
      ],
    },
    {
      title: "Services",
      url: "#",
      icon: DollarSign,
      items: [
        {
          title: "Service Catalog",
          url: "/services/catalog",
        },
        {
          title: "Billing Center",
          url: "/services/billing",
        },
        {
          title: "Service Administration",
          url: "/services/manage",
          admin: true,
        },
        {
          title: "Financial Reports",
          url: "/services/reports",
          admin: true,
        },
      ],
    },
    {
      title: "Notifications",
      url: "#",
      icon: Bell,
      items: [
        {
          title: "Public Announcements",
          url: "/notifications/announcements",
        },
        {
          title: "Direct Messages",
          url: "/notifications/messages",
        },
      ],
    },
    {
      title: "Building Services",
      url: "#",
      icon: Wrench,
      items: [
        {
          title: "Service Booking",
          url: "/services/booking",
        },
        {
          title: "Customer Support",
          url: "/services/support",
        },
      ],
    },
    {
      title: "System Operations",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "System Settings",
          url: "/system/settings",
        },
      ],
    },
    {
      title: "Reports & Analytics",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Security Reports",
          url: "/reports/security",
        },
        {
          title: "Financial Reports",
          url: "/reports/financial",
        },
        {
          title: "General Reports",
          url: "/reports/general",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { userId, role, clearUser } = useUserStore()
  const isLoggedIn = Boolean(userId)
  const authLabel = isLoggedIn ? "Logout" : "Login"
  const AuthIcon = isLoggedIn ? LogOut : LogIn
  const isAdmin = role === "admin"

  const handleAuthAction = React.useCallback(() => {
    if (isLoggedIn) {
      clearUser()
      router.push("/")
      return
    }

    router.push("/login")
  }, [isLoggedIn, clearUser, router])

  return (
    <Sidebar {...props} variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Building2 className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Apartment Management</span>
                  <span className="text-xs">System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {isLoggedIn && (
          <SidebarGroup>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const Icon = item.icon
                const hasItems = item.items && item.items.length > 0
              
                if (hasItems) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Collapsible defaultOpen={false}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            {Icon && <Icon className="size-4" />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (isAdmin || !subItem.admin) && (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <Link href={subItem.url}>{subItem.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  )
                }
              
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url} className="font-medium">
                        {Icon && <Icon className="size-4" />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton variant="outline" onClick={handleAuthAction} tooltip={authLabel}>
              <AuthIcon className="size-4" />
              <span>{authLabel}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
