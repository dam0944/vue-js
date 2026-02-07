<!-- src/pages/admin/reservations/AllBooking.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 p-4 sm:p-6">
    <div class="mx-auto w-full space-y-5">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <VaIcon name="list_alt" color="secondary" />
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">All Bookings</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Walk-in / phone / other bookings • Hourly / Nightly • Family guesthouse workflow.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton
            to="/admin/reservations/create"
            class="rounded-2xl font-extrabold"
            color="primary"
            @click="createNew"
          >
            <VaIcon name="add" class="mr-1" />
            New Booking
          </VaButton>

          <VaButton class="rounded-2xl font-extrabold" preset="secondary" @click="exportCsv">
            <VaIcon name="file_download" class="mr-1" />
            Export
          </VaButton>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <VaCard class="soft-card rounded-2xl">
          <VaCardContent class="p-4">
            <div class="text-xs font-bold text-slate-500">Total Bookings</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ rows.length }}</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent class="p-4">
            <div class="text-xs font-bold text-slate-500">Checked-in</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.checkedIn }}</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent class="p-4">
            <div class="text-xs font-bold text-slate-500">Pending / Confirmed</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.pendingConfirmed }}</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent class="p-4">
            <div class="text-xs font-bold text-slate-500">Today Revenue (demo)</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(stats.todayRevenue) }}</div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Filters (equal height like your screenshot) -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent class="p-4">
          <div class="grid gap-3 lg:grid-cols-12 items-end">
            <div class="lg:col-span-5">
              <VaInput v-model.trim="q" label="Search" placeholder="booking #, guest, phone, room..." clearable class="eq">
                <template #prependInner>
                  <VaIcon name="search" color="secondary" size="18px" />
                </template>
              </VaInput>
            </div>

            <div class="lg:col-span-2">
              <VaSelect
                v-model="sourceFilter"
                label="Source"
                :options="sourceOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                clearable
                class="eq"
              />
            </div>

            <div class="lg:col-span-2">
              <VaSelect
                v-model="typeFilter"
                label="Type"
                :options="typeOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                clearable
                class="eq"
              />
            </div>

            <div class="lg:col-span-3">
              <VaSelect
                v-model="statusFilter"
                label="Status"
                :options="statusOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                clearable
                class="eq"
              />
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap gap-2">
              <VaChip
                class="cursor-pointer select-none"
                size="small"
                :outline="quick !== 'today'"
                :color="quick === 'today' ? 'primary' : 'secondary'"
                @click="applyQuick('today')"
              >
                Today
              </VaChip>

              <VaChip
                class="cursor-pointer select-none"
                size="small"
                :outline="quick !== 'checked_in'"
                :color="quick === 'checked_in' ? 'primary' : 'secondary'"
                @click="applyQuick('checked_in')"
              >
                Checked-in
              </VaChip>

              <VaChip
                class="cursor-pointer select-none"
                size="small"
                :outline="quick !== 'balance'"
                :color="quick === 'balance' ? 'primary' : 'secondary'"
                @click="applyQuick('balance')"
              >
                Balance due
              </VaChip>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <VaSelect
                v-model="pageSize"
                class="w-[150px]"
                label="Per page"
                :options="pageSizeOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />

              <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="reset">
                <VaIcon name="refresh" class="mr-1" />
                Reset
              </VaButton>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- List -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent class="p-0">
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
                      <div class="mt-0.5 grid h-9 w-9 place-items-center rounded-2xl bg-slate-900 text-white">
                        <VaIcon name="event" />
                      </div>
                      <div class="min-w-0">
                        <div class="truncate text-sm font-extrabold text-slate-900">
                          {{ row.booking.booking_number }}
                        </div>

                        <div class="mt-1 flex flex-wrap gap-1">
                          <span class="chip chip-neutral">{{ pretty(row.booking.booking_source) }}</span>
                          <span class="chip" :class="statusChipClass(row.booking.status)">
                            {{ pretty(row.booking.status) }}
                          </span>
                        </div>

                        <div class="mt-1 text-xs text-slate-500">{{ dt(row.booking.booking_date) }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Guest -->
                  <td class="px-4 py-4 align-top">
                    <div class="truncate text-sm font-extrabold text-slate-900">
                      {{ guestName(row.guest) }}
                      <span v-if="row.guest.guest_type === 'vip'" class="chip chip-warn ml-2">VIP</span>
                    </div>
                    <div class="mt-1 text-xs text-slate-500">{{ row.guest.phone }}</div>
                  </td>

                  <!-- Stay -->
                  <td class="px-4 py-4 align-top">
                    <div class="text-xs text-slate-500">Type</div>
                    <div class="text-sm font-extrabold text-slate-900">{{ stayTypeLabel(row.reservations) }}</div>
                    <div class="mt-1 text-xs text-slate-500">{{ stayDatesLabel(row.reservations) }}</div>
                  </td>

                  <!-- Rooms -->
                  <td class="px-4 py-4 align-top">
                    <div class="flex flex-wrap gap-1">
                      <VaChip
                        v-for="r in row.reservations"
                        :key="r.reservation_id"
                        size="small"
                        outline
                        color="secondary"
                        class="rounded-2xl font-extrabold"
                      >
                        {{ r.room_number }} • {{ r.room_type.type_name }} {{ r.room_type.bed_count }} bed •
                        {{ unitLabel(r) }}
                      </VaChip>
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

                    <span class="mt-1 inline-flex chip" :class="invoiceChipClass(row.invoice.status)">
                      {{ pretty(row.invoice.status) }}
                    </span>
                  </td>

                  <!-- Action -->
                  <td class="px-4 py-4 align-top text-right">
                    <div class="inline-flex gap-2" @click.stop>
                      <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="open(row)">
                        Details
                      </VaButton>
                      <VaButton color="primary" size="small" class="rounded-2xl font-extrabold" @click="goCheckout(row)">
                        Checkout
                      </VaButton>
                    </div>
                  </td>
                </tr>

                <tr v-if="paginated.length === 0">
                  <td colspan="7" class="px-6 py-10 text-center">
                    <div class="text-base font-extrabold text-slate-900">No bookings found</div>
                    <div class="mt-1 text-sm text-slate-500">Try another keyword or reset filters.</div>
                    <VaButton preset="secondary" class="mt-4 rounded-2xl font-extrabold" @click="reset">
                      Reset
                    </VaButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <VaButton
              preset="secondary"
              class="rounded-2xl font-extrabold"
              :disabled="page === 1"
              @click="page--"
            >
              Prev
            </VaButton>

            <div class="text-xs font-bold text-slate-500">
              Page <span class="text-slate-900">{{ page }}</span> /
              <span class="text-slate-900">{{ totalPages }}</span>
              <span class="mx-2 text-slate-300">•</span>
              Total: <span class="text-slate-900">{{ filtered.length }}</span>
            </div>

            <VaButton
              preset="secondary"
              class="rounded-2xl font-extrabold"
              :disabled="page === totalPages"
              @click="page++"
            >
              Next
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Details popup (width 1000px, layout "3 blocks in 2 columns") -->
      <VaModal v-model="detailsOpen" max-width="1000px" hide-default-actions>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-500">Booking</div>
              <div class="truncate text-base font-extrabold text-slate-900">
                {{ selected?.booking?.booking_number || "-" }}
              </div>
            </div>
            <VaButton preset="plain" icon="close" @click="closeDetails" />
          </div>
        </template>

        <div v-if="selected" class="space-y-3">
          <div class="grid gap-3 lg:grid-cols-12">
            <!-- Left: Guest + Rooms (2 blocks stacked) -->
            <div class="lg:col-span-8 space-y-3">
              <VaCard class="soft-card rounded-2xl">
                <VaCardContent class="p-4">
                  <div class="text-xs font-bold text-slate-500">Guest</div>
                  <div class="mt-1 text-base font-extrabold text-slate-900">
                    {{ guestName(selected.guest) }}
                    <span v-if="selected.guest.guest_type === 'vip'" class="chip chip-warn ml-2">VIP</span>
                  </div>
                  <div class="mt-1 text-sm text-slate-600">{{ selected.guest.phone }}</div>

                  <div class="mt-3 grid grid-cols-2 gap-2">
                    <div class="soft-sub rounded-2xl p-3">
                      <div class="text-[11px] font-bold text-slate-500">Source</div>
                      <div class="mt-1 text-sm font-extrabold text-slate-900">
                        {{ pretty(selected.booking.booking_source) }}
                      </div>
                    </div>
                    <div class="soft-sub rounded-2xl p-3">
                      <div class="text-[11px] font-bold text-slate-500">Status</div>
                      <div class="mt-1 text-sm font-extrabold" :class="drawerStatusText(selected.booking.status)">
                        {{ pretty(selected.booking.status) }}
                      </div>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>

              <VaCard class="soft-card rounded-2xl">
                <VaCardContent class="p-4">
                  <div class="flex items-end justify-between gap-3">
                    <div>
                      <div class="text-xs font-bold text-slate-500">Rooms</div>
                      <div class="text-sm font-extrabold text-slate-900">
                        {{ selected.reservations.length }} reservation(s)
                      </div>
                    </div>

                    <VaButton
                      preset="secondary"
                      size="small"
                      class="rounded-2xl font-extrabold"
                      @click="printPreview(selected)"
                    >
                      <VaIcon name="print" class="mr-1" />
                      Print
                    </VaButton>
                  </div>

                  <div class="mt-3 space-y-2">
                    <div v-for="r in selected.reservations" :key="r.reservation_id" class="soft-sub rounded-2xl p-4">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <div class="text-sm font-extrabold text-slate-900">Room {{ r.room_number }}</div>
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
                </VaCardContent>
              </VaCard>
            </div>

            <!-- Right: Invoice (1 block) -->
            <div class="lg:col-span-4 space-y-3">
              <VaCard class="soft-card rounded-2xl">
                <VaCardContent class="p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="text-xs font-bold text-slate-500">Invoice</div>
                      <div class="mt-1 text-sm font-extrabold text-slate-900">
                        {{ selected.invoice.invoice_number }}
                      </div>
                      <div class="mt-1 text-xs text-slate-600">Date: {{ selected.invoice.invoice_date }}</div>
                    </div>

                    <span class="chip" :class="invoiceChipClass(selected.invoice.status)">
                      {{ pretty(selected.invoice.status) }}
                    </span>
                  </div>

                  <div class="mt-3 space-y-1 text-sm">
                    <div class="flex justify-between">
                      <span class="text-slate-600">Subtotal</span>
                      <span class="font-extrabold text-slate-900">{{ money(selected.invoice.subtotal) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-600">Discount</span>
                      <span class="font-extrabold text-slate-900">{{ money(selected.invoice.discount_amount) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-600">Tax</span>
                      <span class="font-extrabold text-slate-900">{{ money(selected.invoice.tax_amount) }}</span>
                    </div>

                    <div class="flex justify-between pt-2 text-base">
                      <span class="font-extrabold text-slate-900">Total</span>
                      <span class="font-extrabold text-slate-900">{{ money(selected.invoice.total_amount) }}</span>
                    </div>

                    <div class="mt-2 grid grid-cols-2 gap-2">
                      <div class="soft-sub rounded-2xl p-3">
                        <div class="text-[11px] font-bold text-slate-500">Paid</div>
                        <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(selected.invoice.paid_amount) }}</div>
                      </div>
                      <div class="soft-sub rounded-2xl p-3">
                        <div class="text-[11px] font-bold text-slate-500">Balance</div>
                        <div
                          class="mt-1 text-sm font-extrabold"
                          :class="selected.invoice.balance > 0 ? 'text-rose-600' : 'text-emerald-600'"
                        >
                          {{ money(selected.invoice.balance) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4 grid grid-cols-2 gap-2">
                    <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="closeDetails">
                      Close
                    </VaButton>
                    <VaButton color="primary" class="rounded-2xl font-extrabold" @click="goCheckout(selected)">
                      Go Checkout
                    </VaButton>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>
          </div>
        </div>
      </VaModal>
    </div>
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

// pagination
const page = ref(1)
const pageSize = ref(8)
const pageSizeOptions = [
  { text: "8 / page", value: 8 },
  { text: "12 / page", value: 12 },
  { text: "20 / page", value: 20 },
]

// modal details (replace drawer)
const detailsOpen = ref(false)
const selected = ref(null)

const sourceOptions = computed(() => [
  { text: "All", value: "all" },
  ...data.bookingSources.map((x) => ({ text: pretty(x), value: x })),
])
const typeOptions = computed(() => [
  { text: "All", value: "all" },
  ...data.bookingTypes.map((x) => ({ text: pretty(x), value: x })),
])
const statusOptions = computed(() => [
  { text: "All", value: "all" },
  ...data.statuses.map((x) => ({ text: pretty(x), value: x })),
])

const stats = computed(() => {
  const checkedIn = rows.value.filter((x) => x.booking.status === "checked_in").length
  const pendingConfirmed = rows.value.filter((x) => ["pending", "confirmed"].includes(x.booking.status)).length
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

    if (typeFilter.value !== "all") {
      const hasType = row.reservations.some((r) => r.booking_type === typeFilter.value)
      if (!hasType) return false
    }

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

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))

const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

watch([q, sourceFilter, typeFilter, statusFilter, quick], () => (page.value = 1))
watch(pageSize, () => (page.value = 1))
watch(totalPages, () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})

function applyQuick(v) {
  quick.value = quick.value === v ? "" : v
}
function reset() {
  q.value = ""
  sourceFilter.value = "all"
  typeFilter.value = "all"
  statusFilter.value = "all"
  quick.value = ""
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

function createNew() {
  // optional hook
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
  return `${dt(first.check_in_at)} → ${dt(first.check_out_at)}`
}

function drawerStatusText(status) {
  return status === "checked_in" ? "text-emerald-700" : status === "cancelled" ? "text-rose-700" : "text-slate-900"
}

/* chip classes */
function statusChipClass(status) {
  if (status === "pending") return "chip-warn"
  if (status === "confirmed") return "chip-info"
  if (status === "checked_in") return "chip-good"
  if (status === "checked_out") return "chip-neutral"
  if (status === "cancelled") return "chip-bad"
  if (status === "no_show") return "chip-neutral"
  return "chip-neutral"
}
function invoiceChipClass(s) {
  if (s === "paid") return "chip-good"
  if (s === "partial") return "chip-warn"
  return "chip-neutral"
}

function printPreview(row) {
  if (!row) return
  const guest = guestName(row.guest)
  const rooms = (row.reservations || [])
    .map((r) => `Room ${r.room_number} • ${r.room_type?.type_name || "-"} • ${unitLabel(r)} • ${money(r.total_room_charges)}`)
    .join("<br/>")

  const w = window.open("", "_blank")
  if (!w) return alert("Popup blocked. Please allow popups for print preview.")

  w.document.open()
  w.document.write(`
    <!doctype html>
    <html>
      <head><meta charset="utf-8"/><title>Booking Preview</title></head>
      <body style="font-family: ui-sans-serif, system-ui; padding: 18px;">
        <h2 style="margin:0;">Booking Preview</h2>
        <div style="color:#555; margin-top:6px;">${row.booking.booking_number}</div>
        <hr/>
        <div><b>Guest:</b> ${guest}</div>
        <div style="margin-top:10px;"><b>Rooms</b></div>
        <div style="margin-top:6px;">${rooms || "-"}</div>
        <hr/>
        <div style="text-align:right;">
          <div>Total: <b>${money(row.invoice.total_amount)}</b></div>
          <div>Paid: ${money(row.invoice.paid_amount)}</div>
          <div>Balance: <b>${money(row.invoice.balance)}</b></div>
        </div>
        <script>window.onload=function(){window.print();};<\/script>
      </body>
    </html>
  `)
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

/* make inputs same height (your “ស្មើរគ្នា”) */
:deep(.eq .va-input-wrapper__container),
:deep(.eq .va-select__anchor),
:deep(.eq .va-select__content),
:deep(.eq .va-input__container) {
  min-height: 44px !important;
}
:deep(.eq .va-input-wrapper__container),
:deep(.eq .va-select__anchor) {
  border-radius: 16px !important;
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
.chip-warn {
  background: rgba(245, 158, 11, 0.18);
  color: #92400e;
}
.chip-bad {
  background: rgba(244, 63, 94, 0.14);
  color: #9f1239;
}
.chip-info {
  background: rgba(59, 130, 246, 0.14);
  color: #1d4ed8;
}

.soft-sub {
  background: rgba(2, 8, 23, 0.02);
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06);
}
</style>
