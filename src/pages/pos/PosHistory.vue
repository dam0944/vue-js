<!-- src/pages/pos/PosHistory.vue  (Vuestic UI + equal filters + clean popup) -->
<template>
  <!-- page scroll only -->
  <div class="h-screen overflow-y-auto bg-slate-50 pt-[72px]">
    <div class="mx-auto w-full space-y-4 px-4 sm:px-6 py-6">
      <!-- Top bar -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent class="p-4 sm:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-3">
              <div class="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white">
                <span class="material-icons text-[22px]">receipt_long</span>
              </div>
              <div>
                <h1 class="text-lg font-extrabold text-slate-900">POS History</h1>
                <p class="text-sm text-slate-500">Receipts (Hourly / Nightly)</p>
              </div>
            </div>

            <div class="flex gap-2">
              <div class="soft-sub rounded-2xl px-4 py-2 text-right">
                <div class="text-[11px] font-semibold text-slate-500">Today Total</div>
                <div class="text-sm font-extrabold text-slate-900">{{ money(stats.todayTotal) }}</div>
              </div>
              <div class="soft-sub rounded-2xl px-4 py-2 text-right">
                <div class="text-[11px] font-semibold text-slate-500">Receipts</div>
                <div class="text-sm font-extrabold text-slate-900">{{ filteredRows.length }}</div>
              </div>
            </div>
          </div>

          <!-- Search + actions -->
          <div class="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div class="w-full lg:max-w-xl">
              <VaInput
                v-model.trim="q"
                label="Search"
                placeholder="POS, guest, phone, invoice, room…"
                clearable
                class="eq"
              >
                <template #prependInner>
                  <VaIcon name="search" size="18px" color="secondary" />
                </template>
              </VaInput>
            </div>

            <div class="flex flex-wrap gap-2 justify-end">
              <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="resetFilters">
                <VaIcon name="refresh" class="mr-1" />
                Reset
              </VaButton>

              <VaButton color="primary" class="rounded-2xl font-extrabold" @click="exportCsv">
                <VaIcon name="file_download" class="mr-1" />
                Export CSV
              </VaButton>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Filters (equal height) -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent class="p-4">
          <div class="grid grid-cols-12 gap-4 items-end">
            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
              <VaSelect
                v-model="paymentFilter"
                label="Payment"
                :options="paymentOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                class="eq"
                clearable
              />
            </div>

            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
              <VaSelect
                v-model="statusFilter"
                label="Status"
                :options="statusOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                class="eq"
                clearable
              />
            </div>

            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
              <div class="va-label">Date</div>
              <div class="flex gap-2">
                <VaButton
                  size="small"
                  class="rounded-2xl font-extrabold"
                  :preset="dateFilter === 'today' ? 'primary' : 'secondary'"
                  @click="dateFilter = 'today'"
                >
                  Today
                </VaButton>
                <VaButton
                  size="small"
                  class="rounded-2xl font-extrabold"
                  :preset="dateFilter === 'all' ? 'primary' : 'secondary'"
                  @click="dateFilter = 'all'"
                >
                  All
                </VaButton>
              </div>
            </div>

            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
              <VaSelect
                v-model="page.size"
                label="Per page"
                :options="pageSizeOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                class="eq"
              />
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Table -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent class="p-0">
          <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div class="flex items-center gap-2 font-extrabold text-slate-900">
              <span class="material-icons text-[18px] text-slate-600">table_rows</span>
              Receipts
            </div>

            <div class="text-sm">
              <span class="text-slate-500">Showing</span>
              <span class="font-extrabold text-slate-900">{{ paginatedRows.length }}</span>
              <span class="text-slate-500">of</span>
              <span class="font-extrabold text-slate-900">{{ filteredRows.length }}</span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[980px] border-separate border-spacing-0">
              <thead class="bg-slate-50">
                <tr class="text-left text-xs font-extrabold text-slate-600">
                  <th class="border-b border-slate-200 px-4 py-3">
                    <button class="inline-flex items-center gap-1" @click="setSort('pos_number')">
                      POS #
                      <SortIcon :active="sort.key === 'pos_number'" :dir="sort.dir" />
                    </button>
                  </th>
                  <th class="border-b border-slate-200 px-4 py-3">
                    <button class="inline-flex items-center gap-1" @click="setSort('opened_at')">
                      Date/Time
                      <SortIcon :active="sort.key === 'opened_at'" :dir="sort.dir" />
                    </button>
                  </th>
                  <th class="border-b border-slate-200 px-4 py-3">Guest</th>
                  <th class="border-b border-slate-200 px-4 py-3 text-right">
                    <button class="inline-flex items-center gap-1" @click="setSort('total')">
                      Total
                      <SortIcon :active="sort.key === 'total'" :dir="sort.dir" />
                    </button>
                  </th>
                  <th class="border-b border-slate-200 px-4 py-3">Payment</th>
                  <th class="border-b border-slate-200 px-4 py-3">Status</th>
                  <th class="border-b border-slate-200 px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="filteredRows.length === 0">
                  <td colspan="7" class="px-4 py-10">
                    <div class="flex items-center justify-center gap-3 text-slate-500">
                      <span class="material-icons text-[28px]">search_off</span>
                      <div>
                        <div class="font-extrabold text-slate-900">No results</div>
                        <div class="text-sm">Try changing filters or search keywords.</div>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr
                  v-for="r in paginatedRows"
                  :key="r.pos_id"
                  class="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  @click="openDetails(r)"
                >
                  <td class="px-4 py-3 align-top">
                    <div class="font-extrabold text-slate-900 font-mono">{{ r.pos_number }}</div>
                    <div class="text-xs text-slate-500 font-mono">{{ r.invoice?.invoice_number }}</div>
                  </td>

                  <td class="px-4 py-3 align-top">
                    <div class="font-extrabold text-slate-900">{{ formatDate(r.opened_at) }}</div>
                    <div class="text-xs text-slate-500">
                      Open {{ formatTime(r.opened_at) }} · Close {{ formatTime(r.closed_at) }}
                    </div>
                  </td>

                  <td class="px-4 py-3 align-top">
                    <div class="font-extrabold text-slate-900">{{ r.guest?.name }}</div>
                    <div class="text-xs text-slate-500">{{ r.guest?.phone }}</div>
                  </td>

                  <td class="px-4 py-3 align-top text-right">
                    <div class="font-extrabold text-slate-900">{{ money(r.invoice?.total) }}</div>
                    <div class="text-xs text-slate-500">
                      Sub: {{ money(r.invoice?.subtotal) }}
                      <span v-if="r.invoice?.discount"> · Disc: -{{ money(r.invoice?.discount) }}</span>
                    </div>
                  </td>

                  <td class="px-4 py-3 align-top">
                    <div class="font-extrabold text-slate-900">{{ r.payment?.method }}</div>
                    <div class="text-xs text-slate-500 font-mono">{{ r.payment?.reference }}</div>
                  </td>

                  <td class="px-4 py-3 align-top">
                    <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold" :class="badgeClass(r.payment?.status)">
                      {{ prettyStatus(r.payment?.status) }}
                    </span>
                  </td>

                  <td class="px-4 py-3 align-top text-right" @click.stop>
                    <div class="inline-flex gap-2">
                      <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="openDetails(r)">
                        View
                      </VaButton>
                      <VaButton color="primary" size="small" class="rounded-2xl font-extrabold" @click="printReceipt(r)">
                        <VaIcon name="print" class="mr-1" />
                        Print
                      </VaButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="filteredRows.length > page.size" class="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-200">
            <VaButton preset="secondary" class="rounded-2xl font-extrabold" :disabled="page.current === 1" @click="page.current--">
              Prev
            </VaButton>

            <div class="text-sm">
              <span class="text-slate-500">Page</span>
              <span class="font-extrabold text-slate-900">{{ page.current }}</span>
              <span class="text-slate-500">/</span>
              <span class="font-extrabold text-slate-900">{{ totalPages }}</span>
            </div>

            <VaButton preset="secondary" class="rounded-2xl font-extrabold" :disabled="page.current === totalPages" @click="page.current++">
              Next
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- DETAILS MODAL (1000px, 3 grid) -->
      <VaModal v-model="detailsOpen" max-width="1000px" hide-default-actions>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-500">RECEIPT</div>
              <div class="truncate text-base font-extrabold text-slate-900">
                {{ selected?.pos_number || "-" }} • {{ selected?.invoice?.invoice_number || "-" }}
              </div>
            </div>
            <VaButton preset="plain" icon="close" @click="closeDetails" />
          </div>
        </template>

        <div v-if="selected" class="p-1">
          <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <!-- Meta -->
            <VaCard class="soft-card rounded-2xl">
              <VaCardContent class="p-4">
                <div class="text-xs font-bold text-slate-500">Meta</div>
                <div class="mt-2 space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-600">Opened</span>
                    <span class="font-extrabold text-slate-900">{{ selected.opened_at || "-" }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-600">Closed</span>
                    <span class="font-extrabold text-slate-900">{{ selected.closed_at || "-" }}</span>
                  </div>
                </div>
              </VaCardContent>
            </VaCard>

            <!-- Guest -->
            <VaCard class="soft-card rounded-2xl">
              <VaCardContent class="p-4">
                <div class="text-xs font-bold text-slate-500">Guest</div>
                <div class="mt-1 text-base font-extrabold text-slate-900">{{ selected.guest?.name || "-" }}</div>
                <div class="text-sm text-slate-600">{{ selected.guest?.phone || "-" }}</div>
              </VaCardContent>
            </VaCard>

            <!-- Payment -->
            <VaCard class="soft-card rounded-2xl">
              <VaCardContent class="p-4">
                <div class="text-xs font-bold text-slate-500">Payment</div>
                <div class="mt-1 text-base font-extrabold text-slate-900">{{ selected.payment?.method || "-" }}</div>
                <div class="mt-1 text-xs text-slate-500 font-mono">{{ selected.payment?.reference || "-" }}</div>
                <div class="mt-3">
                  <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold" :class="badgeClass(selected.payment?.status)">
                    {{ prettyStatus(selected.payment?.status) }}
                  </span>
                </div>
              </VaCardContent>
            </VaCard>

            <!-- Invoice -->
            <VaCard class="soft-card rounded-2xl md:col-span-2 lg:col-span-2">
              <VaCardContent class="p-4">
                <div class="text-xs font-bold text-slate-500">Invoice</div>
                <div class="mt-3 grid grid-cols-2 gap-2">
                  <div class="soft-sub rounded-2xl p-3">
                    <div class="text-[11px] font-bold text-slate-500">Subtotal</div>
                    <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(selected.invoice?.subtotal) }}</div>
                  </div>
                  <div class="soft-sub rounded-2xl p-3">
                    <div class="text-[11px] font-bold text-slate-500">Discount</div>
                    <div class="mt-1 text-sm font-extrabold text-slate-900">-{{ money(selected.invoice?.discount || 0) }}</div>
                  </div>
                  <div class="soft-sub rounded-2xl p-3">
                    <div class="text-[11px] font-bold text-slate-500">Tax</div>
                    <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(selected.invoice?.tax || 0) }}</div>
                  </div>
                  <div class="soft-sub rounded-2xl p-3">
                    <div class="text-[11px] font-bold text-slate-500">Total</div>
                    <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(selected.invoice?.total) }}</div>
                  </div>
                </div>

                <div class="mt-4 flex justify-end gap-2">
                  <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="closeDetails">Close</VaButton>
                  <VaButton color="primary" class="rounded-2xl font-extrabold" @click="printReceipt(selected)">
                    <VaIcon name="print" class="mr-1" />
                    Print
                  </VaButton>
                </div>
              </VaCardContent>
            </VaCard>
          </div>
        </div>
      </VaModal>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { posHistory } from "@/data/posHistory"

const router = useRouter()

/** Sort icon */
const SortIcon = {
  props: { active: Boolean, dir: String },
  template: `
    <span class="inline-flex translate-y-[1px] opacity-70" :class="{ 'opacity-100': active }">
      <span class="material-icons text-[16px]">
        {{ active ? (dir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
      </span>
    </span>
  `,
}

const rows = ref(posHistory || [])

const q = ref("")
const paymentFilter = ref("all")
const statusFilter = ref("all")
const dateFilter = ref("today")

const sort = reactive({ key: "opened_at", dir: "desc" })
const page = reactive({ current: 1, size: 8 })

// modal
const detailsOpen = ref(false)
const selected = ref(null)

const paymentOptions = computed(() => [
  { text: "All", value: "all" },
  { text: "ABA KHQR", value: "ABA KHQR" },
  { text: "Cash USD", value: "Cash USD" },
  { text: "Cash KHR", value: "Cash KHR" },
  { text: "Wing", value: "Wing" },
  { text: "Bank Transfer", value: "Bank Transfer" },
  { text: "Other", value: "Other" },
])

const statusOptions = computed(() => [
  { text: "All", value: "all" },
  { text: "Completed", value: "completed" },
  { text: "Pending", value: "pending" },
  { text: "Failed", value: "failed" },
  { text: "Refunded", value: "refunded" },
  { text: "Cancelled", value: "cancelled" },
])

const pageSizeOptions = computed(() => [
  { text: "8 / page", value: 8 },
  { text: "12 / page", value: 12 },
  { text: "20 / page", value: 20 },
])

watch([q, paymentFilter, statusFilter, dateFilter, () => page.size], () => {
  page.current = 1
})

const filteredRows = computed(() => {
  const query = q.value.trim().toLowerCase()
  const todayStr = new Date().toISOString().slice(0, 10)

  return rows.value
    .filter((r) => {
      if (dateFilter.value === "today") {
        const d = String(r.opened_at || "").slice(0, 10)
        if (d !== todayStr) return false
      }
      if (paymentFilter.value !== "all" && (r.payment?.method || "") !== paymentFilter.value) return false
      if (statusFilter.value !== "all" && (r.payment?.status || "") !== statusFilter.value) return false

      if (!query) return true

      const blob = [
        r.pos_number,
        r.invoice?.invoice_number,
        r.guest?.name,
        r.guest?.phone,
        r.payment?.method,
        r.payment?.reference,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return blob.includes(query)
    })
    .sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1
      if (sort.key === "total") return ((a.invoice?.total || 0) - (b.invoice?.total || 0)) * dir
      const av = String(a[sort.key] ?? "")
      const bv = String(b[sort.key] ?? "")
      return av.localeCompare(bv) * dir
    })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / page.size)))

const paginatedRows = computed(() => {
  const start = (page.current - 1) * page.size
  return filteredRows.value.slice(start, start + page.size)
})

const stats = computed(() => {
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayRows = rows.value.filter((r) => String(r.opened_at || "").slice(0, 10) === todayStr)
  const todayTotal = todayRows.reduce((sum, r) => sum + Number(r.invoice?.total || 0), 0)
  return { todayTotal }
})

function setSort(key) {
  if (sort.key === key) sort.dir = sort.dir === "asc" ? "desc" : "asc"
  else {
    sort.key = key
    sort.dir = key === "opened_at" ? "desc" : "asc"
  }
}

function resetFilters() {
  q.value = ""
  paymentFilter.value = "all"
  statusFilter.value = "all"
  dateFilter.value = "today"
}

function openDetails(row) {
  selected.value = row
  detailsOpen.value = true
}
function closeDetails() {
  detailsOpen.value = false
  selected.value = null
}

/** You can change this route later */
function goView(row) {
  router.push({ name: "admin.pos.history.views", params: { id: row.pos_id } })
}

function prettyStatus(s) {
  const map = { completed: "Completed", pending: "Pending", failed: "Failed", refunded: "Refunded", cancelled: "Cancelled" }
  return map[s] || String(s || "").toUpperCase()
}

function badgeClass(status) {
  const base = "border-slate-200 bg-slate-50 text-slate-700"
  const map = {
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    failed: "border-rose-200 bg-rose-50 text-rose-700",
    cancelled: "border-rose-200 bg-rose-50 text-rose-700",
    refunded: "border-blue-200 bg-blue-50 text-blue-700",
  }
  return map[status] || base
}

function money(n) {
  const num = Number(n || 0)
  return `$${num.toFixed(2)}`
}

function formatDate(dt) {
  const s = String(dt || "")
  return s ? s.slice(0, 10) : "-"
}
function formatTime(dt) {
  const s = String(dt || "")
  return s && s.length >= 16 ? s.slice(11, 16) : "-"
}

function printReceipt(row) {
  // demo: replace with your receipt printer
  alert(`Print: ${row?.pos_number || ""}`)
}

function exportCsv() {
  const header = [
    "pos_number",
    "invoice_number",
    "guest_name",
    "guest_phone",
    "opened_at",
    "closed_at",
    "total",
    "payment_method",
    "payment_status",
    "payment_reference",
  ]

  const lines = filteredRows.value.map((r) => {
    return [
      r.pos_number,
      r.invoice?.invoice_number || "",
      r.guest?.name || "",
      r.guest?.phone || "",
      r.opened_at || "",
      r.closed_at || "",
      r.invoice?.total ?? 0,
      r.payment?.method || "",
      r.payment?.status || "",
      r.payment?.reference || "",
    ]
      .map(csvEscape)
      .join(",")
  })

  const csv = [header.join(","), ...lines].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `pos_history_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function csvEscape(v) {
  const s = String(v ?? "")
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`
  return s
}

watch(totalPages, () => {
  if (page.current > totalPages.value) page.current = totalPages.value
})
</script>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

/* soft cards */
.soft-card {
  border: none !important;
  background: #fff !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
}
.soft-sub {
  background: rgba(2, 8, 23, 0.02);
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06);
}

/* Vuestic label like your design */
:deep(.va-input-wrapper__label),
:deep(.va-select__label) {
  margin-bottom: 6px !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  color: rgb(100 116 139) !important;
}

/* Equal height controls (ស្មើរគ្នា) */
:deep(.eq .va-input-wrapper__container),
:deep(.eq .va-select__anchor) {
  min-height: 44px !important;
  border-radius: 16px !important;
}

/* Date label */
.va-label {
  font-size: 12px;
  font-weight: 800;
  color: rgb(100 116 139);
  margin-bottom: 6px;
}
</style>
