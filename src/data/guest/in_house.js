export const in_house = [
  {
    stay_id: 1,
    bookingNumber: "BK-2026-0001",
    guest_id: 1,
    guest_name: "Sok Dara",
    phone: "012345678",
    nationality: "Cambodian",

    room: {
      room_id: 101,
      room_number: "101",
      room_type: "Standard",
      floor: 1,
    },

    stay: {
      checkIn: "2026-01-15 14:00",
      checkOut: "2026-01-16 12:00",
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

    status: "in_house",
    source: "walk-in",
    note: "Prefers quiet room",
  },

  {
    stay_id: 2,
    bookingNumber: "BK-2026-0002",
    guest_id: 2,
    guest_name: "Pisey Chan",
    phone: "097111222",
    nationality: "Cambodian",

    room: {
      room_id: 202,
      room_number: "202",
      room_type: "Deluxe",
      floor: 2,
    },

    stay: {
      checkIn: "2026-01-16 09:00",
      checkOut: "2026-01-16 12:00",
      durationType: "hour",
      nights: 0,
      hours: 3,
    },

    payment: {
      status: "partial",
      method: "aba",
      deposit: 10,
    },

    price: {
      rate: 7,
      total: 21,
      currency: "USD",
    },

    status: "in_house",
    source: "booking.com",
    note: "Extended stay possible",
  },

  {
    stay_id: 3,
    bookingNumber: "BK-2026-0003",
    guest_id: 3,
    guest_name: "John Smith",
    phone: "+1-202-555-0123",
    nationality: "American",

    room: {
      room_id: 303,
      room_number: "303",
      room_type: "Family",
      floor: 3,
    },

    stay: {
      checkIn: "2026-01-14 14:00",
      checkOut: "2026-01-17 12:00",
      durationType: "night",
      nights: 3,
      hours: 0,
    },

    payment: {
      status: "paid",
      method: "card",
      deposit: 0,
    },

    price: {
      rate: 45,
      total: 135,
      currency: "USD",
    },

    status: "in_house",
    source: "agoda",
    note: "VIP guest",
  },
];
