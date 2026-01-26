    // src/data/reservationsCalendar.js

export const reservationsCalendarData = {
  property: {
    property_id: 1,
    name: "Family Guesthouse",
    city: "Phnom Penh",
    currency: "USD",
  },

  // Rooms shown on calendar
  rooms: [
    { room_id: 11, room_number: "101", floor: 1, type: "Simple", beds: 1 },
    { room_id: 12, room_number: "102", floor: 1, type: "Simple", beds: 2 },
    { room_id: 13, room_number: "103", floor: 1, type: "VIP", beds: 2 },

    { room_id: 21, room_number: "201", floor: 2, type: "VIP", beds: 1 },
    { room_id: 22, room_number: "202", floor: 2, type: "Simple", beds: 2 },
    { room_id: 23, room_number: "203", floor: 2, type: "Simple", beds: 1 },

    { room_id: 31, room_number: "301", floor: 3, type: "VIP", beds: 2 },
    { room_id: 32, room_number: "302", floor: 3, type: "Simple", beds: 1 },
    { room_id: 33, room_number: "303", floor: 3, type: "Simple", beds: 2 },
  ],

  // Calendar range (for demo UI)
  calendarRange: {
    start: "2026-01-23",
    end: "2026-01-30",
  },

  // Reservations displayed as bars on calendar
  reservations: [
    {
      reservation_id: 6001,
      reservation_number: "RES20260101",
      guest: {
        guest_id: 101,
        name: "Sok Dara",
        phone: "012 345 678",
      },
      room_id: 11,
      booking_type: "hourly",
      check_in: "2026-01-23 18:00",
      check_out: "2026-01-23 21:00",
      status: "checked_in",
      color: "#16a34a",
    },

    {
      reservation_id: 6002,
      reservation_number: "RES20260102",
      guest: {
        guest_id: 102,
        name: "Linda Chen",
        phone: "098 222 111",
      },
      room_id: 13,
      booking_type: "nightly",
      check_in: "2026-01-23 14:00",
      check_out: "2026-01-25 12:00",
      status: "confirmed",
      color: "#2563eb", // blue
    },

    {
      reservation_id: 6003,
      reservation_number: "RES20260103",
      guest: {
        guest_id: 103,
        name: "Jennifer Jones",
        phone: "077 555 444",
      },
      room_id: 22,
      booking_type: "nightly",
      check_in: "2026-01-24 14:00",
      check_out: "2026-01-27 12:00",
      status: "reserved",
      color: "#f59e0b", // amber
    },

    {
      reservation_id: 6004,
      reservation_number: "RES20260104",
      guest: {
        guest_id: 104,
        name: "Michael Tan",
        phone: "015 333 222",
      },
      room_id: 31,
      booking_type: "nightly",
      check_in: "2026-01-26 14:00",
      check_out: "2026-01-28 12:00",
      status: "confirmed",
      color: "#8b5cf6", // purple (VIP feel)
    },

    {
      reservation_id: 6005,
      reservation_number: "RES20260105",
      guest: {
        guest_id: 105,
        name: "Srey Mom",
        phone: "011 222 999",
      },
      room_id: 12,
      booking_type: "hourly",
      check_in: "2026-01-25 13:00",
      check_out: "2026-01-25 17:00",
      status: "checked_out",
      color: "#64748b", // gray (past)
    },
  ],
};
