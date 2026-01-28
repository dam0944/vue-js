<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">hotel</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Room Types</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Manage room types • pricing (hour/night/month) • amenities • status.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            class="rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-200"
            type="button"
            @click="resetFilters"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">refresh</span>
            Reset
          </button>

          <!-- ✅ redirect to create page -->
          <router-link
            to="/create/room/types"
            class="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">add</span>
            Create Type
          </router-link>
        </div>
      </div>

      <!-- Controls -->
      <section class="mt-4 rounded-2xl bg-white p-4">
        <div class="grid gap-3 lg:grid-cols-12">
          <div class="lg:col-span-5">
            <label class="mb-1 block text-xs font-bold text-slate-500">Search</label>
            <div class="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
              <span class="material-icons text-[18px] text-slate-500">search</span>
              <input
                v-model.trim="q"
                class="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search name / code / class / bed..."
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

          <div class="lg:col-span-7 grid gap-3 sm:grid-cols-3">
            <div>
              <label class="mb-1 block text-xs font-bold text-slate-500">Status</label>
              <select v-model="statusFilter" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-xs font-bold text-slate-500">Class</label>
              <select v-model="classFilter" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                <option value="all">All</option>
                <option v-for="c in classOptions" :key="c" :value="c">{{ pretty(c) }}</option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-xs font-bold text-slate-500">Beds</label>
              <select v-model="bedsFilter" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                <option value="all">All</option>
                <option :value="1">1 bed</option>
                <option :value="2">2 beds</option>
                <option :value="3">3 beds</option>
              </select>
            </div>
          </div>
        </div>

        <!-- chips -->
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="chip in chips"
            :key="chip.key"
            class="rounded-full px-4 py-2 text-xs font-extrabold"
            :class="chip.key === activeChip ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'"
            type="button"
            @click="activeChip = chip.key"
          >
            {{ chip.label }}
            <span class="ml-1 text-[11px]" :class="chip.key === activeChip ? 'text-white/80' : 'text-slate-500'">
              ({{ chip.count }})
            </span>
          </button>
        </div>
      </section>

      <!-- Grid -->
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="t in paginated"
          :key="t.room_type_id"
          class="rounded-2xl bg-white p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="truncate text-sm font-extrabold text-slate-900">
                {{ t.type_name }}
              </div>
              <div class="mt-1 text-xs text-slate-500">
                {{ t.type_code }} • {{ pretty(t.room_class) }} • {{ t.bed_count }} bed(s) • {{ pretty(t.bed_type) }}
              </div>
            </div>
            <span class="rounded-full px-3 py-1 text-[11px] font-extrabold" :class="statusPill(t.status)">
              {{ pretty(t.status) }}
            </span>
          </div>

          <div class="mt-4 grid grid-cols-3 gap-2">
            <div class="rounded-2xl bg-slate-100 p-3">
              <div class="text-[10px] font-extrabold text-slate-500">Night</div>
              <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(t.nightly_price) }}</div>
            </div>
            <div class="rounded-2xl bg-slate-100 p-3">
              <div class="text-[10px] font-extrabold text-slate-500">Hour</div>
              <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(t.hourly_price) }}</div>
            </div>
            <div class="rounded-2xl bg-slate-100 p-3">
              <div class="text-[10px] font-extrabold text-slate-500">Month</div>
              <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(t.monthly_price) }}</div>
            </div>
          </div>

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
            Max: <b class="text-slate-900">{{ t.max_occupancy }}</b> • Size: <b class="text-slate-900">{{ t.size_sqm ?? "-" }}</b> sqm
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="filtered.length === 0" class="mt-6 rounded-2xl bg-white p-6 text-center">
        <div class="text-slate-900 font-extrabold">No room types found</div>
        <div class="mt-1 text-sm text-slate-500">Try another keyword or clear filters.</div>
        <button class="mt-4 rounded-full bg-slate-100 px-5 py-2 text-sm font-extrabold hover:bg-slate-200" type="button" @click="resetFilters">
          Reset
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="filtered.length > 0" class="mt-4 flex items-center justify-between">
        <button
          class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-200 disabled:opacity-40"
          :disabled="page === 1"
          type="button"
          @click="page--"
        >
          Prev
        </button>

        <div class="text-xs text-slate-500">
          Page <span class="font-extrabold text-slate-900">{{ page }}</span> of
          <span class="font-extrabold text-slate-900">{{ totalPages }}</span>
          • <span class="font-extrabold text-slate-900">{{ filtered.length }}</span> types
        </div>

        <button
          class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-200 disabled:opacity-40"
          :disabled="page === totalPages"
          type="button"
          @click="page++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { room_type } from "@/data/room/room_type"

const types = ref([...room_type])

const q = ref("")
const statusFilter = ref("all")
const classFilter = ref("all")
const bedsFilter = ref("all")
const activeChip = ref("all")

const page = ref(1)
const pageSize = 12

watch([q, statusFilter, classFilter, bedsFilter, activeChip], () => (page.value = 1))

const classOptions = computed(() => {
  const s = new Set(types.value.map((x) => x.room_class).filter(Boolean))
  return Array.from(s)
})

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
    // chip filter
    if (activeChip.value === "active" && t.status !== "active") return false
    if (activeChip.value === "inactive" && t.status !== "inactive") return false
    if (activeChip.value === "hourly" && !(Number(t.hourly_price || 0) > 0)) return false
    if (activeChip.value === "monthly" && !(Number(t.monthly_price || 0) > 0)) return false

    // select filters
    if (statusFilter.value !== "all" && t.status !== statusFilter.value) return false
    if (classFilter.value !== "all" && t.room_class !== classFilter.value) return false
    if (bedsFilter.value !== "all" && Number(t.bed_count) !== Number(bedsFilter.value)) return false

    if (!kw) return true
    const blob = `${t.type_name} ${t.type_code} ${t.room_class} ${t.bed_type} ${t.bed_count}`.toLowerCase()
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
  statusFilter.value = "all"
  classFilter.value = "all"
  bedsFilter.value = "all"
  activeChip.value = "all"
  page.value = 1
}

function statusPill(status) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800"
    case "inactive":
      return "bg-slate-200 text-slate-800"
    default:
      return "bg-slate-100 text-slate-700"
  }
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
