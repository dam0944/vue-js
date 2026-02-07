<!-- src/pages/admin/reservations/NoShows.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 p-4 sm:p-6">
    <div class="mx-auto w-full space-y-4">
      <!-- TOP HEADER (aligned / equal) -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white">
            <span class="material-icons text-[22px]">person_off</span>
          </div>
          <div class="min-w-0">
            <h1 class="truncate text-xl font-extrabold text-slate-900">No-Shows</h1>
            <p class="text-sm text-slate-500">
              Reservations marked as <b>no_show</b> (guest didn’t arrive).
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <VaButton color="primary" class="rounded-2xl font-extrabold" @click="exportCsv">
            <VaIcon name="file_download" class="mr-1" />
            Export
          </VaButton>
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="resetFilters">
            <VaIcon name="refresh" class="mr-1" />
            Reset
          </VaButton>
        </div>
      </div>

      <!-- CHIPS + RESULTS (same row) -->
      <div class="flex items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <VaChip
            v-for="chip in summaryChips"
            :key="chip.key"
            size="small"
            class="rounded-2xl font-extrabold cursor-pointer select-none"
            :outline="chipKey !== chip.key"
            :color="chipKey === chip.key ? 'primary' : 'secondary'"
            @click="applyChip(chip.key)"
          >
            <span class="mr-2 inline-flex h-2 w-2 rounded-full" :style="{ background: chip.dot }"></span>
            {{ chip.label }}: <span class="opacity-80">{{ chip.count }}</span>
          </VaChip>
        </div>

        <div class="text-sm font-bold text-slate-600">
          Results: <span class="text-slate-900">{{ filteredRows.length }}</span>
        </div>
      </div>

      <!-- FILTER BLOCK (equal height) -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent class="p-4">
          <div class="grid grid-cols-12 gap-4 items-end">
            <!-- SEARCH -->
            <div class="col-span-12 lg:col-span-4">
              <VaInput
                v-model.trim="q"
                label="Search"
                placeholder="Reservation, guest, phone, room..."
                clearable
                class="eq"
              >
                <template #prependInner>
                  <VaIcon name="search" size="18px" color="secondary" />
                </template>
              </VaInput>
            </div>

            <!-- SOURCE -->
            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
              <VaSelect
                v-model="source"
                label="Source"
                :options="sourceSelectOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                class="eq"
                clearable
              />
            </div>

            <!-- BOOKING TYPE -->
            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
              <VaSelect
                v-model="bookingType"
                label="Booking Type"
                :options="bookingTypeOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                class="eq"
                clearable
              />
            </div>

            <!-- DATE -->
            <div class="col-span-12 lg:col-span-2">
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
          </div>

          <!-- PER PAGE + PAGINATION (same line) -->
          <div class="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div class="text-xs font-bold text-slate-500">
              Showing
              <span class="text-slate-900">{{ paginatedRows.length }}</span>
              of
              <span class="text-slate-900">{{ filteredRows.length }}</span>
            </div>

            <div class="flex items-end gap-3">
              <div class="w-[160px]">
                <VaSelect
                  v-model="page.size"
                  label="Per page"
                  :options="pageSizeOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                  class="eq"
                />
              </div>

              <VaPagination
                v-model="page.current"
                :pages="totalPages"
                :visible-pages="5"
                class="no-shadow"
              />
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- LIST -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent class="p-0">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[980px] border-separate border-spacing-0">
              <thead class="sticky top-0 bg-white">
                <tr class="text-left text-xs font-extrabold text-slate-500">
                  <th class="px-4 py-3">Reservation</th>
                  <th class="px-4 py-3">Guest</th>
                  <th class="px-4 py-3">Room</th>
                  <th class="px-4 py-3">Stay</th>
                  <th class="px-4 py-3 text-right">Total</th>
                  <th class="px-4 py-3">Marked</th>
                  <th class="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="row in paginatedRows"
                  :key="row.reservation_id"
                  class="cursor-pointer hover:bg-slate-50"
                  @click="openDetails(row)"
                >
                  <td class="px-4 py-4 align-top">
                    <div class="font-extrabold text-slate-900">{{ row.reservation_number }}</div>
                    <div class="mt-1 text-xs text-slate-500">{{ pretty(row.booking_source) }}</div>
                  </td>

                  <td class="px-4 py-4 align-top">
                    <div class="font-extrabold text-slate-900">{{ row.guest?.name || "-" }}</div>
                    <div class="mt-1 text-xs text-slate-500">{{ row.guest?.phone || "-" }}</div>
                  </td>

                  <td class="px-4 py-4 align-top">
                    <div class="font-extrabold text-slate-900">Room {{ row.room?.room_number || "-" }}</div>
                    <div class="mt-1 text-xs text-slate-500">
                      {{ row.room?.room_type || "-" }} • {{ row.room?.beds || "-" }} bed • Floor {{ row.room?.floor || "-" }}
                    </div>
                  </td>

                  <td class="px-4 py-4 align-top text-xs text-slate-600">
                    <div class="font-extrabold text-slate-900">{{ prettyBookingType(row.stay?.booking_type) }}</div>
                    <div class="mt-1">In: {{ row.stay?.check_in || "-" }}</div>
                    <div>Out: {{ row.stay?.check_out || "-" }}</div>
                  </td>

                  <td class="px-4 py-4 align-top text-right">
                    <div class="text-xs text-slate-500">Total</div>
                    <div class="text-sm font-extrabold text-slate-900">{{ money(row.pricing?.total_room_charges || 0) }}</div>
                  </td>

                  <td class="px-4 py-4 align-top text-xs text-slate-600">
                    <div class="font-extrabold text-slate-900">{{ row.no_show?.marked_at || "-" }}</div>
                    <div class="mt-1">{{ row.no_show?.marked_by || "-" }}</div>
                  </td>

                  <td class="px-4 py-4 align-top text-right" @click.stop>
                    <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="openDetails(row)">
                      Details
                    </VaButton>
                    <VaButton color="primary" size="small" class="ml-2 rounded-2xl font-extrabold" @click="printRow(row)">
                      <VaIcon name="print" class="mr-1" />
                      Print
                    </VaButton>
                  </td>
                </tr>

                <tr v-if="paginatedRows.length === 0">
                  <td colspan="7" class="px-6 py-10 text-center">
                    <div class="text-base font-extrabold text-slate-900">No results</div>
                    <div class="mt-1 text-sm text-slate-500">Try another filter or clear search.</div>
                    <VaButton preset="secondary" class="mt-4 rounded-2xl font-extrabold" @click="resetFilters">
                      Reset Filters
                    </VaButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- DETAILS POPUP (1000px, 3 grid / 2 grid responsive) -->
      <VaModal v-model="detailsOpen" max-width="1000px" hide-default-actions>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-500">NO-SHOW DETAILS</div>
              <div class="truncate text-base font-extrabold text-slate-900">
                {{ selected?.reservation_number || "-" }}
              </div>
            </div>
            <VaButton preset="plain" icon="close" @click="closeDetails" />
          </div>
        </template>

        <div v-if="selected" class="p-1">
          <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <!-- Guest -->
            <VaCard class="soft-card rounded-2xl">
              <VaCardContent class="p-4">
                <div class="text-xs font-bold text-slate-500">Guest</div>
                <div class="mt-1 text-base font-extrabold text-slate-900">{{ selected.guest?.name || "-" }}</div>
                <div class="text-sm text-slate-600">{{ selected.guest?.phone || "-" }}</div>
                <div class="mt-2 text-xs text-slate-500">
                  Nationality: <span class="font-extrabold text-slate-900">{{ selected.guest?.nationality || "-" }}</span>
                </div>
              </VaCardContent>
            </VaCard>

            <!-- Room -->
            <VaCard class="soft-card rounded-2xl">
              <VaCardContent class="p-4">
                <div class="text-xs font-bold text-slate-500">Room</div>
                <div class="mt-1 text-base font-extrabold text-slate-900">
                  Room {{ selected.room?.room_number || "-" }}
                </div>
                <div class="mt-1 text-sm text-slate-600">
                  {{ selected.room?.room_type || "-" }} • {{ selected.room?.beds || "-" }} bed • Floor {{ selected.room?.floor || "-" }}
                </div>
              </VaCardContent>
            </VaCard>

            <!-- Stay -->
            <VaCard class="soft-card rounded-2xl">
              <VaCardContent class="p-4">
                <div class="text-xs font-bold text-slate-500">Stay</div>
                <div class="mt-1 text-sm font-extrabold text-slate-900">
                  {{ prettyBookingType(selected.stay?.booking_type) }} • {{ unitsLabel(selected) }}
                </div>
                <div class="mt-2 text-sm text-slate-700 space-y-1">
                  <div>Check-in: <span class="font-extrabold text-slate-900">{{ selected.stay?.check_in || "-" }}</span></div>
                  <div>Check-out: <span class="font-extrabold text-slate-900">{{ selected.stay?.check_out || "-" }}</span></div>
                </div>
              </VaCardContent>
            </VaCard>

            <!-- No-show info -->
            <VaCard class="soft-card rounded-2xl">
              <VaCardContent class="p-4">
                <div class="text-xs font-bold text-slate-500">No-show info</div>
                <div class="mt-2 text-sm text-slate-700 space-y-1">
                  <div>Marked at: <span class="font-extrabold text-slate-900">{{ selected.no_show?.marked_at || "-" }}</span></div>
                  <div>Marked by: <span class="font-extrabold text-slate-900">{{ selected.no_show?.marked_by || "-" }}</span></div>
                </div>
                <div class="mt-3 text-xs font-bold text-slate-500">Reason</div>
                <div class="mt-1 text-sm font-extrabold text-slate-900">{{ selected.no_show?.reason || "-" }}</div>
              </VaCardContent>
            </VaCard>

            <!-- Money -->
            <VaCard class="soft-card rounded-2xl md:col-span-2 lg:col-span-2">
              <VaCardContent class="p-4">
                <div class="text-xs font-bold text-slate-500">Money</div>

                <div class="mt-3 grid grid-cols-2 gap-2">
                  <div class="soft-sub rounded-2xl p-3">
                    <div class="text-[11px] font-bold text-slate-500">Total</div>
                    <div class="mt-1 text-sm font-extrabold text-slate-900">
                      {{ money(selected.pricing?.total_room_charges || 0) }}
                    </div>
                  </div>
                  <div class="soft-sub rounded-2xl p-3">
                    <div class="text-[11px] font-bold text-slate-500">Deposit</div>
                    <div class="mt-1 text-sm font-extrabold text-slate-900">
                      {{ money(selected.pricing?.deposit_amount || 0) }}
                    </div>
                  </div>
                  <div class="soft-sub rounded-2xl p-3">
                    <div class="text-[11px] font-bold text-slate-500">Paid</div>
                    <div class="mt-1 text-sm font-extrabold text-slate-900">
                      {{ money(selected.pricing?.paid_amount || 0) }}
                    </div>
                  </div>
                  <div class="soft-sub rounded-2xl p-3">
                    <div class="text-[11px] font-bold text-slate-500">Forfeited / Kept</div>
                    <div class="mt-1 text-sm font-extrabold text-slate-900">
                      {{ money(selected.pricing?.forfeited_amount || 0) }}
                    </div>
                  </div>
                </div>

                <div class="mt-4 flex justify-end gap-2">
                  <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="closeDetails">Close</VaButton>
                  <VaButton color="primary" class="rounded-2xl font-extrabold" @click="printRow(selected)">
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
import { reservationsNoShowsData as data } from "@/data/reservation/reservationsNoShows"

// state
const q = ref("")
const source = ref("all")
const bookingType = ref("all")
const dateFilter = ref("all")

const chipKey = ref("all")

const page = reactive({ current: 1, size: 10 })

// modal
const detailsOpen = ref(false)
const selected = ref(null)

const rows = computed(() => Array.isArray(data?.noShows) ? data.noShows : [])
const currency = computed(() => data?.property?.currency || "USD")

const todayStr = computed(() => {
  const t = new Date()
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, "0")
  const d = String(t.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
})

const sourceSelectOptions = computed(() => {
  const opts = Array.from(new Set(rows.value.map((r) => r.booking_source))).filter(Boolean)
  return [{ text: "All", value: "all" }, ...opts.map((x) => ({ text: pretty(x), value: x }))]
})

const bookingTypeOptions = computed(() => [
  { text: "All", value: "all" },
  { text: "Hourly", value: "hourly" },
  { text: "Nightly", value: "nightly" },
])

const pageSizeOptions = computed(() => [
  { text: "10 / page", value: 10 },
  { text: "20 / page", value: 20 },
  { text: "50 / page", value: 50 },
])

const filteredRows = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return rows.value.filter((r) => {
    // chip source shortcut
    if (chipKey.value !== "all" && r.booking_source !== chipKey.value) return false

    // source select
    if (source.value !== "all" && r.booking_source !== source.value) return false

    // booking type
    const bt = r.stay?.booking_type
    if (bookingType.value !== "all" && bt !== bookingType.value) return false

    // date filter (use marked_at date)
    if (dateFilter.value === "today") {
      const d = String(r.no_show?.marked_at || "").slice(0, 10)
      if (d !== todayStr.value) return false
    }

    // search keyword
    if (!keyword) return true
    const hay = [
      r.reservation_number,
      r.booking_source,
      r.guest?.name,
      r.guest?.phone,
      r.guest?.nationality,
      r.room?.room_number,
      r.room?.room_type,
      r.no_show?.marked_by,
      r.no_show?.reason,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return hay.includes(keyword)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / page.size)))
const paginatedRows = computed(() => {
  const start = (page.current - 1) * page.size
  return filteredRows.value.slice(start, start + page.size)
})

const summaryChips = computed(() => {
  const count = (src) => rows.value.filter((r) => r.booking_source === src).length
  return [
    { key: "all", label: "All", count: rows.value.length, dot: "#94a3b8" },
    { key: "walk_in", label: "Walk-in", count: count("walk_in"), dot: "#10b981" },
    { key: "phone", label: "Phone", count: count("phone"), dot: "#3b82f6" },
    { key: "other", label: "Other", count: count("other"), dot: "#f59e0b" },
  ]
})

// actions
function applyChip(key) {
  chipKey.value = key
  // also sync select
  source.value = key === "all" ? "all" : key
}
function resetFilters() {
  q.value = ""
  source.value = "all"
  bookingType.value = "all"
  dateFilter.value = "all"
  chipKey.value = "all"
  page.current = 1
  closeDetails()
}

function openDetails(row) {
  selected.value = row
  detailsOpen.value = true
}
function closeDetails() {
  detailsOpen.value = false
  selected.value = null
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
    "deposit_amount",
    "paid_amount",
    "forfeited_amount",
    "marked_at",
    "marked_by",
    "reason",
  ]

  const lines = filteredRows.value.map((r) => [
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
    r.pricing?.deposit_amount,
    r.pricing?.paid_amount,
    r.pricing?.forfeited_amount,
    r.no_show?.marked_at,
    r.no_show?.marked_by,
    (r.no_show?.reason || "").replaceAll("\n", " "),
  ])

  const csv = [header, ...lines]
    .map((row) => row.map((x) => `"${String(x ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `no_shows_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function printRow(row) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=420,height=700")
  if (!w) return alert("Popup blocked. Please allow popups for this site.")

  const propertyName = data?.property?.name || "Guesthouse"
  const cur = currency.value

  const moneySafe = (v) => {
    const n = Number(v || 0)
    const symbol = cur === "USD" ? "$" : ""
    return symbol + n.toFixed(2)
  }

  const unit = row?.stay?.booking_type === "hourly" ? "h" : "n"
  const units = `${row?.stay?.nights_or_hours ?? "-"}${unit}`

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

        <div><b>Stay:</b> ${row?.stay?.booking_type || "-"} • ${units}</div>
        <div><b>Check-in:</b> ${row?.stay?.check_in || "-"}</div>
        <div><b>Check-out:</b> ${row?.stay?.check_out || "-"}</div>

        <hr style="border:none; border-top:1px solid #e2e8f0; margin:12px 0;" />

        <div><b>Marked at:</b> ${row?.no_show?.marked_at || "-"}</div>
        <div><b>Marked by:</b> ${row?.no_show?.marked_by || "-"}</div>
        <div><b>Reason:</b> ${row?.no_show?.reason || "-"}</div>

        <hr style="border:none; border-top:1px solid #e2e8f0; margin:12px 0;" />

        <div style="text-align:right;">
          <div>Total: ${moneySafe(row?.pricing?.total_room_charges || 0)}</div>
          <div>Deposit: ${moneySafe(row?.pricing?.deposit_amount || 0)}</div>
          <div>Paid: ${moneySafe(row?.pricing?.paid_amount || 0)}</div>
          <div>Kept: <b>${moneySafe(row?.pricing?.forfeited_amount || 0)}</b></div>
        </div>

        <script>
          window.addEventListener("load", () => {
            setTimeout(() => { window.focus(); window.print(); }, 250);
          });
        <\/script>
      </body>
    </html>
  `)
  w.document.close()
}

/* helpers */
function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}
function prettyBookingType(s) {
  if (s === "hourly") return "Hourly"
  if (s === "nightly") return "Nightly"
  return pretty(s)
}
function unitsLabel(row) {
  const unit = row?.stay?.booking_type === "hourly" ? "h" : "n"
  const u = row?.stay?.nights_or_hours ?? "-"
  return `${u}${unit}`
}
function money(v) {
  const n = Number(v || 0)
  const symbol = currency.value === "USD" ? "$" : ""
  return symbol + n.toFixed(2)
}

/* sync pagination */
watch([q, source, bookingType, dateFilter, chipKey], () => {
  page.current = 1
})
watch(totalPages, () => {
  if (page.current > totalPages.value) page.current = totalPages.value
})
</script>

<style scoped>
/* soft card (no border) */
.soft-card {
  border: none !important;
  background: #fff !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
}
.soft-sub {
  background: rgba(2, 8, 23, 0.02);
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06);
}

/* Vuestic label tweaks */
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

/* plain label for Date */
.va-label {
  font-size: 12px;
  font-weight: 800;
  color: rgb(100 116 139);
  margin-bottom: 6px;
}

/* pagination no shadow */
.no-shadow :deep(.va-pagination__page) {
  box-shadow: none !important;
}
</style>
