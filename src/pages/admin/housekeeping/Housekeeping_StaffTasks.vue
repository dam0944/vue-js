<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { housekeeping_Task } from "@/data/housekeeping/housekeeping_Task"
import { housekeeping_today } from "@/data/housekeeping/housekeeping_today"

const route = useRoute()
const router = useRouter()

const staffId = computed(() => Number(route.params.staffId))

// demo: merge today + tasks then filter by assigned_to
const allTasks = computed(() => [...housekeeping_Task, ...housekeeping_today])

const rows = computed(() =>
  allTasks.value
    .filter((t) => Number(t.assigned_to) === staffId.value)
    .sort((a, b) => (b.task_id || 0) - (a.task_id || 0))
)

const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")

function goBack() {
  router.push({ name: "admin.housekeeping.performance" })
}
</script>

<template>
  <div class="p-5 bg-[#f6f8fb] min-h-screen">
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <h1 class="text-[22px] font-black text-slate-900">Staff Tasks</h1>
        <p class="text-[13px] font-extrabold text-slate-500">
          Staff ID: {{ staffId }}
        </p>
      </div>

      <VaButton preset="secondary" icon="arrow_back" @click="goBack">
        Back
      </VaButton>
    </div>

    <VaCard class="rounded-[14px] border border-slate-200 shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse bg-white">
          <thead>
            <tr class="text-left text-[12px] font-black text-slate-500 bg-slate-50">
              <th class="p-3 border-b border-slate-100">Task ID</th>
              <th class="p-3 border-b border-slate-100">Room</th>
              <th class="p-3 border-b border-slate-100">Date</th>
              <th class="p-3 border-b border-slate-100">Type</th>
              <th class="p-3 border-b border-slate-100">Priority</th>
              <th class="p-3 border-b border-slate-100">Status</th>
              <th class="p-3 border-b border-slate-100">Notes</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="rows.length === 0">
              <td colspan="7" class="p-6 text-center text-[13px] font-extrabold text-slate-500">
                No tasks for this staff.
              </td>
            </tr>

            <tr
              v-for="t in rows"
              :key="t.task_id"
              class="hover:bg-slate-50"
            >
              <td class="p-3 border-b border-slate-100 font-black text-slate-800">
                {{ t.task_id }}
              </td>
              <td class="p-3 border-b border-slate-100 font-extrabold text-slate-700">
                #{{ t.room_id }}
              </td>
              <td class="p-3 border-b border-slate-100 font-extrabold text-slate-700">
                {{ t.task_date }}
              </td>
              <td class="p-3 border-b border-slate-100 font-extrabold text-slate-700">
                {{ label(t.task_type) }}
              </td>
              <td class="p-3 border-b border-slate-100 font-extrabold text-slate-700">
                {{ label(t.priority) }}
              </td>
              <td class="p-3 border-b border-slate-100 font-extrabold text-slate-700">
                {{ label(t.status) }}
              </td>
              <td class="p-3 border-b border-slate-100 text-[13px] font-semibold text-slate-700">
                {{ t.notes || "-" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>
  </div>
</template>
