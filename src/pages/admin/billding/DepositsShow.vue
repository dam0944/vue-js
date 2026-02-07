<template>
  <div class="page">
    <!-- Back -->
    <nav class="back-nav">
      <RouterLink class="back-link" :to="{ name: 'admin.deposits' }">← Back to Deposits</RouterLink>
    </nav>

    <!-- Not Found -->
    <div v-if="!deposit" class="not-found">
      <div class="not-found-icon">⚠️</div>
      <div class="not-found-title">Deposit not found</div>
      <div class="not-found-text">No booking with ID <strong>{{ bookingId }}</strong> exists.</div>
      <RouterLink class="btn" :to="{ name: 'admin.deposits' }">Back to Deposits</RouterLink>
    </div>

    <!-- Found -->
    <template v-else>
      <!-- Header -->
      <header class="top">
        <div class="left">
          <h1 class="title">{{ deposit.booking_number }}</h1>
          <p class="subtitle">Booking ID: {{ deposit.booking_id }}</p>
        </div>
        <span class="pill" :data-tone="getTone(deposit.status)">{{ deposit.status }}</span>
      </header>

      <!-- Summary Cards -->
      <section class="summary">
        <div class="sum-card">
          <div class="sum-label">Deposit Amount</div>
          <div class="sum-value">{{ money(deposit.deposit_amount, deposit.deposit_currency) }}</div>
        </div>
        <div class="sum-card">
          <div class="sum-label">Paid</div>
          <div class="sum-value sum-ok">{{ money(deposit.deposit_paid, deposit.deposit_currency) }}</div>
        </div>
        <div class="sum-card">
          <div class="sum-label">Balance</div>
          <div class="sum-value" :class="balance > 0 ? 'sum-warn' : 'sum-ok'">
            {{ money(balance, deposit.deposit_currency) }}
          </div>
        </div>
      </section>

      <!-- Details Grid -->
      <section class="detail-grid">
        <!-- Guest Info -->
        <div class="detail-card">
          <div class="detail-card-title">Guest Information</div>
          <div class="detail-row">
            <span class="detail-label">Name</span>
            <span class="detail-value">{{ deposit.guest_name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone</span>
            <span class="detail-value">{{ deposit.phone || "—" }}</span>
          </div>
        </div>

        <!-- Booking Info -->
        <div class="detail-card">
          <div class="detail-card-title">Booking Information</div>
          <div class="detail-row">
            <span class="detail-label">Booking #</span>
            <span class="detail-value">{{ deposit.booking_number }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Source</span>
            <span class="detail-value"><span class="chip">{{ deposit.booking_source }}</span></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">{{ formatDate(deposit.booking_date) }} at {{ formatTime(deposit.booking_date) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value"><span class="pill" :data-tone="getTone(deposit.status)">{{ deposit.status }}</span></span>
          </div>
        </div>

        <!-- Deposit Info -->
        <div class="detail-card">
          <div class="detail-card-title">Deposit Breakdown</div>
          <div class="detail-row">
            <span class="detail-label">Currency</span>
            <span class="detail-value">{{ deposit.deposit_currency }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Required</span>
            <span class="detail-value">{{ money(deposit.deposit_amount, deposit.deposit_currency) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Paid</span>
            <span class="detail-value sum-ok">{{ money(deposit.deposit_paid, deposit.deposit_currency) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Balance</span>
            <span class="detail-value" :class="balance > 0 ? 'sum-warn' : 'sum-ok'">
              {{ money(balance, deposit.deposit_currency) }}
            </span>
          </div>
          <!-- Progress Bar -->
          <div class="progress-wrap">
            <div class="progress-label">
              <span>Payment Progress</span>
              <span>{{ progressPercent }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }" :class="progressClass"></div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { deposits } from "@/data/billding/deposits"

// ─── Props (injected via route params because props: true) ───
const props = defineProps({
  bookingId: {
    type: String,
    required: true,
  },
})

// ─── Constants ───────────────────────────────────────────────
const TONE_MAP = {
  cancelled:   "danger",
  no_show:     "danger",
  pending:     "warn",
  confirmed:   "ok",
  checked_in:  "ok",
  checked_out: "ok",
}

// ─── Computed ────────────────────────────────────────────────
const deposit = computed(() =>
  deposits.find((d) => String(d.booking_id) === String(props.bookingId)) ?? null
)

const balance = computed(() => {
  if (!deposit.value) return 0
  return Math.max(0, Number(deposit.value.deposit_amount || 0) - Number(deposit.value.deposit_paid || 0))
})

const progressPercent = computed(() => {
  if (!deposit.value) return 0
  const amount = Number(deposit.value.deposit_amount || 0)
  if (amount === 0) return 100
  const paid = Number(deposit.value.deposit_paid || 0)
  return Math.min(100, Math.round((paid / amount) * 100))
})

const progressClass = computed(() => {
  if (progressPercent.value >= 100) return "fill-ok"
  if (progressPercent.value >= 50)  return "fill-warn"
  return "fill-danger"
})

// ─── Helpers ─────────────────────────────────────────────────
function getTone(status) {
  return TONE_MAP[String(status || "").toLowerCase()] ?? "neutral"
}
 
function money(amount, cur = "USD") {
  const n     = Number(amount || 0)
  const fixed = cur === "KHR" ? 0 : 2
  return cur === "KHR" ? `${n.toFixed(fixed)} ៛` : `$${n.toFixed(fixed)}`
}

function formatDate(dt) {
  const s = String(dt || "")
  return s ? s.split(" ")[0] : "—"
}

function formatTime(dt) {
  const s = String(dt || "")
  return s.includes(" ") ? s.split(" ")[1] : "—"
}
</script>

<style scoped>
.page {
  padding: 18px 18px 40px;
  margin: 0 auto;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  color: #0f172a;
}

/* ─── Back Nav ─── */
.back-nav { margin-bottom: 18px; }
.back-link {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  transition: color 0.15s;
}
.back-link:hover { color: #3b82f6; }

/* ─── Not Found ─── */
.not-found {
  text-align: center;
  padding: 60px 20px;
  background: #f8fafc;
  border-radius: 20px;
}
.not-found-icon  { font-size: 40px; margin-bottom: 12px; }
.not-found-title { font-size: 18px; font-weight: 900; margin-bottom: 6px; }
.not-found-text  { color: #64748b; font-size: 14px; margin-bottom: 18px; }

/* ─── Header ─── */
.top {
  display: flex;
  align-items: center;
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
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

/* ─── Summary ─── */
.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}
.sum-card {
  padding: 14px;
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
  font-size: 20px;
  font-weight: 900;
}
.sum-ok   { color: #047857; }
.sum-warn { color: #b45309; }

/* ─── Detail Grid ─── */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
.detail-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 18px;
}
.detail-card-title {
  font-size: 13px;
  font-weight: 900;
  color: #334155;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  gap: 12px;
}
.detail-row:last-of-type { border-bottom: none; }
.detail-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 700;
  white-space: nowrap;
}
.detail-value {
  font-size: 13px;
  font-weight: 800;
  text-align: right;
}

/* ─── Progress Bar ─── */
.progress-wrap { margin-top: 16px; }
.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  margin-bottom: 6px;
}
.progress-track {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}
.fill-ok     { background: #10b981; }
.fill-warn   { background: #f59e0b; }
.fill-danger { background: #ef4444; }

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
  background: #eef2ff;
  font-weight: 800;
  font-size: 12px;
  text-transform: lowercase;
  color: #4338ca;
}

/* ─── Back button (not-found state) ─── */
.btn {
  display: inline-flex;
  appearance: none;
  border: none;
  background: #0f172a;
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s;
}
.btn:hover { background: #1e293b; }

/* ─── Responsive ─── */
@media (max-width: 900px) {
  .detail-grid { grid-template-columns: 1fr; }
  .summary     { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 500px) {
  .summary { grid-template-columns: 1fr; }
}
</style>