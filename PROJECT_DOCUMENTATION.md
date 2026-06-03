# Lifed Healthmate Onboarding Manager — Comprehensive Project Documentation

Welcome to the definitive structural, architectural, and operational documentation for the **Lifed Healthmate Onboarding Manager**. This enterprise-grade platform serves as a modern, multi-user CRM and operations dashboard designed specifically to streamline, track, and automate the onboarding lifecycle of healthcare partners (referred to as **Healthmates**).

---

## 1. Executive Summary & Value Proposition

In fast-scaling healthcare environments, coordinating practitioner credentials, regulatory registry files, and compliance agreements using traditional offline tools (like spreadsheets or generic email clients) leads to critical operational bottlenecks:
* **Bottlenecks and Stagnancy:** Health partners frequently get stuck in individual onboarding phases without operations agents noticing.
* **Communication Gaps:** Manual follow-ups are time-consuming and lack standardized templates, leading to inconsistent messaging.
* **Coordination Overhead:** Reassigning accounts when coordinators change roles or leave the company is error-prone, risking orphaned client profiles.

The **Lifed Healthmate Onboarding Manager** solves these problems by providing an elegant, automated, and secure web application:
1. **Visual Pipeline Management:** An interactive Kanban board dynamically maps progress across five distinct onboarding phases.
2. **Phase-Specific Compliance Checklists:** Granular tasks are automatically seeded to ensure every compliance standard is met before a partner is activated.
3. **Optimized Asynchronous Communication:** Background messaging queues (BullMQ + Redis) allow agents to send context-aware emails and WhatsApp alerts with a single click.
4. **Resilient User Management:** Administrators can invite, monitor, and remove team members, while custom database guards automatically prevent orphaned accounts.

---

## 2. Platform Architecture & Stack Selection

The platform is engineered using a decoupled **client-server architecture**, utilizing modern, high-performance web standards to deliver responsive user interactions and scalable background processing.

```mermaid
graph TD
    subgraph Client [Client Application - React & Vite]
        A[index.html] --> B[App Component]
        B --> C[useOpsStore Zustand State]
        B --> D[Sidebar / Layout Router]
        D --> E[Dashboard Metrics]
        D --> F[Pipeline Board Kanban]
        D --> G[Unified Tasks Checklist]
        D --> H[Team Administration]
        F -->|dnd-kit| F1[Draggable Partner Card]
        F1 -->|Click| H2[Healthmate Detail & Document Upload Modal]
    end

    subgraph Server [Server Application - Express & Prisma]
        J[server.js Entry] --> K[API Gateway & Router]
        K --> L[authenticate Token JWT Middleware]
        L --> M[requireAdmin Role Gate Middleware]
        
        K --> N[Controllers]
        N --> N1[auth.controller]
        N --> N2[healthmate.controller]
        N --> N3[task.controller]
        N --> N4[user.controller]
        N --> N5[analytics.controller]
        
        N -->|Prisma Client| O[(PostgreSQL Database)]
        N2 -->|Queue Job Request| P[BullMQ Message Queue]
    end

    subgraph Background [Background Worker Process]
        P -->|ioredis Connection| Q[BullMQ Worker Service]
        Q -->|SendGrid SMTP / Simulation| R[Email Service]
        Q -->|Twilio API / Simulation| S[WhatsApp Service]
    end

    C <==>|Axios Intercepted Requests| K
```

### 2.1 Backend Technology Stack
* **Runtime:** **Node.js** (Asynchronous, event-driven JavaScript server environment).
* **API Layer:** **Express.js** (Fast, unopinionated routing middleware handler).
* **Database & ORM:** **PostgreSQL** combined with **Prisma ORM** (Provides full type safety, automatic schema migrations, and structured declarative querying).
* **Job & Task Queue:** **BullMQ & Redis (ioredis)** (Asynchronous micro-service worker setup to decouple external API latencies like SMS or email sending).
* **Security & Auth:** **bcryptjs** (Hashed password safety using 12 salt rounds) and **jsonwebtoken (JWT)** (Stateless cryptographic token passing for secure access).
* **File Uploads:** **Multer** (Node.js middleware for handling multipart/form-data for compliance documents).

### 2.2 Frontend Technology Stack
* **Build System:** **Vite** (Next-generation build tool using ES modules for rapid page loading and instant Hot Module Replacement).
* **UI Library:** **React 19** (Component-driven view architecture with optimized virtual DOM synchronization).
* **State Management:** **Zustand** (Ultra-lightweight, high-performance central state store that avoids unnecessary React re-renders).
* **Drag-and-Drop Canvas:** **dnd-kit** (Modular, highly customizable, and accessible drag-and-drop primitives).
* **Styling Framework:** **Tailwind CSS v4** (Utility-first styling for creating responsive, premium, and clean user interfaces).
* **Notifications:** **react-hot-toast** (Visual, customizable status indicators for asynchronous actions).
* **Icon Assets:** **lucide-react** (Scalable vector icons served directly as React components).

---

## 3. Comprehensive Folder Structures

The codebase is organized cleanly to maintain a strict separation of concerns, separating application routing, business controllers, background workers, and view rendering.

### 3.1 Backend Layout
```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema models & relationship mappings
│   ├── seed.js                # Initial database seed script (creates admin/ops accounts & mock data)
│   └── migrations/            # SQL migration transcripts and schema history logs
├── src/
│   ├── controllers/           # HTTP controllers implementing core business logic
│   │   ├── analytics.controller.js
│   │   ├── auth.controller.js
│   │   ├── healthmate.controller.js
│   │   ├── task.controller.js
│   │   └── user.controller.js
│   ├── middleware/            # Security verification & file upload filters
│   │   ├── auth.middleware.js
│   │   └── upload.js
│   ├── routes/                # Modular Express API route declarations
│   │   └── api.routes.js
│   ├── services/              # External communication drivers & job triggers
│   │   ├── email.service.js
│   │   ├── queue.service.js
│   │   └── whatsapp.service.js
│   ├── utils/
│   │   └── template.engine.js # Contextual template engine for hydrating emails/SMS
│   └── workers/               # Resilient worker scripts running background BullMQ jobs
│       └── message.worker.js
├── uploads/                   # Local storage folder for verified regulatory PDFs/images
├── .env                       # Environment credentials & database URLs
├── server.js                  # Express bootstrapper & background thread startup
└── package.json
```

### 3.2 Frontend Layout
```
frontend/
├── public/                    # Static assets
│   └── favicon.svg            # Scalable application clover icon
├── src/
│   ├── assets/
│   │   └── favicon.svg        # Source vector brand assets
│   ├── components/            # Isolated, reusable React elements
│   │   ├── dashboard/         # Aggregated stats, global checklists, and administration
│   │   │   ├── DashboardOverview.jsx
│   │   │   ├── MyTasks.jsx
│   │   │   └── TeamManagement.jsx
│   │   ├── pipeline/          # Interactive Kanban columns and partner cards
│   │   │   ├── AddHealthmateModal.jsx
│   │   │   ├── HealthmateCard.jsx
│   │   │   ├── HealthmateModal.jsx
│   │   │   ├── KanbanColumn.jsx
│   │   │   └── PipelineBoard.jsx
│   │   ├── Layout.jsx         # Global sidebar, navigation, and user context wrapper
│   │   └── Login.jsx          # Secure admin/ops gateway gate
│   ├── lib/
│   │   └── axios.js           # Shared Axios HTTP instance with automatic JWT interceptors
│   ├── store/
│   │   └── useOpsStore.js     # Unified Zustand store managing global application state
│   ├── App.jsx                # Layout router and toast setup
│   ├── index.css              # Styling definitions, branding variables, and typography overrides
│   └── main.jsx               # React DOM mount node entry
├── index.html                 # Main single page application index container
├── vite.config.js             # Vite compiler definitions and Tailwind configurations
└── package.json
```

---

## 4. Database Schema & Architecture

The database is built on **PostgreSQL** and managed using **Prisma**. Below is the entity-relationship definition:

```
  ┌────────────────────────┐                   ┌────────────────────────┐
  │        OpsUser         │                   │       Healthmate       │
  ├────────────────────────┤                   ├────────────────────────┤
  │ id (PK: UUID)          │                   │ id (PK: UUID)          │
  │ email (Unique)         │ 1               * │ name (String)          │
  │ passwordHash (String)  │──────────────────>│ type (Enum)            │
  │ name (String)          │                   │ category (String)      │
  │ role (String: default) │                   │ phase (Enum: default)  │
  └────────────────────────┘                   │ daysInPhase (Int)      │
                                               │ contactEmail (String)  │
                                               │ contactPhone (String)  │
                                               │ regDocUrl (String?)    │
                                               │ opsUserId (FK)         │
                                               └────────────────────────┘
                                                           │
                                                           │ 1
                                                           │
                                                           ▼ *
                                               ┌────────────────────────┐
                                               │          Task          │
                                               ├────────────────────────┤
                                               │ id (PK: UUID)          │
                                               │ title (String)         │
                                               │ completed (Boolean)    │
                                               │ phase (Enum)           │
                                               │ healthmateId (FK)      │
                                               └────────────────────────┘
```

### 4.1 Schema Definitions (`schema.prisma`)

* **Enums:**
  * **`Phase`:** Traces progression stages: `PRE_QUALIFY` ➔ `PREPARE` ➔ `REGISTER` ➔ `REVIEW` ➔ `LIVE`.
  * **`HealthmateType`:** Categorizes the organization structures: `PRACTITIONER`, `CENTRE`, and `ORGANIZER`.
* **Models:**
  * **`OpsUser`:** Holds dashboard credentials. Relates one-to-many with `Healthmate`. Standard roles are `'ops'` (standard coordinator) and `'admin'` (administrator with team management access).
  * **`Healthmate`:** Repesents the onboarding partner. Holds critical details (e.g., email, phone, category), phase counters, internal notes, and pointers to uploaded regulatory files (`regDocUrl`).
  * **`Task`:** Individual checklist items. Each task is bound to a specific onboarding `phase`. Cascade constraints are declared (`onDelete: Cascade` on the `Healthmate` relationship) so that deleting a partner automatically removes their checklist history.

---

## 5. Security & Authentication Guardrails

We implement a multi-layered security layout to protect operations records and ensure proper authorization across administrative tasks.

```
       Incoming Request [Header: Authorization Bearer <token>]
                               │
                               ▼
               [authMiddleware.authenticate]
                               │
                Is signed JWT present & valid?
                     ├── NO  ──> HTTP 401 Unauthorized
                     └── YES ──> Hydrate req.user with token payload
                               │
                               ▼
               [authMiddleware.requireAdmin]
                               │
                     Is req.user.role === 'admin'?
                     ├── NO  ──> HTTP 403 Forbidden
                     └── YES ──> Execute Admin Handler
```

### 5.1 Key Security Implementations
1. **Stateless JWT Authorization:** Every request targeting protected routes must attach a cryptographically signed token inside the `Authorization` header.
2. **Standard Hashing System:** User passwords are never saved in plain text. We run them through **bcryptjs** with **12 salt rounds**, protecting them from rainbow table and dictionary attacks.
3. **Self-Deletion Prevention:** The user administration controller explicitly blocks administrators from deleting their own active profile to avoid locking out the entire team.
4. **Partner Reassignment Safety:** Deleting a team member leaves their assigned `Healthmate` partners vulnerable to becoming orphaned. The backend handles this gracefully using a cascading transfer: before the target `OpsUser` record is deleted, all their managed health partners are automatically reassigned to the active administrator:
   ```javascript
   await prisma.healthmate.updateMany({
     where: { opsUserId: targetId },
     data: { opsUserId: executingAdminId }
   });
   ```

---

## 6. End-to-End Data & State Flow

### 6.1 Kanban Drag-and-Drop Flow with Optimistic UI
Visual transitions should feel instantaneous. To achieve this, the frontend uses **optimistic UI updates** inside the Zustand store:

```
[User drags partner card to a new column]
                   │
                   ▼
  [Store immediately updates UI state] ──> Kanban column moves card instantly
                   │
                   ▼
      [Async PATCH Request sent]
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
    [API Success]       [API Failure]
    Keep state &        Revert UI state to previous,
    notify user         display error banner to agent
```

### 6.2 Asynchronous Background Messaging Flow (BullMQ + Redis)
External communication services (like Twilio or SendGrid) can experience network lag. The Onboarding Manager prevents these latency spikes from blocking the main Express event loop by offloading jobs to a background queue:

```
[Agent clicks email/SMS button in browser]
                   │
                   ▼
[Express Controller enqueues job in Redis Queue]
                   │
                   ▼
[Express instantly responds to Client (HTTP 200)] ──> UI unlocks immediately
                   │
                   ▼
 [BullMQ Worker detects new job in background]
                   │
                   ▼
[Hydrates Template ➔ Dispatches to Twilio/SendGrid]
```

---

## 7. API Reference Specification

All endpoints require standard application/json requests and (unless noted as public) require the header `Authorization: Bearer <token>`.

### 7.1 Authentication (Public)
* **`POST /api/auth/register`**
  * Registers a new user. Default role is `'ops'`.
* **`POST /api/auth/login`**
  * Authenticates credentials and returns a secure JWT and user object.

### 7.2 Analytics (Protected)
* **`GET /api/analytics/summary`**
  * Returns aggregate pipeline counts (how many partners are in `PRE_QUALIFY`, `PREPARE`, etc.) and a feed of recent activity logs.

### 7.3 Onboarding Partners (Protected)
* **`GET /api/healthmates`**
  * Returns all onboarding partners managed by the requesting coordinator, along with their tasks.
* **`POST /api/healthmates`**
  * Creates a new partner record (defaulting to the `PRE_QUALIFY` phase) and seeds default tasks.
* **`PATCH /api/healthmates/:id/phase`**
  * Updates a partner's active phase and resets their `daysInPhase` counter to zero.
* **`PUT /api/healthmates/:id`**
  * Replaces general profile fields (names, email, phone numbers, and categories).
* **`DELETE /api/healthmates/:id`**
  * Deletes a partner and cascade-deletes all associated tasks.
* **`PATCH /api/healthmates/:id/notes`**
  * Updates internal notes.
* **`POST /api/healthmates/:id/upload`**
  * Saves an uploaded compliance document, updates the partner's profile URL, and automatically checks off the corresponding registration task.
* **`DELETE /api/healthmates/:id/upload`**
  * Physically deletes the file from disk and database records, and unchecks the corresponding compliance task.

### 7.4 Task Checklists (Protected)
* **`POST /api/healthmates/:id/tasks`**
  * Seeds a custom task under a specific phase for a partner.
* **`PATCH /api/tasks/:taskId/toggle`**
  * Toggles the task's completion status.
* **`GET /api/tasks/pending`**
  * Returns a global checklist of all uncompleted tasks across all partners, grouped and sorted.

### 7.5 Background Messaging (Protected)
* **`POST /api/healthmates/:id/messages`**
  * Body: `{ "type": "EMAIL" | "WHATSAPP" }`
  * Automatically matches the partner's active stage, builds the message template, and queues the job in Redis.

### 7.6 Team Administration (Admin Role Locked)
* **`GET /api/users`**
  * Returns all system accounts.
* **`POST /api/users`**
  * Creates a new operator or administrator account.
* **`DELETE /api/users/:userId`**
  * Safely deletes an account and reassigns all managed partners to the executing administrator.

---

## 8. Resilience Safeguards

* **Suppressed Redis Noise:** If Redis is down, ioredis normally logs repeated connection failure notices that can flood the console and starve the single-threaded Node.js event loop. The system resolves this using custom error listeners in the server and background worker, suppressing warning logs while maintaining retries silently in the background. The main REST API remains fully operational, degrading background messaging features gracefully instead of crashing.
* **Database Relational Integrity:** Using Prisma cascade deletions prevents database bloat by automatically cleaning up tasks, documents, and logs when a parent entity is deleted.
* **Form Validation:** All requests are validated at the API router layer before hitting database transactions to prevent SQL state crashes.

---

## 9. Design System & User Interface Aesthetics

The frontend is styled using a modern, professional palette designed to match clinical and professional operations:

* **Typography:** Default system font is **Roboto** (weights: 400 Regular, 500 Medium, 700 Bold), loaded via Google Fonts. This guarantees high readability for large checklists and dashboards.
* ** harmonious Color Palette:**
  * **Brand Teal (`#00ad9c`):** Used for primary buttons, active tabs, and positive states.
  * **Brand Green (`#5fba46`):** Used for success indicators, completed checkboxes, and 'Live' status labels.
  * **Deep Forest Sidebar (`#112421`):** Used for the sidebar to give the application a premium, modern feel.
  * **Mint Background (`#f8fcf9`):** Light, clean surface color that keeps the dashboard feeling spacious and readable.
  * **Light Borders (`#d3ebd7`):** Subtle borders that structure information panels cleanly.
* **Micro-Animations:** Interactive elements feature smooth transitions (`transition-all duration-200`) and slight elevation scale transforms on hover to make the interface feel alive and premium.

---

## 10. Developer Setup & Deployment Guidelines

### 10.1 Environment Configuration (`.env`)
Create a `.env` file in your server directory matching these variables:
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/lifed_db?schema=public"
JWT_SECRET="YOUR_SECURE_JWT_SECRET_STRING"
CLIENT_ORIGIN="http://localhost:5173"
REDIS_URL="redis://localhost:6379"

# Third-Party Integrations (Optional — system simulates actions if keys are missing)
SENDGRID_API_KEY=""
SENDGRID_FROM_EMAIL="support@lifedhealth.com"
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
```

### 10.2 Database Seeding & Development Run
Follow this step-by-step process to launch your local development instance:

1. **Install Dependencies:**
   ```bash
   # In the backend directory
   npm install

   # In the frontend directory
   npm install
   ```

2. **Initialize the Database:**
   ```bash
   # Run database migrations
   npm run db:migrate

   # Generate the Prisma Client
   npm run db:generate

   # Seed initial admin and ops accounts
   npx prisma db seed
   ```

3. **Start the Development Servers:**
   * Run `npm run dev` in the `backend` directory to start the Express API and background workers.
   * Run `npm run dev` in the `frontend` directory to launch the Vite development server.

---
*Documentation Compiled & Validated for Lifed Healthmate Onboarding System.*
