// src/data/frontdeskCheckoutData.js

export const frontdeskCheckoutData = {
  property: {
    property_id: 1,
    property_code: "GH01",
    name: "Family Guesthouse",
    city: "Phnom Penh",
    currency: "USD",
    timezone: "Asia/Phnom_Penh",
  },

  // filters for UI
  checkoutStatuses: ["ready", "late", "checked_out"],
  paymentStatuses: ["pending", "partial", "completed"],
  bookingSources: ["walk_in", "phone", "other"],
  bookingTypes: ["hourly", "nightly"],

  paymentMethods: [
    { method_id: 1, method_code: "ABA_KHQR", label: "ABA KHQR", currency: "USD" },
    { method_id: 2, method_code: "CASH_USD", label: "Cash USD", currency: "USD" },
    { method_id: 3, method_code: "CASH_KHR", label: "Cash KHR", currency: "KHR" },
  ],

  // room types (room_types)
  roomTypes: [
    { room_type_id: 1, type_name: "Simple", bed_count: 1, base_price_nightly: 18, base_price_hourly: 4 },
    { room_type_id: 2, type_name: "Simple", bed_count: 2, base_price_nightly: 25, base_price_hourly: 6 },
    { room_type_id: 3, type_name: "VIP", bed_count: 1, base_price_nightly: 35, base_price_hourly: 9 },
    { room_type_id: 4, type_name: "VIP", bed_count: 2, base_price_nightly: 50, base_price_hourly: 12 },
  ],

  // rooms (rooms)
  rooms: [
    { room_id: 11, room_number: "101", floor: 1, room_type_id: 1, status: "occupied" },
    { room_id: 21, room_number: "201", floor: 2, room_type_id: 3, status: "occupied" },
    { room_id: 31, room_number: "301", floor: 3, room_type_id: 4, status: "occupied" },
    { room_id: 22, room_number: "202", floor: 2, room_type_id: 2, status: "available" },
  ],

  // guests (guests)
  guests: [
    {
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
    {
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
    {
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
  ],

  // main list: "in-house & ready to checkout"
  // bookings + reservations + invoice + payment + deposit (joined)
  checkoutList: [
    {
      booking: {
        booking_id: 9101,
        booking_number: "BK20260121",
        booking_source: "walk_in",
        status: "checked_in",
        booking_date: "2026-01-25 17:55",
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
          reservation_number: "RES20260188",
          room_id: 11,
          room_number: "101",
          room_type_id: 1,
          room_type: { type_name: "Simple", bed_count: 1 },

          booking_type: "hourly",
          hours: 3,
          check_in_at: "2026-01-25 18:00",
          check_out_at: "2026-01-25 21:00",
          total_nights_or_hours: 3,

          room_rate_per_unit: 4,
          total_room_charges: 12,

          status: "checked_in",
        },
      ],

      invoice: {
        invoice_id: 5001,
        invoice_number: "INV20260110",
        status: "issued",
        subtotal: 12,
        discount_amount: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 12,
        paid_amount: 0,
        balance: 12,
        currency: "USD",
      },

      payment: {
        payment_id: null,
        payment_method: "cash_usd",
        payment_method_label: "Cash USD",
        status: "pending",
        reference_number: "",
      },

      deposit: {
        deposit_id: null,
        deposit_type: "booking_deposit",
        amount: 0,
        status: "held",
      },

      checkout: {
        checkout_status: "ready", // ready | late | checked_out
        expected_checkout: "2026-01-25 21:00",
        notes: "",
      },
    },

    {
      booking: {
        booking_id: 9102,
        booking_number: "BK20260120",
        booking_source: "phone",
        status: "checked_in",
        booking_date: "2026-01-25 13:00",
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
          reservation_number: "RES20260189",
          room_id: 31,
          room_number: "301",
          room_type_id: 4,
          room_type: { type_name: "VIP", bed_count: 2 },

          booking_type: "nightly",
          check_in_at: "2026-01-25 14:00",
          check_out_at: "2026-01-27 12:00",
          total_nights_or_hours: 2,

          room_rate_per_unit: 50,
          total_room_charges: 100,

          status: "checked_in",
        },
      ],

      invoice: {
        invoice_id: 5002,
        invoice_number: "INV20260111",
        status: "partial",
        subtotal: 100,
        discount_amount: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 100,
        paid_amount: 20,
        balance: 80,
        currency: "USD",
      },

      payment: {
        payment_id: 8001,
        payment_method: "aba_khqr",
        payment_method_label: "ABA KHQR",
        status: "partial",
        reference_number: "KHQR-ABC-9988",
      },

      deposit: {
        deposit_id: 6001,
        deposit_type: "booking_deposit",
        amount: 20,
        status: "applied_to_invoice",
        applied_to_invoice_id: 5002,
      },

      checkout: {
        checkout_status: "ready",
        expected_checkout: "2026-01-27 12:00",
        notes: "VIP guest — confirm minibar",
      },
    },

    {
      booking: {
        booking_id: 9103,
        booking_number: "BK20260122",
        booking_source: "other",
        status: "checked_in",
        booking_date: "2026-01-25 15:10",
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
          reservation_number: "RES20260190",
          room_id: 21,
          room_number: "201",
          room_type_id: 3,
          room_type: { type_name: "VIP", bed_count: 1 },

          booking_type: "nightly",
          check_in_at: "2026-01-25 14:00",
          check_out_at: "2026-01-26 12:00",
          total_nights_or_hours: 1,

          room_rate_per_unit: 35,
          total_room_charges: 35,

          status: "checked_in",
        },
      ],

      invoice: {
        invoice_id: 5003,
        invoice_number: "INV20260112",
        status: "paid",
        subtotal: 35,
        discount_amount: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 35,
        paid_amount: 35,
        balance: 0,
        currency: "USD",
      },

      payment: {
        payment_id: 8002,
        payment_method: "cash_usd",
        payment_method_label: "Cash USD",
        status: "completed",
        reference_number: "RCPT-0009",
      },

      deposit: {
        deposit_id: null,
        deposit_type: "booking_deposit",
        amount: 0,
        status: "held",
      },

      checkout: {
        checkout_status: "checked_out",
        expected_checkout: "2026-01-26 12:00",
        actual_checkout: "2026-01-26 11:50",
        notes: "",
      },
    },
  ],

  // draft state for UI demo (like your check-in draft)
  draftCheckout: {
    booking_id: null,
    selected: null, // set when click a card

    // extra charges at checkout (invoice_items)
    extras: [
      // { item_type: "late_checkout", description: "Late checkout 1 hour", qty: 1, unit_price: 5, total: 5 }
    ],

    // payment
    payment: {
      method: "CASH_USD",
      amount_paid: 0,
      reference_number: "",
      status: "pending",
    },

    // deposit handling
    deposit: {
      refund_enabled: false,
      refund_amount: 0,
      refund_method: "CASH_USD",
      refund_reference: "",
    },

    notes: "",
  },
};
