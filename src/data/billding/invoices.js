export const invoices = [
  {
    id: 1,
    invoiceNumber: "INV-2026-0001",
    date: "2026-01-15 12:05",
    bookingNumber: "BK-2026-0001",
    guest: {
      id: 1,
      name: "Sok Dara",
      phone: "012345678",
      nationality: "Cambodian",
    },
    room: {
      number: "101",
      type: "Standard",
    },
    stay: {
      checkIn: "2026-01-15 08:05",
      checkOut: "2026-01-15 11:05",
      durationType: "hour",
      hours: 3,
      nights: 0,
    },
    charges: [
      { name: "Room (3 hours)", qty: 3, unitPrice: 5, total: 15 },
    ],
    summary: {
      subTotal: 15,
      tax: 0,
      discount: 0,
      total: 15,
      currency: "USD",
    },
    payment: {
      method: "cash",
      paid: 15,
      status: "paid",
    },
    staff: {
      id: 1,
      name: "Reception A",
    },
    status: "issued", // issued | cancelled | refunded
  },

  {
    id: 2,
    invoiceNumber: "INV-2026-0002",
    date: "2026-01-16 12:01",
    bookingNumber: "BK-2026-0004",
    guest: {
      id: 4,
      name: "Lina Kim",
      phone: "+82 10 3322 7788",
      nationality: "Korean",
    },
    room: {
      number: "103",
      type: "Standard",
    },
    stay: {
      checkIn: "2026-01-16 10:03",
      checkOut: "2026-01-16 12:01",
      durationType: "hour",
      hours: 2,
      nights: 0,
    },
    charges: [
      { name: "Room (2 hours)", qty: 2, unitPrice: 6, total: 12 },
      { name: "Late checkout fee", qty: 1, unitPrice: 10, total: 10 },
    ],
    summary: {
      subTotal: 22,
      tax: 0,
      discount: 0,
      total: 22,
      currency: "USD",
    },
    payment: {
      method: "cash",
      paid: 22,
      status: "paid",
    },
    staff: {
      id: 2,
      name: "Reception B",
    },
    status: "issued",
  },

  {
    id: 3,
    invoiceNumber: "INV-2026-0003",
    date: "2026-01-20 11:59",
    bookingNumber: "BK-2026-0005",
    guest: {
      id: 5,
      name: "David Nguyen",
      phone: "+84 912 888 999",
      nationality: "Vietnamese",
    },
    room: {
      number: "301",
      type: "Suite",
    },
    stay: {
      checkIn: "2026-01-17 14:00",
      checkOut: "2026-01-20 12:00",
      durationType: "night",
      hours: 0,
      nights: 3,
    },
    charges: [
      { name: "Suite (3 nights)", qty: 3, unitPrice: 80, total: 240 },
      { name: "Mini bar", qty: 1, unitPrice: 20, total: 20 },
    ],
    summary: {
      subTotal: 260,
      tax: 0,
      discount: 0,
      total: 260,
      currency: "USD",
    },
    payment: {
      method: "card",
      paid: 260,
      status: "paid",
    },
    staff: {
      id: 1,
      name: "Reception A",
    },
    status: "issued",
  },

  {
    id: 4,
    invoiceNumber: "INV-2026-0004",
    date: "2026-01-16 13:15",
    bookingNumber: "BK-2026-0008",
    guest: {
      id: 13,
      name: "Sophea Chhun",
      phone: "098 887 766",
      nationality: "Cambodian",
    },
    room: {
      number: "105",
      type: "Standard",
    },
    stay: {
      checkIn: "2026-01-17 14:00",
      checkOut: "2026-01-17 16:00",
      durationType: "hour",
      hours: 2,
      nights: 0,
    },
    charges: [
      { name: "Deposit (50%)", qty: 1, unitPrice: 10, total: 10 },
    ],
    summary: {
      subTotal: 10,
      tax: 0,
      discount: 0,
      total: 10,
      currency: "USD",
    },
    payment: {
      method: "cash",
      paid: 10,
      status: "refunded",
    },
    staff: {
      id: 1,
      name: "Reception A",
    },
    status: "refunded",
  },
];
