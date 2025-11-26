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

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [fullName, setFullName] = useState("")
  useEffect(() => {
    const { userId, role, fullName } = useUserStore.getState()
    setFullName(fullName)
    if (userId && role && router.pathname === "/") {
      router.push("/feed")
    }
  }, [router])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  if (isSmallScreen) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex items-center justify-center h-screen text-center p-6">
          <p>Please view the app on desktop screen thanks:3</p>
        </div>
      </ThemeProvider>
    )
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
              <span className="text-sm">Welcome back, {fullName}</span>
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
