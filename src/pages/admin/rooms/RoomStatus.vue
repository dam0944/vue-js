<script setup>
import { ref, computed, reactive, watch } from "vue"
import { room_status } from "@/data/room/room_status"

// local copy for UI updates
const rooms = ref(room_status.map((x) => ({ ...x })))

// filters
const q = ref("")
const status = ref("")
const type = ref("")
const floor = ref("")
const sort = ref("number")

const statusOptions = ["", "available", "occupied", "reserved", "cleaning", "maintenance"]

const typeOptions = computed(() => {
  const s = new Set(rooms.value.map((r) => r.room?.type).filter(Boolean))
  return ["", ...Array.from(s)]
})

const floorOptions = computed(() => {
  const s = new Set(rooms.value.map((r) => r.room?.floor).filter((x) => x != null))
  return ["", ...Array.from(s).sort((a, b) => Number(a) - Number(b))]
})

const safe = (v) => (v ?? "").toString().toLowerCase()
const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")

function statusColor(st) {
  // soft colors, no gradient
  if (st === "available") return "st-available"
  if (st === "occupied") return "st-occupied"
  if (st === "reserved") return "st-reserved"
  if (st === "cleaning") return "st-cleaning"
  if (st === "maintenance") return "st-maintenance"
  return "st-default"
}

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rooms.value.filter((r) => {
    const hit =
      !key ||
      safe(r.room?.number).includes(key) ||
      safe(r.room?.type).includes(key) ||
      safe(r.guest?.name).includes(key) ||
      safe(r.guest?.phone).includes(key) ||
      safe(r.bookingNumber).includes(key)

    const okStatus = !status.value || r.status === status.value
    const okType = !type.value || r.room?.type === type.value
    const okFloor = !floor.value || String(r.room?.floor || "") === String(floor.value)
    return hit && okStatus && okType && okFloor
  })

  if (sort.value === "number") list.sort((a, b) => (a.room?.number || "").localeCompare(b.room?.number || ""))
  if (sort.value === "floor") list.sort((a, b) => Number(a.room?.floor || 0) - Number(b.room?.floor || 0))
  if (sort.value === "status") list.sort((a, b) => (a.status || "").localeCompare(b.status || ""))

  return list
})

// top stats
const stats = computed(() => {
  const all = rooms.value
  const count = (st) => all.filter((x) => x.status === st).length
  return {
    total: all.length,
    available: count("available"),
    occupied: count("occupied"),
    reserved: count("reserved"),
    cleaning: count("cleaning"),
    maintenance: count("maintenance"),
  }
})

// modal
const modalOpen = ref(false)
const selected = ref(null)

function openView(r) {
  selected.value = r
  modalOpen.value = true
}
function closeView() {
  modalOpen.value = false
  selected.value = null
}
watch(modalOpen, (v) => (document.body.style.overflow = v ? "hidden" : ""))

// quick actions (guesthouse simple)
function markStatus(r, newStatus) {
  r.status = newStatus

  // when set available, clear guest/booking/stay
  if (newStatus === "available") {
    r.guest = null
    r.bookingNumber = null
    r.stay = null
  }
  // when set cleaning, clear guest but keep last booking (optional)
  if (newStatus === "cleaning") {
    r.guest = null
    r.stay = null
  }

  r.lastCleaned = newStatus === "available" ? nowString() : r.lastCleaned
}

function nowString() {
  const d = new Date()
  const pad = (x) => String(x).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// demo: quick check-in (just for UI)
function quickCheckIn(r) {
  r.status = "occupied"
  r.guest = { name: "Walk-in Guest", phone: "—" }
  r.bookingNumber = `BK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`
  r.stay = { checkIn: nowString(), checkOut: "—", duration: "3 hours" }
}

// demo: quick check-out
function quickCheckOut(r) {
  r.status = "cleaning"
  r.stay = null
  r.guest = null
  // keep booking number for history if you want
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>Room Status Board</h1>
        <p>Guesthouse live rooms • quick actions • faster check-in/out</p>
      </div>

      <div class="headActions">
        <VaButton preset="secondary" icon="refresh">Refresh</VaButton>
        <VaButton color="success" icon="add">New Reservation</VaButton>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="sCard">
        <div class="k">Total</div>
        <div class="v">{{ stats.total }}</div>
      </div>
      <div class="sCard ok">
        <div class="k">Available</div>
        <div class="v">{{ stats.available }}</div>
      </div>
      <div class="sCard busy">
        <div class="k">Occupied</div>
        <div class="v">{{ stats.occupied }}</div>
      </div>
      <div class="sCard info">
        <div class="k">Reserved</div>
        <div class="v">{{ stats.reserved }}</div>
      </div>
      <div class="sCard warn">
        <div class="k">Cleaning</div>
        <div class="v">{{ stats.cleaning }}</div>
      </div>
      <div class="sCard danger">
        <div class="k">Maintenance</div>
        <div class="v">{{ stats.maintenance }}</div>
      </div>
    </div>

    <!-- Filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search room / guest / phone / booking..." />
      <VaSelect v-model="status" :options="statusOptions" label="Status" />
      <VaSelect v-model="type" :options="typeOptions" label="Type" />
      <VaSelect v-model="floor" :options="floorOptions" label="Floor" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Room Number', value: 'number' },
          { text: 'Floor', value: 'floor' },
          { text: 'Status', value: 'status' },
        ]"
        label="Sort"
        text-by="text"
        value-by="value"
      />
    </VaCard>

    <!-- Grid -->
    <div class="grid">
      <div
        v-for="r in filtered"
        :key="r.id"
        class="roomCard"
        :class="statusColor(r.status)"
      >
        <div class="top">
          <div>
            <div class="roomNo">Room {{ r.room?.number }}</div>
            <div class="sub">{{ r.room?.type }} • Floor {{ r.room?.floor }}</div>
          </div>
          <span class="badge">{{ label(r.status) }}</span>
        </div>

        <div class="mid">
          <div class="line">
            <span class="k">Guest</span>
            <span class="v">{{ r.guest?.name || "-" }}</span>
          </div>
          <div class="line">
            <span class="k">Phone</span>
            <span class="v">{{ r.guest?.phone || "-" }}</span>
          </div>
          <div class="line">
            <span class="k">Booking</span>
            <span class="v mono">{{ r.bookingNumber || "-" }}</span>
          </div>
          <div class="line">
            <span class="k">Stay</span>
            <span class="v">{{ r.stay?.duration || "-" }}</span>
          </div>
          <div class="line">
            <span class="k">Last Clean</span>
            <span class="v mono">{{ r.lastCleaned || "-" }}</span>
          </div>
          <div class="line">
            <span class="k">Staff</span>
            <span class="v">{{ r.staff || "-" }}</span>
          </div>
        </div>

        <div class="actions">
          <VaButton size="small" preset="secondary" @click="openView(r)">View</VaButton>

          <VaButton
            v-if="r.status === 'available'"
            size="small"
            color="primary"
            @click="quickCheckIn(r)"
          >
            Check-in
          </VaButton>

          <VaButton
            v-if="r.status === 'occupied'"
            size="small"
            color="success"
            @click="quickCheckOut(r)"
          >
            Check-out
          </VaButton>

          <VaButton
            v-if="r.status !== 'maintenance'"
            size="small"
            preset="secondary"
            @click="markStatus(r, 'cleaning')"
          >
            Cleaning
          </VaButton>

          <VaButton
            size="small"
            preset="secondary"
            @click="markStatus(r, 'available')"
          >
            Available
          </VaButton>

          <VaButton
            size="small"
            preset="secondary"
            @click="markStatus(r, 'maintenance')"
          >
            Maintenance
          </VaButton>
        </div>
      </div>
    </div>

    <!-- Modal view -->
    <Teleport to="body">
      <div v-if="modalOpen" class="m-backdrop" @click="closeView">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">Room Details</div>
              <div class="m-sub">
                Room {{ selected?.room?.number }} • {{ selected?.room?.type }} • Floor
                {{ selected?.room?.floor }}
              </div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeView">Close</VaButton>
          </header>

          <section class="m-body">
            <div class="detailGrid">
              <div class="box">
                <div class="k">Status</div>
                <div class="v">
                  <span class="badge">{{ label(selected?.status) }}</span>
                </div>
              </div>

              <div class="box">
                <div class="k">Booking</div>
                <div class="v mono">{{ selected?.bookingNumber || "-" }}</div>
              </div>

              <div class="box">
                <div class="k">Guest</div>
                <div class="v">{{ selected?.guest?.name || "-" }}</div>
                <div class="muted">{{ selected?.guest?.phone || "-" }}</div>
              </div>

              <div class="box">
                <div class="k">Stay</div>
                <div class="v">{{ selected?.stay?.duration || "-" }}</div>
                <div class="muted mono">IN: {{ selected?.stay?.checkIn || "-" }}</div>
                <div class="muted mono">OUT: {{ selected?.stay?.checkOut || "-" }}</div>
              </div>

              <div class="box">
                <div class="k">Housekeeping</div>
                <div class="v">Last Clean: <b class="mono">{{ selected?.lastCleaned || "-" }}</b></div>
                <div class="muted">Staff: {{ selected?.staff || "-" }}</div>
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
  gap: 12px;
  margin-bottom: 12px;
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
.headActions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}
@media (max-width: 1100px) {
  .stats { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 650px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 420px) {
  .stats { grid-template-columns: 1fr; }
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
.sCard.ok { background: #ecfdf5; border-color: #bbf7d0; }
.sCard.busy { background: #fff7ed; border-color: #fed7aa; }
.sCard.info { background: #eff6ff; border-color: #bfdbfe; }
.sCard.warn { background: #fefce8; border-color: #fde68a; }
.sCard.danger { background: #fff1f2; border-color: #fecdd3; }

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
@media (max-width: 1000px) {
  .filters { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .filters { grid-template-columns: 1fr; }
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
@media (max-width: 1100px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 820px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px) {
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
  padding: 12px 14px;
  border-bottom: 1px solid #eef2f6;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}
.roomNo {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.sub {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
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
  white-space: nowrap;
}

/* Status styles (soft colors) */
.st-available { border-color: #bbf7d0; }
.st-occupied { border-color: #fed7aa; }
.st-reserved { border-color: #bfdbfe; }
.st-cleaning { border-color: #fde68a; }
.st-maintenance { border-color: #fecdd3; }

.mid {
  padding: 12px 14px;
  display: grid;
  gap: 8px;
}
.line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.k {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.v {
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
  text-align: right;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

.actions {
  margin-top: auto;
  padding: 12px 14px;
  border-top: 1px solid #eef2f6;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
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
  width: min(860px, 100%);
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
  max-height: 70vh;
  overflow: auto;
}
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
.box {
  border: 1px solid #eef2f6;
  background: #fbfcfe;
  border-radius: 14px;
  padding: 14px;
}
.muted {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
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
