export const monthlyReport = {
  property_id: 1,
  property_name: "Palm Guesthouse",
  month: "2026-02",

  summary: {
    total_rooms: 42,
    average_occupancy_rate: 78.4,   // derived from rooms + reservations
    total_guests: 312,              // guests stayed this month
    total_bookings: 186,            // from bookings/reservations
    total_nights_sold: 1280,
  },

  revenue: {
    room_revenue: 42850.00,
    extra_charges: 3850.00,
    tax_amount: 2140.00,
    discounts: 1200.00,
    total_revenue: 47640.00,
    currency: "USD",
  },

  payments_breakdown: [
    {
      payment_method: "cash",
      transaction_count: 82,
      total_amount: 12450.00,
      currency: "USD",
    },
    {
      payment_method: "aba",
      transaction_count: 54,
      total_amount: 18320.00,
      currency: "USD",
    },
    {
      payment_method: "wing",
      transaction_count: 26,
      total_amount: 5220.00,
      currency: "USD",
    },
    {
      payment_method: "credit_card",
      transaction_count: 24,
      total_amount: 11650.00,
      currency: "USD",
    },
  ],

  room_type_performance: [
    {
      room_type_id: 1,
      type_name: "Standard Double",
      nights_sold: 520,
      revenue: 15600.00,
      occupancy_rate: 82.1,
    },
    {
      room_type_id: 2,
      type_name: "Deluxe King",
      nights_sold: 420,
      revenue: 18900.00,
      occupancy_rate: 86.4,
    },
    {
      room_type_id: 3,
      type_name: "Suite",
      nights_sold: 210,
      revenue: 8350.00,
      occupancy_rate: 71.2,
    },
    {
      room_type_id: 4,
      type_name: "Economy Twin",
      nights_sold: 130,
      revenue: 5000.00,
      occupancy_rate: 60.8,
    },
  ],

  daily_occupancy_trend: [
    { date: "2026-02-01", occupancy_rate: 75 },
    { date: "2026-02-05", occupancy_rate: 82 },
    { date: "2026-02-10", occupancy_rate: 88 },
    { date: "2026-02-15", occupancy_rate: 72 },
    { date: "2026-02-20", occupancy_rate: 91 },
    { date: "2026-02-25", occupancy_rate: 79 },
    { date: "2026-02-28", occupancy_rate: 84 },
  ],

  top_guests: [
    {
      guest_id: 12,
      guest_name: "Sok Dara",
      total_stays: 6,
      total_nights: 18,
      total_spent: 1450.00,
      loyalty_tier: "gold",
    },
    {
      guest_id: 25,
      guest_name: "Maria Chen",
      total_stays: 4,
      total_nights: 14,
      total_spent: 1320.00,
      loyalty_tier: "silver",
    },
    {
      guest_id: 33,
      guest_name: "John Smith",
      total_stays: 5,
      total_nights: 16,
      total_spent: 1285.00,
      loyalty_tier: "silver",
    },
  ],

  housekeeping_summary: {
    total_cleanings: 410,
    maintenance_tasks: 38,
    deep_cleans: 22,
    inspections: 65,
  },

  daily_closing_summary: [
    {
      business_date: "2026-02-10",
      total_sales: 1980.00,
      closing_cash: 720.00,
      cash_difference: 0,
      status: "closed",
    },
    {
      business_date: "2026-02-18",
      total_sales: 2240.00,
      closing_cash: 810.00,
      cash_difference: -5.00,
      status: "reconciled",
    },
    {
      business_date: "2026-02-26",
      total_sales: 2105.00,
      closing_cash: 760.00,
      cash_difference: 3.00,
      status: "closed",
    },
  ],
}
