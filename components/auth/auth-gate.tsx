import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type AuthGateProps = {
  isAuthenticated: boolean
  title?: string
  description?: string
  actionLabel?: string
  children: React.ReactNode
}

export function AuthGate({
  isAuthenticated,
  title = "Cần đăng nhập",
  description = "Vui lòng đăng nhập để xem mục này.",
  actionLabel = "Đi tới trang đăng nhập",
  children,
}: AuthGateProps) {
  if (!isAuthenticated) {
    return (
      <Empty className="min-h-[480px] rounded-3xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldAlert className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/login">{actionLabel}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return <>{children}</>
}
