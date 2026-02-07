<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Reports · Payment Methods</h1>
        <p class="subtitle">Understand how guests pay and which methods are most used.</p>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="cards">
      <div class="card">
        <div class="label">Total Transactions</div>
        <div class="value">{{ summary.total_transactions }}</div>
      </div>

      <div class="card">
        <div class="label">Total Revenue</div>
        <div class="value">${{ summary.total_revenue_usd.toFixed(2) }}</div>
      </div>

      <div class="card">
        <div class="label">Most Used</div>
        <VaChip color="primary" square>{{ summary.most_used_method }}</VaChip>
      </div>
    </div>

    <!-- Method Breakdown -->
    <div class="section">
      <h2 class="section-title">Method Breakdown</h2>

      <VaDataTable
        :items="methods"
        :columns="methodColumns"
        striped
        hoverable
        class="table"
      >
        <template #cell(total_amount)="{ value }">
          <b>${{ num(value).toFixed(2) }}</b>
        </template>

        <template #cell(percentage)="{ value }">
          <VaProgressBar
            :model-value="num(value)"
            color="primary"
            size="small"
          />
          <span class="pct">{{ num(value).toFixed(1) }}%</span>
        </template>
      </VaDataTable>
    </div>

    <!-- Daily Usage -->
    <div class="section">
      <h2 class="section-title">Daily Payment Usage</h2>

      <VaDataTable
        :items="daily"
        :columns="dailyColumns"
        striped
        hoverable
        class="table"
      >
        <template #cell(payment_method)="{ value }">
          <VaChip color="primary" size="small" square>
            {{ value }}
          </VaChip>
        </template>

        <template #cell(total_amount)="{ value }">
          <b>${{ num(value).toFixed(2) }}</b>
        </template>
      </VaDataTable>
    </div>

    <!-- Recent Transactions -->
    <div class="section">
      <h2 class="section-title">Recent Transactions</h2>

      <VaDataTable
        :items="recent"
        :columns="recentColumns"
        striped
        hoverable
        class="table"
      >
        <template #cell(status)="{ value }">
          <VaChip
            :color="value === 'completed' ? 'success' : 'danger'"
            size="small"
            square
          >
            {{ value }}
          </VaChip>
        </template>

        <template #cell(amount)="{ value }">
          <b>${{ num(value).toFixed(2) }}</b>
        </template>
      </VaDataTable>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { reports_payment_methods as report } from "@/data/report/reports_payment_methods"

/* ---------------- SAFE NUMBER HELPER ---------------- */
/**
 * Safely converts any value to a finite number, defaulting to 0
 * @param {*} v - Value to convert
 * @returns {number} - Safe numeric value
 */
function num(v) {
  const n = typeof v === "number" ? v : parseFloat(v || 0)
  return Number.isFinite(n) ? n : 0
}

/* ---------------- SAFE SUMMARY ---------------- */
const summary = computed(() => ({
  ...report.summary,
  total_revenue_usd: num(report.summary.total_revenue_usd),
}))

/* ---------------- SAFE TABLE DATA ---------------- */
const methods = computed(() =>
  report.method_breakdown.map(m => ({
    ...m,
    total_amount: num(m.total_amount),
    percentage: num(m.percentage),
  }))
)

const daily = computed(() =>
  report.daily_methods.map(d => ({
    ...d,
    total_amount: num(d.total_amount),
  }))
)

const recent = computed(() =>
  report.recent_transactions.map(r => ({
    ...r,
    amount: num(r.amount),
  }))
)

/* ---------------- COLUMNS ---------------- */
const methodColumns = [
  { key: "payment_method", label: "Method" },
  { key: "total_transactions", label: "Transactions" },
  { key: "total_amount", label: "Amount (USD)" },
  { key: "percentage", label: "Usage %" },
]

const dailyColumns = [
  { key: "payment_date", label: "Date" },
  { key: "payment_method", label: "Method" },
  { key: "transaction_count", label: "Transactions" },
  { key: "total_amount", label: "Amount (USD)" },
]

const recentColumns = [
  { key: "payment_number", label: "Payment #" },
  { key: "invoice_number", label: "Invoice #" },
  { key: "payment_method", label: "Method" },
  { key: "amount", label: "Amount" },
  { key: "processed_by", label: "Processed By" },
  { key: "payment_date", label: "Date" },
  { key: "status", label: "Status" },
]
</script>

<style scoped>
.page {
  background: white;
  min-height: 100vh;
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.title {
  font-size: 22px;
  font-weight: 900;
}

.subtitle {
  color: #64748b;
  font-size: 13px;
}

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.card {
  background: #fff;
  padding: 16px;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.label {
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

.value {
  font-size: 26px;
  font-weight: 900;
  margin-top: 6px;
}

/* Sections */
.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 16px;
  font-weight: 900;
  margin-bottom: 10px;
}

.table {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.pct {
  font-size: 12px;
  font-weight: 700;
  margin-left: 8px;
}

/* Responsive */
@media (max-width: 1024px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>