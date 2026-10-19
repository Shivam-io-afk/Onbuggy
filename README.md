# Onbuggy 🛒 — Hyperlocal Instant Essentials Delivery Platform

> **A modern, full-stack MERN (MongoDB, Express, React, Node.js) web application engineered with TypeScript, delivering medicines, groceries, and farm-fresh produce to doorsteps in 20–35 minutes.**

[![Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://github.com/Shivam-io-afk/Onbuggy)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v22+-339933.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.0+-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-purple.svg)](LICENSE)

---

## 🌟 Executive Summary

**Onbuggy** is an on-demand hyperlocal delivery marketplace platform tailored for Indian urban and semi-urban neighborhoods. It bridges local certified pharmacies, kirana/grocery stores, and vegetable mandis with consumers through an instant order flow, digital prescription upload, live 4-stage delivery tracking, and transparent bill calculation.

Originally prototyped as a static multi-page site, the platform has been completely refactored and leveled up to an enterprise-grade **MERN Stack application with TypeScript** across both client and server.

---

## 🏗️ Architecture & Monorepo Structure

```text
onbuggy/
├── package.json              # Monorepo root runner (concurrent dev & build scripts)
├── README.md                 # Master project documentation
├── API_DOCUMENTATION.md      # Comprehensive REST API specifications
├── DATABASE_SCHEMA.md        # MongoDB Mongoose models, ER diagrams & indexes
├── PROJECT_ROADMAP.md        # Feature roadmap, technical decisions & milestones
├── DEPLOYMENT_GUIDE.md       # Docker, Vercel, Render & MongoDB Atlas deployment
├── CONTRIBUTING.md           # Contribution standards & Git guidelines
│
├── client/                   # Modern React 18 + TypeScript + Vite Frontend
│   ├── index.html            # HTML5 shell with Google Fonts & FontAwesome
│   ├── vite.config.ts        # Vite configuration with proxy to backend
│   ├── tsconfig.json         # TypeScript configuration
│   ├── public/
│   │   └── resorces/         # Product assets, badges, illustrations & SVGs
│   └── src/
│       ├── main.tsx          # Application entry point
│       ├── App.tsx           # Route layout with Navbar & Footer
│       ├── types/            # TypeScript interfaces (User, Shop, Product, Order)
│       ├── services/         # Axios API client with JWT Bearer interceptor
│       ├── context/          # React AuthContext (state & session management)
│       ├── components/       # Reusable UI components:
│       │   ├── Navbar.tsx    # Location detector, category navigation & user dropdown
│       │   ├── Footer.tsx    # Multi-column footer with legal and social links
│       │   ├── HeroCarousel.tsx # Synchronous category slider & floating product showcase
│       │   ├── ShopCard.tsx  # Dynamic shop cards with live open/closed validation
│       │   ├── OrderTracker.tsx # 4-Stage pulsing delivery tracker with simulator
│       │   └── LiveRiderMap.tsx # Real-time Google Maps tracking like Zomato/Swiggy (rotating 3D scooter, road routing, radar pulse & partner card)
│       ├── pages/            # Full-Featured Pages:
│       │   ├── HomePage.tsx  # Storefront, search, category pills & filter tabs
│       │   ├── SigninPage.tsx # Auth page with demo one-click credentials fill
│       │   ├── SignupPage.tsx # Registration page with live validation
│       │   ├── CheckoutPage.tsx # Slip upload, bill breakdown, coupons & payment selector
│       │   ├── MyOrdersPage.tsx # Order tracking, history cards & real-time live map radar
│       │   ├── AdminPanelPage.tsx # Platform administration, GMV stats, order routing, stores & roles
│       │   ├── DeliveryPanelPage.tsx # Rider dispatch queue, store pickups, GPS directions & COD payouts
│       │   ├── MerchantPanelPage.tsx # Store manager dashboard with live rider tracking & inventory toggles
│       │   ├── UserProfilePage.tsx # Profile editor syncing with MongoDB
│       │   ├── ContactUsPage.tsx # Support inquiry form submitting to backend
│       │   ├── AboutUsPage.tsx # 3-Slide interactive story carousel
│       │   ├── TermsConditionsPage.tsx # 15-Chapter legal documentation with sticky index
│       │   ├── PrivacyPolicyPage.tsx # India DPDP Act 2023 compliant privacy policy
│       │   ├── FAQPage.tsx   # Accordion FAQ guide
│       │   └── SoonPage.tsx  # Clean under-construction placeholder
│       └── styles/
│           └── index.css     # CSS custom properties, keyframe animations & scrollbars
│
├── server/                   # Production Express + TypeScript + MongoDB Backend
│   ├── tsconfig.json         # Strict TypeScript compiler options
│   ├── package.json          # Server dependencies & scripts
│   ├── .env                  # Environment variables
│   ├── uploads/              # Storage directory for uploaded prescriptions/slips
│   └── src/
│       ├── index.ts          # Server entry point with helmet, cors, morgan
│       ├── config/           # MongoDB Mongoose connection
│       ├── models/           # Mongoose Data Models:
│       │   ├── User.ts       # Customers & Admins with bcrypt password hashing
│       │   ├── Shop.ts       # Stores with category, rating, location & status
│       │   ├── Product.ts    # Store items with pricing, category & stock
│       │   ├── Order.ts      # Orders with lifecycle status history & breakdown
│       │   └── ContactMessage.ts # Customer support messages
│       ├── middleware/       # Auth (JWT), Upload (Multer), and Error Handler
│       ├── controllers/      # Business logic (Auth, Shops, Products, Orders, Contact)
│       ├── routes/           # REST API Route declarations
│       └── seeds/            # Database seeder (12 shops, 144 products, sample orders)
│
└── legacy-static/            # Preserved archive of original HTML/CSS/JS prototypes
```

---

## ⚡ Core Features & Upgrades

| Feature | Legacy Static Prototype | Upgraded MERN + TypeScript Platform |
| :--- | :--- | :--- |
| **Frontend Framework** | Raw HTML5 / jQuery 2.2.4 | React 18 + TypeScript + Vite |
| **Backend & Database** | None (Static mock data) | Node.js + Express + MongoDB (Mongoose) |
| **Authentication** | Simulated static modal | Secure JWT authentication, bcrypt hashing, demo credentials fill |
| **Shop Directory** | 1 Hardcoded mock shop | 12 Real verified local shops across 3 categories with live search & filters |
| **Products Catalog** | Visual floating icons only | 144 Database-backed products with prices, units, and images |
| **Prescription Checkout** | Slides DOM element with static alert | File upload via Multer, auto-address, interactive live billing engine |
| **Coupon Code System** | Keydown was completely blocked | Real discount engine (`FIRSTTIME` 50% off, `BAPPA20` 20% off) |
| **Order Tracking** | Hover triggers browser `alert()` | Live 4-Stage visual timeline with pulse glowing nodes & stage simulator |
| **Customer Support** | Single-argument runtime error | Working contact API saving messages to MongoDB |
| **Preservation** | Overwritten files | Original prototype safely archived in `legacy-static/` |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher (v22+ recommended)
* **npm**: v9.0.0 or higher
* **MongoDB**: Running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

### 1. Installation
Clone the repository and install all dependencies across root, server, and client:

```bash
git clone https://github.com/Shivam-io-afk/Onbuggy.git
cd onbuggy

# Install all packages (root, server, and client)
npm run install:all
```

### 2. Seed Database
Populate MongoDB with 12 local stores, 144 categorized items, demo users, and realistic orders:

```bash
npm run seed
```

Output:
```text
[Seeding]: Connected to MongoDB
[Seeding]: Cleared old data
[Seeding]: Created 2 users
[Seeding]: Created 12 shops
[Seeding]: Created 144 products
[Seeding]: Created sample orders: 2732, 4189, 1892
[Seeding]: SUCCESS! All database collections populated.
```

### 3. Launch Development Server
Start both the Express API and Vite React client concurrently:

```bash
npm run dev
```

* **Client**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
* **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Accounts

Use these pre-seeded accounts to explore the application:

| Role | Email | Password | Phone | Portal Route |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | `user@onbuggy.com` | `Password123!` | `9102234950` | `/my-orders`, `/checkout` |
| **Merchant / Store Partner** | `merchant@onbuggy.com` | `MerchantPassword123!` | `9826112233` | `/merchant` (or `/vendor`) |
| **Delivery Rider** | `rider@onbuggy.com` | `RiderPassword123!` | `9102234950` | `/delivery` (or `/delivery-panel`) |
| **Admin** | `admin@onbuggy.com` | `AdminPassword123!` | `9876543210` | `/admin` |

> *Tip: All three management panels (`/admin`, `/merchant`, and `/delivery`) include instant 1-click Demo Account switches so you can test them directly without typing passwords!*

---

## 🛠️ Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs both backend and frontend concurrently in development mode |
| `npm run dev:server` | Runs Express backend only with live reloads (`ts-node-dev`) |
| `npm run dev:client` | Runs Vite React frontend only (`vite`) |
| `npm run build` | Compiles TypeScript on both server and client for production |
| `npm run seed` | Flushes and seeds MongoDB with shops, products, users, and orders |
| `npm start` | Boots the compiled production server (`dist/index.js`) |

---

## ⚙️ Environment Variables (`server/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/onbuggy
JWT_SECRET=onbuggy_super_secret_jwt_key_2026_secure
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

---

## 🌐 4 Real-Time Stakeholder Portals & Live GPS Radar

Onbuggy delivers a decoupled experience across 4 distinct portals synchronized via Socket.IO:

```
                      ┌─────────────────────────────────────────┐
                      │        WebSocket Server (Port 5000)     │
                      └────┬───────────┬───────────┬──────────┬─┘
                           │           │           │          │
             ┌─────────────▼─┐   ┌─────▼─────────┐ │   ┌──────▼──────┐
             │ 🛒 Customer   │   │ 🏬 Merchant   │ │   │ 🛵 Delivery │
             │   Portal      │   │   Panel       │ │   │   Portal    │
             └───────────────┘   └───────────────┘ │   └─────────────┘
                                                   │
                                          ┌────────▼────────┐
                                          │ 🛡️ Admin Panel   │
                                          │   Command Center│
                                          └─────────────────┘
```

1. **Customer / User (`/`, `/order-gothru`, `/my-orders`)**:
   - Hyperlocal storefront with shop categories (Medicine, Grocery, Vegetable).
   - Checkout with prescription upload, dynamic coupon engine, and Indian tax/charity calculation.
   - **Live Order Tracking**: Pulsing Leaflet map (`LiveRiderMap`) rendering store, live rider bike marker, destination, polyline route, speed, heading, and battery gauge in real time.

2. **Merchant / Store Partner (`/merchant`, `/vendor`)**:
   - Order fulfillment queue with 1-click status advances (`Order Placed` ➔ `Processing`).
   - Store status switch (Open / Closed toggle updating entire platform in real time).
   - Live product inventory stock toggles.
   - Real-time incoming order audio/visual alert banner.
   - Live rider radar map tracking approaching delivery boys.

3. **Delivery Boy / Fleet Partner (`/delivery`, `/delivery-panel`)**:
   - Active dispatch queue with instant pickup confirmations.
   - Doorstep handovers with COD cash collection tally.
   - Real-time GPS broadcasting & simulation steps to customer and merchant.
   - Google Maps navigation deep links and direct customer calling buttons.

4. **Platform Administrator (`/admin`)**:
   - Executive operations cockpit with GMV revenue, active orders, and partner analytics.
   - Master order dispatching and manual rider assignments.
   - Merchant store verification toggles and user role governance.
   - Full live rider map tracking inside order inspection modals.

5. **Sticky Portal Switcher Bar (`PortalSwitcherBar`)**:
   - Floating role switcher bar at the top of the screen with a live `🟢 REAL-TIME WEBSOCKET LIVE` status indicator.
   - 1-click instant login buttons to jump between Customer, Merchant, Rider, and Admin views with zero friction.

---

## 📚 Detailed Documentation Links

* 📖 [REST API Documentation](file:///c:/WEB/React/onbuggy/API_DOCUMENTATION.md)
* 🗄️ [Database Schema & Data Models](file:///c:/WEB/React/onbuggy/DATABASE_SCHEMA.md)
* 🗺️ [Project Roadmap & Architecture Decisions](file:///c:/WEB/React/onbuggy/PROJECT_ROADMAP.md)
* 🚢 [Production Deployment Guide](file:///c:/WEB/React/onbuggy/DEPLOYMENT_GUIDE.md)
* 🤝 [Contribution Guidelines](file:///c:/WEB/React/onbuggy/CONTRIBUTING.md)

---

## 📄 License
This project is licensed under the ISC License. 2026 © Onbuggy Technologies Pvt. Ltd. All rights reserved.

