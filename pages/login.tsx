import Head from "next/head"
import { LoginForm } from "@/components/login-form"

export default function Page() {
  return (
    <>
      <Head>
        <title>Đăng nhập • Quản lý chung cư</title>
      </Head>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </>
  )
}
