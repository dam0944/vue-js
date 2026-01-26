export const housekeeping_Task = [
  {
    task_id: 1,
    room_id: 101,                 // FK -> rooms.room_id
    task_date: "2026-01-16",
    task_type: "checkout_cleaning", // checkout_cleaning | daily_cleaning | deep_cleaning | turndown | inspection
    priority: "high",              // low | normal | high | urgent
    status: "pending",             // pending | in_progress | completed | skipped
    assigned_to: 2,                // FK -> users.user_id (housekeeper)
    started_at: null,
    completed_at: null,
    notes: "Full room cleaning after checkout, replace linens and sanitize bathroom.",
  },

  {
    task_id: 2,
    room_id: 102,
    task_date: "2026-01-16",
    task_type: "daily_cleaning",
    priority: "normal",
    status: "in_progress",
    assigned_to: 3,
    started_at: "2026-01-16 09:10:00",
    completed_at: null,
    notes: "Standard daily cleaning, refresh towels.",
  },

  {
    task_id: 3,
    room_id: 103,
    task_date: "2026-01-16",
    task_type: "deep_cleaning",
    priority: "urgent",
    status: "pending",
    assigned_to: 4,
    started_at: null,
    completed_at: null,
    notes: "Deep clean carpets, curtains, and AC filter.",
  },

  {
    task_id: 4,
    room_id: 104,
    task_date: "2026-01-16",
    task_type: "turndown",
    priority: "low",
    status: "completed",
    assigned_to: 3,
    started_at: "2026-01-15 19:00:00",
    completed_at: "2026-01-15 19:25:00",
    notes: "Evening turndown service completed.",
  },

  {
    task_id: 5,
    room_id: 105,
    task_date: "2026-01-16",
    task_type: "inspection",
    priority: "normal",
    status: "pending",
    assigned_to: 1, // supervisor
    started_at: null,
    completed_at: null,
    notes: "Room inspection before check-in.",
  },
];
