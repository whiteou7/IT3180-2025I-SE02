// pages/_app.tsx
import type { AppProps } from "next/app"
import "../styles/globals.css"
import { Toaster } from "sonner"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster position="top-center" richColors />
    </>
  )
}

export default MyApp
