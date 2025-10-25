// pages/_app.tsx
import type { AppProps } from "next/app"
import { useEffect } from "react"
import { useRouter } from "next/router"
import "../styles/globals.css"
import { Toaster } from "sonner"
import Header from "../components/Header"

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem("userId")

    if (userId && router.pathname === "/") {
      router.push("/feed")
    }
  }, [router])

  return (
    <>
      <Header />
      <main className="pt-16">
        <Component {...pageProps} />
      </main>
      <Toaster position="top-center" richColors />
    </>
  )
}

export default MyApp
