"use client"

import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nextPath, setNextPath] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setNextPath(params.get("next"))
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me")
        const data = await response.json()
        if (response.ok && data?.user) {
          router.replace(nextPath || "/account")
          return
        }
      } catch {
        // no-op
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [router, nextPath])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.message ?? "Login failed.")
        return
      }

      const pendingFavorite = localStorage.getItem("pendingFavorite")
      if (pendingFavorite) {
        try {
          const place = JSON.parse(pendingFavorite)
          await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ place }),
          })
        } catch {
          // no-op
        } finally {
          localStorage.removeItem("pendingFavorite")
        }
      }

      toast.success("Logged in successfully.")
      router.push(nextPath || "/account")
      router.refresh()
    } catch {
      toast.error("Something went wrong while signing in.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-28 pb-12">
        {isCheckingSession ? (
          <div className="mx-auto max-w-md text-center text-muted-foreground">Checking session...</div>
        ) : (
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Sign in to your NearMe account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <p className="mt-4 text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
        )}
      </main>
    </div>
  )
}
