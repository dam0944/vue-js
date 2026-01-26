/*

reservations
JOIN guests
JOIN rooms
JOIN room_types
LEFT JOIN payments
WHERE reservations.status = 'cancelled'

*/

export const reservationsCancellationsData = {
  property: {
    property_id: 1,
    name: "Family Guesthouse",
    city: "Phnom Penh",
    currency: "USD",
  },

  cancellations: [
    {
      reservation_id: 8101,
      reservation_number: "RES20260111",

      booking_source: "phone",

      guest: {
        guest_id: 201,
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
        check_in: "2026-01-28 14:00",
        check_out: "2026-01-30 12:00",
        nights_or_hours: 2,
      },

      pricing: {
        total_room_charges: 36,
        paid_amount: 10,
        refund_amount: 10,
      },

      cancellation: {
        cancelled_at: "2026-01-27 10:22",
        cancelled_by: "Receptionist",
        reason: "Guest changed travel plan",
      },
    },

    {
      reservation_id: 8102,
      reservation_number: "RES20260112",

      booking_source: "walk_in",

      guest: {
        guest_id: 202,
        name: "Linda Chen",
        phone: "098 222 111",
        nationality: "Chinese",
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
        check_in: "2026-01-26 14:00",
        check_out: "2026-01-29 12:00",
        nights_or_hours: 3,
      },

      pricing: {
        total_room_charges: 150,
        paid_amount: 50,
        refund_amount: 0, // deposit kept
      },

      cancellation: {
        cancelled_at: "2026-01-26 16:45",
        cancelled_by: "Manager",
        reason: "No show after 6pm",
      },
    },

    {
      reservation_id: 8103,
      reservation_number: "RES20260113",

      booking_source: "other",

      guest: {
        guest_id: 203,
        name: "Jennifer Jones",
        phone: "077 555 444",
        nationality: "Australian",
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
        check_in: "2026-01-25 18:00",
        check_out: "2026-01-25 21:00",
        nights_or_hours: 3,
      },

      pricing: {
        total_room_charges: 18,
        paid_amount: 0,
        refund_amount: 0,
      },

      cancellation: {
        cancelled_at: "2026-01-25 17:20",
        cancelled_by: "Receptionist",
        reason: "Guest arrived but did not like the room",
      },
    },

    {
      reservation_id: 8104,
      reservation_number: "RES20260114",

      booking_source: "phone",

      guest: {
        guest_id: 204,
        name: "Michael Tan",
        phone: "015 333 222",
        nationality: "Singaporean",
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
        check_in: "2026-01-24 14:00",
        check_out: "2026-01-26 12:00",
        nights_or_hours: 2,
      },

      pricing: {
        total_room_charges: 100,
        paid_amount: 30,
        refund_amount: 30,
      },

      cancellation: {
        cancelled_at: "2026-01-23 19:10",
        cancelled_by: "Receptionist",
        reason: "Guest cancelled before arrival",
      },
    },
  ],
}
