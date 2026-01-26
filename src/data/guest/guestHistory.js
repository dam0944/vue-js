export const guestHistory = [
  {
    history_id: 1,
    guest_id: 1,
    guest_name: "Sok Dara",
    phone: "012345678",
    nationality: "Cambodian",

    bookingNumber: "BK-2026-0001",

    room: {
      room_id: 101,
      room_number: "101",
      room_type: "Standard",
      floor: 1,
    },

    stay: {
      checkIn: "2026-01-10 14:00",
      checkOut: "2026-01-11 12:00",
      durationType: "night",
      nights: 1,
      hours: 0,
    },

    payment: {
      status: "paid",
      method: "cash",
      deposit: 0,
    },

    price: {
      rate: 20,
      total: 20,
      currency: "USD",
    },

    status: "checked_out",
    source: "walk-in",
    note: "Good guest, quiet stay",
  },

  {
    history_id: 2,
    guest_id: 2,
    guest_name: "Pisey Chan",
    phone: "097111222",
    nationality: "Cambodian",

    bookingNumber: "BK-2026-0002",

    room: {
      room_id: 202,
      room_number: "202",
      room_type: "Deluxe",
      floor: 2,
    },

    stay: {
      checkIn: "2026-01-12 09:00",
      checkOut: "2026-01-12 12:00",
      durationType: "hour",
      nights: 0,
      hours: 3,
    },

    payment: {
      status: "paid",
      method: "aba",
      deposit: 10,
    },

    price: {
      rate: 7,
      total: 21,
      currency: "USD",
    },

    status: "checked_out",
    source: "booking.com",
    note: "Requested late checkout",
  },

  {
    history_id: 3,
    guest_id: 3,
    guest_name: "John Smith",
    phone: "+1-202-555-0123",
    nationality: "American",

    bookingNumber: "BK-2026-0003",

    room: {
      room_id: 303,
      room_number: "303",
      room_type: "Family",
      floor: 3,
    },

    stay: {
      checkIn: "2026-01-08 14:00",
      checkOut: "2026-01-10 12:00",
      durationType: "night",
      nights: 2,
      hours: 0,
    },

    payment: {
      status: "paid",
      method: "card",
      deposit: 0,
    },

    price: {
      rate: 45,
      total: 90,
      currency: "USD",
    },

    status: "checked_out",
    source: "agoda",
    note: "VIP guest, satisfied",
  },

  {
    history_id: 4,
    guest_id: 4,
    guest_name: "Lina Nguyen",
    phone: "+84-903-111-999",
    nationality: "Vietnamese",

    bookingNumber: "BK-2026-0004",

    room: {
      room_id: 404,
      room_number: "404",
      room_type: "VIP Suite",
      floor: 4,
    },

    stay: {
      checkIn: "2026-01-05 14:00",
      checkOut: "2026-01-06 12:00",
      durationType: "night",
      nights: 1,
      hours: 0,
    },

    payment: {
      status: "paid",
      method: "cash",
      deposit: 0,
    },

    price: {
      rate: 70,
      total: 70,
      currency: "USD",
    },

    status: "checked_out",
    source: "walk-in",
    note: "Blacklisted after incident",
  },
];
