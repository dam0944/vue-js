<!-- src/pages/billing/RefundForm.vue -->
<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="head-title">
          <span class="material-icons">assignment_return</span>
          <h1 class="title">{{ isEdit ? "Edit Refund" : "Create Refund" }}</h1>
        </div>
        <p class="subtitle">
          Fields follow table: <b>payment_refunds</b>
        </p>
      </div>

      <VaButton preset="secondary" @click="goBack">Back</VaButton>
    </div>

    <!-- Form -->
    <VaCard class="card shadow">
      <VaCardContent>
        <form class="form" @submit.prevent="save">
          <div class="grid">
            <div class="span2">
              <VaInput
                v-model="form.refund_number"
                label="Refund Number"
                placeholder="RF20260201-0001"
                required-mark
              />
            </div>

            <VaInput
              v-model.number="form.invoice_id"
              type="number"
              label="Invoice ID"
              placeholder="e.g. 17"
              required-mark
              :min="1"
            />

            <VaInput
              v-model.number="form.payment_id"
              type="number"
              label="Payment ID"
              placeholder="e.g. 29"
              required-mark
              :min="1"
            />

            <VaInput
              v-model.number="form.refund_amount"
              type="number"
              label="Refund Amount"
              placeholder="e.g. 45.00"
              required-mark
              :min="0"
              :step="0.01"
            />

            <VaSelect
              v-model="form.refund_method"
              label="Refund Method"
              required-mark
              :options="METHODS"
              :text-by="methodLabel"
              :value-by="(v) => v"
            />

            <div class="span2">
              <VaTextarea
                v-model="form.refund_reason"
                label="Refund Reason"
                placeholder="Why refund?"
                required-mark
                autosize
                :min-rows="3"
              />
            </div>

            <VaSelect
              v-model="form.status"
              label="Status"
              required-mark
              :options="STATUSES"
              :text-by="statusLabel"
              :value-by="(v) => v"
            />

            <VaInput
              v-model="form.refund_date"
              label="Refund Date"
              placeholder="YYYY-MM-DD HH:mm:ss"
              required-mark
            />

            <VaInput
              v-model.number="form.processed_by"
              type="number"
              label="Processed By (user_id)"
              placeholder="e.g. 3"
              :min="1"
            />

            <VaInput
              v-model.number="form.approved_by"
              type="number"
              label="Approved By (user_id)"
              placeholder="e.g. 2"
              :min="1"
            />

            <div class="span2">
              <VaTextarea
                v-model="form.notes"
                label="Notes"
                placeholder="Internal notes…"
                autosize
                :min-rows="3"
              />
            </div>
          </div>

          <div class="actions">
            <VaButton preset="secondary" type="button" @click="goBack">Cancel</VaButton>
            <VaButton color="primary" type="submit">
              {{ isEdit ? "Save Changes" : "Create Refund" }}
            </VaButton>
          </div>

          <div class="hint">
            Note: Static demo (no API). Later replace save() with POST/PUT.
          </div>
        </form>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"
import { refunds as refundsSeed } from "@/data/billding/refunds"

const route = useRoute()
const router = useRouter()

const refundIdParam = computed(() => route.params.refundId)
const isEdit = computed(() => !!refundIdParam.value)

const METHODS = ["original_method", "cash", "credit_card", "bank_transfer"]
const STATUSES = ["pending", "approved", "completed", "rejected"]

const form = reactive({
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
    form.refund_date = nowSql()
    return
  }

  const id = Number(refundIdParam.value)
  const found = refundsSeed.find((x) => Number(x.refund_id) === id)

  if (!found) {
    router.replace({ name: "billing-refunds" })
    return
  }

  Object.assign(form, JSON.parse(JSON.stringify(found)))
})

function nowSql() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`
}

function methodLabel(v) {
  const map = {
    original_method: "Original method",
    cash: "Cash",
    credit_card: "Credit card",
    bank_transfer: "Bank transfer",
  }
  return map[v] || String(v || "")
}

function statusLabel(v) {
  return String(v || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function goBack() {
  router.push({ name: "billing-refunds" })
}

function save() {
  // static demo
  // later: POST/PUT API then redirect
  goBack()
}
</script>

<style scoped>
.page {
  padding: 18px 18px 40px;
  background: #f8fafc;
  color: #0f172a;
}

/* Header */
.header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.head-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
}
.subtitle {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}

/* Card shadow like your config page */
.card {
  border-radius: 14px;
}
.shadow {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.span2 {
  grid-column: span 2;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.hint {
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .span2 {
    grid-column: span 1;
  }
}
</style>
