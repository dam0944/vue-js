export const deposits = [
  {
    booking_id: 101,
    booking_number: "BK20260131-001-000101",
    property_id: 1,

    primary_guest_id: 1,
    guest_name: "Sok Dara",
    phone: "+855 12 345 678",

    booking_source: "walk_in",
    status: "confirmed",

    deposit_amount: 100.00,
    deposit_paid: 100.00,
    deposit_currency: "USD",

    booking_date: "2026-01-31 10:20:00",
    notes: "Deposit for 2-night stay (Room 201).",

    created_at: "2026-01-31 10:20:00",
    updated_at: "2026-01-31 10:20:00"
  },
  {
    booking_id: 102,
    booking_number: "BK20260130-001-000102",
    property_id: 1,

    primary_guest_id: 2,
    guest_name: "John Smith",
    phone: "+855 88 222 333",

    booking_source: "online",
    status: "pending",

    deposit_amount: 200.00,
    deposit_paid: 50.00,
    deposit_currency: "USD",

    booking_date: "2026-01-30 15:05:00",
    notes: "Partial deposit paid via ABA transfer.",

    created_at: "2026-01-30 15:05:00",
    updated_at: "2026-01-30 15:05:00"
  },
  {
    booking_id: 103,
    booking_number: "BK20260129-001-000103",
    property_id: 1,

    primary_guest_id: 3,
    guest_name: "Marie Dupont",
    phone: "+855 97 555 444",

    booking_source: "email",
    status: "cancelled",

    deposit_amount: 150.00,
    deposit_paid: 150.00,
    deposit_currency: "USD",

    booking_date: "2026-01-29 11:45:00",
    notes: "Deposit will be refunded due to cancellation.",

    created_at: "2026-01-29 11:45:00",
    updated_at: "2026-01-29 11:45:00"
  },
  {
    booking_id: 104,
    booking_number: "BK20260128-001-000104",
    property_id: 1,

    primary_guest_id: 4,
    guest_name: "Chantha Rith",
    phone: "+855 10 999 888",

    booking_source: "phone",
    status: "checked_in",

    deposit_amount: 80.00,
    deposit_paid: 80.00,
    deposit_currency: "USD",

    booking_date: "2026-01-28 09:10:00",
    notes: "Deposit collected at front desk.",

    created_at: "2026-01-28 09:10:00",
    updated_at: "2026-01-28 09:10:00"
  },
  {
    booking_id: 105,
    booking_number: "BK20260127-001-000105",
    property_id: 1,

    primary_guest_id: 5,
    guest_name: "Li Wei", 
    phone: "+855 15 123 321",

    booking_source: "walk_in",
    status: "confirmed",

    deposit_amount: 300000,
    deposit_paid: 300000,
    deposit_currency: "KHR",

    booking_date: "2026-01-27 13:30:00",
    notes: "Deposit paid in Khmer riel.",

    created_at: "2026-01-27 13:30:00",
    updated_at: "2026-01-27 13:30:00"
  }
]
