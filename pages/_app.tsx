// pages/_app.tsx
import type { AppProps } from "next/app"
import "../styles/globals.css"
import { Toaster } from "sonner"
import Header from "../components/Header"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <main className="pt-16">
        < Component {...pageProps} />
      </main>
      <Toaster position="top-center" richColors /></>
  )
}

export default MyApp
