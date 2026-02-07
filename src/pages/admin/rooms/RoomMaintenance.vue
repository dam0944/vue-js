<!-- src/pages/admin/rooms/RoomMaintenance.vue
  ✅ Vuestic UI version (clean like your room list)
  ✅ Follow DB table housekeeping_tasks (maintenance/cleaning/inspection)
  ✅ Status color style consistent (pending/in_progress/completed/cancelled)
-->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto w-full">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <VaIcon name="build" color="secondary" />
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">Room Maintenance</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Track tasks from table <b>housekeeping_tasks</b> (maintenance/cleaning/inspection).
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="resetFilters">
            <VaIcon name="refresh" class="mr-1" />
            Reset
          </VaButton>

          <RouterLink to="/rooms/maintenance/create">
            <VaButton color="primary" class="rounded-2xl font-extrabold">
              <VaIcon name="add" class="mr-1" />
              Create Task
            </VaButton>
          </RouterLink>
        </div>
      </div>

      <!-- Filters + Snapshot -->
      <div class="mt-4 grid gap-3 lg:grid-cols-12">
        <!-- Left: Filters -->
        <VaCard class="soft-card rounded-2xl lg:col-span-8">
          <VaCardContent class="p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <VaInput
                v-model.trim="q"
                class="ctrl w-full sm:max-w-[420px]"
                placeholder="Search room / notes / assigned..."
                clearable
              >
                <template #prependInner>
                  <VaIcon name="search" color="secondary" />
                </template>
              </VaInput>

              <div class="grid w-full gap-2 sm:w-auto sm:grid-cols-4">
                <VaSelect
                  v-model="typeFilter"
                  class="ctrl"
                  label="Type"
                  :options="typeOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                />
                <VaSelect
                  v-model="priorityFilter"
                  class="ctrl"
                  label="Priority"
                  :options="priorityOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                />
                <VaSelect
                  v-model="assigneeFilter"
                  class="ctrl"
                  label="Assignee"
                  :options="assigneeSelectOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                />
                <VaSelect
                  v-model="sortBy"
                  class="ctrl"
                  label="Sort"
                  :options="sortOptions"
                  :text-by="(o) => o.text"
                  :value-by="(o) => o.value"
                />
              </div>
            </div>

            <!-- Chips -->
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="chip in chips"
                :key="chip.key"
                type="button"
                class="chip"
                :class="activeStatus === chip.key ? 'chip-active' : 'chip-idle'"
                @click="activeStatus = chip.key"
              >
                <span class="mr-2 inline-flex h-2 w-2 rounded-full" :class="chip.dot"></span>
                {{ chip.label }}
                <span class="ml-1 text-[11px]" :class="activeStatus === chip.key ? 'text-white/80' : 'text-slate-500'">
                  ({{ chip.count }})
                </span>
              </button>

              <button type="button" class="chip chip-idle" @click="viewMode = viewMode === 'kanban' ? 'list' : 'kanban'">
                <span class="material-icons mr-1 align-middle text-[16px]">
                  {{ viewMode === "kanban" ? "table_rows" : "view_kanban" }}
                </span>
                {{ viewMode === "kanban" ? "List" : "Kanban" }}
              </button>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Right: Snapshot -->
        <VaCard class="soft-card rounded-2xl lg:col-span-4 lg:sticky lg:top-4">
          <VaCardContent class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-extrabold text-slate-900">Today Snapshot</div>
                <div class="text-xs text-slate-500">Quick overview (static demo).</div>
              </div>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                Property #{{ propertyId }}
              </span>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2">
              <div class="mini-stat">
                <div class="mini-label">Pending</div>
                <div class="mini-value">{{ counts.pending }}</div>
              </div>
              <div class="mini-stat">
                <div class="mini-label">In Progress</div>
                <div class="mini-value">{{ counts.in_progress }}</div>
              </div>
              <div class="mini-stat">
                <div class="mini-label">Completed</div>
                <div class="mini-value">{{ counts.completed }}</div>
              </div>
              <div class="mini-stat">
                <div class="mini-label">Cancelled</div>
                <div class="mini-value">{{ counts.cancelled }}</div>
              </div>
            </div>

            <div class="mt-4 rounded-2xl bg-slate-50 p-4">
              <div class="text-xs font-extrabold text-slate-900">Rules</div>
              <ul class="mt-2 space-y-1 text-[11px] text-slate-600">
                <li>• If status = <b>in_progress</b> → started_at should exist.</li>
                <li>• If status = <b>completed</b> → completed_at should exist.</li>
                <li>• task_type comes from DB enum.</li>
              </ul>
            </div>

            <div class="mt-4 text-[11px] text-slate-500">
              Next step: connect API CRUD to <b>housekeeping_tasks</b>.
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Main -->
      <div class="mt-4">
        <!-- Kanban -->
        <div v-if="viewMode === 'kanban'" class="grid gap-3 lg:grid-cols-4">
          <KanbanCol
            title="Pending"
            icon="hourglass_empty"
            :items="byStatus.pending"
            badge="bg-amber-100 text-amber-800"
            @open="openDrawer"
            @quick="quickAction"
          />
          <KanbanCol
            title="In Progress"
            icon="autorenew"
            :items="byStatus.in_progress"
            badge="bg-blue-100 text-blue-800"
            @open="openDrawer"
            @quick="quickAction"
          />
          <KanbanCol
            title="Completed"
            icon="task_alt"
            :items="byStatus.completed"
            badge="bg-emerald-100 text-emerald-800"
            @open="openDrawer"
            @quick="quickAction"
          />
          <KanbanCol
            title="Cancelled"
            icon="block"
            :items="byStatus.cancelled"
            badge="bg-slate-200 text-slate-800"
            @open="openDrawer"
            @quick="quickAction"
          />
        </div>

        <!-- List -->
        <VaCard v-else class="soft-card rounded-2xl">
          <VaCardContent class="p-4">
            <div class="flex items-center justify-between">
              <div class="text-sm font-extrabold text-slate-900">Tasks</div>
              <div class="text-xs text-slate-500">{{ filteredSorted.length }} item(s)</div>
            </div>

            <div class="mt-3 overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="text-xs text-slate-500">
                    <th class="py-2 pr-3">Room</th>
                    <th class="py-2 pr-3">Type</th>
                    <th class="py-2 pr-3">Priority</th>
                    <th class="py-2 pr-3">Status</th>
                    <th class="py-2 pr-3">Assignee</th>
                    <th class="py-2 pr-3">Updated</th>
                    <th class="py-2 pr-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="t in filteredSorted" :key="t.task_id" class="border-t border-slate-100">
                    <td class="py-3 pr-3 font-extrabold text-slate-900">
                      Room {{ t.room_number || t.room_id }}
                    </td>
                    <td class="py-3 pr-3">{{ pretty(t.task_type) }}</td>
                    <td class="py-3 pr-3">
                      <span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="priorityPill(t.priority)">
                        {{ pretty(t.priority) }}
                      </span>
                    </td>
                    <td class="py-3 pr-3">
                      <span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="statusPill(t.status)">
                        {{ pretty(t.status) }}
                      </span>
                    </td>
                    <td class="py-3 pr-3 text-slate-700">{{ t.assigned_name || "Unassigned" }}</td>
                    <td class="py-3 pr-3 text-slate-500">{{ shortDate(t.updated_at) }}</td>
                    <td class="py-3 pr-3 text-right">
                      <VaButton preset="secondary" size="small" class="rounded-2xl font-extrabold" @click="openDrawer(t)">
                        Details
                      </VaButton>
                    </td>
                  </tr>

                  <tr v-if="filteredSorted.length === 0">
                    <td colspan="7" class="py-8 text-center text-slate-500">
                      No tasks found. Try different filters.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Drawer overlay -->
      <div v-if="drawer.open" class="fixed inset-0 z-40" @click="drawer.open = false">
        <div class="absolute inset-0 bg-black/40"></div>
      </div>

      <!-- Drawer -->
      <aside v-if="drawer.open" class="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white">
        <div class="flex items-center justify-between px-4 py-4">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">assignment</span>
            <div class="font-extrabold text-slate-900">Task #{{ drawer.task?.task_id }}</div>
          </div>
          <button class="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100" @click="drawer.open = false">
            <span class="material-icons text-slate-700">close</span>
          </button>
        </div>

        <div v-if="drawer.task" class="h-[calc(100vh-72px)] overflow-y-auto px-4 pb-6">
          <div class="rounded-2xl bg-slate-50 p-4">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="text-sm font-extrabold text-slate-900">
                  Room {{ drawer.task.room_number || drawer.task.room_id }}
                </div>
                <div class="mt-1 text-xs text-slate-500">
                  {{ pretty(drawer.task.task_type) }} • Created: {{ shortDate(drawer.task.created_at) }}
                </div>
              </div>

              <div class="text-right">
                <span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="statusPill(drawer.task.status)">
                  {{ pretty(drawer.task.status) }}
                </span>
                <div class="mt-2">
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="priorityPill(drawer.task.priority)">
                    {{ pretty(drawer.task.priority) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="mt-3 text-xs text-slate-700">
              <div class="flex justify-between">
                <span class="text-slate-500">Assigned to</span>
                <span class="font-extrabold text-slate-900">{{ drawer.task.assigned_name || "Unassigned" }}</span>
              </div>
              <div class="mt-1 flex justify-between">
                <span class="text-slate-500">Assigned at</span>
                <span class="text-slate-700">{{ drawer.task.assigned_at || "-" }}</span>
              </div>
              <div class="mt-1 flex justify-between">
                <span class="text-slate-500">Started at</span>
                <span class="text-slate-700">{{ drawer.task.started_at || "-" }}</span>
              </div>
              <div class="mt-1 flex justify-between">
                <span class="text-slate-500">Completed at</span>
                <span class="text-slate-700">{{ drawer.task.completed_at || "-" }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <div class="text-xs font-extrabold text-slate-900">Notes</div>
            <div class="mt-2 rounded-2xl bg-white p-4 text-sm text-slate-700">
              {{ drawer.task.notes || "—" }}
            </div>
          </div>

          <div class="mt-4">
            <div class="text-xs font-extrabold text-slate-900">Issues Found</div>
            <div class="mt-2 rounded-2xl bg-white p-4 text-sm text-slate-700">
              {{ drawer.task.issues_found || "—" }}
            </div>
          </div>

          <div class="mt-4">
            <div class="text-xs font-extrabold text-slate-900">Completion Notes</div>
            <div class="mt-2 rounded-2xl bg-white p-4 text-sm text-slate-700">
              {{ drawer.task.completion_notes || "—" }}
            </div>
          </div>

          <!-- Quick actions (demo) -->
          <div class="mt-5 grid grid-cols-2 gap-2">
            <VaButton color="primary" class="rounded-2xl font-extrabold" @click="quickAction({ action: 'start', task: drawer.task })">
              Start
            </VaButton>
            <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="quickAction({ action: 'complete', task: drawer.task })">
              Complete
            </VaButton>
          </div>

          <VaButton preset="secondary" class="mt-2 w-full rounded-2xl font-extrabold" @click="drawer.open = false">
            Close
          </VaButton>

          <div class="mt-3 text-[11px] text-slate-500">
            Demo only: quick actions show toast. Later update DB table <b>housekeeping_tasks</b>.
          </div>
        </div>
      </aside>

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
import { computed, reactive, ref } from "vue"
import { roomMaintenanceData } from "@/data/room/roomMaintenanceData"

/**
 * ✅ This page assumes each task object uses DB-like columns (example):
 * task_id, property_id, room_id, room_number, task_type, priority, status,
 * assigned_name, assigned_at, started_at, completed_at,
 * notes, issues_found, completion_notes, created_at, updated_at
 */

// inline component for kanban
const KanbanCol = {
  props: { title: String, icon: String, items: Array, badge: String },
  emits: ["open", "quick"],
  template: `
    <section class="rounded-2xl bg-white p-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-icons text-slate-700">{{ icon }}</span>
          <div class="text-sm font-extrabold text-slate-900">{{ title }}</div>
        </div>
        <span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold" :class="badge">
          {{ (items || []).length }}
        </span>
      </div>

      <div class="mt-3 space-y-2">
        <button
          v-for="t in (items || [])"
          :key="t.task_id"
          class="w-full rounded-2xl bg-slate-50 p-3 text-left hover:bg-slate-100"
          type="button"
          @click="$emit('open', t)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="truncate text-sm font-extrabold text-slate-900">
                Room {{ t.room_number || t.room_id }}
              </div>
              <div class="mt-1 text-xs text-slate-500">
                {{ pretty(t.task_type) }} • {{ t.assigned_name || "Unassigned" }}
              </div>
            </div>
            <span class="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-slate-700">
              {{ pretty(t.priority) }}
            </span>
          </div>

          <div class="mt-2 line-clamp-2 text-xs text-slate-600">
            {{ t.notes || "-" }}
          </div>

          <div class="mt-2 flex gap-2">
            <button
              class="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold hover:bg-slate-50"
              type="button"
              @click.stop="$emit('quick', { action: 'start', task: t })"
            >
              Start
            </button>
            <button
              class="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold hover:bg-slate-50"
              type="button"
              @click.stop="$emit('quick', { action: 'complete', task: t })"
            >
              Done
            </button>
          </div>
        </button>

        <div v-if="(items || []).length === 0" class="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
          No tasks.
        </div>
      </div>
    </section>
  `,
  methods: {
    pretty(s) {
      if (!s) return "-"
      return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
    },
  },
}

// property scope
const propertyId = 1

// filters
const q = ref("")
const typeFilter = ref("all")
const priorityFilter = ref("all")
const assigneeFilter = ref("all")
const sortBy = ref("newest")
const viewMode = ref("kanban") // kanban | list
const activeStatus = ref("all") // all | pending | in_progress | completed | cancelled

// drawer
const drawer = reactive({ open: false, task: null })

// toast
const toast = ref("")
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ""), 2000)
}

// options
const typeOptions = [
  { text: "All Types", value: "all" },
  { text: "Maintenance", value: "maintenance" },
  { text: "Cleaning", value: "cleaning" },
  { text: "Inspection", value: "inspection" },
  { text: "Deep Clean", value: "deep_clean" },
  { text: "Turndown", value: "turndown" },
]
const priorityOptions = [
  { text: "All Priority", value: "all" },
  { text: "Urgent", value: "urgent" },
  { text: "High", value: "high" },
  { text: "Normal", value: "normal" },
  { text: "Low", value: "low" },
]
const sortOptions = [
  { text: "Newest", value: "newest" },
  { text: "Oldest", value: "oldest" },
  { text: "Priority", value: "priority" },
  { text: "Room", value: "room" },
]

const assigneeOptions = computed(() => {
  const s = new Set((roomMaintenanceData || []).map((x) => x.assigned_name).filter(Boolean))
  return Array.from(s).sort()
})
const assigneeSelectOptions = computed(() => [
  { text: "All Assignees", value: "all" },
  { text: "Unassigned", value: "unassigned" },
  ...assigneeOptions.value.map((a) => ({ text: a, value: a })),
])

const filtered = computed(() => {
  const k = q.value.trim().toLowerCase()
  return (roomMaintenanceData || [])
    .filter((t) => t.property_id === propertyId)
    .filter((t) => {
      if (typeFilter.value !== "all" && t.task_type !== typeFilter.value) return false
      if (priorityFilter.value !== "all" && t.priority !== priorityFilter.value) return false

      if (assigneeFilter.value === "unassigned") {
        if (t.assigned_name) return false
      } else if (assigneeFilter.value !== "all") {
        if (t.assigned_name !== assigneeFilter.value) return false
      }

      if (activeStatus.value !== "all" && t.status !== activeStatus.value) return false

      if (!k) return true
      const blob = `${t.room_number || ""} ${t.room_id || ""} ${t.notes || ""} ${t.assigned_name || ""} ${t.task_type || ""}`.toLowerCase()
      return blob.includes(k)
    })
})

const filteredSorted = computed(() => {
  const arr = [...filtered.value]
  const priRank = { urgent: 1, high: 2, normal: 3, low: 4 }
  arr.sort((a, b) => {
    if (sortBy.value === "oldest") return (a.created_at || "").localeCompare(b.created_at || "")
    if (sortBy.value === "room") return String(a.room_number || a.room_id).localeCompare(String(b.room_number || b.room_id))
    if (sortBy.value === "priority") return (priRank[a.priority] || 9) - (priRank[b.priority] || 9)
    return (b.created_at || "").localeCompare(a.created_at || "")
  })
  return arr
})

const byStatus = computed(() => {
  const base = filteredSorted.value
  return {
    pending: base.filter((x) => x.status === "pending"),
    in_progress: base.filter((x) => x.status === "in_progress"),
    completed: base.filter((x) => x.status === "completed"),
    cancelled: base.filter((x) => x.status === "cancelled"),
  }
})

const counts = computed(() => {
  const all = (roomMaintenanceData || []).filter((x) => x.property_id === propertyId)
  const c = (s) => all.filter((x) => x.status === s).length
  return {
    pending: c("pending"),
    in_progress: c("in_progress"),
    completed: c("completed"),
    cancelled: c("cancelled"),
  }
})

const chips = computed(() => {
  const base = (roomMaintenanceData || []).filter((x) => x.property_id === propertyId)
  const count = (s) => base.filter((x) => x.status === s).length
  return [
    { key: "all", label: "All", count: base.length, dot: "bg-slate-400" },
    { key: "pending", label: "Pending", count: count("pending"), dot: "bg-amber-500" },
    { key: "in_progress", label: "In Progress", count: count("in_progress"), dot: "bg-blue-500" },
    { key: "completed", label: "Completed", count: count("completed"), dot: "bg-emerald-500" },
    { key: "cancelled", label: "Cancelled", count: count("cancelled"), dot: "bg-slate-700" },
  ]
})

function resetFilters() {
  q.value = ""
  typeFilter.value = "all"
  priorityFilter.value = "all"
  assigneeFilter.value = "all"
  sortBy.value = "newest"
  viewMode.value = "kanban"
  activeStatus.value = "all"
  showToast("Reset done.")
}

function openDrawer(t) {
  drawer.task = t
  drawer.open = true
}

function quickAction({ action, task }) {
  if (!task) return
  if (action === "start") showToast(`Start task #${task.task_id} (demo)`)
  if (action === "complete") showToast(`Complete task #${task.task_id} (demo)`)
  // later: PATCH housekeeping_tasks.status + timestamps
}

function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}
function shortDate(v) {
  if (!v) return "-"
  return String(v).slice(0, 16)
}
function statusPill(s) {
  switch (s) {
    case "pending":
      return "bg-amber-100 text-amber-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-emerald-100 text-emerald-800"
    case "cancelled":
      return "bg-slate-200 text-slate-800"
    default:
      return "bg-slate-100 text-slate-700"
  }
}
function priorityPill(p) {
  switch (p) {
    case "urgent":
      return "bg-rose-100 text-rose-800"
    case "high":
      return "bg-amber-100 text-amber-800"
    case "normal":
      return "bg-slate-200 text-slate-800"
    case "low":
      return "bg-slate-100 text-slate-700"
    default:
      return "bg-slate-100 text-slate-700"
  }
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

/* light shadow only */
.soft-card {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}

/* Vuestic controls like your soft inputs */
:deep(.ctrl .va-input-wrapper__container),
:deep(.ctrl .va-select__anchor),
:deep(.ctrl .va-textarea__container) {
  background: rgb(241 245 249) !important; /* slate-100 */
  border: 0 !important;
  border-radius: 16px !important;
  min-height: 44px !important;
}
:deep(.ctrl .va-input-wrapper__container:focus-within),
:deep(.ctrl .va-select__anchor:focus-within),
:deep(.ctrl .va-textarea__container:focus-within) {
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08) !important;
}

/* chips */
.chip {
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  transition: 0.15s ease;
  display: inline-flex;
  align-items: center;
}
.chip-idle {
  background: rgb(241 245 249);
  color: rgb(15 23 42);
}
.chip-idle:hover {
  background: rgb(226 232 240);
}
.chip-active {
  background: rgb(15 23 42);
  color: white;
}

/* snapshot cards */
.mini-stat {
  border-radius: 16px;
  background: rgb(248 250 252);
  padding: 12px;
}
.mini-label {
  font-size: 10px;
  font-weight: 900;
  color: rgb(100 116 139);
}
.mini-value {
  margin-top: 4px;
  font-size: 22px;
  font-weight: 900;
  color: rgb(15 23 42);
}

/* optional line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
