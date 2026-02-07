// Static data based on table: payment_refunds

export const refunds = [
  {
    refund_id: 1,
    payment_id: 12,
    invoice_id: 5,
    refund_number: "RF20260120-0001",

    refund_amount: 25.00,
    refund_method: "original_method", // cash | credit_card | bank_transfer | original_method
    refund_reason: "Guest cancelled minibar charge",

    refund_date: "2026-01-20 10:15:00",

    processed_by: 3,
    approved_by: 2,

    status: "completed", // pending | approved | completed | rejected
    notes: "Refund processed after invoice adjustment"
  },

  {
    refund_id: 2,
    payment_id: 18,
    invoice_id: 9,
    refund_number: "RF20260121-0002",

    refund_amount: 15.00,
    refund_method: "cash",
    refund_reason: "Overpayment at checkout",

    refund_date: "2026-01-21 14:42:00",

    processed_by: 4,
    approved_by: 2,

    status: "approved",
    notes: "Waiting for cash drawer reconciliation"
  },

  {
    refund_id: 3,
    payment_id: 21,
    invoice_id: 11,
    refund_number: "RF20260122-0003",

    refund_amount: 60.00,
    refund_method: "credit_card",
    refund_reason: "Room maintenance issue compensation",

    refund_date: "2026-01-22 09:05:00",

    processed_by: 3,
    approved_by: null,

    status: "pending",
    notes: "Manager approval required"
  },

  {
    refund_id: 4,
    payment_id: 24,
    invoice_id: 14,
    refund_number: "RF20260123-0004",

    refund_amount: 10.00,
    refund_method: "bank_transfer",
    refund_reason: "Duplicate laundry charge",

    refund_date: "2026-01-23 16:30:00",

    processed_by: 5,
    approved_by: 2,

    status: "completed",
    notes: "Refund transferred to guest bank account"
  },

  {
    refund_id: 5,
    payment_id: 29,
    invoice_id: 17,
    refund_number: "RF20260124-0005",

    refund_amount: 45.00,
    refund_method: "original_method",
    refund_reason: "Promo code applied after payment",

    refund_date: "2026-01-24 11:18:00",

    processed_by: 3,
    approved_by: null,

    status: "rejected",
    notes: "Promo was invalid for this booking"
  }
];
