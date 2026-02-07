<!-- src/pages/billing/ExtraChargeForm.vue -->
<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">{{ isEdit ? "Edit Extra Charge" : "New Extra Charge" }}</h1>
        <p class="subtitle">All fields match the database table: <b>additional_charges</b>.</p>
      </div>

      <div class="header-actions">
        <RouterLink class="no-underline" :to="{ name: 'admin.extra-charges' }">
          <VaButton preset="secondary" icon="arrow_back">Back</VaButton>
        </RouterLink>

        <VaButton icon="save" color="primary" @click="save">
          {{ isEdit ? "Save Changes" : "Create Charge" }}
        </VaButton>
      </div>
    </div>

    <VaForm ref="formRef">
      <VaCard class="card shadow">
        <VaCardContent>
          <div class="section-title">Charge Info</div>

          <div class="grid">
            <VaInput
              v-model.number="form.reservation_id"
              type="number"
              label="Reservation ID"
              :rules="[rRequired, rMin1]"
            />

            <VaSelect
              v-model="form.charge_type"
              label="Charge Type"
              :options="chargeTypes"
              :text-by="prettyType"
              :rules="[rRequired]"
            />

            <VaSelect
              v-model="form.currency"
              label="Currency"
              :options="['USD', 'KHR']"
              :rules="[rRequired]"
            />

            <VaInput
              v-model.number="form.charged_by"
              type="number"
              label="Charged By (user_id)"
              placeholder="Optional"
              :min="1"
            />

            <VaInput
              v-model="form.description"
              class="span2"
              label="Description"
              placeholder="e.g. Laundry service"
            />

            <VaInput
              v-model.number="form.amount"
              type="number"
              label="Amount (unit)"
              :step="0.01"
              :rules="[rRequired, rMin0]"
            />

            <VaInput
              v-model.number="form.quantity"
              type="number"
              label="Quantity"
              :step="1"
              :rules="[rRequired, rMin1]"
            />

            <VaInput
              :model-value="computedTotal"
              type="number"
              label="Total Amount"
              :step="0.01"
              readonly
            />

            <VaInput
              v-model="form.charged_at"
              class="span2"
              label="Charged At"
              placeholder="YYYY-MM-DD HH:mm:ss"
            />

            <VaCard class="mini-card span2">
              <VaCardContent class="mini-content">
                <div class="mini-title">Quick Preview</div>
                <div class="mini-row">
                  <span class="mini-muted">Total</span>
                  <span class="mini-strong">{{ money(form.total_amount, form.currency) }}</span>
                </div>
                <div class="mini-row">
                  <span class="mini-muted">Approval</span>
                  <VaBadge
                    :text="!form.requires_approval ? 'Not required' : (form.is_approved ? 'Approved' : 'Pending')"
                    :color="!form.requires_approval ? 'secondary' : (form.is_approved ? 'success' : 'warning')"
                  />
                </div>
              </VaCardContent>
            </VaCard>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="card shadow">
        <VaCardContent>
          <div class="section-title">Approval</div>

          <div class="toggles">
            <VaSwitch v-model="form.requires_approval" label="Requires approval" />

            <VaSwitch
              v-model="form.is_approved"
              label="Approved"
              :disabled="!form.requires_approval"
            />
          </div>

          <div v-if="form.requires_approval" class="grid mt">
            <VaInput
              v-model.number="form.approved_by"
              type="number"
              label="Approved By (user_id)"
              :disabled="!form.is_approved"
              :min="1"
            />

            <VaInput
              v-model="form.approved_at"
              label="Approved At"
              placeholder="YYYY-MM-DD HH:mm:ss"
              :disabled="!form.is_approved"
            />
          </div>

          <div class="note">
            This page is static demo. Later replace <b>save()</b> with API <b>POST/PUT</b>.
          </div>
        </VaCardContent>
      </VaCard>
    </VaForm>

    <VaAlert v-if="toast" class="toast" :color="toast.color" :title="toast.title">
      {{ toast.message }}
    </VaAlert>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { extraCharges } from "@/data/billding/extraCharges"
import { money } from "@/utils/money"

const route = useRoute()
const router = useRouter()

const chargeId = route.params.chargeId ? Number(route.params.chargeId) : null
const isEdit = computed(() => Number.isFinite(chargeId) && chargeId !== null)

const chargeTypes = [
  "late_checkout",
  "early_checkin",
  "extra_bed",
  "damage",
  "lost_key",
  "cleaning_fee",
  "minibar",
  "laundry",
  "room_service",
  "other",
]

function prettyType(t) {
  return String(t || "").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function nowSql() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`
}

const original = computed(() => (isEdit.value ? extraCharges.find((x) => x.charge_id === chargeId) : null))

const form = reactive({
  charge_id: null,
  reservation_id: 0,
  charge_type: "",
  description: "",
  amount: 0,
  quantity: 1,
  total_amount: 0,
  currency: "USD",
  charged_at: nowSql(),
  charged_by: null,
  requires_approval: false,
  is_approved: false,
  approved_by: null,
  approved_at: null,
})

watch(
  () => original.value,
  (o) => {
    if (o) Object.assign(form, JSON.parse(JSON.stringify(o)))
    else reset()
  },
  { immediate: true }
)

const computedTotal = computed(() => {
  const total = Number(form.amount || 0) * Number(form.quantity || 0)
  form.total_amount = Number.isFinite(total) ? Number(total.toFixed(form.currency === "KHR" ? 0 : 2)) : 0
  return form.total_amount
})

watch(
  () => form.requires_approval,
  (v) => {
    if (!v) {
      form.is_approved = false
      form.approved_by = null
      form.approved_at = null
    }
  }
)

watch(
  () => form.is_approved,
  (v) => {
    if (!form.requires_approval) return
    if (!v) {
      form.approved_by = null
      form.approved_at = null
    } else {
      if (!form.approved_at) form.approved_at = nowSql()
    }
  }
)

function reset() {
  Object.assign(form, {
    charge_id: null,
    reservation_id: 0,
    charge_type: "",
    description: "",
    amount: 0,
    quantity: 1,
    total_amount: 0,
    currency: "USD",
    charged_at: nowSql(),
    charged_by: null,
    requires_approval: false,
    is_approved: false,
    approved_by: null,
    approved_at: null,
  })
}

const formRef = ref(null)
const toast = ref(null)

const rRequired = (v) => (v !== null && v !== undefined && String(v).trim() !== "") || "Required"
const rMin1 = (v) => Number(v || 0) >= 1 || "Must be ≥ 1"
const rMin0 = (v) => Number(v || 0) >= 0 || "Must be ≥ 0"

async function save() {
  const ok = await formRef.value?.validate?.()
  if (!ok) {
    toast.value = { color: "danger", title: "Invalid", message: "Please fix required fields." }
    return
  }

  // demo save (no API yet)
  toast.value = {
    color: "success",
    title: "Saved",
    message: isEdit.value ? "Updated (static demo)" : "Created (static demo)",
  }

  setTimeout(() => {
    router.push({ name: "billing-extra-charges" })
  }, 500)
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
.title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0;
}
.subtitle {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}
.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Cards */
.card {
  border-radius: 14px;
  margin-bottom: 12px;
}
.shadow {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

/* Layout */
.section-title {
  font-weight: 900;
  font-size: 14px;
  margin-bottom: 12px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.span2 {
  grid-column: span 2;
}
.mt {
  margin-top: 12px;
}

/* Approval */
.toggles {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

/* Mini preview */
.mini-card {
  border-radius: 14px;
  background: #f8fafc;
}
.mini-content {
  display: grid;
  gap: 10px;
}
.mini-title {
  font-size: 12px;
  font-weight: 900;
  color: #334155;
}
.mini-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.mini-muted {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}
.mini-strong {
  font-weight: 900;
}

/* Note */
.note {
  margin-top: 12px;
  color: #64748b;
  font-size: 12px;
}

/* Toast */
.toast {
  margin-top: 12px;
  border-radius: 14px;
}

/* Responsive */
@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
  .span2 {
    grid-column: span 2;
  }
}
@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .span2 {
    grid-column: span 1;
  }
}
</style>
