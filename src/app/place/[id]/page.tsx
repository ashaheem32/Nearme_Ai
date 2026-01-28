"use client"

import { Navigation } from "@/components/Navigation"
import { BookingWidget, BookingData } from "@/components/BookingWidget"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Star, MapPin, Phone, Globe, Clock, Heart, Share2, ChevronLeft, ChevronRight, Activity } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { getPlaceById, Place } from "@/data/places"

const reviews = [
  {
    id: "1",
    author: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    date: "2 days ago",
    text: "Absolutely authentic South Indian food! The filter coffee is the best I've had in Mumbai. The dosas are crispy and the chutneys are so flavorful. Highly recommend!",
    helpful: 23
  },
  {
    id: "2",
    author: "Rahul Verma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 4,
    date: "5 days ago",
    text: "Great food and reasonable prices. The ambiance could be better but the taste makes up for it. Try their masala dosa!",
    helpful: 15
  },
  {
    id: "3",
    author: "Ananya Iyer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    date: "1 week ago",
    text: "Reminds me of home in Chennai! Everything from the filter coffee to the idli sambar is perfect. The staff is also very friendly and welcoming.",
    helpful: 31
  }
]

const ratingBreakdown = [
  { stars: 5, count: 856, percentage: 69 },
  { stars: 4, count: 246, percentage: 20 },
  { stars: 3, count: 98, percentage: 8 },
  { stars: 2, count: 25, percentage: 2 },
  { stars: 1, count: 9, percentage: 1 }
]

export default function PlaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [helpfulReviews, setHelpfulReviews] = useState<Record<string, boolean>>({})
  const [visibleReviewCount, setVisibleReviewCount] = useState(3)
  const [placeInfo, setPlaceInfo] = useState<Place | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const fetchPlace = async () => {
      if (!params?.id) return

      const id = Array.isArray(params.id) ? params.id[0] : params.id

      // First try static data
      const staticPlace = getPlaceById(id)
      if (staticPlace) {
        setPlaceInfo(staticPlace)
        return
      }

      // If not found, fetch from API
      try {
        const response = await fetch(`/api/place-details?placeId=${id}`)
        const data = await response.json()

        if (data.success && data.place) {
          setPlaceInfo(data.place)
        } else {
          toast.error("Place details not found")
          router.push("/")
        }
      } catch (error) {
        toast.error("Failed to load place details")
        router.push("/")
      }
    }

    fetchPlace()
  }, [params, router])

  // Real-time updates
  useEffect(() => {
    if (!placeInfo) return

    const interval = setInterval(() => {
      setPlaceInfo(prev => {
        if (!prev) return null
        if (Math.random() < 0.2) {
          const newRating = Math.min(5, Math.max(4.5, prev.rating + (Math.random() - 0.5) * 0.05))
          const newReviewCount = prev.reviewCount + Math.floor(Math.random() * 2)

          setLastUpdate(new Date())
          toast.info("New review received", { duration: 2000 })

          return {
            ...prev,
            rating: parseFloat(newRating.toFixed(1)),
            reviewCount: newReviewCount
          }
        }
        return prev
      })
    }, 25000) // Update every 25 seconds

    return () => clearInterval(interval)
  }, [placeInfo])

  if (!placeInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading place details...</p>
        </div>
      </div>
    )
  }

  const handleBooking = (bookingData: BookingData) => {
    toast.success(
      `Booking confirmed for ${bookingData.date?.toLocaleDateString('en-IN')} at ${bookingData.time} for ${bookingData.guests} guests`
    )
  }

  const nextImage = () => {
    if (!placeInfo?.images?.length) return
    setCurrentImageIndex((prev) => (prev + 1) % placeInfo.images!.length)
  }

  const prevImage = () => {
    if (!placeInfo?.images?.length) return
    setCurrentImageIndex((prev) => (prev - 1 + placeInfo.images!.length) % placeInfo.images!.length)
  }

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: placeInfo.name,
          text: `Check out ${placeInfo.name} on NearMe India!`,
          url: window.location.href,
        })
        toast.success("Shared successfully")
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopyLink()
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleHelpfulClick = (reviewId: string) => {
    setHelpfulReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
    toast.success(helpfulReviews[reviewId] ? "Removed helpful vote" : "Marked as helpful")
  }

  const handlePhoneClick = () => {
    window.location.href = `tel:${placeInfo.phone}`
  }

  const handleWebsiteClick = () => {
    window.open(`https://${placeInfo.website}`, '_blank', 'noopener,noreferrer')
  }

  const handleDirections = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeInfo.address || placeInfo.name)}`
    window.open(mapsUrl, '_blank', 'noopener,noreferrer')
    toast.info("Opening directions in Google Maps")
  }

  const handleLoadMoreReviews = () => {
    setVisibleReviewCount(prev => prev + 3)
    toast.success("Loaded more reviews")
  }

  const visibleReviews = reviews.slice(0, visibleReviewCount)
  const hasMoreReviews = visibleReviewCount < reviews.length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        {/* Image Gallery */}
        <div className="relative h-[400px] rounded-lg overflow-hidden mb-6">
          <Image
            src={placeInfo.images?.[currentImageIndex] || placeInfo.image}
            alt={placeInfo.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Gallery Navigation */}
          {placeInfo.images && placeInfo.images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full"
                onClick={prevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full"
                onClick={nextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Image Counter */}
          {placeInfo.images && placeInfo.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {placeInfo.images.length}
            </div>
          )}

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full"
              onClick={handleFavoriteToggle}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold">{placeInfo.name}</h1>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Activity className="h-3 w-3 animate-pulse" />
                      Live
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-lg">{placeInfo.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {lastUpdate.toLocaleTimeString('en-IN')}
                  </p>
                </div>
                <Badge variant={placeInfo.isOpen ? "default" : "secondary"} className="shrink-0">
                  {placeInfo.isOpen ? "Open Now" : "Closed"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">{placeInfo.rating}</span>
                  <span className="text-muted-foreground">({placeInfo.reviewCount} reviews)</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{placeInfo.price}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{placeInfo.distance} away</span>
              </div>
            </div>

            <Separator />

            {/* About */}
            <div>
              <h2 className="text-2xl font-bold mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed">{placeInfo.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {placeInfo.amenities?.map((amenity) => (
                  <Badge key={amenity} variant="outline" className="text-sm">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Location & Contact */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Location & Contact</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">{placeInfo.address}</p>
                    <Button
                      variant="link"
                      className="h-auto p-0 mt-1 text-primary"
                      onClick={handleDirections}
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <button
                      onClick={handlePhoneClick}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {placeInfo.phone}
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Website</p>
                    <button
                      onClick={handleWebsiteClick}
                      className="text-primary hover:underline"
                    >
                      {placeInfo.website}
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Hours</p>
                    <p className="text-muted-foreground">{placeInfo.hours}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Reviews */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Reviews</h2>

              {/* Rating Breakdown */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2">{placeInfo.rating}</div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${star <= Math.round(placeInfo.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground">{placeInfo.reviewCount} reviews</p>
                    </div>
                    <div className="space-y-2">
                      {ratingBreakdown.map((item) => (
                        <div key={item.stars} className="flex items-center gap-3">
                          <span className="text-sm w-6">{item.stars}★</span>
                          <Progress value={item.percentage} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {visibleReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.avatar} alt={review.author} />
                          <AvatarFallback>{review.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold">{review.author}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${star <= review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-3">{review.text}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHelpfulClick(review.id)}
                            className={helpfulReviews[review.id] ? "text-primary" : ""}
                          >
                            👍 Helpful ({review.helpful + (helpfulReviews[review.id] ? 1 : 0)})
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {hasMoreReviews && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleLoadMoreReviews}
                >
                  Load More Reviews
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Booking Widget */}
          <div className="lg:col-span-1">
            <BookingWidget
              placeName={placeInfo.name}
              pricePerPerson="₹500"
              onBook={handleBooking}
            />
          </div>
        </div>
      </div>
    </div>
  )
}