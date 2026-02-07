export const dailyReport = {
  report_date: "2026-02-03",
  property_id: 1,
  property_name: "Palm Guesthouse Phnom Penh",

  summary: {
    total_rooms: 32,
    available_rooms: 10,
    occupied_rooms: 18,
    cleaning_rooms: 3,
    maintenance_rooms: 1,
    occupancy_rate: 56.25,
  },

  revenue: {
    room_revenue: 1240.00,
    extra_charges: 185.00,
    tax_amount: 72.50,
    discounts: 50.00,
    total_revenue: 1447.50,
  },

  payments_breakdown: [
    {
      payment_method: "cash",
      transaction_count: 6,
      total_amount: 620.00,
      currency: "USD",
    },
    {
      payment_method: "aba",
      transaction_count: 4,
      total_amount: 480.00,
      currency: "USD",
    },
    {
      payment_method: "credit_card",
      transaction_count: 3,
      total_amount: 347.50,
      currency: "USD",
    },
  ],

  arrivals_today: [
    {
      reservation_number: "RES20260203-001",
      guest_name: "David Chan",
      room_number: "203",
      room_type: "Deluxe King",
      check_in_at: "2026-02-03 14:10:00",
      adults: 2,
      children: 0,
      status: "checked_in",
    },
    {
      reservation_number: "RES20260203-002",
      guest_name: "Sokha Dara",
      room_number: "105",
      room_type: "Standard Double",
      check_in_at: "2026-02-03 13:45:00",
      adults: 1,
      children: 1,
      status: "checked_in",
    },
  ],

  departures_today: [
    {
      reservation_number: "RES20260201-004",
      guest_name: "John Smith",
      room_number: "302",
      total_amount: 320.00,
      amount_paid: 320.00,
      balance_due: 0,
      invoice_status: "paid",
      check_out_at: "2026-02-03 12:00:00",
    },
  ],

  housekeeping_status: [
    {
      room_number: "101",
      status: "cleaning",
      last_cleaned_at: "2026-02-03 09:20:00",
    },
    {
      room_number: "305",
      status: "maintenance",
      last_cleaned_at: null,
    },
  ],

  daily_closing: {
    closing_number: "DC-20260203-001",
    opening_cash: 200.00,
    closing_cash: 1450.00,
    expected_cash: 1470.00,
    cash_difference: -20.00,
    total_sales: 1447.50,
    total_refunds: 0,
    closed_at: "2026-02-03 22:30:00",
    status: "closed",
  }
}
