"use client"

import { Button } from "@/components/ui/button"
import { MapPin, User, Heart, Menu } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navCategories = [
  { name: "Restaurants", href: "/search?category=Restaurants" },
  { name: "Cafes", href: "/search?category=Cafes" },
  { name: "Hotels", href: "/search?category=Hotels" },
  { name: "Shopping", href: "/search?category=Shopping" },
  { name: "Gyms", href: "/search?category=Gyms" },
  { name: "Boutiques", href: "/search?category=Boutiques" },
]

export function Navigation() {
  const router = useRouter()
  const [accountHref, setAccountHref] = useState("/login")

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me")
        const data = await response.json()
        if (response.ok && data?.user) {
          setAccountHref("/account")
        } else {
          setAccountHref("/login")
        }
      } catch {
        setAccountHref("/login")
      }
    }

    checkSession()
  }, [])

  const navigateToCategory = (categoryName: string) => {
    const pushWithLocation = (lat: number, lng: number) => {
      const params = new URLSearchParams({
        category: categoryName,
        lat: String(lat),
        lng: String(lng),
      })
      router.push(`/search?${params.toString()}`)
    }

    if (!("geolocation" in navigator)) {
      pushWithLocation(0, 0)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        pushWithLocation(position.coords.latitude, position.coords.longitude)
      },
      () => {
        pushWithLocation(0, 0)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <nav className="fixed top-0 z-50 w-full bg-background/60 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">NearMe</span>
            </Link>

            {/* Desktop Category Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={(e) => {
                    e.preventDefault()
                    navigateToCategory(cat.name)
                  }}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/favorites">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorites
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href={accountHref}>
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card border-border">
                <div className="flex flex-col gap-6 mt-6">
                  {/* Mobile Category Links */}
                  <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-3">Categories</p>
                    {navCategories.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={(e) => {
                          e.preventDefault()
                          navigateToCategory(cat.name)
                        }}
                        className="px-3 py-2.5 text-sm text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" className="justify-start text-foreground" asChild>
                      <Link href="/favorites">
                        <Heart className="h-4 w-4 mr-2" />
                        Favorites
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-foreground" asChild>
                      <Link href={accountHref}>
                        <User className="h-4 w-4 mr-2" />
                        Account
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
  )
}
