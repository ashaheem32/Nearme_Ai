import { Suspense } from "react"
import SearchPageClient from "./SearchPageClient"
import { Loader2 } from "lucide-react"

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

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
