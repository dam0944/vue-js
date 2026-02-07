// Static data based on table: housekeeping_tasks
// Page: Housekeeping → Today

export const housekeepingToday = [
  {
    task_id: 1,
    property_id: 1,
    room_id: 101,

    task_type: "cleaning",        // cleaning | maintenance | inspection | deep_clean | turndown
    priority: "high",             // low | normal | high | urgent
    status: "pending",            // pending | in_progress | completed | cancelled

    assigned_to: 6,
    assigned_at: "2026-02-01 08:10:00",
    started_at: null,
    completed_at: null,

    notes: "Guest checked out early, room needs quick cleaning",
    completion_notes: null,
    issues_found: null,

    created_by: 3,
    created_at: "2026-02-01 08:05:00",
    updated_at: "2026-02-01 08:10:00",
  },

  {
    task_id: 2,
    property_id: 1,
    room_id: 203,

    task_type: "deep_clean",
    priority: "normal",
    status: "in_progress",

    assigned_to: 7,
    assigned_at: "2026-02-01 09:00:00",
    started_at: "2026-02-01 09:15:00",
    completed_at: null,

    notes: "Monthly deep clean schedule",
    completion_notes: null,
    issues_found: "Curtain slightly damaged",

    created_by: 3,
    created_at: "2026-02-01 08:50:00",
    updated_at: "2026-02-01 09:15:00",
  },

  {
    task_id: 3,
    property_id: 1,
    room_id: 305,

    task_type: "maintenance",
    priority: "urgent",
    status: "pending",

    assigned_to: 8,
    assigned_at: "2026-02-01 10:20:00",
    started_at: null,
    completed_at: null,

    notes: "Air conditioner not cooling",
    completion_notes: null,
    issues_found: null,

    created_by: 4,
    created_at: "2026-02-01 10:05:00",
    updated_at: "2026-02-01 10:20:00",
  },

  {
    task_id: 4,
    property_id: 1,
    room_id: 112,

    task_type: "inspection",
    priority: "low",
    status: "completed",

    assigned_to: 6,
    assigned_at: "2026-02-01 07:45:00",
    started_at: "2026-02-01 07:50:00",
    completed_at: "2026-02-01 08:20:00",

    notes: "Routine morning inspection",
    completion_notes: "All good, no issues",
    issues_found: null,

    created_by: 3,
    created_at: "2026-02-01 07:40:00",
    updated_at: "2026-02-01 08:20:00",
  },

  {
    task_id: 5,
    property_id: 1,
    room_id: 220,

    task_type: "turndown",
    priority: "normal",
    status: "completed",

    assigned_to: 7,
    assigned_at: "2026-02-01 18:30:00",
    started_at: "2026-02-01 18:40:00",
    completed_at: "2026-02-01 18:55:00",

    notes: "VIP guest evening turndown service",
    completion_notes: "Water and towel prepared",
    issues_found: null,

    created_by: 3,
    created_at: "2026-02-01 18:20:00",
    updated_at: "2026-02-01 18:55:00",
  }
];
