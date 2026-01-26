<template>
  <div class="h-screen overflow-y-auto bg-slate-50 pt-[72px]">
    <div class="mx-auto w-full px-4 sm:px-6 py-6">
      <!-- Top bar -->
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-3">
          <button
            class="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            @click="back()"
            title="Back"
          >
            <span class="material-icons">arrow_back</span>
          </button>

          <div>
            <h1 class="text-lg font-extrabold text-slate-900">Receipt Details</h1>
            <p class="text-sm text-slate-500">
              POS: <span class="font-mono text-slate-700">{{ row?.pos_number || "-" }}</span>
              · Invoice: <span class="font-mono text-slate-700">{{ row?.invoice?.invoice_number || "-" }}</span>
            </p>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
            @click="printReceipt()"
            :disabled="!row"
          >
            <span class="material-icons text-[18px]">print</span>
            Print
          </button>
        </div>
      </div>

      <!-- Not found -->
      <div v-if="!row" class="rounded-2xl border border-slate-200 bg-white p-6">
        <div class="flex items-center gap-3 text-slate-600">
          <span class="material-icons text-[28px]">info</span>
          <div>
            <div class="font-extrabold text-slate-900">Receipt not found</div>
            <div class="text-sm">Please go back and select another receipt.</div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="grid gap-4 lg:grid-cols-3">
        <!-- Left: Guest + Rooms -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Guest -->
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <div class="mb-3 flex items-center gap-2 font-extrabold text-slate-900">
              <span class="material-icons text-[18px] text-slate-600">person</span>
              Guest
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <div class="text-[11px] font-semibold text-slate-500">Name</div>
                <div class="text-sm font-extrabold text-slate-900">{{ row.guest?.name }}</div>
              </div>
              <div>
                <div class="text-[11px] font-semibold text-slate-500">Phone</div>
                <div class="text-sm font-mono text-slate-900">{{ row.guest?.phone }}</div>
              </div>
              <div>
                <div class="text-[11px] font-semibold text-slate-500">Booking #</div>
                <div class="text-sm font-mono text-slate-900">{{ row.booking?.booking_number }}</div>
              </div>
              <div>
                <div class="text-[11px] font-semibold text-slate-500">Cashier</div>
                <div class="text-sm font-extrabold text-slate-900">{{ row.cashier }}</div>
              </div>
            </div>
          </div>

          <!-- Rooms -->
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2 font-extrabold text-slate-900">
                <span class="material-icons text-[18px] text-slate-600">bed</span>
                Rooms
              </div>
              <div class="text-xs text-slate-500">
                Open {{ formatTime(row.opened_at) }} · Close {{ formatTime(row.closed_at) }}
              </div>
            </div>

            <div class="space-y-3">
              <div
                v-for="(x, idx) in row.rooms"
                :key="idx"
                class="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div>
                  <div class="text-sm font-extrabold text-slate-900">
                    Room {{ x.room_number }} · {{ x.room_type }} · {{ x.beds }} bed
                  </div>
                  <div class="text-xs text-slate-500">
                    {{ x.booking_type === "hourly" ? "Hourly" : "Nightly" }}
                    · {{ x.booking_type === "hourly" ? x.quantity + " hours" : x.quantity + " nights" }}
                    · Unit {{ money(x.unit_price) }}
                  </div>
                </div>
                <div class="text-right font-mono text-sm font-extrabold text-slate-900">
                  {{ money(x.total) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Summary -->
        <div class="space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <div class="mb-3 flex items-center gap-2 font-extrabold text-slate-900">
              <span class="material-icons text-[18px] text-slate-600">payments</span>
              Summary
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Subtotal</span>
                <span class="font-mono font-extrabold text-slate-900">{{ money(row.invoice?.subtotal) }}</span>
              </div>

              <div v-if="row.invoice?.discount" class="flex items-center justify-between">
                <span class="text-slate-500">Discount</span>
                <span class="font-mono font-extrabold text-slate-900">- {{ money(row.invoice?.discount) }}</span>
              </div>

              <div v-if="row.invoice?.tax" class="flex items-center justify-between">
                <span class="text-slate-500">Tax</span>
                <span class="font-mono font-extrabold text-slate-900">{{ money(row.invoice?.tax) }}</span>
              </div>

              <div class="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <span class="font-extrabold text-slate-900">Total</span>
                <span class="font-mono text-base font-extrabold text-slate-900">{{ money(row.invoice?.total) }}</span>
              </div>
            </div>

            <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="text-[11px] font-semibold text-slate-500">Payment Method</div>
                  <div class="text-sm font-extrabold text-slate-900">{{ row.payment?.method }}</div>

                  <div class="mt-2 text-[11px] font-semibold text-slate-500">Reference</div>
                  <div class="font-mono text-xs text-slate-900">{{ row.payment?.reference }}</div>
                </div>

                <div class="text-right">
                  <div class="text-[11px] font-semibold text-slate-500">Status</div>
                  <span
                    class="mt-1 inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold"
                    :class="badgeClass(row.payment?.status)"
                  >
                    {{ prettyStatus(row.payment?.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Meta -->
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <div class="text-[11px] font-semibold text-slate-500">Date</div>
                <div class="text-sm font-extrabold text-slate-900">{{ formatDate(row.opened_at) }}</div>
              </div>
              <div>
                <div class="text-[11px] font-semibold text-slate-500">POS #</div>
                <div class="text-sm font-mono text-slate-900">{{ row.pos_number }}</div>
              </div>
              <div>
                <div class="text-[11px] font-semibold text-slate-500">Invoice #</div>
                <div class="text-sm font-mono text-slate-900">{{ row.invoice?.invoice_number }}</div>
              </div>
              <div>
                <div class="text-[11px] font-semibold text-slate-500">Booking #</div>
                <div class="text-sm font-mono text-slate-900">{{ row.booking?.booking_number }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- /Content -->
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { posHistory } from "@/data/posHistory"

const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id || ""))

// find by pos_id (number or string)
const row = computed(() => {
  const target = id.value
  return posHistory.find((x) => String(x.pos_id) === target) || null
})

function back() {
  router.back()
}

function money(n) {
  const num = Number(n || 0)
  return `$${num.toFixed(2)}`
}

function formatDate(dt) {
  const s = String(dt || "")
  return s ? s.slice(0, 10) : "-"
}

function formatTime(dt) {
  const s = String(dt || "")
  return s && s.length >= 16 ? s.slice(11, 16) : "-"
}

function prettyStatus(s) {
  const map = { completed: "Completed", pending: "Pending", failed: "Failed", refunded: "Refunded", cancelled: "Cancelled" }
  return map[s] || String(s || "").toUpperCase()
}

function badgeClass(status) {
  const base = "border-slate-200 bg-slate-50 text-slate-700"
  const map = {
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    failed: "border-red-200 bg-red-50 text-red-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
    refunded: "border-blue-200 bg-blue-50 text-blue-700",
  }
  return map[status] || base
}

function printReceipt() {
  alert(`Print: ${row.value?.pos_number || ""}`)
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
</style>
