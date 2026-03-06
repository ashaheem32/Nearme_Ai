import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react"

interface BookingWidgetProps {
  placeName: string
  pricePerPerson?: string
  onBook?: (booking: BookingData) => void
}

export interface BookingData {
  date: Date | undefined
  time: string
  guests: string
}

export function BookingWidget({ placeName, pricePerPerson }: BookingWidgetProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-xl">Book a Table</CardTitle>
        {pricePerPerson && (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary">{pricePerPerson}</span>
            <span className="text-sm text-muted-foreground">per person</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-b-lg">
          <span className="px-4 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground bg-primary rounded-full shadow-lg">
            Coming Soon
          </span>
        </div>
        <div className="space-y-2 pointer-events-none select-none opacity-50">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Date
          </Label>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            Select date
          </Button>
        </div>

        <div className="space-y-2 pointer-events-none select-none opacity-50">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time
          </Label>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            Select time
          </Button>
        </div>

        <div className="space-y-2 pointer-events-none select-none opacity-50">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Guests
          </Label>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            Number of guests
          </Button>
        </div>

        <Button
          className="w-full pointer-events-none opacity-50"
          size="lg"
          disabled
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  )
}
