<!-- src/pages/pos/PosRooms.vue -->
<template>
  <div class="min-h-screen w-screen bg-slate-50 text-slate-900">
    <!-- TOP BAR -->
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div class="w-full px-4 lg:px-6 py-3">
        <div class="flex items-center justify-between gap-3">
          <!-- Search (click => popup) -->
          <div class="relative flex-1 max-w-2xl">
            <VaInput
              v-model="searchQuery"
              clearable
              readonly
              placeholder="Search customers… (Ctrl + K)"
              class="w-full"
              @click="openSearch"
            >
              <template #prependInner>
                <VaIcon name="search" color="secondary" />
              </template>

              <template #appendInner>
                <div class="kbd-pill" title="Shortcut">
                  <span class="kbd-key">Ctrl</span>
                  <span class="kbd-plus">+</span>
                  <span class="kbd-key">K</span>
                </div>
              </template>
            </VaInput>
          </div>

          <!-- Actions -->
          <div class="flex text-white items-center gap-2">
            <VaButton color="#fffff" icon-color="#ffffff" icon="percent" @click="openDiscountModal">
              Discount
            </VaButton>

            <VaButton preset="secondary" icon="monitor" class="pos-btn" @click="openCustomerWindow">
              View
            </VaButton>

            <VaButton preset="primary" icon="person_add" class="pos-btn" @click="openGuestModal">
              New Guest
            </VaButton>

            <VaButton
              preset="secondary"
              :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
              class="pos-btn-icon"
              @click="toggleFullscreen"
            />
            <VaButton preset="secondary" icon="restart_alt" class="pos-btn-icon" @click="resetPOS" />
          </div>
        </div>
      </div>
    </header>

    <!-- MAIN -->
    <main class="w-full h-[calc(100vh-72px)] lg:h-[calc(100vh-80px)]">
      <div class="h-full grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-4 p-4 lg:p-6">
        <!-- LEFT -->
        <section class="min-h-0 flex flex-col">
          <div class="flex items-end justify-between gap-4 pb-3">
            <div>
              <h1 class="text-xl lg:text-2xl font-black tracking-tight">POS · Rooms</h1>
              <p class="text-sm text-slate-500 font-medium mt-1">
                Next Reservation:
                <span class="text-sky-600 font-extrabold">#{{ nextReservationNumber }}</span>
              </p>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <VaSelect
                v-model="activeFloor"
                :options="floorOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                placeholder="Floor"
                class="min-w-[180px]"
              />
              <VaSelect
                v-model="activeBedFilter"
                :options="bedOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                placeholder="Beds"
                class="min-w-[180px]"
              />
            </div>
          </div>

          <!-- Rooms grid -->
          <div class="min-h-0 flex-1 overflow-auto pr-1 no-scrollbar">
            <div
              class="grid gap-4
                     grid-cols-1
                     sm:grid-cols-2
                     lg:grid-cols-3
                     xl:grid-cols-4
                     2xl:grid-cols-5"
            >
              <button
                v-for="r in filteredRooms"
                :key="r.room_id"
                type="button"
                class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition text-left"
                :class="{
                  'ring-4 ring-sky-500/25 border-sky-300 shadow-xl': isRoomSelected(r.room_id),
                  'opacity-60 grayscale cursor-not-allowed': !canAddRoom(r),
                }"
                @click="addRoom(r)"
              >
                <!-- Photo -->
                <div class="relative h-28">
                  <img :src="r.photo || fallbackRoomPhoto" alt="Room photo" class="h-full w-full object-cover" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>

                  <!-- Status -->
                  <div class="absolute top-3 right-3">
                    <span
                      class="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide border"
                      :class="statusPillTailwind(r.status)"
                    >
                      {{ niceStatus(r.status) }}
                    </span>
                  </div>

                  <!-- Number -->
                  <div class="absolute bottom-3 left-3">
                    <div class="text-white text-2xl font-black leading-none">#{{ r.room_number }}</div>
                    <div class="text-white/85 text-xs font-semibold mt-1">
                      {{ r.room_type.type_name }} • Floor {{ r.floor }} • {{ r.building }}
                    </div>
                  </div>
                </div>

                <!-- Bottom -->
                <div class="p-4 flex items-end justify-between gap-2">
                  <div>
                    <div class="text-sky-600 text-lg font-black">
                      ${{ formatMoney(roomRateFor(r), 0) }}
                      <span class="text-xs text-slate-400 font-black">
                        /{{ booking.type === "hourly" ? "hr" : "night" }}
                      </span>
                    </div>
                    <div class="text-xs text-slate-500 font-semibold mt-1">
                      {{ r.room_type.max_occupancy }} pax • {{ r.room_type.bed_count }} bed(s)
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-xs text-slate-500 font-semibold">Tap to add</div>
                    <div class="text-sm font-extrabold" :class="canAddRoom(r) ? 'text-slate-800' : 'text-rose-600'">
                      {{ canAddRoom(r) ? (isRoomSelected(r.room_id) ? "Added" : "Add") : "Blocked" }}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>

        <!-- RIGHT -->
        <aside class="min-h-0 overflow-auto no-scrollbar">
          <VaCard class="rounded-2xl border border-slate-200 shadow-sm p-4 lg:p-5">
            <div class="flex items-center justify-between gap-3 mb-4">
              <div class="text-base lg:text-lg font-black">Booking Details</div>
              <VaChip color="secondary" square>{{ durationText }}</VaChip>
            </div>

            <!-- Guest -->
            <div
              class="rounded-2xl border p-4 mb-3"
              :class="selectedGuest ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'"
            >
              <div class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Guest</div>
              <div v-if="selectedGuest" class="mt-1 text-lg font-black text-emerald-900">
                {{ selectedGuest.first_name }} {{ selectedGuest.last_name }}
              </div>
              <div v-if="selectedGuest" class="text-sm font-semibold text-emerald-700">
                {{ selectedGuest.phone }}
              </div>
              <div v-else class="mt-1 text-sm text-slate-500 font-semibold">
                Click search box (or Ctrl+K) to select customer.
              </div>
            </div>

            <!-- Family Pax -->
            <div class="grid gap-3 mb-3">
              <VaInput v-model.number="totalPax" type="number" label="Total People (Family)" :min="1" />

              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div class="flex items-center justify-between text-sm font-extrabold">
                  <span>Selected room capacity</span>
                  <span>{{ totalCapacity }} pax</span>
                </div>
                <div v-if="Number(totalPax) > totalCapacity" class="text-xs font-extrabold text-rose-600 mt-1">
                  Need more rooms. (Family {{ totalPax }} > Capacity {{ totalCapacity }})
                </div>
                <div v-else class="text-xs font-semibold text-slate-500 mt-1">
                  Pax auto distributes by max occupancy.
                </div>
              </div>
            </div>

            <!-- Booking type -->
            <div class="grid gap-3 mb-4">
              <VaSelect
                v-model="booking.type"
                label="Booking Type"
                :options="bookingTypeOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                @update:modelValue="onBookingTypeChange"
              />

              <VaInput
                v-if="booking.type === 'hourly'"
                v-model.number="booking.hours"
                type="number"
                label="Hours"
                :min="1"
                :max="12"
                @update:modelValue="onHoursChange"
              >
                <template #appendInner>h</template>
              </VaInput>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <VaInput v-model="booking.check_in_date" type="date" label="Check-in Date" @update:modelValue="onDateChange" />
                <VaInput v-model="booking.check_out_date" type="date" label="Check-out Date" @update:modelValue="onDateChange" />
              </div>

              <VaInput v-model="booking.check_in_time" type="time" label="Check-in Time" />

              <VaInput
                v-model.number="booking.discount_amount"
                type="number"
                label="Discount (USD)"
                :min="0"
                step="0.01"
                @update:modelValue="updateCustomerScreen"
              >
                <template #prependInner>
                  <VaIcon name="percent" color="secondary" />
                </template>
              </VaInput>
            </div>

            <!-- BOOKING SUMMARY -->
            <div class="bs-card">
              <div class="bs-head">
                <div class="bs-title">Booking Summary</div>
                <div class="bs-chip">
                  <VaChip color="secondary" square size="small">{{ summaryItems.length }} item(s)</VaChip>
                </div>
              </div>

              <div class="bs-list bs-scroll no-scrollbar">
                <div v-if="!summaryItems.length" class="bs-empty">
                  Tap rooms on the left to add.
                </div>

                <div v-else v-for="it in summaryItems" :key="it.id" class="bs-item">
                  <div class="bs-left">
                    <div class="bs-img">
                      <img :src="it.photo" alt="" />
                    </div>

                    <div class="bs-info">
                      <div class="bs-name">{{ it.title }}</div>
                      <div class="bs-sub">{{ it.subtitle }}</div>

                      <div class="bs-controls">
                        <VaButton
                          preset="secondary"
                          icon="remove"
                          class="bs-btn"
                          :disabled="it.qty <= 1"
                          @click="decUnits(it.id)"
                        />
                        <div class="bs-qty">{{ it.qty }}</div>
                        <VaButton preset="secondary" icon="add" class="bs-btn" @click="incUnits(it.id)" />
                        <VaButton
                          preset="secondary"
                          icon="delete"
                          color="danger"
                          class="bs-btn bs-btn-danger"
                          @click="removeRoom(it.id)"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="bs-price">${{ formatMoney(it.lineTotal, 2) }}</div>
                </div>
              </div>

              <div class="bs-totals">
                <div class="row">
                  <span>Subtotal</span>
                  <span>${{ formatMoney(subTotal, 2) }}</span>
                </div>
                <div class="row">
                  <span>Discounts</span>
                  <span class="neg">-${{ formatMoney(Number(booking.discount_amount || 0), 2) }}</span>
                </div>
                <div class="row">
                  <span>Sales Tax</span>
                  <span>${{ formatMoney(taxAmount, 2) }}</span>
                </div>

                <div class="divider"></div>

                <div class="row total">
                  <span>Total</span>
                  <span>${{ formatMoney(grandTotal, 2) }}</span>
                </div>
              </div>
            </div>

            <!-- Check-in / Print -->
            <VaButton
              color="primary"
              icon="print"
              size="large"
              class="w-full rounded-2xl font-black tracking-wide mt-4"
              :disabled="!canConfirm"
              @click="confirmBooking"
            >
              Confirm (Check-in) & Print
            </VaButton>

            <!-- ✅ Checkout & Payment popup -->
            <VaButton
              color="danger"
              icon="logout"
              size="large"
              class="w-full rounded-2xl font-black tracking-wide mt-3"
              :disabled="!canConfirm"
              @click="openCheckoutModal"
            >
              Check-out & Payment
            </VaButton>

            <div class="text-center text-xs text-slate-500 font-semibold mt-3">
              Tip: Ctrl+K → select guest → add rooms → set family pax → confirm.
            </div>
          </VaCard>
        </aside>
      </div>
    </main>

    <!-- POPUP SEARCH CUSTOMER -->
    <VaModal v-model="searchOpen" hide-default-actions max-width="760px">
      <template #header>
        <div class="search-head">
          <VaIcon name="search" class="search-ico" />

          <VaInput
            ref="searchInputRef"
            v-model="searchQuery"
            clearable
            class="search-input"
            placeholder="Search customers (name / phone)…"
            @update:modelValue="handleSearch"
            @keydown.down.prevent="moveDown"
            @keydown.up.prevent="moveUp"
            @keydown.enter.prevent="pickHighlighted"
            @keydown.esc.prevent="closeSearch"
          />

          <VaButton preset="secondary" icon="close" class="close-btn" @click="closeSearch" />
        </div>

        <!-- Shortcut help row -->
        <div class="search-hints" aria-label="Keyboard shortcuts">
          <div class="hint">
            <span class="hint-kbd">↵</span>
            <span class="hint-text">to select</span>
          </div>
          <div class="hint">
            <span class="hint-kbd">↑</span><span class="hint-kbd">↓</span>
            <span class="hint-text">to navigate</span>
          </div>
          <div class="hint">
            <span class="hint-kbd">esc</span>
            <span class="hint-text">to close</span>
          </div>
        </div>
      </template>

      <div class="search-body">
        <div class="search-title">Customers</div>

        <div v-if="!searchQuery.trim()" class="search-empty">Start typing to search…</div>

        <div v-else-if="!foundGuests.length" class="search-empty">
          <div>No results found.</div>

          <div class="mt-3">
            <VaButton color="primary" icon="person_add" class="w-full add-guest-btn" @click="createGuestFromSearch">
              Create new guest
            </VaButton>
          </div>
        </div>

        <div v-else class="search-list no-scrollbar" role="listbox" aria-label="Search results">
          <button
            v-for="(g, idx) in foundGuests"
            :key="g.guest_id"
            type="button"
            class="search-item"
            :class="{ active: idx === activeIndex }"
            @mouseenter="activeIndex = idx"
            @click="pickGuest(g)"
            role="option"
            :aria-selected="idx === activeIndex"
          >
            <div>
              <div class="search-name">{{ g.first_name }} {{ g.last_name }}</div>
              <div class="search-sub">{{ g.phone }}</div>
            </div>
            <VaIcon name="subdirectory_arrow_left" />
          </button>
        </div>
      </div>
    </VaModal>

    <!-- Guest Modal -->
    <VaModal v-model="guestModalOpen" hide-default-actions max-width="520px">
      <template #header>
        <div class="flex items-center gap-2 font-black text-base">
          <VaIcon name="person_add" color="primary" />
          <span>Add New Guest</span>
        </div>
      </template>

      <div class="grid gap-3 py-2">
        <VaInput v-model="newGuest.first_name" label="First Name *" />
        <VaInput v-model="newGuest.last_name" label="Last Name *" />
        <VaInput v-model="newGuest.phone" label="Phone" />
        <VaInput v-model="newGuest.email" label="Email" />
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <VaButton preset="secondary" @click="closeGuestModal">Cancel</VaButton>
          <VaButton color="primary" @click="saveNewGuest">Save</VaButton>
        </div>
      </template>
    </VaModal>

    <!-- ✅ CHECKOUT & PAYMENT MODAL -->
    <VaModal v-model="checkoutOpen" hide-default-actions max-width="860px">
      <template #header>
        <div class="flex items-center justify-between gap-3 w-full">
          <div class="flex items-center gap-2 font-black text-base">
            <VaIcon name="logout" color="danger" />
            <span>Check-out & Payment</span>
          </div>
          <VaButton preset="secondary" icon="close" class="!rounded-xl" @click="checkoutOpen = false" />
        </div>
      </template>

      <div class="grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr] gap-4 py-2">
        <!-- LEFT -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="font-black text-slate-900">Stay Summary</div>
            <VaChip color="secondary" square size="small">{{ summaryItems.length }} item(s)</VaChip>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 mb-3">
            <div class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Guest</div>
            <div class="mt-1 font-black text-slate-900">
              {{ selectedGuest ? `${selectedGuest.first_name} ${selectedGuest.last_name}` : "-" }}
            </div>
            <div class="text-sm font-semibold text-slate-500">
              {{ selectedGuest?.phone || "" }}
            </div>
          </div>

          <div class="checkout-list no-scrollbar">
            <div v-if="!summaryItems.length" class="text-slate-400 font-semibold">No items.</div>

            <div v-else v-for="it in summaryItems" :key="it.id" class="checkout-item">
              <div class="min-w-0">
                <div class="font-extrabold text-slate-900 truncate">{{ it.title }}</div>
                <div class="text-xs font-semibold text-slate-500 mt-0.5 truncate">{{ it.subtitle }}</div>
              </div>
              <div class="font-black text-slate-900 whitespace-nowrap">
                ${{ formatMoney(it.lineTotal, 2) }}
              </div>
            </div>
          </div>

          <div class="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
            <div class="row2"><span>Subtotal</span><span>${{ formatMoney(subTotal, 2) }}</span></div>
            <div class="row2"><span>Discount</span><span class="text-rose-600">-${{ formatMoney(Number(booking.discount_amount || 0), 2) }}</span></div>
            <div class="row2"><span>Tax</span><span>${{ formatMoney(taxAmount, 2) }}</span></div>
            <div class="h-px bg-slate-200 my-2"></div>
            <div class="row2 text-[15px] font-black text-slate-900">
              <span>Total</span><span>${{ formatMoney(grandTotal, 2) }}</span>
            </div>
          </div>
        </div>

        <!-- RIGHT -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <div class="font-black text-slate-900 mb-3">Payment</div>

          <VaSelect
            v-model="payment.method"
            label="Payment Method"
            :options="paymentMethods"
            :text-by="(o) => o.text"
            :value-by="(o) => o.value"
          />

          <div class="grid grid-cols-2 gap-3 mt-3">
            <VaInput v-model.number="payment.paid_usd" type="number" label="Paid (USD)" min="0" step="0.01" />
            <VaInput v-model.number="payment.paid_khr" type="number" label="Paid (KHR)" min="0" step="100" />
          </div>

          <div class="grid grid-cols-2 gap-3 mt-3">
            <VaInput v-model.number="payment.rate" type="number" label="KHR Rate" min="1" step="1" />
            <VaInput v-model="payment.ref" label="Reference (ABA/Wing/Card)" />
          </div>

          <div class="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div class="row2">
              <span class="text-slate-600 font-bold text-sm">Paid Total (USD)</span>
              <span class="font-black text-slate-900">${{ formatMoney(paidTotalUSD, 2) }}</span>
            </div>
            <div class="row2 mt-1">
              <span class="text-slate-600 font-bold text-sm">Change / Balance</span>
              <span :class="balanceUSD >= 0 ? 'text-emerald-700' : 'text-rose-700'" class="font-black">
                {{ balanceUSD >= 0 ? `Change $${formatMoney(balanceUSD, 2)}` : `Due $${formatMoney(Math.abs(balanceUSD), 2)}` }}
              </span>
            </div>
          </div>

          <VaButton
            color="primary"
            icon="print"
            size="large"
            class="w-full !rounded-2xl font-black mt-4"
            :disabled="!canPayNow"
            @click="confirmCheckoutAndPay"
          >
            Pay & Print Receipt
          </VaButton>

          <div class="text-xs text-slate-500 font-semibold mt-3">
            Tip: enter USD/KHR, system converts using rate.
          </div>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { roomsListData } from "../../data/room.js"
import qz from "qz-tray"

/* -----------------------------
   GUESTS (demo)
------------------------------ */
const guests = ref([
  { guest_id: 1, first_name: "John", last_name: "Doe", phone: "555-0101", email: "john@example.com" },
  { guest_id: 2, first_name: "Jane", last_name: "Smith", phone: "555-0102", email: "jane@example.com" },
  { guest_id: 3, first_name: "Bob", last_name: "Johnson", phone: "555-0103", email: "bob@example.com" },
])

const STORAGE_KEYS = { CUSTOMER_VIEW: "customerViewData" }

const fallbackRoomPhoto =
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"

const rooms = ref(roomsListData)
const isFullscreen = ref(false)

/* -----------------------------
   SEARCH POPUP (Ctrl+K)
------------------------------ */
const searchOpen = ref(false)
const searchInputRef = ref(null)

const searchQuery = ref("")
const foundGuests = ref([])
const selectedGuest = ref(null)

const activeIndex = ref(0)

function openSearch() {
  searchOpen.value = true
  activeIndex.value = 0
  nextTick(() => {
    const el = searchInputRef.value?.$el?.querySelector("input")
    el?.focus?.()
    el?.select?.()
  })
}

function createGuestFromSearch() {
  searchOpen.value = false
  foundGuests.value = []
  activeIndex.value = 0
  guestModalOpen.value = true

  const raw = String(searchQuery.value || "").trim()
  if (!raw) return

  const parts = raw.split(/\s+/)
  newGuest.first_name = parts[0] || ""
  newGuest.last_name = parts.slice(1).join(" ") || ""
}

function closeSearch() {
  searchOpen.value = false
  foundGuests.value = []
  activeIndex.value = 0
}

function handleSearch() {
  const q = String(searchQuery.value || "").trim().toLowerCase()

  if (!q) {
    foundGuests.value = []
    activeIndex.value = 0
    return
  }

  foundGuests.value = guests.value
    .filter(
      (g) =>
        String(g.first_name || "").toLowerCase().includes(q) ||
        String(g.last_name || "").toLowerCase().includes(q) ||
        String(g.phone || "").includes(String(searchQuery.value || "").trim())
    )
    .slice(0, 10)

  activeIndex.value = 0
}

function pickGuest(g) {
  selectedGuest.value = g
  searchQuery.value = `${g.first_name} ${g.last_name}`
  foundGuests.value = []
  closeSearch()
  updateCustomerScreen()
}

function moveDown() {
  if (!foundGuests.value.length) return
  activeIndex.value = Math.min(foundGuests.value.length - 1, activeIndex.value + 1)
  scrollActiveIntoView()
}

function moveUp() {
  if (!foundGuests.value.length) return
  activeIndex.value = Math.max(0, activeIndex.value - 1)
  scrollActiveIntoView()
}

function pickHighlighted() {
  if (!foundGuests.value.length) return
  const g = foundGuests.value[activeIndex.value]
  if (g) pickGuest(g)
}

function scrollActiveIntoView() {
  nextTick(() => {
    const list = document.querySelector(".search-list")
    const active = document.querySelector(".search-item.active")
    if (!list || !active) return

    const listRect = list.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()

    if (activeRect.top < listRect.top) active.scrollIntoView({ block: "nearest" })
    if (activeRect.bottom > listRect.bottom) active.scrollIntoView({ block: "nearest" })
  })
}

/* Global shortcut: Ctrl+K */
function onGlobalKeydown(e) {
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform)
  const mod = isMac ? e.metaKey : e.ctrlKey

  if (mod && (e.key === "k" || e.key === "K")) {
    e.preventDefault()
    if (!searchOpen.value) openSearch()
    return
  }

  if (e.key === "Escape" && searchOpen.value) {
    e.preventDefault()
    closeSearch()
  }
}

/* -----------------------------
   FILTERS
------------------------------ */
const activeFloor = ref("all")
const activeBedFilter = ref("all")

const floorOptions = computed(() => {
  const set = new Set(rooms.value.map((r) => Number(r.floor)))
  const list = Array.from(set).sort((a, b) => a - b)
  return [{ text: "All Floors", value: "all" }, ...list.map((n) => ({ text: `Floor ${n}`, value: String(n) }))]
})

const bedOptions = computed(() => {
  const set = new Set(rooms.value.map((r) => Number(r.room_type?.max_occupancy || 0)))
  const list = Array.from(set).sort((a, b) => a - b)
  return [{ text: "All Beds", value: "all" }, ...list.map((n) => ({ text: `${n} Pax`, value: String(n) }))]
})

const filteredRooms = computed(() => {
  let list = rooms.value.slice()

  if (activeFloor.value !== "all") {
    const f = Number(activeFloor.value)
    list = list.filter((r) => Number(r.floor) === f)
  }

  if (activeBedFilter.value !== "all") {
    const beds = Number(activeBedFilter.value)
    list = list.filter((r) => Number(r.room_type?.max_occupancy || 0) === beds)
  }

  return list
})

/* -----------------------------
   MULTI ROOM BOOKING
------------------------------ */
const totalPax = ref(5)

const booking = reactive({
  type: "nightly",
  check_in_date: todayISO(),
  check_out_date: todayISO(),
  check_in_time: nowHHMM(),
  hours: 3,
  discount_amount: 0,
})

const bookingTypeOptions = [
  { text: "Nightly", value: "nightly" },
  { text: "Hourly", value: "hourly" },
]

const selectedRooms = ref([])

function canAddRoom(room) {
  if (room.status === "maintenance") return false
  if (room.status === "blocked") return false
  if (room.status === "occupied") return false
  return room.status === "available" || room.status === "cleaning"
}

function isRoomSelected(room_id) {
  return selectedRooms.value.some((x) => x.room_id === room_id)
}

function roomRateFor(room) {
  return booking.type === "hourly"
    ? Number(room.room_type?.hourly_price || 0)
    : Number(room.room_type?.nightly_price || 0)
}

function defaultUnits() {
  if (booking.type === "nightly") return Math.max(1, diffDays(booking.check_in_date, booking.check_out_date))
  return Math.max(1, Number(booking.hours || 1))
}

function addRoom(room) {
  if (!canAddRoom(room)) return

  if (isRoomSelected(room.room_id)) {
    alert("Room already added.")
    return
  }

  selectedRooms.value.push({
    room_id: room.room_id,
    room_number: room.room_number,
    max_occupancy: Number(room.room_type?.max_occupancy || 1),
    rate: roomRateFor(room),
    units: defaultUnits(),
    pax: 0,
    room_type_name: room.room_type?.type_name || "-",
  })

  autoDistributePax()
  updateCustomerScreen()
}

function removeRoom(room_id) {
  selectedRooms.value = selectedRooms.value.filter((r) => r.room_id !== room_id)
  autoDistributePax()
  updateCustomerScreen()
}

function autoDistributePax() {
  let remaining = Number(totalPax.value || 0)
  selectedRooms.value.forEach((r) => (r.pax = 0))

  for (const r of selectedRooms.value) {
    if (remaining <= 0) break
    const give = Math.min(remaining, r.max_occupancy)
    r.pax = give
    remaining -= give
  }
}

watch(totalPax, () => {
  autoDistributePax()
  updateCustomerScreen()
})

function onBookingTypeChange() {
  selectedRooms.value = selectedRooms.value.map((r) => {
    const original = rooms.value.find((x) => x.room_id === r.room_id)
    return {
      ...r,
      rate: original ? roomRateFor(original) : r.rate,
      units: defaultUnits(),
    }
  })
  updateCustomerScreen()
}

function onHoursChange() {
  if (booking.type !== "hourly") return
  const u = defaultUnits()
  selectedRooms.value.forEach((r) => (r.units = u))
  updateCustomerScreen()
}

function onDateChange() {
  if (booking.type !== "nightly") return
  const u = defaultUnits()
  selectedRooms.value.forEach((r) => (r.units = u))
  updateCustomerScreen()
}

function incUnits(room_id) {
  const r = selectedRooms.value.find((x) => x.room_id === room_id)
  if (!r) return
  r.units = Math.min(365, Number(r.units || 1) + 1)
  updateCustomerScreen()
}

function decUnits(room_id) {
  const r = selectedRooms.value.find((x) => x.room_id === room_id)
  if (!r) return
  r.units = Math.max(1, Number(r.units || 1) - 1)
  updateCustomerScreen()
}

/* Summary items */
const summaryItems = computed(() =>
  selectedRooms.value.map((r) => ({
    id: r.room_id,
    title: `Room #${r.room_number}`,
    subtitle:
      booking.type === "hourly"
        ? `${r.room_type_name} • Pax ${r.pax}/${r.max_occupancy} • ${r.units} hr`
        : `${r.room_type_name} • Pax ${r.pax}/${r.max_occupancy} • ${r.units} night(s)`,
    photo: fallbackRoomPhoto,
    qty: Number(r.units || 1),
    price: Number(r.rate || 0),
    lineTotal: Number(r.rate || 0) * Number(r.units || 1),
  }))
)

const totalCapacity = computed(() => selectedRooms.value.reduce((s, r) => s + Number(r.max_occupancy || 0), 0))
const subTotal = computed(() => summaryItems.value.reduce((s, it) => s + Number(it.lineTotal || 0), 0))

const taxRate = ref(0)
const taxAmount = computed(() => subTotal.value * Number(taxRate.value || 0))

const grandTotal = computed(() => {
  const discount = Number(booking.discount_amount || 0)
  return Math.max(0, subTotal.value - discount + taxAmount.value)
})

const canConfirm = computed(() => {
  if (!selectedGuest.value) return false
  if (!selectedRooms.value.length) return false
  if (Number(totalPax.value || 0) <= 0) return false
  if (Number(totalPax.value || 0) > totalCapacity.value) return false
  return true
})

/* -----------------------------
   RESERVATION NUMBER + TEXT
------------------------------ */
const nextReservationNumber = computed(() => "RES-" + (100 + rooms.value.length))

const durationText = computed(() => {
  if (booking.type === "hourly") return `${booking.hours} hours`
  const nights = Math.max(1, diffDays(booking.check_in_date, booking.check_out_date))
  return `${nights} night(s)`
})

/* -----------------------------
   CUSTOMER WINDOW (optional)
------------------------------ */
const customerWindow = ref(null)

function updateCustomerScreen() {
  const firstRoom = selectedRooms.value[0] || null
  const demoQr = "/assets/logo/qr-test.jpg"
  const data = {
    room_number: firstRoom ? String(firstRoom.room_number) : "",
    guest_name: selectedGuest.value ? `${selectedGuest.value.first_name} ${selectedGuest.value.last_name}` : "",
    total: Number(grandTotal.value || 0),
    qrImageUrl: firstRoom ? demoQr : "",
    total_pax: Number(totalPax.value || 0),
    booking_type: booking.type,
    rooms: selectedRooms.value.map((r) => ({
      room_number: r.room_number,
      pax: r.pax,
      rate: r.rate,
      units: r.units,
      line_total: Number(r.rate || 0) * Number(r.units || 1),
    })),
    subtotal: subTotal.value,
    discount: Number(booking.discount_amount || 0),
    tax: taxAmount.value,
    timestamp: Date.now(),
  }

  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_VIEW, JSON.stringify(data))
  } catch {}

  if (customerWindow.value && !customerWindow.value.closed) {
    customerWindow.value.postMessage({ type: "UPDATE", data }, "*")
  }
}

function openCustomerWindow() {
  const width = 1280
  const height = 720
  const left = window.screen.width - width
  const top = 0

  const url = new URL("/admin/pos/customer", window.location.origin).toString()

  if (customerWindow.value && !customerWindow.value.closed) {
    customerWindow.value.focus()
    updateCustomerScreen()
    return
  }

  customerWindow.value = window.open(url, "CustomerDisplay", `width=${width},height=${height},left=${left},top=${top}`)

  if (!customerWindow.value) {
    alert("Popup blocked. Please allow popups.")
    return
  }

  setTimeout(updateCustomerScreen, 600)
}

/* -----------------------------
   MODALS
------------------------------ */
const guestModalOpen = ref(false)
const newGuest = reactive({ first_name: "", last_name: "", phone: "", email: "" })

function openGuestModal() {
  guestModalOpen.value = true
  newGuest.first_name = ""
  newGuest.last_name = ""
  newGuest.phone = ""
  newGuest.email = ""
}

function closeGuestModal() {
  guestModalOpen.value = false
}

function saveNewGuest() {
  if (!newGuest.first_name || !newGuest.last_name) {
    alert("Please enter first and last name.")
    return
  }

  const maxId = Math.max(...guests.value.map((g) => Number(g.guest_id || 0)), 0)
  const guest = {
    guest_id: maxId + 1,
    first_name: newGuest.first_name,
    last_name: newGuest.last_name,
    phone: newGuest.phone,
    email: newGuest.email,
  }

  guests.value.push(guest)
  pickGuest(guest)
  closeGuestModal()
}

function openDiscountModal() {
  alert("Tip: Use Discount (USD) input in right panel.")
}

/* -----------------------------
   CHECKOUT & PAYMENT MODAL (NEW)
------------------------------ */
const checkoutOpen = ref(false)

const paymentMethods = [
  { text: "Cash", value: "cash" },
  { text: "ABA", value: "aba" },
  { text: "Wing", value: "wing" },
  { text: "Card", value: "card" },
  { text: "Bank Transfer", value: "bank" },
]

const payment = reactive({
  method: "cash",
  paid_usd: 0,
  paid_khr: 0,
  rate: 4100,
  ref: "",
})

const paidTotalUSD = computed(() => {
  const usd = Number(payment.paid_usd || 0)
  const khr = Number(payment.paid_khr || 0)
  const rate = Math.max(1, Number(payment.rate || 1))
  return usd + khr / rate
})

const balanceUSD = computed(() => {
  return paidTotalUSD.value - Number(grandTotal.value || 0)
})

const canPayNow = computed(() => {
  if (!canConfirm.value) return false
  return paidTotalUSD.value >= Number(grandTotal.value || 0)
})

function openCheckoutModal() {
  if (!canConfirm.value) {
    alert("Please select guest, add rooms, and ensure capacity >= family pax.")
    return
  }
  checkoutOpen.value = true
  payment.method = "cash"
  payment.ref = ""
  payment.rate = Number(payment.rate || 4100) || 4100
  payment.paid_usd = Number(grandTotal.value || 0)
  payment.paid_khr = 0
}

async function confirmCheckoutAndPay() {
  if (!canPayNow.value) {
    alert("Paid amount is not enough.")
    return
  }

  // Build payload same as booking + add payment
  const payload = {
    guest_id: selectedGuest.value.guest_id,
    total_pax: Number(totalPax.value),
    booking_type: booking.type,
    hours: booking.type === "hourly" ? Number(booking.hours || 1) : null,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    check_in_time: booking.check_in_time,
    discount_amount: Number(booking.discount_amount || 0),
    rooms: selectedRooms.value.map((r) => ({
      room_id: r.room_id,
      units: r.units,
      pax: r.pax,
      rate: r.rate,
      line_total: Number(r.rate || 0) * Number(r.units || 1),
    })),
    totals: {
      sub_total: subTotal.value,
      tax: taxAmount.value,
      grand_total: grandTotal.value,
    },
    payment: {
      method: payment.method,
      paid_usd: Number(payment.paid_usd || 0),
      paid_khr: Number(payment.paid_khr || 0),
      rate: Number(payment.rate || 4100),
      ref: String(payment.ref || ""),
      paid_total_usd: Number(paidTotalUSD.value || 0),
      change_usd: Math.max(0, Number(balanceUSD.value || 0)),
    },
    status: "checked_out",
    paid_at: new Date().toISOString(),
  }

  console.log("CHECKOUT PAYLOAD:", payload)

  await printThermalReceipt(payload)

  checkoutOpen.value = false
  setTimeout(resetPOS, 250)
}

/* -----------------------------
   CONFIRM + PRINT (Check-in)
------------------------------ */
async function confirmBooking() {
  if (!canConfirm.value) {
    alert("Please select guest, add rooms, and ensure capacity >= family pax.")
    return
  }

  const payload = {
    guest_id: selectedGuest.value.guest_id,
    total_pax: Number(totalPax.value),
    booking_type: booking.type,
    hours: booking.type === "hourly" ? Number(booking.hours || 1) : null,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    check_in_time: booking.check_in_time,
    discount_amount: Number(booking.discount_amount || 0),
    rooms: selectedRooms.value.map((r) => ({
      room_id: r.room_id,
      units: r.units,
      pax: r.pax,
      rate: r.rate,
      line_total: Number(r.rate || 0) * Number(r.units || 1),
    })),
    totals: {
      sub_total: subTotal.value,
      tax: taxAmount.value,
      grand_total: grandTotal.value,
    },
    status: "checked_in",
    created_at: new Date().toISOString(),
  }

  console.log("BOOKING PAYLOAD:", payload)

  await printThermalReceipt(payload)
  setTimeout(resetPOS, 300)
}

/* -----------------------------
   PRINT
------------------------------ */
async function printThermalReceipt(payload) {
  const roomsText = payload.rooms
    .map((r) => {
      const rn = rooms.value.find((x) => x.room_id === r.room_id)?.room_number || r.room_id
      const unitLabel = payload.booking_type === "hourly" ? "hr" : "night"
      return `Room ${rn}  ${r.units}${unitLabel}  pax:${r.pax}  $${formatMoney(r.line_total, 2)}\n`
    })
    .join("")

  const guestName = selectedGuest.value ? `${selectedGuest.value.first_name} ${selectedGuest.value.last_name}` : "-"

  const paidLine =
    payload.payment
      ? `Paid: $${formatMoney(payload.payment.paid_total_usd || 0, 2)}   Change: $${formatMoney(payload.payment.change_usd || 0, 2)}\n`
      : ""

  const data = [
    "\x1B\x40",
    "Palm Guesthouse\n",
    "------------------------\n",
    `Guest: ${guestName}\n`,
    `Pax: ${payload.total_pax}\n`,
    "Rooms:\n",
    roomsText,
    "------------------------\n",
    `Subtotal: $${formatMoney(payload.totals.sub_total, 2)}\n`,
    `Discount: -$${formatMoney(payload.discount_amount, 2)}\n`,
    `Total: $${formatMoney(payload.totals.grand_total, 2)}\n`,
    paidLine,
    "\n\n\n",
    "\x1D\x56\x41\x10",
  ]

  try {
    if (!qz?.websocket?.isActive?.()) await qz.websocket.connect()
    const config = qz.configs.create("Thermal Printer")
    await qz.print(config, data)
  } catch (err) {
    console.error(err)
  }
}

/* -----------------------------
   FULLSCREEN
------------------------------ */
function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen?.()
  } else {
    document.documentElement.requestFullscreen?.().catch(() => {})
  }
}
function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

/* -----------------------------
   RESET
------------------------------ */
function resetPOS() {
  selectedGuest.value = null
  searchQuery.value = ""
  foundGuests.value = []
  activeIndex.value = 0

  selectedRooms.value = []
  totalPax.value = 1

  booking.type = "nightly"
  booking.discount_amount = 0
  booking.hours = 3
  booking.check_in_date = todayISO()
  booking.check_out_date = todayISO()
  booking.check_in_time = nowHHMM()

  checkoutOpen.value = false
  payment.method = "cash"
  payment.paid_usd = 0
  payment.paid_khr = 0
  payment.ref = ""
  payment.rate = 4100

  updateCustomerScreen()
}

/* -----------------------------
   UTILS
------------------------------ */
function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
function nowHHMM() {
  return new Date().toTimeString().slice(0, 5)
}
function formatMoney(n, digits = 2) {
  const x = Number(n || 0)
  return Number.isFinite(x) ? x.toFixed(digits) : (0).toFixed(digits)
}
function niceStatus(status) {
  return String(status || "").replaceAll("_", " ")
}
function statusPillTailwind(status) {
  if (status === "available") return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (status === "occupied") return "bg-rose-50 text-rose-700 border-rose-200"
  if (status === "cleaning") return "bg-amber-50 text-amber-700 border-amber-200"
  if (status === "maintenance") return "bg-slate-100 text-slate-600 border-slate-200"
  return "bg-slate-50 text-slate-600 border-slate-200"
}
function diffDays(a, b) {
  try {
    const d1 = new Date(a + "T00:00:00")
    const d2 = new Date(b + "T00:00:00")
    const ms = d2.getTime() - d1.getTime()
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    return Number.isFinite(days) ? days : 0
  } catch {
    return 0
  }
}

/* lifecycle */
onMounted(() => {
  updateCustomerScreen()
  document.addEventListener("fullscreenchange", onFullscreenChange)
  window.addEventListener("keydown", onGlobalKeydown)
})

onBeforeUnmount(() => {
  if (customerWindow.value && !customerWindow.value.closed) customerWindow.value.close()
  document.removeEventListener("fullscreenchange", onFullscreenChange)
  window.removeEventListener("keydown", onGlobalKeydown)
})
</script>

<style scoped>
/* Hide scrollbar utility */
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* header buttons */
.pos-btn {
  height: 44px !important;
  border-radius: 14px !important;
  font-weight: 900 !important;
  padding: 0 14px !important;
}
.pos-btn-icon {
  height: 44px !important;
  width: 44px !important;
  border-radius: 14px !important;
}

/* small ctrl+k pill in input */
.kbd-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 900;
  font-size: 11px;
  user-select: none;
}
.kbd-key {
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #0f172a;
  font-weight: 950;
  line-height: 1;
}
.kbd-plus {
  opacity: 0.75;
}

/* search popup header */
.search-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 8px;
  width: 100%;
}
.search-ico {
  color: #64748b;
}
.search-input {
  flex: 1;
}
.close-btn {
  width: 36px !important;
  height: 36px !important;
  border-radius: 12px !important;
}

/* hint row */
.search-hints {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 6px 12px 10px;
  border-top: 1px solid #eef2f7;
  color: #64748b;
  font-weight: 800;
  font-size: 12px;
}
.hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.hint-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 18px;
  padding: 0 6px;
  border: 1px solid #e2e8f0;
  border-bottom-width: 2px;
  border-radius: 6px;
  background: #fff;
  color: #0f172a;
  font-weight: 900;
  font-size: 11px;
}

/* search body */
.search-body {
  padding: 10px 12px 14px;
}
.search-title {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}
.search-empty {
  padding: 12px 6px;
  font-weight: 700;
  color: #94a3b8;
}
.search-list {
  display: grid;
  gap: 8px;
  max-height: 380px;
  overflow: auto;
  padding-right: 2px;
}
.search-item {
  width: 100%;
  text-align: left;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.12s ease, border-color 0.12s ease;
}
.search-item:hover {
  background: #f8fafc;
}
.search-item.active {
  background: #f0f9ff;
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}
.search-name {
  font-weight: 900;
  font-size: 13px;
  color: #0f172a;
}
.search-sub {
  font-weight: 700;
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

/* Booking Summary card */
.bs-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 12px;
  background: #fff;
}
.bs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 10px;
}
.bs-title {
  font-weight: 1000;
  color: #0f172a;
  font-size: 14px;
}
.bs-list {
  display: grid;
  gap: 10px;
  padding: 6px 0 12px;
}
.bs-scroll {
  max-height: 280px;
  overflow: auto;
  padding-right: 6px;
}
.bs-empty {
  padding: 10px 6px;
  color: #94a3b8;
  font-weight: 700;
  font-size: 13px;
}
.bs-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.bs-left {
  display: flex;
  gap: 10px;
  min-width: 0;
}
.bs-img {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
  background: #f8fafc;
}
.bs-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.bs-info {
  min-width: 0;
}
.bs-name {
  font-weight: 950;
  font-size: 13px;
  color: #0f172a;
  line-height: 1.2;
}
.bs-sub {
  font-weight: 700;
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}
.bs-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}
.bs-btn {
  width: 30px !important;
  height: 30px !important;
  border-radius: 10px !important;
  padding: 0 !important;
}
.bs-btn-danger {
  margin-left: 6px;
}
.bs-qty {
  width: 24px;
  text-align: center;
  font-weight: 950;
  color: #0f172a;
}
.bs-price {
  font-weight: 950;
  color: #0f172a;
  font-size: 13px;
  white-space: nowrap;
  margin-top: 2px;
}
.bs-totals {
  border-top: 1px solid #eef2f7;
  padding-top: 10px;
  display: grid;
  gap: 6px;
}
.row {
  display: flex;
  justify-content: space-between;
  font-weight: 850;
  color: #334155;
  font-size: 12px;
}
.neg {
  color: #ef4444;
}
.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 6px 0;
}
.total {
  font-size: 14px;
  font-weight: 1000;
  color: #0f172a;
}

/* Checkout modal list */
.checkout-list {
  max-height: 340px;
  overflow: auto;
  padding-right: 6px;
}
.checkout-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  margin-bottom: 10px;
  background: #fff;
}
.row2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 800;
  color: #334155;
  font-size: 13px;
}
</style>
