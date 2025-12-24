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

type SidebarSubItem = {
  title: string
  url: string
  tenant?: boolean
  admin?: boolean
  police?: boolean
  accountant?: boolean
}

type SidebarNavItem = {
  title: string
  url: string
  icon: React.ComponentType
  items?: SidebarSubItem[]
}

const data: { navMain: SidebarNavItem[] } = {
  navMain: [
    {
      title: "Bảng điều khiển",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Quản lý Cư dân",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Hồ sơ Cư dân",
          url: "/residents/profiles",
          tenant: true,
          admin: true,
        },
        {
          title: "Danh sách Căn hộ",
          url: "/residents/apartments",
          tenant: true,
          admin: true,
        },
        {
          title: "Kiểm soát Ra vào",
          url: "/residents/access-control",
          tenant: true,
          admin: true,
          police: true,
        },
        {
          title: "Quản lý Tài liệu",
          url: "/residents/documents",
          tenant: true,
          admin: true,
          police: true,
        },
        {
          title: "Trạng thái Cư trú",
          url: "/residents/status",
          admin: true
        },
      ],
    },
    {
      title: "Quản lý Tài sản",
      url: "#",
      icon: Building2,
      items: [
        {
          title: "Tài sản",
          url: "/property",
          tenant: true,
          admin: true,
        },
        {
          title: "Tài sản Thất lạc",
          url: "/property/lost-property",
          tenant: true,
          admin: true,
          police: true,
        },
      ],
    },
    {
      title: "Thu Phí",
      url: "#",
      icon: DollarSign,
      items: [
        {
          title: "Trung tâm Thanh toán",
          url: "/billing",
          tenant: true,
          admin: true,
          accountant: true,
        },
      ],
    },
    {
      title: "Giao tiếp",
      url: "#",
      icon: Bell,
      items: [
        {
          title: "Thông báo Công khai",
          url: "/communication/announcements",
          tenant: true,
          admin: true,
          police: true,
          accountant: true,
        },
        {
          title: "Tin nhắn Riêng",
          url: "/communication/chat",
          tenant: true,
          admin: true,
          police: true,
          accountant: true,
        },
      ],
    },
    {
      title: "Dịch vụ Tòa nhà",
      url: "#",
      icon: Wrench,
      items: [
        {
          title: "Danh mục Dịch vụ",
          url: "/services/catalog",
          tenant: true,
          admin: true,
        },
        {
          title: "Quản lý Dịch vụ",
          url: "/services/manage",
          admin: true,
        },
        {
          title: "Phản hồi",
          url: "/services/feedbacks",
          tenant: true,
          admin: true,
        },
      ],
    },
    {
      title: "Vận hành Hệ thống",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Cài đặt Hệ thống",
          url: "/system/settings",
          admin: true,
        },
      ],
    },
    {
      title: "Báo cáo & Phân tích",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Báo cáo An ninh",
          url: "/reports/security",
          admin: true,
          police: true,
        },
        {
          title: "Báo cáo Tài chính",
          url: "/reports/financial",
          admin: true,
          accountant: true,
        },
        {
          title: "Báo cáo Tổng hợp",
          url: "/reports/general",
          admin: true,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { userId, role, clearUser } = useUserStore()
  const isLoggedIn = Boolean(userId)
  const authLabel = isLoggedIn ? "Đăng xuất" : "Đăng nhập"
  const AuthIcon = isLoggedIn ? LogOut : LogIn
  const isAdmin = role === "admin"
  const isPolice = role === "police"
  const isAccountant = role === "accountant"
  const isTenant = role === "tenant"

  const handleAuthAction = React.useCallback(() => {
    if (isLoggedIn) {
      clearUser()
      router.push("/")
      return
    }

    router.push("/login")
  }, [isLoggedIn, clearUser, router])

  // Helper function to check if a sub-item is accessible
  const isSubItemAccessible = React.useCallback((subItem: SidebarSubItem) => {
    return (
      (!subItem.admin && !subItem.police && !subItem.accountant) || // No restrictions
      (subItem.admin && isAdmin) ||
      (subItem.police && isPolice) ||
      (subItem.accountant && isAccountant) ||
      (subItem.tenant && isTenant)
    )
  }, [isAdmin, isPolice, isAccountant, isTenant])

  // Helper function to check if any child items are accessible
  const hasAccessibleChildren = React.useCallback((items: SidebarSubItem[]) => {
    return items.some(isSubItemAccessible)
  }, [isSubItemAccessible])

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
                  <span className="font-medium">Quản lý Chung cư</span>
                  <span className="text-xs">Hệ thống</span>
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
              
                if (hasItems && item.items) {
                  // Only render parent item if at least one child is accessible
                  if (!hasAccessibleChildren(item.items)) {
                    return null
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <Collapsible defaultOpen={false}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            {Icon && <Icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => {
                              // Check if user has access based on role flags
                              if (!isSubItemAccessible(subItem)) {
                                return null
                              }
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
                                    <Link href={subItem.url}>{subItem.title}</Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  )
                }
              
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        {Icon && <Icon />}
                        <span className="font-medium">{item.title}</span>
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
