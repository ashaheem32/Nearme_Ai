"use client"

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Heart, Calendar, Settings, MapPin, Mail, Phone, Camera } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useRef } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useRouter } from "next/navigation"

const favoritePlaces = [
  {
    id: "1",
    name: "The Artisan Cafe",
    category: "Cafe & Bakery",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
    rating: 4.8,
    distance: "0.5 km"
  },
  {
    id: "3",
    name: "Zen Spa & Wellness",
    category: "Spa & Beauty",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop",
    rating: 4.9,
    distance: "0.8 km"
  },
  {
    id: "6",
    name: "Sakura Sushi Bar",
    category: "Japanese Restaurant",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
    rating: 4.8,
    distance: "1.1 km"
  }
]

const bookings = [
  {
    id: "1",
    place: "The Artisan Cafe",
    date: "Dec 25, 2024",
    time: "10:00 AM",
    guests: 2,
    status: "confirmed",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=150&fit=crop"
  },
  {
    id: "2",
    place: "Bella Italia Restaurant",
    date: "Dec 28, 2024",
    time: "7:00 PM",
    guests: 4,
    status: "confirmed",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=150&fit=crop"
  },
  {
    id: "3",
    place: "Zen Spa & Wellness",
    date: "Dec 20, 2024",
    time: "2:00 PM",
    guests: 1,
    status: "completed",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200&h=150&fit=crop"
  }
]

export default function AccountPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop")
  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 (415) 555-0123",
    location: "San Francisco, CA",
    bio: "Food enthusiast and travel lover"
  })
  const [originalProfile, setOriginalProfile] = useState(profile)
  const [notifications, setNotifications] = useState({
    email: false,
    specialOffers: false
  })
  
  // Dialog states
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [showCancelBooking, setShowCancelBooking] = useState(false)
  const [showModifyBooking, setShowModifyBooking] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  })

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setOriginalProfile(profile)
    toast.success("Profile updated successfully!")
  }

  const handleCancel = () => {
    setProfile(originalProfile)
    toast.info("Changes discarded")
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string)
        toast.success("Profile picture updated!")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleToggleNotification = (type: "email" | "specialOffers") => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
    toast.success(`${type === "email" ? "Email notifications" : "Special offers"} ${!notifications[type] ? "enabled" : "disabled"}`)
  }

  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error("Please fill in all password fields")
      return
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords don't match")
      return
    }
    if (passwordData.new.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    
    toast.success("Password changed successfully!")
    setShowChangePassword(false)
    setPasswordData({ current: "", new: "", confirm: "" })
  }

  const handleEnable2FA = () => {
    toast.success("Two-factor authentication enabled!")
    setShow2FA(false)
  }

  const handleDeleteAccount = () => {
    toast.success("Account deletion request submitted. You'll receive a confirmation email.")
    setShowDeleteAccount(false)
  }

  const handleCancelBooking = () => {
    toast.success("Booking cancelled successfully")
    setShowCancelBooking(false)
    setSelectedBooking(null)
  }

  const handleModifyBooking = () => {
    toast.success("Booking modified successfully")
    setShowModifyBooking(false)
    setSelectedBooking(null)
  }

  const handleBookAgain = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      toast.success(`Redirecting to ${booking.place}...`)
      // In real app: router.push(`/place/${booking.placeId}`)
      setTimeout(() => {
        router.push(`/place/1`)
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="relative">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              className="absolute bottom-0 right-0 rounded-full h-8 w-8"
              onClick={handleAvatarClick}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
            <p className="text-muted-foreground mb-2">{profile.bio}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          className="pl-10"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          className="pl-10"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          className="pl-10"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit">Save Changes</Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Places</CardTitle>
                <CardDescription>
                  Places you've saved for later ({favoritePlaces.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoritePlaces.map((place) => (
                    <Link key={place.id} href={`/place/${place.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="relative h-40 w-full">
                          <Image
                            src={place.image}
                            alt={place.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1">{place.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{place.category}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              ⭐ {place.rating}
                            </span>
                            <span className="text-muted-foreground">{place.distance}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                {favoritePlaces.length === 0 && (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start exploring and save places you love
                    </p>
                    <Button asChild>
                      <Link href="/search">Explore Places</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>
                  View and manage your reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="relative h-24 w-24 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={booking.image}
                              alt={booking.place}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold">{booking.place}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {booking.date} at {booking.time}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                                </p>
                              </div>
                              <Badge
                                variant={booking.status === "confirmed" ? "default" : "secondary"}
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mt-3">
                              {booking.status === "confirmed" && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedBooking(booking.id)
                                      setShowModifyBooking(true)
                                    }}
                                  >
                                    Modify
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedBooking(booking.id)
                                      setShowCancelBooking(true)
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                              {booking.status === "completed" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleBookAgain(booking.id)}
                                >
                                  Book Again
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Manage your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive booking confirmations via email</p>
                    </div>
                    <Button 
                      variant={notifications.email ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleToggleNotification("email")}
                    >
                      {notifications.email ? "Enabled" : "Enable"}
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Special Offers</p>
                      <p className="text-sm text-muted-foreground">Get notified about deals and promotions</p>
                    </div>
                    <Button 
                      variant={notifications.specialOffers ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleToggleNotification("specialOffers")}
                    >
                      {notifications.specialOffers ? "Enabled" : "Enable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowChangePassword(true)}
                  >
                    Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShow2FA(true)}
                  >
                    Two-Factor Authentication
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible account actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive"
                    onClick={() => setShowDeleteAccount(true)}
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePassword(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Two-Factor Authentication Dialog */}
      <Dialog open={show2FA} onOpenChange={setShow2FA}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Add an extra layer of security to your account
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            <div className="bg-muted rounded-lg p-8 flex items-center justify-center">
              <div className="h-48 w-48 bg-background rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">QR Code</p>
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="2fa-code">Enter verification code</Label>
              <Input
                id="2fa-code"
                placeholder="000000"
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FA(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnable2FA}>Enable 2FA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers including bookings, reviews, and favorites.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Booking Confirmation */}
      <AlertDialog open={showCancelBooking} onOpenChange={setShowCancelBooking}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedBooking(null)}>
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCancelBooking}
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modify Booking Dialog */}
      <Dialog open={showModifyBooking} onOpenChange={setShowModifyBooking}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Booking</DialogTitle>
            <DialogDescription>
              Update your booking details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="modify-date">Date</Label>
              <Input
                id="modify-date"
                type="date"
                defaultValue="2024-12-25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modify-time">Time</Label>
              <Input
                id="modify-time"
                type="time"
                defaultValue="10:00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modify-guests">Number of Guests</Label>
              <Input
                id="modify-guests"
                type="number"
                min="1"
                defaultValue="2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowModifyBooking(false)
                setSelectedBooking(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleModifyBooking}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}