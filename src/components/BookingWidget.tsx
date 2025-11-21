"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

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

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
]

const guestOptions = ["1", "2", "3", "4", "5", "6", "7", "8+"]

export function BookingWidget({ placeName, pricePerPerson, onBook }: BookingWidgetProps) {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>("")
  const [guests, setGuests] = useState<string>("")

  const handleBooking = () => {
    if (date && time && guests) {
      onBook?.({ date, time, guests })
    }
  }

  const isBookingComplete = date && time && guests

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
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time
          </Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Guests
          </Label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger>
              <SelectValue placeholder="Number of guests" />
            </SelectTrigger>
            <SelectContent>
              {guestOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option} {option === "1" ? "guest" : "guests"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full" 
          size="lg"
          disabled={!isBookingComplete}
          onClick={handleBooking}
        >
          Book Now
        </Button>

        {isBookingComplete && (
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <p className="text-sm font-medium">Booking Summary</p>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p>{placeName}</p>
              <p>{date && format(date, "PPP")} at {time}</p>
              <p>{guests} {guests === "1" ? "guest" : "guests"}</p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cancellation</span>
            <Badge variant="secondary">Free</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Free cancellation up to 24 hours before your booking
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
