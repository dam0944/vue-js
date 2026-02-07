<!-- src/pages/frontdesk/InHouse.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 p-4 sm:p-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-xl font-extrabold text-slate-900">In-House Guests</h1>
          <p class="text-sm text-slate-500">
            Guests currently checked-in (live view). Soft shadow, no border.
          </p>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <VaInput
            v-model.trim="q"
            class="w-full sm:w-[340px]"
            placeholder="Search guest / phone / room / booking..."
            clearable
          >
            <template #prependInner>
              <VaIcon name="search" color="secondary" />
            </template>
          </VaInput>

          <VaSelect
            v-model="typeFilter"
            class="w-full sm:w-[160px]"
            :options="typeOptions"
            label="Stay type"
            :text-by="(o) => o.text"
            :value-by="(o) => o.value"
          />

          <VaSelect
            v-model="payFilter"
            class="w-full sm:w-[160px]"
            :options="payOptions"
            label="Payment"
            :text-by="(o) => o.text"
            :value-by="(o) => o.value"
          />

          <VaButton color="primary" class="rounded-2xl font-extrabold" icon="refresh" @click="refreshDemo">
            Refresh
          </VaButton>
        </div>
      </div>

      <!-- Stats -->
      <div class="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <VaCard class="soft-card rounded-2xl">
          <VaCardContent>
            <div class="text-xs font-bold text-slate-500">In-House</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.inHouse }}</div>
            <div class="mt-1 text-xs text-slate-500">Guests checked-in</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent>
            <div class="text-xs font-bold text-slate-500">Rooms Used</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.roomsUsed }}</div>
            <div class="mt-1 text-xs text-slate-500">Active rooms</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent>
            <div class="text-xs font-bold text-slate-500">Balance Due</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(stats.balanceDue) }}</div>
            <div class="mt-1 text-xs text-slate-500">Unpaid amount</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent>
            <div class="text-xs font-bold text-slate-500">Today Revenue</div>
            <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(stats.paidToday) }}</div>
            <div class="mt-1 text-xs text-slate-500">Demo = sum paid</div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Chips -->
      <VaCard class="soft-card rounded-2xl mb-4">
        <VaCardContent class="py-3">
          <div class="flex flex-wrap items-center gap-2">
            <VaChip
              v-for="c in chips"
              :key="c.key"
              class="cursor-pointer"
              size="small"
              :outline="chipKey !== c.key"
              :color="chipKey === c.key ? 'primary' : 'secondary'"
              @click="applyChip(c.key)"
            >
              <span class="mr-2 inline-flex h-2 w-2 rounded-full" :class="c.dot"></span>
              {{ c.label }} <span class="ml-1 opacity-70">({{ c.count }})</span>
            </VaChip>

            <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="resetFilters">
              Reset
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- List -->
      <div class="grid gap-3 lg:grid-cols-2">
        <VaCard
          v-for="row in paginated"
          :key="row.booking.booking_id"
          class="soft-card rounded-3xl"
        >
          <VaCardContent class="p-4">
            <!-- Top -->
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="text-base font-extrabold text-slate-900 truncate">
                    {{ guestName(row.guest) }}
                  </div>

                  <VaBadge :text="row.booking.booking_number" color="secondary" />

                  <span class="chip" :class="sourceBadge(row.booking.booking_source)">
                    {{ pretty(row.booking.booking_source) }}
                  </span>

                  <span class="chip" :class="payBadge(row.payment.status)">
                    {{ pretty(row.payment.status) }}
                  </span>
                </div>

                <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span class="inline-flex items-center gap-1">
                    <span class="material-icons text-[16px] text-slate-400">call</span>
                    {{ row.guest.phone }}
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <span class="material-icons text-[16px] text-slate-400">flag</span>
                    {{ row.guest.nationality || "-" }}
                  </span>
                  <span v-if="row.guest.guest_type" class="inline-flex items-center gap-1">
                    <span class="material-icons text-[16px] text-slate-400">badge</span>
                    {{ pretty(row.guest.guest_type) }}
                  </span>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-2">
                <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="openDrawer(row)">
                  Details
                </VaButton>
                <VaButton color="primary" size="small" class="rounded-2xl font-extrabold" @click="printPreview(row)">
                  Print
                </VaButton>
              </div>
            </div>

            <!-- Rooms pills -->
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="r in row.reservations"
                :key="r.reservation_id"
                class="pill"
              >
                Room {{ r.room_number }} • {{ r.room_type.type_name }} • {{ r.room_type.bed_count }} bed
              </span>
            </div>

            <!-- Stay + Money -->
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="soft-sub rounded-2xl p-3">
                <div class="text-[11px] font-extrabold text-slate-500">STAY</div>
                <div class="mt-1 text-sm font-bold text-slate-900">
                  {{ stayLabel(row) }}
                </div>
                <div class="mt-1 text-xs text-slate-500">
                  Check-in: {{ shortDT(firstCheckin(row)) }} • Check-out: {{ shortDT(lastCheckout(row)) }}
                </div>
              </div>

              <div class="soft-sub rounded-2xl p-3">
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
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Empty -->
      <VaCard v-if="filtered.length === 0" class="soft-card rounded-3xl mt-8">
        <VaCardContent class="p-8 text-center">
          <div class="text-lg font-extrabold text-slate-900">No in-house guests found</div>
          <div class="mt-1 text-sm text-slate-500">Try search or reset filters.</div>
          <VaButton class="mt-4 rounded-2xl font-extrabold" color="primary" @click="resetFilters">
            Reset
          </VaButton>
        </VaCardContent>
      </VaCard>

      <!-- Pagination -->
      <div v-if="filtered.length > 0" class="mt-6 flex items-center justify-between">
        <VaButton
          preset="secondary"
          class="rounded-2xl font-extrabold"
          :disabled="page.current === 1"
          @click="page.current--"
        >
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
    </div>

    <!-- Drawer -->
    <div v-if="drawer.open" class="fixed inset-0 z-40">
      <div class="absolute inset-0 bg-slate-900/40" @click="closeDrawer"></div>

      <aside class="absolute right-0 top-0 h-full w-full max-w-md" role="dialog" aria-modal="true">
        <VaCard class="soft-card h-full rounded-none">
          <!-- Drawer header -->
          <VaCardContent class="px-5 py-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-extrabold text-slate-900">In-House Details</div>
                <div class="text-xs text-slate-500">{{ drawer.row?.booking?.booking_number || "" }}</div>
              </div>
              <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" icon="close" @click="closeDrawer">
                Close
              </VaButton>
            </div>
          </VaCardContent>

          <VaDivider />

          <!-- Drawer content -->
          <div v-if="drawer.row" class="h-[calc(100vh-96px)] overflow-y-auto px-5 pb-6 pt-4 space-y-4">
            <VaCard class="soft-mini rounded-3xl">
              <VaCardContent class="p-4">
                <div class="text-xs font-extrabold text-slate-500">GUEST</div>
                <div class="mt-1 text-lg font-extrabold text-slate-900">{{ guestName(drawer.row.guest) }}</div>
                <div class="mt-1 text-sm text-slate-700">{{ drawer.row.guest.phone }}</div>
                <div class="mt-1 text-xs text-slate-500">
                  {{ drawer.row.guest.nationality }} • {{ pretty(drawer.row.guest.id_type) }} • {{ drawer.row.guest.id_number || "-" }}
                </div>
              </VaCardContent>
            </VaCard>

            <VaCard class="soft-mini rounded-3xl">
              <VaCardContent class="p-4">
                <div class="text-xs font-extrabold text-slate-500">ROOMS</div>

                <div v-for="r in drawer.row.reservations" :key="r.reservation_id" class="mt-3 soft-sub rounded-2xl p-3">
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
                        Check-in: <span class="font-bold text-slate-900">{{ shortDT(r.check_in_at) }}</span><br />
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
              </VaCardContent>
            </VaCard>

            <VaCard class="soft-mini rounded-3xl">
              <VaCardContent class="p-4">
                <div class="text-xs font-extrabold text-slate-500">PAYMENT</div>

                <div class="mt-3 soft-sub rounded-2xl p-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-600 font-bold">Paid</span>
                    <span class="text-slate-900 font-extrabold">{{ money(drawer.row.payment.paid_amount) }}</span>
                  </div>
                  <div class="mt-2 flex items-center justify-between text-sm">
                    <span class="text-slate-600 font-bold">Balance</span>
                    <span class="text-slate-900 font-extrabold">{{ money(drawer.row.payment.balance_amount) }}</span>
                  </div>
                  <div class="mt-2 text-xs text-slate-600">
                    Method: <span class="font-bold text-slate-900">{{ drawer.row.payment.payment_method || "-" }}</span><br />
                    Status:
                    <span class="font-bold" :class="drawer.row.payment.status === 'completed'
                      ? 'text-emerald-700'
                      : drawer.row.payment.status === 'partial'
                        ? 'text-amber-700'
                        : 'text-rose-700'">
                      {{ pretty(drawer.row.payment.status) }}
                    </span>
                  </div>
                </div>
              </VaCardContent>
            </VaCard>

            <VaCard v-if="drawer.row.notes" class="soft-mini rounded-3xl">
              <VaCardContent class="p-4 text-sm text-slate-700">
                <div class="text-xs font-extrabold text-slate-500">NOTES</div>
                <div class="mt-1">{{ drawer.row.notes }}</div>
              </VaCardContent>
            </VaCard>

            <div class="grid grid-cols-2 gap-2">
              <VaButton color="primary" class="rounded-2xl font-extrabold" @click="printPreview(drawer.row)">
                Print
              </VaButton>
              <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="closeDrawer">
                Close
              </VaButton>
            </div>
          </div>
        </VaCard>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue"
import { frontdeskInHouseData } from "@/data/front/frontdeskInHouse"

const data = frontdeskInHouseData

// state
const q = ref("")
const typeFilter = ref("all")
const payFilter = ref("all")
const chipKey = ref("all")
const page = reactive({ current: 1, size: 6 })

// drawer
const drawer = reactive({ open: false, row: null })

// options
const typeOptions = [
  { text: "All types", value: "all" },
  { text: "Hourly", value: "hourly" },
  { text: "Nightly", value: "nightly" },
]
const payOptions = [
  { text: "All payments", value: "all" },
  { text: "Paid", value: "completed" },
  { text: "Partial", value: "partial" },
  { text: "Pending", value: "pending" },
]

// helpers
const pretty = (s) => (s ? String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase()) : "-")
const guestName = (g) => [g?.first_name, g?.last_name].filter(Boolean).join(" ") || g?.name || "-"

const money = (v) => {
  const n = Number(v || 0)
  const cur = data.property.currency || "USD"
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
  return rs.length ? rs[rs.length - 1].check_out_at || "" : ""
}

function stayLabel(row) {
  const rs = row?.reservations || []
  if (!rs.length) return "-"
  const types = Array.from(new Set(rs.map((x) => x.booking_type)))
  const t = types.length === 1 ? types[0] : "mixed"
  const units = rs.reduce((sum, x) => sum + Number(x.total_nights_or_hours || 0), 0)
  const u = t === "hourly" ? `${units}h` : t === "nightly" ? `${units}n` : `${units}`
  return `${pretty(t)} • ${u}`
}

function sourceBadge(source) {
  if (source === "walk_in") return "chip-good"
  if (source === "phone") return "chip-info"
  return "chip-neutral"
}
function payBadge(status) {
  if (status === "completed") return "chip-good"
  if (status === "partial") return "chip-warn"
  return "chip-bad"
}

// filtering
const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()
  return (data.inHouse || []).filter((row) => {
    // chips
    if (chipKey.value === "paid" && row.payment.status !== "completed") return false
    if (chipKey.value === "balance" && Number(row.payment.balance_amount || 0) <= 0) return false
    if (chipKey.value === "hourly" && !row.reservations.some((x) => x.booking_type === "hourly")) return false
    if (chipKey.value === "nightly" && !row.reservations.some((x) => x.booking_type === "nightly")) return false

    // dropdowns
    if (typeFilter.value !== "all" && !row.reservations.some((x) => x.booking_type === typeFilter.value)) return false
    if (payFilter.value !== "all" && row.payment.status !== payFilter.value) return false

    // search
    if (!keyword) return true
    const g = guestName(row.guest).toLowerCase()
    const phone = String(row.guest?.phone || "").toLowerCase()
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
  return [
    { key: "all", label: "All", count: rows.length, dot: "bg-slate-400" },
    { key: "paid", label: "Paid", count: rows.filter((r) => r.payment.status === "completed").length, dot: "bg-emerald-500" },
    { key: "balance", label: "Balance", count: rows.filter((r) => Number(r.payment.balance_amount || 0) > 0).length, dot: "bg-rose-500" },
    { key: "hourly", label: "Hourly", count: rows.filter((r) => (r.reservations || []).some((x) => x.booking_type === "hourly")).length, dot: "bg-amber-500" },
    { key: "nightly", label: "Nightly", count: rows.filter((r) => (r.reservations || []).some((x) => x.booking_type === "nightly")).length, dot: "bg-blue-500" },
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
  console.log("refresh demo")
}

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

  w.document.open()
  w.document.write(`
    <html>
      <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>In-House Preview</title></head>
      <body style="font-family: ui-sans-serif, system-ui; padding: 18px;">
        <h2 style="margin:0;">${data.property?.property_name || data.property?.name || "Guesthouse"}</h2>
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
        <script>window.onload=function(){window.print();};<\/script>
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

/* Soft shadow system (no border) */
.soft-card {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}
.soft-mini {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}
.soft-sub {
  background: rgba(2, 8, 23, 0.02);
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06);
}

/* Pills / Chips */
.pill {
  border-radius: 999px;
  background: rgba(2, 8, 23, 0.05);
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
}

.chip {
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
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
</style>
