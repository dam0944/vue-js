<!-- src/pages/pos/CustomerView.vue -->
<template>
  <div class="min-h-screen bg-slate-950 text-white overflow-hidden">
    <!-- Top bar (only when NOT fullscreen) -->
    <div
      v-if="!isFullscreen"
      class="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur border-b border-white/10"
    >
      <div class="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <div class="font-black text-xl tracking-tight">Customer Display</div>
        <button
          @click="enterFullscreen"
          class="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 font-bold transition"
        >
          Enter Fullscreen
        </button>
      </div>
    </div>

    <!-- ====== WAITING MODE (No room) ====== -->
    <div v-if="!hasRoom" class="relative h-screen w-full">
      <!-- Background slider -->
      <transition name="fade" mode="out-in">
        <img
          :key="activeSlide"
          :src="slides[activeSlide]"
          class="absolute inset-0 h-full w-full object-cover"
          alt="slide"
        />
      </transition>

      <!-- Dark overlay -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black50"></div>

      <!-- Center content -->
      <div class="relative h-full flex items-center justify-center px-6">
        <div class="w-full max-w-3xl text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-sm font-bold tracking-wide">READY</span>
          </div>

          <h1 class="mt-6 text-5xl sm:text-6xl font-black tracking-tight">
            Please wait…
          </h1>
          <p class="mt-4 text-lg sm:text-xl text-white/80 font-semibold">
            Reception is preparing your check-in.
          </p>

          <div class="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div class="rounded-3xl bg-white/8 border border-white/10 p-5">
              <div class="text-xs uppercase tracking-[0.2em] text-white/60 font-black">Step 1</div>
              <div class="mt-2 font-black text-xl">Select room</div>
              <div class="mt-1 text-white/70 font-medium">Reception chooses available room.</div>
            </div>
            <div class="rounded-3xl bg-white/8 border border-white/10 p-5">
              <div class="text-xs uppercase tracking-[0.2em] text-white/60 font-black">Step 2</div>
              <div class="mt-2 font-black text-xl">Confirm guest</div>
              <div class="mt-1 text-white/70 font-medium">Guest details will appear here.</div>
            </div>
            <div class="rounded-3xl bg-white/8 border border-white/10 p-5">
              <div class="text-xs uppercase tracking-[0.2em] text-white/60 font-black">Step 3</div>
              <div class="mt-2 font-black text-xl">Pay</div>
              <div class="mt-1 text-white/70 font-medium">Scan QR or pay at counter.</div>
            </div>
          </div>

          <div class="mt-10 text-white/60 font-semibold">
            Tip: keep this screen open for faster check-in.
          </div>
        </div>
      </div>

      <!-- Bottom hint -->
      <div class="absolute bottom-6 left-0 right-0 px-6">
        <div class="mx-auto max-w-6xl flex items-center justify-between text-white/60">
          <div class="text-sm font-semibold">Guesthouse • Customer Display</div>
          <div class="text-sm font-semibold">{{ nowText }}</div>
        </div>
      </div>
    </div>

    <!-- ====== CHECK-IN MODE (Room selected) ====== -->
    <div v-else class="relative h-screen w-full">
      <!-- Soft background -->
      <div class="absolute inset-0"></div>
      <div class="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl"></div>
      <div class="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"></div>

      <div class="relative h-full">
        <div class="mx-auto max-w-6xl px-6 pt-10 pb-8 h-full flex flex-col">
          <!-- Header -->
          <div class="flex items-start justify-between gap-6">
            <div>
              <div class="text-white/60 text-xs uppercase tracking-[0.25em] font-black">
                Check-in Summary
              </div>
              <div class="mt-2 text-4xl sm:text-5xl font-black tracking-tight">
                Room <span class="text-indigo-300">#{{ roomNumber }}</span>
              </div>
              <div class="mt-3 text-lg sm:text-xl text-white/80 font-semibold">
                Guest: <span class="text-white font-black">{{ guestName || "-" }}</span>
              </div>
            </div>

            <div class="text-right">
              <div class="text-white/60 text-xs uppercase tracking-[0.25em] font-black">Time</div>
              <div class="mt-2 text-xl font-black">{{ nowText }}</div>
            </div>
          </div>

          <!-- Main cards -->
          <div class="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
            <!-- Total -->
            <div class="lg:col-span-3 rounded-[28px] bg-white/8 border border-white/10 backdrop-blur p-8 sm:p-10">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-white/60 text-xs uppercase tracking-[0.25em] font-black">
                    Total to Pay
                  </div>
                  <div class="mt-3 text-6xl sm:text-7xl font-black text-emerald-300 tracking-tight">
                    ${{ total.toFixed(2) }}
                  </div>
                </div>

                <div class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                  <span class="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="text-sm font-black text-emerald-200 tracking-wide">PAYMENT READY</span>
                </div>
              </div>

              <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="rounded-2xl bg-black/25 border border-white/10 p-5">
                  <div class="text-white/60 text-xs uppercase tracking-[0.25em] font-black">Method</div>
                  <div class="mt-2 text-xl font-black">Scan QR</div>
                  <div class="mt-1 text-white/70 font-medium">Use your banking app.</div>
                </div>
                <div class="rounded-2xl bg-black/25 border border-white/10 p-5">
                  <div class="text-white/60 text-xs uppercase tracking-[0.25em] font-black">Alternative</div>
                  <div class="mt-2 text-xl font-black">Pay at Counter</div>
                  <div class="mt-1 text-white/70 font-medium">Cash / Card supported.</div>
                </div>
              </div>

              <div class="mt-8 text-white/60 font-semibold">
                If amount looks wrong, please inform reception.
              </div>
            </div>

            <!-- QR -->
            <div class="lg:col-span-2 rounded-[28px] bg-white/8 border border-white/10 backdrop-blur p-8 sm:p-10 flex flex-col">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-white/60 text-xs uppercase tracking-[0.25em] font-black">
                    Scan to Pay
                  </div>
                  <div class="mt-2 text-2xl font-black">QR Code</div>
                </div>
                <div class="text-white/60 text-sm font-semibold">KHQR / Bank App</div>
              </div>

              <div class="mt-7 flex-1 flex items-center justify-center">
                <div class="rounded-3xl bg-white p-4 shadow-2xl">
                  <img
                    v-if="qrImageUrl"
                    :src="qrImageUrl"
                    class="w-[280px] h-[280px] object-contain"
                    alt="qr"
                  />
                  <div v-else class="w-[280px] h-[280px] flex items-center justify-center text-slate-700">
                    <div class="text-center">
                      <div class="text-xl font-black">QR not available</div>
                      <div class="mt-2 text-sm font-semibold text-slate-500">
                        Reception can generate QR.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 text-white/70 font-semibold text-center">
                Open your banking app → Scan QR → Confirm payment
              </div>

              <button
                v-if="!isFullscreen"
                @click="enterFullscreen"
                class="mt-6 w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 font-black transition"
              >
                Fullscreen Mode
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-8 flex items-center justify-between text-white/55">
            <div class="text-sm font-semibold">Guesthouse • Customer Display</div>
            <div class="text-sm font-semibold">Room #{{ roomNumber }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue"
import p1 from "../../assets/images/customers/p1.jpg"
import p2 from "../../assets/images/customers/p2.jpg"
import p3 from "../../assets/images/customers/p3.jpg"

const isFullscreen = ref(false)

const slides = ref([
  p1,
  p2,
  p3,
])

const activeSlide = ref(0)
let sliderTimer = null
let pollTimer = null
let clockTimer = null

// localStorage values
const roomNumber = ref("")
const guestName = ref("")
const total = ref(0)
const qrImageUrl = ref("") // optional (if you later store it)

const hasRoom = computed(() => !!roomNumber.value)

// live clock text
const nowText = ref("")
function tickClock() {
  const d = new Date()
  nowText.value = d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function startSlider() {
  stopSlider()
  sliderTimer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.value.length
  }, 3500)
}
function stopSlider() {
  if (sliderTimer) {
    clearInterval(sliderTimer)
    sliderTimer = null
  }
}

function enterFullscreen() {
  document.documentElement.requestFullscreen().catch(() => {})
}

function readCustomerViewData() {
  const raw = localStorage.getItem("customerViewData")
  if (!raw) {
    roomNumber.value = ""
    guestName.value = ""
    total.value = 0
    qrImageUrl.value = ""
    return
  }

  try {
    const parsed = JSON.parse(raw)
    roomNumber.value = parsed.room_number || ""
    guestName.value = parsed.guest_name || ""
    total.value = Number(parsed.total || 0)
    qrImageUrl.value = parsed.qrImageUrl || ""
  } catch {
    // ignore
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

watch(
  hasRoom,
  (val) => {
    if (!val) startSlider()
    else stopSlider()
  },
  { immediate: true }
)

onMounted(() => {
  readCustomerViewData()

  // update when localStorage changes
  window.addEventListener("storage", readCustomerViewData)

  // polling (works even when storage event doesn't fire)
  pollTimer = setInterval(readCustomerViewData, 500)

  document.addEventListener("fullscreenchange", onFullscreenChange)

  // clock
  tickClock()
  clockTimer = setInterval(tickClock, 1000)

  // auto fullscreen after a moment
  setTimeout(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }, 800)
})

onBeforeUnmount(() => {
  stopSlider()
  if (pollTimer) clearInterval(pollTimer)
  if (clockTimer) clearInterval(clockTimer)
  window.removeEventListener("storage", readCustomerViewData)
  document.removeEventListener("fullscreenchange", onFullscreenChange)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.75s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
