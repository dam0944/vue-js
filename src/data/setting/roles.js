export const roles = [
  {
    role_id: 1,
    role_name: "Owner",
    role_code: "OWNER",
    description: "Full system access to all modules and settings",
    is_active: true,
    created_at: "2026-01-01 08:00:00",
    permissions: ["*"], // all permissions
  },

  {
    role_id: 2,
    role_name: "Manager",
    role_code: "MANAGER",
    description: "Manage operations, reports, rooms, guests, and billing",
    is_active: true,
    created_at: "2026-01-02 09:00:00",
    permissions: [
      "dashboard.view",
      "rooms.view", "rooms.edit",
      "reservations.view", "reservations.create", "reservations.edit",
      "guests.view", "guests.edit",
      "billing.view", "billing.payments",
      "housekeeping.view", "housekeeping.assign",
      "reports.view",
    ],
  },

  {
    role_id: 3,
    role_name: "Receptionist",
    role_code: "RECEPTION",
    description: "Handle check-in/out, bookings, guests, and POS",
    is_active: true,
    created_at: "2026-01-03 09:30:00",
    permissions: [
      "dashboard.view",
      "frontdesk.view",
      "reservations.create", "reservations.view",
      "guests.view",
      "pos.use",
      "billing.payments",
    ],
  },

  {
    role_id: 4,
    role_name: "Housekeeping Staff",
    role_code: "HOUSEKEEPING",
    description: "Manage cleaning tasks and room inspections",
    is_active: true,
    created_at: "2026-01-04 10:00:00",
    permissions: [
      "housekeeping.view",
      "housekeeping.update_status",
      "rooms.view",
    ],
  },

  {
    role_id: 5,
    role_name: "Accountant",
    role_code: "ACCOUNT",
    description: "Handle invoices, payments, deposits, and reports",
    is_active: true,
    created_at: "2026-01-05 11:00:00",
    permissions: [
      "billing.view",
      "billing.invoices",
      "billing.payments",
      "billing.refunds",
      "reports.view",
    ],
  },

  {
    role_id: 6,
    role_name: "Maintenance",
    role_code: "MAINT",
    description: "Room maintenance and issue tracking",
    is_active: true,
    created_at: "2026-01-06 12:00:00",
    permissions: [
      "rooms.maintenance",
      "rooms.view",
    ],
  },
]
