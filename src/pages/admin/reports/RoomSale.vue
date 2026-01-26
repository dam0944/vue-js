<script setup>
import { ref, computed } from "vue"
import { reports_room_sales as seed } from "@/data/report/reports_room_sales"

const rows = ref(seed.map((x) => ({ ...x })))

// filters
const q = ref("")
const roomType = ref("")
const sort = ref("revenue_desc")

const safe = (v) => (v ?? "").toString().toLowerCase()
const money = (n, cur = "USD") => `${cur} ${Number(n || 0).toFixed(2)}`

const roomTypeOptions = computed(() => {
  const s = new Set()
  rows.value.forEach((r) => s.add(r.room_type || ""))
  return ["", ...Array.from(s).filter(Boolean)]
})

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.room_number).includes(key) ||
      safe(r.room_type).includes(key) ||
      safe(r.total_revenue).includes(key)

    const okType = !roomType.value || r.room_type === roomType.value
    return hit && okType
  })

  if (sort.value === "revenue_desc") list.sort((a, b) => Number(b.total_revenue || 0) - Number(a.total_revenue || 0))
  if (sort.value === "revenue_asc") list.sort((a, b) => Number(a.total_revenue || 0) - Number(b.total_revenue || 0))
  if (sort.value === "stays_desc") list.sort((a, b) => Number(b.total_stays || 0) - Number(a.total_stays || 0))
  if (sort.value === "room") list.sort((a, b) => safe(a.room_number).localeCompare(safe(b.room_number)))

  return list
})

// KPIs
const totals = computed(() => {
  const list = filtered.value
  const rooms = list.length
  const revenue = list.reduce((s, r) => s + Number(r.total_revenue || 0), 0)
  const stays = list.reduce((s, r) => s + Number(r.total_stays || 0), 0)
  const nights = list.reduce((s, r) => s + Number(r.total_nights || 0), 0)
  const hours = list.reduce((s, r) => s + Number(r.total_hours || 0), 0)
  const cash = list.reduce((s, r) => s + Number(r.cash_revenue || 0), 0)
  const aba = list.reduce((s, r) => s + Number(r.aba_revenue || 0), 0)
  const card = list.reduce((s, r) => s + Number(r.card_revenue || 0), 0)
  const avgPerRoom = rooms ? revenue / rooms : 0
  return { rooms, revenue, stays, nights, hours, cash, aba, card, avgPerRoom }
})

// view modal
const open = ref(false)
const selected = ref(null)
function viewRow(r) {
  selected.value = r
  open.value = true
}
function close() {
  open.value = false
  selected.value = null
}

// export CSV
function exportCSV() {
  const data = filtered.value || []
  if (!data.length) return alert("No data to export.")

  const headers = [
    "room_id",
    "room_number",
    "room_type",
    "total_stays",
    "total_nights",
    "total_hours",
    "total_revenue",
    "cash_revenue",
    "aba_revenue",
    "card_revenue",
  ]

  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`
  const body = data.map((r) => [
    r.room_id,
    r.room_number,
    r.room_type,
    r.total_stays,
    r.total_nights,
    r.total_hours,
    r.total_revenue,
    r.cash_revenue,
    r.aba_revenue,
    r.card_revenue,
  ])

  const csv = [headers.join(","), ...body.map((row) => row.map(esc).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `room-sales-report-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Room Sales Report</h1>
        <p>Revenue by room • stays • nights/hours • payment breakdown</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="refresh" @click="q=''; roomType=''; sort='revenue_desc'">
          Reset
        </VaButton>
        <VaButton color="primary" icon="download" @click="exportCSV">
          Export
        </VaButton>
      </div>
    </div>

    <!-- KPI cards -->
    <div class="kpis">
      <div class="kpi">
        <div class="k">Rooms</div>
        <div class="v">{{ totals.rooms }}</div>
      </div>
      <div class="kpi blue">
        <div class="k">Total Revenue</div>
        <div class="v">{{ money(totals.revenue) }}</div>
      </div>
      <div class="kpi ok">
        <div class="k">Avg / Room</div>
        <div class="v">{{ money(totals.avgPerRoom) }}</div>
      </div>
      <div class="kpi">
        <div class="k">Stays</div>
        <div class="v">{{ totals.stays }}</div>
      </div>
      <div class="kpi">
        <div class="k">Nights / Hours</div>
        <div class="v">{{ totals.nights }} / {{ totals.hours }}</div>
      </div>
    </div>

    <!-- breakdown -->
    <div class="split">
      <VaCard class="panel">
        <div class="panelTitle">Payment Breakdown</div>
        <div class="rows">
          <div class="r">
            <div class="k">Cash</div>
            <div class="v">{{ money(totals.cash) }}</div>
          </div>
          <div class="r">
            <div class="k">ABA</div>
            <div class="v">{{ money(totals.aba) }}</div>
          </div>
          <div class="r">
            <div class="k">Card</div>
            <div class="v">{{ money(totals.card) }}</div>
          </div>
        </div>
      </VaCard>

      <VaCard class="tipsCard">
        <div class="tipsHeader">
          <span class="icon">💡</span>
          <div>
            <div class="tipsTitle">Quick Tips</div>
            <div class="tipsSub">How to read this report</div>
          </div>
        </div>
        <ul class="tipsList">
          <li>
            Rooms with high <b>hours but low nights</b> = short stays.
          </li>
          <li>
            Compare <b>cash vs ABA</b> to see preferred payment.
          </li>
          <li>
            Suites should have <b>higher nights</b> than Standard rooms.
          </li>
          <li>
            Sort by <b>Total Revenue</b> to find top rooms.
          </li>
          <li>
            Use date range to compare busy vs slow days.
          </li>
        </ul>
      </VaCard>
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search room number / type / revenue..." />
      <VaSelect v-model="roomType" :options="roomTypeOptions" label="Room Type" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Revenue (High)', value: 'revenue_desc' },
          { text: 'Revenue (Low)', value: 'revenue_asc' },
          { text: 'Most Stays', value: 'stays_desc' },
          { text: 'Room Number', value: 'room' },
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
              <th>Room</th>
              <th>Type</th>
              <th class="right">Stays</th>
              <th class="right">Nights</th>
              <th class="right">Hours</th>
              <th class="right">Revenue</th>
              <th>Payments</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="8" class="empty">No room sales data found.</td>
            </tr>

            <tr v-for="r in filtered" :key="`${r.room_id}-${r.room_number}`">
              <td>
                <div class="main">Room {{ r.room_number }}</div>
                <div class="sub">ID: {{ r.room_id }}</div>
              </td>

              <td>
                <span class="chip">{{ r.room_type }}</span>
              </td>

              <td class="right">{{ r.total_stays || 0 }}</td>
              <td class="right">{{ r.total_nights || 0 }}</td>
              <td class="right">{{ r.total_hours || 0 }}</td>

              <td class="right">
                <div class="main">{{ money(r.total_revenue) }}</div>
              </td>

              <td>
                <div class="chips">
                  <span class="chip">Cash {{ money(r.cash_revenue) }}</span>
                  <span class="chip soft">ABA {{ money(r.aba_revenue) }}</span>
                  <span class="chip soft">Card {{ money(r.card_revenue) }}</span>
                </div>
              </td>

              <td class="right">
                <VaButton size="small" preset="secondary" @click="viewRow(r)">View</VaButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- VIEW MODAL -->
    <Teleport to="body">
      <div v-if="open" class="m-wrap" @click="close">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">Room Sales Details</div>
              <div class="m-sub">Room {{ selected?.room_number || "-" }} • {{ selected?.room_type || "-" }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="close">Close</VaButton>
          </header>

          <section class="m-body">
            <div v-if="selected" class="viewGrid">
              <div class="card">
                <div class="t">Revenue</div>
                <div class="big">{{ money(selected.total_revenue) }}</div>
                <div class="muted">Stays: {{ selected.total_stays }} • Nights: {{ selected.total_nights }} • Hours: {{ selected.total_hours }}</div>
              </div>

              <div class="card">
                <div class="t">Payments</div>
                <div class="line"><b>Cash:</b> {{ money(selected.cash_revenue) }}</div>
                <div class="line"><b>ABA:</b> {{ money(selected.aba_revenue) }}</div>
                <div class="line"><b>Card:</b> {{ money(selected.card_revenue) }}</div>
              </div>

              <div class="card">
                <div class="t">Room</div>
                <div class="line"><b>Room ID:</b> {{ selected.room_id }}</div>
                <div class="line"><b>Room Number:</b> {{ selected.room_number }}</div>
                <div class="line"><b>Type:</b> {{ selected.room_type }}</div>
              </div>
            </div>
          </section>

          <footer class="m-foot">
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

/* KPIs */
.kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}
@media (max-width: 1100px) {
  .kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 520px) {
  .kpis {
    grid-template-columns: 1fr;
  }
}
.kpi {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
}
.kpi .k {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}
.kpi .v {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}
.kpi.blue {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.kpi.ok {
  background: #dcfce7;
  border-color: #bbf7d0;
}

/* breakdown panels */
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
@media (max-width: 900px) {
  .split {
    grid-template-columns: 1fr;
  }
}
.panel {
  border-radius: 14px;
  border: 1px solid #eef2f6;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}
.panelTitle {
  padding: 14px 14px 0;
  font-weight: 900;
  color: #0f172a;
}
.rows {
  padding: 12px 14px 14px;
}
.r {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #e2e8f0;
}
.r:last-child {
  border-bottom: none;
}
.r .k {
  color: #64748b;
  font-weight: 800;
  font-size: 12px;
}
.r .v {
  color: #0f172a;
  font-weight: 900;
}

/* filters */
.filters {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
@media (max-width: 900px) {
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
.empty {
  text-align: center;
  padding: 20px !important;
  font-weight: 800;
  color: #64748b;
}

/* chips */
.chips {
  display: flex;
  gap: 6px;
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
.chip.soft {
  background: #f1f5f9;
}

/* modal */
.m-wrap {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  padding: 18px;
}
.m {
  width: min(980px, 100%);
  max-height: 95vh;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}
.m-head {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.m-title {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.m-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}
.m-body {
  padding: 16px;
  overflow: auto;
  max-height: calc(92vh - 118px);
}
.m-foot {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fff;
}
.viewGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 760px) {
  .viewGrid {
    grid-template-columns: 1fr;
  }
}
.card {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fbfcfe;
  padding: 14px;
}
.t {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
  margin-bottom: 8px;
}
.big {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
}
.muted {
  color: #64748b;
  font-weight: 800;
}
.line {
  margin: 6px 0;
  color: #0f172a;
  font-weight: 800;
}

/* Vuestic polish */
:deep(.va-input__container),
:deep(.va-select__container) {
  border-radius: 10px;
  background: #f9fafb;
}
:deep(.va-button) {
  border-radius: 10px;
  font-weight: 800;
}
.tipsCard {
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #eef2f6;
  background: linear-gradient(180deg, #fff7ed, #fff);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.tipsHeader {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.icon {
  font-size: 22px;
}

.tipsTitle {
  font-weight: 900;
  color: #7c2d12;
}

.tipsSub {
  font-size: 12px;
  color: #9a3412;
}

.tipsList {
  padding-left: 18px;
}

.tipsList li {
  margin-bottom: 8px;
  font-size: 13px;
  color: #374151;
}

</style>
