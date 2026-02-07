export const users = [
  {
    user_id: 1,
    property_id: null, // access all properties

    username: "superadmin",
    email: "admin@palmguesthouse.com",
    password_hash: "$2y$10$examplehash",

    first_name: "Sok",
    last_name: "Dara",
    phone: "+85512345678",
    profile_image: "https://randomuser.me/api/portraits/men/32.jpg",

    status: "active",
    employee_id: "EMP-001",
    position: "owner",

    failed_login_attempts: 0,
    last_failed_login: null,
    account_locked_until: null,
    password_changed_at: "2026-01-01 09:00:00",
    must_change_password: false,

    last_login: "2026-02-03 10:30:00",
    last_login_ip: "192.168.1.20",

    created_at: "2026-01-01 08:00:00",
    updated_at: "2026-02-03 10:30:00",
    deleted_at: null,
  },

  {
    user_id: 2,
    property_id: 1,

    username: "reception01",
    email: "reception@palmguesthouse.com",
    password_hash: "$2y$10$examplehash",

    first_name: "Chan",
    last_name: "Sreyneang",
    phone: "+85588765432",
    profile_image: "https://randomuser.me/api/portraits/women/44.jpg",

    status: "active",
    employee_id: "EMP-002",
    position: "receptionist",

    failed_login_attempts: 1,
    last_failed_login: "2026-02-01 11:20:00",
    account_locked_until: null,
    password_changed_at: "2026-01-15 08:30:00",
    must_change_password: false,

    last_login: "2026-02-03 09:10:00",
    last_login_ip: "192.168.1.25",

    created_at: "2026-01-10 08:00:00",
    updated_at: "2026-02-03 09:10:00",
    deleted_at: null,
  },

  {
    user_id: 3,
    property_id: 1,

    username: "hk01",
    email: "housekeeping@palmguesthouse.com",
    password_hash: "$2y$10$examplehash",

    first_name: "Vannak",
    last_name: "Kim",
    phone: "+85588999888",
    profile_image: "https://randomuser.me/api/portraits/men/58.jpg",

    status: "inactive",
    employee_id: "EMP-003",
    position: "housekeeping",

    failed_login_attempts: 0,
    last_failed_login: null,
    account_locked_until: null,
    password_changed_at: "2026-01-20 07:00:00",
    must_change_password: true,

    last_login: null,
    last_login_ip: null,

    created_at: "2026-01-20 08:00:00",
    updated_at: "2026-02-01 12:00:00",
    deleted_at: null,
  },

  {
    user_id: 4,
    property_id: 1,

    username: "account01",
    email: "account@palmguesthouse.com",
    password_hash: "$2y$10$examplehash",

    first_name: "Lina",
    last_name: "Phan",
    phone: "+85577123456",
    profile_image: "https://randomuser.me/api/portraits/women/65.jpg",

    status: "suspended",
    employee_id: "EMP-004",
    position: "accountant",

    failed_login_attempts: 5,
    last_failed_login: "2026-02-02 14:30:00",
    account_locked_until: "2026-02-05 14:30:00",
    password_changed_at: "2026-01-05 09:00:00",
    must_change_password: false,

    last_login: "2026-02-01 16:00:00",
    last_login_ip: "192.168.1.30",

    created_at: "2026-01-05 08:00:00",
    updated_at: "2026-02-02 14:30:00",
    deleted_at: null,
  },
]
