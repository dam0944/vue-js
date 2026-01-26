export const transactions = [
  {
    id: 1,
    trxNumber: "TRX-2026-0001",
    date: "2026-01-15 08:05",
    type: "check_in", // check_in | check_out | extra | refund
    bookingNumber: "BK-2026-0001",
    guest: {
      id: 1,
      name: "Sok Dara",
      phone: "012345678",
    },
    room: {
      number: "101",
      type: "Standard",
    },
    description: "3 hours room booking",
    amount: 15,
    currency: "USD",
    payment: {
      method: "cash",
      status: "paid",
    },
    staff: {
      id: 1,
      name: "Reception A",
    },
  },

  {
    id: 2,
    trxNumber: "TRX-2026-0002",
    date: "2026-01-15 14:06",
    type: "check_in",
    bookingNumber: "BK-2026-0002",
    guest: {
      id: 2,
      name: "John Smith",
      phone: "+855 78 998 123",
    },
    room: {
      number: "102",
      type: "Deluxe",
    },
    description: "1 night Deluxe Room",
    amount: 35,
    currency: "USD",
    payment: {
      method: "aba",
      status: "paid",
    },
    staff: {
      id: 1,
      name: "Reception A",
    },
  },

  {
    id: 3,
    trxNumber: "TRX-2026-0003",
    date: "2026-01-16 10:05",
    type: "extra",
    bookingNumber: "BK-2026-0004",
    guest: {
      id: 4,
      name: "Lina Kim",
      phone: "+82 10 3322 7788",
    },
    room: {
      number: "103",
      type: "Standard",
    },
    description: "Late checkout (2 hours)",
    amount: 12,
    currency: "USD",
    payment: {
      method: "cash",
      status: "paid",
    },
    staff: {
      id: 2,
      name: "Reception B",
    },
  },

  {
    id: 4,
    trxNumber: "TRX-2026-0004",
    date: "2026-01-16 12:01",
    type: "check_out",
    bookingNumber: "BK-2026-0004",
    guest: {
      id: 4,
      name: "Lina Kim",
      phone: "+82 10 3322 7788",
    },
    room: {
      number: "103",
      type: "Standard",
    },
    description: "Room checkout payment",
    amount: 36,
    currency: "USD",
    payment: {
      method: "cash",
      status: "paid",
    },
    staff: {
      id: 2,
      name: "Reception B",
    },
  },

  {
    id: 5,
    trxNumber: "TRX-2026-0005",
    date: "2026-01-17 14:03",
    type: "check_in",
    bookingNumber: "BK-2026-0005",
    guest: {
      id: 5,
      name: "David Nguyen",
      phone: "+84 912 888 999",
    },
    room: {
      number: "301",
      type: "Suite",
    },
    description: "3 nights Suite (Deposit)",
    amount: 100,
    currency: "USD",
    payment: {
      method: "card",
      status: "paid",
    },
    staff: {
      id: 3,
      name: "Reception C",
    },
  },

  {
    id: 6,
    trxNumber: "TRX-2026-0006",
    date: "2026-01-20 11:58",
    type: "check_out",
    bookingNumber: "BK-2026-0005",
    guest: {
      id: 5,
      name: "David Nguyen",
      phone: "+84 912 888 999",
    },
    room: {
      number: "301",
      type: "Suite",
    },
    description: "Remaining balance for 3 nights Suite",
    amount: 140,
    currency: "USD",
    payment: {
      method: "card",
      status: "paid",
    },
    staff: {
      id: 1,
      name: "Reception A",
    },
  },

  {
    id: 7,
    trxNumber: "TRX-2026-0007",
    date: "2026-01-16 12:20",
    type: "refund",
    bookingNumber: "BK-2026-0008",
    guest: {
      id: 13,
      name: "Sophea Chhun",
      phone: "098 887 766",
    },
    room: {
      number: "105",
      type: "Standard",
    },
    description: "50% deposit refund",
    amount: -5,
    currency: "USD",
    payment: {
      method: "cash",
      status: "refunded",
    },
    staff: {
      id: 1,
      name: "Reception A",
    },
  },
];
