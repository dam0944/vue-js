<script setup>
import { ref, computed, nextTick, watch } from "vue"
import $ from "jquery"
import { reports_occupancy as seed } from "@/data/report/reports_occupancy"

const rows = ref(seed.map((x) => ({ ...x })))

// filters
const q = ref("")
const from = ref("")
const to = ref("")
const sort = ref("date_desc")

const safe = (v) => (v ?? "").toString().toLowerCase()
const num = (v) => Number(v || 0)
const pct = (v) => `${Number(v || 0).toFixed(1)}%`
const money = (v, cur = "USD") => `${cur} ${Number(v || 0).toFixed(2)}`

function inRange(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr + "T00:00:00")
  const f = from.value ? new Date(from.value + "T00:00:00") : null
  const t = to.value ? new Date(to.value + "T23:59:59") : null
  if (f && d < f) return false
  if (t && d > t) return false
  return true
}

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.report_date).includes(key) ||
      safe(r.report_id).includes(key)

    const okFromTo = (!from.value && !to.value) || inRange(r.report_date)
    return hit && okFromTo
  })

  if (sort.value === "date_desc") list.sort((a, b) => (b.report_date || "").localeCompare(a.report_date || ""))
  if (sort.value === "date_asc") list.sort((a, b) => (a.report_date || "").localeCompare(b.report_date || ""))
  if (sort.value === "occ_desc") list.sort((a, b) => num(b.occupancy_rate) - num(a.occupancy_rate))
  if (sort.value === "rev_desc") list.sort((a, b) => num(b.total_revenue) - num(a.total_revenue))

  return list
})

// summary stats (based on filtered)
const stats = computed(() => {
  const list = filtered.value
  const days = list.length

  const totalRooms = days ? list[0].total_rooms : 0
  const avgOcc = days ? Math.round((list.reduce((s, r) => s + num(r.occupancy_rate), 0) / days) * 10) / 10 : 0
  const avgADR = days ? Math.round((list.reduce((s, r) => s + num(r.adr), 0) / days) * 100) / 100 : 0
  const avgRevPAR = days ? Math.round((list.reduce((s, r) => s + num(r.revpar), 0) / days) * 100) / 100 : 0

  const totalRevenue = list.reduce((s, r) => s + num(r.total_revenue), 0)
  const roomRevenue = list.reduce((s, r) => s + num(r.room_revenue), 0)
  const otherRevenue = list.reduce((s, r) => s + num(r.other_revenue), 0)

  const totalCheckins = list.reduce((s, r) => s + num(r.total_checkins), 0)
  const totalCheckouts = list.reduce((s, r) => s + num(r.total_checkouts), 0)

  return {
    days,
    totalRooms,
    avgOcc,
    avgADR,
    avgRevPAR,
    totalRevenue,
    roomRevenue,
    otherRevenue,
    totalCheckins,
    totalCheckouts,
  }
})

// slideDown detail drawer
const open = ref(false)
const selected = ref(null)
const drawerRef = ref(null)

function slideDownDrawer() {
  nextTick(() => {
    const el = drawerRef.value
    if (!el) return
    $(el).stop(true, true).css("display", "none").slideDown(240)
  })
}
function slideUpDrawer(cb) {
  const el = drawerRef.value
  if (!el) return cb?.()
  $(el).stop(true, true).slideUp(200, () => cb?.())
}

function viewRow(r) {
  selected.value = r
  open.value = true
  slideDownDrawer()
}
function close() {
  slideUpDrawer(() => {
    open.value = false
    selected.value = null
  })
}

watch(open, (v) => (document.body.style.overflow = v ? "hidden" : ""))

// export csv
function exportCSV() {
  const data = filtered.value || []
  if (!data.length) return alert("No data to export.")

  const headers = [
    "report_date",
    "total_rooms",
    "occupied_rooms",
    "available_rooms",
    "reserved_rooms",
    "maintenance_rooms",
    "occupancy_rate",
    "total_revenue",
    "room_revenue",
    "other_revenue",
    "total_checkins",
    "total_checkouts",
    "total_reservations",
    "adr",
    "revpar",
  ]

  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`
  const body = data.map((r) => [
    r.report_date,
    r.total_rooms,
    r.occupied_rooms,
    r.available_rooms,
    r.reserved_rooms,
    r.maintenance_rooms,
    r.occupancy_rate,
    r.total_revenue,
    r.room_revenue,
    r.other_revenue,
    r.total_checkins,
    r.total_checkouts,
    r.total_reservations,
    r.adr,
    r.revpar,
  ])

  const csv = [headers.join(","), ...body.map((row) => row.map(esc).join(","))].join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `occupancy-report-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// small helpers for bars
const clampPct = (n) => Math.max(0, Math.min(100, Number(n || 0)))
const barStyle = (n) => ({ width: `${clampPct(n)}%` })
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Occupancy Report</h1>
        <p>Daily occupancy • rooms status • ADR/RevPAR • slide-down details</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="refresh" @click="q=''; from=''; to=''; sort='date_desc'">
          Reset
        </VaButton>
        <VaButton color="primary" icon="download" @click="exportCSV">
          Export
        </VaButton>
      </div>
    </div>

    <!-- summary -->
    <div class="stats">
      <div class="stat">
        <div class="k">Days</div>
        <div class="v">{{ stats.days }}</div>
      </div>
      <div class="stat blue">
        <div class="k">Avg Occupancy</div>
        <div class="v">{{ stats.avgOcc }}%</div>
      </div>
      <div class="stat ok">
        <div class="k">Total Revenue</div>
        <div class="v">{{ money(stats.totalRevenue) }}</div>
      </div>
      <div class="stat">
        <div class="k">Avg ADR</div>
        <div class="v">{{ money(stats.avgADR) }}</div>
      </div>
      <div class="stat">
        <div class="k">Avg RevPAR</div>
        <div class="v">{{ money(stats.avgRevPAR) }}</div>
      </div>
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search date / report id..." />
      <VaInput v-model="from" type="date" label="From" />
      <VaInput v-model="to" type="date" label="To" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Date (Newest)', value: 'date_desc' },
          { text: 'Date (Oldest)', value: 'date_asc' },
          { text: 'Occupancy (High)', value: 'occ_desc' },
          { text: 'Revenue (High)', value: 'rev_desc' },
        ]"
        text-by="text"
        value-by="value"
        label="Sort"
      />
    </VaCard>

    <!-- table -->
    <VaCard class="tableCard">
      <div class="tableWrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total</th>
              <th>Occupied</th>
              <th>Available</th>
              <th>Reserved</th>
              <th>Maintenance</th>
              <th>Occ%</th>
              <th class="right">Revenue</th>
              <th class="right">ADR</th>
              <th class="right">RevPAR</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="11" class="empty">No reports found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.report_id">
              <td class="mono">{{ r.report_date }}</td>

              <td>{{ r.total_rooms }}</td>
              <td>{{ r.occupied_rooms }}</td>
              <td>{{ r.available_rooms }}</td>
              <td>{{ r.reserved_rooms }}</td>
              <td>{{ r.maintenance_rooms }}</td>

              <td>
                <div class="occCell">
                  <span class="badge">{{ pct(r.occupancy_rate) }}</span>
                  <div class="bar">
                    <div class="fill" :style="barStyle(r.occupancy_rate)"></div>
                  </div>
                </div>
              </td>

              <td class="right">
                <div class="main">{{ money(r.total_revenue) }}</div>
                <div class="sub">Room: {{ money(r.room_revenue) }} • Other: {{ money(r.other_revenue) }}</div>
              </td>

              <td class="right mono">{{ money(r.adr) }}</td>
              <td class="right mono">{{ money(r.revpar) }}</td>

              <td class="right">
                <VaButton size="small" preset="secondary" @click="viewRow(r)">View</VaButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- slideDown detail drawer -->
    <Teleport to="body">
      <div v-if="open" class="overlay" @click="close">
        <div class="drawer" @click.stop>
          <header class="drawerHead">
            <div>
              <div class="drawerTitle">Report Details</div>
              <div class="drawerSub">{{ selected?.report_date || "-" }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="close">Close</VaButton>
          </header>

          <section class="drawerBody">
            <div ref="drawerRef" class="drawerInner">
              <div v-if="selected" class="detailGrid">
                <div class="box">
                  <div class="t">Occupancy</div>
                  <div class="big">{{ pct(selected.occupancy_rate) }}</div>
                  <div class="muted">
                    {{ selected.occupied_rooms }}/{{ selected.total_rooms }} rooms occupied
                  </div>
                </div>

                <div class="box">
                  <div class="t">Rooms Status</div>
                  <div class="line"><b>Available:</b> {{ selected.available_rooms }}</div>
                  <div class="line"><b>Reserved:</b> {{ selected.reserved_rooms }}</div>
                  <div class="line"><b>Maintenance:</b> {{ selected.maintenance_rooms }}</div>
                </div>

                <div class="box">
                  <div class="t">Revenue</div>
                  <div class="big">{{ money(selected.total_revenue) }}</div>
                  <div class="muted">
                    Room: {{ money(selected.room_revenue) }} • Other: {{ money(selected.other_revenue) }}
                  </div>
                </div>

                <div class="box">
                  <div class="t">KPIs</div>
                  <div class="line"><b>ADR:</b> {{ money(selected.adr) }}</div>
                  <div class="line"><b>RevPAR:</b> {{ money(selected.revpar) }}</div>
                </div>

                <div class="box wide">
                  <div class="t">Activity</div>
                  <div class="chips">
                    <span class="chip">Check-ins • {{ selected.total_checkins }}</span>
                    <span class="chip">Check-outs • {{ selected.total_checkouts }}</span>
                    <span class="chip">Reservations • {{ selected.total_reservations }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer class="drawerFoot">
            <VaButton preset="secondary" @click="close">Close</VaButton>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page {
  padding: 20px 24px;
  background: #f6f8fb;
  min-height: 100vh;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}
.head h1 {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}
.head p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #475569;
}
.headBtns {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* summary stats */
.stats {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
@media (max-width: 1050px) {
  .stats {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 520px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
.stat {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
}
.stat .k {
  font-size: 12px;
  color: #64748b;
  font-weight: 900;
}
.stat .v {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 950;
  color: #0f172a;
}
.stat.ok {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.stat.blue {
  background: #eff6ff;
  border-color: #bfdbfe;
}

/* filters */
.filters {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
@media (max-width: 1000px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 520px) {
  .filters {
    grid-template-columns: 1fr;
  }
}

/* table */
.tableCard {
  border-radius: 14px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}
.tableWrap {
  overflow-x: auto;
}
.tbl {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.tbl th {
  text-align: left;
  padding: 12px 14px;
  font-size: 12px;
  color: #475569;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  white-space: nowrap;
}
.tbl td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}
.tbl tr:hover td {
  background: #fafcff;
}
.right {
  text-align: right;
}
.main {
  font-weight: 900;
  color: #0f172a;
  font-size: 13px;
}
.sub {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  color: #334155;
  white-space: nowrap;
}
.empty {
  text-align: center;
  padding: 20px !important;
  font-weight: 800;
  color: #64748b;
}

/* occ cell */
.occCell {
  display: grid;
  gap: 8px;
}
.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  width: fit-content;
}
.bar {
  height: 8px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  overflow: hidden;
}
.fill {
  height: 100%;
  background: #1d4ed8;
  border-radius: 999px;
}

/* overlay + drawer */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  padding: 18px;
}
.drawer {
  width: min(980px, 100%);
  max-height: 95vh;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}
.drawerHead {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.drawerTitle {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.drawerSub {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}
.drawerBody {
  padding: 16px;
  overflow: auto;
  max-height: calc(92vh - 118px);
}
.drawerFoot {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fff;
}

/* drawerInner slide target */
.drawerInner {
  display: none; /* jQuery slideDown target */
}

/* details */
.detailGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 760px) {
  .detailGrid {
    grid-template-columns: 1fr;
  }
}
.box {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fbfcfe;
  padding: 14px;
}
.box.wide {
  grid-column: 1 / -1;
}
.t {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
  margin-bottom: 8px;
}
.big {
  font-size: 22px;
  font-weight: 950;
  color: #0f172a;
}
.muted {
  color: #64748b;
  font-weight: 800;
  margin-top: 6px;
}
.line {
  margin: 6px 0;
  color: #0f172a;
  font-weight: 800;
}
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
}

/* vuestic polish */
:deep(.va-input__container),
:deep(.va-select__container) {
  border-radius: 10px;
  background: #f9fafb;
}
:deep(.va-button) {
  border-radius: 10px;
  font-weight: 800;
}
</style>
