<script setup>
import { ref, computed } from "vue"
import { reports_revenue as seed } from "@/data/report/reports_revenue"

// data
const rows = ref(seed.map((x) => ({ ...x })))

// filters
const q = ref("")
const from = ref("")
const to = ref("")
const sort = ref("newest")

const safe = (v) => (v ?? "").toString().toLowerCase()

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.date).includes(key) ||
      safe(r.total_revenue).includes(key) ||
      safe(r.room_revenue).includes(key)

    const okFrom = !from.value || r.date >= from.value
    const okTo = !to.value || r.date <= to.value

    return hit && okFrom && okTo
  })

  if (sort.value === "newest") list.sort((a, b) => safe(b.date).localeCompare(safe(a.date)))
  if (sort.value === "oldest") list.sort((a, b) => safe(a.date).localeCompare(safe(b.date)))
  if (sort.value === "total_desc") list.sort((a, b) => Number(b.total_revenue || 0) - Number(a.total_revenue || 0))
  if (sort.value === "total_asc") list.sort((a, b) => Number(a.total_revenue || 0) - Number(b.total_revenue || 0))

  return list
})

// totals
const totals = computed(() => {
  const list = filtered.value
  const days = list.length
  const total = list.reduce((s, r) => s + Number(r.total_revenue || 0), 0)
  const room = list.reduce((s, r) => s + Number(r.room_revenue || 0), 0)
  const fb = list.reduce((s, r) => s + Number(r.food_beverage_revenue || 0), 0)
  const laundry = list.reduce((s, r) => s + Number(r.laundry_revenue || 0), 0)
  const other = list.reduce((s, r) => s + Number(r.other_services_revenue || 0), 0)

  const cash = list.reduce((s, r) => s + Number(r.cash_collected || 0), 0)
  const aba = list.reduce((s, r) => s + Number(r.aba_collected || 0), 0)
  const card = list.reduce((s, r) => s + Number(r.card_collected || 0), 0)

  const invoices = list.reduce((s, r) => s + Number(r.total_invoices || 0), 0)
  const tx = list.reduce((s, r) => s + Number(r.total_transactions || 0), 0)

  const avgDaily = days ? total / days : 0

  return { days, total, avgDaily, room, fb, laundry, other, cash, aba, card, invoices, tx }
})

// helpers
const money = (n, cur = "USD") => `${cur} ${Number(n || 0).toFixed(2)}`
const fmt = (s) => (s ? s : "-")

// modal
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

// export
function exportCSV() {
  const data = filtered.value || []
  if (!data.length) return alert("No data to export.")

  const headers = [
    "date",
    "total_revenue",
    "room_revenue",
    "food_beverage_revenue",
    "laundry_revenue",
    "other_services_revenue",
    "cash_collected",
    "aba_collected",
    "card_collected",
    "total_checkins",
    "total_checkouts",
    "total_invoices",
    "total_transactions",
  ]

  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`
  const body = data.map((r) => [
    r.date,
    r.total_revenue,
    r.room_revenue,
    r.food_beverage_revenue,
    r.laundry_revenue,
    r.other_services_revenue,
    r.cash_collected,
    r.aba_collected,
    r.card_collected,
    r.total_checkins,
    r.total_checkouts,
    r.total_invoices,
    r.total_transactions,
  ])

  const csv = [headers.join(","), ...body.map((row) => row.map(esc).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`
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
        <h1>Revenue Report</h1>
        <p>Daily revenue • breakdown • payment methods • export CSV</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="refresh" @click="q=''; from=''; to=''; sort='newest'">
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
        <div class="k">Days</div>
        <div class="v">{{ totals.days }}</div>
      </div>
      <div class="kpi blue">
        <div class="k">Total Revenue</div>
        <div class="v">{{ money(totals.total) }}</div>
      </div>
      <div class="kpi ok">
        <div class="k">Avg / Day</div>
        <div class="v">{{ money(totals.avgDaily) }}</div>
      </div>
      <div class="kpi">
        <div class="k">Invoices</div>
        <div class="v">{{ totals.invoices }}</div>
      </div>
      <div class="kpi">
        <div class="k">Transactions</div>
        <div class="v">{{ totals.tx }}</div>
      </div>
    </div>

    <!-- breakdown -->
    <div class="split">
      <VaCard class="panel">
        <div class="panelTitle">Revenue Breakdown</div>
        <div class="rows">
          <div class="r">
            <div class="k">Room Revenue</div>
            <div class="v">{{ money(totals.room) }}</div>
          </div>
          <div class="r">
            <div class="k">Food & Beverage</div>
            <div class="v">{{ money(totals.fb) }}</div>
          </div>
          <div class="r">
            <div class="k">Laundry</div>
            <div class="v">{{ money(totals.laundry) }}</div>
          </div>
          <div class="r">
            <div class="k">Other Services</div>
            <div class="v">{{ money(totals.other) }}</div>
          </div>
        </div>
      </VaCard>

      <VaCard class="panel">
        <div class="panelTitle">Payment Methods</div>
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
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search date / amount..." />
      <VaInput v-model="from" type="date" label="From" />
      <VaInput v-model="to" type="date" label="To" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Newest', value: 'newest' },
          { text: 'Oldest', value: 'oldest' },
          { text: 'Total (High)', value: 'total_desc' },
          { text: 'Total (Low)', value: 'total_asc' },
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
              <th class="right">Total</th>
              <th class="right">Room</th>
              <th class="right">F&B</th>
              <th class="right">Laundry</th>
              <th class="right">Other</th>
              <th>Payments</th>
              <th class="right">Invoices</th>
              <th class="right">Tx</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="10" class="empty">No revenue data found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.date">
              <td class="mono">{{ fmt(r.date) }}</td>

              <td class="right">
                <div class="main">{{ money(r.total_revenue) }}</div>
              </td>
              <td class="right">{{ money(r.room_revenue) }}</td>
              <td class="right">{{ money(r.food_beverage_revenue) }}</td>
              <td class="right">{{ money(r.laundry_revenue) }}</td>
              <td class="right">{{ money(r.other_services_revenue) }}</td>

              <td>
                <div class="chips">
                  <span class="chip">Cash {{ money(r.cash_collected) }}</span>
                  <span class="chip soft">ABA {{ money(r.aba_collected) }}</span>
                  <span class="chip soft">Card {{ money(r.card_collected) }}</span>
                </div>
              </td>

              <td class="right">{{ r.total_invoices || 0 }}</td>
              <td class="right">{{ r.total_transactions || 0 }}</td>

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
              <div class="m-title">Revenue Details</div>
              <div class="m-sub mono">{{ selected?.date || "-" }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="close">Close</VaButton>
          </header>

          <section class="m-body">
            <div v-if="selected" class="viewGrid">
              <div class="card">
                <div class="t">Total Revenue</div>
                <div class="big">{{ money(selected.total_revenue) }}</div>
                <div class="muted">
                  Check-ins: {{ selected.total_checkins || 0 }} • Check-outs: {{ selected.total_checkouts || 0 }}
                </div>
              </div>

              <div class="card">
                <div class="t">Breakdown</div>
                <div class="line"><b>Room:</b> {{ money(selected.room_revenue) }}</div>
                <div class="line"><b>F&B:</b> {{ money(selected.food_beverage_revenue) }}</div>
                <div class="line"><b>Laundry:</b> {{ money(selected.laundry_revenue) }}</div>
                <div class="line"><b>Other:</b> {{ money(selected.other_services_revenue) }}</div>
              </div>

              <div class="card">
                <div class="t">Payments</div>
                <div class="line"><b>Cash:</b> {{ money(selected.cash_collected) }}</div>
                <div class="line"><b>ABA:</b> {{ money(selected.aba_collected) }}</div>
                <div class="line"><b>Card:</b> {{ money(selected.card_collected) }}</div>
              </div>

              <div class="card wide">
                <div class="t">Volume</div>
                <div class="chips">
                  <span class="chip">Invoices • {{ selected.total_invoices || 0 }}</span>
                  <span class="chip soft">Transactions • {{ selected.total_transactions || 0 }}</span>
                </div>
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
.empty {
  text-align: center;
  padding: 20px !important;
  font-weight: 800;
  color: #64748b;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  color: #334155;
  white-space: nowrap;
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
.card.wide {
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
