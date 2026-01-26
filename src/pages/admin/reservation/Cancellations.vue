<script setup>
import { ref, computed, watch } from "vue"
import { cancellations } from "@/data/booking/cancellations"

const rows = ref([...cancellations])

// filters
const q = ref("")
const source = ref("")
const refund = ref("")
const penalty = ref("")
const sort = ref("newest")

const sourceOptions = ["", "walk-in", "booking.com", "agoda", "expedia"]
const refundOptions = ["", "refunded", "partial", "unpaid"]
const penaltyOptions = ["", "yes", "no"]

function safe(v) {
  return (v ?? "").toString().toLowerCase()
}
function label(s) {
  return s ? s.replaceAll("_", " ").toUpperCase() : "-"
}
function money(n, cur="USD") {
  return `${cur} ${Number(n||0).toFixed(2)}`
}

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.bookingNumber).includes(key) ||
      safe(r.guest?.name).includes(key) ||
      safe(r.guest?.phone).includes(key) ||
      safe(r.room?.number).includes(key)

    const okSource = !source.value || r.source === source.value
    const okRefund = !refund.value || r.payment?.status === refund.value
    const okPenalty =
      !penalty.value ||
      (penalty.value === "yes" && r.penalty?.applied) ||
      (penalty.value === "no" && !r.penalty?.applied)

    return hit && okSource && okRefund && okPenalty
  })

  if (sort.value === "newest") list.sort((a,b)=> b.id - a.id)
  if (sort.value === "oldest") list.sort((a,b)=> a.id - b.id)
  if (sort.value === "amount") list.sort((a,b)=> (b.price?.total||0) - (a.price?.total||0))

  return list
})

// stats
const stats = computed(() => {
  const all = rows.value
  const total = all.reduce((s,x)=> s + Number(x.price?.total||0), 0)
  const refunded = all.reduce((s,x)=> s + Number(x.payment?.refundAmount||0), 0)
  const penalty = all.reduce((s,x)=> s + Number(x.penalty?.amount||0), 0)
  return { total, refunded, penalty }
})

// modal
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
watch(showModal, v => document.body.style.overflow = v ? "hidden" : "")
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>Cancellations</h1>
        <p>Refunds • No-shows • Revenue loss</p>
      </div>

      <div class="stats">
        <div class="sCard">
          <div class="k">Cancelled Value</div>
          <div class="v">{{ money(stats.total) }}</div>
        </div>
        <div class="sCard">
          <div class="k">Refunded</div>
          <div class="v">{{ money(stats.refunded) }}</div>
        </div>
        <div class="sCard danger">
          <div class="k">Penalty</div>
          <div class="v">{{ money(stats.penalty) }}</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search booking / guest / phone / room..." />
      <VaSelect v-model="source" :options="sourceOptions" label="Source" />
      <VaSelect v-model="refund" :options="refundOptions" label="Refund Status" />
      <VaSelect v-model="penalty" :options="penaltyOptions" label="Penalty" />
      <VaSelect
        v-model="sort"
        :options="[
          {text:'Newest',value:'newest'},
          {text:'Oldest',value:'oldest'},
          {text:'Amount',value:'amount'}
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
              <th>Booking</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Stay</th>
              <th>Payment</th>
              <th class="right">Total</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length===0">
              <td colspan="7" class="empty">No cancellations found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.id">
              <td>
                <div class="main">{{ r.bookingNumber }}</div>
                <div class="sub">{{ r.cancelledAt }}</div>
                <div class="sub">By: {{ label(r.cancelledBy) }}</div>
              </td>

              <td>
                <div class="main">{{ r.guest?.name }}</div>
                <div class="sub">{{ r.guest?.phone }}</div>
              </td>

              <td>
                <div class="main">Room {{ r.room?.number }}</div>
                <div class="sub">{{ r.room?.type }}</div>
              </td>

              <td>
                <div class="sub mono">{{ r.stay?.checkIn }}</div>
                <div class="sub mono">{{ r.stay?.checkOut }}</div>
              </td>

              <td>
                <span class="badge" :class="'pay-'+r.payment?.status">
                  {{ label(r.payment?.status) }}
                </span>
                <div class="sub">Refund: {{ money(r.payment?.refundAmount) }}</div>
                <div class="sub" v-if="r.penalty?.applied">
                  Penalty: {{ money(r.penalty.amount) }}
                </div>
              </td>

              <td class="right">
                <div class="main">{{ money(r.price?.total) }}</div>
              </td>

              <td class="right">
                <VaButton size="small" preset="secondary" @click="openView(r)">View</VaButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="m-backdrop" @click="closeView">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">Cancellation Details</div>
              <div class="m-sub">{{ selected?.bookingNumber }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeView">Close</VaButton>
          </header>

          <section class="m-body">
            <div class="m-grid">
              <div class="card">
                <div class="k">Guest</div>
                <div class="v">{{ selected?.guest?.name }}</div>
                <div class="muted">{{ selected?.guest?.phone }}</div>
              </div>

              <div class="card">
                <div class="k">Room</div>
                <div class="v">Room {{ selected?.room?.number }}</div>
                <div class="muted">{{ selected?.room?.type }}</div>
              </div>

              <div class="card">
                <div class="k">Reason</div>
                <div class="v">{{ selected?.reason }}</div>
              </div>

              <div class="card">
                <div class="k">Financial</div>
                <div class="muted">Total: {{ money(selected?.price?.total) }}</div>
                <div class="muted">Refund: {{ money(selected?.payment?.refundAmount) }}</div>
                <div class="muted">Penalty: {{ money(selected?.penalty?.amount) }}</div>
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="closeView">OK</VaButton>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<style>
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
  margin-bottom: 16px;
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

/* Stat cards */
.stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.sCard {
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
  min-width: 140px;
}
.sCard .k {
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}
.sCard .v {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
}
.sCard.danger {
  border-color: #fecaca;
  background: #fff5f5;
  color: #991b1b;
}

/* Filters */
.filters {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
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

/* Table */
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
  padding: 12px 14px;
  font-size: 12px;
  text-align: left;
  color: #64748b;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
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
  font-size: 13px;
  color: #0f172a;
}
.sub {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

/* Badges */
.badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
}
.pay-refunded {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #166534;
}
.pay-partial {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #9a3412;
}
.pay-unpaid {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}

.empty {
  text-align: center;
  padding: 20px !important;
  font-weight: 900;
  color: #64748b;
}

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
  width: min(720px, 100%);
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
.m-title {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.m-sub {
  font-size: 12px;
  color: #64748b;
}
.m-body {
  padding: 16px;
}
.m-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 640px) {
  .m-grid {
    grid-template-columns: 1fr;
  }
}
.card {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fbfcfe;
  padding: 14px;
}
.k {
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}
.v {
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
}
.muted {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}
.m-foot {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
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