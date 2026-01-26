export const guest_preferences = [
  {
    preference_id: 1,
    guest_id: 1,
    guest_name: "Sok Dara",

    room_preferences: {
      floor_preference: "high_floor",
      quiet_room: true,
      non_smoking: true,
      near_elevator: false,
      preferred_room_type: "Standard",
    },

    bedding_preferences: {
      bed_type: "king",
      extra_pillow: true,
      extra_blanket: false,
    },

    service_preferences: {
      daily_cleaning: true,
      wake_up_call: false,
      late_checkout: true,
      preferred_checkin_time: "14:00",
    },

    food_preferences: {
      breakfast_included: true,
      halal_food: false,
      vegetarian: false,
      allergies: "None",
    },

    special_notes: "Prefers quiet room away from street.",
  },

  {
    preference_id: 2,
    guest_id: 2,
    guest_name: "Pisey Chan",

    room_preferences: {
      floor_preference: "mid_floor",
      quiet_room: false,
      non_smoking: true,
      near_elevator: true,
      preferred_room_type: "Deluxe",
    },

    bedding_preferences: {
      bed_type: "twin",
      extra_pillow: false,
      extra_blanket: true,
    },

    service_preferences: {
      daily_cleaning: true,
      wake_up_call: true,
      late_checkout: false,
      preferred_checkin_time: "09:00",
    },

    food_preferences: {
      breakfast_included: false,
      halal_food: false,
      vegetarian: true,
      allergies: "Peanuts",
    },

    special_notes: "Vegetarian meals preferred.",
  },

  {
    preference_id: 3,
    guest_id: 3,
    guest_name: "John Smith",

    room_preferences: {
      floor_preference: "high_floor",
      quiet_room: true,
      non_smoking: true,
      near_elevator: false,
      preferred_room_type: "Family",
    },

    bedding_preferences: {
      bed_type: "queen",
      extra_pillow: true,
      extra_blanket: true,
    },

    service_preferences: {
      daily_cleaning: true,
      wake_up_call: true,
      late_checkout: true,
      preferred_checkin_time: "14:00",
    },

    food_preferences: {
      breakfast_included: true,
      halal_food: false,
      vegetarian: false,
      allergies: "None",
    },

    special_notes: "VIP guest – prioritize room readiness.",
  },

  {
    preference_id: 4,
    guest_id: 4,
    guest_name: "Lina Nguyen",

    room_preferences: {
      floor_preference: "low_floor",
      quiet_room: false,
      non_smoking: true,
      near_elevator: true,
      preferred_room_type: "VIP Suite",
    },

    bedding_preferences: {
      bed_type: "king",
      extra_pillow: false,
      extra_blanket: false,
    },

    service_preferences: {
      daily_cleaning: false,
      wake_up_call: false,
      late_checkout: false,
      preferred_checkin_time: "12:00",
    },

    food_preferences: {
      breakfast_included: false,
      halal_food: false,
      vegetarian: false,
      allergies: "None",
    },

    special_notes: "Blacklisted – limited services.",
  },
];
