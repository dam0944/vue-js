<template>
  <div class="hk-page">
    <!-- Header -->
    <div class="hk-header">
      <div>
        <h1>Housekeeping · Tasks</h1>
        <p>All cleaning, inspection, maintenance and turndown activities</p>
      </div>

      <div class="hk-header-actions">
        <RouterLink class="hk-btn hk-btn-primary" :to="{ name: 'housekeeping-assign' }">
          + Assign Task
        </RouterLink>
      </div>
    </div>

    <!-- Stats -->
    <section class="hk-stats" aria-label="All tasks summary">
      <div class="hk-stat">
        <div class="hk-stat-label">Total</div>
        <div class="hk-stat-value">{{ tasks.length }}</div>
      </div>
      <div class="hk-stat">
        <div class="hk-stat-label">Pending</div>
        <div class="hk-stat-value">{{ countByStatus.pending }}</div>
      </div>
      <div class="hk-stat">
        <div class="hk-stat-label">In Progress</div>
        <div class="hk-stat-value">{{ countByStatus.in_progress }}</div>
      </div>
      <div class="hk-stat">
        <div class="hk-stat-label">Completed</div>
        <div class="hk-stat-value">{{ countByStatus.completed }}</div>
      </div>
      <div class="hk-stat">
        <div class="hk-stat-label">Urgent</div>
        <div class="hk-stat-value">{{ urgentCount }}</div>
      </div>
    </section>

    <!-- Toolbar -->
    <section class="hk-toolbar" aria-label="Filters">
      <div class="hk-search">
        <span class="hk-search-icon">⌕</span>
        <input
          v-model.trim="q"
          class="hk-input"
          type="text"
          placeholder="Search by room, notes, issues..."
        />
      </div>

      <div class="hk-filters">
        <select v-model="filterStatus" class="hk-select">
          <option value="">All Status</option>
          <option value="pending">pending</option>
          <option value="in_progress">in_progress</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>

        <select v-model="filterType" class="hk-select">
          <option value="">All Types</option>
          <option value="cleaning">cleaning</option>
          <option value="maintenance">maintenance</option>
          <option value="inspection">inspection</option>
          <option value="deep_clean">deep_clean</option>
          <option value="turndown">turndown</option>
        </select>

        <select v-model="filterPriority" class="hk-select">
          <option value="">All Priority</option>
          <option value="low">low</option>
          <option value="normal">normal</option>
          <option value="high">high</option>
          <option value="urgent">urgent</option>
        </select>

        <button class="hk-btn hk-btn-ghost" type="button" @click="resetFilters">
          Reset
        </button>
      </div>
    </section>

    <!-- Tasks List -->
    <div class="hk-list">
      <div v-if="filteredTasks.length === 0" class="hk-empty">
        <div class="hk-empty-title">No tasks found</div>
        <div class="hk-empty-sub">Try clearing filters or changing keyword.</div>
      </div>

      <div v-for="task in filteredTasks" :key="task.task_id" class="hk-card">
        <div class="hk-room">Room {{ task.room_id }}</div>

        <div class="hk-main">
          <div class="hk-top">
            <span class="hk-type">{{ labelTaskType(task.task_type) }}</span>

            <span class="hk-priority" :class="task.priority">
              {{ labelPriority(task.priority) }}
            </span>

            <span class="hk-status" :class="task.status">
              {{ labelStatus(task.status) }}
            </span>
          </div>

          <p class="hk-notes">{{ task.notes || "—" }}</p>

          <div class="hk-time">
            Assigned: {{ format(task.assigned_at) }}
            <span v-if="task.updated_at"> · Updated: {{ format(task.updated_at) }}</span>
          </div>
        </div>

        <div class="hk-actions">
          <button @click="startTask(task)" v-if="task.status === 'pending'">Start</button>
          <button @click="completeTask(task)" v-if="task.status === 'in_progress'">Complete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { RouterLink } from "vue-router"

// ✅ Make sure the file path/name is correct in your project
// Example: "@/data/housekeeping/housekeeping_task"
import { housekeepingTasks as seed } from "@/data/housekeeping/housekeeping_Task"

const tasks = ref(seed.map(x => ({ ...x })))

const q = ref("")
const filterStatus = ref("")
const filterType = ref("")
const filterPriority = ref("")

const filteredTasks = computed(() => {
  const kw = q.value.trim().toLowerCase()

  return tasks.value.filter(t => {
    if (filterStatus.value && t.status !== filterStatus.value) return false
    if (filterType.value && t.task_type !== filterType.value) return false
    if (filterPriority.value && t.priority !== filterPriority.value) return false

    if (!kw) return true

    const hay = [
      t.room_id,
      t.task_type,
      t.priority,
      t.status,
      t.notes,
      t.issues_found,
    ]
      .join(" ")
      .toLowerCase()

    return hay.includes(kw)
  })
})

const countByStatus = computed(() => {
  const base = { pending: 0, in_progress: 0, completed: 0, cancelled: 0 }
  tasks.value.forEach(t => {
    base[t.status] = (base[t.status] || 0) + 1
  })
  return base
})

const urgentCount = computed(() => tasks.value.filter(t => t.priority === "urgent").length)

function resetFilters() {
  q.value = ""
  filterStatus.value = ""
  filterType.value = ""
  filterPriority.value = ""
}

function nowSQL() {
  const d = new Date()
  const pad = (x) => String(x).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function startTask(task) {
  if (task.status !== "pending") return
  task.status = "in_progress"
  task.started_at = nowSQL()
  task.updated_at = nowSQL()
}

function completeTask(task) {
  if (task.status !== "in_progress") return
  task.status = "completed"
  task.completed_at = nowSQL()
  task.updated_at = nowSQL()
}

function format(date) {
  if (!date) return "-"
  // supports SQL "YYYY-MM-DD HH:mm:ss" or Date
  const s = String(date)
  if (s.length >= 10 && s.includes("-")) return s
  return new Date(date).toLocaleString()
}

function labelTaskType(v) {
  return ({
    cleaning: "Cleaning",
    maintenance: "Maintenance",
    inspection: "Inspection",
    deep_clean: "Deep Clean",
    turndown: "Turndown",
  }[v] || v)
}
function labelPriority(v) {
  return ({ low: "Low", normal: "Normal", high: "High", urgent: "Urgent" }[v] || v)
}
function labelStatus(v) {
  return ({
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  }[v] || String(v).replace("_", " "))
}
</script>

<style scoped>
/* keep your original styles, plus a few small classes used above */
.hk-page{
  padding: 22px;
  background: #f7fafc;
  min-height: 100vh;
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  color: #0f172a;
}

.hk-header{
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 12px;
}

.hk-header-actions{
  display: flex;
  gap: 10px;
}

.hk-btn{
  border: 0;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
}
.hk-btn-primary{
  background: #0ea5e9;
  color: #fff;
}
.hk-btn-ghost{
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #0f172a;
}

.hk-stats{
  display:grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin: 8px 0 14px;
}
.hk-stat{
  background:#fff;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 1px 10px rgba(2,6,23,0.06);
}
.hk-stat-label{ font-size: 12px; color:#64748b; }
.hk-stat-value{ margin-top: 6px; font-size: 18px; font-weight: 900; }

.hk-toolbar{
  display:flex;
  gap:10px;
  flex-wrap: wrap;
  align-items:center;
  justify-content:space-between;
  margin-bottom: 14px;
}
.hk-search{
  display:flex;
  align-items:center;
  gap:10px;
  background:#fff;
  border:1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 12px;
  flex: 1 1 320px;
  min-width: 260px;
  box-shadow: 0 1px 6px rgba(2,6,23,0.06);
}
.hk-search-icon{ color:#64748b; font-size: 14px; }
.hk-input{ border:0; outline:none; background:transparent; width:100%; font-size:13px; }

.hk-filters{
  display:flex;
  gap:10px;
  flex-wrap: wrap;
  align-items:center;
}

.hk-select{
  appearance: none;
  padding: 10px 12px;
  min-width: 150px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  font-size: 13px;
  box-shadow: 0 1px 6px rgba(2,6,23,0.06);
}

.hk-list{ display:grid; gap:12px; }

.hk-empty{
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  padding: 22px;
  text-align: center;
  box-shadow: 0 1px 10px rgba(2,6,23,0.06);
}
.hk-empty-title{ font-weight: 900; font-size: 16px; }
.hk-empty-sub{ margin-top: 6px; color:#64748b; font-size: 13px; }

.hk-card{
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #eef2f7;
  box-shadow: 0 1px 10px rgba(2,6,23,0.06);
}

.hk-room{
  width: 110px;
  font-weight: 900;
}

.hk-main{ flex: 1; min-width: 0; }
.hk-top{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom: 8px; }
.hk-type{ font-weight: 800; }
.hk-notes{ margin:0; color:#475569; font-size: 13px; line-height: 1.5; }
.hk-time{ margin-top: 6px; font-size: 12px; color:#94a3b8; }

.hk-priority,
.hk-status{
  font-size: 12px;
  font-weight: 800;
  padding: 5px 10px;
  border-radius: 999px;
  text-transform: capitalize;
}

.hk-actions{ display:flex; gap:8px; }

.hk-actions button{
  border: 0;
  background: #0ea5e9;
  color: #fff;
  padding: 9px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
  font-size: 13px;
}

/* responsive */
@media (max-width: 980px){
  .hk-stats{ grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 720px){
  .hk-header{ flex-direction: column; align-items:flex-start; }
  .hk-card{ flex-direction: column; align-items: stretch; }
  .hk-room{ width: 100%; }
}
</style>
