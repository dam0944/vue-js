<!-- src/pages/billing/ExtraCharges.vue -->
<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Extra Charges</h1>
        <p class="subtitle">
          Add & manage additional charges by reservation (late checkout, minibar, damage...).
        </p>
      </div>

      <div class="header-actions">
        <RouterLink :to="{ name: 'admin.billing-extra-charges-create' }" class="no-underline">
          <VaButton icon="add" color="primary">New Charge</VaButton>
        </RouterLink>
      </div>
    </div>

    <!-- Controls -->
    <VaCard class="card shadow">
      <VaCardContent>
        <div class="controls">
          <VaInput
            v-model="q"
            label="Search"
            placeholder="Description, reservation id, type..."
            clearable
          />

          <VaSelect
            v-model="type"
            label="Type"
            :options="['all', ...types]"
            :text-by="(v) => v === 'all' ? 'All' : prettyType(v)"
          />

          <VaSelect
            v-model="approval"
            label="Approval"
            :options="APPROVAL_OPTIONS"
            :text-by="(v) => approvalLabel(v)"
          />

          <VaSelect
            v-model="currency"
            label="Currency"
            :options="['all', 'USD', 'KHR']"
            :text-by="(v) => (v === 'all' ? 'All' : v)"
          />
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Summary -->
    <div class="summary">
      <VaCard class="card shadow">
        <VaCardContent>
          <div class="sum-label">Items</div>
          <div class="sum-value">{{ filtered.length }}</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="card shadow">
        <VaCardContent>
          <div class="sum-label">Total (USD)</div>
          <div class="sum-value">{{ money(totalUsd, "USD") }}</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="card shadow">
        <VaCardContent>
          <div class="sum-label">Pending approvals</div>
          <div class="sum-value">{{ pendingCount }}</div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- List -->
    <VaCard class="card shadow">
      <VaCardContent>
        <div class="list-top">
          <div class="list-title">
            Results: <b>{{ filtered.length }}</b>
          </div>
          <div class="list-sub">Clean list + actions</div>
        </div>

        <div v-if="filtered.length === 0" class="empty">
          No extra charges found. Try changing filters.
        </div>

        <div v-else class="rows">
          <VaCard
            v-for="row in paged"
            :key="row.charge_id"
            class="row-card"
          >
            <VaCardContent>
              <div class="row">
                <div class="left">
                  <div class="row-top">
                    <div class="row-title">
                      {{ prettyType(row.charge_type) }}
                      <span class="muted">• Reservation #{{ row.reservation_id }}</span>
                    </div>

                    <div class="chips">
                      <VaBadge
                        :text="chipText(row)"
                        :color="chipColor(row)"
                        class="badge"
                      />
                      <VaChip size="small" outline color="secondary">
                        {{ row.currency }}
                      </VaChip>
                    </div>
                  </div>

                  <div class="row-desc">
                    {{ row.description || "—" }}
                  </div>

                  <div class="row-meta">
                    <span>Qty: <b>{{ row.quantity }}</b></span>
                    <span class="dot">•</span>
                    <span>Unit: <b>{{ money(row.amount, row.currency) }}</b></span>
                    <span class="dot">•</span>
                    <span>Total: <b>{{ money(row.total_amount, row.currency) }}</b></span>
                    <span class="dot">•</span>
                    <span class="muted">Charged at {{ fmt(row.charged_at) }}</span>
                  </div>
                </div>

                <div class="right">
                  <RouterLink
                    class="no-underline"
                    :to="{ name: 'admin.billing-extra-charges-edit', params: { chargeId: row.charge_id } }"
                  >
                    <VaButton preset="secondary" size="small">Edit</VaButton>
                  </RouterLink>

                  <VaButton
                    preset="secondary"
                    size="small"
                    color="danger"
                    @click="removeRow(row.charge_id)"
                  >
                    Delete
                  </VaButton>

                  <VaButton
                    v-if="row.requires_approval && !row.is_approved"
                    size="small"
                    color="success"
                    @click="approve(row.charge_id)"
                  >
                    Approve
                  </VaButton>

                  <VaButton
                    v-if="row.requires_approval && row.is_approved"
                    size="small"
                    preset="secondary"
                    @click="unapprove(row.charge_id)"
                  >
                    Set Pending
                  </VaButton>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Pagination -->
         <VaPagination
            v-model="value"
            :pages="10"
            :visible-pages="3"
            buttons-preset="secondary"  
            gapped
            class="justify-center sm:justify-start"
          />
        </div>
        <div class="hint">
          Note: This is static UI state. Later replace actions with API calls.
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { extraCharges as seed } from "@/data/billding/extraCharges"
import { money } from "@/utils/money"

const rows = ref(Array.isArray(seed) ? [...seed] : [])

const q = ref("")
const type = ref("all")
const approval = ref("all")
const currency = ref("all")

const APPROVAL_OPTIONS = ["all", "approved", "pending", "not_required"]

const types = computed(() => {
  const set = new Set(rows.value.map((r) => r.charge_type).filter(Boolean))
  return Array.from(set).sort()
})

function prettyType(t) {
  return String(t || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function approvalLabel(v) {
  if (v === "all") return "All"
  if (v === "approved") return "Approved"
  if (v === "pending") return "Pending"
  return "Not required"
}

function chipText(r) {
  if (!r.requires_approval) return "No approval"
  return r.is_approved ? "Approved" : "Pending"
}

function chipColor(r) {
  if (!r.requires_approval) return "secondary"
  return r.is_approved ? "success" : "warning"
}

function fmt(s) {
  return (s || "").replace("T", " ").slice(0, 19)
}

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()

  return rows.value.filter((r) => {
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
  return filtered.value
    .filter((r) => r.currency === "USD")
    .reduce((sum, r) => sum + Number(r.total_amount || 0), 0)
})

const pendingCount = computed(() => {
  return rows.value.filter((r) => r.requires_approval && !r.is_approved).length
})

function approve(chargeId) {
  const i = rows.value.findIndex((x) => x.charge_id === chargeId)
  if (i === -1) return
  rows.value[i] = {
    ...rows.value[i],
    is_approved: true,
    approved_by: 1,
    approved_at: new Date().toISOString().slice(0, 19).replace("T", " "),
  }
}

function unapprove(chargeId) {
  const i = rows.value.findIndex((x) => x.charge_id === chargeId)
  if (i === -1) return
  rows.value[i] = {
    ...rows.value[i],
    is_approved: false,
    approved_by: null,
    approved_at: null,
  }
}

function removeRow(chargeId) {
  rows.value = rows.value.filter((x) => x.charge_id !== chargeId)
}

/* Pagination */
const page = ref(1)
const pageSize = ref(8)

watch([q, type, approval, currency, pageSize], () => {
  page.value = 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const startRow = computed(() => (page.value - 1) * pageSize.value)
const paged = computed(() => filtered.value.slice(startRow.value, startRow.value + pageSize.value))

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
})
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

/* Card shadow like your config page */
.card {
  border-radius: 14px;
}
.shadow {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

/* Controls */
.controls {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 0.8fr;
  gap: 12px;
}

/* Summary */
.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 12px 0 14px;
}
.sum-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}
.sum-value {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 900;
}

/* List */
.list-top {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.list-title {
  font-weight: 900;
}
.list-sub {
  font-size: 12px;
  color: #64748b;
}
.rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Row card */
.row-card {
  border-radius: 16px;
  background: #fff;
}
.row {
  display: flex;
  gap: 12px;
}
.left {
  flex: 1;
  min-width: 0;
}
.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

/* Row content */
.row-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.row-title {
  font-weight: 900;
  font-size: 14px;
}
.row-desc {
  margin-top: 6px;
  font-size: 13px;
}
.row-meta {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #334155;
  font-size: 12px;
}
.dot {
  color: #94a3b8;
}
.muted {
  color: #64748b;
  font-weight: 700;
}
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.badge {
  font-weight: 900;
}

/* Empty + hint */
.empty {
  padding: 18px;
  border-radius: 14px;
  background: #f1f5f9;
  color: #64748b;
  font-weight: 700;
  text-align: center;
}
.hint {
  margin-top: 12px;
  color: #64748b;
  font-size: 12px;
}

/* Pagination */
.pager {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.pager-left {
  font-size: 13px;
  color: #64748b;
}
.pager-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.page-size {
  min-width: 140px;
}

/* Responsive */
@media (max-width: 980px) {
  .controls {
    grid-template-columns: 1fr 1fr;
  }
  .summary {
    grid-template-columns: 1fr;
  }
  .row {
    flex-direction: column;
  }
  .right {
    align-items: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
