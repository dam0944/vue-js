<!-- src/pages/billing/InvoiceForm.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <VaIcon name="edit_note" color="secondary" />
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
              {{ isEdit ? "Edit Invoice" : "Create Invoice" }}
            </h1>

            <!-- status pill on header -->
            <span class="ml-2 rounded-full px-2.5 py-1 text-xs font-extrabold" :class="statusPill(form.status)">
              {{ prettyStatus(form.status) }}
            </span>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Simple flow: fill required → Save → update status after payment.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" to="/admin/billing/invoices">
            <VaIcon name="arrow_back" class="mr-1" />
            Back
          </VaButton>

          <VaButton
            color="primary"
            class="rounded-2xl font-extrabold"
            :disabled="!canSubmit"
            @click="onSubmit"
          >
            <VaIcon name="save" class="mr-1" />
            {{ isEdit ? "Save Changes" : "Create Invoice" }}
          </VaButton>
        </div>
      </div>

      <!-- Layout: left form + right summary -->
      <div class="mt-5 grid gap-4 lg:grid-cols-12">
        <!-- LEFT -->
        <VaCard class="soft-card rounded-2xl lg:col-span-8">
          <VaCardContent class="p-4 sm:p-6">
            <div class="grid gap-4">
              <!-- Section: Basic -->
              <div>
                <div class="mb-3 flex items-center justify-between">
                  <div class="text-sm font-extrabold text-slate-900">Basic</div>
                  <div class="text-xs text-slate-500">* required</div>
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <Field label="Property ID *">
                    <VaInput v-model.number="form.property_id" class="ctrl" type="number" min="1" />
                  </Field>

                  <Field label="Invoice Number">
                    <VaInput v-model.trim="form.invoice_number" class="ctrl" placeholder="INV-0001" />
                  </Field>

                  <Field label="Booking ID *">
                    <VaInput v-model.number="form.booking_id" class="ctrl" type="number" min="1" />
                  </Field>

                  <Field label="Reservation ID (optional)">
                    <VaInput v-model.number="form.reservation_id" class="ctrl" type="number" min="1" />
                  </Field>

                  <Field label="Currency *">
                    <VaSelect
                      v-model="form.currency"
                      class="ctrl"
                      :options="currencyOptions"
                      :text-by="(o) => o.text"
                      :value-by="(o) => o.value"
                    />
                  </Field>

                  <Field label="Status *">
                    <VaSelect
                      v-model="form.status"
                      class="ctrl"
                      :options="statusOptions"
                      :text-by="(o) => o.text"
                      :value-by="(o) => o.value"
                    >
                      <template #content="{ value }">
                        <span class="rounded-full px-2 py-1 text-xs font-extrabold" :class="statusPill(value)">
                          {{ prettyStatus(value) }}
                        </span>
                      </template>
                    </VaSelect>
                  </Field>
                </div>
              </div>

              <div class="h-px bg-slate-100" />

              <!-- Section: Amounts -->
              <div>
                <div class="mb-3 flex items-center justify-between">
                  <div class="text-sm font-extrabold text-slate-900">Amounts</div>

                  <div class="flex items-center gap-2">
                    <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="autoCalc">
                      <VaIcon name="calculate" class="mr-1" />
                      Auto-calc
                    </VaButton>
                  </div>
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <Field label="Subtotal">
                    <VaInput v-model.number="form.subtotal" class="ctrl" type="number" step="0.01" />
                  </Field>

                  <Field label="Tax Rate (%)">
                    <VaInput v-model.number="form.tax_rate" class="ctrl" type="number" step="0.01" />
                  </Field>

                  <Field label="Tax Amount">
                    <VaInput v-model.number="form.tax_amount" class="ctrl" type="number" step="0.01" />
                  </Field>

                  <Field label="Discount Amount">
                    <VaInput v-model.number="form.discount_amount" class="ctrl" type="number" step="0.01" />
                  </Field>

                  <Field label="Discount Reason (optional)" class="sm:col-span-2">
                    <VaInput v-model.trim="form.discount_reason" class="ctrl" placeholder="Promo, loyalty..." />
                  </Field>

                  <Field label="Total Amount">
                    <VaInput v-model.number="form.total_amount" class="ctrl" type="number" step="0.01" />
                  </Field>

                  <Field label="Amount Paid">
                    <VaInput v-model.number="form.amount_paid" class="ctrl" type="number" step="0.01" />
                  </Field>

                  <Field label="Balance Due">
                    <VaInput v-model.number="form.balance_due" class="ctrl" type="number" step="0.01" />
                  </Field>
                </div>
              </div>

              <div class="h-px bg-slate-100" />

              <!-- Section: Dates -->
              <div>
                <div class="mb-3 text-sm font-extrabold text-slate-900">Dates</div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <Field label="Issued At (YYYY-MM-DD HH:mm:ss)">
                    <VaInput v-model.trim="form.issued_at" class="ctrl" placeholder="2026-01-31 10:20:00" />
                  </Field>

                  <Field label="Due Date (YYYY-MM-DD)">
                    <VaInput v-model.trim="form.due_date" class="ctrl" placeholder="2026-02-02" />
                  </Field>

                  <Field label="Paid At (optional)">
                    <VaInput v-model.trim="form.paid_at" class="ctrl" placeholder="2026-01-31 10:45:00" />
                  </Field>

                  <Field label="Updated At">
                    <VaInput v-model.trim="form.updated_at" class="ctrl" placeholder="2026-01-31 10:45:00" />
                  </Field>

                  <Field label="Created By (user_id)">
                    <VaInput v-model.number="form.created_by" class="ctrl" type="number" min="1" />
                  </Field>
                </div>
              </div>

              <!-- Notes -->
              <div>
                <div class="mb-1 text-xs font-extrabold text-slate-600">Notes (optional)</div>
                <VaTextarea v-model.trim="form.notes" class="ctrlText" min-rows="4" placeholder="Extra notes..." />
              </div>

              <!-- Toast -->
              <VaAlert v-if="toast" color="success" class="rounded-2xl" border="left">
                {{ toast }}
              </VaAlert>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- RIGHT -->
        <div class="lg:col-span-4 space-y-4">
          <!-- Quick totals (easy to look) -->
          <VaCard class="soft-card rounded-2xl lg:sticky lg:top-4">
            <VaCardContent class="p-4">
              <div class="flex items-center justify-between">
                <div class="text-sm font-extrabold text-slate-900">Summary</div>
                <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-700">
                  {{ form.currency }}
                </span>
              </div>

              <div class="mt-4 grid gap-2">
                <div class="sum-row">
                  <span class="sum-k">Total</span>
                  <span class="sum-v">{{ money(form.total_amount, form.currency) }}</span>
                </div>
                <div class="sum-row">
                  <span class="sum-k">Paid</span>
                  <span class="sum-v">{{ money(form.amount_paid, form.currency) }}</span>
                </div>
                <div class="sum-row">
                  <span class="sum-k">Balance</span>
                  <span
                    class="sum-v font-extrabold"
                    :class="Number(form.balance_due || 0) > 0 ? 'text-rose-600' : 'text-emerald-700'"
                  >
                    {{ money(form.balance_due, form.currency) }}
                  </span>
                </div>
              </div>

              <div class="mt-4 rounded-2xl bg-slate-50 p-4">
                <div class="text-xs font-extrabold text-slate-900">Quick rules</div>
                <ul class="mt-2 space-y-1 text-[11px] text-slate-600">
                  <li>• If status = <b>paid</b> → paid_at should exist.</li>
                  <li>• Auto-calc uses: subtotal + tax - discount.</li>
                  <li>• Balance = total - paid.</li>
                </ul>
              </div>

              <div class="mt-4 flex flex-col gap-2">
                <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="autoCalc">
                  <VaIcon name="calculate" class="mr-1" />
                  Auto-calc
                </VaButton>

                <VaButton color="primary" class="rounded-2xl font-extrabold" :disabled="!canSubmit" @click="onSubmit">
                  <VaIcon name="save" class="mr-1" />
                  {{ isEdit ? "Save" : "Create" }}
                </VaButton>
              </div>

              <div class="mt-3 text-center text-[11px] text-slate-500">
                Static demo — later connect API:
                <b>{{ isEdit ? "PUT /invoices/:id" : "POST /invoices" }}</b>
              </div>
            </VaCardContent>
          </VaCard>
        </div>
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

/**
 * Small local Field component (no extra file)
 * Usage: <Field label="..."> ... </Field>
 */
const Field = {
  props: { label: String, class: String },
  template: `
    <div :class="class">
      <div class="mb-1 text-xs font-extrabold text-slate-600">{{ label }}</div>
      <slot />
    </div>
  `,
}

const route = useRoute()
const router = useRouter()

const toast = ref("")

const invoiceId = computed(() => (route.params.invoiceId ? Number(route.params.invoiceId) : null))
const isEdit = computed(() => Number.isFinite(invoiceId.value) && invoiceId.value !== null)

const currencyOptions = [
  { text: "USD", value: "USD" },
  { text: "KHR", value: "KHR" },
]
const statusOptions = [
  { text: "draft", value: "draft" },
  { text: "pending", value: "pending" },
  { text: "paid", value: "paid" },
  { text: "partially_paid", value: "partially_paid" },
  { text: "cancelled", value: "cancelled" },
  { text: "refunded", value: "refunded" },
]

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

  notes: "",
  created_by: 1,
  updated_at: "",
})

const form = reactive(empty())

watchEffect(() => {
  toast.value = ""
  if (!isEdit.value) {
    Object.assign(form, empty())
    autoCalc()
    return
  }
  const found = staticInvoices.find((x) => Number(x.invoice_id) === invoiceId.value)
  if (!found) {
    router.replace({ name: "billing-invoices" })
    return
  }
  Object.assign(form, JSON.parse(JSON.stringify(found)))
  autoCalc()
})

const canSubmit = computed(() => {
  if (!form.property_id || Number(form.property_id) < 1) return false
  if (!form.booking_id || Number(form.booking_id) < 1) return false
  if (!form.currency) return false
  if (!form.status) return false
  return true
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
  form.total_amount = Number((subtotal + Number(form.tax_amount || 0) - discount).toFixed(2))
  form.balance_due = Number((Number(form.total_amount || 0) - Number(form.amount_paid || 0)).toFixed(2))

  // small UX: if paid & balance is 0, can set paid_at automatically (optional)
  if (form.status === "paid" && Number(form.balance_due || 0) <= 0 && !form.paid_at) {
    // keep empty if you prefer manual
    // form.paid_at = new Date().toISOString().slice(0, 19).replace("T", " ")
  }
}

function onSubmit() {
  if (!canSubmit.value) return
  autoCalc()
  toast.value = isEdit.value
    ? "Saved (static). In real app: PUT /invoices/:id"
    : "Created (static). In real app: POST /invoices"
}

function goBack() {
  router.push({ name: "billing-invoices" })
}

function prettyStatus(s) {
  return String(s || "").replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}

/* ✅ match your room-board colors */
function statusPill(s) {
  switch (s) {
    case "paid":
      return "bg-emerald-100 text-emerald-800"
    case "partially_paid":
      return "bg-amber-100 text-amber-800"
    case "pending":
      return "bg-sky-100 text-sky-800"
    case "draft":
      return "bg-slate-200 text-slate-700"
    case "cancelled":
      return "bg-rose-100 text-rose-800"
    case "refunded":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-slate-200 text-slate-700"
  }
}
</script>

<style scoped>
/* light shadow only (same style as your other pages) */
.soft-card {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}

/* Vuestic controls: soft inputs */
:deep(.ctrl .va-input-wrapper__container),
:deep(.ctrl .va-select__anchor) {
  background: rgb(241 245 249) !important; /* slate-100 */
  border: 0 !important;
  border-radius: 16px !important;
  min-height: 42px !important;
}
:deep(.ctrl .va-input-wrapper__container:focus-within),
:deep(.ctrl .va-select__anchor:focus-within) {
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08) !important;
}
:deep(.ctrlText .va-textarea__container) {
  background: rgb(241 245 249) !important;
  border: 0 !important;
  border-radius: 16px !important;
}
:deep(.ctrlText .va-textarea__container:focus-within) {
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08) !important;
}

/* Summary rows */
.sum-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgb(248 250 252); /* slate-50 */
}
.sum-k {
  font-size: 12px;
  font-weight: 800;
  color: rgb(100 116 139); /* slate-500 */
}
.sum-v {
  font-size: 14px;
  font-weight: 800;
  color: rgb(15 23 42); /* slate-900 */
}
</style>
