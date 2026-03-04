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

export default function SignupPage() {
  const router = useRouter()
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpRequested, setOtpRequested] = useState(false)
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

  const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.message ?? "Signup failed.")
        return
      }

      setOtpRequested(true)
      toast.success(data.message ?? "OTP sent to your email.")
    } catch {
      toast.error("Something went wrong while sending OTP.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!otp.trim()) {
      toast.error("Please enter OTP.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.message ?? "OTP verification failed.")
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

      toast.success("Account created successfully.")
      router.push(nextPath || "/account")
      router.refresh()
    } catch {
      toast.error("Something went wrong while verifying OTP.")
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
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                {otpRequested
                  ? "Enter the OTP sent to your email to complete registration."
                  : "Sign up to save favorites and bookings."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!otpRequested ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
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
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
              ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Email OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">OTP sent to {email}</p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying OTP..." : "Verify OTP & Create Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setOtpRequested(false)}
                  disabled={isLoading}
                >
                  Change details
                </Button>
              </form>
              )}

              <p className="mt-4 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Login
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
