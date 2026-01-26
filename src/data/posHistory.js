/*

CREATE OR REPLACE VIEW v_pos_history AS
SELECT
    pt.pos_id,
    pt.pos_number,
    pt.opened_at,
    pt.closed_at,

    b.booking_number,
    i.invoice_number,

    g.guest_id,
    CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
    g.phone,

    SUM(ii.total_amount) AS total_amount,
    p.payment_method,
    p.status AS payment_status,

    u.first_name AS cashier_name

FROM pos_transactions pt
LEFT JOIN bookings b ON pt.booking_id = b.booking_id
LEFT JOIN invoices i ON pt.invoice_id = i.invoice_id
LEFT JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
LEFT JOIN payments p ON i.invoice_id = p.invoice_id
LEFT JOIN guests g ON p.guest_id = g.guest_id
LEFT JOIN users u ON pt.opened_by = u.user_id

GROUP BY pt.pos_id;


*/


export const posHistory = [
  {
    pos_id: 1,
    pos_number: "POS20260001",
    opened_at: "2026-01-23 09:15:00",
    closed_at: "2026-01-23 09:20:00",

    guest: {
      guest_id: 12,
      name: "Sok Dara",
      phone: "012345678",
    },

    booking: {
      booking_id: 101,
      booking_number: "BK20260001",
    },

    rooms: [
      {
        room_number: "101",
        room_type: "VIP",
        beds: 2,
        booking_type: "nightly",
        quantity: 1,
        unit_price: 25,
        total: 25,
      },
      {
        room_number: "102",
        room_type: "Simple",
        beds: 1,
        booking_type: "hourly",
        quantity: 3,
        unit_price: 3,
        total: 9,
      },
    ],

    invoice: {
      invoice_number: "INV20260001",
      subtotal: 34,
      discount: 0,
      tax: 0,
      total: 34,
    },

    payment: {
      method: "ABA KHQR",
      currency: "USD",
      amount: 34,
      status: "completed",
      reference: "ABA99887766",
    },

    cashier: "Nary",
  },

  {
    pos_id: 2,
    pos_number: "POS20260002",
    opened_at: "2026-01-23 10:40:00",
    closed_at: "2026-01-23 10:45:00",

    guest: {
      guest_id: 15,
      name: "John Smith",
      phone: "098765432",
    },

    booking: {
      booking_id: 102,
      booking_number: "BK20260002",
    },

    rooms: [
      {
        room_number: "203",
        room_type: "VIP",
        beds: 2,
        booking_type: "nightly",
        quantity: 2,
        unit_price: 28,
        total: 56,
      },
    ],

    invoice: {
      invoice_number: "INV20260002",
      subtotal: 56,
      discount: 6,
      tax: 0,
      total: 50,
    },

    payment: {
      method: "Cash USD",
      currency: "USD",
      amount: 50,
      status: "completed",
      reference: "CASH-0002",
    },

    cashier: "Dara",
  },

  {
    pos_id: 3,
    pos_number: "POS20260003",
    opened_at: "2026-01-23 13:05:00",
    closed_at: "2026-01-23 13:10:00",

    guest: {
      guest_id: 18,
      name: "Lina Chan",
      phone: "011223344",
    },

    booking: {
      booking_id: 103,
      booking_number: "BK20260003",
    },

    rooms: [
      {
        room_number: "105",
        room_type: "Simple",
        beds: 1,
        booking_type: "hourly",
        quantity: 4,
        unit_price: 3,
        total: 12,
      },
    ],

    invoice: {
      invoice_number: "INV20260003",
      subtotal: 12,
      discount: 0,
      tax: 0,
      total: 12,
    },

    payment: {
      method: "Wing",
      currency: "USD",
      amount: 12,
      status: "completed",
      reference: "WING445566",
    },

    cashier: "Nary",
  },

  {
    pos_id: 4,
    pos_number: "POS20260004",
    opened_at: "2026-01-23 15:30:00",
    closed_at: "2026-01-23 15:40:00",

    guest: {
      guest_id: 21,
      name: "Kim Hour",
      phone: "099887766",
    },

    booking: {
      booking_id: 104,
      booking_number: "BK20260004",
    },

    rooms: [
      {
        room_number: "301",
        room_type: "VIP",
        beds: 2,
        booking_type: "nightly",
        quantity: 3,
        unit_price: 30,
        total: 90,
      },
    ],

    invoice: {
      invoice_number: "INV20260004",
      subtotal: 90,
      discount: 10,
      tax: 0,
      total: 80,
    },

    payment: {
      method: "ABA KHQR",
      currency: "USD",
      amount: 80,
      status: "completed",
      reference: "ABA22334455",
    },

    cashier: "Dara",
  },
];
