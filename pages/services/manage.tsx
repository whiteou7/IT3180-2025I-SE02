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
  { label: "Cleaning", value: "cleaning" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Utilities", value: "utilities" },
  { label: "Amenities", value: "amenities" },
  { label: "Other", value: "other" },
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
        throw new Error(response?.message ?? "Unable to fetch services")
      }
      const payload = (response.data as Service[]).map((svc) => ({
        ...svc,
        price: Number(svc.price),
        tax: Number(svc.tax),
      }))
      setServices(payload)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load services")
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
        throw new Error(response?.message ?? "Unable to duplicate service")
      }
      toast.success("Service duplicated")
      await loadServices()
    } catch (error) {
      console.error(error)
      toast.error("Failed to duplicate service")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (service: Service) => {
    if (!window.confirm(`Delete ${service.serviceName}?`)) return
    try {
      setIsSaving(true)
      const response = await ofetch(`/api/services/${service.serviceId}`, {
        method: "DELETE",
        body: { serviceId: service.serviceId },
        ignoreResponseError: true,
      })
      if (!response?.success) {
        throw new Error(response?.message ?? "Unable to delete service")
      }
      toast.success("Service deleted")
      await loadServices()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete service")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!formState.serviceName || Number(formState.price) <= 0) {
      toast.error("Please provide a valid name and price.")
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
        throw new Error(response?.message ?? "Unable to save service")
      }
      toast.success(editingService ? "Service updated" : "Service created")
      setDialogOpen(false)
      setEditingService(null)
      setFormState(defaultFormState)
      await loadServices()
    } catch (error) {
      console.error(error)
      toast.error("Failed to save service")
    } finally {
      setIsSaving(false)
    }
  }

  const totalActive = useMemo(() => services.filter((svc) => svc.isAvailable).length, [services])

  return (
    <>
      <Head>
        <title>Service administration • Fee collection</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Service administration</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Service lifecycle</h1>
            <p className="text-muted-foreground text-sm">
              Publish, update, or retire services that appear in the resident catalog.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadServices} variant="ghost" disabled={isLoading}>
              <RefreshCw className={`mr-2 size-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
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
                New service
              </Button>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingService ? "Edit service" : "Create service"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceName">Service name</Label>
                    <Input
                      id="serviceName"
                      value={formState.serviceName}
                      onChange={(event) => setFormState((prev) => ({ ...prev, serviceName: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={formState.description}
                      onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={formState.price}
                        onChange={(event) => setFormState((prev) => ({ ...prev, price: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax">Tax (%)</Label>
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
                    <Label>Category</Label>
                    <Select
                      value={formState.category}
                      onValueChange={(value: ServiceCategory) => setFormState((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                      <p className="text-sm font-medium">Available in catalog</p>
                      <p className="text-muted-foreground text-xs">Toggle to draft or publish service.</p>
                    </div>
                    <Switch
                      checked={formState.isAvailable}
                      onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isAvailable: checked }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? "Saving..." : editingService ? "Save changes" : "Create service"}
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
                <CardTitle>Service registry</CardTitle>
                <CardDescription>Track availability, pricing, and lifecycle per service.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline">{services.length} total services</Badge>
                  <Badge variant="default">{totalActive} active</Badge>
                </div>
                <div className="rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                                {service.isAvailable ? "Published" : "Draft"}
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
                            No services configured yet.
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
                Administrator access is required to manage services.
              </CardContent>
            </Card>
          )}
        </AuthGate>
      </div>
    </>
  )
}

