// src/data/frontdeskCheckin.js

export const frontdeskCheckinData = {
  property: {
    property_id: 1,
    property_code: "GH01",
    name: "Family Guesthouse",
    city: "Phnom Penh",
    currency: "USD",
    timezone: "Asia/Phnom_Penh",
  },

  // quick filters
  bookingSources: ["walk_in", "phone", "other"],
  bookingTypes: ["hourly", "nightly"],

  paymentMethods: [
    { code: "ABA_KHQR", label: "ABA KHQR", currency: "USD" },
    { code: "CASH_USD", label: "Cash USD", currency: "USD" },
    { code: "CASH_KHR", label: "Cash KHR", currency: "KHR" },
  ],

  // guest list for searching/choosing
  guests: [
    {
      guest_id: 101,
      guest_number: "G202600101",
      first_name: "Sok",
      last_name: "Dara",
      name: "Sok Dara",
      phone: "012 345 678",
      email: "dara.sok@example.com",
      nationality: "Cambodian",
      id_type: "national_id",
      id_number: "0123456789",
      guest_type: "individual",
      notes: "",
      is_blacklisted: false,
      last_stay_date: "2025-12-21",
    },
    {
      guest_id: 102,
      guest_number: "G202600102",
      first_name: "Linda",
      last_name: "Chen",
      name: "Linda Chen",
      phone: "098 222 111",
      email: "linda.chen@example.com",
      nationality: "Chinese",
      id_type: "passport",
      id_number: "EJ223344",
      guest_type: "vip",
      notes: "Prefers quiet room",
      is_blacklisted: false,
      last_stay_date: "2026-01-05",
    },
    {
      guest_id: 103,
      guest_number: "G202600103",
      first_name: "Jennifer",
      last_name: "Jones",
      name: "Jennifer Jones",
      phone: "077 555 444",
      email: "jennifer.j@example.com",
      nationality: "Australian",
      id_type: "passport",
      id_number: "AU998877",
      guest_type: "individual",
      notes: "",
      is_blacklisted: false,
      last_stay_date: null,
    },
  ],

  // room types: Simple / VIP with beds
  roomTypes: [
    {
      room_type_id: 1,
      type_name: "Simple",
      beds: 1,
      base_price_nightly: 18,
      base_price_hourly: 4,
      max_occupancy: 2,
      amenities: ["WiFi", "Hot Water", "Fan"],
    },
    {
      room_type_id: 2,
      type_name: "Simple",
      beds: 2,
      base_price_nightly: 25,
      base_price_hourly: 6,
      max_occupancy: 3,
      amenities: ["WiFi", "Hot Water", "Fan"],
    },
    {
      room_type_id: 3,
      type_name: "VIP",
      beds: 1,
      base_price_nightly: 35,
      base_price_hourly: 9,
      max_occupancy: 2,
      amenities: ["AC", "WiFi", "Hot Water", "TV", "Fridge"],
    },
    {
      room_type_id: 4,
      type_name: "VIP",
      beds: 2,
      base_price_nightly: 50,
      base_price_hourly: 12,
      max_occupancy: 4,
      amenities: ["AC", "WiFi", "Hot Water", "TV", "Fridge", "Balcony"],
    },
  ],

  // rooms for selecting during check-in
  // status: available / reserved / occupied / cleaning / maintenance
  rooms: [
    { room_id: 11, room_number: "101", floor: 1, room_type_id: 1, status: "available" },
    { room_id: 12, room_number: "102", floor: 1, room_type_id: 2, status: "cleaning" },
    { room_id: 13, room_number: "103", floor: 1, room_type_id: 4, status: "reserved" },
    { room_id: 21, room_number: "201", floor: 2, room_type_id: 3, status: "available" },
    { room_id: 22, room_number: "202", floor: 2, room_type_id: 2, status: "available" },
    { room_id: 23, room_number: "203", floor: 2, room_type_id: 1, status: "occupied" },
    { room_id: 31, room_number: "301", floor: 3, room_type_id: 4, status: "available" },
    { room_id: 32, room_number: "302", floor: 3, room_type_id: 1, status: "maintenance" },
    { room_id: 33, room_number: "303", floor: 3, room_type_id: 2, status: "available" },
  ],

  // quick presets for hourly booking
  hourlyPresets: [
    { label: "3 hours", hours: 3 },
    { label: "4 hours", hours: 4 },
    { label: "6 hours", hours: 6 },
  ],

  // demo “frontdesk queue” (today)
  todayQueue: [
    {
      queue_id: "Q-001",
      booking_source: "walk_in",
      guest: { name: "Jennifer Jones", phone: "077 555 444" },
      request: "Hourly 3h, 1 room (Simple 1 bed)",
      status: "waiting",
      created_at: "2026-01-23 18:10",
    },
    {
      queue_id: "Q-002",
      booking_source: "phone",
      guest: { name: "Linda Chen", phone: "098 222 111" },
      request: "Nightly 1 night, VIP 2 beds",
      status: "in_progress",
      created_at: "2026-01-23 17:40",
    },
  ],

  // example bookings/reservations already in system (for check-in list)
  pendingCheckins: [
    {
      booking_id: 9001,
      booking_number: "BK20260095",
      booking_source: "phone",
      status: "confirmed",

      guest: {
        guest_id: 102,
        name: "Linda Chen",
        phone: "098 222 111",
      },

      stay: {
        booking_type: "nightly",
        check_in: "2026-01-23 14:00",
        check_out: "2026-01-24 12:00",
        nights: 1,
      },

      rooms: [
        {
          reservation_id: 6001,
          room_id: 31,
          room_number: "301",
          room_type: "VIP",
          beds: 2,
          qty: 1,
          unit_price: 50,
          total: 50,
        },
      ],

      pricing: {
        subtotal: 50,
        discount: 0,
        tax: 0,
        total: 50,
        deposit_required: 10,
        paid: 10,
        balance: 40,
      },

      payment: {
        method: "ABA KHQR",
        status: "partial",
        reference: "KHQR-ABC-9988",
      },

      notes: "Late arrival around 9pm",
    },

    {
      booking_id: 9002,
      booking_number: "BK20260096",
      booking_source: "walk_in",
      status: "pending",

      guest: {
        guest_id: 101,
        name: "Sok Dara",
        phone: "012 345 678",
      },

      stay: {
        booking_type: "hourly",
        check_in: "2026-01-23 18:00",
        check_out: "2026-01-23 21:00",
        hours: 3,
      },

      rooms: [
        {
          reservation_id: 6002,
          room_id: 11,
          room_number: "101",
          room_type: "Simple",
          beds: 1,
          qty: 3, // hours
          unit_price: 4,
          total: 12,
        },
      ],

      pricing: {
        subtotal: 12,
        discount: 0,
        tax: 0,
        total: 12,
        deposit_required: 0,
        paid: 0,
        balance: 12,
      },

      payment: {
        method: "Cash USD",
        status: "pending",
        reference: "",
      },

      notes: "",
    },
  ],

  // ✅ sample “New check-in form draft” state (for page demo)
  draftCheckin: {
    booking_source: "walk_in",
    guest: null, // set by selecting guest or creating new guest
    booking_type: "hourly", // hourly/nightly
    hours: 3,
    check_in_at: "2026-01-23 18:00",
    check_out_at: "2026-01-23 21:00",

    nights: 1,
    check_in_date: "2026-01-23",
    check_out_date: "2026-01-24",

    selectedRooms: [
      // example multiple rooms for one guest booking
      // { room_id, room_number, room_type_id, room_type, beds, unit_price, qty, total }
    ],

    pricing: {
      discount: 0,
      extra: 0,
      tax_rate: 0,
    },

    deposit: {
      enabled: true,
      amount: 10,
      paid: false,
    },

    payment: {
      method: "ABA KHQR",
      status: "pending",
      reference: "",
      amount_paid: 0,
    },

    notes: "",
  },
};
