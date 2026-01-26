export const calender = [
  {
    id: 1,
    bookingNumber: "BK-2026-0001",
    room: {
      id: 101,
      number: "101",
      type: "Standard",
    },
    guest: {
      id: 1,
      name: "Sok Dara",
      phone: "012345678",
      nationality: "Cambodian",
    },
    stay: {
      checkIn: "2026-01-15 08:00",
      checkOut: "2026-01-15 11:00",
      durationType: "hour",
      hours: 3,
      nights: 0,
    },
    price: {
      rate: 5,
      total: 15,
      currency: "USD",
    },
    payment: {
      status: "paid",
      method: "cash",
      deposit: 0,
    },
    status: "checked_out",
    source: "walk-in",
    color: "#22c55e",
  },

  {
    id: 2,
    bookingNumber: "BK-2026-0002",
    room: {
      id: 102,
      number: "102",
      type: "Deluxe",
    },
    guest: {
      id: 2,
      name: "John Smith",
      phone: "+855 78 998 123",
      nationality: "USA",
    },
    stay: {
      checkIn: "2026-01-15 14:00",
      checkOut: "2026-01-16 12:00",
      durationType: "night",
      hours: 0,
      nights: 1,
    },
    price: {
      rate: 35,
      total: 35,
      currency: "USD",
    },
    payment: {
      status: "paid",
      method: "aba",
      deposit: 10,
    },
    status: "in_house",
    source: "booking.com",
    color: "#3b82f6",
  },

  {
    id: 3,
    bookingNumber: "BK-2026-0003",
    room: {
      id: 201,
      number: "201",
      type: "Family",
    },
    guest: {
      id: 3,
      name: "Chantha Family",
      phone: "0965544332",
      nationality: "Cambodian",
    },
    stay: {
      checkIn: "2026-01-16 13:00",
      checkOut: "2026-01-18 12:00",
      durationType: "night",
      hours: 0,
      nights: 2,
    },
    price: {
      rate: 50,
      total: 100,
      currency: "USD",
    },
    payment: {
      status: "partial",
      method: "cash",
      deposit: 40,
    },
    status: "reserved",
    source: "agoda",
    color: "#f59e0b",
  },

  {
    id: 4,
    bookingNumber: "BK-2026-0004",
    room: {
      id: 103,
      number: "103",
      type: "Standard",
    },
    guest: {
      id: 4,
      name: "Lina Kim",
      phone: "+82 10 3322 7788",
      nationality: "Korean",
    },
    stay: {
      checkIn: "2026-01-16 10:00",
      checkOut: "2026-01-16 16:00",
      durationType: "hour",
      hours: 6,
      nights: 0,
    },
    price: {
      rate: 6,
      total: 36,
      currency: "USD",
    },
    payment: {
      status: "unpaid",
      method: "cash",
      deposit: 0,
    },
    status: "in_house",
    source: "walk-in",
    color: "#ef4444",
  },

  {
    id: 5,
    bookingNumber: "BK-2026-0005",
    room: {
      id: 301,
      number: "301",
      type: "Suite",
    },
    guest: {
      id: 5,
      name: "David Nguyen",
      phone: "+84 912 888 999",
      nationality: "Vietnamese",
    },
    stay: {
      checkIn: "2026-01-17 14:00",
      checkOut: "2026-01-20 12:00",
      durationType: "night",
      hours: 0,
      nights: 3,
    },
    price: {
      rate: 80,
      total: 240,
      currency: "USD",
    },
    payment: {
      status: "paid",
      method: "card",
      deposit: 100,
    },
    status: "reserved",
    source: "expedia",
    color: "#8b5cf6",
  },
];
