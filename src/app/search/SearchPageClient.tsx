"use client"

type SearchPageClientProps = {
  searchParams: {
    lat?: string
    lng?: string
    q?: string
    vibe?: string
  }
}

import { Navigation } from "@/components/Navigation"
import { PlaceCard } from "@/components/PlaceCard"
import { FilterPanel, FilterState } from "@/components/FilterPanel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SlidersHorizontal, Map, List, Activity, Search, MapPin, Loader2, Sparkles, AlertCircle, CreditCard } from "lucide-react"
import { useState, useMemo, useEffect, useRef } from "react"
import { toast } from "sonner"

// Vibe options for user selection
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

function SearchPageContent({ searchParams: urlParams }: SearchPageClientProps) {
  const previousUrlRef = useRef<string>("")
  const hasInitialized = useRef(false)
  
  const [view, setView] = useState<"list" | "map">("list")
  const [sortBy, setSortBy] = useState("relevance")
  const [favorites, setFavorites] = useState<string[]>([])
  const [displayCount, setDisplayCount] = useState(6)
  const [results, setResults] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVibe, setSelectedVibe] = useState<string>("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentLocation, setCurrentLocation] = useState({
    lat: 0,
    lng: 0,
    name: "Getting your location..."
  })
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 100],
    rating: 0,
    distance: 10,
    openNow: false
  })
  const [apiError, setApiError] = useState<{
    type?: string;
    message?: string;
  } | null>(null)

  // Initialize with current location on first mount
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const urlLat = urlParams.lat
    const urlLng = urlParams.lng

    // If URL has coordinates, use them
    if (urlLat && urlLng) {
      const lat = parseFloat(urlLat)
      const lng = parseFloat(urlLng)
      const urlQuery = urlParams.q || "restaurants cafes near me"
      const urlVibe = urlParams.vibe || ""

      setSearchQuery(urlQuery)
      setSelectedVibe(urlVibe)
      setCurrentLocation({
        lat,
        lng,
        name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
      })

      performAISearch(urlQuery, lat, lng, urlVibe)

      // Reverse geocode for readable name
      fetch("/api/reverse-geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.locationName) {
            setCurrentLocation(prev => ({
              ...prev,
              name: data.locationName
            }))
          }
        })
        .catch(err => console.error("Reverse geocode error:", err))
    } else {
      // No URL coordinates - get current location automatically
      if ("geolocation" in navigator) {
        setIsGettingLocation(true)
        toast.loading("Getting your current location...")

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude

            try {
              const response = await fetch("/api/reverse-geocode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lat, lng })
              })

              const data = await response.json()
              const locationName = data.success && data.locationName 
                ? data.locationName 
                : `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`

              setCurrentLocation({ lat, lng, name: locationName })
              toast.success("Location detected! Searching nearby places...")
              setIsGettingLocation(false)

              // Auto-search with current location
              const defaultQuery = "restaurants cafes near me"
              setSearchQuery(defaultQuery)
              await performAISearch(defaultQuery, lat, lng, "")
            } catch (error) {
              console.error("Reverse geocoding error:", error)
              setCurrentLocation({
                lat,
                lng,
                name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
              })
              toast.success("Location detected! Searching nearby places...")
              setIsGettingLocation(false)

              const defaultQuery = "restaurants cafes near me"
              setSearchQuery(defaultQuery)
              await performAISearch(defaultQuery, lat, lng, "")
            }
          },
          (error) => {
            toast.error("Unable to get location. Using default location.")
            setIsGettingLocation(false)
            // Don't set a default location - let user click to enable location
            setCurrentLocation({
              lat: 0,
              lng: 0,
              name: "Location not available"
            })
          }
        )
      } else {
        toast.error("Geolocation not supported by your browser")
        setCurrentLocation({
          lat: 0,
          lng: 0,
          name: "Location not available"
        })
      }
    }
  }, [])

  // Watch for URL parameter changes (for subsequent navigations)
  useEffect(() => {
    if (!hasInitialized.current) return

    const urlQuery = searchParams.get("q") || "restaurants cafes near me"
    const urlLat = searchParams.get("lat")
    const urlLng = searchParams.get("lng")
    const urlVibe = searchParams.get("vibe") || ""
    
    // Create current URL string
    const currentUrl = `${urlQuery}|${urlLat}|${urlLng}|${urlVibe}`
    
    // Only proceed if URL has changed
    if (previousUrlRef.current === currentUrl) {
      return
    }
    
    previousUrlRef.current = currentUrl
    
    if (!urlLat || !urlLng) return

    // Parse coordinates from URL
    const lat = parseFloat(urlLat)
    const lng = parseFloat(urlLng)
    
    // Update state with URL parameters
    setSearchQuery(urlQuery)
    setSelectedVibe(urlVibe)
    setCurrentLocation({
      lat,
      lng,
      name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
    })
    
    // Perform search with URL coordinates
    performAISearch(urlQuery, lat, lng, urlVibe)
    
    // Reverse geocode for readable location name
    fetch("/api/reverse-geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.locationName) {
          setCurrentLocation(prev => ({
            ...prev,
            name: data.locationName
          }))
        }
      })
      .catch(err => console.error("Reverse geocode error:", err))
  }, [searchParams])

  // Real-time updates - refresh data every 30 seconds
  useEffect(() => {
    if (results.length === 0) return
    
    const interval = setInterval(() => {
      // Silently refresh data in background
      performAISearch(
        searchQuery || "restaurants cafes near me", 
        currentLocation.lat, 
        currentLocation.lng, 
        selectedVibe,
        true // silent mode
      )
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [searchQuery, currentLocation, selectedVibe, results.length])

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsGettingLocation(true)
      toast.loading("Getting your current location...")
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          // Reverse geocode to get location name via API
          try {
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
            
            toast.success("Location updated! Refreshing places...")
            setIsGettingLocation(false)
            
            // Trigger search with current location
            await performAISearch(searchQuery || "restaurants cafes near me", lat, lng, selectedVibe)
          } catch (error) {
            console.error("Reverse geocoding error:", error)
            
            // Fallback to coordinates
            setCurrentLocation({
              lat,
              lng,
              name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
            })
            
            toast.success("Location updated! Refreshing places...")
            setIsGettingLocation(false)
            
            await performAISearch(searchQuery || "restaurants cafes near me", lat, lng, selectedVibe)
          }
        },
        (error) => {
          toast.error("Unable to get location. Using default.")
          setIsGettingLocation(false)
        }
      )
    } else {
      toast.error("Geolocation not supported")
    }
  }

  const performAISearch = async (query: string, lat: number, lng: number, vibe?: string, silent = false) => {
    if (!query.trim()) {
      toast.error("Please enter a search query")
      return
    }

    if (!silent) {
      setIsSearching(true)
      setApiError(null) // Clear previous errors
    }
    
    try {
      const response = await fetch("/api/search-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query,
          lat,
          lng,
          vibe,
          radius: filters.distance * 1000
        })
      })

      const data = await response.json()

      // Handle API quota errors
      if (!response.ok) {
        if (data.errorType === "QUOTA_EXCEEDED") {
          setApiError({
            type: "OPENAI_QUOTA",
            message: data.message
          })
          toast.error("OpenAI API credits exhausted", { duration: 5000 })
          return
        }
        
        if (data.errorType === "GOOGLE_QUOTA_EXCEEDED") {
          setApiError({
            type: "GOOGLE_QUOTA",
            message: data.message
          })
          toast.error("Google Places API limit reached", { duration: 5000 })
          return
        }
        
        if (!silent) {
          toast.error(data.error || "Search failed")
        }
        return
      }

      if (data.success && data.places) {
        setResults(data.places)
        setLastUpdate(new Date())
        setApiError(null) // Clear errors on success
        if (!silent) {
          toast.success(`Found ${data.places.length} live places${vibe ? ` with ${vibe} vibe` : ""}`)
        } else {
          toast.info("Live data updated", { duration: 2000 })
        }
      } else {
        if (!silent) {
          toast.error(data.error || "Search failed")
        }
      }
    } catch (error) {
      console.error("Search error:", error)
      if (!silent) {
        toast.error("Failed to search. Please try again.")
      }
    } finally {
      if (!silent) {
        setIsSearching(false)
      }
    }
  }

  const handleSearch = () => {
    performAISearch(searchQuery, currentLocation.lat, currentLocation.lng, selectedVibe)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    )
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    toast.success("Filters applied")
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    toast.info(`Sorted by ${value}`)
  }

  const sortedResults = useMemo(() => {
    let sorted = [...results]
    
    switch (sortBy) {
      case "distance":
        sorted.sort((a, b) => a.distanceValue - b.distanceValue)
        break
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case "reviews":
        sorted.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      case "relevance":
      default:
        break
    }
    
    return sorted
  }, [sortBy, results])

  const displayedResults = sortedResults.slice(0, displayCount)
  const hasMore = displayCount < sortedResults.length

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 6, sortedResults.length))
    toast.success("Loaded more results")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* API Error Alert */}
        {apiError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              {apiError.type === "OPENAI_QUOTA" && (
                <>
                  <CreditCard className="h-4 w-4" />
                  OpenAI API Credits Exhausted
                </>
              )}
              {apiError.type === "GOOGLE_QUOTA" && (
                <>
                  <CreditCard className="h-4 w-4" />
                  Google Places API Limit Reached
                </>
              )}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>{apiError.message}</p>
              {apiError.type === "OPENAI_QUOTA" && (
                <div className="flex flex-col gap-2 mt-3">
                  <p className="font-semibold">To continue using AI search:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Visit <a href="https://platform.openai.com/account/billing" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Billing Dashboard</a></li>
                    <li>Add a payment method to your account</li>
                    <li>Purchase additional credits or upgrade your plan</li>
                  </ul>
                </div>
              )}
              {apiError.type === "GOOGLE_QUOTA" && (
                <div className="flex flex-col gap-2 mt-3">
                  <p className="font-semibold">To continue using Places API:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Visit <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Billing</a></li>
                    <li>Enable billing on your project</li>
                    <li>Wait for daily quota to reset (usually at midnight Pacific Time)</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Search Bar with Vibe Selection */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search with AI: 'best coffee near me', 'romantic dinner spots'..."
                className="pl-10 pr-4 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            {/* Search Button */}
            <Button 
              size="lg" 
              className="h-12 px-8 gap-2" 
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI Search
                </>
              )}
            </Button>
          </div>

          {/* Vibe Selection & Location */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Vibe Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground font-medium">Vibe:</span>
              {vibeOptions.map((vibe) => (
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

            {/* Current Location Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 ml-auto"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">{currentLocation.name}</span>
                  <span className="sm:hidden">Current Location</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Live Search Results</h1>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Activity className="h-3 w-3 animate-pulse" />
                Live Data
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {results.length > 0 ? (
                <>Found {sortedResults.length} places near {currentLocation.name} • Last updated {lastUpdate.toLocaleTimeString('en-IN')}</>
              ) : (
                <>Searching for places near {currentLocation.name}...</>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="reviews">Most Reviewed</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center border rounded-lg">
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("map")}
                className="rounded-l-none"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
              <FilterPanel onFilterChange={handleFilterChange} />
            </div>
          </aside>

          {/* Mobile Filters */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <div className="mt-6">
                  <FilterPanel onFilterChange={handleFilterChange} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results */}
          <div className="flex-1">
            {view === "list" ? (
              <>
                {isSearching && results.length === 0 ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Fetching live data...</h3>
                    <p className="text-muted-foreground">Getting real places from Google Maps</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {displayedResults.map((place) => (
                        <PlaceCard
                          key={place.id}
                          {...place}
                          isFavorite={favorites.includes(place.id)}
                          onFavoriteToggle={handleFavoriteToggle}
                        />
                      ))}
                    </div>
                    
                    {displayedResults.length === 0 && !isSearching && (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No results found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                      </div>
                    )}
                    
                    {/* Load More */}
                    {hasMore && (
                      <div className="mt-8 text-center">
                        <Button variant="outline" size="lg" onClick={handleLoadMore}>
                          Load More Results
                        </Button>
                      </div>
                    )}
                    
                    {!hasMore && sortedResults.length > 6 && (
                      <div className="mt-8 text-center">
                        <p className="text-muted-foreground">
                          You've reached the end of results
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="rounded-lg border bg-muted/50 h-[800px] flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Map className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-xl font-semibold">Map View</h3>
                  <p className="text-muted-foreground max-w-md">
                    Interactive map of {currentLocation.name} with live markers for each location would be displayed here
                  </p>
                  <Button variant="outline" onClick={() => setView("list")}>
                    Switch to List View
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPageContent