// Static data that STRICTLY follows table: additional_charges

export const extraCharges = [
  {
    charge_id: 1,
    reservation_id: 301,
    charge_type: "late_checkout",
    description: "Late checkout at 3:30 PM",
    amount: 15.0,
    quantity: 1,
    total_amount: 15.0,
    currency: "USD",

    charged_at: "2026-01-31 14:35:00",
    charged_by: 2,

    requires_approval: false,
    is_approved: true,
    approved_by: null,
    approved_at: null,
  },

  {
    charge_id: 2,
    reservation_id: 302,
    charge_type: "extra_bed",
    description: "Extra bed for child",
    amount: 10.0,
    quantity: 2,
    total_amount: 20.0,
    currency: "USD",

    charged_at: "2026-01-30 20:10:00",
    charged_by: 3,

    requires_approval: false,
    is_approved: true,
    approved_by: null,
    approved_at: null,
  },

  {
    charge_id: 3,
    reservation_id: 303,
    charge_type: "minibar",
    description: "Minibar usage (snacks & drinks)",
    amount: 3.5,
    quantity: 5,
    total_amount: 17.5,
    currency: "USD",

    charged_at: "2026-01-29 22:45:00",
    charged_by: 4,

    requires_approval: true,
    is_approved: false,
    approved_by: null,
    approved_at: null,
  },

  {
    charge_id: 4,
    reservation_id: 304,
    charge_type: "laundry",
    description: "Laundry service for 3 shirts",
    amount: 2.0,
    quantity: 3,
    total_amount: 6.0,
    currency: "USD",

    charged_at: "2026-01-28 09:15:00",
    charged_by: 2,

    requires_approval: false,
    is_approved: true,
    approved_by: null,
    approved_at: null,
  },

  {
    charge_id: 5,
    reservation_id: 305,
    charge_type: "damage",
    description: "Broken glass cup",
    amount: 5.0,
    quantity: 1,
    total_amount: 5.0,
    currency: "USD",

    charged_at: "2026-01-27 18:40:00",
    charged_by: 3,

    requires_approval: true,
    is_approved: true,
    approved_by: 1,
    approved_at: "2026-01-27 19:00:00",
  },

  {
    charge_id: 6,
    reservation_id: 306,
    charge_type: "room_service",
    description: "Dinner room service",
    amount: 12.5,
    quantity: 1,
    total_amount: 12.5,
    currency: "USD",

    charged_at: "2026-01-26 21:25:00",
    charged_by: 2,

    requires_approval: false,
    is_approved: true,
    approved_by: null,
    approved_at: null,
  },

  {
    charge_id: 7,
    reservation_id: 307,
    charge_type: "cleaning_fee",
    description: "Deep cleaning after long stay",
    amount: 25.0,
    quantity: 1,
    total_amount: 25.0,
    currency: "USD",

    charged_at: "2026-01-25 11:00:00",
    charged_by: 4,

    requires_approval: true,
    is_approved: true,
    approved_by: 1,
    approved_at: "2026-01-25 11:20:00",
  },

  {
    charge_id: 8,
    reservation_id: 308,
    charge_type: "lost_key",
    description: "Lost room key replacement",
    amount: 8.0,
    quantity: 1,
    total_amount: 8.0,
    currency: "USD",

    charged_at: "2026-01-24 16:55:00",
    charged_by: 2,

    requires_approval: false,
    is_approved: true,
    approved_by: null,
    approved_at: null,
  }
]
