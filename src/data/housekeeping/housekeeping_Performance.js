// src/data/housekeeping/housekeepingPerformance.js
// This dataset is derived from: housekeeping_tasks + users performance

export const housekeeping_performance = [
  {
    staff_id: 2,                // users.user_id
    staff_name: "Sok Vanna",
    role: "Cleaner",

    total_tasks: 18,
    completed_tasks: 16,
    skipped_tasks: 1,
    pending_tasks: 1,

    on_time_rate: 89,           // %
    avg_minutes_per_task: 32,

    tasks_by_type: {
      daily_cleaning: 10,
      checkout_cleaning: 5,
      turndown: 2,
      deep_cleaning: 1,
    },

    last_activity: "2026-01-16 08:55:00",
  },

  {
    staff_id: 3,
    staff_name: "Dara Nita",
    role: "Housekeeping",

    total_tasks: 14,
    completed_tasks: 10,
    skipped_tasks: 2,
    pending_tasks: 2,

    on_time_rate: 72,
    avg_minutes_per_task: 41,

    tasks_by_type: {
      daily_cleaning: 7,
      checkout_cleaning: 4,
      turndown: 2,
      inspection: 1,
    },

    last_activity: "2026-01-16 19:00:00",
  },

  {
    staff_id: 4,
    staff_name: "Chan Rithy",
    role: "Senior Cleaner",

    total_tasks: 12,
    completed_tasks: 11,
    skipped_tasks: 0,
    pending_tasks: 1,

    on_time_rate: 94,
    avg_minutes_per_task: 28,

    tasks_by_type: {
      daily_cleaning: 6,
      checkout_cleaning: 3,
      deep_cleaning: 2,
      inspection: 1,
    },

    last_activity: "2026-01-16 09:15:00",
  },

  {
    staff_id: 1,
    staff_name: "Srey Mom",
    role: "Supervisor",

    total_tasks: 8,
    completed_tasks: 7,
    skipped_tasks: 0,
    pending_tasks: 1,

    on_time_rate: 96,
    avg_minutes_per_task: 18,

    tasks_by_type: {
      inspection: 5,
      quality_check: 3,
    },

    last_activity: "2026-01-16 09:00:00",
  },
];
