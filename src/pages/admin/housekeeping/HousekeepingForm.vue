<template>
  <div class="hkf">
    <header class="hkf-head">
      <div>
        <h1 class="hkf-title">{{ isEdit ? "Edit Task" : "Create Task" }}</h1>
        <p class="hkf-sub">Borderless form. Simple and clean.</p>
      </div>

      <div class="hkf-actions">
        <RouterLink class="btn ghost" :to="{ name: 'housekeeping-today' }">Back</RouterLink>
        <button class="btn primary" type="button" @click="save">
          {{ isEdit ? "Update" : "Create" }}
        </button>
      </div>
    </header>

    <div class="hkf-grid">
      <label class="field">
        <span>Room ID</span>
        <input v-model.number="form.room_id" type="number" placeholder="101" />
      </label>

      <label class="field">
        <span>Task Type</span>
        <select v-model="form.task_type">
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
          <option value="inspection">Inspection</option>
          <option value="deep_clean">Deep Clean</option>
          <option value="turndown">Turndown</option>
        </select>
      </label>

      <label class="field">
        <span>Priority</span>
        <select v-model="form.priority">
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </label>

      <label class="field">
        <span>Status</span>
        <select v-model="form.status">
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>

      <label class="field">
        <span>Assigned To (user_id)</span>
        <input v-model.number="form.assigned_to" type="number" placeholder="6" />
      </label>

      <label class="field field-full">
        <span>Notes</span>
        <textarea v-model="form.notes" rows="4" placeholder="Task notes..."></textarea>
      </label>

      <label class="field field-full">
        <span>Issues Found</span>
        <textarea v-model="form.issues_found" rows="3" placeholder="Damage, missing items..."></textarea>
      </label>

      <label class="field field-full">
        <span>Completion Notes</span>
        <textarea v-model="form.completion_notes" rows="3" placeholder="What was done..."></textarea>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from "vue"
import { useRoute, useRouter, RouterLink } from "vue-router"

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.taskId)

const form = reactive({
  task_id: isEdit.value ? Number(route.params.taskId) : null,
  property_id: 1,
  room_id: null,
  task_type: "cleaning",
  priority: "normal",
  status: "pending",
  assigned_to: null,
  assigned_at: null,
  started_at: null,
  completed_at: null,
  notes: "",
  completion_notes: "",
  issues_found: "",
  created_by: 3,
  created_at: null,
  updated_at: null,
})

function save() {
  // Static demo behavior:
  // In real app, call API to create/update.
  router.push({ name: "housekeeping-today" })
}
</script>

<style scoped>
.hkf{
  --bg:#fff; --soft:#f6f7fb; --text:#0f172a; --muted:#6b7280;
  --primary:#1b4332;
  background: var(--bg);
  color: var(--text);
  padding: 18px;
  min-height: calc(100vh - 60px);
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
.hkf-head{
  display:flex; align-items:flex-end; justify-content:space-between; gap:12px;
  padding: 8px 6px 16px;
}
.hkf-title{ margin:0; font-weight:1000; font-size: 20px; }
.hkf-sub{ margin:6px 0 0; color: var(--muted); font-size: 13px; }
.hkf-actions{ display:flex; gap:10px; align-items:center; }

.btn{
  border:0; background: transparent; padding: 10px 14px; border-radius: 999px;
  font-weight: 900; font-size: 13px; cursor:pointer; text-decoration:none; display:inline-flex;
  align-items:center; justify-content:center;
}
.btn.ghost{ background: var(--soft); color: var(--text); }
.btn.primary{ background: var(--primary); color:#fff; }

.hkf-grid{
  display:grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 6px;
}
.field{
  display:flex;
  flex-direction:column;
  gap: 8px;
  background: var(--soft);
  border-radius: 16px;
  padding: 12px;
}
.field-full{ grid-column: 1 / -1; }
.field span{ color: var(--muted); font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing:.06em; }

input, select, textarea{
  border:0;
  outline:none;
  background: rgba(255,255,255,.8);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
}
textarea{ resize: vertical; }

@media (max-width: 720px){
  .hkf-head{ flex-direction:column; align-items:flex-start; }
  .hkf-actions{ width:100%; }
  .btn{ width:100%; }
  .hkf-grid{ grid-template-columns: 1fr; }
}
</style>
