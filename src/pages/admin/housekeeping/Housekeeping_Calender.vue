<script setup>
import { ref, computed, nextTick, watch } from "vue"
import $ from "jquery"
import { housekeeping_Calender as seed } from "@/data/housekeeping/housekeeping_Calender"

const tasks = ref(seed.map((x) => ({ ...x })))

/** ---------- month state ---------- */
const today = new Date()
const month = ref(today.getMonth()) // 0-11
const year = ref(today.getFullYear())

const monthName = computed(() =>
  new Date(year.value, month.value, 1).toLocaleString("en", { month: "long" })
)

function pad(n) {
  return String(n).padStart(2, "0")
}
function toYMD(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function fromYMD(s) {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** ---------- calendar grid ---------- */
const firstDay = computed(() => new Date(year.value, month.value, 1))
const startDow = computed(() => firstDay.value.getDay()) // 0 Sun -> 6 Sat
const daysInMonth = computed(() => new Date(year.value, month.value + 1, 0).getDate())

const gridDays = computed(() => {
  const cells = []
  // prev month padding
  const prevLast = new Date(year.value, month.value, 0).getDate()
  for (let i = startDow.value - 1; i >= 0; i--) {
    const d = new Date(year.value, month.value - 1, prevLast - i)
    cells.push({ date: toYMD(d), inMonth: false })
  }
  // current month
  for (let d = 1; d <= daysInMonth.value; d++) {
    const dt = new Date(year.value, month.value, d)
    cells.push({ date: toYMD(dt), inMonth: true })
  }
  // next month padding to complete weeks
  while (cells.length % 7 !== 0) {
    const last = fromYMD(cells[cells.length - 1].date)
    last.setDate(last.getDate() + 1)
    cells.push({ date: toYMD(last), inMonth: false })
  }
  return cells
})

/** ---------- filters ---------- */
const q = ref("")
const status = ref("")
const taskType = ref("")
const priority = ref("")

const safe = (v) => (v ?? "").toString().toLowerCase()
const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")

const statusOptions = ["", "pending", "in_progress", "completed", "skipped"]
const typeOptions = ["", "checkout_cleaning", "daily_cleaning", "deep_cleaning", "turndown", "inspection"]
const priorityOptions = ["", "low", "normal", "high", "urgent"]

const filteredTasks = computed(() => {
  const key = safe(q.value)

  return tasks.value.filter((t) => {
    const hit =
      !key ||
      safe(t.task_id).includes(key) ||
      safe(t.room_id).includes(key) ||
      safe(t.notes).includes(key)

    const okStatus = !status.value || t.status === status.value
    const okType = !taskType.value || t.task_type === taskType.value
    const okPri = !priority.value || t.priority === priority.value
    return hit && okStatus && okType && okPri
  })
})

const tasksByDate = computed(() => {
  const map = new Map()
  for (const t of filteredTasks.value) {
    const d = t.task_date
    if (!map.has(d)) map.set(d, [])
    map.get(d).push(t)
  }
  // sort inside each day: urgent/high first, then id
  const priRank = { urgent: 4, high: 3, normal: 2, low: 1 }
  for (const [k, arr] of map.entries()) {
    arr.sort((a, b) => (priRank[b.priority] || 0) - (priRank[a.priority] || 0) || (a.task_id - b.task_id))
  }
  return map
})

/** ---------- mini slideDown drawer (day details) ---------- */
const drawerOpen = ref(false)
const selectedDate = ref("")
const dayTasks = computed(() => tasksByDate.value.get(selectedDate.value) || [])

const drawerRef = ref(null)

function slideDownDrawer() {
  nextTick(() => {
    const el = drawerRef.value
    if (!el) return
    $(el).stop(true, true).css("display", "none").slideDown(220)
  })
}
function slideUpDrawer(cb) {
  const el = drawerRef.value
  if (!el) return cb?.()
  $(el).stop(true, true).slideUp(180, () => cb?.())
}

function openDay(date) {
  selectedDate.value = date
  drawerOpen.value = true
  slideDownDrawer()
}
function closeDay() {
  slideUpDrawer(() => {
    drawerOpen.value = false
    selectedDate.value = ""
  })
}

function prevMonth() {
  if (month.value === 0) {
    month.value = 11
    year.value -= 1
  } else month.value -= 1
}
function nextMonth() {
  if (month.value === 11) {
    month.value = 0
    year.value += 1
  } else month.value += 1
}

const isToday = (d) => d === toYMD(new Date())

function chipClass(t) {
  const st = t.status
  const pr = t.priority
  return {
    "chip st-pending": st === "pending",
    "chip st-progress": st === "in_progress",
    "chip st-done": st === "completed",
    "chip st-skip": st === "skipped",
    "chip pr-urgent": pr === "urgent",
    "chip pr-high": pr === "high",
    "chip pr-normal": pr === "normal",
    "chip pr-low": pr === "low",
  }
}

// lock scroll on full overlay drawer (mobile nice)
watch(drawerOpen, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Housekeeping Calendar</h1>
        <p>Monthly view • click a day to see tasks (slideDown)</p>
      </div>

      <div class="nav">
        <VaButton preset="secondary" icon="chevron_left" @click="prevMonth">Prev</VaButton>
        <div class="month">
          <div class="m1">{{ monthName }} {{ year }}</div>
          <div class="m2">Tap any day to view details</div>
        </div>
        <VaButton preset="secondary" icon="chevron_right" @click="nextMonth">Next</VaButton>
      </div>
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search room / task id / notes..." />
      <VaSelect v-model="status" :options="statusOptions" label="Status" />
      <VaSelect v-model="taskType" :options="typeOptions" label="Task Type" />
      <VaSelect v-model="priority" :options="priorityOptions" label="Priority" />
    </VaCard>

    <!-- calendar -->
    <VaCard class="calCard">
      <div class="dow">
        <div class="d">Sun</div>
        <div class="d">Mon</div>
        <div class="d">Tue</div>
        <div class="d">Wed</div>
        <div class="d">Thu</div>
        <div class="d">Fri</div>
        <div class="d">Sat</div>
      </div>

      <div class="grid">
        <button
          v-for="cell in gridDays"
          :key="cell.date"
          class="cell"
          :class="{ muted: !cell.inMonth, today: isToday(cell.date) }"
          @click="openDay(cell.date)"
        >
          <div class="cellTop">
            <div class="num">{{ Number(cell.date.slice(-2)) }}</div>
            <div class="count" v-if="(tasksByDate.get(cell.date)?.length || 0) > 0">
              {{ tasksByDate.get(cell.date).length }}
            </div>
          </div>

          <div class="cellBody">
            <div class="mini" v-for="t in (tasksByDate.get(cell.date) || []).slice(0, 3)" :key="t.task_id">
              <span class="dot" :class="t.status"></span>
              <span class="txt">R{{ t.room_id }} • {{ label(t.task_type) }}</span>
            </div>

            <div v-if="(tasksByDate.get(cell.date)?.length || 0) > 3" class="more">
              +{{ (tasksByDate.get(cell.date)?.length || 0) - 3 }} more
            </div>
          </div>
        </button>
      </div>
    </VaCard>

    <!-- slideDown day drawer -->
    <Teleport to="body">
      <div v-if="drawerOpen" class="drawerWrap" @click="closeDay">
        <div class="drawer" @click.stop>
          <header class="drawerHead">
            <div>
              <div class="drawerTitle">Tasks on {{ selectedDate }}</div>
              <div class="drawerSub">{{ dayTasks.length }} task(s)</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeDay">Close</VaButton>
          </header>

          <div class="drawerBody">
            <!-- ✅ slideDown target -->
            <div ref="drawerRef" class="drawerInner">
              <div v-if="dayTasks.length === 0" class="empty">
                No tasks for this date.
              </div>

              <div v-else class="list">
                <div v-for="t in dayTasks" :key="t.task_id" class="row">
                  <div class="left">
                    <div class="title">
                      Room <b>#{{ t.room_id }}</b> • {{ label(t.task_type) }}
                    </div>
                    <div class="sub">
                      Task #{{ t.task_id }} • Assigned:
                      <b>{{ t.assigned_to ? `User #${t.assigned_to}` : "-" }}</b>
                    </div>
                    <div class="note" v-if="t.notes">{{ t.notes }}</div>
                  </div>

                  <div class="right">
                    <span class="pill" :class="chipClass(t)">{{ label(t.status) }}</span>
                    <span class="pill" :class="chipClass({ ...t, status: 'x', priority: t.priority })">
                      {{ label(t.priority) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="drawerFoot">
            <VaButton preset="secondary" @click="closeDay">Close</VaButton>
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
.nav {
  display: flex;
  align-items: center;
  gap: 10px;
}
.month {
  text-align: center;
  min-width: 180px;
}
.m1 {
  font-weight: 900;
  color: #0f172a;
}
.m2 {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
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

/* calendar */
.calCard {
  border-radius: 14px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}
.dow {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #fbfcfe;
  border-bottom: 1px solid #eef2f6;
}
.d {
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 900;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.cell {
  min-height: 120px;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  padding: 10px 10px 12px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: 0.15s ease;
}
.cell:hover { background: #fafcff; }
.cell.muted { background: #fbfcfe; color: #94a3b8; }
.cell.today { outline: 2px solid rgba(29, 78, 216, 0.15); outline-offset: -2px; }
.cellTop {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.num {
  font-weight: 900;
  color: #0f172a;
}
.count {
  display: inline-flex;
  min-width: 22px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  align-items: center;
  justify-content: center;
}
.cellBody { margin-top: 8px; display: grid; gap: 6px; }
.mini { display: flex; align-items: center; gap: 8px; }
.dot {
  width: 8px;
  height: 8px;
  border-radius: 99px;
  background: #cbd5e1;
}
.dot.pending { background: #94a3b8; }
.dot.in_progress { background: #f59e0b; }
.dot.completed { background: #22c55e; }
.dot.skipped { background: #ef4444; }
.txt {
  font-size: 11px;
  font-weight: 800;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.more {
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
}

/* drawer */
.drawerWrap {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: start center;
  padding: 18px;
}
.drawer {
  width: min(960px, 100%);
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

.empty {
  text-align: center;
  padding: 18px;
  font-weight: 900;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
}

/* list rows */
.list { display: grid; gap: 10px; }
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fbfcfe;
}
.title { font-weight: 900; color: #0f172a; }
.sub { margin-top: 4px; font-size: 12px; color: #64748b; font-weight: 800; }
.note { margin-top: 8px; font-size: 12px; color: #334155; font-weight: 800; }
.right { display: flex; gap: 8px; align-items: flex-start; flex-wrap: wrap; justify-content: flex-end; }

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
.chip.st-pending { background: #f1f5f9; }
.chip.st-progress { background: #fef9c3; border-color: #fde68a; color: #854d0e; }
.chip.st-done { background: #dcfce7; border-color: #bbf7d0; color: #166534; }
.chip.st-skip { background: #fee2e2; border-color: #fecaca; color: #991b1b; }
.chip.pr-urgent { background: #fee2e2; border-color: #fecaca; color: #991b1b; }
.chip.pr-high { background: #fef9c3; border-color: #fde68a; color: #854d0e; }
.chip.pr-normal { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
.chip.pr-low { background: #f1f5f9; }

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
