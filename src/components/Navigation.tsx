"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, User, Heart, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AuthModal } from "@/components/AuthModal"
import { toast } from "sonner"

export function Navigation() {
  const router = useRouter()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("Current Location")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authTab, setAuthTab] = useState<"login" | "signup">("login")

  const handleAuthClick = (tab: "login" | "signup") => {
    setAuthTab(tab)
    setShowAuthModal(true)
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query")
      return
    }
    
    const params = new URLSearchParams({
      q: searchQuery,
      lat: "19.0760",
      lng: "72.8777"
    })
    
    router.push(`/search?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleLocationClick = () => {
    if ("geolocation" in navigator) {
      const loadingToast = toast.loading("Getting your location...")
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          try {
            // Reverse geocode to get location name
            const response = await fetch("/api/reverse-geocode", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ lat, lng })
            })

            const data = await response.json()

            const locationName = data.success && data.locationName
              ? data.locationName
              : `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`

            setLocation(locationName)
            toast.success("Location updated! Redirecting to search...", { id: loadingToast })

            // Navigate to search page with current location
            const params = new URLSearchParams({
              q: searchQuery || "restaurants cafes near me",
              lat: lat.toString(),
              lng: lng.toString()
            })

            router.push(`/search?${params.toString()}`)
          } catch (error) {
            console.error("Reverse geocoding error:", error)

            // Fallback to coordinates
            const locationName = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
            setLocation(locationName)
            toast.success("Location updated! Redirecting to search...", { id: loadingToast })

            const params = new URLSearchParams({
              q: searchQuery || "restaurants cafes near me",
              lat: lat.toString(),
              lng: lng.toString()
            })

            router.push(`/search?${params.toString()}`)
          }
        },
        (error) => {
          toast.error("Unable to get your location. Please enable location services.", { id: loadingToast })
        }
      )
    } else {
      toast.error("Geolocation is not supported by your browser")
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl hidden sm:inline">NearMe</span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-2xl gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search places, restaurants, cafes in India..."
                  className="pl-10 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
              </div>
              <Button variant="outline" className="gap-2 shrink-0" onClick={handleLocationClick}>
                <MapPin className="h-4 w-4" />
                <span className="hidden lg:inline">{location}</span>
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/favorites">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorites
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/account">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Link>
              </Button>
              <Button size="sm" onClick={() => handleAuthClick("login")}>
                Sign In
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search places..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLocationClick}>
                      <MapPin className="h-4 w-4" />
                      {location}
                    </Button>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/favorites">
                        <Heart className="h-4 w-4 mr-2" />
                        Favorites
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/account">
                        <User className="h-4 w-4 mr-2" />
                        Account
                      </Link>
                    </Button>
                  </div>
                  
                  <Button className="w-full" onClick={() => handleAuthClick("login")}>
                    Sign In
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search in India..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button size="icon" variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        defaultTab={authTab}
      />
    </>
  )
}