"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/storage"
import { useUserStore } from "@/store/userStore"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FileText, Upload, Trash2 } from "lucide-react"
import Link from "next/link"

type Document = {
  name: string
  path: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<Document | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const userId = useUserStore((s) => s.userId)

  useEffect(() => {
    fetchDocuments()
  }, [userId])

  const fetchDocuments = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const { data, error } = await supabase.storage
        .from("users")
        .list(`${userId}`, {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        })

      if (error) throw error

      const pdfDocs: Document[] = (data || [])
        .filter((file) => file.name.toLowerCase().endsWith(".pdf"))
        .map((file) => ({
          name: file.name,
          path: `${userId}/${file.name}`,
        }))

      setDocuments(pdfDocs)
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast.error("Failed to fetch documents")
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if it's a PDF
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are allowed")
      return
    }

    try {
      setUploading(true)
      const filePath = `${userId}/${file.name}`

      const { error: uploadError } = await supabase.storage
        .from("users")
        .upload(filePath, file, {
          contentType: "application/pdf",
          upsert: true,
        })

      if (uploadError) throw uploadError

      toast.success("Document uploaded successfully")
      fetchDocuments()
    } catch (error) {
      console.error("Error uploading document:", error)
      toast.error("Failed to upload document")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog) return

    try {
      const { error } = await supabase.storage
        .from("users")
        .remove([deleteDialog.path])

      if (error) throw error

      toast.success("Document deleted successfully")
      fetchDocuments()
      setDeleteDialog(null)
    } catch (error) {
      console.error("Error deleting document:", error)
      toast.error("Failed to delete document")
    }
  }

  const getPublicUrl = (path: string) => {
    const {
      data: { publicUrl },
    } = supabase.storage.from("users").getPublicUrl(path)
    return publicUrl
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Please log in to view your documents</p>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Legal Documents</h1>
            <p className="text-muted-foreground">
              Upload and manage your legal documents (PDF only)
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/feed">
              <Button variant="outline">Back to Feed</Button>
            </Link>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No documents yet</p>
            <p className="text-muted-foreground mb-4">
              Upload your first legal document
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.path}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-64 bg-muted flex items-center justify-center">
                  <iframe
                    src={getPublicUrl(doc.path)}
                    className="w-full h-full"
                    title={doc.name}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium truncate flex-1">{doc.name}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialog(doc)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteDialog?.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
