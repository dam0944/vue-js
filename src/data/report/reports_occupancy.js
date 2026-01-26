/*
SELECT
  d.report_date,
  (SELECT COUNT(*) FROM rooms) AS total_rooms,
  SUM(CASE WHEN r.reservation_id IS NOT NULL THEN 1 ELSE 0 END) AS occupied_rooms,
  (SELECT COUNT(*) FROM rooms) - SUM(CASE WHEN r.reservation_id IS NOT NULL THEN 1 ELSE 0 END) AS available_rooms,
  ROUND(
    (SUM(CASE WHEN r.reservation_id IS NOT NULL THEN 1 ELSE 0 END) / (SELECT COUNT(*) FROM rooms)) * 100,
    2
  ) AS occupancy_rate
FROM (
  -- build dates (example 7 days)
  SELECT CURDATE() - INTERVAL 0 DAY AS report_date
  UNION ALL SELECT CURDATE() - INTERVAL 1 DAY
  UNION ALL SELECT CURDATE() - INTERVAL 2 DAY
  UNION ALL SELECT CURDATE() - INTERVAL 3 DAY
  UNION ALL SELECT CURDATE() - INTERVAL 4 DAY
  UNION ALL SELECT CURDATE() - INTERVAL 5 DAY
  UNION ALL SELECT CURDATE() - INTERVAL 6 DAY
) d
LEFT JOIN reservations r
  ON d.report_date >= r.check_in_date
 AND d.report_date <  r.check_out_date
 AND r.status IN ('confirmed','checked_in','checked_out')
GROUP BY d.report_date
ORDER BY d.report_date DESC;
*/

export const reports_occupancy = [
  {
    date: "2026-01-10",
    total_rooms: 40,
    occupied_rooms: 28,
    available_rooms: 8,
    reserved_rooms: 2,
    maintenance_rooms: 2,
    occupancy_rate: 70.0,

    // optional KPIs (computed from reservations / invoices)
    adr: 53.57,
    revpar: 37.5,
    room_revenue: 1500.0,
    other_revenue: 180.0,
    total_revenue: 1680.0,

    // optional ops counts (computed)
    total_checkins: 9,
    total_checkouts: 7,
    total_reservations: 11,
  },

  {
    date: "2026-01-11",
    total_rooms: 40,
    occupied_rooms: 31,
    available_rooms: 6,
    reserved_rooms: 1,
    maintenance_rooms: 2,
    occupancy_rate: 77.5,

    adr: 56.77,
    revpar: 44.0,
    room_revenue: 1760.0,
    other_revenue: 180.0,
    total_revenue: 1940.0,

    total_checkins: 12,
    total_checkouts: 8,
    total_reservations: 14,
  },

  {
    date: "2026-01-12",
    total_rooms: 40,
    occupied_rooms: 35,
    available_rooms: 3,
    reserved_rooms: 0,
    maintenance_rooms: 2,
    occupancy_rate: 87.5,

    adr: 58.29,
    revpar: 51.0,
    room_revenue: 2040.0,
    other_revenue: 220.0,
    total_revenue: 2260.0,

    total_checkins: 15,
    total_checkouts: 10,
    total_reservations: 18,
  },

  {
    date: "2026-01-13",
    total_rooms: 40,
    occupied_rooms: 22,
    available_rooms: 14,
    reserved_rooms: 2,
    maintenance_rooms: 2,
    occupancy_rate: 55.0,

    adr: 50.0,
    revpar: 27.5,
    room_revenue: 1100.0,
    other_revenue: 140.0,
    total_revenue: 1240.0,

    total_checkins: 6,
    total_checkouts: 9,
    total_reservations: 8,
  },
]
