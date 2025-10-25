import React, { useEffect, useState } from "react"
import { Feed } from "@/components/Feed"
import { Button } from "@/components/ui/button"
import { House, ScrollText } from "lucide-react"
import { CreatePostDialog } from "@/components/CreatePostDialog"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApartmentInfoForm } from "@/components/ApartmentInfoForm"

export default function Home() {
  const [userId, setUserId] = useState<string>("")
    
  useEffect(() => {
    const uid = localStorage.getItem("userId") ?? ""
    setUserId(uid)
  }, [])
  return (
    <main className="bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* grid: left sidebar (md+), center feed, right spacer */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* left sidebar with buttons - visible on md+ */}
          <aside className="hidden md:block">
            <div className="sticky top-20">
              <div className="px-2 py-3">
                <h2 className="text-sm font-semibold px-2">Home</h2>
              </div>
              <div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost">
                      <House />View Apartment
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apartment</DialogTitle>
                    </DialogHeader>

                    <ApartmentInfoForm userId={userId} />
                  </DialogContent>
                </Dialog>

                <a href="/properties">
                  <Button variant="ghost" className="mt-2">
                    <ScrollText />View Properties
                  </Button>
                </a>
              </div>
            </div>
          </aside>

          {/* center column - Feed (full width on small screens) */}
          <div className="col-span-3 flex flex-col">
            <div className="flex justify-end">
              <CreatePostDialog />
            </div>
            <Feed />
          </div>

          <div className="hidden md:block" />
        </div>
      </div>
    </main>
  )
}
