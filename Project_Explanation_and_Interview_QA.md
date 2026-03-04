# NearMe AI - Comprehensive Project Overview & Interview Guide

This document provides an in-depth explanation of the **NearMe AI** project, its architecture, workflows, and a curated list of technical interview questions and answers designed to help you explain the project in an interview setting.

---

## Part 1: Detailed Project Explanation

### 1. Project Introduction
**NearMe AI** is an intelligent, location-based discovery and booking platform tailored specifically for the Indian market. It bridges the gap between natural human language and structured data querying. 

Instead of traditional keyword searching, users can ask complex, mood-based questions in plain English (e.g., *"Find me a cozy cafe with fast wifi for working"* or *"Romantic dinner spots in Mumbai under ₹2000"*). The application intelligently interprets these queries, fetches real-time data from Google Places, and presents the user with curated, highly relevant results.

### 2. Core Features
- **AI-Powered Natural Language Search:** Utilizes OpenAI's GPT-4o-mini to extract intent, location, mood, and categories from user queries.
- **Vibe & Mood Filters:** Pre-defined filters (Romantic, Cozy, Vibrant, Peaceful, Luxury, etc.) to instantly narrow down places based on the desired atmosphere.
- **Location Awareness:** Uses browser geolocation or manual entry, backed by Google's Geocoding API (`/api/reverse-geocode`).
- **Real-Time Data Integration:** Connects directly to Google Places API to retrieve live photos, operating hours, reviews, ratings, and contact information.
- **Advanced Filtering & Sorting:** Client-side and server-side filtering (open now, distance, rating) and sorting algorithms.
- **Seamless Booking System:** An integrated reservation widget allowing users to select dates, times, and party sizes.
- **Favorites & Account Management:** Users can bookmark favorite places for quick access later.

### 3. Architecture & Tech Stack Breakdown
The platform is built using a modern, edge-ready, and highly scalable JavaScript/TypeScript stack.

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Core Framework** | **Next.js 15 (App Router)** | Provides Server-Side Rendering (SSR) for blazing fast initial loads and SEO optimization. Unifies backend (`/api`) and frontend logic. |
| **Language** | **TypeScript** | Ensures type safety from end to end (database to frontend components), preventing runtime errors. |
| **UI & Styling** | **React 19, Tailwind CSS 4, shadcn/ui** | Tailwind enables rapid, responsive styling. `shadcn/ui` (built on Radix primitives) guarantees accessible, unstyled interactive components like dialogs and popovers. |
| **Animations** | **Framer Motion** | Used for fluid layouts, page transitions, and micro-interactions that elevate the UX. |
| **State & Forms** | **React Hook Form + Zod** | Handles complex booking and search forms with strictly typed, client-side validation. |
| **Database** | **Turso (LibSQL)** | An edge-optimized fork of SQLite. It offers near-zero latency for read-heavy operations by replicating the database to edge nodes (close to the Vercel edge functions). |
| **Authentication** | **Better Auth** | A modern, strictly typed, and lightweight authentication library that connects natively with Turso. |
| **Payments** | **Stripe** | Handles potential reservation fees and premium booking models securely. |
| **External APIs** | **OpenAI, Google Maps Platform** | The brains behind the operation. OpenAI handles NLP intent extraction, while Google Places provides the business data directory. |

### 4. Key Workflows

#### A. AI Search Flow
1. User types *"best pizza places for a late-night date"*.
2. The frontend sends a `POST` request to `/api/search-ai`.
3. The server securely communicates with **OpenAI API**, prompting it to return a rigid JSON object: `{ "category": "pizza", "vibe": "romantic", "open_now": true }`.
4. The server converts this JSON into an optimized request to the **Google Places API**, fetching localized data.
5. Data is structured, sanitized, and returned to the React client for rendering.

#### B. Booking & Lead Workflow
1. User interacts with the `<BookingWidget />` on a Place detail page.
2. Selects Date, Time, and Guests. `Zod` validates the input payload.
3. Upon submission, the payload is sent to an API endpoint.
4. If a fee is required, a **Stripe Checkout Session** is created, returning a session ID.
5. The user completes payment; a Stripe Webhook updates the booking status in the **Turso** database, confirming the reservation.

---

## Part 2: Interview Questions & Answers

If you are showcasing this project in a software engineering interview, here are the most likely questions you will be asked, along with comprehensive answers.

### Q1: Why did you choose Next.js 15 App Router instead of a traditional React SPA (Single Page Application)?
**Answer:** "For a discovery platform like NearMe AI, SEO and initial page load speed are critical. A traditional Create-React-App SPA ships a blank HTML file and forces the browser to download a huge JS bundle before rendering anything, hurting SEO and Core Web Vitals. Next.js App Router allows me to use React Server Components (RSCs). This means I fetch data (like place details and reviews) directly on the server, returning fully populated HTML to the client. This drastically reduces the client-side JavaScript burden, makes the pages instantly indexable by search engine bots, and improves the overall user experience."

### Q2: How did you implement the AI Search, and how do you prevent the OpenAI API call from slowing down the user experience?
**Answer:** "The AI search resides in the `/api/search-ai` route. When a user submits a query, I send it to `GPT-4o-mini` with a strict `system` prompt that forces the model to output a specific JSON structure (parsing intent, vibe, category, and location). 
To address latency:
1. I used `GPT-4o-mini`, which is significantly faster and cheaper than GPT-4 while being perfectly capable of intent extraction.
2. I implemented asynchronous data fetching where the UI shows skeleton loaders specifically indicating that AI is analyzing the query, keeping the user engaged.
3. Ideally, I also implement a caching layer (like Redis or in-memory LRU) so repeated queries (e.g., 'cafes near me') bypass the OpenAI step entirely and fetch cached Google Places data instantly."

### Q3: Why did you use Turso (LibSQL) over traditional PostgreSQL or MongoDB?
**Answer:** "NearMe AI is fundamentally a read-heavy application. Users spend 90% of their time reading lists, viewing places, and checking out details. Turso is built on LibSQL, an open-source, edge-ready fork of SQLite. It allows you to replicate the database to edge nodes globally. Since I deploy on Vercel (which utilizes Edge Functions), having my database sitting right next to my serverless functions practically eliminates network latency for database queries. It's much faster, cheaper, and easier to scale for this specific use case than managing a heavy PostgreSQL connection pool."

### Q4: How is state managed across the application, especially for complex forms like the Booking Widget?
**Answer:** "For global server state (like data fetched from APIs), I rely heavily on Next.js's native caching and fetching capabilities within server components. For complex client-side interactions, especially the `BookingWidget`, I use **React Hook Form** paired with **Zod**. Zod provides strict schema validation (ensuring valid dates, times, and guest counts) before the form is ever submitted. React Hook Form manages the form's internal state efficiently without causing unnecessary re-renders across the entire component tree, which is crucial for maintaining a smooth, stutter-free UI."

### Q5: Can you explain your approach to UI/UX and styling?
**Answer:** "I adopted a mobile-first, utility-based approach using **Tailwind CSS 4**. This allowed me to iterate on the design rapidly without context-switching between CSS files. To ensure accessibility and save development time, I integrated **shadcn/ui**. Since shadcn provides copy-pasteable components built on top of Radix UI, I guaranteed that complex elements like Modals (`AuthModal.tsx`), Dropdowns, and Selects came fully equipped with keyboard navigation and ARIA attributes out-of-the-box. Finally, to give the app a premium, native-app 'feel', I sprinkled in micro-animations and smooth page transitions using **Framer Motion**."

### Q6: How are you handling Authentication and why did you pick 'Better Auth'?
**Answer:** "I implemented authentication using **Better Auth**. In the Next.js ecosystem, tools like NextAuth (Auth.js) are popular, but Better Auth provides a much more flexible, lightweight, and end-to-end type-safe experience. It integrates deeply into the database, allowing me to fully extend the User and Session models in Turso. It securely handles session cookies and OAuth flows while keeping the setup lean and perfectly aligned with my TypeScript definitions."

### Q7: If you were to scale this app to 100,000 active users, what bottlenecks would you anticipate, and how would you solve them?
**Answer:** "The primary bottlenecks would be third-party API rate limits and costs (OpenAI and Google Places). 
1. **Caching Strategy:** I would implement a robust Redis caching layer (e.g., Upstash) to cache AI intents and Google Places results. Most searches fall into common categories, so serving them from cache would cut costs drastically.
2. **Debouncing:** Ensure aggressive debouncing (via `hooks/use-debounce.ts`) on the autocomplete inputs to prevent spamming the Google Places API.
3. **Database:** Turso handles read scaling automatically via edge replication, but for write-heavy scaling (if bookings spike), I would implement a queueing system (like SQS or upstash-qstash) to handle webhooks and bookings asynchronously, ensuring the main application thread never blocks."
