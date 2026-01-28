<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">add_home</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Create Room</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Add a new room • Set room type, floor, status • Upload photos (optional).
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
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-40"
            type="button"
            :disabled="!canSubmit || saving"
            @click="submit"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">
              {{ saving ? "autorenew" : "save" }}
            </span>
            {{ saving ? "Saving..." : "Save" }}
          </button>
        </div>
      </div>

      <!-- Main (no border/shadow) -->
      <div class="mt-4 grid gap-4 lg:grid-cols-12">
        <!-- Left -->
        <div class="lg:col-span-8">
          <!-- Basic -->
          <section class="rounded-2xl bg-white p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-extrabold text-slate-900">Room Info</div>
                <div class="text-xs text-slate-500">Room number, type, floor, and status.</div>
              </div>

              <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                {{ propertyLabel }}
              </span>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Room Number *</label>
                <input
                  v-model.trim="draft.room_number"
                  class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none placeholder:text-slate-400"
                  placeholder="e.g. 101"
                />
                <div v-if="errors.room_number" class="mt-1 text-xs font-extrabold text-rose-600">
                  {{ errors.room_number }}
                </div>
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Room Type *</label>
                <select
                  v-model="draft.room_type_id"
                  class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
                >
                  <option value="">Select room type</option>
                  <option v-for="t in roomTypes" :key="t.room_type_id" :value="t.room_type_id">
                    {{ t.type_name }} • {{ t.bed_count }} bed • {{ money(t.nightly_price) }}/night
                  </option>
                </select>
                <div v-if="errors.room_type_id" class="mt-1 text-xs font-extrabold text-rose-600">
                  {{ errors.room_type_id }}
                </div>
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Floor *</label>
                <input
                  v-model.number="draft.floor"
                  type="number"
                  min="0"
                  class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
                  placeholder="1"
                />
                <div v-if="errors.floor" class="mt-1 text-xs font-extrabold text-rose-600">
                  {{ errors.floor }}
                </div>
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Building</label>
                <input
                  v-model.trim="draft.building"
                  class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none placeholder:text-slate-400"
                  placeholder="e.g. A / Main"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="mb-1 block text-xs font-bold text-slate-500">Status *</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="s in statusOptions"
                    :key="s"
                    type="button"
                    class="rounded-full px-4 py-2 text-xs font-extrabold"
                    :class="draft.status === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'"
                    @click="draft.status = s"
                  >
                    {{ pretty(s) }}
                  </button>
                </div>
              </div>

              <div v-if="draft.status === 'blocked'" class="sm:col-span-2">
                <label class="mb-1 block text-xs font-bold text-slate-500">Blocked Until</label>
                <input
                  v-model="draft.blocked_until"
                  type="date"
                  class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
                />
                <div class="mt-1 text-[11px] text-slate-500">
                  Optional: set when the room becomes available again.
                </div>
              </div>
            </div>
          </section>

          <!-- Notes -->
          <section class="mt-4 rounded-2xl bg-white p-4">
            <div class="text-sm font-extrabold text-slate-900">Notes</div>
            <textarea
              v-model.trim="draft.notes"
              rows="3"
              class="mt-2 w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="Optional notes..."
            />
          </section>

          <!-- Photos -->
          <section class="mt-4 rounded-2xl bg-white p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-extrabold text-slate-900">Photos</div>
                <div class="text-xs text-slate-500">Upload images (optional).</div>
              </div>

              <button
                v-if="draft.files.length"
                type="button"
                class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold hover:bg-slate-200"
                @click="clearFiles"
              >
                Clear Photos
              </button>
            </div>

            <div class="mt-3">
              <input type="file" accept="image/*" multiple class="block w-full text-sm" @change="onFiles" />
              <div v-if="errors.images" class="mt-2 text-xs font-extrabold text-rose-600">
                {{ errors.images }}
              </div>
            </div>

            <div v-if="previews.length" class="mt-4">
              <div class="text-xs font-bold text-slate-500">Tap image to set Primary</div>
              <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  v-for="(p, idx) in previews"
                  :key="idx"
                  type="button"
                  class="relative overflow-hidden rounded-2xl"
                  @click="draft.primary_index = idx"
                >
                  <img :src="p" class="h-24 w-full object-cover" alt="room" />
                  <span
                    v-if="idx === draft.primary_index"
                    class="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold text-slate-900"
                  >
                    Primary
                  </span>

                  <button
                    type="button"
                    class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 hover:bg-white"
                    @click.stop="removeFile(idx)"
                    title="Remove"
                  >
                    <span class="material-icons text-[18px] text-slate-800">close</span>
                  </button>
                </button>
              </div>
            </div>

            <div v-else class="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              No photos selected.
            </div>
          </section>
        </div>

        <!-- Right summary -->
        <div class="lg:col-span-4">
          <div class="rounded-2xl bg-white p-4 lg:sticky lg:top-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-extrabold text-slate-900">Summary</div>
                <div class="text-xs text-slate-500">Preview your room data.</div>
              </div>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                {{ currency }}
              </span>
            </div>

            <div class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Room</span>
                <span class="font-extrabold text-slate-900">{{ draft.room_number || "-" }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-slate-600">Type</span>
                <span class="font-extrabold text-slate-900">{{ selectedType?.type_name || "-" }}</span>
              </div>

              <div class="flex justify-between">
                <span class="text-slate-600">Floor</span>
                <span class="font-extrabold text-slate-900">{{ draft.floor ?? "-" }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-slate-600">Status</span>
                <span class="rounded-full px-3 py-1 text-[11px] font-extrabold" :class="statusPill(draft.status)">
                  {{ pretty(draft.status) }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-slate-600">Photos</span>
                <span class="font-extrabold text-slate-900">{{ previews.length }}</span>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                class="rounded-full bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-200 disabled:opacity-40"
                :disabled="saving"
                @click="resetAll"
              >
                Reset
              </button>

              <button
                type="button"
                class="rounded-full bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-40"
                :disabled="!canSubmit || saving"
                @click="submit"
              >
                Save
              </button>
            </div>

            <div class="mt-3 text-[11px] text-slate-500">
              Demo UI: later connect API to insert into <b>rooms</b> and <b>room_images</b>.
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
import { computed, reactive, ref } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

// ✅ Replace with your real property context (Pinia/store/API)
const propertyLabel = "GH01 • Phnom Penh"
const currency = "USD"

// ✅ Replace with API fetch later
const roomTypes = ref([
  { room_type_id: 1, type_name: "Simple", bed_count: 1, nightly_price: 20 },
  { room_type_id: 2, type_name: "Simple", bed_count: 2, nightly_price: 25 },
  { room_type_id: 3, type_name: "VIP", bed_count: 1, nightly_price: 40 },
  { room_type_id: 4, type_name: "VIP", bed_count: 2, nightly_price: 55 },
])

const statusOptions = ["available", "occupied", "cleaning", "maintenance", "out_of_order", "blocked"]

const toast = ref("")
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ""), 2200)
}

const saving = ref(false)

const draft = reactive({
  room_number: "",
  room_type_id: "",
  floor: 1,
  building: "",
  status: "available",
  blocked_until: "",
  notes: "",

  // photos
  files: /** @type {File[]} */ ([]),
  primary_index: 0,
})

const errors = reactive({
  room_number: "",
  room_type_id: "",
  floor: "",
  images: "",
})

const previews = ref([])

const selectedType = computed(() => {
  return roomTypes.value.find((t) => String(t.room_type_id) === String(draft.room_type_id)) || null
})

const canSubmit = computed(() => {
  if (!draft.room_number) return false
  if (!draft.room_type_id) return false
  if (draft.floor === null || draft.floor === undefined || Number.isNaN(Number(draft.floor))) return false
  return true
})

function validate() {
  errors.room_number = ""
  errors.room_type_id = ""
  errors.floor = ""
  errors.images = ""

  if (!draft.room_number) errors.room_number = "Room number is required"
  if (!draft.room_type_id) errors.room_type_id = "Room type is required"
  if (draft.floor === null || draft.floor === undefined || Number.isNaN(Number(draft.floor))) {
    errors.floor = "Floor is required"
  }

  return !errors.room_number && !errors.room_type_id && !errors.floor && !errors.images
}

function onFiles(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return

  const max = 8
  if (files.length + draft.files.length > max) {
    errors.images = `Max ${max} images allowed`
    return
  }

  errors.images = ""
  files.forEach((f) => {
    draft.files.push(f)
    previews.value.push(URL.createObjectURL(f))
  })

  if (draft.primary_index >= previews.value.length) draft.primary_index = 0
}

function removeFile(idx) {
  const url = previews.value[idx]
  if (url) URL.revokeObjectURL(url)

  draft.files.splice(idx, 1)
  previews.value.splice(idx, 1)

  if (draft.primary_index >= previews.value.length) {
    draft.primary_index = Math.max(0, previews.value.length - 1)
  }
}

function clearFiles() {
  previews.value.forEach((url) => URL.revokeObjectURL(url))
  previews.value = []
  draft.files = []
  draft.primary_index = 0
  errors.images = ""
}

function resetAll() {
  draft.room_number = ""
  draft.room_type_id = ""
  draft.floor = 1
  draft.building = ""
  draft.status = "available"
  draft.blocked_until = ""
  draft.notes = ""
  clearFiles()

  errors.room_number = ""
  errors.room_type_id = ""
  errors.floor = ""
  errors.images = ""

  showToast("Reset done.")
}

async function submit() {
  if (!validate()) return showToast("Please fill required fields.")

  saving.value = true
  try {
    // ✅ Build payload (FormData for upload)
    const fd = new FormData()
    fd.append("room_number", draft.room_number)
    fd.append("room_type_id", String(draft.room_type_id))
    fd.append("floor", String(draft.floor))
    fd.append("building", draft.building || "")
    fd.append("status", draft.status)
    fd.append("blocked_until", draft.blocked_until || "")
    fd.append("notes", draft.notes || "")
    fd.append("primary_index", String(draft.primary_index))
    draft.files.forEach((f) => fd.append("images[]", f))

    // TODO: connect API
    // await api.post("/api/rooms", fd)

    await new Promise((r) => setTimeout(r, 700))

    showToast("Saved (demo). Connect API later.")
    router.push("/admin/rooms")
  } catch (e) {
    showToast("Save failed.")
  } finally {
    saving.value = false
  }
}

function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}

function statusPill(status) {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-800"
    case "occupied":
      return "bg-blue-100 text-blue-800"
    case "blocked":
      return "bg-amber-100 text-amber-800"
    case "cleaning":
      return "bg-slate-200 text-slate-800"
    case "maintenance":
      return "bg-rose-100 text-rose-800"
    case "out_of_order":
      return "bg-slate-200 text-slate-800"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

function money(v) {
  const n = Number(v || 0)
  return `$${n.toFixed(2)}`
}
</script>
