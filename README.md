# Abia State Knowledge Management System

**Web-Based Knowledge Management System for Documenting Leadership Trajectories and Historical Developments in Abia State, Nigeria.**

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 15 (optional — app runs in mock mode without it)

### 1. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

### 2. Run the Backend (Optional — requires PostgreSQL)

```bash
cd backend
cp .env.example .env
# Edit .env and set your DATABASE_URL
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed      # Seeds 100 leaders, 300 events, 1000 documents
npm run dev
```

---

## 🔑 Default Login Credentials

All seeded passwords: **`Password123`**

| Email | Role |
|-------|------|
| superadmin@abia.gov.ng | Super Admin |
| admin@abia.gov.ng | Administrator |
| historian@abia.gov.ng | Historian |
| researcher@abia.gov.ng | Researcher |
| editor@abia.gov.ng | Editor |
| contributor@abia.gov.ng | Contributor |
| guest@abia.gov.ng | Guest |

> **Offline Mode**: If the backend is not running, the app automatically serves realistic mock data.

---

## 📁 Project Structure

```
Knowledge Management System/
├── backend/                   # Express.js + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma      # PostgreSQL database schema
│   │   └── seed.ts            # 100 users, 100 leaders, 300 events, 1000 docs
│   ├── src/
│   │   ├── middleware/auth.ts  # JWT + RBAC + Audit logging
│   │   ├── routes/
│   │   │   ├── auth.ts        # Login, Register, Profile, Password
│   │   │   ├── leaders.ts     # Leadership CRUD + succession links
│   │   │   ├── events.ts      # Historical events CRUD + map coords
│   │   │   ├── documents.ts   # Archive CRUD + approval workflow
│   │   │   ├── analytics.ts   # Stats summary + CSV export
│   │   │   └── audit.ts       # Audit trail (admin only)
│   │   └── index.ts           # Express app entry point
│   └── .env                   # Database + JWT configuration
│
├── frontend/                  # Next.js 15 + TypeScript
│   └── src/
│       ├── app/
│       │   ├── page.tsx               # Landing page (hero, stats, timeline)
│       │   ├── auth/page.tsx          # Login + Register
│       │   ├── dashboard/page.tsx     # Stats widgets + Recharts
│       │   ├── leaders/page.tsx       # Leader directory + filters
│       │   ├── leaders/[id]/page.tsx  # Leader profile + succession
│       │   ├── events/page.tsx        # Historical events explorer
│       │   ├── events/[id]/page.tsx   # Event detail + linked leaders
│       │   ├── timeline/page.tsx      # Chronological explorer + era zoom
│       │   ├── documents/page.tsx     # Archive repo + upload modal
│       │   ├── map/page.tsx           # Leaflet interactive map
│       │   ├── gallery/page.tsx       # Photo gallery + lightbox
│       │   ├── analytics/page.tsx     # 5 Recharts visualizations
│       │   ├── admin/page.tsx         # Admin console + user management
│       │   └── admin/audit/page.tsx   # Real-time audit trail
│       ├── components/
│       │   ├── AppLayout.tsx          # Sidebar + header shell
│       │   └── LeafletMap.tsx         # Client-only Leaflet map
│       └── context/
│           ├── AuthContext.tsx        # JWT auth + offline fallback
│           └── ThemeContext.tsx       # Dark / Light theme toggle
│
├── docker-compose.yml         # PostgreSQL + Backend + Frontend
└── README.md
```

---

## 🗺️ All Pages

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Hero, stats, timeline preview |
| Auth | `/auth` | Login + Register |
| Dashboard | `/dashboard` | Metrics, charts, activity feed |
| Leaders | `/leaders` | Directory, filters, add form |
| Leader Detail | `/leaders/[id]` | Biography, succession, events |
| Events | `/events` | Historical developments browser |
| Event Detail | `/events/[id]` | Narrative, linked leaders |
| Timeline | `/timeline` | Chronological explorer + era zoom |
| Documents | `/documents` | Archive repo, upload, approve |
| Map | `/map` | Interactive Leaflet geo-map |
| Gallery | `/gallery` | Photo gallery + lightbox |
| Analytics | `/analytics` | 5 chart types + CSV export |
| Admin | `/admin` | Console + user management |
| Audit Trail | `/admin/audit` | System activity log |

---

## 🐳 Docker Deployment

```bash
# Start all services (DB + Backend + Frontend)
docker-compose up --build
```

---

## 🛡️ User Roles & Permissions

| Role | View | Create | Edit | Delete | Approve | Admin |
|------|------|--------|------|--------|---------|-------|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Administrator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Historian | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Researcher | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Editor | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Contributor | ✅ | Upload only | ❌ | ❌ | ❌ | ❌ |
| Guest | Approved only | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🛠️ Tech Stack

**Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Recharts, Leaflet, Lucide Icons  
**Backend**: Node.js, Express.js, TypeScript  
**Database**: PostgreSQL, Prisma ORM  
**Auth**: JWT, Refresh Tokens, Role-Based Access  
**DevOps**: Docker, Docker Compose

---

*Abia State Digital Archives © 2026 — Government of Abia State, Nigeria*
