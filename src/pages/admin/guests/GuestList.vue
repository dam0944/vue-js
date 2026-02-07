<!-- src/pages/admin/guests/Guests.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <VaIcon name="group" color="secondary" />
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Guests</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">Manage guest profiles (VIP, loyalty, contacts).</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="resetFilters">
            <VaIcon name="refresh" class="mr-1" />
            Reset
          </VaButton>

          <VaButton color="primary" class="rounded-2xl font-extrabold" @click="router.push('/admin/guests/create')">
            <VaIcon name="person_add" class="mr-1" />
            New Guest
          </VaButton>
        </div>
      </div>

      <!-- Filters -->
      <VaCard class="soft-card mt-5 rounded-2xl">
        <VaCardContent class="p-4">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <VaInput
              v-model.trim="q"
              class="ctrl"
              label="Search"
              placeholder="Name, phone, email, guest no..."
              clearable
            >
              <template #prependInner>
                <VaIcon name="search" color="secondary" />
              </template>
            </VaInput>

            <VaSelect
              v-model="tier"
              class="ctrl"
              label="Loyalty Tier"
              :options="tierOptions"
              :text-by="(o) => o.text"
              :value-by="(o) => o.value"
              clearable
              placeholder="All"
            />

            <VaSelect
              v-model="vip"
              class="ctrl"
              label="VIP"
              :options="vipOptions"
              :text-by="(o) => o.text"
              :value-by="(o) => o.value"
              clearable
              placeholder="All"
            />

            <VaSelect
              v-model="sort"
              class="ctrl"
              label="Sort"
              :options="sortOptions"
              :text-by="(o) => o.text"
              :value-by="(o) => o.value"
            />
          </div>

          <!-- Quick stats row -->
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
              Total: <span class="text-slate-900">{{ rowsLiveCount }}</span>
            </span>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
              Showing: <span class="text-slate-900">{{ filtered.length }}</span>
            </span>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
              VIP: <span class="text-slate-900">{{ vipCount }}</span>
            </span>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- List -->
      <VaCard class="soft-card mt-4 rounded-2xl">
        <VaCardContent class="p-0">
          <!-- Top bar -->
          <div class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-sm font-extrabold text-slate-900">
              {{ filtered.length }} guests
              <span v-if="filtered.length > 0" class="text-slate-500 font-bold">
                • Page {{ page }} / {{ totalPages }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <VaSelect
                v-model="pageSize"
                class="mini"
                label="Per page"
                :options="pageSizeOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />

              <VaPagination
                v-if="filtered.length > 0"
                v-model="page"
                :pages="totalPages"
                :visible-pages="5"
                buttons-preset="secondary"
                active-button-preset="primary"
              />
            </div>
          </div>

          <div class="h-px bg-slate-100"></div>

          <!-- Skeleton -->
          <div v-if="loading" class="p-4">
            <div class="space-y-3">
              <div v-for="i in 8" :key="i" class="h-14 animate-pulse rounded-2xl bg-slate-100"></div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="!filtered.length" class="p-10 text-center">
            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <VaIcon name="person_off" color="secondary" />
            </div>
            <div class="text-sm font-extrabold text-slate-900">No guests found</div>
            <div class="mt-1 text-sm text-slate-500">Try changing filters or create a new guest.</div>
          </div>

          <!-- Header row (desktop) -->
          <div v-else class="hidden items-center gap-3 px-4 py-3 text-xs font-extrabold text-slate-500 md:grid md:grid-cols-12">
            <div class="md:col-span-6">Guest</div>
            <div class="md:col-span-2">Phone</div>
            <div class="md:col-span-2 text-right">Stays / Spent</div>
            <div class="md:col-span-2 text-right">Action</div>
          </div>

          <div v-if="!loading && filtered.length" class="h-px bg-slate-100"></div>

          <!-- Rows -->
          <div v-if="!loading && filtered.length" class="divide-y divide-slate-100">
            <div
              v-for="g in paginated"
              :key="g.guest_id"
              class="px-4 py-4 hover:bg-slate-50"
            >
              <div class="grid gap-3 md:grid-cols-12 md:items-center">
                <!-- Guest -->
                <button
                  type="button"
                  class="text-left md:col-span-6"
                  @click="goEdit(g.guest_id)"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-extrabold text-white">
                      {{ initials(g.first_name, g.last_name) }}
                    </div>

                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <div class="truncate font-extrabold text-slate-900">
                          {{ g.first_name }} {{ g.last_name }}
                        </div>

                        <!-- VIP + Tier (better contrast like your clean room board) -->
                        <span
                          v-if="toBool(g.vip_status)"
                          class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold text-amber-800"
                        >
                          VIP
                        </span>

                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-700">
                          {{ (g.loyalty_tier || "none") }}
                        </span>
                      </div>

                      <div class="mt-1 truncate text-xs text-slate-500">
                        {{ g.guest_number || "—" }}
                        <span class="text-slate-300">•</span>
                        {{ g.email || "—" }}
                      </div>

                      <div class="truncate text-xs text-slate-500">
                        {{ g.nationality || "—" }}
                        <span class="text-slate-300">•</span>
                        {{ g.city || "—" }}, {{ g.country || "—" }}
                      </div>
                    </div>
                  </div>
                </button>

                <!-- Phone -->
                <div class="md:col-span-2">
                  <div class="text-xs font-extrabold text-slate-500 md:hidden">Phone</div>
                  <div class="text-sm font-extrabold text-slate-900">{{ g.phone || "—" }}</div>
                  <div class="text-xs text-slate-500">{{ g.phone_secondary || "" }}</div>
                </div>

                <!-- Stats -->
                <div class="md:col-span-2 md:text-right">
                  <div class="text-xs font-extrabold text-slate-500 md:hidden">Stays / Spent</div>
                  <div class="text-sm font-extrabold text-slate-900">
                    {{ g.total_stays ?? 0 }} stay(s)
                  </div>
                  <div class="text-xs text-slate-500">
                    Spent: <span class="font-extrabold text-slate-700">${{ money(g.total_spent) }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="md:col-span-2 md:text-right">
                  <div class="flex flex-wrap items-center gap-2 md:justify-end">
                    <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click.stop="goEdit(g.guest_id)">
                      <VaIcon name="edit" class="mr-1" />
                      Edit
                    </VaButton>

                    <VaButton
                      color="danger"
                      preset="secondary"
                      size="small"
                      class="rounded-2xl font-extrabold"
                      @click.stop="removeGuest(g.guest_id)"
                    >
                      <VaIcon name="delete" class="mr-1" />
                      Delete
                    </VaButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom pagination -->
            <div class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="text-xs text-slate-500">
                Showing <span class="font-extrabold text-slate-900">{{ startItem }}</span>–<span class="font-extrabold text-slate-900">{{ endItem }}</span>
                of <span class="font-extrabold text-slate-900">{{ filtered.length }}</span>
              </div>

              <VaPagination
                v-model="page"
                :pages="totalPages"
                :visible-pages="7"
                buttons-preset="secondary"
                active-button-preset="primary"
              />
            </div>

            <div class="px-4 pb-4 text-xs text-slate-500">
              Static demo: delete only removes from UI (no API yet).
            </div>
          </div>
        </VaCardContent>
      </VaCard>

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
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { guests as seedGuests } from "@/data/guest/guests"

const router = useRouter()

const loading = ref(true)
const rows = ref([])

const q = ref("")
const tier = ref(null) // null = all
const vip = ref(null) // null = all, true/false
const sort = ref("updated_desc")

// pagination
const page = ref(1)
const pageSize = ref(8)
const pageSizeOptions = [
  { text: "8", value: 8 },
  { text: "12", value: 12 },
  { text: "20", value: 20 },
  { text: "50", value: 50 },
]

// toast
const toast = ref("")
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ""), 2200)
}

const tierOptions = [
  { text: "All", value: null },
  { text: "none", value: "none" },
  { text: "bronze", value: "bronze" },
  { text: "silver", value: "silver" },
  { text: "gold", value: "gold" },
  { text: "platinum", value: "platinum" },
]

const vipOptions = [
  { text: "All", value: null },
  { text: "VIP", value: true },
  { text: "Normal", value: false },
]

const sortOptions = [
  { text: "Updated (new → old)", value: "updated_desc" },
  { text: "Name (A → Z)", value: "name_asc" },
  { text: "Total spent (high → low)", value: "spent_desc" },
  { text: "Total stays (high → low)", value: "stays_desc" },
]

onMounted(() => {
  setTimeout(() => {
    rows.value = (seedGuests || []).map((x) => ({ ...x }))
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

const rowsLiveCount = computed(() => rows.value.filter((g) => !g.deleted_at).length)
const vipCount = computed(() => rows.value.filter((g) => !g.deleted_at && toBool(g.vip_status)).length)

const filtered = computed(() => {
  const query = normalizeStr(q.value)
  let list = rows.value.filter((g) => !g.deleted_at)

  if (query) {
    list = list.filter((g) => {
      const hay = [
        g.guest_number,
        g.first_name,
        g.last_name,
        g.full_name_khmer,
        g.phone,
        g.phone_secondary,
        g.email,
        g.id_number,
      ]
        .map(normalizeStr)
        .join(" ")
      return hay.includes(query)
    })
  }

  if (tier.value) list = list.filter((g) => String(g.loyalty_tier || "none") === tier.value)
  if (vip.value !== null) list = list.filter((g) => toBool(g.vip_status) === vip.value)

  const byName = (a, b) =>
    (`${a.first_name || ""} ${a.last_name || ""}`).toLowerCase().localeCompare(
      (`${b.first_name || ""} ${b.last_name || ""}`).toLowerCase()
    )

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

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / Number(pageSize.value || 8))))

const paginated = computed(() => {
  const ps = Number(pageSize.value || 8)
  const start = (page.value - 1) * ps
  return filtered.value.slice(start, start + ps)
})

const startItem = computed(() => {
  if (!filtered.value.length) return 0
  return (page.value - 1) * Number(pageSize.value || 8) + 1
})
const endItem = computed(() => {
  const e = (page.value - 1) * Number(pageSize.value || 8) + paginated.value.length
  return Math.min(e, filtered.value.length)
})

// keep page valid when filters/pageSize change
watch([q, tier, vip, sort, pageSize], () => {
  page.value = 1
})
watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
})

function resetFilters() {
  q.value = ""
  tier.value = null
  vip.value = null
  sort.value = "updated_desc"
  page.value = 1
  showToast("Reset done.")
}
function goEdit(id) {
  router.push(`/admin/guests/${id}/edit`)
}
function removeGuest(id) {
  const idx = rows.value.findIndex((x) => x.guest_id === id)
  if (idx >= 0) rows.value[idx] = { ...rows.value[idx], deleted_at: new Date().toISOString() }
  showToast("Deleted (demo).")
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

/* Vuestic controls look like your soft inputs */
:deep(.ctrl .va-input-wrapper__container),
:deep(.ctrl .va-select__anchor) {
  background: rgb(241 245 249) !important;
  border: 0 !important;
  border-radius: 16px !important;
  min-height: 44px !important;
}
:deep(.ctrl .va-input-wrapper__container:focus-within),
:deep(.ctrl .va-select__anchor:focus-within) {
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08) !important;
}

/* smaller select for "Per page" */
:deep(.mini .va-select__anchor) {
  border-radius: 9999px !important;
  min-height: 38px !important;
}
</style>
