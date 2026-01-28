<!-- src/pages/admin/rooms/RoomMaintenanceForm.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">{{ isEdit ? "edit" : "add_task" }}</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
              {{ isEdit ? "Edit Task" : "Create Maintenance Task" }}
            </h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Insert into table: <b>housekeeping_tasks</b>
            <span v-if="isEdit"> • task_id: <b>{{ taskId }}</b></span>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            class="rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-200"
            type="button"
            @click="router.back()"
          >
            Back
          </button>

          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-40"
            :disabled="!canSave"
            type="button"
            @click="submit"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">save</span>
            {{ isEdit ? "Update" : "Save" }}
          </button>
        </div>
      </div>

      <!-- Not found -->
      <div v-if="isEdit && !found" class="mt-4 rounded-2xl bg-white p-6 text-center">
        <div class="text-slate-900 font-extrabold">Task not found</div>
        <div class="mt-1 text-sm text-slate-500">
          This task_id does not exist in your static data.
        </div>
        <button
          class="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
          type="button"
          @click="router.push('/rooms/maintenance')"
        >
          Back to list
        </button>
      </div>

      <!-- Form -->
      <section v-else class="mt-4 rounded-2xl bg-white p-4">
        <div class="grid gap-3 sm:grid-cols-2">
          <!-- room -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-bold text-slate-500">Room (room_id) *</label>
            <select v-model.number="form.room_id" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
              <option disabled :value="0">Select room</option>
              <option v-for="r in rooms" :key="r.room_id" :value="r.room_id">
                Room {{ r.room_number }}
              </option>
            </select>
          </div>

          <!-- task type -->
          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Task Type *</label>
            <select v-model="form.task_type" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
              <option value="maintenance">Maintenance</option>
              <option value="cleaning">Cleaning</option>
              <option value="inspection">Inspection</option>
              <option value="deep_clean">Deep Clean</option>
              <option value="turndown">Turndown</option>
            </select>
          </div>

          <!-- priority -->
          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Priority *</label>
            <select v-model="form.priority" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <!-- status -->
          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Status *</label>
            <select v-model="form.status" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- assignee -->
          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Assigned To (user_id)</label>
            <select v-model.number="form.assigned_to" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none">
              <option :value="null">Unassigned</option>
              <option v-for="u in users" :key="u.user_id" :value="u.user_id">
                {{ u.full_name }} ({{ u.position }})
              </option>
            </select>
          </div>

          <!-- notes -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-bold text-slate-500">Notes</label>
            <textarea
              v-model.trim="form.notes"
              rows="3"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="Describe the problem..."
            />
          </div>

          <!-- issues_found -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-bold text-slate-500">Issues Found</label>
            <textarea
              v-model.trim="form.issues_found"
              rows="2"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="Damage, missing items, etc..."
            />
          </div>

          <!-- completion notes -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-bold text-slate-500">Completion Notes</label>
            <textarea
              v-model.trim="form.completion_notes"
              rows="2"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="Only required when completed..."
            />
          </div>

          <!-- timestamps -->
          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Started At</label>
            <input
              v-model.trim="form.started_at"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="YYYY-MM-DD HH:mm:ss"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Completed At</label>
            <input
              v-model.trim="form.completed_at"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="YYYY-MM-DD HH:mm:ss"
            />
          </div>

          <!-- helper buttons -->
          <div class="sm:col-span-2 grid grid-cols-2 gap-2">
            <button
              class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-200"
              type="button"
              @click="setNow('started_at')"
            >
              Set Started Now
            </button>
            <button
              class="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-extrabold text-emerald-800 hover:bg-emerald-200"
              type="button"
              @click="setNow('completed_at')"
            >
              Set Completed Now
            </button>
          </div>
        </div>

        <div class="mt-3 text-[11px] text-slate-500">
          Demo: Save will only log to console. Later connect API to insert/update <b>housekeeping_tasks</b>.
        </div>
      </section>

      <!-- Toast -->
      <div
        v-if="toast"
        class="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-white"
      >
        <div class="flex items-start gap-2">
          <span class="material-icons text-[18px]">info</span>
          <div class="text-sm font-bold">{{ toast }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import { roomMaintenanceData } from "@/data/room/roomMaintenanceData"
import { roomsListData } from "@/data/room/room_list" // room list static
// If you don't have users static yet, keep below array local (demo).

const router = useRouter()
const route = useRoute()

const propertyId = 1

// edit mode
const taskId = computed(() => Number(route.params.task_id || 0))
const isEdit = computed(() => !!route.params.task_id)

// rooms for select
const rooms = computed(() =>
  (roomsListData || [])
    .filter((r) => r.property_id == null || r.property_id === propertyId) // optional
    .map((r) => ({ room_id: r.room_id, room_number: r.room_number }))
)

// simple users (demo)
const users = ref([
  { user_id: 2, full_name: "Manager", position: "manager" },
  { user_id: 3, full_name: "Sokha", position: "maintenance" },
  { user_id: 4, full_name: "Dara", position: "housekeeping" },
  { user_id: 5, full_name: "Vanna", position: "maintenance" },
])

const foundTask = computed(() => roomMaintenanceData.find((x) => x.task_id === taskId.value) || null)
const found = computed(() => !isEdit.value || !!foundTask.value)

// form matches DB columns (except task_id; also we auto set property_id/created_by)
const form = reactive({
  property_id: propertyId,
  room_id: 0,

  task_type: "maintenance",
  priority: "normal",
  status: "pending",

  assigned_to: null,
  assigned_at: null,
  started_at: null,
  completed_at: null,

  notes: "",
  completion_notes: "",
  issues_found: "",

  created_by: 2, // demo user
  created_at: null,
  updated_at: null,
})

// load edit data
watchEffect(() => {
  if (!isEdit.value) return
  if (!foundTask.value) return
  Object.assign(form, JSON.parse(JSON.stringify(foundTask.value)))
})

// Auto timestamp rules
watchEffect(() => {
  if (form.status === "in_progress" && !form.started_at) {
    form.started_at = nowStamp()
  }
  if (form.status === "completed" && !form.completed_at) {
    form.completed_at = nowStamp()
  }
  if (form.status !== "completed") {
    // optional: clear completion_notes if not completed
    // form.completion_notes = ""
  }
  if (form.assigned_to && !form.assigned_at) {
    form.assigned_at = nowStamp()
  }
})

// validate
const canSave = computed(() => {
  if (!found.value) return false
  if (!form.room_id) return false
  if (!form.task_type || !form.priority || !form.status) return false
  if (form.status === "completed" && !form.completed_at) return false
  if (form.status === "in_progress" && !form.started_at) return false
  return true
})

// toast
const toast = ref("")
let timer = null
function showToast(m) {
  toast.value = m
  clearTimeout(timer)
  timer = setTimeout(() => (toast.value = ""), 2000)
}

function nowStamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function setNow(field) {
  form[field] = nowStamp()
  showToast(`Set ${field} = now`)
}

function submit() {
  if (!canSave.value) return

  const payload = {
    ...JSON.parse(JSON.stringify(form)),
    property_id: propertyId,
    updated_at: nowStamp(),
  }

  if (!isEdit.value) {
    payload.created_at = nowStamp()
    console.log("CREATE housekeeping_tasks:", payload)
    showToast("Created (demo). Check console.")
  } else {
    console.log("UPDATE housekeeping_tasks WHERE task_id =", taskId.value, payload)
    showToast("Updated (demo). Check console.")
  }

  setTimeout(() => router.push("/rooms/maintenance"), 700)
}
</script>
