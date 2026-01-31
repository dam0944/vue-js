<!-- src/pages/guests/GuestsVip.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">workspace_premium</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">VIP Guests</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">High-value guests • Loyalty tiers • Quick actions</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-100"
            @click="refresh()"
          >
            <span class="material-icons mr-2 align-[-6px] text-[18px]">refresh</span>
            Refresh
          </button>

          <RouterLink
            :to="{ name: 'guest-create' }"
            class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <span class="material-icons mr-2 align-[-6px] text-[18px]">person_add</span>
            New Guest
          </RouterLink>
        </div>
      </div>

      <!-- Stats -->
      <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div class="text-xs font-semibold text-slate-500">VIP Guests</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.total }}</div>
        </div>
        <div class="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div class="text-xs font-semibold text-slate-500">Total Spent (USD)</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ formatMoney(stats.totalSpent) }}</div>
        </div>
        <div class="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div class="text-xs font-semibold text-slate-500">Total Stays</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.totalStays }}</div>
        </div>
        <div class="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div class="text-xs font-semibold text-slate-500">Total Nights</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.totalNights }}</div>
        </div>
      </div>

      <!-- Controls -->
      <div class="mt-5 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div class="relative w-full sm:max-w-sm">
              <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                v-model.trim="q"
                type="text"
                placeholder="Search name, phone, guest number…"
                class="w-full rounded-xl bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-emerald-300"
              />
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="t in tierOptions"
                :key="t.value"
                type="button"
                class="rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-slate-200 hover:bg-slate-50"
                :class="tier === t.value ? 'bg-emerald-600 text-white ring-emerald-600 hover:bg-emerald-700' : 'bg-white text-slate-700'"
                @click="tier = t.value"
              >
                {{ t.label }}
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              @click="sortKey = sortKey === 'spent' ? 'stays' : 'spent'"
            >
              <span class="material-icons mr-1 align-[-4px] text-[16px]">sort</span>
              Sort: {{ sortKey === "spent" ? "Spent" : "Stays" }}
            </button>

            <button
              type="button"
              class="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              @click="showDetails = !showDetails"
            >
              <span class="material-icons mr-1 align-[-4px] text-[16px]">tune</span>
              {{ showDetails ? "Compact" : "Details" }}
            </button>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="mt-4">
        <!-- Skeleton loading -->
        <div v-if="loading" class="grid gap-3">
          <div v-for="i in 6" :key="i" class="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="h-4 w-40 animate-pulse rounded-full bg-slate-200"></div>
                <div class="mt-3 grid max-w-xl grid-cols-2 gap-2">
                  <div class="h-3 w-28 animate-pulse rounded-full bg-slate-200"></div>
                  <div class="h-3 w-24 animate-pulse rounded-full bg-slate-200"></div>
                  <div class="h-3 w-40 animate-pulse rounded-full bg-slate-200"></div>
                  <div class="h-3 w-36 animate-pulse rounded-full bg-slate-200"></div>
                </div>
              </div>
              <div class="flex gap-2">
                <div class="h-9 w-9 animate-pulse rounded-full bg-slate-200"></div>
                <div class="h-9 w-9 animate-pulse rounded-full bg-slate-200"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <span class="material-icons text-slate-600">person_search</span>
          </div>
          <div class="mt-3 text-sm font-semibold text-slate-900">No VIP guests found</div>
          <div class="mt-1 text-sm text-slate-500">Try another keyword or change tier filter.</div>
        </div>

        <!-- Data -->
        <div v-else class="grid gap-3">
          <article
            v-for="g in filtered"
            :key="g.guest_id"
            class="rounded-2xl bg-white p-4 ring-1 ring-slate-200"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="truncate text-sm font-extrabold text-slate-900">
                    {{ g.first_name }} {{ g.last_name }}
                  </div>

                  <span class="rounded-full px-2 py-1 text-[11px] font-extrabold" :class="tierPillClass(g.loyalty_tier)">
                    {{ (String(g.loyalty_tier || "none")).toUpperCase() }}
                  </span>

                  <span class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-extrabold text-amber-800">
                    VIP
                  </span>
                </div>

                <div class="mt-2 grid gap-x-4 gap-y-1 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-[18px] text-slate-400">badge</span>
                    <span class="truncate">{{ g.guest_number || "—" }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-[18px] text-slate-400">call</span>
                    <span class="truncate">{{ g.phone || "—" }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-[18px] text-slate-400">public</span>
                    <span class="truncate">{{ g.nationality || "—" }}</span>
                  </div>

                  <template v-if="showDetails">
                    <div class="flex items-center gap-2">
                      <span class="material-icons text-[18px] text-slate-400">attach_money</span>
                      <span class="truncate font-semibold text-slate-800">{{ formatMoney(g.total_spent) }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="material-icons text-[18px] text-slate-400">hotel</span>
                      <span class="truncate">Stays: <b class="text-slate-800">{{ g.total_stays || 0 }}</b></span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="material-icons text-[18px] text-slate-400">nights_stay</span>
                      <span class="truncate">Nights: <b class="text-slate-800">{{ g.total_nights || 0 }}</b></span>
                    </div>
                  </template>
                </div>

                <div v-if="g.notes && showDetails" class="mt-3 text-sm text-slate-600">
                  <span class="font-semibold text-slate-800">Note:</span> {{ g.notes }}
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 self-start">
                <button
                  type="button"
                  class="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                  title="Copy phone"
                  @click="copyPhone(g.phone)"
                >
                  <span class="material-icons text-[20px]">content_copy</span>
                </button>

                <RouterLink
                  :to="{ name: 'guest-view', params: { guestId: String(g.guest_id) } }"
                  class="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                  title="View guest"
                >
                  <span class="material-icons text-[20px]">visibility</span>
                </RouterLink>

                <RouterLink
                  :to="{ name: 'guest-edit', params: { guestId: String(g.guest_id) } }"
                  class="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  title="Edit guest"
                >
                  <span class="material-icons text-[20px]">edit</span>
                </RouterLink>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Footer hint -->
      <div class="mt-6 text-xs text-slate-500">
        Tip: VIP comes from <code class="rounded bg-slate-100 px-2 py-1">vip_status = true</code> in your
        <code class="rounded bg-slate-100 px-2 py-1">guests</code> table.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { RouterLink } from "vue-router"
import { guestsVip } from "@/data/guest/guestsVip" // static data

const loading = ref(true)

const q = ref("")
const qDebounced = ref("")
let qTimer = null

const tier = ref("all") // all | bronze | silver | gold | platinum | none
const sortKey = ref("spent") // spent | stays
const showDetails = ref(false)

const tierOptions = [
  { value: "all", label: "All Tiers" },
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "none", label: "None" },
]

const data = ref([])

function refresh() {
  loading.value = true
  setTimeout(() => {
    // VIP only
    data.value = guestsVip.filter((g) => g.vip_status === true)
    loading.value = false
  }, 650)
}

onMounted(() => refresh())

watch(
  () => q.value,
  (v) => {
    clearTimeout(qTimer)
    qTimer = setTimeout(() => {
      qDebounced.value = String(v || "")
    }, 200)
  },
  { immediate: true }
)

const filtered = computed(() => {
  const keyword = qDebounced.value.trim().toLowerCase()

  // filter first
  let rows = data.value.filter((g) => {
    const guestTier = normalizeTier(g.loyalty_tier)

    if (tier.value !== "all" && guestTier !== tier.value) return false
    if (!keyword) return true

    const hay = [
      g.guest_number,
      g.first_name,
      g.last_name,
      g.phone,
      g.email,
      g.nationality,
      g.id_number,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return hay.includes(keyword)
  })

  // sort copy (do not mutate original refs unexpectedly)
  rows = [...rows].sort((a, b) => {
    if (sortKey.value === "stays") return (Number(b.total_stays || 0) - Number(a.total_stays || 0))
    return (Number(b.total_spent || 0) - Number(a.total_spent || 0))
  })

  return rows
})

const stats = computed(() => {
  const rows = data.value
  return {
    total: rows.length,
    totalSpent: rows.reduce((s, r) => s + Number(r.total_spent || 0), 0),
    totalStays: rows.reduce((s, r) => s + Number(r.total_stays || 0), 0),
    totalNights: rows.reduce((s, r) => s + Number(r.total_nights || 0), 0),
  }
})

function normalizeTier(t) {
  const v = String(t || "none").toLowerCase()
  if (["bronze", "silver", "gold", "platinum"].includes(v)) return v
  return "none"
}

function formatMoney(v) {
  const n = Number(v || 0)
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return `$${n.toFixed(2)}`
  }
}

function tierPillClass(t) {
  const v = normalizeTier(t)
  if (v === "platinum") return "bg-indigo-100 text-indigo-800"
  if (v === "gold") return "bg-amber-100 text-amber-800"
  if (v === "silver") return "bg-slate-200 text-slate-800"
  if (v === "bronze") return "bg-orange-100 text-orange-800"
  return "bg-slate-100 text-slate-700"
}

async function copyPhone(phone) {
  const p = String(phone || "").trim()
  if (!p) return

  try {
    await navigator.clipboard.writeText(p)
  } catch {
    // fallback (older browsers)
    const el = document.createElement("textarea")
    el.value = p
    el.setAttribute("readonly", "")
    el.style.position = "absolute"
    el.style.left = "-9999px"
    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
  }
}
</script>
