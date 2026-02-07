<!-- src/pages/admin/frontdesk/Checkout.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50">
    <div class="mx-auto px-4 py-4 sm:px-6 sm:py-6">
      <!-- Top bar -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex items-start gap-3">
          <div class="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white">
            <span class="material-icons text-[22px]">logout</span>
          </div>
          <div>
            <h1 class="text-lg font-extrabold text-slate-900">Front Desk — Checkout</h1>
            <p class="text-sm text-slate-500">Close stays, add extras, take payment, and checkout rooms.</p>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <VaCard class="soft-card !px-3 !py-2 rounded-2xl">
            <VaCardContent class="!p-0">
              <div class="flex items-center gap-2">
                <span class="material-icons text-[18px] text-slate-500">location_city</span>
                <div class="text-xs">
                  <div class="font-bold text-slate-900">{{ data.property.name }}</div>
                  <div class="text-slate-500">{{ data.property.city }} • {{ data.property.currency }}</div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <VaButton preset="secondary" class="font-bold rounded-2xl" icon="refresh" @click="refreshDemo">
            Refresh Demo
          </VaButton>
        </div>
      </div>

      <!-- Stats row -->
      <div class="mt-4 grid gap-3 md:grid-cols-4">
        <VaCard class="soft-card rounded-2xl">
          <VaCardContent>
            <div class="kpi-label">Ready</div>
            <div class="kpi-value">{{ stats.ready }}</div>
            <div class="kpi-sub">Can checkout now</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent>
            <div class="kpi-label">Late</div>
            <div class="kpi-value">{{ stats.late }}</div>
            <div class="kpi-sub">Past expected out</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent>
            <div class="kpi-label">Checked-out</div>
            <div class="kpi-value">{{ stats.checkedOut }}</div>
            <div class="kpi-sub">Today (demo)</div>
          </VaCardContent>
        </VaCard>

        <VaCard class="soft-card rounded-2xl">
          <VaCardContent>
            <div class="kpi-label">Balance Total</div>
            <div class="kpi-value">{{ money(stats.balanceTotal) }}</div>
            <div class="kpi-sub">Outstanding</div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Search & filters -->
      <VaCard class="soft-card rounded-2xl mt-4">
        <VaCardContent>
          <div class="grid gap-3 lg:grid-cols-5">
            <div class="lg:col-span-2">
              <VaInput v-model.trim="q" label="Search" placeholder="Booking #, guest, phone, room..." clearable>
                <template #prependInner>
                  <VaIcon name="search" color="secondary" />
                </template>
              </VaInput>
            </div>

            <div>
              <VaSelect
                v-model="sourceFilter"
                label="Source"
                :options="sourceOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />
            </div>

            <div>
              <VaSelect
                v-model="statusFilter"
                label="Status"
                :options="statusOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />
            </div>

            <div>
              <VaSelect
                v-model="paymentStatusFilter"
                label="Payment"
                :options="paymentOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div class="text-xs text-slate-600">
              Showing <b class="text-slate-900">{{ filtered.length }}</b> record(s)
            </div>

            <div class="flex gap-2">
              <VaButton preset="secondary" class="font-bold rounded-2xl" @click="resetFilters">Reset</VaButton>
              <VaButton color="primary" class="font-bold rounded-2xl" icon="download" @click="exportCsv">
                Export
              </VaButton>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Main layout -->
      <div class="mt-4 grid gap-4 lg:grid-cols-[1fr_420px]">
        <!-- List -->
        <div class="space-y-3">
          <VaCard
            v-for="row in paginated"
            :key="row.booking.booking_id"
            class="soft-card row-card rounded-2xl cursor-pointer"
            :class="selected?.booking?.booking_id === row.booking.booking_id ? 'row-card--active' : ''"
            @click="selectRow(row)"
          >
            <VaCardContent>
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="text-sm font-extrabold text-slate-900">{{ row.booking.booking_number }}</div>

                    <span class="chip chip-neutral">{{ pretty(row.booking.booking_source) }}</span>
                    <span class="chip" :class="checkoutPillClass(row.checkout.checkout_status)">
                      {{ pretty(row.checkout.checkout_status) }}
                    </span>
                    <span class="chip" :class="paymentPillClass(row.invoice)">
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
                        Expected out: <span class="font-bold">{{ fmt(row.checkout.expected_checkout) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="mt-3 flex flex-wrap gap-2">
                    <span v-for="r in row.reservations" :key="r.reservation_id" class="pill">
                      Room {{ r.room_number }} • {{ r.room_type.type_name }} •
                      {{ r.booking_type === "hourly" ? r.total_nights_or_hours + "h" : r.total_nights_or_hours + "n" }}
                    </span>
                  </div>
                </div>

                <div class="flex items-end justify-between gap-3 sm:flex-col sm:items-end">
                  <div class="text-right">
                    <div class="text-xs font-bold text-slate-500">Balance</div>
                    <div class="text-lg font-extrabold text-slate-900">{{ money(row.invoice.balance) }}</div>
                  </div>

                  <div class="flex gap-2">
                    <VaButton preset="secondary" class="font-bold rounded-2xl" @click.stop="selectRow(row)">View</VaButton>
                    <VaButton color="primary" class="font-bold rounded-2xl" @click.stop="selectRow(row); focusCheckout()">
                      Checkout
                    </VaButton>
                  </div>
                </div>
              </div>

              <div v-if="row.checkout.notes" class="mt-3 text-xs text-slate-600">
                Note: <span class="font-semibold text-slate-900">{{ row.checkout.notes }}</span>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Empty -->
          <VaCard v-if="filtered.length === 0" class="soft-card rounded-2xl">
            <VaCardContent class="text-center py-10">
              <div class="text-base font-extrabold text-slate-900">No records</div>
              <div class="mt-1 text-sm text-slate-600">Try another keyword or clear filters.</div>
              <VaButton preset="secondary" class="mt-4 font-bold rounded-2xl" @click="resetFilters">Reset</VaButton>
            </VaCardContent>
          </VaCard>

          <!-- Pagination -->
          <div v-if="filtered.length > 0" class="flex items-center justify-between px-1">
            <VaButton preset="secondary" class="font-bold rounded-2xl" :disabled="page.current === 1" @click="page.current--">
              Prev
            </VaButton>
            <div class="text-xs text-slate-600">
              Page <b class="text-slate-900">{{ page.current }}</b> of <b class="text-slate-900">{{ totalPages }}</b>
            </div>
            <VaButton preset="secondary" class="font-bold rounded-2xl" :disabled="page.current === totalPages" @click="page.current++">
              Next
            </VaButton>
          </div>
        </div>

        <!-- Drawer -->
        <div class="lg:sticky lg:top-[84px]">
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent>
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Checkout</div>
                  <div class="text-xs text-slate-500">Select a booking to finalize.</div>
                </div>
                <VaButton v-if="selected" preset="secondary" size="small" class="font-bold rounded-2xl" @click="clearSelected">
                  Clear
                </VaButton>
              </div>

              <div v-if="!selected" class="mt-4 soft-sub rounded-2xl p-4 text-sm text-slate-600">
                Pick a booking on the left to view details, add extras, and checkout.
              </div>

              <div v-else class="mt-4 space-y-4">
                <!-- Guest -->
                <VaCard class="soft-sub rounded-2xl">
                  <VaCardContent>
                    <div class="flex items-center justify-between">
                      <div class="text-xs font-extrabold text-slate-500">GUEST</div>
                      <VaButton preset="secondary" size="small" class="font-bold rounded-2xl" @click="drawerShowGuest = !drawerShowGuest">
                        {{ drawerShowGuest ? "Hide" : "Details" }}
                      </VaButton>
                    </div>

                    <div class="mt-2 text-base font-extrabold text-slate-900">{{ guestName(selected.guest) }}</div>
                    <div class="mt-1 text-sm text-slate-700">{{ selected.guest.phone }}</div>

                    <div v-if="drawerShowGuest" class="mt-3 grid gap-2 text-xs text-slate-600">
                      <div class="flex justify-between">
                        <span class="text-slate-400">Nationality</span>
                        <b class="text-slate-900">{{ selected.guest.nationality || "-" }}</b>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">ID Type</span>
                        <b class="text-slate-900">{{ pretty(selected.guest.id_type) }}</b>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">ID Number</span>
                        <b class="text-slate-900">{{ selected.guest.id_number || "-" }}</b>
                      </div>
                    </div>
                  </VaCardContent>
                </VaCard>

                <!-- Rooms -->
                <VaCard class="soft-sub rounded-2xl">
                  <VaCardContent>
                    <div class="flex items-center justify-between">
                      <div class="text-xs font-extrabold text-slate-500">ROOMS</div>
                      <div class="text-xs font-bold text-slate-600">{{ selected.reservations.length }} room(s)</div>
                    </div>

                    <div class="mt-3 space-y-3">
                      <VaCard v-for="r in selected.reservations" :key="r.reservation_id" class="soft-mini rounded-2xl">
                        <VaCardContent>
                          <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                              <div class="text-sm font-extrabold text-slate-900">Room {{ r.room_number }}</div>
                              <div class="mt-0.5 text-xs text-slate-600">
                                {{ r.room_type.type_name }} • {{ r.room_type.bed_count }} bed(s) • {{ pretty(r.booking_type) }} •
                                {{ r.booking_type === "hourly" ? r.total_nights_or_hours + "h" : r.total_nights_or_hours + "n" }}
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
                        </VaCardContent>
                      </VaCard>
                    </div>
                  </VaCardContent>
                </VaCard>

                <!-- Extras -->
                <VaCard class="soft-sub rounded-2xl">
                  <VaCardContent>
                    <div class="flex items-center justify-between">
                      <div class="text-xs font-extrabold text-slate-500">EXTRA CHARGES</div>
                      <VaButton preset="secondary" size="small" class="font-bold rounded-2xl" @click="addExtra">+ Add</VaButton>
                    </div>

                    <div v-if="draft.extras.length === 0" class="mt-3 text-sm text-slate-600">No extra charges.</div>

                    <div v-else class="mt-3 space-y-2">
                      <VaCard v-for="(x, idx) in draft.extras" :key="idx" class="soft-mini rounded-2xl">
                        <VaCardContent class="space-y-2">
                          <VaInput v-model="x.description" placeholder="Description (late checkout, laundry...)" />

                          <div class="grid grid-cols-3 gap-2">
                            <VaInput v-model.number="x.qty" type="number" min="1" placeholder="Qty" />
                            <VaInput v-model.number="x.unit_price" type="number" min="0" step="0.01" placeholder="Price" />
                            <VaButton preset="secondary" class="font-bold rounded-2xl" icon="close" @click="removeExtra(idx)">
                              Remove
                            </VaButton>
                          </div>

                          <div class="text-right text-xs font-bold text-slate-600">
                            Line total: <span class="text-slate-900">{{ money(extraLineTotal(x)) }}</span>
                          </div>
                        </VaCardContent>
                      </VaCard>
                    </div>
                  </VaCardContent>
                </VaCard>

                <!-- Totals -->
                <VaCard class="soft-sub rounded-2xl">
                  <VaCardContent>
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
                      <VaCard class="soft-mini rounded-2xl">
                        <VaCardContent>
                          <div class="text-xs font-bold text-slate-500">Paid</div>
                          <div class="mt-1 text-base font-extrabold text-slate-900">{{ money(paidAmount) }}</div>
                        </VaCardContent>
                      </VaCard>
                      <VaCard class="soft-mini rounded-2xl">
                        <VaCardContent>
                          <div class="text-xs font-bold text-slate-500">Balance</div>
                          <div class="mt-1 text-base font-extrabold text-slate-900">{{ money(balance) }}</div>
                        </VaCardContent>
                      </VaCard>
                    </div>
                  </VaCardContent>
                </VaCard>

                <!-- Payment -->
                <VaCard class="soft-sub rounded-2xl">
                  <VaCardContent>
                    <div class="flex items-center justify-between">
                      <div class="text-xs font-extrabold text-slate-500">PAYMENT</div>
                      <VaButton preset="secondary" size="small" class="font-bold rounded-2xl" @click="drawerShowPayment = !drawerShowPayment">
                        {{ drawerShowPayment ? "Hide" : "Details" }}
                      </VaButton>
                    </div>

                    <div class="mt-3 grid gap-2">
                      <VaSelect
                        v-model="draft.payment.method"
                        :options="paymentMethodsOptions"
                        :text-by="(o) => o.text"
                        :value-by="(o) => o.value"
                      />
                      <div class="grid grid-cols-2 gap-2">
                        <VaInput v-model.number="draft.payment.amount_paid" type="number" min="0" step="0.01" placeholder="Pay now" />
                        <VaInput v-model="draft.payment.reference_number" placeholder="Reference (optional)" />
                      </div>
                    </div>

                    <div v-if="drawerShowPayment" class="mt-3 text-xs text-slate-600 space-y-2">
                      <div class="flex justify-between">
                        <span class="text-slate-400">Current invoice</span>
                        <b class="text-slate-900">{{ invoicePillLabel(selected.invoice) }}</b>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-400">Method label</span>
                        <b class="text-slate-900">{{ paymentMethodLabel(draft.payment.method) }}</b>
                      </div>
                    </div>
                  </VaCardContent>
                </VaCard>

                <!-- Actions -->
                <div class="space-y-2">
                  <VaButton
                    ref="checkoutBtn"
                    color="primary"
                    size="large"
                    class="w-full rounded-2xl font-extrabold"
                    :disabled="!selected"
                    @click="checkoutNow"
                  >
                    Checkout
                  </VaButton>

                  <VaButton preset="secondary" size="large" class="w-full rounded-2xl font-extrabold" :disabled="!selected" @click="printPreview">
                    <VaIcon name="print" class="mr-1" />
                    Print Preview
                  </VaButton>

                  <VaButton preset="secondary" size="large" class="w-full rounded-2xl font-extrabold" :disabled="!selected" @click="resetDraft">
                    Reset Draft
                  </VaButton>
                </div>

                <div class="text-[11px] text-slate-500">
                  Demo UI only: later connect API to update invoices, payments, deposits, reservations, and room status.
                </div>
              </div>
            </VaCardContent>
          </VaCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue"
import { frontdeskCheckoutData as data } from "@/data/front/frontdeskCheckoutData"

const rows = ref(structuredClone ? structuredClone(data.checkoutList) : JSON.parse(JSON.stringify(data.checkoutList)))

const q = ref("")
const sourceFilter = ref("all")
const statusFilter = ref("all")
const paymentStatusFilter = ref("all")

const page = reactive({ current: 1, size: 6 })

const selected = ref(null)
const checkoutBtn = ref(null)

const draft = reactive({
  extras: [],
  payment: { method: "CASH_USD", amount_paid: 0, reference_number: "", status: "pending" },
  notes: "",
})

const drawerShowGuest = ref(false)
const drawerShowPayment = ref(false)

/* options */
const sourceOptions = computed(() => [{ text: "All", value: "all" }, ...data.bookingSources.map((s) => ({ text: pretty(s), value: s }))])
const statusOptions = computed(() => [{ text: "All", value: "all" }, ...data.checkoutStatuses.map((s) => ({ text: pretty(s), value: s }))])
const paymentOptions = computed(() => [{ text: "All", value: "all" }, ...data.paymentStatuses.map((s) => ({ text: pretty(s), value: s }))])
const paymentMethodsOptions = computed(() => data.paymentMethods.map((m) => ({ text: m.label, value: m.method_code })))

/* computed */
const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (sourceFilter.value !== "all" && row.booking.booking_source !== sourceFilter.value) return false
    if (statusFilter.value !== "all" && row.checkout.checkout_status !== statusFilter.value) return false

    const payStatus = row.payment?.status || (Number(row.invoice.balance || 0) > 0 ? "pending" : "completed")
    if (paymentStatusFilter.value !== "all" && payStatus !== paymentStatusFilter.value) return false

    if (!keyword) return true

    const guest = guestName(row.guest).toLowerCase()
    const phone = String(row.guest.phone || "").toLowerCase()
    const bookingNo = String(row.booking.booking_number || "").toLowerCase()
    const roomsText = row.reservations.map((r) => String(r.room_number)).join(" ").toLowerCase()
    return guest.includes(keyword) || phone.includes(keyword) || bookingNo.includes(keyword) || roomsText.includes(keyword)
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

const roomSubtotal = computed(() =>
  !selected.value ? 0 : selected.value.reservations.reduce((a, r) => a + Number(r.total_room_charges || 0), 0)
)
const extrasTotal = computed(() => draft.extras.reduce((a, x) => a + extraLineTotal(x), 0))
const taxAmount = computed(() => {
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

/* helpers */
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
  if (st === "ready") return "chip-good"
  if (st === "late") return "chip-warn"
  if (st === "checked_out") return "chip-neutral"
  return "chip-neutral"
}
function paymentPillClass(inv) {
  if (!inv) return "chip-neutral"
  if (Number(inv.balance || 0) <= 0) return "chip-good"
  if (Number(inv.paid_amount || 0) > 0) return "chip-warn"
  return "chip-bad"
}
function invoicePillLabel(inv) {
  if (!inv) return "No Invoice"
  if (Number(inv.balance || 0) <= 0) return "Paid"
  if (Number(inv.paid_amount || 0) > 0) return "Partial"
  return "Pending"
}
function extraLineTotal(x) {
  return Number(x.qty || 0) * Number(x.unit_price || 0)
}
function paymentMethodLabel(code) {
  return data.paymentMethods.find((m) => m.method_code === code)?.label || "-"
}

/* actions */
function resetFilters() {
  q.value = ""
  sourceFilter.value = "all"
  statusFilter.value = "all"
  paymentStatusFilter.value = "all"
}
function selectRow(row) {
  selected.value = row
  resetDraft()
  drawerShowGuest.value = false
  drawerShowPayment.value = false
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
  draft.extras.push({ item_type: "other", description: "", qty: 1, unit_price: 0 })
}
function removeExtra(i) {
  draft.extras.splice(i, 1)
}
function focusCheckout() {
  requestAnimationFrame(() => {
    const el = checkoutBtn.value?.$el || checkoutBtn.value
    el?.scrollIntoView?.({ behavior: "smooth", block: "start" })
  })
}
function checkoutNow() {
  if (!selected.value) return

  const inv = selected.value.invoice
  inv.total_amount = grandTotal.value
  inv.subtotal = roomSubtotal.value + extrasTotal.value
  inv.tax_amount = taxAmount.value

  inv.paid_amount = Math.min(grandTotal.value, paidAmount.value)
  inv.balance = Math.max(0, grandTotal.value - inv.paid_amount)
  inv.status = inv.balance <= 0 ? "paid" : inv.paid_amount > 0 ? "partial" : "issued"

  selected.value.payment = {
    payment_id: selected.value.payment?.payment_id || null,
    payment_method:
      draft.payment.method === "ABA_KHQR"
        ? "aba_khqr"
        : draft.payment.method === "CASH_KHR"
          ? "cash_khr"
          : "cash_usd",
    payment_method_label: paymentMethodLabel(draft.payment.method),
    status: inv.balance <= 0 ? "completed" : inv.paid_amount > 0 ? "partial" : "pending",
    reference_number: draft.payment.reference_number || "",
  }

  selected.value.checkout.checkout_status = "checked_out"
  selected.value.checkout.actual_checkout = new Date().toISOString()

  alert("Demo: Checked out successfully.")
}
function printPreview() {
  alert("Print preview (demo).")
}
function exportCsv() {
  alert("Demo: export " + filtered.value.length + " rows.")
}
function refreshDemo() {
  rows.value = structuredClone ? structuredClone(data.checkoutList) : JSON.parse(JSON.stringify(data.checkoutList))
  clearSelected()
}

watch([q, sourceFilter, statusFilter, paymentStatusFilter], () => {
  page.current = 1
})
</script>

<style scoped>
.material-icons {
  font-size: 20px;
  vertical-align: middle;
}

/* ===== Soft shadow system (same vibe as Monthly Report) ===== */
.soft-card {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  border-radius: 14px !important;
  background: #fff !important;
}
.soft-sub {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  border-radius: 14px !important;
  background: rgba(2, 8, 23, 0.02) !important;
}
.soft-mini {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  border-radius: 14px !important;
  background: #fff !important;
}

/* Row active */
.row-card--active {
  background: #f3f8ff !important;
}

/* chips */
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

/* room pills */
.pill {
  border-radius: 999px;
  background: rgba(2, 8, 23, 0.04);
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 800;
  color: #0f172a;
}

/* KPIs */
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

/* Make Vuestic inputs feel cleaner inside cards */
:deep(.va-input__container),
:deep(.va-select__container) {
  border-radius: 14px;
}
</style>
