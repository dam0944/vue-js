// src/data/frontdeskCheckin.js

export const frontdeskCheckinData = {
  today: "2026-01-25",

  // =========================
  // Rooms (rooms + room_types)
  // =========================
  rooms: [
    {
      room_id: 11,
      room_number: "101",
      floor: 1,
      status: "available",
      room_type: {
        room_type_id: 1,
        type_name: "Simple",
        bed_type: "1 Bed",
        base_price: 18,
      },
    },
    {
      room_id: 21,
      room_number: "201",
      floor: 2,
      status: "available",
      room_type: {
        room_type_id: 3,
        type_name: "VIP",
        bed_type: "2 Beds",
        base_price: 50,
      },
    },
  ],

  // =========================
  // BOOKINGS + RESERVATIONS
  // =========================
  checkinList: [
    {
      // ===== booking table =====
      booking: {
        booking_id: 9001,
        booking_number: "BK20260120",
        booking_source: "phone",
        status: "confirmed",
        booking_date: "2026-01-24 18:20:00",
      },

      // ===== guest table =====
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

      // ===== multiple reservations for this booking =====
      reservations: [
        {
          // reservations table
          reservation_id: 6001,
          reservation_number: "RES20260101",
          room_id: 21,
          room_number: "201",

          booking_type: "nightly",
          check_in_at: "2026-01-25 14:00:00",
          check_out_at: "2026-01-27 12:00:00",

          total_nights_or_hours: 2,
          room_rate_per_unit: 50,
          total_room_charges: 100,

          status: "confirmed",

          room_type: {
            type_name: "VIP",
            beds: 2,
          },
        },
      ],

      // ===== pricing summary (like invoice preview) =====
      pricing: {
        subtotal: 100,
        discount: 0,
        tax: 0,
        total: 100,
        paid_amount: 20,
        balance_amount: 80,
        deposit_amount: 20,
      },

      // ===== last payment (payments table) =====
      payment: {
        payment_method: "aba_khqr",
        reference_number: "KHQR-7788-AB",
        status: "partial",
      },

      notes: "Arriving late evening",
    },

    // ===================================================
    // Walk-in hourly example (guesthouse style)
    // ===================================================
    {
      booking: {
        booking_id: 9002,
        booking_number: "BK20260121",
        booking_source: "walk_in",
        status: "pending",
        booking_date: "2026-01-25 17:40:00",
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
          reservation_id: 6002,
          reservation_number: "RES20260102",
          room_id: 11,
          room_number: "101",

          booking_type: "hourly",
          check_in_at: "2026-01-25 18:00:00",
          check_out_at: "2026-01-25 21:00:00",

          total_nights_or_hours: 3,
          room_rate_per_unit: 4,
          total_room_charges: 12,

          status: "pending",

          room_type: {
            type_name: "Simple",
            beds: 1,
          },
        },
      ],

      pricing: {
        subtotal: 12,
        discount: 0,
        tax: 0,
        total: 12,
        paid_amount: 0,
        balance_amount: 12,
        deposit_amount: 0,
      },

      payment: {
        payment_method: "cash_usd",
        reference_number: "",
        status: "pending",
      },

      notes: "",
    },

    // ===================================================
    // Multi-room booking (very important case)
    // ===================================================
    {
      booking: {
        booking_id: 9003,
        booking_number: "BK20260122",
        booking_source: "other",
        status: "confirmed",
        booking_date: "2026-01-24 15:10:00",
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
          reservation_id: 6003,
          reservation_number: "RES20260103",
          room_id: 11,
          room_number: "101",
          booking_type: "nightly",
          check_in_at: "2026-01-25 14:00:00",
          check_out_at: "2026-01-26 12:00:00",
          total_nights_or_hours: 1,
          room_rate_per_unit: 18,
          total_room_charges: 18,
          status: "confirmed",
          room_type: { type_name: "Simple", beds: 1 },
        },
        {
          reservation_id: 6004,
          reservation_number: "RES20260104",
          room_id: 21,
          room_number: "201",
          booking_type: "nightly",
          check_in_at: "2026-01-25 14:00:00",
          check_out_at: "2026-01-26 12:00:00",
          total_nights_or_hours: 1,
          room_rate_per_unit: 50,
          total_room_charges: 50,
          status: "confirmed",
          room_type: { type_name: "VIP", beds: 2 },
        },
      ],

      pricing: {
        subtotal: 68,
        discount: 0,
        tax: 0,
        total: 68,
        paid_amount: 68,
        balance_amount: 0,
        deposit_amount: 0,
      },

      payment: {
        payment_method: "cash_usd",
        reference_number: "RCPT-2233",
        status: "completed",
      },

      notes: "Wants rooms near each other",
    },
  ],
}
