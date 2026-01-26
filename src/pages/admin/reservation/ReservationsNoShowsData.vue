<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 p-4 sm:p-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div class="flex items-center gap-3">
            <div class="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-white">
              <span class="material-icons text-[22px]">person_off</span>
            </div>
            <div>
              <h1 class="text-xl font-semibold text-slate-900">No-Shows</h1>
              <p class="text-sm text-slate-500">Reservations marked as <b>no_show</b> (guest didn’t arrive).</p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            @click="exportCsv"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">file_download</span>
            Export
          </button>
          <button
            class="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800"
            @click="resetFilters"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">refresh</span>
            Reset
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="mt-4 flex flex-wrap gap-2">
        <button
          v-for="chip in summaryChips"
          :key="chip.key"
          class="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-800"
          @click="applyChip(chip.key)"
        >
          <span class="mr-2 inline-flex h-2 w-2 rounded-full" :class="chip.dot"></span>
          {{ chip.label }}: <span class="font-bold text-slate-900">{{ chip.count }}</span>
        </button>
      </div>

      <!-- Filters -->
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl bg-slate-100 px-3 py-2">
          <div class="mb-1 text-xs font-semibold text-slate-600">Search</div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-[18px] text-slate-500">search</span>
            <input
              v-model.trim="q"
              type="text"
              placeholder="Reservation, guest, phone, room..."
              class="w-full bg-transparent text-sm text-slate-900 outline-none"
            />
          </div>
        </div>

        <div class="rounded-2xl bg-slate-100 px-3 py-2">
          <div class="mb-1 text-xs font-semibold text-slate-600">Source</div>
          <select v-model="source" class="w-full bg-transparent text-sm text-slate-900 outline-none">
            <option value="all">All</option>
            <option v-for="x in sourceOptions" :key="x" :value="x">{{ pretty(x) }}</option>
          </select>
        </div>

        <div class="rounded-2xl bg-slate-100 px-3 py-2">
          <div class="mb-1 text-xs font-semibold text-slate-600">Booking type</div>
          <select v-model="bookingType" class="w-full bg-transparent text-sm text-slate-900 outline-none">
            <option value="all">All</option>
            <option value="hourly">Hourly</option>
            <option value="nightly">Nightly</option>
          </select>
        </div>

        <div class="rounded-2xl bg-slate-100 px-3 py-2">
          <div class="mb-1 text-xs font-semibold text-slate-600">Date</div>
          <div class="flex gap-2">
            <button
              class="rounded-full px-4 py-2 text-xs font-bold"
              :class="dateFilter === 'today' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-800'"
              @click="dateFilter = 'today'"
            >
              Today
            </button>
            <button
              class="rounded-full px-4 py-2 text-xs font-bold"
              :class="dateFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-800'"
              @click="dateFilter = 'all'"
            >
              All
            </button>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="mt-4">
        <!-- Mobile cards -->
        <div class="grid gap-2 sm:hidden">
          <button
            v-for="row in paginatedRows"
            :key="row.reservation_id"
            class="rounded-2xl bg-slate-100 p-4 text-left"
            @click="openDrawer(row)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-bold text-slate-900">{{ row.reservation_number }}</div>
                <div class="text-xs text-slate-600">
                  {{ row.guest?.name }} • {{ row.guest?.phone }}
                </div>
                <div class="mt-1 text-xs text-slate-600">
                  Room {{ row.room?.room_number }} • {{ row.room?.room_type }} {{ row.room?.beds }} bed
                </div>
              </div>

              <div class="text-right">
                <div class="text-xs text-slate-600">{{ pretty(row.booking_source) }}</div>
                <div class="text-sm font-bold text-slate-900">{{ money(row.pricing?.total_room_charges || 0) }}</div>
              </div>
            </div>

            <div class="mt-2 text-xs text-slate-600">
              Marked: <b class="text-slate-900">{{ row.no_show?.marked_at || "-" }}</b>
            </div>
          </button>
        </div>

        <!-- Desktop table -->
        <div class="hidden overflow-x-auto sm:block">
          <table class="w-full border-separate border-spacing-0">
            <thead class="text-left text-xs font-bold text-slate-600">
              <tr>
                <th class="p-3">Reservation</th>
                <th class="p-3">Guest</th>
                <th class="p-3">Room</th>
                <th class="p-3">Stay</th>
                <th class="p-3 text-right">Total</th>
                <th class="p-3">Marked</th>
                <th class="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in paginatedRows"
                :key="row.reservation_id"
                class="cursor-pointer hover:bg-slate-100"
                @click="openDrawer(row)"
              >
                <td class="p-3">
                  <div class="font-bold text-slate-900">{{ row.reservation_number }}</div>
                  <div class="text-xs text-slate-600">{{ pretty(row.booking_source) }}</div>
                </td>

                <td class="p-3">
                  <div class="text-sm font-bold text-slate-900">{{ row.guest?.name || "-" }}</div>
                  <div class="text-xs text-slate-600">{{ row.guest?.phone || "-" }}</div>
                </td>

                <td class="p-3">
                  <div class="text-sm font-bold text-slate-900">Room {{ row.room?.room_number || "-" }}</div>
                  <div class="text-xs text-slate-600">
                    {{ row.room?.room_type || "-" }} • {{ row.room?.beds || "-" }} bed
                  </div>
                </td>

                <td class="p-3 text-xs text-slate-700">
                  <div class="font-bold text-slate-900">{{ prettyBookingType(row.stay?.booking_type) }}</div>
                  <div>{{ row.stay?.check_in || "-" }}</div>
                  <div>{{ row.stay?.check_out || "-" }}</div>
                </td>

                <td class="p-3 text-right font-bold text-slate-900">
                  {{ money(row.pricing?.total_room_charges || 0) }}
                </td>

                <td class="p-3 text-xs text-slate-700">
                  <div class="font-bold text-slate-900">{{ row.no_show?.marked_at || "-" }}</div>
                  <div class="text-slate-600">{{ row.no_show?.marked_by || "-" }}</div>
                </td>

                <td class="p-3 text-right">
                  <button
                    class="rounded-full bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                    @click.stop="printRow(row)"
                  >
                    <span class="material-icons mr-1 align-middle text-[16px]">print</span>
                    Print
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-3 flex items-center justify-between">
          <button
            class="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-800 disabled:opacity-40"
            :disabled="page.current === 1"
            @click="page.current--"
          >
            Prev
          </button>
          <div class="text-xs text-slate-600">Page {{ page.current }} of {{ totalPages }}</div>
          <button
            class="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-800 disabled:opacity-40"
            :disabled="page.current === totalPages"
            @click="page.current++"
          >
            Next
          </button>
        </div>

        <!-- Empty -->
        <div v-if="filteredRows.length === 0" class="mt-6 rounded-2xl bg-slate-100 p-6 text-center">
          <div class="text-slate-900 font-bold">No results</div>
          <div class="mt-1 text-sm text-slate-600">Try another filter or clear search.</div>
        </div>
      </div>
    </div>

    <!-- Drawer -->
    <div v-if="drawer.open" class="fixed inset-0 z-40 bg-black/30" @click="closeDrawer"></div>

    <aside
      v-if="drawer.open"
      class="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-slate-50"
    >
      <!-- Drawer header (no border/shadow) -->
      <div class="flex items-center justify-between px-4 py-4">
        <div>
          <div class="text-xs font-semibold text-slate-600">NO-SHOW DETAILS</div>
          <div class="text-lg font-bold text-slate-900">{{ drawer.row?.reservation_number }}</div>
        </div>
        <button class="rounded-full bg-slate-100 p-2" @click="closeDrawer">
          <span class="material-icons text-slate-700">close</span>
        </button>
      </div>

      <div v-if="drawer.row" class="h-[calc(100vh-84px)] overflow-y-auto px-4 pb-4">
        <!-- Guest -->
        <div class="rounded-2xl bg-white p-4">
          <div class="text-xs font-semibold text-slate-600">Guest</div>
          <div class="mt-1 text-base font-bold text-slate-900">{{ drawer.row.guest?.name || "-" }}</div>
          <div class="text-sm text-slate-600">{{ drawer.row.guest?.phone || "-" }}</div>
          <div class="mt-2 text-xs text-slate-600">
            Nationality: <b class="text-slate-900">{{ drawer.row.guest?.nationality || "-" }}</b>
          </div>
        </div>

        <!-- Room -->
        <div class="mt-3 rounded-2xl bg-white p-4">
          <div class="text-xs font-semibold text-slate-600">Room</div>
          <div class="mt-1 text-base font-bold text-slate-900">
            Room {{ drawer.row.room?.room_number || "-" }}
          </div>
          <div class="text-sm text-slate-600">
            {{ drawer.row.room?.room_type || "-" }} • {{ drawer.row.room?.beds || "-" }} bed • Floor {{ drawer.row.room?.floor || "-" }}
          </div>
        </div>

        <!-- Stay -->
        <div class="mt-3 rounded-2xl bg-white p-4">
          <div class="text-xs font-semibold text-slate-600">Stay</div>
          <div class="mt-1 text-sm font-bold text-slate-900">
            {{ prettyBookingType(drawer.row.stay?.booking_type) }}
            • {{ unitsLabel(drawer.row) }}
          </div>
          <div class="mt-2 text-sm text-slate-700">
            <div>Check-in: <b class="text-slate-900">{{ drawer.row.stay?.check_in || "-" }}</b></div>
            <div>Check-out: <b class="text-slate-900">{{ drawer.row.stay?.check_out || "-" }}</b></div>
          </div>
        </div>

        <!-- No show -->
        <div class="mt-3 rounded-2xl bg-white p-4">
          <div class="text-xs font-semibold text-slate-600">No-show info</div>
          <div class="mt-2 text-sm text-slate-700">
            <div>Marked at: <b class="text-slate-900">{{ drawer.row.no_show?.marked_at || "-" }}</b></div>
            <div>Marked by: <b class="text-slate-900">{{ drawer.row.no_show?.marked_by || "-" }}</b></div>
            <div class="mt-2 text-xs text-slate-600">Reason</div>
            <div class="text-sm font-semibold text-slate-900">{{ drawer.row.no_show?.reason || "-" }}</div>
          </div>
        </div>

        <!-- Money -->
        <div class="mt-3 rounded-2xl bg-white p-4">
          <div class="text-xs font-semibold text-slate-600">Money</div>
          <div class="mt-2 text-sm text-slate-700 space-y-1">
            <div class="flex justify-between">
              <span>Total room charges</span>
              <b class="text-slate-900">{{ money(drawer.row.pricing?.total_room_charges || 0) }}</b>
            </div>
            <div class="flex justify-between">
              <span>Deposit</span>
              <b class="text-slate-900">{{ money(drawer.row.pricing?.deposit_amount || 0) }}</b>
            </div>
            <div class="flex justify-between">
              <span>Paid</span>
              <b class="text-slate-900">{{ money(drawer.row.pricing?.paid_amount || 0) }}</b>
            </div>
            <div class="flex justify-between">
              <span>Forfeited / kept</span>
              <b class="text-slate-900">{{ money(drawer.row.pricing?.forfeited_amount || 0) }}</b>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <button
              class="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-bold text-white"
              @click="printRow(drawer.row)"
            >
              <span class="material-icons mr-1 align-middle text-[18px]">print</span>
              Print
            </button>
            <button
              class="w-full rounded-full bg-slate-100 px-4 py-3 text-sm font-bold text-slate-800"
              @click="closeDrawer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { reservationsNoShowsData as data } from "@/data/reservation/reservationsNoShows"

// state
const q = ref("")
const source = ref("all")
const bookingType = ref("all")
const dateFilter = ref("all")
const page = reactive({ current: 1, size: 10 })
const drawer = reactive({ open: false, row: null })

const rows = computed(() => data.noShows || [])

const sourceOptions = computed(() => {
  return Array.from(new Set(rows.value.map((r) => r.booking_source))).filter(Boolean)
})

const filteredRows = computed(() => {
  const keyword = q.value.trim().toLowerCase()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  return rows.value.filter((r) => {
    // keyword
    if (keyword) {
      const hay = JSON.stringify(r).toLowerCase()
      if (!hay.includes(keyword)) return false
    }

    // source
    if (source.value !== "all" && r.booking_source !== source.value) return false

    // booking type
    const bt = r.stay?.booking_type
    if (bookingType.value !== "all" && bt !== bookingType.value) return false

    // today filter (check marked_at)
    if (dateFilter.value === "today") {
      const d = (r.no_show?.marked_at || "").slice(0, 10)
      if (d !== todayStr) return false
    }

    return true
  })
})

const totalPages = computed(() => Math.ceil(filteredRows.value.length / page.size) || 1)
const paginatedRows = computed(() => {
  const start = (page.current - 1) * page.size
  return filteredRows.value.slice(start, start + page.size)
})

const summaryChips = computed(() => {
  const count = (src) => rows.value.filter((r) => r.booking_source === src).length
  return [
    { key: "all", label: "All", count: rows.value.length, dot: "bg-slate-500" },
    { key: "walk_in", label: "Walk-in", count: count("walk_in"), dot: "bg-emerald-500" },
    { key: "phone", label: "Phone", count: count("phone"), dot: "bg-blue-500" },
    { key: "other", label: "Other", count: count("other"), dot: "bg-amber-500" },
  ]
})

// actions
function openDrawer(row) {
  drawer.row = row
  drawer.open = true
}
function closeDrawer() {
  drawer.open = false
  drawer.row = null
}
function applyChip(key) {
  if (key === "all") source.value = "all"
  else source.value = key
}
function resetFilters() {
  q.value = ""
  source.value = "all"
  bookingType.value = "all"
  dateFilter.value = "all"
}
function exportCsv() {
  alert("CSV Export demo: " + filteredRows.value.length + " rows")
}

// helpers
function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}
function prettyBookingType(s) {
  return s === "hourly" ? "Hourly" : s === "nightly" ? "Nightly" : pretty(s)
}
function unitsLabel(row) {
  const unit = row.stay?.booking_type === "hourly" ? "h" : "n"
  const u = row.stay?.nights_or_hours ?? "-"
  return `${u}${unit}`
}
function money(v) {
  const n = Number(v || 0)
  return `${data.property.currency === "USD" ? "$" : ""}${n.toFixed(2)}`
}

function printRow(row) {
  // 1) open popup
  const w = window.open("", "_blank", "noopener,noreferrer,width=420,height=700")
  if (!w) return alert("Popup blocked. Please allow popups for this site.")

  // 2) safe helpers (avoid 'data is not defined' or other errors)
  const propertyName =
    (typeof data !== "undefined" && data?.property?.name) ? data.property.name : "Guesthouse"

  const currency =
    (typeof data !== "undefined" && data?.property?.currency) ? data.property.currency : "USD"

  const moneySafe = (v) => {
    const n = Number(v || 0)
    const symbol = currency === "USD" ? "$" : ""
    return symbol + n.toFixed(2)
  }

  const prettyBookingTypeSafe = (t) => {
    if (t === "hourly") return "Hourly"
    if (t === "nightly") return "Nightly"
    return (t || "-").toString().replaceAll("_", " ")
  }

  // 3) compute units
  const unit = row?.stay?.booking_type === "hourly" ? "h" : "n"
  const units = `${row?.stay?.nights_or_hours ?? "-"}${unit}`

  // 4) write html
  w.document.open()
  w.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>No-Show ${row?.reservation_number || ""}</title>
      </head>
      <body style="font-family: ui-sans-serif, system-ui; padding: 18px; color:#0f172a;">
        <h2 style="margin:0;">${propertyName}</h2>
        <div style="color:#64748b; margin-top:6px;">No-Show Receipt</div>
        <hr style="border:none; border-top:1px solid #e2e8f0; margin:12px 0;" />

        <div><b>Reservation:</b> ${row?.reservation_number || "-"}</div>
        <div><b>Guest:</b> ${row?.guest?.name || "-"}</div>
        <div><b>Phone:</b> ${row?.guest?.phone || "-"}</div>

        <div style="margin-top:10px;">
          <b>Room:</b> ${row?.room?.room_number || "-"} • ${row?.room?.room_type || "-"} • ${row?.room?.beds || "-"} bed
        </div>

        <div><b>Stay:</b> ${prettyBookingTypeSafe(row?.stay?.booking_type)} • ${units}</div>
        <div><b>Check-in:</b> ${row?.stay?.check_in || "-"}</div>
        <div><b>Check-out:</b> ${row?.stay?.check_out || "-"}</div>

        <hr style="border:none; border-top:1px solid #e2e8f0; margin:12px 0;" />

        <div><b>Marked at:</b> ${row?.no_show?.marked_at || "-"}</div>
        <div><b>Marked by:</b> ${row?.no_show?.marked_by || "-"}</div>
        <div><b>Reason:</b> ${row?.no_show?.reason || "-"}</div>

        <hr style="border:none; border-top:1px solid #e2e8f0; margin:12px 0;" />

        <div style="text-align:right;">
          <div>Total: ${moneySafe(row?.pricing?.total_room_charges || 0)}</div>
          <div>Paid: ${moneySafe(row?.pricing?.paid_amount || 0)}</div>
          <div>Deposit kept: ${moneySafe(row?.pricing?.forfeited_amount || 0)}</div>
        </div>

        <script>
          // Wait until layout is ready, then print
          window.addEventListener("load", () => {
            setTimeout(() => {
              window.focus();
              window.print();
            }, 250);
          });
        <\/script>
      </body>
    </html>
  `)
  w.document.close()
}

watch([q, source, bookingType, dateFilter], () => {
  page.current = 1
})
watch(totalPages, () => {
  if (page.current > totalPages.value) page.current = totalPages.value
})
</script>
