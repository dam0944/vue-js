export const availability = [
  {
    room: {
      id: 101,
      number: "101",
      type: "Standard",
      floor: 1,
    },
    todayStatus: "available", // available | in_house | reserved | cleaning | maintenance
    nextAvailableAt: "2026-01-15 12:00",
    housekeeping: {
      needClean: false,
      lastCleaned: "2026-01-15 07:30",
      assignedTo: "Srey Mom",
    },
    activeBooking: null,
  },

  {
    room: {
      id: 102,
      number: "102",
      type: "Deluxe",
      floor: 1,
    },
    todayStatus: "in_house",
    nextAvailableAt: "2026-01-16 12:00",
    housekeeping: {
      needClean: false,
      lastCleaned: "2026-01-15 11:00",
      assignedTo: "Srey Mom",
    },
    activeBooking: {
      bookingNumber: "BK-2026-0002",
      guestName: "John Smith",
      phone: "+855 78 998 123",
      checkIn: "2026-01-15 14:05",
      checkOut: "2026-01-16 12:00",
      status: "in_house",
      paymentStatus: "paid",
    },
  },

  {
    room: {
      id: 103,
      number: "103",
      type: "Standard",
      floor: 1,
    },
    todayStatus: "in_house",
    nextAvailableAt: "2026-01-16 16:00",
    housekeeping: {
      needClean: false,
      lastCleaned: "2026-01-15 09:20",
      assignedTo: "Dara",
    },
    activeBooking: {
      bookingNumber: "BK-2026-0004",
      guestName: "Lina Kim",
      phone: "+82 10 3322 7788",
      checkIn: "2026-01-16 10:03",
      checkOut: "2026-01-16 16:00",
      status: "in_house",
      paymentStatus: "unpaid",
    },
  },

  {
    room: {
      id: 201,
      number: "201",
      type: "Family",
      floor: 2,
    },
    todayStatus: "reserved",
    nextAvailableAt: "2026-01-18 12:00",
    housekeeping: {
      needClean: false,
      lastCleaned: "2026-01-15 12:40",
      assignedTo: "Srey Mom",
    },
    activeBooking: {
      bookingNumber: "BK-2026-0003",
      guestName: "Chantha Family",
      phone: "0965544332",
      checkIn: "2026-01-16 13:00",
      checkOut: "2026-01-18 12:00",
      status: "reserved",
      paymentStatus: "partial",
    },
  },

  {
    room: {
      id: 301,
      number: "301",
      type: "Suite",
      floor: 3,
    },
    todayStatus: "cleaning",
    nextAvailableAt: "2026-01-15 15:00",
    housekeeping: {
      needClean: true,
      lastCleaned: "2026-01-14 18:30",
      assignedTo: "Dara",
    },
    activeBooking: {
      bookingNumber: "BK-2026-0005",
      guestName: "David Nguyen",
      phone: "+84 912 888 999",
      checkOut: "2026-01-15 11:58",
      status: "checked_out",
      paymentStatus: "paid",
    },
  },

  {
    room: {
      id: 401,
      number: "401",
      type: "Deluxe",
      floor: 4,
    },
    todayStatus: "maintenance",
    nextAvailableAt: "2026-01-17 14:00",
    housekeeping: {
      needClean: false,
      lastCleaned: "2026-01-14 10:00",
      assignedTo: "Maintenance",
    },
    activeBooking: null,
  },
];
