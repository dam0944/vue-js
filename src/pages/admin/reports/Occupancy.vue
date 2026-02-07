<!-- src/pages/reports/ReportsOccupancy.vue -->
<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Reports · Occupancy</h1>
        <p class="subtitle">
          Track occupancy rate, available vs occupied rooms, and room-type performance.
        </p>
      </div>

      <div class="actions">
        <VaSelect
          v-model="range"
          :options="rangeOptions"
          size="small"
          class="control"
          label="Range"
        />
        <VaInput
          v-model="typeSearch"
          size="small"
          class="control"
          placeholder="Search room type..."
          clearable
        >
          <template #prependInner>
            <VaIcon name="search" color="primary" />
          </template>
        </VaInput>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="cards">
      <div class="card">
        <div class="card-top">
          <div class="card-label">Occupancy</div>
          <VaChip color="primary" size="small" square>{{ formatPct(summary.occupancy_rate) }}</VaChip>
        </div>

        <div class="card-value">{{ formatPct(summary.occupancy_rate) }}</div>

        <div class="card-bottom">
          <VaProgressBar
            :model-value="clamp(summary.occupancy_rate, 0, 100)"
            color="primary"
            size="small"
          />
          <div class="mini">
            <span>Occupied: <b>{{ summary.occupied_rooms }}</b></span>
            <span class="dot"></span>
            <span>Available: <b>{{ summary.available_rooms }}</b></span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-top">
          <div class="card-label">Total Rooms</div>
          <VaIcon name="meeting_room" color="primary" />
        </div>
        <div class="card-value">{{ summary.total_rooms }}</div>
        <div class="mini">
          <span>Cleaning: <b>{{ summary.cleaning_rooms }}</b></span>
          <span class="dot"></span>
          <span>Maintenance: <b>{{ summary.maintenance_rooms }}</b></span>
        </div>
      </div>

      <div class="card">
        <div class="card-top">
          <div class="card-label">Out of Order</div>
          <VaIcon name="error" color="danger" />
        </div>
        <div class="card-value">{{ summary.out_of_order_rooms }}</div>
        <div class="mini">
          <span>Blocked: <b>{{ summary.blocked_rooms }}</b></span>
          <span class="dot"></span>
          <span>Occupied: <b>{{ summary.occupied_rooms }}</b></span>
        </div>
      </div>
    </div>

    <!-- Daily Occupancy -->
    <div class="section">
      <div class="section-head">
        <div>
          <h2 class="section-title">Daily Occupancy</h2>
          <p class="section-subtitle">Recent days overview.</p>
        </div>
      </div>

      <VaDataTable
        :items="dailyRows"
        :columns="dailyColumns"
        striped
        hoverable
        class="table"
      >
        <template #cell(occupancy_rate)="{ value }">
          <div class="cell-flex">
            <VaProgressBar :model-value="clamp(value, 0, 100)" color="primary" size="small" class="bar" />
            <span class="pct">{{ formatPct(value) }}</span>
          </div>
        </template>

        <template #cell(occupied_rooms)="{ value }">
          <VaChip color="primary" size="small" square>{{ value }}</VaChip>
        </template>

        <template #cell(available_rooms)="{ value }">
          <VaChip color="success" size="small" square>{{ value }}</VaChip>
        </template>
      </VaDataTable>
    </div>

    <!-- Room Type Occupancy -->
    <div class="section">
      <div class="section-head">
        <div>
          <h2 class="section-title">Room Type Performance</h2>
          <p class="section-subtitle">Compare occupancy rate by room type.</p>
        </div>
      </div>

      <VaDataTable
        :items="filteredTypes"
        :columns="typeColumns"
        striped
        hoverable
        class="table"
      >
        <template #cell(occupancy_rate)="{ value }">
          <div class="cell-flex">
            <VaProgressBar :model-value="clamp(value, 0, 100)" color="primary" size="small" class="bar" />
            <span class="pct">{{ formatPct(value) }}</span>
          </div>
        </template>

        <template #cell(status)="{ value }">
          <VaChip :color="value === 'active' ? 'success' : 'secondary'" size="small" square>
            {{ value }}
          </VaChip>
        </template>
      </VaDataTable>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, unref } from "vue"
import { reports_occupancy as reportsOccupancy } from "@/data/report/reports_occupancy"

/* ✅ You were missing these */
const rangeOptions = ["Last 7 days", "Last 14 days", "Last 30 days"]
const range = ref("Last 7 days")
const typeSearch = ref("")

/* ✅ Column definitions were missing */
const dailyColumns = [
  { key: "date", label: "Date", sortable: true },
  { key: "total_rooms", label: "Total", sortable: true },
  { key: "occupied_rooms", label: "Occupied", sortable: true },
  { key: "available_rooms", label: "Available", sortable: true },
  { key: "cleaning_rooms", label: "Cleaning", sortable: true },
  { key: "maintenance_rooms", label: "Maintenance", sortable: true },
  { key: "out_of_order_rooms", label: "Out of Order", sortable: true },
  { key: "occupancy_rate", label: "Rate", sortable: true },
]

const typeColumns = [
  { key: "type_code", label: "Code", sortable: true },
  { key: "type_name", label: "Room Type", sortable: true },
  { key: "room_class", label: "Class", sortable: true },
  { key: "total_rooms", label: "Total", sortable: true },
  { key: "occupied_rooms", label: "Occupied", sortable: true },
  { key: "occupancy_rate", label: "Rate", sortable: true },
  { key: "status", label: "Status", sortable: true },
]

/**
 * ✅ IMPORTANT: sometimes decimals come as "54.17" (string)
 * sometimes as null, "" or even "54,17"
 * This helper normalizes everything to a real number.
 */
function toNumber(v) {
  if (v === null || v === undefined) return 0
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  const cleaned = String(v).replace(",", ".") // handle "54,17"
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}
function clamp(n, min, max) {
  const x = toNumber(n)
  return Math.min(max, Math.max(min, x))
}
function formatPct(v) {
  return `${toNumber(v).toFixed(1)}%`
}

/**
 * ✅ Make sure report works whether it's:
 *  - a plain object: export const reports_occupancy = {...}
 *  - a ref: export const reports_occupancy = ref({...})
 */
const report = computed(() => unref(reportsOccupancy) || {})

/* Summary */
const summary = computed(() => {
  const s = report.value.summary || {}
  return {
    property_id: s.property_id ?? null,
    property_name: s.property_name ?? "-",
    total_rooms: toNumber(s.total_rooms),
    available_rooms: toNumber(s.available_rooms),
    occupied_rooms: toNumber(s.occupied_rooms),
    cleaning_rooms: toNumber(s.cleaning_rooms),
    maintenance_rooms: toNumber(s.maintenance_rooms),
    out_of_order_rooms: toNumber(s.out_of_order_rooms),
    blocked_rooms: toNumber(s.blocked_rooms),
    occupancy_rate: toNumber(s.occupancy_rate),
    as_of_date: s.as_of_date ?? "-",
  }
})

/* Daily rows */
const dailyRows = computed(() => {
  const rows = report.value.daily_occupancy || []
  return rows.map((d) => ({
    ...d,
    total_rooms: toNumber(d.total_rooms),
    occupied_rooms: toNumber(d.occupied_rooms),
    available_rooms: toNumber(d.available_rooms),
    cleaning_rooms: toNumber(d.cleaning_rooms),
    maintenance_rooms: toNumber(d.maintenance_rooms),
    out_of_order_rooms: toNumber(d.out_of_order_rooms),
    occupancy_rate: toNumber(d.occupancy_rate),
  }))
})

/* Room type table */
const filteredTypes = computed(() => {
  const q = typeSearch.value.trim().toLowerCase()
  const rows = report.value.room_type_occupancy || []

  return rows
    .map((t) => ({
      ...t,
      total_rooms: toNumber(t.total_rooms),
      occupied_rooms: toNumber(t.occupied_rooms),
      occupancy_rate: toNumber(t.occupancy_rate),
    }))
    .filter((t) => {
      if (!q) return true
      return (
        String(t.type_name || "").toLowerCase().includes(q) ||
        String(t.type_code || "").toLowerCase().includes(q) ||
        String(t.room_class || "").toLowerCase().includes(q)
      )
    })
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
  padding: 18px;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
}

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
  font-weight: 900;
  color: #0f172a;
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
  flex-wrap: wrap;
}

.control {
  min-width: 160px;
}

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

.card-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

.card-value {
  font-size: 26px;
  font-weight: 950;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin-bottom: 10px;
}

.card-bottom {
  display: grid;
  gap: 8px;
}

.mini {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}
.mini b {
  color: #0f172a;
}
.dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.5);
}

.section {
  padding: 14px 6px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}

.section-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

.table {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(2, 6, 23, 0.06);
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06);
}

.cell-flex {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;
}

.bar {
  flex: 1;
}

.pct {
  font-weight: 900;
  font-size: 12px;
  color: #0f172a;
}

@media (max-width: 1024px) {
  .cards {
    grid-template-columns: 1fr;
  }
  .control {
    min-width: 220px;
  }
}
</style>
