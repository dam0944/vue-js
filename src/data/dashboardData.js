export const dashboardData = {
  summary: {
    total_rooms: 48,
    occupied_rooms: 36,
    available_rooms: 9,
    maintenance_rooms: 3,
    occupancy_rate: "75.0",

    inhouse_guests: 54,
    checkins_today: 8,
    checkouts_today: 6,
    arrivals_today: 10,

    today_revenue_usd: "1845.50",
    month_revenue_usd: "28450.75",

    pending_housekeeping_tasks: 7,
    pending_maintenance_tasks: 2,
  },
revenue_chart: {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  values: [3200, 4100, 3800, 5200, 6100, 7000],
},

  recent_checkins: [
    {
      reservation_no: "RSV-240201-001",
      guest_name: "John Smith",
      room_number: "A101",
      checkin_time: "2026-02-03 13:25:00",
      nights: 3,
      status: "checked_in",
    },
    {
      reservation_no: "RSV-240201-002",
      guest_name: "Sok Dara",
      room_number: "B203",
      checkin_time: "2026-02-03 14:10:00",
      nights: 2,
      status: "checked_in",
    },
    {
      reservation_no: "RSV-240201-003",
      guest_name: "Maria Garcia",
      room_number: "A110",
      checkin_time: "2026-02-03 15:05:00",
      nights: 5,
      status: "checked_in",
    },
  ],

  recent_payments: [
    {
      payment_no: "PAY-00921",
      guest_name: "John Smith",
      method: "credit_card",
      amount: "320.00",
      time: "2026-02-03 13:40:00",
    },
    {
      payment_no: "PAY-00922",
      guest_name: "Sok Dara",
      method: "cash",
      amount: "180.00",
      time: "2026-02-03 14:35:00",
    },
    {
      payment_no: "PAY-00923",
      guest_name: "Maria Garcia",
      method: "aba",
      amount: "560.50",
      time: "2026-02-03 15:22:00",
    },
  ],

  room_status_overview: [
    { status: "occupied", count: 36 },
    { status: "available", count: 9 },
    { status: "maintenance", count: 3 },
  ],

  housekeeping_overview: [
    {
      task_id: 501,
      room_number: "A103",
      type: "cleaning",
      priority: "high",
      status: "pending",
    },
    {
      task_id: 502,
      room_number: "B201",
      type: "inspection",
      priority: "normal",
      status: "in_progress",
    },
    {
      task_id: 503,
      room_number: "A108",
      type: "deep_clean",
      priority: "urgent",
      status: "pending",
    },
  ],

  revenue_last_7_days: [
    { date: "2026-01-28", amount: "2450.00" },
    { date: "2026-01-29", amount: "1980.50" },
    { date: "2026-01-30", amount: "2210.75" },
    { date: "2026-01-31", amount: "2540.00" },
    { date: "2026-02-01", amount: "2755.20" },
    { date: "2026-02-02", amount: "2900.00" },
    { date: "2026-02-03", amount: "1845.50" },
  ],

  top_room_types: [
    {
      room_type: "Deluxe Double",
      occupied: 12,
      total: 14,
      occupancy_rate: "85.7",
    },
    {
      room_type: "Standard Twin",
      occupied: 9,
      total: 12,
      occupancy_rate: "75.0",
    },
    {
      room_type: "Family Suite",
      occupied: 6,
      total: 8,
      occupancy_rate: "75.0",
    },
  ],
}
