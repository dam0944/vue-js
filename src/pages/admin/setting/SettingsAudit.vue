<!-- src/pages/settings/SettingsAudit.vue -->
<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Settings · Audit Logs</h1>
        <p class="subtitle">
          Track system activity (login, create/update/delete) for security and accountability.
        </p>
      </div>

      <div class="header-actions">
        <VaInput
            v-model="search"
            class="control control-search"
            size="small"
            clearable
            placeholder="Search user, action, table, IP..."
        >
            <template #prependInner>
            <VaIcon name="search" color="primary" />
            </template>
        </VaInput>

        <VaSelect
            v-model="filterAction"
            class="control"
            size="small"
            placeholder="Action"
            :options="actionOptions"
            :text-by="(o) => o.text"
            :value-by="(o) => o.value"
        />

        <VaSelect
            v-model="filterTable"
            class="control"
            size="small"
            placeholder="Table"
            :options="tableOptions"
            :text-by="(o) => o.text"
            :value-by="(o) => o.value"
        />
        </div>

    </div>

    <!-- Summary -->
    <div class="cards">
      <div class="card">
        <div class="label">Total Logs</div>
        <div class="value">{{ stats.total }}</div>
      </div>

      <div class="card">
        <div class="label">Today</div>
        <div class="value">{{ stats.today }}</div>
      </div>

      <div class="card">
        <div class="label">Most Active User</div>
        <div class="value small">{{ stats.topUser }}</div>
      </div>

      <div class="card">
        <div class="label">Last Event</div>
        <div class="value small">{{ stats.lastEvent }}</div>
      </div>
    </div>

    <!-- Table -->
    <div class="section">
      <div class="section-head">
        <div>
          <h2 class="section-title">Audit List</h2>
          <p class="section-subtitle">Click “View” to open details.</p>
        </div>

        <VaButton preset="secondary" size="small" @click="resetFilters">
          Reset
        </VaButton>
      </div>

      <VaDataTable
        :items="filtered"
        :columns="columns"
        striped
        hoverable
        class="table"
      >
        <!-- Action -->
        <template #cell(action_type)="{ value }">
          <VaChip :color="actionColor(value)" size="small" square>
            {{ value }}
          </VaChip>
        </template>

        <!-- Table -->
        <template #cell(table_name)="{ value }">
          <span class="muted">{{ value || "-" }}</span>
        </template>

        <!-- Record -->
        <template #cell(record_id)="{ value }">
          <span class="muted">{{ value ?? "-" }}</span>
        </template>

        <!-- User -->
        <template #cell(user_name)="{ rowData }">
          <div class="user-cell">
            <VaAvatar size="28px" color="primary" class="avatar">
              {{ initials(rowData.user_name || rowData.user_email || "System") }}
            </VaAvatar>
            <div class="user-meta">
              <div class="user-name">{{ rowData.user_name || "System" }}</div>
              <div class="user-sub">{{ rowData.user_email || rowData.user_agent_short || "" }}</div>
            </div>
          </div>
        </template>

        <!-- Date -->
        <template #cell(created_at)="{ value }">
          <span class="muted">{{ formatDate(value) }}</span>
        </template> 

        <!-- Actions -->
        <template #cell(actions)="{ rowData }">
          <VaButton size="small" preset="primary" @click="openView(rowData)">
            View
          </VaButton>
        </template>
      </VaDataTable>

      <div v-if="filtered.length === 0" class="empty">
        <VaIcon name="info" color="secondary" />
        <span>No logs found. Try changing filters.</span>
      </div>
    </div>

    <!-- View Modal -->
    <VaModal
      v-model="showModal"
      size="large"
      mobile-fullscreen
      :title="modalTitle"
      ok-text="Close"
      hide-default-actions
    >
      <template #default>
        <div v-if="selected" class="modal-body">
          <div class="modal-grid">
            <div class="kv">
              <div class="k">Action</div>
              <div class="v">
                <VaChip :color="actionColor(selected.action_type)" size="small" square>
                  {{ selected.action_type }}
                </VaChip>
              </div>
            </div>

            <div class="kv">
              <div class="k">Table</div>
              <div class="v">{{ selected.table_name || "-" }}</div>
            </div>

            <div class="kv">
              <div class="k">Record ID</div>
              <div class="v">{{ selected.record_id ?? "-" }}</div>
            </div>

            <div class="kv">
              <div class="k">User</div>
              <div class="v">{{ selected.user_name || "System" }}</div>
            </div>

            <div class="kv">
              <div class="k">IP</div>
              <div class="v">{{ selected.ip_address || "-" }}</div>
            </div>

            <div class="kv">
              <div class="k">Time</div>
              <div class="v">{{ formatDate(selected.created_at) }}</div>
            </div>

            <div class="kv wide">
              <div class="k">User Agent</div>
              <div class="v mono">{{ selected.user_agent || "-" }}</div>
            </div>
          </div>

          <div class="json-blocks">
            <div class="json-card">
              <div class="json-title">
                Old Values
                <VaChip v-if="!hasJson(selected.old_values)" size="small" square>empty</VaChip>
              </div>
              <pre class="json mono">{{ pretty(selected.old_values) }}</pre>
            </div>

            <div class="json-card">
              <div class="json-title">
                New Values
                <VaChip v-if="!hasJson(selected.new_values)" size="small" square>empty</VaChip>
              </div>
              <pre class="json mono">{{ pretty(selected.new_values) }}</pre>
            </div>
          </div>

          <div class="modal-actions">
            <VaButton preset="secondary" @click="showModal = false">Close</VaButton>
          </div>
        </div>
      </template>
    </VaModal>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { audit_logs } from "@/data/setting/audit_logs"

const search = ref("")
const filterAction = ref("") // value string
const filterTable = ref("")  // value string

const showModal = ref(false)
const selected = ref(null)

const columns = [
  { key: "action_type", label: "Action", sortable: true, width: "120px" },
  { key: "table_name", label: "Table", sortable: true, width: "160px" },
  { key: "record_id", label: "Record", sortable: true, width: "110px" },
  { key: "user_name", label: "User", sortable: true },
  { key: "ip_address", label: "IP", width: "140px" },
  { key: "created_at", label: "Time", sortable: true, width: "180px" },
  { key: "actions", label: "", width: "110px" },
]

const actionOptions = computed(() => {
  const actions = Array.from(new Set(audit_logs.map(x => x.action_type).filter(Boolean)))
  return [{ text: "All", value: "" }, ...actions.map(a => ({ text: a, value: a }))]
})

const tableOptions = computed(() => {
  const tables = Array.from(new Set(audit_logs.map(x => x.table_name).filter(Boolean)))
  return [{ text: "All", value: "" }, ...tables.map(t => ({ text: t, value: t }))]
})

const filtered = computed(() => {
  const q = (search.value || "").trim().toLowerCase()

  return audit_logs.filter((x) => {
    const action = (x.action_type || "").toLowerCase()
    const table  = (x.table_name || "").toLowerCase()
    const user   = (x.user_name || "").toLowerCase()
    const email  = (x.user_email || "").toLowerCase()
    const ip     = (x.ip_address || "").toLowerCase()

    const matchesText =
      !q ||
      action.includes(q) ||
      table.includes(q) ||
      user.includes(q) ||
      email.includes(q) ||
      ip.includes(q)

    const matchesAction = !filterAction.value || x.action_type === filterAction.value
    const matchesTable  = !filterTable.value  || x.table_name === filterTable.value

    return matchesText && matchesAction && matchesTable
  })
})

const stats = computed(() => {
  const total = audit_logs.length

  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, "0")
  const dd = String(today.getDate()).padStart(2, "0")
  const todayKey = `${yyyy}-${mm}-${dd}`

  const todayCount = audit_logs.filter(x => String(x.created_at || "").startsWith(todayKey)).length

  // most active user
  const map = new Map()
  for (const x of audit_logs) {
    const name = x.user_name || "System"
    map.set(name, (map.get(name) || 0) + 1)
  }
  let topUser = "—"
  let topCount = 0
  for (const [k, v] of map.entries()) {
    if (v > topCount) { topCount = v; topUser = `${k} (${v})` }
  }

  // last event
  const last = [...audit_logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
  const lastEvent = last ? `${last.action_type} · ${formatDate(last.created_at)}` : "—"

  return { total, today: todayCount, topUser, lastEvent }
})

const modalTitle = computed(() => {
  if (!selected.value) return "Audit Details"
  const t = selected.value.table_name || "system"
  const id = selected.value.record_id ?? "-"
  return `Audit Details · ${t} #${id}`
})

function resetFilters() {
  search.value = ""
  filterAction.value = ""
  filterTable.value = ""
}

function openView(row) {
  selected.value = row
  showModal.value = true
}

function actionColor(a) {
  const v = (a || "").toUpperCase()
  if (v === "LOGIN" || v === "LOGOUT") return "primary"
  if (v === "CREATE") return "success"
  if (v === "UPDATE") return "warning"
  if (v === "DELETE") return "danger"
  return "secondary"
}

function formatDate(v) {
  if (!v) return "-"
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleString()
}

function initials(name) {
  const s = String(name || "").trim()
  if (!s) return "S"
  const parts = s.split(/\s+/).slice(0, 2)
  return parts.map(p => p[0]?.toUpperCase() || "").join("") || "S"
}

function hasJson(v) {
  if (!v) return false
  if (typeof v === "object") return Object.keys(v).length > 0
  // string json
  return String(v).trim().length > 2
}

function pretty(v) {
  if (!v) return "{}"
  if (typeof v === "string") {
    // try parse json string
    try {
      return JSON.stringify(JSON.parse(v), null, 2)
    } catch {
      return v
    }
  }
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}
</script>

<style scoped>
/* Clean + easy for user, white background, primary color from Vuestic (#0ea5e9) */
.page {
  min-height: 100vh;
  background: #fff;
  padding: 18px;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
}

/* Header */
.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 6px 14px;
  border-bottom: 1px solid rgba(2, 6, 23, 0.06);
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 950;
  color: #0f172a;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.control {
  min-width: 220px;
}

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px 6px 8px;
}

.card {
  border: 1px solid rgba(2, 6, 23, 0.06);
  border-radius: 14px;
  padding: 14px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06); /* little shadow */
}

.label {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}

.value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 950;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.value.small {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

/* Section */
.section {
  padding: 14px 6px;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 950;
  color: #0f172a;
}

.section-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

/* Table */
.table {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(2, 6, 23, 0.06);
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06);
}

/* User cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  flex-shrink: 0;
}
.user-meta {
  min-width: 0;
}
.user-name {
  font-weight: 900;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.1;
}
.user-sub {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 340px;
}

.muted {
  color: #64748b;
}

/* Empty */
.empty {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  color: #64748b;
  font-size: 13px;
}

/* Modal */
.modal-body {
  padding: 6px 2px 10px;
}

.modal-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  border: 1px solid rgba(2, 6, 23, 0.06);
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06);
}

.kv .k {
  font-size: 11px;
  color: #64748b;
  font-weight: 800;
}
.kv .v {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}
.kv.wide {
  grid-column: 1 / -1;
}

.json-blocks {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.json-card {
  border: 1px solid rgba(2, 6, 23, 0.06);
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06);
}

.json-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 950;
  color: #0f172a;
  margin-bottom: 8px;
}

.json {
  margin: 0;
  padding: 10px;
  border-radius: 12px;
  background: rgba(2, 6, 23, 0.03);
  max-height: 320px;
  overflow: auto;
  font-size: 12px;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.modal-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 1100px) {
  .cards { grid-template-columns: 1fr 1fr; }
  .control { min-width: 220px; }
  .modal-grid { grid-template-columns: 1fr; }
  .json-blocks { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .cards { grid-template-columns: 1fr; }        
  .control { min-width: 100%; }
}
</style>
