// src/data/reservationsNoShows.js

export const reservationsNoShowsData = {
  property: {
    property_id: 1,
    name: "Family Guesthouse",
    city: "Phnom Penh",
    currency: "USD",
  },

  noShows: [
    {
      reservation_id: 9001,
      reservation_number: "RES20260121",

      booking_source: "phone",

      guest: {
        guest_id: 301,
        name: "Sok Vibol",
        phone: "012 888 777",
        nationality: "Cambodian",
      },

      room: {
        room_id: 11,
        room_number: "101",
        floor: 1,
        room_type: "Simple",
        beds: 1,
      },

      stay: {
        booking_type: "nightly",
        check_in: "2026-01-22 14:00",
        check_out: "2026-01-24 12:00",
        nights_or_hours: 2,
      },

      pricing: {
        total_room_charges: 36,
        deposit_amount: 10,
        paid_amount: 10,
        forfeited_amount: 10, // kept by guesthouse
      },

      no_show: {
        marked_at: "2026-01-22 19:30",
        marked_by: "Receptionist",
        reason: "Guest did not arrive before 6pm",
      },
    },

    {
      reservation_id: 9002,
      reservation_number: "RES20260122",

      booking_source: "walk_in",

      guest: {
        guest_id: 302,
        name: "Jennifer Jones",
        phone: "077 555 444",
        nationality: "Australian",
      },

      room: {
        room_id: 13,
        room_number: "103",
        floor: 1,
        room_type: "VIP",
        beds: 2,
      },

      stay: {
        booking_type: "nightly",
        check_in: "2026-01-23 14:00",
        check_out: "2026-01-25 12:00",
        nights_or_hours: 2,
      },

      pricing: {
        total_room_charges: 100,
        deposit_amount: 20,
        paid_amount: 20,
        forfeited_amount: 20,
      },

      no_show: {
        marked_at: "2026-01-23 20:15",
        marked_by: "Manager",
        reason: "No contact from guest",
      },
    },

    {
      reservation_id: 9003,
      reservation_number: "RES20260123",

      booking_source: "other",

      guest: {
        guest_id: 303,
        name: "Linda Chen",
        phone: "098 222 111",
        nationality: "Chinese",
      },

      room: {
        room_id: 22,
        room_number: "202",
        floor: 2,
        room_type: "Simple",
        beds: 2,
      },

      stay: {
        booking_type: "hourly",
        check_in: "2026-01-23 18:00",
        check_out: "2026-01-23 21:00",
        nights_or_hours: 3,
      },

      pricing: {
        total_room_charges: 18,
        deposit_amount: 0,
        paid_amount: 0,
        forfeited_amount: 0,
      },

      no_show: {
        marked_at: "2026-01-23 19:05",
        marked_by: "Receptionist",
        reason: "Guest never arrived",
      },
    },

    {
      reservation_id: 9004,
      reservation_number: "RES20260124",

      booking_source: "phone",

      guest: {
        guest_id: 304,
        name: "Michael Tan",
        phone: "015 333 222",
        nationality: "Singaporean",
      },

      room: {
        room_id: 31,
        room_number: "301",
        floor: 3,
        room_type: "VIP",
        beds: 2,
      },

      stay: {
        booking_type: "nightly",
        check_in: "2026-01-24 14:00",
        check_out: "2026-01-27 12:00",
        nights_or_hours: 3,
      },

      pricing: {
        total_room_charges: 150,
        deposit_amount: 30,
        paid_amount: 30,
        forfeited_amount: 30,
      },

      no_show: {
        marked_at: "2026-01-24 21:40",
        marked_by: "Receptionist",
        reason: "Phone unreachable",
      },
    },
  ],
}
