"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"
import { useState } from "react"

interface FilterPanelProps {
  onFilterChange?: (filters: FilterState) => void
}

export interface FilterState {
  categories: string[]
  priceRange: number[]
  rating: number
  distance: number
  openNow: boolean
}

const categories = [
  "Restaurants",
  "Street Food",
  "Cafes",
  "Bars & Pubs",
  "Hotels",
  "Shopping",
  "Spa & Wellness",
  "Gyms"
]

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 100],
    rating: 0,
    distance: 10,
    openNow: false
  })

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange?.(updated)
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    updateFilters({ categories: newCategories })
  }

  const clearFilters = () => {
    const cleared: FilterState = {
      categories: [],
      priceRange: [0, 100],
      rating: 0,
      distance: 10,
      openNow: false
    }
    setFilters(cleared)
    onFilterChange?.(cleared)
  }

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.rating > 0 ||
    filters.openNow ||
    filters.distance < 10

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-3 block">Categories</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={filters.categories.includes(category) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-3 block">
            Distance: {filters.distance}km
          </Label>
          <Slider
            value={[filters.distance]}
            onValueChange={(value) => updateFilters({ distance: value[0] })}
            max={50}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium mb-3 block">
            Minimum Rating
          </Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={filters.rating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilters({ rating })}
              >
                {rating}+
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="openNow"
            checked={filters.openNow}
            onCheckedChange={(checked) => 
              updateFilters({ openNow: checked as boolean })
            }
          />
          <Label
            htmlFor="openNow"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Open now
          </Label>
        </div>
      </div>
    </div>
  )
}