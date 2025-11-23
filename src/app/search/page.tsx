import SearchPageClient from "./SearchPageClient"

// Force dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type SearchPageProps = {
  searchParams: {
    lat?: string
    lng?: string
    q?: string
    vibe?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return <SearchPageClient searchParams={searchParams} />
}
