"use client"

import { Navigation } from "@/components/Navigation"
import { PlaceCard } from "@/components/PlaceCard"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type FavoritePlace = {
  id: string
  name: string
  category: string
  rating: number
  reviewCount: number
  distance: string
  image: string
  price?: string
  isOpen?: boolean
}

export default function FavoritesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [favoritePlaces, setFavoritePlaces] = useState<FavoritePlace[]>([])

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const authResponse = await fetch("/api/auth/me")
        const authData = await authResponse.json()

        if (!authResponse.ok || !authData?.user) {
          router.replace("/login?next=%2Ffavorites")
          return
        }

        const response = await fetch("/api/favorites")
        const data = await response.json()
        if (!response.ok || !Array.isArray(data?.favorites)) {
          setFavoritePlaces([])
          return
        }
        setFavoritePlaces(data.favorites)
      } catch {
        setFavoritePlaces([])
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [router])

  const handleFavoriteToggle = async (place: FavoritePlace, nextFavoriteState: boolean) => {
    try {
      if (nextFavoriteState) {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ place }),
        })
        if (!response.ok) return false
        setFavoritePlaces((prev) => Array.from(new Map([...prev, place].map((p) => [p.id, p])).values()))
      } else {
        const response = await fetch(`/api/favorites/${encodeURIComponent(place.id)}`, {
          method: "DELETE",
        })
        if (!response.ok) return false
        setFavoritePlaces((prev) => prev.filter((item) => item.id !== place.id))
      }
      return true
    } catch {
      toast.error("Could not update favorites right now.")
      return false
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Favorites</h1>
          <p className="text-muted-foreground">
            {favoritePlaces.length} {favoritePlaces.length === 1 ? "place" : "places"} saved
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading favorites...</div>
        ) : (
        <>
        {favoritePlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritePlaces.map((place) => (
              <PlaceCard
                key={place.id}
                {...place}
                isFavorite={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start exploring and save places you love by clicking the heart icon
            </p>
            <Button size="lg" asChild>
              <Link href="/search">Explore Places</Link>
            </Button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}
