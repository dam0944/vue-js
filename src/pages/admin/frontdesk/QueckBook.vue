<!-- src/pages/frontdesk/QuickBook.vue -->
<template>
  <div class="qb-page">
    <div class="mx-auto">
      <!-- Top -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div class="flex items-center gap-2">
            <VaIcon name="flash_on" color="secondary" />
            <h1 class="text-xl font-bold text-slate-900">Front Desk • Quick Booking</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Walk-in / Phone / Other • Hourly or Nightly • Select multiple rooms • ABA KHQR / Cash
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="saveDraft">
            <VaIcon name="save" class="mr-1" />
            Save Draft
          </VaButton>

          <VaButton
            color="primary"
            class="rounded-2xl font-extrabold"
            :disabled="selectedRooms.length === 0"
            @click="confirmBooking"
          >
            <VaIcon name="check_circle" class="mr-1" />
            Confirm
          </VaButton>
        </div>
      </div>

      <!-- Main grid -->
      <div class="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        <!-- Left -->
        <div class="space-y-6">
          <!-- Booking info -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4 sm:p-5">
              <div class="flex items-center justify-between">
                <div class="text-sm font-extrabold text-slate-900">Booking Info</div>
                <div class="text-xs text-slate-500">
                  {{ data.property.name }} • {{ data.property.city }}
                </div>
              </div>

              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <!-- Booking source -->
                <div>
                  <div class="mb-2 text-xs font-bold text-slate-500">Booking source</div>
                  <div class="flex flex-wrap gap-2">
                    <VaChip
                      v-for="s in data.bookingSources"
                      :key="s.value"
                      class="cursor-pointer qb-chip"
                      :outline="draft.booking_source !== s.value"
                      :color="draft.booking_source === s.value ? 'primary' : 'secondary'"
                      @click="draft.booking_source = s.value"
                    >
                      {{ s.label }}
                    </VaChip>
                  </div>
                </div>

                <!-- Stay type -->
                <div>
                  <div class="mb-2 text-xs font-bold text-slate-500">Stay type</div>
                  <div class="grid grid-cols-2 gap-2">
                    <VaButton
                      :color="draft.booking_type === 'hourly' ? 'primary' : undefined"
                      :preset="draft.booking_type === 'hourly' ? 'primary' : 'secondary'"
                      class="rounded-2xl font-extrabold"
                      @click="setBookingType('hourly')"
                    >
                      Hourly
                    </VaButton>
                    <VaButton
                      :color="draft.booking_type === 'nightly' ? 'primary' : undefined"
                      :preset="draft.booking_type === 'nightly' ? 'primary' : 'secondary'"
                      class="rounded-2xl font-extrabold"
                      @click="setBookingType('nightly')"
                    >
                      Nightly
                    </VaButton>
                  </div>
                </div>
              </div>

              <!-- Hourly / Nightly controls -->
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <!-- Hourly -->
                <div v-if="draft.booking_type === 'hourly'">
                  <div class="mb-2 text-xs font-bold text-slate-500">Hourly preset</div>
                  <div class="flex flex-wrap gap-2">
                    <VaChip
                      v-for="h in data.hourlyPresets"
                      :key="h.hours"
                      class="cursor-pointer qb-chip"
                      :outline="draft.hours !== h.hours"
                      :color="draft.hours === h.hours ? 'primary' : 'secondary'"
                      @click="setHours(h.hours)"
                    >
                      {{ h.label }}
                    </VaChip>
                  </div>

                  <div class="mt-3 grid grid-cols-2 gap-3">
                    <VaInput
                      v-model="draft.check_in_at"
                      label="Check-in"
                      placeholder="YYYY-MM-DD HH:mm"
                    />
                    <VaInput
                      v-model="draft.check_out_at"
                      label="Check-out"
                      placeholder="YYYY-MM-DD HH:mm"
                    />
                  </div>
                </div>

                <!-- Nightly -->
                <div v-else>
                  <div class="mb-2 text-xs font-bold text-slate-500">Nights</div>

                  <VaCounter v-model="draft.nights" :min="1" class="w-full" />

                  <div class="mt-3 grid grid-cols-2 gap-3">
                    <VaInput v-model="draft.check_in_date" label="Check-in date" placeholder="YYYY-MM-DD" />
                    <VaInput v-model="draft.check_out_date" label="Check-out date" placeholder="YYYY-MM-DD" />
                  </div>
                </div>

                <!-- Guest -->
                <div>
                  <div class="mb-2 flex items-center justify-between">
                    <div class="text-xs font-bold text-slate-500">Guest</div>
                    <div class="flex gap-2">
                      <VaButton
                        size="small"
                        class="rounded-2xl font-extrabold"
                        :preset="draft.guest_mode === 'existing' ? 'primary' : 'secondary'"
                        @click="draft.guest_mode = 'existing'"
                      >
                        Existing
                      </VaButton>
                      <VaButton
                        size="small"
                        class="rounded-2xl font-extrabold"
                        :preset="draft.guest_mode === 'new' ? 'primary' : 'secondary'"
                        @click="draft.guest_mode = 'new'"
                      >
                        New
                      </VaButton>
                    </div>
                  </div>

                  <div v-if="draft.guest_mode === 'existing'">
                    <VaInput v-model.trim="guestQuery" placeholder="Search guest name / phone..." clearable>
                      <template #prependInner>
                        <VaIcon name="search" color="secondary" />
                      </template>
                    </VaInput>

                    <div class="mt-3 max-h-44 overflow-auto space-y-2 pr-1">
                      <VaCard
                        v-for="g in filteredGuests"
                        :key="g.guest_id"
                        class="soft-mini rounded-2xl cursor-pointer"
                        :class="selectedGuest?.guest_id === g.guest_id ? 'mini-active' : ''"
                        @click="selectGuest(g)"
                      >
                        <VaCardContent class="p-3">
                          <div class="flex items-center justify-between gap-2">
                            <div class="min-w-0">
                              <div class="text-sm font-bold text-slate-900 truncate">{{ g.name }}</div>
                              <div class="text-xs text-slate-500 truncate">
                                {{ g.phone }} • {{ g.nationality }}
                              </div>
                            </div>
                            <VaIcon
                              v-if="selectedGuest?.guest_id === g.guest_id"
                              name="check"
                              color="success"
                            />
                          </div>
                        </VaCardContent>
                      </VaCard>
                    </div>
                  </div>

                  <div v-else class="grid gap-2">
                    <VaInput v-model="draft.new_guest.name" label="Guest name" placeholder="Guest name" />
                    <VaInput v-model="draft.new_guest.phone" label="Phone" placeholder="Phone" />
                    <div class="grid grid-cols-2 gap-2">
                      <VaInput v-model="draft.new_guest.nationality" label="Nationality" placeholder="Nationality" />
                      <VaInput v-model="draft.new_guest.id_number" label="ID / Passport" placeholder="ID / Passport" />
                    </div>
                    <VaTextarea v-model="draft.new_guest.notes" label="Notes" placeholder="Notes (optional)" :max-rows="3" />
                  </div>
                </div>

                <!-- Notes -->
                <div>
                  <div class="mb-2 text-xs font-bold text-slate-500">Notes</div>
                  <VaTextarea v-model="draft.notes" placeholder="Special request / staff note..." :max-rows="6" />
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Room filters + list -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4 sm:p-5">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div class="text-sm font-extrabold text-slate-900">Select Rooms</div>
                  <div class="mt-1 text-xs text-slate-500">
                    Choose room type (Simple/VIP) & beds. Pick multiple rooms.
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <VaChip class="cursor-pointer qb-chip" :outline="typeFilter !== 'all'" :color="typeFilter === 'all' ? 'primary' : 'secondary'" @click="typeFilter = 'all'">All</VaChip>
                  <VaChip class="cursor-pointer qb-chip" :outline="typeFilter !== 'Simple'" :color="typeFilter === 'Simple' ? 'primary' : 'secondary'" @click="typeFilter = 'Simple'">Simple</VaChip>
                  <VaChip class="cursor-pointer qb-chip" :outline="typeFilter !== 'VIP'" :color="typeFilter === 'VIP' ? 'primary' : 'secondary'" @click="typeFilter = 'VIP'">VIP</VaChip>

                  <VaChip class="cursor-pointer qb-chip" :outline="bedFilter !== 'all'" :color="bedFilter === 'all' ? 'primary' : 'secondary'" @click="bedFilter = 'all'">Any bed</VaChip>
                  <VaChip class="cursor-pointer qb-chip" :outline="bedFilter !== 1" :color="bedFilter === 1 ? 'primary' : 'secondary'" @click="bedFilter = 1">1 bed</VaChip>
                  <VaChip class="cursor-pointer qb-chip" :outline="bedFilter !== 2" :color="bedFilter === 2 ? 'primary' : 'secondary'" @click="bedFilter = 2">2 beds</VaChip>
                </div>
              </div>

              <!-- available rooms -->
              <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <VaCard
                  v-for="r in filteredRooms"
                  :key="r.room_id"
                  class="room-card rounded-2xl cursor-pointer"
                  :class="isRoomSelected(r.room_id) ? 'room-card--active' : 'room-card--idle'"
                  @click="toggleRoom(r)"
                >
                  <VaCardContent class="p-3">
                    <div class="flex items-start justify-between">
                      <div>
                        <div class="text-sm font-extrabold text-slate-900">Room {{ r.room_number }}</div>
                        <div class="mt-1 text-xs text-slate-600">
                          Floor {{ r.floor }} • {{ r.type_group }} • {{ r.beds }} bed(s)
                        </div>
                      </div>

                      <div class="text-right">
                        <div class="text-[10px] font-bold text-slate-500">
                          {{ draft.booking_type === "hourly" ? "Per hour" : "Per night" }}
                        </div>
                        <div class="text-sm font-extrabold text-slate-900">{{ money(r.unit_price) }}</div>
                      </div>
                    </div>

                    <VaDivider class="my-3" />

                    <div class="flex items-center justify-between">
                      <div class="text-xs font-bold text-slate-500">Qty</div>

                      <div class="flex items-center gap-2">
                        <VaButton
                          size="small"
                          preset="secondary"
                          icon="remove"
                          :disabled="!isRoomSelected(r.room_id)"
                          class="rounded-2xl"
                          @click.stop="decQty(r.room_id)"
                        />
                        <div class="min-w-11 text-center text-sm font-extrabold text-slate-900">
                          {{ qtyForRoom(r.room_id) }}
                        </div>
                        <VaButton
                          size="small"
                          preset="secondary"
                          icon="add"
                          :disabled="!isRoomSelected(r.room_id)"
                          class="rounded-2xl"
                          @click.stop="incQty(r.room_id)"
                        />
                      </div>
                    </div>

                    <div class="mt-2 text-right text-xs font-bold text-slate-600">
                      Line total: <span class="text-slate-900">{{ money(lineTotalForRoom(r.room_id)) }}</span>
                    </div>
                  </VaCardContent>
                </VaCard>
              </div>

              <VaAlert v-if="filteredRooms.length === 0" class="mt-4" color="secondary" outline>
                No available rooms match the filters.
              </VaAlert>
            </VaCardContent>
          </VaCard>

          <!-- Recent -->
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4 sm:p-5">
              <div class="flex items-center justify-between">
                <div class="text-sm font-extrabold text-slate-900">Recent Quick Bookings</div>
                <VaButton preset="plain" size="small" @click="toast('Demo only')">View all</VaButton>
              </div>

              <div class="mt-4 grid gap-3">
                <VaCard
                  v-for="b in data.recentQuickBooks"
                  :key="b.booking_id"
                  class="soft-mini rounded-2xl"
                >
                  <VaCardContent class="p-3">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="flex flex-wrap items-center gap-2">
                          <div class="text-sm font-extrabold text-slate-900">{{ b.booking_number }}</div>
                          <VaBadge :text="pretty(b.booking_source)" color="secondary" />
                          <VaBadge :text="pretty(b.stay.booking_type)" color="secondary" />
                        </div>

                        <div class="mt-1 text-xs text-slate-600">
                          {{ b.guest.name }} • {{ b.guest.phone }} • {{ b.created_at }}
                        </div>
                      </div>

                      <div class="text-right">
                        <div class="text-[10px] font-bold text-slate-500">Total</div>
                        <div class="text-sm font-extrabold text-slate-900">{{ money(b.totals.total) }}</div>
                        <div class="mt-1 text-[10px] font-bold text-slate-600">
                          {{ b.payment.method }} • {{ pretty(b.payment.status) }}
                        </div>
                      </div>
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <VaChip
                        v-for="rm in b.rooms"
                        :key="rm.room_id"
                        size="small"
                        color="secondary"
                        outline
                      >
                        Room {{ rm.room_number }} • {{ rm.type_group }} {{ rm.beds }} bed •
                        {{ rm.qty }}{{ b.stay.booking_type === "hourly" ? "h" : "n" }}
                      </VaChip>
                    </div>
                  </VaCardContent>
                </VaCard>
              </div>
            </VaCardContent>
          </VaCard>
        </div>

        <!-- Right -->
        <div class="space-y-4">
          <VaCard class="soft-card rounded-2xl">
            <VaCardContent class="p-4 sm:p-5">
              <div class="flex items-center justify-between">
                <div class="text-sm font-extrabold text-slate-900">Summary</div>
                <VaButton preset="plain" size="small" @click="resetAll">Reset all</VaButton>
              </div>

              <div class="mt-3 soft-sub rounded-2xl p-3">
                <div class="text-[11px] font-extrabold text-slate-600">Guest</div>
                <div class="mt-1 text-sm font-extrabold text-slate-900">{{ guestLabel }}</div>
                <div class="mt-1 text-xs text-slate-600">{{ guestSub }}</div>
              </div>

              <div class="mt-3 soft-sub rounded-2xl p-3">
                <div class="text-[11px] font-extrabold text-slate-600">Stay</div>
                <div class="mt-1 text-sm font-extrabold text-slate-900">{{ stayLabel }}</div>
                <div class="mt-1 text-xs text-slate-600">{{ staySub }}</div>
              </div>

              <div class="mt-3">
                <div class="text-xs font-extrabold text-slate-500">Selected rooms</div>

                <VaAlert v-if="selectedRooms.length === 0" class="mt-2" color="secondary" outline>
                  No rooms selected yet.
                </VaAlert>

                <div v-else class="mt-2 space-y-2">
                  <VaCard v-for="it in selectedRooms" :key="it.room_id" class="soft-mini rounded-2xl">
                    <VaCardContent class="p-3">
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <div class="text-sm font-extrabold text-slate-900">Room {{ it.room_number }}</div>
                          <div class="text-xs text-slate-600">{{ it.type_group }} • {{ it.beds }} bed(s)</div>
                        </div>
                        <VaButton preset="plain" icon="close" @click="removeRoom(it.room_id)" />
                      </div>

                      <div class="mt-2 flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Qty: <span class="text-slate-900">{{ it.qty }}</span></span>
                        <span>Line: <span class="text-slate-900">{{ money(it.total) }}</span></span>
                      </div>
                    </VaCardContent>
                  </VaCard>
                </div>
              </div>

              <!-- Pricing -->
              <div class="mt-4 soft-sub rounded-2xl p-3">
                <div class="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Subtotal</span><span class="text-slate-900">{{ money(subtotal) }}</span>
                </div>

                <div class="mt-2 grid grid-cols-3 gap-2">
                  <VaInput v-model.number="draft.pricing.discount" type="number" min="0" label="Discount" />
                  <VaInput v-model.number="draft.pricing.extra" type="number" min="0" label="Extra" />
                  <VaInput v-model.number="draft.pricing.tax_rate" type="number" min="0" label="Tax %" />
                </div>

                <div class="mt-3 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Tax</span><span class="text-slate-900">{{ money(taxAmount) }}</span>
                </div>
                <div class="mt-2 flex items-center justify-between text-sm font-extrabold text-slate-900">
                  <span>Total</span><span>{{ money(grandTotal) }}</span>
                </div>
              </div>

              <!-- Deposit -->
              <div class="mt-4 soft-sub rounded-2xl p-3">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xs font-extrabold text-slate-600">Deposit</div>
                    <div class="text-[11px] text-slate-500">Optional for guesthouse</div>
                  </div>
                  <VaSwitch v-model="draft.deposit.enabled" />
                </div>

                <div class="mt-3 grid grid-cols-2 gap-2" v-if="draft.deposit.enabled">
                  <VaInput v-model.number="draft.deposit.amount" type="number" min="0" label="Amount" />
                  <div>
                    <div class="text-[11px] font-extrabold text-slate-600 mb-1">Paid?</div>
                    <VaButton
                      class="w-full rounded-2xl font-extrabold"
                      :preset="draft.deposit.paid ? 'primary' : 'secondary'"
                      @click="draft.deposit.paid = !draft.deposit.paid"
                    >
                      {{ draft.deposit.paid ? "Yes" : "No" }}
                    </VaButton>
                  </div>
                </div>
              </div>

              <!-- Payment -->
              <div class="mt-4 soft-sub rounded-2xl p-3">
                <div class="text-xs font-extrabold text-slate-600">Payment</div>

                <div class="mt-2 flex flex-wrap gap-2">
                  <VaChip
                    v-for="m in data.paymentMethods"
                    :key="m.code"
                    class="cursor-pointer qb-chip"
                    :outline="draft.payment.method_code !== m.code"
                    :color="draft.payment.method_code === m.code ? 'primary' : 'secondary'"
                    @click="draft.payment.method_code = m.code; draft.payment.currency = m.currency"
                  >
                    {{ m.label }}
                  </VaChip>
                </div>

                <div class="mt-3 grid grid-cols-2 gap-2">
                  <VaInput
                    v-model.number="draft.payment.amount_paid"
                    type="number"
                    min="0"
                    label="Paid amount"
                    :placeholder="draft.payment.currency"
                  />

                  <div>
                    <div class="text-[11px] font-extrabold text-slate-600 mb-1">Status</div>
                    <div class="grid grid-cols-2 gap-2">
                      <VaButton
                        size="small"
                        preset="secondary"
                        class="rounded-2xl font-extrabold"
                        :class="draft.payment.status === 'pending' ? '' : 'opacity-60'"
                        @click="draft.payment.status = 'pending'"
                      >
                        Pending
                      </VaButton>
                      <VaButton
                        size="small"
                        :preset="draft.payment.status === 'completed' ? 'primary' : 'secondary'"
                        class="rounded-2xl font-extrabold"
                        @click="draft.payment.status = 'completed'"
                      >
                        Paid
                      </VaButton>
                    </div>
                  </div>
                </div>

                <VaInput
                  class="mt-2"
                  v-model.trim="draft.payment.reference"
                  label="Reference"
                  placeholder="KHQR ref / receipt no..."
                />

                <div class="mt-3 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Balance</span>
                  <span class="text-slate-900">{{ money(balance) }}</span>
                </div>

                <VaCard v-if="draft.payment.method_code === 'ABA_KHQR'" class="soft-mini mt-3 rounded-2xl">
                  <VaCardContent class="p-3">
                    <div class="text-[11px] font-extrabold text-slate-600">ABA KHQR (Demo)</div>
                    <div class="mt-2 flex items-center gap-3">
                      <div class="grid h-14 w-14 place-items-center rounded-2xl qb-qr">
                        <VaIcon name="qr_code_2" color="secondary" />
                      </div>
                      <div class="text-xs text-slate-600">
                        Show QR on screen for customer to scan.
                        <div class="mt-1 font-extrabold text-slate-900">{{ money(grandTotal) }}</div>
                      </div>
                    </div>
                  </VaCardContent>
                </VaCard>
              </div>

              <!-- Bottom actions -->
              <div class="mt-4 grid gap-2">
                <VaButton
                  color="primary"
                  class="rounded-2xl font-extrabold"
                  :disabled="selectedRooms.length === 0"
                  @click="confirmBooking"
                >
                  Confirm Booking
                </VaButton>

                <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="printPreview">
                  Print Preview
                </VaButton>
              </div>
            </VaCardContent>
          </VaCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue"
import { useToast } from "vuestic-ui"
import { frontdeskQuickBookData as data } from "@/data/front/frontdeskQuickBook"

const { init: toastInit } = useToast()

const draft = reactive(structuredClone(data.draftQuickBook))
const guestQuery = ref("")
const typeFilter = ref("all")
const bedFilter = ref("all")
const selectedGuest = ref(null)

const selectedRooms = ref([]) // {room_id, room_number, type_group, beds, unit_price, qty, total}

const money = (n) => {
  const v = Number(n || 0)
  return `$${v.toFixed(2)}`
}
const pretty = (s) => String(s || "").replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())

function toast(msg, type = "ok") {
  toastInit({
    message: msg,
    color: type === "ok" ? "primary" : "danger",
    duration: 1600,
    position: "bottom-center",
  })
}

function setBookingType(t) {
  draft.booking_type = t
  const qty = t === "hourly" ? draft.hours : draft.nights
  selectedRooms.value = selectedRooms.value.map((x) => ({ ...x, qty, total: qty * x.unit_price }))
}

function setHours(h) {
  draft.hours = h
  if (draft.booking_type === "hourly") {
    selectedRooms.value = selectedRooms.value.map((x) => ({ ...x, qty: h, total: h * x.unit_price }))
  }
}

/* Guests */
const filteredGuests = computed(() => {
  const k = guestQuery.value.trim().toLowerCase()
  if (!k) return data.guests
  return data.guests.filter((g) => {
    return (
      String(g.name).toLowerCase().includes(k) ||
      String(g.phone).toLowerCase().includes(k) ||
      String(g.guest_number || "").toLowerCase().includes(k)
    )
  })
})

function selectGuest(g) {
  selectedGuest.value = g
  draft.guest_id = g.guest_id
  toast(`Selected: ${g.name}`)
}

/* Rooms mapping */
const roomTypeMap = computed(() => {
  const m = new Map()
  data.roomTypes.forEach((t) => m.set(t.room_type_id, t))
  return m
})

const availableRooms = computed(() => {
  return data.rooms
    .filter((r) => r.status === "available")
    .map((r) => {
      const t = roomTypeMap.value.get(r.room_type_id)
      const unit_price = draft.booking_type === "hourly" ? t.price.hourly : t.price.nightly
      return { ...r, type_group: t.type_group, beds: t.beds, unit_price }
    })
})

const filteredRooms = computed(() => {
  return availableRooms.value.filter((r) => {
    if (typeFilter.value !== "all" && r.type_group !== typeFilter.value) return false
    if (bedFilter.value !== "all" && r.beds !== bedFilter.value) return false
    return true
  })
})

/* Selected rooms */
function isRoomSelected(room_id) {
  return selectedRooms.value.some((x) => x.room_id === room_id)
}
function defaultQty() {
  return draft.booking_type === "hourly" ? draft.hours : draft.nights
}

function toggleRoom(r) {
  if (isRoomSelected(r.room_id)) {
    removeRoom(r.room_id)
    return
  }
  const qty = defaultQty()
  selectedRooms.value.push({
    room_id: r.room_id,
    room_number: r.room_number,
    floor: r.floor,
    room_type_id: r.room_type_id,
    type_group: r.type_group,
    beds: r.beds,
    unit_price: r.unit_price,
    qty,
    total: qty * r.unit_price,
  })
  toast(`Added room ${r.room_number}`)
}

function removeRoom(room_id) {
  selectedRooms.value = selectedRooms.value.filter((x) => x.room_id !== room_id)
}

function qtyForRoom(room_id) {
  const it = selectedRooms.value.find((x) => x.room_id === room_id)
  return it ? it.qty : 0
}

function lineTotalForRoom(room_id) {
  const it = selectedRooms.value.find((x) => x.room_id === room_id)
  return it ? it.total : 0
}

function incQty(room_id) {
  const it = selectedRooms.value.find((x) => x.room_id === room_id)
  if (!it) return
  it.qty += 1
  it.total = it.qty * it.unit_price
  if (draft.booking_type === "hourly") draft.hours = it.qty
  else draft.nights = it.qty
}

function decQty(room_id) {
  const it = selectedRooms.value.find((x) => x.room_id === room_id)
  if (!it) return
  it.qty = Math.max(1, it.qty - 1)
  it.total = it.qty * it.unit_price
  if (draft.booking_type === "hourly") draft.hours = it.qty
  else draft.nights = it.qty
}

/* Totals */
const subtotal = computed(() => selectedRooms.value.reduce((a, x) => a + Number(x.total || 0), 0))
const taxAmount = computed(() => {
  const base = subtotal.value - Number(draft.pricing.discount || 0) + Number(draft.pricing.extra || 0)
  return base * (Number(draft.pricing.tax_rate || 0) / 100)
})
const grandTotal = computed(() => subtotal.value - Number(draft.pricing.discount || 0) + Number(draft.pricing.extra || 0) + taxAmount.value)
const balance = computed(() => Math.max(0, grandTotal.value - Number(draft.payment.amount_paid || 0)))

/* Labels */
const guestLabel = computed(() => {
  if (draft.guest_mode === "new") return draft.new_guest.name || "New guest (not filled)"
  return selectedGuest.value?.name || "No guest selected"
})
const guestSub = computed(() => {
  if (draft.guest_mode === "new") return draft.new_guest.phone || "Phone not set"
  return selectedGuest.value?.phone || "—"
})
const stayLabel = computed(() => (draft.booking_type === "hourly" ? `${draft.hours} hour(s)` : `${draft.nights} night(s)`))
const staySub = computed(() => {
  if (draft.booking_type === "hourly") return `${draft.check_in_at} → ${draft.check_out_at}`
  return `${draft.check_in_date} → ${draft.check_out_date}`
})

/* Actions (demo) */
function resetAll() {
  const fresh = structuredClone(data.draftQuickBook)
  Object.keys(fresh).forEach((k) => (draft[k] = fresh[k]))
  selectedGuest.value = null
  selectedRooms.value = []
  guestQuery.value = ""
  typeFilter.value = "all"
  bedFilter.value = "all"
  toast("Reset done")
}

function saveDraft() {
  const payload = {
    ...structuredClone(draft),
    selectedRooms: structuredClone(selectedRooms.value),
    totals: { subtotal: subtotal.value, tax: taxAmount.value, total: grandTotal.value, balance: balance.value },
  }
  localStorage.setItem("quick_book_draft", JSON.stringify(payload))
  toast("Draft saved")
}

function confirmBooking() {
  if (selectedRooms.value.length === 0) return toast("Select at least 1 room", "err")
  if (draft.guest_mode === "existing" && !draft.guest_id) return toast("Select guest", "err")
  if (draft.guest_mode === "new" && (!draft.new_guest.name || !draft.new_guest.phone)) return toast("Fill guest name & phone", "err")
  toast("Confirmed (demo)")
  console.log("CONFIRM PAYLOAD:", {
    draft: structuredClone(draft),
    selectedRooms: structuredClone(selectedRooms.value),
    totals: { subtotal: subtotal.value, tax: taxAmount.value, total: grandTotal.value, balance: balance.value },
  })
}

function printPreview() {
  const guest = guestLabel.value
  const lines = selectedRooms.value
    .map(
      (x) =>
        `Room ${x.room_number} • ${x.type_group} ${x.beds} bed • ${x.qty}${draft.booking_type === "hourly" ? "h" : "n"} • ${money(x.total)}`
    )
    .join("<br/>")

  const w = window.open("", "_blank")
  if (!w) return alert("Popup blocked. Please allow popups for this site.")

  w.document.open()
  w.document.write(`
    <!doctype html>
    <html>
      <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>Quick Booking Preview</title></head>
      <body style="font-family: ui-sans-serif, system-ui; padding: 18px;">
        <h2 style="margin:0;">${data.property.name}</h2>
        <div style="color:#555; margin-top:6px;">Quick Booking Preview</div>
        <hr/>
        <div><b>Guest:</b> ${guest}</div>
        <div style="margin-top:6px;"><b>Stay:</b> ${stayLabel.value}</div>
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
        <script>window.onload=function(){window.print();};<\/script>
      </body>
    </html>
  `)
  w.document.close()
}
</script>

<style scoped>
/* Page */
.qb-page {
  min-height: calc(100vh - 60px);
  background: #ffffff;
  padding: 16px;
}
@media (min-width: 640px) {
  .qb-page {
    padding: 24px;
  }
}

/* Soft shadow system (same vibe as Monthly Report) */
.soft-card {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}
.soft-sub {
  background: rgba(2, 8, 23, 0.02);
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06);
}
.soft-mini {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}

/* Chips */
.qb-chip :deep(.va-chip__content) {
  font-weight: 900;
}

/* Room cards (no border/ring) */
.room-card {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}
.room-card--idle {
  background: rgba(2, 8, 23, 0.03) !important;
}
.room-card--idle:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 26px rgba(2, 8, 23, 0.08) !important;
  background: rgba(2, 8, 23, 0.05) !important;
}
.room-card--active {
  background: rgba(16, 185, 129, 0.12) !important;
  box-shadow: 0 10px 26px rgba(2, 8, 23, 0.10) !important;
}

/* Selected guest mini card */
.mini-active {
  background: rgba(14, 165, 233, 0.10) !important;
}

/* QR demo tile */
.qb-qr {
  background: rgba(2, 8, 23, 0.04);
}
</style>
