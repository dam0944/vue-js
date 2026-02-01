// src/data/payments.js
export const payments = [
  {
    payment_id: 1,
    property_id: 1,
    invoice_id: 1,
    payment_number: "PAY20260131-001-000001",

    amount: 442.0,
    payment_method: "cash", // cash, credit_card, debit_card, bank_transfer, aba, wing, true_money, pi_pay, other
    payment_currency: "USD",
    exchange_rate: 1.0,
    amount_in_base_currency: 442.0,

    reference_number: null,
    card_type: null,
    payment_date: "2026-01-31 10:45:00",

    status: "completed", // pending, completed, failed, refunded, cancelled
    notes: "Paid at checkout (cash).",

    processed_by: 3, // users.user_id
    created_at: "2026-01-31 10:45:00",
    updated_at: "2026-01-31 10:45:00"
  },

  {
    payment_id: 2,
    property_id: 1,
    invoice_id: 2,
    payment_number: "PAY20260131-001-000002",

    amount: 150.0,
    payment_method: "aba",
    payment_currency: "USD",
    exchange_rate: 1.0,
    amount_in_base_currency: 150.0,

    reference_number: "ABA-TRX-88412019",
    card_type: null,
    payment_date: "2026-01-31 14:30:00",

    status: "completed",
    notes: "Partial payment by ABA transfer.",

    processed_by: 2,
    created_at: "2026-01-31 14:30:00",
    updated_at: "2026-01-31 14:30:00"
  },

  {
    payment_id: 3,
    property_id: 1,
    invoice_id: 2,
    payment_number: "PAY20260201-001-000003",

    amount: 180.0,
    payment_method: "bank_transfer",
    payment_currency: "USD",
    exchange_rate: 1.0,
    amount_in_base_currency: 180.0,

    reference_number: "BANK-FT-20260201-9911",
    card_type: null,
    payment_date: "2026-02-01 09:10:00",

    status: "pending",
    notes: "Waiting bank confirmation.",

    processed_by: 2,
    created_at: "2026-02-01 09:10:00",
    updated_at: "2026-02-01 09:10:00"
  },

  {
    payment_id: 4,
    property_id: 1,
    invoice_id: 3,
    payment_number: "PAY20260201-001-000004",

    amount: 120000.0,
    payment_method: "cash",
    payment_currency: "KHR",
    exchange_rate: 4100.0,
    amount_in_base_currency: 29.27, // example conversion back to USD base if needed

    reference_number: null,
    card_type: null,
    payment_date: "2026-02-01 18:05:00",

    status: "completed",
    notes: "Cash received in KHR.",

    processed_by: 3,
    created_at: "2026-02-01 18:05:00",
    updated_at: "2026-02-01 18:05:00"
  },

  {
    payment_id: 5,
    property_id: 1,
    invoice_id: 4,
    payment_number: "PAY20260202-001-000005",

    amount: 330.0,
    payment_method: "credit_card",
    payment_currency: "USD",
    exchange_rate: 1.0,
    amount_in_base_currency: 330.0,

    reference_number: "VISA-8432-XXXX",
    card_type: "VISA",
    payment_date: "2026-02-02 11:20:00",

    status: "failed",
    notes: "Card declined by issuer.",

    processed_by: 2,
    created_at: "2026-02-02 11:20:00",
    updated_at: "2026-02-02 11:22:00"
  }
]
