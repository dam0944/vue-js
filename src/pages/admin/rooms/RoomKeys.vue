<!-- src/pages/admin/rooms/RoomKeys.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">vpn_key</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Room Keys</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Manage keys by room • issue/return • status (available/issued/lost/damaged) • follow DB table <b>room_keys</b>.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            class="rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-200"
            type="button"
            @click="resetAll"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">refresh</span>
            Reset
          </button>

          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
            type="button"
            @click="goCreate"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">add</span>
            Add Key
          </button>
        </div>
      </div>

      <!-- Filters -->
      <section class="mt-4 rounded-2xl bg-white p-4">
        <div class="grid gap-3 lg:grid-cols-12">
          <div class="lg:col-span-6">
            <label class="mb-1 block text-xs font-bold text-slate-500">Search</label>
            <div class="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
              <span class="material-icons text-[18px] text-slate-500">search</span>
              <input
                v-model.trim="q"
                class="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search room number, key number, reservation id, notes..."
              />
              <button
                v-if="q"
                type="button"
                class="rounded-full bg-white px-3 py-1 text-xs font-extrabold hover:bg-slate-50"
                @click="q=''"
              >
                Clear
              </button>
            </div>
          </div>

          <div class="lg:col-span-6 grid gap-3 sm:grid-cols-3">
            <div>
              <label class="mb-1 block text-xs font-bold text-slate-500">Room</label>
              <select v-model="roomFilter" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                <option value="all">All rooms</option>
                <option v-for="r in rooms" :key="r.room_id" :value="r.room_id">
                  Room {{ r.room_number }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-xs font-bold text-slate-500">Key Type</label>
              <select v-model="typeFilter" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                <option value="all">All types</option>
                <option value="physical">Physical</option>
                <option value="card">Card</option>
                <option value="code">Code</option>
                <option value="digital">Digital</option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-xs font-bold text-slate-500">Status</label>
              <select v-model="statusFilter" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                <option value="all">All status</option>
                <option value="available">Available</option>
                <option value="issued">Issued</option>
                <option value="lost">Lost</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Chips -->
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="c in chips"
            :key="c.key"
            type="button"
            class="rounded-full px-4 py-2 text-xs font-extrabold"
            :class="activeChip === c.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'"
            @click="activeChip = c.key"
          >
            <span class="mr-2 inline-flex h-2 w-2 rounded-full" :class="c.dot"></span>
            {{ c.label }}
            <span class="ml-1 text-[11px]" :class="activeChip === c.key ? 'text-white/80' : 'text-slate-500'">
              ({{ c.count }})
            </span>
          </button>
        </div>
      </section>

      <!-- Main -->
      <div class="mt-4 grid gap-4 lg:grid-cols-12">
        <!-- Left Rooms -->
        <div class="lg:col-span-4">
          <div class="rounded-2xl bg-white p-4">
            <div class="flex items-center justify-between">
              <div class="text-sm font-extrabold text-slate-900">Rooms</div>
              <div class="text-xs text-slate-500">{{ rooms.length }} total</div>
            </div>

            <div class="mt-3 space-y-2">
              <button
                v-for="r in rooms"
                :key="r.room_id"
                type="button"
                class="w-full rounded-2xl p-3 text-left hover:bg-slate-50"
                :class="activeRoomId === r.room_id ? 'bg-slate-50' : 'bg-white'"
                @click="selectRoom(r.room_id)"
              >
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <div class="text-sm font-extrabold text-slate-900">Room {{ r.room_number }}</div>
                    <div class="mt-1 text-xs text-slate-500">
                      {{ countByRoom(r.room_id) }} key(s) • {{ issuedCountByRoom(r.room_id) }} issued
                    </div>
                  </div>
                  <span class="material-icons text-slate-400">chevron_right</span>
                </div>
              </button>
            </div>

            <button
              type="button"
              class="mt-3 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-200"
              @click="selectRoom(null)"
            >
              Show all rooms
            </button>
          </div>
        </div>

        <!-- Right Keys -->
        <div class="lg:col-span-8">
          <div class="rounded-2xl bg-white p-4">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div class="text-sm font-extrabold text-slate-900">{{ rightTitle }}</div>
                <div class="text-xs text-slate-500">
                  DB fields: key_id, room_id, key_number, key_type, status, issued_to_reservation_id, issued_at, returned_at, replacement_cost, notes.
                </div>
              </div>
            </div>

            <!-- Cards -->
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div
                v-for="k in filteredKeys"
                :key="k.key_id"
                class="rounded-2xl bg-slate-50 p-4"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="truncate text-sm font-extrabold text-slate-900">
                      Room {{ roomNumber(k.room_id) }} • {{ k.key_number }}
                    </div>
                    <div class="mt-1 text-xs text-slate-500">
                      Type: {{ pretty(k.key_type) }} • ID: {{ k.key_id }}
                    </div>
                  </div>
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="statusPill(k.status)">
                    {{ pretty(k.status) }}
                  </span>
                </div>

                <div class="mt-3 grid grid-cols-2 gap-2">
                  <div class="rounded-2xl bg-white p-3">
                    <div class="text-[10px] font-extrabold text-slate-500">Reservation</div>
                    <div class="mt-1 text-sm font-extrabold text-slate-900">{{ k.issued_to_reservation_id || "-" }}</div>
                  </div>
                  <div class="rounded-2xl bg-white p-3">
                    <div class="text-[10px] font-extrabold text-slate-500">Replacement</div>
                    <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(k.replacement_cost) }}</div>
                  </div>
                </div>

                <div class="mt-3 text-xs text-slate-500">
                  Issued: <span class="font-bold text-slate-700">{{ k.issued_at || "-" }}</span>
                </div>

                <div class="mt-3 flex items-center justify-between gap-2">
                  <button
                    class="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-100 disabled:opacity-40"
                    type="button"
                    :disabled="k.status === 'issued'"
                    @click="issueQuick(k.key_id)"
                  >
                    <span class="material-icons mr-1 align-middle text-[16px]">login</span>
                    Issue
                  </button>

                  <button
                    class="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-100 disabled:opacity-40"
                    type="button"
                    :disabled="k.status !== 'issued'"
                    @click="returnKey(k.key_id)"
                  >
                    <span class="material-icons mr-1 align-middle text-[16px]">logout</span>
                    Return
                  </button>

                  <button
                    class="rounded-full bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-slate-800"
                    type="button"
                    @click="goEdit(k.key_id)"
                  >
                    <span class="material-icons mr-1 align-middle text-[16px]">edit</span>
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div v-if="filteredKeys.length === 0" class="mt-6 rounded-2xl bg-slate-50 p-6 text-center">
              <div class="text-slate-900 font-extrabold">No keys found</div>
              <div class="mt-1 text-sm text-slate-500">Try another filter or add new key.</div>
              <button
                class="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
                type="button"
                @click="goCreate"
              >
                Add Key
              </button>
            </div>

            <div class="mt-4 text-[11px] text-slate-500">
              Demo only: static data. Later connect API CRUD to table <b>room_keys</b>.
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div
        v-if="toast"
        class="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-white"
      >
        <div class="flex items-start gap-2">
          <span class="material-icons text-[18px]">info</span>
          <div class="text-sm font-bold">{{ toast }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { roomKeysData } from "@/data/room/roomKeysData"

const router = useRouter()

function normalize(data) {
  const rooms = (data || []).map((r) => ({ room_id: r.room_id, room_number: r.room_number }))
  const keys = []
  for (const r of data || []) {
    for (const k of r.keys || []) {
      keys.push({
        key_id: k.key_id,
        room_id: r.room_id,
        key_number: k.key_number,
        key_type: k.key_type,
        status: k.status,
        issued_to_reservation_id: k.issued_to_reservation_id ?? null,
        issued_at: k.issued_at ?? null,
        returned_at: k.returned_at ?? null,
        replacement_cost: Number(k.replacement_cost ?? 0),
        notes: k.notes ?? "",
      })
    }
  }
  return { rooms, keys }
}

const initial = normalize(roomKeysData)
const rooms = ref(initial.rooms)
const keys = ref([...initial.keys])

// filters
const q = ref("")
const roomFilter = ref("all")
const typeFilter = ref("all")
const statusFilter = ref("all")
const activeChip = ref("all")
const activeRoomId = ref(null)

// toast
const toast = ref("")
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ""), 2200)
}

const chips = computed(() => {
  const count = (s) => keys.value.filter((x) => x.status === s).length
  return [
    { key: "all", label: "All", count: keys.value.length, dot: "bg-slate-400" },
    { key: "available", label: "Available", count: count("available"), dot: "bg-emerald-500" },
    { key: "issued", label: "Issued", count: count("issued"), dot: "bg-blue-500" },
    { key: "lost", label: "Lost", count: count("lost"), dot: "bg-rose-500" },
    { key: "damaged", label: "Damaged", count: count("damaged"), dot: "bg-amber-500" },
  ]
})

const rightTitle = computed(() => {
  if (!activeRoomId.value) return "Keys (All Rooms)"
  const r = rooms.value.find((x) => x.room_id === activeRoomId.value)
  return r ? `Room ${r.room_number} • Keys` : "Keys"
})

const filteredKeys = computed(() => {
  const kw = q.value.trim().toLowerCase()
  return keys.value
    .filter((k) => {
      if (activeRoomId.value && k.room_id !== activeRoomId.value) return false
      if (roomFilter.value !== "all" && k.room_id !== Number(roomFilter.value)) return false
      if (typeFilter.value !== "all" && k.key_type !== typeFilter.value) return false
      if (statusFilter.value !== "all" && k.status !== statusFilter.value) return false
      if (activeChip.value !== "all" && k.status !== activeChip.value) return false

      if (!kw) return true
      const blob = `${roomNumber(k.room_id)} ${k.key_number} ${k.key_type} ${k.status} ${k.issued_to_reservation_id || ""} ${k.notes || ""}`.toLowerCase()
      return blob.includes(kw)
    })
    .sort((a, b) => (String(roomNumber(a.room_id)) + a.key_number).localeCompare(String(roomNumber(b.room_id)) + b.key_number))
})

function selectRoom(id) {
  activeRoomId.value = id
}

function roomNumber(roomId) {
  return rooms.value.find((x) => x.room_id === roomId)?.room_number || "-"
}

function countByRoom(roomId) {
  return keys.value.filter((x) => x.room_id === roomId).length
}
function issuedCountByRoom(roomId) {
  return keys.value.filter((x) => x.room_id === roomId && x.status === "issued").length
}

function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}
function money(v) {
  const n = Number(v || 0)
  return `$${n.toFixed(2)}`
}
function statusPill(status) {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-800"
    case "issued":
      return "bg-blue-100 text-blue-800"
    case "lost":
      return "bg-rose-100 text-rose-800"
    case "damaged":
      return "bg-amber-100 text-amber-800"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

function nowStamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// quick issue/return (still follows DB columns)
function issueQuick(keyId) {
  keys.value = keys.value.map((x) => {
    if (x.key_id !== keyId) return x
    return {
      ...x,
      status: "issued",
      issued_at: x.issued_at || nowStamp(),
      returned_at: null,
    }
  })
  showToast("Issued (demo). Use Edit page to set reservation id.")
}

function returnKey(keyId) {
  keys.value = keys.value.map((x) => {
    if (x.key_id !== keyId) return x
    return {
      ...x,
      status: "available",
      returned_at: nowStamp(),
      issued_to_reservation_id: null,
    }
  })
  showToast("Returned → Available.")
}

function resetAll() {
  const again = normalize(roomKeysData)
  rooms.value = again.rooms
  keys.value = [...again.keys]
  q.value = ""
  roomFilter.value = "all"
  typeFilter.value = "all"
  statusFilter.value = "all"
  activeChip.value = "all"
  activeRoomId.value = null
  showToast("Reset done.")
}

function goCreate() {
  router.push({ path: "/rooms/keys/create" })
}
function goEdit(keyId) {
  router.push({ path: `/rooms/keys/edit/${keyId}` })
}
</script>
