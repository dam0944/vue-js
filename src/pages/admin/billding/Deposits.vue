<!-- src/pages/billing/Deposits.vue -->
<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Deposits</h1>
        <p class="subtitle">Track booking deposits (from bookings table).</p>
      </div>

      <div class="header-actions">
        <VaButton preset="secondary" icon="refresh" @click="resetFilters">
          Reset
        </VaButton>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary">
      <VaCard class="card shadow">
        <VaCardContent>
          <div class="sum-label">Total Deposits</div>
          <div class="sum-value">{{ money(totals.amount) }}</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="card shadow">
        <VaCardContent>
          <div class="sum-label">Paid</div>
          <div class="sum-value">{{ money(totals.paid) }}</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="card shadow">
        <VaCardContent>
          <div class="sum-label">Balance</div>
          <div class="sum-value" :class="totals.balance > 0 ? 'text-warn' : 'text-ok'">
            {{ money(totals.balance) }}
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Filters -->
    <VaCard class="card shadow">
      <VaCardContent>
        <div class="filters">
          <VaInput
            v-model="filters.q"
            label="Search"
            placeholder="Booking number / guest name / phone..."
            clearable
          />

          <VaSelect
            v-model="filters.status"
            label="Status"
            :options="['all', ...STATUS_OPTIONS]"
          />

          <VaSelect
            v-model="filters.source"
            label="Source"
            :options="['all', ...SOURCE_OPTIONS]"
          />

          <VaSelect
            v-model="filters.currency"
            label="Currency"
            :options="['all', ...CURRENCY_OPTIONS]"
          />
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Table -->
    <VaCard class="card shadow">
      <VaCardContent>
        <div class="table-top">
          <div class="table-title">
            Results: <b>{{ filteredRows.length }}</b>
          </div>
          <div class="table-sub">Easy view + pagination</div>
        </div>

        <VaDataTable
          :items="paged"
          :columns="columns"
          :hoverable="true"
          :striped="false"
          class="datatable"
        >
          <!-- Booking -->
          <template #cell(booking)="{ rowData }">
            <div class="cell-main">
              <div class="strong">{{ rowData.booking_number }}</div>
              <div class="muted">ID: {{ rowData.booking_id }}</div>
            </div>
          </template>

          <!-- Guest -->
          <template #cell(guest)="{ rowData }">
            <div class="cell-main">
              <div class="strong">{{ rowData.guest_name }}</div>
              <div class="muted">{{ rowData.phone }}</div>
            </div>
          </template>

          <!-- Status -->
          <template #cell(status)="{ rowData }">
            <VaBadge :text="rowData.status" :color="statusColor(rowData.status)" />
          </template>

          <!-- Source -->
          <template #cell(source)="{ rowData }">
            <VaChip size="small" color="secondary" outline>
              {{ rowData.booking_source }}
            </VaChip>
          </template>

          <!-- Numbers -->
          <template #cell(deposit_amount)="{ rowData }">
            <div class="num">{{ money(rowData.deposit_amount, rowData.deposit_currency) }}</div>
          </template>

          <template #cell(deposit_paid)="{ rowData }">
            <div class="num">{{ money(rowData.deposit_paid, rowData.deposit_currency) }}</div>
          </template>

          <template #cell(balance)="{ rowData }">
            <div class="num" :class="getBalance(rowData) > 0 ? 'text-warn' : 'text-ok'">
              {{ money(getBalance(rowData), rowData.deposit_currency) }}
            </div>
          </template>

          <!-- Date -->
          <template #cell(date)="{ rowData }">
            <div class="cell-main">
              <div class="strong">{{ formatDate(rowData.booking_date) }}</div>
              <div class="muted">{{ formatTime(rowData.booking_date) }}</div>
            </div>
          </template>

          <!-- Action -->
          <template #cell(action)="{ rowData }">
            <RouterLink
              class="link"
              :to="{ name: 'billing-deposits-show', params: { bookingId: String(rowData.booking_id) } }"
            >
              View
            </RouterLink>
          </template>

          <template #no-data>
            <div class="empty">
              No deposits found. Try changing filters.
            </div>
          </template>
        </VaDataTable>

        <!-- Pagination -->
        <div class="pager">
          <div class="pager-left">
            Showing
            <b>{{ startRow + 1 }}</b> –
            <b>{{ Math.min(startRow + pageSize, filteredRows.length) }}</b>
            of <b>{{ filteredRows.length }}</b>
          </div>

          <div class="pager-right">
            <VaSelect
              v-model="pageSize"
              :options="[5, 8, 10, 15, 20]"
              label="Per page"
              class="page-size"
            />
            <VaPagination v-model="page" :pages="totalPages" />
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Note -->
    <VaCard class="card shadow soft">
      <VaCardContent>
        <div class="note-title">How this page matches your database</div>
        <div class="note-text">
          Deposits are stored inside <b>bookings</b>: deposit_amount, deposit_paid, deposit_currency.
          This list is derived from booking records (joined with guests for display).
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { deposits } from "@/data/billding/deposits"

// ─── Constants ───────────────────────────────────────────────
const STATUS_OPTIONS = ["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"]
const SOURCE_OPTIONS = ["walk_in", "phone", "email", "online", "other"]
const CURRENCY_OPTIONS = ["USD", "KHR"]

// ─── Filters ────────────────────────────────────────────────
const filters = reactive({
  q: "",
  status: "all",
  source: "all",
  currency: "all",
})

function resetFilters() {
  filters.q = ""
  filters.status = "all"
  filters.source = "all"
  filters.currency = "all"
}

// ─── Helpers ─────────────────────────────────────────────────
function normalize(s) {
  return String(s ?? "").toLowerCase().trim()
}

function getBalance(d) {
  return Math.max(0, Number(d.deposit_amount || 0) - Number(d.deposit_paid || 0))
}

function money(amount, cur = "USD") {
  const n = Number(amount || 0)
  const fixed = cur === "KHR" ? 0 : 2
  return cur === "KHR" ? `${n.toFixed(fixed)} ៛` : `$${n.toFixed(fixed)}`
}

function formatDate(dt) {
  const s = String(dt || "")
  return s ? s.split(" ")[0] : "-"
}
function formatTime(dt) {
  const s = String(dt || "")
  return s.includes(" ") ? s.split(" ")[1] : "-"
}

function statusColor(status) {
  const s = normalize(status)
  if (s === "cancelled" || s === "no_show") return "danger"
  if (s === "pending") return "warning"
  return "success"
}

// ─── Filtered Rows ───────────────────────────────────────────
const filteredRows = computed(() => {
  const q = normalize(filters.q)

  return (deposits || [])
    .filter((d) => {
      if (filters.status !== "all" && d.status !== filters.status) return false
      if (filters.source !== "all" && d.booking_source !== filters.source) return false
      if (filters.currency !== "all" && d.deposit_currency !== filters.currency) return false

      if (q) {
        const haystack = [d.booking_number, d.guest_name, d.phone, d.booking_id]
          .map(normalize)
          .join(" ")
        if (!haystack.includes(q)) return false
      }
      return true
    })
    .sort((a, b) => (b.booking_date > a.booking_date ? 1 : b.booking_date < a.booking_date ? -1 : 0))
})

// ─── Totals ──────────────────────────────────────────────────
const totals = computed(() => {
  let amount = 0,
    paid = 0,
    balance = 0

  for (const d of filteredRows.value) {
    amount += Number(d.deposit_amount || 0)
    paid += Number(d.deposit_paid || 0)
    balance += getBalance(d)
  }
  return { amount, paid, balance }
})

// ─── Pagination ──────────────────────────────────────────────
const page = ref(1)
const pageSize = ref(8)

watch([() => filters.q, () => filters.status, () => filters.source, () => filters.currency, pageSize], () => {
  page.value = 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
const startRow = computed(() => (page.value - 1) * pageSize.value)
const paged = computed(() => filteredRows.value.slice(startRow.value, startRow.value + pageSize.value))

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
})

// ─── Table Columns ───────────────────────────────────────────
const columns = [
  { key: "booking", label: "Booking" },
  { key: "guest", label: "Guest" },
  { key: "status", label: "Status" },
  { key: "source", label: "Source" },
  { key: "deposit_amount", label: "Deposit", align: "right" },
  { key: "deposit_paid", label: "Paid", align: "right" },
  { key: "balance", label: "Balance", align: "right" },
  { key: "date", label: "Date" },
  { key: "action", label: "Action", align: "right" },
]
</script>

<style scoped>
.page {
  padding: 18px 18px 40px;
  background: #f8fafc;
}

/* Header */
.header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.title {
  font-size: 22px;
  font-weight: 900;
}
.subtitle {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}
.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Summary */
.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 10px 0 14px;
}
.sum-label {
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}
.sum-value {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 900;
}

/* Cards */
.card {
  border-radius: 14px;
}
.shadow {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}
.soft {
  opacity: 0.9;
}

/* Filters */
.filters {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 12px;
}

/* Table */
.table-top {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.table-title {
  font-weight: 900;
  color: #0f172a;
}
.table-sub {
  font-size: 12px;
  color: #64748b;
}
.datatable :deep(th) {
  font-weight: 900;
}
.cell-main .strong {
  font-weight: 900;
  color: #0f172a;
}
.cell-main .muted {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}
.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
}

/* Pager */
.pager {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.pager-left {
  font-size: 13px;
  color: #64748b;
}
.pager-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.page-size {
  min-width: 140px;
}

/* Note */
.note-title {
  font-weight: 900;
  font-size: 13px;
}
.note-text {
  margin-top: 6px;
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
}

/* Link */
.link {
  color: #2563eb;
  font-weight: 900;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}

/* Colors */
.text-ok {
  color: #047857;
}
.text-warn {
  color: #b45309;
}

/* Responsive */
@media (max-width: 980px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }
  .summary {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 600px) {
  .filters {
    grid-template-columns: 1fr;
  }
  .summary {
    grid-template-columns: 1fr;
  }
}
</style>
