<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">payments</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Payments</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Track money received per invoice. Filter by status / method / currency.
          </p>
        </div>

        <VaButton color="primary" icon="add" @click="goCreate">
          New Payment
        </VaButton>
      </div>

      <!-- Filters -->
      <VaCard class="soft-card" :shadow="false" :bordered="false">
        <VaCardContent class="p-4">
          <div class="grid gap-3 md:grid-cols-12">
            <div class="md:col-span-5">
              <VaInput
                v-model.trim="q"
                placeholder="Search payment #, invoice id, ref, processed_by…"
                clearable
              >
                <template #prependInner>
                  <span class="material-icons text-slate-400 text-[18px]">search</span>
                </template>
              </VaInput>
            </div>

            <div class="md:col-span-2">
              <VaSelect
                v-model="status"
                :options="statusOptions"
                label="Status"
                text-by="label"
                value-by="value"
              />
            </div>

            <div class="md:col-span-3">
              <VaSelect
                v-model="method"
                :options="methodOptions"
                label="Method"
                text-by="label"
                value-by="value"
              />
            </div>

            <div class="md:col-span-2">
              <VaSelect
                v-model="currency"
                :options="currencyOptions"
                label="Currency"
                text-by="label"
                value-by="value"
              />
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div class="text-sm text-slate-500">
              Showing <b class="text-slate-900">{{ filtered.length }}</b> record(s)
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <VaSelect
                v-model="pageSize"
                :options="pageSizeOptions"
                label="Per page"
                class="w-[140px]"
              />
              <VaButton preset="secondary" color="secondary" icon="refresh" @click="resetFilters">
                Reset
              </VaButton>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Summary -->
      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <VaCard class="soft-card" :shadow="false" :bordered="false">
          <VaCardContent class="p-4">
            <div class="text-xs font-semibold text-slate-500">Total records</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ filtered.length }}</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card" :shadow="false" :bordered="false">
          <VaCardContent class="p-4">
            <div class="text-xs font-semibold text-slate-500">Completed (USD sum)</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ moneyUSD(completedUsdSum) }}</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card" :shadow="false" :bordered="false">
          <VaCardContent class="p-4">
            <div class="text-xs font-semibold text-slate-500">Pending count</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ pendingCount }}</div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- List -->
      <div class="mt-4">
        <!-- Skeleton -->
        <div v-if="loading" class="grid gap-3">
          <VaCard v-for="i in 8" :key="i" class="soft-card" :shadow="false" :bordered="false">
            <VaCardContent class="p-4">
              <div class="h-4 w-1/3 animate-pulse rounded bg-slate-200"></div>
              <div class="mt-3 h-3 w-2/3 animate-pulse rounded bg-slate-200"></div>
              <div class="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-200"></div>
            </VaCardContent>
          </VaCard>
        </div>

        <!-- Empty -->
        <VaCard
          v-else-if="filtered.length === 0"
          class="soft-card"
          :shadow="false"
          :bordered="false"
        >
          <VaCardContent class="p-8 text-center">
            <div class="text-sm font-semibold text-slate-800">No payments found</div>
            <p class="mt-1 text-sm text-slate-500">Try changing filters or search keywords.</p>
          </VaCardContent>
        </VaCard>

        <!-- Rows -->
        <div v-else class="grid gap-3">
          <VaCard
            v-for="p in paged"
            :key="p.payment_id"
            class="soft-card"
            :shadow="false"
            :bordered="false"
          >
            <VaCardContent class="p-4">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="truncate text-sm font-extrabold text-slate-900">
                      {{ p.payment_number }}
                    </div>

                    <span class="pill" :class="badgeClass(p.status)">
                      {{ pretty(p.status) }}
                    </span>

                    <span class="pill bg-slate-100 text-slate-700">
                      {{ pretty(p.payment_method) }}
                    </span>

                    <span class="pill bg-slate-100 text-slate-700">
                      {{ p.payment_currency }}
                    </span>
                  </div>

                  <div class="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
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

                <div class="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <div class="text-xl font-extrabold text-slate-900">
                    {{ money(p.amount, p.payment_currency) }}
                  </div>
                  <div class="text-xs text-slate-500">
                    Base: {{ moneyUSD(p.amount_in_base_currency ?? 0) }} • Rate: {{ p.exchange_rate }}
                  </div>

                  <div class="flex items-center gap-2">
                    <VaButton size="small" color="primary" @click="goEdit(p.payment_id)">
                      Edit
                    </VaButton>
                    <VaButton size="small" preset="secondary" @click="copy(p.payment_number)">
                      Copy #
                    </VaButton>
                  </div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Pagination -->
          <VaCard class="soft-card" :shadow="false" :bordered="false">
            <VaCardContent class="p-3">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div class="text-sm text-slate-500">
                  Showing <b class="text-slate-900">{{ startRow + 1 }}</b>
                  –
                  <b class="text-slate-900">{{ Math.min(startRow + pageSize, filtered.length) }}</b>
                  of <b class="text-slate-900">{{ filtered.length }}</b>
                </div>

                <VaPagination
                  v-model="page"
                  :pages="totalPages"
                  boundary-numbers
                  input
                />
              </div>
            </VaCardContent>
          </VaCard>
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
const pageSize = ref(8)

const rows = ref([])

const STATUSES = ["pending", "completed", "failed", "refunded", "cancelled"]
const METHODS = ["cash", "credit_card", "debit_card", "bank_transfer", "aba", "wing", "true_money", "pi_pay", "other"]

const statusOptions = [
  { label: "All", value: "all" },
  ...STATUSES.map((s) => ({ label: pretty(s), value: s })),
]
const methodOptions = [
  { label: "All", value: "all" },
  ...METHODS.map((m) => ({ label: pretty(m), value: m })),
]
const currencyOptions = [
  { label: "All", value: "all" },
  { label: "USD", value: "USD" },
  { label: "KHR", value: "KHR" },
]
const pageSizeOptions = [6, 8, 10, 12, 20].map((n) => ({ text: String(n), value: n }))

onMounted(() => {
  setTimeout(() => {
    rows.value = Array.isArray(staticPayments)
      ? [...staticPayments].sort((a, b) => (b.payment_id ?? 0) - (a.payment_id ?? 0))
      : []
    loading.value = false
  }, 650)
})

watch([q, status, method, currency, pageSize], () => {
  page.value = 1
})

const filtered = computed(() => {
  const query = q.value.toLowerCase().trim()

  return rows.value.filter((p) => {
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

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / Number(pageSize.value || 8))))
const startRow = computed(() => (page.value - 1) * Number(pageSize.value || 8))
const paged = computed(() => filtered.value.slice(startRow.value, startRow.value + Number(pageSize.value || 8)))

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
})

const pendingCount = computed(() => filtered.value.filter((x) => x.status === "pending").length)
const completedUsdSum = computed(() => {
  return filtered.value
    .filter((x) => x.status === "completed" && x.payment_currency === "USD")
    .reduce((sum, x) => sum + Number(x.amount || 0), 0)
})

function resetFilters() {
  q.value = ""
  status.value = "all"
  method.value = "all"
  currency.value = "all"
  pageSize.value = 8
}

function goCreate() {
  router.push({ name: "billing-payments-create" })
}

function goEdit(paymentId) {
  router.push({ name: "billing-payments-edit", params: { paymentId: String(paymentId) } })
}

function fmtDate(s) {
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

function pretty(s) {
  return String(s || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
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
  } catch (e) {}
}
</script>

<style scoped>
/* ✅ same shadow as your System Configuration page */
.soft-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

/* small pill style */
.pill {
  border-radius: 9999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
}
</style>
