<!-- src/pages/billing/Refunds.vue -->
<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="head-title">
          <span class="material-icons">undo</span>
          <h1 class="title">Refunds</h1>
        </div>
        <p class="subtitle">Track payment refunds • Approvals • Status history</p>
      </div>

      <div class="header-actions">
        <VaButton icon="add" color="primary" @click="goCreate">Create Refund</VaButton>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats">
      <VaCard class="card shadow">
        <VaCardContent>
          <div class="stat-label">Total</div>
          <div class="stat-value">{{ filtered.length }}</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="card shadow">
        <VaCardContent>
          <div class="stat-label">Pending</div>
          <div class="stat-value">{{ countBy("pending") }}</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="card shadow">
        <VaCardContent>
          <div class="stat-label">Approved</div>
          <div class="stat-value">{{ countBy("approved") }}</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="card shadow">
        <VaCardContent>
          <div class="stat-label">Completed</div>
          <div class="stat-value">{{ countBy("completed") }}</div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Filters -->
    <VaCard class="card shadow">
      <VaCardContent>
        <div class="filters">
          <VaInput
            v-model="q"
            label="Search"
            placeholder="Refund #, invoice id, payment id, reason…"
            clearable
          />

          <VaSelect
            v-model="status"
            label="Status"
            :options="STATUS_OPTIONS"
            :text-by="statusLabel"
          />

          <VaSelect
            v-model="method"
            label="Method"
            :options="METHOD_OPTIONS"
            :text-by="methodLabel"
          />

          <VaButton preset="secondary" @click="reset">Reset</VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- List -->
    <VaCard class="card shadow">
      <VaCardContent>
        <div class="list-top">
          <div class="list-title">Results: <b>{{ filtered.length }}</b></div>
          <div class="list-sub">Click Edit to update</div>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="skeleton">
          <div v-for="i in 6" :key="i" class="sk-row"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="empty">
          <div class="empty-title">No refunds found</div>
          <div class="empty-sub">Try changing filters or create a new refund.</div>
          <VaButton class="mt" icon="add" color="primary" @click="goCreate">Create Refund</VaButton>
        </div>

        <!-- Rows -->
        <div v-else class="rows">
          <VaCard v-for="r in paged" :key="r.refund_id" class="row-card">
            <VaCardContent>
              <div class="row">
                <div class="left">
                  <div class="row-top">
                    <div class="row-title">
                      {{ r.refund_number }}
                    </div>

                    <div class="chips">
                      <VaBadge
                        :text="prettyStatus(r.status)"
                        :color="statusColor(r.status)"
                        class="badge"
                      />
                      <VaChip size="small" outline color="secondary">
                        {{ methodLabel(r.refund_method) }}
                      </VaChip>
                    </div>
                  </div>

                  <div class="reason">
                    <b>Reason:</b> {{ r.refund_reason || "—" }}
                  </div>

                  <div class="meta">
                    <span>Refund ID: {{ r.refund_id }}</span>
                    <span class="dot">•</span>
                    <span>Invoice: {{ r.invoice_id }}</span>
                    <span class="dot">•</span>
                    <span>Payment: {{ r.payment_id }}</span>
                    <span class="dot">•</span>
                    <span>Date: {{ fmt(r.refund_date) }}</span>
                    <span class="dot">•</span>
                    <span>Processed: {{ r.processed_by ?? "—" }}</span>
                    <span class="dot">•</span>
                    <span>Approved: {{ r.approved_by ?? "—" }}</span>
                  </div>

                  <div v-if="r.notes" class="notes">
                    <b>Notes:</b> {{ r.notes }}
                  </div>
                </div>

                <div class="right">
                  <div class="amount">
                    <div class="amount-label">Amount</div>
                    <div class="amount-value">{{ money(r.refund_amount) }}</div>
                  </div>

                  <VaButton preset="secondary" size="small" @click="goEdit(r.refund_id)">
                    Edit
                  </VaButton>
                </div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Pagination -->
          <div class="pager">
            <div class="pager-left">
              Showing <b>{{ startRow + 1 }}</b>–<b>{{ Math.min(startRow + pageSize, filtered.length) }}</b>
              of <b>{{ filtered.length }}</b>
            </div>

            <VaPagination
              v-model="page"
              :pages="totalPages"
              :visible-pages="3"
              buttons-preset="secondary"
              gapped
              class="justify-center sm:justify-start"
            />
          </div>
        </div>

        <div class="hint">
          Tip: “Pending” → waiting approval, “Approved” → ready to process, “Completed” → already refunded.
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { refunds as refundsSeed } from "@/data/billding/refunds"

const router = useRouter()

const loading = ref(true)
const rows = ref([])

const q = ref("")
const status = ref("all")
const method = ref("all")

const STATUS_OPTIONS = ["all", "pending", "approved", "completed", "rejected"]
const METHOD_OPTIONS = ["all", "cash", "credit_card", "bank_transfer", "original_method"]

onMounted(() => {
  setTimeout(() => {
    rows.value = [...refundsSeed].sort((a, b) => (b.refund_id || 0) - (a.refund_id || 0))
    loading.value = false
  }, 650)
})

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()

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

function statusLabel(v) {
  return v === "all" ? "All" : prettyStatus(v)
}

function methodLabel(v) {
  const map = {
    all: "All",
    cash: "Cash",
    credit_card: "Credit card",
    bank_transfer: "Bank transfer",
    original_method: "Original method",
  }
  return map[v] || prettyStatus(v)
}

function statusColor(s) {
  if (s === "pending") return "warning"
  if (s === "approved") return "info"
  if (s === "completed") return "success"
  if (s === "rejected") return "danger"
  return "secondary"
}

function fmt(s) {
  return (s || "").replace("T", " ").slice(0, 19)
}

function money(amount) {
  const n = Number(amount || 0)
  return `$${n.toFixed(2)}`
}

/* Pagination (VaPagination) */
const page = ref(1)
const pageSize = 8

watch([q, status, method], () => {
  page.value = 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const startRow = computed(() => (page.value - 1) * pageSize)
const paged = computed(() => filtered.value.slice(startRow.value, startRow.value + pageSize))

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
.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Cards */
.card {
  border-radius: 14px;
}
.shadow {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 12px 0 14px;
}
.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}
.stat-value {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 900;
}

/* Filters */
.filters {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr auto;
  gap: 12px;
  align-items: end;
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

.row-card {
  border-radius: 16px;
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
  gap: 10px;
}

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
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.badge {
  font-weight: 900;
}
.reason {
  margin-top: 6px;
  font-size: 13px;
  color: #0f172a;
}
.meta {
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
.notes {
  margin-top: 8px;
  font-size: 12px;
  color: #475569;
}

/* Amount */
.amount-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
  text-align: right;
}
.amount-value {
  font-size: 18px;
  font-weight: 900;
  text-align: right;
}

/* Skeleton */
.skeleton {
  display: grid;
  gap: 10px;
}
.sk-row {
  height: 70px;
  border-radius: 16px;
  background: #eef2f7;
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Empty */
.empty {
  padding: 18px;
  border-radius: 14px;
  background: #f1f5f9;
  color: #64748b;
  font-weight: 700;
  text-align: center;
}
.empty-title {
  font-weight: 900;
  color: #0f172a;
}
.empty-sub {
  margin-top: 6px;
  font-weight: 600;
}
.mt { margin-top: 12px; }

/* Pager */
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

/* Hint */
.hint {
  margin-top: 12px;
  color: #64748b;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 980px) {
  .filters { grid-template-columns: 1fr 1fr; }
  .stats { grid-template-columns: 1fr 1fr; }
  .row { flex-direction: column; }
  .right { align-items: flex-start; flex-direction: row; flex-wrap: wrap; }
  .amount-label, .amount-value { text-align: left; }
}
@media (max-width: 560px) {
  .stats { grid-template-columns: 1fr; }
}
</style>
