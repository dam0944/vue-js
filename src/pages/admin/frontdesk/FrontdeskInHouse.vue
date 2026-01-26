<!-- src/pages/frontdesk/InHouse.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 p-4 sm:p-6">
    <!-- Header -->
    <div class="mx-auto">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-xl font-extrabold text-slate-900">In-House Guests</h1>
          <p class="text-sm text-slate-500">
            Guests currently checked-in (live view). No border / no shadow.
          </p>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div class="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
            <span class="material-icons text-[18px] text-slate-400">search</span>
            <input
              v-model.trim="q"
              type="text"
              placeholder="Search guest / phone / room / booking..."
              class="w-[280px] max-w-full bg-transparent text-sm text-slate-900 outline-none"
            />
            <button
              v-if="q"
              class="rounded-lg px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100"
              @click="q = ''"
            >
              Clear
            </button>
          </div>

          <select v-model="typeFilter" class="rounded-xl bg-white px-3 py-2 text-sm text-slate-900 outline-none">
            <option value="all">All types</option>
            <option value="hourly">Hourly</option>
            <option value="nightly">Nightly</option>
          </select>

          <select v-model="payFilter" class="rounded-xl bg-white px-3 py-2 text-sm text-slate-900 outline-none">
            <option value="all">All payments</option>
            <option value="completed">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
          </select>

          <button
            class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white"
            @click="refreshDemo"
            title="Static demo only"
          >
            Refresh
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-bold text-slate-500">In-House</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.inHouse }}</div>
          <div class="mt-1 text-xs text-slate-500">Guests checked-in</div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-bold text-slate-500">Rooms Used</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.roomsUsed }}</div>
          <div class="mt-1 text-xs text-slate-500">Active rooms</div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-bold text-slate-500">Balance Due</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(stats.balanceDue) }}</div>
          <div class="mt-1 text-xs text-slate-500">Unpaid amount</div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-bold text-slate-500">Today Revenue</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(stats.paidToday) }}</div>
          <div class="mt-1 text-xs text-slate-500">Demo = sum paid</div>
        </div>
      </div>

      <!-- Chips -->
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <button
          v-for="c in chips"
          :key="c.key"
          class="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
          @click="applyChip(c.key)"
        >
          <span class="mr-2 inline-flex h-2 w-2 rounded-full" :class="c.dot"></span>
          {{ c.label }} <span class="ml-1 text-slate-500">({{ c.count }})</span>
        </button>

        <button class="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100" @click="resetFilters">
          Reset
        </button>
      </div>

      <!-- List -->
      <div class="grid gap-3 lg:grid-cols-2">
        <div
          v-for="row in paginated"
          :key="row.booking.booking_id"
          class="rounded-3xl bg-white p-4"
        >
          <!-- Top -->
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <div class="text-base font-extrabold text-slate-900 truncate">
                  {{ guestName(row.guest) }}
                </div>

                <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                  {{ row.booking.booking_number }}
                </span>

                <span
                  class="rounded-full px-3 py-1 text-[11px] font-extrabold"
                  :class="sourceBadge(row.booking.booking_source)"
                >
                  {{ pretty(row.booking.booking_source) }}
                </span>

                <span
                  class="rounded-full px-3 py-1 text-[11px] font-extrabold"
                  :class="payBadge(row.payment.status)"
                >
                  {{ pretty(row.payment.status) }}
                </span>
              </div>

              <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span class="inline-flex items-center gap-1">
                  <span class="material-icons text-[16px]">call</span>
                  {{ row.guest.phone }}
                </span>
                <span class="inline-flex items-center gap-1">
                  <span class="material-icons text-[16px]">flag</span>
                  {{ row.guest.nationality || "-" }}
                </span>
                <span v-if="row.guest.guest_type" class="inline-flex items-center gap-1">
                  <span class="material-icons text-[16px]">badge</span>
                  {{ pretty(row.guest.guest_type) }}
                </span>
              </div>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <button
                class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-200"
                @click="openDrawer(row)"
              >
                Details
              </button>

              <button
                class="rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white"
                @click="printPreview(row)"
              >
                Print
              </button>
            </div>
          </div>

          <!-- Rooms pills -->
          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="r in row.reservations"
              :key="r.reservation_id"
              class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800"
            >
              Room {{ r.room_number }} • {{ r.room_type.type_name }} • {{ r.room_type.bed_count }} bed
            </span>
          </div>

          <!-- Stay + Money -->
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl bg-slate-50 p-3">
              <div class="text-[11px] font-extrabold text-slate-500">STAY</div>
              <div class="mt-1 text-sm font-bold text-slate-900">
                {{ stayLabel(row) }}
              </div>
              <div class="mt-1 text-xs text-slate-500">
                Check-in: {{ shortDT(firstCheckin(row)) }} • Check-out: {{ shortDT(lastCheckout(row)) }}
              </div>
            </div>

            <div class="rounded-2xl bg-slate-50 p-3">
              <div class="text-[11px] font-extrabold text-slate-500">PAYMENT</div>
              <div class="mt-1 flex items-center justify-between text-sm">
                <span class="text-slate-600">Paid</span>
                <span class="font-extrabold text-slate-900">{{ money(row.payment.paid_amount) }}</span>
              </div>
              <div class="mt-1 flex items-center justify-between text-sm">
                <span class="text-slate-600">Balance</span>
                <span class="font-extrabold text-slate-900">{{ money(row.payment.balance_amount) }}</span>
              </div>
              <div class="mt-1 text-xs text-slate-500">
                Method: {{ row.payment.payment_method || "-" }}
              </div>
            </div>
          </div>

          <div v-if="row.notes" class="mt-3 text-xs text-slate-500">
            <span class="font-bold text-slate-700">Note:</span> {{ row.notes }}
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="filtered.length === 0" class="mt-8 rounded-3xl bg-white p-8 text-center">
        <div class="text-lg font-extrabold text-slate-900">No in-house guests found</div>
        <div class="mt-1 text-sm text-slate-500">Try search or reset filters.</div>
        <button class="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white" @click="resetFilters">
          Reset
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="filtered.length > 0" class="mt-6 flex items-center justify-between">
        <button
          class="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-100 disabled:opacity-40"
          :disabled="page.current === 1"
          @click="page.current--"
        >
          Prev
        </button>

        <div class="text-xs font-bold text-slate-500">
          Page {{ page.current }} / {{ totalPages }}
        </div>

        <button
          class="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-100 disabled:opacity-40"
          :disabled="page.current === totalPages"
          @click="page.current++"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Drawer -->
    <div v-if="drawer.open" class="fixed inset-0 z-40">
      <div class="absolute inset-0 bg-slate-900/40" @click="closeDrawer"></div>

      <aside
        class="absolute right-0 top-0 h-full w-full max-w-md bg-white"
        role="dialog"
        aria-modal="true"
      >
        <!-- Drawer header -->
        <div class="flex items-center justify-between px-5 py-4">
          <div>
            <div class="text-sm font-extrabold text-slate-900">In-House Details</div>
            <div class="text-xs text-slate-500">{{ drawer.row?.booking?.booking_number || "" }}</div>
          </div>
          <button class="rounded-xl bg-slate-100 p-2 hover:bg-slate-200" @click="closeDrawer">
            <span class="material-icons text-slate-700">close</span>
          </button>
        </div>

        <!-- Drawer content (no border/shadow) -->
        <div v-if="drawer.row" class="h-[calc(100vh-72px)] overflow-y-auto px-5 pb-6">
          <div class="rounded-3xl bg-slate-50 p-4">
            <div class="text-xs font-extrabold text-slate-500">GUEST</div>
            <div class="mt-1 text-lg font-extrabold text-slate-900">{{ guestName(drawer.row.guest) }}</div>
            <div class="mt-1 text-sm text-slate-700">{{ drawer.row.guest.phone }}</div>
            <div class="mt-1 text-xs text-slate-500">
              {{ drawer.row.guest.nationality }} • {{ pretty(drawer.row.guest.id_type) }} • {{ drawer.row.guest.id_number || "-" }}
            </div>
          </div>

          <div class="mt-4 rounded-3xl bg-slate-50 p-4">
            <div class="text-xs font-extrabold text-slate-500">ROOMS</div>

            <div
              v-for="r in drawer.row.reservations"
              :key="r.reservation_id"
              class="mt-3 rounded-2xl bg-white p-3"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">
                    Room {{ r.room_number }}
                    <span class="ml-2 text-xs font-bold text-slate-500">Floor {{ r.floor }}</span>
                  </div>
                  <div class="mt-1 text-xs text-slate-500">
                    {{ r.room_type.type_name }} • {{ r.room_type.bed_count }} bed • {{ pretty(r.booking_type) }}
                  </div>
                  <div class="mt-2 text-xs text-slate-600">
                    Check-in: <span class="font-bold text-slate-900">{{ shortDT(r.check_in_at) }}</span>
                    <br />
                    Check-out: <span class="font-bold text-slate-900">{{ shortDT(r.check_out_at) }}</span>
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-[11px] font-extrabold text-slate-500">TOTAL</div>
                  <div class="text-base font-extrabold text-slate-900">{{ money(r.total_room_charges) }}</div>
                  <div class="mt-1 text-xs text-slate-500">
                    Units: {{ r.total_nights_or_hours }}{{ r.booking_type === "hourly" ? "h" : "n" }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 rounded-3xl bg-slate-50 p-4">
            <div class="text-xs font-extrabold text-slate-500">PAYMENT</div>

            <div class="mt-3 flex items-center justify-between rounded-2xl bg-white p-3">
              <div class="text-sm font-bold text-slate-600">Paid</div>
              <div class="text-sm font-extrabold text-slate-900">{{ money(drawer.row.payment.paid_amount) }}</div>
            </div>

            <div class="mt-2 flex items-center justify-between rounded-2xl bg-white p-3">
              <div class="text-sm font-bold text-slate-600">Balance</div>
              <div class="text-sm font-extrabold text-slate-900">{{ money(drawer.row.payment.balance_amount) }}</div>
            </div>

            <div class="mt-2 rounded-2xl bg-white p-3 text-xs text-slate-600">
              Method: <span class="font-bold text-slate-900">{{ drawer.row.payment.payment_method || "-" }}</span>
              <br />
              Status:
              <span class="font-bold" :class="drawer.row.payment.status === 'completed' ? 'text-emerald-700' : drawer.row.payment.status === 'partial' ? 'text-amber-700' : 'text-rose-700'">
                {{ pretty(drawer.row.payment.status) }}
              </span>
            </div>
          </div>

          <div v-if="drawer.row.notes" class="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
            <div class="text-xs font-extrabold text-slate-500">NOTES</div>
            <div class="mt-1">{{ drawer.row.notes }}</div>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-2">
            <button class="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white" @click="printPreview(drawer.row)">
              Print
            </button>
            <button class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-200" @click="closeDrawer">
              Close
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue"
import { frontdeskInHouseData } from "@/data/front/frontdeskInHouse"

// state
const data = frontdeskInHouseData
const q = ref("")
const typeFilter = ref("all")
const payFilter = ref("all")
const chipKey = ref("all")
const page = reactive({ current: 1, size: 6 })

// drawer
const drawer = reactive({ open: false, row: null })

// helpers
const pretty = (s) => (s ? String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase()) : "-")
const guestName = (g) => [g?.first_name, g?.last_name].filter(Boolean).join(" ") || g?.name || "-"

const money = (v) => {
  const n = Number(v || 0)
  const cur = data.property.currency || "USD"
  // keep simple USD sign for demo
  return cur === "USD" ? `$${n.toFixed(2)}` : `${n.toFixed(0)}៛`
}

function shortDT(s) {
  if (!s) return "-"
  return String(s).replace("T", " ").slice(0, 16)
}

function firstCheckin(row) {
  return row?.reservations?.[0]?.check_in_at || ""
}
function lastCheckout(row) {
  const rs = row?.reservations || []
  if (!rs.length) return ""
  return rs[rs.length - 1].check_out_at || ""
}

function stayLabel(row) {
  const rs = row?.reservations || []
  if (!rs.length) return "-"
  // if mixed types, show "Mixed"
  const types = Array.from(new Set(rs.map((x) => x.booking_type)))
  const t = types.length === 1 ? types[0] : "mixed"
  const units = rs.reduce((sum, x) => sum + Number(x.total_nights_or_hours || 0), 0)
  const u = t === "hourly" ? `${units}h` : t === "nightly" ? `${units}n` : `${units}`
  return `${pretty(t)} • ${u}`
}

function sourceBadge(source) {
  switch (source) {
    case "walk_in": return "bg-emerald-50 text-emerald-700"
    case "phone": return "bg-blue-50 text-blue-700"
    default: return "bg-slate-100 text-slate-700"
  }
}

function payBadge(status) {
  switch (status) {
    case "completed": return "bg-emerald-50 text-emerald-700"
    case "partial": return "bg-amber-50 text-amber-700"
    default: return "bg-rose-50 text-rose-700"
  }
}

// filters
const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return (data.inHouse || []).filter((row) => {
    // chip filter
    if (chipKey.value === "paid" && row.payment.status !== "completed") return false
    if (chipKey.value === "balance" && Number(row.payment.balance_amount || 0) <= 0) return false
    if (chipKey.value === "hourly" && !row.reservations.some((x) => x.booking_type === "hourly")) return false
    if (chipKey.value === "nightly" && !row.reservations.some((x) => x.booking_type === "nightly")) return false

    // type dropdown
    if (typeFilter.value !== "all") {
      const ok = row.reservations.some((x) => x.booking_type === typeFilter.value)
      if (!ok) return false
    }

    // payment dropdown
    if (payFilter.value !== "all" && row.payment.status !== payFilter.value) return false

    // search
    if (!keyword) return true

    const g = guestName(row.guest).toLowerCase()
    const phone = String(row.guest?.phone || "")
    const bookingNo = String(row.booking?.booking_number || "").toLowerCase()
    const rooms = (row.reservations || []).map((x) => String(x.room_number || "")).join(" ").toLowerCase()

    return g.includes(keyword) || phone.includes(keyword) || bookingNo.includes(keyword) || rooms.includes(keyword)
  })
})

// pagination
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / page.size)))
const paginated = computed(() => {
  const start = (page.current - 1) * page.size
  return filtered.value.slice(start, start + page.size)
})

watch([q, typeFilter, payFilter, chipKey], () => (page.current = 1))

// stats
const stats = computed(() => {
  const rows = data.inHouse || []
  const roomsSet = new Set()
  let balance = 0
  let paid = 0

  rows.forEach((r) => {
    ;(r.reservations || []).forEach((x) => roomsSet.add(String(x.room_number)))
    balance += Number(r.payment.balance_amount || 0)
    paid += Number(r.payment.paid_amount || 0)
  })

  return {
    inHouse: rows.length,
    roomsUsed: roomsSet.size,
    balanceDue: balance,
    paidToday: paid,
  }
})

const chips = computed(() => {
  const rows = data.inHouse || []
  const countPaid = rows.filter((r) => r.payment.status === "completed").length
  const countBalance = rows.filter((r) => Number(r.payment.balance_amount || 0) > 0).length
  const countHourly = rows.filter((r) => (r.reservations || []).some((x) => x.booking_type === "hourly")).length
  const countNightly = rows.filter((r) => (r.reservations || []).some((x) => x.booking_type === "nightly")).length

  return [
    { key: "all", label: "All", count: rows.length, dot: "bg-slate-400" },
    { key: "paid", label: "Paid", count: countPaid, dot: "bg-emerald-500" },
    { key: "balance", label: "Balance", count: countBalance, dot: "bg-rose-500" },
    { key: "hourly", label: "Hourly", count: countHourly, dot: "bg-amber-500" },
    { key: "nightly", label: "Nightly", count: countNightly, dot: "bg-blue-500" },
  ]
})

function applyChip(key) {
  chipKey.value = key
}

function resetFilters() {
  q.value = ""
  typeFilter.value = "all"
  payFilter.value = "all"
  chipKey.value = "all"
}

function openDrawer(row) {
  drawer.row = row
  drawer.open = true
}
function closeDrawer() {
  drawer.open = false
  drawer.row = null
}

function refreshDemo() {
  // static demo only
  console.log("refresh demo")
}

// print preview (safe)
function printPreview(row) {
  if (!row) return

  const guest = guestName(row.guest)
  const lines = (row.reservations || [])
    .map((r) => {
      const unit = r.booking_type === "hourly" ? "h" : "n"
      return `Room ${r.room_number} • ${r.room_type.type_name} ${r.room_type.bed_count} bed • ${r.total_nights_or_hours}${unit} • ${money(r.total_room_charges)}`
    })
    .join("<br/>")

  const w = window.open("", "_blank")
  if (!w) return alert("Popup blocked. Please allow popups for print preview.")

  // IMPORTANT: escape closing script tag
  w.document.write(`
    <html>
      <head><title>In-House Preview</title></head>
      <body style="font-family: ui-sans-serif, system-ui; padding: 18px;">
        <h2 style="margin:0;">${data.property.property_name}</h2>
        <div style="color:#555; margin-top:6px;">In-House Preview</div>
        <hr/>
        <div><b>Guest:</b> ${guest}</div>
        <div style="margin-top:8px;"><b>Booking:</b> ${row.booking.booking_number}</div>
        <div style="margin-top:12px;"><b>Rooms</b></div>
        <div style="margin-top:6px;">${lines || "-"}</div>
        <hr/>
        <div style="text-align:right;">
          <div>Paid: ${money(row.payment.paid_amount)}</div>
          <div><b>Balance: ${money(row.payment.balance_amount)}</b></div>
        </div>
        <script>
          window.onload = () => { window.print(); };
        <\/script>
      </body>
    </html>
  `)
  w.document.close()
}
</script>

<style scoped>
.material-icons {
  font-size: 20px;
  vertical-align: middle;
}
</style>
