"use client"

import { Navigation } from "@/components/Navigation"
import { PlaceCard } from "@/components/PlaceCard"
import { LocationPicker } from "@/components/LocationPicker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowRight,
  ChevronRight,
  MapPin,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"

import { featuredPlaces } from "@/data/places"

// Categories with images for the visual cards
const categoryCards = [
  {
    name: "Cafes",
    subtitle: "Cozy coffee spots & bakeries",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
  },
  {
    name: "Restaurants",
    subtitle: "Fine dining & local cuisines",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
  },
]

// Category grid for the navigation table
const categoryGrid = [
  { left: "Street Food", right: "Bakeries" },
  { left: "Hotels", right: "Resorts" },
  { left: "Gyms", right: "Yoga Studios" },
  { left: "Boutiques", right: "Shopping Malls" },
  { left: "Spa & Wellness", right: "Salons" },
  { left: "Bars & Pubs", right: "Nightlife" },
]

export default function Home() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVibe, setSelectedVibe] = useState<string>("")
  const [places, setPlaces] = useState(featuredPlaces)
  const [recommendedPlaces, setRecommendedPlaces] = useState(featuredPlaces.slice(0, 3))
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentLocation, setCurrentLocation] = useState({
    lat: 0,
    lng: 0,
    name: "Current Location",
  })

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaces((prevPlaces) => {
        const updated = prevPlaces.map((place) => {
          if (Math.random() < 0.1) {
            const newRating = Math.min(
              5,
              Math.max(3.5, place.rating + (Math.random() - 0.5) * 0.1)
            )
            const newReviewCount =
              place.reviewCount + Math.floor(Math.random() * 5)
            return {
              ...place,
              rating: parseFloat(newRating.toFixed(1)),
              reviewCount: newReviewCount,
            }
          }
          return place
        })

        const hasChanges = updated.some(
          (place, idx) =>
            place.rating !== prevPlaces[idx].rating ||
            place.reviewCount !== prevPlaces[idx].reviewCount
        )

        if (hasChanges) {
          setLastUpdate(new Date())
          toast.info("Live updates: New reviews received", { duration: 2000 })
        }

        return updated
      })
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await fetch("/api/favorites")
        if (!response.ok) return
        const data = await response.json()
        if (Array.isArray(data?.favorites)) {
          setFavorites(data.favorites.map((item: { id: string }) => item.id))
        }
      } catch {
        // no-op
      }
    }

    loadFavorites()
  }, [])

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await fetch("/api/account/preferences")
        const data = await response.json()
        const selected: string[] = Array.isArray(data?.recommendations)
          ? data.recommendations.map((item: unknown) => String(item).toLowerCase())
          : []

        if (selected.length === 0) {
          setRecommendedPlaces(places.slice(0, 3))
          return
        }

        const matches = places.filter((place) => {
          const category = place.category.toLowerCase()
          return selected.some((preference) => {
            if (preference === "restaurant") return category.includes("restaurant") || category.includes("bistro")
            if (preference === "cafe") return category.includes("cafe")
            if (preference === "spa") return category.includes("spa")
            if (preference === "gym") return category.includes("gym") || category.includes("fitness")
            if (preference === "hotel") return category.includes("hotel")
            if (preference === "shopping") return category.includes("shopping") || category.includes("boutique")
            return category.includes(preference)
          })
        })

        setRecommendedPlaces(matches.length > 0 ? matches.slice(0, 3) : places.slice(0, 3))
      } catch {
        setRecommendedPlaces(places.slice(0, 3))
      }
    }

    loadRecommendations()
  }, [places])

  const handleFavoriteToggle = async (
    place: {
      id: string
      name: string
      category: string
      rating: number
      reviewCount: number
      distance: string
      image: string
      price?: string
      isOpen?: boolean
    },
    nextFavoriteState: boolean,
  ) => {
    try {
      const authResponse = await fetch("/api/auth/me")
      const authData = await authResponse.json()

      if (!authResponse.ok || !authData?.user) {
        localStorage.setItem("pendingFavorite", JSON.stringify(place))
        const nextPath = `${window.location.pathname}${window.location.search}`
        router.push(`/login?next=${encodeURIComponent(nextPath)}`)
        toast.info("Please login first to save favorites.")
        return false
      }

      if (nextFavoriteState) {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ place }),
        })
        if (!response.ok) return false
        setFavorites((prev) => Array.from(new Set([...prev, place.id])))
        toast.success("Added to favorites")
      } else {
        const response = await fetch(`/api/favorites/${encodeURIComponent(place.id)}`, {
          method: "DELETE",
        })
        if (!response.ok) return false
        setFavorites((prev) => prev.filter((fav) => fav !== place.id))
        toast.success("Removed from favorites")
      }

      return true
    } catch {
      toast.error("Could not update favorites right now.")
      return false
    }
  }

  const checkAuth = async (redirectPath: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/me")
      const data = await response.json()
      if (!response.ok || !data?.user) {
        router.push(`/login?next=${encodeURIComponent(redirectPath)}`)
        toast.info("Please login first to search.")
        return false
      }
      return true
    } catch {
      router.push(`/login?next=${encodeURIComponent(redirectPath)}`)
      toast.info("Please login first to search.")
      return false
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query")
      return
    }

    const params = new URLSearchParams({ q: searchQuery })

    if (currentLocation.lat !== 0 || currentLocation.lng !== 0) {
      params.set("lat", currentLocation.lat.toString())
      params.set("lng", currentLocation.lng.toString())
    }

    if (selectedVibe) {
      params.append("vibe", selectedVibe)
    }

    const searchPath = `/search?${params.toString()}`
    const isLoggedIn = await checkAuth(searchPath)
    if (!isLoggedIn) return

    router.push(searchPath)
  }

  const handleCategoryClick = (categoryName: string) => {
    const navigate = (lat: number, lng: number) => {
      const params = new URLSearchParams({
        category: categoryName,
        lat: lat.toString(),
        lng: lng.toString(),
      })
      router.push(`/search?${params.toString()}`)
    }

    if (currentLocation.lat !== 0 || currentLocation.lng !== 0) {
      navigate(currentLocation.lat, currentLocation.lng)
      return
    }

    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser")
      navigate(0, 0)
      return
    }

    const loadingToast = toast.loading("Getting your location...")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setCurrentLocation((prev) => ({ ...prev, lat, lng }))
        toast.success("Location detected", { id: loadingToast })
        navigate(lat, lng)
      },
      () => {
        toast.error("Unable to get your location", { id: loadingToast })
        navigate(0, 0)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const handleGetCurrentLocation = async () => {
    const isLoggedIn = await checkAuth("/")
    if (!isLoggedIn) return

    // Scroll to Recommended For You section
    const section = document.getElementById("recommended")
    section?.scrollIntoView({ behavior: "smooth" })

    if ("geolocation" in navigator) {
      setIsGettingLocation(true)
      const loadingToast = toast.loading("Getting your current location...")

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          try {
            const response = await fetch("/api/reverse-geocode", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lat, lng }),
            })

            const data = await response.json()

            const locationName =
              data.success && data.locationName
                ? data.locationName
                : `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`

            setCurrentLocation({ lat, lng, name: locationName })
            toast.success("Location updated!", { id: loadingToast })
            setIsGettingLocation(false)
          } catch {
            setCurrentLocation({
              lat,
              lng,
              name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
            })
            toast.success("Location updated!", { id: loadingToast })
            setIsGettingLocation(false)
          }
        },
        () => {
          toast.error("Unable to get your location.", { id: loadingToast })
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

      {/* Hero Section - Full width with background image */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop"
            alt="Discover places near you"
            fill
            className="object-cover"
            priority
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-24 pb-16">
          <div className="max-w-2xl space-y-6">
            {/* Live Badge */}
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-primary font-medium">
                Live • Updated {lastUpdate.toLocaleTimeString("en-IN")}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]">
              <span className="text-foreground">DISCOVER</span>
              <br />
              <span className="text-foreground">THE BEST</span>
              <br />
              <span className="text-primary">PLACES</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Find and explore the best restaurants, cafes, spas, gyms, and
              experiences across India with AI-powered search and real-time
              updates.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search: 'best coffee near me'..."
                  className="pl-12 h-13 text-base bg-card/80 border-border/60 backdrop-blur-sm rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button
                size="lg"
                className="h-13 px-8 gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSearch}
              >
                <Sparkles className="h-4 w-4" />
                AI Search
              </Button>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <Button
                size="lg"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                onClick={() => {
                  handleGetCurrentLocation()
                }}
              >
                Explore Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-border/60 text-foreground hover:bg-card/60 px-8 gap-2"
                onClick={() => {
                  const section = document.getElementById("categories")
                  section?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Browse Categories
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Location Picker */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Searching near:</span>
              <LocationPicker
                currentLocation={currentLocation}
                onLocationSelect={(loc) => {
                  setCurrentLocation(loc)
                  toast.success(`Location updated to ${loc.name}`)
                  const params = new URLSearchParams({
                    q: searchQuery || "restaurants cafes near me",
                    lat: loc.lat.toString(),
                    lng: loc.lng.toString(),
                  })
                  if (selectedVibe) params.append("vibe", selectedVibe)
                  router.push(`/search?${params.toString()}`)
                }}
                isGettingLocation={isGettingLocation}
                onGetCurrentLocation={handleGetCurrentLocation}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section id="categories" className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              View Best Categories
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left: Category Image Cards */}
            <div className="grid grid-cols-2 gap-4">
              {categoryCards.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                    <p className="text-sm text-white/70 mt-1">{cat.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Right: Category Navigation Grid */}
            <div className="bg-card rounded-2xl border border-border/60 p-6 lg:p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-primary font-medium mb-2">
                  NearMe AI
                </p>
                <h3 className="text-2xl font-bold">Browse by Category</h3>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  Quickly find what you&apos;re looking for. Click any category to discover
                  the best places near you, powered by AI recommendations and
                  real-time reviews.
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="border-t border-border/60">
                  {categoryGrid.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[1fr_1fr_auto] items-center border-b border-border/60 group"
                    >
                      <button
                        onClick={() => handleCategoryClick(row.left)}
                        className="py-4 px-2 text-left text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {row.left}
                      </button>
                      <button
                        onClick={() => handleCategoryClick(row.right)}
                        className="py-4 px-2 text-left text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {row.right}
                      </button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mr-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Places */}
      <section className="py-16 lg:py-24 border-t border-border/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-primary" />
                Popular Near You
              </h2>
              <p className="text-muted-foreground mt-2">
                {places.length} trending places • Live updates enabled
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-full border-border/60 hidden sm:flex gap-2"
              onClick={() => router.push("/search")}
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

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

          <div className="sm:hidden mt-6 text-center">
            <Button
              variant="outline"
              className="rounded-full border-border/60 gap-2"
              onClick={() => router.push("/search")}
            >
              View All Places
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA / Feature Section */}
      <section className="py-16 lg:py-24 border-t border-border/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                AI-Powered Discovery for{" "}
                <span className="text-primary">Every Moment</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg">
                Whether you&apos;re looking for a cozy cafe, a trendy restaurant, or
                a peaceful spa — our AI understands your mood and finds the
                perfect spot near you with real-time availability and reviews.
              </p>
              <Button
                size="lg"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                onClick={() => router.push("/account")}
              >
                Get Started Today
              </Button>
            </div>

            {/* Right: Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
                alt="AI-powered discovery"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section id="recommended" className="py-16 lg:py-24 border-t border-border/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Recommended For You
              </h2>
              <p className="text-muted-foreground mt-2">
                Based on preferences selected in your account.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/account")}>
              Update Preferences
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedPlaces.map((place) => (
              <PlaceCard
                key={`recommended-${place.id}`}
                {...place}
                isFavorite={favorites.includes(place.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight">NearMe</span>
            </div>

            <div className="flex items-center gap-6">
              {["Restaurants", "Cafes", "Hotels", "Gyms", "Boutiques"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} NearMe AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
