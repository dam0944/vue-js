<template>
  <div class="page-wrap">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>{{ isEdit ? "Edit Payment" : "Create Payment" }}</h1>
        <p>Fields follow payments table: invoice_id, amount, method, currency, status, references…</p>
      </div>

      <div class="actions">
        <VaButton preset="secondary" icon="arrow_back" @click="goBack">Back</VaButton>
        <VaButton color="primary" icon="save" :disabled="!canSave" @click="save">
          {{ isEdit ? "Update" : "Save" }}
        </VaButton>
      </div>
    </div>

    <!-- Layout (no width, only grid) -->
    <div class="grid-layout">
      <!-- LEFT -->
      <div class="left-col">
        <VaCard class="card">
          <VaCardContent>
            <div class="card-title">Payment Info</div>

            <VaInput v-model="form.payment_number" label="Payment Number" />

            <div class="grid-3">
              <VaInput v-model.number="form.property_id" type="number" label="Property ID" />
              <VaInput v-model.number="form.invoice_id" type="number" label="Invoice ID" />
              <VaSelect v-model="form.payment_method" :options="METHODS" label="Method" />
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="card">
          <VaCardContent>
            <div class="card-title">Amount & Status</div>

            <div class="grid-3">
              <VaInput v-model.number="form.amount" type="number" label="Amount" @update:modelValue="autoCalc" />
              <VaSelect v-model="form.payment_currency" :options="['USD', 'KHR']" label="Currency" @update:modelValue="autoCalc" />
              <VaSelect v-model="form.status" :options="STATUSES" label="Status" />
            </div>

            <div class="grid-2 mt">
              <VaInput v-model.number="form.exchange_rate" type="number" label="Exchange Rate" @update:modelValue="autoCalc" />
              <VaInput v-model.number="form.amount_in_base_currency" type="number" label="Amount in Base Currency" />
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="card">
          <VaCardContent>
            <div class="card-title">Reference & Notes</div>

            <div class="grid-2">
              <VaInput v-model="form.reference_number" label="Reference Number" />
              <VaInput v-model="form.card_type" label="Card Type (if card)" />
            </div>

            <div class="grid-2 mt">
              <VaInput v-model="form.payment_date" label="Payment Date" placeholder="YYYY-MM-DD HH:mm:ss" />
              <VaInput v-model.number="form.processed_by" type="number" label="Processed By (user_id)" />
            </div>

            <div class="mt">
              <VaTextarea v-model="form.notes" label="Notes" autosize />
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="card soft">
          <VaCardContent>
            <div class="card-title">System Fields</div>

            <div class="grid-3">
              <VaInput v-model="form.created_at" label="created_at" />
              <VaInput v-model="form.updated_at" label="updated_at" />
              <VaInput :modelValue="form.payment_id ?? 'Auto'" label="payment_id" disabled />
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- RIGHT (summary) -->
      <div class="right-col">
        <VaCard class="card summary">
          <VaCardContent>
            <div class="summary-title">Payment Summary</div>

            <div class="sum-row">
              <span>Amount</span>
              <b>{{ money(form.amount, form.payment_currency) }}</b>
            </div>

            <div class="sum-row">
              <span>Base</span>
              <b>{{ moneyUSD(form.amount_in_base_currency) }}</b>
            </div>

            <div class="sum-row">
              <span>Status</span>
              <b>{{ pretty(form.status) }}</b>
            </div>

            <div class="sum-row">
              <span>Method</span>
              <b>{{ pretty(form.payment_method) }}</b>
            </div>
          </VaCardContent>
        </VaCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"
import { payments as staticPayments } from "@/data/billding/payments"

const route = useRoute()
const router = useRouter()

const METHODS = ["cash", "credit_card", "debit_card", "bank_transfer", "aba", "wing", "true_money", "pi_pay", "other"]
const STATUSES = ["pending", "completed", "failed", "refunded", "cancelled"]

const isEdit = computed(() => !!route.params.paymentId)

const form = reactive({
  payment_id: null,
  property_id: 1,
  invoice_id: 1,
  payment_number: "",
  amount: 0,
  payment_method: "cash",
  payment_currency: "USD",
  exchange_rate: 1,
  amount_in_base_currency: 0,
  reference_number: "",
  card_type: "",
  payment_date: "",
  status: "completed",
  notes: "",
  processed_by: 1,
  created_at: "",
  updated_at: "",
})

const canSave = computed(() => {
  return !!form.payment_number && !!form.property_id && !!form.invoice_id && Number(form.amount) >= 0
})

onMounted(() => {
  const now = new Date()
  const dt = toSql(now)

  if (!isEdit.value) {
    form.payment_date = dt
    form.created_at = dt
    form.updated_at = dt
    form.payment_number = genPaymentNo(now)
    autoCalc()
    return
  }

  const id = Number(route.params.paymentId)
  const found = staticPayments.find((p) => Number(p.payment_id) === id)
  if (!found) return router.replace({ name: "billing-payments" })
  Object.assign(form, JSON.parse(JSON.stringify(found)))
})

function autoCalc() {
  const amount = Number(form.amount || 0)
  const rate = Number(form.exchange_rate || 1)
  // base currency = USD (example)
  form.amount_in_base_currency = Number((form.payment_currency === "USD" ? amount : amount / rate).toFixed(2))
}

function toSql(d) {
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function genPaymentNo(d) {
  const pad = (n) => String(n).padStart(2, "0")
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  return `PAY${y}${m}${day}-001-000999`
}

function pretty(s) {
  return String(s || "").replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}

function money(amount, cur) {
  const n = Number(amount || 0)
  const sym = cur === "KHR" ? "៛" : "$"
  return `${sym}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function moneyUSD(amount) {
  const n = Number(amount || 0)
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function goBack() {
  router.push({ name: "billing-payments" })
}

function save() {
  console.log("SAVE PAYMENT:", JSON.parse(JSON.stringify(form)))
  goBack()
}
</script>

<style scoped>
.page-wrap {
  background: #f8fafc;
  padding: 20px;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
  margin-bottom: 18px;
}
.page-header h1 {
  font-size: 22px;
  font-weight: 900;
}
.page-header p {
  font-size: 13px;
  color: #64748b;
}
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Layout (no width set) */
.grid-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

/* Cards */
.card {
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}
.card.soft {
  opacity: 0.75;
}
.left-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.right-col {
  position: sticky;
  top: 16px;
  align-self: start;
}

.card-title {
  font-size: 14px;
  font-weight: 900;
  margin-bottom: 12px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.mt {
  margin-top: 12px;
}

/* Summary */
.summary-title {
  font-weight: 900;
  margin-bottom: 10px;
}
.sum-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 900px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
  .grid-3 {
    grid-template-columns: 1fr;
  }
  .grid-2 {
    grid-template-columns: 1fr;
  }
  .right-col {
    position: static;
  }
}
</style>
