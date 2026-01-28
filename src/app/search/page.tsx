import SearchPageClient from "./SearchPageClient"

// Force dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type SearchPageProps = {
  searchParams: Promise<{
    lat?: string
    lng?: string
    q?: string
    vibe?: string
  }>
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  return <SearchPageClient searchParams={searchParams} />
}
