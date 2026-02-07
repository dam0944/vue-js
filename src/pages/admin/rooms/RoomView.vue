<!-- src/pages/admin/rooms/RoomList.vue -->
<template>
  <VaPageLayout class="bg-slate-50">
    <VaPageLayoutContent class="p-4 sm:p-6">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-white">
            <VaIcon name="bed" size="22px" />
          </div>

          <div>
            <h1 class="text-lg font-extrabold text-slate-900 sm:text-xl">Rooms</h1>
            <p class="text-sm text-slate-500">
              Room list with photos, status, housekeeping, and quick actions.
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <VaInput
            v-model="q"
            class="w-full sm:w-[320px]"
            placeholder="Search room / type / building..."
            clearable
            preset="solid"
            color="primary"
          >
            <template #prependInner>
              <VaIcon name="search" color="secondary" />
            </template>
          </VaInput>

          <VaSelect
            v-model="statusFilter"
            class="w-full sm:w-[190px]"
            :options="statusOptions"
            text-by="text"
            value-by="value"
            placeholder="Status"
            preset="solid"
          />

          <VaSelect
            v-model="floorFilter"
            class="w-full sm:w-[170px]"
            :options="floorOptions"
            text-by="text"
            value-by="value"
            placeholder="Floor"
            preset="solid"
          />

          <VaButton
            color="primary"
            preset="primary"
            icon="add"
            :to="{ path: '/admin/rooms/create' }"
          >
            Create Room
          </VaButton>
        </div>
      </div>

      <!-- Quick chips -->
      <div class="mt-4 flex flex-wrap gap-2">
        <VaChip
          v-for="chip in chips"
          :key="chip.key"
          square
          size="small"
          class="cursor-pointer"
          :color="chipColor(chip.key)"
          :outline="statusFilter !== chip.key"
          @click="applyChip(chip.key)"
        >
          {{ chip.label }} ({{ chip.count }})
        </VaChip>

        <VaButton preset="secondary" size="small" icon="restart_alt" @click="resetFilters">
          Reset
        </VaButton>
      </div>

      <!-- Grid -->
      <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <VaCard
          v-for="room in paginated"
          :key="room.room_id"
          class="room-card overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <!-- Photo -->
          <div class="relative">
            <img
              :src="primaryImage(room)"
              class="h-36 w-full object-cover"
              alt="room"
              loading="lazy"
            />

            <div class="absolute left-3 top-3">
              <VaChip size="small" square :color="statusChipColor(room.status)">
                {{ prettyStatus(room.status) }}
              </VaChip>
            </div>

            <div class="absolute right-3 top-3">
              <VaButton
                preset="secondary"
                size="small"
                icon="open_in_new"
                color="secondary"
                class="bg-white/90"
                @click.stop="open(room)"
              />
            </div>
          </div>

          <!-- Content -->
          <div class="p-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="text-sm font-extrabold text-slate-900">
                  Room {{ room.room_number }}
                </div>
                <div class="mt-0.5 text-xs text-slate-500">
                  Floor {{ room.floor }} • {{ room.building || "-" }}
                </div>
              </div>

              <div class="text-right">
                <div class="text-[10px] font-bold text-slate-500">Night</div>
                <div class="text-sm font-extrabold text-slate-900">
                  {{ money(room.room_type?.nightly_price) }}
                </div>
              </div>
            </div>

            <div class="mt-2 text-xs text-slate-600">
              <span class="font-bold text-slate-900">{{ room.room_type?.type_name || "-" }}</span>
              • {{ room.room_type?.bed_count ?? "-" }} bed(s)
            </div>

            <!-- Housekeeping -->
            <div class="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 border border-slate-200/60">
              <div class="flex items-center gap-2">
                <VaIcon name="cleaning_services" size="18px" color="secondary" />
                <div>
                  <div class="text-xs font-extrabold text-slate-900">Housekeeping</div>
                  <div class="text-[11px] text-slate-500">
                    {{ hkText(room.housekeeping) }}
                  </div>
                </div>
              </div>

              <VaChip size="small" square :color="hkChipColor(room.housekeeping)">
                {{ hkLabel(room.housekeeping) }}
              </VaChip>
            </div>

            <!-- Current guest -->
            <div v-if="room.current_reservation" class="mt-3 rounded-xl border border-slate-200/60 bg-white p-2.5">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <VaIcon name="person" size="18px" color="secondary" />
                  <div class="text-xs font-bold text-slate-900">
                    {{ guestName(room.current_reservation?.guest) }}
                  </div>
                </div>

                <VaChip
                  v-if="room.current_reservation?.guest?.vip_status"
                  size="small"
                  square
                  color="warning"
                  outline
                >
                  VIP
                </VaChip>
              </div>

              <div class="mt-1 text-[11px] text-slate-500">
                {{ room.current_reservation?.guest?.phone || "-" }}
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-3 grid grid-cols-2 gap-2">
              <VaButton color="primary" preset="primary" size="small" @click="open(room)">
                Details
              </VaButton>

              <VaButton preset="secondary" size="small" @click="goToStatus(room)">
                Status Board
              </VaButton>
            </div>
          </div>
        </VaCard>
      </div>

      <!-- Empty -->
      <VaAlert v-if="filtered.length === 0" class="mt-6" color="secondary" outline>
        <div class="font-extrabold text-slate-900">No rooms found</div>
        <div class="text-sm text-slate-500 mt-1">Try another keyword or clear filters.</div>
        <VaButton class="mt-3" preset="secondary" size="small" @click="resetFilters">
          Reset
        </VaButton>
      </VaAlert>

      <!-- Pagination -->
      <div v-if="filtered.length > 0" class="mt-4 flex items-center justify-between">
        <VaButton preset="secondary" size="small" :disabled="page === 1" @click="page--">
          Prev
        </VaButton>

        <div class="text-xs text-slate-500">
          Page <span class="font-bold text-slate-900">{{ page }}</span> of
          <span class="font-bold text-slate-900">{{ totalPages }}</span>
          • <span class="font-bold text-slate-900">{{ filtered.length }}</span> rooms
        </div>

        <VaButton preset="secondary" size="small" :disabled="page === totalPages" @click="page++">
          Next
        </VaButton>
      </div>

      <!-- Drawer (Vuestic VaModal) -->
      <VaModal v-model="drawer.open" size="large" hide-default-actions>
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <VaIcon name="meeting_room" />
              <div class="font-extrabold">Room {{ drawer.room?.room_number }}</div>
            </div>

            <VaButton preset="secondary" icon="close" @click="drawer.open = false" />
          </div>
        </template>

        <div v-if="drawer.room" class="p-1">
          <img :src="primaryImage(drawer.room)" class="h-44 w-full rounded-2xl object-cover" alt="room" />

          <div class="mt-4 flex items-center justify-between">
            <div>
              <div class="text-sm font-extrabold text-slate-900">
                {{ drawer.room.room_type?.type_name || "-" }}
                • {{ drawer.room.room_type?.bed_count ?? "-" }} bed(s)
              </div>
              <div class="mt-1 text-xs text-slate-500">
                Floor {{ drawer.room.floor }} • {{ drawer.room.building || "-" }}
              </div>
            </div>

            <VaChip size="small" square :color="statusChipColor(drawer.room.status)">
              {{ prettyStatus(drawer.room.status) }}
            </VaChip>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-2">
            <VaCard class="rounded-2xl border border-slate-200 bg-slate-50" :shadow="false">
              <div class="p-3">
                <div class="text-[10px] font-extrabold text-slate-500">Night</div>
                <div class="text-sm font-extrabold text-slate-900">
                  {{ money(drawer.room.room_type?.nightly_price) }}
                </div>
              </div>
            </VaCard>

            <VaCard class="rounded-2xl border border-slate-200 bg-slate-50" :shadow="false">
              <div class="p-3">
                <div class="text-[10px] font-extrabold text-slate-500">Hour</div>
                <div class="text-sm font-extrabold text-slate-900">
                  {{ money(drawer.room.room_type?.hourly_price) }}
                </div>
              </div>
            </VaCard>
          </div>

          <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div class="flex items-center justify-between">
              <div class="text-xs font-extrabold text-slate-900">Housekeeping</div>
              <VaChip size="small" square :color="hkChipColor(drawer.room.housekeeping)">
                {{ hkLabel(drawer.room.housekeeping) }}
              </VaChip>
            </div>
            <div class="mt-1 text-[11px] text-slate-500">
              {{ hkText(drawer.room.housekeeping) }}
            </div>
          </div>

          <div class="mt-4">
            <div class="text-xs font-extrabold text-slate-900">Current Guest</div>

            <div v-if="drawer.room.current_reservation" class="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div class="flex items-center justify-between">
                <div class="text-sm font-extrabold text-slate-900">
                  {{ guestName(drawer.room.current_reservation.guest) }}
                </div>
                <VaChip
                  v-if="drawer.room.current_reservation?.guest?.vip_status"
                  size="small"
                  square
                  color="warning"
                  outline
                >
                  VIP
                </VaChip>
              </div>

              <div class="mt-1 text-xs text-slate-600">
                {{ drawer.room.current_reservation?.guest?.phone || "-" }}
              </div>
            </div>

            <div v-else class="mt-2 text-sm text-slate-500">
              No current reservation.
            </div>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-2">
            <VaButton color="primary" preset="primary" @click="goToPos(drawer.room)">
              POS / Checkout
            </VaButton>
            <VaButton preset="secondary" @click="drawer.open = false">
              Close
            </VaButton>
          </div>

          <div v-if="drawer.room.images?.length" class="mt-6">
            <div class="text-xs font-extrabold text-slate-900">More photos</div>

            <div class="mt-2 grid grid-cols-3 gap-2">
              <button
                v-for="(img, idx) in drawer.room.images"
                :key="idx"
                type="button"
                class="overflow-hidden rounded-xl ring-1 ring-slate-200 hover:ring-slate-300 transition"
                @click="drawerPhoto = img.image_url"
              >
                <img :src="img.image_url" class="h-20 w-full object-cover" alt="room" />
              </button>
            </div>

            <div v-if="drawerPhoto" class="mt-3">
              <img :src="drawerPhoto" class="h-52 w-full rounded-2xl object-cover" alt="preview" />
            </div>
          </div>
        </div>
      </VaModal>
    </VaPageLayoutContent>
  </VaPageLayout>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { roomsListData } from "@/data/room/room_list"

const router = useRouter()

const q = ref("")
const statusFilter = ref("all")
const floorFilter = ref("all")

const page = ref(1)
const pageSize = 12

const drawer = reactive({ open: false, room: null })
const drawerPhoto = ref(null)

/* Options */
const statusOptions = [
  { text: "All Status", value: "all" },
  { text: "Available", value: "available" },
  { text: "Occupied", value: "occupied" },
  { text: "Reserved", value: "reserved" },
  { text: "Cleaning", value: "cleaning" },
  { text: "Maintenance", value: "maintenance" },
  { text: "Blocked", value: "blocked" },
]

const floorOptions = computed(() => {
  const s = new Set(roomsListData.map(r => r.floor).filter(x => x != null))
  const floors = Array.from(s).sort((a, b) => a - b)
  return [{ text: "All Floors", value: "all" }, ...floors.map(f => ({ text: `Floor ${f}`, value: f }))]
})

/* Filtering */
const filtered = computed(() => {
  const kw = String(q.value || "").trim().toLowerCase()

  return roomsListData.filter((r) => {
    if (statusFilter.value !== "all" && r.status !== statusFilter.value) return false
    if (floorFilter.value !== "all" && Number(r.floor) !== Number(floorFilter.value)) return false

    if (!kw) return true
    const roomNo = String(r.room_number || "").toLowerCase()
    const type = String(r.room_type?.type_name || "").toLowerCase()
    const building = String(r.building || "").toLowerCase()
    return roomNo.includes(kw) || type.includes(kw) || building.includes(kw)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

watch([q, statusFilter, floorFilter], () => (page.value = 1))

/* Chips */
const chips = computed(() => {
  const count = (s) => roomsListData.filter((r) => r.status === s).length
  return [
    { key: "all", label: "All", count: roomsListData.length },
    { key: "available", label: "Available", count: count("available") },
    { key: "occupied", label: "Occupied", count: count("occupied") },
    { key: "reserved", label: "Reserved", count: count("reserved") },
    { key: "cleaning", label: "Cleaning", count: count("cleaning") },
    { key: "maintenance", label: "Maintenance", count: count("maintenance") },
    { key: "blocked", label: "Blocked", count: count("blocked") },
  ]
})

function chipColor(key) {
  if (key === "available") return "success"
  if (key === "occupied") return "danger"
  if (key === "reserved") return "info"
  if (key === "cleaning") return "warning"
  if (key === "maintenance") return "danger"
  if (key === "blocked") return "secondary"
  return "secondary"
}

/* Actions */
function applyChip(key) {
  statusFilter.value = key
}
function resetFilters() {
  q.value = ""
  statusFilter.value = "all"
  floorFilter.value = "all"
  page.value = 1
}
function open(room) {
  drawer.room = room
  drawer.open = true
  drawerPhoto.value = primaryImage(room)
}
function goToStatus(room) {
  router.push({ path: "/admin/frontdesk/rooms-status", query: { room_id: room.room_id } })
}
function goToPos(room) {
  router.push({ path: "/admin/pos", query: { room_id: room.room_id, room_number: room.room_number } })
}

/* UI helpers */
function money(v) {
  const n = Number(v || 0)
  return `$${n.toFixed(2)}`
}
function prettyStatus(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}
function statusChipColor(status) {
  if (status === "available") return "success"
  if (status === "occupied") return "danger"
  if (status === "reserved") return "info"
  if (status === "cleaning") return "warning"
  if (status === "maintenance") return "danger"
  if (status === "blocked") return "secondary"
  return "secondary"
}
function hkLabel(hk) {
  const s = hk?.status
  if (!s) return "No Task"
  return prettyStatus(s)
}
function hkChipColor(hk) {
  const s = hk?.status
  if (s === "completed") return "success"
  if (s === "in_progress") return "info"
  if (s === "pending") return "warning"
  return "secondary"
}
function hkText(hk) {
  if (!hk?.status) return "No housekeeping task"
  if (hk?.last_cleaned_at) return `Last cleaned: ${String(hk.last_cleaned_at).slice(0, 16)}`
  return `Status: ${prettyStatus(hk.status)}`
}
function primaryImage(room) {
  const primary = room.images?.find((x) => x.is_primary)?.image_url
  const fallback = room.images?.[0]?.image_url
  return primary || fallback || "https://via.placeholder.com/600x400?text=Room"
}
function guestName(g) {
  if (!g) return "-"
  return `${g.first_name || ""} ${g.last_name || ""}`.trim() || "-"
}
</script>

<style scoped>
/* Minimal shadows: no heavy box-shadow, only slight hover ring */
.room-card {
  box-shadow: none !important;
  transition: transform 140ms ease, border-color 140ms ease;
}
.room-card:hover {
  transform: translateY(-1px);
  border-color: rgba(2, 6, 23, 0.14);
}
</style>