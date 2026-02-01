// src/data/invoices.js

export const invoices = [
  {
    invoice_id: 1,
    property_id: 1,
    invoice_number: "INV20260131-001-000001",
    booking_id: 101,
    reservation_id: 201,

    subtotal: 420.00,
    tax_rate: 10.00,
    tax_amount: 42.00,
    discount_amount: 20.00,
    discount_reason: "Loyalty discount",
    total_amount: 442.00,
    amount_paid: 442.00,
    balance_due: 0.00,

    currency: "USD",
    status: "paid",

    issued_at: "2026-01-31 10:20:00",
    due_date: "2026-02-02",
    paid_at: "2026-01-31 10:45:00",

    notes: "Guest paid in full at checkout",
    created_by: 3,
    updated_at: "2026-01-31 10:45:00"
  },

  {
    invoice_id: 2,
    property_id: 1,
    invoice_number: "INV20260131-001-000002",
    booking_id: 102,
    reservation_id: 202,

    subtotal: 300.00,
    tax_rate: 10.00,
    tax_amount: 30.00,
    discount_amount: 0.00,
    discount_reason: null,
    total_amount: 330.00,
    amount_paid: 150.00,
    balance_due: 180.00,

    currency: "USD",
    status: "partially_paid",

    issued_at: "2026-01-31 14:10:00",
    due_date: "2026-02-03",
    paid_at: null,

    notes: "Partial payment by ABA transfer",
    created_by: 2,
    updated_at: "2026-01-31 14:30:00"
  },

  {
    invoice_id: 3,
    property_id: 1,
    invoice_number: "INV20260131-001-000003",
    booking_id: 103,
    reservation_id: 203,

    subtotal: 150.00,
    tax_rate: 10.00,
    tax_amount: 15.00,
    discount_amount: 0.00,
    discount_reason: null,
    total_amount: 165.00,
    amount_paid: 0.00,
    balance_due: 165.00,

    currency: "USD",
    status: "pending",

    issued_at: "2026-01-31 16:05:00",
    due_date: "2026-02-04",
    paid_at: null,

    notes: "Awaiting payment at checkout",
    created_by: 4,
    updated_at: "2026-01-31 16:05:00"
  },

  {
    invoice_id: 4,
    property_id: 1,
    invoice_number: "INV20260130-001-000004",
    booking_id: 104,
    reservation_id: 204,

    subtotal: 600.00,
    tax_rate: 10.00,
    tax_amount: 60.00,
    discount_amount: 50.00,
    discount_reason: "Promo code WATERFEST",
    total_amount: 610.00,
    amount_paid: 610.00,
    balance_due: 0.00,

    currency: "USD",
    status: "paid",

    issued_at: "2026-01-30 11:00:00",
    due_date: "2026-02-01",
    paid_at: "2026-01-30 11:30:00",

    notes: "Promo applied successfully",
    created_by: 2,
    updated_at: "2026-01-30 11:30:00"
  },

  {
    invoice_id: 5,
    property_id: 1,
    invoice_number: "INV20260129-001-000005",
    booking_id: 105,
    reservation_id: 205,

    subtotal: 220.00,
    tax_rate: 10.00,
    tax_amount: 22.00,
    discount_amount: 0.00,
    discount_reason: null,
    total_amount: 242.00,
    amount_paid: 0.00,
    balance_due: 242.00,

    currency: "USD",
    status: "draft",

    issued_at: "2026-01-29 09:15:00",
    due_date: "2026-02-02",
    paid_at: null,

    notes: "Draft invoice before checkout",
    created_by: 3,
    updated_at: "2026-01-29 09:15:00"
  }
];
