// Static data that follows table: housekeeping_tasks

export const roomMaintenanceData = [
  {
    task_id: 1,
    property_id: 1,
    room_id: 101,
    room_number: "101",

    task_type: "maintenance", // cleaning | maintenance | inspection | deep_clean | turndown
    priority: "high",        // low | normal | high | urgent
    status: "pending",       // pending | in_progress | completed | cancelled

    assigned_to: 3,
    assigned_name: "Sokha",

    assigned_at: "2026-01-28 09:10:00",
    started_at: null,
    completed_at: null,

    notes: "Air conditioner not cooling properly.",
    completion_notes: "",
    issues_found: "",

    created_by: 2,
    created_at: "2026-01-28 09:00:00",
    updated_at: "2026-01-28 09:10:00",
  },

  {
    task_id: 2,
    property_id: 1,
    room_id: 102,
    room_number: "102",

    task_type: "cleaning",
    priority: "normal",
    status: "completed",

    assigned_to: 4,
    assigned_name: "Dara",

    assigned_at: "2026-01-27 12:00:00",
    started_at: "2026-01-27 12:15:00",
    completed_at: "2026-01-27 12:40:00",

    notes: "Guest checked out. Standard cleaning required.",
    completion_notes: "Room cleaned, bedsheets replaced.",
    issues_found: "",

    created_by: 2,
    created_at: "2026-01-27 11:50:00",
    updated_at: "2026-01-27 12:40:00",
  },

  {
    task_id: 3,
    property_id: 1,
    room_id: 201,
    room_number: "201",

    task_type: "inspection",
    priority: "urgent",
    status: "in_progress",

    assigned_to: 5,
    assigned_name: "Vanna",

    assigned_at: "2026-01-28 08:00:00",
    started_at: "2026-01-28 08:20:00",
    completed_at: null,

    notes: "Strange smell reported by guest.",
    completion_notes: "",
    issues_found: "Possible plumbing leak in bathroom.",

    created_by: 2,
    created_at: "2026-01-28 07:50:00",
    updated_at: "2026-01-28 08:20:00",
  },

  {
    task_id: 4,
    property_id: 1,
    room_id: 301,
    room_number: "301",

    task_type: "deep_clean",
    priority: "low",
    status: "pending",

    assigned_to: null,
    assigned_name: null,

    assigned_at: null,
    started_at: null,
    completed_at: null,

    notes: "Monthly deep clean schedule.",
    completion_notes: "",
    issues_found: "",

    created_by: 1,
    created_at: "2026-01-26 10:00:00",
    updated_at: "2026-01-26 10:00:00",
  },

  {
    task_id: 5,
    property_id: 1,
    room_id: 202,
    room_number: "202",

    task_type: "maintenance",
    priority: "normal",
    status: "cancelled",

    assigned_to: 3,
    assigned_name: "Sokha",

    assigned_at: "2026-01-25 14:00:00",
    started_at: null,
    completed_at: null,

    notes: "TV remote not working.",
    completion_notes: "Guest fixed it himself. Task cancelled.",
    issues_found: "",

    created_by: 2,
    created_at: "2026-01-25 13:50:00",
    updated_at: "2026-01-25 14:10:00",
  },
]
