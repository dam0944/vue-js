<!-- src/pages/dashboard/DashboardAnalytics.vue -->
<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Dashboard Analytics</h1>
        <p class="subtitle">Overview of rooms, guests, bookings, and performance by range.</p>
      </div>

      <div class="range-control">
        <VaButtonToggle
          v-model="range"
          :options="ranges"
          size="small"
          color="primary"
          preset="secondary"
          class="toggle"
        />
        <div class="today">
          {{ todayLabel }}
        </div>
      </div>
    </div>

    <!-- Cards -->
    <div class="cards">
      <div class="card">
        <div class="card-top">
          <div class="label">Total Rooms</div>
          <VaIcon name="meeting_room" color="primary" />
        </div>
        <div class="value">{{ property.total_rooms }}</div>
        <div class="hint">Floors: <b>{{ property.total_floors }}</b></div>
      </div>

      <div class="card">
        <div class="card-top">
          <div class="label">Bookings ({{ rangeText }})</div>
          <VaIcon name="event" color="primary" />
        </div>
        <div class="value">{{ metrics.bookings }}</div>
        <div class="hint">Check-ins: <b>{{ metrics.checkins }}</b> · Check-outs: <b>{{ metrics.checkouts }}</b></div>
      </div>

      <div class="card">
        <div class="card-top">
          <div class="label">Guests ({{ rangeText }})</div>
          <VaIcon name="groups" color="primary" />
        </div>
        <div class="value">{{ metrics.guests }}</div>
        <div class="hint">VIP: <b>{{ metrics.vip_guests }}</b></div>
      </div>

      <div class="card">
        <div class="card-top">
          <div class="label">Revenue ({{ rangeText }})</div>
          <VaIcon name="attach_money" color="primary" />
        </div>
        <div class="value">{{ money(metrics.revenue_usd) }}</div>
        <div class="hint">Payments: <b>{{ metrics.total_payments }}</b></div>
      </div>

      <div class="card">
        <div class="card-top">
          <div class="label">Occupancy ({{ rangeText }})</div>
          <VaIcon name="pie_chart" color="primary" />
        </div>
        <div class="value">{{ pct(metrics.occupancy_rate) }}</div>
        <VaProgressBar
          :model-value="clamp(metrics.occupancy_rate, 0, 100)"
          color="primary"
          size="small"
          class="bar"
        />
      </div>

      <div class="card">
        <div class="card-top">
          <div class="label">Outstanding Balance</div>
          <VaIcon name="warning" color="warning" />
        </div>
        <div class="value">{{ money(metrics.outstanding_balance_usd) }}</div>
        <div class="hint">Unpaid invoices: <b>{{ metrics.unpaid_invoices }}</b></div>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts">
      <!-- Bar Chart: Rooms by status -->
      <div class="chart-card">
        <div class="chart-head">
          <div>
            <h2 class="section-title">Room Status</h2>
            <p class="section-subtitle">Rooms distribution by status.</p>
          </div>
        </div>

        <div class="bar-rows">
          <div v-for="row in roomStatusRows" :key="row.key" class="bar-row">
            <div class="bar-left">
              <VaChip :color="row.color" size="small" square>{{ row.label }}</VaChip>
              <span class="bar-count">{{ row.value }}</span>
            </div>

            <div class="bar-track">
              <div class="bar-fill" :style="{ width: pctWidth(row.value, property.total_rooms) }"></div>
            </div>

            <div class="bar-right">{{ pct(toPercent(row.value, property.total_rooms)) }}</div>
          </div>
        </div>
      </div>

      <!-- Doughnut Chart: Payment methods -->
      <div class="chart-card">
        <div class="chart-head">
          <div>
            <h2 class="section-title">Payment Methods</h2>
            <p class="section-subtitle">Share of revenue by payment method ({{ rangeText }}).</p>
          </div>
        </div>

        <div class="donut-wrap">
          <div class="donut">
            <svg viewBox="0 0 120 120" class="donut-svg" aria-label="Payment method donut chart">
              <g transform="translate(60,60)">
                <template v-for="seg in donutSegments" :key="seg.key">
                  <circle
                    class="donut-seg"
                    r="42"
                    cx="0"
                    cy="0"
                    fill="transparent"
                    :stroke="seg.stroke"
                    stroke-width="14"
                    stroke-linecap="round"
                    :stroke-dasharray="seg.dasharray"
                    :stroke-dashoffset="seg.dashoffset"
                  />
                </template>
              </g>

              <g class="donut-center">
                <text x="60" y="58" text-anchor="middle" class="donut-total">{{ money(donutTotal) }}</text>
                <text x="60" y="74" text-anchor="middle" class="donut-sub">Total (USD)</text>
              </g>
            </svg>
          </div>

          <div class="donut-legend">
            <div v-for="m in paymentRows" :key="m.payment_method" class="legend-item">
              <span class="swatch" :style="{ background: methodColor(m.payment_method) }"></span>
              <div class="legend-text">
                <div class="legend-top">
                  <b class="legend-name">{{ m.payment_method }}</b>
                  <span class="legend-pct">{{ pct(m.percentage) }}</span>
                </div>
                <div class="legend-bottom">
                  <span>{{ money(m.total_amount_usd) }}</span>
                  <span class="dot"></span>
                  <span>{{ m.transaction_count }} tx</span>
                </div>
              </div>
            </div>

            <VaDivider />

            <div class="legend-foot">
              <VaChip color="primary" size="small" square>Most Used</VaChip>
              <b>{{ metrics.most_used_payment_method }}</b>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tiny note -->
    <div class="footnote">
      <VaIcon name="info" color="secondary" size="small" />
      <span>
        Values are static demo data. In real API responses, DECIMAL fields may arrive as strings —
        this component safely converts them to numbers.
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"

/**
 * ✅ Static data (demo)
 * - Follows your property fields: total_rooms, total_floors (from properties table)
 * - Dashboard metrics are typical aggregates derived from bookings/reservations/guests/invoices/payments
 */
const dashboard_analytics = {
  property: {
    property_id: 1,
    property_name: "Palm Guesthouse",
    total_rooms: 28,
    total_floors: 5,
  },

  ranges: {
    today: {
      bookings: 12,
      checkins: 6,
      checkouts: 4,
      guests: 31,
      vip_guests: 3,
      revenue_usd: "1850.50",
      total_payments: 18,
      occupancy_rate: "72.9",
      unpaid_invoices: 5,
      outstanding_balance_usd: "420.00",
      room_status: {
        available: 7,
        occupied: 18,
        cleaning: 2,
        maintenance: 1,
        out_of_order: 0,
        blocked: 0,
      },
      payment_methods: [
        { payment_method: "cash", transaction_count: 8, total_amount_usd: "720.00" },
        { payment_method: "aba", transaction_count: 6, total_amount_usd: "680.50" },
        { payment_method: "credit_card", transaction_count: 3, total_amount_usd: "350.00" },
        { payment_method: "wing", transaction_count: 1, total_amount_usd: "100.00" },
      ],
    },

    week: {
      bookings: 68,
      checkins: 35,
      checkouts: 33,
      guests: 120,
      vip_guests: 11,
      revenue_usd: "9420.00",
      total_payments: 97,
      occupancy_rate: "81.2",
      unpaid_invoices: 14,
      outstanding_balance_usd: "1375.00",
      room_status: {
        available: 4,
        occupied: 22,
        cleaning: 1,
        maintenance: 1,
        out_of_order: 0,
        blocked: 0,
      },
      payment_methods: [
        { payment_method: "aba", transaction_count: 40, total_amount_usd: "4020.00" },
        { payment_method: "cash", transaction_count: 33, total_amount_usd: "3150.00" },
        { payment_method: "credit_card", transaction_count: 18, total_amount_usd: "1890.00" },
        { payment_method: "wing", transaction_count: 6, total_amount_usd: "360.00" },
      ],
    },

    month: {
      bookings: 240,
      checkins: 122,
      checkouts: 118,
      guests: 410,
      vip_guests: 26,
      revenue_usd: "38250.00",
      total_payments: 315,
      occupancy_rate: "78.4",
      unpaid_invoices: 28,
      outstanding_balance_usd: "3220.00",
      room_status: {
        available: 6,
        occupied: 20,
        cleaning: 1,
        maintenance: 1,
        out_of_order: 0,
        blocked: 0,
      },
      payment_methods: [
        { payment_method: "aba", transaction_count: 140, total_amount_usd: "16400.00" },
        { payment_method: "cash", transaction_count: 110, total_amount_usd: "13250.00" },
        { payment_method: "credit_card", transaction_count: 52, total_amount_usd: "7800.00" },
        { payment_method: "wing", transaction_count: 13, total_amount_usd: "800.00" },
      ],
    },

    year: {
      bookings: 2810,
      checkins: 1410,
      checkouts: 1400,
      guests: 4920,
      vip_guests: 210,
      revenue_usd: "402850.00",
      total_payments: 3610,
      occupancy_rate: "74.1",
      unpaid_invoices: 120,
      outstanding_balance_usd: "15450.00",
      room_status: {
        available: 8,
        occupied: 18,
        cleaning: 1,
        maintenance: 1,
        out_of_order: 0,
        blocked: 0,
      },
      payment_methods: [
        { payment_method: "aba", transaction_count: 1700, total_amount_usd: "176200.00" },
        { payment_method: "cash", transaction_count: 1200, total_amount_usd: "152500.00" },
        { payment_method: "credit_card", transaction_count: 540, total_amount_usd: "66850.00" },
        { payment_method: "wing", transaction_count: 170, total_amount_usd: "7300.00" },
      ],
    },
  },
}

/** Range Toggle */
const range = ref("today")
const ranges = [
  { label: "Today", value: "today" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
]

const todayLabel = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const rangeText = computed(() => {
  const found = ranges.find((r) => r.value === range.value)
  return found?.label ?? "Today"
})

/** Safe Number helpers (fix: toFixed errors) */
function toNumber(v) {
  const n = typeof v === "number" ? v : parseFloat(v ?? 0)
  return Number.isFinite(n) ? n : 0
}
function clamp(v, min, max) {
  const n = toNumber(v)
  return Math.min(max, Math.max(min, n))
}
function money(v) {
  const n = toNumber(v)
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function pct(v) {
  return `${toNumber(v).toFixed(1)}%`
}
function toPercent(part, total) {
  const t = toNumber(total)
  if (!t) return 0
  return (toNumber(part) / t) * 100
}
function pctWidth(part, total) {
  return `${clamp(toPercent(part, total), 0, 100).toFixed(2)}%`
}

/** Computed data for the UI */
const property = computed(() => dashboard_analytics.property)

const metrics = computed(() => {
  const m = dashboard_analytics.ranges[range.value]
  const occupancy = toNumber(m.occupancy_rate)

  // calculate most used method
  const pm = m.payment_methods.map((x) => ({
    ...x,
    total_amount_usd: toNumber(x.total_amount_usd),
  }))
  const top = pm.reduce(
    (best, cur) => (cur.transaction_count > best.transaction_count ? cur : best),
    pm[0] ?? { payment_method: "-" }
  )

  return {
    ...m,
    revenue_usd: toNumber(m.revenue_usd),
    occupancy_rate: occupancy,
    outstanding_balance_usd: toNumber(m.outstanding_balance_usd),
    most_used_payment_method: top?.payment_method ?? "-",
  }
})

/** Room Status "Bar chart" rows */
const roomStatusRows = computed(() => {
  const rs = dashboard_analytics.ranges[range.value].room_status
  return [
    { key: "occupied", label: "Occupied", value: rs.occupied, color: "primary" },
    { key: "available", label: "Available", value: rs.available, color: "success" },
    { key: "cleaning", label: "Cleaning", value: rs.cleaning, color: "warning" },
    { key: "maintenance", label: "Maintenance", value: rs.maintenance, color: "danger" },
    { key: "blocked", label: "Blocked", value: rs.blocked, color: "secondary" },
    { key: "out_of_order", label: "Out of Order", value: rs.out_of_order, color: "secondary" },
  ]
})

/** Payment methods -> add percentages for donut + legend */
const paymentRows = computed(() => {
  const rows = dashboard_analytics.ranges[range.value].payment_methods.map((m) => ({
    ...m,
    total_amount_usd: toNumber(m.total_amount_usd),
  }))

  const total = rows.reduce((sum, r) => sum + r.total_amount_usd, 0)

  return rows
    .map((r) => ({
      ...r,
      percentage: total ? (r.total_amount_usd / total) * 100 : 0,
    }))
    .sort((a, b) => b.total_amount_usd - a.total_amount_usd)
})

const donutTotal = computed(() => paymentRows.value.reduce((sum, r) => sum + r.total_amount_usd, 0))

/**
 * Donut segments:
 * We draw circles with strokeDasharray and strokeDashoffset.
 * - circumference = 2πr
 * - dasharray = `${segmentLength} ${circumference - segmentLength}`
 * - dashoffset accumulative
 */
const donutSegments = computed(() => {
  const r = 42
  const circumference = 2 * Math.PI * r

  let offset = 0

  return paymentRows.value.map((m) => {
    const segLen = (clamp(m.percentage, 0, 100) / 100) * circumference
    const seg = {
      key: m.payment_method,
      stroke: methodColor(m.payment_method),
      dasharray: `${segLen} ${Math.max(0, circumference - segLen)}`,
      dashoffset: -offset,
    }
    offset += segLen
    return seg
  })
})

/** Simple palette (clean, primary friendly) */
function methodColor(method) {
  const m = String(method || "").toLowerCase()
  if (m === "cash") return "#0ea5e9"       // primary
  if (m === "aba") return "#10b981"        // success
  if (m === "credit_card") return "#f59e0b" // warning
  if (m === "wing") return "#6366f1"        // indigo
  return "#94a3b8"
}
</script>

<style scoped>
/* White background + clean spacing (Vuestic primary comes from your createVuestic config: #0ea5e9) */
.page {
  min-height: 100vh;
  background: #ffffff;
  padding: 18px;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
}

/* Header */
.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 6px 16px;
  border-bottom: 1px solid rgba(2, 6, 23, 0.06);
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 950;
  color: #0f172a;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #64748b;
}

.range-control {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.toggle {
  min-width: 280px;
}

.today {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px 6px 8px;
}

.card {
  background: #fff;
  border: 1px solid rgba(2, 6, 23, 0.06);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.label {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}

.value {
  font-size: 26px;
  font-weight: 950;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin-bottom: 8px;
}

.hint {
  font-size: 12px;
  color: #64748b;
}
.hint b {
  color: #0f172a;
}

.bar {
  margin-top: 6px;
}

/* Charts layout */
.charts {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 12px;
  padding: 10px 6px 18px;
}

.chart-card {
  background: #fff;
  border: 1px solid rgba(2, 6, 23, 0.06);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06);
}

.chart-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;
}

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 950;
  color: #0f172a;
}

.section-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

/* "Bar chart" rows */
.bar-rows {
  display: grid;
  gap: 10px;
}

.bar-row {
  display: grid;
  grid-template-columns: 1fr 1.8fr 80px;
  gap: 10px;
  align-items: center;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-count {
  font-weight: 900;
  color: #0f172a;
}

.bar-track {
  height: 10px;
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.06);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  /* use a clean primary-like gradient */
  background: linear-gradient(90deg, rgba(14,165,233,0.95), rgba(14,165,233,0.35));
}

.bar-right {
  text-align: right;
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
}

/* Donut */
.donut-wrap {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 14px;
  align-items: center;
}

.donut {
  display: grid;
  place-items: center;
}

.donut-svg {
  width: 200px;
  height: 200px;
}

.donut-seg {
  transform: rotate(-90deg);
  transform-origin: 0 0;
}

.donut-center .donut-total {
  font-size: 10px;
  font-weight: 950;
  fill: #0f172a;
}

.donut-center .donut-sub {
  font-size: 6px;
  fill: #64748b;
}

/* Legend */
.donut-legend {
  display: grid;
  gap: 10px;
}

.legend-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.swatch {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-top: 5px;
  flex-shrink: 0;
}

.legend-text {
  flex: 1;
}

.legend-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.legend-name {
  color: #0f172a;
}

.legend-pct {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.legend-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}
.dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.6);
}

.legend-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #0f172a;
}

/* Footnote */
.footnote {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 6px 18px;
  color: #64748b;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 1100px) {
  .cards {
    grid-template-columns: 1fr;
  }
  .charts {
    grid-template-columns: 1fr;
  }
  .donut-wrap {
    grid-template-columns: 1fr;
  }
  .toggle {
    min-width: 240px;
  }
}
</style>
