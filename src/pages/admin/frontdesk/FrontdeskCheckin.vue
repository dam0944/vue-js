<!-- src/pages/frontdesk/Checkin.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto w-full space-y-5">
      <!-- Header (no border / no shadow) -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">how_to_reg</span>
            <h1 class="text-xl font-semibold text-slate-900">Front Desk • Check-in / Check-out</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Manage today arrivals, walk-ins, and check-outs (Guesthouse flow).
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="rounded-full bg-white px-3 py-1 text-xs text-slate-600">
            Today: <span class="font-semibold text-slate-900">{{ data.today }}</span>
          </div>
          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            @click="openWalkin()"
          >
            + Walk-in Check-in
          </button>
        </div>
      </div>

      <!-- KPIs (no border / no shadow) -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-semibold text-slate-500">Arrivals</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ kpis.arrivals }}</div>
          <div class="mt-1 text-xs text-slate-500">Confirmed / Pending today</div>
        </div>
        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-semibold text-slate-500">Checked-in</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ kpis.checkedIn }}</div>
          <div class="mt-1 text-xs text-slate-500">In-house now</div>
        </div>
        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-semibold text-slate-500">Check-outs</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ kpis.checkouts }}</div>
          <div class="mt-1 text-xs text-slate-500">Expected today</div>
        </div>
        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-semibold text-slate-500">Balance Due</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(kpis.balanceDue) }}</div>
          <div class="mt-1 text-xs text-slate-500">From today list</div>
        </div>
      </div>

      <!-- Filters (no border / no shadow) -->
      <div class="rounded-2xl bg-white p-4">
        <div class="grid gap-3 lg:grid-cols-12">
          <div class="lg:col-span-5">
            <div class="text-xs font-semibold text-slate-500">Search</div>
            <div class="mt-1 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
              <span class="material-icons text-[18px] text-slate-400">search</span>
              <input
                v-model.trim="q"
                class="w-full bg-transparent text-sm text-slate-900 outline-none"
                placeholder="Booking #, guest name, phone, room..."
              />
            </div>
          </div> 

          <div class="lg:col-span-3">
            <div class="text-xs font-semibold text-slate-500">Source</div>
            <select v-model="sourceFilter" class="mt-1 w-full rounded-2xl bg-slate-50 px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              <option value="walk_in">Walk-in</option>
              <option value="phone">Phone</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="lg:col-span-2">
            <div class="text-xs font-semibold text-slate-500">Status</div>
            <select v-model="statusFilter" class="mt-1 w-full rounded-2xl bg-slate-50 px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked-in</option>
              <option value="checked_out">Checked-out</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No show</option>
            </select>
          </div>

          <div class="lg:col-span-2">
            <div class="text-xs font-semibold text-slate-500">Tab</div>
            <div class="mt-1 flex gap-2">
              <button
                class="w-full rounded-full px-3 py-2 text-xs font-bold"
                :class="tab === 'arrivals' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'"
                @click="tab = 'arrivals'"
              >
                Arrivals
              </button>
              <button
                class="w-full rounded-full px-3 py-2 text-xs font-bold"
                :class="tab === 'inhouse' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'"
                @click="tab = 'inhouse'"
              >
                In-house
              </button>
            </div>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div class="text-xs text-slate-500">
            Showing <span class="font-semibold text-slate-900">{{ filteredRows.length }}</span> records
          </div>

          <div class="flex items-center gap-2">
            <button class="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold" @click="resetFilters">
              Reset
            </button>
            <button class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white" @click="exportCsv">
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- List (cards, no border / no shadow) -->
      <div class="grid gap-3 lg:grid-cols-2">
        <div
          v-for="row in paginatedRows"
          :key="row.booking.booking_id"
          class="rounded-2xl bg-white p-4"
          @click="openDetails(row)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <div class="truncate text-base font-extrabold text-slate-900">
                  {{ row.booking.booking_number }}
                </div>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" :class="sourcePill(row.booking.booking_source)">
                  {{ pretty(row.booking.booking_source) }}
                </span>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" :class="statusPill(row.booking.status)">
                  {{ pretty(row.booking.status) }}
                </span>
              </div>

              <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <div class="inline-flex items-center gap-1">
                  <span class="material-icons text-[16px] text-slate-400">person</span>
                  <span class="font-semibold text-slate-900">{{ row.guest.first_name }} {{ row.guest.last_name }}</span>
                </div>
                <div class="inline-flex items-center gap-1">
                  <span class="material-icons text-[16px] text-slate-400">call</span>
                  <span>{{ row.guest.phone }}</span>
                </div>
                <div v-if="row.guest.guest_type === 'vip'" class="inline-flex items-center gap-1">
                  <span class="material-icons text-[16px] text-amber-500">workspace_premium</span>
                  <span class="text-amber-700 font-semibold">VIP</span>
                </div>
              </div>
            </div>

            <button
              class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold"
              @click.stop="openDetails(row)"
            >
              View
            </button>
          </div>

          <!-- rooms -->
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="r in row.reservations"
              :key="r.reservation_id"
              class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-800"
            >
              Room {{ r.room_number }} • {{ pretty(r.booking_type) }}
              • {{ r.total_nights_or_hours }}{{ r.booking_type === "hourly" ? "h" : "n" }}
            </span>
          </div>

          <!-- times + totals -->
          <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div class="rounded-2xl bg-slate-50 p-3">
              <div class="text-slate-500">Check-in</div>
              <div class="mt-1 font-semibold text-slate-900">
                {{ formatDateTime(row.reservations[0]?.check_in_at) }}
              </div>
            </div>
            <div class="rounded-2xl bg-slate-50 p-3">
              <div class="text-slate-500">Check-out</div>
              <div class="mt-1 font-semibold text-slate-900">
                {{ formatDateTime(row.reservations[0]?.check_out_at) }}
              </div>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <div class="text-xs text-slate-500">
              Payment:
              <span class="font-semibold text-slate-900">{{ pretty(row.payment.payment_method) }}</span>
              <span class="mx-1 text-slate-300">•</span>
              <span class="font-semibold" :class="payPillText(row.payment.status)">{{ pretty(row.payment.status) }}</span>
            </div>

            <div class="text-right">
              <div class="text-[11px] font-semibold text-slate-500">Total</div>
              <div class="text-base font-extrabold text-slate-900">{{ money(row.pricing.total) }}</div>
              <div class="text-[11px] text-slate-500">Balance: {{ money(row.pricing.balance_amount) }}</div>
            </div>
          </div>

          <!-- actions -->
          <div class="mt-3 grid grid-cols-2 gap-2">
            <button
              class="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
              :disabled="!canCheckIn(row)"
              @click.stop="doCheckIn(row)"
            >
              <span class="material-icons mr-1 align-middle text-[18px]">login</span>
              Check-in
            </button>

            <button
              class="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-900 disabled:opacity-40"
              :disabled="!canCheckOut(row)"
              @click.stop="doCheckOut(row)"
            >
              <span class="material-icons mr-1 align-middle text-[18px]">logout</span>
              Check-out
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between pt-1">
        <button
          class="rounded-full bg-white px-4 py-2 text-sm font-bold disabled:opacity-40"
          :disabled="page.current === 1"
          @click="page.current--"
        >
          Prev
        </button>
        <div class="text-xs text-slate-500">
          Page <span class="font-semibold text-slate-900">{{ page.current }}</span>
          / <span class="font-semibold text-slate-900">{{ totalPages }}</span>
        </div>
        <button
          class="rounded-full bg-white px-4 py-2 text-sm font-bold disabled:opacity-40"
          :disabled="page.current === totalPages"
          @click="page.current++"
        >
          Next
        </button>
      </div>

      <!-- Drawer (no border / no shadow) -->
      <div v-if="drawer.open" class="fixed inset-0 z-40 bg-slate-900/30" @click="drawer.open = false"></div>
      <aside
  v-if="drawer.open"
  class="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white"
>
  <!-- Header -->
  <div class="flex items-center justify-between px-6 py-4">
    <div>
      <div class="text-lg font-bold text-slate-900">
        {{ drawer.row.booking.booking_number }}
      </div>
      <div class="text-xs text-slate-500 uppercase tracking-wide">
        {{ drawer.row.booking.booking_source }}
      </div>
    </div>

    <button @click="drawer.open = false" class="material-icons text-slate-500">
      close
    </button>
  </div>

  <!-- Content -->
  <div class="px-6 pb-6 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">

    <!-- Guest -->
    <div>
      <div class="text-xs text-slate-400 font-bold mb-1">GUEST</div>
      <div class="text-base font-bold text-slate-900">
        {{ drawer.row.guest.first_name }} {{ drawer.row.guest.last_name }}
      </div>
      <div class="text-sm text-slate-600">
        {{ drawer.row.guest.phone }}
      </div>
      <div class="text-xs text-slate-500 mt-1">
        {{ drawer.row.guest.nationality }} •
        {{ drawer.row.guest.id_type }} •
        {{ drawer.row.guest.id_number }}
      </div>
    </div>

    <!-- Rooms -->
    <div>
      <div class="text-xs text-slate-400 font-bold mb-2">ROOMS</div>

      <div
        v-for="r in drawer.row.reservations"
        :key="r.reservation_id"
        class="flex justify-between py-2"
      >
        <div>
          <div class="font-semibold text-slate-900">
            Room {{ r.room_number }}
          </div>
          <div class="text-xs text-slate-500">
            {{ r.room_type.type_name }} •
            {{ r.booking_type }} •
            {{ r.total_nights_or_hours }}
            {{ r.booking_type === 'hourly' ? 'h' : 'n' }}
          </div>
          <div class="text-xs text-slate-500 mt-1">
            In: {{ formatDateTime(r.check_in_at) }}<br />
            Out: {{ formatDateTime(r.check_out_at) }}
          </div>
        </div>

        <div class="font-bold text-slate-900">
          ${{ r.total_room_charges }}
        </div>
      </div>
    </div>

    <!-- Money -->
    <div>
      <div class="text-xs text-slate-400 font-bold mb-2">PAYMENT</div>

      <div class="space-y-1 text-sm">
        <div class="flex justify-between">
          <span>Total</span>
          <span class="font-bold">${{ drawer.row.pricing.total }}</span>
        </div>
        <div class="flex justify-between">
          <span>Paid</span>
          <span>${{ drawer.row.pricing.paid_amount }}</span>
        </div>
        <div class="flex justify-between font-bold">
          <span>Balance</span>
          <span>${{ drawer.row.pricing.balance_amount }}</span>
        </div>
      </div>

      <div class="text-xs text-slate-500 mt-2">
        Payment: {{ drawer.row.payment.payment_method }} •
        {{ drawer.row.payment.status }}
      </div>
    </div>

    <!-- Actions -->
    <div class="pt-4 space-y-3">
      <button
        class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold"
      >
        Check-in
      </button>

      <button
        class="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold"
      >
        Check-out
      </button>

      <button
        class="w-full border border-slate-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        @click="printReceipt(drawer.row)"
      >
        <span class="material-icons">print</span>
        Print Preview
      </button>
    </div>
  </div>
</aside>

    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { frontdeskCheckinData } from "@/data/front/frontdeskCheckin"

// data
const data = frontdeskCheckinData
const rows = ref(data.checkinList)

// filters
const q = ref("")
const sourceFilter = ref("all")
const statusFilter = ref("all")
const tab = ref("arrivals") // arrivals | inhouse

// pagination
const page = reactive({ current: 1, size: 6 })

// drawer
const drawer = reactive({ open: false, row: null })

const filteredRows = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return rows.value.filter((x) => {
    // tab logic
    if (tab.value === "arrivals") {
      // show pending/confirmed/check_in today-ish (simple demo)
      if (!["pending", "confirmed", "checked_in"].includes(x.booking.status)) return false
    } else {
      // inhouse
      if (x.booking.status !== "checked_in") return false
    }

    // source filter (booking.booking_source)
    if (sourceFilter.value !== "all" && x.booking.booking_source !== sourceFilter.value) return false

    // status filter (booking.status)
    if (statusFilter.value !== "all" && x.booking.status !== statusFilter.value) return false

    if (!keyword) return true

    const guestName = `${x.guest.first_name} ${x.guest.last_name}`.toLowerCase()
    const guestPhone = String(x.guest.phone || "")
    const bookingNo = String(x.booking.booking_number || "").toLowerCase()
    const rooms = x.reservations.map((r) => String(r.room_number || "")).join(" ")

    return (
      guestName.includes(keyword) ||
      guestPhone.includes(keyword) ||
      bookingNo.includes(keyword) ||
      rooms.includes(keyword)
    )
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / page.size)))

const paginatedRows = computed(() => {
  const start = (page.current - 1) * page.size
  return filteredRows.value.slice(start, start + page.size)
})

watch([q, sourceFilter, statusFilter, tab], () => (page.current = 1))

const kpis = computed(() => {
  const all = rows.value
  const arrivals = all.filter((x) => ["pending", "confirmed"].includes(x.booking.status)).length
  const checkedIn = all.filter((x) => x.booking.status === "checked_in").length
  const checkouts = all.filter((x) => x.booking.status === "checked_in").length // demo
  const balanceDue = all.reduce((acc, x) => acc + Number(x.pricing.balance_amount || 0), 0)
  return { arrivals, checkedIn, checkouts, balanceDue }
})

function resetFilters() {
  q.value = ""
  sourceFilter.value = "all"
  statusFilter.value = "all"
  tab.value = "arrivals"
}

function openDetails(row) {
  drawer.row = row
  drawer.open = true
}

function openWalkin() {
  // later: route to /admin/frontdesk/quick-book
  alert("Go to Quick Book (Walk-in)")
}

function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}

function money(v) {
  const n = Number(v || 0)
  return `$${n.toFixed(2)}`
}

function formatDateTime(s) {
  if (!s) return "-"
  return String(s).replace("T", " ").slice(0, 16)
}

function sourcePill(src) {
  if (src === "walk_in") return "bg-emerald-50 text-emerald-700"
  if (src === "phone") return "bg-blue-50 text-blue-700"
  return "bg-slate-100 text-slate-700"
}

function statusPill(st) {
  if (st === "pending") return "bg-amber-50 text-amber-700"
  if (st === "confirmed") return "bg-blue-50 text-blue-700"
  if (st === "checked_in") return "bg-emerald-50 text-emerald-700"
  if (st === "checked_out") return "bg-slate-100 text-slate-700"
  if (st === "cancelled") return "bg-rose-50 text-rose-700"
  if (st === "no_show") return "bg-rose-50 text-rose-700"
  return "bg-slate-100 text-slate-700"
}

function payPillText(status) {
  if (status === "completed") return "text-emerald-700"
  if (status === "partial") return "text-amber-700"
  if (status === "pending") return "text-slate-700"
  return "text-slate-700"
}

function canCheckIn(row) {
  return row.booking.status === "confirmed" || row.booking.status === "pending"
}

function canCheckOut(row) {
  return row.booking.status === "checked_in"
}

function doCheckIn(row) {
  alert(`Check-in: ${row.booking.booking_number} (demo)`)
}

function doCheckOut(row) {
  alert(`Check-out: ${row.booking.booking_number} (demo)`)
}

function exportCsv() {
  alert(`Export ${filteredRows.value.length} rows (demo)`)
}


function printPreview() {
  const guest = guestLabel.value

  const lines = selectedRooms.value
    .map(
      (x) =>
        `Room ${x.room_number} • ${x.type_group} ${x.beds} bed • ${x.qty}${
          draft.booking_type === "hourly" ? "h" : "n"
        } • ${money(x.total)}`
    )
    .join("<br/>")

  const w = window.open("", "_blank")
  if (!w) {
    alert("Popup blocked. Please allow popups for this site.")
    return
  }

  w.document.open()
  w.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Quick Booking Preview</title>
      </head>
      <body style="font-family: ui-sans-serif, system-ui; padding: 18px;">
        <h2 style="margin:0;">${data.property.name}</h2>
        <div style="color:#555; margin-top:6px;">Quick Booking Preview</div>
        <hr/>
        <div><b>Guest:</b> ${guest}</div>
        <div style="margin-top:6px;"><b>Stay:</b> ${stayLabel.value}</div>

        <div style="margin-top:12px;"><b>Rooms</b></div>
        <div style="margin-top:6px;">${lines || "-"}</div>

        <hr/>
        <div style="text-align:right;">
          <div>Subtotal: ${money(subtotal.value)}</div>
          <div>Tax: ${money(taxAmount.value)}</div>
          <div style="font-size:18px;"><b>Total: ${money(grandTotal.value)}</b></div>
          <div style="margin-top:6px;">Paid: ${money(draft.payment.amount_paid)}</div>
          <div><b>Balance: ${money(balance.value)}</b></div>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        <\/script>
      </body>
    </html>
  `)
  w.document.close()
}

</script>
