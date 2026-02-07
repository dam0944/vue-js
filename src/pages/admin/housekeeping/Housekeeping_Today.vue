<!-- src/pages/housekeeping/HousekeepingToday.vue -->
<template>
  <div class="hk-page">
    <!-- Header -->
    <header class="hk-header">
      <div>
        <h1 class="hk-title">Housekeeping · Today</h1>
        <p class="hk-subtitle">
          Manage cleaning, inspections, maintenance and turndown for today.
        </p>
      </div>

      <div class="hk-header-actions">
        <button class="hk-btn hk-btn-ghost" type="button" @click="resetFilters">
          Reset
        </button>
        <RouterLink class="hk-btn hk-btn-primary" :to="{ name: 'housekeeping-assign' }">
          + New Task
        </RouterLink>
      </div>
    </header>

    <!-- Stats -->
    <section class="hk-stats" aria-label="Today summary">
      <div class="hk-stat">
        <div class="hk-stat-label">Total</div>
        <div class="hk-stat-value">{{ todayTasks.length }}</div>
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
          placeholder="Search by room (ex: 101), notes, issues..."
        />
      </div>

      <div class="hk-filters">
        <select v-model="status" class="hk-select" aria-label="Filter by status">
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select v-model="type" class="hk-select" aria-label="Filter by type">
          <option value="">All type</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
          <option value="inspection">Inspection</option>
          <option value="deep_clean">Deep clean</option>
          <option value="turndown">Turndown</option>
        </select>

        <select v-model="priority" class="hk-select" aria-label="Filter by priority">
          <option value="">All priority</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
    </section>

    <!-- List -->
    <section class="hk-list" aria-label="Task list">
      <div v-if="filtered.length === 0" class="hk-empty">
        <div class="hk-empty-title">No tasks for today</div>
        <div class="hk-empty-sub">Try clearing filters or assign a new task.</div>
      </div>

      <article
        v-for="t in filtered"
        :key="t.task_id"
        class="hk-row"
        @click="openDetail(t)"
        role="button"
        tabindex="0"
        @keydown.enter="openDetail(t)"
      >
        <div class="hk-row-left">
          <div class="hk-room">
            <div class="hk-room-label">Room</div>
            <div class="hk-room-number">{{ t.room_id }}</div>
          </div>

          <div class="hk-main">
            <div class="hk-topline">
              <span class="hk-pill" :data-type="t.task_type">{{ labelTaskType(t.task_type) }}</span>
              <span class="hk-pill" :data-priority="t.priority">{{ labelPriority(t.priority) }}</span>
              <span class="hk-pill" :data-status="t.status">{{ labelStatus(t.status) }}</span>
            </div>

            <div class="hk-notes">
              {{ shortText(t.notes || "—", 90) }}
              <span v-if="t.issues_found" class="hk-issue">
                • Issues: {{ shortText(t.issues_found, 70) }}
              </span>
            </div>

            <div class="hk-meta">
              <span>Assigned: {{ userName(t.assigned_to) }}</span>
              <span class="hk-dot"></span>
              <span>Updated: {{ t.updated_at || "—" }}</span>
            </div>
          </div>
        </div>

        <div class="hk-row-right" @click.stop>
          <button
            v-if="t.status === 'pending'"
            class="hk-mini hk-mini-primary"
            type="button"
            @click="startTask(t)"
          >
            Start
          </button>

          <button
            v-if="t.status === 'in_progress'"
            class="hk-mini hk-mini-primary"
            type="button"
            @click="completeTask(t)"
          >
            Complete
          </button>

          <button
            v-if="t.status !== 'completed' && t.status !== 'cancelled'"
            class="hk-mini hk-mini-ghost"
            type="button"
            @click="cancelTask(t)"
          >
            Cancel
          </button>

          <RouterLink
            class="hk-mini hk-mini-link"
            :to="{ name: 'housekeeping-edit', params: { taskId: t.task_id } }"
          >
            Edit →
          </RouterLink>
        </div>
      </article>
    </section>

    <!-- Detail Drawer (simple) -->
    <div v-if="detailOpen" class="hk-drawer" role="dialog" aria-modal="true">
      <div class="hk-drawer-backdrop" @click="closeDetail"></div>

      <aside class="hk-drawer-panel">
        <div class="hk-drawer-head">
          <div>
            <div class="hk-drawer-title">Task #{{ selected?.task_id }}</div>
            <div class="hk-drawer-sub">Room {{ selected?.room_id }} · Property {{ selected?.property_id }}</div>
          </div>
          <button class="hk-btn hk-btn-ghost" type="button" @click="closeDetail">Close</button>
        </div>

        <div class="hk-drawer-body" v-if="selected">
          <div class="hk-kv">
            <div class="k">Type</div>
            <div class="v">{{ labelTaskType(selected.task_type) }}</div>
          </div>
          <div class="hk-kv">
            <div class="k">Priority</div>
            <div class="v">{{ labelPriority(selected.priority) }}</div>
          </div>
          <div class="hk-kv">
            <div class="k">Status</div>
            <div class="v">{{ labelStatus(selected.status) }}</div>
          </div>

          <div class="hk-kv">
            <div class="k">Assigned to</div>
            <div class="v">{{ userName(selected.assigned_to) }}</div>
          </div>
          <div class="hk-kv">
            <div class="k">Assigned at</div>
            <div class="v">{{ selected.assigned_at || "—" }}</div>
          </div>
          <div class="hk-kv">
            <div class="k">Started at</div>
            <div class="v">{{ selected.started_at || "—" }}</div>
          </div>
          <div class="hk-kv">
            <div class="k">Completed at</div>
            <div class="v">{{ selected.completed_at || "—" }}</div>
          </div>

          <div class="hk-block">
            <div class="hk-block-title">Notes</div>
            <div class="hk-block-text">{{ selected.notes || "—" }}</div>
          </div>

          <div class="hk-block">
            <div class="hk-block-title">Issues found</div>
            <div class="hk-block-text">{{ selected.issues_found || "—" }}</div>
          </div>

          <div class="hk-block">
            <div class="hk-block-title">Completion notes</div>
            <div class="hk-block-text">{{ selected.completion_notes || "—" }}</div>
          </div>

          <div class="hk-drawer-actions">
            <button
              v-if="selected.status === 'pending'"
              class="hk-btn hk-btn-primary"
              type="button"
              @click="startTask(selected)"
            >
              Start task
            </button>
            <button
              v-if="selected.status === 'in_progress'"
              class="hk-btn hk-btn-primary"
              type="button"
              @click="completeTask(selected)"
            >
              Mark completed
            </button>
            <button
              v-if="selected.status !== 'completed' && selected.status !== 'cancelled'"
              class="hk-btn hk-btn-ghost"
              type="button"
              @click="cancelTask(selected)"
            >
              Cancel task
            </button>

            <RouterLink
              class="hk-btn hk-btn-ghost"
              :to="{ name: 'housekeeping-edit', params: { taskId: selected.task_id } }"
            >
              Edit details →
            </RouterLink>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { RouterLink } from "vue-router"
import { housekeepingToday as seed } from "@/data/housekeeping/housekeeping_today"

// All seed tasks
const tasks = ref(seed.map(x => ({ ...x })))

// users map (static)
const users = {
  6: { name: "Sokha (Housekeeping)" },
  7: { name: "Dara (Housekeeping)" },
  8: { name: "Vanna (Maintenance)" },
  3: { name: "Reception (Admin)" },
  4: { name: "Manager" }
}

// Filters
const q = ref("")
const status = ref("")
const type = ref("")
const priority = ref("")

function todayISO() {
  const d = new Date()
  const pad = (x) => String(x).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Pick a date field from your task object and return yyyy-mm-dd
 * Works with: "YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss", ISO strings.
 */
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

// ✅ Today-only tasks
const todayTasks = computed(() => {
  const iso = todayISO()
  return tasks.value.filter(t => taskISODate(t) === iso)
})

// ✅ Apply filters on todayTasks
const filtered = computed(() => {
  const kw = q.value.toLowerCase()

  return todayTasks.value.filter(t => {
    if (status.value && t.status !== status.value) return false
    if (type.value && t.task_type !== type.value) return false
    if (priority.value && t.priority !== priority.value) return false

    if (!kw) return true

    const hay = [
      t.room_id,
      t.task_type,
      t.priority,
      t.status,
      t.notes,
      t.issues_found
    ].join(" ").toLowerCase()

    return hay.includes(kw)
  })
})

// ✅ Stats use todayTasks
const countByStatus = computed(() => {
  const base = { pending: 0, in_progress: 0, completed: 0, cancelled: 0 }
  todayTasks.value.forEach(t => {
    base[t.status] = (base[t.status] || 0) + 1
  })
  return base
})

const urgentCount = computed(() => todayTasks.value.filter(t => t.priority === "urgent").length)

// Drawer
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

// Labels
function labelTaskType(v) {
  return ({
    cleaning: "Cleaning",
    maintenance: "Maintenance",
    inspection: "Inspection",
    deep_clean: "Deep Clean",
    turndown: "Turndown"
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
    cancelled: "Cancelled"
  }[v] || v)
}
function userName(id) {
  return users[id]?.name || `User #${id ?? "—"}`
}
function shortText(text, n) {
  const s = String(text || "")
  return s.length > n ? s.slice(0, n).trim() + "…" : s
}

// Actions
function nowSQL() {
  const d = new Date()
  const pad = (x) => String(x).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
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
</script>

<style scoped>
/* Borderless, shadowless, clean */
.hk-page{
  --bg:#ffffff;
  --muted:#6b7280;
  --text:#0f172a;
  --soft:#f6f7fb;
  --soft2:#eef2f7;
  --primary:#1b4332;
  --primary2:#2d6a4f;

  background: var(--bg);
  color: var(--text);
  padding: 18px 18px 40px;
  min-height: calc(100vh - 60px);
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.hk-header{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:16px;
  padding: 10px 6px 12px;
}
.hk-title{
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0;
}
.hk-subtitle{
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
}
.hk-header-actions{ display:flex; gap:10px; align-items:center; }

.hk-btn{
  border: 0;
  background: transparent;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 800;
  font-size: 13px;
  text-decoration: none;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
}
.hk-btn-ghost{
  background: var(--soft);
  color: var(--text);
}
.hk-btn-primary{
  background: var(--primary);
  color: #fff;
}

.hk-stats{
  display:grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  padding: 8px 6px 16px;
}
.hk-stat{
  background: var(--soft);
  border-radius: 14px;
  padding: 12px 14px;
}
.hk-stat-label{ font-size: 12px; color: var(--muted); }
.hk-stat-value{ margin-top: 6px; font-size: 18px; font-weight: 900; }

.hk-toolbar{
  display:flex;
  gap:10px;
  align-items:center;
  justify-content:space-between;
  flex-wrap: wrap;
  padding: 6px;
  margin-top: 6px;
}
.hk-search{
  display:flex;
  align-items:center;
  gap:10px;
  background: var(--soft);
  border-radius: 14px;
  padding: 10px 12px;
  flex: 1 1 320px;
  min-width: 260px;
}
.hk-search-icon{ color: var(--muted); font-size: 14px; }
.hk-input{
  border: 0;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 13px;
}
.hk-filters{
  display:flex;
  gap:10px;
  flex-wrap: wrap;
  align-items:center;
}
.hk-select{
  border: 0;
  outline: none;
  background: var(--soft);
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 13px;
  min-width: 150px;
}

.hk-list{ margin-top: 10px; padding: 6px; display:flex; flex-direction:column; gap: 10px; }

.hk-row{
  background: var(--soft);
  border-radius: 18px;
  padding: 14px;
  display:flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 14px;
  cursor: pointer;
  transition: transform .15s ease;
}
.hk-row:hover{ transform: translateY(-1px); }

.hk-row-left{ display:flex; gap: 14px; align-items: center; min-width: 0; flex: 1; }
.hk-room{
  width: 84px;
  background: #fff;
  border-radius: 14px;
  padding: 12px 12px;
  display:flex;
  flex-direction:column;
  gap: 4px;
  flex-shrink: 0;
}
.hk-room-label{ font-size: 11px; color: var(--muted); font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.hk-room-number{ font-size: 18px; font-weight: 1000; }

.hk-main{ min-width: 0; display:flex; flex-direction:column; gap: 8px; }
.hk-topline{ display:flex; flex-wrap: wrap; gap: 8px; align-items:center; }
.hk-pill{
  font-size: 11px;
  font-weight: 900;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,.75);
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: .06em;
}
.hk-pill[data-status="completed"]{ background: rgba(27, 67, 50, .14); color: var(--primary); }
.hk-pill[data-status="in_progress"]{ background: rgba(45, 106, 79, .14); color: var(--primary2); }
.hk-pill[data-status="cancelled"]{ background: rgba(239, 68, 68, .12); color: #b91c1c; }
.hk-pill[data-status="pending"]{ background: rgba(107, 114, 128, .12); color: #374151; }

.hk-pill[data-priority="urgent"]{ background: rgba(245, 158, 11, .16); color: #92400e; }
.hk-pill[data-priority="high"]{ background: rgba(234, 179, 8, .14); color: #854d0e; }
.hk-pill[data-priority="low"]{ background: rgba(148, 163, 184, .18); color: #334155; }

.hk-pill[data-type="maintenance"]{ background: rgba(59, 130, 246, .14); color: #1d4ed8; }
.hk-pill[data-type="cleaning"]{ background: rgba(16, 185, 129, .14); color: #065f46; }
.hk-pill[data-type="inspection"]{ background: rgba(99, 102, 241, .14); color: #3730a3; }
.hk-pill[data-type="deep_clean"]{ background: rgba(236, 72, 153, .12); color: #9d174d; }
.hk-pill[data-type="turndown"]{ background: rgba(34, 197, 94, .14); color: #166534; }

.hk-notes{
  font-size: 13px;
  color: #111827;
  line-height: 1.5;
  word-break: break-word;
}
.hk-issue{
  color: #7c2d12;
  margin-left: 6px;
}

.hk-meta{
  display:flex;
  gap: 10px;
  align-items:center;
  flex-wrap: wrap;
  color: var(--muted);
  font-size: 12px;
}
.hk-dot{
  width: 4px; height: 4px; border-radius: 999px; background: #cbd5e1;
}

.hk-row-right{
  display:flex;
  gap: 8px;
  align-items:center;
  flex-wrap: wrap;
  justify-content:flex-end;
  flex-shrink: 0;
}
.hk-mini{
  border: 0;
  border-radius: 999px;
  padding: 9px 12px;
  font-weight: 900;
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  display:inline-flex;
  align-items:center;
  justify-content:center;
}
.hk-mini-primary{ background: var(--primary); color: #fff; }
.hk-mini-ghost{ background: rgba(255,255,255,.75); color: var(--text); }
.hk-mini-link{ background: transparent; color: var(--primary); padding: 9px 6px; }

/* Empty */
.hk-empty{
  background: var(--soft);
  border-radius: 18px;
  padding: 30px 18px;
  text-align: center;
}
.hk-empty-title{ font-weight: 1000; font-size: 16px; }
.hk-empty-sub{ margin-top: 6px; color: var(--muted); font-size: 13px; }

/* Drawer */
.hk-drawer{ position: fixed; inset: 0; z-index: 50; display:flex; }
.hk-drawer-backdrop{
  position:absolute; inset:0; background: rgba(15,23,42,.25);
}
.hk-drawer-panel{
  margin-left: auto;
  position: relative;
  width: min(520px, 92vw);
  height: 100%;
  background: #fff;
  padding: 16px;
  display:flex;
  flex-direction:column;
}
.hk-drawer-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  padding: 6px 4px 14px;
}
.hk-drawer-title{ font-weight: 1000; font-size: 16px; }
.hk-drawer-sub{ margin-top: 4px; color: var(--muted); font-size: 12px; }
.hk-drawer-body{ padding: 6px 4px; overflow:auto; display:flex; flex-direction:column; gap: 12px; }

.hk-kv{
  display:grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: var(--soft);
}
.hk-kv .k{ color: var(--muted); font-weight: 800; font-size: 12px; }
.hk-kv .v{ font-weight: 900; font-size: 13px; }

.hk-block{
  padding: 12px 12px;
  border-radius: 14px;
  background: var(--soft);
}
.hk-block-title{ color: var(--muted); font-weight: 900; font-size: 12px; margin-bottom: 8px; }
.hk-block-text{ font-size: 13px; line-height: 1.6; }

.hk-drawer-actions{
  margin-top: 8px;
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 980px){
  .hk-stats{ grid-template-columns: repeat(2, 1fr); }
  .hk-room{ width: 76px; }
}
@media (max-width: 520px){
  .hk-header{ flex-direction: column; align-items:flex-start; }
  .hk-header-actions{ width: 100%; }
  .hk-btn{ width: 100%; }
  .hk-row{ flex-direction: column; }
  .hk-row-right{ justify-content:flex-start; }
}
</style>
