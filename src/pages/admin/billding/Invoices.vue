<script setup>
import { ref, computed, watch } from "vue"
import { invoices } from "@/data/billding/invoices"

const rows = ref([...invoices])

// ---------- Filters ----------
const q = ref("")
const status = ref("")
const method = ref("")
const sort = ref("newest")

const statusOptions = ["", "issued", "cancelled", "refunded"]
const methodOptions = ["", "cash", "aba", "card", "paypal"]

const safe = (v) => (v ?? "").toString().toLowerCase()
const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")
const money = (n, cur = "USD") => `${cur} ${Number(n || 0).toFixed(2)}`

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.invoiceNumber).includes(key) ||
      safe(r.bookingNumber).includes(key) ||
      safe(r.guest?.name).includes(key) ||
      safe(r.guest?.phone).includes(key) ||
      safe(r.room?.number).includes(key)

    const okStatus = !status.value || r.status === status.value
    const okMethod = !method.value || r.payment?.method === method.value
    return hit && okStatus && okMethod
  })

  if (sort.value === "newest") list.sort((a, b) => (b.id || 0) - (a.id || 0))
  if (sort.value === "oldest") list.sort((a, b) => (a.id || 0) - (b.id || 0))
  if (sort.value === "total") list.sort((a, b) => (b.summary?.total || 0) - (a.summary?.total || 0))

  return list
})

// ---------- Summary ----------
const summary = computed(() => {
  const all = rows.value
  const total = all.reduce((s, x) => s + Number(x.summary?.total || 0), 0)
  const refunded = all
    .filter((x) => x.status === "refunded" || x.payment?.status === "refunded")
    .reduce((s, x) => s + Number(x.summary?.total || 0), 0)
  const count = all.length
  return { total, refunded, count }
})

// ---------- Modal ----------
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

// ---------- Print ----------
function printInvoice() {
  // simplest print: print current page with invoice modal open
  // later you can use a dedicated print template route
  window.print()
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>Invoices</h1>
        <p>Billing history • Print invoice • Refund tracking</p>
      </div>

      <div class="topCards">
        <div class="tCard">
          <div class="k">Invoices</div>
          <div class="v">{{ summary.count }}</div>
        </div>
        <div class="tCard">
          <div class="k">Total Billed</div>
          <div class="v">{{ money(summary.total) }}</div>
        </div>
        <div class="tCard danger">
          <div class="k">Refunded</div>
          <div class="v">{{ money(summary.refunded) }}</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search invoice / booking / guest / phone / room..." />
      <VaSelect v-model="status" :options="statusOptions" label="Invoice Status" />
      <VaSelect v-model="method" :options="methodOptions" label="Payment Method" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Newest', value: 'newest' },
          { text: 'Oldest', value: 'oldest' },
          { text: 'Total (High)', value: 'total' },
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
              <th>Invoice</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Stay</th>
              <th>Payment</th>
              <th class="right">Total</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="empty">No invoices found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.id">
              <td>
                <div class="main">{{ r.invoiceNumber }}</div>
                <div class="sub mono">{{ r.date }}</div>
                <div class="sub">Booking: {{ r.bookingNumber }}</div>
                <span class="badge" :class="'st-' + r.status">{{ label(r.status) }}</span>
              </td>

              <td>
                <div class="main">{{ r.guest?.name || "-" }}</div>
                <div class="sub">{{ r.guest?.phone || "-" }}</div>
                <div class="sub">{{ r.guest?.nationality || "-" }}</div>
              </td>

              <td>
                <div class="main">Room {{ r.room?.number || "-" }}</div>
                <div class="sub">{{ r.room?.type || "-" }}</div>
              </td>

              <td>
                <div class="sub mono">IN: {{ r.stay?.checkIn }}</div>
                <div class="sub mono">OUT: {{ r.stay?.checkOut }}</div>
                <div class="sub">
                  {{ label(r.stay?.durationType) }}
                  <span v-if="r.stay?.hours">• {{ r.stay.hours }}h</span>
                  <span v-if="r.stay?.nights">• {{ r.stay.nights }} night</span>
                </div>
              </td>

              <td>
                <span class="badge pay" :class="'pay-' + r.payment?.status">
                  {{ label(r.payment?.status) }}
                </span>
                <div class="sub">Method: <b>{{ label(r.payment?.method) }}</b></div>
                <div class="sub">Paid: {{ money(r.payment?.paid, r.summary?.currency) }}</div>
              </td>

              <td class="right">
                <div class="total">
                  {{ money(r.summary?.total, r.summary?.currency) }}
                </div>
              </td>

              <td class="right">
                <div class="btns">
                  <VaButton size="small" preset="secondary" @click="openView(r)">View</VaButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- Modal: Invoice View -->
    <Teleport to="body">
      <div v-if="showModal" class="m-backdrop" @click="closeView">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">Invoice</div>
              <div class="m-sub">
                {{ selected?.invoiceNumber }} • {{ selected?.date }}
              </div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeView">Close</VaButton>
          </header>

          <section class="m-body">
            <div class="invoice">
              <div class="row2">
                <div class="box">
                  <div class="k">Guest</div>
                  <div class="v">{{ selected?.guest?.name }}</div>
                  <div class="muted">{{ selected?.guest?.phone }}</div>
                  <div class="muted">{{ selected?.guest?.nationality }}</div>
                </div>

                <div class="box">
                  <div class="k">Room / Stay</div>
                  <div class="v">Room {{ selected?.room?.number }} • {{ selected?.room?.type }}</div>
                  <div class="muted mono">IN: {{ selected?.stay?.checkIn }}</div>
                  <div class="muted mono">OUT: {{ selected?.stay?.checkOut }}</div>
                </div>
              </div>

              <div class="items">
                <div class="itemsHead">
                  <div>Item</div>
                  <div class="right">Qty</div>
                  <div class="right">Price</div>
                  <div class="right">Total</div>
                </div>

                <div
                  v-for="(it, idx) in selected?.charges || []"
                  :key="idx"
                  class="itemsRow"
                >
                  <div class="name">{{ it.name }}</div>
                  <div class="right">{{ it.qty }}</div>
                  <div class="right">{{ money(it.unitPrice, selected?.summary?.currency) }}</div>
                  <div class="right b">{{ money(it.total, selected?.summary?.currency) }}</div>
                </div>
              </div>

              <div class="totals">
                <div class="tRow">
                  <span class="k">Sub Total</span>
                  <span class="v">{{ money(selected?.summary?.subTotal, selected?.summary?.currency) }}</span>
                </div>
                <div class="tRow">
                  <span class="k">Discount</span>
                  <span class="v">{{ money(selected?.summary?.discount, selected?.summary?.currency) }}</span>
                </div>
                <div class="tRow">
                  <span class="k">Tax</span>
                  <span class="v">{{ money(selected?.summary?.tax, selected?.summary?.currency) }}</span>
                </div>

                <div class="divider"></div>

                <div class="tRow big">
                  <span class="k">TOTAL</span>
                  <span class="v">{{ money(selected?.summary?.total, selected?.summary?.currency) }}</span>
                </div>

                <div class="payBox">
                  <div class="k">Payment</div>
                  <div class="v">
                    {{ label(selected?.payment?.method) }} • {{ label(selected?.payment?.status) }}
                  </div>
                  <div class="muted">Paid: {{ money(selected?.payment?.paid, selected?.summary?.currency) }}</div>
                </div>
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="closeView">OK</VaButton>
            <VaButton color="primary" icon="print" @click="printInvoice">Print</VaButton>
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

/* Top cards */
.topCards {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.tCard {
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
  min-width: 140px;
}
.tCard .k {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.tCard .v {
  margin-top: 4px;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
}
.tCard.danger {
  border-color: #fecaca;
  background: #fff5f5;
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
.total { font-weight: 900; color: #0f172a; }
.empty { text-align: center; padding: 18px !important; font-weight: 900; color: #64748b; }

/* badges */
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

.st-issued { background: #dcfce7; border-color: #bbf7d0; color: #166534; }
.st-cancelled { background: #f1f5f9; border-color: #e2e8f0; color: #475569; }
.st-refunded { background: #fff1f2; border-color: #fecdd3; color: #9f1239; }

.pay-paid { background: #dcfce7; border-color: #bbf7d0; color: #166534; }
.pay-refunded { background: #eef2ff; border-color: #c7d2fe; color: #4338ca; }

/* modal */
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
  width: min(980px, 100%);
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

/* invoice view */
.invoice {
  border: 1px dashed #cbd5e1;
  background: #fbfcfe;
  border-radius: 14px;
  padding: 14px;
}
.row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
@media (max-width: 760px) {
  .row2 { grid-template-columns: 1fr; }
}
.box {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fff;
  padding: 12px;
}
.k { font-size: 12px; font-weight: 900; color: #64748b; }
.v { margin-top: 6px; font-weight: 900; color: #0f172a; }
.muted { margin-top: 4px; font-size: 12px; font-weight: 700; color: #64748b; }

.items {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}
.itemsHead, .itemsRow {
  display: grid;
  grid-template-columns: 1fr 90px 120px 120px;
  gap: 10px;
  padding: 10px 12px;
}
.itemsHead {
  background: #fbfcfe;
  border-bottom: 1px solid #eef2f6;
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.itemsRow {
  border-bottom: 1px solid #f1f5f9;
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
}
.itemsRow:last-child { border-bottom: 0; }
.name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.b { font-weight: 900; }

.totals {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}
.tRow {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-weight: 800;
}
.tRow.big .v { font-size: 20px; }
.divider { height: 1px; background: #e2e8f0; margin: 6px 0; }
.payBox {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fff;
  padding: 12px;
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

/* Print only invoice */
@media print {
  .page, .filters, .tableCard, .head, .topCards { display: none !important; }
  .m-backdrop { position: static; background: transparent; padding: 0; }
  .m { box-shadow: none; border: 0; width: 100%; }
  .m-head, .m-foot { display: none !important; }
  .m-body { max-height: none; overflow: visible; padding: 0; }
  .invoice { border: 0; padding: 0; }
}
</style>
