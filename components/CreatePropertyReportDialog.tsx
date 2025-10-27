"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { ofetch } from "ofetch"
import { useUserStore } from "@/store/userStore"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Property } from "@/types/properties"
import { toast } from "sonner"

export function CreatePropertyReportDialog() {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [propertyId, setPropertyId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingProperties, setLoadingProperties] = useState(false)
  const userId = useUserStore(s => s.userId)

  // Fetch user properties when dialog opens
  useEffect(() => {
    if (open && userId) {
      loadProperties()
    }
  }, [open, userId])

  async function loadProperties() {
    try {
      setLoadingProperties(true)
      const res = await ofetch(`/api/properties/available?userId=${userId}`, {
        method: "GET",
        ignoreResponseError: true,
      })

      if (res.success) {
        setProperties(res.data || [])
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load properties")
    } finally {
      setLoadingProperties(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !propertyId) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const res = await ofetch("/api/property-reports", {
        method: "POST",
        body: { 
          userId, 
          propertyId, 
          content: content.trim() 
        },
        ignoreResponseError: true,
      })

      if (res.success) {
        toast.success("Property report created successfully")
        setOpen(false)
        setContent("")
        setPropertyId(null)
        setTimeout(() => window.location.reload(), 200)
      } else {
        toast.error(res.message || "Failed to create property report")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to create property report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mb-2">
          <AlertCircle className="mr-2 h-4 w-4" />Report Lost Property
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Lost Property</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property">Lost Property</Label>
            <Select
              value={propertyId?.toString() || ""}
              onValueChange={(value) => setPropertyId(parseInt(value))}
              disabled={loadingProperties}
            >
              <SelectTrigger id="property">
                <SelectValue placeholder={loadingProperties ? "Loading..." : "Select a property"} />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.propertyId} value={property.propertyId.toString()}>
                    {property.propertyName} #{property.propertyId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Description</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe where and when you lost this property..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || !content.trim() || !propertyId}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
