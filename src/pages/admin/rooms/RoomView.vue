<!-- src/pages/admin/rooms/RoomList.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">Rooms</h1>
        <p class="text-sm text-slate-500">Manage all rooms in your guesthouse.</p>
      </div>
      <router-link
        to="/admin/rooms/create"
        class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
      >
        <span class="material-icons text-[18px]">add</span>
        Create Room
      </router-link>
    </div>

    <!-- Header -->
    <div class="mx-auto">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-white">
            <span class="material-icons text-[22px]">bed</span>
          </div>
          <div>
            <h1 class="text-lg font-extrabold text-slate-900 sm:text-xl">Rooms</h1>
            <p class="text-sm text-slate-500">
              Room list with photos, status, housekeeping, and quick actions.
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <span class="material-icons text-[18px] text-slate-500">search</span>
            <input
              v-model.trim="q"
              type="text"
              placeholder="Search room / type / building..."
              class="w-full bg-transparent text-sm text-slate-900 outline-none sm:w-[280px]"
            />
          </div>

          <select
            v-model="statusFilter"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none sm:w-[180px]"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="blocked">Blocked</option>
          </select>

          <select
            v-model="floorFilter"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none sm:w-[150px]"
          >
            <option value="all">All Floors</option>
            <option v-for="f in floorOptions" :key="f" :value="f">Floor {{ f }}</option>
          </select>
        </div>
      </div>

      <!-- Quick chips -->
      <div class="mt-4 flex flex-wrap gap-2">
        <button
          v-for="chip in chips"
          :key="chip.key"
          @click="applyChip(chip.key)"
          class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
        >
          <span class="mr-2 inline-flex h-2 w-2 rounded-full" :class="chip.dot"></span>
          {{ chip.label }} <span class="ml-1 text-slate-900">({{ chip.count }})</span>
        </button>

        <button
          @click="resetFilters"
          class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div class="mx-auto mt-5 max-w-6xl">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="room in paginated"
          :key="room.room_id"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white"
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
              <span
                class="rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase"
                :class="statusPill(room.status)"
              >
                {{ prettyStatus(room.status) }}
              </span>
            </div>

            <div class="absolute right-3 top-3">
              <button
                class="grid h-9 w-9 place-items-center rounded-xl bg-white/90 hover:bg-white"
                @click.stop="open(room)"
                title="Details"
              >
                <span class="material-icons text-[18px] text-slate-800">open_in_new</span>
              </button>
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
            <div class="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <div class="flex items-center gap-2">
                <span class="material-icons text-[18px] text-slate-500">cleaning_services</span>
                <div>
                  <div class="text-xs font-extrabold text-slate-900">Housekeeping</div>
                  <div class="text-[11px] text-slate-500">
                    {{ hkText(room.housekeeping) }}
                  </div>
                </div>
              </div>

              <span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="hkPill(room.housekeeping)">
                {{ hkLabel(room.housekeeping) }}
              </span>
            </div>

            <!-- Current guest (optional) -->
            <div v-if="room.current_reservation" class="mt-3 rounded-xl bg-white">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-[18px] text-slate-500">person</span>
                  <div class="text-xs font-bold text-slate-900">
                    {{ guestName(room.current_reservation?.guest) }}
                  </div>
                </div>
                <span
                  v-if="room.current_reservation?.guest?.vip_status"
                  class="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700"
                >
                  VIP
                </span>
              </div>
              <div class="mt-1 text-[11px] text-slate-500">
                {{ room.current_reservation?.guest?.phone || "-" }}
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-3 grid grid-cols-2 gap-2">
              <button
                class="rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:bg-slate-800"
                @click="open(room)"
              >
                Details
              </button>
              <button
                class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
                @click="goToStatus(room)"
              >
                Status Board
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-if="filtered.length === 0"
        class="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center"
      >
        <div class="text-slate-900 font-extrabold">No rooms found</div>
        <div class="mt-1 text-sm text-slate-500">Try another keyword or clear filters.</div>
        <button
          class="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold hover:bg-slate-50"
          @click="resetFilters"
        >
          Reset
        </button>
      </div>

      <!-- Pagination -->
      <div
        v-if="filtered.length > 0"
        class="mx-auto mt-4 flex max-w-6xl items-center justify-between"
      >
        <button
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 disabled:opacity-40"
          :disabled="page === 1"
          @click="page--"
        >
          Prev
        </button>

        <div class="text-xs text-slate-500">
          Page <span class="font-bold text-slate-900">{{ page }}</span> of
          <span class="font-bold text-slate-900">{{ totalPages }}</span>
          • <span class="font-bold text-slate-900">{{ filtered.length }}</span> rooms
        </div>

        <button
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 disabled:opacity-40"
          :disabled="page === totalPages"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Drawer -->
    <div v-if="drawer.open" class="fixed inset-0 z-40" @click="drawer.open = false">
      <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <aside
      v-if="drawer.open"
      class="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white"
    >
      <div class="flex items-center justify-between px-4 py-4">
        <div class="flex items-center gap-2">
          <span class="material-icons text-slate-700">meeting_room</span>
          <div class="font-extrabold text-slate-900">
            Room {{ drawer.room?.room_number }}
          </div>
        </div>
        <button class="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100" @click="drawer.open=false">
          <span class="material-icons text-slate-700">close</span>
        </button>
      </div>

      <div v-if="drawer.room" class="h-[calc(100vh-72px)] overflow-y-auto px-4 pb-6">
        <img :src="primaryImage(drawer.room)" class="h-40 w-full rounded-2xl object-cover" alt="room" />

        <div class="mt-4 flex items-center justify-between">
          <div>
            <div class="text-sm font-extrabold text-slate-900">
              {{ drawer.room.room_type?.type_name || "-" }} • {{ drawer.room.room_type?.bed_count ?? "-" }} bed(s)
            </div>
            <div class="mt-1 text-xs text-slate-500">
              Floor {{ drawer.room.floor }} • {{ drawer.room.building || "-" }}
            </div>
          </div>
          <span class="rounded-full px-3 py-1 text-[10px] font-extrabold uppercase" :class="statusPill(drawer.room.status)">
            {{ prettyStatus(drawer.room.status) }}
          </span>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2">
          <div class="rounded-2xl bg-slate-50 p-3">
            <div class="text-[10px] font-extrabold text-slate-500">Night</div>
            <div class="text-sm font-extrabold text-slate-900">{{ money(drawer.room.room_type?.nightly_price) }}</div>
          </div>
          <div class="rounded-2xl bg-slate-50 p-3">
            <div class="text-[10px] font-extrabold text-slate-500">Hour</div>
            <div class="text-sm font-extrabold text-slate-900">{{ money(drawer.room.room_type?.hourly_price) }}</div>
          </div>
        </div>

        <div class="mt-4 rounded-2xl bg-slate-50 p-3">
          <div class="flex items-center justify-between">
            <div class="text-xs font-extrabold text-slate-900">Housekeeping</div>
            <span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="hkPill(drawer.room.housekeeping)">
              {{ hkLabel(drawer.room.housekeeping) }}
            </span>
          </div>
          <div class="mt-1 text-[11px] text-slate-500">
            {{ hkText(drawer.room.housekeeping) }}
          </div>
        </div>

        <div class="mt-4 rounded-2xl bg-white">
          <div class="text-xs font-extrabold text-slate-900">Current Guest</div>

          <div v-if="drawer.room.current_reservation" class="mt-2 rounded-2xl bg-slate-50 p-3">
            <div class="flex items-center justify-between">
              <div class="text-sm font-extrabold text-slate-900">
                {{ guestName(drawer.room.current_reservation.guest) }}
              </div>
              <span
                v-if="drawer.room.current_reservation?.guest?.vip_status"
                class="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700"
              >
                VIP
              </span>
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
          <button class="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-slate-800" @click="goToPos(drawer.room)">
            POS / Checkout
          </button>
          <button class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-800 hover:bg-slate-200" @click="drawer.open=false">
            Close
          </button>
        </div>

        <div v-if="drawer.room.images?.length" class="mt-6">
          <div class="text-xs font-extrabold text-slate-900">More photos</div>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <button
              v-for="(img, idx) in drawer.room.images"
              :key="idx"
              class="overflow-hidden rounded-xl"
              @click="drawerPhoto = img.image_url"
            >
              <img :src="img.image_url" class="h-20 w-full object-cover" alt="room" />
            </button>
          </div>

          <div v-if="drawerPhoto" class="mt-3">
            <img :src="drawerPhoto" class="h-44 w-full rounded-2xl object-cover" alt="preview" />
          </div>
        </div>
      </div>
    </aside>
  </div>
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

const floorOptions = computed(() => {
  const s = new Set(roomsListData.map((r) => r.floor).filter((x) => x != null))
  return Array.from(s).sort((a, b) => a - b)
})

const filtered = computed(() => {
  const kw = q.value.trim().toLowerCase()

  return roomsListData.filter((r) => {
    if (statusFilter.value !== "all" && r.status !== statusFilter.value) return false
    if (floorFilter.value !== "all" && r.floor !== floorFilter.value) return false

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

watch([q, statusFilter, floorFilter], () => {
  page.value = 1
})

const chips = computed(() => {
  const count = (s) => roomsListData.filter((r) => r.status === s).length
  return [
    { key: "all", label: "All", count: roomsListData.length, dot: "bg-slate-400" },
    { key: "available", label: "Available", count: count("available"), dot: "bg-emerald-500" },
    { key: "occupied", label: "Occupied", count: count("occupied"), dot: "bg-blue-500" },
    { key: "reserved", label: "Reserved", count: count("reserved"), dot: "bg-violet-500" },
    { key: "cleaning", label: "Cleaning", count: count("cleaning"), dot: "bg-amber-500" },
    { key: "maintenance", label: "Maintenance", count: count("maintenance"), dot: "bg-rose-500" },
    { key: "blocked", label: "Blocked", count: count("blocked"), dot: "bg-slate-700" },
  ]
})

function applyChip(key) {
  statusFilter.value = key === "all" ? "all" : key
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
  // optional route (if you have it)
  router.push({ path: "/admin/frontdesk/rooms-status", query: { room_id: room.room_id } })
}

function goToPos(room) {
  router.push({ path: "/admin/pos", query: { room_id: room.room_id, room_number: room.room_number } })
}

function money(v) {
  const n = Number(v || 0)
  return `$${n.toFixed(2)}`
}

function prettyStatus(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}

function statusPill(status) {
  switch (status) {
    case "available":
      return "bg-emerald-50 text-emerald-700"
    case "occupied":
      return "bg-blue-50 text-blue-700"
    case "reserved":
      return "bg-violet-50 text-violet-700"
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

function hkLabel(hk) {
  const s = hk?.status
  if (!s) return "No Task"
  return prettyStatus(s)
}

function hkPill(hk) {
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
