<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">undo</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Refunds</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Track payment refunds • Approvals • Status history
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            @click="goCreate"
          >
            + Create Refund
          </button>
        </div>
      </div>

      <!-- Stats (no border, no shadow) -->
      <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-2xl bg-white px-4 py-3">
          <div class="text-xs font-semibold text-slate-500">Total</div>
          <div class="mt-1 text-lg font-extrabold text-slate-900">{{ filtered.length }}</div>
        </div>
        <div class="rounded-2xl bg-white px-4 py-3">
          <div class="text-xs font-semibold text-slate-500">Pending</div>
          <div class="mt-1 text-lg font-extrabold text-slate-900">{{ countBy("pending") }}</div>
        </div>
        <div class="rounded-2xl bg-white px-4 py-3">
          <div class="text-xs font-semibold text-slate-500">Approved</div>
          <div class="mt-1 text-lg font-extrabold text-slate-900">{{ countBy("approved") }}</div>
        </div>
        <div class="rounded-2xl bg-white px-4 py-3">
          <div class="text-xs font-semibold text-slate-500">Completed</div>
          <div class="mt-1 text-lg font-extrabold text-slate-900">{{ countBy("completed") }}</div>
        </div>
      </div>

      <!-- Filters (borderless style) -->
      <div class="mt-4 rounded-2xl bg-white p-3 sm:p-4">
        <div class="grid gap-3 sm:grid-cols-12 sm:items-end">
          <div class="sm:col-span-5">
            <label class="text-xs font-semibold text-slate-600">Search</label>
            <input
              v-model.trim="q"
              type="text"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="Refund #, invoice id, payment id, reason…"
            />
          </div>

          <div class="sm:col-span-3">
            <label class="text-xs font-semibold text-slate-600">Status</label>
            <select
              v-model="status"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div class="sm:col-span-3">
            <label class="text-xs font-semibold text-slate-600">Method</label>
            <select
              v-model="method"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="all">All</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit card</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="original_method">Original method</option>
            </select>
          </div>

          <div class="sm:col-span-1">
            <button
              type="button"
              class="w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
              @click="reset"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="mt-4 rounded-2xl bg-white p-2 sm:p-3">
        <!-- Skeleton -->
        <div v-if="loading" class="p-3">
          <div class="space-y-3">
            <div v-for="i in 6" :key="i" class="rounded-2xl bg-slate-100 p-4 animate-pulse">
              <div class="h-3 w-40 rounded bg-slate-200"></div>
              <div class="mt-3 h-3 w-64 rounded bg-slate-200"></div>
              <div class="mt-3 flex gap-2">
                <div class="h-7 w-20 rounded-full bg-slate-200"></div>
                <div class="h-7 w-24 rounded-full bg-slate-200"></div>
                <div class="h-7 w-16 rounded-full bg-slate-200"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="!filtered.length" class="p-8 text-center">
          <div class="text-sm font-semibold text-slate-800">No refunds found</div>
          <div class="mt-1 text-sm text-slate-500">Try changing filters or create a new refund.</div>
          <button
            type="button"
            class="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            @click="goCreate"
          >
            + Create Refund
          </button>
        </div>

        <!-- Rows -->
        <div v-else class="space-y-2 p-2 sm:p-3">
          <div
            v-for="r in filtered"
            :key="r.refund_id"
            class="rounded-2xl bg-slate-50 px-4 py-4"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <div class="text-sm font-extrabold text-slate-900">
                    {{ r.refund_number }}
                  </div>
                  <span
                    class="rounded-full px-3 py-1 text-xs font-extrabold"
                    :class="statusPill(r.status)"
                  >
                    {{ prettyStatus(r.status) }}
                  </span>
                  <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {{ prettyMethod(r.refund_method) }}
                  </span>
                </div>

                <div class="mt-2 text-sm text-slate-700">
                  <span class="font-semibold">Reason:</span>
                  <span class="ml-1">{{ r.refund_reason || "—" }}</span>
                </div>

                <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Refund ID: {{ r.refund_id }}</span>
                  <span>Invoice: {{ r.invoice_id }}</span>
                  <span>Payment: {{ r.payment_id }}</span>
                  <span>Date: {{ r.refund_date }}</span>
                  <span>Processed by: {{ r.processed_by ?? "—" }}</span>
                  <span>Approved by: {{ r.approved_by ?? "—" }}</span>
                </div>

                <div v-if="r.notes" class="mt-2 text-xs text-slate-500">
                  <span class="font-semibold text-slate-600">Notes:</span> {{ r.notes }}
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-2">
                <div class="text-right">
                  <div class="text-xs font-semibold text-slate-500">Amount</div>
                  <div class="text-lg font-extrabold text-slate-900">
                    ${{ Number(r.refund_amount || 0).toFixed(2) }}
                  </div>
                </div>

                <button
                  type="button"
                  class="rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                  @click="goEdit(r.refund_id)"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer hint -->
      <div class="mt-4 text-xs text-slate-500">
        Tip: “Pending” → waiting approval, “Approved” → ready to process, “Completed” → already refunded.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { refunds as refundsSeed } from "@/data/billding/refunds"

const router = useRouter()

const loading = ref(true)
const rows = ref([])

const q = ref("")
const status = ref("all")
const method = ref("all")

onMounted(() => {
  // simulate loading (API later)
  setTimeout(() => {
    rows.value = [...refundsSeed].sort((a, b) => (b.refund_id || 0) - (a.refund_id || 0))
    loading.value = false
  }, 650)
})

const filtered = computed(() => {
  const query = q.value.toLowerCase()

  return rows.value.filter((r) => {
    const matchesQuery =
      !query ||
      String(r.refund_number || "").toLowerCase().includes(query) ||
      String(r.invoice_id || "").includes(query) ||
      String(r.payment_id || "").includes(query) ||
      String(r.refund_reason || "").toLowerCase().includes(query)

    const matchesStatus = status.value === "all" || String(r.status) === status.value
    const matchesMethod = method.value === "all" || String(r.refund_method) === method.value

    return matchesQuery && matchesStatus && matchesMethod
  })
})

function reset() {
  q.value = ""
  status.value = "all"
  method.value = "all"
}

function goCreate() {
  router.push({ name: "billing-refunds-create" })
}

function goEdit(refundId) {
  router.push({ name: "billing-refunds-edit", params: { refundId: String(refundId) } })
}

function countBy(s) {
  return filtered.value.filter((x) => x.status === s).length
}

function prettyStatus(s) {
  if (!s) return "Unknown"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function prettyMethod(m) {
  const map = {
    cash: "Cash",
    credit_card: "Credit card",
    bank_transfer: "Bank transfer",
    original_method: "Original method",
  }
  return map[m] || prettyStatus(m)
}

function statusPill(s) {
  const base = "text-slate-900"
  if (s === "pending") return `${base} bg-amber-100`
  if (s === "approved") return `${base} bg-blue-100`
  if (s === "completed") return `${base} bg-emerald-100`
  if (s === "rejected") return `${base} bg-rose-100`
  return `${base} bg-slate-200`
}
</script>
