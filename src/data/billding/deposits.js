export const deposits = [
  {
    id: 1,
    depositNumber: "DEP-2026-0001",
    date: "2026-01-15 08:05",
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
    amount: 5,
    currency: "USD",
    method: "cash",
    status: "held", // held | applied | refunded | forfeited
    appliedToInvoice: null,
    staff: {
      id: 1,
      name: "Reception A",
    },
    note: "3 hours booking deposit",
  },

  {
    id: 2,
    depositNumber: "DEP-2026-0002",
    date: "2026-01-16 09:12",
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
    amount: 15,
    currency: "USD",
    method: "cash",
    status: "applied",
    appliedToInvoice: "INV-2026-0002",
    staff: {
      id: 2,
      name: "Reception B",
    },
    note: "Deposit for late checkout",
  },

  {
    id: 3,
    depositNumber: "DEP-2026-0003",
    date: "2026-01-17 14:03",
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
    amount: 100,
    currency: "USD",
    method: "card",
    status: "applied",
    appliedToInvoice: "INV-2026-0003",
    staff: {
      id: 1,
      name: "Reception A",
    },
    note: "Security deposit for Suite",
  },

  {
    id: 4,
    depositNumber: "DEP-2026-0004",
    date: "2026-01-16 13:15",
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
    amount: 10,
    currency: "USD",
    method: "cash",
    status: "refunded",
    appliedToInvoice: null,
    staff: {
      id: 1,
      name: "Reception A",
    },
    note: "50% booking deposit refunded",
  },

  {
    id: 5,
    depositNumber: "DEP-2026-0005",
    date: "2026-01-18 11:45",
    bookingNumber: "BK-2026-0010",
    guest: {
      id: 18,
      name: "Srey Leak",
      phone: "0967788990",
    },
    room: {
      number: "204",
      type: "Deluxe",
    },
    amount: 20,
    currency: "USD",
    method: "aba",
    status: "forfeited",
    appliedToInvoice: null,
    staff: {
      id: 3,
      name: "Reception C",
    },
    note: "Guest did not show up",
  },
];
