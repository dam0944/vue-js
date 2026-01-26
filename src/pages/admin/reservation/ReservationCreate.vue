    <!-- src/pages/admin/reservations/ReservationCreate.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">add_business</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Create Reservation</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Walk-in / phone / other • Hourly (3h/4h/6h) or Nightly (1+ nights) • Select multiple rooms.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button class="rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-200" @click="resetAll">
            <span class="material-icons mr-1 align-middle text-[18px]">refresh</span>
            Reset
          </button>
          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-40"
            :disabled="!canSubmit"
            @click="submit"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">save</span>
            Save
          </button>
        </div>
      </div>

      <!-- Main (no border/shadow) -->
      <div class="mt-4 grid gap-4 lg:grid-cols-12">
        <!-- Left: form -->
        <div class="lg:col-span-8">
          <!-- Booking basic -->
          <section class="rounded-2xl bg-white p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-extrabold text-slate-900">Booking Info</div>
                <div class="text-xs text-slate-500">Basic details (source/type/dates).</div>
              </div>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                {{ data.property.property_code }} • {{ data.property.city }}
              </span>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Booking Source</label>
                <select v-model="draft.booking_source" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                  <option v-for="x in data.bookingSources" :key="x" :value="x">{{ pretty(x) }}</option>
                </select>
              </div>

              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Booking Type</label>
                <select v-model="draft.booking_type" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                  <option v-for="x in data.bookingTypes" :key="x" :value="x">{{ pretty(x) }}</option>
                </select>
              </div>

              <!-- Hourly -->
              <div v-if="draft.booking_type === 'hourly'">
                <label class="mb-1 block text-xs font-bold text-slate-500">Hours</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="p in data.hourlyPresets"
                    :key="p.hours"
                    class="rounded-full px-4 py-2 text-xs font-extrabold"
                    :class="draft.hours === p.hours ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'"
                    @click="draft.hours = p.hours"
                    type="button"
                  >
                    {{ p.label }}
                  </button>
                </div>
              </div>

              <div v-if="draft.booking_type === 'hourly'">
                <label class="mb-1 block text-xs font-bold text-slate-500">Check-in / Check-out</label>
                <div class="grid grid-cols-2 gap-2">
                  <input v-model="draft.check_in_at" type="datetime-local" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
                  <input v-model="draft.check_out_at" type="datetime-local" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
                </div>
                <div class="mt-1 text-[11px] text-slate-500">Tip: check-out auto updates when you change hours.</div>
              </div>

              <!-- Nightly -->
              <div v-else>
                <label class="mb-1 block text-xs font-bold text-slate-500">Check-in Date</label>
                <input v-model="draft.check_in_date" type="date" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
              </div>

              <!-- <div v-else>  
                <label class="mb-1 block text-xs font-bold text-slate-500">Check-out Date</label>
                <input v-model="draft.check_out_date" type="date" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" />
              </div> -->
            </div>
          </section>

          <!-- Guest -->
          <section class="mt-4 rounded-2xl bg-white p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-extrabold text-slate-900">Guest</div>
                <div class="text-xs text-slate-500">Search existing guest or create new.</div>
              </div>
              <button
                class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-200"
                type="button"
                @click="toggleNewGuest"
              >
                <span class="material-icons mr-1 align-middle text-[16px]">{{ showNewGuest ? "person_search" : "person_add" }}</span>
                {{ showNewGuest ? "Pick Existing" : "Create New" }}
              </button>
            </div>

            <!-- Existing guest -->
            <div v-if="!showNewGuest" class="mt-3">
              <div class="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
                <span class="material-icons text-[18px] text-slate-500">search</span>
                <input
                  v-model.trim="guestQ"
                  class="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search name / phone..."
                />
                <button v-if="guestQ" class="rounded-full bg-white px-3 py-1 text-xs font-extrabold" @click="guestQ=''">Clear</button>
              </div>

              <div class="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  v-for="g in filteredGuests"
                  :key="g.guest_id"
                  class="rounded-2xl bg-slate-50 p-4 text-left hover:bg-slate-100"
                  type="button"
                  @click="selectGuest(g)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <div class="truncate text-sm font-extrabold text-slate-900">{{ g.name }}</div>
                      <div class="mt-1 text-xs text-slate-500">{{ g.phone }} • {{ g.nationality }}</div>
                    </div>
                    <span v-if="g.guest_type === 'vip'" class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">VIP</span>
                  </div>
                </button>

                <div v-if="filteredGuests.length === 0" class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  No guest found. Click <b>Create New</b>.
                </div>
              </div>

              <div v-if="draft.guest" class="mt-3 rounded-2xl bg-slate-50 p-4">
                <div class="text-xs font-bold text-slate-500">Selected Guest</div>
                <div class="mt-1 text-sm font-extrabold text-slate-900">{{ draft.guest.name }}</div>
                <div class="mt-1 text-xs text-slate-600">{{ draft.guest.phone }} • {{ draft.guest.id_type }} {{ draft.guest.id_number }}</div>
              </div>
            </div>

            <!-- New guest -->
            <div v-else class="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">First Name</label>
                <input v-model.trim="newGuest.first_name" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="First name" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Last Name</label>
                <input v-model.trim="newGuest.last_name" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="Last name" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Phone</label>
                <input v-model.trim="newGuest.phone" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="012 345 678" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">Nationality</label>
                <input v-model.trim="newGuest.nationality" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="Cambodian" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">ID Type</label>
                <select v-model="newGuest.id_type" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-500">ID Number</label>
                <input v-model.trim="newGuest.id_number" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="0123456789" />
              </div>

              <div class="sm:col-span-2">
                <button
                  class="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-40"
                  type="button"
                  :disabled="!canCreateGuest"
                  @click="createGuestLocal"
                >
                  Create Guest (Local)
                </button>
                <div class="mt-2 text-[11px] text-slate-500">
                  Demo only: creates guest in local static list (no API yet).
                </div>
              </div>
            </div>
          </section>

          <!-- Rooms -->
          <section class="mt-4 rounded-2xl bg-white p-4">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div class="text-sm font-extrabold text-slate-900">Select Rooms</div>
                <div class="text-xs text-slate-500">Choose available rooms (Simple/VIP, 1 bed/2 beds). Multiple rooms allowed.</div>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <select v-model="roomStatusFilter" class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold outline-none">
                  <option value="available">Available</option>
                  <option value="all">All</option>
                </select>

                <select v-model="typeGroupFilter" class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold outline-none">
                  <option value="all">All Types</option>
                  <option value="Simple">Simple</option>
                  <option value="VIP">VIP</option>
                </select>

                <select v-model="bedsFilter" class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold outline-none">
                  <option value="all">All Beds</option>
                  <option :value="1">1 bed</option>
                  <option :value="2">2 beds</option>
                </select>
              </div>
            </div>

            <div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <button
                v-for="r in filteredRooms"
                :key="r.room_id"
                class="rounded-2xl bg-slate-50 p-4 text-left hover:bg-slate-100 disabled:opacity-40"
                type="button"
                :disabled="roomStatusFilter === 'available' && r.status !== 'available'"
                @click="addRoom(r)"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="text-sm font-extrabold text-slate-900">Room {{ r.room_number }}</div>
                    <div class="mt-1 text-xs text-slate-500">
                      Floor {{ r.floor }} • {{ typeLabel(r.room_type_id) }}
                    </div>
                  </div>
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="roomStatusPill(r.status)">
                    {{ pretty(r.status) }}
                  </span>
                </div>

                <div class="mt-3 text-xs text-slate-600">
                  {{ priceLabel(r.room_type_id) }}
                </div>
              </button>
            </div>

            <div v-if="draft.selectedRooms.length" class="mt-4 rounded-2xl bg-slate-50 p-4">
              <div class="flex items-center justify-between">
                <div class="text-sm font-extrabold text-slate-900">Selected Rooms</div>
                <button class="rounded-full bg-white px-4 py-2 text-xs font-extrabold hover:bg-slate-100" @click="draft.selectedRooms = []" type="button">
                  Clear
                </button>
              </div>

              <div class="mt-3 space-y-2">
                <div v-for="(x, idx) in draft.selectedRooms" :key="x.room_id" class="rounded-2xl bg-white p-4">
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
                      <button class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold hover:bg-slate-200" type="button" @click="decQty(idx)">
                        -
                      </button>
                      <div class="min-w-[44px] text-center text-sm font-extrabold text-slate-900">
                        {{ x.qty }}
                      </div>
                      <button class="rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold hover:bg-slate-200" type="button" @click="incQty(idx)">
                        +
                      </button>
                    </div>

                    <button class="rounded-full bg-rose-100 px-4 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-200" type="button" @click="removeRoom(idx)">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Notes -->
          <section class="mt-4 rounded-2xl bg-white p-4">
            <div class="text-sm font-extrabold text-slate-900">Notes</div>
            <textarea
              v-model.trim="draft.notes"
              rows="3"
              class="mt-2 w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="Special requests, late arrival, etc..."
            />
          </section>
        </div>

        <!-- Right: summary -->
        <div class="lg:col-span-4">
          <div class="rounded-2xl bg-white p-4 lg:sticky lg:top-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-extrabold text-slate-900">Summary</div>
                <div class="text-xs text-slate-500">Totals (demo calculation).</div>
              </div>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                {{ data.property.currency }}
              </span>
            </div>

            <div class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Rooms subtotal</span>
                <span class="font-extrabold text-slate-900">{{ money(subtotal) }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-600">Discount</span>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="draft.pricing.discount"
                    type="number"
                    min="0"
                    class="w-24 rounded-2xl bg-slate-100 px-3 py-2 text-right text-sm outline-none"
                  />
                  <span class="text-xs font-bold text-slate-500">{{ data.property.currency }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-600">Extra</span>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="draft.pricing.extra"
                    type="number"
                    min="0"
                    class="w-24 rounded-2xl bg-slate-100 px-3 py-2 text-right text-sm outline-none"
                  />
                  <span class="text-xs font-bold text-slate-500">{{ data.property.currency }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-600">Tax %</span>
                <input
                  v-model.number="draft.pricing.tax_rate"
                  type="number"
                  min="0"
                  class="w-24 rounded-2xl bg-slate-100 px-3 py-2 text-right text-sm outline-none"
                />
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

            <div class="mt-4 rounded-2xl bg-slate-50 p-4">
              <div class="flex items-center justify-between">
                <div class="text-xs font-bold text-slate-500">Deposit</div>
                <label class="inline-flex items-center gap-2 text-xs font-extrabold text-slate-900">
                  <input type="checkbox" v-model="draft.deposit.enabled" class="h-4 w-4 accent-slate-900" />
                  Enabled
                </label>
              </div>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <div class="text-[11px] font-bold text-slate-500">Amount</div>
                  <input
                    v-model.number="draft.deposit.amount"
                    type="number"
                    min="0"
                    class="mt-1 w-full rounded-2xl bg-white px-3 py-2 text-sm outline-none"
                    :disabled="!draft.deposit.enabled"
                  />
                </div>
                <div>
                  <div class="text-[11px] font-bold text-slate-500">Paid?</div>
                  <select
                    v-model="draft.deposit.paid"
                    class="mt-1 w-full rounded-2xl bg-white px-3 py-2 text-sm outline-none"
                    :disabled="!draft.deposit.enabled"
                  >
                    <option :value="false">No</option>
                    <option :value="true">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="mt-4">
              <div class="text-xs font-bold text-slate-500">Payment</div>
              <div class="mt-2 grid gap-2">
                <select v-model="draft.payment.method" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
                  <option v-for="m in data.paymentMethods" :key="m.code" :value="m.label">
                    {{ m.label }}
                  </option>
                </select>

                <input
                  v-model.number="draft.payment.amount_paid"
                  type="number"
                  min="0"
                  class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
                  placeholder="Amount paid now"
                />

                <input
                  v-model.trim="draft.payment.reference"
                  class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
                  placeholder="Reference (KHQR / receipt #)"
                />
              </div>

              <div class="mt-3 rounded-2xl bg-slate-50 p-4 text-sm">
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
                <button
                  class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-200 disabled:opacity-40"
                  type="button"
                  :disabled="!canSubmit"
                  @click="printPreview"
                >
                  <span class="material-icons mr-1 align-middle text-[18px]">print</span>
                  Preview
                </button>
                <button
                  class="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-40"
                  type="button"
                  :disabled="!canSubmit"
                  @click="submit"
                >
                  Save
                </button>
              </div>

              <div class="mt-2 text-[11px] text-slate-500">
                Demo: no API yet. Later you will insert into tables: <b>bookings</b>, <b>reservations</b>, <b>invoices</b>, <b>payments</b>.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div
        v-if="toast"
        class="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-white"
      >
        <div class="flex items-start gap-2">
          <span class="material-icons text-[18px]">info</span>
          <div class="text-sm font-bold">{{ toast }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, reactive, ref, watch } from "vue"
import { reservationsCreateData } from "@/data/reservation/reservationsCreateData"

// ✅ FIX 1: define data
const data = reservationsCreateData

// UI
const toast = ref("")
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ""), 2200)
}

// Guest pick/create
const guestQ = ref("")
const showNewGuest = ref(false)

// ✅ FIX 4: normalize guests so UI can use g.name
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
  return guestsLocal.value.filter((g) => {
    const blob = `${g.name} ${g.phone}`.toLowerCase()
    return blob.includes(k)
  })
})

function toggleNewGuest() {
  showNewGuest.value = !showNewGuest.value
}

const canCreateGuest = computed(() => {
  return !!newGuest.first_name && !!newGuest.last_name && !!newGuest.phone
})

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

// Room filters
const roomStatusFilter = ref("available")
const typeGroupFilter = ref("all") // Simple | VIP
const bedsFilter = ref("all") // 1 | 2 | all

// Draft (booking-like)
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

// auto checkout for hourly
watch(
  () => [draft.booking_type, draft.hours, draft.check_in_at],
  () => {
    if (draft.booking_type !== "hourly") return
    if (!draft.check_in_at) return

    const d = new Date(draft.check_in_at)
    if (Number.isNaN(d.getTime())) return

    d.setHours(d.getHours() + Number(draft.hours || 0))
    draft.check_out_at = toDatetimeLocal(d)

    // update qty for selected rooms (hours)
    draft.selectedRooms = draft.selectedRooms.map((x) => {
      const qty = Number(draft.hours || 0) || 1
      const total = qty * Number(x.unit_price || 0)
      return { ...x, qty, total }
    })
  }
)

// ✅ FIX 3: bed_count not beds
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

  if (draft.selectedRooms.some((x) => x.room_id === room.room_id)) {
    return showToast("Room already selected.")
  }

  const unit_price = draft.booking_type === "hourly" ? rt.base_price_hourly : rt.base_price_nightly
  const qty =
    draft.booking_type === "hourly"
      ? Number(draft.hours || 0) || 1
      : calcNights(draft.check_in_date, draft.check_out_date)

  const total = qty * Number(unit_price || 0)

  draft.selectedRooms.push({
    room_id: room.room_id,
    room_number: room.room_number,
    room_type_id: rt.room_type_id,
    type_group: rt.type_name,
    beds: rt.bed_count, // ✅ FIX 3
    unit_price,
    qty,
    total,
  })

  showToast(`Added room ${room.room_number}`)
}

watch(
  () => [draft.booking_type, draft.check_in_date, draft.check_out_date],
  () => {
    if (draft.booking_type !== "nightly") return
    const nights = calcNights(draft.check_in_date, draft.check_out_date)
    draft.selectedRooms = draft.selectedRooms.map((x) => {
      const qty = nights
      return { ...x, qty, total: qty * Number(x.unit_price || 0) }
    })
  }
)

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
  if (draft.booking_type === "hourly") {
    return !!draft.check_in_at && !!draft.check_out_at
  }
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

const stayLabel = computed(() => {
  if (draft.booking_type === "hourly") {
    return `${draft.hours} hour(s) • ${draft.check_in_at?.replace("T", " ")} → ${draft.check_out_at?.replace("T", " ")}`
  }
  const n = calcNights(draft.check_in_date, draft.check_out_date)
  return `${n} night(s) • ${draft.check_in_date} → ${draft.check_out_date}`
})

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
      <head>
        <meta charset="utf-8"/>
        <title>Reservation Preview</title>
      </head>
      <body style="font-family: ui-sans-serif, system-ui; padding: 18px;">
        <h2 style="margin:0;">${data?.property?.property_name || "Guesthouse"}</h2>
        <div style="color:#555; margin-top:6px;">Reservation Preview</div>
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
      </body>
    </html>
  `)
  w.document.close()

  w.onload = () => {
    w.focus()
    w.print()
  }
}

function roomStatusPill(s) {
  switch (s) {
    case "available":
      return "bg-emerald-100 text-emerald-800"
    case "occupied":
      return "bg-blue-100 text-blue-800"
    case "blocked":
      return "bg-amber-100 text-amber-800"
    case "cleaning":
      return "bg-slate-200 text-slate-800"
    case "maintenance":
      return "bg-rose-100 text-rose-800"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

function money(v) {
  const n = Number(v || 0)
  return `$${n.toFixed(2)}`
}

function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
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
</script>
