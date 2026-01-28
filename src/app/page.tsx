"use client"

import { Navigation } from "@/components/Navigation"
import { PlaceCard } from "@/components/PlaceCard"
import { LocationPicker } from "@/components/LocationPicker"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, TrendingUp, Map, List, Activity, Loader2, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Vibe options
const vibeOptions = [
  { value: "romantic", label: "🌹 Romantic", emoji: "🌹" },
  { value: "cozy", label: "☕ Cozy", emoji: "☕" },
  { value: "vibrant", label: "✨ Vibrant", emoji: "✨" },
  { value: "peaceful", label: "🧘 Peaceful", emoji: "🧘" },
  { value: "luxury", label: "💎 Luxury", emoji: "💎" },
  { value: "casual", label: "👕 Casual", emoji: "👕" },
  { value: "trendy", label: "🔥 Trendy", emoji: "🔥" },
  { value: "traditional", label: "🏛️ Traditional", emoji: "🏛️" }
]

// Indian places with real-time status
import { featuredPlaces } from "@/data/places"

const categories = [
  { name: "Restaurants", icon: "🍽️", count: 2340 },
  { name: "Street Food", icon: "🌮", count: 1560 },
  { name: "Cafes", icon: "☕", count: 890 },
  { name: "Bars & Pubs", icon: "🍺", count: 450 },
  { name: "Hotels", icon: "🏨", count: 678 },
  { name: "Shopping", icon: "🛍️", count: 3450 },
  { name: "Spa & Wellness", icon: "💆", count: 567 },
  { name: "Gyms", icon: "💪", count: 892 }
]

export default function Home() {
  const router = useRouter()
  const [view, setView] = useState<"list" | "map">("list")
  const [favorites, setFavorites] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedVibe, setSelectedVibe] = useState<string>("")
  const [places, setPlaces] = useState(featuredPlaces)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentLocation, setCurrentLocation] = useState({
    lat: 0,
    lng: 0,
    name: "Current Location"
  })

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaces(prevPlaces => {
        const updated = prevPlaces.map(place => {
          // Randomly update some places (10% chance)
          if (Math.random() < 0.1) {
            const newRating = Math.min(5, Math.max(3.5, place.rating + (Math.random() - 0.5) * 0.1))
            const newReviewCount = place.reviewCount + Math.floor(Math.random() * 5)
            return {
              ...place,
              rating: parseFloat(newRating.toFixed(1)),
              reviewCount: newReviewCount
            }
          }
          return place
        })

        // Check if any changes occurred
        const hasChanges = updated.some((place, idx) =>
          place.rating !== prevPlaces[idx].rating ||
          place.reviewCount !== prevPlaces[idx].reviewCount
        )

        if (hasChanges) {
          setLastUpdate(new Date())
          toast.info("Live updates: New reviews received", { duration: 2000 })
        }

        return updated
      })
    }, 15000) // Update every 15 seconds

    return () => clearInterval(interval)
  }, [])

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    )
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query")
      return
    }

    const params = new URLSearchParams({
      q: searchQuery,
      lat: currentLocation.lat.toString(),
      lng: currentLocation.lng.toString()
    })

    if (selectedCategory) {
      params.append("category", selectedCategory)
    }

    if (selectedVibe) {
      params.append("vibe", selectedVibe)
    }

    router.push(`/search?${params.toString()}`)
  }

  const handleCategoryClick = (categoryName: string) => {
    const params = new URLSearchParams({
      category: categoryName,
      lat: currentLocation.lat.toString(),
      lng: currentLocation.lng.toString()
    })

    if (selectedVibe) {
      params.append("vibe", selectedVibe)
    }

    router.push(`/search?${params.toString()}`)
  }

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsGettingLocation(true)
      const loadingToast = toast.loading("Getting your current location...")

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

            setCurrentLocation({
              lat,
              lng,
              name: locationName
            })

            toast.success("Location updated! Places refreshed.", { id: loadingToast })
            setIsGettingLocation(false)
          } catch (error) {
            console.error("Reverse geocoding error:", error)

            setCurrentLocation({
              lat,
              lng,
              name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
            })

            toast.success("Location updated! Places refreshed.", { id: loadingToast })
            setIsGettingLocation(false)
          }
        },
        (error) => {
          toast.error("Unable to get your location. Please enable location services.", { id: loadingToast })
          setIsGettingLocation(false)
        }
      )
    } else {
      toast.error("Geolocation is not supported by your browser")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background border-b">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              <Badge variant="secondary" className="text-sm">
                Live • Updated {lastUpdate.toLocaleTimeString('en-IN')}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Discover Amazing Places
              <span className="text-primary block mt-2">Near You in India</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Find and book the best restaurants, cafes, spas, and experiences across India with real-time updates
            </p>

            {/* Search Bar with AI */}
            <div className="flex flex-col gap-3 max-w-2xl mx-auto mt-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search with AI: 'best coffee near me', 'romantic dinner'..."
                    className="pl-10 h-12 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <Button size="lg" className="h-12 px-8 gap-2" onClick={handleSearch}>
                  <Sparkles className="h-4 w-4" />
                  <span>AI Search</span>
                </Button>
              </div>

              {/* Vibe Selection */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-sm text-muted-foreground font-medium">Vibe:</span>
                {vibeOptions.slice(0, 6).map((vibe) => (
                  <Button
                    key={vibe.value}
                    variant={selectedVibe === vibe.value ? "default" : "outline"}
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => {
                      setSelectedVibe(selectedVibe === vibe.value ? "" : vibe.value)
                      toast.success(selectedVibe === vibe.value
                        ? "Vibe filter removed"
                        : `${vibe.label} vibe selected`)
                    }}
                  >
                    <span>{vibe.emoji}</span>
                    <span className="hidden sm:inline">{vibe.label.split(" ")[1]}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Location */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Searching near:</span>
              <LocationPicker
                currentLocation={currentLocation}
                onLocationSelect={(loc) => {
                  setCurrentLocation(loc)
                  toast.success(`Location updated to ${loc.name}`)

                  // Redirect to search with new location
                  const params = new URLSearchParams({
                    q: searchQuery || "restaurants cafes near me",
                    lat: loc.lat.toString(),
                    lng: loc.lng.toString()
                  })

                  if (selectedVibe) {
                    params.append("vibe", selectedVibe)
                  }

                  router.push(`/search?${params.toString()}`)
                }}
                isGettingLocation={isGettingLocation}
                onGetCurrentLocation={handleGetCurrentLocation}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                className="shrink-0 gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleCategoryClick(category.name)}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
                <Badge variant="secondary" className="ml-1">{category.count}</Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        {/* Header with View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Popular Near You
            </h2>
            <p className="text-muted-foreground mt-1">
              {places.length} places found • Live updates enabled
            </p>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")}>
            <TabsList>
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2">
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* List View */}
        {view === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                {...place}
                isFavorite={favorites.includes(place.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}

        {/* Map View Placeholder */}
        {view === "map" && (
          <div className="rounded-lg border bg-muted/50 h-[600px] flex items-center justify-center">
            <div className="text-center space-y-3">
              <Map className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">Map View</h3>
              <p className="text-muted-foreground max-w-md">
                Interactive map view of India with markers for each location would be displayed here
              </p>
              <Button variant="outline" onClick={() => setView("list")}>
                Switch to List View
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary/5 mt-12">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold">Ready to explore India?</h2>
            <p className="text-lg text-muted-foreground">
              Create an account to save your favorite places and make bookings with real-time availability
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button
                size="lg"
                className="min-w-[200px]"
                onClick={() => router.push("/account")}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="min-w-[200px]"
                onClick={() => {
                  toast.info("Learn more about NearMe India features")
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}