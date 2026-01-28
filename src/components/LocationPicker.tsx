"use client"

import * as React from "react"
import { Check, MapPin, Search, Loader2, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"

// Inline useDebounce to avoid import issues
function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

        return () => {
            clearTimeout(timer)
        }
    }, [value, delay])

    return debouncedValue
}

interface LocationPickerProps {
    currentLocation: {
        lat: number
        lng: number
        name: string
    }
    onLocationSelect: (location: { lat: number; lng: number; name: string }) => void
    isGettingLocation: boolean
    onGetCurrentLocation: () => void
}

export function LocationPicker({
    currentLocation,
    onLocationSelect,
    isGettingLocation,
    onGetCurrentLocation
}: LocationPickerProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [predictions, setPredictions] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)

    // Debounce search query to avoid too many API calls
    const debouncedQuery = useDebounce(query, 300)

    React.useEffect(() => {
        const fetchPredictions = async () => {
            if (!debouncedQuery || debouncedQuery.length < 3) {
                setPredictions([])
                return
            }

            setLoading(true)
            try {
                const response = await fetch(`/api/places-autocomplete?input=${encodeURIComponent(debouncedQuery)}`)

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`)
                }

                const data = await response.json()

                if (data.success) {
                    setPredictions(data.predictions)
                } else {
                    console.error("API returned success: false", data)
                    setPredictions([])
                    toast.error("Failed to find locations")
                }
            } catch (error) {
                console.error("Error fetching predictions:", error)
                setPredictions([])
                toast.error("Location search failed. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchPredictions()
    }, [debouncedQuery])

    const handleSelect = async (placeId: string, description: string) => {
        setOpen(false)
        setQuery("")

        const loadingToast = toast.loading("Getting location details...")

        try {
            const response = await fetch(`/api/place-details?placeId=${placeId}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || data.details || "Failed to fetch details")
            }

            if (data.success && data.place) {
                if (data.place.location) {
                    onLocationSelect({
                        lat: data.place.location.lat,
                        lng: data.place.location.lng,
                        name: description
                    })
                    toast.success(`Location set to ${description}`, { id: loadingToast })
                } else {
                    toast.error("Location coordinates missing from API", { id: loadingToast })
                }
            } else {
                toast.error(data.error || "Failed to get location details", { id: loadingToast })
            }
        } catch (error: any) {
            console.error("Error selecting location:", error)
            toast.error(`Error: ${error.message || "Failed to set location"}`, { id: loadingToast })
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between min-w-[200px] max-w-[300px] truncate"
                >
                    <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-4 w-4 shrink-0 opacity-50" />
                        <span className="truncate">{currentLocation.name}</span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[300px]" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search location..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    setOpen(false)
                                    onGetCurrentLocation()
                                }}
                                className="cursor-pointer text-primary"
                            >
                                {isGettingLocation ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Navigation className="mr-2 h-4 w-4 fill-primary" />
                                )}
                                Use my current location
                            </CommandItem>
                        </CommandGroup>

                        {loading && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                Searching...
                            </div>
                        )}

                        {!loading && predictions.length === 0 && query.length >= 3 && (
                            <CommandEmpty>No locations found.</CommandEmpty>
                        )}

                        <CommandGroup heading="Suggestions">
                            {predictions.map((prediction) => (
                                <CommandItem
                                    key={prediction.place_id}
                                    value={prediction.description}
                                    onSelect={() => handleSelect(prediction.place_id, prediction.description)}
                                    className="cursor-pointer"
                                >
                                    <MapPin className="mr-2 h-4 w-4 opacity-50" />
                                    {prediction.description}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
