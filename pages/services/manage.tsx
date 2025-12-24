import { useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { toast } from "sonner"
import { ofetch } from "ofetch"
import { Loader2, PencilLine, Plus, RefreshCw, Trash2 } from "lucide-react"

import { AuthGate } from "@/components/auth/auth-gate"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useUserStore } from "@/store/userStore"
import type { Service } from "@/types/services"
import type { ServiceCategory } from "@/types/enum"

type ServiceFormState = {
  serviceName: string
  description: string
  price: string
  tax: string
  category: ServiceCategory
  isAvailable: boolean
}

const defaultFormState: ServiceFormState = {
  serviceName: "",
  description: "",
  price: "0",
  tax: "5",
  category: "other",
  isAvailable: true,
}

const categoryOptions: { label: string; value: ServiceCategory }[] = [
  { label: "Dọn dẹp", value: "cleaning" },
  { label: "Bảo trì", value: "maintenance" },
  { label: "Tiện ích", value: "utilities" },
  { label: "Tiện nghi", value: "amenities" },
  { label: "Khác", value: "other" },
]

export default function ServiceAdministrationPage() {
  const { userId, role } = useUserStore()
  const isAdmin = role === "admin"
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formState, setFormState] = useState<ServiceFormState>(defaultFormState)

  const loadServices = async () => {
    setIsLoading(true)
    try {
      const response = await ofetch("/api/services", { ignoreResponseError: true })
      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể tải danh sách dịch vụ")
      }
      const payload = (response.data as Service[]).map((svc) => ({
        ...svc,
        price: Number(svc.price),
        tax: Number(svc.tax),
      }))
      setServices(payload)
    } catch (error) {
      console.error(error)
      toast.error("Không thể tải danh sách dịch vụ")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const handleOpenCreate = () => {
    setEditingService(null)
    setFormState(defaultFormState)
    setDialogOpen(true)
  }

  const handleOpenEdit = (service: Service) => {
    setEditingService(service)
    setFormState({
      serviceName: service.serviceName,
      description: service.description ?? "",
      price: service.price.toString(),
      tax: service.tax.toString(),
      category: service.category,
      isAvailable: service.isAvailable,
    })
    setDialogOpen(true)
  }

  const handleDuplicate = async (service: Service) => {
    try {
      setIsSaving(true)
      const response = await ofetch("/api/services", {
        method: "POST",
        body: {
          serviceName: `${service.serviceName} copy`,
          description: service.description,
          price: service.price,
          tax: service.tax,
          category: service.category,
          isAvailable: service.isAvailable,
        },
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể nhân bản dịch vụ")
      }
      toast.success("Đã nhân bản dịch vụ")
      await loadServices()
    } catch (error) {
      console.error(error)
      toast.error("Không thể nhân bản dịch vụ")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (service: Service) => {
    if (!window.confirm(`Xóa "${service.serviceName}"?`)) return
    try {
      setIsSaving(true)
      const response = await ofetch(`/api/services/${service.serviceId}`, {
        method: "DELETE",
        body: { serviceId: service.serviceId },
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể xóa dịch vụ")
      }
      toast.success("Đã xóa dịch vụ")
      await loadServices()
    } catch (error) {
      console.error(error)
      toast.error("Không thể xóa dịch vụ")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!formState.serviceName || Number(formState.price) <= 0) {
      toast.error("Vui lòng nhập tên và giá hợp lệ.")
      return
    }
    try {
      setIsSaving(true)
      const payload = {
        serviceName: formState.serviceName,
        description: formState.description,
        price: Number(formState.price),
        tax: Number(formState.tax),
        category: formState.category,
        isAvailable: formState.isAvailable,
      }
      const endpoint = editingService ? `/api/services/${editingService.serviceId}` : "/api/services"
      const method = editingService ? "PUT" : "POST"
      const response = await ofetch(endpoint, {
        method,
        body: payload,
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Không thể lưu dịch vụ")
      }
      toast.success(editingService ? "Đã cập nhật dịch vụ" : "Đã tạo dịch vụ")
      setDialogOpen(false)
      setEditingService(null)
      setFormState(defaultFormState)
      await loadServices()
    } catch (error) {
      console.error(error)
      toast.error("Không thể lưu dịch vụ")
    } finally {
      setIsSaving(false)
    }
  }

  const totalActive = useMemo(() => services.filter((svc) => svc.isAvailable).length, [services])

  return (
    <>
      <Head>
        <title>Quản lý dịch vụ • Thu phí</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Bảng điều khiển</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Quản lý dịch vụ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Vòng đời dịch vụ</h1>
            <p className="text-muted-foreground text-sm">
              Tạo, cập nhật hoặc ẩn dịch vụ hiển thị cho cư dân.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadServices} variant="ghost" disabled={isLoading}>
              <RefreshCw className={`mr-2 size-4 ${isLoading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) {
                  setEditingService(null)
                  setFormState(defaultFormState)
                }
              }}
            >
              <Button disabled={!isAdmin} onClick={handleOpenCreate}>
                <Plus className="mr-2 size-4" />
                Thêm dịch vụ
              </Button>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingService ? "Sửa dịch vụ" : "Tạo dịch vụ"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceName">Tên dịch vụ</Label>
                    <Input
                      id="serviceName"
                      value={formState.serviceName}
                      onChange={(event) => setFormState((prev) => ({ ...prev, serviceName: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={formState.description}
                      onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price">Giá (USD)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={formState.price}
                        onChange={(event) => setFormState((prev) => ({ ...prev, price: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax">Thuế (%)</Label>
                      <Input
                        id="tax"
                        type="number"
                        min="0"
                        value={formState.tax}
                        onChange={(event) => setFormState((prev) => ({ ...prev, tax: event.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nhóm</Label>
                    <Select
                      value={formState.category}
                      onValueChange={(value: ServiceCategory) => setFormState((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhóm" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">Hiển thị cho cư dân</p>
                      <p className="text-muted-foreground text-xs">Bật để hiển thị, tắt để ẩn.</p>
                    </div>
                    <Switch
                      checked={formState.isAvailable}
                      onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isAvailable: checked }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? "Đang lưu..." : editingService ? "Lưu thay đổi" : "Tạo dịch vụ"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <AuthGate isAuthenticated={Boolean(userId)}>
          {isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle>Danh sách dịch vụ</CardTitle>
                <CardDescription>Theo dõi trạng thái hiển thị và giá dịch vụ.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline">{services.length} dịch vụ</Badge>
                  <Badge variant="default">{totalActive} đang hiển thị</Badge>
                </div>
                <div className="rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead>Nhóm</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Thuế</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            <Loader2 className="mx-auto size-4 animate-spin" />
                          </TableCell>
                        </TableRow>
                      ) : services.length ? (
                        services.map((service) => (
                          <TableRow key={service.serviceId}>
                            <TableCell className="font-medium">{service.serviceName}</TableCell>
                            <TableCell className="capitalize">{service.category}</TableCell>
                            <TableCell>${service.price.toFixed(2)}</TableCell>
                            <TableCell>{service.tax}%</TableCell>
                            <TableCell>
                              <Badge variant={service.isAvailable ? "default" : "secondary"}>
                                {service.isAvailable ? "Đang hiển thị" : "Đang ẩn"}
                              </Badge>
                            </TableCell>
                            <TableCell className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleOpenEdit(service)}
                                aria-label={`Edit ${service.serviceName}`}
                              >
                                <PencilLine className="size-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDuplicate(service)}
                                aria-label={`Duplicate ${service.serviceName}`}
                              >
                                <Plus className="size-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(service)}
                                aria-label={`Delete ${service.serviceName}`}
                              >
                                <Trash2 className="text-destructive size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                            Chưa có dịch vụ nào.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Chỉ quản trị viên mới có thể quản lý dịch vụ.
              </CardContent>
            </Card>
          )}
        </AuthGate>
      </div>
    </>
  )
}
