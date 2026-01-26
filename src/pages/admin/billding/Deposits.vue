<script setup>
import { ref, computed, watch } from "vue"
import { deposits } from "@/data/billding/deposits"

const rows = ref([...deposits])

// ---- filters ----
const q = ref("")
const status = ref("")
const method = ref("")
const sort = ref("newest")

const statusOptions = ["", "held", "applied", "refunded", "forfeited"]
const methodOptions = ["", "cash", "aba", "card", "paypal"]

const safe = (v) => (v ?? "").toString().toLowerCase()
const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")
const money = (n, cur = "USD") => `${cur} ${Number(n || 0).toFixed(2)}`

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.depositNumber).includes(key) ||
      safe(r.bookingNumber).includes(key) ||
      safe(r.guest?.name).includes(key) ||
      safe(r.guest?.phone).includes(key) ||
      safe(r.room?.number).includes(key) ||
      safe(r.appliedToInvoice).includes(key)

    const okStatus = !status.value || r.status === status.value
    const okMethod = !method.value || r.method === method.value

    return hit && okStatus && okMethod
  })

  if (sort.value === "newest") list.sort((a, b) => (b.id || 0) - (a.id || 0))
  if (sort.value === "oldest") list.sort((a, b) => (a.id || 0) - (b.id || 0))
  if (sort.value === "amount") list.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))

  return list
})

// ---- summary ----
const stats = computed(() => {
  const all = rows.value
  const sum = (fn) => all.reduce((s, x) => s + fn(x), 0)

  const held = sum((x) => (x.status === "held" ? Number(x.amount || 0) : 0))
  const applied = sum((x) => (x.status === "applied" ? Number(x.amount || 0) : 0))
  const refunded = sum((x) => (x.status === "refunded" ? Number(x.amount || 0) : 0))
  const forfeited = sum((x) => (x.status === "forfeited" ? Number(x.amount || 0) : 0))

  return {
    held,
    applied,
    refunded,
    forfeited,
    count: all.length,
  }
})

// ---- modal ----
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
        <h1>Deposits</h1>
        <p>Security deposits • Applied to invoice • Refund & forfeiture tracking</p>
      </div>

      <div class="actions">
        <VaButton preset="secondary" icon="download">Export</VaButton>
        <VaButton color="success" icon="add">New Deposit</VaButton>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="summary">
      <div class="sCard">
        <div class="k">Total Records</div>
        <div class="v">{{ stats.count }}</div>
        <div class="sub">All deposits</div>
      </div>

      <div class="sCard held">
        <div class="k">Held</div>
        <div class="v">{{ money(stats.held) }}</div>
        <div class="sub">Need to apply/refund</div>
      </div>

      <div class="sCard applied">
        <div class="k">Applied</div>
        <div class="v">{{ money(stats.applied) }}</div>
        <div class="sub">Used in invoice</div>
      </div>

      <div class="sCard refunded">
        <div class="k">Refunded</div>
        <div class="v">{{ money(stats.refunded) }}</div>
        <div class="sub">Returned to guest</div>
      </div>

      <div class="sCard forfeited">
        <div class="k">Forfeited</div>
        <div class="v">{{ money(stats.forfeited) }}</div>
        <div class="sub">No-show / damage</div>
      </div>
    </div>

    <!-- Filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search deposit / booking / guest / invoice / room..." />
      <VaSelect v-model="status" :options="statusOptions" label="Status" />
      <VaSelect v-model="method" :options="methodOptions" label="Method" />
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
              <th>Deposit</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Invoice Link</th>
              <th>Status</th>
              <th class="right">Amount</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="empty">No deposits found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.id">
              <td>
                <div class="main">{{ r.depositNumber }}</div>
                <div class="sub mono">{{ r.date }}</div>
                <div class="sub">Booking: {{ r.bookingNumber }}</div>
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
                <div class="sub">
                  <span v-if="r.appliedToInvoice" class="link">
                    {{ r.appliedToInvoice }}
                  </span>
                  <span v-else class="muted">-</span>
                </div>
              </td>

              <td>
                <span class="badge" :class="'st-' + r.status">{{ label(r.status) }}</span>
                <div class="sub">Method: <b>{{ label(r.method) }}</b></div>
              </td>

              <td class="right">
                <div class="amount" :class="{ neg: r.status === 'refunded' }">
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

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="m-backdrop" @click="closeView">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">Deposit Details</div>
              <div class="m-sub">{{ selected?.depositNumber }} • {{ selected?.date }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeView">Close</VaButton>
          </header>

          <section class="m-body">
            <div class="detailGrid">
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
                <div class="k">Status</div>
                <div class="v">
                  <span class="badge" :class="'st-' + selected?.status">{{ label(selected?.status) }}</span>
                </div>
                <div class="muted">Method: {{ label(selected?.method) }}</div>
              </div>

              <div class="card">
                <div class="k">Amount</div>
                <div class="v big">{{ money(selected?.amount, selected?.currency) }}</div>
                <div class="muted">Booking: {{ selected?.bookingNumber }}</div>
              </div>

              <div class="card wide">
                <div class="k">Invoice</div>
                <div class="v">{{ selected?.appliedToInvoice || "-" }}</div>
              </div>

              <div class="card wide" v-if="selected?.note">
                <div class="k">Note</div>
                <div class="v">{{ selected.note }}</div>
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
}

/* Summary */
.summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
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
  font-weight: 900;
  color: #64748b;
}
.sCard .v {
  margin-top: 4px;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
}
.sCard .sub {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}
.sCard.held { border-color: #bfdbfe; background: #f0f7ff; }
.sCard.applied { border-color: #bbf7d0; background: #ecfdf5; }
.sCard.refunded { border-color: #fecaca; background: #fff5f5; }
.sCard.forfeited { border-color: #fed7aa; background: #fff7ed; }

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
.empty { text-align: center; padding: 18px !important; font-weight: 900; color: #64748b; }

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
}
.st-held { background: #f0f7ff; border-color: #bfdbfe; color: #1d4ed8; }
.st-applied { background: #ecfdf5; border-color: #bbf7d0; color: #166534; }
.st-refunded { background: #fff1f2; border-color: #fecdd3; color: #9f1239; }
.st-forfeited { background: #fff7ed; border-color: #fed7aa; color: #9a3412; }

.amount { font-weight: 900; color: #0f172a; }
.amount.neg { color: #b91c1c; }

.link {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-weight: 900;
  font-size: 12px;
  color: #0f172a;
}
.muted { color: #64748b; font-weight: 800; }

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
  width: min(880px, 100%);
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

.detailGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 720px) {
  .detailGrid { grid-template-columns: 1fr; }
}
.card {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fbfcfe;
  padding: 14px;
}
.card.wide { grid-column: 1 / -1; }
.k { font-size: 12px; font-weight: 900; color: #64748b; }
.v { margin-top: 6px; font-weight: 900; color: #0f172a; }
.v.big { font-size: 22px; }

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
