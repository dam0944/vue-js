<script setup>
import { ref, computed, watch } from "vue"
import { availability } from "@/data/booking/availability"

const rows = ref([...availability])

// ---------- filters ----------
const q = ref("")
const status = ref("")
const type = ref("")
const floor = ref("")
const sort = ref("room")

const statusOptions = ["", "available", "in_house", "reserved", "cleaning", "maintenance"]
const safe = (v) => (v ?? "").toString().toLowerCase()

const typeOptions = computed(() => {
  const s = new Set()
  rows.value.forEach((r) => s.add(r.room?.type))
  return ["", ...Array.from(s).filter(Boolean)]
})

const floorOptions = computed(() => {
  const s = new Set()
  rows.value.forEach((r) => s.add(r.room?.floor))
  return ["", ...Array.from(s).filter(Boolean).sort((a, b) => a - b)]
})

const filtered = computed(() => {
  const key = safe(q.value)
  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.room?.number).includes(key) ||
      safe(r.room?.type).includes(key) ||
      safe(r.activeBooking?.guestName).includes(key) ||
      safe(r.activeBooking?.bookingNumber).includes(key)

    const okStatus = !status.value || r.todayStatus === status.value
    const okType = !type.value || r.room?.type === type.value
    const okFloor = !floor.value || String(r.room?.floor) === String(floor.value)

    return hit && okStatus && okType && okFloor
  })

  if (sort.value === "room") list.sort((a, b) => (a.room?.number || "").localeCompare(b.room?.number || ""))
  if (sort.value === "floor") list.sort((a, b) => (a.room?.floor || 0) - (b.room?.floor || 0))
  if (sort.value === "status") list.sort((a, b) => (a.todayStatus || "").localeCompare(b.todayStatus || ""))

  return list
})

// ---------- stats ----------
const stats = computed(() => {
  const all = rows.value
  const count = (s) => all.filter((x) => x.todayStatus === s).length
  return {
    available: count("available"),
    in_house: count("in_house"),
    reserved: count("reserved"),
    cleaning: count("cleaning"),
    maintenance: count("maintenance"),
  }
})

// ---------- helpers ----------
const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")

function statusChipClass(s) {
  if (s === "available") return "ok"
  if (s === "in_house") return "live"
  if (s === "reserved") return "info"
  if (s === "cleaning") return "warn"
  if (s === "maintenance") return "danger"
  return "muted"
}

function payClass(p) {
  if (p === "paid") return "p-paid"
  if (p === "partial") return "p-partial"
  if (p === "unpaid") return "p-unpaid"
  return "p-muted"
}

// ---------- modal ----------
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

// lock scroll
watch(showModal, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>Room Availability</h1>
        <p>Live room status • Quick view for front desk</p>
      </div>

      <div class="headRight">
        <VaButton preset="secondary" icon="refresh" @click="rows=[...availability]">Refresh</VaButton>
        <VaButton color="success" icon="add">New Booking</VaButton>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary">
      <div class="sCard ok">
        <div class="sTitle">Available</div>
        <div class="sValue">{{ stats.available }}</div>
      </div>
      <div class="sCard live">
        <div class="sTitle">In-house</div>
        <div class="sValue">{{ stats.in_house }}</div>
      </div>
      <div class="sCard info">
        <div class="sTitle">Reserved</div>
        <div class="sValue">{{ stats.reserved }}</div>
      </div>
      <div class="sCard warn">
        <div class="sTitle">Cleaning</div>
        <div class="sValue">{{ stats.cleaning }}</div>
      </div>
      <div class="sCard danger">
        <div class="sTitle">Maintenance</div>
        <div class="sValue">{{ stats.maintenance }}</div>
      </div>
    </div>

    <!-- Filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search room / type / guest / booking..." />
      <VaSelect v-model="status" :options="statusOptions" label="Status" />
      <VaSelect v-model="type" :options="typeOptions" label="Room Type" />
      <VaSelect v-model="floor" :options="floorOptions" label="Floor" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Room', value: 'room' },
          { text: 'Floor', value: 'floor' },
          { text: 'Status', value: 'status' },
        ]"
        label="Sort"
        text-by="text"
        value-by="value"
      />
    </VaCard>

    <!-- Cards -->
    <div class="grid">
      <div v-for="r in filtered" :key="r.room.id" class="roomCard">
        <div class="top">
          <div>
            <div class="roomNo">Room {{ r.room.number }}</div>
            <div class="roomType">{{ r.room.type }} • Floor {{ r.room.floor }}</div>
          </div>
          <span class="chip" :class="statusChipClass(r.todayStatus)">
            {{ label(r.todayStatus) }}
          </span>
        </div>

        <div class="mid">
          <div class="line">
            <span class="k">Next Available</span>
            <span class="v mono">{{ r.nextAvailableAt || "-" }}</span>
          </div>

          <div class="line">
            <span class="k">Housekeeping</span>
            <span class="v">
              {{ r.housekeeping?.assignedTo || "-" }}
              <span class="muted"> • last: </span>
              <span class="mono">{{ r.housekeeping?.lastCleaned || "-" }}</span>
            </span>
          </div>

          <div v-if="r.activeBooking" class="booking">
            <div class="bHead">
              <div class="bTitle">Active Booking</div>
              <span class="pay" :class="payClass(r.activeBooking.paymentStatus)">
                {{ label(r.activeBooking.paymentStatus) }}
              </span>
            </div>

            <div class="bMain">{{ r.activeBooking.guestName }}</div>
            <div class="bSub mono">{{ r.activeBooking.bookingNumber }}</div>
            <div class="bSub">
              In: <b class="mono">{{ r.activeBooking.checkIn || "-" }}</b>
              <span class="muted"> • </span>
              Out: <b class="mono">{{ r.activeBooking.checkOut || "-" }}</b>
            </div>
          </div>

          <div v-else class="emptyBox">
            No active booking
          </div>
        </div>

        <div class="foot">
          <VaButton preset="secondary" size="small" @click="openView(r)">View</VaButton>
          <VaButton
            v-if="r.todayStatus === 'available'"
            color="success"
            size="small"
          >
            Book Now
          </VaButton>
          <VaButton
            v-if="r.todayStatus === 'cleaning'"
            color="primary"
            size="small"
          >
            Mark Cleaned
          </VaButton>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="m-backdrop" @click="closeView">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">Room Details</div>
              <div class="m-sub">
                Room {{ selected?.room?.number }} • {{ selected?.room?.type }} • Floor {{ selected?.room?.floor }}
              </div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeView">Close</VaButton>
          </header>

          <section class="m-body">
            <div class="m-grid">
              <div class="m-card">
                <div class="k">Status</div>
                <div class="v">
                  <span class="chip" :class="statusChipClass(selected?.todayStatus)">
                    {{ label(selected?.todayStatus) }}
                  </span>
                </div>
              </div>

              <div class="m-card">
                <div class="k">Next Available</div>
                <div class="v mono">{{ selected?.nextAvailableAt || "-" }}</div>
              </div>

              <div class="m-card">
                <div class="k">Housekeeping</div>
                <div class="v">{{ selected?.housekeeping?.assignedTo || "-" }}</div>
                <div class="muted">Last cleaned: <b class="mono">{{ selected?.housekeeping?.lastCleaned || "-" }}</b></div>
              </div>

              <div class="m-card" v-if="selected?.activeBooking">
                <div class="k">Active Booking</div>
                <div class="v">{{ selected?.activeBooking?.guestName }}</div>
                <div class="muted mono">{{ selected?.activeBooking?.bookingNumber }}</div>
                <div class="muted">
                  In: <b class="mono">{{ selected?.activeBooking?.checkIn || "-" }}</b>
                  • Out: <b class="mono">{{ selected?.activeBooking?.checkOut || "-" }}</b>
                </div>
              </div>

              <div class="m-card" v-else>
                <div class="k">Active Booking</div>
                <div class="v">None</div>
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="closeView">OK</VaButton>
            <VaButton v-if="selected?.todayStatus === 'available'" color="success">Book Now</VaButton>
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
.headRight {
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
@media (max-width: 980px) {
  .summary { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px) {
  .summary { grid-template-columns: 1fr; }
}
.sCard {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
}
.sTitle {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.sValue {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 900;
  color: #0f172a;
}
.sCard.ok { border-left: 6px solid #22c55e; }
.sCard.live { border-left: 6px solid #3b82f6; }
.sCard.info { border-left: 6px solid #6366f1; }
.sCard.warn { border-left: 6px solid #f59e0b; }
.sCard.danger { border-left: 6px solid #ef4444; }

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
  margin-bottom: 14px;
}
@media (max-width: 980px) {
  .filters { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .filters { grid-template-columns: 1fr; }
}

/* Grid cards */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 1100px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 700px) {
  .grid { grid-template-columns: 1fr; }
}

.roomCard {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 16px;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.top {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}
.roomNo {
  font-weight: 900;
  color: #0f172a;
  font-size: 16px;
}
.roomType {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
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
  white-space: nowrap;
}
.chip.ok { background: #ecfdf5; border-color: #bbf7d0; color: #166534; }
.chip.live { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
.chip.info { background: #eef2ff; border-color: #c7d2fe; color: #4338ca; }
.chip.warn { background: #fff7ed; border-color: #fed7aa; color: #9a3412; }
.chip.danger { background: #fff1f2; border-color: #fecdd3; color: #9f1239; }
.chip.muted { background: #f1f5f9; border-color: #e2e8f0; color: #475569; }

.mid { padding: 14px; display: grid; gap: 10px; }

.line {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: baseline;
}
.k {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.v {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  text-align: right;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.booking {
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px;
}
.bHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.bTitle {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.bMain {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}
.bSub {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}

.pay {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  font-size: 11px;
  font-weight: 900;
  background: #fff;
}
.p-paid { background: #ecfdf5; border-color: #bbf7d0; color: #166534; }
.p-partial { background: #fff7ed; border-color: #fed7aa; color: #9a3412; }
.p-unpaid { background: #fff1f2; border-color: #fecdd3; color: #9f1239; }
.p-muted { background: #f1f5f9; border-color: #e2e8f0; color: #475569; }

.emptyBox {
  border: 1px dashed #e2e8f0;
  background: #fbfcfe;
  border-radius: 14px;
  padding: 12px;
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
  text-align: center;
}

.foot {
  padding: 14px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
.m-title {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.m-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}
.m-body {
  padding: 16px;
}
.m-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 700px) {
  .m-grid { grid-template-columns: 1fr; }
}
.m-card {
  border: 1px solid #eef2f6;
  background: #fbfcfe;
  border-radius: 14px;
  padding: 14px;
}
.m-foot {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
