
export const frontdeskQuickBookData = {
  property: {
    property_id: 1,
    property_code: "GH01",
    name: "Family Guesthouse",
    city: "Phnom Penh",
    currency: "USD",
    timezone: "Asia/Phnom_Penh",
  },

  // booking channels (simple for guesthouse)
  bookingSources: [
    { value: "walk_in", label: "Walk-in" },
    { value: "phone", label: "Phone" },
    { value: "other", label: "Other" },
  ],

  // stay type
  bookingTypes: [
    { value: "hourly", label: "Hourly" },
    { value: "nightly", label: "Nightly" },
  ],

  hourlyPresets: [
    { label: "3 hours", hours: 3 },
    { label: "4 hours", hours: 4 },
    { label: "6 hours", hours: 6 },
  ],

  // payment methods (Cambodia)
  paymentMethods: [
    {
      method_id: 1,
      code: "ABA_KHQR",
      label: "ABA KHQR",
      currency: "USD",
      fee_rate: 0,
      qr_demo: "/assets/qr/aba-khqr-demo.png",
    },
    { method_id: 2, code: "CASH_USD", label: "Cash USD", currency: "USD", fee_rate: 0 },
    { method_id: 3, code: "CASH_KHR", label: "Cash KHR", currency: "KHR", fee_rate: 0 },
  ],

  // exchange (static demo)
  exchange: {
    khr_per_usd: 4100,
  },

  // guests (search/select OR create new)
  guests: [
    {
      guest_id: 101,
      guest_number: "G202600101",
      name: "Sok Dara",
      phone: "012 345 678",
      nationality: "Cambodian",
      id_type: "national_id",
      id_number: "0123456789",
      guest_type: "individual",
      notes: "",
    },
    {
      guest_id: 102,
      guest_number: "G202600102",
      name: "Linda Chen",
      phone: "098 222 111",
      nationality: "Chinese",
      id_type: "passport",
      id_number: "EJ223344",
      guest_type: "vip",
      notes: "Prefers quiet room",
    },
    {
      guest_id: 103,
      guest_number: "G202600103",
      name: "Jennifer Jones",
      phone: "077 555 444",
      nationality: "Australian",
      id_type: "passport",
      id_number: "AU998877",
      guest_type: "individual",
      notes: "",
    },
  ],

  // room types: Simple/VIP with 1bed/2bed
  roomTypes: [
    {
      room_type_id: 1,
      type_group: "Simple",
      beds: 1,
      max_occupancy: 2,
      price: { hourly: 4, nightly: 18 },
      amenities: ["WiFi", "Hot Water", "Fan"],
    },
    {
      room_type_id: 2,
      type_group: "Simple",
      beds: 2,
      max_occupancy: 3,
      price: { hourly: 6, nightly: 25 },
      amenities: ["WiFi", "Hot Water", "Fan"],
    },
    {
      room_type_id: 3,
      type_group: "VIP",
      beds: 1,
      max_occupancy: 2,
      price: { hourly: 9, nightly: 35 },
      amenities: ["AC", "WiFi", "Hot Water", "TV", "Fridge"],
    },
    {
      room_type_id: 4,
      type_group: "VIP",
      beds: 2,
      max_occupancy: 4,
      price: { hourly: 12, nightly: 50 },
      amenities: ["AC", "WiFi", "Hot Water", "TV", "Fridge", "Balcony"],
    },
  ],

  // rooms to choose (quick booking uses available rooms mainly)
  // status: available / cleaning / maintenance / occupied / reserved
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

  // quick recommended packages: (helps receptionist click fast)
  quickPackages: [
    {
      id: "PKG-H-3H-S1",
      label: "Hourly • 3h • Simple 1 bed",
      booking_type: "hourly",
      hours: 3,
      room_type_id: 1,
      suggested_qty: 1,
    },
    {
      id: "PKG-N-1N-S2",
      label: "Nightly • 1 night • Simple 2 beds",
      booking_type: "nightly",
      nights: 1,
      room_type_id: 2,
      suggested_qty: 1,
    },
    {
      id: "PKG-N-1N-V2",
      label: "Nightly • 1 night • VIP 2 beds",
      booking_type: "nightly",
      nights: 1,
      room_type_id: 4,
      suggested_qty: 1,
    },
  ],

  // Draft state (UI demo for quick-book form)
  draftQuickBook: {
    booking_source: "walk_in", // walk_in/phone/other

    // guest selection
    guest_mode: "existing", // existing/new
    guest_id: null,
    new_guest: {
      name: "",
      phone: "",
      nationality: "Cambodian",
      id_type: "national_id",
      id_number: "",
      notes: "",
    },

    booking_type: "hourly", // hourly/nightly
    hours: 3,
    nights: 1,

    // when nightly use date range; when hourly use datetime
    check_in_at: "2026-01-25 19:00",
    check_out_at: "2026-01-25 22:00",

    check_in_date: "2026-01-25",
    check_out_date: "2026-01-26",

    // multiple rooms for one booking (important)
    selectedRooms: [
      // { room_id, room_number, room_type_id, type_group, beds, unit_price, qty, total }
    ],

    pricing: {
      discount: 0,
      extra: 0,
      tax_rate: 0,
    },

    deposit: {
      enabled: false,
      amount: 0,
      paid: false,
    },

    payment: {
      method_code: "ABA_KHQR", // ABA_KHQR/CASH_USD/CASH_KHR
      status: "pending", // pending/partial/completed
      reference: "",
      amount_paid: 0,
      currency: "USD",
    },
    notes: "",
  },


  // sample “recent quick bookings” list (for table on page)
  recentQuickBooks: [
    {
      booking_id: 9101,
      booking_number: "BK20260101",
      booking_source: "walk_in",
      created_at: "2026-01-25 18:40",
      guest: { guest_id: 103, name: "Jennifer Jones", phone: "077 555 444" },

      stay: { booking_type: "hourly", hours: 3, check_in_at: "2026-01-25 18:00", check_out_at: "2026-01-25 21:00" },

      rooms: [
        { room_id: 11, room_number: "101", type_group: "Simple", beds: 1, qty: 3, unit_price: 4, total: 12 },
      ],

      totals: { subtotal: 12, discount: 0, tax: 0, total: 12, paid: 0, balance: 12 },

      payment: { method: "Cash USD", status: "pending", reference: "" },
      status: "pending",
    },

    {
      booking_id: 9102,
      booking_number: "BK20260102",
      booking_source: "phone",
      created_at: "2026-01-25 16:10",
      guest: { guest_id: 102, name: "Linda Chen", phone: "098 222 111" },

      stay: { booking_type: "nightly", nights: 2, check_in_at: "2026-01-25 14:00", check_out_at: "2026-01-27 12:00" },

      rooms: [
        { room_id: 31, room_number: "301", type_group: "VIP", beds: 2, qty: 2, unit_price: 50, total: 100 },
      ],

      totals: { subtotal: 100, discount: 0, tax: 0, total: 100, paid: 10, balance: 90 },

      payment: { method: "ABA KHQR", status: "partial", reference: "KHQR-DEMO-8822" },
      status: "confirmed",
    },

    {
      booking_id: 9103,
      booking_number: "BK20260103",
      booking_source: "other",
      created_at: "2026-01-25 12:25",
      guest: { guest_id: 101, name: "Sok Dara", phone: "012 345 678" },

      stay: { booking_type: "nightly", nights: 1, check_in_at: "2026-01-25 14:00", check_out_at: "2026-01-26 12:00" },

      rooms: [
        // multiple rooms example
        { room_id: 21, room_number: "201", type_group: "VIP", beds: 1, qty: 1, unit_price: 35, total: 35 },
        { room_id: 22, room_number: "202", type_group: "Simple", beds: 2, qty: 1, unit_price: 25, total: 25 },
      ],

      totals: { subtotal: 60, discount: 0, tax: 0, total: 60, paid: 60, balance: 0 },

      payment: { method: "Cash USD", status: "completed", reference: "RCPT-00023" },
      status: "checked_in",
    },
  ],
}
