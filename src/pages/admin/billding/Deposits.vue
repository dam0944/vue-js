<template>
  <div class="page">
    <!-- Header -->
    <header class="top">
      <div class="left">
        <h1 class="title">Deposits</h1>
        <p class="subtitle">Track booking deposits (from bookings table).</p>
      </div>
      <div class="right">
        <button class="btn" type="button" @click="resetFilters">Reset</button>
      </div>
    </header>

    <!-- Summary -->
    <section class="summary">
      <div class="sum-card">
        <div class="sum-label">Total Deposits</div>
        <div class="sum-value">{{ money(totals.amount) }}</div>
      </div>
      <div class="sum-card">
        <div class="sum-label">Paid</div>
        <div class="sum-value">{{ money(totals.paid) }}</div>
      </div>
      <div class="sum-card">
        <div class="sum-label">Balance</div>
        <div class="sum-value">{{ money(totals.balance) }}</div>
      </div>
    </section>

    <!-- Filters -->
    <section class="filters">
      <div class="field">
        <label class="label">Search</label>
        <input
          class="input"
          v-model="filters.q"
          type="text"
          placeholder="Booking number / guest name / phone..."
        />
      </div>
      <div class="field">
        <label class="label">Status</label>
        <select class="select" v-model="filters.status">
          <option value="all">All</option>
          <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="field">
        <label class="label">Source</label>
        <select class="select" v-model="filters.source">
          <option value="all">All</option>
          <option v-for="s in SOURCE_OPTIONS" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="field">
        <label class="label">Currency</label>
        <select class="select" v-model="filters.currency">
          <option value="all">All</option>
          <option v-for="c in CURRENCY_OPTIONS" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
    </section>

    <!-- Table -->
    <section class="table-wrap">
      <div v-if="rows.length === 0" class="empty">No deposits found.</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Guest</th>
            <th>Status</th>
            <th>Source</th>
            <th class="num">Deposit</th>
            <th class="num">Paid</th>
            <th class="num">Balance</th>
            <th>Date</th>
            <th class="actions">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="d in rows" :key="d.booking_id">
            <td>
              <div class="main">{{ d.booking_number }}</div>
              <div class="muted">ID: {{ d.booking_id }}</div>
            </td>

            <td>
              <div class="main">{{ d.guest_name }}</div>
              <div class="muted">{{ d.phone }}</div>
            </td>

            <td>
              <span class="pill" :data-tone="getTone(d.status)">{{ d.status }}</span>
            </td>

            <td>
              <span class="chip">{{ d.booking_source }}</span>
            </td>

            <td class="num">{{ money(d.deposit_amount, d.deposit_currency) }}</td>
            <td class="num">{{ money(d.deposit_paid, d.deposit_currency) }}</td>
            <td class="num">{{ money(getBalance(d), d.deposit_currency) }}</td>

            <td>
              <div class="main">{{ formatDate(d.booking_date) }}</div>
              <div class="muted">{{ formatTime(d.booking_date) }}</div>
            </td>

            <td class="actions">
              <RouterLink
                class="link"
                :to="{ name: 'billing-deposits-show', params: { bookingId: String(d.booking_id) } }"
              >
                View
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Note -->
    <section class="note">
      <div class="note-title">How this page matches your database</div>
      <div class="note-text">
        Deposits are stored inside <b>bookings</b>: deposit_amount, deposit_paid, deposit_currency.
        This list is derived from booking records (joined with guests for display).
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive } from "vue"
import { deposits } from "@/data/billding/deposits"

// ─── Constants ───────────────────────────────────────────────
const STATUS_OPTIONS   = ["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"]
const SOURCE_OPTIONS   = ["walk_in", "phone", "email", "online", "other"]
const CURRENCY_OPTIONS = ["USD", "KHR"]

const TONE_MAP = {
  cancelled: "danger",
  no_show:   "danger",
  pending:   "warn",
  confirmed: "ok",
  checked_in:  "ok",
  checked_out: "ok",
}

// ─── Reactive Filters ────────────────────────────────────────
const filters = reactive({
  q:        "",
  status:   "all",
  source:   "all",
  currency: "all",
})

function resetFilters() {
  filters.q        = ""
  filters.status   = "all"
  filters.source   = "all"
  filters.currency = "all"
}

// ─── Helpers ─────────────────────────────────────────────────
function normalize(s) {
  return String(s ?? "").toLowerCase().trim()
}

function getBalance(d) {
  return Math.max(0, Number(d.deposit_amount || 0) - Number(d.deposit_paid || 0))
}

function getTone(status) {
  return TONE_MAP[normalize(status)] ?? "neutral"
}

function money(amount, cur = "USD") {
  const n     = Number(amount || 0)
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

// ─── Computed: Filtered & Sorted Rows ────────────────────────
const rows = computed(() => {
  const q = normalize(filters.q)

  return deposits
    .filter((d) => {
      if (filters.status   !== "all" && d.status          !== filters.status)   return false
      if (filters.source   !== "all" && d.booking_source  !== filters.source)   return false
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

// ─── Computed: Totals ────────────────────────────────────────
const totals = computed(() => {
  let amount = 0, paid = 0, balance = 0

  for (const d of rows.value) {
    amount  += Number(d.deposit_amount || 0)
    paid    += Number(d.deposit_paid   || 0)
    balance += getBalance(d)
  }

  return { amount, paid, balance }
})
</script>

<style scoped>
.page {
  padding: 18px 18px 40px;
  margin: 0 auto;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  color: #0f172a;
}

/* ─── Header ─── */
.top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
}
.subtitle {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}
.btn {
  appearance: none;
  border: none;
  background: #0f172a;
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn:hover { background: #1e293b; }

/* ─── Summary ─── */
.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 14px 0 18px;
}
.sum-card {
  padding: 12px;
  background: #f8fafc;
  border-radius: 14px;
}
.sum-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}
.sum-value {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 900;
}

/* ─── Filters ─── */
.filters {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.label {
  font-size: 12px;
  font-weight: 800;
  color: #334155;
}
.input,
.select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: none;
  border-radius: 12px;
  background: #f1f5f9;
  outline: none;
  font-size: 13px;
  transition: background 0.15s;
}
.input:focus,
.select:focus {
  background: #eaf2ff;
}

/* ─── Table ─── */
.table-wrap {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
thead th {
  text-align: left;
  font-size: 12px;
  color: #64748b;
  font-weight: 900;
  padding: 12px;
  background: #f8fafc;
  white-space: nowrap;
}
tbody td {
  padding: 12px;
  vertical-align: top;
  font-size: 13px;
  border-top: 1px solid #f1f5f9;
}
tbody tr:hover {
  background: #f8fafc;
}
.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.actions {
  width: 90px;
  text-align: right;
}
.main {
  font-weight: 800;
}
.muted {
  font-size: 12px;
  color: #64748b;
  margin-top: 3px;
}

/* ─── Pills & Chips ─── */
.pill {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  font-weight: 900;
  font-size: 12px;
  text-transform: lowercase;
}
.pill[data-tone="ok"]     { background: #ecfdf5; color: #047857; }
.pill[data-tone="warn"]   { background: #fffbeb; color: #b45309; }
.pill[data-tone="danger"] { background: #fef2f2; color: #b91c1c; }

.chip {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  font-weight: 800;
  font-size: 12px;
  text-transform: lowercase;
}

/* ─── Link ─── */
.link {
  color: #0f172a;
  font-weight: 900;
  text-decoration: none;
  transition: color 0.15s;
}
.link:hover {
  color: #3b82f6;
  text-decoration: underline;
}

/* ─── Empty ─── */
.empty {
  padding: 40px 18px;
  text-align: center;
  color: #64748b;
  font-weight: 700;
}

/* ─── Note ─── */
.note {
  margin-top: 16px;
  padding: 14px;
  border-radius: 16px;
  background: #f8fafc;
}
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

/* ─── Responsive ─── */
@media (max-width: 980px) {
  .filters  { grid-template-columns: 1fr 1fr; }
  .summary  { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .filters  { grid-template-columns: 1fr; }
  .summary  { grid-template-columns: 1fr; }
  .table-wrap { overflow-x: auto; }
}
</style>