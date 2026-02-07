<!-- src/pages/frontdesk/Checkin.vue -->
<template>
  <div class="ci-page">
    <div class="mx-auto w-full space-y-5">
      <!-- Header -->
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
          <VaChip class="soft-pill" size="small">
            Today: <b class="text-slate-900 ml-1">{{ data.today }}</b>
          </VaChip>

          <VaButton
            to="/admin/frontdesk/quick-book"
            color="primary"
            icon="add"
            class="rounded-2xl font-extrabold"
            @click="openWalkin()"
          >
            Walk-in Check-in
          </VaButton>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <VaCard class="soft-card rounded-2xl">
          <VaCardContent>
            <div class="kpi-label">Arrivals</div>
            <div class="kpi-value">{{ kpis.arrivals }}</div>
            <div class="kpi-sub">Confirmed / Pending today</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent>
            <div class="kpi-label">Checked-in</div>
            <div class="kpi-value">{{ kpis.checkedIn }}</div>
            <div class="kpi-sub">In-house now</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent>
            <div class="kpi-label">Check-outs</div>
            <div class="kpi-value">{{ kpis.checkouts }}</div>
            <div class="kpi-sub">Expected today</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent>
            <div class="kpi-label">Balance Due</div>
            <div class="kpi-value">{{ money(kpis.balanceDue) }}</div>
            <div class="kpi-sub">From today list</div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Filters -->
      <VaCard class="soft-card rounded-2xl">
        <VaCardContent>
          <div class="grid gap-3 lg:grid-cols-12">
            <div class="lg:col-span-5">
              <VaInput v-model.trim="q" label="Search" placeholder="Booking #, guest name, phone, room..." clearable>
                <template #prependInner>
                  <VaIcon name="search" color="secondary" />
                </template>
              </VaInput>
            </div>

            <div class="lg:col-span-3">
              <VaSelect
                v-model="sourceFilter"
                label="Source"
                :options="sourceOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />
            </div>

            <div class="lg:col-span-2">
              <VaSelect
                v-model="statusFilter"
                label="Status"
                :options="statusOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />
            </div>

            <div class="lg:col-span-2">
              <div class="text-xs font-semibold text-slate-500 mb-1">Tab</div>
              <div class="flex gap-2">
                <VaButton
                  preset="secondary"
                  class="tab-btn rounded-2xl font-extrabold"
                  :class="tab === 'arrivals' ? 'tab-btn--active' : ''"
                  @click="tab = 'arrivals'"
                >
                  Arrivals
                </VaButton>
                <VaButton
                  preset="secondary"
                  class="tab-btn rounded-2xl font-extrabold"
                  :class="tab === 'inhouse' ? 'tab-btn--active' : ''"
                  @click="tab = 'inhouse'"
                >
                  In-house
                </VaButton>
              </div>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div class="text-xs text-slate-500">
              Showing <span class="font-semibold text-slate-900">{{ filteredRows.length }}</span> records
            </div>

            <div class="flex items-center gap-2">
              <VaButton preset="secondary" class="font-extrabold rounded-2xl" @click="resetFilters">Reset</VaButton>
              <VaButton color="primary" class="font-extrabold rounded-2xl" icon="download" @click="exportCsv">
                Export
              </VaButton>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- List -->
      <div class="grid gap-3 lg:grid-cols-2">
        <VaCard
          v-for="row in paginatedRows"
          :key="row.booking.booking_id"
          class="soft-card rounded-2xl row-card cursor-pointer"
          @click="openDetails(row)"
        >
          <VaCardContent>
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="truncate text-base font-extrabold text-slate-900">
                    {{ row.booking.booking_number }}
                  </div>

                  <span class="chip" :class="sourcePill(row.booking.booking_source)">
                    {{ pretty(row.booking.booking_source) }}
                  </span>

                  <span class="chip" :class="statusPill(row.booking.status)">
                    {{ pretty(row.booking.status) }}
                  </span>
                </div>

                <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <div class="inline-flex items-center gap-1">
                    <span class="material-icons text-[16px] text-slate-400">person</span>
                    <span class="font-semibold text-slate-900">
                      {{ row.guest.first_name }} {{ row.guest.last_name }}
                    </span>
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

              <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click.stop="openDetails(row)">
                View
              </VaButton>
            </div>

            <!-- rooms -->
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span v-for="r in row.reservations" :key="r.reservation_id" class="pill">
                Room {{ r.room_number }} • {{ pretty(r.booking_type) }} •
                {{ r.total_nights_or_hours }}{{ r.booking_type === "hourly" ? "h" : "n" }}
              </span>
            </div>

            <!-- times -->
            <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div class="soft-sub box">
                <div class="text-slate-500">Check-in</div>
                <div class="mt-1 font-semibold text-slate-900">
                  {{ formatDateTime(row.reservations[0]?.check_in_at) }}
                </div>
              </div>
              <div class="soft-sub box">
                <div class="text-slate-500">Check-out</div>
                <div class="mt-1 font-semibold text-slate-900">
                  {{ formatDateTime(row.reservations[0]?.check_out_at) }}
                </div>
              </div>
            </div>

            <!-- totals -->
            <div class="mt-3 flex items-center justify-between">
              <div class="text-xs text-slate-500">
                Payment:
                <span class="font-semibold text-slate-900">{{ pretty(row.payment.payment_method) }}</span>
                <span class="mx-1 text-slate-300">•</span>
                <span class="font-semibold" :class="payPillText(row.payment.status)">
                  {{ pretty(row.payment.status) }}
                </span>
              </div>

              <div class="text-right">
                <div class="text-[11px] font-semibold text-slate-500">Total</div>
                <div class="text-base font-extrabold text-slate-900">{{ money(row.pricing.total) }}</div>
                <div class="text-[11px] text-slate-500">Balance: {{ money(row.pricing.balance_amount) }}</div>
              </div>
            </div>

            <!-- actions -->
            <div class="mt-3 grid grid-cols-2 gap-2">
              <VaButton
                color="primary"
                class="rounded-2xl font-extrabold"
                :disabled="!canCheckIn(row)"
                @click.stop="doCheckIn(row)"
              >
                <span class="material-icons mr-1 align-middle text-[18px]">login</span>
                Check-in
              </VaButton>

              <VaButton
                preset="secondary"
                class="rounded-2xl font-extrabold"
                :disabled="!canCheckOut(row)"
                @click.stop="doCheckOut(row)"
              >
                <span class="material-icons mr-1 align-middle text-[18px]">logout</span>
                Check-out
              </VaButton>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between pt-1">
        <VaButton preset="secondary" class="rounded-2xl font-extrabold" :disabled="page.current === 1" @click="page.current--">
          Prev
        </VaButton>
        <div class="text-xs text-slate-500">
          Page <span class="font-semibold text-slate-900">{{ page.current }}</span>
          / <span class="font-semibold text-slate-900">{{ totalPages }}</span>
        </div>
        <VaButton preset="secondary" class="rounded-2xl font-extrabold" :disabled="page.current === totalPages" @click="page.current++">
          Next
        </VaButton>
      </div>

      <!-- Drawer overlay -->
      <div v-if="drawer.open" class="fixed inset-0 z-40 bg-slate-900/25" @click="drawer.open = false" />

      <!-- Drawer -->
      <aside v-if="drawer.open" class="drawer">
        <VaCard class="soft-card h-full rounded-none">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4">
            <div>
              <div class="text-lg font-extrabold text-slate-900">{{ drawer.row.booking.booking_number }}</div>
              <div class="text-xs text-slate-500 uppercase tracking-wide">
                {{ pretty(drawer.row.booking.booking_source) }}
              </div>
            </div>

            <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="drawer.open = false">
              <span class="material-icons text-[18px]">close</span>
            </VaButton>
          </div>

          <!-- Content -->
          <div class="px-6 pb-6 space-y-6 overflow-y-auto h-[calc(100vh-72px)]">
            <!-- Guest -->
            <VaCard class="soft-sub rounded-2xl">
              <VaCardContent>
                <div class="flex items-center justify-between">
                  <div class="text-xs text-slate-500 font-extrabold">GUEST</div>

                  <VaButton
                    preset="secondary"
                    size="small"
                    class="rounded-2xl font-extrabold"
                    @click="drawer.showGuestMore = !drawer.showGuestMore"
                  >
                    {{ drawer.showGuestMore ? "Hide" : "Details" }}
                  </VaButton>
                </div>

                <div class="mt-2 text-base font-extrabold text-slate-900">
                  {{ drawer.row.guest.first_name }} {{ drawer.row.guest.last_name }}
                </div>
                <div class="text-sm text-slate-600">{{ drawer.row.guest.phone }}</div>

                <div v-if="drawer.showGuestMore" class="mt-3 text-xs text-slate-600 space-y-2">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Nationality</span>
                    <span class="font-semibold">{{ drawer.row.guest.nationality || "-" }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">ID Type</span>
                    <span class="font-semibold">{{ drawer.row.guest.id_type || "-" }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">ID Number</span>
                    <span class="font-semibold">{{ drawer.row.guest.id_number || "-" }}</span>
                  </div>
                </div>
              </VaCardContent>
            </VaCard>

            <!-- Rooms -->
            <VaCard class="soft-sub rounded-2xl">
              <VaCardContent>
                <div class="text-xs text-slate-500 font-extrabold mb-2">ROOMS</div>

                <VaCard
                  v-for="r in drawer.row.reservations"
                  :key="r.reservation_id"
                  class="soft-mini rounded-2xl mb-2 last:mb-0"
                >
                  <VaCardContent>
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="font-extrabold text-slate-900">Room {{ r.room_number }}</div>
                        <div class="text-xs text-slate-600 mt-0.5">
                          {{ r.room_type.type_name }} • {{ pretty(r.booking_type) }} •
                          {{ r.total_nights_or_hours }}{{ r.booking_type === "hourly" ? "h" : "n" }}
                        </div>

                        <div class="text-xs text-slate-500 mt-1">
                          In: <b class="text-slate-900">{{ formatDateTime(r.check_in_at) }}</b><br />
                          Out: <b class="text-slate-900">{{ formatDateTime(r.check_out_at) }}</b>
                        </div>
                      </div>

                      <div class="font-extrabold text-slate-900">{{ money(r.total_room_charges) }}</div>
                    </div>
                  </VaCardContent>
                </VaCard>
              </VaCardContent>
            </VaCard>

            <!-- Payment -->
            <VaCard class="soft-sub rounded-2xl">
              <VaCardContent>
                <div class="flex items-center justify-between">
                  <div class="text-xs text-slate-500 font-extrabold">PAYMENT</div>
                  <VaButton
                    preset="secondary"
                    size="small"
                    class="rounded-2xl font-extrabold"
                    @click="drawer.showPayMore = !drawer.showPayMore"
                  >
                    {{ drawer.showPayMore ? "Hide" : "Details" }}
                  </VaButton>
                </div>

                <div class="mt-3 space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-500">Total</span>
                    <span class="font-extrabold text-slate-900">{{ money(drawer.row.pricing.total) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Paid</span>
                    <span class="text-slate-900">{{ money(drawer.row.pricing.paid_amount) }}</span>
                  </div>
                  <div class="flex justify-between font-extrabold">
                    <span class="text-slate-500">Balance</span>
                    <span class="text-slate-900">{{ money(drawer.row.pricing.balance_amount) }}</span>
                  </div>
                </div>

                <div v-if="drawer.showPayMore" class="mt-3 text-xs text-slate-600 space-y-2">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Method</span>
                    <span class="font-semibold">{{ pretty(drawer.row.payment.payment_method) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Status</span>
                    <span class="font-semibold" :class="payPillText(drawer.row.payment.status)">
                      {{ pretty(drawer.row.payment.status) }}
                    </span>
                  </div>
                </div>
              </VaCardContent>
            </VaCard>

            <!-- Actions -->
            <div class="pt-2 space-y-2">
              <VaButton
                color="primary"
                size="large"
                class="w-full rounded-2xl font-extrabold"
                :disabled="!canCheckIn(drawer.row)"
                @click="doCheckIn(drawer.row)"
              >
                Check-in
              </VaButton>

              <VaButton
                preset="secondary"
                size="large"
                class="w-full rounded-2xl font-extrabold"
                :disabled="!canCheckOut(drawer.row)"
                @click="doCheckOut(drawer.row)"
              >
                Check-out
              </VaButton>

              <VaButton preset="secondary" size="large" class="w-full rounded-2xl font-extrabold" @click="printReceipt(drawer.row)">
                <span class="material-icons mr-1 align-middle text-[18px]">print</span>
                Print Preview
              </VaButton>
            </div>
          </div>
        </VaCard>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { frontdeskCheckinData } from "@/data/front/frontdeskCheckin"

const data = frontdeskCheckinData
const rows = ref(data.checkinList)

// filters
const q = ref("")
const sourceFilter = ref("all")
const statusFilter = ref("all")
const tab = ref("arrivals") // arrivals | inhouse

// options
const sourceOptions = [
  { text: "All", value: "all" },
  { text: "Walk-in", value: "walk_in" },
  { text: "Phone", value: "phone" },
  { text: "Other", value: "other" },
]
const statusOptions = [
  { text: "All", value: "all" },
  { text: "Pending", value: "pending" },
  { text: "Confirmed", value: "confirmed" },
  { text: "Checked-in", value: "checked_in" },
  { text: "Checked-out", value: "checked_out" },
  { text: "Cancelled", value: "cancelled" },
  { text: "No show", value: "no_show" },
]

// pagination
const page = reactive({ current: 1, size: 6 })

// drawer
const drawer = reactive({
  open: false,
  row: null,
  showGuestMore: false,
  showPayMore: false,
})

const filteredRows = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return rows.value.filter((x) => {
    // tab
    if (tab.value === "arrivals") {
      if (!["pending", "confirmed", "checked_in"].includes(x.booking.status)) return false
    } else {
      if (x.booking.status !== "checked_in") return false
    }

    // filters
    if (sourceFilter.value !== "all" && x.booking.booking_source !== sourceFilter.value) return false
    if (statusFilter.value !== "all" && x.booking.status !== statusFilter.value) return false

    if (!keyword) return true

    const guestName = `${x.guest.first_name} ${x.guest.last_name}`.toLowerCase()
    const guestPhone = String(x.guest.phone || "")
    const bookingNo = String(x.booking.booking_number || "").toLowerCase()
    const roomsStr = x.reservations.map((r) => String(r.room_number || "")).join(" ")

    return guestName.includes(keyword) || guestPhone.includes(keyword) || bookingNo.includes(keyword) || roomsStr.includes(keyword)
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
  drawer.showGuestMore = false
  drawer.showPayMore = false
}

function openWalkin() {
  // keep this if you want extra action besides router-link
  // (VaButton with to already navigates)
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
  if (src === "walk_in") return "chip-good"
  if (src === "phone") return "chip-info"
  return "chip-neutral"
}

function statusPill(st) {
  if (st === "pending") return "chip-warn"
  if (st === "confirmed") return "chip-info"
  if (st === "checked_in") return "chip-good"
  if (st === "checked_out") return "chip-neutral"
  if (st === "cancelled") return "chip-bad"
  if (st === "no_show") return "chip-bad"
  return "chip-neutral"
}

function payPillText(status) {
  if (status === "completed") return "text-emerald-700"
  if (status === "partial") return "text-amber-700"
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

function printReceipt(row) {
  const guest = `${row.guest.first_name} ${row.guest.last_name}`
  const roomsHtml = row.reservations
    .map((r) => {
      const unit = r.booking_type === "hourly" ? "h" : "n"
      return `<div style="display:flex;justify-content:space-between;margin:6px 0;">
        <div>
          <b>Room ${r.room_number}</b><br/>
          <span style="color:#555">${r.room_type?.type_name || "-"} • ${r.booking_type} • ${r.total_nights_or_hours}${unit}</span>
        </div>
        <div><b>$${Number(r.total_room_charges || 0).toFixed(2)}</b></div>
      </div>`
    })
    .join("")

  const w = window.open("", "_blank")
  if (!w) return alert("Popup blocked. Please allow popups for this site.")

  w.document.open()
  w.document.write(`
    <!doctype html>
    <html>
      <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Check-in Preview</title></head>
      <body style="font-family: ui-sans-serif, system-ui; padding: 18px;">
        <h2 style="margin:0;">${data.property?.name || "Guesthouse"}</h2>
        <div style="color:#555; margin-top:6px;">Check-in / Check-out Preview</div>
        <hr/>
        <div><b>Booking:</b> ${row.booking.booking_number}</div>
        <div style="margin-top:6px;"><b>Guest:</b> ${guest}</div>
        <div style="margin-top:12px;"><b>Rooms</b></div>
        <div style="margin-top:6px;">${roomsHtml || "-"}</div>
        <hr/>
        <div style="text-align:right;">
          <div>Total: <b>$${Number(row.pricing.total || 0).toFixed(2)}</b></div>
          <div>Paid: $${Number(row.pricing.paid_amount || 0).toFixed(2)}</div>
          <div>Balance: <b>$${Number(row.pricing.balance_amount || 0).toFixed(2)}</b></div>
        </div>
        <script>window.onload=function(){window.print();};<\/script>
      </body>
    </html>
  `)
  w.document.close()
}
</script>

<style scoped>
/* Page */
.ci-page {
  min-height: calc(100vh - 60px);
  background: #ffffff;
  padding: 18px 16px;
}

/* Soft shadow system (same vibe as your Monthly Report) */
.soft-card {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}
.soft-sub {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: rgba(2, 8, 23, 0.02) !important;
}
.soft-mini {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}

/* KPI */
.kpi-label {
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}
.kpi-value {
  margin-top: 4px;
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
}
.kpi-sub {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}

/* Chips */
.chip {
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.chip-neutral {
  background: rgba(2, 8, 23, 0.04);
  color: #0f172a;
}
.chip-good {
  background: rgba(16, 185, 129, 0.14);
  color: #065f46;
}
.chip-warn {
  background: rgba(245, 158, 11, 0.16);
  color: #92400e;
}
.chip-bad {
  background: rgba(244, 63, 94, 0.14);
  color: #9f1239;
}
.chip-info {
  background: rgba(14, 165, 233, 0.14);
  color: #075985;
}

/* Room pills */
.pill {
  border-radius: 999px;
  background: rgba(2, 8, 23, 0.04);
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 800;
  color: #0f172a;
}

/* Tabs */
.tab-btn {
  width: 100%;
}
.tab-btn--active {
  background: #0f172a !important;
  color: #fff !important;
}

/* little chip for date */
.soft-pill {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}

/* Row hover */
.row-card {
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}
.row-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 26px rgba(2, 8, 23, 0.08) !important;
}

/* Drawer */
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 50;
  height: 100%;
  width: 100%;
  max-width: 420px;
  background: transparent;
}
</style>
