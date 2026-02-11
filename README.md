# NearMe AI

A smart, AI-powered local discovery and booking platform built for India. Find restaurants, cafes, spas, gyms, hotels, and more — powered by natural language search and real-time Google Places data.

**Live Demo:** [nearmeai.vercel.app](https://nearmeai.vercel.app)

---

## Features

- **AI-Powered Search** — Ask in plain English (e.g. "best coffee near me", "romantic dinner spots in Mumbai") and get relevant results powered by OpenAI
- **Vibe Filters** — Filter by mood: Romantic, Cozy, Vibrant, Peaceful, Luxury, Casual, Trendy, Traditional
- **Location-Aware Discovery** — Automatically detects your location or lets you search for a specific area
- **Live Place Data** — Real-time info from Google Places including photos, reviews, hours, ratings, and contact details
- **Smart Filters & Sorting** — Filter by category, distance, rating, and open-now status; sort by relevance, distance, rating, or review count
- **Place Details** — Rich detail pages with image galleries, descriptions, amenities, reviews, and a booking widget
- **Favorites** — Save places you love for quick access later
- **Booking Widget** — Select date, time, and guests to make reservations
- **Responsive Design** — Fully optimized for desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **UI** | React 19, [Tailwind CSS 4](https://tailwindcss.com/) |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Forms** | React Hook Form + Zod |
| **Database** | [Turso](https://turso.tech/) (LibSQL) |
| **Auth** | [Better Auth](https://www.better-auth.com/) |
| **Payments** | [Stripe](https://stripe.com/) |
| **AI** | [OpenAI](https://openai.com/) (GPT-4o-mini) |
| **Maps & Places** | [Google Maps Platform](https://developers.google.com/maps) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A [Google Cloud API key](https://console.cloud.google.com/) with these APIs enabled:
  - Places API
  - Geocoding API
  - Places Photos API

### Installation

```bash
# Clone the repository
git clone https://github.com/ashaheem32/Nearme_Ai.git
cd Nearme_Ai

# Install dependencies
npm install --legacy-peer-deps
```

### Environment Setup

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` and fill in your keys:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Powers AI-based search intent analysis |
| `GOOGLE_API_KEY` | Yes | Google Places, Geocoding, and Photos |
| `DATABASE_URL` | Optional | Turso/LibSQL database URL |
| `DATABASE_AUTH_TOKEN` | Optional | Turso auth token |
| `BETTER_AUTH_SECRET` | Optional | Auth session secret |
| `BETTER_AUTH_URL` | Optional | Auth callback URL |
| `STRIPE_SECRET_KEY` | Optional | Stripe payments |
| `STRIPE_PUBLISHABLE_KEY` | Optional | Stripe client key |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook verification |
| `NEXT_PUBLIC_APP_URL` | Optional | Your app URL (defaults to localhost) |

### Running Locally

```bash
# Development server (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home page
│   ├── layout.tsx                  # Root layout
│   ├── account/page.tsx            # User account
│   ├── favorites/page.tsx          # Saved places
│   ├── search/
│   │   ├── page.tsx                # Search results (server)
│   │   └── SearchPageClient.tsx    # Search results (client)
│   ├── place/[id]/page.tsx         # Place detail page
│   └── api/
│       ├── search-ai/route.ts      # AI search + Google Places
│       ├── places-autocomplete/    # Location autocomplete
│       ├── place-details/          # Place detail lookup
│       └── reverse-geocode/        # Coords → address
├── components/
│   ├── Navigation.tsx              # Top navigation bar
│   ├── PlaceCard.tsx               # Place listing card
│   ├── LocationPicker.tsx          # Location selector
│   ├── FilterPanel.tsx             # Search filters
│   ├── BookingWidget.tsx           # Reservation widget
│   ├── AuthModal.tsx               # Login/signup modal
│   └── ui/                         # shadcn/ui components
├── data/
│   └── places.ts                   # Featured places data
├── hooks/
│   ├── use-debounce.ts
│   └── use-mobile.ts
└── lib/
    └── utils.ts                    # Utility functions
```

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/search-ai` | POST | Analyzes search intent with AI, then queries Google Places |
| `/api/places-autocomplete` | GET | Location autocomplete suggestions |
| `/api/place-details` | GET | Detailed info for a specific place |
| `/api/reverse-geocode` | POST | Converts coordinates to a human-readable address |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com/). Simply connect your GitHub repository and add the required environment variables in the Vercel dashboard.

---

## License

This project is open source and available under the [MIT License](LICENSE).
