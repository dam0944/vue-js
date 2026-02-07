<!-- src/pages/reports/ReportsRevenue.vue -->
<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Reports · Revenue</h1>
        <p class="subtitle">Track revenue by month, day, payment method and room type.</p>
      </div>

      <div class="actions">
        <!-- IMPORTANT:
             v-model stores only option.value (ex: "2026-02")
             by setting value-by + text-by -->
        <VaSelect
          v-model="selectedMonth"
          :options="monthOptions"
          value-by="value"
          text-by="text"
          size="small"
          class="control"
          label="Month"
        />
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="cards">
      <div class="card">
        <div class="label">Total Revenue (USD)</div>
        <div class="value">${{ money(summarySafe.total_revenue_usd) }}</div>
        <div class="hint">Selected month: <b>{{ selectedMonth }}</b></div>
      </div>

      <div class="card">
        <div class="label">Transactions</div>
        <div class="value">{{ summarySafe.total_transactions }}</div>
        <div class="hint">Total completed payments</div>
      </div>

      <div class="card">
        <div class="label">By Method</div>
        <div class="mini">
          <VaChip color="primary" square size="small">
            Cash ${{ money(summarySafe.cash_total) }}
          </VaChip>
          <VaChip color="success" square size="small">
            Card ${{ money(summarySafe.card_total) }}
          </VaChip>
          <VaChip color="warning" square size="small">
            ABA ${{ money(summarySafe.aba_total) }}
          </VaChip>
        </div>
      </div>
    </div>

    <!-- Daily Revenue Table -->
    <div class="section">
      <div class="section-head">
        <h2 class="section-title">Daily Revenue</h2>
        <VaInput
          v-model="methodFilter"
          size="small"
          class="control"
          placeholder="Filter method (cash, credit_card...)"
          clearable
        >
          <template #prependInner>
            <VaIcon name="search" color="primary" />
          </template>
        </VaInput>
      </div>

      <VaDataTable
        :items="dailySafeFiltered"
        :columns="dailyColumns"
        striped
        hoverable
        class="table"
      >
        <template #cell(payment_method)="{ value }">
          <VaChip color="primary" size="small" square>{{ value }}</VaChip>
        </template>

        <template #cell(total_amount)="{ value }">
          <b>${{ money(value) }}</b>
        </template>
      </VaDataTable>
    </div>

    <!-- Revenue by Room Type -->
    <div class="section">
      <h2 class="section-title">Revenue by Room Type</h2>

      <VaDataTable
        :items="roomTypesSafe"
        :columns="roomTypeColumns"
        striped
        hoverable
        class="table"
      >
        <template #cell(total_revenue)="{ value }">
          <b>${{ money(value) }}</b>
        </template>
      </VaDataTable>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from "vue"
import { reports_revenue } from "@/data/report/reports_revenue"

function toNumber(v) {
  const n = typeof v === "number" ? v : parseFloat(v ?? 0)
  return Number.isFinite(n) ? n : 0
}
function money(v) {
  return toNumber(v).toFixed(2)
}

const monthOptions = [
  { text: "Feb 2026", value: "2026-02" },
  { text: "Jan 2026", value: "2026-01" },
  { text: "Dec 2025", value: "2025-12" },
]

// must match option.value exactly:
const selectedMonth = ref(monthOptions[0].value)

// filter input
const methodFilter = ref("")

const summarySafe = computed(() => {
  const s = reports_revenue.summary
  return {
    ...s,
    total_revenue_usd: toNumber(s.total_revenue_usd),
    cash_total: toNumber(s.cash_total),
    card_total: toNumber(s.card_total),
    aba_total: toNumber(s.aba_total),
    total_transactions: parseInt(s.total_transactions ?? 0, 10) || 0,
  }
})

const dailySafe = computed(() => {
  return (reports_revenue.daily_revenue || []).map((r) => ({
    ...r,
    transaction_count: parseInt(r.transaction_count ?? 0, 10) || 0,
    total_amount: toNumber(r.total_amount),
  }))
})

const dailySafeFiltered = computed(() => {
  const q = methodFilter.value.trim().toLowerCase()

  return dailySafe.value
    .filter((r) => {
      // If you have r.month like "2026-02" then enable this:
      // return !r.month || r.month === selectedMonth.value
      return true
    })
    .filter((r) => {
      if (!q) return true
      return String(r.payment_method).toLowerCase().includes(q)
    })
})

const roomTypesSafe = computed(() => {
  return (reports_revenue.revenue_by_room_type || []).map((r) => ({
    ...r,
    total_revenue: toNumber(r.total_revenue),
  }))
})

// columns
const dailyColumns = [
  { key: "payment_date", label: "Date" },
  { key: "payment_method", label: "Method" },
  { key: "transaction_count", label: "Transactions" },
  { key: "total_amount", label: "Amount (USD)" },
]

const roomTypeColumns = [
  { key: "type_code", label: "Code" },
  { key: "type_name", label: "Room Type" },
  { key: "room_class", label: "Class" },
  { key: "total_revenue", label: "Revenue (USD)" },
]

/**
 * Safety: if options change in future, always keep selectedMonth valid
 */
watchEffect(() => {
  const exists = monthOptions.some((o) => o.value === selectedMonth.value)
  if (!exists) selectedMonth.value = monthOptions[0].value
})
</script>

<style scoped>
.page {
  background: #ffffff;
  min-height: 100vh;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 18px;
}

.title {
  font-size: 22px;
  font-weight: 900;
  margin: 0;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #64748b;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.control {
  min-width: 180px;
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
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06);
}

.label {
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

.value {
  font-size: 26px;
  font-weight: 950;
  margin-top: 6px;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #94a3b8;
}

.mini {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

/* Sections */
.section {
  margin-bottom: 28px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 900;
  margin: 0;
}

.table {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06);
}

/* Responsive */
@media (max-width: 1024px) {
  .cards {
    grid-template-columns: 1fr;
  }
  .control {
    min-width: 240px;
  }
}
</style>
