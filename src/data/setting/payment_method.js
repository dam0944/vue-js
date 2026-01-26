/*

CREATE OR REPLACE VIEW view_payment_method_report AS
SELECT
  payment_method,
  COUNT(*) AS total_transactions,
  SUM(amount) AS total_amount,
  MAX(payment_date) AS last_used_at
FROM payments
GROUP BY payment_method
ORDER BY total_amount DESC;


SELECT * FROM view_payment_methods;

*/

export const payment_method = [
  {
    code: "cash",
    label: "Cash",
    db_value: "cash",
    icon: "payments",
    description: "Pay by physical cash",
    is_active: true,
  },
  {
    code: "aba",
    label: "ABA Transfer",
    db_value: "bank_transfer",
    icon: "account_balance",
    description: "ABA bank transfer",
    is_active: true,
  },
  {
    code: "wing",
    label: "Wing",
    db_value: "mobile_payment",
    icon: "phone_iphone",
    description: "Wing mobile payment",
    is_active: true,
  },
  {
    code: "bakong",
    label: "Bakong",
    db_value: "mobile_payment",
    icon: "qr_code",
    description: "Bakong QR payment",
    is_active: true,
  },
  {
    code: "card",
    label: "Credit / Debit Card",
    db_value: "credit_card",
    icon: "credit_card",
    description: "Visa, Master, UnionPay",
    is_active: true,
  },
  {
    code: "other",
    label: "Other",
    db_value: "other",
    icon: "more_horiz",
    description: "Other payment method",
    is_active: true,
  },
];
