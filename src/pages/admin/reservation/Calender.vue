<!-- src/pages/admin/reservations/Calendar.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 p-4 sm:p-6">
    <div class="mx-auto w-full space-y-4">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white">
            <span class="material-icons text-[22px]">calendar_month</span>
          </div>
          <div>
            <h1 class="text-lg font-extrabold text-slate-900">Reservations Calendar</h1>
            <p class="text-sm text-slate-500">
              Drag-free calendar view (Rooms × Dates). Click a bar to view details.
            </p>
          </div>
        </div>

        <!-- Filters (make equal height) -->
        <VaCard class="soft-card rounded-2xl">
          <VaCardContent class="p-3">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
              <!-- Search -->
              <VaInput
                v-model="q"
                class="w-full sm:w-[280px]"
                placeholder="Search guest / phone / room..."
                clearable
              >
                <template #prependInner>
                  <VaIcon name="search" color="secondary" size="18px" />
                </template>
              </VaInput>

              <VaSelect
                v-model="statusFilter"
                class="w-full sm:w-[210px]"
                label="Status"
                placeholder="All"
                clearable
                :options="statusOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />

              <VaSelect
                v-model="floorFilter"
                class="w-full sm:w-[190px]"
                label="Floor"
                placeholder="All"
                clearable
                :options="floorOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />

              <!-- Range controls -->
              <div class="flex items-end gap-2">
                <VaButton preset="secondary" class="rounded-2xl font-extrabold h-10" @click="shiftRange(-rangeDays)">
                  <VaIcon name="chevron_left" />
                </VaButton>

                <div class="h-10 rounded-2xl bg-slate-100 px-4 grid place-items-center text-sm font-extrabold text-slate-800">
                  {{ formatDate(rangeStart) }} – {{ formatDate(rangeEnd) }}
                </div>

                <VaButton preset="secondary" class="rounded-2xl font-extrabold h-10" @click="shiftRange(rangeDays)">
                  <VaIcon name="chevron_right" />
                </VaButton>

                <VaButton preset="primary" class="rounded-2xl font-extrabold h-10" @click="reset">
                  Reset
                </VaButton>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Summary chips -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent class="py-3">
          <div class="flex flex-wrap items-center gap-2">
            <VaChip
              v-for="chip in summaryChips"
              :key="chip.key"
              size="small"
              class="cursor-pointer select-none"
              :outline="chipKey !== chip.key"
              :color="chipKey === chip.key ? 'primary' : 'secondary'"
              @click="applyChip(chip.key)"
            >
              <span class="mr-2 inline-flex h-2 w-2 rounded-full" :style="{ backgroundColor: chip.dot }"></span>
              {{ chip.label }} <span class="ml-1 opacity-70">({{ chip.count }})</span>
            </VaChip>

            <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="reset">
              Reset
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Calendar grid -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent class="p-0">
          <div class="overflow-x-auto rounded-2xl bg-white">
            <div class="min-w-[980px]">
              <!-- top header row -->
              <div class="grid" :style="gridStyle">
                <!-- top-left corner -->
                <div class="sticky left-0 z-20 bg-white">
                  <div class="h-12 px-3 flex items-center text-xs font-bold text-slate-500">
                    Rooms
                  </div>
                </div>

                <!-- day headers -->
                <div
                  v-for="d in days"
                  :key="d.key"
                  class="h-12 px-2 flex flex-col justify-center text-center"
                >
                  <div class="text-xs font-bold text-slate-700">{{ d.weekday }}</div>
                  <div class="text-[11px] text-slate-500">{{ d.label }}</div>
                </div>
              </div>

              <!-- room rows -->
              <div
                v-for="room in filteredRooms"
                :key="room.room_id"
                class="relative"
              >
                <!-- base grid cells -->
                <div class="grid" :style="gridStyle">
                  <!-- room label (sticky) -->
                  <div class="sticky left-0 z-10 bg-white">
                    <div class="h-16 px-3 flex items-center gap-3">
                      <div class="h-9 w-9 rounded-2xl bg-slate-100 grid place-items-center">
                        <span class="material-icons text-slate-600 text-[18px]">meeting_room</span>
                      </div>
                      <div class="leading-tight">
                        <div class="text-sm font-extrabold text-slate-900">
                          {{ room.room_number }}
                        </div>
                        <div class="text-[11px] text-slate-500">
                          Floor {{ room.floor }} • {{ room.type }} • {{ room.beds }} bed
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- day cells (not clickable) -->
                  <div
                    v-for="d in days"
                    :key="room.room_id + '-' + d.key"
                    class="h-16 pointer-events-none"
                  >
                    <div class="h-full bg-slate-50/60"></div>
                  </div>
                </div>

                <!-- reservation bars overlay (CLICKABLE) -->
                <div class="absolute inset-0">
                  <div class="grid" :style="gridStyle">
                    <!-- spacer cell -->
                    <div class="sticky left-0 z-20 bg-transparent"></div>

                    <!-- overlay area -->
                    <div class="col-span-(--days) relative">
                      <div
                        v-for="bar in roomBars(room.room_id)"
                        :key="bar.key"
                        class="absolute top-3 h-10 rounded-2xl px-3 flex items-center justify-between gap-2 text-white cursor-pointer"
                        :style="barStyle(bar)"
                        @click="open(bar.reservation)"
                        role="button"
                      >
                        <div class="min-w-0">
                          <div class="truncate text-xs font-extrabold">
                            {{ bar.reservation.guest.name }}
                          </div>
                          <div class="truncate text-[11px] opacity-90">
                            {{ barLabel(bar.reservation) }}
                          </div>
                        </div>

                        <span class="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                          {{ bar.reservation.status.replaceAll("_", " ") }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- row divider -->
                <div class="h-px bg-slate-100"></div>
              </div>

              <!-- empty -->
              <div v-if="filteredRooms.length === 0" class="p-10 text-center">
                <div class="text-slate-900 font-extrabold">No rooms found</div>
                <div class="text-sm text-slate-500 mt-1">Try another keyword or clear filters.</div>
                <VaButton class="mt-4 rounded-2xl font-extrabold" preset="primary" @click="reset">
                  Reset
                </VaButton>
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Details popup (VaModal) -->
      <VaModal v-model="detailsOpen" max-width="520px" hide-default-actions>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="text-base font-extrabold text-slate-900">Reservation Details</div>
            <VaButton preset="plain" icon="close" @click="closeDetails" />
          </div>
        </template>

        <div v-if="selectedRes" class="space-y-3">
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-xs font-bold text-slate-500">RESERVATION</div>
                  <div class="mt-1 truncate text-lg font-extrabold text-slate-900">
                    {{ selectedRes.reservation_number || "-" }}
                  </div>
                  <div class="mt-1 text-xs text-slate-500">
                    {{ selectedRes.booking_type === "hourly" ? "Hourly" : "Nightly" }}
                  </div>
                </div>

                <span
                  class="shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase text-white"
                  :style="{ backgroundColor: selectedRes.color || '#0f172a' }"
                >
                  {{ selectedRes.status.replaceAll("_", " ") }}
                </span>
              </div>
            </VaCardContent>
          </VaCard>

          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="text-xs font-bold text-slate-500">GUEST</div>
              <div class="mt-1 text-base font-extrabold text-slate-900">{{ selectedRes.guest?.name }}</div>
              <div class="text-sm text-slate-600">{{ selectedRes.guest?.phone }}</div>
            </VaCardContent>
          </VaCard>

          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="text-xs font-bold text-slate-500">STAY</div>
              <div class="mt-1 text-sm font-extrabold text-slate-900">{{ stayText(selectedRes) }}</div>
              <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div class="soft-sub rounded-2xl p-3">
                  <div class="text-slate-500">Check-in</div>
                  <div class="font-extrabold text-slate-900">{{ fmt(selectedRes.check_in) }}</div>
                </div>
                <div class="soft-sub rounded-2xl p-3">
                  <div class="text-slate-500">Check-out</div>
                  <div class="font-extrabold text-slate-900">{{ fmt(selectedRes.check_out) }}</div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="text-xs font-bold text-slate-500">ROOM</div>
              <div class="mt-1 text-sm font-extrabold text-slate-900">
                Room {{ roomById(selectedRes.room_id)?.room_number || "-" }}
              </div>
              <div class="text-xs text-slate-600">
                {{ roomById(selectedRes.room_id)?.type || "-" }} •
                {{ roomById(selectedRes.room_id)?.beds || "-" }} bed •
                Floor {{ roomById(selectedRes.room_id)?.floor || "-" }}
              </div>
            </VaCardContent>
          </VaCard>

          <div class="flex justify-end gap-2">
            <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="closeDetails">Close</VaButton>
            <VaButton color="primary" class="rounded-2xl font-extrabold" @click="goPos(selectedRes)">
              POS / Checkout
            </VaButton>
          </div>
        </div>
      </VaModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { reservationsCalendarData } from "@/data/reservation/reservationsCalendar"

// state
const q = ref("")
const statusFilter = ref(null) // null = all
const floorFilter = ref(null) // null = all
const chipKey = ref("all")

// range (7 days)
const rangeDays = 7
const rangeStart = ref(reservationsCalendarData.calendarRange.start) // YYYY-MM-DD
const rangeEnd = ref(addDays(rangeStart.value, rangeDays - 1))

// modal
const detailsOpen = ref(false)
const selectedRes = ref(null)

function open(res) {
  selectedRes.value = res
  detailsOpen.value = true
}
function closeDetails() {
  detailsOpen.value = false
  selectedRes.value = null
}

// rooms + reservations
const rooms = computed(() => reservationsCalendarData.rooms || [])
const reservations = computed(() => reservationsCalendarData.reservations || [])

// floors options
const floorOptions = computed(() => {
  const set = new Set(rooms.value.map((r) => r.floor))
  const list = Array.from(set).sort((a, b) => a - b)
  return [{ text: "All", value: null }, ...list.map((f) => ({ text: `Floor ${f}`, value: f }))]
})

// status options
const statusOptions = [
  { text: "All", value: null },
  { text: "Pending", value: "pending" },
  { text: "Confirmed", value: "confirmed" },
  { text: "Reserved", value: "reserved" },
  { text: "Checked-in", value: "checked_in" },
  { text: "Checked-out", value: "checked_out" },
  { text: "Cancelled", value: "cancelled" },
  { text: "No-show", value: "no_show" },
]

// days in range
const days = computed(() => {
  const out = []
  for (let i = 0; i < rangeDays; i++) {
    const d = addDays(rangeStart.value, i)
    const dateObj = new Date(d + "T00:00:00")
    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" })
    const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit" })
    out.push({ key: d, date: d, weekday, label })
  }
  return out
})

// grid columns: 1 label col + N day cols
const gridStyle = computed(() => ({
  gridTemplateColumns: `240px repeat(${rangeDays}, minmax(120px, 1fr))`,
  "--days": String(rangeDays),
}))

// rooms filter (room-only search + floor)
const filteredRooms = computed(() => {
  const keyword = q.value.trim().toLowerCase()
  return rooms.value.filter((r) => {
    if (floorFilter.value != null && String(r.floor) !== String(floorFilter.value)) return false

    if (!keyword) return true
    const roomNo = String(r.room_number || "").toLowerCase()
    const type = String(r.type || "").toLowerCase()
    return roomNo.includes(keyword) || type.includes(keyword)
  })
})

// reservations filter (status + chip + keyword)
const filteredReservations = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return reservations.value.filter((res) => {
    const statusKey = chipKey.value !== "all" ? chipKey.value : null

    if (statusFilter.value && res.status !== statusFilter.value) return false
    if (statusKey && res.status !== statusKey) return false

    if (!keyword) return true

    const guestName = String(res.guest?.name || "").toLowerCase()
    const phone = String(res.guest?.phone || "").toLowerCase()
    const room = roomById(res.room_id)?.room_number || ""
    const roomNo = String(room).toLowerCase()

    return guestName.includes(keyword) || phone.includes(keyword) || roomNo.includes(keyword)
  })
})

// summary chips
const summaryChips = computed(() => {
  const by = (status) => reservations.value.filter((r) => r.status === status).length
  return [
    { key: "all", label: "All", count: reservations.value.length, dot: "#94a3b8" },
    { key: "confirmed", label: "Confirmed", count: by("confirmed"), dot: "#2563eb" },
    { key: "reserved", label: "Reserved", count: by("reserved"), dot: "#f59e0b" },
    { key: "checked_in", label: "Checked-in", count: by("checked_in"), dot: "#16a34a" },
    { key: "checked_out", label: "Checked-out", count: by("checked_out"), dot: "#64748b" },
    { key: "cancelled", label: "Cancelled", count: by("cancelled"), dot: "#ef4444" },
  ]
})

function applyChip(key) {
  chipKey.value = key
  // keep VaSelect in sync (optional). If you don't want, remove these 2 lines:
  statusFilter.value = key === "all" ? null : key
}

function reset() {
  q.value = ""
  statusFilter.value = null
  floorFilter.value = null
  chipKey.value = "all"
  rangeStart.value = reservationsCalendarData.calendarRange.start
  rangeEnd.value = addDays(rangeStart.value, rangeDays - 1)
  closeDetails()
}

// build bars for one room
function roomBars(roomId) {
  const start = rangeStart.value
  const end = rangeEnd.value

  return filteredReservations.value
    .filter((r) => r.room_id === roomId)
    .filter((r) => overlapsRange(r.check_in, r.check_out, start, end))
    .map((r) => {
      const s = clampToRange(r.check_in, start, end)
      const e = clampToRange(r.check_out, start, end)

      const startDay = dateOnly(s)
      const endDay = dateOnly(e)

      const startIdx = dayIndex(startDay, start)
      let endIdx = dayIndex(endDay, start)

      if (r.booking_type !== "hourly") {
        const ci = dateOnly(r.check_in)
        const co = dateOnly(r.check_out)
        if (co !== ci) endIdx = Math.max(startIdx, endIdx - 1)
      }

      const left = startIdx * 120
      const width = (endIdx - startIdx + 1) * 120

      return {
        key: r.reservation_id,
        reservation: r,
        startIdx,
        endIdx,
        left,
        width,
      }
    })
}

// bar style
function barStyle(bar) {
  return {
    left: `${bar.left + 8}px`,
    width: `${Math.max(110, bar.width - 16)}px`,
    backgroundColor: bar.reservation.color || "#0f172a",
  }
}

// navigation (later wire to router)
function goPos(res) {
  console.log("Go POS / checkout", res)
  alert("Go to POS / Checkout (route later)")
}

// labels
function barLabel(r) {
  return r.booking_type === "hourly" ? "Hourly" : "Nightly"
}
function stayText(r) {
  if (r.booking_type === "hourly") {
    const h = hoursDiff(r.check_in, r.check_out)
    return `${h} hour(s)`
  }
  const n = nightsDiff(r.check_in, r.check_out)
  return `${n} night(s)`
}

// helpers
function roomById(id) {
  return rooms.value.find((x) => x.room_id === id)
}
function fmt(s) {
  if (!s) return "-"
  return String(s).replace("T", " ").slice(0, 16)
}
function formatDate(yyyy_mm_dd) {
  const d = new Date(yyyy_mm_dd + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" })
}
function dateOnly(s) {
  return String(s).slice(0, 10)
}
function addDays(yyyy_mm_dd, days) {
  const d = new Date(yyyy_mm_dd + "T00:00:00")
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
function dayIndex(date, rangeStartDate) {
  const a = new Date(rangeStartDate + "T00:00:00")
  const b = new Date(date + "T00:00:00")
  const diff = Math.round((b - a) / 86400000)
  return Math.max(0, Math.min(rangeDays - 1, diff))
}
function overlapsRange(checkIn, checkOut, start, end) {
  const ci = dateOnly(checkIn)
  const co = dateOnly(checkOut)
  return !(co < start || ci > end)
}
function clampToRange(dateTime, start, end) {
  const d = dateOnly(dateTime)
  if (d < start) return start + " 00:00"
  if (d > end) return end + " 23:59"
  return dateTime
}
function shiftRange(deltaDays) {
  rangeStart.value = addDays(rangeStart.value, deltaDays)
  rangeEnd.value = addDays(rangeStart.value, rangeDays - 1)
  closeDetails()
}
function hoursDiff(a, b) {
  const da = new Date(String(a).replace(" ", "T"))
  const db = new Date(String(b).replace(" ", "T"))
  const diff = Math.max(0, Math.round((db - da) / 3600000))
  return diff || 0
}
function nightsDiff(a, b) {
  const da = new Date(dateOnly(a) + "T00:00:00")
  const db = new Date(dateOnly(b) + "T00:00:00")
  const diff = Math.max(0, Math.round((db - da) / 86400000))
  return diff || 1
}
</script>

<style scoped>
/* soft shadow system: no border */
.soft-card {
  border: none !important;
  background: #fff !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
}
.soft-sub {
  background: rgba(2, 8, 23, 0.02);
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06);
}
</style>
