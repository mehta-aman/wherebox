# WhereBox — Universal Package Tracker

> **Every package. One place.**  
> *Your packages. Our priority.*

WhereBox is a premium, privacy-first universal package tracking web application and Progressive Web App (PWA). It consolidates shipments from online shopping platforms (**Amazon, Flipkart, Myntra, Meesho, Ajio, Shopify**) and major Indian and global delivery networks (**Delhivery, Blue Dart, DTDC, India Post, Ekart, Xpressbees, UPS, DHL, FedEx**) into one private dashboard.

---

## Features

- **Apple-Polished Glassmorphism UI:** Translucent layered surfaces, subtle backdrop blurs, refined typography, and smooth micro-interactions.
- **Quick Track with Carrier Auto-Detection:** Automatically detects Indian and international couriers based on tracking number patterns as you type.
- **Unified Delivery Command Center:** Instant overview of active packages, categorized into *In Transit*, *Out for Delivery*, *Delivered*, and *Exceptions*.
- **Chronological Tracking Timeline:** Clear separation between normalized status badges and verbatim raw courier scan notes with event timestamps and locations.
- **Upcoming Deliveries Forecast:** Groups packages arriving today, tomorrow, or later this week.
- **In-App Notification Center:** Actionable alerts when packages ship, go out for delivery, or encounter transit exceptions.
- **Progressive Web App (PWA):** Installable on iPhone, iPad, Android, macOS, and Windows with offline caching and mobile safe-area insets.
- **Privacy-First & User-Scoped:** Hard row-level data isolation. Zero package sharing. Zero commercial tracking.

---

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Language:** TypeScript (Strict mode)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with bespoke brand tokens
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Testing:** [Vitest](https://vitest.dev/)
- **Target Backend (Milestone 2):** Supabase PostgreSQL with Row Level Security (RLS)

---

## Getting Started

### 1. Prerequisites
- Node.js `v20+` or `v23+`
- npm `v10+`

### 2. Installation
```bash
# Clone the repository and navigate into the folder
cd /Users/amanmehta/wherebox

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Quality Assurance

Run the test suite:
```bash
npm test
```

Run TypeScript and ESLint verification:
```bash
npx eslint .
npm run build
```

---

## Project Structure

```
wherebox/
├── docs/
│   ├── ARCHITECTURE.md          # Database schema, adapter pattern, system design
│   ├── BRAND_GUIDELINES.md      # Logo lockups, color palette, typography, glass rules
│   └── IMPLEMENTATION_STATUS.md # Milestones progress, test logs, next steps
├── public/
│   ├── icons/                   # PWA vector icons (192x192, 512x512)
│   ├── favicon.svg              # SVG favicon
│   └── manifest.json            # Web App Manifest
├── src/
│   ├── __tests__/               # Vitest unit test suites
│   ├── app/
│   │   ├── globals.css          # Tailwind CSS v4 design tokens & glass primitives
│   │   ├── layout.tsx           # PWA metadata & viewport setup
│   │   └── page.tsx             # Interactive dashboard
│   ├── components/
│   │   ├── brand/               # WhereBox vector logo & app icon variations
│   │   ├── layout/              # Responsive sidebar, mobile bottom navigation, header
│   │   └── ui/                  # Button, TrackingInput, GlassCard, StatusBadge, etc.
│   ├── data/
│   │   └── demo-shipments.ts    # Isolated development fixtures
│   ├── lib/
│   │   ├── carriers.ts          # Carrier registry & regex heuristic detector
│   │   └── utils.ts             # Date formatters, mask utilities, class merger
│   └── types/
│       └── shipment.ts          # Core domain models & canonical statuses
├── .env.example                 # Environment configuration template
├── package.json
└── tsconfig.json
```

---

## Roadmap

- [x] **Milestone 1:** Foundation and Brand System (Completed)
- [ ] **Milestone 2:** Authentication and Supabase Database with RLS
- [ ] **Milestone 3:** Live Multi-Carrier Tracking Adapter Integration
- [ ] **Milestone 4:** Webhook Refreshes & Notification Channels
- [ ] **Milestone 5:** Gmail OAuth Automatic Shipment Discovery
- [ ] **Milestone 6:** Security Hardening & Free-Tier Vercel Deployment
- [ ] **Milestone 7:** Grounded AI Delivery Assistant
