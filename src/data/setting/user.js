/*

SELECT 
    u.user_id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.profile_image,
    u.status,
    u.created_at,
    u.last_login,
    GROUP_CONCAT(r.role_name) AS roles
FROM users u
LEFT JOIN user_roles ur 
  ON u.user_id = ur.user_id 
  AND ur.is_active = TRUE
LEFT JOIN roles r 
  ON ur.role_id = r.role_id 
  AND r.is_active = TRUE
GROUP BY
  u.user_id, 
  u.username, 
  u.email, 
  u.first_name, 
  u.last_name,  
  u.phone, 
  u.profile_image,
  u.status, 
  u.created_at, 
  u.last_login
ORDER BY u.created_at DESC;     

*/
export const setting_user = [
  {
    user_id: 1,
    username: "admin01",
    email: "admin@guesthouse.com",
    first_name: "Sok",
    last_name: "Dara",
    phone: "012345678",
    profile_image: null,
    status: "active",
    created_at: "2026-01-01 09:00:00",
    last_login: "2026-01-13 08:45:00",
    roles: ["admin"],
  },
  {
    user_id: 2,
    username: "manager01",
    email: "manager@guesthouse.com",
    first_name: "Bun",
    last_name: "Sothea",
    phone: "011223344",
    profile_image: null,
    status: "active",
    created_at: "2026-01-03 10:15:00",
    last_login: "2026-01-12 09:10:00",
    roles: ["manager"],
  },
  {
    user_id: 3,
    username: "house01",
    email: "cleaner1@guesthouse.com",
    first_name: "Chan",
    last_name: "Sophea",
    phone: "010998877",
    profile_image: null,
    status: "active",
    created_at: "2026-01-05 08:30:00",
    last_login: "2026-01-13 07:55:00",
    roles: ["housekeeping"],
  },
  {
    user_id: 4,
    username: "house02",
    email: "cleaner2@guesthouse.com",
    first_name: "Vann",
    last_name: "Rith",
    phone: "097776655",
    profile_image: null,
    status: "active",
    created_at: "2026-01-05 08:45:00",
    last_login: "2026-01-12 16:20:00",
    roles: ["housekeeping"],
  },
  {
    user_id: 5,
    username: "recept01",
    email: "reception@guesthouse.com",
    first_name: "Mey",
    last_name: "Sreynich",
    phone: "016554433",
    profile_image: null,
    status: "active",
    created_at: "2026-01-07 09:10:00",
    last_login: "2026-01-13 08:30:00",
    roles: ["reception"],
  },
];
