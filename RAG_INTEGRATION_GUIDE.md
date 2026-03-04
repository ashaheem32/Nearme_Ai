# RAG Integration Guide for NearMe AI

## What RAG Means for NearMe

RAG (Retrieval-Augmented Generation) means your AI does not answer only from the model's memory.  
Instead, it first retrieves relevant context from your own data (places, tags, reviews, city tips, user behavior), then generates a grounded response.

For NearMe, this means your `AI Search` becomes:

1. Understand user intent
2. Retrieve most relevant local context
3. Generate grounded search hints and ranking signals
4. Return better, more trustworthy place recommendations

---

## Why RAG Will Help This Project Overall

### 1) Better relevance for local queries
- Users ask vague intent queries like "quiet date place near me".
- RAG lets you pull context like vibe tags, known ambience, crowd patterns, top dishes, and time-based signals.
- Result: better matching than keyword-only Google Places calls.

### 2) More consistent AI behavior
- Today, the prompt in `src/app/api/search-ai/route.ts` relies mostly on user query + vibe.
- RAG anchors the model with deterministic retrieved evidence.
- Result: less hallucination and more stable outputs.

### 3) Better handling of India-specific language
- Users often mix English + local terms (for example "family veg thali", "late night chai").
- You can index synonym dictionaries and local taxonomies and retrieve them during generation.
- Result: stronger intent understanding for Indian discovery behavior.

### 4) Lower token waste and better cost control
- Instead of big generic prompts, you pass only top-k relevant chunks.
- Combine with caching (query hash + geo-cell) to reduce repeated model calls.
- Result: lower OpenAI cost per search at scale.

### 5) Personalization and future product moat
- You can retrieve user history, favorites, and prior clicks as ranking context.
- Result: NearMe feels uniquely personal and smarter over time.

### 6) Better fallback strategy during API limits
- If external AI or Places limits hit, your retrieval layer can still return useful local suggestions from indexed data.
- Result: graceful degradation instead of "empty search."

---

## Recommended RAG Scope for NearMe (Practical)

Do **not** start with "chatbot RAG". Start with **search ranking RAG**.

Use RAG to improve:
- query understanding
- place retrieval hints
- re-ranking and explanation

Keep final place fetching through Google Places API (as you currently do), then rerank with retrieved context + your business logic.

---

## Current Integration Point in Your Code

Main place to integrate:
- `src/app/api/search-ai/route.ts`

Current flow (simplified):
1. OpenAI extracts `placeType`, `keywords`, `category`
2. Google Places nearby search
3. Basic transform + response

Target RAG-enhanced flow:
1. Parse intent
2. Retrieve context from vector store (city + vibe + user profile + historical interactions)
3. Build grounded prompt with retrieved chunks
4. Generate `query expansion`, `must-have`, `avoid`, `weights`
5. Fetch candidates from Google Places
6. Rerank candidates with hybrid score
7. Return places + transparent "why this result"

---

## High-Level Architecture

1. **Data Sources**
   - Google Places response snapshots
   - Curated metadata (vibe labels, crowd level, best for, cuisine notes)
   - User data (favorites, clicks, dwell time)
   - Optional city guides/editorial content

2. **Ingestion Pipeline**
   - Normalize place data
   - Chunk text (small structured chunks)
   - Create embeddings
   - Upsert into vector DB

3. **Retrieval Layer**
   - Semantic search (top-k chunks)
   - Geo filter (within radius / city)
   - Optional metadata filter (`vibe`, `open_now`, `price_band`)

4. **Generation + Re-ranking**
   - Send retrieved context to LLM
   - Produce structured response (weights and constraints)
   - Re-rank places with hybrid scoring

5. **Serving**
   - Return place list + AI insight + confidence + debug metadata (in non-prod)

---

## Suggested Tech Choices

### Embeddings
- OpenAI `text-embedding-3-small` (fast, cheaper) for v1.

### Vector Database (choose one)
- **Pinecone**: easiest managed start.
- **Qdrant (cloud/self-hosted)**: strong filtering and cost-friendly.
- **Postgres + pgvector**: best if you already centralize relational data in Postgres.

If you stay on Turso/libsql now, use external vector DB first (simpler than forcing vectors into current stack).

### Cache
- Upstash Redis or Vercel KV for:
  - query+geo retrieval cache
  - AI intent parse cache
  - frequent results cache

---

## Data Model for Retrieval Documents

Each indexed document should be small, factual, and filterable.

Recommended schema per chunk:

- `id`
- `placeId`
- `title`
- `chunkText`
- `city`
- `lat`, `lng`
- `vibes[]`
- `categories[]`
- `priceBand`
- `rating`
- `reviewCount`
- `openHoursSummary`
- `source` (`google_places`, `editorial`, `user_behavior`)
- `updatedAt`
- `embedding` (vector)

---

## Implementation Plan (Step-by-Step)

## Phase 1: Foundation (v1)

### Step 1: Add env vars
Add to `.env`:

```env
# Embeddings + generation
OPENAI_API_KEY=...

# Vector DB example (choose one provider)
PINECONE_API_KEY=...
PINECONE_INDEX=nearme-places

# Optional caching
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### Step 2: Create RAG modules
Create:
- `src/lib/rag/embeddings.ts`
- `src/lib/rag/retriever.ts`
- `src/lib/rag/prompt.ts`
- `src/lib/rag/rerank.ts`
- `src/lib/rag/types.ts`

Responsibilities:
- `embeddings.ts`: embed query/doc text
- `retriever.ts`: vector query + metadata filters
- `prompt.ts`: compose grounded prompt
- `rerank.ts`: hybrid score calculator

### Step 3: Build ingestion script
Create:
- `scripts/rag-ingest.ts`

Responsibilities:
- fetch candidate places (seed cities and categories)
- normalize into chunks
- embed + upsert into vector DB

Run on schedule (daily or every 6 hours for active cities).

### Step 4: Add retrieval into `search-ai` route
In `src/app/api/search-ai/route.ts`, after query parse and before Google call:
- retrieve top-k relevant chunks by query + vibe + location
- inject context into generation prompt
- request structured ranking guidance

### Step 5: Add hybrid scoring
After Google Places returns:
- combine:
  - semantic relevance score
  - distance score
  - rating score
  - review confidence
  - vibe match score
- sort by weighted total

### Step 6: Return explainability hints
Add optional fields in API response:
- `whyMatched` (array)
- `matchSignals` (debug)

This improves trust and helps debugging.

---

## Hybrid Score Formula (Example)

```text
finalScore =
  0.35 * semanticRelevance +
  0.25 * distanceScore +
  0.20 * ratingScore +
  0.10 * reviewConfidence +
  0.10 * vibeMatch
```

Tune these weights from click-through and save rate.

---

## Prompt Design Pattern for RAG

Use strict JSON output to keep compatibility with your existing structured approach.

Prompt sections:
1. user intent
2. geo constraints
3. retrieved context chunks (top 5-8)
4. output schema

Expected model output:
- `expandedKeywords[]`
- `mustInclude[]`
- `mustAvoid[]`
- `preferredTypes[]`
- `rankingWeights`
- `reasoningSummary` (short)

Keep temperature low (`0.1` to `0.3`) for consistency.

---

## How to Integrate Without Breaking Existing Behavior

Use a feature flag:
- `RAG_ENABLED=true|false`

When disabled:
- keep current behavior exactly as-is.

When enabled:
- execute RAG retrieval and rerank.

This gives safe rollout and easy rollback.

---

## API Contract Enhancements (Optional)

Your current `/api/search-ai` response can add:

- `retrieval`: `{ used: boolean, chunks: number, latencyMs: number }`
- `rankingVersion`: `"v1-hybrid"`
- `explanations`: `{ [placeId]: string[] }`

Front-end (`src/app/search/SearchPageClient.tsx`) can optionally display:
- "Matched for cozy ambiance + short distance + strong rating"

---

## Metrics to Track (Must-Have)

Track before/after RAG launch:
- search-to-click rate
- search-to-favorite rate
- zero-result rate
- average session searches
- p95 API latency
- cost per 100 searches

Also track quality labels from sampled evaluations:
- relevance@5
- vibe match accuracy
- location appropriateness

---

## Performance and Cost Guardrails

- Cache retrieval results for repeated `(query + geoCell + vibe)` combinations
- Use small embeddings model for v1
- Limit retrieved chunks (`k=5` initially)
- Keep chunk text compact
- Use timeouts and fallback path

Fallback order:
1. RAG retrieval + rerank
2. non-RAG AI parse + Google Places
3. keyword-only Google Places

---

## Security and Privacy Considerations

- Do not store raw precise user location history without consent
- Round coordinates to geo-cells for analytics
- Avoid sending sensitive user profile fields into prompts
- Log only minimal debug data in production

---

## Rollout Strategy

1. **Week 1:** Ingestion + retrieval infra in staging
2. **Week 2:** Enable RAG for internal users only (`RAG_ENABLED`)
3. **Week 3:** 10% traffic A/B test
4. **Week 4:** Tune weights + prompts from metrics
5. **Week 5:** full rollout if metrics improve

Success criteria example:
- +15% search-to-click
- -20% zero-results
- latency increase under +250ms p95

---

## Concrete Next Steps for This Project

1. Add `RAG_ENABLED` flag and scaffolding modules in `src/lib/rag/`.
2. Implement `scripts/rag-ingest.ts` for top 5 Indian metros first.
3. Inject retrieval context into `src/app/api/search-ai/route.ts`.
4. Add hybrid rerank and explanation fields.
5. Add simple UI hint in search cards for "why matched."
6. Measure and tune for 2 weeks before full launch.

---

## Final Recommendation

For NearMe, RAG is not just a "nice-to-have AI upgrade."  
It directly improves **search quality, personalization, trust, and cost efficiency**.

Best path: start with a **small, production-safe RAG v1** focused on retrieval + reranking in your existing `search-ai` endpoint, then iterate with metrics.

