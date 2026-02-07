<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto w-full space-y-4">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <VaIcon name="add_home" color="secondary" />
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Create Room</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Save to <b>rooms</b> table • Select <b>room_type_id</b> • Upload photos to <b>room_images</b> (later).
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" :disabled="saving" @click="resetAll">
            <VaIcon name="refresh" class="mr-1" />
            Reset
          </VaButton>

          <VaButton color="primary" class="rounded-2xl font-extrabold" :disabled="!canSubmit || saving" @click="submit">
            <VaIcon :name="saving ? 'autorenew' : 'save'" class="mr-1" />
            {{ saving ? "Saving..." : "Save" }}
          </VaButton>
        </div>
      </div>

      <!-- Main -->
      <div class="grid gap-4 lg:grid-cols-12">
        <!-- Left -->
        <div class="lg:col-span-8 space-y-4">
          <!-- Room Info -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Room Info</div>
                  <div class="text-xs text-slate-500">
                    rooms: room_number, room_type_id, floor, building, status, blocked_until, blocking_reason, notes
                  </div>
                </div>

                <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                  property_id: {{ draft.property_id }}
                </span>
              </div>

              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <!-- Room Number -->
                <VaInput
                  v-model.trim="draft.room_number"
                  label="Room Number *"
                  placeholder="e.g. 101"
                  class="ctrl"
                  :error="!!errors.room_number"
                  :error-messages="errors.room_number ? [errors.room_number] : []"
                />

                <!-- Building -->
                <VaInput
                  v-model.trim="draft.building"
                  label="Building"
                  placeholder="e.g. A / Main"
                  class="ctrl"
                />

                <!-- Room Type -->
                <VaSelect
                  v-model="draft.room_type_id"
                  label="Room Type (room_type_id) *"
                  class="ctrl"
                  :options="roomTypeOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                  :error="!!errors.room_type_id"
                  :error-messages="errors.room_type_id ? [errors.room_type_id] : []"
                />

                <!-- Floor -->
                <VaSelect
                  v-model.number="draft.floor"
                  label="Floor (1–10) *"
                  class="ctrl"
                  :options="floorOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                  :error="!!errors.floor"
                  :error-messages="errors.floor ? [errors.floor] : []"
                />

                <!-- Status -->
                <div class="sm:col-span-2">
                  <div class="mb-1 text-xs font-bold text-slate-500">Status *</div>
                  <div class="flex flex-wrap gap-2">
                    <VaButton
                      v-for="s in statusOptions"
                      :key="s"
                      size="small"
                      :preset="draft.status === s ? 'primary' : 'secondary'"
                      class="rounded-2xl font-extrabold"
                      @click="draft.status = s"
                    >
                      {{ pretty(s) }}
                    </VaButton>
                  </div>
                </div>

                <!-- Blocked fields -->
                <div v-if="draft.status === 'blocked'" class="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                  <VaInput
                    v-model="draft.blocked_until"
                    type="date"
                    label="Blocked Until *"
                    class="ctrl"
                    :error="!!errors.blocked_until"
                    :error-messages="errors.blocked_until ? [errors.blocked_until] : []"
                  />

                  <VaInput
                    v-model.trim="draft.blocking_reason"
                    label="Blocking Reason"
                    placeholder="Renovation / VIP hold…"
                    class="ctrl"
                  />
                </div>

                <!-- Room Type Preview -->
                <div class="sm:col-span-2">
                  <div class="rounded-2xl bg-slate-100 p-3">
                    <div class="text-[11px] font-extrabold text-slate-600">Selected Room Type Preview</div>

                    <div v-if="selectedType" class="mt-2 grid gap-2 sm:grid-cols-3 text-sm">
                      <div>
                        <div class="text-xs text-slate-500">Class</div>
                        <div class="font-extrabold text-slate-900">{{ pretty(selectedType.room_class) }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-slate-500">Beds</div>
                        <div class="font-extrabold text-slate-900">{{ selectedType.bed_count }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-slate-500">Nightly</div>
                        <div class="font-extrabold text-slate-900">{{ money(selectedType.nightly_price, selectedType.base_currency) }}</div>
                      </div>
                    </div>

                    <div v-else class="mt-2 text-sm text-slate-600">
                      Select a room type to preview.
                    </div>
                  </div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Notes -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="text-sm font-extrabold text-slate-900">Notes</div>
              <VaTextarea
                v-model.trim="draft.notes"
                class="ctrl mt-2"
                :min-rows="3"
                placeholder="Optional notes..."
              />
            </VaCardContent>
          </VaCard>

          <!-- Photos (room_images later) -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Photos</div>
                  <div class="text-xs text-slate-500">
                    UI now • later save to <b>room_images</b> with room_id.
                  </div>
                </div>

                <VaButton
                  v-if="draft.files.length"
                  preset="secondary"
                  size="small"
                  class="rounded-2xl font-extrabold"
                  @click="clearFiles"
                >
                  Clear Photos
                </VaButton>
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
            </VaCardContent>
          </VaCard>
        </div>

        <!-- Right -->
        <div class="lg:col-span-4">
          <VaCard class="soft-card rounded-2xl lg:sticky lg:top-4">
            <VaCardContent class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Summary</div>
                  <div class="text-xs text-slate-500">rooms payload preview</div>
                </div>
              </div>

              <div class="mt-4 space-y-2 text-sm">
                <Row label="property_id" :value="String(draft.property_id)" />
                <Row label="room_number" :value="draft.room_number || '-'" />
                <Row label="room_type_id" :value="draft.room_type_id ? String(draft.room_type_id) : '-'" />
                <Row label="floor" :value="String(draft.floor)" />
                <Row label="building" :value="draft.building || '-'" />
                <Row label="status" :value="draft.status" />
                <Row label="blocked_until" :value="draft.blocked_until || '-'" />
                <Row label="blocking_reason" :value="draft.blocking_reason || '-'" />
                <Row label="notes" :value="draft.notes ? 'Yes' : 'No'" />
                <Row label="images[]" :value="String(previews.length)" />
              </div>

              <div class="mt-4 grid grid-cols-2 gap-2">
                <VaButton preset="secondary" class="rounded-2xl font-extrabold" :disabled="saving" @click="resetAll">
                  Reset
                </VaButton>
                <VaButton color="primary" class="rounded-2xl font-extrabold" :disabled="!canSubmit || saving" @click="submit">
                  Save
                </VaButton>
              </div>

              <div class="mt-3 text-[11px] text-slate-500">
                ✅ Beds & pricing come from <b>room_types</b> — not rooms.
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
import { computed, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

// ✅ set from your auth/store later
const PROPERTY_ID = 1

// ✅ Replace with API fetch room_types by property_id
const roomTypes = ref([
  {
    room_type_id: 1,
    property_id: 1,
    room_class: "simple",
    bed_count: 1,
    bed_type: "double",
    type_code: "STD-DBL",
    type_name: "Simple 1 Bed",
    base_currency: "USD",
    nightly_price: 20,
    hourly_price: 4,
    monthly_price: null,
    max_occupancy: 2,
    status: "active",
  },
  {
    room_type_id: 2,
    property_id: 1,
    room_class: "vip",
    bed_count: 2,
    bed_type: "king",
    type_code: "VIP-KNG",
    type_name: "VIP 2 Beds",
    base_currency: "USD",
    nightly_price: 55,
    hourly_price: 10,
    monthly_price: 500,
    max_occupancy: 3,
    status: "active",
  },
])

const statusOptions = ["available", "occupied", "cleaning", "maintenance", "out_of_order", "blocked"]
const floorOptions = Array.from({ length: 10 }, (_, i) => ({ text: `Floor ${i + 1}`, value: i + 1 }))

const roomTypeOptions = computed(() =>
  roomTypes.value
    .filter((t) => t.status === "active")
    .map((t) => ({
      value: t.room_type_id,
      text: `${t.type_name} • ${t.bed_count} bed • ${t.type_code} • ${money(t.nightly_price, t.base_currency)}/night`,
    }))
)

const draft = reactive({
  property_id: PROPERTY_ID,
  room_number: "",
  room_type_id: null,
  floor: 1,
  building: "",

  status: "available",
  blocked_until: "",
  blocking_reason: "",
  notes: "",

  files: /** @type {File[]} */ ([]),
  primary_index: 0,
})

const selectedType = computed(() => roomTypes.value.find((x) => Number(x.room_type_id) === Number(draft.room_type_id)) || null)

const errors = reactive({
  room_number: "",
  room_type_id: "",
  floor: "",
  blocked_until: "",
  images: "",
})

const previews = ref([])
const saving = ref(false)

const toast = ref("")
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ""), 2200)
}

const canSubmit = computed(() => {
  if (!draft.room_number.trim()) return false
  if (!draft.room_type_id) return false
  if (!draft.floor || draft.floor < 1 || draft.floor > 10) return false
  if (draft.status === "blocked" && !draft.blocked_until) return false
  return true
})

function validate() {
  errors.room_number = ""
  errors.room_type_id = ""
  errors.floor = ""
  errors.blocked_until = ""
  errors.images = ""

  if (!draft.room_number.trim()) errors.room_number = "Room number is required"
  if (!draft.room_type_id) errors.room_type_id = "Room type is required"
  if (!draft.floor || draft.floor < 1 || draft.floor > 10) errors.floor = "Floor must be 1–10"
  if (draft.status === "blocked" && !draft.blocked_until) errors.blocked_until = "Blocked until is required"

  return !errors.room_number && !errors.room_type_id && !errors.floor && !errors.blocked_until && !errors.images
}

// photos
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
  draft.room_type_id = null
  draft.floor = 1
  draft.building = ""
  draft.status = "available"
  draft.blocked_until = ""
  draft.blocking_reason = ""
  draft.notes = ""
  clearFiles()

  errors.room_number = ""
  errors.room_type_id = ""
  errors.floor = ""
  errors.blocked_until = ""
  errors.images = ""

  showToast("Reset done.")
}

watch(
  () => draft.status,
  (v) => {
    if (v !== "blocked") {
      draft.blocked_until = ""
      draft.blocking_reason = ""
      errors.blocked_until = ""
    }
  }
)

async function submit() {
  if (!validate()) return showToast("Please fill required fields.")

  saving.value = true
  try {
    // ✅ This is the exact rooms payload (match DB)
    const fd = new FormData()
    fd.append("property_id", String(draft.property_id))
    fd.append("room_number", draft.room_number.trim())
    fd.append("room_type_id", String(draft.room_type_id))
    fd.append("floor", String(draft.floor))
    fd.append("building", draft.building || "")
    fd.append("status", draft.status)
    fd.append("blocked_until", draft.blocked_until || "")
    fd.append("blocking_reason", draft.blocking_reason || "")
    fd.append("notes", draft.notes || "")

    // photos for later room_images insert
    fd.append("primary_index", String(draft.primary_index))
    draft.files.forEach((f) => fd.append("images[]", f))

    // TODO: connect API
    // const res = await api.post("/api/rooms", fd)
    // const room_id = res.data.room_id

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

function money(v, currency = "USD") {
  const n = Number(v || 0)
  const sym = currency === "USD" ? "$" : "៛"
  return `${sym}${n.toFixed(2)}`
}

// mini row component
const Row = {
  props: { label: String, value: String },
  template: `
    <div class="flex justify-between">
      <span class="text-slate-600">{{ label }}</span>
      <span class="font-extrabold text-slate-900">{{ value }}</span>
    </div>
  `,
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

/* light shadow only */
.soft-card {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}

/* Vuestic controls = soft inputs */
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
</style>
