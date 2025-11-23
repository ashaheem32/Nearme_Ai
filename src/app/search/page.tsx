import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import SearchPageClient from "./SearchPageClient"

// Force dynamic rendering to prevent static generation
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageClient />
    </Suspense>
  )
}
