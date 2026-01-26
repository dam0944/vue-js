<script setup>
import { ref, computed, nextTick, watch } from "vue"
import $ from "jquery"
import { reports_guests as seed } from "@/data/report/reports_guests"

const rows = ref(seed.map((x) => ({ ...x })))

// filters
const q = ref("")
const nationality = ref("")
const sort = ref("spent_desc")

const safe = (v) => (v ?? "").toString().toLowerCase()

const nationalityOptions = computed(() => {
  const s = new Set()
  rows.value.forEach((r) => s.add(r.nationality || ""))
  return ["", ...Array.from(s).filter(Boolean)]
})

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.guest_name).includes(key) ||
      safe(r.phone).includes(key)

    const okNat = !nationality.value || r.nationality === nationality.value
    return hit && okNat
  })

  if (sort.value === "spent_desc") list.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
  if (sort.value === "spent_asc") list.sort((a, b) => (a.total_spent || 0) - (b.total_spent || 0))
  if (sort.value === "stays_desc") list.sort((a, b) => (b.total_stays || 0) - (a.total_stays || 0))
  if (sort.value === "name") list.sort((a, b) => safe(a.guest_name).localeCompare(safe(b.guest_name)))
  if (sort.value === "last_visit") list.sort((a, b) => safe(b.last_visit).localeCompare(safe(a.last_visit)))

  return list
})

// summary
const stats = computed(() => {
  const totalGuests = filtered.value.length
  const totalSpent = filtered.value.reduce((s, r) => s + Number(r.total_spent || 0), 0)
  const totalStays = filtered.value.reduce((s, r) => s + Number(r.total_stays || 0), 0)
  const avgSpent = totalGuests ? Math.round((totalSpent / totalGuests) * 100) / 100 : 0
  return { totalGuests, totalSpent, totalStays, avgSpent }
})

// helpers
const money = (n) => `USD ${Number(n || 0).toFixed(2)}`
const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")

function badgeTier(r) {
  const s = Number(r.total_spent || 0)
  if (s >= 1000) return { t: "VIP", cls: "vip" }
  if (s >= 600) return { t: "LOYAL", cls: "loyal" }
  if (s >= 300) return { t: "ACTIVE", cls: "active" }
  return { t: "NEW", cls: "new" }
}

// slideDown drawer
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

function viewGuest(r) {
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

function exportCSV() {
  const data = filtered.value
  if (!data.length) return alert("No data to export.")

  const headers = [
    "guest_name",
    "phone",
    "nationality",
    "total_stays",
    "completed_stays",
    "total_spent",
    "cash_spent",
    "aba_spent",
    "card_spent",
    "last_visit",
  ]

  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`
  const body = data.map((r) => [
    r.guest_name,
    r.phone,
    r.nationality,
    r.total_stays,
    r.completed_stays,
    r.total_spent,
    r.cash_spent,
    r.aba_spent,
    r.card_spent,
    r.last_visit,
  ])

  const csv = [headers.join(","), ...body.map((row) => row.map(esc).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `guest-report-${new Date().toISOString().slice(0, 10)}.csv`
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
        <h1>Guest Report</h1>
        <p>Top spenders • loyalty tiers • filters • slide-down details</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="refresh" @click="q=''; nationality=''; sort='spent_desc'">
          Reset
        </VaButton>
        <VaButton color="primary" icon="download" @click="exportCSV">
          Export
        </VaButton>
      </div>
    </div>

    <!-- summary -->
    <div class="stats">
      <div class="stat">
        <div class="k">Guests</div>
        <div class="v">{{ stats.totalGuests }}</div>
      </div>
      <div class="stat ok">
        <div class="k">Total Spent</div>
        <div class="v">{{ money(stats.totalSpent) }}</div>
      </div>
      <div class="stat blue">
        <div class="k">Total Stays</div>
        <div class="v">{{ stats.totalStays }}</div>
      </div>
      <div class="stat purple">
        <div class="k">Avg / Guest</div>
        <div class="v">{{ money(stats.avgSpent) }}</div>
      </div>
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search guest name / phone..." />
      <VaSelect v-model="nationality" :options="nationalityOptions" label="Nationality" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Spent (High)', value: 'spent_desc' },
          { text: 'Spent (Low)', value: 'spent_asc' },
          { text: 'Most Stays', value: 'stays_desc' },
          { text: 'Name A-Z', value: 'name' },
          { text: 'Last Visit', value: 'last_visit' },
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
              <th>Guest</th>
              <th>Nationality</th>
              <th>Stays</th>
              <th>Completed</th>
              <th>Payments</th>
              <th class="right">Total Spent</th>
              <th class="right">Last Visit</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="8" class="empty">No guests found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.guest_id">
              <td>
                <div class="who">
                  <div class="avatar">{{ (r.guest_name || "G").slice(0,1).toUpperCase() }}</div>
                  <div>
                    <div class="main">
                      {{ r.guest_name }}
                      <span class="tier" :class="badgeTier(r).cls">{{ badgeTier(r).t }}</span>
                    </div>
                    <div class="sub">{{ r.phone || "-" }}</div>
                  </div>
                </div>
              </td>

              <td>
                <span class="pill">{{ r.nationality || "-" }}</span>
              </td>

              <td class="mono">{{ r.total_stays || 0 }}</td>
              <td class="mono">{{ r.completed_stays || 0 }}</td>

              <td>
                <div class="chips">
                  <span class="chip">Cash: {{ money(r.cash_spent) }}</span>
                  <span class="chip soft">ABA: {{ money(r.aba_spent) }}</span>
                  <span class="chip soft">Card: {{ money(r.card_spent) }}</span>
                </div>
              </td>

              <td class="right">
                <div class="main">{{ money(r.total_spent) }}</div>
              </td>

              <td class="right mono">{{ r.last_visit || "-" }}</td>

              <td class="right">
                <VaButton size="small" preset="secondary" @click="viewGuest(r)">View</VaButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- slideDown drawer -->
    <Teleport to="body">
      <div v-if="open" class="overlay" @click="close">
        <div class="drawer" @click.stop>
          <header class="drawerHead">
            <div>
              <div class="drawerTitle">{{ selected?.guest_name || "-" }}</div>
              <div class="drawerSub">{{ selected?.phone || "-" }} • {{ selected?.nationality || "-" }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="close">Close</VaButton>
          </header>

          <section class="drawerBody">
            <div ref="drawerRef" class="drawerInner">
              <div v-if="selected" class="detailGrid">
                <div class="box">
                  <div class="t">Tier</div>
                  <div class="big">
                    <span class="tier bigTier" :class="badgeTier(selected).cls">{{ badgeTier(selected).t }}</span>
                  </div>
                  <div class="muted">Based on total spent</div>
                </div>

                <div class="box">
                  <div class="t">Stays</div>
                  <div class="big">{{ selected.total_stays }}</div>
                  <div class="muted">Completed: {{ selected.completed_stays }}</div>
                </div>

                <div class="box wide">
                  <div class="t">Payment Breakdown</div>
                  <div class="payGrid">
                    <div class="payRow">
                      <div class="k">Cash</div>
                      <div class="v mono">{{ money(selected.cash_spent) }}</div>
                    </div>
                    <div class="payRow">
                      <div class="k">ABA</div>
                      <div class="v mono">{{ money(selected.aba_spent) }}</div>
                    </div>
                    <div class="payRow">
                      <div class="k">Card</div>
                      <div class="v mono">{{ money(selected.card_spent) }}</div>
                    </div>
                    <div class="payRow totalRow">
                      <div class="k">Total</div>
                      <div class="v mono"><b>{{ money(selected.total_spent) }}</b></div>
                    </div>
                  </div>
                </div>

                <div class="box wide">
                  <div class="t">Quick Tips</div>
                  <div class="tips">
                    <div class="tip">Sort by <b>Total Spent</b> to find top spenders.</div>
                    <div class="tip">Use <b>Nationality</b> filter to analyze guest sources.</div>
                    <div class="tip">Check <b>Payment Breakdown</b> to see preferred method.</div>
                    <div class="tip">VIP guests usually have <b>high stays + high spend</b>.</div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          <footer class="drawerFoot">
            <VaButton preset="secondary" @click="close">Close</VaButton>
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
  display: inline-flex;
  gap: 10px;
}

/* stats */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.stat {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}
.stat .k {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.stat .v {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  margin-top: 6px;
}
.stat.ok {
  background: #ecfdf5;
  border-color: #d1fae5;
}
.stat.blue {
  background: #eff6ff;
  border-color: #dbeafe;
}
.stat.purple {
  background: #f5f3ff;
  border-color: #ede9fe;
}

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
@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr;
  }
}

/* table */
.tableCard {
  border-radius: 14px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}
.tableWrap {
  overflow-x: auto;
}
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
.tbl tr:hover td {
  background: #fafcff;
}
.right {
  text-align: right;
}

.who {
  display: flex;
  gap: 10px;
  align-items: center;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  font-weight: 900;
  color: #1d4ed8;
}
.main {
  font-weight: 900;
  color: #0f172a;
  font-size: 13px;
}
.sub {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
  color: #334155;
  white-space: nowrap;
}

.pill {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-weight: 900;
  font-size: 11px;
  color: #334155;
}

/* tiers */
.tier {
  margin-left: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  font-size: 10px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.tier.vip {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #9a3412;
}
.tier.loyal {
  background: #ecfdf5;
  border-color: #bbf7d0;
  color: #166534;
}
.tier.active {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}
.tier.new {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #334155;
}
.bigTier {
  font-size: 12px;
}

/* chips */
.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
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
.chip.soft {
  background: #f1f5f9;
}

/* overlay drawer */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  padding: 18px;
}
.drawer {
  width: min(980px, 100%);
  max-height: 95vh;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.22);
  overflow: hidden;
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
.drawerTitle {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.drawerSub {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}
.drawerBody {
  padding: 16px;
  overflow: auto;
  max-height: calc(92vh - 118px);
}
.drawerFoot {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fff;
}
.drawerInner {
  display: none; /* jQuery slideDown target */
}

/* detail grid */
.detailGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 760px) {
  .detailGrid {
    grid-template-columns: 1fr;
  }
}
.box {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fbfcfe;
  padding: 14px;
}
.box.wide {
  grid-column: 1 / -1;
}
.t {
  font-size: 12px;
  color: #64748b;
  font-weight: 900;
  margin-bottom: 8px;
}
.big {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
}
.muted {
  color: #64748b;
  font-weight: 800;
  margin-top: 4px;
}

/* payment breakdown */
.payGrid {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}
.payRow {
  display: flex;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px dashed #e5e7eb;
}
.payRow:last-child {
  border-bottom: none;
}
.totalRow {
  background: #f8fafc;
}
.payRow .k {
  font-weight: 900;
  color: #0f172a;
}
.payRow .v {
  color: #0f172a;
}

/* ✅ Quick Tips styled (like your screenshot) */
.tips {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 10px;
}
.tip {
  position: relative;
  padding-left: 18px;
  font-size: 13px;
  color: #0f172a;
  line-height: 1.4;
}
.tip::before {
  content: "•";
  position: absolute;
  left: 6px;
  top: 0;
  font-weight: 900;
  color: #1d4ed8;
}
.tip b {
  font-weight: 900;
}

/* vuestic polish */
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
