<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex items-end justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">assignment_return</span>
            <h1 class="text-lg font-extrabold text-slate-900 sm:text-xl">
              {{ isEdit ? "Edit Refund" : "Create Refund" }}
            </h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Fields follow table: <span class="font-semibold">payment_refunds</span>
          </p>
        </div>

        <button
          type="button"
          class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          @click="goBack"
        >
          Back
        </button>
      </div>

      <!-- Form -->
      <form class="mt-4 rounded-2xl bg-white p-4 sm:p-6" @submit.prevent="save">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-slate-600">Refund Number</label>
            <input
              v-model="form.refund_number"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="RF20260201-0001"
              required
            />
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-600">Invoice ID</label>
            <input
              v-model.number="form.invoice_id"
              type="number"
              min="1"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="e.g. 17"
              required
            />
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-600">Payment ID</label>
            <input
              v-model.number="form.payment_id"
              type="number"
              min="1"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="e.g. 29"
              required
            />
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-600">Refund Amount</label>
            <input
              v-model.number="form.refund_amount"
              type="number"
              step="0.01"
              min="0"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="e.g. 45.00"
              required
            />
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-600">Refund Method</label>
            <select
              v-model="form.refund_method"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              required
            >
              <option value="original_method">Original method</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit card</option>
              <option value="bank_transfer">Bank transfer</option>
            </select>
          </div>

          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-slate-600">Refund Reason</label>
            <textarea
              v-model="form.refund_reason"
              rows="3"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="Why refund?"
              required
            />
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-600">Status</label>
            <select
              v-model="form.status"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              required
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-600">Refund Date</label>
            <input
              v-model="form.refund_date"
              type="text"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="YYYY-MM-DD HH:mm:ss"
              required
            />
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-600">Processed By (user_id)</label>
            <input
              v-model.number="form.processed_by"
              type="number"
              min="1"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="e.g. 3"
            />
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-600">Approved By (user_id)</label>
            <input
              v-model.number="form.approved_by"
              type="number"
              min="1"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="e.g. 2"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="text-xs font-semibold text-slate-600">Notes</label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="Internal notes…"
            />
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
            @click="goBack"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {{ isEdit ? "Save Changes" : "Create Refund" }}
          </button>
        </div>

        <p class="mt-4 text-xs text-slate-500">
          Note: This is static demo (no API). Later you’ll replace save() with POST/PUT to your backend.
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { refunds as refundsSeed } from "@/data/billding/refunds"

const route = useRoute()
const router = useRouter()

const refundIdParam = computed(() => route.params.refundId)
const isEdit = computed(() => !!refundIdParam.value)

const form = ref({
  refund_id: null,
  payment_id: null,
  invoice_id: null,
  refund_number: "",
  refund_amount: 0,
  refund_method: "original_method",
  refund_reason: "",
  refund_date: "",
  processed_by: null,
  approved_by: null,
  status: "pending",
  notes: "",
})

onMounted(() => {
  if (!isEdit.value) {
    form.value.refund_date = nowSql()
    return
  }

  const id = Number(refundIdParam.value)
  const found = refundsSeed.find((x) => Number(x.refund_id) === id)

  if (!found) {
    router.replace({ name: "billing-refunds" })
    return
  }

  form.value = { ...found }
})

function nowSql() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`
}

function goBack() {
  router.push({ name: "billing-refunds" })
}

function save() {
  // static demo: just go back
  // later: POST/PUT API then redirect
  goBack()
}
</script>
