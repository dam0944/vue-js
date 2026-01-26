<!-- src/pages/admin/reservations/AllBooking.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <!-- Header -->
    <div class="mx-auto">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">list_alt</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">All Bookings</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Walk-in / phone / other bookings • Hourly / Nightly • Family guesthouse workflow.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            @click="createNew"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">add</span>
            New Booking
          </button>

          <button
            class="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-200"
            @click="exportCsv"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">file_download</span>
            Export
          </button>
        </div>
      </div>

      <!-- Stats row -->
      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-bold text-slate-500">Total Bookings</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ rows.length }}</div>
        </div>
        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-bold text-slate-500">Checked-in</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.checkedIn }}</div>
        </div>
        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-bold text-slate-500">Pending / Confirmed</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.pendingConfirmed }}</div>
        </div>
        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-bold text-slate-500">Today Revenue (demo)</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(stats.todayRevenue) }}</div>
        </div>
      </div>

      <!-- Filters (no border, no shadow) -->
      <div class="mt-4 rounded-2xl bg-white p-4">
        <div class="grid gap-3 lg:grid-cols-12">
          <!-- Search -->
          <div class="lg:col-span-5">
            <label class="mb-1 block text-xs font-bold text-slate-500">Search</label>
            <div class="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
              <span class="material-icons text-[18px] text-slate-500">search</span>
              <input
                v-model.trim="q"
                type="text"
                placeholder="booking #, guest, phone, room..."
                class="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                v-if="q"
                class="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700"
                @click="q=''"
              >
                Clear
              </button>
            </div>
          </div>

          <!-- Source -->
          <div class="lg:col-span-2">
            <label class="mb-1 block text-xs font-bold text-slate-500">Source</label>
            <select v-model="sourceFilter" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              <option v-for="x in data.bookingSources" :key="x" :value="x">{{ pretty(x) }}</option>
            </select>
          </div>

          <!-- Type -->
          <div class="lg:col-span-2">
            <label class="mb-1 block text-xs font-bold text-slate-500">Type</label>
            <select v-model="typeFilter" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              <option v-for="x in data.bookingTypes" :key="x" :value="x">{{ pretty(x) }}</option>
            </select>
          </div>

          <!-- Status -->
          <div class="lg:col-span-3">
            <label class="mb-1 block text-xs font-bold text-slate-500">Status</label>
            <select v-model="statusFilter" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              <option v-for="x in data.statuses" :key="x" :value="x">{{ pretty(x) }}</option>
            </select>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap gap-2">
            <button
              class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-200"
              @click="applyQuick('today')"
              :class="quick === 'today' ? 'bg-slate-900 text-white hover:bg-slate-800' : ''"
            >
              Today
            </button>
            <button
              class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-200"
              @click="applyQuick('checked_in')"
              :class="quick === 'checked_in' ? 'bg-slate-900 text-white hover:bg-slate-800' : ''"
            >
              Checked-in
            </button>
            <button
              class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-200"
              @click="applyQuick('balance')"
              :class="quick === 'balance' ? 'bg-slate-900 text-white hover:bg-slate-800' : ''"
            >
              Balance due
            </button>
          </div>

          <button class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-200" @click="reset">
            <span class="material-icons mr-1 align-middle text-[16px]">refresh</span>
            Reset
          </button>
        </div>
      </div>

      <!-- List -->
      <div class="mt-4 rounded-2xl bg-white">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[980px] border-separate border-spacing-0">
            <thead class="sticky top-0 bg-white">
              <tr class="text-left text-xs font-extrabold text-slate-500">
                <th class="px-4 py-3">Booking</th>
                <th class="px-4 py-3">Guest</th>
                <th class="px-4 py-3">Stay</th>
                <th class="px-4 py-3">Rooms</th>
                <th class="px-4 py-3 text-right">Total</th>
                <th class="px-4 py-3">Payment</th>
                <th class="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="row in paginated"
                :key="row.booking.booking_id"
                class="cursor-pointer hover:bg-slate-50"
                @click="open(row)"
              >
                <!-- Booking -->
                <td class="px-4 py-4 align-top">
                  <div class="flex items-start gap-3">
                    <div class="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
                      <span class="material-icons text-[18px]">event</span>
                    </div>
                    <div class="min-w-0">
                      <div class="truncate text-sm font-extrabold text-slate-900">
                        {{ row.booking.booking_number }}
                      </div>
                      <div class="mt-1 flex flex-wrap gap-1">
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-700">
                          {{ pretty(row.booking.booking_source) }}
                        </span>
                        <span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="statusPill(row.booking.status)">
                          {{ pretty(row.booking.status) }}
                        </span>
                      </div>
                      <div class="mt-1 text-xs text-slate-500">{{ dt(row.booking.booking_date) }}</div>
                    </div>
                  </div>
                </td>

                <!-- Guest -->
                <td class="px-4 py-4 align-top">
                  <div class="text-sm font-extrabold text-slate-900 truncate">
                    {{ guestName(row.guest) }}
                    <span
                      v-if="row.guest.guest_type === 'vip'"
                      class="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800"
                    >
                      VIP
                    </span>
                  </div>
                  <div class="mt-1 text-xs text-slate-500">{{ row.guest.phone }}</div>
                </td>

                <!-- Stay -->
                <td class="px-4 py-4 align-top">
                  <div class="text-xs text-slate-500">Type</div>
                  <div class="text-sm font-extrabold text-slate-900">
                    {{ stayTypeLabel(row.reservations) }}
                  </div>
                  <div class="mt-1 text-xs text-slate-500">
                    {{ stayDatesLabel(row.reservations) }}
                  </div>
                </td>

                <!-- Rooms -->
                <td class="px-4 py-4 align-top">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="r in row.reservations"
                      :key="r.reservation_id"
                      class="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-800"
                    >
                      {{ r.room_number }} • {{ r.room_type.type_name }} {{ r.room_type.bed_count }} bed
                      • {{ unitLabel(r) }}
                    </span>
                  </div>
                </td>

                <!-- Total -->
                <td class="px-4 py-4 align-top text-right">
                  <div class="text-xs text-slate-500">Invoice</div>
                  <div class="text-sm font-extrabold text-slate-900">{{ money(row.invoice.total_amount) }}</div>
                  <div class="mt-1 text-xs text-slate-500">
                    Paid: {{ money(row.invoice.paid_amount) }} • Bal: {{ money(row.invoice.balance) }}
                  </div>
                </td>

                <!-- Payment -->
                <td class="px-4 py-4 align-top">
                  <div class="text-xs text-slate-500">Method</div>
                  <div class="text-sm font-extrabold text-slate-900">{{ row.payment_summary.method || "-" }}</div>
                  <div class="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="payPill(row.invoice.status)">
                    {{ pretty(row.invoice.status) }}
                  </div>
                </td>

                <!-- Action -->
                <td class="px-4 py-4 align-top text-right">
                  <div class="inline-flex gap-2" @click.stop>
                    <button class="rounded-full bg-slate-100 px-3 py-2 text-xs font-extrabold hover:bg-slate-200" @click="open(row)">
                      Details
                    </button>
                    <button
                      class="rounded-full bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:bg-slate-800"
                      @click="goCheckout(row)"
                    >
                      Checkout
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="paginated.length === 0">
                <td colspan="7" class="px-6 py-10 text-center">
                  <div class="text-base font-extrabold text-slate-900">No bookings found</div>
                  <div class="mt-1 text-sm text-slate-500">Try another keyword or reset filters.</div>
                  <button class="mt-4 rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold hover:bg-slate-200" @click="reset">
                    Reset
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-3">
          <button
            class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold hover:bg-slate-200 disabled:opacity-40"
            :disabled="page === 1"
            @click="page--"
          >
            Prev
          </button>

          <div class="text-xs font-bold text-slate-500">
            Page <span class="text-slate-900">{{ page }}</span> / <span class="text-slate-900">{{ totalPages }}</span>
          </div>

          <button
            class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold hover:bg-slate-200 disabled:opacity-40"
            :disabled="page === totalPages"
            @click="page++"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Drawer (edited: clean + better mobile) -->
    <div v-if="drawer.open" class="fixed inset-0 z-40" @click="drawer.open = false">
      <div class="absolute inset-0 bg-black/30"></div>
    </div>

    <aside
      v-if="drawer.open"
      class="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white"
    >
      <div class="flex items-center justify-between px-4 py-4">
        <div class="min-w-0">
          <div class="text-xs font-bold text-slate-500">Booking</div>
          <div class="truncate text-base font-extrabold text-slate-900">
            {{ drawer.row?.booking?.booking_number }}
          </div>
        </div>
        <button class="rounded-full bg-slate-100 p-2 hover:bg-slate-200" @click="drawer.open = false">
          <span class="material-icons text-slate-700">close</span>
        </button>
      </div>

      <div class="h-[calc(100vh-72px)] overflow-y-auto px-4 pb-5" v-if="drawer.row">
        <!-- Guest -->
        <div class="rounded-2xl bg-slate-50 p-4">
          <div class="text-xs font-bold text-slate-500">Guest</div>
          <div class="mt-1 text-base font-extrabold text-slate-900">
            {{ guestName(drawer.row.guest) }}
            <span
              v-if="drawer.row.guest.guest_type === 'vip'"
              class="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800"
            >
              VIP
            </span>
          </div>
          <div class="mt-1 text-sm text-slate-600">{{ drawer.row.guest.phone }}</div>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <div class="rounded-2xl bg-white p-3">
              <div class="text-[11px] font-bold text-slate-500">Source</div>
              <div class="mt-1 text-sm font-extrabold text-slate-900">{{ pretty(drawer.row.booking.booking_source) }}</div>
            </div>
            <div class="rounded-2xl bg-white p-3">
              <div class="text-[11px] font-bold text-slate-500">Status</div>
              <div class="mt-1 text-sm font-extrabold" :class="drawerStatusText(drawer.row.booking.status)">
                {{ pretty(drawer.row.booking.status) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Rooms -->
        <div class="mt-4">
          <div class="flex items-end justify-between">
            <div>
              <div class="text-xs font-bold text-slate-500">Rooms</div>
              <div class="text-sm font-extrabold text-slate-900">{{ drawer.row.reservations.length }} reservation(s)</div>
            </div>
            <button class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold hover:bg-slate-200" @click="printPreview(drawer.row)">
              <span class="material-icons mr-1 align-middle text-[16px]">print</span>
              Print
            </button>
          </div>

          <div class="mt-2 space-y-2">
            <div
              v-for="r in drawer.row.reservations"
              :key="r.reservation_id"
              class="rounded-2xl bg-slate-50 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-sm font-extrabold text-slate-900">
                    Room {{ r.room_number }}
                  </div>
                  <div class="mt-1 text-xs text-slate-600">
                    {{ r.room_type.type_name }} • {{ r.room_type.bed_count }} bed • {{ unitLabel(r) }}
                  </div>
                  <div class="mt-2 text-xs text-slate-500">
                    In: {{ dt(r.check_in_at) }}<br />
                    Out: {{ dt(r.check_out_at) }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs font-bold text-slate-500">Total</div>
                  <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(r.total_room_charges) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice -->
        <div class="mt-4 rounded-2xl bg-slate-50 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-xs font-bold text-slate-500">Invoice</div>
              <div class="mt-1 text-sm font-extrabold text-slate-900">{{ drawer.row.invoice.invoice_number }}</div>
              <div class="mt-1 text-xs text-slate-600">Date: {{ drawer.row.invoice.invoice_date }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs font-bold text-slate-500">Status</div>
              <div class="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="payPill(drawer.row.invoice.status)">
                {{ pretty(drawer.row.invoice.status) }}
              </div>
            </div>
          </div>

          <div class="mt-3 space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-600">Subtotal</span>
              <span class="font-extrabold text-slate-900">{{ money(drawer.row.invoice.subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Discount</span>
              <span class="font-extrabold text-slate-900">{{ money(drawer.row.invoice.discount_amount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Tax</span>
              <span class="font-extrabold text-slate-900">{{ money(drawer.row.invoice.tax_amount) }}</span>
            </div>
            <div class="flex justify-between pt-2 text-base">
              <span class="font-extrabold text-slate-900">Total</span>
              <span class="font-extrabold text-slate-900">{{ money(drawer.row.invoice.total_amount) }}</span>
            </div>

            <div class="mt-2 grid grid-cols-2 gap-2">
              <div class="rounded-2xl bg-white p-3">
                <div class="text-[11px] font-bold text-slate-500">Paid</div>
                <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(drawer.row.invoice.paid_amount) }}</div>
              </div>
              <div class="rounded-2xl bg-white p-3">
                <div class="text-[11px] font-bold text-slate-500">Balance</div>
                <div class="mt-1 text-sm font-extrabold" :class="drawer.row.invoice.balance > 0 ? 'text-rose-600' : 'text-emerald-600'">
                  {{ money(drawer.row.invoice.balance) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer buttons -->
        <div class="mt-4 grid grid-cols-2 gap-2">
          <button class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-200" @click="drawer.open=false">
            Close
          </button>
          <button class="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-slate-800" @click="goCheckout(drawer.row)">
            Go Checkout
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { reservationsListData } from "@/data/reservation/reservationsListData"

const data = reservationsListData

const rows = ref(data.reservationsList)

// filters
const q = ref("")
const sourceFilter = ref("all")
const typeFilter = ref("all")
const statusFilter = ref("all")
const quick = ref("today") // today | checked_in | balance | ''

const page = ref(1)
const pageSize = 8

// drawer
const drawer = ref({ open: false, row: null })

const stats = computed(() => {
  const checkedIn = rows.value.filter((x) => x.booking.status === "checked_in").length
  const pendingConfirmed = rows.value.filter((x) => ["pending", "confirmed"].includes(x.booking.status)).length

  // demo: sum invoice total for rows having booking_date same day (string contains "2026-01-23")
  const todayRevenue = rows.value
    .filter((x) => String(x.booking.booking_date || "").startsWith(todayStr()))
    .reduce((sum, x) => sum + Number(x.invoice.total_amount || 0), 0)

  return { checkedIn, pendingConfirmed, todayRevenue }
})

const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return rows.value.filter((row) => {
    if (sourceFilter.value !== "all" && row.booking.booking_source !== sourceFilter.value) return false
    if (statusFilter.value !== "all" && row.booking.status !== statusFilter.value) return false

    // booking type filter means: any reservation matches hourly/nightly
    if (typeFilter.value !== "all") {
      const hasType = row.reservations.some((r) => r.booking_type === typeFilter.value)
      if (!hasType) return false
    }

    // quick
    if (quick.value === "today") {
      if (!String(row.booking.booking_date || "").startsWith(todayStr())) return false
    } else if (quick.value === "checked_in") {
      if (row.booking.status !== "checked_in") return false
    } else if (quick.value === "balance") {
      if (Number(row.invoice.balance || 0) <= 0) return false
    }

    if (!keyword) return true

    const blob = [
      row.booking.booking_number,
      row.booking.booking_source,
      row.booking.status,
      guestName(row.guest),
      row.guest.phone,
      row.invoice.invoice_number,
      row.reservations.map((r) => `${r.room_number} ${r.room_type?.type_name} ${r.room_type?.bed_count}`).join(" "),
    ]
      .join(" ")
      .toLowerCase()

    return blob.includes(keyword)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

watch([q, sourceFilter, typeFilter, statusFilter, quick], () => (page.value = 1))

function applyQuick(v) {
  quick.value = quick.value === v ? "" : v
}

function reset() {
  q.value = ""
  sourceFilter.value = "all"
  typeFilter.value = "all"
  statusFilter.value = "all"
  quick.value = ""
}

function open(row) {
  drawer.value = { open: true, row }
}

function createNew() {
  alert("Demo: route to Frontdesk Quick Book or Create Booking form.")
}

function goCheckout(row) {
  alert(`Demo: go to checkout for ${row.booking.booking_number}`)
}

function exportCsv() {
  alert("Demo: export CSV")
}

/* helpers */
function money(v) {
  const n = Number(v || 0)
  return `$${n.toFixed(2)}`
}

function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}

function guestName(g) {
  return `${g?.first_name || ""} ${g?.last_name || ""}`.trim() || "-"
}

function todayStr() {
  // static demo day (match your data) — change to new Date() later
  return "2026-01-23"
}

function dt(s) {
  if (!s) return "-"
  return String(s).replace("T", " ").slice(0, 16)
}

function unitLabel(r) {
  const unit = r.booking_type === "hourly" ? "h" : "n"
  return `${r.total_nights_or_hours}${unit}`
}

function stayTypeLabel(reservations) {
  const types = Array.from(new Set(reservations.map((r) => r.booking_type)))
  return types.map(pretty).join(" / ")
}

function stayDatesLabel(reservations) {
  const first = reservations[0]
  if (!first) return "-"
  const inAt = dt(first.check_in_at)
  const outAt = dt(first.check_out_at)
  return `${inAt} → ${outAt}`
}

function statusPill(status) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800"
    case "confirmed":
      return "bg-sky-100 text-sky-800"
    case "checked_in":
      return "bg-emerald-100 text-emerald-800"
    case "checked_out":
      return "bg-slate-200 text-slate-800"
    case "cancelled":
      return "bg-rose-100 text-rose-800"
    case "no_show":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

function payPill(invoiceStatus) {
  switch (invoiceStatus) {
    case "paid":
      return "bg-emerald-100 text-emerald-800"
    case "partial":
      return "bg-amber-100 text-amber-800"
    case "issued":
      return "bg-slate-200 text-slate-800"
    case "draft":
      return "bg-slate-100 text-slate-700"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

function drawerStatusText(status) {
  return status === "checked_in" ? "text-emerald-700" : status === "cancelled" ? "text-rose-700" : "text-slate-900"
}
</script>
