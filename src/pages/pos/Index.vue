<template>
  <div class="h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
    <!-- Toast -->
    <div
      v-if="toast"
      class="fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl border-2 transition-all"
      :class="toast.type === 'success'
        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
        : 'bg-red-50 border-red-500 text-red-900'"
    >
      <div class="flex items-center gap-3">
        <span class="material-icons">
          {{ toast.type === 'success' ? 'check_circle' : 'error' }}
        </span>
        <span class="font-bold">{{ toast.message }}</span>
      </div>
    </div>

    <!-- Guest Modal -->
    <div
      v-if="guestModalOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click="closeGuestModal"
    >
      <div class="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" @click.stop>
        <h3 class="text-2xl font-black mb-6">Add New Guest</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold mb-2">First Name *</label>
            <input
              v-model="newGuest.first_name"
              type="text"
              class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-bold mb-2">Last Name *</label>
            <input
              v-model="newGuest.last_name"
              type="text"
              class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-bold mb-2">Phone</label>
            <input
              v-model="newGuest.phone"
              type="tel"
              class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-bold mb-2">Email</label>
            <input
              v-model="newGuest.email"
              type="email"
              class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            type="button"
            @click="closeGuestModal"
            class="flex-1 px-4 py-3 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveNewGuest"
            class="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Save Guest
          </button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <header class="h-20 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
      <!-- Search -->
      <div class="relative w-full max-w-xl">
        <span class="material-icons absolute left-3 top-3 text-slate-400 text-sm">search</span>
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search guest name / phone..."
          class="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-semibold shadow-sm outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
        />

        <div
          v-if="foundGuests.length"
          class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 max-h-72 overflow-y-auto"
        >
          <button
            v-for="g in foundGuests"
            :key="g.guest_id"
            type="button"
            @click="selectGuest(g)"
            class="w-full p-3.5 text-left hover:bg-indigo-50 transition flex items-center justify-between border-b border-slate-100 last:border-0"
          >
            <div>
              <div class="font-bold text-sm">{{ g.first_name }} {{ g.last_name }}</div>
              <div class="text-xs text-slate-500 font-medium">{{ g.phone }}</div>
            </div>
            <span class="material-icons text-indigo-500">person_add_alt_1</span>
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="openDiscountModal"
          class="px-5 py-3 rounded-md cursor-pointer text-black text-sm font-bold shadow-md hover:bg-slate-100 transition flex items-center gap-2"
        >
          <span class="material-icons">percent</span>
          DISCOUNT
        </button> 
        <button
          v-if="!isFullscreen"
          @click="enterFullscreen"
          type="button"
          class="px-5 py-3 rounded-md cursor-pointer text-black text-sm font-bold shadow-md hover:bg-slate-100 transition flex items-center gap-2"
        >
          <span class="material-icons">fullscreen</span>
          Full
        </button>
        <button
          type="button"
          @click="openCustomerWindow"
          class="px-5 py-3 rounded-md cursor-pointer text-black text-sm font-bold shadow-md hover:bg-slate-100 transition flex items-center gap-2"
        >
          <span class="material-icons">monitor</span>
          VIEW
        </button>

        <button
          type="button"
          @click="openGuestModal"
          class="px-5 py-3 rounded-md text-black cursor-pointer text-sm font-bold shadow-md hover:bg-slate-100 transition flex items-center gap-2"
        >
          <span class="material-icons">person_add</span>
          New Guest
        </button>

        <button
          type="button"
          @click="resetPOS"
          class="px-3 py-3 rounded-md cursor-pointer text-black text-sm font-bold shadow-md hover:bg-slate-100 transition flex items-center gap-2"
          title="Reset"
        >
          <span class="material-icons">settings</span>
        </button>
      </div>
    </header>

    <!-- Main -->
    <main class="h-[calc(100vh-5rem)] flex overflow-hidden">
      <!-- Rooms -->
      <section class="flex-1 flex flex-col overflow-hidden">
        <div class="px-6 lg:px-8 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">POS Rooms</h2>
            <p class="text-sm text-slate-500 mt-0.5">
              Next Reservation:
              <span class="text-indigo-600 font-bold">#{{ nextReservationNumber }}</span>
            </p>
          </div>
          <!-- Room staus -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
              <button
                type="button"
                @click="activeBedFilter = 'all'"
                class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                :class="activeBedFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
              >
                Room Status
              </button>

              <button
                v-for="bed in bedCounts"
                :key="bed"
                type="button"
                @click="activeBedFilter = bed"
                class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                :class="activeBedFilter === bed ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
              >
                {{ bed }} Bed{{ bed > 1 ? 's' : '' }}
              </button>
            </div>
          </div>
          <!-- Filter by Bed Count -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
              <button
                type="button"
                @click="activeBedFilter = 'all'"
                class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                :class="activeBedFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
              >
                All Beds
              </button>

              <button
                v-for="bed in bedCounts"
                :key="bed"
                type="button"
                @click="activeBedFilter = bed"
                class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                :class="activeBedFilter === bed ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
              >
                {{ bed }} Bed{{ bed > 1 ? 's' : '' }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-6 lg:px-8 pb-10 custom-scrollbar">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            <button
              v-for="r in filteredRooms"
              :key="r.room_id"
              type="button"
              @click="selectRoom(r)"
              class="relative text-left p-5 rounded-md bg-white transition-all duration-200 group shadow-sm hover:shadow-lg hover:-translate-y-1"
              :class="{
                'ring-4 ring-indigo-500/30 shadow-xl': selectedRoom?.room_id === r.room_id,
                'opacity-50 grayscale cursor-not-allowed pointer-events-none': r.status !== 'available',
              }"
            >
              <div class="flex items-start justify-between mb-3">
                <div>
                  <div class="text-3xl font-black text-slate-900">#{{ r.room_number }}</div>
                  <div class="text-xs font-bold text-slate-500 mt-0.5">
                    {{ getRoomType(r.room_type_id)?.type_name || '???' }} • Floor {{ r.floor }}
                  </div>
                </div>

                <span
                  class="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border"
                  :class="statusPillClass(r.status)"
                >
                  {{ (r.status || '').replace('_', ' ') }}
                </span>
              </div>

              <div class="flex items-end justify-between">
                <div class="text-xl font-black text-indigo-600">
                  ${{ (getRoomType(r.room_type_id)?.base_price || 0).toFixed(0) }}
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold text-slate-700">
                    {{ getRoomType(r.room_type_id)?.max_occupancy || 0 }} pax
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- Sidebar -->
      <aside class="w-96 bg-white border-l border-slate-200 grid grid-cols-2 shadow-xl p-6 overflow-y-auto custom-scrollbar">
        <h3 class="text-lg font-black mb-4">Check-in Details</h3>

        <div v-if="selectedGuest" class="mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <span class="text-xs font-bold text-emerald-600">GUEST</span>
          <div class="text-lg font-black text-emerald-900">
            {{ selectedGuest.first_name }} {{ selectedGuest.last_name }}
          </div>
          <div class="text-sm text-emerald-700">{{ selectedGuest.phone }}</div>
        </div>

        <div v-if="selectedRoom" class="mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
          <span class="text-xs font-bold text-indigo-400">SELECTED ROOM</span>
          <div class="text-xl font-black text-indigo-900">#{{ selectedRoom.room_number }}</div>
          <div class="text-sm text-indigo-700">{{ getRoomType(selectedRoom.room_type_id)?.type_name }}</div>
        </div>

        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-bold mb-2">Booking Type</label>
            <select
              v-model="booking.type"
              @change="updateCustomerScreen"
              class="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="night">Overnight</option>
              <option value="hourly">Hourly</option>
              <option value="day">Day Use</option>
            </select>
          </div>

          <div v-if="booking.type === 'hourly'">
            <label class="block text-sm font-bold mb-2">Hours</label>
            <input
              v-model.number="booking.hours"
              @input="updateCustomerScreen"
              type="number"
              min="1"
              max="12"
              class="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-bold mb-2">Check-in Date</label>
            <input
              v-model="booking.check_in_date"
              type="date"
              class="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-bold mb-2">Check-out Date</label>
            <input
              v-model="booking.check_in_date"
              type="date"
              class="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-bold mb-2">Check-in Time</label>
            <input
              v-model="booking.check_in_time"
              type="time"
              class="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-bold mb-2">Discount Amount</label>
            <input
              v-model.number="booking.discount_amount"
              @input="updateCustomerScreen"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div class="mt-auto space-y-4">
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div class="flex justify-between text-sm mb-2">
              <span class="font-semibold">Room Rate:</span>
              <span class="font-bold">
                ${{ (getRoomType(selectedRoom?.room_type_id)?.base_price || 0).toFixed(2) }}
              </span>
            </div>
            <div class="flex justify-between text-sm mb-2">
              <span class="font-semibold">Discount:</span>
              <span class="font-bold text-red-600">
                -${{ Number(booking.discount_amount || 0).toFixed(2) }}
              </span>
            </div>
            <div class="border-t border-slate-300 pt-2 mt-2">
              <div class="flex justify-between text-xl font-black">
                <span>Total Due:</span>
                <span class="text-indigo-600">${{ totals.final_amount.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="confirmBooking"
            class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <span class="material-icons">print</span>
            Confirm & Print
          </button>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import qz from 'qz-tray'

// ===============================
// LOCALSTORAGE KEYS
// ===============================
const STORAGE_KEYS = {
  ROOM_TYPES: 'pos_room_types',
  ROOMS: 'pos_rooms',
  GUESTS: 'pos_guests',
  CUSTOMER_VIEW: 'customerViewData'
}

// ===============================
// DEFAULT DATA
// ===============================
const DEFAULT_ROOM_TYPES = [
  { id: 1, type_name: 'Standard', base_price: 25, max_occupancy: 2 },
  { id: 2, type_name: 'Deluxe', base_price: 45, max_occupancy: 3 },
  { id: 3, type_name: 'Suite', base_price: 75, max_occupancy: 4 }
]

const DEFAULT_ROOMS = [
  { room_id: 1, room_number: '101', room_type_id: 1, floor: 1, status: 'available' },
  { room_id: 2, room_number: '102', room_type_id: 1, floor: 1, status: 'available' },
  { room_id: 3, room_number: '103', room_type_id: 2, floor: 1, status: 'occupied' },
  { room_id: 4, room_number: '104', room_type_id: 2, floor: 1, status: 'available' },
  { room_id: 5, room_number: '201', room_type_id: 2, floor: 2, status: 'available' },
  { room_id: 6, room_number: '202', room_type_id: 3, floor: 2, status: 'available' },
  { room_id: 7, room_number: '203', room_type_id: 3, floor: 2, status: 'available' },
  { room_id: 8, room_number: '301', room_type_id: 3, floor: 3, status: 'available' }
]

const DEFAULT_GUESTS = [
  { guest_id: 1, first_name: 'John', last_name: 'Doe', phone: '555-0101', email: 'john@example.com' },
  { guest_id: 2, first_name: 'Jane', last_name: 'Smith', phone: '555-0102', email: 'jane@example.com' },
  { guest_id: 3, first_name: 'Bob', last_name: 'Johnson', phone: '555-0103', email: 'bob@example.com' }
]

// ===============================
// LOCALSTORAGE HELPERS
// ===============================
function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error)
    return defaultValue
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}

// ===============================
// STATE
// ===============================
const isFullscreen = ref(false)
const searchQuery = ref('')
const foundGuests = ref([])
const selectedGuest = ref(null)
const selectedRoom = ref(null)
const activeFloor = ref('all')
const activeBedFilter = ref('all')
const toast = ref(null)
const customerWindow = ref(null)
const guestModalOpen = ref(false)

const newGuest = reactive({
  first_name: '',
  last_name: '',
  phone: '',
  email: ''
})

const booking = reactive({
  type: 'night',
  check_in_date: new Date().toISOString().slice(0, 10),
  check_in_time: new Date().toTimeString().slice(0, 5),
  check_out_time: '15:00',
  hours: 3,
  discount_amount: 0
})

const currentUser = ref({ first_name: 'Admin', last_name: 'User' })
const currentRole = ref('Manager')

// Load data from localStorage or use defaults
const roomTypes = ref(loadFromStorage(STORAGE_KEYS.ROOM_TYPES, DEFAULT_ROOM_TYPES))
const rooms = ref(loadFromStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS))
const guests = ref(loadFromStorage(STORAGE_KEYS.GUESTS, DEFAULT_GUESTS))

// ===============================
// WATCHERS FOR AUTO-SAVE
// ===============================
watch(roomTypes, (newValue) => {
  saveToStorage(STORAGE_KEYS.ROOM_TYPES, newValue)
}, { deep: true })

watch(rooms, (newValue) => {
  saveToStorage(STORAGE_KEYS.ROOMS, newValue)
}, { deep: true })

watch(guests, (newValue) => {
  saveToStorage(STORAGE_KEYS.GUESTS, newValue)
}, { deep: true })

// ===============================
// COMPUTED
// ===============================
const nextReservationNumber = computed(() => 'RES-' + (100 + rooms.value.length))
const nextInvoiceNumber = computed(() => 'INV-' + Date.now())

const floors = computed(() => {
  const set = new Set(rooms.value.map(r => r.floor))
  return Array.from(set).sort((a, b) => a - b)
})

const bedCounts = computed(() => {
  const set = new Set(roomTypes.value.map(rt => rt.max_occupancy))
  return Array.from(set).sort((a, b) => a - b)
})

const filteredRooms = computed(() => {
  let filtered = rooms.value
  
  // Filter by floor
  if (activeFloor.value !== 'all') {
    const floorNum = Number(activeFloor.value)
    filtered = filtered.filter(r => Number(r.floor) === floorNum)
  }
  
  // Filter by bed count (max_occupancy)
  if (activeBedFilter.value !== 'all') {
    const bedCount = Number(activeBedFilter.value)
    filtered = filtered.filter(r => {
      const roomType = getRoomType(r.room_type_id)
      return roomType?.max_occupancy === bedCount
    })
  }
  
  return filtered
})

const durationText = computed(() => {
  if (booking.type === 'night') return 'Overnight'
  if (booking.type === 'hourly') return booking.hours + ' hours'
  return 'Day Use'
})

const totals = computed(() => {
  if (!selectedRoom.value) return { final_amount: 0 }
  const roomType = getRoomType(selectedRoom.value.room_type_id)
  const basePrice = roomType?.base_price || 0
  let final = basePrice
  if (booking.type === 'hourly') {
    final = basePrice * 0.5 * (booking.hours / 3)
  }
  final -= Number(booking.discount_amount || 0)
  return { final_amount: Math.max(0, final) }
})

// ===============================
// METHODS
// ===============================
function getRoomType(id) {
  return roomTypes.value.find(t => t.id === id)
}

function statusPillClass(status) {
  if (status === 'available') return 'bg-emerald-50 text-emerald-600 border-emerald-100'
  if (status === 'occupied') return 'bg-red-50 text-red-600 border-red-100'
  return 'bg-slate-100 text-slate-400 border-slate-200'
}

function handleSearch() {
  const q = searchQuery.value.trim().toLowerCase()
  if (q.length > 2) {
    foundGuests.value = guests.value.filter(g =>
      (g.first_name || '').toLowerCase().includes(q) ||
      (g.last_name || '').toLowerCase().includes(q) ||
      (g.phone || '').includes(searchQuery.value.trim())
    )
  } else {
    foundGuests.value = []
  }
}

function selectGuest(guest) {
  selectedGuest.value = guest
  searchQuery.value = `${guest.first_name} ${guest.last_name}`
  foundGuests.value = []
  updateCustomerScreen()
}

function openGuestModal() {
  guestModalOpen.value = true
  newGuest.first_name = ''
  newGuest.last_name = ''
  newGuest.phone = ''
  newGuest.email = ''
}

function closeGuestModal() {
  guestModalOpen.value = false
}

function openDiscountModal() {
  // You can implement discount modal here
  showToast('Discount feature - coming soon!', 'success')
}

function saveNewGuest() {
  if (!newGuest.first_name || !newGuest.last_name) {
    showToast('Please enter first and last name', 'error')
    return
  }

  const maxId = Math.max(...guests.value.map(g => g.guest_id), 0)
  const guest = {
    guest_id: maxId + 1,
    first_name: newGuest.first_name,
    last_name: newGuest.last_name,
    phone: newGuest.phone,
    email: newGuest.email
  }

  guests.value.push(guest)
  selectGuest(guest)
  closeGuestModal()
  showToast('Guest added successfully!', 'success')
}

function selectRoom(room) {
  if (room.status !== 'available') return
  selectedRoom.value = room
  updateCustomerScreen()
}

function updateCustomerScreen() {
  const data = {
    room_number: selectedRoom.value?.room_number || '',
    guest_name: selectedGuest.value ? `${selectedGuest.value.first_name} ${selectedGuest.value.last_name}` : '',
    total: totals.value.final_amount,
    timestamp: Date.now()
  }

  saveToStorage(STORAGE_KEYS.CUSTOMER_VIEW, data)

  if (customerWindow.value && !customerWindow.value.closed) {
    customerWindow.value.postMessage({ type: 'UPDATE', data }, '*')
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
    showToast('Popup blocked. Please allow popups.', 'error')
    return
  }

  setTimeout(() => {
    updateCustomerScreen()
  }, 600)
}

function enterFullscreen() {
  document.documentElement.requestFullscreen().catch(() => {})
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

async function printThermalReceipt() {
  try {
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect()
    }

    const config = qz.configs.create('Thermal Printer')

    

    await qz.print(config, data)
  } catch (err) {
    console.error(err)
    showToast('Cannot connect to printer. Check QZ Tray & printer name.', 'error')
  }
}

async function confirmBooking() {
  if (!selectedRoom.value) return showToast('Please select a room', 'error')
  if (!selectedGuest.value) return showToast('Please select a guest', 'error')

  await printThermalReceipt()
  showToast('Booking confirmed! Receipt printed.', 'success')

  const r = rooms.value.find(x => x.room_id === selectedRoom.value.room_id)
  if (r) r.status = 'occupied'

  setTimeout(resetPOS, 1500)
}

function resetPOS() {
  selectedRoom.value = null
  selectedGuest.value = null
  searchQuery.value = ''
  foundGuests.value = []
  booking.type = 'night'
  booking.discount_amount = 0
  booking.hours = 3
  booking.check_in_date = new Date().toISOString().slice(0, 10)
  booking.check_in_time = new Date().toTimeString().slice(0, 5)

  updateCustomerScreen()
}

function showToast(message, type = 'success') {
  toast.value = { message, type }
  setTimeout(() => (toast.value = null), 3000)
}

// ===============================
// LIFECYCLE
// ===============================
onMounted(() => {
  updateCustomerScreen()
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onBeforeUnmount(() => {
  if (customerWindow.value && !customerWindow.value.closed) {
    customerWindow.value.close()
  }
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
</style>