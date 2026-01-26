/*
CREATE VIEW view_pos_closing AS
SELECT
    pt.pos_id,
    pt.pos_number,
    pt.opened_at,
    pt.closed_at,
    u.first_name AS cashier_first_name,
    u.last_name AS cashier_last_name,
    g.guest_id,
    CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
    g.phone AS guest_phone,
    r.booking_number,
    r.booking_type,
    rm.room_number,
    rm.room_type,
    rm.beds,
    inv.invoice_id,
    inv.invoice_number,
    inv.subtotal,
    inv.discount,
    inv.tax,
    inv.total,
    pay.method AS payment_method,
    pay.status AS payment_status,
    pay.reference AS payment_reference
FROM pos_transactions pt
LEFT JOIN invoices inv 
    ON pt.invoice_id = inv.invoice_id
LEFT JOIN invoice_payments pay
    ON inv.invoice_id = pay.invoice_id
LEFT JOIN reservations r
    ON inv.reservation_id = r.reservation_id
LEFT JOIN guests g
    ON r.guest_id = g.guest_id
LEFT JOIN reservation_rooms rr
    ON r.reservation_id = rr.reservation_id
LEFT JOIN rooms rm
    ON rr.room_id = rm.room_id
LEFT JOIN users u
    ON pt.user_id = u.user_id;
*/
export const posClosingData = {
  shift: {
    shift_id: "SHIFT-2026-01-24-A",
    cashier: "Dara Sok",
    opened_at: "2026-01-24 08:00:00",
    closing_at: "2026-01-24 17:30:00",
    opening_cash: 200.00,
    expected_cash: 1250.50,
    actual_cash: 1245.50,
  },

  summary: {
    total_receipts: 18,
    total_revenue: 4280.50,
    total_discount: 120.00,
    total_tax: 0,
  },

  payments_breakdown: [
    { method: "Cash USD", amount: 1245.50 },
    { method: "ABA KHQR", amount: 2200.00 },
    { method: "Cash KHR", amount: 300.00 },
    { method: "Wing", amount: 350.00 },
    { method: "Bank Transfer", amount: 185.00 },
  ],

  receipts: [
    {
      pos_id: 1,
      pos_number: "POS-0001",
      guest_name: "Sok Dara",
      room_numbers: ["101", "102"],
      booking_type: "nightly",
      total: 220.00,
      payment_method: "ABA KHQR",
      status: "completed",
      closed_at: "2026-01-24 08:45:00",
    },
    {
      pos_id: 2,
      pos_number: "POS-0002",
      guest_name: "Chantha",
      room_numbers: ["103"],
      booking_type: "hourly",
      total: 45.00,
      payment_method: "Cash USD",
      status: "completed",
      closed_at: "2026-01-24 09:20:00",
    },
    {
      pos_id: 3,
      pos_number: "POS-0003",
      guest_name: "Vichea",
      room_numbers: ["201"],
      booking_type: "nightly",
      total: 120.00,
      payment_method: "Cash USD",
      status: "completed",
      closed_at: "2026-01-24 10:05:00",
    },
    {
      pos_id: 4,
      pos_number: "POS-0004",
      guest_name: "Sreyleak",
      room_numbers: ["202"],
      booking_type: "hourly",
      total: 60.00,
      payment_method: "Wing",
      status: "completed",
      closed_at: "2026-01-24 10:40:00",
    },
    {
      pos_id: 5,
      pos_number: "POS-0005",
      guest_name: "John Smith",
      room_numbers: ["301"],
      booking_type: "nightly",
      total: 180.00,
      payment_method: "ABA KHQR",
      status: "completed",
      closed_at: "2026-01-24 11:15:00",
    },
    {
      pos_id: 6,
      pos_number: "POS-0006",
      guest_name: "Kimly",
      room_numbers: ["104"],
      booking_type: "hourly",
      total: 30.00,
      payment_method: "Cash USD",
      status: "completed",
      closed_at: "2026-01-24 12:10:00",
    },
    {
      pos_id: 7,
      pos_number: "POS-0007",
      guest_name: "Rathana",
      room_numbers: ["203"],
      booking_type: "nightly",
      total: 200.00,
      payment_method: "ABA KHQR",
      status: "completed",
      closed_at: "2026-01-24 13:00:00",
    },
    {
      pos_id: 8,
      pos_number: "POS-0008",
      guest_name: "Sothea",
      room_numbers: ["105"],
      booking_type: "hourly",
      total: 50.00,
      payment_method: "Cash KHR",
      status: "completed",
      closed_at: "2026-01-24 14:10:00",
    },
    {
      pos_id: 9,
      pos_number: "POS-0009",
      guest_name: "David Lee",
      room_numbers: ["302"],
      booking_type: "nightly",
      total: 210.00,
      payment_method: "Bank Transfer",
      status: "completed",
      closed_at: "2026-01-24 15:30:00",
    },
    {
      pos_id: 10,
      pos_number: "POS-0010",
      guest_name: "Nary",
      room_numbers: ["106"],
      booking_type: "hourly",
      total: 35.00,
      payment_method: "Cash USD",
      status: "completed",
      closed_at: "2026-01-24 16:05:00",
    },
  ],
}
