<script setup>
import { ref, computed, reactive, watch } from "vue"
import { checkin_checkout } from "@/data/booking/checking_checkout"

const rows = ref([...checkin_checkout])

// ------------------ UI state ------------------
const tab = ref("today_checkin") // today_checkin | in_house | today_checkout | history
const q = ref("")
const status = ref("") // reserved | in_house | checked_out ...
const pay = ref("") // paid | unpaid | partial ...
const sort = ref("time")

const statusOptions = ["", "reserved", "in_house", "checked_out", "cancelled", "no_show"]
const payOptions = ["", "paid", "unpaid", "partial", "refunded"]
const sortOptions = [
  { text: "Time", value: "time" },
  { text: "Room", value: "room" },
  { text: "Guest", value: "guest" },
]

function safe(v) {
  return (v ?? "").toString().toLowerCase()
}
function label(s) {
  return s ? s.replaceAll("_", " ").toUpperCase() : "-"
}
function money(n, cur = "USD") {
  return `${cur} ${Number(n || 0).toFixed(2)}`
}

// YYYY-MM-DD today
function todayKey() {
  const d = new Date()
  const pad = (x) => String(x).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const TODAY = ref(todayKey())

// ------------------ tab filter logic ------------------
function matchTab(r) {
  const ci = r.stay?.checkIn?.slice(0, 10) || ""
  const co = r.stay?.checkOut?.slice(0, 10) || ""

  if (tab.value === "today_checkin") return r.status === "reserved" && ci === TODAY.value
  if (tab.value === "in_house") return r.status === "in_house"
  if (tab.value === "today_checkout") return r.status === "in_house" && co === TODAY.value
  return true // history
}

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    if (!matchTab(r)) return false

    const hit =
      !key ||
      safe(r.bookingNumber).includes(key) ||
      safe(r.guest?.name).includes(key) ||
      safe(r.guest?.phone).includes(key) ||
      safe(r.room?.number).includes(key) ||
      safe(r.room?.type).includes(key)

    const okStatus = !status.value || r.status === status.value
    const okPay = !pay.value || r.payment?.status === pay.value

    return hit && okStatus && okPay
  })

  if (sort.value === "room") list.sort((a, b) => (a.room?.number || "").localeCompare(b.room?.number || ""))
  if (sort.value === "guest") list.sort((a, b) => (a.guest?.name || "").localeCompare(b.guest?.name || ""))
  if (sort.value === "time") {
    list.sort((a, b) => (a.stay?.checkIn || "").localeCompare(b.stay?.checkIn || ""))
  }

  return list
})

// ------------------ Stats ------------------
const stats = computed(() => {
  const all = rows.value
  const inHouse = all.filter((r) => r.status === "in_house").length
  const reserved = all.filter((r) => r.status === "reserved").length
  const outToday = all.filter((r) => r.status === "checked_out" && (r.stay?.actualCheckOut || "").slice(0, 10) === TODAY.value).length
  const unpaid = all.filter((r) => (r.payment?.status || "") === "unpaid").length
  return { inHouse, reserved, outToday, unpaid }
})

// ------------------ Modal ------------------
const showModal = ref(false)
const modalMode = ref("view") // view | checkin | checkout
const selected = ref(null)

// lightweight form for actions
const actionForm = reactive({
  actualCheckIn: "",
  actualCheckOut: "",
  payStatus: "paid",
  payMethod: "cash",
  extraCharge: 0,
  note: "",
})

function openModal(mode, row) {
  modalMode.value = mode
  selected.value = row

  // defaults
  actionForm.actualCheckIn = row.stay?.actualCheckIn || row.stay?.checkIn || ""
  actionForm.actualCheckOut = row.stay?.actualCheckOut || row.stay?.checkOut || ""
  actionForm.payStatus = row.payment?.status || "paid"
  actionForm.payMethod = row.payment?.method || "cash"
  actionForm.extraCharge = 0
  actionForm.note = row.note || ""

  showModal.value = true
}
function closeModal() {
  showModal.value = false
  selected.value = null
}

// fake “save” actions (static data update)
function doCheckIn() {
  if (!selected.value) return
  const idx = rows.value.findIndex((x) => x.id === selected.value.id)
  if (idx === -1) return

  const old = rows.value[idx]
  rows.value.splice(idx, 1, {
    ...old,
    status: "in_house",
    room: { ...(old.room || {}), status: "in_house" },
    stay: { ...(old.stay || {}), actualCheckIn: actionForm.actualCheckIn || old.stay?.checkIn },
    payment: { ...(old.payment || {}), status: actionForm.payStatus, method: actionForm.payMethod },
    note: actionForm.note,
  })
  closeModal()
}

function doCheckOut() {
  if (!selected.value) return
  const idx = rows.value.findIndex((x) => x.id === selected.value.id)
  if (idx === -1) return

  const old = rows.value[idx]
  const extra = Number(actionForm.extraCharge || 0)
  const newTotal = Number(old.price?.total || 0) + extra

  rows.value.splice(idx, 1, {
    ...old,
    status: "checked_out",
    room: { ...(old.room || {}), status: "checked_out" },
    stay: { ...(old.stay || {}), actualCheckOut: actionForm.actualCheckOut || old.stay?.checkOut },
    price: { ...(old.price || {}), total: newTotal },
    payment: { ...(old.payment || {}), status: actionForm.payStatus, method: actionForm.payMethod },
    housekeeping: { ...(old.housekeeping || {}), needClean: true },
    note: actionForm.note,
  })
  closeModal()
}

// lock body scroll
watch(showModal, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>Check-in / Check-out</h1>
        <p>Fast front-desk actions • Clean & simple</p>
      </div>

      <div class="headActions">
        <div class="chip">In-house: <b>{{ stats.inHouse }}</b></div>
        <div class="chip">Reserved: <b>{{ stats.reserved }}</b></div>
        <div class="chip danger">Unpaid: <b>{{ stats.unpaid }}</b></div>
      </div>
    </div>

    <!-- Tabs -->
    <VaCard class="tabsCard">
      <button class="tab" :class="{ active: tab==='today_checkin' }" @click="tab='today_checkin'">
        Today Check-in
      </button>
      <button class="tab" :class="{ active: tab==='in_house' }" @click="tab='in_house'">
        In-House
      </button>
      <button class="tab" :class="{ active: tab==='today_checkout' }" @click="tab='today_checkout'">
        Today Check-out
      </button>
      <button class="tab" :class="{ active: tab==='history' }" @click="tab='history'">
        History
      </button>
    </VaCard>

    <!-- Filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search guest / phone / room / booking..." />
      <VaSelect v-model="status" :options="statusOptions" label="Status" />
      <VaSelect v-model="pay" :options="payOptions" label="Payment" />
      <VaSelect v-model="sort" :options="sortOptions" label="Sort" text-by="text" value-by="value" />
    </VaCard>

    <!-- Table -->
    <VaCard class="tableCard">
      <div class="tableWrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Stay</th>
              <th>Status</th>
              <th>Payment</th>
              <th class="right">Total</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="empty">No records found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.id">
              <td>
                <div class="main">{{ r.guest?.name || "-" }}</div>
                <div class="sub">{{ r.guest?.phone || "-" }}</div>
                <div class="sub mono">{{ r.bookingNumber }}</div>
              </td>

              <td>
                <div class="main">Room {{ r.room?.number || "-" }}</div>
                <div class="sub">{{ r.room?.type || "-" }} • Floor {{ r.room?.floor || "-" }}</div>
              </td>

              <td>
                <div class="sub">In: <b class="mono">{{ r.stay?.checkIn || "-" }}</b></div>
                <div class="sub">Out: <b class="mono">{{ r.stay?.checkOut || "-" }}</b></div>
              </td>

              <td>
                <span class="badge" :class="'st-' + r.status">{{ label(r.status) }}</span>
              </td>

              <td>
                <span class="badge pay" :class="'pay-' + (r.payment?.status || '')">
                  {{ label(r.payment?.status) }}
                </span>
                <div class="sub">{{ label(r.payment?.method) }}</div>
              </td>

              <td class="right">
                <div class="main">{{ money(r.price?.total, r.price?.currency) }}</div>
                <div class="sub" v-if="r.payment?.deposit">Deposit: {{ money(r.payment.deposit, r.price?.currency) }}</div>
              </td>

              <td class="right">
                <div class="btns">
                  <VaButton size="small" preset="secondary" @click="openModal('view', r)">View</VaButton>

                  <VaButton
                    v-if="r.status === 'reserved'"
                    size="small"
                    color="success"
                    @click="openModal('checkin', r)"
                  >
                    Check-in
                  </VaButton>

                  <VaButton
                    v-if="r.status === 'in_house'"
                    size="small"
                    color="primary"
                    @click="openModal('checkout', r)"
                  >
                    Check-out
                  </VaButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="m-backdrop" @click="closeModal">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">
                {{
                  modalMode === "checkin"
                    ? "Check-in"
                    : modalMode === "checkout"
                    ? "Check-out"
                    : "Reservation Details"
                }}
              </div>
              <div class="m-sub">{{ selected?.bookingNumber }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeModal">Close</VaButton>
          </header>

          <section class="m-body">
            <!-- VIEW -->
            <div v-if="modalMode === 'view'" class="viewGrid">
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
                <div class="k">Stay</div>
                <div class="muted">Check-in: <b class="mono">{{ selected?.stay?.checkIn }}</b></div>
                <div class="muted">Check-out: <b class="mono">{{ selected?.stay?.checkOut }}</b></div>
              </div>

              <div class="card">
                <div class="k">Payment</div>
                <div class="v">{{ label(selected?.payment?.status) }}</div>
                <div class="muted">{{ label(selected?.payment?.method) }}</div>
              </div>
            </div>

            <!-- CHECK-IN FORM -->
            <div v-else-if="modalMode === 'checkin'" class="formGrid">
              <VaInput v-model="actionForm.actualCheckIn" label="Actual Check-in (YYYY-MM-DD HH:mm)" />
              <VaSelect v-model="actionForm.payStatus" :options="['paid','partial','unpaid']" label="Payment Status" />
              <VaSelect v-model="actionForm.payMethod" :options="['cash','aba','card','paypal']" label="Payment Method" />
              <VaTextarea v-model="actionForm.note" label="Note" :max-rows="3" />
            </div>

            <!-- CHECK-OUT FORM -->
            <div v-else class="formGrid">
              <VaInput v-model="actionForm.actualCheckOut" label="Actual Check-out (YYYY-MM-DD HH:mm)" />
              <VaInput v-model="actionForm.extraCharge" type="number" label="Extra Charge (Laundry, minibar...)" />
              <VaSelect v-model="actionForm.payStatus" :options="['paid','partial','unpaid','refunded']" label="Payment Status" />
              <VaSelect v-model="actionForm.payMethod" :options="['cash','aba','card','paypal']" label="Payment Method" />
              <VaTextarea v-model="actionForm.note" label="Note" :max-rows="3" />
              <div class="hint">
                New Total:
                <b>{{ money((Number(selected?.price?.total||0) + Number(actionForm.extraCharge||0)), selected?.price?.currency) }}</b>
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="closeModal">Cancel</VaButton>

            <VaButton
              v-if="modalMode === 'checkin'"
              color="success"
              @click="doCheckIn"
            >
              Confirm Check-in
            </VaButton>

            <VaButton
              v-if="modalMode === 'checkout'"
              color="primary"
              @click="doCheckOut"
            >
              Confirm Check-out
            </VaButton>

            <VaButton v-if="modalMode === 'view'" color="primary">
              Edit
            </VaButton>
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
  color: #64748b;
  font-weight: 700;
}
.headActions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.chip {
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 999px;
  padding: 8px 12px;
  font-weight: 900;
  font-size: 12px;
  color: #0f172a;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
}
.chip.danger {
  border-color: #fecaca;
  background: #fff7f7;
  color: #991b1b;
}

.tabsCard {
  padding: 8px;
  border-radius: 14px;
  border: 1px solid #e5eaf2;
  background: #fff;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.tab {
  border: 1px solid #e5eaf2;
  background: #fbfcfe;
  color: #0f172a;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 900;
  font-size: 12px;
  cursor: pointer;
}
.tab.active {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #1d4ed8;
}

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
@media (max-width: 950px) {
  .filters { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .filters { grid-template-columns: 1fr; }
}

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
  text-align: left;
  padding: 12px 14px;
  font-size: 12px;
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
.main { font-weight: 900; color: #0f172a; font-size: 13px; }
.sub { margin-top: 4px; font-size: 12px; color: #64748b; font-weight: 700; }
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace;
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
}
.badge.pay {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}
.st-reserved { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
.st-in_house { background: #ecfdf5; border-color: #bbf7d0; color: #166534; }
.st-checked_out { background: #f1f5f9; border-color: #e2e8f0; color: #475569; }
.st-cancelled { background: #fff1f2; border-color: #fecdd3; color: #9f1239; }
.st-no_show { background: #fff7ed; border-color: #fed7aa; color: #9a3412; }

.pay-paid { background: #ecfdf5; border-color: #bbf7d0; color: #166534; }
.pay-partial { background: #fff7ed; border-color: #fed7aa; color: #9a3412; }
.pay-unpaid { background: #fff1f2; border-color: #fecdd3; color: #9f1239; }

.btns { display: inline-flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
.empty { text-align: center; padding: 18px !important; font-weight: 900; color: #64748b; }

.m-backdrop {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.45);
  z-index: 99999;
  display: grid; place-items: center;
  padding: 16px;
}
.m {
  width: min(820px, 100%);
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
.m-sub { margin-top: 2px; font-size: 12px; color: #64748b; }
.m-body { padding: 16px; max-height: 70vh; overflow: auto; }
.m-foot {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.viewGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 700px) {
  .viewGrid { grid-template-columns: 1fr; }
}
.card {
  border: 1px solid #eef2f6;
  background: #fbfcfe;
  border-radius: 14px;
  padding: 14px;
}
.k { font-size: 12px; color: #64748b; font-weight: 800; }
.v { margin-top: 6px; font-size: 15px; font-weight: 900; color: #0f172a; }
.muted { margin-top: 4px; color: #64748b; font-weight: 700; font-size: 12px; }

.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 700px) {
  .formGrid { grid-template-columns: 1fr; }
}
.hint {
  grid-column: 1 / -1;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  font-weight: 900;
  color: #0f172a;
}

:deep(.va-input__container),
:deep(.va-select__container),
:deep(.va-textarea__container) {
  border-radius: 10px;
  background: #f9fafb;
}
:deep(.va-button) {
  border-radius: 10px;
  font-weight: 800;
}
</style>
