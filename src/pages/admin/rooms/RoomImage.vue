<!-- src/pages/admin/rooms/RoomImages.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">photo_library</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Room Images</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Manage room photos • set primary • reorder • quick preview (static data for now).
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
            @click="openCreateModal()"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">add_photo_alternate</span>
            Add Image
          </button>
        </div>
      </div>

      <!-- Controls -->
      <section class="mt-4 rounded-2xl bg-white p-4">
        <div class="grid gap-3 lg:grid-cols-12">
          <div class="lg:col-span-6">
            <label class="mb-1 block text-xs font-bold text-slate-500">Search</label>
            <div class="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
              <span class="material-icons text-[18px] text-slate-500">search</span>
              <input
                v-model.trim="q"
                class="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search room number or caption..."
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
                <option v-for="r in roomOptions" :key="r.room_id" :value="r.room_id">
                  Room {{ r.room_number }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-xs font-bold text-slate-500">Status</label>
              <select v-model="statusFilter" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                <option value="all">All</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-xs font-bold text-slate-500">Quick</label>
              <select v-model="quickFilter" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                <option value="all">All</option>
                <option value="primary">Primary images</option>
                <option value="non_primary">Non-primary</option>
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
            {{ c.label }}
            <span class="ml-1 text-[11px]" :class="activeChip === c.key ? 'text-white/80' : 'text-slate-500'">
              ({{ c.count }})
            </span>
          </button>
        </div>
      </section>

      <!-- Room gallery cards -->
      <div class="mt-4 grid gap-4 lg:grid-cols-12">
        <!-- Left: room list -->
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
                <div class="flex items-center gap-3">
                  <img
                    :src="primaryImageForRoom(r.room_id)"
                    class="h-12 w-12 rounded-2xl object-cover"
                    alt="primary"
                    loading="lazy"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-extrabold text-slate-900">Room {{ r.room_number }}</div>
                    <div class="mt-0.5 text-xs text-slate-500">
                      {{ countActive(r.room_id) }} active • {{ countTotal(r.room_id) }} images
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

        <!-- Right: images grid -->
        <div class="lg:col-span-8">
          <div class="rounded-2xl bg-white p-4">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div class="text-sm font-extrabold text-slate-900">
                  {{ activeRoomTitle }}
                </div>
                <div class="text-xs text-slate-500">
                  Click an image to preview. Use actions to set primary, reorder, toggle active, delete.
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-200"
                  @click="openCreateModal(activeRoomId)"
                >
                  <span class="material-icons mr-1 align-middle text-[16px]">add</span>
                  Add to this room
                </button>

                <button
                  type="button"
                  class="rounded-full bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-slate-800 disabled:opacity-40"
                  :disabled="selectedIds.size === 0"
                  @click="bulkSetActive(true)"
                >
                  Activate ({{ selectedIds.size }})
                </button>

                <button
                  type="button"
                  class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-200 disabled:opacity-40"
                  :disabled="selectedIds.size === 0"
                  @click="bulkSetActive(false)"
                >
                  Deactivate
                </button>

                <button
                  type="button"
                  class="rounded-full bg-rose-100 px-4 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-200 disabled:opacity-40"
                  :disabled="selectedIds.size === 0"
                  @click="bulkDelete()"
                >
                  Delete
                </button>
              </div>
            </div>

            <!-- Preview panel -->
            <div v-if="preview" class="mt-4 rounded-2xl bg-slate-50 p-4">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="flex items-start gap-3">
                  <img :src="preview.image_url" class="h-20 w-28 rounded-2xl object-cover" alt="preview" />
                  <div>
                    <div class="text-sm font-extrabold text-slate-900">
                      Room {{ roomNumber(preview.room_id) }}
                      <span v-if="preview.is_primary" class="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                        PRIMARY
                      </span>
                      <span
                        class="ml-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                        :class="preview.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'"
                      >
                        {{ preview.is_active ? "ACTIVE" : "INACTIVE" }}
                      </span>
                    </div>
                    <div class="mt-1 text-xs text-slate-500">
                      #{{ preview.image_id }} • Order: {{ preview.sort_order }}
                    </div>
                    <div class="mt-2 text-sm text-slate-700">
                      {{ preview.caption || "No caption" }}
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    class="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-100"
                    @click="setPrimary(preview.room_id, preview.image_id)"
                  >
                    <span class="material-icons mr-1 align-middle text-[16px]">star</span>
                    Set Primary
                  </button>

                  <button
                    type="button"
                    class="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-100"
                    @click="toggleActive(preview.image_id)"
                  >
                    <span class="material-icons mr-1 align-middle text-[16px]">
                      {{ preview.is_active ? "visibility_off" : "visibility" }}
                    </span>
                    {{ preview.is_active ? "Deactivate" : "Activate" }}
                  </button>

                  <button
                    type="button"
                    class="rounded-full bg-rose-100 px-4 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-200"
                    @click="deleteImage(preview.image_id)"
                  >
                    <span class="material-icons mr-1 align-middle text-[16px]">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <!-- Images grid -->
            <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <button
                v-for="img in filteredImages"
                :key="img.image_id"
                type="button"
                class="group relative overflow-hidden rounded-2xl bg-slate-100 text-left"
                @click="openPreview(img)"
              >
                <img :src="img.image_url" class="h-36 w-full object-cover" alt="room image" loading="lazy" />

                <!-- top badges -->
                <div class="absolute left-3 top-3 flex gap-2">
                  <span
                    v-if="img.is_primary"
                    class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800"
                  >
                    Primary
                  </span>
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                    :class="img.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'"
                  >
                    {{ img.is_active ? "Active" : "Inactive" }}
                  </span>
                </div>

                <!-- select checkbox -->
                <div class="absolute right-3 top-3">
                  <label
                    class="grid h-9 w-9 place-items-center rounded-xl bg-white/90 hover:bg-white"
                    @click.stop
                    title="Select"
                  >
                    <input
                      type="checkbox"
                      class="h-4 w-4 accent-slate-900"
                      :checked="selectedIds.has(img.image_id)"
                      @change="toggleSelect(img.image_id)"
                    />
                  </label>
                </div>

                <!-- bottom info -->
                <div class="p-3">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <div class="truncate text-sm font-extrabold text-slate-900">
                        Room {{ roomNumber(img.room_id) }}
                      </div>
                      <div class="mt-1 line-clamp-1 text-xs text-slate-600">
                        {{ img.caption || "No caption" }}
                      </div>
                    </div>

                    <div class="shrink-0 text-right">
                      <div class="text-[10px] font-bold text-slate-500">Order</div>
                      <div class="text-sm font-extrabold text-slate-900">{{ img.sort_order }}</div>
                    </div>
                  </div>

                  <!-- quick actions -->
                  <div class="mt-3 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        class="grid h-9 w-9 place-items-center rounded-xl bg-white hover:bg-slate-50"
                        title="Move up"
                        @click.stop="move(img.room_id, img.image_id, -1)"
                      >
                        <span class="material-icons text-[18px] text-slate-700">keyboard_arrow_up</span>
                      </button>
                      <button
                        type="button"
                        class="grid h-9 w-9 place-items-center rounded-xl bg-white hover:bg-slate-50"
                        title="Move down"
                        @click.stop="move(img.room_id, img.image_id, +1)"
                      >
                        <span class="material-icons text-[18px] text-slate-700">keyboard_arrow_down</span>
                      </button>
                    </div>

                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        class="grid h-9 w-9 place-items-center rounded-xl bg-white hover:bg-slate-50"
                        title="Set primary"
                        @click.stop="setPrimary(img.room_id, img.image_id)"
                      >
                        <span class="material-icons text-[18px]" :class="img.is_primary ? 'text-amber-600' : 'text-slate-700'">
                          star
                        </span>
                      </button>
                      <button
                        type="button"
                        class="grid h-9 w-9 place-items-center rounded-xl bg-white hover:bg-slate-50"
                        title="Toggle active"
                        @click.stop="toggleActive(img.image_id)"
                      >
                        <span class="material-icons text-[18px] text-slate-700">
                          {{ img.is_active ? "visibility_off" : "visibility" }}
                        </span>
                      </button>
                      <button
                        type="button"
                        class="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 hover:bg-rose-200"
                        title="Delete"
                        @click.stop="deleteImage(img.image_id)"
                      >
                        <span class="material-icons text-[18px] text-rose-700">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- hover overlay -->
                <div class="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <div class="absolute inset-0 bg-black/10"></div>
                </div>
              </button>
            </div>

            <!-- Empty -->
            <div v-if="filteredImages.length === 0" class="mt-6 rounded-2xl bg-slate-50 p-6 text-center">
              <div class="text-slate-900 font-extrabold">No images found</div>
              <div class="mt-1 text-sm text-slate-500">Try another filter or add new images.</div>
              <button
                class="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
                type="button"
                @click="openCreateModal(activeRoomId)"
              >
                Add Image
              </button>
            </div>

            <div class="mt-4 text-[11px] text-slate-500">
              Demo only: data is local (static). Later connect to DB table <b>room_images</b>.
            </div>
          </div>
        </div>
      </div>

      <!-- Create modal (simple) -->
      <div v-if="createModal.open" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/40" @click="createModal.open=false"></div>

        <div class="absolute left-1/2 top-1/2 w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4">
          <div class="flex items-center justify-between">
            <div class="text-sm font-extrabold text-slate-900">Add Room Image</div>
            <button class="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100" @click="createModal.open=false">
              <span class="material-icons text-slate-700">close</span>
            </button>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="mb-1 block text-xs font-bold text-slate-500">Room *</label>
              <select v-model.number="createModal.room_id" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                <option disabled :value="0">Select room</option>
                <option v-for="r in rooms" :key="r.room_id" :value="r.room_id">
                  Room {{ r.room_number }}
                </option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label class="mb-1 block text-xs font-bold text-slate-500">Image URL *</label>
              <input
                v-model.trim="createModal.image_url"
                class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
                placeholder="https://..."
              />
              <div class="mt-1 text-[11px] text-slate-500">
                Tip: use any public image URL (Unsplash, etc).
              </div>
            </div>

            <div class="sm:col-span-2">
              <label class="mb-1 block text-xs font-bold text-slate-500">Caption</label>
              <input
                v-model.trim="createModal.caption"
                class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
                placeholder="Main view / Bathroom / Balcony..."
              />
            </div>

            <div>
              <label class="mb-1 block text-xs font-bold text-slate-500">Primary?</label>
              <label class="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                <input type="checkbox" class="h-4 w-4 accent-slate-900" v-model="createModal.is_primary" />
                Set as primary
              </label>
            </div>

            <div>
              <label class="mb-1 block text-xs font-bold text-slate-500">Active?</label>
              <label class="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                <input type="checkbox" class="h-4 w-4 accent-slate-900" v-model="createModal.is_active" />
                Active
              </label>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-end gap-2">
            <button class="rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-200" @click="createModal.open=false" type="button">
              Cancel
            </button>
            <button
              class="rounded-full bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-40"
              :disabled="!canCreate"
              @click="createImage()"
              type="button"
            >
              Add
            </button>
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
import { computed, reactive, ref } from "vue"
import { roomImagesData } from "@/data/room/roomImagesData"

// ---- Helpers / local store (flatten) ----
function normalize(data) {
  const out = []
  for (const r of data) {
    for (const img of r.images || []) {
      out.push({
        image_id: img.image_id,
        room_id: r.room_id,
        room_number: r.room_number,
        image_url: img.image_url,
        caption: img.caption || "",
        sort_order: Number(img.sort_order ?? 0),
        is_primary: !!img.is_primary,
        is_active: img.is_active == null ? true : !!img.is_active,
      })
    }
  }
  return out
}

const initial = normalize(roomImagesData)
const images = ref([...initial])

// rooms list from data (stable)
const rooms = computed(() => {
  return (roomImagesData || []).map((x) => ({ room_id: x.room_id, room_number: x.room_number }))
})

// ---- UI state ----
const q = ref("")
const roomFilter = ref("all")
const statusFilter = ref("all") // active | inactive | all
const quickFilter = ref("all") // primary | non_primary | all
const activeChip = ref("all") // all | active | inactive | primary
const activeRoomId = ref(null)

const preview = ref(null)
const selectedIds = ref(new Set())

const toast = ref("")
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ""), 2200)
}

// ---- Derived ----
const roomOptions = computed(() => rooms.value)

const chips = computed(() => {
  const all = images.value.length
  const active = images.value.filter((x) => x.is_active).length
  const inactive = images.value.filter((x) => !x.is_active).length
  const primary = images.value.filter((x) => x.is_primary).length
  return [
    { key: "all", label: "All", count: all },
    { key: "active", label: "Active", count: active },
    { key: "inactive", label: "Inactive", count: inactive },
    { key: "primary", label: "Primary", count: primary },
  ]
})

const activeRoomTitle = computed(() => {
  if (!activeRoomId.value) return "Images (All Rooms)"
  const r = rooms.value.find((x) => x.room_id === activeRoomId.value)
  return r ? `Room ${r.room_number} • Images` : "Images"
})

const filteredImages = computed(() => {
  const kw = q.value.trim().toLowerCase()

  return images.value
    .filter((x) => {
      // room selection on left
      if (activeRoomId.value && x.room_id !== activeRoomId.value) return false

      // room dropdown filter
      if (roomFilter.value !== "all" && x.room_id !== Number(roomFilter.value)) return false

      // status dropdown filter
      if (statusFilter.value === "active" && !x.is_active) return false
      if (statusFilter.value === "inactive" && x.is_active) return false

      // quick dropdown
      if (quickFilter.value === "primary" && !x.is_primary) return false
      if (quickFilter.value === "non_primary" && x.is_primary) return false

      // chip
      if (activeChip.value === "active" && !x.is_active) return false
      if (activeChip.value === "inactive" && x.is_active) return false
      if (activeChip.value === "primary" && !x.is_primary) return false

      // keyword
      if (!kw) return true
      const blob = `${x.room_number} ${x.caption}`.toLowerCase()
      return blob.includes(kw)
    })
    .sort((a, b) => {
      // group by room then sort_order
      if (a.room_id !== b.room_id) return String(a.room_number).localeCompare(String(b.room_number))
      return Number(a.sort_order) - Number(b.sort_order)
    })
})

function selectRoom(roomId) {
  activeRoomId.value = roomId
  preview.value = null
  selectedIds.value = new Set()
}

function openPreview(img) {
  preview.value = img
}

function toggleSelect(id) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedIds.value = s
}

function countTotal(roomId) {
  return images.value.filter((x) => x.room_id === roomId).length
}
function countActive(roomId) {
  return images.value.filter((x) => x.room_id === roomId && x.is_active).length
}

function roomNumber(roomId) {
  const r = rooms.value.find((x) => x.room_id === roomId)
  return r?.room_number || "-"
}

function primaryImageForRoom(roomId) {
  const list = images.value.filter((x) => x.room_id === roomId)
  const p = list.find((x) => x.is_primary)?.image_url
  const f = list.sort((a, b) => Number(a.sort_order) - Number(b.sort_order))[0]?.image_url
  return p || f || "https://via.placeholder.com/300x200?text=Room"
}

// ---- Actions ----
function setPrimary(roomId, imageId) {
  images.value = images.value.map((x) => {
    if (x.room_id !== roomId) return x
    return { ...x, is_primary: x.image_id === imageId }
  })
  // keep preview up-to-date
  if (preview.value && preview.value.room_id === roomId) {
    preview.value = images.value.find((x) => x.image_id === preview.value.image_id) || null
  }
  showToast("Primary image updated.")
}

function toggleActive(imageId) {
  images.value = images.value.map((x) => (x.image_id === imageId ? { ...x, is_active: !x.is_active } : x))
  if (preview.value?.image_id === imageId) {
    preview.value = images.value.find((x) => x.image_id === imageId) || null
  }
}

function move(roomId, imageId, dir) {
  const list = images.value
    .filter((x) => x.room_id === roomId)
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))

  const idx = list.findIndex((x) => x.image_id === imageId)
  if (idx < 0) return

  const swapIdx = idx + dir
  if (swapIdx < 0 || swapIdx >= list.length) return

  const a = list[idx]
  const b = list[swapIdx]

  images.value = images.value.map((x) => {
    if (x.image_id === a.image_id) return { ...x, sort_order: b.sort_order }
    if (x.image_id === b.image_id) return { ...x, sort_order: a.sort_order }
    return x
  })

  if (preview.value) preview.value = images.value.find((x) => x.image_id === preview.value.image_id) || null
}

function deleteImage(imageId) {
  const img = images.value.find((x) => x.image_id === imageId)
  if (!img) return

  images.value = images.value.filter((x) => x.image_id !== imageId)

  // if it was primary, choose new primary for that room
  if (img.is_primary) {
    const left = images.value
      .filter((x) => x.room_id === img.room_id)
      .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    if (left[0]) setPrimary(img.room_id, left[0].image_id)
  }

  const s = new Set(selectedIds.value)
  s.delete(imageId)
  selectedIds.value = s

  if (preview.value?.image_id === imageId) preview.value = null
  showToast("Image deleted.")
}

function bulkSetActive(v) {
  const ids = selectedIds.value
  images.value = images.value.map((x) => (ids.has(x.image_id) ? { ...x, is_active: v } : x))
  if (preview.value) preview.value = images.value.find((x) => x.image_id === preview.value.image_id) || null
  showToast(v ? "Activated selected." : "Deactivated selected.")
}

function bulkDelete() {
  const ids = selectedIds.value
  if (!ids.size) return

  // track rooms that may lose primary
  const affectedRooms = new Set(images.value.filter((x) => ids.has(x.image_id)).map((x) => x.room_id))

  images.value = images.value.filter((x) => !ids.has(x.image_id))
  selectedIds.value = new Set()
  if (preview.value && ids.has(preview.value.image_id)) preview.value = null

  // fix primary per affected room (ensure at most one primary; if none, pick first)
  for (const roomId of affectedRooms) {
    const list = images.value
      .filter((x) => x.room_id === roomId)
      .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))

    if (!list.length) continue
    const hasPrimary = list.some((x) => x.is_primary)
    if (!hasPrimary) setPrimary(roomId, list[0].image_id)
    else {
      // if multiple primaries somehow, keep first by sort_order
      const primary = list.find((x) => x.is_primary)
      if (primary) setPrimary(roomId, primary.image_id)
    }
  }

  showToast("Deleted selected images.")
}

// ---- Create modal (demo) ----
const createModal = reactive({
  open: false,
  room_id: 0,
  image_url: "",
  caption: "",
  is_primary: false,
  is_active: true,
})

function openCreateModal(roomId = null) {
  createModal.open = true
  createModal.room_id = roomId ? Number(roomId) : 0
  createModal.image_url = ""
  createModal.caption = ""
  createModal.is_primary = false
  createModal.is_active = true
}

const canCreate = computed(() => !!createModal.room_id && !!createModal.image_url)

function createImage() {
  if (!canCreate.value) return

  const maxId = images.value.length ? Math.max(...images.value.map((x) => Number(x.image_id || 0))) : 0
  const roomId = Number(createModal.room_id)
  const roomNo = roomNumber(roomId)

  const nextOrder =
    Math.max(
      0,
      ...images.value.filter((x) => x.room_id === roomId).map((x) => Number(x.sort_order || 0))
    ) + 1

  const img = {
    image_id: maxId + 1,
    room_id: roomId,
    room_number: roomNo,
    image_url: createModal.image_url.trim(),
    caption: createModal.caption.trim(),
    sort_order: nextOrder,
    is_primary: !!createModal.is_primary,
    is_active: !!createModal.is_active,
  }

  images.value = [img, ...images.value]

  if (img.is_primary) setPrimary(roomId, img.image_id) // enforce single primary

  createModal.open = false
  showToast(`Added image to Room ${roomNo}.`)
}

function resetAll() {
  images.value = [...initial]
  q.value = ""
  roomFilter.value = "all"
  statusFilter.value = "all"
  quickFilter.value = "all"
  activeChip.value = "all"
  activeRoomId.value = null
  preview.value = null
  selectedIds.value = new Set()
  showToast("Reset done.")
}
</script>
