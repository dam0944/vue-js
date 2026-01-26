    // src/data/reservationsList.js
// Static demo data for Reservations list (Guesthouse-friendly, follow your tables: bookings + reservations + guests + rooms + room_types + invoices + payments)

export const reservationsListData = {
  property: {
    property_id: 1,
    property_code: "GH01",
    property_name: "Family Guesthouse",
    city: "Phnom Penh",
    currency: "USD",
    timezone: "Asia/Phnom_Penh",
  },

  bookingSources: ["walk_in", "phone", "other"],
  bookingTypes: ["hourly", "nightly"],
  statuses: ["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"],

  // lookup (optional)
  roomTypes: [
    { room_type_id: 1, type_name: "Simple", bed_count: 1, base_price_nightly: 18, base_price_hourly: 4, max_occupancy: 2 },
    { room_type_id: 2, type_name: "Simple", bed_count: 2, base_price_nightly: 25, base_price_hourly: 6, max_occupancy: 3 },
    { room_type_id: 3, type_name: "VIP", bed_count: 1, base_price_nightly: 35, base_price_hourly: 9, max_occupancy: 2 },
    { room_type_id: 4, type_name: "VIP", bed_count: 2, base_price_nightly: 50, base_price_hourly: 12, max_occupancy: 4 },
  ],

  rooms: [
    { room_id: 11, room_number: "101", floor: 1, room_type_id: 1, status: "available" },
    { room_id: 12, room_number: "102", floor: 1, room_type_id: 2, status: "cleaning" },
    { room_id: 13, room_number: "103", floor: 1, room_type_id: 4, status: "reserved" },
    { room_id: 21, room_number: "201", floor: 2, room_type_id: 3, status: "available" },
    { room_id: 22, room_number: "202", floor: 2, room_type_id: 2, status: "available" },
    { room_id: 23, room_number: "203", floor: 2, room_type_id: 1, status: "occupied" },
    { room_id: 31, room_number: "301", floor: 3, room_type_id: 4, status: "occupied" },
    { room_id: 33, room_number: "303", floor: 3, room_type_id: 2, status: "available" },
  ],

  guests: [
    {
      guest_id: 101,
      guest_number: "G202600101",
      first_name: "Sok",
      last_name: "Dara",
      phone: "012 345 678",
      email: "dara.sok@example.com",
      nationality: "Cambodian",
      id_type: "national_id",
      id_number: "0123456789",
      guest_type: "individual",
      is_blacklisted: false,
    },
    {
      guest_id: 102,
      guest_number: "G202600102",
      first_name: "Linda",
      last_name: "Chen",
      phone: "098 222 111",
      email: "linda.chen@example.com",
      nationality: "Chinese",
      id_type: "passport",
      id_number: "EJ223344",
      guest_type: "vip",
      is_blacklisted: false,
    },
    {
      guest_id: 103,
      guest_number: "G202600103",
      first_name: "Jennifer",
      last_name: "Jones",
      phone: "077 555 444",
      email: "jennifer.j@example.com",
      nationality: "Australian",
      id_type: "passport",
      id_number: "AU998877",
      guest_type: "individual",
      is_blacklisted: false,
    },
  ],

  // ✅ This is the main list you can render in "All Bookings" or "Reservations list"
  // Each item represents: bookings row + its reservations rows + invoice + payments summary (like your DB)
  reservationsList: [
    {
      // bookings table
      booking: {
        booking_id: 9001,
        property_id: 1,
        booking_number: "BK20260095",
        primary_guest_id: 102,
        channel_id: null,
        booking_source: "phone",
        status: "checked_in",
        booking_date: "2026-01-23 13:40:00",
        total_rooms: 1,
        total_guests: 2,
        special_requests: "",
        notes: "Late arrival around 9pm",
        created_by: 1,
        created_at: "2026-01-23 13:40:00",
        updated_at: "2026-01-23 21:10:00",
      },

      guest: {
        guest_id: 102,
        guest_number: "G202600102",
        first_name: "Linda",
        last_name: "Chen",
        phone: "098 222 111",
        nationality: "Chinese",
        guest_type: "vip",
      },

      // reservations table (multi-room supported)
      reservations: [
        {
          reservation_id: 6001,
          property_id: 1,
          reservation_number: "RES20260001",
          booking_id: 9001,
          guest_id: 102,
          room_id: 31,
          room_number: "301",
          floor: 3,
          room_type_id: 4,
          room_type: { room_type_id: 4, type_name: "VIP", bed_count: 2 },

          booking_type: "nightly",
          hours: null,

          check_in_date: "2026-01-23",
          check_out_date: "2026-01-24",
          check_in_at: "2026-01-23 14:00:00",
          check_out_at: "2026-01-24 12:00:00",
          total_nights: 1,

          adults: 2,
          children: 0,
          status: "checked_in",

          room_rate_per_unit: 50,
          total_nights_or_hours: 1,
          total_room_charges: 50,

          extra_charges: 0,
          discount_amount: 0,
          tax_rate: 0,
          tax_amount: 0,
          total_amount: 50,

          paid_amount: 10,
          balance_amount: 40,

          deposit_amount: 10,
          deposit_paid: true,
          deposit_refunded: false,

          created_at: "2026-01-23 13:45:00",
        },
      ],

      // invoices table (one invoice per booking or per reservation)
      invoice: {
        invoice_id: 3001,
        property_id: 1,
        invoice_number: "INV20260021",
        booking_id: 9001,
        reservation_id: null,
        guest_id: 102,
        invoice_date: "2026-01-23",
        subtotal: 50,
        discount_amount: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 50,
        paid_amount: 10,
        balance: 40,
        currency: "USD",
        status: "partial",
      },

      // payments summary (payments table)
      payment_summary: {
        last_payment_id: 4101,
        method: "ABA KHQR",
        status: "partial",
        reference_number: "KHQR-ABC-9988",
        paid_amount: 10,
        balance_amount: 40,
        last_paid_at: "2026-01-23 21:10:00",
      },
    },

    {
      booking: {
        booking_id: 9002,
        property_id: 1,
        booking_number: "BK20260096",
        primary_guest_id: 101,
        channel_id: null,
        booking_source: "walk_in",
        status: "confirmed",
        booking_date: "2026-01-23 17:55:00",
        total_rooms: 1,
        total_guests: 1,
        special_requests: "",
        notes: "",
        created_by: 1,
        created_at: "2026-01-23 17:55:00",
        updated_at: "2026-01-23 18:00:00",
      },

      guest: {
        guest_id: 101,
        guest_number: "G202600101",
        first_name: "Sok",
        last_name: "Dara",
        phone: "012 345 678",
        nationality: "Cambodian",
        guest_type: "individual",
      },

      reservations: [
        {
          reservation_id: 6002,
          property_id: 1,
          reservation_number: "RES20260002",
          booking_id: 9002,
          guest_id: 101,
          room_id: 11,
          room_number: "101",
          floor: 1,
          room_type_id: 1,
          room_type: { room_type_id: 1, type_name: "Simple", bed_count: 1 },

          booking_type: "hourly",
          hours: 3,

          check_in_date: "2026-01-23",
          check_out_date: "2026-01-23",
          check_in_at: "2026-01-23 18:00:00",
          check_out_at: "2026-01-23 21:00:00",
          total_nights: null,

          adults: 1,
          children: 0,
          status: "confirmed",

          room_rate_per_unit: 4,
          total_nights_or_hours: 3,
          total_room_charges: 12,

          extra_charges: 0,
          discount_amount: 0,
          tax_rate: 0,
          tax_amount: 0,
          total_amount: 12,

          paid_amount: 0,
          balance_amount: 12,

          deposit_amount: 0,
          deposit_paid: false,
          deposit_refunded: false,

          created_at: "2026-01-23 18:00:00",
        },
      ],

      invoice: {
        invoice_id: 3002,
        property_id: 1,
        invoice_number: "INV20260022",
        booking_id: 9002,
        reservation_id: null,
        guest_id: 101,
        invoice_date: "2026-01-23",
        subtotal: 12,
        discount_amount: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 12,
        paid_amount: 0,
        balance: 12,
        currency: "USD",
        status: "issued",
      },

      payment_summary: {
        last_payment_id: null,
        method: "Cash USD",
        status: "pending",
        reference_number: "",
        paid_amount: 0,
        balance_amount: 12,
        last_paid_at: null,
      },
    },

    {
      booking: {
        booking_id: 9003,
        property_id: 1,
        booking_number: "BK20260097",
        primary_guest_id: 103,
        channel_id: null,
        booking_source: "other",
        status: "checked_out",
        booking_date: "2026-01-22 20:10:00",
        total_rooms: 2,
        total_guests: 3,
        special_requests: "Near stairs",
        notes: "",
        created_by: 2,
        created_at: "2026-01-22 20:10:00",
        updated_at: "2026-01-23 11:50:00",
      },

      guest: {
        guest_id: 103,
        guest_number: "G202600103",
        first_name: "Jennifer",
        last_name: "Jones",
        phone: "077 555 444",
        nationality: "Australian",
        guest_type: "individual",
      },

      reservations: [
        {
          reservation_id: 6003,
          property_id: 1,
          reservation_number: "RES20260003",
          booking_id: 9003,
          guest_id: 103,
          room_id: 21,
          room_number: "201",
          floor: 2,
          room_type_id: 3,
          room_type: { room_type_id: 3, type_name: "VIP", bed_count: 1 },

          booking_type: "nightly",
          hours: null,

          check_in_date: "2026-01-22",
          check_out_date: "2026-01-23",
          check_in_at: "2026-01-22 21:00:00",
          check_out_at: "2026-01-23 12:00:00",
          total_nights: 1,

          adults: 2,
          children: 0,
          status: "checked_out",

          room_rate_per_unit: 35,
          total_nights_or_hours: 1,
          total_room_charges: 35,

          extra_charges: 0,
          discount_amount: 0,
          tax_rate: 0,
          tax_amount: 0,
          total_amount: 35,

          paid_amount: 35,
          balance_amount: 0,

          deposit_amount: 0,
          deposit_paid: false,
          deposit_refunded: false,

          created_at: "2026-01-22 20:15:00",
        },
        {
          reservation_id: 6004,
          property_id: 1,
          reservation_number: "RES20260004",
          booking_id: 9003,
          guest_id: 103,
          room_id: 22,
          room_number: "202",
          floor: 2,
          room_type_id: 2,
          room_type: { room_type_id: 2, type_name: "Simple", bed_count: 2 },

          booking_type: "nightly",
          hours: null,

          check_in_date: "2026-01-22",
          check_out_date: "2026-01-23",
          check_in_at: "2026-01-22 21:00:00",
          check_out_at: "2026-01-23 12:00:00",
          total_nights: 1,

          adults: 1,
          children: 0,
          status: "checked_out",

          room_rate_per_unit: 25,
          total_nights_or_hours: 1,
          total_room_charges: 25,

          extra_charges: 0,
          discount_amount: 0,
          tax_rate: 0,
          tax_amount: 0,
          total_amount: 25,

          paid_amount: 25,
          balance_amount: 0,

          deposit_amount: 0,
          deposit_paid: false,
          deposit_refunded: false,

          created_at: "2026-01-22 20:15:00",
        },
      ],

      invoice: {
        invoice_id: 3003,
        property_id: 1,
        invoice_number: "INV20260023",
        booking_id: 9003,
        reservation_id: null,
        guest_id: 103,
        invoice_date: "2026-01-23",
        subtotal: 60,
        discount_amount: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 60,
        paid_amount: 60,
        balance: 0,
        currency: "USD",
        status: "paid",
      },

      payment_summary: {
        last_payment_id: 4103,
        method: "Cash USD",
        status: "completed",
        reference_number: "RCPT-9003",
        paid_amount: 60,
        balance_amount: 0,
        last_paid_at: "2026-01-23 11:50:00",
      },
    },
  ],
}
