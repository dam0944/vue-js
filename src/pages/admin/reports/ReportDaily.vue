<template>
  <div class="rp-page">
    <!-- Header -->
    <div class="rp-header">
      <div>
        <h1 class="rp-title">Daily Report</h1>
        <p class="rp-subtitle">
          {{ report.property_name }} • {{ formatDate(report.report_date) }}
        </p>
      </div>

      <div class="rp-actions">
        <VaButton preset="secondary" icon="refresh" @click="refresh">
          Refresh
        </VaButton>
        <VaButton icon="print" @click="printReport">
          Print
        </VaButton>
      </div>
    </div>

    <!-- Top KPIs -->
    <div class="rp-grid kpi-grid">
      <VaCard class="rp-card">
        <VaCardContent>
          <div class="kpi">
            <div class="kpi-label">Occupancy</div>
            <div class="kpi-value">{{ report.summary.occupancy_rate }}%</div>
            <div class="kpi-hint">
              {{ report.summary.occupied_rooms }} occupied / {{ report.summary.total_rooms }} rooms
            </div>
          </div>
          <VaProgressBar :model-value="report.summary.occupancy_rate" class="rp-progress" />
        </VaCardContent>
      </VaCard>

      <VaCard class="rp-card">
        <VaCardContent>
          <div class="kpi">
            <div class="kpi-label">Total Revenue</div>
            <div class="kpi-value">{{ money(report.revenue.total_revenue) }}</div>
            <div class="kpi-hint">Room + extras + tax − discount</div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="rp-card">
        <VaCardContent>
          <div class="kpi">
            <div class="kpi-label">Available Rooms</div>
            <div class="kpi-value">{{ report.summary.available_rooms }}</div>
            <div class="kpi-hint">Ready to sell today</div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="rp-card">
        <VaCardContent>
          <div class="kpi">
            <div class="kpi-label">Housekeeping</div>
            <div class="kpi-value">
              {{ report.summary.cleaning_rooms }} cleaning
            </div>
            <div class="kpi-hint">
              {{ report.summary.maintenance_rooms }} maintenance
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Revenue + Payments -->
    <div class="rp-grid two-col">
      <VaCard class="rp-card">
        <VaCardTitle>Revenue Breakdown</VaCardTitle>
        <VaCardContent>
          <div class="kv">
            <div class="kv-row">
              <span>Room Revenue</span>
              <strong>{{ money(report.revenue.room_revenue) }}</strong>
            </div>
            <div class="kv-row">
              <span>Extra Charges</span>
              <strong>{{ money(report.revenue.extra_charges) }}</strong>
            </div>
            <div class="kv-row">
              <span>Tax</span>
              <strong>{{ money(report.revenue.tax_amount) }}</strong>
            </div>
            <div class="kv-row">
              <span>Discounts</span>
              <strong>- {{ money(report.revenue.discounts) }}</strong>
            </div>

            <div class="kv-divider"></div>

            <div class="kv-row total">
              <span>Total</span>
              <strong>{{ money(report.revenue.total_revenue) }}</strong>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="rp-card">
        <VaCardTitle>Payments by Method</VaCardTitle>
        <VaCardContent>
          <VaDataTable
            :items="report.payments_breakdown"
            :columns="paymentColumns"
            class="rp-table"
            striped
          >
            <template #cell(total_amount)="{ value }">
              <strong>{{ money(value) }}</strong>
            </template>

            <template #cell(payment_method)="{ value }">
              <div class="pill">
                <span class="dot"></span>
                <span class="pill-text">{{ pretty(value) }}</span>
              </div>
            </template>
          </VaDataTable>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Arrivals + Departures -->
    <div class="rp-grid two-col">
      <VaCard class="rp-card">
        <VaCardTitle>Arrivals Today</VaCardTitle>
        <VaCardContent>
          <div v-if="!report.arrivals_today.length" class="rp-empty">No arrivals today.</div>

          <div v-else class="rp-list">
            <div v-for="a in report.arrivals_today" :key="a.reservation_number" class="rp-row">
              <div class="rp-row-main">
                <div class="rp-row-title">
                  {{ a.guest_name }}
                  <span class="rp-muted">• Room {{ a.room_number }}</span>
                </div>
                <div class="rp-row-sub">
                  {{ a.room_type }} • Check-in {{ time(a.check_in_at) }} •
                  {{ a.adults }} adult(s){{ a.children ? `, ${a.children} child` : "" }}
                </div>
              </div>

              <VaBadge :text="prettyStatus(a.status)" :color="statusColor(a.status)" />
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="rp-card">
        <VaCardTitle>Departures Today</VaCardTitle>
        <VaCardContent>
          <div v-if="!report.departures_today.length" class="rp-empty">No departures today.</div>

          <div v-else class="rp-list">
            <div v-for="d in report.departures_today" :key="d.reservation_number" class="rp-row">
              <div class="rp-row-main">
                <div class="rp-row-title">
                  {{ d.guest_name }}
                  <span class="rp-muted">• Room {{ d.room_number }}</span>
                </div>
                <div class="rp-row-sub">
                  Check-out {{ time(d.check_out_at) }} • Invoice {{ prettyStatus(d.invoice_status) }}
                </div>
              </div>

              <div class="rp-right">
                <div class="rp-amount">{{ money(d.total_amount) }}</div>
                <div class="rp-muted small">Balance: {{ money(d.balance_due) }}</div>
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Daily Closing + HK -->
    <div class="rp-grid two-col">
      <VaCard class="rp-card">
        <VaCardTitle>Daily Closing</VaCardTitle>
        <VaCardContent>
          <div class="closing">
            <div class="closing-row">
              <span>Closing #</span>
              <strong>{{ report.daily_closing.closing_number }}</strong>
            </div>
            <div class="closing-row">
              <span>Status</span>
              <VaBadge :text="prettyStatus(report.daily_closing.status)" color="primary" />
            </div>

            <div class="kv-divider"></div>

            <div class="closing-row">
              <span>Opening Cash</span>
              <strong>{{ money(report.daily_closing.opening_cash) }}</strong>
            </div>
            <div class="closing-row">
              <span>Closing Cash</span>
              <strong>{{ money(report.daily_closing.closing_cash) }}</strong>
            </div>
            <div class="closing-row">
              <span>Expected Cash</span>
              <strong>{{ money(report.daily_closing.expected_cash) }}</strong>
            </div>

            <div class="kv-divider"></div>

            <div class="closing-row total">
              <span>Difference</span>
              <strong :class="diffClass(report.daily_closing.cash_difference)">
                {{ money(report.daily_closing.cash_difference) }}
              </strong>
            </div>

            <div class="rp-muted small" style="margin-top: 10px">
              Closed at {{ time(report.daily_closing.closed_at) }}
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="rp-card">
        <VaCardTitle>Housekeeping Status</VaCardTitle>
        <VaCardContent>
          <div v-if="!report.housekeeping_status.length" class="rp-empty">No housekeeping updates.</div>

          <VaDataTable
            v-else
            :items="report.housekeeping_status"
            :columns="hkColumns"
            class="rp-table"
            striped
          >
            <template #cell(status)="{ value }">
              <VaBadge :text="pretty(value)" :color="hkColor(value)" />
            </template>

            <template #cell(last_cleaned_at)="{ value }">
              <span class="rp-muted">{{ value ? time(value) : "-" }}</span>
            </template>
          </VaDataTable>
        </VaCardContent>
      </VaCard>
    </div>
  </div>
</template>

<script setup>
import { dailyReport as report } from "@/data/report/dailyReport"

const paymentColumns = [
  { key: "payment_method", label: "Method" },
  { key: "transaction_count", label: "Transactions" },
  { key: "total_amount", label: "Total" },
  { key: "currency", label: "Currency" },
]

const hkColumns = [
  { key: "room_number", label: "Room" },
  { key: "status", label: "Status" },
  { key: "last_cleaned_at", label: "Last Cleaned" },
]

function refresh() {
  // later replace with API fetch
  console.log("refresh daily report")
}

function printReport() {
  window.print()
}

function money(val) {
  const n = Number(val || 0)
  return `$${n.toFixed(2)}`
}

function pretty(s) {
  return String(s || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function prettyStatus(s) {
  return pretty(s)
}

function statusColor(status) {
  const s = String(status || "")
  if (s === "checked_in") return "success"
  if (s === "confirmed") return "primary"
  if (s === "pending") return "warning"
  if (s === "cancelled" || s === "no_show") return "danger"
  return "primary"
}

function hkColor(status) {
  const s = String(status || "")
  if (s === "cleaning") return "warning"
  if (s === "maintenance") return "danger"
  if (s === "available") return "success"
  return "primary"
}

function diffClass(v) {
  const n = Number(v || 0)
  return n < 0 ? "neg" : n > 0 ? "pos" : ""
}

function formatDate(dateStr) {
  if (!dateStr) return "-"
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString()
}

function time(dateStr) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleString()
}
</script>

<style scoped>
/* Clean system look: white background, small shadow, primary = #0ea5e9 */
.rp-page {
  min-height: 100vh;
  background: #ffffff;
  padding: 18px;
}

.rp-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.rp-title {
  font-size: 22px;
  font-weight: 900;
  margin: 0;
  color: #0f172a;
}

.rp-subtitle {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.rp-actions {
  display: flex;
  gap: 10px;
}

/* Layout */
.rp-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
}

.kpi-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .two-col,
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

/* Cards */
.rp-card {
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.10); /* light shadow with primary tone */
}

/* KPI */
.kpi {
  display: grid;
  gap: 6px;
}

.kpi-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.kpi-value {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
}

.kpi-hint {
  font-size: 12px;
  color: #94a3b8;
}

.rp-progress {
  margin-top: 10px;
}

/* Key-value */
.kv {
  display: grid;
  gap: 10px;
}

.kv-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #0f172a;
}

.kv-row span {
  color: #64748b;
  font-size: 13px;
}

.kv-row.total span {
  color: #0f172a;
  font-weight: 800;
}
.kv-row.total strong {
  font-size: 16px;
}

.kv-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 4px 0;
}

/* List rows */
.rp-list {
  display: grid;
  gap: 10px;
}

.rp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 10px;
  background: #f8fafc;
}

.rp-row-title {
  font-weight: 800;
  color: #0f172a;
}

.rp-row-sub {
  margin-top: 3px;
  font-size: 12px;
  color: #64748b;
}

.rp-muted {
  color: #64748b;
}

.rp-muted.small {
  font-size: 12px;
}

.rp-right {
  text-align: right;
  min-width: 120px;
}

.rp-amount {
  font-weight: 900;
  color: #0f172a;
}

/* Pills */
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #f8fafc;
  border-radius: 999px;
  font-weight: 700;
  color: #0f172a;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #0ea5e9;
}
.pill-text {
  font-size: 13px;
}

/* Closing */
.closing {
  display: grid;
  gap: 10px;
}

.closing-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.closing-row span {
  color: #64748b;
  font-size: 13px;
}

.closing-row.total strong {
  font-size: 16px;
}

.neg {
  color: #ef4444;
}
.pos {
  color: #10b981;
}

/* Tables */
.rp-table :deep(th) {
  font-weight: 900;
  color: #0f172a;
}

.rp-table :deep(td) {
  color: #334155;
}

/* Empty */
.rp-empty {
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  color: #64748b;
}
</style>
