<template>
  <div class="page">
    <!-- Header -->
    <div class="top">
      <div>
        <h1 class="title">Extra Charges</h1>
        <p class="sub">Add & manage additional charges by reservation (late checkout, minibar, damage...).</p>
      </div>

      <div class="actions">
        <!-- <RouterLink class="btn" :to="{ name: 'billing-extra-charges-create' }">
          + New Charge
        </RouterLink> -->
        <!-- <RouterLink class="btn btn--outline" :to="{ name: 'billing-extra-charges-create' }"> -->
        <!-- <RouterLink to="/billing/extra-charges/create">
            <span class="btn-icon">+</span> New Charge
        </RouterLink> -->
        <RouterLink :to="{ name: 'admin.billing-extra-charges-create' }">
          <span class="btn-icon">+</span> New Charge
        </RouterLink>

      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <div class="field">
        <div class="label">Search</div>
        <input
          v-model="q"
          class="input"
          type="text"
          placeholder="Search by description, reservation id, type..."
        />
      </div>

      <div class="field">
        <div class="label">Type</div>
        <select v-model="type" class="select">
          <option value="all">All</option>
          <option v-for="t in types" :key="t" :value="t">{{ prettyType(t) }}</option>
        </select>
      </div>

      <div class="field">
        <div class="label">Approval</div>
        <select v-model="approval" class="select">
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="not_required">Not required</option>
        </select>
      </div>

      <div class="field">
        <div class="label">Currency</div>
        <select v-model="currency" class="select">
          <option value="all">All</option>
          <option value="USD">USD</option>
          <option value="KHR">KHR</option>
        </select>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary">
      <div class="sum-card">
        <div class="sum-label">Items</div>
        <div class="sum-value">{{ filtered.length }}</div>
      </div>
      <div class="sum-card">
        <div class="sum-label">Total (USD)</div>
        <div class="sum-value">{{ money(totalUsd, "USD") }}</div>
      </div>
      <div class="sum-card">
        <div class="sum-label">Pending approvals</div>
        <div class="sum-value">{{ pendingCount }}</div>
      </div>
    </div>

    <!-- List -->
    <div class="list">
      <div v-if="filtered.length === 0" class="empty">
        No extra charges found.
      </div>

      <div v-else class="rows">
        <div v-for="row in filtered" :key="row.charge_id" class="row">
          <div class="left">
            <div class="row-top">
              <div class="row-title">
                {{ prettyType(row.charge_type) }}
                <span class="muted">• Reservation #{{ row.reservation_id }}</span>
              </div>

              <div class="chips">
                <span class="chip" :class="chipClass(row)">
                  {{ chipText(row) }}
                </span>
                <span class="chip soft">
                  {{ row.currency }}
                </span>
              </div>
            </div>

            <div class="row-desc">
              {{ row.description || "-" }}
            </div>

            <div class="row-meta">
              <span>Qty: <b>{{ row.quantity }}</b></span>
              <span class="dot">•</span>
              <span>Unit: <b>{{ money(row.amount, row.currency) }}</b></span>
              <span class="dot">•</span>
              <span>Total: <b>{{ money(row.total_amount, row.currency) }}</b></span>
              <span class="dot">•</span>
              <span class="muted">Charged at {{ row.charged_at }}</span>
            </div>
          </div>

          <div class="right">
            <!-- <RouterLink class="link"
              :to="{ name: 'billing-extra-charges-edit', params: { chargeId: row.charge_id } }"
            >
              Edit
            </RouterLink> -->
            <RouterLink class="link"
            :to="{ 
              name: 'admin.billing-extra-charges-edit', 
              params: { chargeId: row.charge_id } 
            }"
          >
            Edit
          </RouterLink>


            \

            <button class="link danger" type="button" @click="removeRow(row.charge_id)">
              Delete
            </button>

            <button
              v-if="row.requires_approval && !row.is_approved"
              class="btn-mini"
              type="button"
              @click="approve(row.charge_id)"
            >
              Approve
            </button>

            <button
              v-if="row.requires_approval && row.is_approved"
              class="btn-mini soft"
              type="button"
              @click="unapprove(row.charge_id)"
            >
              Set Pending
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="hint">
      Note: This is static UI state. Later you’ll replace actions with API calls.
    </div>
  </div>
</template>

  <script setup>
import { computed, ref } from "vue"
import { extraCharges as seed  } from "@/data/billding/extraCharges"

import { money } from "@/utils/money"

const rows = ref([...seed])

const q = ref("")
const type = ref("all")
const approval = ref("all")
const currency = ref("all")

const types = computed(() => {
  const set = new Set(rows.value.map(r => r.charge_type))
  return Array.from(set).sort()
})

function prettyType(t) {
  return String(t || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, c => c.toUpperCase())
}

function chipText(r) {
  if (!r.requires_approval) return "No approval"
  return r.is_approved ? "Approved" : "Pending"
}

function chipClass(r) {
  if (!r.requires_approval) return "muted"
  return r.is_approved ? "ok" : "warn"
}

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()

  return rows.value.filter(r => {
    const matchQuery =
      !query ||
      String(r.description || "").toLowerCase().includes(query) ||
      String(r.reservation_id || "").includes(query) ||
      String(r.charge_type || "").toLowerCase().includes(query) ||
      String(r.charge_id || "").includes(query)

    const matchType = type.value === "all" || r.charge_type === type.value

    const matchApproval =
      approval.value === "all" ||
      (approval.value === "approved" && r.requires_approval && r.is_approved) ||
      (approval.value === "pending" && r.requires_approval && !r.is_approved) ||
      (approval.value === "not_required" && !r.requires_approval)

    const matchCurrency = currency.value === "all" || r.currency === currency.value

    return matchQuery && matchType && matchApproval && matchCurrency
  })
})

const totalUsd = computed(() => {
  // For demo: only sum USD items.
  return filtered.value
    .filter(r => r.currency === "USD")
    .reduce((sum, r) => sum + Number(r.total_amount || 0), 0)
})

const pendingCount = computed(() => {
  return rows.value.filter(r => r.requires_approval && !r.is_approved).length
})

function approve(chargeId) {
  const i = rows.value.findIndex(x => x.charge_id === chargeId)
  if (i === -1) return
  rows.value[i] = {
    ...rows.value[i],
    is_approved: true,
    approved_by: 1,
    approved_at: new Date().toISOString().slice(0, 19).replace("T", " ")
  }
}

function unapprove(chargeId) {
  const i = rows.value.findIndex(x => x.charge_id === chargeId)
  if (i === -1) return
  rows.value[i] = {
    ...rows.value[i],
    is_approved: false,
    approved_by: null,
    approved_at: null
  }
}

function removeRow(chargeId) {
  rows.value = rows.value.filter(x => x.charge_id !== chargeId)
}
</script>

<style scoped>
.page{
  padding: 18px;
  background: #fbfbfb;
  color: #0f172a;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
}
.top{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:14px;
  margin-bottom: 14px;
}
.title{ font-size: 22px; margin:0; font-weight: 900; letter-spacing: -.2px; }
.sub{ margin:6px 0 0; color:#64748b; font-size: 13px; }

.actions{ display:flex; gap:10px; }
.btn{
  text-decoration:none;
  background:#0f172a;
  color:#fff;
  padding:10px 14px;
  border-radius:12px;
  font-weight:800;
  font-size:13px;
}

.controls{
  display:grid;
  grid-template-columns: 1.3fr 1fr 1fr 0.8fr;
  gap: 10px;
  margin: 12px 0 14px;
}
.field .label{
  font-size: 11px;
  color:#64748b;
  margin-bottom: 6px;
  font-weight: 800;
  letter-spacing:.6px;
  text-transform: uppercase;
}
.input, .select{
  width:100%;
  padding: 10px 12px;
  border: 0;
  outline: none;
  border-radius: 12px;
  background: #f3f4f6;
  font-size: 13px;
}

.summary{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 8px 0 14px;
}
.sum-card{
  padding: 12px;
  background: #f3f4f6;
  border-radius: 14px;
}
.sum-label{
  font-size: 11px;
  color:#64748b;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing:.6px;
}
.sum-value{
  font-size: 18px;
  font-weight: 900;
  margin-top: 6px;
}

.list{
  padding: 10px 0;
}
.empty{
  padding: 18px;
  background:#f3f4f6;
  border-radius: 14px;
  color:#64748b;
  font-weight: 700;
  text-align:center;
}

.rows{
  display:flex;
  flex-direction:column;
  gap: 10px;
}
.row{
  display:flex;
  gap: 12px;
  padding: 14px;
  background:#f3f4f6;
  border-radius: 16px;
}
.left{ flex: 1; min-width: 0; }
.right{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap: 8px;
  min-width: 120px;
}

.row-top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 10px;
}
.row-title{
  font-weight: 900;
  font-size: 14px;
}
.muted{ color:#64748b; font-weight:700; }

.row-desc{
  margin-top: 6px;
  font-size: 13px;
  color:#0f172a;
}
.row-meta{
  margin-top: 10px;
  display:flex;
  flex-wrap:wrap;
  gap: 8px;
  color:#334155;
  font-size: 12px;
}
.dot{ color:#94a3b8; }

.chips{ display:flex; gap: 8px; flex-wrap: wrap; }
.chip{
  font-size: 11px;
  font-weight: 900;
  padding: 6px 10px;
  border-radius: 999px;
  background:#e5e7eb;
  color:#0f172a;
  white-space:nowrap;
}
.chip.ok{ background:#dcfce7; color:#14532d; }
.chip.warn{ background:#fef9c3; color:#713f12; }
.chip.muted{ background:#e5e7eb; color:#475569; }
.chip.soft{ background:#eaeaea; color:#0f172a; }

.link{
  background: transparent;
  border: 0;
  padding: 0;
  cursor:pointer;
  color:#0f172a;
  font-weight: 900;
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.link.danger{ color:#b91c1c; }

.btn-mini{
  border: 0;
  background:#0f172a;
  color:#fff;
  font-weight: 900;
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 12px;
  cursor:pointer;
}
.btn-mini.soft{
  background:#e5e7eb;
  color:#0f172a;
}

.hint{
  margin-top: 14px;
  color:#64748b;
  font-size: 12px;
}

/* responsive */
@media (max-width: 900px){
  .controls{ grid-template-columns: 1fr 1fr; }
  .summary{ grid-template-columns: 1fr; }
  .row{ flex-direction:column; }
  .right{ align-items:flex-start; flex-direction:row; flex-wrap:wrap; }
}
</style>
