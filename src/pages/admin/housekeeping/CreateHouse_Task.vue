<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto max-w-3xl">
      <!-- Header -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">assignment</span>
            <h1 class="text-lg font-extrabold text-slate-900 sm:text-xl">
              {{ mode === "create" ? "Create Task" : "Edit Task" }}
            </h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Simple form, friendly spacing, no borders/shadows.
          </p>
        </div>

        <button
          type="button"
          class="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          @click="goBack"
        >
          Back
        </button>
      </div>

      <!-- Form -->
      <div class="mt-6 rounded-2xl bg-white p-4 sm:p-6">
        <form class="space-y-4" @submit.prevent="save">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Property ID">
              <input v-model.number="form.property_id" type="number" class="in" placeholder="1" />
            </Field>

            <Field label="Room ID">
              <input v-model.number="form.room_id" type="number" class="in" placeholder="101" />
            </Field>

            <Field label="Task Type">
              <select v-model="form.task_type" class="in">
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
                <option value="inspection">Inspection</option>
                <option value="deep_clean">Deep Clean</option>
                <option value="turndown">Turndown</option>
              </select>
            </Field>

            <Field label="Priority">
              <select v-model="form.priority" class="in">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </Field>

            <Field label="Status">
              <select v-model="form.status" class="in">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>

            <Field label="Assigned To (user_id)">
              <input v-model.number="form.assigned_to" type="number" class="in" placeholder="6" />
            </Field>

            <Field label="Assigned At">
              <input v-model="form.assigned_at" type="text" class="in" placeholder="YYYY-MM-DD HH:mm:ss" />
            </Field>

            <Field label="Started At">
              <input v-model="form.started_at" type="text" class="in" placeholder="YYYY-MM-DD HH:mm:ss or null" />
            </Field>

            <Field label="Completed At">
              <input v-model="form.completed_at" type="text" class="in" placeholder="YYYY-MM-DD HH:mm:ss or null" />
            </Field>

            <Field label="Created By (user_id)">
              <input v-model.number="form.created_by" type="number" class="in" placeholder="3" />
            </Field>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <Field label="Notes">
              <textarea v-model="form.notes" class="in min-h-[90px]" placeholder="Task notes..."></textarea>
            </Field>

            <Field label="Issues Found">
              <textarea v-model="form.issues_found" class="in min-h-[80px]" placeholder="Damage, missing items, etc"></textarea>
            </Field>

            <Field label="Completion Notes">
              <textarea v-model="form.completion_notes" class="in min-h-[80px]" placeholder="Work done summary..."></textarea>
            </Field>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              @click="goBack"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {{ mode === "create" ? "Create" : "Save Changes" }}
            </button>
          </div>

          <p class="text-xs text-slate-400">
            *This is static demo form. Later you can connect API + validation.
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { housekeepingTasks } from "@/data/housekeeping/housekeeping_Task";

const props = defineProps({
  mode: { type: String, required: true }, // "create" | "edit"
  taskId: { type: String, default: "" }
});

const router = useRouter();

const existing = computed(() => {
  if (props.mode !== "edit") return null;
  const idNum = Number(props.taskId);
  if (!Number.isFinite(idNum)) return null;
  return housekeepingTasks.find((t) => t.task_id === idNum) || null;
});

// follow table structure
const form = reactive({
  task_id: existing.value?.task_id ?? null,
  property_id: existing.value?.property_id ?? 1,
  room_id: existing.value?.room_id ?? 101,
  task_type: existing.value?.task_type ?? "cleaning",
  priority: existing.value?.priority ?? "normal",
  status: existing.value?.status ?? "pending",
  assigned_to: existing.value?.assigned_to ?? null,
  assigned_at: existing.value?.assigned_at ?? null,
  started_at: existing.value?.started_at ?? null,
  completed_at: existing.value?.completed_at ?? null,
  notes: existing.value?.notes ?? "",
  completion_notes: existing.value?.completion_notes ?? "",
  issues_found: existing.value?.issues_found ?? "",
  created_by: existing.value?.created_by ?? null,
  created_at: existing.value?.created_at ?? null,
  updated_at: existing.value?.updated_at ?? null
});

function goBack() {
  router.push({ name: "housekeeping-tasks" });
}

function save() {
  // Static demo: just show what would be saved
  console.log("SAVE TASK:", JSON.parse(JSON.stringify(form)));

  // navigate back
  goBack();
}
</script>

<script>
// tiny inline component without borders/shadows
export default {
  components: {
    Field: {
      props: { label: String },
      template: `
        <div>
          <label class="text-xs font-semibold text-slate-600">{{ label }}</label>
          <div class="mt-1">
            <slot />
          </div>
        </div>
      `
    }
  }
}
</script>

<style scoped>
/* input style: NO border, NO shadow */
.in {
  width: 100%;
  border: none;
  outline: none;
  background: #f1f5f9; /* slate-100 */
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 14px;
  color: #0f172a; /* slate-900 */
}
.in:focus {
  background: #ffffff;
}
</style>
