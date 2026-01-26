/*

SELECT 
    r.room_id,
    r.room_number,
    rt.type_name AS room_type,
    COUNT(res.reservation_id) AS total_stays,
    SUM(
      CASE 
        WHEN s.duration_type = 'night' THEN s.nights
        ELSE 0 
      END
    ) AS total_nights,
    SUM(
      CASE 
        WHEN s.duration_type = 'hour' THEN s.hours
        ELSE 0 
      END
    ) AS total_hours,
    SUM(i.total_amount) AS total_revenue,
    SUM(
      CASE WHEN p.method = 'cash' THEN p.amount ELSE 0 END
    ) AS cash_revenue,
    SUM(
      CASE WHEN p.method = 'aba' THEN p.amount ELSE 0 END
    ) AS aba_revenue,
    SUM(
      CASE WHEN p.method = 'card' THEN p.amount ELSE 0 END
    ) AS card_revenue
FROM rooms r
JOIN room_types rt 
   ON r.room_type_id = rt.room_type_id
LEFT JOIN reservations res
   ON res.room_id = r.room_id
LEFT JOIN stays s
   ON s.reservation_id = res.reservation_id
LEFT JOIN invoices i
   ON i.reservation_id = res.reservation_id
LEFT JOIN payments p
   ON p.invoice_id = i.invoice_id
WHERE res.check_in BETWEEN '2026-01-10' AND '2026-01-13'
GROUP BY r.room_id, r.room_number, rt.type_name
ORDER BY total_revenue DESC;

*/

// Room Sales Report (computed from rooms + reservations + invoices)
export const reports_room_sales = [
  {
    room_id: 101,
    room_number: "101",
    room_type: "Deluxe",

    total_stays: 6,
    total_nights: 8,
    total_hours: 6,

    total_revenue: 480.0,

    cash_revenue: 200.0,
    aba_revenue: 180.0,
    card_revenue: 100.0,
  },

  {
    room_id: 102,
    room_number: "102",
    room_type: "Standard",

    total_stays: 4,
    total_nights: 5,
    total_hours: 9,

    total_revenue: 320.0,

    cash_revenue: 150.0,
    aba_revenue: 120.0,
    card_revenue: 50.0,
  },

  {
    room_id: 201,
    room_number: "201",
    room_type: "Suite",

    total_stays: 3,
    total_nights: 7,
    total_hours: 0,

    total_revenue: 700.0,

    cash_revenue: 250.0,
    aba_revenue: 300.0,
    card_revenue: 150.0,
  },

  {
    room_id: 202,
    room_number: "202",
    room_type: "Family",

    total_stays: 5,
    total_nights: 6,
    total_hours: 4,

    total_revenue: 520.0,

    cash_revenue: 220.0,
    aba_revenue: 200.0,
    card_revenue: 100.0,
  },
];
