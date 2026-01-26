<script setup>
import { ref, computed, reactive, nextTick, watch } from "vue"
import $ from "jquery"
import { setting_roles as seed } from "@/data/setting/roles"

const rows = ref(seed.map((x) => ({ ...x })))

/* -------------------- filters -------------------- */
const q = ref("")
const status = ref("") // "" | "active" | "inactive"
const sort = ref("newest") // newest | oldest | name | users_desc | users_asc

const safe = (v) => (v ?? "").toString().toLowerCase()

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.role_name).includes(key) ||
      safe(r.display_name).includes(key) ||
      safe(r.description).includes(key)

    const okStatus =
      !status.value ||
      (status.value === "active" ? !!r.is_active : !r.is_active)

    return hit && okStatus
  })

  if (sort.value === "newest") list.sort((a, b) => (b.role_id || 0) - (a.role_id || 0))
  if (sort.value === "oldest") list.sort((a, b) => (a.role_id || 0) - (b.role_id || 0))
  if (sort.value === "name") list.sort((a, b) => safe(a.display_name).localeCompare(safe(b.display_name)))
  if (sort.value === "users_desc") list.sort((a, b) => (b.total_users || 0) - (a.total_users || 0))
  if (sort.value === "users_asc") list.sort((a, b) => (a.total_users || 0) - (b.total_users || 0))

  return list
})

/* -------------------- summary -------------------- */
const stats = computed(() => {
  const total = rows.value.length
  const active = rows.value.filter((r) => !!r.is_active).length
  const system = rows.value.filter((r) => !!r.is_system_role).length
  const users = rows.value.reduce((s, r) => s + Number(r.total_users || 0), 0)
  return { total, active, system, users }
})

/* -------------------- helpers -------------------- */
const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")
const badge = (r) => (r.is_active ? "ACTIVE" : "INACTIVE")

/* -------------------- modal (view/create/edit) + ✅ slideDown -------------------- */
const modalOpen = ref(false)
const modalMode = ref("view") // view | create | edit
const selected = ref(null)

const formWrapRef = ref(null)

const form = reactive({
  role_id: null,
  role_name: "",
  display_name: "",
  description: "",
  is_system_role: false,
  is_active: true,
})

function slideDownForm() {
  nextTick(() => {
    const el = formWrapRef.value
    if (!el) return
    $(el).stop(true, true).css("display", "none").slideDown(260)
  })
}
function slideUpForm(cb) {
  const el = formWrapRef.value
  if (!el) return cb?.()
  $(el).stop(true, true).slideUp(200, () => cb?.())
}

function openModal(mode, r = null) {
  modalMode.value = mode
  selected.value = r

  if (mode === "create") {
    form.role_id = null
    form.role_name = ""
    form.display_name = ""
    form.description = ""
    form.is_system_role = false
    form.is_active = true
  }

  if (mode === "edit" && r) {
    form.role_id = r.role_id
    form.role_name = r.role_name || ""
    form.display_name = r.display_name || ""
    form.description = r.description || ""
    form.is_system_role = !!r.is_system_role
    form.is_active = !!r.is_active
  }

  modalOpen.value = true
  if (mode === "create" || mode === "edit") slideDownForm()
}

function closeModal() {
  if (modalMode.value === "create" || modalMode.value === "edit") {
    slideUpForm(() => {
      modalOpen.value = false
      selected.value = null
    })
  } else {
    modalOpen.value = false
    selected.value = null
  }
}

/* -------------------- actions (demo) -------------------- */
function saveCreate() {
  if (!form.role_name.trim() || !form.display_name.trim()) {
    return alert("Role Name and Display Name are required.")
  }
  const nextId = Math.max(...rows.value.map((x) => x.role_id || 0), 0) + 1

  rows.value.unshift({
    role_id: nextId,
    role_name: form.role_name.trim(),
    display_name: form.display_name.trim(),
    description: form.description.trim(),
    is_system_role: !!form.is_system_role,
    is_active: !!form.is_active,
    created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    total_users: 0,
  })
  closeModal()
}

function saveEdit() {
  if (!form.role_id) return
  if (!form.role_name.trim() || !form.display_name.trim()) {
    return alert("Role Name and Display Name are required.")
  }

  const idx = rows.value.findIndex((x) => x.role_id === form.role_id)
  if (idx === -1) return

  const old = rows.value[idx]
  rows.value.splice(idx, 1, {
    ...old,
    role_name: form.role_name.trim(),
    display_name: form.display_name.trim(),
    description: form.description.trim(),
    is_system_role: !!form.is_system_role,
    is_active: !!form.is_active,
    updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
  })

  closeModal()
}

function toggleActive(r) {
  // Prevent disabling system role from UI (optional)
  if (r.is_system_role) return alert("System roles cannot be disabled.")
  r.is_active = !r.is_active
  r.updated_at = new Date().toISOString().slice(0, 19).replace("T", " ")
}

function resetFilters() {
  q.value = ""
  status.value = ""
  sort.value = "newest"
}

/* lock scroll when modal open */
watch(modalOpen, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Role Settings</h1>
        <p>Manage roles • show users count • create/edit slides down</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="refresh" @click="resetFilters">Reset</VaButton>
        <VaButton 
            color="success" 
            icon="add" 
            @click="$router.push({ name: 'admin.setting.create.role' })"
        >
            New Role
        </VaButton>
      </div>
    </div>

    <!-- stats -->
    <div class="stats">
      <div class="stat">
        <div class="k">Total Roles</div>
        <div class="v">{{ stats.total }}</div>
      </div>
      <div class="stat ok">
        <div class="k">Active</div>
        <div class="v">{{ stats.active }}</div>
      </div>
      <div class="stat blue">
        <div class="k">System Roles</div>
        <div class="v">{{ stats.system }}</div>
      </div>
      <div class="stat">
        <div class="k">Assigned Users</div>
        <div class="v">{{ stats.users }}</div> 
      </div>
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search role / display / description..." />
      <VaSelect v-model="status" :options="['', 'active', 'inactive']" label="Status" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Newest', value: 'newest' },
          { text: 'Oldest', value: 'oldest' },
          { text: 'Name A-Z', value: 'name' },
          { text: 'Users (High)', value: 'users_desc' },
          { text: 'Users (Low)', value: 'users_asc' },
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
              <th>Role</th>
              <th>Description</th>
              <th>Type</th>
              <th>Status</th>
              <th class="right">Users</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="6" class="empty">No roles found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.role_id">
              <td>
                <div class="main">{{ r.display_name }}</div>
                <div class="sub mono">{{ r.role_name }}</div>
              </td>

              <td>
                <div class="desc">{{ r.description || "-" }}</div>
                <div class="sub">Updated: {{ r.updated_at || "-" }}</div>
              </td>

              <td>
                <span class="pill" :class="r.is_system_role ? 'sys' : 'std'">
                  {{ r.is_system_role ? "SYSTEM" : "CUSTOM" }}
                </span>
              </td>

              <td>
                <span class="pill" :class="r.is_active ? 'active' : 'inactive'">
                  {{ badge(r) }}
                </span>
              </td>

              <td class="right">
                <div class="users">{{ r.total_users ?? 0 }}</div>
              </td>

              <td class="right">
                <div class="btns">
                  <VaButton size="small" preset="secondary" @click="openModal('view', r)">View</VaButton>
                  <VaButton 
                    size="small" 
                    color="primary"
                    @click="$router.push({ name: 'admin.setting.create' })"
                    >
                    Edit
                   </VaButton>
                  <VaButton
                    size="small"
                    :color="r.is_active ? 'warning' : 'success'"
                    :disabled="r.is_system_role"
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

    <!-- ===================== MODAL ===================== -->
    <Teleport to="body">
      <div v-if="modalOpen" class="m-wrap" @click="closeModal">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">
                {{
                  modalMode === "create"
                    ? "Create Role"
                    : modalMode === "edit"
                    ? "Edit Role"
                    : "Role Details"
                }}
              </div>
              <div class="m-sub">
                {{
                  modalMode === "view"
                    ? selected?.display_name || "-"
                    : (form.display_name || "New Role")
                }}
              </div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeModal">Close</VaButton>
          </header>

          <section class="m-body">
            <!-- VIEW -->
            <div v-if="modalMode === 'view' && selected" class="viewGrid">
              <div class="box">
                <div class="t">Role</div>
                <div class="big">{{ selected.display_name }}</div>
                <div class="mono sub">{{ selected.role_name }}</div>
              </div>

              <div class="box">
                <div class="t">Status</div>
                <div class="chips">
                  <span class="pill" :class="selected.is_active ? 'active' : 'inactive'">
                    {{ selected.is_active ? "ACTIVE" : "INACTIVE" }}
                  </span>
                  <span class="pill" :class="selected.is_system_role ? 'sys' : 'std'">
                    {{ selected.is_system_role ? "SYSTEM" : "CUSTOM" }}
                  </span>
                </div>
                <div class="sub mt">Users: <b>{{ selected.total_users ?? 0 }}</b></div>
              </div>

              <div class="box wide">
                <div class="t">Description</div>
                <div class="desc">{{ selected.description || "-" }}</div>
              </div>

              <div class="box">
                <div class="t">Created</div>
                <div class="mono">{{ selected.created_at || "-" }}</div>
              </div>

              <div class="box">
                <div class="t">Updated</div>
                <div class="mono">{{ selected.updated_at || "-" }}</div>
              </div>
            </div>

            <!-- CREATE / EDIT (slideDown) -->
            <div v-else ref="formWrapRef" class="formWrap">
              <div class="formGrid">
                <VaInput v-model="form.role_name" label="Role Name *" placeholder="ex: reception" />
                <VaInput v-model="form.display_name" label="Display Name *" placeholder="ex: Reception Staff" />

                <VaTextarea
                  v-model="form.description"
                  class="wide"
                  label="Description"
                  :max-rows="3"
                  placeholder="What can this role do?"
                />

                <div class="switches wide">
                  <div class="sw">
                    <div>
                      <div class="swTitle">System Role</div>
                      <div class="swHint">Protected role (cannot be disabled in UI)</div>
                    </div>
                    <VaSwitch v-model="form.is_system_role" />
                  </div>

                  <div class="sw">
                    <div>
                      <div class="swTitle">Active</div>
                      <div class="swHint">Allow staff to use this role</div>
                    </div>
                    <VaSwitch v-model="form.is_active" />
                  </div>
                </div>

                <div class="quickTips wide">
                  <div class="qtTitle">Quick Tips</div>
                  <ul>
                    <li><b>Role Name</b> should be lowercase and unique (example: <code>housekeeping</code>).</li>
                    <li><b>Display Name</b> is what you show in UI (example: Housekeeping Staff).</li>
                    <li>Use <b>System Role</b> only for roles like Admin.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="closeModal">Cancel</VaButton>

            <template v-if="modalMode === 'view'">
              <VaButton color="primary" @click="openModal('edit', selected)">Edit</VaButton>
            </template>

            <template v-else-if="modalMode === 'create'">
              <VaButton color="success" icon="save" @click="saveCreate">Save Role</VaButton>
            </template>

            <template v-else>
              <VaButton color="success" icon="save" @click="saveEdit">Save Changes</VaButton>
            </template>
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
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* stats */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
@media (max-width: 1000px) {
  .stats {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 520px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
.stat {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 12px 14px;
}
.stat.ok {
  border-color: #bbf7d0;
  background: #f0fdf4;
}
.stat.blue {
  border-color: #bfdbfe;
  background: #eff6ff;
}
.k {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
}
.v {
  margin-top: 6px;
  font-size: 22px;
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
.desc {
  font-size: 12px;
  color: #334155;
  font-weight: 800;
  max-width: 520px;
}
.users {
  font-weight: 900;
  color: #0f172a;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;
}
.btns {
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.empty {
  text-align: center;
  padding: 20px !important;
  font-weight: 800;
  color: #64748b;
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
.pill.active {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #166534;
}
.pill.inactive {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}
.pill.sys {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #0f172a;
}
.pill.std {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #9a3412;
}

/* modal */
.m-wrap {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  padding: 18px;
}
.m {
  width: min(980px, 100%);
  max-height: 95vh;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}
.m-head {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.m-title {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.m-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}
.m-body {
  padding: 16px;
  overflow: auto;
  max-height: calc(92vh - 118px);
}
.m-foot {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fff;
}

/* view */
.viewGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 760px) {
  .viewGrid {
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
  font-weight: 800;
  margin-bottom: 8px;
}
.big {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.mt {
  margin-top: 8px;
}

/* create/edit (slideDown target) */
.formWrap {
  display: none; /* important for jQuery slideDown */
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
.switches {
  border: 1px solid #eef2f6;
  background: #fbfcfe;
  border-radius: 14px;
  padding: 12px;
  display: grid;
  gap: 10px;
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
  font-size: 12px;
}
.swHint {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}

/* Quick Tips (styled) */
.quickTips {
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px;
}
.qtTitle {
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 8px;
}
.quickTips ul {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  font-weight: 800;
  font-size: 12px;
}
.quickTips li {
  margin: 6px 0;
}
.quickTips code {
  background: #fff;
  border: 1px solid #e2e8f0;
  padding: 2px 6px;
  border-radius: 8px;
}

/* Vuestic polish */
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
