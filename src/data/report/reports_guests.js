/*

SELECT 
    g.guest_id,
    CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
    g.phone,
    g.nationality,
    COUNT(DISTINCT r.reservation_id) AS total_stays,
    SUM(
      CASE 
        WHEN r.status = 'checked_out' THEN 1 ELSE 0 
      END
    ) AS completed_stays,
    SUM(i.total_amount) AS total_spent,
    SUM(
      CASE WHEN p.payment_method = 'cash' THEN p.amount ELSE 0 END
    ) AS cash_spent,
    SUM(
      CASE WHEN p.payment_method = 'mobile_payment' THEN p.amount ELSE 0 END
    ) AS aba_spent,
    SUM(
      CASE WHEN p.payment_method = 'credit_card' THEN p.amount ELSE 0 END
    ) AS card_spent,
    MAX(r.check_out_date) AS last_visit
FROM guests g
LEFT JOIN reservations r
  ON r.guest_id = g.guest_id
LEFT JOIN invoices i
  ON i.reservation_id = r.reservation_id
LEFT JOIN payments p
  ON p.invoice_id = i.invoice_id
GROUP BY g.guest_id, g.first_name, g.last_name, g.phone, g.nationality
ORDER BY total_spent DESC;

*/


// Guest report (computed from guests + reservations + invoices + payments)

export const reports_guests = [
  {
    guest_id: 1,
    guest_name: "Sok Dara",
    phone: "012345678",
    nationality: "Cambodian",

    total_stays: 5,
    completed_stays: 4,

    total_spent: 920.0,

    cash_spent: 350.0,
    aba_spent: 420.0,
    card_spent: 150.0,

    last_visit: "2026-01-12",
  },

  {
    guest_id: 2,
    guest_name: "Chan Sophea",
    phone: "096123456",
    nationality: "Cambodian",

    total_stays: 3,
    completed_stays: 3,

    total_spent: 650.0,

    cash_spent: 200.0,
    aba_spent: 300.0,
    card_spent: 150.0,

    last_visit: "2026-01-10",
  },

  {
    guest_id: 3,
    guest_name: "John Smith",
    phone: "099888777",
    nationality: "USA",

    total_stays: 4,
    completed_stays: 3,

    total_spent: 1100.0,

    cash_spent: 400.0,
    aba_spent: 500.0,
    card_spent: 200.0,

    last_visit: "2026-01-11",
  },

  {
    guest_id: 4,
    guest_name: "Kim Sothea",
    phone: "097555444",
    nationality: "Cambodian",

    total_stays: 2,
    completed_stays: 2,

    total_spent: 420.0,

    cash_spent: 200.0,
    aba_spent: 120.0,
    card_spent: 100.0,

    last_visit: "2026-01-09",
  },
];
