<script setup>
import { ref, computed, reactive, nextTick, watch } from "vue"
import $ from "jquery"
import { housekeeping_today as seed } from "@/data/housekeeping/housekeeping_today"

// -------------------- data --------------------
const tasks = ref(seed.map((x) => ({ ...x })))

// -------------------- filters --------------------
const q = ref("")
const status = ref("")
const taskType = ref("")
const priority = ref("")
const sort = ref("newest")

const safe = (v) => (v ?? "").toString().toLowerCase()
const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")

const statusOptions = ["", "pending", "in_progress", "completed", "skipped"]
const typeOptions = ["", "checkout_cleaning", "daily_cleaning", "deep_cleaning", "turndown", "inspection"]
const priorityOptions = ["", "low", "normal", "high", "urgent"]

const filtered = computed(() => {
  const key = safe(q.value)

  let list = tasks.value.filter((t) => {
    const hit =
      !key ||
      safe(t.task_id).includes(key) ||
      safe(t.room_id).includes(key) ||
      safe(t.task_type).includes(key) ||
      safe(t.notes).includes(key) ||
      safe(t.task_date).includes(key)

    const okStatus = !status.value || t.status === status.value
    const okType = !taskType.value || t.task_type === taskType.value
    const okPri = !priority.value || t.priority === priority.value
    return hit && okStatus && okType && okPri
  })

  if (sort.value === "newest") list.sort((a, b) => (b.task_id || 0) - (a.task_id || 0))
  if (sort.value === "oldest") list.sort((a, b) => (a.task_id || 0) - (b.task_id || 0))
  if (sort.value === "room") list.sort((a, b) => String(a.room_id).localeCompare(String(b.room_id)))
  if (sort.value === "date") list.sort((a, b) => String(b.task_date).localeCompare(String(a.task_date)))
  return list
})

// -------------------- quick stats --------------------
const stats = computed(() => {
  const total = tasks.value.length
  const pending = tasks.value.filter((x) => x.status === "pending").length
  const inProgress = tasks.value.filter((x) => x.status === "in_progress").length
  const completed = tasks.value.filter((x) => x.status === "completed").length
  return { total, pending, inProgress, completed }
})

// -------------------- modal + slideDown --------------------
const modalOpen = ref(false)
const modalMode = ref("view") // view | create | edit
const selected = ref(null)

// element that slides down
const formWrapRef = ref(null)

// form (create/edit)
const form = reactive({
  task_id: null,
  room_id: "",
  task_date: "",
  task_type: "daily_cleaning",
  priority: "normal",
  status: "pending",
  assigned_to: "",
  started_at: null,
  completed_at: null,
  notes: "",
})

function pad2(n) {
  return String(n).padStart(2, "0")
}
function nowTS() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(
    d.getMinutes()
  )}:00`
}
function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function slideDownForm() {
  nextTick(() => {
    const el = formWrapRef.value
    if (!el) return
    $(el).stop(true, true).css("display", "none").slideDown(260)
  })
}
function slideUpForm(cb) {
  const el = formWrapRef.value
  if (!el) return cb?.()
  $(el).stop(true, true).slideUp(200, () => cb?.())
}

function openModal(mode, row = null) {
  modalMode.value = mode
  selected.value = row

  if (mode === "create") {
    form.task_id = null
    form.room_id = ""
    form.task_date = todayISO()
    form.task_type = "daily_cleaning"
    form.priority = "normal"
    form.status = "pending"
    form.assigned_to = ""
    form.started_at = null
    form.completed_at = null
    form.notes = ""
  }

  if (mode === "edit" && row) {
    form.task_id = row.task_id
    form.room_id = row.room_id ?? ""
    form.task_date = row.task_date ?? todayISO()
    form.task_type = row.task_type ?? "daily_cleaning"
    form.priority = row.priority ?? "normal"
    form.status = row.status ?? "pending"
    form.assigned_to = row.assigned_to ?? ""
    form.started_at = row.started_at ?? null
    form.completed_at = row.completed_at ?? null
    form.notes = row.notes ?? ""
  }

  modalOpen.value = true
  if (mode === "create" || mode === "edit") slideDownForm()
}

function closeModal() {
  if (modalMode.value === "create" || modalMode.value === "edit") {
    slideUpForm(() => {
      modalOpen.value = false
      selected.value = null
    })
  } else {
    modalOpen.value = false
    selected.value = null
  }
}

// -------------------- save (local demo) --------------------
function saveCreate() {
  if (!String(form.room_id).trim() || !String(form.task_date).trim()) {
    alert("Room ID and Task Date are required.")
    return
  }
  const nextId = Math.max(...tasks.value.map((x) => x.task_id || 0), 0) + 1

  tasks.value.unshift({
    task_id: nextId,
    room_id: Number(form.room_id),
    task_date: form.task_date,
    task_type: form.task_type,
    priority: form.priority,
    status: form.status,
    assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
    started_at: form.status === "in_progress" ? (form.started_at || nowTS()) : form.started_at,
    completed_at: form.status === "completed" ? (form.completed_at || nowTS()) : form.completed_at,
    notes: form.notes,
  })

  closeModal()
}

function saveEdit() {
  const idx = tasks.value.findIndex((x) => x.task_id === form.task_id)
  if (idx === -1) return closeModal()

  const old = tasks.value[idx]
  tasks.value.splice(idx, 1, {
    ...old,
    room_id: Number(form.room_id),
    task_date: form.task_date,
    task_type: form.task_type,
    priority: form.priority,
    status: form.status,
    assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
    started_at:
      form.status === "in_progress"
        ? (form.started_at || old.started_at || nowTS())
        : form.started_at || null,
    completed_at:
      form.status === "completed"
        ? (form.completed_at || old.completed_at || nowTS())
        : form.completed_at || null,
    notes: form.notes,
  })

  closeModal()
}

// lock scroll
watch(modalOpen, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Housekeeping Tasks</h1>
        <p>Today overview • filter • quick view • create/edit slides down</p>
      </div>

      <div class="headActions">
        <VaButton preset="secondary" icon="refresh" @click="q=''; status=''; taskType=''; priority=''; sort='newest'">
          Reset
        </VaButton>
        <VaButton color="success" icon="add" @click="openModal('create')">New Task</VaButton>
      </div>
    </div>

    <!-- stats -->
    <div class="stats">
      <div class="sCard">
        <div class="sLabel">Total</div>
        <div class="sValue">{{ stats.total }}</div>
      </div>
      <div class="sCard soft">
        <div class="sLabel">Pending</div>
        <div class="sValue">{{ stats.pending }}</div>
      </div>
      <div class="sCard warn">
        <div class="sLabel">In Progress</div>
        <div class="sValue">{{ stats.inProgress }}</div>
      </div>
      <div class="sCard ok">
        <div class="sLabel">Completed</div>
        <div class="sValue">{{ stats.completed }}</div>
      </div>
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search task id / room / date / notes..." />
      <VaSelect v-model="status" :options="statusOptions" label="Status" />
      <VaSelect v-model="taskType" :options="typeOptions" label="Task Type" />
      <VaSelect v-model="priority" :options="priorityOptions" label="Priority" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Newest', value: 'newest' },
          { text: 'Oldest', value: 'oldest' },
          { text: 'Room', value: 'room' },
          { text: 'Task Date', value: 'date' },
        ]"
        text-by="text"
        value-by="value"
        label="Sort"
      />
    </VaCard>

    <!-- table -->
    <VaCard class="tableCard">
      <div class="tableWrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Room</th>
              <th>Task</th>
              <th>Date</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="8" class="empty">No tasks found.</td>
            </tr>

            <tr v-for="t in filtered" :key="t.task_id">
              <td class="mono">#{{ t.task_id }}</td>

              <td>
                <div class="main">Room {{ t.room_id }}</div>
                <div class="sub" v-if="t.notes">{{ t.notes }}</div>
              </td>

              <td>
                <span class="badge">{{ label(t.task_type) }}</span>
              </td>

              <td class="mono">{{ t.task_date }}</td>

              <td>
                <span class="badge" :class="'st-' + (t.status || 'pending')">
                  {{ label(t.status) }}
                </span>
              </td>

              <td>
                <span class="badge" :class="'pr-' + (t.priority || 'normal')">
                  {{ label(t.priority) }}
                </span>
              </td>

              <td>
                <div class="main">{{ t.assigned_to ? `User #${t.assigned_to}` : "-" }}</div>
                <div class="sub">
                  <span v-if="t.started_at">Start: <span class="mono">{{ t.started_at }}</span></span>
                  <span v-if="t.completed_at" class="ml">Done: <span class="mono">{{ t.completed_at }}</span></span>
                </div>
              </td>

              <td class="right">
                <div class="btns">
                  <VaButton size="small" preset="secondary" @click="openModal('view', t)">View</VaButton>
                  <VaButton size="small" color="primary" @click="openModal('edit', t)">Edit</VaButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- modal -->
    <Teleport to="body">
      <div v-if="modalOpen" class="m-wrap" @click="closeModal">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">
                {{
                  modalMode === "create"
                    ? "Create Housekeeping Task"
                    : modalMode === "edit"
                    ? "Edit Housekeeping Task"
                    : "Task Details"
                }}
              </div>
              <div class="m-sub">
                {{
                  modalMode === "view"
                    ? `Task #${selected?.task_id ?? "-"} • Room ${selected?.room_id ?? "-"}`
                    : "Form slideDown from top"
                }}
              </div>
            </div>

            <VaButton preset="secondary" icon="close" @click="closeModal">Close</VaButton>
          </header>

          <section class="m-body">
            <!-- view -->
            <div v-if="modalMode === 'view' && selected" class="viewGrid">
              <div class="card">
                <div class="t">Task</div>
                <div class="big">{{ label(selected.task_type) }}</div>
                <div class="muted">Date: <span class="mono">{{ selected.task_date }}</span></div>
              </div>

              <div class="card">
                <div class="t">Room</div>
                <div class="big">Room {{ selected.room_id }}</div>
                <div class="muted">Assigned: {{ selected.assigned_to ? `User #${selected.assigned_to}` : "-" }}</div>
              </div>

              <div class="card">
                <div class="t">Status</div>
                <span class="badge" :class="'st-' + (selected.status || 'pending')">{{ label(selected.status) }}</span>
                <div class="mt muted">Priority: <b>{{ label(selected.priority) }}</b></div>
              </div>

              <div class="card">
                <div class="t">Time</div>
                <div>Started: <b class="mono">{{ selected.started_at || "-" }}</b></div>
                <div>Completed: <b class="mono">{{ selected.completed_at || "-" }}</b></div>
              </div>

              <div class="card wide">
                <div class="t">Notes</div>
                <div class="note">{{ selected.notes || "-" }}</div>
              </div>
            </div>

            <!-- create/edit (slideDown) -->
            <div v-else ref="formWrapRef" class="formWrap">
              <div class="formGrid">
                <VaInput v-model="form.room_id" label="Room ID *" placeholder="ex: 101" />
                <VaInput v-model="form.task_date" type="date" label="Task Date *" />

                <VaSelect v-model="form.task_type" :options="typeOptions.filter(Boolean)" label="Task Type" />
                <VaSelect v-model="form.priority" :options="priorityOptions.filter(Boolean)" label="Priority" />

                <VaSelect v-model="form.status" :options="statusOptions.filter(Boolean)" label="Status" />
                <VaInput v-model="form.assigned_to" label="Assigned To (user_id)" placeholder="ex: 3" />

                <VaInput v-model="form.started_at" label="Started At (YYYY-MM-DD HH:mm:ss)" placeholder="auto when in_progress" />
                <VaInput v-model="form.completed_at" label="Completed At (YYYY-MM-DD HH:mm:ss)" placeholder="auto when completed" />

                <VaTextarea v-model="form.notes" label="Notes" :max-rows="3" class="wide" />
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="closeModal">Cancel</VaButton>

            <template v-if="modalMode === 'create'">
              <VaButton color="success" icon="save" @click="saveCreate">Save</VaButton>
            </template>

            <template v-else-if="modalMode === 'edit'">
              <VaButton color="success" icon="save" @click="saveEdit">Save Changes</VaButton>
            </template>

            <template v-else>
              <VaButton color="primary" @click="openModal('edit', selected)">Edit</VaButton>
            </template>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page {
  padding: 20px 24px;
  background: #f6f8fb;
  min-height: 100vh;
}

/* header */
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}
.headActions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.head h1 {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}
.head p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #475569;
}

/* stats */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
@media (max-width: 900px) {
  .stats { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .stats { grid-template-columns: 1fr; }
}
.sCard {
  border: 1px solid #eef2f6;
  background: #fff;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}
.sCard.soft { background: #f8fafc; }
.sCard.warn { background: #fef9c3; border-color: #fde68a; }
.sCard.ok { background: #dcfce7; border-color: #bbf7d0; }
.sLabel { font-size: 12px; font-weight: 900; color: #64748b; }
.sValue { margin-top: 6px; font-size: 22px; font-weight: 900; color: #0f172a; }

/* filters */
.filters {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
@media (max-width: 1000px) {
  .filters { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .filters { grid-template-columns: 1fr; }
}

/* table */
.tableCard {
  border-radius: 14px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}
.tableWrap { overflow-x: auto; }
.tbl {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.tbl th {
  text-align: left;
  padding: 12px 14px;
  font-size: 12px;
  color: #475569;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  white-space: nowrap;
}
.tbl td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}
.tbl tr:hover td { background: #fafcff; }
.right { text-align: right; }
.main { font-weight: 900; color: #0f172a; font-size: 13px; }
.sub { margin-top: 4px; font-size: 12px; color: #64748b; }
.ml { margin-left: 10px; }
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  color: #334155;
  white-space: nowrap;
}
.empty { text-align: center; padding: 20px !important; font-weight: 800; color: #64748b; }
.btns { display: inline-flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }

/* badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
}
.st-pending { background: #f1f5f9; }
.st-in_progress { background: #fef9c3; border-color: #fde68a; color: #854d0e; }
.st-completed { background: #dcfce7; border-color: #bbf7d0; color: #166534; }
.st-skipped { background: #fee2e2; border-color: #fecaca; color: #991b1b; }

.pr-low { background: #f1f5f9; }
.pr-normal { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
.pr-high { background: #fef9c3; border-color: #fde68a; color: #854d0e; }
.pr-urgent { background: #fee2e2; border-color: #fecaca; color: #991b1b; }

/* modal */
.m-wrap {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  padding: 18px;
}
.m {
  width: min(1080px, 100%);
  max-height: 95vh;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}
.m-head {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.m-title { font-size: 16px; font-weight: 900; color: #0f172a; }
.m-sub { margin-top: 2px; font-size: 12px; color: #64748b; }
.m-body { padding: 16px; overflow: auto; max-height: calc(92vh - 118px); }
.m-foot { padding: 14px 16px; border-top: 1px solid #eef2f6; display: flex; justify-content: flex-end; gap: 10px; background: #fff; }

/* view cards */
.viewGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 760px) { .viewGrid { grid-template-columns: 1fr; } }
.card { border: 1px solid #eef2f6; border-radius: 14px; background: #fbfcfe; padding: 14px; }
.card.wide { grid-column: 1 / -1; }
.t { font-size: 12px; color: #64748b; font-weight: 800; margin-bottom: 8px; }
.big { font-size: 18px; font-weight: 900; color: #0f172a; }
.muted { color: #64748b; font-weight: 800; }
.mt { margin-top: 10px; }
.note { font-weight: 800; color: #0f172a; }

/* ✅ slide wrapper */
.formWrap { display: none; } /* jQuery will slideDown */

/* form */
.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
@media (max-width: 860px) {
  .formGrid { grid-template-columns: 1fr; }
}
.wide { grid-column: 1 / -1; }

/* Vuestic polish */
:deep(.va-input__container),
:deep(.va-select__container),
:deep(.va-textarea__container) {
  border-radius: 10px;
  background: #f9fafb;
}
:deep(.va-button) { border-radius: 10px; font-weight: 800; }
</style>
