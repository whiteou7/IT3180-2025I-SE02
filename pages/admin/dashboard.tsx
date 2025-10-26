import { useState, useEffect } from "react"
import { useUserStore } from "@/store/userStore"
import { User, Users, Plus } from "lucide-react"
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
  SheetTrigger,
} from "@/components/ui/sheet"
import { UserInfoForm } from "@/components/UserInfoForm"
import { ApartmentInfoForm } from "@/components/ApartmentInfoForm"
import { AddUserForm } from "@/components/AddUserForm"
import { AddApartmentForm } from "@/components/AddApartmentForm"
import { User as UserType } from "@/types/users"
import { Apartment } from "@/types/apartments"
import { APIBody } from "@/types/api"
import { ofetch } from "ofetch"

type ViewType = "users" | "apartments" | null

export default function AdminDashboard() {
  const userRole = useUserStore((s) => s.role)
  const [view, setView] = useState<ViewType>(null)
  const [users, setUsers] = useState<UserType[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedApartmentId, setSelectedApartmentId] = useState<number>(0)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [apartmentDialogOpen, setApartmentDialogOpen] = useState(false)
  const [addUserSheetOpen, setAddUserSheetOpen] = useState(false)
  const [addApartmentSheetOpen, setAddApartmentSheetOpen] = useState(false)

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await ofetch<APIBody<UserType[]>>("/api/users", {
        ignoreResponseError: true,
      })

      if (res.success) {
        setUsers(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch apartments
  const fetchApartments = async () => {
    setLoading(true)
    try {
      const res = await ofetch<APIBody<Apartment[]>>("/api/apartments", {
        ignoreResponseError: true,
      })

      if (res.success) {
        setApartments(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when view changes
  useEffect(() => {
    if (view === "users") {
      fetchUsers()
    } else if (view === "apartments") {
      fetchApartments()
    }
  }, [view])

  const handleUserRowClick = (userId: string) => {
    setSelectedUserId(userId)
    setUserDialogOpen(true)
  }

  const handleApartmentRowClick = (apartmentId: number) => {
    setSelectedApartmentId(apartmentId)
    setApartmentDialogOpen(true)
  }

  if (userRole !== "admin") {
    return null
  }

  return (
    <main className="bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left Sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-20">
              <div className="px-2 py-3">
                <h2 className="text-sm font-semibold px-2">Admin</h2>
              </div>
              <div>
                <Button
                  variant={view === "users" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setView("users")}
                >
                  <Users /> Users
                </Button>
                <Button
                  variant={view === "apartments" ? "default" : "ghost"}
                  className="mt-2 w-full justify-start"
                  onClick={() => setView("apartments")}
                >
                  <User /> Apartments
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="col-span-3 flex flex-col">
            {view && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold capitalize">{view}</h2>
                  {view === "users" ? (
                    <Sheet open={addUserSheetOpen} onOpenChange={setAddUserSheetOpen}>
                      <SheetTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add User
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Add New User</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4">
                          <AddUserForm
                            onSubmit={() => {
                              fetchUsers()
                              setAddUserSheetOpen(false)
                            }}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  ) : view === "apartments" ? (
                    <Sheet
                      open={addApartmentSheetOpen}
                      onOpenChange={setAddApartmentSheetOpen}
                    >
                      <SheetTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Apartment
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Add New Apartment</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4">
                          <AddApartmentForm
                            onSubmit={() => {
                              fetchApartments()
                              setAddApartmentSheetOpen(false)
                            }}
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  ) : null}
                </div>

                {loading ? (
                  <p>Loading...</p>
                ) : view === "users" ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Year of Birth</TableHead>
                        <TableHead>Gender</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow
                          key={user.userId}
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleUserRowClick(user.userId)}
                        >
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>{user.yearOfBirth}</TableCell>
                          <TableCell>{user.gender}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : view === "apartments" ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Building ID</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Apartment Number</TableHead>
                        <TableHead>Monthly Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apartments.map((apartment) => (
                        <TableRow
                          key={apartment.apartmentId}
                          className="cursor-pointer hover:bg-muted"
                          onClick={() =>
                            handleApartmentRowClick(apartment.apartmentId)
                          }
                        >
                          <TableCell>{apartment.buildingId}</TableCell>
                          <TableCell>{apartment.floor}</TableCell>
                          <TableCell>{apartment.apartmentNumber}</TableCell>
                          <TableCell>{apartment.monthlyFee}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}
              </div>
            )}

            {!view && (
              <div className="text-center text-muted-foreground py-8">
                Select an option from the sidebar to view data
              </div>
            )}
          </div>

          <div className="hidden md:block" />
        </div>
      </div>

      {/* User Edit Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUserId && (
            <UserInfoForm
              userId={selectedUserId}
              onSubmit={() => {
                fetchUsers()
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Apartment Edit Dialog */}
      <Dialog
        open={apartmentDialogOpen}
        onOpenChange={setApartmentDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Apartment</DialogTitle>
          </DialogHeader>
          {selectedApartmentId > 0 && (
            <ApartmentInfoForm
              apartmentId={selectedApartmentId}
              onSubmit={() => {
                fetchApartments()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
