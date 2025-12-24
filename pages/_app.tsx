// pages/_app.tsx
import type { AppProps } from "next/app"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ThemeProvider } from "next-themes"
import "../styles/globals.css"
import { Toaster } from "sonner"
import { useUserStore } from "@/store/userStore"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"

// Public routes that don't require authentication
const publicRoutes = ["/", "/login"]

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const { userId, fullName: storeFullName } = useUserStore()

  useEffect(() => {
    setFullName(storeFullName)
    const isPublicRoute = publicRoutes.includes(router.pathname) || router.pathname === "/"
    const isAuthenticated = !!userId

    // If user is logged in and on root or index, redirect to dashboard
    if (isAuthenticated && (router.pathname === "/")) {
      router.push("/dashboard")
      setIsCheckingAuth(false)
      return
    }

    // If user is not logged in and trying to access protected route, redirect to /index
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/")
      setIsCheckingAuth(false)
      return
    }

    setIsCheckingAuth(false)
  }, [router.pathname, userId, storeFullName])

  // Show nothing while checking authentication to prevent flash
  if (isCheckingAuth) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <AppSidebar/>
        <SidebarInset>
          <header className="fixed flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-3">
              <SidebarTrigger />
              <ThemeToggle />
              {fullName && <span className="text-sm">Chào mừng trở lại, {fullName}</span>}
            </div>
          </header>
          <main>
            <Component {...pageProps} />
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  )
}

export default MyApp
