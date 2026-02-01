# 🏨 Guesthouse Management System

A full-featured hotel and guesthouse management platform built with **Vue 3**, **Vuestic UI**, and **Vue Router**. Designed for small-to-mid-size properties — covers the entire guest journey from reservation to checkout, billing, and reporting.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Routing](#routing)
- [Pages & Modules](#pages--modules)
- [Sidebar & Navigation](#sidebar--navigation)
- [Billing & Deposits](#billing--deposits)
- [POS (Point of Sale)](#pos-point-of-sale)
- [Authentication](#authentication)
- [Configuration Tips](#configuration-tips)

---

## ✨ Features

| Module | What it does |
|---|---|
| **Dashboard** | High-level overview and key metrics |
| **Front Desk** | Room status board, quick walk-in booking, check-in / check-out |
| **Reservations** | Create, view, and manage all bookings — calendar, cancellations, no-shows |
| **Rooms** | Manage rooms, types, images, keys, rates, features, and maintenance |
| **Guests** | Guest profiles, documents, VIP list, in-house list, history, preferences |
| **Billing** | Invoices, payments, deposits, extra charges, refunds |
| **POS / Cashier** | Room-based point of sale, history, and daily closing |
| **Housekeeping** | Task management, daily schedule, staff assignments, checklists, performance |
| **Reports** | Occupancy, revenue, room sales, guest reports |
| **Settings** | Users, roles, permissions, payment methods, general / property config |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) |
| UI Library | [Vuestic UI](https://ui.vuestic.com/) |
| Router | [Vue Router 4](https://router.vuejs.org/) |
| Build Tool | [Vite](https://vitejs.dev/) |
| State (planned) | Pinia or Vuex |
| Auth | Token-based (`localStorage`) |

---

## 📂 Project Structure

```
src/
├── layouts/                  # Page layouts (shell wrappers)
│   ├── AuthLayout.vue        # Login / auth pages layout
│   ├── DashboardLayout.vue   # Main admin layout (sidebar + navbar)
│   └── PosLayout.vue         # POS-specific layout
│
├── pages/                    # Route-level page components
│   ├── auth/                 # Login, Forgot, OTP, Reset
│   ├── admin/                # All admin modules (see below)
│   │   ├── billding/         # Billing pages (invoices, deposits, payments…)
│   │   ├── frontdesk/        # Front desk pages
│   │   ├── guests/           # Guest management pages
│   │   ├── housekeeping/     # Housekeeping pages
│   │   ├── reservation/      # Reservation pages
│   │   ├── reports/          # Report pages
│   │   ├── rooms/            # Room management pages
│   │   └── setting/          # Settings pages
│   ├── pos/                  # POS pages
│   └── NotFoundView.vue      # 404 page
│
├── data/                     # Static / mock data (for development)
│   └── billing/
│       └── deposits.js       # Sample deposit records
│
├── layouts/                  # Shared layout components
├── router/
│   └── index.js              # All route definitions (see Routing section)
└── main.js                   # App entry point
```

> **Note:** The billing folder is currently named `billding` in the file system. This is a known typo — imports already point to the correct path. If you rename the folder, update the import paths in `router/index.js` accordingly.

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have these installed:

- **Node.js** — version 18 or higher
- **npm** or **yarn**

### 2. Clone the Repository

```bash
git clone <your-repo-url>
cd guesthouse-management
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173` by default.

### 5. Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder. Serve it with any static file server or deploy to Vercel, Netlify, etc.

### 6. Preview the Production Build

```bash
npm run preview
```

---

## 🔧 Environment Variables

Create a `.env` file in the project root before running:

```env
# API base URL (your backend)
VITE_API_BASE_URL=http://localhost:3000/api

# App title (shown in browser tab)
VITE_APP_TITLE=Guesthouse Management System
```

All `VITE_` prefixed variables are automatically available inside Vue components via `import.meta.env`.

---

## 🗺 Routing

All routes are defined in `src/router/index.js`. The structure uses **nested routes** with layout components as parents.

### Route Layout

```
/                          → AuthLayout
  /                        → Login
  /forgot                  → Forgot Password
  /otp                     → OTP Verification
  /reset                   → Reset Password

/admin                     → DashboardLayout (sidebar + navbar)
  /dashboard               → Dashboard
  /frontdesk/…             → Front Desk pages
  /reservations/…          → Reservation pages
  /rooms/…                 → Room pages
  /guests/…                → Guest pages
  /billing/…               → Billing pages
  /housekeeping/…          → Housekeeping pages
  /reports/…               → Report pages
  /settings/…              → Settings pages
  /pos/…                   → POS pages (inside admin layout)

/admin/pos                 → PosLayout (dedicated POS shell)
  /                        → POS Main Screen
  /customer                → Customer View

/:pathMatch(.*)*           → 404 Not Found
```

### Route Params & Props

Routes that need dynamic data use `:param` segments and `props: true` to automatically inject the param as a component prop:

```js
// Route definition
{ path: "billing/deposits/:bookingId", name: "billing-deposits-show", component: DepositsShow, props: true }

// Inside DepositsShow.vue — receives bookingId automatically
const props = defineProps({ bookingId: { type: String, required: true } })
```

Other examples across the app:

| Route | Param | Used by |
|---|---|---|
| `billing/deposits/:bookingId` | `bookingId` | DepositsShow |
| `billing/invoices/:invoiceId/edit` | `invoiceId` | InvoiceFormView |
| `billing/payments/create` | — | PaymentForm |
| `guests/:id/edit` | `id` | GuestForm |
| `guests/:guestId/documents/create` | `guestId` | GuestDocumentForm |
| `rooms/keys/edit/:key_id` | `key_id` | RoomKeyCreate |
| `pos/history/:id` | `id` | PosHistoryView |
| `housekeeping/staff/:staffId/tasks` | `staffId` | Housekeeping_StaffTasks |

### Page Title Guard

A global `beforeEach` guard sets the browser tab title from `route.meta.title`. If none is set, it defaults to `"Guesthouse management system"`:

```js
router.beforeEach((to, _from, next) => {
  document.title = to.meta?.title || "Guesthouse management system"
  next()
})
```

---

## 📦 Pages & Modules

### Front Desk

The first stop for staff handling walk-ins and on-site guests.

| Page | Route | Purpose |
|---|---|---|
| Room Status Board | `/admin/frontdesk/rooms-status` | Visual grid of all rooms and their live status |
| Quick Book | `/admin/frontdesk/quick-book` | Fast booking form for walk-in guests |
| Check-in | `/admin/frontdesk/checkin` | Process guest check-in |
| Check-out | `/admin/frontdesk/checkout` | Process guest check-out |
| In-House Guests | `/admin/frontdesk/in-house` | List of currently staying guests |

### Reservations

Manage future and active bookings.

| Page | Route | Purpose |
|---|---|---|
| All Bookings | `/admin/reservations` | Full list with filters |
| New Booking | `/admin/reservations/create` | Create a new reservation |
| Calendar | `/admin/reservations/calendar` | Visual calendar of bookings |
| Cancellations | `/admin/reservations/cancellations` | Cancelled booking records |
| No-Shows | `/admin/reservations/no-shows` | Guests who did not show up |

### Rooms

Full room and property asset management.

| Page | Route | Purpose |
|---|---|---|
| All Rooms | `/admin/rooms` | Room list and overview |
| Room Types | `/admin/rooms/types` | Define room categories |
| Room Images | `/admin/rooms/images` | Upload and manage room photos |
| Room Keys | `/admin/rooms/keys` | Key card management |
| Maintenance | `/admin/rooms/maintenance` | Log and track maintenance jobs |

### Guests

Guest profile and relationship management.

| Page | Route | Purpose |
|---|---|---|
| All Guests | `/admin/guests` | Searchable guest directory |
| Add New Guest | `/admin/guests/create` | New guest form |
| Guest Documents | `/admin/guests/documents` | ID and document uploads |
| VIP Guests | `/admin/guests/vip` | Flagged high-value guests |

### Housekeeping

Task and staff coordination for housekeeping teams.

| Page | Route | Purpose |
|---|---|---|
| Today's Tasks | `/admin/housekeeping/today` | Tasks due today |
| All Tasks | `/admin/housekeeping/tasks` | Full task list |
| Assign Task | `/admin/housekeeping/assign` | Assign a task to a staff member |

### Reports

Analytics and export for management review.

| Page | Route | Purpose |
|---|---|---|
| Occupancy | `/admin/reports/occupancy` | Room occupancy rate over time |
| Revenue | `/admin/reports/revenue` | Revenue trends |
| Room Sales | `/admin/reports/room-sales` | Per-room sales breakdown |
| Guests | `/admin/reports/guests` | Guest activity report |

### Settings

System administration and configuration.

| Page | Route | Purpose |
|---|---|---|
| Users | `/admin/settings/users` | User account management |
| Roles | `/admin/settings/roles` | Role definitions |
| Permissions | `/admin/settings/permissions` | Permission matrix |
| Payment Methods | `/admin/settings/payment-methods` | Accepted payment methods |
| General | `/admin/settings/general` | Property-level settings |

---

## 🗂 Sidebar & Navigation

The sidebar is built with **Vuestic's `VaSidebar`** components and a static menu configuration array.

### How It Works

- The menu is defined as a **const array** (`MENU`) at the top of `Sidebar.vue`.
- Each item is either a **single link** (has `to`) or a **group** (has `children`).
- The currently open group is tracked with a `ref` and syncs automatically after every navigation via `router.afterEach()`.
- Active states (blue highlight) are applied using Vuestic's `:active` prop — driven by comparing `route.path` to each item's `to` path.

### Adding a New Page to the Sidebar

1. Add the route to `src/router/index.js`
2. Add an entry to the `MENU` array in `Sidebar.vue`:

```js
// Single page (no group)
{ title: "Analytics", icon: "analytics", to: "/admin/analytics" }

// Inside an existing group
{
  title: "Reports",
  icon: "bar_chart",
  children: [
    // … existing items …
    { title: "Analytics", icon: "analytics", to: "/admin/reports/analytics" },
  ],
}
```

### Pinned Items

Any child item can be marked with `pin: true` to show a **PIN** badge next to it — useful for high-traffic pages:

```js
{ title: "Room Status Board", icon: "grid_view", to: "/admin/frontdesk/rooms-status", pin: true }
```

---

## 💰 Billing & Deposits

### Deposits List (`/admin/billing/deposits`)

- Pulls deposit data from the bookings table (fields: `deposit_amount`, `deposit_paid`, `deposit_currency`).
- Supports filtering by **status**, **source**, **currency**, and free-text **search** (booking number, guest name, phone).
- Shows a live summary bar: **Total Deposits**, **Paid**, and **Balance**.
- Each row has a **View** link that navigates to the deposit detail page.

### Deposit Detail (`/admin/billing/deposits/:bookingId`)

- Receives `bookingId` via route params (injected as a prop by `props: true`).
- Displays full guest info, booking info, and a deposit breakdown.
- Includes a **color-coded progress bar** showing payment completion:
  - 🟢 Green — fully paid
  - 🟡 Amber — partially paid (≥ 50%)
  - 🔴 Red — less than 50% paid
- Shows a "not found" state if the booking ID doesn't match any record.

### Currency Support

The system supports multiple currencies. The `money()` helper formats amounts based on currency code:

| Currency | Format | Example |
|---|---|---|
| USD | `$X.XX` | `$500.00` |
| KHR | `X ៛` (no decimals) | `2000000 ៛` |

---

## 🧾 POS (Point of Sale)

The POS module runs in its own layout (`PosLayout`) at `/admin/pos`.

| Page | Route | Purpose |
|---|---|---|
| POS Main | `/admin/pos` | Main cashier screen |
| Customer | `/admin/pos/customer` | Customer selection / lookup |

POS history and daily closing are accessible from the **admin layout** (sidebar) at:

| Page | Route |
|---|---|
| POS History | `/admin/pos/history` |
| History Detail | `/admin/pos/history/:id` |
| Daily Closing | `/admin/pos/closing` |

---

## 🔐 Authentication

Authentication is token-based:

- On successful login, a token is saved to `localStorage` under the key `token`.
- On logout, the token is removed and the user is redirected to `/` (login page).
- The navbar displays the current user's name and role (currently static — connect to your auth store to make it dynamic).

### Protecting Routes (Recommended Next Step)

Add a **navigation guard** to block unauthenticated access to `/admin`:

```js
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token")
  const isAdmin = to.path.startsWith("/admin")

  if (isAdmin && !token) {
    next("/")           // redirect to login
  } else {
    next()
  }
})
```

---

## ⚙️ Configuration Tips

| Task | What to do |
|---|---|
| Change the app name | Update `VITE_APP_TITLE` in `.env` and the brand text in `Navbar.vue` |
| Add a new module | Create pages in `src/pages/admin/`, add routes to `router/index.js`, add menu items to `Sidebar.vue` |
| Connect a real backend | Replace the static data in `src/data/` with API calls (axios or fetch) |
| Swap the auth system | Replace the `localStorage` token logic with your preferred auth library (e.g., Pinia store + JWT refresh) |
| Add role-based access | Extend the navigation guard above to check `user.role` against allowed roles per route |
| Rename `billding` folder | Rename `src/pages/admin/billding/` → `src/pages/admin/billing/` and update all import paths in `router/index.js` |