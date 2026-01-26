<template>
  <!-- page scroll only (easy user scroll) -->
  <div class="h-screen overflow-y-auto bg-slate-50 pt-[72px]">
    <div class="mx-auto w-full sm:px-6 py-6 space-y-4">

      <!-- Top bar -->
      <div class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex items-start gap-3">
            <div class="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-slate-50">
              <span class="material-icons text-[22px] text-slate-700">receipt_long</span>
            </div>
            <div>
              <h1 class="text-lg font-extrabold text-slate-900">POS History</h1>
              <p class="text-sm text-slate-500">Receipts (Hourly / Nightly)</p>
            </div>
          </div>

          <div class="flex gap-2">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
              <div class="text-[11px] font-semibold text-slate-500">Today Total</div>
              <div class="text-sm font-extrabold text-slate-900">{{ money(stats.todayTotal) }}</div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
              <div class="text-[11px] font-semibold text-slate-500">Receipts</div>
              <div class="text-sm font-extrabold text-slate-900">{{ filteredRows.length }}</div>
            </div>
          </div>
        </div>

        <!-- Search + actions -->
        <div class="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div class="w-full lg:max-w-xl">
            <label class="mb-1 block text-xs font-semibold text-slate-500">Search</label>
            <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-slate-300">
              <span class="material-icons text-[18px] text-slate-500">search</span>
              <input
                v-model.trim="q"
                type="text"
                placeholder="POS, guest, phone, invoice, room…"
                class="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                v-if="q"
                @click="q = ''"
                class="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                title="Clear"
              >
                <span class="material-icons text-[18px]">close</span>
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 justify-end">
            <button
              @click="resetFilters"
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
            >
              <span class="material-icons text-[18px]">refresh</span>
              Reset
            </button>

            <button
              @click="exportCsv"
              class="inline-flex items-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
            >
              <span class="material-icons text-[18px]">file_download</span>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <div class="grid gap-3 lg:grid-cols-4">
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-500">Payment</label>
            <select
              v-model="paymentFilter"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300"
            >
              <option value="all">All</option>
              <option value="ABA KHQR">ABA KHQR</option>
              <option value="Cash USD">Cash USD</option>
              <option value="Cash KHR">Cash KHR</option>
              <option value="Wing">Wing</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-500">Status</label>
            <select
              v-model="statusFilter"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-500">Date</label>
            <div class="flex gap-2">
              <button
                class="rounded-full border px-4 py-2 text-sm font-extrabold transition"
                :class="dateFilter==='today'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'"
                @click="dateFilter='today'"
              >
                Today
              </button>
              <button
                class="rounded-full border px-4 py-2 text-sm font-extrabold transition"
                :class="dateFilter==='all'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'"
                @click="dateFilter='all'"
              >
                All
              </button>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-500">Per Page</label>
            <select
              v-model.number="page.size"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300"
            >
              <option :value="8">8</option>
              <option :value="12">12</option>
              <option :value="20">20</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="rounded-2xl border border-slate-200 bg-white">
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

        <!-- ✅ responsive scroll only if needed -->
        <div class="overflow-x-auto">
          <table class="w-full min-w-[900px] border-separate border-spacing-0">
            <thead class="bg-slate-50">
              <tr class="text-left text-xs font-extrabold text-slate-600">
                <th class="border-b border-slate-200 px-4 py-3">
                  <button class="inline-flex items-center gap-1" @click="setSort('pos_number')">
                    POS #
                    <SortIcon :active="sort.key==='pos_number'" :dir="sort.dir" />
                  </button>
                </th>
                <th class="border-b border-slate-200 px-4 py-3">
                  <button class="inline-flex items-center gap-1" @click="setSort('opened_at')">
                    Date/Time
                    <SortIcon :active="sort.key==='opened_at'" :dir="sort.dir" />
                  </button>
                </th>
                <th class="border-b border-slate-200 px-4 py-3">Guest</th>
                <th class="border-b border-slate-200 px-4 py-3 text-right">
                  <button class="inline-flex items-center gap-1" @click="setSort('total')">
                    Total
                    <SortIcon :active="sort.key==='total'" :dir="sort.dir" />
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
                class="border-b border-slate-100 hover:bg-slate-50"
              >
                <!-- POS -->
                <td class="px-4 py-3 align-top">
                  <div class="font-extrabold text-slate-900 font-mono">{{ r.pos_number }}</div>
                  <div class="text-xs text-slate-500 font-mono">{{ r.invoice?.invoice_number }}</div>
                </td>

                <!-- Date -->
                <td class="px-4 py-3 align-top">
                  <div class="font-extrabold text-slate-900">{{ formatDate(r.opened_at) }}</div>
                  <div class="text-xs text-slate-500">
                    Open {{ formatTime(r.opened_at) }} · Close {{ formatTime(r.closed_at) }}
                  </div>
                </td>

                <!-- Guest -->
                <td class="px-4 py-3 align-top">
                  <div class="font-extrabold text-slate-900">{{ r.guest?.name }}</div>
                  <div class="text-xs text-slate-500">{{ r.guest?.phone }}</div>
                </td>

                <!-- Total -->
                <td class="px-4 py-3 align-top text-right">
                  <div class="font-extrabold text-slate-900">{{ money(r.invoice?.total) }}</div>
                  <div class="text-xs text-slate-500">
                    Sub: {{ money(r.invoice?.subtotal) }}
                    <span v-if="r.invoice?.discount"> · Disc: -{{ money(r.invoice?.discount) }}</span>
                  </div>
                </td>

                <!-- Payment -->
                <td class="px-4 py-3 align-top">
                  <div class="font-extrabold text-slate-900">{{ r.payment?.method }}</div>
                  <div class="text-xs text-slate-500 font-mono">{{ r.payment?.reference }}</div>
                </td>

                <!-- Status -->
                <td class="px-4 py-3 align-top">
                  <span
                    class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold"
                    :class="badgeClass(r.payment?.status)"
                  >
                    {{ prettyStatus(r.payment?.status) }}
                  </span>
                </td>

                <!-- Action -->
                <td class="px-4 py-3 align-top text-right">
                  <div class="inline-flex gap-2">
                    <button
                      class="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      title="View"
                      @click="goView(r)"
                    >
                      <span class="material-icons text-[18px]">visibility</span>
                    </button>

                    <button
                      class="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      title="Print"
                      @click="printReceipt(r)"
                    >
                      <span class="material-icons text-[18px]">print</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="filteredRows.length > page.size"
          class="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-200"
        >
          <button
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            :disabled="page.current === 1"
            @click="page.current--"
          >
            <span class="material-icons text-[18px]">chevron_left</span>
            Prev
          </button>

          <div class="text-sm">
            <span class="text-slate-500">Page</span>
            <span class="font-extrabold text-slate-900">{{ page.current }}</span>
            <span class="text-slate-500">/</span>
            <span class="font-extrabold text-slate-900">{{ totalPages }}</span>
          </div>

          <button
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            :disabled="page.current === totalPages"
            @click="page.current++"
          >
            Next
            <span class="material-icons text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { posHistory } from "@/data/posHistory"

const router = useRouter()

// Sort icon
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

const rows = ref(posHistory)

const q = ref("")
const paymentFilter = ref("all")
const statusFilter = ref("all")
const dateFilter = ref("today")

const sort = reactive({ key: "opened_at", dir: "desc" })
const page = reactive({ current: 1, size: 8 })

watch([q, paymentFilter, statusFilter, dateFilter, () => page.size], () => {
  page.current = 1
})

const filteredRows = computed(() => {
  const query = q.value.toLowerCase()
  const todayStr = new Date().toISOString().slice(0, 10)

  return rows.value
    .filter((r) => {
      if (dateFilter.value === "today") {
        const d = String(r.opened_at).slice(0, 10)
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
  const todayRows = rows.value.filter((r) => String(r.opened_at).slice(0, 10) === todayStr)
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

function goView(row) {
  // ✅ Fixed: Changed route name to match router configuration
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
    failed: "border-red-200 bg-red-50 text-red-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
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
  alert(`Print: ${row?.pos_number || ""}`)
}

function exportCsv() {
  const header = ["pos_number","invoice_number","guest_name","guest_phone","opened_at","closed_at","total","payment_method","payment_status","payment_reference"]

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
    ].map(csvEscape).join(",")
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
</script>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
</style>