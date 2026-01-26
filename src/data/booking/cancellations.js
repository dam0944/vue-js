export const cancellations = [
  {
    id: 1,
    bookingNumber: "BK-2026-0006",
    cancelledAt: "2026-01-14 10:45",
    cancelledBy: "guest", // guest | staff | system
    reason: "Changed travel plan",

    guest: {
      id: 11,
      name: "Peter Wong",
      phone: "+852 9123 3344",
      nationality: "Hong Kong",
    },

    room: {
      id: 104,
      number: "104",
      type: "Standard",
      floor: 1,
    },

    stay: {
      checkIn: "2026-01-15 14:00",
      checkOut: "2026-01-16 12:00",
      durationType: "night",
      nights: 1,
    },

    price: {
      rate: 25,
      total: 25,
      currency: "USD",
    },

    payment: {
      status: "refunded",
      method: "aba",
      deposit: 10,
      refundAmount: 10,
      refundedAt: "2026-01-14 11:02",
    },

    penalty: {
      applied: false,
      amount: 0,
    },

    source: "booking.com",
    note: "Full refund issued",
  },

  {
    id: 2,
    bookingNumber: "BK-2026-0007",
    cancelledAt: "2026-01-15 08:30",
    cancelledBy: "staff",
    reason: "Guest did not show up",

    guest: {
      id: 12,
      name: "Michael Brown",
      phone: "+1 415 555 8899",
      nationality: "USA",
    },

    room: {
      id: 202,
      number: "202",
      type: "Family",
      floor: 2,
    },

    stay: {
      checkIn: "2026-01-15 14:00",
      checkOut: "2026-01-17 12:00",
      durationType: "night",
      nights: 2,
    },

    price: {
      rate: 50,
      total: 100,
      currency: "USD",
    },

    payment: {
      status: "paid",
      method: "card",
      deposit: 30,
      refundAmount: 0,
      refundedAt: null,
    },

    penalty: {
      applied: true,
      amount: 30, // deposit forfeited
    },

    source: "expedia",
    note: "No-show. Deposit kept.",
  },

  {
    id: 3,
    bookingNumber: "BK-2026-0008",
    cancelledAt: "2026-01-16 12:10",
    cancelledBy: "guest",
    reason: "Emergency family issue",

    guest: {
      id: 13,
      name: "Sophea Chhun",
      phone: "098 887 766",
      nationality: "Cambodian",
    },

    room: {
      id: 105,
      number: "105",
      type: "Standard",
      floor: 1,
    },

    stay: {
      checkIn: "2026-01-16 14:00",
      checkOut: "2026-01-17 12:00",
      durationType: "night",
      nights: 1,
    },

    price: {
      rate: 25,
      total: 25,
      currency: "USD",
    },

    payment: {
      status: "partial",
      method: "cash",
      deposit: 10,
      refundAmount: 5,
      refundedAt: "2026-01-16 12:20",
    },

    penalty: {
      applied: true,
      amount: 5,
    },

    source: "walk-in",
    note: "50% deposit penalty",
  },

  {
    id: 4,
    bookingNumber: "BK-2026-0009",
    cancelledAt: "2026-01-17 09:00",
    cancelledBy: "system",
    reason: "Payment timeout",

    guest: {
      id: 14,
      name: "Anna Müller",
      phone: "+49 151 2233 8899",
      nationality: "German",
    },

    room: {
      id: 302,
      number: "302",
      type: "Suite",
      floor: 3,
    },

    stay: {
      checkIn: "2026-01-17 14:00",
      checkOut: "2026-01-18 12:00",
      durationType: "night",
      nights: 1,
    },

    price: {
      rate: 90,
      total: 90,
      currency: "USD",
    },

    payment: {
      status: "unpaid",
      method: "card",
      deposit: 0,
      refundAmount: 0,
      refundedAt: null,
    },

    penalty: {
      applied: false,
      amount: 0,
    },

    source: "agoda",
    note: "Auto-cancelled by system after 24h unpaid",
  },
];
