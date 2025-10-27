import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { PropertyInfoForm } from "@/components/PropertyInfoForm"
import { Property } from "@/types/properties"
import { APIBody } from "@/types/api"
import { ofetch } from "ofetch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

type PropertiesViewProps = {
  userId: string
}

export function PropertiesView({ userId }: PropertiesViewProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [newPropertyName, setNewPropertyName] = useState("")

  // Fetch properties
  const fetchProperties = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await ofetch<APIBody<Property[]>>(
        `/api/users/${userId}/properties`,
        {
          ignoreResponseError: true,
        }
      )

      if (res.success) {
        setProperties(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handlePropertyRowClick = (propertyId: number) => {
    setSelectedPropertyId(propertyId)
    setDialogOpen(true)
  }

  const handleAddProperty = async () => {
    if (!newPropertyName.trim()) {
      toast.error("Property name cannot be empty")
      return
    }

    setLoading(true)
    try {
      const res = await ofetch<APIBody<{ propertyId: number }>>(
        `/api/users/${userId}/properties`,
        {
          method: "POST",
          body: {
            propertyName: newPropertyName,
          },
          ignoreResponseError: true,
        }
      )

      if (res.success) {
        toast.success("Property created successfully")
        setAddSheetOpen(false)
        setNewPropertyName("")
        fetchProperties()
      } else {
        toast.error(res.message ?? "Failed to create property")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to create property")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold capitalize">Properties</h2>
        <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
          <Button onClick={() => setAddSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Property</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyName">Property Name</Label>
                <Input
                  id="propertyName"
                  value={newPropertyName}
                  onChange={(e) => setNewPropertyName(e.target.value)}
                  placeholder="Enter property name"
                />
              </div>
              <Button onClick={handleAddProperty}>Create Property</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property ID</TableHead>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No properties found
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow
                  key={property.propertyId}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handlePropertyRowClick(property.propertyId)}
                >
                  <TableCell>{property.propertyId}</TableCell>
                  <TableCell>{property.propertyName}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Property Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>
          {selectedPropertyId > 0 && (
            <PropertyInfoForm
              propertyId={selectedPropertyId}
              userId={userId}
              onSubmit={() => {
                fetchProperties()
                setDialogOpen(false)
              }}
              onDelete={() => {
                fetchProperties()
                setDialogOpen(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
