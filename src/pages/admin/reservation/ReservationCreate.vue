<!-- src/pages/admin/reservations/ReservationCreate.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 p-4 sm:p-6">
    <div class="mx-auto w-fullspace-y-5">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <VaIcon name="add_business" color="secondary" />
            <h1 class="truncate text-xl font-extrabold text-slate-900">Create Reservation</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Walk-in / phone / other • Hourly (3h/4h/6h) or Nightly (1+ nights) • Select multiple rooms.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="resetAll">
            <VaIcon name="refresh" class="mr-1" />
            Reset
          </VaButton>

          <VaButton color="primary" class="rounded-2xl font-extrabold" :disabled="!canSubmit" @click="submit">
            <VaIcon name="save" class="mr-1" />
            Save
          </VaButton>
        </div>
      </div>

      <!-- Main -->
      <div class="grid gap-4 lg:grid-cols-12">
        <!-- Left -->
        <div class="lg:col-span-8 space-y-4">
          <!-- Booking info -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Booking Info</div>
                  <div class="text-xs text-slate-500">Basic details (source/type/dates).</div>
                </div>

                <VaChip size="small" class="rounded-full font-extrabold" outline color="secondary">
                  {{ data.property.property_code }} • {{ data.property.city }}
                </VaChip>
              </div>

              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <VaSelect
                  v-model="draft.booking_source"
                  label="Booking Source"
                  :options="bookingSourceOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                />

                <VaSelect
                  v-model="draft.booking_type"
                  label="Booking Type"
                  :options="bookingTypeOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                />

                <!-- Hourly -->
                <div v-if="draft.booking_type === 'hourly'" class="sm:col-span-2">
                  <div class="text-xs font-bold text-slate-500">Hours</div>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <VaChip
                      v-for="p in data.hourlyPresets"
                      :key="p.hours"
                      size="small"
                      class="cursor-pointer select-none rounded-full font-extrabold"
                      :outline="draft.hours !== p.hours"
                      :color="draft.hours === p.hours ? 'primary' : 'secondary'"
                      @click="draft.hours = p.hours"
                    >
                      {{ p.label }}
                    </VaChip>
                  </div>
                </div>

                <div v-if="draft.booking_type === 'hourly'" class="sm:col-span-2">
                  <div class="text-xs font-bold text-slate-500">Check-in / Check-out</div>
                  <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <VaInput v-model="draft.check_in_at" type="datetime-local" label="Check-in" />
                    <VaInput v-model="draft.check_out_at" type="datetime-local" label="Check-out" />
                  </div>
                  <div class="mt-1 text-[11px] text-slate-500">Tip: check-out auto updates when you change hours.</div>
                </div>

                <!-- Nightly -->
                <div v-else class="sm:col-span-2">
                  <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <VaInput v-model="draft.check_in_date" type="date" label="Check-in Date" />
                    <VaInput v-model="draft.check_out_date" type="date" label="Check-out Date" />
                  </div>
                  <div class="mt-1 text-[11px] text-slate-500">Nights auto updates selected room qty.</div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Guest -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Guest</div>
                  <div class="text-xs text-slate-500">Search existing guest or create new.</div>
                </div>

                <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="toggleNewGuest">
                  <VaIcon :name="showNewGuest ? 'person_search' : 'person_add'" class="mr-1" />
                  {{ showNewGuest ? "Pick Existing" : "Create New" }}
                </VaButton>
              </div>

              <!-- Existing guest -->
              <div v-if="!showNewGuest" class="mt-3">
                <VaInput v-model.trim="guestQ" placeholder="Search name / phone..." clearable>
                  <template #prependInner>
                    <VaIcon name="search" color="secondary" size="18px" />
                  </template>
                </VaInput>

                <div class="mt-3 grid gap-2 sm:grid-cols-2">
                  <VaCard
                    v-for="g in filteredGuests"
                    :key="g.guest_id"
                    class="soft-mini rounded-2xl cursor-pointer"
                    @click="selectGuest(g)"
                  >
                    <VaCardContent class="p-4">
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <div class="truncate text-sm font-extrabold text-slate-900">{{ g.name }}</div>
                          <div class="mt-1 text-xs text-slate-500">{{ g.phone }} • {{ g.nationality }}</div>
                        </div>
                        <span v-if="g.guest_type === 'vip'" class="chip chip-warn">VIP</span>
                      </div>
                    </VaCardContent>
                  </VaCard>

                  <div v-if="filteredGuests.length === 0" class="soft-mini rounded-2xl p-4 text-sm text-slate-600">
                    No guest found. Click <b>Create New</b>.
                  </div>
                </div>

                <VaCard v-if="draft.guest" class="soft-mini mt-3 rounded-2xl">
                  <VaCardContent class="p-4">
                    <div class="text-xs font-bold text-slate-500">Selected Guest</div>
                    <div class="mt-1 text-sm font-extrabold text-slate-900">{{ draft.guest.name }}</div>
                    <div class="mt-1 text-xs text-slate-600">
                      {{ draft.guest.phone }} • {{ pretty(draft.guest.id_type) }} {{ draft.guest.id_number || "-" }}
                    </div>
                  </VaCardContent>
                </VaCard>
              </div>

              <!-- New guest -->
              <div v-else class="mt-3 grid gap-3 sm:grid-cols-2">
                <VaInput v-model.trim="newGuest.first_name" label="First Name" placeholder="First name" />
                <VaInput v-model.trim="newGuest.last_name" label="Last Name" placeholder="Last name" />
                <VaInput v-model.trim="newGuest.phone" label="Phone" placeholder="012 345 678" />
                <VaInput v-model.trim="newGuest.nationality" label="Nationality" placeholder="Cambodian" />

                <VaSelect
                  v-model="newGuest.id_type"
                  label="ID Type"
                  :options="idTypeOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                />
                <VaInput v-model.trim="newGuest.id_number" label="ID Number" placeholder="0123456789" />

                <div class="sm:col-span-2">
                  <VaButton
                    color="primary"
                    class="w-full rounded-2xl font-extrabold"
                    :disabled="!canCreateGuest"
                    @click="createGuestLocal"
                  >
                    Create Guest (Local)
                  </VaButton>
                  <div class="mt-2 text-[11px] text-slate-500">Demo only: creates guest in local static list (no API yet).</div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Rooms -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Select Rooms</div>
                  <div class="text-xs text-slate-500">Choose available rooms. Multiple rooms allowed.</div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <VaSelect
                    v-model="roomStatusFilter"
                    :options="roomStatusOptions"
                    :text-by="(o) => o.text"
                    :value-by="(o) => o.value"
                    class="min-w-[150px]"
                  />
                  <VaSelect
                    v-model="typeGroupFilter"
                    :options="typeGroupOptions"
                    :text-by="(o) => o.text"
                    :value-by="(o) => o.value"
                    class="min-w-[150px]"
                  />
                  <VaSelect
                    v-model="bedsFilter"
                    :options="bedsOptions"
                    :text-by="(o) => o.text"
                    :value-by="(o) => o.value"
                    class="min-w-[150px]"
                  />
                </div>
              </div>

              <div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <VaCard
                  v-for="r in filteredRooms"
                  :key="r.room_id"
                  class="soft-mini rounded-2xl cursor-pointer"
                  :class="roomStatusFilter === 'available' && r.status !== 'available' ? 'opacity-40 pointer-events-none' : ''"
                  @click="addRoom(r)"
                >
                  <VaCardContent class="p-4">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <div class="text-sm font-extrabold text-slate-900">Room {{ r.room_number }}</div>
                        <div class="mt-1 text-xs text-slate-500">Floor {{ r.floor }} • {{ typeLabel(r.room_type_id) }}</div>
                      </div>
                      <span class="chip" :class="roomStatusChipClass(r.status)">{{ pretty(r.status) }}</span>
                    </div>

                    <div class="mt-3 text-xs text-slate-600">{{ priceLabel(r.room_type_id) }}</div>
                  </VaCardContent>
                </VaCard>
              </div>

              <!-- Selected rooms -->
              <VaCard v-if="draft.selectedRooms.length" class="soft-mini mt-4 rounded-2xl">
                <VaCardContent class="p-4">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-extrabold text-slate-900">Selected Rooms</div>
                    <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="draft.selectedRooms = []">
                      Clear
                    </VaButton>
                  </div>

                  <div class="mt-3 space-y-2">
                    <div v-for="(x, idx) in draft.selectedRooms" :key="x.room_id" class="soft-sub rounded-2xl p-4">
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <div class="text-sm font-extrabold text-slate-900">
                            Room {{ x.room_number }} • {{ x.type_group }} • {{ x.beds }} bed
                          </div>
                          <div class="mt-1 text-xs text-slate-500">
                            Unit price: {{ money(x.unit_price) }} • Qty: {{ x.qty }}{{ unitSuffix }}
                          </div>
                        </div>

                        <div class="text-right">
                          <div class="text-xs font-bold text-slate-500">Line Total</div>
                          <div class="mt-1 text-sm font-extrabold text-slate-900">{{ money(x.total) }}</div>
                        </div>
                      </div>

                      <div class="mt-3 flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                          <VaButton
                            preset="secondary"
                            size="small"
                            class="rounded-2xl font-extrabold"
                            :disabled="draft.booking_type === 'hourly'"
                            @click="decQty(idx)"
                          >
                            -
                          </VaButton>
                          <div class="min-w-[44px] text-center text-sm font-extrabold text-slate-900">
                            {{ x.qty }}
                          </div>
                          <VaButton
                            preset="secondary"
                            size="small"
                            class="rounded-2xl font-extrabold"
                            :disabled="draft.booking_type === 'hourly'"
                            @click="incQty(idx)"
                          >
                            +
                          </VaButton>
                        </div>

                        <VaButton preset="secondary" color="danger" size="small" class="rounded-2xl font-extrabold" @click="removeRoom(idx)">
                          Remove
                        </VaButton>
                      </div>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>
            </VaCardContent>
          </VaCard>

          <!-- Notes -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4">
              <div class="text-sm font-extrabold text-slate-900">Notes</div>
              <VaTextarea v-model.trim="draft.notes" class="mt-2" :min-rows="3" placeholder="Special requests, late arrival, etc..." />
            </VaCardContent>
          </VaCard>
        </div>

        <!-- Right -->
        <div class="lg:col-span-4">
          <VaCard class="soft-card rounded-2xl lg:sticky lg:top-4">
            <VaCardContent class="p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Summary</div>
                  <div class="text-xs text-slate-500">Totals (demo calculation).</div>
                </div>
                <VaChip size="small" class="rounded-full font-extrabold" outline color="secondary">
                  {{ data.property.currency }}
                </VaChip>
              </div>

              <div class="mt-4 space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Rooms subtotal</span>
                  <span class="font-extrabold text-slate-900">{{ money(subtotal) }}</span>
                </div>

                <div class="flex items-center justify-between gap-2">
                  <span class="text-slate-600">Discount</span>
                  <VaInput v-model.number="draft.pricing.discount" type="number" class="w-28" />
                </div>

                <div class="flex items-center justify-between gap-2">
                  <span class="text-slate-600">Extra</span>
                  <VaInput v-model.number="draft.pricing.extra" type="number" class="w-28" />
                </div>

                <div class="flex items-center justify-between gap-2">
                  <span class="text-slate-600">Tax %</span>
                  <VaInput v-model.number="draft.pricing.tax_rate" type="number" class="w-28" />
                </div>

                <div class="flex justify-between">
                  <span class="text-slate-600">Tax amount</span>
                  <span class="font-extrabold text-slate-900">{{ money(taxAmount) }}</span>
                </div>

                <div class="flex justify-between pt-2 text-base">
                  <span class="font-extrabold text-slate-900">Grand total</span>
                  <span class="font-extrabold text-slate-900">{{ money(grandTotal) }}</span>
                </div>
              </div>

              <VaCard class="soft-mini mt-4 rounded-2xl">
                <VaCardContent class="p-4">
                  <div class="flex items-center justify-between">
                    <div class="text-xs font-bold text-slate-500">Deposit</div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-extrabold text-slate-900">Enabled</span>
                      <VaSwitch v-model="draft.deposit.enabled" size="small" />
                    </div>
                  </div>

                  <div class="mt-3 grid grid-cols-2 gap-2">
                    <VaInput v-model.number="draft.deposit.amount" type="number" label="Amount" :disabled="!draft.deposit.enabled" />
                    <VaSelect
                      v-model="draft.deposit.paid"
                      label="Paid?"
                      :disabled="!draft.deposit.enabled"
                      :options="depositPaidOptions"
                      :text-by="(o) => o.text"
                      :value-by="(o) => o.value"
                    />
                  </div>
                </VaCardContent>
              </VaCard>

              <div class="mt-4">
                <div class="text-xs font-bold text-slate-500">Payment</div>
                <div class="mt-2 grid gap-2">
                  <VaSelect
                    v-model="draft.payment.method"
                    label="Method"
                    :options="paymentMethodOptions"
                    :text-by="(o) => o.text"
                    :value-by="(o) => o.value"
                  />
                  <VaInput v-model.number="draft.payment.amount_paid" type="number" label="Amount paid now" />
                  <VaInput v-model.trim="draft.payment.reference" label="Reference" placeholder="KHQR / receipt #" />
                </div>

                <div class="soft-sub mt-3 rounded-2xl p-4 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-600">Paid now</span>
                    <span class="font-extrabold text-slate-900">{{ money(draft.payment.amount_paid) }}</span>
                  </div>
                  <div class="mt-1 flex justify-between">
                    <span class="text-slate-600">Balance</span>
                    <span class="font-extrabold" :class="balance > 0 ? 'text-rose-600' : 'text-emerald-600'">
                      {{ money(balance) }}
                    </span>
                  </div>
                </div>

                <div class="mt-3 grid grid-cols-2 gap-2">
                  <VaButton preset="secondary" class="rounded-2xl font-extrabold" :disabled="!canSubmit" @click="printPreview">
                    <VaIcon name="print" class="mr-1" />
                    Preview
                  </VaButton>
                  <VaButton color="primary" class="rounded-2xl font-extrabold" :disabled="!canSubmit" @click="submit">
                    Save
                  </VaButton>
                </div>

                <div class="mt-2 text-[11px] text-slate-500">
                  Demo: no API yet. Later insert into <b>bookings</b>, <b>reservations</b>, <b>invoices</b>, <b>payments</b>.
                </div>
              </div>
            </VaCardContent>
          </VaCard>
        </div>
      </div>

      <!-- Toast -->
      <div
        v-if="toast"
        class="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-white"
      >
        <div class="flex items-start gap-2">
          <VaIcon name="info" size="18px" />
          <div class="text-sm font-bold">{{ toast }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { reservationsCreateData } from "@/data/reservation/reservationsCreateData"

const data = reservationsCreateData

// toast
const toast = ref("")
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ""), 2200)
}

// guest
const guestQ = ref("")
const showNewGuest = ref(false)

// normalize guests -> g.name
const guestsLocal = ref(
  (data.guests || []).map((g) => ({
    ...g,
    name: g.name || `${g.first_name || ""} ${g.last_name || ""}`.trim(),
  }))
)

const newGuest = reactive({
  first_name: "",
  last_name: "",
  phone: "",
  nationality: "Cambodian",
  id_type: "national_id",
  id_number: "",
})

const filteredGuests = computed(() => {
  const k = guestQ.value.trim().toLowerCase()
  if (!k) return guestsLocal.value
  return guestsLocal.value.filter((g) => `${g.name} ${g.phone}`.toLowerCase().includes(k))
})

function toggleNewGuest() {
  showNewGuest.value = !showNewGuest.value
}

const canCreateGuest = computed(() => !!newGuest.first_name && !!newGuest.last_name && !!newGuest.phone)

function createGuestLocal() {
  if (!canCreateGuest.value) return

  const maxId = guestsLocal.value.length ? Math.max(...guestsLocal.value.map((x) => Number(x.guest_id || 0))) : 100
  const id = maxId + 1

  const g = {
    guest_id: id,
    guest_number: `G2026${String(id).padStart(4, "0")}`,
    first_name: newGuest.first_name,
    last_name: newGuest.last_name,
    name: `${newGuest.first_name} ${newGuest.last_name}`.trim(),
    phone: newGuest.phone,
    email: "",
    nationality: newGuest.nationality || "Cambodian",
    id_type: newGuest.id_type,
    id_number: newGuest.id_number,
    guest_type: "individual",
    notes: "",
    is_blacklisted: false,
    last_stay_date: null,
  }

  guestsLocal.value.unshift(g)
  selectGuest(g)
  showNewGuest.value = false
  showToast("Guest created (local).")
}

function selectGuest(g) {
  draft.guest = g
  showToast(`Selected: ${g.name}`)
}

// room filters
const roomStatusFilter = ref("available")
const typeGroupFilter = ref("all")
const bedsFilter = ref("all")

// draft
const draft = reactive({
  booking_source: "walk_in",
  booking_type: "hourly",
  hours: 3,

  check_in_at: "2026-01-23T18:00",
  check_out_at: "2026-01-23T21:00",

  check_in_date: "2026-01-23",
  check_out_date: "2026-01-24",

  guest: null,

  selectedRooms: [],
  pricing: { discount: 0, extra: 0, tax_rate: 0 },

  deposit: { enabled: true, amount: 10, paid: false },

  payment: { method: "ABA KHQR", amount_paid: 0, reference: "" },

  notes: "",
})

// hourly auto checkout + sync qty
watch(
  () => [draft.booking_type, draft.hours, draft.check_in_at],
  () => {
    if (draft.booking_type !== "hourly") return
    if (!draft.check_in_at) return

    const d = new Date(draft.check_in_at)
    if (Number.isNaN(d.getTime())) return
    d.setHours(d.getHours() + Number(draft.hours || 0))
    draft.check_out_at = toDatetimeLocal(d)

    draft.selectedRooms = draft.selectedRooms.map((x) => {
      const qty = Number(draft.hours || 0) || 1
      return { ...x, qty, total: qty * Number(x.unit_price || 0) }
    })
  }
)

// nightly sync qty from date range
watch(
  () => [draft.booking_type, draft.check_in_date, draft.check_out_date],
  () => {
    if (draft.booking_type !== "nightly") return
    const nights = calcNights(draft.check_in_date, draft.check_out_date)
    draft.selectedRooms = draft.selectedRooms.map((x) => ({
      ...x,
      qty: nights,
      total: nights * Number(x.unit_price || 0),
    }))
  }
)

// rooms list
const filteredRooms = computed(() => {
  return (data.rooms || [])
    .filter((r) => {
      if (roomStatusFilter.value === "available" && r.status !== "available") return false

      const rt = (data.roomTypes || []).find((t) => t.room_type_id === r.room_type_id)
      const group = rt?.type_name || "-"
      const beds = Number(rt?.bed_count || 0)

      if (typeGroupFilter.value !== "all" && group !== typeGroupFilter.value) return false
      if (bedsFilter.value !== "all" && beds !== Number(bedsFilter.value)) return false
      return true
    })
    .slice(0, 18)
})

function typeLabel(room_type_id) {
  const rt = (data.roomTypes || []).find((t) => t.room_type_id === room_type_id)
  if (!rt) return "-"
  return `${rt.type_name} • ${rt.bed_count} bed • max ${rt.max_occupancy}`
}

function priceLabel(room_type_id) {
  const rt = (data.roomTypes || []).find((t) => t.room_type_id === room_type_id)
  if (!rt) return "-"
  const p = draft.booking_type === "hourly" ? rt.base_price_hourly : rt.base_price_nightly
  return draft.booking_type === "hourly" ? `Hourly: ${money(p)} / hour` : `Nightly: ${money(p)} / night`
}

function addRoom(room) {
  const rt = (data.roomTypes || []).find((t) => t.room_type_id === room.room_type_id)
  if (!rt) return

  if (draft.selectedRooms.some((x) => x.room_id === room.room_id)) return showToast("Room already selected.")

  const unit_price = draft.booking_type === "hourly" ? rt.base_price_hourly : rt.base_price_nightly
  const qty =
    draft.booking_type === "hourly"
      ? Number(draft.hours || 0) || 1
      : calcNights(draft.check_in_date, draft.check_out_date)

  draft.selectedRooms.push({
    room_id: room.room_id,
    room_number: room.room_number,
    room_type_id: rt.room_type_id,
    type_group: rt.type_name,
    beds: rt.bed_count,
    unit_price,
    qty,
    total: qty * Number(unit_price || 0),
  })

  showToast(`Added room ${room.room_number}`)
}

function incQty(i) {
  if (draft.booking_type === "hourly") return
  draft.selectedRooms[i].qty += 1
  draft.selectedRooms[i].total = draft.selectedRooms[i].qty * Number(draft.selectedRooms[i].unit_price || 0)
}
function decQty(i) {
  if (draft.booking_type === "hourly") return
  draft.selectedRooms[i].qty = Math.max(1, draft.selectedRooms[i].qty - 1)
  draft.selectedRooms[i].total = draft.selectedRooms[i].qty * Number(draft.selectedRooms[i].unit_price || 0)
}
function removeRoom(i) {
  draft.selectedRooms.splice(i, 1)
}

const unitSuffix = computed(() => (draft.booking_type === "hourly" ? "h" : "n"))
const subtotal = computed(() => draft.selectedRooms.reduce((sum, x) => sum + Number(x.total || 0), 0))

const taxAmount = computed(() => {
  const base = Math.max(0, subtotal.value - Number(draft.pricing.discount || 0) + Number(draft.pricing.extra || 0))
  return (base * Number(draft.pricing.tax_rate || 0)) / 100
})

const grandTotal = computed(() => {
  const base = subtotal.value - Number(draft.pricing.discount || 0) + Number(draft.pricing.extra || 0)
  return Math.max(0, base + taxAmount.value)
})

const balance = computed(() => Math.max(0, grandTotal.value - Number(draft.payment.amount_paid || 0)))

const canSubmit = computed(() => {
  if (!draft.guest) return false
  if (!draft.selectedRooms.length) return false
  if (draft.booking_type === "hourly") return !!draft.check_in_at && !!draft.check_out_at
  return !!draft.check_in_date && !!draft.check_out_date && calcNights(draft.check_in_date, draft.check_out_date) >= 1
})

function resetAll() {
  guestQ.value = ""
  showNewGuest.value = false
  Object.assign(newGuest, { first_name: "", last_name: "", phone: "", nationality: "Cambodian", id_type: "national_id", id_number: "" })

  Object.assign(draft, {
    booking_source: "walk_in",
    booking_type: "hourly",
    hours: 3,
    check_in_at: "2026-01-23T18:00",
    check_out_at: "2026-01-23T21:00",
    check_in_date: "2026-01-23",
    check_out_date: "2026-01-24",
    guest: null,
    selectedRooms: [],
    pricing: { discount: 0, extra: 0, tax_rate: 0 },
    deposit: { enabled: true, amount: 10, paid: false },
    payment: { method: "ABA KHQR", amount_paid: 0, reference: "" },
    notes: "",
  })

  roomStatusFilter.value = "available"
  typeGroupFilter.value = "all"
  bedsFilter.value = "all"
  showToast("Reset done.")
}

function submit() {
  if (!canSubmit.value) return
  console.log("SUBMIT DRAFT:", JSON.parse(JSON.stringify(draft)))
  showToast("Saved (demo). Connect API later.")
}

function printPreview() {
  if (!canSubmit.value) return showToast("Select guest + rooms first.")

  const guest = draft.guest?.name || "-"
  const lines = (draft.selectedRooms || [])
    .map((x) => {
      const unit = draft.booking_type === "hourly" ? "h" : "n"
      return `Room ${x.room_number} • ${x.type_group} ${x.beds} bed • ${x.qty}${unit} • ${money(x.total)}`
    })
    .join("<br/>")

  const w = window.open("", "_blank")
  if (!w) return alert("Popup blocked. Please allow popups for print preview.")

  w.document.open()
  w.document.write(`
    <!doctype html>
    <html>
      <head><meta charset="utf-8"/><title>Reservation Preview</title></head>
      <body style="font-family: ui-sans-serif, system-ui; padding: 18px;">
        <h2 style="margin:0;">${data?.property?.property_name || "Guesthouse"}</h2>
        <div style="color:#555; margin-top:6px;">Reservation Preview</div>
        <hr/>
        <div><b>Guest:</b> ${guest}</div>
        <div style="margin-top:6px;"><b>Stay:</b> ${draft.booking_type === "hourly" ? `${draft.hours} hour(s)` : `${calcNights(draft.check_in_date, draft.check_out_date)} night(s)`}</div>
        <div style="margin-top:12px;"><b>Rooms</b></div>
        <div style="margin-top:6px;">${lines || "-"}</div>
        <hr/>
        <div style="text-align:right;">
          <div>Subtotal: ${money(subtotal.value)}</div>
          <div>Tax: ${money(taxAmount.value)}</div>
          <div style="font-size:18px;"><b>Total: ${money(grandTotal.value)}</b></div>
          <div style="margin-top:6px;">Paid: ${money(draft.payment.amount_paid)}</div>
          <div><b>Balance: ${money(balance.value)}</b></div>
        </div>
      </body>
    </html>
  `)
  w.document.close()
  w.onload = () => {
    w.focus()
    w.print()
  }
}

/* helpers */
function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}
function money(v) {
  const n = Number(v || 0)
  return `$${n.toFixed(2)}`
}
function calcNights(inDate, outDate) {
  if (!inDate || !outDate) return 1
  const a = new Date(`${inDate}T00:00:00`)
  const b = new Date(`${outDate}T00:00:00`)
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff || 1)
}
function toDatetimeLocal(d) {
  const pad = (n) => String(n).padStart(2, "0")
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

/* status chip style for rooms */
function roomStatusChipClass(s) {
  if (s === "available") return "chip-good"
  if (s === "occupied") return "chip-info"
  if (s === "blocked") return "chip-warn"
  if (s === "cleaning") return "chip-neutral"
  if (s === "maintenance") return "chip-bad"
  return "chip-neutral"
}

/* options */
const bookingSourceOptions = computed(() => (data.bookingSources || []).map((x) => ({ text: pretty(x), value: x })))
const bookingTypeOptions = computed(() => (data.bookingTypes || []).map((x) => ({ text: pretty(x), value: x })))

const idTypeOptions = [
  { text: "National ID", value: "national_id" },
  { text: "Passport", value: "passport" },
  { text: "Driving License", value: "driving_license" },
  { text: "Other", value: "other" },
]

const roomStatusOptions = [
  { text: "Available", value: "available" },
  { text: "All", value: "all" },
]
const typeGroupOptions = [
  { text: "All Types", value: "all" },
  { text: "Simple", value: "Simple" },
  { text: "VIP", value: "VIP" },
]
const bedsOptions = [
  { text: "All Beds", value: "all" },
  { text: "1 bed", value: 1 },
  { text: "2 beds", value: 2 },
]

const paymentMethodOptions = computed(() => (data.paymentMethods || []).map((m) => ({ text: m.label, value: m.label })))

const depositPaidOptions = [
  { text: "No", value: false },
  { text: "Yes", value: true },
]
</script>

<style scoped>
/* ===== Follow your Room Status Board style (NO BORDER) ===== */
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

/* small chips */
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

/* If Vuestic adds border/shadow somewhere */
:deep(.va-card) {
  box-shadow: none;
  border: none;
}
</style>
