<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Housekeeping · Assign Task</h1>
        <p class="subtitle">Create tasks and assign them to staff quickly.</p>
      </div>

      <div class="header-actions">
        <VaButton preset="secondary" color="secondary" @click="resetForm">
          Reset
        </VaButton>
        <VaButton color="primary" @click="createTask">
          <VaIcon name="add" class="mr-1" /> Create Task
        </VaButton>
      </div>
    </div>

    <!-- Top grid -->
    <div class="grid">
      <!-- Form -->
      <VaCard class="card">
        <VaCardTitle>New Task</VaCardTitle>
        <VaCardContent>
          <div class="form-grid">
            <VaSelect
              v-model="form.room_id"
              label="Room"
              :options="roomOptions"
              text-by="label"
              value-by="value"
              placeholder="Select room"
              searchable
              clearable
            />

            <VaSelect
              v-model="form.task_type"
              label="Task Type"
              :options="taskTypeOptions"
              placeholder="Select type"
              clearable
            />

            <VaSelect
              v-model="form.priority"
              label="Priority"
              :options="priorityOptions"
              placeholder="Select priority"
              clearable
            />

            <VaSelect
              v-model="form.assigned_to"
              label="Assign To (optional)"
              :options="staffOptions"
              text-by="label"
              value-by="value"
              placeholder="Select staff"
              searchable
              clearable
            />

            <div class="span-2">
              <VaTextarea
                v-model="form.notes"
                label="Notes"
                placeholder="Write task notes…"
                min-rows="3"
              />
            </div>

            <div class="span-2 actions-row">
              <!-- Assign Now requires staff -->
              <VaButton
                color="primary"
                :disabled="!canAssignNow"
                @click="assignNow"
              >
                <VaIcon name="assignment_ind" class="mr-1" />
                Assign Now
              </VaButton>

              <!-- Create only requires room + type -->
              <VaButton
                preset="secondary"
                color="secondary"
                :disabled="!canCreate"
                @click="createTask"
              >
                Create Only
              </VaButton>

              <VaButton preset="secondary" color="secondary" @click="resetForm">
                Clear
              </VaButton>

              <span class="hint">
                Tip: Create only → assign later in table (Assign button).
              </span>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Filters -->
      <VaCard class="card">
        <VaCardTitle>Filters</VaCardTitle>
        <VaCardContent>
          <div class="filters">
            <VaInput v-model="q" placeholder="Search notes / room…" clearable>
              <template #prependInner>
                <VaIcon name="search" />
              </template>
            </VaInput>

            <VaSelect
              v-model="filterStatus"
              label="Status"
              :options="statusOptions"
              clearable
            />

            <VaSelect
              v-model="filterType"
              label="Task Type"
              :options="taskTypeOptions"
              clearable
            />
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Table -->
    <VaCard class="card table-card">
      <VaCardTitle>Tasks Queue</VaCardTitle>
      <VaCardContent>
        <VaDataTable
          :items="filteredTasks"
          :columns="columns"
          striped
          hoverable
        >
          <template #cell(room_id)="{ rowData }">
            <span class="room-pill">Room {{ rowData.room_id }}</span>
          </template>

          <template #cell(task_type)="{ rowData }">
            <span class="cap">{{ rowData.task_type.replace('_', ' ') }}</span>
          </template>

          <template #cell(priority)="{ rowData }">
            <span class="badge" :class="`p-${rowData.priority}`">
              {{ rowData.priority }}
            </span>
          </template>

          <template #cell(status)="{ rowData }">
            <span class="badge" :class="`s-${rowData.status}`">
              {{ rowData.status.replace('_', ' ') }}
            </span>
          </template>

          <template #cell(assigned_to)="{ rowData }">
            <span v-if="rowData.assigned_to">
              {{ getStaffName(rowData.assigned_to) }}
            </span>
            <span v-else class="muted">—</span>
          </template>

          <template #cell(assigned_at)="{ rowData }">
            <span class="muted">{{ formatDate(rowData.assigned_at) }}</span>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="row-actions">
              <VaButton
                size="small"
                color="primary"
                preset="primary"
                :disabled="rowData.status !== 'pending'"
                @click="openAssign(rowData)"
              >
                Assign
              </VaButton>

              <VaButton
                size="small"
                preset="secondary"
                color="secondary"
                :disabled="rowData.status !== 'pending'"
                @click="markInProgress(rowData)"
              >
                Start
              </VaButton>
            </div>
          </template>
        </VaDataTable>

        <div v-if="!filteredTasks.length" class="empty">
          No tasks found. Create one above.
        </div>
      </VaCardContent>
    </VaCard>

    <!-- Assign Modal -->
    <VaModal v-model="assignModal" title="Assign Task" hide-default-actions>
      <div class="modal-body">
        <div class="modal-row">
          <div class="muted">Task</div>
          <div class="strong">
            Room {{ selectedTask?.room_id }} · {{ selectedTask?.task_type?.replace('_', ' ') }}
          </div>
        </div>

        <VaSelect
          v-model="assignTo"
          label="Assign To"
          :options="staffOptions"
          text-by="label"
          value-by="value"
          searchable
          clearable
        />

        <div class="modal-actions">
          <VaButton preset="secondary" color="secondary" @click="assignModal = false">
            Cancel
          </VaButton>
          <VaButton color="primary" :disabled="!assignTo" @click="confirmAssign">
            Confirm
          </VaButton>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { housekeepingAssign } from "@/data/housekeeping/housekeepingAssign"
import { staffUsers } from "@/data/users/staff"

const tasks = ref([...housekeepingAssign])

// room options (static)
const roomOptions = Array.from({ length: 30 }, (_, i) => ({
  label: `Room ${i + 1}`,
  value: i + 1,
}))

const staffOptions = computed(() => {
  return staffUsers
    .filter(u => u.status === "active")
    .map(u => ({
      label: `${u.full_name} · ${u.position}`,
      value: u.user_id,
    }))
})

const taskTypeOptions = ["cleaning", "maintenance", "inspection", "deep_clean", "turndown"]
const priorityOptions = ["low", "normal", "high", "urgent"]
const statusOptions = ["pending", "in_progress", "completed", "cancelled"]

const columns = [
  { key: "task_id", label: "ID", sortable: true, width: "90px" },
  { key: "room_id", label: "Room", sortable: true },
  { key: "task_type", label: "Type", sortable: true },
  { key: "priority", label: "Priority", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "assigned_to", label: "Assigned To" },
  { key: "assigned_at", label: "Assigned At" },
  { key: "actions", label: "Actions" },
]

// filters
const q = ref("")
const filterStatus = ref("")
const filterType = ref("")

const filteredTasks = computed(() => {
  const kw = q.value.toLowerCase()
  return tasks.value.filter(t => {
    const text = `${t.room_id} ${t.notes || ""}`.toLowerCase()
    const okQ = !kw || text.includes(kw)
    const okS = !filterStatus.value || t.status === filterStatus.value
    const okT = !filterType.value || t.task_type === filterType.value
    return okQ && okS && okT
  })
})

// form
const form = ref({
  property_id: 1,
  room_id: null,
  task_type: null,
  priority: "normal",
  notes: "",
  assigned_to: null, // optional for createTask
})

// ✅ Create only needs room + type
const canCreate = computed(() => !!form.value.room_id && !!form.value.task_type)

// ✅ Assign now needs room + type + staff
const canAssignNow = computed(() => canCreate.value && !!form.value.assigned_to)

function resetForm() {
  form.value = {
    property_id: 1,
    room_id: null,
    task_type: null,
    priority: "normal",
    notes: "",
    assigned_to: null,
  }
}

function nowSQL() {
  const d = new Date()
  const pad = (x) => String(x).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ✅ Create task ONLY (no assignment required)
function createTask() {
  if (!canCreate.value) return

  const now = nowSQL()

  const newTask = {
    task_id: nextId(),
    property_id: 1,
    room_id: form.value.room_id,
    task_type: form.value.task_type,
    priority: form.value.priority || "normal",
    status: "pending",
    assigned_to: null,      // <-- not assigned here
    assigned_at: null,      // <-- not assigned here
    started_at: null,
    completed_at: null,
    notes: form.value.notes || "",
    completion_notes: null,
    issues_found: null,
    created_by: 1,
    created_at: now,
    updated_at: now,
  }

  tasks.value = [newTask, ...tasks.value]
  resetForm()
}

// ✅ Assign now = create + assign
function assignNow() {
  if (!canAssignNow.value) return

  const now = nowSQL()

  const newTask = {
    task_id: nextId(),
    property_id: 1,
    room_id: form.value.room_id,
    task_type: form.value.task_type,
    priority: form.value.priority || "normal",
    status: "pending",
    assigned_to: form.value.assigned_to,
    assigned_at: now,
    started_at: null,
    completed_at: null,
    notes: form.value.notes || "",
    completion_notes: null,
    issues_found: null,
    created_by: 1,
    created_at: now,
    updated_at: now,
  }

  tasks.value = [newTask, ...tasks.value]
  resetForm()
}

function markInProgress(task) {
  if (task.status !== "pending") return
  task.status = "in_progress"
  task.started_at = nowSQL()
  task.updated_at = nowSQL()
}

// modal assign
const assignModal = ref(false)
const selectedTask = ref(null)
const assignTo = ref(null)

function openAssign(task) {
  selectedTask.value = task
  assignTo.value = task.assigned_to || null
  assignModal.value = true
}

function confirmAssign() {
  if (!selectedTask.value || !assignTo.value) return

  const now = nowSQL()
  selectedTask.value.assigned_to = assignTo.value
  selectedTask.value.assigned_at = now
  selectedTask.value.updated_at = now

  // keep status pending (still waiting to start)
  if (selectedTask.value.status !== "completed" && selectedTask.value.status !== "cancelled") {
    selectedTask.value.status = "pending"
  }

  assignModal.value = false
}

function nextId() {
  const max = tasks.value.reduce((m, t) => Math.max(m, Number(t.task_id || 0)), 0)
  return max + 1
}

function getStaffName(userId) {
  const u = staffUsers.find(x => x.user_id === userId)
  return u ? u.full_name : `User #${userId}`
}

function formatDate(v) {
  return v || "—"
}
</script>

<style scoped>
/* your same styles (unchanged) */
.page{
  min-height: 100vh;
  background: #ffffff;
  padding: 18px 18px 28px;
}
.header{
  display:flex;
  justify-content: space-between;
  align-items: end;
  gap: 16px;
  margin-bottom: 14px;
}
.title{ font-size: 20px; font-weight: 800; margin: 0; }
.subtitle{ margin: 4px 0 0; color: #64748b; font-size: 13px; }

.card{ border-radius: 14px; box-shadow: 0 6px 16px rgba(2, 6, 23, 0.06); }
.table-card{ margin-top: 14px; }

.grid{
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 14px;
  align-items: start;
}
@media (max-width: 980px){
  .grid{ grid-template-columns: 1fr; }
}

.form-grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.span-2{ grid-column: 1 / -1; }
.actions-row{
  display:flex;
  align-items:center;
  gap: 10px;
  flex-wrap: wrap;
}
.hint{
  color:#94a3b8;
  font-size: 12px;
  margin-left: auto;
}

.filters{ display:flex; flex-direction: column; gap: 10px; }

.room-pill{
  display:inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(14,165,233,.10);
  color: #0284c7;
  font-weight: 800;
  font-size: 12px;
}
.cap{ text-transform: capitalize; }

.badge{
  display:inline-flex;
  align-items:center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}
.p-low{ background: #f1f5f9; color:#64748b; }
.p-normal{ background: rgba(14,165,233,.10); color:#0284c7; }
.p-high{ background: rgba(245,158,11,.12); color:#b45309; }
.p-urgent{ background: rgba(239,68,68,.12); color:#b91c1c; }

.s-pending{ background: rgba(245,158,11,.12); color:#b45309; }
.s-in_progress{ background: rgba(14,165,233,.10); color:#0284c7; }
.s-completed{ background: rgba(16,185,129,.12); color:#047857; }
.s-cancelled{ background: rgba(239,68,68,.12); color:#b91c1c; }

.muted{ color:#94a3b8; }
.strong{ font-weight: 800; }

.row-actions{ display:flex; gap: 8px; flex-wrap: wrap; }

.modal-body{ display:flex; flex-direction: column; gap: 12px; }
.modal-row{ display:flex; justify-content: space-between; gap: 12px; padding: 10px 0; }
.modal-actions{ display:flex; justify-content: flex-end; gap: 10px; }

:deep(.va-button--primary){ background: #0ea5e9 !important; }
:deep(.va-button--primary:hover){ filter: brightness(0.95); }
</style>
