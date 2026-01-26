<script setup>
import { ref, computed, nextTick, watch } from "vue"
import $ from "jquery"
import { housekeeping_performance as seed } from "@/data/housekeeping/housekeeping_Performance"

const rows = ref(seed.map((x) => ({ ...x })))

// filters
const q = ref("")
const role = ref("")
const sort = ref("score_desc")

const safe = (v) => (v ?? "").toString().toLowerCase()

const roleOptions = computed(() => {
  const s = new Set()
  rows.value.forEach((r) => s.add(r.role || ""))
  return ["", ...Array.from(s).filter(Boolean)]
})

const score = (r) => {
  // simple score for UI (you can change)
  const compRate = r.total_tasks ? (r.completed_tasks / r.total_tasks) * 100 : 0
  const onTime = Number(r.on_time_rate || 0)
  const speed = Math.max(0, 100 - Number(r.avg_minutes_per_task || 0)) // faster = higher
  return Math.round(compRate * 0.45 + onTime * 0.45 + speed * 0.1)
}

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.staff_name).includes(key) ||
      safe(r.role).includes(key) ||
      safe(r.staff_id).includes(key)

    const okRole = !role.value || r.role === role.value
    return hit && okRole
  })

  if (sort.value === "score_desc") list.sort((a, b) => score(b) - score(a))
  if (sort.value === "score_asc") list.sort((a, b) => score(a) - score(b))
  if (sort.value === "name") list.sort((a, b) => safe(a.staff_name).localeCompare(safe(b.staff_name)))
  if (sort.value === "tasks_desc") list.sort((a, b) => (b.total_tasks || 0) - (a.total_tasks || 0))

  return list
})

// stats
const stats = computed(() => {
  const totalStaff = rows.value.length
  const totalTasks = rows.value.reduce((s, r) => s + Number(r.total_tasks || 0), 0)
  const completed = rows.value.reduce((s, r) => s + Number(r.completed_tasks || 0), 0)
  const avgOnTime = totalStaff ? Math.round(rows.value.reduce((s, r) => s + Number(r.on_time_rate || 0), 0) / totalStaff) : 0
  return { totalStaff, totalTasks, completed, avgOnTime }
})

// slideDown details drawer
const open = ref(false)
const selected = ref(null)
const drawerRef = ref(null)

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

function viewStaff(r) {
  selected.value = r
  open.value = true
  slideDownDrawer()
}
function close() {
  slideUpDrawer(() => {
    open.value = false
    selected.value = null
  })
}

watch(open, (v) => (document.body.style.overflow = v ? "hidden" : ""))

// ui helpers
const pct = (n) => `${Math.max(0, Math.min(100, Number(n || 0)))}%`
const barStyle = (n) => ({ width: pct(n) })
const compRate = (r) => (r.total_tasks ? Math.round((r.completed_tasks / r.total_tasks) * 100) : 0)

function medal(r) {
  const s = score(r)
  if (s >= 90) return { t: "EXCELLENT", cls: "bg-emerald-50 border-emerald-200 text-emerald-800" }
  if (s >= 75) return { t: "GOOD", cls: "bg-sky-50 border-sky-200 text-sky-800" }
  if (s >= 60) return { t: "OK", cls: "bg-amber-50 border-amber-200 text-amber-900" }
  return { t: "NEEDS HELP", cls: "bg-rose-50 border-rose-200 text-rose-800" }
}
function exportCSV() {
  const data = filtered.value || []
  if (!data.length) return alert("No data to export.")

  const headers = [
    "staff_name",
    "role",
    "total_tasks",
    "completed_tasks",
    "pending_tasks",
    "skipped_tasks",
    "on_time_rate",
    "avg_minutes_per_task",
    "last_activity",
    "score",
  ]

  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`
  const body = data.map((r) => [
    r.staff_name,
    r.role,
    r.total_tasks,
    r.completed_tasks,
    r.pending_tasks,
    r.skipped_tasks,
    r.on_time_rate,
    r.avg_minutes_per_task,
    r.last_activity,
    score(r),
  ])

  const csv = [headers.join(","), ...body.map((row) => row.map(esc).join(","))].join("\n")

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
        <h1>Housekeeping Performance</h1>
        <p>Staff score • completion • on-time • speed • slide-down details</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="refresh" @click="q=''; role=''; sort='score_desc'">
          Reset
        </VaButton>
        <VaButton color="primary" icon="insights" @click="exportCSV">
          Export
        </VaButton>
      </div>
    </div>

    <!-- summary -->
    <div class="stats">
      <div class="stat">
        <div class="k">Total Staff</div>
        <div class="v">{{ stats.totalStaff }}</div>
      </div>
      <div class="stat ok">
        <div class="k">Completed Tasks</div>
        <div class="v">{{ stats.completed }} / {{ stats.totalTasks }}</div>
      </div>
      <div class="stat blue">
        <div class="k">Avg On-Time Rate</div>
        <div class="v">{{ stats.avgOnTime }}%</div>
      </div>
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search staff name / role / id..." />
      <VaSelect v-model="role" :options="roleOptions" label="Role" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Top Score', value: 'score_desc' },
          { text: 'Low Score', value: 'score_asc' },
          { text: 'Name A-Z', value: 'name' },
          { text: 'Most Tasks', value: 'tasks_desc' },
        ]"
        text-by="text"
        value-by="value"
        label="Sort"
      />
    </VaCard>

    <!-- cards grid -->
    <div class="grid">
      <div v-if="filtered.length === 0" class="emptyCard">
        No performance data found.
      </div>

      <VaCard v-for="r in filtered" :key="r.staff_id" class="card">
        <div class="cardTop">
          <div class="who">
            <div class="avatar">{{ (r.staff_name || "U").slice(0, 1).toUpperCase() }}</div>
            <div>
              <div class="name">{{ r.staff_name }}</div>
              <div class="meta">ID: {{ r.staff_id }} • {{ r.role }}</div>
            </div>
          </div>

          <span class="pill" :class="medal(r).cls">{{ medal(r).t }}</span>
        </div>

        <div class="scoreRow">
          <div>
            <div class="k2">Performance Score</div>
            <div class="score">{{ score(r) }}</div>
          </div>

          <div class="mini">
            <div class="k2">Last Activity</div>
            <div class="mono">{{ r.last_activity || "-" }}</div>
          </div>
        </div>

        <div class="bars">
          <div class="barRow">
            <div class="lbl">
              Completion <b>{{ compRate(r) }}%</b>
            </div>
            <div class="bar">
              <div class="fill" :style="barStyle(compRate(r))"></div>
            </div>
            <div class="sub">
              {{ r.completed_tasks }}/{{ r.total_tasks }} done • {{ r.pending_tasks }} pending • {{ r.skipped_tasks }} skipped
            </div>
          </div>

          <div class="barRow">
            <div class="lbl">
              On-time <b>{{ r.on_time_rate }}%</b>
            </div>
            <div class="bar">
              <div class="fill" :style="barStyle(r.on_time_rate)"></div>
            </div>
            <div class="sub">
              Avg minutes/task: {{ r.avg_minutes_per_task }}
            </div>
          </div>
        </div>

        <div class="types">
          <div class="k2">Tasks by Type</div>
          <div class="chips">
            <span
              v-for="(v, k) in (r.tasks_by_type || {})"
              :key="k"
              class="chip"
            >
              {{ k.replaceAll("_"," ").toUpperCase() }} • {{ v }}
            </span>
          </div>
        </div>

        <div class="actions">
          <VaButton preset="secondary" @click="viewStaff(r)">View Details</VaButton>
          <!-- <VaButton color="success">Assign Task</VaButton> -->
          <VaButton 
            color="success"
            @click="$router.push({
                name: 'admin.housekeeping.create',
                query: { staff: r.staff_name }
            })"
            >
            Assign Task 
          </VaButton>
        </div>
      </VaCard>
    </div>

    <!-- slideDown details modal -->
    <Teleport to="body">
      <div v-if="open" class="overlay" @click="close">
        <div class="drawer" @click.stop>
          <header class="drawerHead">
            <div>
              <div class="drawerTitle">{{ selected?.staff_name || "-" }}</div>
              <div class="drawerSub">ID: {{ selected?.staff_id }} • {{ selected?.role }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="close">Close</VaButton>
          </header>

          <section class="drawerBody">
            <!-- jQuery slideDown target -->
            <div ref="drawerRef" class="drawerInner">
              <div class="detailGrid" v-if="selected">
                <div class="box">
                  <div class="t">Score</div>
                  <div class="big">{{ score(selected) }}</div>
                  <div class="muted">Calculated from completion + on-time + speed</div>
                </div>

                <div class="box">
                  <div class="t">Task Summary</div>
                  <div class="line">
                    <b>Completed:</b> {{ selected.completed_tasks }} / {{ selected.total_tasks }}
                  </div>
                  <div class="line"><b>Pending:</b> {{ selected.pending_tasks }}</div>
                  <div class="line"><b>Skipped:</b> {{ selected.skipped_tasks }}</div>
                </div>

                <div class="box">
                  <div class="t">On-Time</div>
                  <div class="big">{{ selected.on_time_rate }}%</div>
                  <div class="muted">Avg minutes per task: {{ selected.avg_minutes_per_task }}</div>
                </div>

                <div class="box wide">
                  <div class="t">Tasks By Type</div>
                  <div class="chips">
                    <span
                      v-for="(v, k) in (selected.tasks_by_type || {})"
                      :key="k"
                      class="chip"
                    >
                      {{ k.replaceAll("_"," ").toUpperCase() }} • {{ v }}
                    </span>
                  </div>
                </div>

                <div class="box wide">
                  <div class="t">Last Activity</div>
                  <div class="mono">{{ selected.last_activity || "-" }}</div>
                </div>
              </div>
            </div>
          </section>

          <footer class="drawerFoot">
            <VaButton preset="secondary" @click="close">Close</VaButton>
              <VaButton
                color="primary"
                :disabled="!selected?.staff_id"
                @click="
                close();
                $router.push({
                    name: 'admin.housekeeping.staff.tasks',
                    params: { staffId: selected.staff_id },
                })
                "
            >
                View Staff Tasks
            </VaButton>

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
.stat.blue { background: #eff6ff; border-color: #bfdbfe; }
.k { font-size: 12px; color: #64748b; font-weight: 900; }
.v { margin-top: 6px; font-size: 22px; font-weight: 900; color: #0f172a; }

/* filters */
.filters {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
@media (max-width: 1000px) {
  .filters { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .filters { grid-template-columns: 1fr; }
}

/* grid */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 1100px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 760px) {
  .grid { grid-template-columns: 1fr; }
}

.card {
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  padding: 14px;
}
.emptyCard {
  grid-column: 1 / -1;
  background: #fff;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  padding: 18px;
  font-weight: 900;
  color: #64748b;
  text-align: center;
}

/* card top */
.cardTop {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;
}
.who {
  display: flex;
  gap: 10px;
  align-items: center;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #0f172a;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 900;
}
.name { font-weight: 900; color: #0f172a; }
.meta { margin-top: 2px; font-size: 12px; color: #64748b; font-weight: 800; }

.pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid #e2e8f0;
}

/* score row */
.scoreRow {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.k2 { font-size: 12px; color: #64748b; font-weight: 900; }
.score { font-size: 28px; font-weight: 900; color: #1d4ed8; }
.mini { text-align: right; }
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace;
  font-size: 12px;
  color: #334155;
}

/* bars */
.bars { margin-top: 10px; display: grid; gap: 10px; }
.lbl { font-size: 12px; color: #334155; font-weight: 900; display: flex; justify-content: space-between; }
.bar {
  margin-top: 6px;
  height: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.fill { height: 100%; background: #0f172a; border-radius: 999px; }
.sub { margin-top: 6px; font-size: 12px; color: #64748b; font-weight: 800; }

/* types */
.types { margin-top: 12px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.chip {
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

/* actions */
.actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* modal drawer */
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

.detailGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 760px) {
  .detailGrid { grid-template-columns: 1fr; }
}
.box {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fbfcfe;
  padding: 14px;
}
.box.wide { grid-column: 1 / -1; }
.t { font-size: 12px; color: #64748b; font-weight: 900; margin-bottom: 8px; }
.big { font-size: 24px; font-weight: 900; color: #0f172a; }
.muted { margin-top: 6px; font-size: 12px; font-weight: 800; color: #64748b; }
.line { font-size: 13px; font-weight: 800; color: #334155; margin-top: 6px; }

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
