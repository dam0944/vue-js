<!-- src/pages/admin/rooms/RoomKeys.vue
  ✅ Vuestic UI version
  ✅ DB-aligned fields (room_keys):
    key_id, room_id, key_number, key_type, status,
    issued_to_reservation_id, issued_at, returned_at, replacement_cost, notes
  ✅ Static demo data normalizer supports legacy grouped data: roomKeysData = [{room_id, room_number, keys:[...]}]
-->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto w-full">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <VaIcon name="vpn_key" color="secondary" />
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Room Keys</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Manage keys by room • issue/return • status (available/issued/lost/damaged) • DB table <b>room_keys</b>.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="resetAll">
            <VaIcon name="refresh" class="mr-1" />
            Reset
          </VaButton>

          <VaButton to="/admin/rooms/keys/create" color="primary" class="rounded-2xl font-extrabold">
            <VaIcon name="add" class="mr-1" />
            Add Key
          </VaButton>
        </div>
      </div>

      <!-- Filters -->
      <VaCard class="soft-card mt-4 rounded-2xl">
        <VaCardContent class="p-4">
          <div class="grid gap-3 lg:grid-cols-12">
            <div class="lg:col-span-6">
              <VaInput
                v-model.trim="q"
                class="ctrl"
                label="Search"
                placeholder="Search room, key number, reservation id, notes..."
                clearable
              >
                <template #prependInner>
                  <VaIcon name="search" color="secondary" />
                </template>
              </VaInput>
            </div>

            <div class="lg:col-span-6 grid gap-3 sm:grid-cols-3">
              <VaSelect
                v-model="roomFilter"
                class="ctrl"
                label="Room"
                :options="roomOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />

              <VaSelect
                v-model="typeFilter"
                class="ctrl"
                label="Key Type"
                :options="typeOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />

              <VaSelect
                v-model="statusFilter"
                class="ctrl"
                label="Status"
                :options="statusOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />
            </div>
          </div>

          <!-- Chips -->
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="c in chips"
              :key="c.key"
              type="button"
              class="chip"
              :class="activeChip === c.key ? 'chip--active' : 'chip--idle'"
              @click="activeChip = c.key"
            >
              <span class="mr-2 inline-flex h-2 w-2 rounded-full" :class="c.dot"></span>
              {{ c.label }}
              <span class="ml-1 text-[11px]" :class="activeChip === c.key ? 'text-white/80' : 'text-slate-500'">
                ({{ c.count }})
              </span>
            </button>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Main -->
      <div class="mt-4 grid gap-4 lg:grid-cols-12">
        <!-- Left Rooms -->
        <div class="lg:col-span-4">
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
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
                    <VaIcon name="chevron_right" color="secondary" />
                  </div>
                </button>
              </div>

              <VaButton preset="secondary" class="mt-3 w-full rounded-2xl font-extrabold" @click="selectRoom(null)">
                Show all rooms
              </VaButton>
            </VaCardContent>
          </VaCard>
        </div>

        <!-- Right Keys -->
        <div class="lg:col-span-8">
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">{{ rightTitle }}</div>
                  <div class="text-xs text-slate-500">
                    DB fields: key_id, room_id, key_number, key_type, status, issued_to_reservation_id, issued_at,
                    returned_at, replacement_cost, notes.
                  </div>
                </div>
              </div>

              <!-- Cards -->
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div v-for="k in filteredKeys" :key="k.key_id" class="rounded-2xl bg-slate-50 p-4">
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
                      <div class="mt-1 text-sm font-extrabold text-slate-900">
                        {{ k.issued_to_reservation_id || "-" }}
                      </div>
                    </div>

                    <div class="rounded-2xl bg-white p-3">
                      <div class="text-[10px] font-extrabold text-slate-500">Replacement</div>
                      <div class="mt-1 text-sm font-extrabold text-slate-900">
                        {{ money(k.replacement_cost) }}
                      </div>
                    </div>
                  </div>

                  <div class="mt-3 text-xs text-slate-500">
                    Issued:
                    <span class="font-bold text-slate-700">{{ k.issued_at || "-" }}</span>
                    <span class="mx-2 text-slate-300">•</span>
                    Returned:
                    <span class="font-bold text-slate-700">{{ k.returned_at || "-" }}</span>
                  </div>

                  <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <VaButton
                      preset="secondary"
                      size="small"
                      class="rounded-2xl font-extrabold"
                      :disabled="k.status === 'issued'"
                      @click="issueQuick(k.key_id)"
                    >
                      <VaIcon name="login" class="mr-1" />
                      Issue
                    </VaButton>

                    <VaButton
                      preset="secondary"
                      size="small"
                      class="rounded-2xl font-extrabold"
                      :disabled="k.status !== 'issued'"
                      @click="returnKey(k.key_id)"
                    >
                      <VaIcon name="logout" class="mr-1" />
                      Return
                    </VaButton>

                    <VaButton color="primary" size="small" class="rounded-2xl font-extrabold" @click="goEdit(k.key_id)">
                      <VaIcon name="edit" class="mr-1" />
                      Edit
                    </VaButton>
                  </div>

                  <div v-if="k.notes" class="mt-3 text-xs text-slate-600">
                    <span class="font-extrabold text-slate-900">Notes:</span> {{ k.notes }}
                  </div>
                </div>
              </div>

              <div v-if="filteredKeys.length === 0" class="mt-6 rounded-2xl bg-slate-50 p-6 text-center">
                <div class="text-slate-900 font-extrabold">No keys found</div>
                <div class="mt-1 text-sm text-slate-500">Try another filter or add new key.</div>
                <VaButton color="primary" class="mt-4 rounded-2xl font-extrabold" @click="goCreate">Add Key</VaButton>
              </div>

              <div class="mt-4 text-[11px] text-slate-500">
                Demo only: static data. Later connect API CRUD to table <b>room_keys</b>.
              </div>
            </VaCardContent>
          </VaCard>
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

/**
 * Accept legacy grouped static data:
 * roomKeysData = [
 *   { room_id, room_number, keys: [ { key_id, key_number, key_type, status, issued_to_reservation_id, issued_at, returned_at, replacement_cost, notes } ] }
 * ]
 *
 * Output = DB-aligned flat rows (room_keys)
 */
function normalize(data) {
  const rooms = (data || []).map((r) => ({ room_id: Number(r.room_id), room_number: String(r.room_number) }))
  const keys = []

  for (const r of data || []) {
    for (const k of r.keys || []) {
      keys.push({
        key_id: Number(k.key_id),
        room_id: Number(r.room_id),
        key_number: String(k.key_number || ""),
        key_type: String(k.key_type || "physical"), // physical|card|code|digital
        status: String(k.status || "available"), // available|issued|lost|damaged
        issued_to_reservation_id: k.issued_to_reservation_id ?? null,
        issued_at: k.issued_at ?? null,
        returned_at: k.returned_at ?? null,
        replacement_cost: Number(k.replacement_cost ?? 0),
        notes: String(k.notes ?? ""),
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

// select options (Vuestic)
const roomOptions = computed(() => [{ text: "All rooms", value: "all" }, ...rooms.value.map((r) => ({ text: `Room ${r.room_number}`, value: r.room_id }))])

const typeOptions = [
  { text: "All types", value: "all" },
  { text: "Physical", value: "physical" },
  { text: "Card", value: "card" },
  { text: "Code", value: "code" },
  { text: "Digital", value: "digital" },
]

const statusOptions = [
  { text: "All status", value: "all" },
  { text: "Available", value: "available" },
  { text: "Issued", value: "issued" },
  { text: "Lost", value: "lost" },
  { text: "Damaged", value: "damaged" },
]

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
      // left room select
      if (activeRoomId.value && k.room_id !== activeRoomId.value) return false

      // dropdowns
      if (roomFilter.value !== "all" && k.room_id !== Number(roomFilter.value)) return false
      if (typeFilter.value !== "all" && k.key_type !== typeFilter.value) return false
      if (statusFilter.value !== "all" && k.status !== statusFilter.value) return false

      // chip
      if (activeChip.value !== "all" && k.status !== activeChip.value) return false

      // search
      if (!kw) return true
      const blob = `${roomNumber(k.room_id)} ${k.key_number} ${k.key_type} ${k.status} ${k.issued_to_reservation_id || ""} ${k.notes || ""}`.toLowerCase()
      return blob.includes(kw)
    })
    .sort((a, b) => {
      const aa = `${roomNumber(a.room_id)} ${a.key_number}`.toLowerCase()
      const bb = `${roomNumber(b.room_id)} ${b.key_number}`.toLowerCase()
      return aa.localeCompare(bb)
    })
})

function selectRoom(id) {
  activeRoomId.value = id
}

function roomNumber(roomId) {
  return rooms.value.find((x) => x.room_id === Number(roomId))?.room_number || "-"
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

/**
 * Demo issue/return (still follows DB columns)
 * - issue: status=issued, issued_at=now, returned_at=null (reservation id can be set on edit page)
 * - return: status=available, returned_at=now, issued_to_reservation_id=null
 */
function issueQuick(keyId) {
  keys.value = keys.value.map((x) => {
    if (x.key_id !== keyId) return x
    return { ...x, status: "issued", issued_at: x.issued_at || nowStamp(), returned_at: null }
  })
  showToast("Issued (demo). Set reservation id in Edit.")
}

function returnKey(keyId) {
  keys.value = keys.value.map((x) => {
    if (x.key_id !== keyId) return x
    return { ...x, status: "available", returned_at: nowStamp(), issued_to_reservation_id: null }
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

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

.soft-card {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}

/* Vuestic controls look like your soft inputs */
:deep(.ctrl .va-input-wrapper__container),
:deep(.ctrl .va-select__anchor),
:deep(.ctrl .va-textarea__container) {
  background: rgb(241 245 249) !important;
  border: 0 !important;
  border-radius: 16px !important;
  min-height: 44px !important;
}
:deep(.ctrl .va-input-wrapper__container:focus-within),
:deep(.ctrl .va-select__anchor:focus-within),
:deep(.ctrl .va-textarea__container:focus-within) {
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08) !important;
}

/* Chips */
.chip {
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
}
.chip--active {
  background: rgb(15 23 42);
  color: #fff;
}
.chip--idle {
  background: rgb(241 245 249);
  color: rgb(15 23 42);
}
.chip--idle:hover {
  background: rgb(226 232 240);
}
</style>
