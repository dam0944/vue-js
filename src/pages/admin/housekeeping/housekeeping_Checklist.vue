<script setup>
import { ref, computed, nextTick, watch } from "vue"
import $ from "jquery"
import { housekeeping_Checklist as seed } from "@/data/housekeeping/housekeeping_Checklist"

/** ---------------- data ---------------- */
const rows = ref(seed.map((x) => ({ ...x })))

/** ---------------- filters ---------------- */
const q = ref("")
const taskId = ref("")
const checked = ref("") // "", "yes", "no"
const sort = ref("task")

const safe = (v) => (v ?? "").toString().toLowerCase()

const taskOptions = computed(() => {
  const s = new Set()
  rows.value.forEach((r) => s.add(r.task_id))
  return ["", ...Array.from(s).sort((a, b) => a - b)]
})

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit = !key || safe(r.item_name).includes(key) || safe(r.task_id).includes(key)
    const okTask = !taskId.value || String(r.task_id) === String(taskId.value)
    const okChecked =
      checked.value === ""
        ? true
        : Boolean(r.is_checked) === (checked.value === "yes")

    return hit && okTask && okChecked
  })

  if (sort.value === "task") list.sort((a, b) => (a.task_id - b.task_id) || (a.checklist_id - b.checklist_id))
  if (sort.value === "newest") list.sort((a, b) => (b.checklist_id || 0) - (a.checklist_id || 0))
  if (sort.value === "name") list.sort((a, b) => safe(a.item_name).localeCompare(safe(b.item_name)))

  return list
})

/** ---------------- stats ---------------- */
const stats = computed(() => {
  const total = rows.value.length
  const done = rows.value.filter((x) => x.is_checked).length
  const pending = total - done
  return { total, done, pending }
})

/** ---------------- slideDown details (jQuery) ---------------- */
const drawerOpen = ref(false)
const selectedTask = ref("")
const drawerRef = ref(null)

const taskRows = computed(() =>
  rows.value
    .filter((x) => String(x.task_id) === String(selectedTask.value))
    .sort((a, b) => (a.checklist_id || 0) - (b.checklist_id || 0))
)

function slideDownDrawer() {
  nextTick(() => {
    const el = drawerRef.value
    if (!el) return
    $(el).stop(true, true).css("display", "none").slideDown(240)
  })
}
function slideUpDrawer(cb) {
  const el = drawerRef.value
  if (!el) return cb?.()
  $(el).stop(true, true).slideUp(200, () => cb?.())
}

function openTask(task) {
  selectedTask.value = task
  drawerOpen.value = true
  slideDownDrawer()
}
function closeDrawer() {
  slideUpDrawer(() => {
    drawerOpen.value = false
    selectedTask.value = ""
  })
}

/** ---------------- actions ---------------- */
function nowTs() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:00`
}

function toggleCheck(id) {
  const i = rows.value.findIndex((x) => x.checklist_id === id)
  if (i === -1) return
  const cur = rows.value[i]
  const next = !cur.is_checked
  rows.value.splice(i, 1, {
    ...cur,
    is_checked: next,
    checked_at: next ? nowTs() : null,
  })
}

function addItemToTask(task) {
  const name = prompt("Checklist item name:")
  if (!name) return
  const nextId = Math.max(...rows.value.map((x) => x.checklist_id || 0), 0) + 1
  rows.value.push({
    checklist_id: nextId,
    task_id: Number(task),
    item_name: name.trim(),
    is_checked: false,
    checked_at: null,
  })
}

/** ---------------- helpers ---------------- */
function pillStatus(r) {
  return r.is_checked ? "DONE" : "PENDING"
}
function pillClass(r) {
  return r.is_checked
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-amber-200 bg-amber-50 text-amber-900"
}

watch(drawerOpen, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Cleaning Checklist</h1>
        <p>Filter by task • quickly mark done • slide-down task details</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="refresh" @click="q=''; taskId=''; checked=''; sort='task'">
          Reset
        </VaButton>
        <VaButton color="primary" icon="visibility" @click="openTask(taskId || taskOptions[1])">
          View Task
        </VaButton>
      </div>
    </div>

    <!-- stats -->
    <div class="stats">
      <div class="stat">
        <div class="k">Total Items</div>
        <div class="v">{{ stats.total }}</div>
      </div>
      <div class="stat ok">
        <div class="k">Done</div>
        <div class="v">{{ stats.done }}</div>
      </div>
      <div class="stat warn">
        <div class="k">Pending</div>
        <div class="v">{{ stats.pending }}</div>
      </div>
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search checklist item..." />
      <VaSelect v-model="taskId" :options="taskOptions" label="Task ID" />
      <VaSelect v-model="checked" :options="['', 'yes', 'no']" label="Checked" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Sort by Task', value: 'task' },
          { text: 'Newest', value: 'newest' },
          { text: 'Item Name', value: 'name' },
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
              <th>Task</th>
              <th>Checklist Item</th>
              <th>Status</th>
              <th>Checked At</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="empty">No checklist items found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.checklist_id" class="rowHover">
              <td>
                <div class="main">Task #{{ r.task_id }}</div>
                <button class="link" @click="openTask(r.task_id)">Open task</button>
              </td>

              <td>
                <div class="itemName">{{ r.item_name }}</div>
                <div class="sub">Checklist ID: {{ r.checklist_id }}</div>
              </td>

              <td>
                <span class="pill" :class="pillClass(r)">{{ pillStatus(r) }}</span>
              </td>

              <td class="mono">{{ r.checked_at || "-" }}</td>

              <td class="right">
                <div class="btns">
                  <VaButton
                    size="small"
                    :color="r.is_checked ? 'secondary' : 'success'"
                    @click="toggleCheck(r.checklist_id)"
                  >
                    {{ r.is_checked ? "Undo" : "Done" }}
                  </VaButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- slideDown drawer -->
    <Teleport to="body">
      <div v-if="drawerOpen" class="overlay" @click="closeDrawer">
        <div class="drawer" @click.stop>
          <header class="drawerHead">
            <div>
              <div class="drawerTitle">Task #{{ selectedTask }}</div>
              <div class="drawerSub">
                {{ taskRows.filter(x => x.is_checked).length }} / {{ taskRows.length }} completed
              </div>
            </div>

            <div class="drawerBtns">
              <VaButton preset="secondary" icon="add" @click="addItemToTask(selectedTask)">Add Item</VaButton>
              <VaButton preset="secondary" icon="close" @click="closeDrawer">Close</VaButton>
            </div>
          </header>

          <section class="drawerBody">
            <!-- ✅ jQuery slideDown target -->
            <div ref="drawerRef" class="drawerInner">
              <div v-if="taskRows.length === 0" class="emptyBox">
                No checklist items for this task.
              </div>

              <div v-else class="taskList">
                <div v-for="r in taskRows" :key="r.checklist_id" class="taskItem">
                  <label class="checkRow">
                    <input
                      type="checkbox"
                      class="cb"
                      :checked="r.is_checked"
                      @change="toggleCheck(r.checklist_id)"
                    />
                    <div class="txt">
                      <div class="t1">{{ r.item_name }}</div>
                      <div class="t2">
                        ID {{ r.checklist_id }} •
                        <span class="mono">{{ r.checked_at || "not checked" }}</span>
                      </div>
                    </div>
                  </label>

                  <span class="pill mini" :class="pillClass(r)">{{ pillStatus(r) }}</span>
                </div>
              </div>
            </div>
          </section>

          <footer class="drawerFoot">
            <VaButton preset="secondary" @click="closeDrawer">Close</VaButton>
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
.headBtns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* stats */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
@media (max-width: 760px) {
  .stats { grid-template-columns: 1fr; }
}
.stat {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  padding: 14px;
}
.stat.ok { background: #ecfdf5; border-color: #bbf7d0; }
.stat.warn { background: #fffbeb; border-color: #fde68a; }
.k {
  font-size: 12px;
  color: #64748b;
  font-weight: 900;
}
.v {
  margin-top: 6px;
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
}

/* filters */
.filters {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
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
.rowHover:hover td { background: #fafcff; }

.right { text-align: right; }
.main { font-weight: 900; color: #0f172a; font-size: 13px; }
.sub { margin-top: 4px; font-size: 12px; color: #64748b; font-weight: 800; }
.itemName { font-weight: 900; color: #0f172a; font-size: 13px; }
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace;
  font-size: 12px;
  color: #334155;
}
.btns { display: inline-flex; gap: 8px; justify-content: flex-end; }
.empty {
  text-align: center;
  padding: 20px !important;
  font-weight: 800;
  color: #64748b;
}

.link {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 900;
  color: #1d4ed8;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
}

/* pills */
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
.pill.mini { padding: 5px 9px; }

/* overlay drawer */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: start center;
  padding: 18px;
}
.drawer {
  width: min(980px, 100%);
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.22);
  overflow: hidden;
  margin-top: 22px;
  max-height: 90vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}
.drawerHead {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.drawerTitle { font-size: 16px; font-weight: 900; color: #0f172a; }
.drawerSub { margin-top: 2px; font-size: 12px; font-weight: 800; color: #64748b; }
.drawerBtns { display: flex; gap: 10px; flex-wrap: wrap; }

.drawerBody { padding: 16px; overflow: auto; }
.drawerFoot {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ✅ slideDown target */
.drawerInner { display: none; }

.emptyBox {
  text-align: center;
  padding: 18px;
  font-weight: 900;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
}

/* task list */
.taskList { display: grid; gap: 10px; }
.taskItem {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fbfcfe;
}
.checkRow {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  width: 100%;
}
.cb {
  width: 18px;
  height: 18px;
  margin-top: 2px;
}
.txt { display: grid; gap: 4px; }
.t1 { font-weight: 900; color: #0f172a; }
.t2 { font-size: 12px; font-weight: 800; color: #64748b; }

/* Vuestic polish */
:deep(.va-input__container),
:deep(.va-select__container) {
  border-radius: 10px;
  background: #f9fafb;
}
:deep(.va-button) {
  border-radius: 10px;
  font-weight: 800;
}
</style>
