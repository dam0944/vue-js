<script setup>
import { ref, computed, reactive } from "vue"
import { room_rate as seed } from "@/data/room/room_rate"
import { room_type as roomTypesSeed } from "@/data/room/room_type"

/**
 * Tailwind UI only (no Vuestic)
 * Clean guesthouse management style
 */

const rates = ref(seed.map((x) => ({ ...x })))
const roomTypes = ref(roomTypesSeed.map((x) => ({ ...x })))

const q = ref("")
const typeId = ref("")
const rateType = ref("")
const active = ref("")
const sort = ref("type")

const money = (n, cur = "USD") => `${cur} ${Number(n || 0).toFixed(2)}`

const typeNameById = (id) =>
  roomTypes.value.find((t) => Number(t.room_type_id) === Number(id))?.type_name || `Type #${id}`

const safe = (v) => (v ?? "").toString().toLowerCase()

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rates.value.filter((r) => {
    const hit =
      !key ||
      safe(typeNameById(r.room_type_id)).includes(key) ||
      safe(r.rate_type).includes(key) ||
      safe(r.description).includes(key) ||
      safe(r.currency).includes(key) ||
      String(r.amount ?? "").includes(key)

    const okType = !typeId.value || String(r.room_type_id) === String(typeId.value)
    const okRateType = !rateType.value || r.rate_type === rateType.value
    const okActive =
      active.value === ""
        ? true
        : active.value === "active"
        ? !!r.is_active
        : !r.is_active

    return hit && okType && okRateType && okActive
  })

  if (sort.value === "type") {
    list.sort((a, b) => typeNameById(a.room_type_id).localeCompare(typeNameById(b.room_type_id)))
  }
  if (sort.value === "amountHigh") list.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
  if (sort.value === "amountLow") list.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0))
  if (sort.value === "newest") list.sort((a, b) => Number(b.rate_id || 0) - Number(a.rate_id || 0))

  return list
})

/* Modal state */
const modalOpen = ref(false)
const mode = ref("create") // create | edit | view
const selected = ref(null)

const form = reactive({
  rate_id: null,
  room_type_id: "",
  rate_type: "hour", // hour | night
  currency: "USD",
  amount: 0,
  description: "",
  is_active: true,
})

function resetForm() {
  form.rate_id = null
  form.room_type_id = String(roomTypes.value[0]?.room_type_id || "")
  form.rate_type = "hour"
  form.currency = "USD"
  form.amount = 0
  form.description = ""
  form.is_active = true
}

function openCreate() {
  mode.value = "create"
  selected.value = null
  resetForm()
  modalOpen.value = true
}

function openView(r) {
  mode.value = "view"
  selected.value = r
  modalOpen.value = true
}

function openEdit(r) {
  mode.value = "edit"
  selected.value = r

  form.rate_id = r.rate_id
  form.room_type_id = String(r.room_type_id)
  form.rate_type = r.rate_type
  form.currency = r.currency
  form.amount = Number(r.amount || 0)
  form.description = r.description || ""
  form.is_active = !!r.is_active

  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  selected.value = null
}

function saveCreate() {
  if (!form.room_type_id || !form.amount) {
    alert("Room type and amount are required.")
    return
  }

  const nextId = Math.max(...rates.value.map((x) => x.rate_id || 0), 0) + 1
  rates.value.unshift({
    rate_id: nextId,
    room_type_id: Number(form.room_type_id),
    rate_type: form.rate_type,
    currency: form.currency,
    amount: Number(form.amount),
    description: form.description,
    is_active: !!form.is_active,
  })

  closeModal()
}

function saveEdit() {
  const idx = rates.value.findIndex((x) => x.rate_id === form.rate_id)
  if (idx === -1) return closeModal()

  rates.value.splice(idx, 1, {
    ...rates.value[idx],
    room_type_id: Number(form.room_type_id),
    rate_type: form.rate_type,
    currency: form.currency,
    amount: Number(form.amount),
    description: form.description,
    is_active: !!form.is_active,
  })

  closeModal()
}

function toggleActive(r) {
  r.is_active = !r.is_active
}

const totalCount = computed(() => rates.value.length)
const activeCount = computed(() => rates.value.filter((r) => r.is_active).length)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto px-4 py-7">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900">Room Rates</h1>
          <p class="mt-1 text-sm font-semibold text-slate-500">
            Manage hourly & nightly rates for guesthouse room types
          </p>
        </div>

        <div class="flex gap-2">
          <button
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
            @click="q=''; typeId=''; rateType=''; active=''; sort='type'"
          >
            Reset
          </button>

          <button
            class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99]"
            @click="openCreate"
          >
            + Add Rate
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="text-xs font-extrabold text-slate-500">Total Rates</div>
          <div class="mt-1 text-2xl font-black text-slate-900">{{ totalCount }}</div>
        </div>

        <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div class="text-xs font-extrabold text-emerald-700">Active Rates</div>
          <div class="mt-1 text-2xl font-black text-emerald-900">{{ activeCount }}</div>
        </div>

        <div class="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <div class="text-xs font-extrabold text-blue-700">Tip</div>
          <div class="mt-1 text-sm font-extrabold text-blue-900">
            Use Hour for short stays (3h) and Night for overnight stays.
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div class="md:col-span-2">
            <label class="text-xs font-extrabold text-slate-600">Search</label>
            <input
              v-model="q"
              placeholder="Type name, hour/night, description..."
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-300"
            />
          </div>

          <div>
            <label class="text-xs font-extrabold text-slate-600">Room Type</label>
            <select
              v-model="typeId"
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-300"
            >
              <option value="">All</option>
              <option v-for="t in roomTypes" :key="t.room_type_id" :value="String(t.room_type_id)">
                {{ t.type_name }}
              </option>
            </select>
          </div>

          <div>
            <label class="text-xs font-extrabold text-slate-600">Rate Type</label>
            <select
              v-model="rateType"
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-300"
            >
              <option value="">All</option>
              <option value="hour">Hour</option>
              <option value="night">Night</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-extrabold text-slate-600">Status</label>
            <select
              v-model="active"
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-300"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="md:col-span-5">
            <label class="text-xs font-extrabold text-slate-600">Sort</label>
            <select
              v-model="sort"
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-300"
            >
              <option value="type">Room Type</option>
              <option value="amountHigh">Amount (High)</option>
              <option value="amountLow">Amount (Low)</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-slate-50">
              <tr class="text-left text-xs font-black uppercase tracking-wide text-slate-500">
                <th class="px-4 py-3">Type</th>
                <th class="px-4 py-3">Rate</th>
                <th class="px-4 py-3">Currency</th>
                <th class="px-4 py-3">Description</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr v-if="filtered.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-sm font-extrabold text-slate-500">
                  No room rates found.
                </td>
              </tr>

              <tr v-for="r in filtered" :key="r.rate_id" class="hover:bg-slate-50">
                <td class="px-4 py-3">
                  <div class="text-sm font-black text-slate-900">
                    {{ typeNameById(r.room_type_id) }}
                  </div>
                  <div class="mt-1 text-xs font-extrabold text-slate-500">
                    ID: {{ r.rate_id }}
                  </div>
                </td>

                <td class="px-4 py-3">
                  <div class="inline-flex items-center gap-2">
                    <span
                      class="rounded-full border px-2.5 py-1 text-xs font-black"
                      :class="r.rate_type === 'hour'
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-800'
                        : 'border-blue-200 bg-blue-50 text-blue-800'"
                    >
                      {{ r.rate_type.toUpperCase() }}
                    </span>

                    <span class="text-sm font-black text-slate-900">
                      {{ money(r.amount, r.currency) }}
                    </span>
                  </div>
                </td>

                <td class="px-4 py-3">
                  <span class="text-sm font-extrabold text-slate-700">
                    {{ r.currency }}
                  </span>
                </td>

                <td class="px-4 py-3">
                  <div class="text-sm font-semibold text-slate-700">
                    {{ r.description || "-" }}
                  </div>
                </td>

                <td class="px-4 py-3">
                  <button
                    class="rounded-full border px-3 py-1 text-xs font-black"
                    :class="r.is_active
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800'"
                    @click="toggleActive(r)"
                  >
                    {{ r.is_active ? "ACTIVE" : "INACTIVE" }}
                  </button>
                </td>

                <td class="px-4 py-3 text-right">
                  <div class="inline-flex flex-wrap justify-end gap-2">
                    <button
                      class="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                      @click="openView(r)"
                    >
                      View
                    </button>
                    <button
                      class="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-slate-800"
                      @click="openEdit(r)"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="modalOpen" class="fixed inset-0 z-[99999] bg-slate-900/50 p-4">
        <div class="mx-auto mt-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <!-- header -->
          <div class="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4">
            <div>
              <div class="text-base font-black text-slate-900">
                {{ mode === "view" ? "Room Rate Details" : mode === "create" ? "Create Rate" : "Edit Rate" }}
              </div>
              <div class="mt-1 text-xs font-extrabold text-slate-500">
                {{ mode === "view" ? `Rate ID: ${selected?.rate_id}` : "Set rate for guesthouse booking (hour/night)" }}
              </div>
            </div>

            <button
              class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
              @click="closeModal"
            >
              Close
            </button>
          </div>

          <!-- body -->
          <div class="px-5 py-5">
            <!-- VIEW -->
            <div v-if="mode === 'view'" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-slate-200 bg-white p-4">
                <div class="text-xs font-extrabold text-slate-500">Room Type</div>
                <div class="mt-1 text-lg font-black text-slate-900">
                  {{ typeNameById(selected?.room_type_id) }}
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-4">
                <div class="text-xs font-extrabold text-slate-500">Rate</div>
                <div class="mt-1 text-lg font-black text-slate-900">
                  {{ money(selected?.amount, selected?.currency) }}
                </div>
                <div class="mt-1 text-xs font-extrabold text-slate-500">
                  Type: {{ selected?.rate_type }}
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                <div class="text-xs font-extrabold text-slate-500">Description</div>
                <div class="mt-1 text-sm font-semibold text-slate-800">
                  {{ selected?.description || "-" }}
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                <div class="text-xs font-extrabold text-slate-500">Status</div>
                <div class="mt-1 text-sm font-black text-slate-900">
                  {{ selected?.is_active ? "ACTIVE" : "INACTIVE" }}
                </div>
              </div>
            </div>

            <!-- CREATE / EDIT -->
            <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label class="text-xs font-extrabold text-slate-600">Room Type *</label>
                <select
                  v-model="form.room_type_id"
                  class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-300"
                >
                  <option v-for="t in roomTypes" :key="t.room_type_id" :value="String(t.room_type_id)">
                    {{ t.type_name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="text-xs font-extrabold text-slate-600">Rate Type</label>
                <select
                  v-model="form.rate_type"
                  class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-300"
                >
                  <option value="hour">Hour</option>
                  <option value="night">Night</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-extrabold text-slate-600">Currency</label>
                <select
                  v-model="form.currency"
                  class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-300"
                >
                  <option value="USD">USD</option>
                  <option value="KHR">KHR</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-extrabold text-slate-600">Amount *</label>
                <input
                  v-model.number="form.amount"
                  type="number"
                  class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-300"
                />
              </div>

              <div class="flex items-end gap-2">
                <input
                  id="active"
                  v-model="form.is_active"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300"
                />
                <label for="active" class="text-sm font-extrabold text-slate-700">
                  Active
                </label>
              </div>

              <div class="sm:col-span-2">
                <label class="text-xs font-extrabold text-slate-600">Description</label>
                <input
                  v-model="form.description"
                  placeholder="ex: Standard room hourly rate"
                  class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-300"
                />
              </div>

              <!-- Preview -->
              <div class="sm:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div class="text-xs font-extrabold text-slate-500">Preview</div>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-700">
                    {{ typeNameById(form.room_type_id) }}
                  </span>
                  <span
                    class="rounded-full border px-3 py-1 text-xs font-black"
                    :class="form.rate_type === 'hour'
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-800'
                      : 'border-blue-200 bg-blue-50 text-blue-800'"
                  >
                    {{ form.rate_type.toUpperCase() }}
                  </span>
                  <span class="text-sm font-black text-slate-900">
                    {{ money(form.amount, form.currency) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- footer -->
          <div class="flex justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4">
            <button
              class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
              @click="closeModal"
            >
              Cancel
            </button>

            <button
              v-if="mode === 'view'"
              class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
              @click="openEdit(selected)"
            >
              Edit
            </button>

            <button
              v-else-if="mode === 'create'"
              class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-emerald-700"
              @click="saveCreate"
            >
              Save
            </button>

            <button
              v-else
              class="rounded-xl bg-emerald-600 px-4 py-2  text-sm font-extrabold text-white hover:bg-emerald-700"
              @click="saveEdit"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
