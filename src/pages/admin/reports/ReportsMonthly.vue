<template>
  <div class="rp-page">
    <!-- Header -->
    <div class="rp-header">
      <div class="rp-title">
        <h1>Monthly Report</h1>
        <p>Revenue, occupancy, payments, guests, and housekeeping summary</p>
      </div>

      <div class="rp-actions">
        <VaSelect
          v-model="selectedMonth"
          :options="monthOptions"
          label="Month"
          size="small"
          class="rp-select"
        />
        <VaButton preset="primary" icon="download" size="small" @click="exportReport">
          Export
        </VaButton>
      </div>
    </div>

    <!-- Summary -->
    <div class="rp-grid">
      <VaCard class="rp-card">
        <VaCardContent class="rp-card-body">
          <div class="rp-card-top">
            <div class="rp-icon soft">
              <VaIcon name="meeting_room" />
            </div>
            <div class="rp-meta">
              <div class="rp-label">Total Rooms</div>
              <div class="rp-value">{{ report.summary.total_rooms }}</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="rp-card">
        <VaCardContent class="rp-card-body">
          <div class="rp-card-top">
            <div class="rp-icon soft">
              <VaIcon name="hotel" />
            </div>
            <div class="rp-meta">
              <div class="rp-label">Occupancy</div>
              <div class="rp-value">{{ report.summary.average_occupancy_rate }}%</div>
            </div>
          </div>

          <div class="rp-progress">
            <VaProgressBar :model-value="report.summary.average_occupancy_rate" />
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="rp-card">
        <VaCardContent class="rp-card-body">
          <div class="rp-card-top">
            <div class="rp-icon soft">
              <VaIcon name="groups" />
            </div>
            <div class="rp-meta">
              <div class="rp-label">Guests</div>
              <div class="rp-value">{{ report.summary.total_guests }}</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="rp-card">
        <VaCardContent class="rp-card-body">
          <div class="rp-card-top">
            <div class="rp-icon soft">
              <VaIcon name="receipt_long" />
            </div>
            <div class="rp-meta">
              <div class="rp-label">Bookings</div>
              <div class="rp-value">{{ report.summary.total_bookings }}</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Revenue + Payments -->
    <div class="rp-two">
      <VaCard class="rp-card wide">
        <VaCardContent>
          <div class="rp-block-head">
            <div>
              <h3>Revenue Summary</h3>
              <p>{{ report.month }} • {{ report.property_name }}</p>
            </div>
            <VaChip color="primary" text-color="#fff" size="small">
              Total: {{ money(report.revenue.total_revenue) }} {{ report.revenue.currency }}
            </VaChip>
          </div>

          <div class="rp-revenue">
            <div class="rp-line">
              <span>Room Revenue</span>
              <b>{{ money(report.revenue.room_revenue) }}</b>
            </div>
            <div class="rp-line">
              <span>Extra Charges</span>
              <b>{{ money(report.revenue.extra_charges) }}</b>
            </div>
            <div class="rp-line">
              <span>Tax</span>
              <b>{{ money(report.revenue.tax_amount) }}</b>
            </div>
            <div class="rp-line">
              <span>Discounts</span>
              <b class="neg">-{{ money(report.revenue.discounts) }}</b>
            </div>

            <div class="rp-divider" />

            <div class="rp-line total">
              <span>Total Revenue</span>
              <b>{{ money(report.revenue.total_revenue) }} {{ report.revenue.currency }}</b>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="rp-card wide">
        <VaCardContent>
          <div class="rp-block-head">
            <div>
              <h3>Payments Breakdown</h3>
              <p>Grouped by payment_method (payments table)</p>
            </div>
          </div>

          <VaDataTable
            :items="report.payments_breakdown"
            :columns="paymentCols"
            class="rp-table"
            striped
          >
            <template #cell(payment_method)="{ value }">
              <div class="rp-method">
                <span class="rp-dot" />
                <span>{{ value }}</span>
              </div>
            </template>

            <template #cell(total_amount)="{ value }">
              <b>{{ money(value) }}</b>
            </template>
          </VaDataTable>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Room Type Performance -->
    <VaCard class="rp-card section">
      <VaCardContent>
        <div class="rp-block-head">
          <div>
            <h3>Room Type Performance</h3>
            <p>Sales + occupancy by room types</p>
          </div>
        </div>

        <div class="rp-roomtypes">
          <div
            v-for="rt in report.room_type_performance"
            :key="rt.room_type_id"
            class="rp-roomtype"
          >
            <div class="rp-roomtype-top">
              <div>
                <div class="rp-rt-name">{{ rt.type_name }}</div>
                <div class="rp-rt-sub">
                  Nights: <b>{{ rt.nights_sold }}</b> • Revenue: <b>{{ money(rt.revenue) }}</b>
                </div>
              </div>

              <VaChip color="primary" size="small" text-color="#fff">
                {{ rt.occupancy_rate }}%
              </VaChip>
            </div>

            <VaProgressBar :model-value="rt.occupancy_rate" />
          </div>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Housekeeping + Top Guests -->
    <div class="rp-two">
      <VaCard class="rp-card wide">
        <VaCardContent>
          <div class="rp-block-head">
            <div>
              <h3>Housekeeping Summary</h3>
              <p>Counts from housekeeping_tasks</p>
            </div>
          </div>

          <div class="rp-mini-grid">
            <div class="rp-mini">
              <div class="rp-mini-label">Cleanings</div>
              <div class="rp-mini-value">{{ report.housekeeping_summary.total_cleanings }}</div>
            </div>
            <div class="rp-mini">
              <div class="rp-mini-label">Maintenance</div>
              <div class="rp-mini-value">{{ report.housekeeping_summary.maintenance_tasks }}</div>
            </div>
            <div class="rp-mini">
              <div class="rp-mini-label">Deep Cleans</div>
              <div class="rp-mini-value">{{ report.housekeeping_summary.deep_cleans }}</div>
            </div>
            <div class="rp-mini">
              <div class="rp-mini-label">Inspections</div>
              <div class="rp-mini-value">{{ report.housekeeping_summary.inspections }}</div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="rp-card wide">
        <VaCardContent>
          <div class="rp-block-head">
            <div>
              <h3>Top Guests</h3>
              <p>From guests loyalty fields</p>
            </div>
          </div>

          <VaDataTable
            :items="report.top_guests"
            :columns="guestCols"
            class="rp-table"
            striped
          >
            <template #cell(loyalty_tier)="{ value }">
              <VaChip
                size="small"
                :color="tierColor(value)"
                text-color="#fff"
              >
                {{ value }}
              </VaChip>
            </template>

            <template #cell(total_spent)="{ value }">
              <b>{{ money(value) }}</b>
            </template>
          </VaDataTable>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Daily Closing -->
    <VaCard class="rp-card section">
      <VaCardContent>
        <div class="rp-block-head">
          <div>
            <h3>Daily Closing Summary</h3>
            <p>From daily_closings</p>
          </div>
        </div>

        <VaDataTable
          :items="report.daily_closing_summary"
          :columns="closingCols"
          class="rp-table"
          striped
        >
          <template #cell(total_sales)="{ value }">
            <b>{{ money(value) }}</b>
          </template>

          <template #cell(cash_difference)="{ value }">
            <span :class="['rp-diff', value < 0 ? 'neg' : value > 0 ? 'pos' : '']">
              {{ value === 0 ? '0.00' : money(value) }}
            </span>
          </template>

          <template #cell(status)="{ value }">
            <VaChip size="small" :color="value === 'reconciled' ? 'success' : 'primary'" text-color="#fff">
              {{ value }}
            </VaChip>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { monthlyReport } from "@/data/report/monthlyReport"

const selectedMonth = ref(monthlyReport.month)

const monthOptions = [
  { text: "Feb 2026", value: "2026-02" },
  { text: "Jan 2026", value: "2026-01" },
  { text: "Dec 2025", value: "2025-12" },
]

// for now: static = same data, but ready to swap API by month later
const report = computed(() => monthlyReport)

const paymentCols = [
  { key: "payment_method", label: "Method" },
  { key: "transaction_count", label: "Transactions" },
  { key: "total_amount", label: "Total" },
  { key: "currency", label: "Currency" },
]

const guestCols = [
  { key: "guest_name", label: "Guest" },
  { key: "total_stays", label: "Stays" },
  { key: "total_nights", label: "Nights" },
  { key: "total_spent", label: "Spent" },
  { key: "loyalty_tier", label: "Tier" },
]

const closingCols = [
  { key: "business_date", label: "Date" },
  { key: "total_sales", label: "Sales" },
  { key: "closing_cash", label: "Closing Cash" },
  { key: "cash_difference", label: "Difference" },
  { key: "status", label: "Status" },
]

function money(n) {
  const x = Number(n || 0)
  return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function tierColor(tier) {
  const v = String(tier || "none").toLowerCase()
  if (v === "platinum") return "primary"
  if (v === "gold") return "warning"
  if (v === "silver") return "info"
  if (v === "bronze") return "success"
  return "secondary"
}

function exportReport() {
  // later replace with real export
  console.log("Export monthly report:", report.value.month)
}
</script>

<style scoped>
/* Page */
.rp-page{
  min-height: 100vh;
  background: #ffffff;
  padding: 20px;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
}

/* Header */
.rp-header{
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.rp-title h1{
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
}
.rp-title p{
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

/* Actions */
.rp-actions{
  display: flex;
  align-items: center;
  gap: 10px;
}
.rp-select{
  width: 150px;
}

/* Cards layout */
.rp-grid{
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.rp-two{
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 12px;
  margin: 12px 0;
}
.section{
  margin-top: 12px;
}

/* Card minimal with little shadow */
.rp-card{
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06);
}
.rp-card-body{
  padding: 14px;
}

.rp-card-top{
  display: flex;
  align-items: center;
  gap: 12px;
}
.rp-icon{
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #0ea5e9;
}
.rp-icon.soft{
  background: rgba(14,165,233,0.10);
}

.rp-meta .rp-label{
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
}
.rp-meta .rp-value{
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
}

.rp-progress{
  margin-top: 10px;
}

/* Block headings */
.rp-block-head{
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.rp-block-head h3{
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.rp-block-head p{
  margin: 6px 0 0;
  font-size: 12px;
  color: #64748b;
}

/* Revenue list */
.rp-revenue{
  display: grid;
  gap: 8px;
}
.rp-line{
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #0f172a;
  font-size: 13px;
}
.rp-line span{ color: #64748b; }
.rp-line b{ color: #0f172a; }
.rp-line .neg{ color: #ef4444; }
.rp-line.total{
  font-size: 14px;
  font-weight: 900;
}
.rp-divider{
  height: 1px;
  background: rgba(15,23,42,0.08);
  margin: 4px 0;
}

/* Table */
.rp-table :deep(.va-data-table__table){
  border-radius: 12px;
  overflow: hidden;
}
.rp-method{
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.rp-dot{
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #0ea5e9;
}

/* Room types */
.rp-roomtypes{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.rp-roomtype{
  padding: 12px;
  border-radius: 12px;
  background: rgba(2, 8, 23, 0.02);
}
.rp-roomtype-top{
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.rp-rt-name{
  font-weight: 900;
  color: #0f172a;
}
.rp-rt-sub{
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

/* Mini summary */
.rp-mini-grid{
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.rp-mini{
  padding: 12px;
  border-radius: 12px;
  background: rgba(2, 8, 23, 0.02);
}
.rp-mini-label{
  font-size: 12px;
  color: #64748b;
}
.rp-mini-value{
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  margin-top: 4px;
}

/* Difference */
.rp-diff{
  font-weight: 800;
}
.rp-diff.neg{ color: #ef4444; }
.rp-diff.pos{ color: #10b981; }

/* Responsive */
@media (max-width: 1100px){
  .rp-grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rp-two{ grid-template-columns: 1fr; }
  .rp-roomtypes{ grid-template-columns: 1fr; }
}
@media (max-width: 560px){
  .rp-header{
    flex-direction: column;
    align-items: flex-start;
  }
  .rp-grid{ grid-template-columns: 1fr; }
}
</style>
