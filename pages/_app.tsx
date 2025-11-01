// pages/_app.tsx
import type { AppProps } from "next/app"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ThemeProvider } from "next-themes"
import "../styles/globals.css"
import { Toaster } from "sonner"
import Header from "../components/Header"
import { useUserStore } from "@/store/userStore"

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  useEffect(() => {
    const { userId, role } = useUserStore.getState()
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
      <Header />
      <main className="pt-16">
        <Component {...pageProps} />
      </main>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  )
}

export default MyApp
