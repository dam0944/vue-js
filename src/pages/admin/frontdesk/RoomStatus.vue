<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 p-4 sm:p-6">
    <div class="mx-auto w-full space-y-5">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-extrabold text-slate-900">Room Status Board</h1>
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
              <VaIcon name="search" color="secondary" size="18px" />
            </template>
          </VaInput>

          <VaSelect
            v-model="statusFilter"
            :options="statusOptionsWithAll"
            class="w-full sm:w-[220px]"
            label="Status"
            placeholder="All"
            clearable
            :text-by="(o) => o.text"
            :value-by="(o) => o.value"
          />

          <VaSelect
            v-model="floorFilter"
            :options="floorOptionsWithAll"
            class="w-full sm:w-[180px]"
            label="Floor"
            placeholder="All"
            clearable
            :text-by="(o) => o.text"
            :value-by="(o) => o.value"
          />
        </div>
      </div>

      <!-- Summary chips -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent class="py-3">
          <div class="flex flex-wrap items-center gap-2">
            <VaChip
              v-for="chip in summaryChips"
              :key="chip.key"
              class="cursor-pointer select-none"
              size="small"
              :outline="chipKey !== chip.key"
              :color="chipKey === chip.key ? 'primary' : 'secondary'"
              @click="applyChip(chip.key)"
            >
              <span class="mr-2 inline-flex h-2 w-2 rounded-full" :class="chip.dot"></span>
              {{ chip.label }} <span class="ml-1 opacity-70">({{ chip.count }})</span>
            </VaChip>

            <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="resetFilters">
              Reset
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Grid -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <VaCard v-for="room in filteredRooms" :key="room.room_id" class="soft-card rounded-2xl">
          <VaCardContent class="p-4">
            <!-- Top row -->
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="truncate text-lg font-extrabold text-slate-900">
                    Room {{ room.room_number }}
                  </div>

                  <span class="chip" :class="statusChipClass(room.status)">
                    {{ prettyStatus(room.status) }}
                  </span>
                </div>

                <div class="mt-1 text-xs text-slate-500">
                  Floor {{ room.floor }} • Building {{ room.building || "-" }} •
                  {{ room.room_type?.type_name || "-" }} •
                  {{ room.room_type?.bed_count ?? "-" }} bed(s)
                </div>
              </div>

              <div class="flex shrink-0 flex-col items-end gap-1">
                <div class="text-xs text-slate-500">Night</div>
                <div class="text-sm font-extrabold text-slate-900">
                  {{ room.room_type?.nightly_price != null ? money(room.room_type.nightly_price) : "-" }}
                </div>
              </div>
            </div>

            <VaDivider class="my-3" />

            <!-- Body -->
            <div class="space-y-2">
              <!-- Guest / Reservation -->
              <VaCard v-if="room.current_reservation" class="soft-mini rounded-2xl">
                <VaCardContent class="p-3">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <VaIcon name="person" color="secondary" size="18px" />
                        <div class="truncate text-sm font-extrabold text-slate-900">
                          {{ room.current_reservation.guest.first_name }}
                          {{ room.current_reservation.guest.last_name }}
                        </div>

                        <span
                          v-if="room.current_reservation.guest.vip_status"
                          class="chip chip-warn"
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

                    <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="openDetails(room)">
                      Details
                    </VaButton>
                  </div>

                  <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div class="soft-sub rounded-2xl p-2">
                      <div class="text-slate-500">Check-in</div>
                      <div class="font-extrabold text-slate-900">
                        {{ formatDateTime(room.current_reservation.check_in_at) }}
                      </div>
                    </div>
                    <div class="soft-sub rounded-2xl p-2">
                      <div class="text-slate-500">Check-out</div>
                      <div class="font-extrabold text-slate-900">
                        {{ formatDateTime(room.current_reservation.check_out_at) }}
                      </div>
                    </div>
                  </div>

                  <div class="mt-2 flex items-center justify-between">
                    <div class="text-xs text-slate-500">
                      Status:
                      <span class="font-extrabold text-slate-900">
                        {{ prettyStatus(room.current_reservation.status) }}
                      </span>
                    </div>
                    <div class="text-sm font-extrabold text-slate-900">
                      {{ money(room.current_reservation.total_room_charge) }}
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>

              <!-- No guest -->
              <VaCard v-else class="soft-mini rounded-2xl">
                <VaCardContent class="p-3">
                  <div class="flex items-center gap-2 text-sm text-slate-700">
                    <VaIcon name="info" color="secondary" size="18px" />
                    <span class="font-semibold">No current reservation</span>
                  </div>
                  <div class="mt-1 text-xs text-slate-500">
                    Last cleaned: {{ room.last_cleaned_at ? formatDateTime(room.last_cleaned_at) : "-" }}
                  </div>
                </VaCardContent>
              </VaCard>

              <!-- Housekeeping -->
              <VaCard class="soft-mini rounded-2xl">
                <VaCardContent class="p-3">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex min-w-0 items-center gap-2">
                      <VaIcon name="cleaning_services" color="secondary" size="18px" />
                      <div class="min-w-0">
                        <div class="text-sm font-extrabold text-slate-900">Housekeeping</div>
                        <div class="truncate text-xs text-slate-500">
                          {{ housekeepingText(room.housekeeping) }}
                        </div>
                      </div>
                    </div>

                    <span class="chip" :class="housekeepingChipClass(room.housekeeping)">
                      {{ housekeepingBadgeLabel(room.housekeeping) }}
                    </span>
                  </div>
                </VaCardContent>
              </VaCard>

              <!-- Quick actions -->
              <div class="grid grid-cols-2 gap-2">
                <VaButton
                  preset="secondary"
                  class="rounded-2xl font-extrabold"
                  :disabled="room.status !== 'available' && room.status !== 'occupied'"
                  @click="action('Check-in / Check-out', room)"
                >
                  <VaIcon name="how_to_reg" class="mr-1" />
                  Check-in/out
                </VaButton>

                <VaButton
                  preset="secondary"
                  class="rounded-2xl font-extrabold"
                  :disabled="!room.current_reservation"
                  @click="goToPos(room)"
                >
                  <VaIcon name="shopping_cart" class="mr-1" />
                  POS
                </VaButton>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Empty -->
      <VaCard v-if="filteredRooms.length === 0" class="soft-card rounded-2xl">
        <VaCardContent class="p-6 text-center">
          <div class="font-extrabold text-slate-900">No rooms found</div>
          <div class="mt-1 text-sm text-slate-500">Try another keyword or clear filters.</div>
          <VaButton class="mt-3 rounded-2xl font-extrabold" preset="secondary" @click="resetFilters">
            Reset
          </VaButton>
        </VaCardContent>
      </VaCard>

      <!-- Details Modal -->
      <VaModal v-model="detailsOpen" max-width="520px" hide-default-actions>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="text-base font-extrabold text-slate-900">Room Details</div>
            <VaButton preset="plain" icon="close" @click="detailsOpen = false" />
          </div>
        </template>

        <div v-if="selectedRoom" class="space-y-3">
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-slate-900">
                    Room {{ selectedRoom.room_number }}
                  </div>
                  <div class="text-sm text-slate-500">
                    {{ selectedRoom.room_type?.type_name || "-" }} • Floor {{ selectedRoom.floor }} •
                    {{ prettyStatus(selectedRoom.status) }}
                  </div>
                </div>
                <span class="chip" :class="statusChipClass(selectedRoom.status)">
                  {{ prettyStatus(selectedRoom.status) }}
                </span>
              </div>
            </VaCardContent>
          </VaCard>

          <VaCard v-if="selectedRoom.current_reservation" class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="mb-2 text-sm font-extrabold text-slate-900">Current Reservation</div>

              <div class="text-sm text-slate-700">
                Guest:
                <span class="font-extrabold">
                  {{ selectedRoom.current_reservation.guest.first_name }}
                  {{ selectedRoom.current_reservation.guest.last_name }}
                </span>

                <span
                  v-if="selectedRoom.current_reservation.guest.vip_status"
                  class="chip chip-warn ml-2"
                >
                  VIP
                </span>
              </div>

              <div class="mt-1 text-xs text-slate-500">
                Phone: {{ selectedRoom.current_reservation.guest.phone }} •
                Type: {{ prettyStatus(selectedRoom.current_reservation.booking_type) }} •
                Units: {{ selectedRoom.current_reservation.stay_units }}
              </div>

              <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div class="soft-sub rounded-2xl p-3">
                  <div class="text-slate-500">Check-in</div>
                  <div class="font-extrabold text-slate-900">
                    {{ formatDateTime(selectedRoom.current_reservation.check_in_at) }}
                  </div>
                </div>
                <div class="soft-sub rounded-2xl p-3">
                  <div class="text-slate-500">Check-out</div>
                  <div class="font-extrabold text-slate-900">
                    {{ formatDateTime(selectedRoom.current_reservation.check_out_at) }}
                  </div>
                </div>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <div class="text-sm text-slate-500">Total room charge</div>
                <div class="text-lg font-extrabold text-slate-900">
                  {{ money(selectedRoom.current_reservation.total_room_charge) }}
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="mb-2 text-sm font-extrabold text-slate-900">Housekeeping</div>
              <div class="text-sm text-slate-700">{{ housekeepingText(selectedRoom.housekeeping) }}</div>
              <div class="mt-2">
                <span class="chip" :class="housekeepingChipClass(selectedRoom.housekeeping)">
                  {{ housekeepingBadgeLabel(selectedRoom.housekeeping) }}
                </span>
              </div>
            </VaCardContent>
          </VaCard>

          <div class="flex justify-end gap-2">
            <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="detailsOpen = false">Close</VaButton>
            <VaButton color="primary" class="rounded-2xl font-extrabold" @click="goToPos(selectedRoom)">Go to POS</VaButton>
          </div>
        </div>
      </VaModal>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { roomsStatusData as rawRoomsStatusData } from "@/data/front/roomsStatusData"

const rooms = Array.isArray(rawRoomsStatusData) ? rawRoomsStatusData : rawRoomsStatusData?.rooms ?? []
const router = useRouter()

// filters
const q = ref("")
const statusFilter = ref(null)
const floorFilter = ref(null)
const chipKey = ref("all")

// modal
const detailsOpen = ref(false)
const selectedRoom = ref(null)

// options
const statusOptions = [
  { text: "Available", value: "available" },
  { text: "Occupied", value: "occupied" },
  { text: "Cleaning", value: "cleaning" },
  { text: "Maintenance", value: "maintenance" },
  { text: "Blocked", value: "blocked" },
]

const statusOptionsWithAll = computed(() => [{ text: "All", value: null }, ...statusOptions])

const floorOptions = computed(() => {
  const floors = Array.from(new Set(rooms.map((r) => Number(r.floor)))).filter((n) => !Number.isNaN(n))
  floors.sort((a, b) => a - b)
  return floors.map((f) => ({ text: `Floor ${f}`, value: f }))
})
const floorOptionsWithAll = computed(() => [{ text: "All", value: null }, ...floorOptions.value])

// format
function prettyStatus(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}
function formatDateTime(s) {
  if (!s) return "-"
  return String(s).replace("T", " ").slice(0, 16)
}

// money
function money(n) {
  const v = Number(n || 0)
  return `$${v.toFixed(2)}`
}

// chips
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
  chipKey.value = key
  if (key === "all") {
    statusFilter.value = null
  } else {
    statusFilter.value = key
  }
}

function resetFilters() {
  q.value = ""
  statusFilter.value = null
  floorFilter.value = null
  chipKey.value = "all"
}

// filtering
const filteredRooms = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return rooms.filter((r) => {
    if (statusFilter.value && r.status !== statusFilter.value) return false
    if (floorFilter.value != null && Number(r.floor) !== Number(floorFilter.value)) return false

    // chip rules (same as statusFilter but keep future extend)
    if (chipKey.value !== "all" && chipKey.value !== r.status) return false

    if (!keyword) return true

    const guestName = r.current_reservation
      ? `${r.current_reservation.guest.first_name} ${r.current_reservation.guest.last_name}`.toLowerCase()
      : ""
    const guestPhone = r.current_reservation ? String(r.current_reservation.guest.phone || "").toLowerCase() : ""
    const roomNo = String(r.room_number || "").toLowerCase()
    const typeName = String(r.room_type?.type_name || "").toLowerCase()

    return roomNo.includes(keyword) || typeName.includes(keyword) || guestName.includes(keyword) || guestPhone.includes(keyword)
  })
})

// house keeping
function housekeepingText(hk) {
  if (!hk || !hk.status) return "No housekeeping task"
  const who = hk.assigned_to ? ` • Assigned to ${hk.assigned_to}` : ""
  return `Status: ${prettyStatus(hk.status)}${who}`
}
function housekeepingBadgeLabel(hk) {
  return hk?.status ? prettyStatus(hk.status) : "No Task"
}

// chip classes
function statusChipClass(status) {
  if (status === "available") return "chip-good"
  if (status === "occupied") return "chip-info"
  if (status === "cleaning") return "chip-warn"
  if (status === "maintenance") return "chip-bad"
  if (status === "blocked") return "chip-neutral"
  return "chip-neutral"
}
function housekeepingChipClass(hk) {
  const s = hk?.status
  if (s === "completed") return "chip-good"
  if (s === "in_progress") return "chip-info"
  if (s === "pending") return "chip-warn"
  return "chip-neutral"
}

// modal actions
function openDetails(room) {
  selectedRoom.value = room
  detailsOpen.value = true
}

// navigation
function goToPos(room) {
  router.push({
    name: "admin.pos.index",
    query: { room_id: room.room_id, room_number: room.room_number },
  })
}

function action(label, room) {
  console.log(label, room)
  openDetails(room)
}
</script>

<style scoped>
/* soft shadow system: no border */
.soft-card {
  border: none !important;
  background: #fff !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
}
.soft-mini {
  border: none !important;
  background: rgba(2, 8, 23, 0.02) !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
}
.soft-sub {
  background: rgba(2, 8, 23, 0.02);
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06);
}

/* small chips */
.chip {
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
}
.chip-neutral {
  background: rgba(2, 8, 23, 0.06);
  color: #0f172a;
}
.chip-good {
  background: rgba(16, 185, 129, 0.14);
  color: #065f46;
}
.chip-warn {
  background: rgba(245, 158, 11, 0.18);
  color: #92400e;
}
.chip-bad {
  background: rgba(244, 63, 94, 0.14);
  color: #9f1239;
}
.chip-info {
  background: rgba(59, 130, 246, 0.14);
  color: #1d4ed8;
}

</style>
  