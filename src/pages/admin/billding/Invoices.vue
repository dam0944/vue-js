<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">receipt_long</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
              Invoices
            </h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Search, filter, and manage invoices (draft → paid) without clutter.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            @click="goCreate"
          >
            + New Invoice
          </button>
        </div>
      </div>

      <!-- Stats (no border/shadow, only background blocks) -->
      <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl bg-white px-4 py-3">
          <div class="text-xs font-semibold text-slate-500">Total</div>
          <div class="mt-1 text-xl font-extrabold text-slate-900">{{ rows.length }}</div>
        </div>
        <div class="rounded-2xl bg-white px-4 py-3">
          <div class="text-xs font-semibold text-slate-500">Pending Balance</div>
          <div class="mt-1 text-xl font-extrabold text-slate-900">
            {{ money(sumBalance, currencySelected || "USD") }}
          </div>
        </div>
        <div class="rounded-2xl bg-white px-4 py-3">
          <div class="text-xs font-semibold text-slate-500">Paid</div>
          <div class="mt-1 text-xl font-extrabold text-slate-900">{{ countByStatus("paid") }}</div>
        </div>
        <div class="rounded-2xl bg-white px-4 py-3">
          <div class="text-xs font-semibold text-slate-500">Partially Paid</div>
          <div class="mt-1 text-xl font-extrabold text-slate-900">{{ countByStatus("partially_paid") }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="mt-5 rounded-2xl bg-white p-3 sm:p-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div class="flex-1">
              <div class="relative">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  v-model.trim="q"
                  type="text"
                  class="w-full rounded-full bg-slate-100 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Search invoice number, booking id, reservation id…"
                />
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <select
                v-model="status"
                class="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-900 outline-none"
              >
                <option value="all">All status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="partially_paid">Partially paid</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>

              <select
                v-model="currencySelected"
                class="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-900 outline-none"
              >
                <option value="">All currency</option>
                <option value="USD">USD</option>
                <option value="KHR">KHR</option>
              </select>

              <button
                class="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                @click="resetFilters"
              >
                Reset
              </button>
            </div>
          </div>

          <div class="text-sm text-slate-500">
            Showing <span class="font-semibold text-slate-900">{{ filtered.length }}</span> results
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="mt-4 rounded-2xl bg-white p-2 sm:p-3">
        <!-- Skeleton -->
        <div v-if="loading" class="space-y-2 p-2">
          <div v-for="i in 6" :key="i" class="animate-pulse rounded-2xl bg-slate-100 p-4">
            <div class="flex items-center justify-between gap-3">
              <div class="h-4 w-56 rounded-full bg-slate-200"></div>
              <div class="h-7 w-24 rounded-full bg-slate-200"></div>
            </div>
            <div class="mt-3 grid gap-2 sm:grid-cols-3">
              <div class="h-3 w-40 rounded-full bg-slate-200"></div>
              <div class="h-3 w-48 rounded-full bg-slate-200"></div>
              <div class="h-3 w-32 rounded-full bg-slate-200"></div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="!filtered.length" class="p-10 text-center">
          <div class="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-700">
            <span class="material-icons">inbox</span>
          </div>
          <div class="text-base font-bold text-slate-900">No invoices found</div>
          <div class="mt-1 text-sm text-slate-500">Try changing filters or search keyword.</div>
        </div>

        <!-- Items -->
        <div v-else class="space-y-2 p-2">
          <div
            v-for="inv in filtered"
            :key="inv.invoice_id"
            class="rounded-2xl bg-slate-50 px-4 py-4"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="truncate text-sm font-extrabold text-slate-900">
                    {{ inv.invoice_number }}
                  </div>
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-bold"
                    :class="statusPill(inv.status)"
                  >
                    {{ prettyStatus(inv.status) }}
                  </span>
                  <span class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {{ inv.currency }}
                  </span>
                </div>

                <div class="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                  <div>
                    <span class="text-slate-400">Booking:</span>
                    <span class="font-semibold text-slate-800">#{{ inv.booking_id }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400">Reservation:</span>
                    <span class="font-semibold text-slate-800">
                      {{ inv.reservation_id ?? "—" }}
                    </span>
                  </div>
                  <div>
                    <span class="text-slate-400">Due:</span>
                    <span class="font-semibold text-slate-800">{{ inv.due_date ?? "—" }}</span>
                  </div>
                </div>

                <div class="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                  <div>
                    <span class="text-slate-400">Total:</span>
                    <span class="font-extrabold text-slate-900">{{ money(inv.total_amount, inv.currency) }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400">Paid:</span>
                    <span class="font-bold text-slate-900">{{ money(inv.amount_paid, inv.currency) }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400">Balance:</span>
                    <span class="font-extrabold" :class="inv.balance_due > 0 ? 'text-rose-600' : 'text-emerald-700'">
                      {{ money(inv.balance_due, inv.currency) }}
                    </span>
                  </div>
                </div>

                <div v-if="inv.notes" class="mt-2 text-sm text-slate-500">
                  {{ inv.notes }}
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-2">
                <button
                  class="rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-800"
                  @click="goEdit(inv.invoice_id)"
                >
                  Edit
                </button>
                <button
                  class="rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                  @click="view(inv.invoice_id)"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer note -->
      <div class="mt-5 pb-6 text-center text-xs text-slate-400">
        Tip: Keep invoices “draft” until checkout, then mark “paid” after payment is confirmed.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { invoices as staticInvoices } from "@/data/billding/invoices"

const router = useRouter()

const loading = ref(true)
const rows = ref([])

const q = ref("")
const status = ref("all")
const currencySelected = ref("")

onMounted(() => {
  // simulate API delay
  setTimeout(() => {
    rows.value = [...staticInvoices].sort((a, b) => (b.invoice_id ?? 0) - (a.invoice_id ?? 0))
    loading.value = false
  }, 700)
})

const filtered = computed(() => {
  const keyword = q.value.toLowerCase()

  return rows.value.filter((inv) => {
    const matchQ =
      !keyword ||
      String(inv.invoice_number ?? "").toLowerCase().includes(keyword) ||
      String(inv.booking_id ?? "").includes(keyword) ||
      String(inv.reservation_id ?? "").includes(keyword)

    const matchStatus = status.value === "all" ? true : inv.status === status.value
    const matchCurrency = currencySelected.value ? inv.currency === currencySelected.value : true

    return matchQ && matchStatus && matchCurrency
  })
})

const sumBalance = computed(() => {
  const list = currencySelected.value
    ? filtered.value.filter((x) => x.currency === currencySelected.value)
    : filtered.value

  return list.reduce((sum, x) => sum + Number(x.balance_due || 0), 0)
})

function countByStatus(s) {
  return rows.value.filter((x) => x.status === s).length
}

function money(amount, currency) {
  const n = Number(amount || 0)
  if (currency === "KHR") return `៛${Math.round(n).toLocaleString()}`
  return `$${n.toFixed(2)}`
}

function prettyStatus(s) {
  return String(s || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function statusPill(s) {
  switch (s) {
    case "paid":
      return "bg-emerald-100 text-emerald-800"
    case "partially_paid":
      return "bg-amber-100 text-amber-800"
    case "pending":
      return "bg-sky-100 text-sky-800"
    case "draft":
      return "bg-slate-200 text-slate-700"
    case "cancelled":
      return "bg-rose-100 text-rose-800"
    case "refunded":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-slate-200 text-slate-700"
  }
}

function resetFilters() {
  q.value = ""
  status.value = "all"
  currencySelected.value = ""
}

function goCreate() {
  router.push({ name: "billing-invoices-create" })
}

function goEdit(invoiceId) {
  router.push({ name: "billing-invoices-edit", params: { invoiceId: String(invoiceId) } })
}

function view(invoiceId) {
  // if you later make a view page route, change this
  alert(`View invoice #${invoiceId}`)
}
</script>
