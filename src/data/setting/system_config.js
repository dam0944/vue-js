// src/data/setting/config.js

export const system_config = [
  {
    key: "general",
    title: "General",
    description: "Basic property configuration and system defaults.",
    items: [
      {
        key: "property_name",
        label: "Property Name",
        type: "text",
        value: "Palm Guesthouse",
        hint: "Displayed on invoices, receipts, and reports.",
      },
      {
        key: "property_code",
        label: "Property Code",
        type: "text",
        value: "GH01",
        hint: "Short code used internally (e.g. GH01).",
      },
      {
        key: "timezone",
        label: "Timezone",
        type: "select",
        value: "Asia/Phnom_Penh",
        options: ["Asia/Phnom_Penh", "Asia/Bangkok", "Asia/Ho_Chi_Minh"],
        hint: "Affects reports and daily closing.",
      },
      {
        key: "business_day_cutoff",
        label: "Business Day Cutoff",
        type: "time",
        value: "05:00",
        hint: "After this time, sales count as the next business day.",
      },
    ],
  },

  {
    key: "currency_tax",
    title: "Currency & Tax",
    description: "Currency settings and tax/VAT configuration.",
    items: [
      {
        key: "base_currency",
        label: "Base Currency",
        type: "select",
        value: "USD",
        options: ["USD", "KHR"],
      },
      {
        key: "allow_multi_currency",
        label: "Allow Multi Currency",
        type: "switch",
        value: true,
        hint: "Enable accepting USD and KHR payments.",
      },
      {
        key: "exchange_rate_source",
        label: "Exchange Rate Source",
        type: "select",
        value: "manual",
        options: ["manual", "bank", "api"],
        hint: "Use manual rate or auto rate (if supported).",
      },
      {
        key: "khr_per_usd",
        label: "KHR per 1 USD",
        type: "number",
        value: 4100,
        min: 3000,
        max: 6000,
        step: 10,
        hint: "Used when converting totals.",
      },
      {
        key: "tax_enabled",
        label: "Tax Enabled",
        type: "switch",
        value: false,
      },
      {
        key: "tax_rate",
        label: "Tax Rate (%)",
        type: "number",
        value: 0,
        min: 0,
        max: 20,
        step: 0.5,
        hint: "VAT/Service tax percentage.",
        dependsOn: { key: "tax_enabled", value: true },
      },
      {
        key: "tax_inclusive",
        label: "Tax Inclusive",
        type: "switch",
        value: false,
        hint: "If enabled, tax is included in the price.",
        dependsOn: { key: "tax_enabled", value: true },
      },
    ],
  },

  {
    key: "checkin_checkout",
    title: "Check-in & Check-out",
    description: "Default times and rules for reservations.",
    items: [
      {
        key: "default_checkin_time",
        label: "Default Check-in Time",
        type: "time",
        value: "14:00",
      },
      {
        key: "default_checkout_time",
        label: "Default Check-out Time",
        type: "time",
        value: "12:00",
      },
      {
        key: "late_checkout_fee_enabled",
        label: "Late Checkout Fee",
        type: "switch",
        value: true,
      },
      {
        key: "late_checkout_fee",
        label: "Late Checkout Fee (USD)",
        type: "number",
        value: 10,
        min: 0,
        step: 1,
        dependsOn: { key: "late_checkout_fee_enabled", value: true },
      },
      {
        key: "early_checkin_fee_enabled",
        label: "Early Check-in Fee",
        type: "switch",
        value: false,
      },
      {
        key: "early_checkin_fee",
        label: "Early Check-in Fee (USD)",
        type: "number",
        value: 0,
        min: 0,
        step: 1,
        dependsOn: { key: "early_checkin_fee_enabled", value: true },
      },
    ],
  },

  {
    key: "invoice_receipt",
    title: "Invoice & Receipt",
    description: "Invoice numbering, print behavior, and receipt format.",
    items: [
      {
        key: "invoice_prefix",
        label: "Invoice Prefix",
        type: "text",
        value: "INV",
      },
      {
        key: "receipt_prefix",
        label: "Receipt Prefix",
        type: "text",
        value: "RCT",
      },
      {
        key: "invoice_next_number",
        label: "Next Invoice Number",
        type: "number",
        value: 10001,
        min: 1,
        step: 1,
        hint: "Auto-increment counter for invoices.",
      },
      {
        key: "receipt_next_number",
        label: "Next Receipt Number",
        type: "number",
        value: 50001,
        min: 1,
        step: 1,
      },
      {
        key: "print_logo_on_invoice",
        label: "Print Logo on Invoice",
        type: "switch",
        value: true,
      },
      {
        key: "print_qr_on_receipt",
        label: "Print QR on Receipt",
        type: "switch",
        value: true,
        hint: "Optional QR for verification / reprint lookup.",
      },
    ],
  },

  {
    key: "payments",
    title: "Payments",
    description: "Deposit rules, refunds, and reference requirements.",
    items: [
      {
        key: "deposit_enabled",
        label: "Deposit Enabled",
        type: "switch",
        value: true,
      },
      {
        key: "default_deposit_percent",
        label: "Default Deposit (%)",
        type: "number",
        value: 20,
        min: 0,
        max: 100,
        step: 1,
        dependsOn: { key: "deposit_enabled", value: true },
      },
      {
        key: "allow_partial_payments",
        label: "Allow Partial Payments",
        type: "switch",
        value: true,
      },
      {
        key: "require_reference_for_online",
        label: "Require Reference for Online Payments",
        type: "switch",
        value: true,
        hint: "KHQR / ABA / bank transfer should record reference ID.",
      },
      {
        key: "refund_requires_approval",
        label: "Refund Requires Approval",
        type: "switch",
        value: true,
        hint: "Recommended for audit and cashier control.",
      },
    ],
  },

  {
    key: "khqr_aba",
    title: "KHQR / ABA",
    description: "Optional config for KHQR & ABA display (static sample).",
    items: [
      {
        key: "khqr_enabled",
        label: "Enable KHQR",
        type: "switch",
        value: true,
      },
      {
        key: "khqr_merchant_name",
        label: "Merchant Name", 
        type: "text",
        value: "Palm Guesthouse",
        dependsOn: { key: "khqr_enabled", value: true },
      },
      {
        key: "khqr_account_id",
        label: "Merchant Account ID",
        type: "text",
        value: "KHQR-00012345",
        dependsOn: { key: "khqr_enabled", value: true },
      },
      {
        key: "aba_enabled",
        label: "Enable ABA Pay",
        type: "switch",
        value: true,
      },
      {
        key: "aba_display_name",
        label: "ABA Display Name",
        type: "text",
        value: "Palm Guesthouse ABA",
        dependsOn: { key: "aba_enabled", value: true },
      },
    ],
  },

  {
    key: "pos",
    title: "POS",
    description: "POS settings used at reception or mini-bar sales.",
    items: [
      {
        key: "pos_enabled",
        label: "Enable POS",
        type: "switch",
        value: true,
      },
      {
        key: "pos_rounding_enabled",
        label: "Enable Rounding",
        type: "switch",
        value: true,
        hint: "Useful for KHR rounding.",
        dependsOn: { key: "pos_enabled", value: true },
      },
      {
        key: "pos_round_to",
        label: "Round To (KHR)",
        type: "number",
        value: 100,
        min: 0,
        step: 50,
        dependsOn: { key: "pos_rounding_enabled", value: true },
      },
    ],
  },

  {
    key: "housekeeping",
    title: "Housekeeping",
    description: "Tasks and room status automation.",
    items: [
      {
        key: "auto_set_room_cleaning_on_checkout",
        label: "Set room to Cleaning after checkout",
        type: "switch",
        value: true,
      },
      {
        key: "default_cleaning_priority",
        label: "Default Cleaning Priority",
        type: "select",
        value: "normal",
        options: ["low", "normal", "high", "urgent"],
      },
    ],
  },

  {
    key: "security",
    title: "Security",
    description: "Login rules and password security policy.",
    items: [
      {
        key: "max_login_attempts",
        label: "Max Login Attempts",
        type: "number",
        value: 5,
        min: 1,
        max: 20,
        step: 1,
      },
      {
        key: "lock_minutes",
        label: "Lock Account (minutes)",
        type: "number",
        value: 15,
        min: 1,
        max: 240,
        step: 1,
      },
      {
        key: "password_min_length",
        label: "Minimum Password Length",
        type: "number",
        value: 6,
        min: 4,
        max: 20,
        step: 1,
      },
      {
        key: "force_password_change_days",
        label: "Force Password Change (days)",
        type: "number",
        value: 0,
        min: 0,
        max: 365,
        step: 1,
        hint: "0 = disabled",
      },
      {
        key: "enable_2fa",
        label: "Enable 2FA (Admin only)",
        type: "switch",
        value: false,
      },
    ],
  },

  {
    key: "notifications",
    title: "Notifications",
    description: "Email/SMS/in-app notifications (static).",
    items: [
      {
        key: "notify_on_new_booking",
        label: "Notify on new booking",
        type: "switch",
        value: true,
      },
      {
        key: "notify_on_payment",
        label: "Notify on payment received",
        type: "switch",
        value: true,
      },
      {
        key: "notify_on_refund",
        label: "Notify on refund",
        type: "switch",
        value: true,
      },
      {
        key: "sms_enabled",
        label: "Enable SMS (OTP / reminders)",
        type: "switch",
        value: false,
      },
    ],
  },

  {
    key: "backup",
    title: "Backup & Export",
    description: "Backup rules and exporting data (static).",
    items: [
      {
        key: "auto_backup_enabled",
        label: "Enable Auto Backup",
        type: "switch",
        value: true,
      },
      {
        key: "backup_frequency",
        label: "Backup Frequency",
        type: "select",
        value: "daily",
        options: ["daily", "weekly", "monthly"],
        dependsOn: { key: "auto_backup_enabled", value: true },
      },
      {
        key: "retention_days",
        label: "Retention Days",
        type: "number",
        value: 30,
        min: 7,
        max: 365,
        step: 1,
        dependsOn: { key: "auto_backup_enabled", value: true },
      },
    ],
  },

  {
    key: "localization",
    title: "Localization",
    description: "Language and formatting preferences.",
    items: [
      {
        key: "default_language",
        label: "Default Language",
        type: "select",
        value: "en",
        options: ["en", "kh"],
      },
      {
        key: "date_format",
        label: "Date Format",
        type: "select",
        value: "DD/MM/YYYY",
        options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
      },
      {
        key: "time_format",
        label: "Time Format",
        type: "select",
        value: "24h",
        options: ["24h", "12h"],
      },
    ],
  },
];

/**
 * Optional: flatten for easier CRUD later
 * Example usage: configs.find(x => x.key === "tax_rate")
 */
export const setting_config_flat = system_config.flatMap((g) =>
  g.items.map((it) => ({
    group: g.key,
    groupTitle: g.title,
    ...it,
  })),
);
