<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">payments</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Payments</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Track money received per invoice. Filter by status / method / currency.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            @click="goCreate"
          >
            + New Payment
          </button>
        </div>
      </div>

      <!-- Controls (borderless, shadowless) -->
      <div class="mt-4 grid gap-2 sm:grid-cols-12">
        <div class="sm:col-span-5">
          <div class="rounded-2xl bg-white/70 px-4 py-3">
            <div class="flex items-center gap-2">
              <span class="material-icons text-slate-400">search</span>
              <input
                v-model.trim="q"
                type="text"
                class="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                placeholder="Search payment #, invoice id, reference, processed_by…"
              />
            </div>
          </div>
        </div>

        <div class="sm:col-span-2">
          <div class="rounded-2xl bg-white/70 px-4 py-3">
            <select v-model="status" class="w-full bg-transparent text-sm text-slate-900 focus:outline-none">
              <option value="all">All status</option>
              <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <div class="sm:col-span-3">
          <div class="rounded-2xl bg-white/70 px-4 py-3">
            <select v-model="method" class="w-full bg-transparent text-sm text-slate-900 focus:outline-none">
              <option value="all">All methods</option>
              <option v-for="m in METHODS" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </div>

        <div class="sm:col-span-2">
          <div class="rounded-2xl bg-white/70 px-4 py-3">
            <select v-model="currency" class="w-full bg-transparent text-sm text-slate-900 focus:outline-none">
              <option value="all">All currency</option>
              <option value="USD">USD</option>
              <option value="KHR">KHR</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="mt-4 grid gap-2 sm:grid-cols-3">
        <div class="rounded-2xl bg-white/70 p-4">
          <div class="text-xs font-semibold text-slate-500">Total records</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ filtered.length }}</div>
        </div>
        <div class="rounded-2xl bg-white/70 p-4">
          <div class="text-xs font-semibold text-slate-500">Completed (USD sum)</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ moneyUSD(completedUsdSum) }}</div>
        </div>
        <div class="rounded-2xl bg-white/70 p-4">
          <div class="text-xs font-semibold text-slate-500">Pending count</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ pendingCount }}</div>
        </div>
      </div>

      <!-- List -->
      <div class="mt-4">
        <!-- Skeleton -->
        <div v-if="loading" class="grid gap-2">
          <div v-for="i in 8" :key="i" class="rounded-2xl bg-white/70 p-4">
            <div class="h-4 w-1/3 animate-pulse rounded bg-slate-200"></div>
            <div class="mt-3 h-3 w-2/3 animate-pulse rounded bg-slate-200"></div>
            <div class="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-200"></div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="rounded-2xl bg-white/70 p-6 text-center">
          <div class="text-sm font-semibold text-slate-800">No payments found</div>
          <p class="mt-1 text-sm text-slate-500">Try changing filters or search keywords.</p>
        </div>

        <!-- Rows -->
        <div v-else class="grid gap-2">
          <div
            v-for="p in paged"
            :key="p.payment_id"
            class="rounded-2xl bg-white/70 p-4 transition hover:bg-white"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="truncate text-sm font-extrabold text-slate-900">
                    {{ p.payment_number }}
                  </div>

                  <span
                    class="rounded-full px-2 py-1 text-[11px] font-bold"
                    :class="badgeClass(p.status)"
                  >
                    {{ p.status }}
                  </span>

                  <span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
                    {{ p.payment_method }}
                  </span>

                  <span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
                    {{ p.payment_currency }}
                  </span>
                </div>

                <div class="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <span class="text-slate-400">Invoice:</span>
                    <span class="font-semibold text-slate-700">#{{ p.invoice_id }}</span>
                    <span class="mx-2 text-slate-300">•</span>
                    <span class="text-slate-400">Property:</span>
                    <span class="font-semibold text-slate-700">#{{ p.property_id }}</span>
                  </div>

                  <div>
                    <span class="text-slate-400">Date:</span>
                    <span class="font-semibold text-slate-700">{{ fmtDate(p.payment_date) }}</span>
                  </div>

                  <div v-if="p.reference_number">
                    <span class="text-slate-400">Ref:</span>
                    <span class="font-semibold text-slate-700">{{ p.reference_number }}</span>
                  </div>

                  <div v-if="p.card_type">
                    <span class="text-slate-400">Card:</span>
                    <span class="font-semibold text-slate-700">{{ p.card_type }}</span>
                  </div>

                  <div>
                    <span class="text-slate-400">Processed by:</span>
                    <span class="font-semibold text-slate-700">User #{{ p.processed_by }}</span>
                  </div>

                  <div v-if="p.notes" class="sm:col-span-2">
                    <span class="text-slate-400">Notes:</span>
                    <span class="text-slate-700">{{ p.notes }}</span>
                  </div>
                </div>
              </div>

              <div class="flex flex-col items-start gap-2 sm:items-end">
                <div class="text-xl font-extrabold text-slate-900">
                  {{ money(p.amount, p.payment_currency) }}
                </div>
                <div class="text-xs text-slate-500">
                  Base: {{ moneyUSD(p.amount_in_base_currency ?? 0) }} • Rate: {{ p.exchange_rate }}
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="rounded-full bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                    @click="goEdit(p.payment_id)"
                  >
                    Edit
                  </button>
                  <button
                    class="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    @click="copy(p.payment_number)"
                  >
                    Copy #
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="mt-2 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <div class="text-sm text-slate-500">
              Showing <span class="font-semibold text-slate-700">{{ startRow + 1 }}</span>
              –
              <span class="font-semibold text-slate-700">{{ Math.min(startRow + pageSize, filtered.length) }}</span>
              of <span class="font-semibold text-slate-700">{{ filtered.length }}</span>
            </div>

            <div class="flex items-center gap-2">
              <button
                class="rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-white disabled:opacity-40"
                :disabled="page === 1"
                @click="page--"
              >
                Prev
              </button>
              <div class="rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-slate-700">
                Page {{ page }} / {{ totalPages }}
              </div>
              <button
                class="rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-white disabled:opacity-40"
                :disabled="page >= totalPages"
                @click="page++"
              >
                Next
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { payments as staticPayments } from "@/data/billding/payments"

const router = useRouter()

const loading = ref(true)

const q = ref("")
const status = ref("all")
const method = ref("all")
const currency = ref("all")

const page = ref(1)
const pageSize = 8

const STATUSES = ["pending", "completed", "failed", "refunded", "cancelled"]
const METHODS = ["cash", "credit_card", "debit_card", "bank_transfer", "aba", "wing", "true_money", "pi_pay", "other"]

const rows = ref([])

onMounted(() => {
  // simulate API loading (skeleton)
  setTimeout(() => {
    rows.value = Array.isArray(staticPayments) ? [...staticPayments].sort((a, b) => b.payment_id - a.payment_id) : []
    loading.value = false
  }, 650)
})

watch([q, status, method, currency], () => {
  page.value = 1
})

const filtered = computed(() => {
  const query = q.value.toLowerCase()

  return rows.value.filter(p => {
    const hitQ =
      !query ||
      String(p.payment_number || "").toLowerCase().includes(query) ||
      String(p.invoice_id || "").includes(query) ||
      String(p.reference_number || "").toLowerCase().includes(query) ||
      String(p.processed_by || "").includes(query)

    const hitStatus = status.value === "all" || p.status === status.value
    const hitMethod = method.value === "all" || p.payment_method === method.value
    const hitCurrency = currency.value === "all" || p.payment_currency === currency.value

    return hitQ && hitStatus && hitMethod && hitCurrency
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const startRow = computed(() => (page.value - 1) * pageSize)
const paged = computed(() => filtered.value.slice(startRow.value, startRow.value + pageSize))

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
})

const pendingCount = computed(() => filtered.value.filter(x => x.status === "pending").length)
const completedUsdSum = computed(() => {
  return filtered.value
    .filter(x => x.status === "completed" && x.payment_currency === "USD")
    .reduce((sum, x) => sum + Number(x.amount || 0), 0)
})

function goCreate() {
  router.push({ name: "billing-payments-create" })
}

function goEdit(paymentId) {
  router.push({ name: "billing-payments-edit", params: { paymentId: String(paymentId) } })
}

function fmtDate(s) {
  // keep it simple (works with "YYYY-MM-DD HH:mm:ss")
  return (s || "").replace("T", " ").slice(0, 16)
}

function money(amount, cur) {
  const n = Number(amount || 0)
  const symbol = cur === "KHR" ? "៛" : "$"
  return `${symbol}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function moneyUSD(amount) {
  const n = Number(amount || 0)
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function badgeClass(s) {
  if (s === "completed") return "bg-emerald-100 text-emerald-700"
  if (s === "pending") return "bg-amber-100 text-amber-700"
  if (s === "failed") return "bg-rose-100 text-rose-700"
  if (s === "refunded") return "bg-indigo-100 text-indigo-700"
  if (s === "cancelled") return "bg-slate-200 text-slate-700"
  return "bg-slate-100 text-slate-700"
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(String(text || ""))
  } catch (e) {
    // ignore
  }
}
</script>
