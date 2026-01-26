/*

CREATE OR REPLACE VIEW view_setting_permission AS
SELECT 
    p.permission_id,
    p.permission_name,
    p.display_name,
    p.module,
    p.action,
    p.description,
    p.is_active,
    p.created_at,
    -- how many roles use this permission
    COUNT(rp.role_id) AS total_roles
FROM permissions p
LEFT JOIN role_permissions rp
  ON p.permission_id = rp.permission_id
GROUP BY
  p.permission_id,
  p.permission_name,
  p.display_name,
  p.module,
  p.action,
  p.description,
  p.is_active,
  p.created_at
ORDER BY p.module, p.permission_id;

*/

export const setting_permission = [
  {
    permission_id: 1,
    permission_name: "view_reservations",
    display_name: "View Reservations",
    module: "reservations",
    action: "view",
    description: "Allow user to view reservation list and details",
    is_active: true,
    created_at: "2025-01-01 09:00:00",
    total_roles: 3,
  },
  {
    permission_id: 2,
    permission_name: "create_reservations",
    display_name: "Create Reservation",
    module: "reservations",
    action: "create",
    description: "Allow user to create new reservations",
    is_active: true,
    created_at: "2025-01-01 09:00:00",
    total_roles: 2,
  },
  {
    permission_id: 3,
    permission_name: "assign_housekeeping",
    display_name: "Assign Housekeeping Task",
    module: "housekeeping",
    action: "assign",
    description: "Allow user to assign cleaning tasks to staff",
    is_active: true,
    created_at: "2025-01-02 10:00:00",
    total_roles: 1,
  },
  {
    permission_id: 4,
    permission_name: "process_payment",
    display_name: "Process Payment",
    module: "billing",
    action: "pay",
    description: "Allow user to process guest payments",
    is_active: true,
    created_at: "2025-01-02 11:00:00",
    total_roles: 1,
  },
  {
    permission_id: 5,
    permission_name: "manage_users",
    display_name: "Manage Users",
    module: "settings",
    action: "manage_users",
    description: "Allow admin to create, edit, and deactivate users",
    is_active: true,
    created_at: "2025-01-03 08:30:00",
    total_roles: 1,
  }
];
