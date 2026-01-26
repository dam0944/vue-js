<!-- src/pages/admin/reservations/Cancellations.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-4 sm:px-6 sm:py-6">
    <!-- Top bar -->
    <div class="mx-auto">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white">
            <span class="material-icons text-[22px]">cancel</span>
          </div>
          <div>
            <h1 class="text-lg font-extrabold text-slate-900 sm:text-xl">Cancellations</h1>
            <p class="text-sm text-slate-500">
              Cancelled reservations (walk-in / phone / other). No border. No shadow.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-xs font-extrabold text-white"
            @click="exportCsv"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">file_download</span>
            Export CSV
          </button>
        </div>
      </div>

      <!-- KPI -->
      <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-2xl bg-white p-4">
          <div class="text-[11px] font-bold text-slate-500">Total Cancelled</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ filtered.length }}</div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <div class="text-[11px] font-bold text-slate-500">Paid</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(kpi.paid) }}</div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <div class="text-[11px] font-bold text-slate-500">Refunded</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(kpi.refunded) }}</div>
        </div>

        <div class="rounded-2xl bg-white p-4">
          <div class="text-[11px] font-bold text-slate-500">Net Kept</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(kpi.net) }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="mt-4 rounded-2xl bg-white p-4">
        <div class="grid gap-3 lg:grid-cols-5">
          <div class="lg:col-span-2">
            <label class="mb-1 block text-xs font-bold text-slate-500">Search</label>
            <div class="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
              <span class="material-icons text-[18px] text-slate-500">search</span>
              <input
                v-model.trim="q"
                type="text"
                placeholder="Reservation, guest, phone, room..."
                class="w-full bg-transparent text-sm text-slate-900 outline-none"
              />
              <button
                v-if="q"
                class="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700"
                @click="q = ''"
              >
                Clear
              </button>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Source</label>
            <select v-model="source" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              <option value="walk_in">walk_in</option>
              <option value="phone">phone</option>
              <option value="other">other</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Reason</label>
            <select v-model="reason" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              <option value="travel">Changed travel plan</option>
              <option value="no_show">No show</option>
              <option value="not_like">Did not like room</option>
              <option value="before_arrival">Cancelled before arrival</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Date</label>
            <div class="flex gap-2">
              <button
                class="rounded-full px-4 py-2 text-xs font-extrabold"
                :class="dateMode === 'today' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'"
                @click="dateMode = 'today'"
              >
                Today
              </button>
              <button
                class="rounded-full px-4 py-2 text-xs font-extrabold"
                :class="dateMode === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'"
                @click="dateMode = 'all'"
              >
                All
              </button>
              <button
                class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-800"
                @click="resetFilters"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="mt-4 space-y-2">
        <div
          v-for="row in paged"
          :key="row.reservation_id"
          class="rounded-2xl bg-white p-4"
          @click="open(row)"
          role="button"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <!-- Left -->
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <div class="text-sm font-extrabold text-slate-900">
                  {{ row.reservation_number }}
                </div>

                <span class="rounded-full px-3 py-1 text-[10px] font-extrabold uppercase"
                  :class="sourcePill(row.booking_source)">
                  {{ row.booking_source }}
                </span>

                <span class="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-extrabold text-rose-700">
                  cancelled
                </span>
              </div>

              <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700">
                <div class="font-bold text-slate-900">{{ row.guest.name }}</div>
                <span class="text-slate-400">•</span>
                <div class="text-slate-600">{{ row.guest.phone }}</div>
                <span class="text-slate-400">•</span>
                <div class="text-slate-600">
                  Room {{ row.room.room_number }} (Floor {{ row.room.floor }})
                </div>
                <span class="text-slate-400">•</span>
                <div class="text-slate-600">
                  {{ row.room.room_type }} • {{ row.room.beds }} bed
                </div>
              </div>

              <div class="mt-2 text-xs text-slate-500">
                Cancelled at:
                <span class="font-bold text-slate-700">{{ fmt(row.cancellation.cancelled_at) }}</span>
                <span class="text-slate-300">•</span>
                By: <span class="font-bold text-slate-700">{{ row.cancellation.cancelled_by }}</span>
              </div>

              <div class="mt-1 text-xs text-slate-500 line-clamp-2">
                Reason: <span class="font-semibold text-slate-700">{{ row.cancellation.reason || "-" }}</span>
              </div>
            </div>

            <!-- Right -->
            <div class="flex shrink-0 items-end justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
              <div class="text-right">
                <div class="text-[11px] font-bold text-slate-500">Total</div>
                <div class="text-lg font-extrabold text-slate-900">{{ money(row.pricing.total_room_charges) }}</div>
              </div>

              <div class="flex gap-2">
                <div class="rounded-2xl bg-slate-100 px-3 py-2 text-right">
                  <div class="text-[10px] font-bold text-slate-500">Paid</div>
                  <div class="text-xs font-extrabold text-slate-900">{{ money(row.pricing.paid_amount) }}</div>
                </div>
                <div class="rounded-2xl bg-slate-100 px-3 py-2 text-right">
                  <div class="text-[10px] font-bold text-slate-500">Refund</div>
                  <div class="text-xs font-extrabold text-slate-900">{{ money(row.pricing.refund_amount) }}</div>
                </div>
              </div>

              <button
                class="mt-0.5 hidden rounded-full bg-slate-900 px-4 py-2 text-xs font-extrabold text-white sm:inline-flex"
                @click.stop="open(row)"
              >
                Details
              </button>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-if="filtered.length === 0" class="rounded-2xl bg-white p-10 text-center">
          <div class="text-base font-extrabold text-slate-900">No cancellations</div>
          <div class="mt-1 text-sm text-slate-500">Try clearing filters or search another keyword.</div>
          <button class="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-extrabold text-white" @click="resetFilters">
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filtered.length > 0" class="mt-4 flex items-center justify-between">
        <button
          class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-800 disabled:opacity-40"
          :disabled="page.current === 1"
          @click="page.current--"
        >
          Prev
        </button>
        <div class="text-xs font-bold text-slate-500">Page {{ page.current }} / {{ totalPages }}</div>
        <button
          class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-800 disabled:opacity-40"
          :disabled="page.current === totalPages"
          @click="page.current++"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Drawer -->
    <div v-if="drawer.open" class="fixed inset-0 z-40" @click="closeDrawer">
      <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <aside
      v-if="drawer.open"
      class="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white"
      aria-label="Cancellation details"
    >
      <!-- Drawer Header -->
      <div class="flex items-center justify-between px-5 py-4">
        <div class="min-w-0">
          <div class="text-xs font-bold text-slate-500">CANCELLATION DETAILS</div>
          <div class="truncate text-base font-extrabold text-slate-900">
            {{ drawer.row?.reservation_number }}
          </div>
        </div>
        <button class="grid h-10 w-10 place-items-center rounded-full bg-slate-100" @click="closeDrawer">
          <span class="material-icons text-slate-700">close</span>
        </button>
      </div>

      <!-- Drawer Body -->
      <div class="h-[calc(100vh-140px)] overflow-y-auto px-5 pb-6">
        <div v-if="drawer.row" class="space-y-4">
          <!-- Guest -->
          <div class="rounded-2xl bg-slate-50 p-4">
            <div class="text-xs font-bold text-slate-500">GUEST</div>
            <div class="mt-1 text-base font-extrabold text-slate-900">{{ drawer.row.guest.name }}</div>
            <div class="mt-0.5 text-sm text-slate-600">{{ drawer.row.guest.phone }}</div>
            <div class="mt-1 text-xs text-slate-500">Nationality: {{ drawer.row.guest.nationality || "-" }}</div>
          </div>

          <!-- Room -->
          <div class="rounded-2xl bg-slate-50 p-4">
            <div class="text-xs font-bold text-slate-500">ROOM</div>
            <div class="mt-1 flex items-center justify-between">
              <div class="text-base font-extrabold text-slate-900">
                Room {{ drawer.row.room.room_number }}
              </div>
              <div class="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-slate-700">
                Floor {{ drawer.row.room.floor }}
              </div>
            </div>
            <div class="mt-1 text-sm text-slate-700">
              {{ drawer.row.room.room_type }} • {{ drawer.row.room.beds }} bed
            </div>
          </div>

          <!-- Stay -->
          <div class="rounded-2xl bg-slate-50 p-4">
            <div class="text-xs font-bold text-slate-500">STAY</div>
            <div class="mt-1 flex items-center justify-between">
              <div class="text-sm font-extrabold text-slate-900">
                {{ prettyBookingType(drawer.row.stay.booking_type) }}
              </div>
              <div class="text-xs font-bold text-slate-600">
                {{ stayUnits(drawer.row.stay) }}
              </div>
            </div>
            <div class="mt-2 grid grid-cols-2 gap-2">
              <div class="rounded-2xl bg-white p-3">
                <div class="text-[10px] font-bold text-slate-500">Check-in</div>
                <div class="mt-0.5 text-xs font-extrabold text-slate-900">{{ fmt(drawer.row.stay.check_in) }}</div>
              </div>
              <div class="rounded-2xl bg-white p-3">
                <div class="text-[10px] font-bold text-slate-500">Check-out</div>
                <div class="mt-0.5 text-xs font-extrabold text-slate-900">{{ fmt(drawer.row.stay.check_out) }}</div>
              </div>
            </div>
          </div>

          <!-- Money -->
          <div class="rounded-2xl bg-slate-50 p-4">
            <div class="text-xs font-bold text-slate-500">PAYMENT</div>
            <div class="mt-2 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600">Total room charges</span>
                <span class="font-extrabold text-slate-900">{{ money(drawer.row.pricing.total_room_charges) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600">Paid amount</span>
                <span class="font-extrabold text-slate-900">{{ money(drawer.row.pricing.paid_amount) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600">Refund amount</span>
                <span class="font-extrabold text-slate-900">{{ money(drawer.row.pricing.refund_amount) }}</span>
              </div>
              <div class="h-px bg-slate-200"></div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600">Net kept</span>
                <span class="font-extrabold text-slate-900">
                  {{ money((drawer.row.pricing.paid_amount || 0) - (drawer.row.pricing.refund_amount || 0)) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Cancellation -->
          <div class="rounded-2xl bg-slate-50 p-4">
            <div class="text-xs font-bold text-slate-500">CANCELLATION</div>
            <div class="mt-2 text-xs text-slate-600">
              Cancelled at:
              <span class="font-extrabold text-slate-900">{{ fmt(drawer.row.cancellation.cancelled_at) }}</span>
            </div>
            <div class="mt-1 text-xs text-slate-600">
              Cancelled by:
              <span class="font-extrabold text-slate-900">{{ drawer.row.cancellation.cancelled_by || "-" }}</span>
            </div>
            <div class="mt-2 rounded-2xl bg-white p-3 text-sm text-slate-800">
              <div class="text-[10px] font-bold text-slate-500">Reason</div>
              <div class="mt-1 font-semibold">{{ drawer.row.cancellation.reason || "-" }}</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-2 gap-2">
            <button class="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-extrabold text-slate-800" @click="copyText(drawer.row.reservation_number)">
              Copy RES #
            </button>
            <button class="rounded-2xl bg-slate-900 px-4 py-3 text-xs font-extrabold text-white" @click="printRow(drawer.row)">
              Print
            </button>
          </div>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="px-5 pb-5">
        <button class="w-full rounded-2xl bg-slate-900 py-3 text-sm font-extrabold text-white" @click="closeDrawer">
          Close
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { reservationsCancellationsData } from "@/data/reservation/reservationsCancellations"

const data = reservationsCancellationsData

const q = ref("")
const source = ref("all")
const reason = ref("all")
const dateMode = ref("all") // today/all

const page = reactive({ current: 1, size: 8 })
const drawer = reactive({ open: false, row: null })

const rows = computed(() => data.cancellations || [])

const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return rows.value.filter((r) => {
    // source filter
    if (source.value !== "all" && r.booking_source !== source.value) return false

    // reason filter (simple mapping)
    if (reason.value !== "all") {
      const mapped = mapReason(r.cancellation?.reason || "")
      if (mapped !== reason.value) return false
    }

    // date filter: compare by cancelled_at date
    if (dateMode.value === "today") {
      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, "0")
      const d = String(today.getDate()).padStart(2, "0")
      const todayStr = `${y}-${m}-${d}`
      const cancelled = String(r.cancellation?.cancelled_at || "").slice(0, 10)
      if (cancelled !== todayStr) return false
    }

    if (!keyword) return true

    const hay = [
      r.reservation_number,
      r.guest?.name,
      r.guest?.phone,
      r.room?.room_number,
      r.room?.room_type,
      r.cancellation?.reason,
      r.cancellation?.cancelled_by,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return hay.includes(keyword)
  })
})

const kpi = computed(() => {
  const paid = filtered.value.reduce((a, x) => a + Number(x.pricing?.paid_amount || 0), 0)
  const refunded = filtered.value.reduce((a, x) => a + Number(x.pricing?.refund_amount || 0), 0)
  return { paid, refunded, net: paid - refunded }
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / page.size)))
const paged = computed(() => {
  const start = (page.current - 1) * page.size
  return filtered.value.slice(start, start + page.size)
})

watch([q, source, reason, dateMode], () => (page.current = 1))

function resetFilters() {
  q.value = ""
  source.value = "all"
  reason.value = "all"
  dateMode.value = "all"
}

function open(row) {
  drawer.row = row
  drawer.open = true
}

function closeDrawer() {
  drawer.open = false
  drawer.row = null
}

function money(v) {
  const n = Number(v || 0)
  return `$${n.toFixed(2)}`
}

function fmt(s) {
  if (!s) return "-"
  return String(s).replace("T", " ").slice(0, 16)
}

function prettyBookingType(t) {
  if (!t) return "-"
  return t === "hourly" ? "Hourly" : t === "nightly" ? "Nightly" : String(t)
}

function stayUnits(stay) {
  if (!stay) return "-"
  const unit = stay.booking_type === "hourly" ? "h" : "n"
  return `${stay.nights_or_hours ?? "-"}${unit}`
}

function sourcePill(s) {
  if (s === "walk_in") return "bg-emerald-50 text-emerald-700"
  if (s === "phone") return "bg-blue-50 text-blue-700"
  return "bg-slate-100 text-slate-700"
}

function mapReason(reasonText) {
  const t = String(reasonText || "").toLowerCase()
  if (t.includes("travel")) return "travel"
  if (t.includes("no show") || t.includes("noshow")) return "no_show"
  if (t.includes("did not like") || t.includes("didn't like") || t.includes("not like")) return "not_like"
  if (t.includes("before arrival")) return "before_arrival"
  return "other"
}

function exportCsv() {
  const header = [
    "reservation_number",
    "guest_name",
    "guest_phone",
    "room_number",
    "room_type",
    "booking_source",
    "booking_type",
    "check_in",
    "check_out",
    "total_room_charges",
    "paid_amount",
    "refund_amount",
    "cancelled_at",
    "cancelled_by",
    "reason",
  ]

  const lines = filtered.value.map((r) => [
    r.reservation_number,
    r.guest?.name,
    r.guest?.phone,
    r.room?.room_number,
    r.room?.room_type,
    r.booking_source,
    r.stay?.booking_type,
    r.stay?.check_in,
    r.stay?.check_out,
    r.pricing?.total_room_charges,
    r.pricing?.paid_amount,
    r.pricing?.refund_amount,
    r.cancellation?.cancelled_at,
    r.cancellation?.cancelled_by,
    (r.cancellation?.reason || "").replaceAll("\n", " "),
  ])

  const csv = [header, ...lines]
    .map((row) => row.map((x) => `"${String(x ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `cancellations_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function copyText(text) {
  const t = String(text || "")
  if (!t) return
  navigator.clipboard?.writeText(t)
}
function printRow(row) {
  const w = window.open("", "_blank")
  if (!w) return alert("Popup blocked. Please allow popups.")

  const unit = row?.stay?.booking_type === "hourly" ? "h" : "n"
  const units = `${row?.stay?.nights_or_hours ?? "-"}${unit}`

  w.document.open()
  w.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Cancellation ${row?.reservation_number || ""}</title>
  </head>
  <body style="font-family: ui-sans-serif, system-ui; padding: 18px;">
    <h2 style="margin:0;">${data?.property?.name || ""}</h2>
    <div style="color:#555; margin-top:6px;">Cancellation Receipt</div>
    <hr/>
    <div><b>Reservation:</b> ${row?.reservation_number || "-"}</div>
    <div><b>Guest:</b> ${row?.guest?.name || "-"}</div>
    <div><b>Phone:</b> ${row?.guest?.phone || "-"}</div>

    <div style="margin-top:10px;">
      <b>Room:</b> ${row?.room?.room_number || "-"} • ${row?.room?.room_type || "-"} • ${row?.room?.beds || "-"} bed
    </div>

    <div><b>Stay:</b> ${prettyBookingType(row?.stay?.booking_type)} • ${units}</div>
    <div><b>Check-in:</b> ${row?.stay?.check_in || "-"}</div>
    <div><b>Check-out:</b> ${row?.stay?.check_out || "-"}</div>

    <hr/>
    <div><b>Cancelled at:</b> ${row?.cancellation?.cancelled_at || "-"}</div>
    <div><b>Cancelled by:</b> ${row?.cancellation?.cancelled_by || "-"}</div>
    <div><b>Reason:</b> ${row?.cancellation?.reason || "-"}</div>

    <hr/>
    <div style="text-align:right;">
      <div>Total: ${money(row?.pricing?.total_room_charges || 0)}</div>
      <div>Paid: ${money(row?.pricing?.paid_amount || 0)}</div>
      <div>Refund: ${money(row?.pricing?.refund_amount || 0)}</div>
      <div style="font-size:18px;">
        <b>Net kept: ${money((row?.pricing?.paid_amount || 0) - (row?.pricing?.refund_amount || 0))}</b>
      </div>
    </div>

    <script>
      window.onload = function () { window.print(); };
    <\/script>
  </body>
</html>`)
  w.document.close()
}

</script>

<style scoped>
/* no border, no shadow: everything is plain blocks */
</style>
