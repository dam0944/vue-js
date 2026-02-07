<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">receipt_long</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Invoices</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">Easy list • filter • pagination • later connect to DB.</p>
        </div>

        <VaButton color="primary" preset="primary" icon="add" @click="goCreate">
          New Invoice
        </VaButton>
      </div>

      <!-- Filters -->
      <section class="mt-4 rounded-2xl bg-white p-4">
        <div class="grid gap-3 lg:grid-cols-12">
          <div class="lg:col-span-6">
            <VaInput
              v-model.trim="q"
              placeholder="Search invoice number / booking / reservation..."
              clearable
              class="w-full"
            >
              <template #prependInner>
                <span class="material-icons text-slate-400 text-[18px]">search</span>
              </template>
            </VaInput>
          </div>

          <div class="lg:col-span-3">
            <VaSelect
              v-model="status"
              :options="statusOptions"
              text-by="label"
              value-by="value"
              class="w-full"
              placeholder="All status"
            />
          </div>

          <div class="lg:col-span-3">
            <VaSelect
              v-model="currency"
              :options="currencyOptions"
              text-by="label"
              value-by="value"
              class="w-full"
              placeholder="All currency"
            />
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div class="text-xs text-slate-500">
            Showing <b class="text-slate-900">{{ total }}</b> result(s)
          </div>

          <div class="flex items-center gap-2">
            <VaButton preset="secondary" color="secondary" @click="resetFilters">Reset</VaButton>
          </div>
        </div>
      </section>

      <!-- List -->
      <section class="mt-4 rounded-2xl bg-white p-2 sm:p-3">
        <!-- Loading -->
        <div v-if="loading" class="space-y-2 p-2">
          <div v-for="i in 6" :key="i" class="rounded-2xl bg-slate-50 p-4">
            <VaSkeleton variant="text" class="w-[320px]" />
            <div class="mt-2 grid gap-2 sm:grid-cols-3">
              <VaSkeleton variant="text" class="w-[220px]" />
              <VaSkeleton variant="text" class="w-[220px]" />
              <VaSkeleton variant="text" class="w-[220px]" />
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="paged.length === 0" class="p-10 text-center">
          <div class="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-700">
            <span class="material-icons">inbox</span>
          </div>
          <div class="text-base font-extrabold text-slate-900">No invoices found</div>
          <div class="mt-1 text-sm text-slate-500">Try changing filters or search keyword.</div>
        </div>

        <!-- Items -->
        <div v-else class="space-y-2 p-2">
          <div
            v-for="inv in paged"
            :key="inv.invoice_id"
            class="rounded-2xl bg-slate-50 px-4 py-4"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <!-- left -->
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="truncate text-sm font-extrabold text-slate-900">
                    {{ inv.invoice_number }}
                  </div>

                  <VaChip size="small" :color="statusChip(inv.status).color" :text-color="statusChip(inv.status).text">
                    {{ statusChip(inv.status).label }}
                  </VaChip>

                  <VaChip size="small" color="#ffffff" text-color="#475569">
                    {{ inv.currency }}
                  </VaChip>
                </div>

                <div class="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                  <div>
                    <span class="text-slate-400">Booking:</span>
                    <b class="text-slate-900">#{{ inv.booking_id }}</b>
                  </div>
                  <div>
                    <span class="text-slate-400">Reservation:</span>
                    <b class="text-slate-900">{{ inv.reservation_id ?? "—" }}</b>
                  </div>
                  <div>
                    <span class="text-slate-400">Due:</span>
                    <b class="text-slate-900">{{ inv.due_date ?? "—" }}</b>
                  </div>
                </div>

                <div class="mt-2 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div>
                    <span class="text-slate-400">Total:</span>
                    <b class="text-slate-900">{{ money(inv.total_amount, inv.currency) }}</b>
                  </div>
                  <div>
                    <span class="text-slate-400">Paid:</span>
                    <b class="text-slate-900">{{ money(inv.amount_paid, inv.currency) }}</b>
                  </div>
                  <div>
                    <span class="text-slate-400">Balance:</span>
                    <b :class="Number(inv.balance_due) > 0 ? 'text-rose-600' : 'text-emerald-700'">
                      {{ money(inv.balance_due, inv.currency) }}
                    </b>
                  </div>
                </div>

                <div v-if="inv.notes" class="mt-2 text-sm text-slate-500">
                  {{ inv.notes }}
                </div>
              </div>

              <!-- right actions -->
              <div class="flex shrink-0 items-center gap-2 sm:pt-1">
                <VaButton preset="secondary" color="secondary" size="small" @click="goEdit(inv.invoice_id)">
                  Edit
                </VaButton>
                <VaButton preset="primary" color="primary" size="small" @click="view(inv.invoice_id)">
                  View
                </VaButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && total > pageSize" class="flex flex-col gap-2 px-4 pb-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div class="text-xs text-slate-500">
            Page <b class="text-slate-900">{{ page }}</b> of <b class="text-slate-900">{{ pageCount }}</b>
          </div>

          <VaPagination
            v-model="page"
            :pages="pageCount"
            :visible-pages="5"
            buttons-preset="secondary"
          />
        </div>
      </section>

      <div class="mt-5 pb-6 text-center text-xs text-slate-400">
        Tip: keep invoices “draft” until checkout, then mark “paid” after payment confirmed.
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
const currency = ref("")

const page = ref(1)
const pageSize = 6

const statusOptions = [
  { label: "All status", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Partially paid", value: "partially_paid" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
]

const currencyOptions = [
  { label: "All currency", value: "" },
  { label: "USD", value: "USD" },
  { label: "KHR", value: "KHR" },
]

onMounted(() => {
  setTimeout(() => {
    rows.value = [...staticInvoices].sort((a, b) => (b.invoice_id ?? 0) - (a.invoice_id ?? 0))
    loading.value = false
  }, 500)
})

const filtered = computed(() => {
  const keyword = String(q.value || "").trim().toLowerCase()

  let list = rows.value.filter((inv) => {
    const matchQ =
      !keyword ||
      String(inv.invoice_number ?? "").toLowerCase().includes(keyword) ||
      String(inv.booking_id ?? "").includes(keyword) ||
      String(inv.reservation_id ?? "").includes(keyword)

    const matchStatus = status.value === "all" ? true : inv.status === status.value
    const matchCurrency = currency.value ? inv.currency === currency.value : true

    return matchQ && matchStatus && matchCurrency
  })

  // reset to page 1 if filtered changes and page too high
  return list
})

const total = computed(() => filtered.value.length)

const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

const paged = computed(() => {
  const p = Math.min(Math.max(1, page.value), pageCount.value)
  if (p !== page.value) page.value = p
  const start = (p - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function resetFilters() {
  q.value = ""
  status.value = "all"
  currency.value = ""
  page.value = 1
}

function money(amount, curr) {
  const n = Number(amount || 0)
  if (curr === "KHR") return `៛${Math.round(n).toLocaleString()}`
  return `$${n.toFixed(2)}`
}

function statusChip(s) {
  switch (s) {
    case "paid":
      return { label: "Paid", color: "#dcfce7", text: "#166534" } // emerald
    case "partially_paid":
      return { label: "Partially Paid", color: "#ffedd5", text: "#9a3412" } // orange
    case "pending":
      return { label: "Pending", color: "#dbeafe", text: "#1d4ed8" } // blue
    case "draft":
      return { label: "Draft", color: "#e2e8f0", text: "#334155" } // slate
    case "cancelled":
      return { label: "Cancelled", color: "#ffe4e6", text: "#9f1239" } // rose
    case "refunded":
      return { label: "Refunded", color: "#f3e8ff", text: "#6b21a8" } // purple
    default:
      return { label: String(s || "-"), color: "#e2e8f0", text: "#334155" }
  }
}

function goCreate() {
  router.push({ name: "billing-invoices-create" })
}

function goEdit(invoiceId) {
  router.push({ name: "billing-invoices-edit", params: { invoiceId: String(invoiceId) } })
}

function view(invoiceId) {
  // later: router.push({ name: "billing-invoices-view", params: { invoiceId: String(invoiceId) } })
  alert(`View invoice #${invoiceId}`)
}
</script>
