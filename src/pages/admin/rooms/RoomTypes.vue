<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto w-full space-y-4">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <VaIcon name="hotel" color="secondary" />
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Room Types</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Table: <b>room_types</b> • pricing (hour/night/month/weekend) • amenities JSON • status.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="resetFilters">
            <VaIcon name="refresh" class="mr-1" /> Reset
          </VaButton>

          <VaButton color="primary" class="rounded-2xl font-extrabold" to="/admin/rooms/types/create">
            <VaIcon name="add" class="mr-1" /> Create Type
          </VaButton>
        </div>
      </div>

      <!-- Filters -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent class="p-4">
          <div class="grid gap-3 lg:grid-cols-12">
            <div class="lg:col-span-5">
              <VaInput v-model.trim="q" label="Search" placeholder="type_name, type_code, class, bed..." clearable class="ctrl">
                <template #prependInner>
                  <VaIcon name="search" color="secondary" size="18px" />
                </template>
              </VaInput>
            </div>

            <div class="lg:col-span-7 grid gap-3 sm:grid-cols-3">
              <VaSelect
                v-model="statusFilter"
                label="Status (room_types.status)"
                class="ctrl"
                :options="statusOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                clearable
              />
              <VaSelect
                v-model="classFilter"
                label="Room class (room_types.room_class)"
                class="ctrl"
                :options="classOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                clearable
              />
              <VaSelect
                v-model="bedsFilter"
                label="Bed count (room_types.bed_count)"
                class="ctrl"
                :options="bedsOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                clearable
              />
            </div>
          </div>

          <!-- chips -->
          <div class="mt-3 flex flex-wrap gap-2">
            <VaChip
              v-for="chip in chips"
              :key="chip.key"
              size="small"
              class="cursor-pointer select-none rounded-2xl font-extrabold"
              :outline="chip.key !== activeChip"
              :color="chip.key === activeChip ? 'primary' : 'secondary'"
              @click="activeChip = chip.key"
            >
              {{ chip.label }}
              <span class="ml-2 text-[11px]" :class="chip.key === activeChip ? 'text-white/90' : 'text-slate-500'">
                ({{ chip.count }})
              </span>
            </VaChip>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Grid -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <VaCard v-for="t in paginated" :key="t.room_type_id" class="soft-card rounded-2xl">
          <VaCardContent class="p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="truncate text-sm font-extrabold text-slate-900">{{ t.type_name }}</div>
                <div class="mt-1 text-xs text-slate-500">
                  {{ t.type_code }}
                  • {{ pretty(t.room_class) }}
                  • {{ t.bed_count }} bed(s) • {{ pretty(t.bed_type) }}
                </div>
              </div>

              <span class="rounded-full px-3 py-1 text-[11px] font-extrabold" :class="statusPill(t.status)">
                {{ pretty(t.status) }}
              </span>
            </div>

            <!-- Pricing (match columns) -->
            <div class="mt-4 grid grid-cols-2 gap-2">
              <div class="soft-sub rounded-2xl p-3">
                <div class="text-[10px] font-extrabold text-slate-500">nightly_price</div>
                <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(t.nightly_price, t.base_currency) }}</div>
              </div>
              <div class="soft-sub rounded-2xl p-3">
                <div class="text-[10px] font-extrabold text-slate-500">weekend_price</div>
                <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(t.weekend_price, t.base_currency) }}</div>
              </div>
              <div class="soft-sub rounded-2xl p-3">
                <div class="text-[10px] font-extrabold text-slate-500">hourly_price</div>
                <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(t.hourly_price, t.base_currency) }}</div>
              </div>
              <div class="soft-sub rounded-2xl p-3">
                <div class="text-[10px] font-extrabold text-slate-500">monthly_price</div>
                <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(t.monthly_price, t.base_currency) }}</div>
              </div>
            </div>

            <!-- Amenities JSON -->
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="(a, idx) in (t.amenities || []).slice(0, 4)"
                :key="idx"
                class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700"
              >
                {{ a }}
              </span>
              <span
                v-if="(t.amenities || []).length > 4"
                class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700"
              >
                +{{ (t.amenities || []).length - 4 }}
              </span>
            </div>

            <div class="mt-3 text-xs text-slate-500">
              max_occupancy: <b class="text-slate-900">{{ t.max_occupancy }}</b>
              • max_adults: <b class="text-slate-900">{{ t.max_adults }}</b>
              • max_children: <b class="text-slate-900">{{ t.max_children }}</b>
            </div>

            <div class="mt-4 flex gap-2">
              <VaButton preset="secondary" size="small" class="w-full rounded-2xl font-extrabold" >
                Edit
              </VaButton>
              <VaButton
                size="small"
                class="w-full rounded-2xl font-extrabold"
                :color="t.status === 'active' ? 'secondary' : 'primary'"
                @click="toggleStatusDemo(t)"
              >
                {{ t.status === "active" ? "Deactivate" : "Activate" }}
              </VaButton>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Empty -->
      <VaCard v-if="filtered.length === 0" class="soft-card rounded-2xl">
        <VaCardContent class="p-8 text-center">
          <div class="text-slate-900 font-extrabold">No room types found</div>
          <div class="mt-1 text-sm text-slate-500">Try another keyword or clear filters.</div>
          <VaButton preset="secondary" class="mt-4 rounded-2xl font-extrabold" @click="resetFilters">Reset</VaButton>
        </VaCardContent>
      </VaCard>

      <!-- Pagination -->
      <div v-if="filtered.length > 0" class="flex items-center justify-between">
        <VaButton preset="secondary" class="rounded-2xl font-extrabold" :disabled="page === 1" @click="page--">Prev</VaButton>

        <div class="text-xs text-slate-500">
          Page <span class="font-extrabold text-slate-900">{{ page }}</span> /
          <span class="font-extrabold text-slate-900">{{ totalPages }}</span>
          • <span class="font-extrabold text-slate-900">{{ filtered.length }}</span> rows
        </div>

        <VaButton preset="secondary" class="rounded-2xl font-extrabold" :disabled="page === totalPages" @click="page++">Next</VaButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { room_type } from "@/data/room/room_type"

const router = useRouter()

const types = ref([...room_type])

const q = ref("")
const statusFilter = ref(null) // 'active'|'inactive' or null
const classFilter = ref(null) // enum room_class or null
const bedsFilter = ref(null) // 1|2|3 or null
const activeChip = ref("all")

const page = ref(1)
const pageSize = 12

watch([q, statusFilter, classFilter, bedsFilter, activeChip], () => (page.value = 1))

const statusOptions = computed(() => [
  { text: "Active", value: "active" },
  { text: "Inactive", value: "inactive" },
])

const classOptions = computed(() => [
  { text: "Simple", value: "simple" },
  { text: "VIP", value: "vip" },
  { text: "Deluxe", value: "deluxe" },
  { text: "Suite", value: "suite" },
  { text: "Penthouse", value: "penthouse" },
])

const bedsOptions = computed(() => [
  { text: "1 bed", value: 1 },
  { text: "2 beds", value: 2 },
  { text: "3 beds", value: 3 },
])

const chips = computed(() => {
  const count = (key) => {
    if (key === "all") return types.value.length
    if (key === "active") return types.value.filter((x) => x.status === "active").length
    if (key === "inactive") return types.value.filter((x) => x.status === "inactive").length
    if (key === "hourly") return types.value.filter((x) => Number(x.hourly_price || 0) > 0).length
    if (key === "monthly") return types.value.filter((x) => Number(x.monthly_price || 0) > 0).length
    return 0
  }
  return [
    { key: "all", label: "All", count: count("all") },
    { key: "active", label: "Active", count: count("active") },
    { key: "inactive", label: "Inactive", count: count("inactive") },
    { key: "hourly", label: "Has Hourly", count: count("hourly") },
    { key: "monthly", label: "Has Monthly", count: count("monthly") },
  ]
})

const filtered = computed(() => {
  const kw = q.value.trim().toLowerCase()

  return types.value.filter((t) => {
    // chip
    if (activeChip.value === "active" && t.status !== "active") return false
    if (activeChip.value === "inactive" && t.status !== "inactive") return false
    if (activeChip.value === "hourly" && !(Number(t.hourly_price || 0) > 0)) return false
    if (activeChip.value === "monthly" && !(Number(t.monthly_price || 0) > 0)) return false

    // filters
    if (statusFilter.value && t.status !== statusFilter.value) return false
    if (classFilter.value && t.room_class !== classFilter.value) return false
    if (bedsFilter.value !== null && bedsFilter.value !== undefined) {
      if (Number(t.bed_count) !== Number(bedsFilter.value)) return false
    }

    if (!kw) return true
    const blob = [
      t.type_name,
      t.type_name_khmer,
      t.type_code,
      t.room_class,
      t.bed_type,
      t.bed_count,
      ...(t.amenities || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return blob.includes(kw)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function resetFilters() {
  q.value = ""
  statusFilter.value = null
  classFilter.value = null
  bedsFilter.value = null
  activeChip.value = "all"
  page.value = 1
}

function goEdit(t) {
  router.push({ name: "admin.room-types.edit", params: { id: t.room_type_id } })
}

function toggleStatusDemo(t) {
  t.status = t.status === "active" ? "inactive" : "active"
}

function statusPill(status) {
  if (status === "active") return "bg-emerald-100 text-emerald-800"
  if (status === "inactive") return "bg-slate-200 text-slate-800"
  return "bg-slate-100 text-slate-700"
}

function money(v, currency = "USD") {
  const n = Number(v || 0)
  const sym = currency === "USD" ? "$" : "៛"
  return `${sym}${n.toFixed(2)}`
}

function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}
</script>

<style scoped>
.soft-card {
  border: none !important;
  background: #fff !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
}
.soft-sub {
  background: rgba(2, 8, 23, 0.02);
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06);
}

:deep(.ctrl .va-input-wrapper__container),
:deep(.ctrl .va-select__anchor) {
  background: rgb(241 245 249) !important; /* slate-100 */
  border: 0 !important;
  border-radius: 16px !important;
  min-height: 44px !important;
}
:deep(.ctrl .va-input-wrapper__container:focus-within),
:deep(.ctrl .va-select__anchor:focus-within) {
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08) !important;
}
</style>
