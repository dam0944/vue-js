<script setup>
import { ref, computed, reactive, nextTick, watch } from "vue"
import $ from "jquery"
import { payment_method as seed } from "@/data/setting/payment_method"

const rows = ref(seed.map((x) => ({ ...x })))

// filters
const q = ref("")
const activeF = ref("") // "" | "active" | "inactive"
const sort = ref("label")

const safe = (v) => (v ?? "").toString().toLowerCase()

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.label).includes(key) ||
      safe(r.code).includes(key) ||
      safe(r.db_value).includes(key) ||
      safe(r.description).includes(key)

    const okActive =
      activeF.value === ""
        ? true
        : Boolean(r.is_active) === (activeF.value === "active")

    return hit && okActive
  })

  if (sort.value === "label") list.sort((a, b) => safe(a.label).localeCompare(safe(b.label)))
  if (sort.value === "code") list.sort((a, b) => safe(a.code).localeCompare(safe(b.code)))
  if (sort.value === "db") list.sort((a, b) => safe(a.db_value).localeCompare(safe(b.db_value)))
  if (sort.value === "active") list.sort((a, b) => Number(!!b.is_active) - Number(!!a.is_active))

  return list
})

const stats = computed(() => {
  const total = rows.value.length
  const active = rows.value.filter((r) => r.is_active).length
  return { total, active }
})

// slideDown modal (one form for create/edit)
const modalOpen = ref(false)
const mode = ref("create") // create | edit
const selected = ref(null)
const panelRef = ref(null)

const form = reactive({
  code: "",
  label: "",
  db_value: "cash",
  icon: "payments",
  description: "",
  is_active: true,
})

function resetForm() {
  form.code = ""
  form.label = ""
  form.db_value = "cash"
  form.icon = "payments"
  form.description = ""
  form.is_active = true
}

const dbEnumOptions = [
  "cash",
  "credit_card",
  "debit_card",
  "bank_transfer",
  "mobile_payment",
  "check",
  "other",
]

function openCreate() {
  mode.value = "create"
  selected.value = null
  resetForm()
  modalOpen.value = true
  slideDownPanel()
}

function openEdit(r) {
  mode.value = "edit"
  selected.value = r
  form.code = r.code || ""
  form.label = r.label || ""
  form.db_value = r.db_value || "cash"
  form.icon = r.icon || "payments"
  form.description = r.description || ""
  form.is_active = !!r.is_active
  modalOpen.value = true
  slideDownPanel()
}

function closeModal() {
  slideUpPanel(() => {
    modalOpen.value = false
    selected.value = null
  })
}

function slideDownPanel() {
  nextTick(() => {
    const el = panelRef.value
    if (!el) return
    $(el).stop(true, true).css("display", "none").slideDown(240)
  })
}
function slideUpPanel(cb) {
  const el = panelRef.value
  if (!el) return cb?.()
  $(el).stop(true, true).slideUp(200, () => cb?.())
}

const canSave = computed(() => {
  return String(form.code).trim() && String(form.label).trim() && String(form.db_value).trim()
})

function save() {
  if (!canSave.value) return alert("Please fill Code, Label, and DB Value.")

  const payload = {
    code: String(form.code).trim(),
    label: String(form.label).trim(),
    db_value: String(form.db_value).trim(),
    icon: String(form.icon || "").trim() || "payments",
    description: String(form.description || "").trim(),
    is_active: !!form.is_active,
  }

  if (mode.value === "create") {
    if (rows.value.some((x) => safe(x.code) === safe(payload.code))) {
      return alert("Code already exists. Please use another code.")
    }
    rows.value.unshift(payload)
  } else {
    const idx = rows.value.findIndex((x) => x === selected.value)
    if (idx === -1) return
    rows.value.splice(idx, 1, { ...rows.value[idx], ...payload })
  }

  closeModal()
}

function toggleActive(r) {
  r.is_active = !r.is_active
}

function resetFilters() {
  q.value = ""
  activeF.value = ""
  sort.value = "label"
}

function exportCSV() {
  const header = ["code", "label", "db_value", "icon", "description", "is_active"]
  const toCSV = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`
  const lines = [
    header.join(","),
    ...filtered.value.map((r) =>
      [
        r.code,
        r.label,
        r.db_value,
        r.icon,
        r.description,
        r.is_active ? 1 : 0,
      ].map(toCSV).join(",")
    ),
  ]

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "payment_methods.csv"
  a.click()
  URL.revokeObjectURL(url)
}

watch(modalOpen, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Payment Methods</h1>
        <p>POS methods • map UI code → DB enum • create/edit with jQuery slideDown</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="refresh" @click="resetFilters">Reset</VaButton>
        <VaButton preset="secondary" icon="download" @click="exportCSV">Export</VaButton>
        <VaButton color="success" icon="add" @click="openCreate">New Method</VaButton>
      </div>
    </div>

    <!-- summary -->
    <div class="stats">
      <div class="stat">
        <div class="k">Total</div>
        <div class="v">{{ stats.total }}</div>
      </div>
      <div class="stat ok">
        <div class="k">Active</div>
        <div class="v">{{ stats.active }}</div>
      </div>
      <div class="stat blue">
        <div class="k">DB ENUM</div>
        <div class="v">{{ dbEnumOptions.length }} types</div>
      </div>
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search label / code / db value..." />
      <VaSelect v-model="activeF" :options="['', 'active', 'inactive']" label="Status" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Label A-Z', value: 'label' },
          { text: 'Code', value: 'code' },
          { text: 'DB Value', value: 'db' },
          { text: 'Active First', value: 'active' },
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
              <th>Method</th>
              <th>UI Code</th>
              <th>DB ENUM</th>
              <th>Description</th>
              <th class="center">Status</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="6" class="empty">No payment methods found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.code">
              <td>
                <div class="main">
                  <span class="iconTag">{{ r.icon || "payments" }}</span>
                  {{ r.label }}
                </div>
                <div class="sub mono">icon: {{ r.icon || "-" }}</div>
              </td>

              <td class="mono">{{ r.code }}</td>

              <td>
                <span class="pill soft">{{ r.db_value }}</span>
              </td>

              <td>
                <div class="desc">{{ r.description || "-" }}</div>
              </td>

              <td class="center">
                <span class="pill" :class="r.is_active ? 'ok' : 'danger'">
                  {{ r.is_active ? "ACTIVE" : "INACTIVE" }}
                </span>
              </td>

              <td class="right">
                <div class="btns">
                  <VaButton size="small" color="primary" @click="openEdit(r)">Edit</VaButton>
                  <VaButton
                    size="small"
                    preset="secondary"
                    :color="r.is_active ? 'danger' : 'success'"
                    @click="toggleActive(r)"
                  >
                    {{ r.is_active ? "Disable" : "Enable" }}
                  </VaButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- slideDown modal -->
    <Teleport to="body">
      <div v-if="modalOpen" class="overlay" @click="closeModal">
        <div class="drawer" @click.stop>
          <header class="drawerHead">
            <div>
              <div class="drawerTitle">{{ mode === "create" ? "Create Payment Method" : "Edit Payment Method" }}</div>
              <div class="drawerSub">UI Code → DB ENUM mapping</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeModal">Close</VaButton>
          </header>

          <section class="drawerBody">
            <!-- jQuery slideDown target -->
            <div ref="panelRef" class="drawerInner">
              <div class="formGrid">
                <VaInput v-model="form.label" label="Label *" placeholder="ex: ABA Transfer" />
                <VaInput v-model="form.code" label="UI Code *" placeholder="ex: aba" />

                <VaSelect v-model="form.db_value" :options="dbEnumOptions" label="DB Value (ENUM) *" />

                <VaInput v-model="form.icon" label="Icon (Material)" placeholder="ex: account_balance" />

                <VaTextarea
                  v-model="form.description"
                  class="wide"
                  label="Description"
                  :max-rows="4"
                  placeholder="Explain how cashier should use this method..."
                />

                <div class="switchWrap wide">
                  <div class="sw">
                    <div>
                      <div class="swTitle">Active</div>
                      <div class="swHint">Show this method in POS payment options</div>
                    </div>
                    <VaSwitch v-model="form.is_active" />
                  </div>
                </div>

                <div class="preview wide">
                  <div class="t">Preview</div>
                  <div class="prevRow">
                    <span class="iconTag">{{ form.icon || "payments" }}</span>
                    <div>
                      <div class="main">{{ form.label || "-" }}</div>
                      <div class="sub mono">code: {{ form.code || "-" }} • db: {{ form.db_value || "-" }}</div>
                    </div>
                    <span class="pill" :class="form.is_active ? 'ok' : 'danger'">
                      {{ form.is_active ? "ACTIVE" : "INACTIVE" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer class="drawerFoot">
            <VaButton preset="secondary" @click="closeModal">Cancel</VaButton>
            <VaButton color="success" icon="save" :disabled="!canSave" @click="save">
              {{ mode === "create" ? "Save" : "Save Changes" }}
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
  justify-content: flex-end;
}

/* summary stats */
.stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
@media (max-width: 860px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
.stat {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
}
.stat .k {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}
.stat .v {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
}
.stat.ok .v {
  color: #166534;
}
.stat.blue .v {
  color: #1d4ed8;
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
@media (max-width: 860px) {
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
.center {
  text-align: center;
}
.main {
  font-weight: 900;
  color: #0f172a;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.sub {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;
  font-size: 12px;
  color: #334155;
  white-space: nowrap;
}
.desc {
  color: #334155;
  font-size: 12px;
  line-height: 1.35;
}
.empty {
  text-align: center;
  padding: 20px !important;
  font-weight: 800;
  color: #64748b;
}
.btns {
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* pills + tags */
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
.pill.soft {
  background: #f1f5f9;
}
.pill.ok {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #166534;
}
.pill.danger {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}
.iconTag {
  font-size: 11px;
  font-weight: 900;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 4px 8px;
  border-radius: 999px;
  color: #334155;
}

/* modal */
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
  width: min(960px, 100%);
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

/* slideDown target */
.drawerInner {
  display: none; /* IMPORTANT: jQuery slideDown */
}

.formGrid {
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
.switchWrap {
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px;
}
.sw {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.swTitle {
  font-weight: 900;
  color: #0f172a;
}
.swHint {
  font-size: 12px;
  color: #64748b;
  margin-top: 3px;
}

/* preview */
.preview {
  border: 1px solid #eef2f6;
  background: #fbfcfe;
  border-radius: 14px;
  padding: 12px;
}
.preview .t {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
  margin-bottom: 8px;
}
.prevRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
