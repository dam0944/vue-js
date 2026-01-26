// src/data/frontdeskInHouse.js

export const frontdeskInHouseData = {
  property: {
    property_id: 1,
    property_name: "Family Guesthouse",
    city: "Phnom Penh",
    currency: "USD",
  },

  // list of guests currently checked_in (reservations.status = 'checked_in')
  inHouse: [
    {
      booking: {
        booking_id: 9101,
        booking_number: "BK20260101",
        booking_source: "walk_in",
        status: "checked_in",
      },

      guest: {
        guest_id: 101,
        guest_number: "G202600101",
        first_name: "Sok",
        last_name: "Dara",
        phone: "012 345 678",
        nationality: "Cambodian",
        id_type: "national_id",
        id_number: "0123456789",
        guest_type: "individual",
      },

      reservations: [
        {
          reservation_id: 7001,
          room_id: 11,
          room_number: "101",
          floor: 1,

          room_type: {
            room_type_id: 1,
            type_name: "Simple",
            bed_count: 1,
          },

          booking_type: "nightly",
          check_in_at: "2026-01-24 14:05",
          check_out_at: "2026-01-25 12:00",
          total_nights_or_hours: 1,

          total_room_charges: 18,
          status: "checked_in",
        },
      ],

      payment: {
        paid_amount: 18,
        balance_amount: 0,
        payment_method: "Cash USD",
        status: "completed",
      },

      notes: "",
    },

    {
      booking: {
        booking_id: 9102,
        booking_number: "BK20260102",
        booking_source: "phone",
        status: "checked_in",
      },

      guest: {
        guest_id: 102,
        guest_number: "G202600102",
        first_name: "Linda",
        last_name: "Chen",
        phone: "098 222 111",
        nationality: "Chinese",
        id_type: "passport",
        id_number: "EJ223344",
        guest_type: "vip",
      },

      reservations: [
        {
          reservation_id: 7002,
          room_id: 31,
          room_number: "301",
          floor: 3,

          room_type: {
            room_type_id: 4,
            type_name: "VIP",
            bed_count: 2,
          },

          booking_type: "nightly",
          check_in_at: "2026-01-23 14:00",
          check_out_at: "2026-01-26 12:00",
          total_nights_or_hours: 3,

          total_room_charges: 150,
          status: "checked_in",
        },
      ],

      payment: {
        paid_amount: 50,
        balance_amount: 100,
        payment_method: "ABA KHQR",
        status: "partial",
      },

      notes: "Late check-out requested",
    },

    {
      booking: {
        booking_id: 9103,
        booking_number: "BK20260103",
        booking_source: "walk_in",
        status: "checked_in",
      },

      guest: {
        guest_id: 103,
        guest_number: "G202600103",
        first_name: "Jennifer",
        last_name: "Jones",
        phone: "077 555 444",
        nationality: "Australian",
        id_type: "passport",
        id_number: "AU998877",
        guest_type: "individual",
      },

      reservations: [
        {
          reservation_id: 7003,
          room_id: 21,
          room_number: "201",
          floor: 2,

          room_type: {
            room_type_id: 3,
            type_name: "VIP",
            bed_count: 1,
          },

          booking_type: "hourly",
          check_in_at: "2026-01-24 16:10",
          check_out_at: "2026-01-24 19:10",
          total_nights_or_hours: 3,

          total_room_charges: 27,
          status: "checked_in",
        },
      ],

      payment: {
        paid_amount: 0,
        balance_amount: 27,
        payment_method: "Cash USD",
        status: "pending",
      },

      notes: "",
    },
  ],
}
