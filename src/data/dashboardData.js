// src/data/dashboardData.js
// ==========================================
// DASHBOARD SAMPLE DATA (EXPORTS MUST MATCH IMPORTS)
// ==========================================

// 1) KEY METRICS
export const dashboardMetrics = {
  today: {
    date: "2025-01-25",
    totalRooms: 10,
    occupiedRooms: 7,
    availableRooms: 3,
    occupancyRate: 70,
    checkInsToday: 3,
    checkOutsToday: 2,
    inHouseGuests: 7,
    revenue: 210.0,
    pendingCheckouts: 2,
    arrivals: 1,
    departures: 2,
  },
  thisMonth: {
    month: "January 2025",
    totalRevenue: 4250.0,
    totalBookings: 45,
    averageOccupancy: 65,
    cancelledBookings: 3,
    noShows: 1,
  },
};

// 2) ROOM STATUS BREAKDOWN
export const roomStatusBreakdown = [
  { status: "occupied", count: 7, icon: "bed" },
  { status: "available", count: 2, icon: "check_circle" },
  { status: "cleaning", count: 1, icon: "cleaning_services" },
  { status: "maintenance", count: 0, icon: "build" },
];

// 3) TODAY'S CHECK-INS ✅ export name = todayCheckIns
export const todayCheckIns = [
  {
    reservationId: 1,
    reservationNumber: "RES-2025-001",
    guestName: "John Smith",
    roomNumber: "101",
    roomType: "Simple 1 Bed",
    checkInTime: "14:00",
    checkOutDate: "2025-01-27",
    nights: 2,
    status: "confirmed",
    phone: "012-111-111",
  },
  {
    reservationId: 2,
    reservationNumber: "RES-2025-002",
    guestName: "Sarah Johnson",
    roomNumber: "201",
    roomType: "VIP 2 Bed",
    checkInTime: "15:00",
    checkOutDate: "2025-01-28",
    nights: 3,
    status: "pending",
    phone: "012-222-222",
  },
  {
    reservationId: 3,
    reservationNumber: "RES-2025-003",
    guestName: "Sok Pisey",
    roomNumber: "102",
    roomType: "Simple 1 Bed",
    checkInTime: "16:00",
    checkOutDate: "2025-01-26",
    nights: 1,
    status: "confirmed",
    phone: "012-333-333",
  },
];

// 4) TODAY'S CHECK-OUTS ✅ export name = todayCheckOuts
export const todayCheckOuts = [
  {
    reservationId: 4,
    reservationNumber: "RES-2025-004",
    guestName: "Chan Srey Mom",
    roomNumber: "103",
    roomType: "Simple 2 Bed",
    checkOutTime: "12:00",
    totalAmount: 60.0,
    amountPaid: 30.0,
    balance: 30.0,
    status: "pending_payment",
    phone: "012-444-444",
  },
  {
    reservationId: 5,
    reservationNumber: "RES-2025-005",
    guestName: "David Lee",
    roomNumber: "202",
    roomType: "VIP 2 Bed",
    checkOutTime: "11:00",
    totalAmount: 90.0,
    amountPaid: 90.0,
    balance: 0.0,
    status: "paid",
    phone: "012-555-555",
  },
];

// 5) IN-HOUSE GUESTS ✅ export name = inHouseGuests
export const inHouseGuests = [
  {
    reservationId: 6,
    guestName: "Michael Brown",
    roomNumber: "104",
    roomType: "Simple 1 Bed",
    checkIn: "2025-01-23",
    checkOut: "2025-01-26",
    nights: 3,
    nightsStayed: 2,
    nightsRemaining: 1,
    status: "checked_in",
  },
  {
    reservationId: 7,
    guestName: "Lim Sophal",
    roomNumber: "105",
    roomType: "Simple 2 Bed",
    checkIn: "2025-01-24",
    checkOut: "2025-01-29",
    nights: 5,
    nightsStayed: 1,
    nightsRemaining: 4,
    status: "checked_in",
  },
  {
    reservationId: 8,
    guestName: "Emma Wilson",
    roomNumber: "203",
    roomType: "VIP 1 Bed",
    checkIn: "2025-01-22",
    checkOut: "2025-01-27",
    nights: 5,
    nightsStayed: 3,
    nightsRemaining: 2,
    status: "checked_in",
  },
  {
    reservationId: 9,
    guestName: "Heng Dara",
    roomNumber: "106",
    roomType: "Simple 1 Bed",
    checkIn: "2025-01-25",
    checkOut: "2025-01-28",
    nights: 3,
    nightsStayed: 0,
    nightsRemaining: 3,
    status: "checked_in",
  },
];

// 6) RECENT TRANSACTIONS ✅ export name = recentTransactions
export const recentTransactions = [
  {
    paymentId: 1,
    paymentNumber: "PAY-2025-001",
    invoiceNumber: "INV-2025-001",
    guestName: "David Lee",
    amount: 90.0,
    paymentMethod: "cash",
    currency: "USD",
    paymentDate: "2025-01-25 11:30:00",
    status: "completed",
  },
  {
    paymentId: 2,
    paymentNumber: "PAY-2025-002",
    invoiceNumber: "INV-2025-002",
    guestName: "Chan Srey Mom",
    amount: 30.0,
    paymentMethod: "aba",
    currency: "USD",
    paymentDate: "2025-01-25 10:15:00",
    status: "completed",
  },
  {
    paymentId: 3,
    paymentNumber: "PAY-2025-003",
    invoiceNumber: "INV-2025-003",
    guestName: "Michael Brown",
    amount: 45.0,
    paymentMethod: "cash",
    currency: "USD",
    paymentDate: "2025-01-24 16:20:00",
    status: "completed",
  },
  {
    paymentId: 4,
    paymentNumber: "PAY-2025-004",
    invoiceNumber: "INV-2025-004",
    guestName: "Emma Wilson",
    amount: 75.0,
    paymentMethod: "credit_card",
    currency: "USD",
    paymentDate: "2025-01-24 14:00:00",
    status: "completed",
  },
  {
    paymentId: 5,
    paymentNumber: "PAY-2025-005",
    invoiceNumber: "INV-2025-005",
    guestName: "Sok Pisey",
    amount: 15.0,
    paymentMethod: "wing",
    currency: "USD",
    paymentDate: "2025-01-23 18:30:00",
    status: "completed",
  },
];

// 7) CHART DATA (7 days + month)
export const revenueChart7Days = [
  { date: "2025-01-19", revenue: 120.0, bookings: 4 },
  { date: "2025-01-20", revenue: 135.0, bookings: 5 },
  { date: "2025-01-21", revenue: 90.0, bookings: 3 },
  { date: "2025-01-22", revenue: 165.0, bookings: 6 },
  { date: "2025-01-23", revenue: 180.0, bookings: 7 },
  { date: "2025-01-24", revenue: 150.0, bookings: 5 },
  { date: "2025-01-25", revenue: 210.0, bookings: 8 },
];

export const revenueChartMonth = [
  { date: "2025-01-01", revenue: 90.0, bookings: 3 },
  { date: "2025-01-02", revenue: 120.0, bookings: 4 },
  { date: "2025-01-03", revenue: 60.0, bookings: 2 },
  { date: "2025-01-04", revenue: 140.0, bookings: 5 },
  { date: "2025-01-05", revenue: 100.0, bookings: 3 },
  { date: "2025-01-06", revenue: 180.0, bookings: 6 },
  { date: "2025-01-07", revenue: 75.0, bookings: 2 },
  { date: "2025-01-08", revenue: 160.0, bookings: 5 },
  { date: "2025-01-09", revenue: 130.0, bookings: 4 },
  { date: "2025-01-10", revenue: 200.0, bookings: 7 },
  { date: "2025-01-11", revenue: 110.0, bookings: 3 },
  { date: "2025-01-12", revenue: 95.0, bookings: 3 },
  { date: "2025-01-13", revenue: 170.0, bookings: 6 },
  { date: "2025-01-14", revenue: 155.0, bookings: 5 },
  { date: "2025-01-15", revenue: 125.0, bookings: 4 },
  { date: "2025-01-16", revenue: 140.0, bookings: 5 },
  { date: "2025-01-17", revenue: 80.0, bookings: 2 },
  { date: "2025-01-18", revenue: 150.0, bookings: 5 },
  { date: "2025-01-19", revenue: 120.0, bookings: 4 },
  { date: "2025-01-20", revenue: 135.0, bookings: 5 },
  { date: "2025-01-21", revenue: 90.0, bookings: 3 },
  { date: "2025-01-22", revenue: 165.0, bookings: 6 },
  { date: "2025-01-23", revenue: 180.0, bookings: 7 },
  { date: "2025-01-24", revenue: 150.0, bookings: 5 },
  { date: "2025-01-25", revenue: 210.0, bookings: 8 },
];

// ✅ helpers used by dashboard UI
export const getRevenueChartData = (period = "7days") => {
  if (period === "month") return revenueChartMonth;
  return revenueChart7Days;
};

export const getMaxRevenue = (data) => {
  const max = Math.max(...data.map((d) => d.revenue));
  return Math.ceil(max / 50) * 50;
};

// 8) ROOM TYPE PERFORMANCE
export const roomTypePerformance = [
  { roomType: "Simple 1 Bed", totalRooms: 4, occupied: 3, occupancyRate: 75, revenue: 1200.0 },
  { roomType: "Simple 2 Bed", totalRooms: 3, occupied: 2, occupancyRate: 67, revenue: 900.0 },
  { roomType: "VIP 1 Bed", totalRooms: 2, occupied: 1, occupancyRate: 50, revenue: 600.0 },
  { roomType: "VIP 2 Bed", totalRooms: 1, occupied: 1, occupancyRate: 100, revenue: 900.0 },
];

// 9) PENDING TASKS
export const pendingTasks = [
  {
    taskId: 1,
    taskType: "cleaning",
    roomNumber: "103",
    priority: "high",
    assignedTo: "Dara Sok",
    status: "pending",
    createdAt: "2025-01-25 09:00:00",
  },
  {
    taskId: 2,
    taskType: "inspection",
    roomNumber: "201",
    priority: "normal",
    assignedTo: "Dara Sok",
    status: "in_progress",
    createdAt: "2025-01-25 08:30:00",
  },
  {
    taskId: 3,
    taskType: "maintenance",
    roomNumber: "105",
    priority: "urgent",
    assignedTo: null,
    status: "pending",
    createdAt: "2025-01-24 16:00:00",
  },
];

// 10) UPCOMING BOOKINGS
export const upcomingBookings = [
  {
    bookingNumber: "BK-2025-010",
    guestName: "James Anderson",
    roomType: "VIP 2 Bed",
    checkIn: "2025-01-26",
    checkOut: "2025-01-29",
    nights: 3,
    status: "confirmed",
    totalAmount: 90.0,
  },
  {
    bookingNumber: "BK-2025-011",
    guestName: "Pich Chanthy",
    roomType: "Simple 1 Bed",
    checkIn: "2025-01-26",
    checkOut: "2025-01-27",
    nights: 1,
    status: "pending",
    totalAmount: 15.0,
  },
  {
    bookingNumber: "BK-2025-012",
    guestName: "Lisa Wang",
    roomType: "VIP 1 Bed",
    checkIn: "2025-01-27",
    checkOut: "2025-01-30",
    nights: 3,
    status: "confirmed",
    totalAmount: 75.0,
  },
];
