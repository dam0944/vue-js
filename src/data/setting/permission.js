export const permission = [
  // Dashboard
  { key: "dashboard.view", label: "View Dashboard", module: "Dashboard" },

  // Rooms
  { key: "rooms.view", label: "View Rooms", module: "Rooms" },
  { key: "rooms.edit", label: "Edit Rooms", module: "Rooms" },
  { key: "rooms.maintenance", label: "Room Maintenance", module: "Rooms" },

  // Reservations
  { key: "reservations.view", label: "View Reservations", module: "Reservations" },
  { key: "reservations.create", label: "Create Reservation", module: "Reservations" },
  { key: "reservations.edit", label: "Edit Reservation", module: "Reservations" },

  // Guests
  { key: "guests.view", label: "View Guests", module: "Guests" },
  { key: "guests.edit", label: "Edit Guests", module: "Guests" },

  // POS
  { key: "pos.use", label: "Use POS / Cashier", module: "POS" },

  // Billing
  { key: "billing.view", label: "View Billing", module: "Billing" },
  { key: "billing.invoices", label: "Manage Invoices", module: "Billing" },
  { key: "billing.payments", label: "Process Payments", module: "Billing" },
  { key: "billing.refunds", label: "Process Refunds", module: "Billing" },  

  // Housekeeping
  { key: "housekeeping.view", label: "View Tasks", module: "Housekeeping" },
  { key: "housekeeping.assign", label: "Assign Tasks", module: "Housekeeping" },
  { key: "housekeeping.update_status", label: "Update Task Status", module: "Housekeeping" },

  // Reports
  { key: "reports.view", label: "View Reports", module: "Reports" },
]
