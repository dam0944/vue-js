export const reports_occupancy = {
  property_id: 1,
  property_name: "Palm Guesthouse",
  report_month: "2026-02",

  summary: {
    total_rooms: 48,
    total_room_nights: 48 * 28,          // Feb 2026 (28 days)
    occupied_room_nights: 894,
    available_room_nights: 1344,
    occupancy_rate: 66.52,              // (occupied / total) * 100
  },

  // Daily occupancy trend (from reservations / availability cache)
  daily_occupancy: [
    { date: "2026-02-01", occupied: 30, available: 48, rate: 62.5 },
    { date: "2026-02-02", occupied: 34, available: 48, rate: 70.8 },
    { date: "2026-02-03", occupied: 28, available: 48, rate: 58.3 },
    { date: "2026-02-04", occupied: 36, available: 48, rate: 75.0 },
    { date: "2026-02-05", occupied: 39, available: 48, rate: 81.2 },
    { date: "2026-02-06", occupied: 42, available: 48, rate: 87.5 },
    { date: "2026-02-07", occupied: 41, available: 48, rate: 85.4 },
    { date: "2026-02-08", occupied: 33, available: 48, rate: 68.7 },
    { date: "2026-02-09", occupied: 29, available: 48, rate: 60.4 },
    { date: "2026-02-10", occupied: 31, available: 48, rate: 64.5 },
    { date: "2026-02-11", occupied: 37, available: 48, rate: 77.0 },
    { date: "2026-02-12", occupied: 40, available: 48, rate: 83.3 },
    { date: "2026-02-13", occupied: 43, available: 48, rate: 89.5 },
    { date: "2026-02-14", occupied: 44, available: 48, rate: 91.6 },
    { date: "2026-02-15", occupied: 38, available: 48, rate: 79.1 },
    { date: "2026-02-16", occupied: 35, available: 48, rate: 72.9 },
    { date: "2026-02-17", occupied: 30, available: 48, rate: 62.5 },
    { date: "2026-02-18", occupied: 33, available: 48, rate: 68.7 },
    { date: "2026-02-19", occupied: 36, available: 48, rate: 75.0 },
    { date: "2026-02-20", occupied: 41, available: 48, rate: 85.4 },
    { date: "2026-02-21", occupied: 45, available: 48, rate: 93.7 },
    { date: "2026-02-22", occupied: 39, available: 48, rate: 81.2 },
    { date: "2026-02-23", occupied: 34, available: 48, rate: 70.8 },
    { date: "2026-02-24", occupied: 32, available: 48, rate: 66.6 },
    { date: "2026-02-25", occupied: 36, available: 48, rate: 75.0 },
    { date: "2026-02-26", occupied: 38, available: 48, rate: 79.1 },
    { date: "2026-02-27", occupied: 42, available: 48, rate: 87.5 },
    { date: "2026-02-28", occupied: 44, available: 48, rate: 91.6 },
  ],

  // Occupancy by room type (very important for management)
  room_type_occupancy: [
    {
      room_type_id: 1,
      type_name: "Standard Double",
      total_rooms: 20,
      occupied_nights: 390,
      occupancy_rate: 69.6,
    },
    {
      room_type_id: 2,
      type_name: "Deluxe King",
      total_rooms: 14,
      occupied_nights: 315,
      occupancy_rate: 80.3,
    },
    {
      room_type_id: 3,
      type_name: "Family Suite",
      total_rooms: 8,
      occupied_nights: 132,
      occupancy_rate: 58.9,
    },
    {
      room_type_id: 4,
      type_name: "Economy Twin",
      total_rooms: 6,
      occupied_nights: 57,
      occupancy_rate: 33.9,
    },
  ],

  // Room status distribution (from rooms table)
  current_room_status: {
    available: 18,
    occupied: 25,
    cleaning: 3,
    maintenance: 1,
    out_of_order: 1,
  },
}
