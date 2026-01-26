export const room_status = [
  {
    id: 1,
    room: {
      number: "101",
      type: "Standard",
      floor: 1,
    },
    status: "available",   // available | occupied | reserved | cleaning | maintenance
    guest: null,
    bookingNumber: null,
    stay: null,
    lastCleaned: "2026-01-15 07:20",
    staff: "Srey Mom",
  },

  {
    id: 2,
    room: {
      number: "102",
      type: "Standard",
      floor: 1,
    },
    status: "occupied",
    guest: {
      name: "Sok Dara",
      phone: "012345678",
    },
    bookingNumber: "BK-2026-0001",
    stay: {
      checkIn: "2026-01-15 08:05",
      checkOut: "2026-01-15 11:05",
      duration: "3 hours",
    },
    lastCleaned: "2026-01-15 07:30",
    staff: "Srey Mom",
  },

  {
    id: 3,
    room: {
      number: "103",
      type: "Standard",
      floor: 1,
    },
    status: "reserved",
    guest: {
      name: "Lina Kim",
      phone: "+82 10 3322 7788",
    },
    bookingNumber: "BK-2026-0004",
    stay: {
      checkIn: "2026-01-16 10:00",
      checkOut: "2026-01-16 12:00",
      duration: "2 hours",
    },
    lastCleaned: "2026-01-16 07:10",
    staff: "Srey Mom",
  },

  {
    id: 4,
    room: {
      number: "201",
      type: "Deluxe",
      floor: 2,
    },
    status: "cleaning",
    guest: null,
    bookingNumber: null,
    stay: null,
    lastCleaned: "2026-01-15 09:15",
    staff: "Chenda",
  },

  {
    id: 5,
    room: {
      number: "202",
      type: "Deluxe",
      floor: 2,
    },
    status: "maintenance",
    guest: null,
    bookingNumber: null,
    stay: null,
    lastCleaned: "2026-01-14 14:30",
    staff: "Technician",
  },

  {
    id: 6,
    room: {
      number: "301",
      type: "VIP",
      floor: 3,
    },
    status: "occupied",
    guest: {
      name: "David Nguyen",
      phone: "+84 912 888 999",
    },
    bookingNumber: "BK-2026-0005",
    stay: {
      checkIn: "2026-01-17 14:00",
      checkOut: "2026-01-20 12:00",
      duration: "3 nights",
    },
    lastCleaned: "2026-01-17 11:30",
    staff: "Chenda",
  },

  {
    id: 7,
    room: {
      number: "302",
      type: "VIP",
      floor: 3,
    },
    status: "available",
    guest: null,
    bookingNumber: null,
    stay: null,
    lastCleaned: "2026-01-18 10:00",
    staff: "Chenda",
  },
];
