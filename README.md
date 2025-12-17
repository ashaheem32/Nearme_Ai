# 🗺️ NearMe - AI-Powered Location Discovery Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai)

**Discover amazing places near you in India with AI-powered search**

[Live Demo](#) • [Documentation](./PROJECT_DOCUMENTATION.md) • [Report Bug](../../issues) • [Request Feature](../../issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**NearMe** is a modern location-based discovery platform built for India that helps users find restaurants, cafes, gyms, spas, and more using natural language AI search. Instead of browsing through endless categories, users can simply ask for what they want: "romantic dinner spots near me" or "best coffee in the morning."

### Why NearMe?

- 🤖 **AI-Powered Search** - Natural language understanding using OpenAI GPT-4o-mini
- 🎨 **Vibe-Based Discovery** - Find places by mood: Romantic, Cozy, Vibrant, Peaceful, etc.
- 📍 **Real-time Location** - Automatic location detection with accurate geocoding
- 🔴 **Live Data** - Real-time place information from Google Places API
- ⚡ **Fast & Responsive** - Built with Next.js 15 and Turbopack
- 📱 **Mobile-First** - Optimized for mobile users across India

---

## ✨ Features

### Core Features

- **🔍 AI Search**
  - Natural language query understanding
  - Intelligent keyword extraction
  - Context-aware place recommendations

- **🎭 Vibe Filters**
  - 8 atmosphere options: Romantic, Cozy, Vibrant, Peaceful, Luxury, Casual, Trendy, Traditional
  - AI-enhanced vibe matching
  - Personalized discovery experience

- **📍 Smart Location**
  - Browser geolocation integration
  - Reverse geocoding for readable names
  - Distance calculation for all results
  - Automatic location updates

- **🏪 Place Information**
  - High-quality photos from Google Places
  - Live ratings and review counts
  - Real-time open/closed status
  - Address, phone, website links
  - Price level indicators (₹ to ₹₹₹₹)

- **🔧 Advanced Filtering**
  - Category filters (restaurants, cafes, gyms, etc.)
  - Price range slider
  - Minimum rating filter
  - Distance radius control (1-50km)
  - "Open Now" toggle

- **📊 Flexible Sorting**
  - Relevance (AI-powered)
  - Distance (nearest first)
  - Rating (highest first)
  - Most Reviewed (popularity)

- **❤️ Favorites**
  - Save favorite places
  - Quick access to saved spots
  - Local storage (cloud sync coming soon)

- **⚠️ Error Handling**
  - Graceful API failure recovery
  - Quota management for OpenAI & Google APIs
  - User-friendly error messages
  - Fallback to basic search

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.3.5** - React framework with App Router & Turbopack
- **React 19.0.0** - UI library with concurrent features
- **TypeScript 5.x** - Type-safe development
- **Tailwind CSS 4.x** - Utility-first CSS framework

### UI Components
- **Radix UI** - Headless accessible components
- **Framer Motion 12.x** - Animation library
- **Lucide React** - Modern icon library
- **Sonner** - Toast notifications

### APIs & Services
- **OpenAI GPT-4o-mini** - AI search intent analysis
- **Google Places API** - Real-time place data
- **Google Geocoding API** - Location services
- **Better Auth** - Authentication (ready for integration)
- **Drizzle ORM** - Database toolkit (ready for use)

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Turbopack** - Ultra-fast bundler

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Google Cloud API Key** with Places API enabled ([Setup guide](https://console.cloud.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashaheem32/nearme-app.git
   cd nearme-app
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   > Note: Use `--legacy-peer-deps` due to peer dependency conflicts

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your API keys:
   ```env
   OPENAI_API_KEY=sk-proj-your-openai-key-here
   GOOGLE_API_KEY=your-google-api-key-here
   ```

4. **Enable Google APIs**

   Go to [Google Cloud Console](https://console.cloud.google.com/) and enable:
   - Places API
   - Geocoding API
   - Places Photos API

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Quick Start

Once the app is running:

1. Click **"Current Location"** button and grant permission
2. Enter a search query like "best pizza near me"
3. Click **"AI Search"**
4. Browse results and click any place card for details
5. Click the heart icon to save favorites

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required

```env
# OpenAI API Key (Required for AI search)
OPENAI_API_KEY=sk-proj-your-key-here

# Google API Key (Required for place data)
GOOGLE_API_KEY=your-google-api-key-here
```

### Optional

```env
# Database (for authentication features)
DATABASE_URL=libsql://your-database-url.turso.io
DATABASE_AUTH_TOKEN=your-turso-auth-token

# Authentication
BETTER_AUTH_SECRET=your-random-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Payments (for booking features)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

> ⚠️ **Security Note:** Never commit `.env` to version control. Use `.env.example` as a template.

For detailed environment setup, see [Environment Variables Guide](./PROJECT_DOCUMENTATION.md#environment-variables).

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com/)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure environment variables
   - Click "Deploy"

3. **Add Environment Variables**

   In Vercel dashboard, go to:
   - Settings → Environment Variables
   - Add `OPENAI_API_KEY` and `GOOGLE_API_KEY`
   - Redeploy the project

4. **Your app is live! 🎉**

### Other Deployment Options

- **Netlify** - Similar to Vercel, good for Next.js
- **Railway** - Includes database, simple pricing
- **AWS Amplify** - AWS ecosystem integration
- **Self-Hosted** - VPS with Docker/PM2

See [Deployment Guide](./PROJECT_DOCUMENTATION.md#deployment) for detailed instructions.

---

## 📁 Project Structure

```
nearme-app/
├── public/                      # Static assets
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API routes
│   │   │   ├── search-ai/       # AI search endpoint
│   │   │   └── reverse-geocode/ # Geocoding endpoint
│   │   ├── page.tsx             # Homepage
│   │   ├── search/              # Search results page
│   │   ├── place/[id]/          # Place details page
│   │   ├── account/             # User account page
│   │   ├── favorites/           # Favorites page
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── Navigation.tsx       # Nav bar component
│   │   ├── PlaceCard.tsx        # Place card component
│   │   ├── FilterPanel.tsx      # Filter sidebar
│   │   ├── AuthModal.tsx        # Auth modal
│   │   └── BookingWidget.tsx    # Booking component
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility functions
│   └── visual-edits/            # CMS integration
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.js           # Tailwind config
├── next.config.ts               # Next.js config
├── PROJECT_DOCUMENTATION.md     # Full documentation
├── PROJECT_DOCUMENTATION.docx   # Word document
└── README.md                    # This file
```

### Key Directories

- **`/src/app/api/`** - Backend API routes (Next.js API handlers)
- **`/src/components/ui/`** - Reusable UI components (buttons, cards, dialogs)
- **`/src/app/`** - Pages and layouts (file-based routing)

---

## 📚 API Documentation

### Internal Endpoints

#### POST `/api/search-ai`

AI-powered place search with Google Places integration.

**Request:**
```json
{
  "query": "best coffee near me",
  "lat": 19.0760,
  "lng": 72.8777,
  "vibe": "cozy",
  "radius": 2000
}
```

**Response:**
```json
{
  "success": true,
  "places": [
    {
      "id": "ChIJ...",
      "name": "Blue Tokai Coffee",
      "rating": 4.6,
      "distance": "0.8 km",
      "isOpen": true,
      "price": "₹₹"
    }
  ],
  "count": 15
}
```

#### POST `/api/reverse-geocode`

Convert coordinates to readable location name.

**Request:**
```json
{
  "lat": 19.0760,
  "lng": 72.8777
}
```

**Response:**
```json
{
  "success": true,
  "locationName": "Bandra West, Mumbai, MH"
}
```

### External APIs

- **OpenAI API** - GPT-4o-mini for search intent analysis
- **Google Places API** - Real-time place data
- **Google Geocoding API** - Location services

See [Full API Documentation](./PROJECT_DOCUMENTATION.md#key-apis--endpoints) for details.

---

## 📊 Performance

- **Load Time:** ~1.2s (First Contentful Paint)
- **Search Time:** ~1.8s (including AI + Google APIs)
- **Lighthouse Score:** 85-90/100
- **API Cost:** ~$3.70 per 100 searches

### Optimization Opportunities

- [ ] Implement Redis caching (reduce costs by 40%)
- [ ] Add ISR for popular places
- [ ] Use CDN for images
- [ ] Add service worker for offline support

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs** - Open an issue with reproduction steps
- 💡 **Suggest Features** - Share your ideas for improvements
- 🔧 **Submit PRs** - Fix bugs or add new features
- 📝 **Improve Docs** - Help make our documentation better
- 🧪 **Test** - Report compatibility issues

### Development Guidelines

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow TypeScript best practices
   - Use existing UI components
   - Add comments for complex logic
4. **Test thoroughly**
   - Test on Chrome, Safari, Firefox
   - Test on mobile devices
   - Verify API calls work correctly
5. **Commit with meaningful messages**
   ```bash
   git commit -m "feat: add place comparison feature"
   ```
6. **Push and create a PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- Use TypeScript for type safety
- Follow Next.js best practices
- Use Tailwind CSS for styling
- Keep components modular and reusable
- Write meaningful commit messages (Conventional Commits)

---

## 🗺️ Roadmap

### Phase 1: Core Stability ✅
- [x] AI-powered search
- [x] Real-time location services
- [x] Place search and display
- [x] Responsive design
- [x] Error handling

### Phase 2: User Accounts 🚧
- [ ] Authentication integration
- [ ] User profiles
- [ ] Cloud-synced favorites
- [ ] Search history

### Phase 3: Enhanced Features 📅
- [ ] Interactive map view
- [ ] Place comparison
- [ ] Itinerary planner
- [ ] User reviews

### Phase 4: Booking & Payments 📅
- [ ] Restaurant booking integration
- [ ] Payment processing
- [ ] Commission tracking
- [ ] Business accounts

### Phase 5: Mobile Apps 📅
- [ ] React Native iOS app
- [ ] React Native Android app
- [ ] Push notifications
- [ ] Offline support

---

## 📄 License

This project is proprietary. All rights reserved.

For licensing inquiries, please contact: [ashaheem32@gmail.com]

---

## 📞 Support

- **Documentation:** [Full Documentation](./PROJECT_DOCUMENTATION.md)
- **Issues:** [GitHub Issues](../../issues)
- **Email:** [ashaheem32@gmail.com]

---

## 🙏 Acknowledgments

Special thanks to:

- [Vercel](https://vercel.com/) for Next.js
- [OpenAI](https://openai.com/) for GPT API
- [Google](https://developers.google.com/maps) for Places API
- [Shadcn](https://ui.shadcn.com/) for UI inspiration
- [Tailwind CSS](https://tailwindcss.com/) team
- All open-source contributors

---

<div align="center">

**Made with ❤️ for India**

[⬆ Back to Top](#-nearme---ai-powered-location-discovery-platform)

</div>
