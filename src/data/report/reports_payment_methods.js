// Follows structure of: payments + v_revenue_summary

export const reports_payment_methods = {
  summary: {
    property_id: 1,
    property_name: "Palm Guesthouse",

    total_transactions: 124,
    total_revenue_usd: 12480.75,

    most_used_method: "cash",
    least_used_method: "wing",
  },

  // This follows v_revenue_summary style (date + method)
  daily_methods: [
    {
      payment_date: "2026-02-01",
      payment_method: "cash",
      transaction_count: 18,
      total_amount: 1420.0,
      currency: "USD",
    },
    {
      payment_date: "2026-02-01",
      payment_method: "credit_card",
      transaction_count: 10,
      total_amount: 980.0,
      currency: "USD",
    },
    {
      payment_date: "2026-02-01",
      payment_method: "aba",
      transaction_count: 6,
      total_amount: 540.0,
      currency: "USD",
    },
    {
      payment_date: "2026-02-02",
      payment_method: "cash",
      transaction_count: 15,
      total_amount: 1160.0,
      currency: "USD",
    },
    {
      payment_date: "2026-02-02",
      payment_method: "wing",
      transaction_count: 5,
      total_amount: 350.0,
      currency: "USD",
    },
    {
      payment_date: "2026-02-03",
      payment_method: "credit_card",
      transaction_count: 12,
      total_amount: 1240.0,
      currency: "USD",
    },
  ],

  // For charts / cards
  method_breakdown: [
    {
      payment_method: "cash",
      total_transactions: 52,
      total_amount: 4320.5,
      currency: "USD",
      percentage: 34.6,
    },
    {
      payment_method: "credit_card",
      total_transactions: 34,
      total_amount: 3980.0,
      currency: "USD",
      percentage: 31.9,
    },
    {
      payment_method: "aba",
      total_transactions: 24,
      total_amount: 2780.25,
      currency: "USD",
      percentage: 22.3,
    },
    {
      payment_method: "wing",
      total_transactions: 14,
      total_amount: 1400.0,
      currency: "USD",
      percentage: 11.2,
    },
  ],

  // For advanced table (joins payments → invoices → users)
  recent_transactions: [
    {
      payment_number: "PAY-20260201-001",
      invoice_number: "INV-20260201-002",
      payment_method: "cash",
      amount: 120.0,
      currency: "USD",
      processed_by: "Sok Dara",
      payment_date: "2026-02-01 09:15:00",
      status: "completed",
    },
    {
      payment_number: "PAY-20260201-003",
      invoice_number: "INV-20260201-005",
      payment_method: "credit_card",
      amount: 240.0,
      currency: "USD",
      processed_by: "Lina Chan",
      payment_date: "2026-02-01 11:42:00",
      status: "completed",
    },
    {
      payment_number: "PAY-20260202-002",
      invoice_number: "INV-20260202-001",
      payment_method: "aba",
      amount: 310.0,
      currency: "USD",
      processed_by: "Sok Dara",
      payment_date: "2026-02-02 14:03:00",
      status: "completed",
    },
  ],
}
