<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">add_box</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Create Room Type</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Follow database table <b>room_types</b>.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            class="rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-200"
            type="button"
            @click="resetForm"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">refresh</span>
            Reset
          </button>

          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-40"
            type="button"
            :disabled="!canSubmit"
            @click="submit"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">save</span>
            Save
          </button>
        </div>
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-12">
        <!-- Left -->
        <div class="lg:col-span-8 space-y-4">
          <!-- Basic -->
          <section class="rounded-2xl bg-white p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-extrabold text-slate-900">Basic Info</div>
                <div class="text-xs text-slate-500">Name, code, class, status.</div>
              </div>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                Property #{{ form.property_id }}
              </span>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Type Name *</label>
                <input v-model.trim="form.type_name" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="Deluxe King" />
                <div v-if="errors.type_name" class="mt-1 text-xs font-extrabold text-rose-600">{{ errors.type_name }}</div>
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Type Code *</label>
                <input v-model.trim="form.type_code" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="DLX-KNG" />
                <div v-if="errors.type_code" class="mt-1 text-xs font-extrabold text-rose-600">{{ errors.type_code }}</div>
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Room Class *</label>
                <select v-model="form.room_class" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                  <option value="economy">Economy</option>
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                  <option value="penthouse">Penthouse</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Status *</label>
                <select v-model="form.status" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Type Name (Khmer)</label>
                <input v-model.trim="form.type_name_khmer" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="ឌីលាក់ King" />
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Currency</label>
                <select v-model="form.base_currency" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                  <option value="USD">USD</option>
                  <option value="KHR">KHR</option>
                </select>
              </div>
            </div>
          </section>

          <!-- Beds & Occupancy -->
          <section class="rounded-2xl bg-white p-4">
            <div class="text-sm font-extrabold text-slate-900">Beds & Occupancy</div>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Bed Count *</label>
                <input v-model.number="form.bed_count" type="number" min="1" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Bed Type *</label>
                <select v-model="form.bed_type" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="queen">Queen</option>
                  <option value="king">King</option>
                  <option value="twin">Twin</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Max Occupancy</label>
                <input v-model.number="form.max_occupancy" type="number" min="1" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Size (sqm)</label>
                <input v-model.number="form.size_sqm" type="number" min="0" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Max Adults</label>
                <input v-model.number="form.max_adults" type="number" min="0" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Max Children</label>
                <input v-model.number="form.max_children" type="number" min="0" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
              </div>
            </div>
          </section>

          <!-- Pricing -->
          <section class="rounded-2xl bg-white p-4">
            <div class="text-sm font-extrabold text-slate-900">Pricing</div>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Nightly Price *</label>
                <input v-model.number="form.nightly_price" type="number" min="0" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Hourly Price</label>
                <input v-model.number="form.hourly_price" type="number" min="0" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Monthly Price</label>
                <input v-model.number="form.monthly_price" type="number" min="0" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Weekend Price</label>
                <input v-model.number="form.weekend_price" type="number" min="0" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
              </div>
            </div>
          </section>

          <!-- Amenities + Description -->
          <section class="rounded-2xl bg-white p-4">
            <div class="text-sm font-extrabold text-slate-900">Amenities</div>

            <label class="mt-3 mb-1 block text-xs font-bold text-slate-500">Amenities (comma separated)</label>
            <input
              v-model.trim="amenitiesText"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="WiFi, AC, Hot Water, TV"
            />

            <label class="mt-3 mb-1 block text-xs font-bold text-slate-500">Description</label>
            <textarea v-model.trim="form.description" rows="3" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
          </section>
        </div>

        <!-- Right summary -->
        <div class="lg:col-span-4">
          <div class="rounded-2xl bg-white p-4 lg:sticky lg:top-4">
            <div class="text-sm font-extrabold text-slate-900">Preview</div>
            <div class="mt-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div class="font-extrabold text-slate-900">{{ form.type_name || "-" }}</div>
              <div class="mt-1 text-xs text-slate-500">
                {{ form.type_code || "-" }} • {{ pretty(form.room_class) }} • {{ form.bed_count }} bed(s) • {{ pretty(form.bed_type) }}
              </div>

              <div class="mt-3 grid grid-cols-3 gap-2">
                <div class="rounded-2xl bg-white p-3">
                  <div class="text-[10px] font-extrabold text-slate-500">Night</div>
                  <div class="mt-1 font-extrabold text-slate-900">{{ money(form.nightly_price) }}</div>
                </div>
                <div class="rounded-2xl bg-white p-3">
                  <div class="text-[10px] font-extrabold text-slate-500">Hour</div>
                  <div class="mt-1 font-extrabold text-slate-900">{{ money(form.hourly_price) }}</div>
                </div>
                <div class="rounded-2xl bg-white p-3">
                  <div class="text-[10px] font-extrabold text-slate-500">Month</div>
                  <div class="mt-1 font-extrabold text-slate-900">{{ money(form.monthly_price) }}</div>
                </div>
              </div>

              <div class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="(a, idx) in (form.amenities || []).slice(0, 6)"
                  :key="idx"
                  class="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-slate-700"
                >
                  {{ a }}
                </span>
              </div>
            </div>

            <router-link
              to="/admin/rooms/types"
              class="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-200"
            >
              <span class="material-icons mr-1 text-[18px]">arrow_back</span>
              Back to list
            </router-link>

            <div class="mt-2 text-[11px] text-slate-500">
              Demo: Submit prints JSON in console. Later connect to API → table <b>room_types</b>.
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
import { computed, reactive, ref, watch } from "vue"

const toast = ref("")
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ""), 2200)
}

const form = reactive({
  property_id: 1,

  room_class: "standard",
  bed_count: 1,
  bed_type: "double",

  type_code: "",
  type_name: "",
  type_name_khmer: "",

  base_currency: "USD",
  nightly_price: 0,
  hourly_price: 0,
  monthly_price: 0,
  weekend_price: 0,

  max_occupancy: 2,
  max_adults: 2,
  max_children: 1,

  size_sqm: null,

  description: "",
  amenities: [],
  status: "active",
})

const amenitiesText = ref("")
watch(amenitiesText, () => {
  form.amenities = amenitiesText.value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
})

const errors = reactive({ type_name: "", type_code: "" })

function validate() {
  errors.type_name = ""
  errors.type_code = ""

  if (!form.type_name) errors.type_name = "Type name is required"
  if (!form.type_code) errors.type_code = "Type code is required"

  return !errors.type_name && !errors.type_code
}

const canSubmit = computed(() => {
  return !!form.type_name && !!form.type_code && Number(form.nightly_price || 0) >= 0
})

function resetForm() {
  Object.assign(form, {
    property_id: 1,
    room_class: "standard",
    bed_count: 1,
    bed_type: "double",
    type_code: "",
    type_name: "",
    type_name_khmer: "",
    base_currency: "USD",
    nightly_price: 0,
    hourly_price: 0,
    monthly_price: 0,
    weekend_price: 0,
    max_occupancy: 2,
    max_adults: 2,
    max_children: 1,
    size_sqm: null,
    description: "",
    amenities: [],
    status: "active",
  })
  amenitiesText.value = ""
  showToast("Reset done.")
}

function submit() {
  if (!validate()) return showToast("Please check required fields.")
  const payload = JSON.parse(JSON.stringify(form))
  console.log("CREATE ROOM TYPE PAYLOAD:", payload)
  showToast("Saved (demo). Connect API later.")
}

function money(v) {
  const n = Number(v || 0)
  return `$${n.toFixed(2)}`
}

function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}
</script>
