export const reservationsCreateData = {
  property: { property_id: 1, property_code: "GH01", name: "Family Guesthouse", city: "Phnom Penh", currency: "USD" },
  bookingSources: ["walk_in", "phone", "other"],
  bookingTypes: ["hourly", "nightly"],
  hourlyPresets: [{ label: "3 hours", hours: 3 }, { label: "4 hours", hours: 4 }, { label: "6 hours", hours: 6 }],
  paymentMethods: [
    { code: "ABA_KHQR", label: "ABA KHQR", currency: "USD" },
    { code: "CASH_USD", label: "Cash USD", currency: "USD" },
    { code: "CASH_KHR", label: "Cash KHR", currency: "KHR" },
  ],
  guests: [],
  roomTypes: [],
  rooms: [],
}