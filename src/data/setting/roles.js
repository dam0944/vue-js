/*

CREATE OR REPLACE VIEW view_setting_roles AS
SELECT
  r.role_id,
  r.role_name,
  r.display_name,
  r.description,
  r.is_system_role,
  r.is_active,
  r.created_at,
  r.updated_at,
  COUNT(ur.user_id) AS total_users
FROM roles r
LEFT JOIN user_roles ur
  ON r.role_id = ur.role_id
  AND ur.is_active = TRUE
GROUP BY
  r.role_id,
  r.role_name,
  r.display_name,
  r.description,
  r.is_system_role,
  r.is_active,
  r.created_at,
  r.updated_at
ORDER BY r.role_id;

*/
export const setting_roles = [
  {
    role_id: 1,
    role_name: "admin",
    display_name: "System Administrator",
    description: "Full access to all system modules and settings",
    is_system_role: true,
    is_active: true,
    created_at: "2025-01-01 09:00:00",
    updated_at: "2025-01-01 09:00:00",
    total_users: 1,
  },
  {
    role_id: 2,
    role_name: "manager",
    display_name: "Hotel Manager",
    description: "Manage rooms, reservations, billing, and staff",
    is_system_role: false,
    is_active: true,
    created_at: "2025-01-02 09:00:00",
    updated_at: "2025-01-02 09:00:00",
    total_users: 1,
  },
  {
    role_id: 3,
    role_name: "reception",
    display_name: "Reception Staff",
    description: "Handle check-in/out, reservations, and guests",
    is_system_role: false,
    is_active: true,
    created_at: "2025-01-03 09:00:00",
    updated_at: "2025-01-03 09:00:00",
    total_users: 2,
  },
  {
    role_id: 4,
    role_name: "housekeeping",
    display_name: "Housekeeping Staff",
    description: "Manage room cleaning and maintenance tasks",
    is_system_role: false,
    is_active: true,
    created_at: "2025-01-04 09:00:00",
    updated_at: "2025-01-04 09:00:00",
    total_users: 3,
  },
  {
    role_id: 5,
    role_name: "accountant",
    display_name: "Accountant",
    description: "Handle invoices, payments, and financial reports",
    is_system_role: false,
    is_active: true,
    created_at: "2025-01-05 09:00:00",
    updated_at: "2025-01-05 09:00:00",
    total_users: 0,
  }
];
