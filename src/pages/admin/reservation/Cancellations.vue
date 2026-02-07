<!-- src/pages/admin/reservations/Cancellations.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 p-4 sm:p-6">
    <div class="mx-auto w-full space-y-5">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white">
            <span class="material-icons text-[22px]">cancel</span>
          </div>
          <div>
            <h1 class="text-lg font-extrabold text-slate-900 sm:text-xl">Cancellations</h1>
            <p class="text-sm text-slate-500">Cancelled reservations • Soft style • Popup details.</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton color="primary" class="rounded-2xl font-extrabold" @click="exportCsv">
            <VaIcon name="file_download" class="mr-1" />
            Export CSV
          </VaButton>
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="resetFilters">
            <VaIcon name="refresh" class="mr-1" />
            Reset
          </VaButton>
        </div>
      </div>

      <!-- KPI -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <VaCard class="soft-card rounded-2xl">
          <VaCardContent class="p-4">
            <div class="text-[11px] font-bold text-slate-500">Total Cancelled</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ filtered.length }}</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent class="p-4">
            <div class="text-[11px] font-bold text-slate-500">Paid</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(kpi.paid) }}</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent class="p-4">
            <div class="text-[11px] font-bold text-slate-500">Refunded</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(kpi.refunded) }}</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent class="p-4">
            <div class="text-[11px] font-bold text-slate-500">Net Kept</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(kpi.net) }}</div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Filters -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent class="p-4">
          <div class="grid gap-3 lg:grid-cols-12">
            <div class="lg:col-span-5">
              <VaInput v-model.trim="q" label="Search" placeholder="Reservation, guest, phone, room..." clearable>
                <template #prependInner>
                  <VaIcon name="search" color="secondary" size="18px" />
                </template>
              </VaInput>
            </div>

            <div class="lg:col-span-3">
              <VaSelect
                v-model="source"
                label="Source"
                :options="sourceOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                clearable
              />
            </div>

            <div class="lg:col-span-4">
              <VaSelect
                v-model="reason"
                label="Reason"
                :options="reasonOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                clearable
              />
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <VaChip
                size="small"
                class="cursor-pointer select-none"
                :outline="dateMode !== 'today'"
                :color="dateMode === 'today' ? 'primary' : 'secondary'"
                @click="dateMode = dateMode === 'today' ? 'all' : 'today'"
              >
                Today
              </VaChip>

              <VaChip
                size="small"
                class="cursor-pointer select-none"
                :outline="dateMode !== 'all'"
                :color="dateMode === 'all' ? 'primary' : 'secondary'"
                @click="dateMode = 'all'"
              >
                All
              </VaChip>
            </div>

            <!-- Pagination controls (top) -->
            <div class="flex flex-wrap items-center gap-2">
              <div class="text-xs font-bold text-slate-500">
                Showing <span class="text-slate-900">{{ paged.length }}</span> /
                <span class="text-slate-900">{{ filtered.length }}</span>
              </div>

              <VaSelect
                v-model="page.size"
                class="w-[140px]"
                label="Per page"
                :options="pageSizeOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- List -->
      <div class="space-y-2">
        <VaCard
          v-for="row in paged"
          :key="row.reservation_id"
          class="soft-card rounded-2xl cursor-pointer"
          @click="open(row)"
        >
          <VaCardContent class="p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <!-- Left -->
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="text-sm font-extrabold text-slate-900">
                    {{ row.reservation_number }}
                  </div>

                  <span class="chip" :class="sourceChipClass(row.booking_source)">
                    {{ row.booking_source }}
                  </span>

                  <span class="chip chip-bad">cancelled</span>
                </div>

                <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700">
                  <div class="font-extrabold text-slate-900">{{ row.guest.name }}</div>
                  <span class="text-slate-400">•</span>
                  <div class="text-slate-600">{{ row.guest.phone }}</div>
                  <span class="text-slate-400">•</span>
                  <div class="text-slate-600">
                    Room {{ row.room.room_number }} (Floor {{ row.room.floor }})
                  </div>
                  <span class="text-slate-400">•</span>
                  <div class="text-slate-600">{{ row.room.room_type }} • {{ row.room.beds }} bed</div>
                </div>

                <div class="mt-2 text-xs text-slate-500">
                  Cancelled at:
                  <span class="font-extrabold text-slate-700">{{ fmt(row.cancellation.cancelled_at) }}</span>
                  <span class="text-slate-300">•</span>
                  By: <span class="font-extrabold text-slate-700">{{ row.cancellation.cancelled_by }}</span>
                </div>

                <div class="mt-1 text-xs text-slate-500 line-clamp-2">
                  Reason:
                  <span class="font-semibold text-slate-700">{{ row.cancellation.reason || "-" }}</span>
                </div>
              </div>

              <!-- Right -->
              <div class="flex shrink-0 items-end justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                <div class="text-right">
                  <div class="text-[11px] font-bold text-slate-500">Total</div>
                  <div class="text-lg font-extrabold text-slate-900">{{ money(row.pricing.total_room_charges) }}</div>
                </div>

                <div class="flex gap-2">
                  <div class="soft-mini rounded-2xl px-3 py-2 text-right">
                    <div class="text-[10px] font-bold text-slate-500">Paid</div>
                    <div class="text-xs font-extrabold text-slate-900">{{ money(row.pricing.paid_amount) }}</div>
                  </div>
                  <div class="soft-mini rounded-2xl px-3 py-2 text-right">
                    <div class="text-[10px] font-bold text-slate-500">Refund</div>
                    <div class="text-xs font-extrabold text-slate-900">{{ money(row.pricing.refund_amount) }}</div>
                  </div>
                </div>

                <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold hidden sm:inline-flex" @click.stop="open(row)">
                  Details
                </VaButton>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Empty -->
        <VaCard v-if="filtered.length === 0" class="soft-card rounded-2xl">
          <VaCardContent class="p-10 text-center">
            <div class="text-base font-extrabold text-slate-900">No cancellations</div>
            <div class="mt-1 text-sm text-slate-500">Try clearing filters or search another keyword.</div>
            <VaButton preset="secondary" class="mt-4 rounded-2xl font-extrabold" @click="resetFilters">
              Reset Filters
            </VaButton>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Pagination (bottom) -->
      <div v-if="filtered.length > 0" class="flex flex-wrap items-center justify-between gap-2">
        <VaButton preset="secondary" class="rounded-2xl font-extrabold" :disabled="page.current === 1" @click="page.current--">
          Prev
        </VaButton>

        <div class="text-xs font-bold text-slate-500">
          Page <span class="text-slate-900">{{ page.current }}</span> /
          <span class="text-slate-900">{{ totalPages }}</span>
        </div>

        <VaButton
          preset="secondary"
          class="rounded-2xl font-extrabold"
          :disabled="page.current === totalPages"
          @click="page.current++"
        >
          Next
        </VaButton>
      </div>

      <!-- Details popup (width 1000px, 3 blocks in 2 columns grid) -->
      <VaModal v-model="detailsOpen" max-width="1000px" hide-default-actions>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-500">CANCELLATION DETAILS</div>
              <div class="truncate text-base font-extrabold text-slate-900">
                {{ selected?.reservation_number || "-" }}
              </div>
            </div>
            <VaButton preset="plain" icon="close" @click="closeDetails" />
          </div>
        </template>

        <div v-if="selected" class="space-y-3">
          <!-- GRID: 2 columns (left bigger), right smaller -->
          <div class="grid gap-3 lg:grid-cols-12">
            <!-- Left: 2 blocks stacked -->
            <div class="lg:col-span-8 space-y-3">
              <!-- Block 1: Guest + Room (2 cards) -->
              <div class="grid gap-3 sm:grid-cols-2">
                <VaCard class="soft-card rounded-2xl">
                  <VaCardContent class="p-4">
                    <div class="text-xs font-bold text-slate-500">GUEST</div>
                    <div class="mt-1 text-base font-extrabold text-slate-900">{{ selected.guest.name }}</div>
                    <div class="mt-0.5 text-sm text-slate-600">{{ selected.guest.phone }}</div>
                    <div class="mt-1 text-xs text-slate-500">Nationality: {{ selected.guest.nationality || "-" }}</div>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <span class="chip" :class="sourceChipClass(selected.booking_source)">
                        {{ selected.booking_source }}
                      </span>
                      <span class="chip chip-bad">cancelled</span>
                    </div>
                  </VaCardContent>
                </VaCard>

                <VaCard class="soft-card rounded-2xl">
                  <VaCardContent class="p-4">
                    <div class="text-xs font-bold text-slate-500">ROOM</div>
                    <div class="mt-1 flex items-center justify-between gap-2">
                      <div class="text-base font-extrabold text-slate-900">Room {{ selected.room.room_number }}</div>
                      <span class="chip chip-neutral">Floor {{ selected.room.floor }}</span>
                    </div>
                    <div class="mt-1 text-sm text-slate-700">{{ selected.room.room_type }} • {{ selected.room.beds }} bed</div>
                  </VaCardContent>
                </VaCard>
              </div>

              <!-- Block 2: Stay -->
              <VaCard class="soft-card rounded-2xl">
                <VaCardContent class="p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="text-xs font-bold text-slate-500">STAY</div>
                      <div class="mt-1 text-sm font-extrabold text-slate-900">
                        {{ prettyBookingType(selected.stay.booking_type) }}
                        <span class="ml-2 text-xs font-bold text-slate-500">• {{ stayUnits(selected.stay) }}</span>
                      </div>
                    </div>
                    <span class="chip chip-neutral">RES # {{ selected.reservation_number }}</span>
                  </div>

                  <div class="mt-3 grid grid-cols-2 gap-2">
                    <div class="soft-sub rounded-2xl p-3">
                      <div class="text-[10px] font-bold text-slate-500">Check-in</div>
                      <div class="mt-0.5 text-xs font-extrabold text-slate-900">{{ fmt(selected.stay.check_in) }}</div>
                    </div>
                    <div class="soft-sub rounded-2xl p-3">
                      <div class="text-[10px] font-bold text-slate-500">Check-out</div>
                      <div class="mt-0.5 text-xs font-extrabold text-slate-900">{{ fmt(selected.stay.check_out) }}</div>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>

            <!-- Right: Block 3 (Payment + Cancellation) -->
            <div class="lg:col-span-4 space-y-3">
              <VaCard class="soft-card rounded-2xl">
                <VaCardContent class="p-4">
                  <div class="text-xs font-bold text-slate-500">PAYMENT</div>

                  <div class="mt-3 space-y-2 text-sm">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-600">Total</span>
                      <span class="font-extrabold text-slate-900">{{ money(selected.pricing.total_room_charges) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-600">Paid</span>
                      <span class="font-extrabold text-slate-900">{{ money(selected.pricing.paid_amount) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-600">Refund</span>
                      <span class="font-extrabold text-slate-900">{{ money(selected.pricing.refund_amount) }}</span>
                    </div>
                    <div class="h-px bg-slate-200"></div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-600">Net kept</span>
                      <span class="font-extrabold text-slate-900">
                        {{ money((selected.pricing.paid_amount || 0) - (selected.pricing.refund_amount || 0)) }}
                      </span>
                    </div>
                  </div>

                  <div class="mt-4 grid grid-cols-2 gap-2">
                    <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="copyText(selected.reservation_number)">
                      Copy RES #
                    </VaButton>
                    <VaButton color="primary" class="rounded-2xl font-extrabold" @click="printRow(selected)">
                      Print
                    </VaButton>
                  </div>
                </VaCardContent>
              </VaCard>

              <VaCard class="soft-card rounded-2xl">
                <VaCardContent class="p-4">
                  <div class="text-xs font-bold text-slate-500">CANCELLATION</div>

                  <div class="mt-3 text-xs text-slate-600">
                    Cancelled at:
                    <span class="font-extrabold text-slate-900">{{ fmt(selected.cancellation.cancelled_at) }}</span>
                  </div>
                  <div class="mt-1 text-xs text-slate-600">
                    Cancelled by:
                    <span class="font-extrabold text-slate-900">{{ selected.cancellation.cancelled_by || "-" }}</span>
                  </div>

                  <div class="mt-3 soft-sub rounded-2xl p-3 text-sm text-slate-800">
                    <div class="text-[10px] font-bold text-slate-500">Reason</div>
                    <div class="mt-1 font-semibold">{{ selected.cancellation.reason || "-" }}</div>
                  </div>
                </VaCardContent>
              </VaCard>

              <VaButton preset="secondary" class="w-full rounded-2xl font-extrabold" @click="closeDetails">
                Close
              </VaButton>
            </div>
          </div>
        </div>
      </VaModal>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { reservationsCancellationsData } from "@/data/reservation/reservationsCancellations"

const data = reservationsCancellationsData

const q = ref("")
const source = ref(null)
const reason = ref(null)
const dateMode = ref("all")

const page = reactive({ current: 1, size: 8 })

const pageSizeOptions = [
  { text: "8 / page", value: 8 },
  { text: "12 / page", value: 12 },
  { text: "20 / page", value: 20 },
]

const detailsOpen = ref(false)
const selected = ref(null)

const rows = computed(() => data.cancellations || [])

const sourceOptions = [
  { text: "All", value: null },
  { text: "Walk-in", value: "walk_in" },
  { text: "Phone", value: "phone" },
  { text: "Other", value: "other" },
]
const reasonOptions = [
  { text: "All", value: null },
  { text: "Changed travel plan", value: "travel" },
  { text: "No show", value: "no_show" },
  { text: "Did not like room", value: "not_like" },
  { text: "Cancelled before arrival", value: "before_arrival" },
  { text: "Other", value: "other" },
]

const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return rows.value.filter((r) => {
    if (source.value && r.booking_source !== source.value) return false

    if (reason.value) {
      const mapped = mapReason(r.cancellation?.reason || "")
      if (mapped !== reason.value) return false
    }

    if (dateMode.value === "today") {
      const todayStr = toYYYYMMDD(new Date())
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
watch(
  () => page.size,
  () => (page.current = 1)
)
watch(totalPages, () => {
  if (page.current > totalPages.value) page.current = totalPages.value
})

function resetFilters() {
  q.value = ""
  source.value = null
  reason.value = null
  dateMode.value = "all"
  page.current = 1
  closeDetails()
}

function open(row) {
  selected.value = row
  detailsOpen.value = true
}
function closeDetails() {
  detailsOpen.value = false
  selected.value = null
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

function sourceChipClass(s) {
  if (s === "walk_in") return "chip-good"
  if (s === "phone") return "chip-info"
  return "chip-neutral"
}

function mapReason(reasonText) {
  const t = String(reasonText || "").toLowerCase()
  if (t.includes("travel")) return "travel"
  if (t.includes("no show") || t.includes("noshow")) return "no_show"
  if (t.includes("did not like") || t.includes("didn't like") || t.includes("not like")) return "not_like"
  if (t.includes("before arrival")) return "before_arrival"
  return "other"
}

function toYYYYMMDD(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
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
    <h2 style="margin:0;">Cancellation Receipt</h2>
    <div style="color:#555; margin-top:6px;">${row?.reservation_number || "-"}</div>
    <hr/>
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
/* soft shadow system: no border */
.soft-card {
  border: none !important;
  background: #fff !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
}
.soft-mini {
  border: none !important;
  background: rgba(2, 8, 23, 0.02) !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
}
.soft-sub {
  background: rgba(2, 8, 23, 0.02);
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06);
}

/* chips */
.chip {
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
}
.chip-neutral {
  background: rgba(2, 8, 23, 0.06);
  color: #0f172a;
}
.chip-good {
  background: rgba(16, 185, 129, 0.14);
  color: #065f46;
}
.chip-info {
  background: rgba(59, 130, 246, 0.14);
  color: #1d4ed8;
}
.chip-bad {
  background: rgba(244, 63, 94, 0.14);
  color: #9f1239;
}
</style>
