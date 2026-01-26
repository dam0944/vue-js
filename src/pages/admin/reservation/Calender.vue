<!-- src/pages/admin/reservations/Calendar.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 p-4 sm:p-6">
    <!-- Header (no border/shadow) -->
    <div class="mx-auto">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-white">
            <span class="material-icons text-[22px]">calendar_month</span>
          </div>
          <div>
            <h1 class="text-lg font-extrabold text-slate-900">Reservations Calendar</h1>
            <p class="text-sm text-slate-500">
              Drag-free calendar view (Rooms × Dates). Click a bar to view details.
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <!-- Search -->
          <div class="flex items-center gap-2 rounded-full bg-white px-4 py-2">
            <span class="material-icons text-[18px] text-slate-400">search</span>
            <input
              v-model.trim="q"
              type="text"
              placeholder="Search guest / phone / room..."
              class="w-full bg-transparent text-sm text-slate-900 outline-none sm:w-[260px]"
            />
          </div>

          <!-- Filters -->
          <select v-model="statusFilter" class="rounded-full bg-white px-4 py-2 text-sm outline-none">
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="reserved">Reserved</option>
            <option value="checked_in">Checked-in</option>
            <option value="checked_out">Checked-out</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No-show</option>
          </select>

          <select v-model="floorFilter" class="rounded-full bg-white px-4 py-2 text-sm outline-none">
            <option value="all">All floors</option>
            <option v-for="f in floors" :key="f" :value="String(f)">Floor {{ f }}</option>
          </select>

          <!-- Range controls -->
          <div class="flex items-center gap-2">
            <button
              class="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-800"
              @click="shiftRange(-rangeDays)"
              title="Previous"
            >
              <span class="material-icons text-[18px] align-middle">chevron_left</span>
            </button>

            <div class="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-800">
              {{ formatDate(rangeStart) }} – {{ formatDate(rangeEnd) }}
            </div>

            <button
              class="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-800"
              @click="shiftRange(rangeDays)"
              title="Next"
            >
              <span class="material-icons text-[18px] align-middle">chevron_right</span>
            </button>
          </div>

          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white"
            @click="reset"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Summary chips (no border/shadow) -->
      <div class="mb-4 flex flex-wrap gap-2">
        <button
          v-for="chip in summaryChips"
          :key="chip.key"
          class="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-800"
          @click="applyChip(chip.key)"
        >
          <span class="mr-2 inline-flex h-2 w-2 rounded-full" :style="{ backgroundColor: chip.dot }"></span>
          {{ chip.label }}: <span class="text-slate-900">{{ chip.count }}</span>
        </button>
      </div>

      <!-- Calendar grid -->
      <div class="overflow-x-auto rounded-2xl bg-white">
        <!-- top header row -->
        <div class="min-w-[980px]">
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
            <div class="grid" :style="gridStyle">
              <!-- room label (sticky) -->
              <div class="sticky left-0 z-10 bg-white">
                <div class="h-16 px-3 flex items-center gap-3">
                  <div class="h-9 w-9 rounded-xl bg-slate-100 grid place-items-center">
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

              <!-- day cells -->
              <div
                v-for="d in days"
                :key="room.room_id + '-' + d.key"
                class="h-16"
              >
                <div class="h-full bg-slate-50/60"></div>
              </div>
            </div>

            <!-- reservation bars overlay -->
            <div class="pointer-events-none absolute inset-0">
              <div class="grid" :style="gridStyle">
                <!-- spacer cell -->
                <div class="sticky left-0 z-20 bg-transparent"></div>

                <!-- overlay area (spans all day cols) -->
                <div class="col-span-[var(--days)] relative">
                  <div
                    v-for="bar in roomBars(room.room_id)"
                    :key="bar.key"
                    class="pointer-events-auto absolute top-3 h-10 rounded-2xl px-3 flex items-center justify-between gap-2 text-white"
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
            <button class="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white" @click="reset">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Drawer -->
    <div v-if="drawer.open" class="fixed inset-0 z-40">
      <div class="absolute inset-0 bg-slate-900/35" @click="closeDrawer"></div>

      <aside class="absolute right-0 top-0 h-full w-full max-w-md bg-white">
        <!-- Drawer header -->
        <div class="flex items-center justify-between px-5 py-4">
          <div class="min-w-0">
            <div class="text-xs font-bold text-slate-500">Reservation</div>
            <div class="truncate text-base font-extrabold text-slate-900">
              {{ drawer.row?.reservation_number || "-" }}
            </div>
          </div>

          <button class="rounded-full bg-slate-100 p-2" @click="closeDrawer">
            <span class="material-icons text-slate-700">close</span>
          </button>
        </div>

        <div class="h-px bg-slate-100"></div>

        <!-- Drawer body (no border/shadow) -->
        <div v-if="drawer.row" class="h-[calc(100vh-120px)] overflow-y-auto p-5">
          <div class="space-y-4">
            <!-- guest -->
            <div class="rounded-2xl bg-slate-50 p-4">
              <div class="text-xs font-bold text-slate-500">GUEST</div>
              <div class="mt-1 text-base font-extrabold text-slate-900">{{ drawer.row.guest.name }}</div>
              <div class="text-sm text-slate-600">{{ drawer.row.guest.phone }}</div>
            </div>

            <!-- stay -->
            <div class="rounded-2xl bg-slate-50 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-xs font-bold text-slate-500">STAY</div>
                  <div class="mt-1 text-sm font-bold text-slate-900">
                    {{ stayText(drawer.row) }}
                  </div>
                  <div class="mt-1 text-xs text-slate-600">
                    Check-in: {{ fmt(drawer.row.check_in) }}
                  </div>
                  <div class="text-xs text-slate-600">
                    Check-out: {{ fmt(drawer.row.check_out) }}
                  </div>
                </div>

                <span
                  class="rounded-full px-3 py-1 text-[10px] font-extrabold uppercase text-white"
                  :style="{ backgroundColor: drawer.row.color || '#0f172a' }"
                >
                  {{ drawer.row.status.replaceAll("_", " ") }}
                </span>
              </div>
            </div>

            <!-- room -->
            <div class="rounded-2xl bg-slate-50 p-4">
              <div class="text-xs font-bold text-slate-500">ROOM</div>
              <div class="mt-1 text-sm font-extrabold text-slate-900">
                Room {{ roomById(drawer.row.room_id)?.room_number || "-" }}
              </div>
              <div class="text-xs text-slate-600">
                {{ roomById(drawer.row.room_id)?.type || "-" }} •
                {{ roomById(drawer.row.room_id)?.beds || "-" }} bed •
                Floor {{ roomById(drawer.row.room_id)?.floor || "-" }}
              </div>
            </div>

            <!-- quick actions -->
            <div class="grid grid-cols-2 gap-2">
              <button class="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white" @click="goCheckin(drawer.row)">
                Check-in/out
              </button>
              <button class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-900" @click="goPos(drawer.row)">
                POS / Checkout
              </button>
            </div>

            <button class="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-900" @click="closeDrawer">
              Close
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { reservationsCalendarData } from "@/data/reservation/reservationsCalendar"

// state
const q = ref("")
const statusFilter = ref("all")
const floorFilter = ref("all")

// range (7 days)
const rangeDays = 7
const rangeStart = ref(reservationsCalendarData.calendarRange.start) // YYYY-MM-DD
const rangeEnd = ref(addDays(rangeStart.value, rangeDays - 1))

const drawer = ref({ open: false, row: null })

// rooms + reservations
const rooms = computed(() => reservationsCalendarData.rooms)
const reservations = computed(() => reservationsCalendarData.reservations)

// floors
const floors = computed(() => {
  const set = new Set(rooms.value.map((r) => r.floor))
  return Array.from(set).sort((a, b) => a - b)
})

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

// filter rooms
const filteredRooms = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return rooms.value.filter((r) => {
    if (floorFilter.value !== "all" && String(r.floor) !== String(floorFilter.value)) return false

    if (!keyword) return true

    const roomNo = String(r.room_number || "").toLowerCase()
    const type = String(r.type || "").toLowerCase()
    return roomNo.includes(keyword) || type.includes(keyword)
  })
})

// filter reservations by status + search
const filteredReservations = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return reservations.value.filter((res) => {
    // status filter
    if (statusFilter.value !== "all" && res.status !== statusFilter.value) return false

    // keyword: guest + phone + room number
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

// build bars for one room
function roomBars(roomId) {
  // only those for this room, AND overlap the current range
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
      // end is exclusive-ish for nightly; for UI we show until day before checkout if checkout date > checkin date
      let endIdx = dayIndex(endDay, start)
      if (r.booking_type !== "hourly") {
        // show checkout day as free, so bar ends at day before checkout (unless same day)
        const ci = dateOnly(r.check_in)
        const co = dateOnly(r.check_out)
        if (co !== ci) endIdx = Math.max(startIdx, endIdx - 1)
      }

      const left = startIdx * 120 // base cell width (matches min in grid)
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

// actions
function open(res) {
  drawer.value = { open: true, row: res }
}
function closeDrawer() {
  drawer.value.open = false
  drawer.value.row = null
}
function applyChip(key) {
  if (key === "all") statusFilter.value = "all"
  else statusFilter.value = key
}
function reset() {
  q.value = ""
  statusFilter.value = "all"
  floorFilter.value = "all"
  rangeStart.value = reservationsCalendarData.calendarRange.start
  rangeEnd.value = addDays(rangeStart.value, rangeDays - 1)
  closeDrawer()
}

// navigation (later wire to router)
function goCheckin(res) {
  console.log("Go checkin/out", res)
  alert("Go to Check-in / Check-out (route later)")
}
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
  // range intersection (date-only)
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
  closeDrawer()
}
function hoursDiff(a, b) {
  const da = new Date(a.replace(" ", "T"))
  const db = new Date(b.replace(" ", "T"))
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
/* keep sticky room labels smooth in horizontal scroll */
</style>
