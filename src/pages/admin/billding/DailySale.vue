<script setup>
import { ref, computed, watch } from "vue"
import { daily_sales } from "@/data/billding/daily_sales"

const days = ref([...daily_sales])

// pick date
const date = ref(days.value?.[0]?.date || "")
const dateOptions = computed(() => ["", ...days.value.map((d) => d.date)])

// selected day
const selected = computed(() => {
  return days.value.find((d) => d.date === date.value) || days.value[0] || null
})

function money(n, cur = "USD") {
  const v = Number(n || 0)
  return `${cur} ${v.toFixed(2)}`
}

const currency = computed(() => selected.value?.currency || "USD")

// hourly max for bar width
const hourMax = computed(() => {
  const list = selected.value?.hours || []
  return Math.max(...list.map((x) => Number(x.revenue || 0)), 1)
})

function pct(val) {
  const max = hourMax.value || 1
  return Math.round((Number(val || 0) / max) * 100)
}

// modal
const showModal = ref(false)
function openDetails() {
  showModal.value = true
}
function closeDetails() {
  showModal.value = false
}
watch(showModal, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page" v-if="selected">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>Daily Sales</h1>
        <p>Daily revenue + payment split + hourly performance</p>
      </div>

      <div class="actions">
        <VaSelect v-model="date" :options="dateOptions" label="Select Date" />
        <VaButton preset="secondary" icon="visibility" @click="openDetails">
          View Details
        </VaButton>
        <VaButton color="success" icon="download">Export</VaButton>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpis">
      <div class="kCard">
        <div class="k">Total Revenue</div>
        <div class="v">{{ money(selected.summary.totalRevenue, currency) }}</div>
        <div class="sub">Check-ins: {{ selected.summary.checkIns }} • Check-outs: {{ selected.summary.checkOuts }}</div>
      </div>

      <div class="kCard net">
        <div class="k">Net</div>
        <div class="v">{{ money(selected.summary.net, currency) }}</div>
        <div class="sub">Refunds: {{ money(selected.summary.refunds, currency) }}</div>
      </div>

      <div class="kCard">
        <div class="k">Rooms Sold</div>
        <div class="v">{{ selected.summary.roomsSold }}</div>
        <div class="sub">Guests: {{ selected.summary.guests }}</div>
      </div>

      <div class="kCard">
        <div class="k">Cash</div>
        <div class="v">{{ money(selected.summary.cash, currency) }}</div>
        <div class="sub">Front desk cash total</div>
      </div>

      <div class="kCard">
        <div class="k">ABA</div>
        <div class="v">{{ money(selected.summary.aba, currency) }}</div>
        <div class="sub">Bank transfer total</div>
      </div>

      <div class="kCard">
        <div class="k">Card</div>
        <div class="v">{{ money(selected.summary.card, currency) }}</div>
        <div class="sub">Card payments total</div>
      </div>
    </div>

    <!-- Layout -->
    <div class="grid">
      <!-- Hourly table -->
      <VaCard class="panel">
        <div class="panelHead">
          <div>
            <div class="title">Hourly Revenue</div>
            <div class="hint">Quick view — busiest hours</div>
          </div>
          <span class="pill">{{ selected.date }}</span>
        </div>

        <div class="tableWrap">
          <table class="tbl">
            <thead>
              <tr>
                <th style="width: 120px;">Hour</th>
                <th style="width: 120px;">Check-ins</th>
                <th>Revenue</th>
                <th class="right" style="width: 130px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in selected.hours" :key="h.hour">
                <td class="mono">{{ h.hour }}</td>
                <td><span class="chip">{{ h.checkIns }}</span></td>
                <td>
                  <div class="barRow">
                    <div class="bar" :style="{ width: pct(h.revenue) + '%' }"></div>
                    <div class="barText">{{ pct(h.revenue) }}%</div>
                  </div>
                </td>
                <td class="right amount">{{ money(h.revenue, currency) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </VaCard>

      <!-- Payment split -->
      <VaCard class="panel">
        <div class="panelHead">
          <div>
            <div class="title">Payment Split</div>
            <div class="hint">Cash vs ABA vs Card</div>
          </div>
          <span class="pill">Summary</span>
        </div>

        <div class="split">
          <div class="sRow">
            <div class="left">
              <div class="sName">Cash</div>
              <div class="sValue">{{ money(selected.summary.cash, currency) }}</div>
            </div>
            <div class="sBar">
              <div
                class="sFill"
                :style="{
                  width:
                    Math.round((selected.summary.cash / (selected.summary.totalRevenue || 1)) * 100) +
                    '%'
                }"
              ></div>
            </div>
            <div class="sPct">
              {{
                Math.round((selected.summary.cash / (selected.summary.totalRevenue || 1)) * 100)
              }}%
            </div>
          </div>

          <div class="sRow">
            <div class="left">
              <div class="sName">ABA</div>
              <div class="sValue">{{ money(selected.summary.aba, currency) }}</div>
            </div>
            <div class="sBar">
              <div
                class="sFill"
                :style="{
                  width:
                    Math.round((selected.summary.aba / (selected.summary.totalRevenue || 1)) * 100) +
                    '%'
                }"
              ></div>
            </div>
            <div class="sPct">
              {{
                Math.round((selected.summary.aba / (selected.summary.totalRevenue || 1)) * 100)
              }}%
            </div>
          </div>

          <div class="sRow">
            <div class="left">
              <div class="sName">Card</div>
              <div class="sValue">{{ money(selected.summary.card, currency) }}</div>
            </div>
            <div class="sBar">
              <div
                class="sFill"
                :style="{
                  width:
                    Math.round((selected.summary.card / (selected.summary.totalRevenue || 1)) * 100) +
                    '%'
                }"
              ></div>
            </div>
            <div class="sPct">
              {{
                Math.round((selected.summary.card / (selected.summary.totalRevenue || 1)) * 100)
              }}%
            </div>
          </div>

          <div class="note">
            <div class="k">Tip</div>
            <div class="v">
              If cash % is very high, you can check cashier balance vs receipts at end of day.
            </div>
          </div>
        </div>
      </VaCard>
    </div>

    <!-- Modal Details -->
    <Teleport to="body">
      <div v-if="showModal" class="m-backdrop" @click="closeDetails">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">Daily Details</div>
              <div class="m-sub">{{ selected.date }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeDetails">Close</VaButton>
          </header>

          <section class="m-body">
            <div class="details">
              <div class="dCard">
                <div class="k">Total Revenue</div>
                <div class="v big">{{ money(selected.summary.totalRevenue, currency) }}</div>
              </div>

              <div class="dCard">
                <div class="k">Net</div>
                <div class="v big">{{ money(selected.summary.net, currency) }}</div>
              </div>

              <div class="dCard">
                <div class="k">Refunds</div>
                <div class="v big">{{ money(selected.summary.refunds, currency) }}</div>
              </div>

              <div class="dCard">
                <div class="k">Rooms Sold</div>
                <div class="v big">{{ selected.summary.roomsSold }}</div>
              </div>

              <div class="dCard wide">
                <div class="k">Operations</div>
                <div class="v">
                  Check-ins: <b>{{ selected.summary.checkIns }}</b>
                  <span class="muted"> • </span>
                  Check-outs: <b>{{ selected.summary.checkOuts }}</b>
                  <span class="muted"> • </span>
                  Guests: <b>{{ selected.summary.guests }}</b>
                </div>
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="closeDetails">OK</VaButton>
            <VaButton color="primary">Print</VaButton>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>

  <div v-else class="emptyPage">
    No daily sales data.
  </div>
</template>

<style scoped>
.page {
  padding: 18px;
  background: #f6f8fb;
  min-height: 100vh;
}

/* Header */
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}
.head h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
}
.head p {
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

/* KPIs */
.kpis {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}
@media (max-width: 1100px) {
  .kpis { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 650px) {
  .kpis { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 420px) {
  .kpis { grid-template-columns: 1fr; }
}
.kCard {
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
}
.kCard .k {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.kCard .v {
  margin-top: 4px;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
}
.kCard .sub {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}
.kCard.net {
  border-color: #bfdbfe;
  background: #f0f7ff;
}

/* Panels */
.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}
@media (max-width: 980px) {
  .grid { grid-template-columns: 1fr; }
}
.panel {
  border-radius: 14px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}
.panelHead {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
}
.title {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}
.hint {
  margin-top: 3px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}
.pill {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 11px;
  font-weight: 900;
  color: #334155;
  white-space: nowrap;
}

/* Table */
.tableWrap { overflow-x: auto; }
.tbl {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.tbl th {
  padding: 12px 14px;
  font-size: 12px;
  text-align: left;
  color: #64748b;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  white-space: nowrap;
}
.tbl td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
}
.tbl tr:hover td { background: #fafcff; }
.right { text-align: right; }
.amount { font-weight: 900; color: #0f172a; }
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

/* bar */
.barRow {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bar {
  height: 10px;
  border-radius: 999px;
  background: #cbd5e1;
  flex: 1;
}
.barText {
  width: 46px;
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}

/* chip */
.chip {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 900;
  color: #334155;
}

/* payment split */
.split { padding: 14px; display: grid; gap: 12px; }
.sRow {
  display: grid;
  grid-template-columns: 1fr 1fr 60px;
  gap: 12px;
  align-items: center;
}
.left .sName {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.left .sValue {
  margin-top: 4px;
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.sBar {
  height: 10px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}
.sFill {
  height: 100%;
  background: #94a3b8;
  border-radius: 999px;
}
.sPct {
  text-align: right;
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.note {
  border: 1px dashed #cbd5e1;
  background: #fbfcfe;
  border-radius: 14px;
  padding: 12px;
}
.note .k { font-size: 12px; font-weight: 900; color: #64748b; }
.note .v { margin-top: 6px; font-size: 12px; font-weight: 800; color: #0f172a; }

/* Modal */
.m-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 99999;
  display: grid;
  place-items: center;
  padding: 16px;
}
.m {
  width: min(760px, 100%);
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
}
.m-title { font-size: 16px; font-weight: 900; color: #0f172a; }
.m-sub { margin-top: 2px; font-size: 12px; color: #64748b; font-weight: 700; }
.m-body { padding: 16px; max-height: 70vh; overflow: auto; }
.m-foot {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Details grid */
.details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 700px) {
  .details { grid-template-columns: 1fr; }
}
.dCard {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fbfcfe;
  padding: 14px;
}
.dCard.wide { grid-column: 1 / -1; }
.dCard .k { font-size: 12px; font-weight: 900; color: #64748b; }
.dCard .v { margin-top: 6px; font-weight: 900; color: #0f172a; }
.dCard .v.big { font-size: 22px; }
.muted { color: #64748b; }

.emptyPage {
  padding: 18px;
  color: #64748b;
  font-weight: 900;
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
</style>
