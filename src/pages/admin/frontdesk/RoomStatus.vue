<template>
  <div class="p-4 sm:p-6">
    <!-- Header -->
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">Room Status Board</h1>
        <p class="text-sm text-slate-500">
          Live view of rooms: available, occupied, cleaning, maintenance, blocked.
        </p>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <VaInput
          v-model="q"
          placeholder="Search room / guest / phone..."
          class="w-full sm:w-[320px]"
          clearable
        >
          <template #prependInner>
            <span class="material-icons text-slate-400 text-[18px]">search</span>
          </template>
        </VaInput>

        <VaSelect
          v-model="statusFilter"
          :options="statusOptions"
          class="w-full sm:w-[220px]"
          placeholder="Filter status"
          clearable
        />

        <VaSelect
          v-model="floorFilter"
          :options="floorOptions"
          class="w-full sm:w-[180px]"
          placeholder="Floor"
          clearable
        />
      </div>
    </div>

    <!-- Summary chips -->
    <div class="mb-5 flex flex-wrap gap-2">
      <button
        v-for="chip in summaryChips"
        :key="chip.key"
        class="rounded-full px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 transition"
        @click="applyChip(chip.key)"
      >
        <span class="mr-2 inline-flex h-2 w-2 rounded-full" :class="chip.dot"></span>
        {{ chip.label }}:
        <span class="font-semibold text-slate-900">{{ chip.count }}</span>
      </button>

      <button
        class="rounded-full px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 transition"
        @click="resetFilters"
      >
        Reset
      </button>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div
        v-for="room in filteredRooms"
        :key="room.room_id"
        class="rounded-2xl bg-white p-4"
      >
        <!-- Top row -->
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <div class="text-lg font-semibold text-slate-900">Room {{ room.room_number }}</div>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="statusBadgeClass(room.status)"
              >
                {{ prettyStatus(room.status) }}
              </span>
            </div>

            <div class="mt-1 text-xs text-slate-500">
              Floor {{ room.floor }} • Building {{ room.building || "-" }} •
              {{ room.room_type?.type_name || "-" }} • {{ room.room_type?.bed_count ?? "-" }} bed(s)
            </div>
          </div>

          <div class="flex flex-col items-end gap-1">
            <div class="text-xs text-slate-500">Night</div>
            <div class="text-sm font-semibold text-slate-900">
              ${{ room.room_type?.nightly_price ?? "-" }}
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="mt-3 space-y-2">
          <!-- Guest / Reservation -->
          <div v-if="room.current_reservation" class="rounded-xl bg-slate-50 p-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2">
                  <span class="material-icons text-slate-400 text-[18px]">person</span>
                  <div class="text-sm font-semibold text-slate-900">
                    {{ room.current_reservation.guest.first_name }}
                    {{ room.current_reservation.guest.last_name }}
                  </div>

                  <span
                    v-if="room.current_reservation.guest.vip_status"
                    class="rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-xs font-medium"
                  >
                    VIP
                  </span>
                </div>

                <div class="mt-1 text-xs text-slate-600">
                  {{ room.current_reservation.guest.phone }} •
                  {{ prettyStatus(room.current_reservation.booking_type) }} •
                  {{ room.current_reservation.stay_units }} unit(s)
                </div>
              </div>

              <button
                class="rounded-xl px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 transition"
                @click="openDetails(room)"
              >
                Details
              </button>
            </div>

            <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div class="rounded-lg bg-white p-2">
                <div class="text-slate-500">Check-in</div>
                <div class="font-semibold text-slate-900">
                  {{ formatDateTime(room.current_reservation.check_in_at) }}
                </div>
              </div>
              <div class="rounded-lg bg-white p-2">
                <div class="text-slate-500">Check-out</div>
                <div class="font-semibold text-slate-900">
                  {{ formatDateTime(room.current_reservation.check_out_at) }}
                </div>
              </div>
            </div>

            <div class="mt-2 flex items-center justify-between">
              <div class="text-xs text-slate-500">
                Status:
                <span class="font-semibold text-slate-900">
                  {{ prettyStatus(room.current_reservation.status) }}
                </span>
              </div>
              <div class="text-sm font-semibold text-slate-900">
                ${{ room.current_reservation.total_room_charge }}
              </div>
            </div>
          </div>

          <!-- No guest -->
          <div v-else class="rounded-xl bg-slate-50 p-3">
            <div class="flex items-center gap-2 text-sm text-slate-700">
              <span class="material-icons text-slate-400 text-[18px]">info</span>
              <span>No current reservation</span>
            </div>
            <div class="mt-1 text-xs text-slate-500">
              Last cleaned: {{ room.last_cleaned_at ? formatDateTime(room.last_cleaned_at) : "-" }}
            </div>
          </div>

          <!-- Housekeeping -->
          <div class="flex items-center justify-between rounded-xl bg-white p-3">
            <div class="flex items-center gap-2">
              <span class="material-icons text-slate-400 text-[18px]">cleaning_services</span>
              <div>
                <div class="text-sm font-medium text-slate-900">Housekeeping</div>
                <div class="text-xs text-slate-500">
                  {{ housekeepingText(room.housekeeping) }}
                </div>
              </div>
            </div>

            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="housekeepingBadgeClass(room.housekeeping)"
            >
              {{ housekeepingBadgeLabel(room.housekeeping) }}
            </span>
          </div>

          <!-- Quick actions -->
          <div class="grid grid-cols-2 gap-2">
            <button
              class="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200 transition disabled:opacity-50"
              :disabled="room.status !== 'available' && room.status !== 'occupied'"
              @click="action('Check-in / Check-out', room)"
            >
              <span class="material-icons text-[18px] align-middle mr-1">how_to_reg</span>
              Check-in/out
            </button>

            <button
              class="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200 transition disabled:opacity-50"
              :disabled="!room.current_reservation"
              @click="goToPos(room)"
            >
              <span class="material-icons text-[18px] align-middle mr-1">shopping_cart</span>
              POS
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-if="filteredRooms.length === 0" class="mt-6 rounded-2xl bg-white p-6 text-center">
      <div class="text-slate-900 font-semibold">No rooms found</div>
      <div class="text-sm text-slate-500 mt-1">Try another keyword or clear filters.</div>
      <button class="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200" @click="resetFilters">
        Reset
      </button>
    </div>

    <!-- Details Modal -->
    <VaModal v-model="detailsOpen" max-width="520px" hide-default-actions>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="text-base font-semibold text-slate-900">Room Details</div>
          <button class="rounded-lg p-1 hover:bg-slate-100" @click="detailsOpen = false">
            <span class="material-icons text-slate-500">close</span>
          </button>
        </div>
      </template>

      <div v-if="selectedRoom" class="space-y-3">
        <div class="rounded-2xl bg-white p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-lg font-semibold text-slate-900">
                Room {{ selectedRoom.room_number }}
              </div>
              <div class="text-sm text-slate-500">
                {{ selectedRoom.room_type?.type_name || "-" }} • Floor {{ selectedRoom.floor }} •
                {{ prettyStatus(selectedRoom.status) }}
              </div>
            </div>
            <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusBadgeClass(selectedRoom.status)">
              {{ prettyStatus(selectedRoom.status) }}
            </span>
          </div>
        </div>

        <div v-if="selectedRoom.current_reservation" class="rounded-2xl bg-white p-4">
          <div class="text-sm font-semibold text-slate-900 mb-2">Current Reservation</div>
          <div class="text-sm text-slate-700">
            Guest:
            <span class="font-semibold">
              {{ selectedRoom.current_reservation.guest.first_name }}
              {{ selectedRoom.current_reservation.guest.last_name }}
            </span>
            <span v-if="selectedRoom.current_reservation.guest.vip_status" class="ml-2 text-amber-700">(VIP)</span>
          </div>
          <div class="mt-1 text-xs text-slate-500">
            Phone: {{ selectedRoom.current_reservation.guest.phone }} •
            Type: {{ prettyStatus(selectedRoom.current_reservation.booking_type) }} •
            Units: {{ selectedRoom.current_reservation.stay_units }}
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div class="rounded-xl bg-slate-50 p-3">
              <div class="text-slate-500">Check-in</div>
              <div class="font-semibold text-slate-900">
                {{ formatDateTime(selectedRoom.current_reservation.check_in_at) }}
              </div>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <div class="text-slate-500">Check-out</div>
              <div class="font-semibold text-slate-900">
                {{ formatDateTime(selectedRoom.current_reservation.check_out_at) }}
              </div>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <div class="text-sm text-slate-500">Total room charge</div>
            <div class="text-lg font-semibold text-slate-900">
              ${{ selectedRoom.current_reservation.total_room_charge }}
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <div class="text-sm font-semibold text-slate-900 mb-2">Housekeeping</div>
          <div class="text-sm text-slate-700">{{ housekeepingText(selectedRoom.housekeeping) }}</div>
          <div class="mt-2">
            <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="housekeepingBadgeClass(selectedRoom.housekeeping)">
              {{ housekeepingBadgeLabel(selectedRoom.housekeeping) }}
            </span>
          </div>
        </div>

        <div class="flex gap-2 justify-end">
          <VaButton preset="secondary" @click="detailsOpen = false">Close</VaButton>
          <VaButton preset="primary" @click="goToPos(selectedRoom)">Go to POS</VaButton>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { roomsStatusData as rawRoomsStatusData } from "@/data/front/roomsStatusData"

// ✅ support BOTH formats:
// - export const roomsStatusData = [...]
const rooms = Array.isArray(rawRoomsStatusData)
  ? rawRoomsStatusData
  : (rawRoomsStatusData?.rooms ?? [])

// filters
const q = ref("")
const statusFilter = ref(null)
const floorFilter = ref(null)
const router = useRouter()

// modal
const detailsOpen = ref(false)
const selectedRoom = ref(null)

const statusOptions = [
  { text: "Available", value: "available" },
  { text: "Occupied", value: "occupied" },
  { text: "Cleaning", value: "cleaning" },
  { text: "Maintenance", value: "maintenance" },
  { text: "Blocked", value: "blocked" },
]

const floorOptions = computed(() => {
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b)
  return floors.map((f) => ({ text: `Floor ${f}`, value: f }))
})

const filteredRooms = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return rooms.filter((r) => {
    if (statusFilter.value?.value && r.status !== statusFilter.value.value) return false
    if (floorFilter.value?.value != null && r.floor !== floorFilter.value.value) return false
    if (!keyword) return true

    const guestName = r.current_reservation
      ? `${r.current_reservation.guest.first_name} ${r.current_reservation.guest.last_name}`.toLowerCase()
      : ""

    const guestPhone = r.current_reservation ? String(r.current_reservation.guest.phone || "") : ""
    const roomNo = String(r.room_number || "").toLowerCase()
    const typeName = String(r.room_type?.type_name || "").toLowerCase()

    return (
      roomNo.includes(keyword) ||
      typeName.includes(keyword) ||
      guestName.includes(keyword) ||
      guestPhone.includes(keyword)
    )
  })
})

function goToPos(room) {
  router.push({
    name: "admin.pos.index",
    query: {
      room_id: room.room_id,
      room_number: room.room_number,
    },
  })
}

const summaryChips = computed(() => {
  const count = (status) => rooms.filter((r) => r.status === status).length
  return [
    { key: "all", label: "All", count: rooms.length, dot: "bg-slate-400" },
    { key: "available", label: "Available", count: count("available"), dot: "bg-emerald-500" },
    { key: "occupied", label: "Occupied", count: count("occupied"), dot: "bg-blue-500" },
    { key: "cleaning", label: "Cleaning", count: count("cleaning"), dot: "bg-amber-500" },
    { key: "maintenance", label: "Maintenance", count: count("maintenance"), dot: "bg-rose-500" },
    { key: "blocked", label: "Blocked", count: count("blocked"), dot: "bg-slate-700" },
  ]
})

function applyChip(key) {
  if (key === "all") {
    statusFilter.value = null
    return
  }
  statusFilter.value = statusOptions.find((s) => s.value === key) || null
}

function resetFilters() {
  q.value = ""
  statusFilter.value = null
  floorFilter.value = null
}

function prettyStatus(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}

function statusBadgeClass(status) {
  switch (status) {
    case "available":
      return "bg-emerald-50 text-emerald-700"
    case "occupied":
      return "bg-blue-50 text-blue-700"
    case "cleaning":
      return "bg-amber-50 text-amber-700"
    case "maintenance":
      return "bg-rose-50 text-rose-700"
    case "blocked":
      return "bg-slate-200 text-slate-700"
    default:
      return "bg-slate-200 text-slate-700"
  }
}

function housekeepingBadgeClass(hk) {
  const s = hk?.status
  switch (s) {
    case "completed":
      return "bg-emerald-50 text-emerald-700"
    case "in_progress":
      return "bg-blue-50 text-blue-700"
    case "pending":
      return "bg-amber-50 text-amber-700"
    default:
      return "bg-slate-200 text-slate-700"
  }
}

function housekeepingBadgeLabel(hk) {
  const s = hk?.status
  return s ? prettyStatus(s) : "No Task"
}

function housekeepingText(hk) {
  if (!hk || !hk.status) return "No housekeeping task"
  const who = hk.assigned_to ? ` • Assigned to ${hk.assigned_to}` : ""
  return `Status: ${prettyStatus(hk.status)}${who}`
}

function formatDateTime(s) {
  if (!s) return "-"
  return String(s).replace("T", " ").slice(0, 16)
}

function openDetails(room) {
  selectedRoom.value = room
  detailsOpen.value = true
}

function action(label, room) {
  console.log(label, room)
  openDetails(room)
}
</script>
