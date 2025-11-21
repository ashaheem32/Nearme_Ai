"use client"

import { Navigation } from "@/components/Navigation"
import { PlaceCard } from "@/components/PlaceCard"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const initialFavorites = [
  {
    id: "1",
    name: "The Artisan Cafe",
    category: "Cafe & Bakery",
    rating: 4.8,
    reviewCount: 234,
    distance: "0.5 km",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
    price: "$$",
    isOpen: true
  },
  {
    id: "3",
    name: "Zen Spa & Wellness",
    category: "Spa & Beauty",
    rating: 4.9,
    reviewCount: 189,
    distance: "0.8 km",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop",
    price: "$$$$",
    isOpen: true
  },
  {
    id: "6",
    name: "Sakura Sushi Bar",
    category: "Japanese Restaurant",
    rating: 4.8,
    reviewCount: 445,
    distance: "1.1 km",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
    price: "$$$",
    isOpen: true
  }
]

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(initialFavorites.map(p => p.id))
  const [places] = useState(initialFavorites)

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    )
  }

  const favoritePlaces = places.filter(place => favorites.includes(place.id))

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Favorites</h1>
          <p className="text-muted-foreground">
            {favoritePlaces.length} {favoritePlaces.length === 1 ? "place" : "places"} saved
          </p>
        </div>

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
      </div>
    </div>
  )
}
