"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Heart, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface PlaceCardProps {
  id: string
  name: string
  category: string
  rating: number
  reviewCount: number
  distance: string
  image: string
  price?: string
  isOpen?: boolean
  isFavorite?: boolean
  onFavoriteToggle?: (id: string) => void
}

export function PlaceCard({
  id,
  name,
  category,
  rating,
  reviewCount,
  distance,
  image,
  price,
  isOpen = true,
  isFavorite = false,
  onFavoriteToggle
}: PlaceCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorite(!favorite)
    onFavoriteToggle?.(id)
  }

  return (
    <Link href={`/place/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md"
            onClick={handleFavoriteClick}
          >
            <Heart className={`h-4 w-4 ${favorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          {price && (
            <Badge className="absolute bottom-2 left-2 bg-background/90 text-foreground">
              {price}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{name}</h3>
              <p className="text-sm text-muted-foreground">{category}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-sm">{rating}</span>
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{distance}</span>
            </div>
            {isOpen !== undefined && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className={isOpen ? "text-green-600" : "text-red-600"}>
                  {isOpen ? "Open" : "Closed"}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
