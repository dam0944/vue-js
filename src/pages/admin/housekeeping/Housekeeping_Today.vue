<!-- src/pages/housekeeping/HousekeepingToday.vue -->
<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Housekeeping · Today</h1>
        <p class="subtitle">Manage cleaning, inspections, maintenance and turndown for today.</p>
      </div>

      <div class="header-actions">
        <VaButton preset="secondary" @click="resetFilters">Reset</VaButton>
        <RouterLink class="no-underline" :to="{ name: 'housekeeping-assign' }">
          <VaButton icon="add" color="primary">New Task</VaButton>
        </RouterLink>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats">
      <VaCard class="card shadow">
        <VaCardContent>
          <div class="stat-label">Total</div>
          <div class="stat-value">{{ todayTasks.length }}</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="card shadow">
        <VaCardContent>
          <div class="stat-label">Pending</div>
          <div class="stat-value">{{ countByStatus.pending }}</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="card shadow">
        <VaCardContent>
          <div class="stat-label">In Progress</div>
          <div class="stat-value">{{ countByStatus.in_progress }}</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="card shadow">
        <VaCardContent>
          <div class="stat-label">Completed</div>
          <div class="stat-value">{{ countByStatus.completed }}</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="card shadow">
        <VaCardContent>
          <div class="stat-label">Urgent</div>
          <div class="stat-value">{{ urgentCount }}</div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Toolbar -->
    <VaCard class="card shadow">
      <VaCardContent>
        <div class="toolbar">
          <VaInput
            v-model.trim="q"
            label="Search"
            placeholder="Search room (101), notes, issues..."
            clearable
          />

          <VaSelect
            v-model="status"
            label="Status"
            :options="STATUS_OPTIONS"
            :text-by="(v) => (v.value === '' ? 'All status' : v.text)"
            :value-by="(v) => v.value"
          />

          <VaSelect
            v-model="type"
            label="Type"
            :options="TYPE_OPTIONS"
            :text-by="(v) => (v.value === '' ? 'All type' : v.text)"
            :value-by="(v) => v.value"
          />

          <VaSelect
            v-model="priority"
            label="Priority"
            :options="PRIORITY_OPTIONS"
            :text-by="(v) => (v.value === '' ? 'All priority' : v.text)"
            :value-by="(v) => v.value"
          />
        </div>
      </VaCardContent>
    </VaCard>

    <!-- List -->
    <VaCard class="card shadow">
      <VaCardContent>
        <div class="list-top">
          <div class="list-title">Tasks: <b>{{ filtered.length }}</b></div>
          <div class="list-sub">Today only • Click row for detail</div>
        </div>

        <div v-if="filtered.length === 0" class="empty">
          <div class="empty-title">No tasks for today</div>
          <div class="empty-sub">Try clearing filters or assign a new task.</div>
        </div>

        <div v-else class="rows">
          <VaCard
            v-for="t in filtered"
            :key="t.task_id"
            class="row-card"
            @click="openDetail(t)"
          >
            <VaCardContent>
              <div class="row">
                <div class="left">
                  <div class="room">
                    <div class="room-label">Room</div>
                    <div class="room-number">{{ t.room_id }}</div>
                  </div>

                  <div class="main">
                    <div class="topline">
                      <VaBadge
                        :text="labelTaskType(t.task_type)"
                        :color="typeColor(t.task_type)"
                        class="badge"
                      />
                      <VaBadge
                        :text="labelPriority(t.priority)"
                        :color="priorityColor(t.priority)"
                        class="badge"
                      />
                      <VaBadge
                        :text="labelStatus(t.status)"
                        :color="statusColor(t.status)"
                        class="badge"
                      />
                    </div>

                    <div class="notes">
                      {{ shortText(t.notes || "—", 90) }}
                      <span v-if="t.issues_found" class="issue">
                        • Issues: {{ shortText(t.issues_found, 70) }}
                      </span>
                    </div>

                    <div class="meta">
                      <span>Assigned: {{ userName(t.assigned_to) }}</span>
                      <span class="dot"></span>
                      <span>Updated: {{ t.updated_at || "—" }}</span>
                    </div>
                  </div>
                </div>

                <div class="right" @click.stop>
                  <VaButton
                    v-if="t.status === 'pending'"
                    size="small"
                    color="primary"
                    @click="startTask(t)"
                  >
                    Start
                  </VaButton>

                  <VaButton
                    v-if="t.status === 'in_progress'"
                    size="small"
                    color="success"
                    @click="completeTask(t)"
                  >
                    Complete
                  </VaButton>

                  <VaButton
                    v-if="t.status !== 'completed' && t.status !== 'cancelled'"
                    size="small"
                    preset="secondary"
                    @click="cancelTask(t)"
                  >
                    Cancel
                  </VaButton>

                  <RouterLink
                    class="no-underline"
                    :to="{ name: 'housekeeping-edit', params: { taskId: t.task_id } }"
                  >
                    <VaButton size="small" preset="secondary">Edit</VaButton>
                  </RouterLink>
                </div>
              </div>
            </VaCardContent>
          </VaCard>
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Detail modal -->
    <VaModal v-model="detailOpen" size="large" hide-default-actions>
      <VaCard class="detail-card">
        <VaCardContent v-if="selected">
          <div class="detail-head">
            <div>
              <div class="detail-title">Task #{{ selected.task_id }}</div>
              <div class="detail-sub">Room {{ selected.room_id }} · Property {{ selected.property_id }}</div>
            </div>
            <VaButton preset="secondary" @click="closeDetail">Close</VaButton>
          </div>

          <div class="detail-grid">
            <div class="kv">
              <div class="k">Type</div>
              <div class="v">{{ labelTaskType(selected.task_type) }}</div>
            </div>
            <div class="kv">
              <div class="k">Priority</div>
              <div class="v">{{ labelPriority(selected.priority) }}</div>
            </div>
            <div class="kv">
              <div class="k">Status</div>
              <div class="v">{{ labelStatus(selected.status) }}</div>
            </div>

            <div class="kv">
              <div class="k">Assigned to</div>
              <div class="v">{{ userName(selected.assigned_to) }}</div>
            </div>
            <div class="kv">
              <div class="k">Assigned at</div>
              <div class="v">{{ selected.assigned_at || "—" }}</div>
            </div>
            <div class="kv">
              <div class="k">Started at</div>
              <div class="v">{{ selected.started_at || "—" }}</div>
            </div>
            <div class="kv">
              <div class="k">Completed at</div>
              <div class="v">{{ selected.completed_at || "—" }}</div>
            </div>
          </div>

          <div class="blocks">
            <VaCard class="block">
              <VaCardContent>
                <div class="block-title">Notes</div>
                <div class="block-text">{{ selected.notes || "—" }}</div>
              </VaCardContent>
            </VaCard>

            <VaCard class="block">
              <VaCardContent>
                <div class="block-title">Issues found</div>
                <div class="block-text">{{ selected.issues_found || "—" }}</div>
              </VaCardContent>
            </VaCard>

            <VaCard class="block">
              <VaCardContent>
                <div class="block-title">Completion notes</div>
                <div class="block-text">{{ selected.completion_notes || "—" }}</div>
              </VaCardContent>
            </VaCard>
          </div>

          <div class="detail-actions">
            <VaButton
              v-if="selected.status === 'pending'"
              color="primary"
              @click="startTask(selected)"
            >
              Start task
            </VaButton>

            <VaButton
              v-if="selected.status === 'in_progress'"
              color="success"
              @click="completeTask(selected)"
            >
              Mark completed
            </VaButton>

            <VaButton
              v-if="selected.status !== 'completed' && selected.status !== 'cancelled'"
              preset="secondary"
              @click="cancelTask(selected)"
            >
              Cancel task
            </VaButton>

            <RouterLink
              class="no-underline"
              :to="{ name: 'housekeeping-edit', params: { taskId: selected.task_id } }"
            >
              <VaButton preset="secondary">Edit details</VaButton>
            </RouterLink>
          </div>
        </VaCardContent>
      </VaCard>
    </VaModal>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { RouterLink } from "vue-router"
import { housekeepingToday as seed } from "@/data/housekeeping/housekeeping_today"

const tasks = ref(seed.map((x) => ({ ...x })))

const users = {
  6: { name: "Sokha (Housekeeping)" },
  7: { name: "Dara (Housekeeping)" },
  8: { name: "Vanna (Maintenance)" },
  3: { name: "Reception (Admin)" },
  4: { name: "Manager" },
}

const q = ref("")
const status = ref("")
const type = ref("")
const priority = ref("")

const STATUS_OPTIONS = [
  { value: "", text: "All status" },
  { value: "pending", text: "Pending" },
  { value: "in_progress", text: "In progress" },
  { value: "completed", text: "Completed" },
  { value: "cancelled", text: "Cancelled" },
]
const TYPE_OPTIONS = [
  { value: "", text: "All type" },
  { value: "cleaning", text: "Cleaning" },
  { value: "maintenance", text: "Maintenance" },
  { value: "inspection", text: "Inspection" },
  { value: "deep_clean", text: "Deep clean" },
  { value: "turndown", text: "Turndown" },
]
const PRIORITY_OPTIONS = [
  { value: "", text: "All priority" },
  { value: "low", text: "Low" },
  { value: "normal", text: "Normal" },
  { value: "high", text: "High" },
  { value: "urgent", text: "Urgent" },
]

function todayISO() {
  const d = new Date()
  const pad = (x) => String(x).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function taskISODate(t) {
  const raw =
    t.task_date ||
    t.scheduled_for ||
    t.schedule_date ||
    t.assigned_at ||
    t.started_at ||
    t.created_at ||
    t.updated_at

  if (!raw) return ""
  return String(raw).slice(0, 10)
}

const todayTasks = computed(() => {
  const iso = todayISO()
  return tasks.value.filter((t) => taskISODate(t) === iso)
})

const filtered = computed(() => {
  const kw = q.value.toLowerCase()

  return todayTasks.value.filter((t) => {
    if (status.value && t.status !== status.value) return false
    if (type.value && t.task_type !== type.value) return false
    if (priority.value && t.priority !== priority.value) return false

    if (!kw) return true

    const hay = [t.room_id, t.task_type, t.priority, t.status, t.notes, t.issues_found]
      .join(" ")
      .toLowerCase()

    return hay.includes(kw)
  })
})

const countByStatus = computed(() => {
  const base = { pending: 0, in_progress: 0, completed: 0, cancelled: 0 }
  todayTasks.value.forEach((t) => {
    base[t.status] = (base[t.status] || 0) + 1
  })
  return base
})

const urgentCount = computed(() => todayTasks.value.filter((t) => t.priority === "urgent").length)

const detailOpen = ref(false)
const selected = ref(null)

function openDetail(t) {
  selected.value = t
  detailOpen.value = true
}
function closeDetail() {
  detailOpen.value = false
  selected.value = null
}

function resetFilters() {
  q.value = ""
  status.value = ""
  type.value = ""
  priority.value = ""
}

function labelTaskType(v) {
  return (
    {
      cleaning: "Cleaning",
      maintenance: "Maintenance",
      inspection: "Inspection",
      deep_clean: "Deep Clean",
      turndown: "Turndown",
    }[v] || v
  )
}
function labelPriority(v) {
  return ({ low: "Low", normal: "Normal", high: "High", urgent: "Urgent" }[v] || v)
}
function labelStatus(v) {
  return (
    {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    }[v] || v
  )
}
function userName(id) {
  return users[id]?.name || `User #${id ?? "—"}`
}
function shortText(text, n) {
  const s = String(text || "")
  return s.length > n ? s.slice(0, n).trim() + "…" : s
}

function nowSQL() {
  const d = new Date()
  const pad = (x) => String(x).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`
}

function startTask(t) {
  if (t.status !== "pending") return
  t.status = "in_progress"
  t.started_at = nowSQL()
  t.updated_at = nowSQL()
  selected.value = t
}

function completeTask(t) {
  if (t.status !== "in_progress") return
  t.status = "completed"
  t.completed_at = nowSQL()
  if (!t.completion_notes) t.completion_notes = "Completed"
  t.updated_at = nowSQL()
  selected.value = t
}

function cancelTask(t) {
  if (t.status === "completed" || t.status === "cancelled") return
  t.status = "cancelled"
  t.updated_at = nowSQL()
  selected.value = t
}

/* Colors for VaBadge */
function statusColor(s) {
  if (s === "completed") return "success"
  if (s === "in_progress") return "info"
  if (s === "pending") return "warning"
  if (s === "cancelled") return "danger"
  return "secondary"
}
function priorityColor(p) {
  if (p === "urgent") return "warning"
  if (p === "high") return "info"
  if (p === "low") return "secondary"
  return "primary"
}
function typeColor(t) {
  if (t === "maintenance") return "info"
  if (t === "cleaning") return "success"
  if (t === "inspection") return "secondary"
  if (t === "deep_clean") return "warning"
  if (t === "turndown") return "primary"
  return "secondary"
}
</script>

<style scoped>
.page {
  padding: 18px 18px 40px;
  background: #f8fafc;
  color: #0f172a;
  min-height: calc(100vh - 60px);
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

/* Shadow like config page */
.card {
  border-radius: 14px;
}
.shadow {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 12px;
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

/* Toolbar */
.toolbar {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 12px;
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

.empty {
  padding: 24px;
  border-radius: 14px;
  background: #f1f5f9;
  text-align: center;
}
.empty-title {
  font-weight: 1000;
  font-size: 16px;
}
.empty-sub {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row-card {
  border-radius: 16px;
  cursor: pointer;
}
.row {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}
.left {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 14px;
}
.room {
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  min-width: 86px;
}
.room-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.room-number {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 1000;
}
.main {
  min-width: 0;
}
.topline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.badge {
  font-weight: 900;
}
.notes {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.5;
}
.issue {
  color: #7c2d12;
  margin-left: 6px;
}
.meta {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  color: #64748b;
  font-size: 12px;
}
.dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #cbd5e1;
}
.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

/* Detail modal */
.detail-card {
  border-radius: 16px;
}
.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.detail-title {
  font-weight: 1000;
  font-size: 16px;
}
.detail-sub {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.kv {
  padding: 10px 12px;
  border-radius: 14px;
  background: #f1f5f9;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
}
.k {
  color: #64748b;
  font-weight: 900;
  font-size: 12px;
}
.v {
  font-weight: 900;
  font-size: 13px;
}
.blocks {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.block {
  border-radius: 14px;
}
.block-title {
  color: #64748b;
  font-weight: 900;
  font-size: 12px;
  margin-bottom: 8px;
}
.block-text {
  font-size: 13px;
  line-height: 1.6;
}
.detail-actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 980px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .toolbar {
    grid-template-columns: 1fr 1fr;
  }
  .row {
    flex-direction: column;
  }
  .right {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .kv {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 520px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
