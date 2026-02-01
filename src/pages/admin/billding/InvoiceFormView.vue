<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">edit_note</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
              {{ isEdit ? "Edit Invoice" : "Create Invoice" }}
            </h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Keep it simple: fill required fields, save, then update status after payment.
          </p>
        </div>

        <button class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900" @click="goBack">
          ← Back
        </button>
      </div>

      <!-- Form (no border / no shadow) -->
      <div class="mt-5 rounded-2xl bg-white p-4 sm:p-6">
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="grid gap-3 sm:grid-cols-2">
            <Field label="Property ID">
              <input v-model.number="form.property_id" type="number" class="inp" min="1" />
            </Field>

            <Field label="Invoice Number">
              <input v-model.trim="form.invoice_number" type="text" class="inp" placeholder="INV..." />
            </Field>

            <Field label="Booking ID">
              <input v-model.number="form.booking_id" type="number" class="inp" min="1" />
            </Field>

            <Field label="Reservation ID (optional)">
              <input v-model.number="form.reservation_id" type="number" class="inp" min="1" />
            </Field>

            <Field label="Currency">
              <select v-model="form.currency" class="inp">
                <option value="USD">USD</option>
                <option value="KHR">KHR</option>
              </select>
            </Field>

            <Field label="Status">
              <select v-model="form.status" class="inp">
                <option value="draft">draft</option>
                <option value="pending">pending</option>
                <option value="paid">paid</option>
                <option value="partially_paid">partially_paid</option>
                <option value="cancelled">cancelled</option>
                <option value="refunded">refunded</option>
              </select>
            </Field>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <Field label="Subtotal">
              <input v-model.number="form.subtotal" type="number" step="0.01" class="inp" />
            </Field>

            <Field label="Tax Rate (%)">
              <input v-model.number="form.tax_rate" type="number" step="0.01" class="inp" />
            </Field>

            <Field label="Tax Amount">
              <input v-model.number="form.tax_amount" type="number" step="0.01" class="inp" />
            </Field>

            <Field label="Discount Amount">
              <input v-model.number="form.discount_amount" type="number" step="0.01" class="inp" />
            </Field>

            <Field label="Discount Reason (optional)">
              <input v-model.trim="form.discount_reason" type="text" class="inp" placeholder="Promo, loyalty..." />
            </Field>

            <div class="rounded-2xl bg-slate-50 p-4">
              <div class="text-xs font-semibold text-slate-500">Totals (quick view)</div>
              <div class="mt-2 space-y-1 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Total</span>
                  <span class="font-extrabold text-slate-900">{{ money(form.total_amount, form.currency) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Paid</span>
                  <span class="font-bold text-slate-900">{{ money(form.amount_paid, form.currency) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Balance</span>
                  <span class="font-extrabold" :class="Number(form.balance_due) > 0 ? 'text-rose-600' : 'text-emerald-700'">
                    {{ money(form.balance_due, form.currency) }}
                  </span>
                </div>
              </div>
            </div>

            <Field label="Total Amount">
              <input v-model.number="form.total_amount" type="number" step="0.01" class="inp" />
            </Field>

            <Field label="Amount Paid">
              <input v-model.number="form.amount_paid" type="number" step="0.01" class="inp" />
            </Field>

            <Field label="Balance Due">
              <input v-model.number="form.balance_due" type="number" step="0.01" class="inp" />
            </Field>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <Field label="Issued At (YYYY-MM-DD HH:mm:ss)">
              <input v-model.trim="form.issued_at" type="text" class="inp" placeholder="2026-01-31 10:20:00" />
            </Field>

            <Field label="Due Date (YYYY-MM-DD)">
              <input v-model.trim="form.due_date" type="text" class="inp" placeholder="2026-02-02" />
            </Field>

            <Field label="Paid At (optional)">
              <input v-model.trim="form.paid_at" type="text" class="inp" placeholder="2026-01-31 10:45:00" />
            </Field>

            <Field label="Created By (user_id)">
              <input v-model.number="form.created_by" type="number" class="inp" />
            </Field>

            <Field label="Updated At">
              <input v-model.trim="form.updated_at" type="text" class="inp" placeholder="2026-01-31 10:45:00" />
            </Field>
          </div>

          <Field label="Notes (optional)">
            <textarea v-model.trim="form.notes" rows="4" class="inp resize-none" placeholder="Extra notes..."></textarea>
          </Field>

          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" class="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-900" @click="autoCalc">
              Auto-calc
            </button>
            <button type="submit" class="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
              {{ isEdit ? "Save Changes" : "Create Invoice" }}
            </button>
          </div>

          <div v-if="toast" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {{ toast }}
          </div>
        </form>
      </div>

      <div class="mt-4 text-center text-xs text-slate-400">
        Static demo only — connect API later to store/update invoices.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import { invoices as staticInvoices } from "@/data/billding/invoices"

const route = useRoute()
const router = useRouter()

const toast = ref("")

const invoiceId = computed(() => route.params.invoiceId ? Number(route.params.invoiceId) : null)
const isEdit = computed(() => Number.isFinite(invoiceId.value) && invoiceId.value !== null)

const empty = () => ({
  invoice_id: 0,
  property_id: 1,
  invoice_number: "",
  booking_id: 0,
  reservation_id: null,

  subtotal: 0,
  tax_rate: 0,
  tax_amount: 0,
  discount_amount: 0,
  discount_reason: null,

  total_amount: 0,
  amount_paid: 0,
  balance_due: 0,

  currency: "USD",
  status: "draft",

  issued_at: "",
  due_date: "",
  paid_at: null,

  notes: null,
  created_by: 1,
  updated_at: ""
})

const form = reactive(empty())

watchEffect(() => {
  toast.value = ""
  if (!isEdit.value) {
    Object.assign(form, empty())
    return
  }
  const found = staticInvoices.find((x) => Number(x.invoice_id) === invoiceId.value)
  if (!found) {
    // if route has invalid id
    router.replace({ name: "billing-invoices" })
    return
  }
  Object.assign(form, JSON.parse(JSON.stringify(found)))
})

function money(amount, currency) {
  const n = Number(amount || 0)
  if (currency === "KHR") return `៛${Math.round(n).toLocaleString()}`
  return `$${n.toFixed(2)}`
}

function autoCalc() {
  const subtotal = Number(form.subtotal || 0)
  const taxRate = Number(form.tax_rate || 0)
  const discount = Number(form.discount_amount || 0)

  form.tax_amount = Number(((subtotal * taxRate) / 100).toFixed(2))
  form.total_amount = Number((subtotal + form.tax_amount - discount).toFixed(2))
  form.balance_due = Number((form.total_amount - Number(form.amount_paid || 0)).toFixed(2))
}

function onSubmit() {
  autoCalc()
  toast.value = isEdit.value
    ? "Saved (static). In real app: PUT /invoices/:id"
    : "Created (static). In real app: POST /invoices"
}

function goBack() {
  router.push({ name: "billing-invoices" })
}

// small local Field component (no border)
// const Field = (props, { slots }) => (
//   <div>
//     <div class="mb-1 text-xs font-semibold text-slate-600">{props.label}</div>
//     {slots.default?.()}
//   </div>
// )
</script>

<style scoped>
/* Borderless + shadowless inputs */
.inp{
  width: 100%;
  border-radius: 9999px;
  background: rgb(241 245 249); /* slate-100 */
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  border: none;
}
.inp:focus{
  background: rgb(226 232 240); /* slate-200 */
}
textarea.inp{
  border-radius: 16px;
}
</style>
