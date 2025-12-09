import { useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import {
  BadgePercent,
  Loader2,
  RefreshCw,
  Search,
  ShoppingCart,
  Sparkles,
} from "lucide-react"

import { AuthGate } from "@/components/auth/auth-gate"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import type { Service } from "@/types/services"
import type { BillingSummary } from "@/types/billings"
import type { ServiceCategory } from "@/types/enum"
import { useUserStore } from "@/store/userStore"

type CartMap = Record<number, number>

const CATEGORY_TABS: { label: string; value: ServiceCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Cleaning", value: "cleaning" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Utilities", value: "utilities" },
  { label: "Amenities", value: "amenities" },
  { label: "Other", value: "other" },
]

export default function ServiceCatalogPage() {
  const { userId, fullName } = useUserStore()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<"all" | ServiceCategory>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [cart, setCart] = useState<CartMap>({})
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [recentBillings, setRecentBillings] = useState<BillingSummary[]>([])
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)

  const cartEntries = useMemo(() => {
    return Object.entries(cart)
      .map(([serviceId, quantity]) => {
        const service = services.find((svc) => svc.serviceId === Number(serviceId))
        if (!service) return null
        return { service, quantity }
      })
      .filter(Boolean) as { service: Service; quantity: number }[]
  }, [cart, services])

  const cartTotal = useMemo(() => {
    return cartEntries.reduce((sum, entry) => {
      const lineTotal = entry.service.price * entry.quantity
      const tax = (lineTotal * entry.service.tax) / 100
      return sum + lineTotal + tax
    }, 0)
  }, [cartEntries])

  useEffect(() => {
    let mounted = true
    const fetchServices = async () => {
      setIsLoading(true)
      try {
        const response = await ofetch("/api/services", { ignoreResponseError: true })
        if (!response?.success) {
          throw new Error(response?.message ?? "Unable to fetch services")
        }
        if (mounted) {
          const normalized = (response.data as Service[]).map((svc) => ({
            ...svc,
            price: Number(svc.price),
            tax: Number(svc.tax),
          }))
          setServices(normalized)
          const maxPrice =
            normalized.reduce((max: number, svc: Service) => Math.max(max, Number(svc.price)), 0) || 500
          setPriceRange([0, Math.ceil(maxPrice)])
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to load services")
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchServices()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    let mounted = true

    const fetchHistory = async () => {
      try {
        const response = await ofetch("/api/billings", {
          query: { userId, limit: 3 },
          ignoreResponseError: true,
        })
        if (!response?.success) {
          throw new Error(response?.message ?? "Unable to fetch recent activity")
        }
        if (mounted) {
          setRecentBillings(response.data as BillingSummary[])
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchHistory()
    return () => {
      mounted = false
    }
  }, [userId])

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
      const matchesSearch =
        !searchTerm ||
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPrice =
        Number(service.price) >= priceRange[0] && Number(service.price) <= priceRange[1]
      return matchesCategory && matchesSearch && matchesPrice && service.isAvailable
    })
  }, [services, selectedCategory, searchTerm, priceRange])

  const handleAddToCart = (serviceId: number) => {
    setCart((prev) => ({
      ...prev,
      [serviceId]: (prev[serviceId] ?? 0) + 1,
    }))
  }

  const handleUpdateQuantity = (serviceId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => {
        const next = { ...prev }
        delete next[serviceId]
        return next
      })
      return
    }
    setCart((prev) => ({ ...prev, [serviceId]: quantity }))
  }

  const handleCheckout = async () => {
    if (!userId) {
      toast.error("Please log in to complete checkout.")
      return
    }
    const serviceIds = cartEntries.flatMap((entry) => Array(entry.quantity).fill(entry.service.serviceId))
    if (!serviceIds.length) {
      toast.error("Add a service to your cart first.")
      return
    }

    try {
      setIsCheckoutLoading(true)
      const response = await ofetch("/api/billings", {
        method: "POST",
        body: {
          userId,
          serviceIds,
        },
        ignoreResponseError: true,
      })

      if (!response?.success) {
        throw new Error(response?.message ?? "Failed to generate billing")
      }

      toast.success("Checkout complete. Billing recorded.")
      setCart({})
      setIsCartOpen(false)
      setRecentBillings((prev) => [
        {
          billingId: response.data.billingId,
          userId,
          fullName,
          billingStatus: "unpaid",
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          periodStart: new Date().toISOString(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          paidAt: null,
          totalAmount: cartTotal,
          serviceCount: serviceIds.length,
          services: cartEntries.map((entry) => ({
            serviceId: entry.service.serviceId,
            serviceName: entry.service.serviceName,
            price: entry.service.price,
            description: entry.service.description,
            tax: entry.service.tax,
          })),
        },
        ...prev,
      ])
    } catch (error) {
      console.error(error)
      toast.error("Unable to complete checkout")
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  const handleRebook = (billing: BillingSummary) => {
    const nextCart: CartMap = {}
    billing.services.forEach((service) => {
      nextCart[service.serviceId] = (nextCart[service.serviceId] ?? 0) + 1
    })
    setCart(nextCart)
    setIsCartOpen(true)
  }

  return (
    <>
      <Head>
        <title>Service catalog • Fee collection</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Service catalog</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Service marketplace</h1>
            <p className="text-muted-foreground text-sm">
              Browse curated building services and bundle them into a single checkout.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setIsCartOpen(true)} className="gap-2" disabled={!cartEntries.length}>
              <ShoppingCart className="size-4" />
              View cart ({cartEntries.length})
            </Button>
            <Button variant="ghost" onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          </div>
        </div>

        <AuthGate isAuthenticated={Boolean(userId)}>
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Find the right service bundle with quick filters.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Tabs value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as typeof selectedCategory)}>
                  <TabsList className="grid grid-cols-3 md:grid-cols-6">
                    {CATEGORY_TABS.map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute left-3 top-3 size-4" />
                    <Input
                      placeholder="Search service or description"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Price range</p>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange([value[0], value[1]] as [number, number])}
                      min={0}
                      max={Math.max(priceRange[1], 500)}
                    />
                    <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
              <div className="grid gap-4 sm:grid-cols-2">
                {isLoading ? (
                  <div className="col-span-2 flex items-center justify-center py-24">
                    <Loader2 className="text-muted-foreground size-6 animate-spin" />
                  </div>
                ) : filteredServices.length ? (
                  filteredServices.map((service) => (
                    <Card key={service.serviceId} className="flex flex-col justify-between">
                      <CardHeader className="gap-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{service.serviceName}</CardTitle>
                          <Badge variant={service.isAvailable ? "default" : "secondary"}>
                            {service.category}
                          </Badge>
                        </div>
                        <CardDescription>{service.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <BadgePercent className="text-muted-foreground size-4" />
                          <span>{service.tax}% tax • ${service.price.toFixed(2)}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">
                            ${(service.price + (service.price * service.tax) / 100).toFixed(2)}
                          </p>
                          <p className="text-muted-foreground text-xs">Tax-inclusive</p>
                        </div>
                        <Button onClick={() => handleAddToCart(service.serviceId)}>Add to cart</Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 rounded-xl border border-dashed p-10 text-center">
                    <Sparkles className="text-muted-foreground mx-auto mb-3 size-5" />
                    <p className="text-sm font-medium">No services match your filters.</p>
                    <p className="text-muted-foreground text-xs">
                      Adjust your filters or contact administrators for custom offerings.
                    </p>
                  </div>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent bundles</CardTitle>
                  <CardDescription>Rebook frequently used service packages.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {recentBillings.length ? (
                    recentBillings.map((billing) => (
                      <div key={billing.billingId} className="rounded-xl border p-3">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="font-medium">{billing.billingId.slice(0, 8).toUpperCase()}</p>
                            <p className="text-muted-foreground text-xs">
                              {billing.serviceCount} services • Due{" "}
                              {new Date(billing.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleRebook(billing)}>
                            Rebook
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No billing activity yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </AuthGate>
      </div>

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="flex flex-col gap-4">
          <SheetHeader>
            <SheetTitle>Cart overview</SheetTitle>
            <SheetDescription>Review bundled services before generating a bill.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto mx-4">
            {cartEntries.length ? (
              cartEntries.map((entry) => (
                <div key={entry.service.serviceId} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold">{entry.service.serviceName}</p>
                      <p className="text-muted-foreground text-xs">
                        ${(entry.service.price + (entry.service.price * entry.service.tax) / 100).toFixed(2)} per unit
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Decrease ${entry.service.serviceName} quantity`}
                        onClick={() => handleUpdateQuantity(entry.service.serviceId, entry.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{entry.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Increase ${entry.service.serviceName} quantity`}
                        onClick={() => handleUpdateQuantity(entry.service.serviceId, entry.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Add services to your cart to create a bill.
              </div>
            )}
          </div>

          <Separator />

          <SheetFooter className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <p>Estimated total</p>
              <p className="text-lg font-semibold">${cartTotal.toFixed(2)}</p>
            </div>
            <Button disabled={!cartEntries.length || isCheckoutLoading} onClick={handleCheckout}>
              {isCheckoutLoading ? "Processing..." : "Generate billing"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
