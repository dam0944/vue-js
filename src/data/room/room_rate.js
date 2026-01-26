export const room_rate = [
  // ===== STANDARD ROOM =====
  {
    rate_id: 1,
    room_type_id: 1,  // Standard Room  it have relationship with room type
    rate_type: "hour",
    currency: "USD",
    amount: 5,
    description: "Standard room hourly rate",
    is_active: true,
  },
  {
    rate_id: 2,
    room_type_id: 1,
    rate_type: "night",
    currency: "USD",
    amount: 20,
    description: "Standard room per night",
    is_active: true,
  },

  // ===== DELUXE ROOM =====
  {
    rate_id: 3,
    room_type_id: 2,           // Deluxe Room
    rate_type: "hour",
    currency: "USD",
    amount: 7,
    description: "Deluxe room hourly rate",
    is_active: true,
  },
  {
    rate_id: 4,
    room_type_id: 2,
    rate_type: "night",
    currency: "USD",
    amount: 30,
    description: "Deluxe room per night",
    is_active: true,
  },

  // ===== FAMILY ROOM =====
  {
    rate_id: 5,
    room_type_id: 3,           // Family Room
    rate_type: "hour",
    currency: "USD",
    amount: 10,
    description: "Family room hourly rate",
    is_active: true,
  },
  {
    rate_id: 6,
    room_type_id: 3,
    rate_type: "night",
    currency: "USD",
    amount: 45,
    description: "Family room per night",
    is_active: true,
  },

  // ===== VIP SUITE =====
  {
    rate_id: 7,
    room_type_id: 4,           // VIP Suite
    rate_type: "hour",
    currency: "USD",
    amount: 15,
    description: "VIP suite hourly rate",
    is_active: true,
  },
  {
    rate_id: 8,
    room_type_id: 4,
    rate_type: "night",
    currency: "USD",
    amount: 70,
    description: "VIP suite per night",
    is_active: true,
  },

  // ===== OPTIONAL: PROMO RATE EXAMPLE =====
  {
    rate_id: 9,
    room_type_id: 1,
    rate_type: "hour",
    currency: "USD",
    amount: 4,           // discounted
    description: "Standard room happy-hour rate (2PM–6PM)",
    is_active: false,    // not active by default
  }
];
