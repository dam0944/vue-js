<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">group</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Guests</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Manage guest profiles (VIP, loyalty, contacts).
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            @click="resetFilters"
          >
            Reset
          </button>

          <RouterLink
            to="/admin/guests/create"
            class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
          >
            <span class="material-icons text-[18px]">person_add</span>
            New Guest
          </RouterLink>
        </div>
      </div>

      <!-- Filters (flat) -->
      <div class="mt-5 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label class="block">
          <span class="text-xs font-bold text-slate-600">Search</span>
          <div class="mt-1 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
            <span class="material-icons text-slate-400 text-[18px]">search</span>
            <input
              v-model.trim="q"
              type="text"
              class="w-full bg-transparent text-sm text-slate-900 outline-none"
              placeholder="Name, phone, email, guest no..."
            />
          </div>
        </label>

        <label class="block">
          <span class="text-xs font-bold text-slate-600">Loyalty Tier</span>
          <select v-model="tier" class="mt-1 w-full rounded-xl bg-slate-100 px-3 py-2 text-sm outline-none">
            <option value="">All</option>
            <option value="none">none</option>
            <option value="bronze">bronze</option>
            <option value="silver">silver</option>
            <option value="gold">gold</option>
            <option value="platinum">platinum</option>
          </select>
        </label>

        <label class="block">
          <span class="text-xs font-bold text-slate-600">VIP</span>
          <select v-model="vip" class="mt-1 w-full rounded-xl bg-slate-100 px-3 py-2 text-sm outline-none">
            <option value="">All</option>
            <option value="1">VIP</option>
            <option value="0">Normal</option>
          </select>
        </label>

        <label class="block">
          <span class="text-xs font-bold text-slate-600">Sort</span>
          <select v-model="sort" class="mt-1 w-full rounded-xl bg-slate-100 px-3 py-2 text-sm outline-none">
            <option value="updated_desc">Updated (new → old)</option>
            <option value="name_asc">Name (A → Z)</option>
            <option value="spent_desc">Total spent (high → low)</option>
            <option value="stays_desc">Total stays (high → low)</option>
          </select>
        </label>
      </div>

      <!-- List area (flat) -->
      <div class="mt-4 rounded-2xl bg-white">
        <div class="flex items-center justify-between px-4 py-3">
          <div class="text-sm font-bold text-slate-900">
            {{ filtered.length }} guests
          </div>
          <div class="text-xs text-slate-500">Click a row to edit</div>
        </div>

        <!-- Divider -->
        <div class="h-px bg-slate-100"></div>

        <!-- Skeleton -->
        <div v-if="loading" class="p-4">
          <div class="space-y-3">
            <div v-for="i in 8" :key="i" class="h-12 animate-pulse rounded-xl bg-slate-100"></div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="!filtered.length" class="p-10 text-center">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
            <span class="material-icons text-slate-500">person_off</span>
          </div>
          <div class="text-sm font-bold text-slate-900">No guests found</div>
          <div class="mt-1 text-sm text-slate-500">Try changing filters or create a new guest.</div>
        </div>

        <!-- Rows (flat list instead of bordered table) -->
        <div v-else class="divide-y divide-slate-100">
          <div
            v-for="g in filtered"
            :key="g.guest_id"
            class="px-4 py-4 hover:bg-slate-50 cursor-pointer"
            @click="goEdit(g.guest_id)"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shrink-0">
                  {{ initials(g.first_name, g.last_name) }}
                </div>

                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <div class="truncate font-extrabold text-slate-900">
                      {{ g.first_name }} {{ g.last_name }}
                    </div>

                    <span
                      v-if="toBool(g.vip_status)"
                      class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700"
                    >
                      VIP
                    </span>

                    <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                      {{ g.loyalty_tier || "none" }}
                    </span>
                  </div>

                  <div class="truncate text-xs text-slate-500">
                    {{ g.guest_number || "—" }} • {{ g.phone }} • {{ g.email || "—" }}
                  </div>

                  <div class="truncate text-xs text-slate-500">
                    {{ g.nationality || "—" }} • {{ g.city || "—" }}, {{ g.country || "—" }}
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between sm:justify-end gap-3">
                <div class="text-right text-xs text-slate-500 hidden sm:block">
                  <div>Stays: <span class="font-bold text-slate-900">{{ g.total_stays ?? 0 }}</span></div>
                  <div>Spent: <span class="font-bold text-slate-900">${{ money(g.total_spent) }}</span></div>
                </div>

                <button
                  type="button"
                  class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                  @click.stop="goEdit(g.guest_id)"
                >
                  Edit
                </button>

                <button
                  type="button"
                  class="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  @click.stop="removeGuest(g.guest_id)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div class="px-4 py-3 text-xs text-slate-500">
            Static demo: delete only removes from UI (no API yet).
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { guests as seedGuests } from "@/data/guest/guests"

const router = useRouter()

const loading = ref(true)
const rows = ref([])

const q = ref("")
const tier = ref("")
const vip = ref("")
const sort = ref("updated_desc")

onMounted(() => {
  setTimeout(() => {
    rows.value = seedGuests.map(x => ({ ...x }))
    loading.value = false
  }, 650)
})

function toBool(v) {
  return v === true || v === 1 || v === "1"
}
function initials(first, last) {
  const f = (first || "").trim().charAt(0).toUpperCase()
  const l = (last || "").trim().charAt(0).toUpperCase()
  return (f + l) || "G"
}
function money(v) {
  return Number(v || 0).toFixed(2)
}
function normalizeStr(s) {
  return String(s || "").toLowerCase()
}

const filtered = computed(() => {
  const query = normalizeStr(q.value)
  let list = rows.value.filter(g => !g.deleted_at)

  if (query) {
    list = list.filter(g => {
      const hay = [
        g.guest_number,
        g.first_name,
        g.last_name,
        g.full_name_khmer,
        g.phone,
        g.phone_secondary,
        g.email,
        g.id_number,
      ].map(normalizeStr).join(" ")
      return hay.includes(query)
    })
  }

  if (tier.value) list = list.filter(g => String(g.loyalty_tier || "none") === tier.value)
  if (vip.value !== "") {
    const want = vip.value === "1"
    list = list.filter(g => toBool(g.vip_status) === want)
  }

  const byName = (a, b) => (`${a.first_name || ""} ${a.last_name || ""}`).toLowerCase()
    .localeCompare((`${b.first_name || ""} ${b.last_name || ""}`).toLowerCase())

  const byUpdatedDesc = (a, b) =>
    String(b.updated_at || b.created_at || "").localeCompare(String(a.updated_at || a.created_at || ""))

  const bySpentDesc = (a, b) => Number(b.total_spent || 0) - Number(a.total_spent || 0)
  const byStaysDesc = (a, b) => Number(b.total_stays || 0) - Number(a.total_stays || 0)

  if (sort.value === "name_asc") list = [...list].sort(byName)
  if (sort.value === "updated_desc") list = [...list].sort(byUpdatedDesc)
  if (sort.value === "spent_desc") list = [...list].sort(bySpentDesc)
  if (sort.value === "stays_desc") list = [...list].sort(byStaysDesc)

  return list
})

function resetFilters() {
  q.value = ""
  tier.value = ""
  vip.value = ""
  sort.value = "updated_desc"
}
function goEdit(id) {
  router.push(`/admin/guests/${id}/edit`)
}
function removeGuest(id) {
  const idx = rows.value.findIndex(x => x.guest_id === id)
  if (idx >= 0) rows.value[idx] = { ...rows.value[idx], deleted_at: new Date().toISOString() }
}
</script>