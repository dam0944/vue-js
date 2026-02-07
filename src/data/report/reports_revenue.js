// Static data that follows: payments + invoices + v_revenue_summary

export const reports_revenue = {
  summary: {
    property_id: 1,
    property_name: "Palm Guesthouse",

    total_revenue_usd: 8425.5,
    total_revenue_khr: 12450000,

    total_transactions: 86,

    cash_total: 2150.5,
    card_total: 3620.0,
    aba_total: 1855.0,
    wing_total: 800.0,
  },

  // follows v_revenue_summary view
  daily_revenue: [
    {
      payment_date: "2026-02-01",
      payment_method: "cash",
      transaction_count: 12,
      total_amount: 820.0,
      currency: "USD",
    },
    {
      payment_date: "2026-02-01",
      payment_method: "credit_card",
      transaction_count: 6,
      total_amount: 640.0,
      currency: "USD",
    },
    {
      payment_date: "2026-02-01",
      payment_method: "aba",
      transaction_count: 4,
      total_amount: 380.0,
      currency: "USD",
    },
    {
      payment_date: "2026-02-02",
      payment_method: "cash",
      transaction_count: 10,
      total_amount: 760.0,
      currency: "USD",
    },
    {
      payment_date: "2026-02-02",
      payment_method: "wing",
      transaction_count: 3,
      total_amount: 210.0,
      currency: "USD",
    },
    {
      payment_date: "2026-02-03",
      payment_method: "credit_card",
      transaction_count: 9,
      total_amount: 980.0,
      currency: "USD",
    },
  ],

  // revenue by method (used for chart / summary cards)
  revenue_by_method: [
    { method: "cash", total: 2150.5, currency: "USD" },
    { method: "credit_card", total: 3620.0, currency: "USD" },
    { method: "aba", total: 1855.0, currency: "USD" },
    { method: "wing", total: 800.0, currency: "USD" },
  ],

  // revenue by room type (joins payments → invoices → reservations → room_types)
  revenue_by_room_type: [
    {
      type_code: "STD-DBL",
      type_name: "Standard Double",
      room_class: "standard",
      total_revenue: 2840.0,
      currency: "USD",
    },
    {
      type_code: "DLX-KNG",
      type_name: "Deluxe King",
      room_class: "deluxe",
      total_revenue: 3610.0,
      currency: "USD",
    },
    {
      type_code: "STE-KNG",
      type_name: "Suite King",
      room_class: "suite",
      total_revenue: 1975.5,
      currency: "USD",
    },
  ],
}
