<!-- src/pages/pos/PosRooms.vue -->
<template>
  <div class="min-h-screen w-screen bg-slate-50 text-slate-900">
    <!-- TOP BAR -->
    <header
      class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200"
    >
      <div class="w-full px-4 lg:px-6 py-3">
        <div class="flex items-center justify-between gap-3">
          <!-- Search -->
          <div class="relative flex-1 max-w-2xl">
            <VaInput
              v-model="searchQuery"
              clearable
              :placeholder="'Search guest name / phone...'"
              class="w-full"
              @update:modelValue="handleSearch"
            >
              <template #prependInner>
                <VaIcon name="search" color="secondary" />
              </template>
            </VaInput>

            <!-- Dropdown results -->
            <div
              v-if="foundGuests.length"
              class="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
            >
              <button
                v-for="g in foundGuests"
                :key="g.guest_id"
                type="button"
                class="w-full px-4 py-3 text-left hover:bg-sky-50 transition flex items-center justify-between border-b border-slate-100 last:border-0"
                @click="selectGuest(g)"
              >
                <div>
                  <div class="font-extrabold text-sm">
                    {{ g.first_name }} {{ g.last_name }}
                  </div>
                  <div class="text-xs text-slate-500 font-semibold mt-0.5">
                    {{ g.phone }}
                  </div>
                </div>
                <VaIcon name="person" color="primary" />
              </button>
            </div>
          </div>

          <!-- Actions (BIGGER) -->
          <div class="flex items-center gap-2">
            <VaButton
              preset="secondary"
              icon="percent"
              class="pos-btn"
              @click="openDiscountModal"
            >
              Discount
            </VaButton>

            <VaButton
              preset="secondary"
              icon="monitor"
              class="pos-btn"
              @click="openCustomerWindow"
            >
              View
            </VaButton>

            <VaButton
              preset="primary"
              icon="person_add"
              class="pos-btn"
              @click="openGuestModal"
            >
              New Guest
            </VaButton>

            <VaButton
              preset="secondary"
              :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
              class="pos-btn-icon"
              @click="toggleFullscreen"
            />

            <VaButton
              preset="secondary"
              icon="restart_alt"
              class="pos-btn-icon"
              @click="resetPOS"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- MAIN -->
    <main class="w-full h-[calc(100vh-72px)] lg:h-[calc(100vh-80px)]">
      <div class="h-full grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4 p-4 lg:p-6">
        <!-- LEFT -->
        <section class="min-h-0 flex flex-col">
          <div class="flex items-end justify-between gap-4 pb-3">
            <div>
              <h1 class="text-xl lg:text-2xl font-black tracking-tight">
                POS · Rooms
              </h1>
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

          <!-- Rooms grid (TRUE 5 columns on big screen) -->
          <div class="min-h-0 flex-1 overflow-auto pr-1">
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
                  'ring-4 ring-sky-500/25 border-sky-300 shadow-xl': selectedRoom?.room_id === r.room_id,
                  'opacity-55 grayscale cursor-not-allowed pointer-events-none': r.status !== 'available',
                }"
                @click="selectRoom(r)"
              >
                <!-- Room Photo -->
                <div class="relative h-28">
                  <img
                    :src="r.photo || fallbackRoomPhoto"
                    alt="Room photo"
                    class="h-full w-full object-cover"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>

                  <!-- Status badge -->
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
                    <div class="text-white text-2xl font-black leading-none">
                      #{{ r.room_number }}
                    </div>
                    <div class="text-white/85 text-xs font-semibold mt-1">
                      {{ getRoomType(r.room_type_id)?.type_name || "Unknown" }} • Floor {{ r.floor }}
                    </div>
                  </div>
                </div>

                <!-- Bottom -->
                <div class="p-4 flex items-end justify-between gap-2">
                  <div>
                    <div class="text-sky-600 text-lg font-black">
                      ${{ formatMoney(getRoomType(r.room_type_id)?.base_price || 0, 0) }}
                    </div>
                    <div class="text-xs text-slate-500 font-semibold mt-1">
                      {{ getRoomType(r.room_type_id)?.max_occupancy || 0 }} pax
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-xs text-slate-500 font-semibold">Type</div>
                    <div class="text-sm font-extrabold text-slate-800">
                      {{ getRoomType(r.room_type_id)?.type_name || "-" }}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>

        <!-- RIGHT -->
        <aside class="min-h-0 overflow-auto">
          <VaCard class="rounded-2xl border border-slate-200 shadow-sm p-4 lg:p-5">
            <div class="flex items-center justify-between gap-3 mb-4">
              <div class="text-base lg:text-lg font-black">Check-in Details</div>
              <VaChip color="secondary" square>{{ durationText }}</VaChip>
            </div>

            <!-- Selected -->
            <div class="grid gap-3 mb-4">
              <div
                class="rounded-2xl border p-4"
                :class="selectedGuest ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'"
              >
                <div class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Guest
                </div>
                <div v-if="selectedGuest" class="mt-1 text-lg font-black text-emerald-900">
                  {{ selectedGuest.first_name }} {{ selectedGuest.last_name }}
                </div>
                <div v-if="selectedGuest" class="text-sm font-semibold text-emerald-700">
                  {{ selectedGuest.phone }}
                </div>
                <div v-else class="mt-1 text-sm text-slate-500 font-semibold">
                  Search guest or add new guest.
                </div>
              </div>

              <div
                class="rounded-2xl border p-4"
                :class="selectedRoom ? 'bg-sky-50 border-sky-100' : 'bg-slate-50 border-slate-200'"
              >
                <div class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Room
                </div>
                <div v-if="selectedRoom" class="mt-1 text-lg font-black text-sky-900">
                  #{{ selectedRoom.room_number }}
                </div>
                <div v-if="selectedRoom" class="text-sm font-semibold text-sky-700">
                  {{ getRoomType(selectedRoom.room_type_id)?.type_name }}
                </div>
                <div v-else class="mt-1 text-sm text-slate-500 font-semibold">
                  Select an available room.
                </div>
              </div>
            </div>

            <!-- Form -->
            <div class="grid gap-3 mb-4">
              <VaSelect
                v-model="booking.type"
                label="Booking Type"
                :options="bookingTypeOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
                @update:modelValue="updateCustomerScreen"
              />

              <VaInput
                v-if="booking.type === 'hourly'"
                v-model.number="booking.hours"
                type="number"
                label="Hours"
                :min="1"
                :max="12"
                @update:modelValue="updateCustomerScreen"
              >
                <template #appendInner>h</template>
              </VaInput>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <VaInput v-model="booking.check_in_date" type="date" label="Check-in Date" />
                <VaInput v-model="booking.check_out_date" type="date" label="Check-out Date" />
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

            <!-- Totals -->
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-4">
              <div class="flex items-center justify-between text-sm font-bold text-slate-700 mb-2">
                <span>Room rate</span>
                <span>${{ formatMoney(roomRate, 2) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm font-bold text-slate-700 mb-2">
                <span>Discount</span>
                <span class="text-red-600">-${{ formatMoney(Number(booking.discount_amount || 0), 2) }}</span>
              </div>
              <div class="h-px bg-slate-200 my-3"></div>
              <div class="flex items-center justify-between text-lg font-black">
                <span>Total Due</span>
                <span class="text-sky-600">${{ formatMoney(totals.final_amount, 2) }}</span>
              </div>
            </div>

            <VaButton
              color="primary"
              icon="print"
              size="large"
              class="w-full rounded-2xl font-black tracking-wide"
              :disabled="!selectedRoom || !selectedGuest"
              @click="confirmBooking"
            >
              Confirm & Print
            </VaButton>

            <div class="text-center text-xs text-slate-500 font-semibold mt-3">
              Tip: Select guest → select room → confirm.
            </div>
          </VaCard>
        </aside>
      </div>
    </main>

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
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import qz from "qz-tray"

const STORAGE_KEYS = {
  ROOM_TYPES: "pos_room_types",
  ROOMS: "pos_rooms",
  GUESTS: "pos_guests",
  CUSTOMER_VIEW: "customerViewData",
}

const fallbackRoomPhoto =
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"

const DEFAULT_ROOM_TYPES = [
  { id: 1, type_name: "Standard", base_price: 25, max_occupancy: 2 },
  { id: 2, type_name: "Deluxe", base_price: 45, max_occupancy: 3 },
  { id: 3, type_name: "Suite", base_price: 75, max_occupancy: 4 },
]

const DEFAULT_ROOMS = [
  { room_id: 1, room_number: "101", room_type_id: 1, floor: 1, status: "available", photo: fallbackRoomPhoto },
  { room_id: 2, room_number: "102", room_type_id: 1, floor: 1, status: "available", photo: fallbackRoomPhoto },
  { room_id: 3, room_number: "103", room_type_id: 2, floor: 1, status: "occupied", photo: fallbackRoomPhoto },
  { room_id: 4, room_number: "104", room_type_id: 2, floor: 1, status: "available", photo: fallbackRoomPhoto },
  { room_id: 5, room_number: "201", room_type_id: 2, floor: 2, status: "available", photo: fallbackRoomPhoto },
  { room_id: 6, room_number: "202", room_type_id: 3, floor: 2, status: "available", photo: fallbackRoomPhoto },
  { room_id: 7, room_number: "203", room_type_id: 3, floor: 2, status: "maintenance", photo: fallbackRoomPhoto },
  { room_id: 8, room_number: "301", room_type_id: 3, floor: 3, status: "available", photo: fallbackRoomPhoto },
]

const DEFAULT_GUESTS = [
  { guest_id: 1, first_name: "John", last_name: "Doe", phone: "555-0101", email: "john@example.com" },
  { guest_id: 2, first_name: "Jane", last_name: "Smith", phone: "555-0102", email: "jane@example.com" },
  { guest_id: 3, first_name: "Bob", last_name: "Johnson", phone: "555-0103", email: "bob@example.com" },
]

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

const isFullscreen = ref(false)

const searchQuery = ref("")
const foundGuests = ref([])
const selectedGuest = ref(null)
const selectedRoom = ref(null)

const activeFloor = ref("all")
const activeBedFilter = ref("all")

const customerWindow = ref(null)

const guestModalOpen = ref(false)
const newGuest = reactive({ first_name: "", last_name: "", phone: "", email: "" })

const todayISO = () => new Date().toISOString().slice(0, 10)
const nowHHMM = () => new Date().toTimeString().slice(0, 5)

const booking = reactive({
  type: "night",
  check_in_date: todayISO(),
  check_out_date: todayISO(),
  check_in_time: nowHHMM(),
  hours: 3,
  discount_amount: 0,
})

const roomTypes = ref(loadFromStorage(STORAGE_KEYS.ROOM_TYPES, DEFAULT_ROOM_TYPES))
const rooms = ref(loadFromStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS))
const guests = ref(loadFromStorage(STORAGE_KEYS.GUESTS, DEFAULT_GUESTS))

watch(roomTypes, v => saveToStorage(STORAGE_KEYS.ROOM_TYPES, v), { deep: true })
watch(rooms, v => saveToStorage(STORAGE_KEYS.ROOMS, v), { deep: true })
watch(guests, v => saveToStorage(STORAGE_KEYS.GUESTS, v), { deep: true })

const bookingTypeOptions = [
  { text: "Overnight", value: "night" },
  { text: "Hourly", value: "hourly" },
  { text: "Day Use", value: "day" },
]

const nextReservationNumber = computed(() => "RES-" + (100 + rooms.value.length))

const floorOptions = computed(() => {
  const set = new Set(rooms.value.map(r => Number(r.floor)))
  const list = Array.from(set).sort((a, b) => a - b)
  return [{ text: "All Floors", value: "all" }, ...list.map(n => ({ text: `Floor ${n}`, value: String(n) }))]
})

const bedOptions = computed(() => {
  const set = new Set(roomTypes.value.map(rt => Number(rt.max_occupancy)))
  const list = Array.from(set).sort((a, b) => a - b)
  return [{ text: "All Beds", value: "all" }, ...list.map(n => ({ text: `${n} Bed${n > 1 ? "s" : ""}`, value: String(n) }))]
})

const filteredRooms = computed(() => {
  let list = rooms.value.slice()

  if (activeFloor.value !== "all") {
    const f = Number(activeFloor.value)
    list = list.filter(r => Number(r.floor) === f)
  }

  if (activeBedFilter.value !== "all") {
    const beds = Number(activeBedFilter.value)
    list = list.filter(r => getRoomType(r.room_type_id)?.max_occupancy === beds)
  }

  return list
})

const durationText = computed(() => {
  if (booking.type === "night") return "Overnight"
  if (booking.type === "hourly") return `${booking.hours} hours`
  return "Day Use"
})

const roomRate = computed(() => {
  if (!selectedRoom.value) return 0
  const rt = getRoomType(selectedRoom.value.room_type_id)
  return Number(rt?.base_price || 0)
})

const totals = computed(() => {
  if (!selectedRoom.value) return { final_amount: 0 }

  let base = roomRate.value
  if (booking.type === "hourly") {
    base = base * 0.5 * (Number(booking.hours || 1) / 3)
  }

  const discount = Number(booking.discount_amount || 0)
  return { final_amount: Math.max(0, base - discount) }
})

function formatMoney(n, digits = 2) {
  const x = Number(n || 0)
  return Number.isFinite(x) ? x.toFixed(digits) : (0).toFixed(digits)
}

function getRoomType(id) {
  return roomTypes.value.find(t => t.id === id)
}

function niceStatus(status) {
  return String(status || "").replaceAll("_", " ")
}

function statusPillTailwind(status) {
  if (status === "available") return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (status === "occupied") return "bg-rose-50 text-rose-700 border-rose-200"
  if (status === "maintenance") return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-slate-50 text-slate-600 border-slate-200"
}

function handleSearch() {
  const q = String(searchQuery.value || "").trim().toLowerCase()
  if (q.length < 2) {
    foundGuests.value = []
    return
  }
  foundGuests.value = guests.value
    .filter(g =>
      String(g.first_name || "").toLowerCase().includes(q) ||
      String(g.last_name || "").toLowerCase().includes(q) ||
      String(g.phone || "").includes(String(searchQuery.value || "").trim())
    )
    .slice(0, 8)
}

function selectGuest(guest) {
  selectedGuest.value = guest
  searchQuery.value = `${guest.first_name} ${guest.last_name}`
  foundGuests.value = []
  updateCustomerScreen()
}

function selectRoom(room) {
  if (room.status !== "available") return
  selectedRoom.value = room
  updateCustomerScreen()
}

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

function openDiscountModal() {
  alert("Tip: Use Discount (USD) input in right panel.")
}

function saveNewGuest() {
  if (!newGuest.first_name || !newGuest.last_name) {
    alert("Please enter first and last name.")
    return
  }

  const maxId = Math.max(...guests.value.map(g => Number(g.guest_id || 0)), 0)
  const guest = {
    guest_id: maxId + 1,
    first_name: newGuest.first_name,
    last_name: newGuest.last_name,
    phone: newGuest.phone,
    email: newGuest.email,
  }

  guests.value.push(guest)
  selectGuest(guest)
  closeGuestModal()
}

function updateCustomerScreen() {
  const data = {
    room_number: selectedRoom.value?.room_number || "",
    guest_name: selectedGuest.value ? `${selectedGuest.value.first_name} ${selectedGuest.value.last_name}` : "",
    total: totals.value.final_amount,
    timestamp: Date.now(),
  }

  saveToStorage(STORAGE_KEYS.CUSTOMER_VIEW, data)

  if (customerWindow.value && !customerWindow.value.closed) {
    customerWindow.value.postMessage({ type: "UPDATE", data }, "*")
  }
}

function openCustomerWindow() {
  const width = 1280
  const height = 720
  const left = window.screen.width - width
  const top = 0

  if (customerWindow.value && !customerWindow.value.closed) {
    customerWindow.value.focus()
    updateCustomerScreen()
    return
  }

  customerWindow.value = window.open(
    "/admin/pos/customer",
    "CustomerDisplay",
    `width=${width},height=${height},left=${left},top=${top}`
  )

  if (!customerWindow.value) {
    alert("Popup blocked. Please allow popups.")
    return
  }

  setTimeout(updateCustomerScreen, 600)
}

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

async function printThermalReceipt() {
  const data = [
    "\x1B\x40",
    "Palm Guesthouse\n",
    "------------------------\n",
    `Room: ${selectedRoom.value?.room_number || "-"}\n`,
    `Guest: ${selectedGuest.value ? `${selectedGuest.value.first_name} ${selectedGuest.value.last_name}` : "-"}\n`,
    `Total: $${formatMoney(totals.value.final_amount, 2)}\n`,
    "------------------------\n",
    "\n\n\n",
    "\x1D\x56\x41\x10",
  ]

  try {
    if (!qz?.websocket?.isActive?.()) await qz.websocket.connect()
    const config = qz.configs.create("Thermal Printer")
    await qz.print(config, data)
  } catch (err) {
    console.error(err)
    alert("Cannot connect to printer. Check QZ Tray + printer name.")
  }
}

async function confirmBooking() {
  if (!selectedRoom.value) return alert("Please select a room.")
  if (!selectedGuest.value) return alert("Please select a guest.")

  await printThermalReceipt()

  const r = rooms.value.find(x => x.room_id === selectedRoom.value.room_id)
  if (r) r.status = "occupied"

  setTimeout(resetPOS, 400)
}

function resetPOS() {
  selectedRoom.value = null
  selectedGuest.value = null
  searchQuery.value = ""
  foundGuests.value = []

  booking.type = "night"
  booking.discount_amount = 0
  booking.hours = 3
  booking.check_in_date = todayISO()
  booking.check_out_date = todayISO()
  booking.check_in_time = nowHHMM()

  updateCustomerScreen()
}

onMounted(() => {
  updateCustomerScreen()
  document.addEventListener("fullscreenchange", onFullscreenChange)
})

onBeforeUnmount(() => {
  if (customerWindow.value && !customerWindow.value.closed) customerWindow.value.close()
  document.removeEventListener("fullscreenchange", onFullscreenChange)
})
</script>

<style scoped>
/* Make Vuestic buttons BIGGER in header */
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
</style>
