"use client"

import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { toast } from "sonner"

type ProfileState = {
  fullName: string
  email: string
  phone: string
}

const recommendationOptions = [
  "Cafe",
  "Restaurant",
  "Spa",
  "Gym",
  "Hotel",
  "Shopping",
]

export default function AccountPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)
  const [isSendingDeleteOtp, setIsSendingDeleteOtp] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteOtpSent, setDeleteOtpSent] = useState(false)
  const [deleteOtp, setDeleteOtp] = useState("")
  const [profile, setProfile] = useState<ProfileState>({
    fullName: "",
    email: "",
    phone: "",
  })
  const [recommendations, setRecommendations] = useState<string[]>([])

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const meResponse = await fetch("/api/auth/me")
        const meData = await meResponse.json()

        if (!meResponse.ok || !meData.user) {
          router.replace("/login")
          return
        }

        const [profileResponse, preferencesResponse] = await Promise.all([
          fetch("/api/account/profile"),
          fetch("/api/account/preferences"),
        ])

        const profileData = await profileResponse.json()
        const preferencesData = await preferencesResponse.json()

        if (profileResponse.ok && profileData.profile) {
          setProfile({
            fullName: String(profileData.profile.fullName ?? ""),
            email: String(profileData.profile.email ?? ""),
            phone: String(profileData.profile.phone ?? ""),
          })
        }

        if (preferencesResponse.ok && Array.isArray(preferencesData.recommendations)) {
          setRecommendations(preferencesData.recommendations.map((item: unknown) => String(item)))
        }
      } catch {
        router.replace("/login")
      } finally {
        setIsLoading(false)
      }
    }

    loadAccount()
  }, [router])

  const handleProfileSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.message ?? "Could not save personal details.")
        return
      }

      toast.success("Personal details saved.")
    } catch {
      toast.error("Could not save personal details.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleToggleRecommendation = (value: string, checked: boolean) => {
    setRecommendations((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value),
    )
  }

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true)
    try {
      const response = await fetch("/api/account/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendations }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.message ?? "Could not save preferences.")
        return
      }

      toast.success("Recommendation preferences saved.")
    } catch {
      toast.error("Could not save preferences.")
    } finally {
      setIsSavingPreferences(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      toast.success("Logged out.")
      router.push("/login")
      router.refresh()
    } catch {
      toast.error("Could not log out right now.")
    }
  }

  const handleSendDeleteOtp = async () => {
    setIsSendingDeleteOtp(true)
    try {
      const response = await fetch("/api/account/delete/request-otp", {
        method: "POST",
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.message ?? "Could not send OTP.")
        return
      }

      setDeleteOtpSent(true)
      toast.success(data.message ?? "OTP sent to your email.")
    } catch {
      toast.error("Could not send OTP.")
    } finally {
      setIsSendingDeleteOtp(false)
    }
  }

  const handleDeleteAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!deleteOtp.trim()) {
      toast.error("Please enter OTP.")
      return
    }

    setIsDeletingAccount(true)
    try {
      const response = await fetch("/api/account/delete/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: deleteOtp }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.message ?? "Could not delete account.")
        return
      }

      toast.success("Account deleted successfully.")
      router.push("/signup")
      router.refresh()
    } catch {
      toast.error("Could not delete account right now.")
    } finally {
      setIsDeletingAccount(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24">Loading account...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto max-w-3xl px-4 pt-24 pb-12 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Account</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Manage your basic account information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98xxxxxx10"
                />
              </div>
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Save Personal Details"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendation Preferences</CardTitle>
            <CardDescription>
              Select what you like. We will show matching suggestions at the bottom of the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {recommendationOptions.map((option) => {
                const checked = recommendations.includes(option)
                return (
                  <label
                    key={option}
                    className="flex items-center gap-2 rounded-md border border-border p-3 cursor-pointer"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        handleToggleRecommendation(option, value === true)
                      }
                    />
                    <span>{option}</span>
                  </label>
                )
              })}
            </div>
            <Button onClick={handleSavePreferences} disabled={isSavingPreferences}>
              {isSavingPreferences ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle>Delete Account</CardTitle>
            <CardDescription>
              This will permanently delete your account and all associated data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="destructive"
              onClick={handleSendDeleteOtp}
              disabled={isSendingDeleteOtp || isDeletingAccount}
            >
              {isSendingDeleteOtp ? "Sending OTP..." : "Send Delete OTP"}
            </Button>

            {deleteOtpSent && (
              <form onSubmit={handleDeleteAccount} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="deleteOtp">Enter OTP</Label>
                  <Input
                    id="deleteOtp"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    required
                  />
                </div>
                <Button type="submit" variant="destructive" disabled={isDeletingAccount}>
                  {isDeletingAccount ? "Deleting account..." : "Confirm Delete Account"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}