<template>
  <div class="page">
    <div class="top">
      <div>
        <h1 class="title">{{ isEdit ? "Edit Extra Charge" : "New Extra Charge" }}</h1>
        <p class="sub">All fields match the database table: additional_charges.</p>
      </div>
    <RouterLink class="link" :to="{ name: 'admin.extra-charges' }">← Back</RouterLink>
    </div>

    <form class="form" @submit.prevent="save">
      <div class="grid">
        <div class="field">
          <div class="label">Reservation ID</div>
          <input v-model.number="form.reservation_id" class="input" type="number" min="1" required />
        </div>

        <div class="field">
          <div class="label">Charge Type</div>
          <select v-model="form.charge_type" class="select" required>
            <option disabled value="">Select type</option>
            <option v-for="t in chargeTypes" :key="t" :value="t">{{ prettyType(t) }}</option>
          </select>
        </div>

        <div class="field">
          <div class="label">Currency</div>
          <select v-model="form.currency" class="select" required>
            <option value="USD">USD</option>      
            <option value="KHR">KHR</option>
          </select>
        </div>

        <div class="field">
          <div class="label">Charged By (user_id)</div>
          <input v-model.number="form.charged_by" class="input" type="number" min="1" />
        </div>

        <div class="field span2">
          <div class="label">Description</div>
          <input v-model="form.description" class="input" type="text" placeholder="e.g. Laundry service" />
        </div>

        <div class="field">
          <div class="label">Amount (unit)</div>
          <input v-model.number="form.amount" class="input" type="number" step="0.01" min="0" required />
        </div>

        <div class="field">
          <div class="label">Quantity</div>
          <input v-model.number="form.quantity" class="input" type="number" step="1" min="1" required />
        </div>

        <div class="field">
          <div class="label">Total Amount</div>
          <input :value="computedTotal" class="input" type="number" step="0.01" readonly />
        </div>

        <div class="field">
          <div class="label">Charged At</div>
          <input v-model="form.charged_at" class="input" type="text" placeholder="YYYY-MM-DD HH:mm:ss" />
        </div>
      </div>

      <div class="toggles">
        <label class="toggle">
          <input type="checkbox" v-model="form.requires_approval" />
          <span>Requires approval</span>
        </label>

        <label class="toggle" :class="{ disabled: !form.requires_approval }">
          <input type="checkbox" v-model="form.is_approved" :disabled="!form.requires_approval" />
          <span>Approved</span>
        </label>
      </div>

      <div v-if="form.requires_approval" class="grid">
        <div class="field">
          <div class="label">Approved By (user_id)</div>
          <input v-model.number="form.approved_by" class="input" type="number" min="1" :disabled="!form.is_approved" />
        </div>

        <div class="field">
          <div class="label">Approved At</div>
          <input v-model="form.approved_at" class="input" type="text" placeholder="YYYY-MM-DD HH:mm:ss" :disabled="!form.is_approved" />
        </div>
      </div>

      <div class="footer">
        <button class="btn" type="submit">{{ isEdit ? "Save Changes" : "Create Charge" }}</button>
        <button class="btn soft" type="button" @click="reset">Reset</button>
      </div>

      <div class="note">
        This page is static. Later replace save() with API POST/PUT.
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"
import { extraCharges } from "@/data/billding/extraCharges"

const route = useRoute()
const router = useRouter()

const chargeId = route.params.chargeId ? Number(route.params.chargeId) : null
const isEdit = computed(() => Number.isFinite(chargeId))

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
  return String(t || "").replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase())
}

function nowSql() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const original = isEdit.value ? extraCharges.find(x => x.charge_id === chargeId) : null

const form = reactive({
  charge_id: original?.charge_id ?? null,
  reservation_id: original?.reservation_id ?? 0,
  charge_type: original?.charge_type ?? "",
  description: original?.description ?? "",
  amount: Number(original?.amount ?? 0),
  quantity: Number(original?.quantity ?? 1),
  total_amount: Number(original?.total_amount ?? 0),
  currency: original?.currency ?? "USD",
  charged_at: original?.charged_at ?? nowSql(),
  charged_by: original?.charged_by ?? null,
  requires_approval: Boolean(original?.requires_approval ?? false),
  is_approved: Boolean(original?.is_approved ?? false),
  approved_by: original?.approved_by ?? null,
  approved_at: original?.approved_at ?? null,
})

const computedTotal = computed(() => {
  const total = Number(form.amount || 0) * Number(form.quantity || 0)
  form.total_amount = Number.isFinite(total) ? Number(total.toFixed(2)) : 0
  return form.total_amount
})

function reset() {
  if (original) {
    Object.assign(form, JSON.parse(JSON.stringify(original)))
  } else {
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
}

function save() {
  // STATIC DEMO:
  // In real app:
  // - POST for create
  // - PUT for edit
  // - Server calculates total_amount, sets charged_at, etc.
  router.push({ name: "billing-extra-charges" })
}
</script>

<style scoped>
.page{
  padding: 18px;
  background:#fbfbfb;
  color:#0f172a;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
}
.top{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap: 14px;
  margin-bottom: 14px;
}
.title{ font-size: 22px; margin:0; font-weight: 900; letter-spacing: -.2px; }
.sub{ margin:6px 0 0; color:#64748b; font-size: 13px; }
.link{
  color:#0f172a;
  font-weight: 900;
  text-decoration: underline;
  text-underline-offset: 3px;
  font-size: 13px;
}

.form{
  background:#f3f4f6;
  border-radius: 16px;
  padding: 14px;
}
.grid{
  display:grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.field{ display:flex; flex-direction:column; gap:6px; }
.span2{ grid-column: span 2; }

.label{
  font-size: 11px;
  color:#64748b;
  font-weight: 800;
  letter-spacing:.6px;
  text-transform: uppercase;
}
.input, .select{
  border: 0;
  outline: none;
  background:#ffffff;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
}

.toggles{
  display:flex;
  gap: 14px;
  margin: 12px 0;
  flex-wrap: wrap;
}
.toggle{
  display:flex;
  gap: 8px;
  align-items:center;
  font-weight: 800;
  color:#0f172a;
  font-size: 13px;
}
.toggle.disabled{ opacity: .55; }

.footer{
  display:flex;
  gap: 10px;
  margin-top: 14px;
}
.btn{
  border:0;
  background:#0f172a;
  color:#fff;
  font-weight: 900;
  padding: 10px 14px;
  border-radius: 12px;
  cursor:pointer;
  font-size: 13px;
}
.btn.soft{
  background:#e5e7eb;
  color:#0f172a;
}
.note{
  margin-top: 12px;
  color:#64748b;
  font-size: 12px;
}

@media (max-width: 900px){
  .grid{ grid-template-columns: 1fr 1fr; }
  .span2{ grid-column: span 2; }
}
@media (max-width: 520px){
  .grid{ grid-template-columns: 1fr; }
  .span2{ grid-column: span 1; }
}
</style>
