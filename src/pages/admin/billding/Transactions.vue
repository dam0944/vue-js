<script setup>
import { ref, computed, watch } from "vue"
import { transactions } from "@/data/billding/transactions"

const rows = ref([...transactions])

// -------- filters --------
const q = ref("")
const type = ref("")
const method = ref("")
const sort = ref("newest")

const typeOptions = ["", "check_in", "check_out", "extra", "refund"]
const methodOptions = ["", "cash", "aba", "card", "paypal"]
const safe = (v) => (v ?? "").toString().toLowerCase()

function label(s) {
  return s ? s.replaceAll("_", " ").toUpperCase() : "-"
}
function money(n, cur = "USD") {
  const v = Number(n || 0)
  const sign = v < 0 ? "-" : ""
  return `${sign}${cur} ${Math.abs(v).toFixed(2)}`
}

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.trxNumber).includes(key) ||
      safe(r.bookingNumber).includes(key) ||
      safe(r.guest?.name).includes(key) ||
      safe(r.guest?.phone).includes(key) ||
      safe(r.room?.number).includes(key) ||
      safe(r.description).includes(key)

    const okType = !type.value || r.type === type.value
    const okMethod = !method.value || r.payment?.method === method.value

    return hit && okType && okMethod
  })

  if (sort.value === "newest") list.sort((a, b) => (b.id || 0) - (a.id || 0))
  if (sort.value === "oldest") list.sort((a, b) => (a.id || 0) - (b.id || 0))
  if (sort.value === "amount") list.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))

  return list
})

// -------- summary stats --------
const stats = computed(() => {
  const all = rows.value
  const sum = (fn) => all.reduce((s, x) => s + fn(x), 0)

  const sales = sum((x) => (Number(x.amount || 0) > 0 ? Number(x.amount || 0) : 0))
  const refunds = Math.abs(sum((x) => (Number(x.amount || 0) < 0 ? Number(x.amount || 0) : 0)))
  const net = sales - refunds

  const byMethod = (m) =>
    sum((x) => (x.payment?.method === m ? Number(x.amount || 0) : 0))

  return {
    sales,
    refunds,
    net,
    cash: byMethod("cash"),
    aba: byMethod("aba"),
    card: byMethod("card"),
  }
})

// -------- modal --------
const showModal = ref(false)
const selected = ref(null)

function openView(r) {
  selected.value = r
  showModal.value = true
}
function closeView() {
  showModal.value = false
  selected.value = null
}

watch(showModal, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>Transactions</h1>
        <p>POS receipts • Cash/ABA/Card tracking • Refund control</p>
      </div>

      <div class="headRight">
        <VaButton preset="secondary" icon="download">Export</VaButton>
        <VaButton color="success" icon="add">New Sale</VaButton>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary">
      <div class="sCard">
        <div class="k">Sales</div>
        <div class="v">{{ money(stats.sales) }}</div>
      </div>
      <div class="sCard danger">
        <div class="k">Refunds</div>
        <div class="v">{{ money(stats.refunds) }}</div>
      </div>
      <div class="sCard net">
        <div class="k">Net</div>
        <div class="v">{{ money(stats.net) }}</div>
      </div>
      <div class="sCard">
        <div class="k">Cash</div>
        <div class="v">{{ money(stats.cash) }}</div>
      </div>
      <div class="sCard">
        <div class="k">ABA</div>
        <div class="v">{{ money(stats.aba) }}</div>
      </div>
      <div class="sCard">
        <div class="k">Card</div>
        <div class="v">{{ money(stats.card) }}</div>
      </div>
    </div>

    <!-- Filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search trx / booking / guest / room / note..." />
      <VaSelect v-model="type" :options="typeOptions" label="Type" />
      <VaSelect v-model="method" :options="methodOptions" label="Payment Method" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Newest', value: 'newest' },
          { text: 'Oldest', value: 'oldest' },
          { text: 'Amount (High)', value: 'amount' },
        ]"
        label="Sort"
        text-by="text"
        value-by="value"
      />
    </VaCard>

    <!-- Table -->
    <VaCard class="tableCard">
      <div class="tableWrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Description</th>
              <th>Payment</th>
              <th class="right">Amount</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="empty">No transactions found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.id">
              <td>
                <div class="main">{{ r.trxNumber }}</div>
                <div class="sub mono">{{ r.date }}</div>
                <div class="sub">Booking: {{ r.bookingNumber }}</div>
                <span class="badge" :class="'t-' + r.type">{{ label(r.type) }}</span>
              </td>

              <td>
                <div class="main">{{ r.guest?.name || "-" }}</div>
                <div class="sub">{{ r.guest?.phone || "-" }}</div>
                <div class="sub">Staff: {{ r.staff?.name || "-" }}</div>
              </td>

              <td>
                <div class="main">Room {{ r.room?.number || "-" }}</div>
                <div class="sub">{{ r.room?.type || "-" }}</div>
              </td>

              <td>
                <div class="sub">{{ r.description || "-" }}</div>
              </td>

              <td>
                <span class="badge pay" :class="'p-' + (r.payment?.status || '')">
                  {{ label(r.payment?.status) }}
                </span>
                <div class="sub">Method: <b>{{ label(r.payment?.method) }}</b></div>
              </td>

              <td class="right">
                <div class="amount" :class="{ neg: Number(r.amount || 0) < 0 }">
                  {{ money(r.amount, r.currency) }}
                </div>
              </td>

              <td class="right">
                <VaButton size="small" preset="secondary" @click="openView(r)">View</VaButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- Modal: receipt style -->
    <Teleport to="body">
      <div v-if="showModal" class="m-backdrop" @click="closeView">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">Receipt</div>
              <div class="m-sub">{{ selected?.trxNumber }} • {{ selected?.date }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeView">Close</VaButton>
          </header>

          <section class="m-body">
            <div class="receipt">
              <div class="rRow">
                <span class="k">Booking</span>
                <span class="v mono">{{ selected?.bookingNumber }}</span>
              </div>
              <div class="rRow">
                <span class="k">Guest</span>
                <span class="v">{{ selected?.guest?.name }} ({{ selected?.guest?.phone }})</span>
              </div>
              <div class="rRow">
                <span class="k">Room</span>
                <span class="v">Room {{ selected?.room?.number }} • {{ selected?.room?.type }}</span>
              </div>
              <div class="rRow">
                <span class="k">Type</span>
                <span class="v">
                  <span class="badge" :class="'t-' + selected?.type">{{ label(selected?.type) }}</span>
                </span>
              </div>
              <div class="rRow">
                <span class="k">Payment</span>
                <span class="v">{{ label(selected?.payment?.method) }} • {{ label(selected?.payment?.status) }}</span>
              </div>

              <div class="divider"></div>

              <div class="rRow big">
                <span class="k">Amount</span>
                <span class="v" :class="{ neg: Number(selected?.amount||0) < 0 }">
                  {{ money(selected?.amount, selected?.currency) }}
                </span>
              </div>

              <div class="note" v-if="selected?.description">
                <div class="k">Description</div>
                <div class="v">{{ selected.description }}</div>
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="closeView">OK</VaButton>
            <VaButton color="primary">Print</VaButton>
          </footer>
        </div>
      </div>
    </Teleport>
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
  gap: 16px;
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
.headRight {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Summary */
.summary {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}
@media (max-width: 1100px) {
  .summary { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 650px) {
  .summary { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 420px) {
  .summary { grid-template-columns: 1fr; }
}
.sCard {
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
}
.sCard .k {
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}
.sCard .v {
  margin-top: 4px;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
}
.sCard.danger {
  border-color: #fecaca;
  background: #fff5f5;
}
.sCard.net {
  border-color: #bfdbfe;
  background: #f0f7ff;
}

/* Filters */
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
@media (max-width: 900px) {
  .filters { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .filters { grid-template-columns: 1fr; }
}

/* Table */
.tableCard {
  border-radius: 14px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}
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
  vertical-align: top;
}
.tbl tr:hover td { background: #fafcff; }

.right { text-align: right; }
.main { font-weight: 900; font-size: 13px; color: #0f172a; }
.sub { margin-top: 4px; font-size: 12px; font-weight: 700; color: #64748b; }
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}
.empty {
  text-align: center;
  padding: 18px !important;
  font-weight: 900;
  color: #64748b;
}

/* Badges */
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
  margin-top: 8px;
}
.badge.pay { margin-top: 0; background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }

.t-check_in { background: #ecfdf5; border-color: #bbf7d0; color: #166534; }
.t-check_out { background: #f1f5f9; border-color: #e2e8f0; color: #475569; }
.t-extra { background: #fff7ed; border-color: #fed7aa; color: #9a3412; }
.t-refund { background: #fff1f2; border-color: #fecdd3; color: #9f1239; }

.p-paid { background: #dcfce7; border-color: #bbf7d0; color: #166534; }
.p-unpaid { background: #fee2e2; border-color: #fecaca; color: #991b1b; }
.p-partial { background: #fff7ed; border-color: #fed7aa; color: #9a3412; }
.p-refunded { background: #eef2ff; border-color: #c7d2fe; color: #4338ca; }

.amount {
  font-weight: 900;
  font-size: 14px;
  color: #0f172a;
}
.amount.neg { color: #b91c1c; }

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
  gap: 12px;
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

/* Receipt */
.receipt {
  border: 1px dashed #cbd5e1;
  background: #fbfcfe;
  border-radius: 14px;
  padding: 14px;
}
.rRow {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding: 8px 0;
}
.rRow .k { font-size: 12px; font-weight: 900; color: #64748b; }
.rRow .v { font-size: 12px; font-weight: 800; color: #0f172a; }
.rRow.big .v { font-size: 22px; font-weight: 900; color: #0f172a; }
.rRow.big .v.neg { color: #b91c1c; }
.divider { height: 1px; background: #e2e8f0; margin: 10px 0; }
.note { margin-top: 10px; }
.note .k { font-size: 12px; font-weight: 900; color: #64748b; }
.note .v { margin-top: 6px; font-weight: 800; color: #0f172a; }

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
