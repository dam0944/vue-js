<script setup>
import { reactive, computed } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const assignedStaff = route.query.staff || "" // from ?staff=12

const form = reactive({
  room_id: "",
  assigned_to: assignedStaff, // ✅ only once
  task_date: "",
  task_type: "daily_cleaning",
  priority: "normal",
  status: "pending",
  started_at: "",
  completed_at: "",
  notes: "",
})

const typeOptions = [
  "checkout_cleaning",
  "daily_cleaning",
  "deep_cleaning",
  "turndown",
  "inspection",
]
const priorityOptions = ["low", "normal", "high", "urgent"]
const statusOptions = ["pending", "in_progress", "completed", "skipped"]

const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")

const canSave = computed(() => {
  return String(form.room_id).trim() && String(form.task_date).trim()
})

function submit() {
  if (!canSave.value) return alert("Room ID and Task Date are required.")
  console.log("create housekeeping task", JSON.parse(JSON.stringify(form)))
  alert("Saved (demo). Check console.")
}

function reset() {
  form.room_id = ""
  form.task_date = ""
  form.task_type = "daily_cleaning"
  form.priority = "normal"
  form.status = "pending"
  form.assigned_to = assignedStaff // ✅ keep staff if passed in URL
  form.started_at = ""
  form.completed_at = ""
  form.notes = ""
}


function exportCSV() {
  const data = filtered.value || []
  if (!data.length) return alert("No data to export.")

  const headers = [
    "staff_id",
    "staff_name",
    "role",
    "total_tasks",
    "completed_tasks",
    "pending_tasks",
    "skipped_tasks",
    "on_time_rate",
    "avg_minutes_per_task",
    "last_activity",
  ]

  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`
  const rows = data.map((r) => [
    r.staff_id,
    r.staff_name,
    r.role,
    r.total_tasks,
    r.completed_tasks,
    r.pending_tasks,
    r.skipped_tasks,
    r.on_time_rate,
    r.avg_minutes_per_task,
    r.last_activity,
  ])

  const csv = [headers.join(","), ...rows.map((row) => row.map(esc).join(","))].join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `housekeeping-performance-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Create Housekeeping Task</h1>
        <p>Fast create • clean layout • required fields highlighted</p>
      </div>

      <div class="headActions">
        <VaButton preset="secondary" icon="refresh" @click="reset">Reset</VaButton>
        <VaButton color="success" icon="save" :disabled="!canSave" @click="submit">
          Save Task
        </VaButton>
      </div>
    </div>

    <div class="grid">
      <!-- Left: main form -->
      <VaCard class="card">
        <div class="cardHead">
          <div class="title">Task Information</div>
          <div class="hint">Fields with * are required</div>
        </div>

        <div class="formGrid">
          <VaInput v-model="form.room_id" label="Room ID *" placeholder="ex: 101" />

          <VaInput v-model="form.task_date" type="date" label="Task Date *" />

          <VaSelect
            v-model="form.task_type"
            :options="typeOptions"
            :label="`Task Type (${label(form.task_type)})`"
          />

          <VaSelect
            v-model="form.priority"
            :options="priorityOptions"
            :label="`Priority (${label(form.priority)})`"
          />

          <VaSelect
            v-model="form.status"
            :options="statusOptions"
            :label="`Status (${label(form.status)})`"
          />

          <VaInput
            v-model="form.assigned_to"
            label="Assigned To (user_id)"
            placeholder="ex: 3"
          />

          <VaInput
            v-model="form.started_at"
            label="Started At (optional)"
            placeholder="YYYY-MM-DD HH:mm:ss"
          />

          <VaInput
            v-model="form.completed_at"
            label="Completed At (optional)"
            placeholder="YYYY-MM-DD HH:mm:ss"
          />

          <VaTextarea
            v-model="form.notes"
            class="wide"
            label="Notes"
            :max-rows="4"
            placeholder="Example: Change bedsheet, refill water, check bathroom..."
          />
        </div>

        <div class="actions">
          <VaButton preset="secondary" @click="reset">Cancel</VaButton>
          <VaButton color="success" icon="save" :disabled="!canSave" @click="submit">
            Save Task
          </VaButton>
        </div>
      </VaCard>

      <!-- Right: preview / helper -->
      <VaCard class="card side">
        <div class="cardHead">
          <div class="title">Quick Preview</div>
          <div class="hint">What you will save</div>
        </div>

        <div class="preview">
          <div class="row">
            <div class="k">Room</div>
            <div class="v">{{ form.room_id || "-" }}</div>
          </div>
          <div class="row">
            <div class="k">Date</div>
            <div class="v mono">{{ form.task_date || "-" }}</div>
          </div>
          <div class="row">
            <div class="k">Type</div>
            <div class="v">
              <span class="pill">{{ label(form.task_type) }}</span>
            </div>
          </div>
          <div class="row">
            <div class="k">Status</div>
            <div class="v">
              <span class="pill" :class="'st-' + form.status">{{ label(form.status) }}</span>
            </div>
          </div>
          <div class="row">
            <div class="k">Priority</div>
            <div class="v">
              <span class="pill" :class="'pr-' + form.priority">{{ label(form.priority) }}</span>
            </div>
          </div>

          <div class="hr"></div>

          <div class="row">
            <div class="k">Assigned</div>
            <div class="v">{{ form.assigned_to ? `User #${form.assigned_to}` : "-" }}</div>
          </div>
          <div class="row">
            <div class="k">Started</div>
            <div class="v mono">{{ form.started_at || "-" }}</div>
          </div>
          <div class="row">
            <div class="k">Completed</div>
            <div class="v mono">{{ form.completed_at || "-" }}</div>
          </div>

          <div class="hr"></div>

          <div class="k">Notes</div>
          <div class="note">{{ form.notes || "-" }}</div>
        </div>

        <div class="tips">
          <div class="tipTitle">Tips</div>
          <ul>
            <li>Use <b>checkout_cleaning</b> when guest checked out.</li>
            <li>Set status to <b>in_progress</b> when staff starts cleaning.</li>
            <li>Set <b>urgent</b> priority for VIP rooms / fast turnover.</li>
          </ul>
        </div>
      </VaCard>
    </div>
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
.headActions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* layout */
.grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 14px;
}
@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

/* cards */
.card {
  border-radius: 14px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  background: #fff;
  overflow: hidden;
}
.cardHead {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}
.title {
  font-weight: 900;
  color: #0f172a;
}
.hint {
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}

/* form grid */
.formGrid {
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 760px) {
  .formGrid {
    grid-template-columns: 1fr;
  }
}
.wide {
  grid-column: 1 / -1;
}

/* actions */
.actions {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* preview */
.preview {
  padding: 16px;
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
}
.k {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.v {
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}
.hr {
  height: 1px;
  background: #eef2f6;
  margin: 12px 0;
}
.pill {
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
.st-pending {
  background: #f1f5f9;
}
.st-in_progress {
  background: #fef9c3;
  border-color: #fde68a;
  color: #854d0e;
}
.st-completed {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #166534;
}
.st-skipped {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}
.pr-low {
  background: #f1f5f9;
}
.pr-normal {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}
.pr-high {
  background: #fef9c3;
  border-color: #fde68a;
  color: #854d0e;
}
.pr-urgent {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}
.note {
  margin-top: 8px;
  font-weight: 800;
  color: #0f172a;
  font-size: 13px;
  white-space: pre-wrap;
}

/* tips */
.tips {
  border-top: 1px solid #eef2f6;
  background: #fbfcfe;
  padding: 14px 16px;
}
.tipTitle {
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 6px;
}
.tips ul {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  font-weight: 700;
  font-size: 13px;
}
.tips li {
  margin: 6px 0;
}

/* vuestic polish */
:deep(.va-input__container),
:deep(.va-select__container),
:deep(.va-textarea__container) {
  border-radius: 10px;
  background: #f9fafb;
}
:deep(.va-button) {
  border-radius: 10px;
  font-weight: 800;
}
</style>
