/*

SELECT 
    DATE(i.created_at) AS report_date,
    SUM(i.total_amount) AS total_revenue,
    SUM(CASE WHEN i.type = 'room' THEN i.total_amount ELSE 0 END) 
        AS room_revenue,
    SUM(CASE WHEN i.type = 'food_beverage' THEN i.total_amount ELSE 0 END) 
        AS food_beverage_revenue,
    SUM(CASE WHEN i.type = 'laundry' THEN i.total_amount ELSE 0 END) 
        AS laundry_revenue,
    SUM(CASE WHEN i.type = 'other_service' THEN i.total_amount ELSE 0 END) 
        AS other_services_revenue,
    SUM(CASE WHEN p.method = 'cash' THEN p.amount ELSE 0 END) AS cash_collected,
    SUM(CASE WHEN p.method = 'aba' THEN p.amount ELSE 0 END) AS aba_collected,
    SUM(CASE WHEN p.method = 'card' THEN p.amount ELSE 0 END) AS card_collected,
    COUNT(DISTINCT r.reservation_id) AS total_checkins,
    COUNT(DISTINCT i.invoice_id) AS total_invoices,
    COUNT(DISTINCT p.payment_id) AS total_transactions
FROM invoices i
LEFT JOIN payments p 
   ON p.invoice_id = i.invoice_id
LEFT JOIN reservations r
   ON r.reservation_id = i.reservation_idx
WHERE i.created_at BETWEEN '2026-01-10' AND '2026-01-13'
GROUP BY DATE(i.created_at)
ORDER BY report_date;

*/

// Derived from: reservations + invoices + POS + deposits

export const reports_revenue = [
  {
    date: "2026-01-10",
    total_revenue: 1680.0,

    // breakdown
    room_revenue: 1500.0,
    food_beverage_revenue: 120.0,
    laundry_revenue: 40.0,
    other_services_revenue: 20.0,

    // payments received
    cash_collected: 820.0,
    aba_collected: 520.0,
    card_collected: 340.0,

    // business metrics
    total_checkins: 9,
    total_checkouts: 7,
    total_invoices: 14,
    total_transactions: 22,
  },

  {
    date: "2026-01-11",
    total_revenue: 1940.0,

    room_revenue: 1760.0,
    food_beverage_revenue: 100.0,
    laundry_revenue: 60.0,
    other_services_revenue: 20.0,

    cash_collected: 900.0,
    aba_collected: 700.0,
    card_collected: 340.0,

    total_checkins: 12,
    total_checkouts: 8,
    total_invoices: 16,
    total_transactions: 25,
  },

  {
    date: "2026-01-12",
    total_revenue: 2260.0,

    room_revenue: 2040.0,
    food_beverage_revenue: 140.0,
    laundry_revenue: 60.0,
    other_services_revenue: 20.0,

    cash_collected: 1100.0,
    aba_collected: 760.0,
    card_collected: 400.0,

    total_checkins: 15,
    total_checkouts: 10,
    total_invoices: 20,
    total_transactions: 30,
  },

  {
    date: "2026-01-13",
    total_revenue: 1240.0,

    room_revenue: 1100.0,
    food_beverage_revenue: 80.0,
    laundry_revenue: 40.0,
    other_services_revenue: 20.0,

    cash_collected: 600.0,
    aba_collected: 400.0,
    card_collected: 240.0,

    total_checkins: 6,
    total_checkouts: 9,
    total_invoices: 10,
    total_transactions: 15,
  },
];
