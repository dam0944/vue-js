<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto w-full space-y-4">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <VaIcon name="hotel" color="secondary" />
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
              {{ isEdit ? "Edit Room Type" : "Create Room Type" }}
            </h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Table: <b>room_types</b> (+ optional images to <b>room_images</b> with room_type_id).
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="resetAll">
            <VaIcon name="refresh" class="mr-1" /> Reset
          </VaButton>

          <VaButton color="primary" class="rounded-2xl font-extrabold" :disabled="!canSubmit || saving" @click="submit">
            <VaIcon :name="saving ? 'autorenew' : 'save'" class="mr-1" />
            {{ saving ? "Saving..." : "Save" }}
          </VaButton>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-12">
        <!-- LEFT -->
        <div class="lg:col-span-8 space-y-4">
          <!-- Basics -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Basic</div>
                  <div class="text-xs text-slate-500">type_code, type_name, class, bed, status, property_id.</div>
                </div>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                  property_id: {{ draft.property_id }}
                </span>
              </div>

              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <VaInput v-model.trim="draft.type_code" label="type_code *" placeholder="STD-DBL" class="ctrl" />
                <VaInput v-model.trim="draft.type_name" label="type_name *" placeholder="Simple" class="ctrl" />

                <VaInput v-model.trim="draft.type_name_khmer" label="type_name_khmer" placeholder="សាមញ្ញ" class="ctrl" />

                <VaSelect
                  v-model="draft.room_class"
                  label="room_class *"
                  class="ctrl"
                  :options="roomClassOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                />

                <VaSelect
                  v-model="draft.bed_count"
                  label="bed_count *"
                  class="ctrl"
                  :options="bedCountOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                />

                <VaSelect
                  v-model="draft.bed_type"
                  label="bed_type"
                  class="ctrl"
                  :options="bedTypeOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                />

                <VaSelect
                  v-model="draft.status"
                  label="status"
                  class="ctrl"
                  :options="statusOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                />
              </div>

              <div v-if="errors.basic" class="mt-2 text-sm font-extrabold text-rose-600">{{ errors.basic }}</div>
            </VaCardContent>
          </VaCard>

          <!-- Pricing -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="text-sm font-extrabold text-slate-900">Pricing (room_types)</div>
              <div class="text-xs text-slate-500">nightly_price required, others optional.</div>

              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <VaSelect
                  v-model="draft.base_currency"
                  label="base_currency"
                  class="ctrl"
                  :options="currencyOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                />

                <VaInput v-model.number="draft.nightly_price" type="number" min="0" label="nightly_price *" class="ctrl" />
                <VaInput v-model.number="draft.weekend_price" type="number" min="0" label="weekend_price" class="ctrl" />
                <VaInput v-model.number="draft.hourly_price" type="number" min="0" label="hourly_price" class="ctrl" />
                <VaInput v-model.number="draft.monthly_price" type="number" min="0" label="monthly_price" class="ctrl" />
              </div>

              <div v-if="errors.pricing" class="mt-2 text-sm font-extrabold text-rose-600">{{ errors.pricing }}</div>
            </VaCardContent>
          </VaCard>

          <!-- Capacity -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="text-sm font-extrabold text-slate-900">Capacity</div>
              <div class="text-xs text-slate-500">max_occupancy, max_adults, max_children.</div>

              <div class="mt-4 grid gap-3 sm:grid-cols-3">
                <VaInput v-model.number="draft.max_occupancy" type="number" min="1" label="max_occupancy" class="ctrl" />
                <VaInput v-model.number="draft.max_adults" type="number" min="0" label="max_adults" class="ctrl" />
                <VaInput v-model.number="draft.max_children" type="number" min="0" label="max_children" class="ctrl" />
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Size + Description -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="grid gap-3 sm:grid-cols-2">
                <VaInput v-model.number="draft.size_sqm" type="number" min="0" label="size_sqm" class="ctrl" />
                <div />
              </div>

              <div class="mt-3">
                <label class="mb-1 block text-xs font-bold text-slate-500">description</label>
                <textarea v-model.trim="draft.description" rows="3" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"></textarea>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Amenities JSON -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="flex items-end justify-between gap-3">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Amenities (JSON)</div>
                  <div class="text-xs text-slate-500">Stored in room_types.amenities as JSON array.</div>
                </div>
              </div>

              <div class="mt-3 flex gap-2">
                <VaInput v-model.trim="amenityInput" placeholder="e.g. WiFi" class="ctrl w-full" />
                <VaButton color="primary" class="rounded-2xl font-extrabold" @click="addAmenity">Add</VaButton>
              </div>

              <div class="mt-3 flex flex-wrap gap-2">
                <VaChip
                  v-for="(a, idx) in draft.amenities"
                  :key="idx"
                  size="small"
                  class="rounded-2xl font-extrabold"
                  color="secondary"
                  outline
                >
                  {{ a }}
                  <button class="ml-2 text-slate-500 hover:text-slate-900" type="button" @click="removeAmenity(idx)">
                    ✕
                  </button>
                </VaChip>

                <div v-if="draft.amenities.length === 0" class="text-sm text-slate-500">No amenities yet.</div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Images (room_images with room_type_id) -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Images</div>
                  <div class="text-xs text-slate-500">Save into room_images with room_type_id (not room_id).</div>
                </div>
                <VaButton v-if="draft.files.length" preset="secondary" class="rounded-2xl font-extrabold" @click="clearFiles">
                  Clear
                </VaButton>
              </div>

              <div class="mt-3">
                <input type="file" accept="image/*" multiple class="block w-full text-sm" @change="onFiles" />
                <div v-if="errors.images" class="mt-2 text-sm font-extrabold text-rose-600">{{ errors.images }}</div>
              </div>

              <div v-if="previews.length" class="mt-4">
                <div class="text-xs font-bold text-slate-500">Click image to set is_primary</div>
                <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    v-for="(p, idx) in previews"
                    :key="idx"
                    type="button"
                    class="relative overflow-hidden rounded-2xl"
                    @click="draft.primary_index = idx"
                  >
                    <img :src="p" class="h-24 w-full object-cover" alt="room type" />
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

              <div v-else class="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No images selected.</div>
            </VaCardContent>
          </VaCard>
        </div>

        <!-- RIGHT Summary -->
        <div class="lg:col-span-4">
          <VaCard class="soft-card rounded-2xl lg:sticky lg:top-4">
            <VaCardContent class="p-4">
              <div class="flex items-start justify-between">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Summary</div>
                  <div class="text-xs text-slate-500">DB keys preview</div>
                </div>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                  {{ draft.base_currency }}
                </span>
              </div>

              <div class="mt-4 space-y-2 text-sm">
                <Row label="property_id" :value="String(draft.property_id)" />
                <Row label="type_code" :value="draft.type_code || '-'" />
                <Row label="type_name" :value="draft.type_name || '-'" />
                <Row label="room_class" :value="draft.room_class" />
                <Row label="bed_count" :value="String(draft.bed_count)" />
                <Row label="bed_type" :value="draft.bed_type" />
                <Row label="nightly_price" :value="money(draft.nightly_price, draft.base_currency)" />
                <Row label="weekend_price" :value="money(draft.weekend_price, draft.base_currency)" />
                <Row label="hourly_price" :value="money(draft.hourly_price, draft.base_currency)" />
                <Row label="monthly_price" :value="money(draft.monthly_price, draft.base_currency)" />
                <Row label="amenities[]" :value="draft.amenities.length ? `${draft.amenities.length} items` : '-'" />
                <Row label="status" :value="draft.status" />
              </div>

              <div class="mt-4 grid grid-cols-2 gap-2">
                <VaButton preset="secondary" class="rounded-2xl font-extrabold" :disabled="saving" @click="resetAll">Reset</VaButton>
                <VaButton color="primary" class="rounded-2xl font-extrabold" :disabled="!canSubmit || saving" @click="submit">Save</VaButton>
              </div>

              <div class="mt-3 text-[11px] text-slate-500">
                Backend payload keys are identical to your table columns.
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
import { computed, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

const router = useRouter()
const route = useRoute()

// EDIT mode (when you have id)
const isEdit = computed(() => Boolean(route.params?.id))

/**
 * IMPORTANT:
 * property_id must come from your auth/store.
 * For demo we hardcode = 1
 */
const defaultPropertyId = 1

const roomClassOptions = [
  { text: "Simple", value: "simple" },
  { text: "VIP", value: "vip" },
  { text: "Deluxe", value: "deluxe" },
  { text: "Suite", value: "suite" },
  { text: "Penthouse", value: "penthouse" },
]

const bedCountOptions = [
  { text: "1", value: 1 },
  { text: "2", value: 2 },
  { text: "3", value: 3 },
]

const bedTypeOptions = [
  { text: "Single", value: "single" },
  { text: "Double", value: "double" },
  { text: "Queen", value: "queen" },
  { text: "King", value: "king" },
  { text: "Twin", value: "twin" },
]

const currencyOptions = [
  { text: "USD", value: "USD" },
  { text: "KHR", value: "KHR" },
]

const statusOptions = [
  { text: "Active", value: "active" },
  { text: "Inactive", value: "inactive" },
]

// form (match room_types columns)
const draft = reactive({
  room_type_id: null, // for edit
  property_id: defaultPropertyId,

  room_class: "simple",
  bed_count: 1,
  bed_type: "double",

  type_code: "",
  type_name: "",
  type_name_khmer: "",

  base_currency: "USD",
  nightly_price: 0,
  hourly_price: null,
  monthly_price: null,
  weekend_price: null,

  max_occupancy: 2,
  max_adults: 2,
  max_children: 1,

  size_sqm: null,
  description: "",
  amenities: [], // JSON array

  status: "active",

  // images (room_images: room_type_id)
  files: /** @type {File[]} */ ([]),
  primary_index: 0,
})

const errors = reactive({
  basic: "",
  pricing: "",
  images: "",
})

const saving = ref(false)
const toast = ref("")
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ""), 2200)
}

const amenityInput = ref("")
const previews = ref([])

const canSubmit = computed(() => {
  if (!draft.property_id) return false
  if (!draft.type_code.trim()) return false
  if (!draft.type_name.trim()) return false
  if (!draft.room_class) return false
  if (!draft.bed_count) return false
  if (draft.nightly_price === null || draft.nightly_price === undefined || Number(draft.nightly_price) <= 0) return false
  return true
})

function validate() {
  errors.basic = ""
  errors.pricing = ""
  errors.images = ""

  if (!draft.property_id) errors.basic = "property_id is required"
  if (!draft.type_code.trim()) errors.basic = "type_code is required"
  if (!draft.type_name.trim()) errors.basic = "type_name is required"
  if (!draft.room_class) errors.basic = "room_class is required"
  if (!draft.bed_count) errors.basic = "bed_count is required"

  if (draft.nightly_price === null || draft.nightly_price === undefined || Number(draft.nightly_price) <= 0) {
    errors.pricing = "nightly_price must be > 0"
  }

  return !errors.basic && !errors.pricing && !errors.images
}

function addAmenity() {
  const v = amenityInput.value.trim()
  if (!v) return
  if (draft.amenities.includes(v)) return (amenityInput.value = "")
  draft.amenities.push(v)
  amenityInput.value = ""
}
function removeAmenity(idx) {
  draft.amenities.splice(idx, 1)
}

// Images
function onFiles(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return

  const max = 12
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
  if (draft.primary_index >= previews.value.length) draft.primary_index = Math.max(0, previews.value.length - 1)
}

function clearFiles() {
  previews.value.forEach((u) => URL.revokeObjectURL(u))
  previews.value = []
  draft.files = []
  draft.primary_index = 0
  errors.images = ""
}

function resetAll() {
  // keep property_id
  draft.room_class = "simple"
  draft.bed_count = 1
  draft.bed_type = "double"
  draft.type_code = ""
  draft.type_name = ""
  draft.type_name_khmer = ""
  draft.base_currency = "USD"
  draft.nightly_price = 0
  draft.hourly_price = null
  draft.monthly_price = null
  draft.weekend_price = null
  draft.max_occupancy = 2
  draft.max_adults = 2
  draft.max_children = 1
  draft.size_sqm = null
  draft.description = ""
  draft.amenities = []
  draft.status = "active"
  clearFiles()
  errors.basic = ""
  errors.pricing = ""
  errors.images = ""
  showToast("Reset done.")
}

async function submit() {
  if (!validate()) return showToast("Please fix required fields.")

  saving.value = true
  try {
    /**
     * ✅ Backend payload keys MUST match table columns:
     * room_types: property_id, room_class, bed_count, bed_type, type_code, type_name, type_name_khmer,
     * base_currency, nightly_price, hourly_price, monthly_price, weekend_price,
     * max_occupancy, max_adults, max_children, size_sqm, description, amenities(JSON), status
     */
    const fd = new FormData()
    fd.append("property_id", String(draft.property_id))
    fd.append("room_class", draft.room_class)
    fd.append("bed_count", String(draft.bed_count))
    fd.append("bed_type", draft.bed_type)

    fd.append("type_code", draft.type_code.trim())
    fd.append("type_name", draft.type_name.trim())
    fd.append("type_name_khmer", draft.type_name_khmer || "")

    fd.append("base_currency", draft.base_currency)
    fd.append("nightly_price", String(Number(draft.nightly_price || 0)))
    fd.append("hourly_price", draft.hourly_price === null ? "" : String(Number(draft.hourly_price || 0)))
    fd.append("monthly_price", draft.monthly_price === null ? "" : String(Number(draft.monthly_price || 0)))
    fd.append("weekend_price", draft.weekend_price === null ? "" : String(Number(draft.weekend_price || 0)))

    fd.append("max_occupancy", String(draft.max_occupancy))
    fd.append("max_adults", String(draft.max_adults))
    fd.append("max_children", String(draft.max_children))

    fd.append("size_sqm", draft.size_sqm === null ? "" : String(Number(draft.size_sqm || 0)))
    fd.append("description", draft.description || "")
    fd.append("amenities", JSON.stringify(draft.amenities || []))
    fd.append("status", draft.status)

    // room_images for room_type_id (create later, you can save after creating room_type_id)
    fd.append("primary_index", String(draft.primary_index))
    draft.files.forEach((f) => fd.append("images[]", f))

    // TODO: Laravel API
    // if (isEdit.value) await api.post(`/api/room-types/${route.params.id}`, fd)
    // else await api.post(`/api/room-types`, fd)

    await new Promise((r) => setTimeout(r, 600))
    showToast("Saved (demo). Connect Laravel API.")
    router.push({ name: "admin.room-types" })
  } catch (e) {
    showToast("Save failed.")
  } finally {
    saving.value = false
  }
}

function money(v, currency = "USD") {
  const n = Number(v || 0)
  const sym = currency === "USD" ? "$" : "៛"
  return `${sym}${n.toFixed(2)}`
}

// small component for summary rows
const Row = {
  props: { label: String, value: String },
  template: `
    <div class="flex items-center justify-between">
      <span class="text-slate-600">{{ label }}</span>
      <span class="font-extrabold text-slate-900">{{ value }}</span>
    </div>
  `,
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

.soft-card {
  border: none !important;
  background: #fff !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
}

:deep(.ctrl .va-input-wrapper__container),

:deep(.ctrl .va-input-wrapper__container:focus-within),

</style>