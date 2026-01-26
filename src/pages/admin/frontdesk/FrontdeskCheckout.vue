<!-- src/pages/admin/frontdesk/Checkout.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50">
    <div class="mx-auto px-4 py-4 sm:px-6 sm:py-6">
      <!-- Top bar -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-white">
            <span class="material-icons text-[22px]">logout</span>
          </div>
          <div>
            <h1 class="text-lg font-extrabold text-slate-900">Front Desk — Checkout</h1>
            <p class="text-sm text-slate-500">
              Close stays, add extras, take payment, and checkout rooms.
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div class="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
            <span class="material-icons text-[18px] text-slate-500">location_city</span>
            <div class="text-xs">
              <div class="font-bold text-slate-900">{{ data.property.name }}</div>
              <div class="text-slate-500">{{ data.property.city }} • {{ data.property.currency }}</div>
            </div>
          </div>

          <button
            class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white"
            @click="refreshDemo"
          >
            Refresh Demo
          </button>
        </div>
      </div>

      <!-- Stats row (no border/shadow) -->
      <div class="mt-4 grid gap-3 md:grid-cols-4">
        <div class="rounded-2xl bg-slate-100 p-4">
          <div class="text-xs font-bold text-slate-500">Ready</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.ready }}</div>
          <div class="mt-1 text-xs text-slate-500">Can checkout now</div>
        </div>

        <div class="rounded-2xl bg-slate-100 p-4">
          <div class="text-xs font-bold text-slate-500">Late</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.late }}</div>
          <div class="mt-1 text-xs text-slate-500">Past expected out</div>
        </div>

        <div class="rounded-2xl bg-slate-100 p-4">
          <div class="text-xs font-bold text-slate-500">Checked-out</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ stats.checkedOut }}</div>
          <div class="mt-1 text-xs text-slate-500">Today (demo)</div>
        </div>

        <div class="rounded-2xl bg-slate-100 p-4">
          <div class="text-xs font-bold text-slate-500">Balance Total</div>
          <div class="mt-1 text-2xl font-extrabold text-slate-900">{{ money(stats.balanceTotal) }}</div>
          <div class="mt-1 text-xs text-slate-500">Outstanding</div>
        </div>
      </div>

      <!-- Search & filters -->
      <div class="mt-4 rounded-2xl bg-slate-100 p-4">
        <div class="grid gap-3 lg:grid-cols-5">
          <div class="lg:col-span-2">
            <label class="mb-1 block text-xs font-bold text-slate-600">Search</label>
            <div class="flex items-center gap-2 rounded-2xl bg-white px-3 py-2">
              <span class="material-icons text-[18px] text-slate-500">search</span>
              <input
                v-model.trim="q"
                type="text"
                placeholder="Booking #, guest, phone, room..."
                class="w-full bg-transparent text-sm text-slate-900 outline-none"
              />
              <button v-if="q" class="text-xs font-bold text-slate-500" @click="q = ''">Clear</button>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold text-slate-600">Source</label>
            <select v-model="sourceFilter" class="w-full rounded-2xl bg-white px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              <option v-for="s in data.bookingSources" :key="s" :value="s">
                {{ pretty(s) }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold text-slate-600">Status</label>
            <select v-model="statusFilter" class="w-full rounded-2xl bg-white px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              <option v-for="s in data.checkoutStatuses" :key="s" :value="s">
                {{ pretty(s) }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold text-slate-600">Payment</label>
            <select v-model="paymentStatusFilter" class="w-full rounded-2xl bg-white px-3 py-2 text-sm outline-none">
              <option value="all">All</option>
              <option v-for="s in data.paymentStatuses" :key="s" :value="s">
                {{ pretty(s) }}
              </option>
            </select>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div class="text-xs text-slate-600">
            Showing <b class="text-slate-900">{{ filtered.length }}</b> record(s)
          </div>

          <div class="flex gap-2">
            <button class="rounded-full bg-white px-4 py-2 text-xs font-extrabold" @click="resetFilters">
              Reset
            </button>
            <button
              class="rounded-full bg-slate-900 px-4 py-2 text-xs font-extrabold text-white"
              @click="exportCsv"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- Main layout: list + drawer -->
      <div class="mt-4 grid gap-4 lg:grid-cols-[1fr_420px]">
        <!-- List -->
        <div class="space-y-3">
          <div
            v-for="row in paginated"
            :key="row.booking.booking_id"
            class="rounded-2xl bg-slate-100 p-4"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="text-sm font-extrabold text-slate-900">
                    {{ row.booking.booking_number }}
                  </div>

                  <span class="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-slate-700">
                    {{ pretty(row.booking.booking_source) }}
                  </span>

                  <span
                    class="rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                    :class="checkoutPillClass(row.checkout.checkout_status)"
                  >
                    {{ pretty(row.checkout.checkout_status) }}
                  </span>

                  <span
                    class="rounded-full px-2.5 py-1 text-[10px] font-extrabold"
                    :class="paymentPillClass(row.invoice)"
                  >
                    {{ invoicePillLabel(row.invoice) }}
                  </span>
                </div>

                <div class="mt-2 grid gap-2 sm:grid-cols-2">
                  <div class="flex items-center gap-2 text-sm text-slate-800">
                    <span class="material-icons text-[18px] text-slate-500">person</span>
                    <div class="truncate">
                      <span class="font-bold">{{ guestName(row.guest) }}</span>
                      <span class="text-slate-500"> • {{ row.guest.phone }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 text-sm text-slate-800">
                    <span class="material-icons text-[18px] text-slate-500">schedule</span>
                    <div class="truncate">
                      Expected out:
                      <span class="font-bold">{{ fmt(row.checkout.expected_checkout) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Rooms chips -->
                <div class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="r in row.reservations"
                    :key="r.reservation_id"
                    class="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700"
                  >
                    Room {{ r.room_number }} • {{ r.room_type.type_name }} •
                    {{ r.booking_type === 'hourly' ? r.total_nights_or_hours + 'h' : r.total_nights_or_hours + 'n' }}
                  </span>
                </div>
              </div>

              <div class="flex items-end justify-between gap-3 sm:flex-col sm:items-end">
                <div class="text-right">
                  <div class="text-xs font-bold text-slate-500">Balance</div>
                  <div class="text-lg font-extrabold text-slate-900">{{ money(row.invoice.balance) }}</div>
                </div>

                <div class="flex gap-2">
                  <button class="rounded-full bg-white px-4 py-2 text-xs font-extrabold" @click="selectRow(row)">
                    View
                  </button>
                  <button
                    class="rounded-full bg-slate-900 px-4 py-2 text-xs font-extrabold text-white"
                    @click="selectRow(row); focusCheckout()"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>

            <div v-if="row.checkout.notes" class="mt-3 text-xs text-slate-600">
              Note: <span class="font-semibold text-slate-900">{{ row.checkout.notes }}</span>
            </div>
          </div>

          <!-- Empty -->
          <div v-if="filtered.length === 0" class="rounded-2xl bg-slate-100 p-10 text-center">
            <div class="text-base font-extrabold text-slate-900">No records</div>
            <div class="mt-1 text-sm text-slate-600">Try another keyword or clear filters.</div>
            <button class="mt-4 rounded-full bg-white px-5 py-2 text-sm font-extrabold" @click="resetFilters">
              Reset
            </button>
          </div>

          <!-- Pagination -->
          <div v-if="filtered.length > 0" class="flex items-center justify-between px-1">
            <button
              class="rounded-full bg-white px-4 py-2 text-xs font-extrabold disabled:opacity-40"
              :disabled="page.current === 1"
              @click="page.current--"
            >
              Prev
            </button>
            <div class="text-xs text-slate-600">
              Page <b class="text-slate-900">{{ page.current }}</b> of
              <b class="text-slate-900">{{ totalPages }}</b>
            </div>
            <button
              class="rounded-full bg-white px-4 py-2 text-xs font-extrabold disabled:opacity-40"
              :disabled="page.current === totalPages"
              @click="page.current++"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Drawer (always visible on desktop, slide-up on mobile) -->
        <div class="lg:sticky lg:top-[84px]">
          <div class="rounded-2xl bg-white p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-extrabold text-slate-900">Checkout</div>
                <div class="text-xs text-slate-500">Select a booking to finalize.</div>
              </div>
              <button
                v-if="selected"
                class="rounded-full bg-slate-100 px-3 py-2 text-xs font-extrabold"
                @click="clearSelected"
              >
                Clear
              </button>
            </div>

            <div v-if="!selected" class="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Pick a booking on the left to view details, add extras, and checkout.
            </div>

            <div v-else class="mt-4 space-y-4">
              <!-- Guest card -->
              <div class="rounded-2xl bg-slate-50 p-4">
                <div class="text-xs font-extrabold text-slate-500">GUEST</div>
                <div class="mt-1 text-base font-extrabold text-slate-900">
                  {{ guestName(selected.guest) }}
                </div>
                <div class="mt-1 text-sm text-slate-700">{{ selected.guest.phone }}</div>
                <div class="mt-2 text-xs text-slate-500">
                  {{ selected.guest.nationality }} • {{ pretty(selected.guest.id_type) }} • {{ selected.guest.id_number }}
                </div>
              </div>

              <!-- Rooms -->
              <div class="rounded-2xl bg-slate-50 p-4">
                <div class="flex items-center justify-between">
                  <div class="text-xs font-extrabold text-slate-500">ROOMS</div>
                  <div class="text-xs font-bold text-slate-600">
                    {{ selected.reservations.length }} room(s)
                  </div>
                </div>

                <div class="mt-3 space-y-3">
                  <div
                    v-for="r in selected.reservations"
                    :key="r.reservation_id"
                    class="flex items-start justify-between gap-3"
                  >
                    <div class="min-w-0">
                      <div class="text-sm font-extrabold text-slate-900">Room {{ r.room_number }}</div>
                      <div class="mt-0.5 text-xs text-slate-600">
                        {{ r.room_type.type_name }} • {{ r.room_type.bed_count }} bed(s) •
                        {{ pretty(r.booking_type) }} •
                        {{ r.booking_type === 'hourly' ? r.total_nights_or_hours + 'h' : r.total_nights_or_hours + 'n' }}
                      </div>
                      <div class="mt-1 text-xs text-slate-500">
                        In: <b class="text-slate-900">{{ fmt(r.check_in_at) }}</b>
                        <span class="mx-1">•</span>
                        Out: <b class="text-slate-900">{{ fmt(r.check_out_at) }}</b>
                      </div>
                    </div>

                    <div class="text-right">
                      <div class="text-xs font-bold text-slate-500">Charge</div>
                      <div class="text-sm font-extrabold text-slate-900">{{ money(r.total_room_charges) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Extras -->
              <div class="rounded-2xl bg-slate-50 p-4">
                <div class="flex items-center justify-between">
                  <div class="text-xs font-extrabold text-slate-500">EXTRA CHARGES</div>
                  <button class="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold" @click="addExtra()">
                    + Add
                  </button>
                </div>

                <div v-if="draft.extras.length === 0" class="mt-3 text-sm text-slate-600">
                  No extra charges.
                </div>

                <div v-else class="mt-3 space-y-2">
                  <div
                    v-for="(x, idx) in draft.extras"
                    :key="idx"
                    class="grid grid-cols-[1fr_86px_86px_28px] items-center gap-2"
                  >
                    <input
                      v-model="x.description"
                      class="rounded-2xl bg-white px-3 py-2 text-sm outline-none"
                      placeholder="Description (late checkout, laundry...)"
                    />
                    <input
                      v-model.number="x.qty"
                      type="number"
                      min="1"
                      class="rounded-2xl bg-white px-3 py-2 text-sm outline-none text-right"
                      placeholder="Qty"
                    />
                    <input
                      v-model.number="x.unit_price"
                      type="number"
                      min="0"
                      step="0.01"
                      class="rounded-2xl bg-white px-3 py-2 text-sm outline-none text-right"
                      placeholder="Price"
                    />
                    <button class="grid h-10 w-10 place-items-center rounded-2xl bg-white" @click="removeExtra(idx)">
                      <span class="material-icons text-[18px] text-slate-500">close</span>
                    </button>

                    <div class="col-span-4 text-right text-xs font-bold text-slate-600">
                      Line total: <span class="text-slate-900">{{ money(extraLineTotal(x)) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Totals (no border/shadow) -->
              <div class="rounded-2xl bg-slate-50 p-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-600">Room subtotal</span>
                  <b class="text-slate-900">{{ money(roomSubtotal) }}</b>
                </div>
                <div class="mt-2 flex items-center justify-between text-sm">
                  <span class="text-slate-600">Extras</span>
                  <b class="text-slate-900">{{ money(extrasTotal) }}</b>
                </div>
                <div class="mt-2 flex items-center justify-between text-sm">
                  <span class="text-slate-600">Tax</span>
                  <b class="text-slate-900">{{ money(taxAmount) }}</b>
                </div>

                <div class="mt-3 flex items-center justify-between">
                  <span class="text-sm font-extrabold text-slate-900">Total</span>
                  <span class="text-xl font-extrabold text-slate-900">{{ money(grandTotal) }}</span>
                </div>

                <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div class="rounded-2xl bg-white p-3">
                    <div class="text-xs font-bold text-slate-500">Paid</div>
                    <div class="mt-1 text-base font-extrabold text-slate-900">{{ money(paidAmount) }}</div>
                  </div>
                  <div class="rounded-2xl bg-white p-3">
                    <div class="text-xs font-bold text-slate-500">Balance</div>
                    <div class="mt-1 text-base font-extrabold text-slate-900">{{ money(balance) }}</div>
                  </div>
                </div>

                <div class="mt-3 text-xs text-slate-600">
                  Payment: <b class="text-slate-900">{{ selected.payment?.payment_method_label || "-" }}</b>
                  <span class="mx-1">•</span>
                  Status: <b class="text-slate-900">{{ pretty(selected.payment?.status || "pending") }}</b>
                </div>
              </div>

              <!-- Payment input -->
              <div class="rounded-2xl bg-slate-50 p-4">
                <div class="text-xs font-extrabold text-slate-500">PAYMENT</div>

                <div class="mt-3 grid gap-2">
                  <select v-model="draft.payment.method" class="w-full rounded-2xl bg-white px-3 py-2 text-sm outline-none">
                    <option v-for="m in data.paymentMethods" :key="m.method_code" :value="m.method_code">
                      {{ m.label }}
                    </option>
                  </select>

                  <div class="grid grid-cols-2 gap-2">
                    <input
                      v-model.number="draft.payment.amount_paid"
                      type="number"
                      min="0"
                      step="0.01"
                      class="rounded-2xl bg-white px-3 py-2 text-sm outline-none"
                      placeholder="Pay now"
                    />
                    <input
                      v-model="draft.payment.reference_number"
                      class="rounded-2xl bg-white px-3 py-2 text-sm outline-none"
                      placeholder="Reference (optional)"
                    />
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="space-y-2">
                <button
                  ref="checkoutBtn"
                  class="w-full rounded-2xl bg-slate-900 py-3 text-sm font-extrabold text-white disabled:opacity-40"
                  :disabled="!selected"
                  @click="checkoutNow"
                >
                  Checkout
                </button>

                <button
                  class="w-full rounded-2xl bg-slate-100 py-3 text-sm font-extrabold text-slate-900"
                  :disabled="!selected"
                  @click="printPreview"
                >
                  <span class="material-icons mr-1 align-middle text-[18px]">print</span>
                  Print Preview
                </button>

                <button
                  class="w-full rounded-2xl bg-slate-100 py-3 text-sm font-extrabold text-slate-900"
                  :disabled="!selected"
                  @click="resetDraft"
                >
                  Reset Draft
                </button>
              </div>

              <div class="text-[11px] text-slate-500">
                Demo UI only: later you will connect to API and update invoices, payments, deposits, reservations, and room status.
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- /main -->
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue"
import { frontdeskCheckoutData as data } from "@/data/front/frontdeskCheckoutData"

// local mutable list (demo)
const rows = ref(structuredClone ? structuredClone(data.checkoutList) : JSON.parse(JSON.stringify(data.checkoutList)))

// filters
const q = ref("")
const sourceFilter = ref("all")
const statusFilter = ref("all")
const paymentStatusFilter = ref("all")

// pagination
const page = reactive({ current: 1, size: 6 })

// selection + draft
const selected = ref(null)
const checkoutBtn = ref(null)

const draft = reactive({
  extras: [],
  payment: {
    method: "CASH_USD",
    amount_paid: 0,
    reference_number: "",
    status: "pending",
  },
  notes: "",
})

// ---------- computed ----------
const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()

  return rows.value.filter((row) => {
    if (sourceFilter.value !== "all" && row.booking.booking_source !== sourceFilter.value) return false
    if (statusFilter.value !== "all" && row.checkout.checkout_status !== statusFilter.value) return false

    const payStatus = row.payment?.status || (row.invoice.balance > 0 ? "pending" : "completed")
    if (paymentStatusFilter.value !== "all" && payStatus !== paymentStatusFilter.value) return false

    if (!keyword) return true

    const guest = guestName(row.guest).toLowerCase()
    const phone = String(row.guest.phone || "").toLowerCase()
    const bookingNo = String(row.booking.booking_number || "").toLowerCase()
    const roomsText = row.reservations.map((r) => String(r.room_number)).join(" ").toLowerCase()

    return (
      guest.includes(keyword) ||
      phone.includes(keyword) ||
      bookingNo.includes(keyword) ||
      roomsText.includes(keyword)
    )
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / page.size)))
const paginated = computed(() => {
  const start = (page.current - 1) * page.size
  return filtered.value.slice(start, start + page.size)
})

const stats = computed(() => {
  const ready = rows.value.filter((x) => x.checkout.checkout_status === "ready").length
  const late = rows.value.filter((x) => x.checkout.checkout_status === "late").length
  const checkedOut = rows.value.filter((x) => x.checkout.checkout_status === "checked_out").length
  const balanceTotal = rows.value.reduce((a, x) => a + Number(x.invoice.balance || 0), 0)
  return { ready, late, checkedOut, balanceTotal }
})

const roomSubtotal = computed(() => {
  if (!selected.value) return 0
  return selected.value.reservations.reduce((a, r) => a + Number(r.total_room_charges || 0), 0)
})

const extrasTotal = computed(() => {
  return draft.extras.reduce((a, x) => a + extraLineTotal(x), 0)
})

const taxAmount = computed(() => {
  // demo: use invoice tax_rate if set, else 0
  const rate = selected.value?.invoice?.tax_rate ? Number(selected.value.invoice.tax_rate) : 0
  const base = roomSubtotal.value + extrasTotal.value
  return (base * rate) / 100
})

const grandTotal = computed(() => roomSubtotal.value + extrasTotal.value + taxAmount.value)

const paidAmount = computed(() => {
  if (!selected.value) return 0
  const invoicePaid = Number(selected.value.invoice.paid_amount || 0)
  const payNow = Number(draft.payment.amount_paid || 0)
  return invoicePaid + payNow
})

const balance = computed(() => Math.max(0, grandTotal.value - paidAmount.value))

// ---------- helpers ----------
function money(v) {
  const n = Number(v || 0)
  return `$${n.toFixed(2)}`
}
function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}
function fmt(s) {
  if (!s) return "-"
  return String(s).replace("T", " ").slice(0, 16)
}
function guestName(g) {
  if (!g) return "-"
  return `${g.first_name || ""} ${g.last_name || ""}`.trim() || "-"
}
function checkoutPillClass(st) {
  if (st === "ready") return "bg-emerald-100 text-emerald-800"
  if (st === "late") return "bg-amber-100 text-amber-800"
  if (st === "checked_out") return "bg-slate-200 text-slate-800"
  return "bg-slate-200 text-slate-800"
}
function paymentPillClass(inv) {
  if (!inv) return "bg-slate-200 text-slate-800"
  if (Number(inv.balance || 0) <= 0) return "bg-emerald-100 text-emerald-800"
  if (Number(inv.paid_amount || 0) > 0) return "bg-amber-100 text-amber-800"
  return "bg-rose-100 text-rose-800"
}
function invoicePillLabel(inv) {
  if (!inv) return "No Invoice"
  if (Number(inv.balance || 0) <= 0) return "Paid"
  if (Number(inv.paid_amount || 0) > 0) return "Partial"
  return "Pending"
}
function extraLineTotal(x) {
  const qty = Number(x.qty || 0)
  const price = Number(x.unit_price || 0)
  return qty * price
}

// ---------- actions ----------
function resetFilters() {
  q.value = ""
  sourceFilter.value = "all"
  statusFilter.value = "all"
  paymentStatusFilter.value = "all"
}
function selectRow(row) {
  selected.value = row
  resetDraft()
}
function clearSelected() {
  selected.value = null
  resetDraft()
}
function resetDraft() {
  draft.extras = []
  draft.payment.method = "CASH_USD"
  draft.payment.amount_paid = 0
  draft.payment.reference_number = ""
  draft.payment.status = "pending"
  draft.notes = ""
}
function addExtra() {
  draft.extras.push({
    item_type: "other",
    description: "",
    qty: 1,
    unit_price: 0,
  })
}
function removeExtra(i) {
  draft.extras.splice(i, 1)
}
function focusCheckout() {
  // scroll into drawer area on mobile
  requestAnimationFrame(() => {
    checkoutBtn.value?.scrollIntoView?.({ behavior: "smooth", block: "start" })
  })
}

function checkoutNow() {
  if (!selected.value) return

  // demo: update invoice paid/balance, set checkout status
  const inv = selected.value.invoice
  inv.total_amount = grandTotal.value
  inv.subtotal = roomSubtotal.value + extrasTotal.value
  inv.tax_amount = taxAmount.value

  inv.paid_amount = Math.min(grandTotal.value, paidAmount.value)
  inv.balance = Math.max(0, grandTotal.value - inv.paid_amount)
  inv.status = inv.balance <= 0 ? "paid" : inv.paid_amount > 0 ? "partial" : "issued"

  // demo payment record
  selected.value.payment = {
    payment_id: selected.value.payment?.payment_id || null,
    payment_method: draft.payment.method === "ABA_KHQR" ? "aba_khqr" : draft.payment.method === "CASH_KHR" ? "cash_khr" : "cash_usd",
    payment_method_label: data.paymentMethods.find((m) => m.method_code === draft.payment.method)?.label || "Cash USD",
    status: inv.balance <= 0 ? "completed" : inv.paid_amount > 0 ? "partial" : "pending",
    reference_number: draft.payment.reference_number || "",
  }

  selected.value.checkout.checkout_status = "checked_out"
  selected.value.checkout.actual_checkout = new Date().toISOString().slice(0, 16).replace("T", " ")

  alert("Demo: Checked out successfully (static UI).")
}

function printPreview() {
  if (!selected.value) return

  const guest = guestName(selected.value.guest)
  const lines = selected.value.reservations
    .map((r) => {
      const unit = r.booking_type === "hourly" ? "h" : "n"
      return `Room ${r.room_number} • ${r.room_type.type_name} ${r.room_type.bed_count} bed • ${r.total_nights_or_hours}${unit} • ${money(r.total_room_charges)}`
    })
    .join("<br/>")

  const extras = draft.extras
    .filter((x) => (x.description || "").trim())
    .map((x) => `${x.description} • ${x.qty} x ${money(x.unit_price)} • ${money(extraLineTotal(x))}`)
    .join("<br/>")

  const w = window.open("", "_blank")
  if (!w) return alert("Popup blocked. Please allow popups for print preview.")

  w.document.open()
  w.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Checkout Preview</title>
      </head>
      <body style="font-family: ui-sans-serif, system-ui; padding: 18px;">
        <h2 style="margin:0;">${data.property.name}</h2>
        <div style="color:#555; margin-top:6px;">Checkout Preview</div>
        <hr/>
        <div><b>Guest:</b> ${guest}</div>
        <div style="margin-top:6px;"><b>Booking:</b> ${selected.value.booking.booking_number}</div>

        <div style="margin-top:12px;"><b>Rooms</b></div>
        <div style="margin-top:6px;">${lines || "-"}</div>

        <div style="margin-top:12px;"><b>Extras</b></div>
        <div style="margin-top:6px;">${extras || "-"}</div>

        <hr/>
        <div style="text-align:right;">
          <div>Room Subtotal: ${money(roomSubtotal.value)}</div>
          <div>Extras: ${money(extrasTotal.value)}</div>
          <div>Tax: ${money(taxAmount.value)}</div>
          <div style="font-size:18px;"><b>Total: ${money(grandTotal.value)}</b></div>
          <div style="margin-top:6px;">Paid (incl. now): ${money(paidAmount.value)}</div>
          <div><b>Balance: ${money(balance.value)}</b></div>
        </div>

        <script>
          window.onload = () => { window.print(); };
        <\/script>
      </body>
    </html>
  `)
  w.document.close()
}

function exportCsv() {
  alert("Demo: export " + filtered.value.length + " rows.")
}

function refreshDemo() {
  rows.value = structuredClone ? structuredClone(data.checkoutList) : JSON.parse(JSON.stringify(data.checkoutList))
  clearSelected()
}

// reset page when filters change
watch([q, sourceFilter, statusFilter, paymentStatusFilter], () => {
  page.current = 1
})
</script>

<style scoped>
.material-icons {
  font-size: 20px;
  vertical-align: middle;
}
</style>
