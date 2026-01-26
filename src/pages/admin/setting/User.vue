<script setup>
import { ref, computed, reactive, nextTick, watch } from "vue"
import $ from "jquery"

// static (your data)
import { setting_user as seed } from "@/data/setting/user"

// local rows (demo)
const rows = ref(seed.map((x) => ({ ...x })))

/* ---------------- Filters ---------------- */
const q = ref("")
const role = ref("")
const status = ref("")
const sort = ref("newest")

const safe = (v) => (v ?? "").toString().toLowerCase()
const fullName = (u) => `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username || "-"
const label = (s) => (s ? String(s).replaceAll("_", " ").toUpperCase() : "-")

const roleOptions = computed(() => {
  const s = new Set()
  rows.value.forEach((u) => (u.roles || []).forEach((r) => s.add(r)))
  return ["", ...Array.from(s).filter(Boolean)]
})

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((u) => {
    const hit =
      !key ||
      safe(u.username).includes(key) ||
      safe(fullName(u)).includes(key) ||
      safe(u.email).includes(key) ||
      safe(u.phone).includes(key)

    const okStatus = !status.value || u.status === status.value
    const okRole = !role.value || (u.roles || []).includes(role.value)

    return hit && okStatus && okRole
  })

  if (sort.value === "newest") list.sort((a, b) => (b.user_id || 0) - (a.user_id || 0))
  if (sort.value === "oldest") list.sort((a, b) => (a.user_id || 0) - (b.user_id || 0))
  if (sort.value === "name") list.sort((a, b) => safe(fullName(a)).localeCompare(safe(fullName(b))))
  if (sort.value === "username") list.sort((a, b) => safe(a.username).localeCompare(safe(b.username)))

  return list
})

/* ---------------- Modal + slideDown form ---------------- */
const modalOpen = ref(false)
const mode = ref("view") // view | create | edit
const selected = ref(null)

const formWrapRef = ref(null)

const roleAllOptions = computed(() => {
  // if you have roles table later, replace with API
  const s = new Set(["admin", "manager", "reception", "housekeeping", "staff"])
  rows.value.forEach((u) => (u.roles || []).forEach((r) => s.add(r)))
  return Array.from(s)
})

const form = reactive({
  user_id: null,
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  profile_image: "",
  status: "active",
  roles: [],
  created_by: null,
  last_login: null,
})

function slideFormDown() {
  nextTick(() => {
    const el = formWrapRef.value
    if (!el) return
    $(el).stop(true, true).css("display", "none").slideDown(240)
  })
}
function slideFormUp(cb) {
  const el = formWrapRef.value
  if (!el) return cb?.()
  $(el).stop(true, true).slideUp(200, () => cb?.())
}

function openModal(m, u = null) {
  mode.value = m
  selected.value = u

  if (m === "create") {
    form.user_id = null
    form.username = ""
    form.email = ""
    form.first_name = ""
    form.last_name = ""
    form.phone = ""
    form.profile_image = ""
    form.status = "active"
    form.roles = []
    form.created_by = 1
    form.last_login = null
  }

  if (m === "edit" && u) {
    form.user_id = u.user_id
    form.username = u.username || ""
    form.email = u.email || ""
    form.first_name = u.first_name || ""
    form.last_name = u.last_name || ""
    form.phone = u.phone || ""
    form.profile_image = u.profile_image || ""
    form.status = u.status || "active"
    form.roles = Array.isArray(u.roles) ? [...u.roles] : []
    form.created_by = u.created_by ?? null
    form.last_login = u.last_login ?? null
  }

  modalOpen.value = true
  if (m === "create" || m === "edit") slideFormDown()
}

function closeModal() {
  if (mode.value === "create" || mode.value === "edit") {
    slideFormUp(() => {
      modalOpen.value = false
      selected.value = null
    })
  } else {
    modalOpen.value = false
    selected.value = null
  }
}

/* ---------------- Save (demo local) ---------------- */
const canSave = computed(() => {
  return (
    String(form.username).trim() &&
    String(form.email).trim() &&
    String(form.first_name).trim() &&
    String(form.last_name).trim()
  )
})

function saveCreate() {
  if (!canSave.value) return alert("Please fill required fields.")
  const nextId = Math.max(...rows.value.map((x) => x.user_id || 0), 0) + 1

  rows.value.unshift({
    user_id: nextId,
    username: form.username,
    email: form.email,
    first_name: form.first_name,
    last_name: form.last_name,
    phone: form.phone || null,
    profile_image: form.profile_image || null,
    status: form.status,
    created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    last_login: null,
    created_by: form.created_by ?? null,
    roles: [...(form.roles || [])],
  })

  closeModal()
}

function saveEdit() {
  if (!canSave.value) return alert("Please fill required fields.")
  const idx = rows.value.findIndex((x) => x.user_id === form.user_id)
  if (idx === -1) return

  const old = rows.value[idx]
  rows.value.splice(idx, 1, {
    ...old,
    username: form.username,
    email: form.email,
    first_name: form.first_name,
    last_name: form.last_name,
    phone: form.phone || null,
    profile_image: form.profile_image || null,
    status: form.status,
    updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    roles: [...(form.roles || [])],
  })

  closeModal()
}

/* ---------------- Export CSV ---------------- */
function exportCSV() {
  const cols = ["user_id", "username", "email", "first_name", "last_name", "phone", "status", "roles"]
  const lines = [
    cols.join(","),
    ...filtered.value.map((u) =>
      [
        u.user_id,
        `"${(u.username || "").replaceAll('"', '""')}"`,
        `"${(u.email || "").replaceAll('"', '""')}"`,
        `"${(u.first_name || "").replaceAll('"', '""')}"`,
        `"${(u.last_name || "").replaceAll('"', '""')}"`,
        `"${(u.phone || "").replaceAll('"', '""')}"`,
        u.status,
        `"${(u.roles || []).join("|")}"`,
      ].join(",")
    ),
  ].join("\n")

  const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

watch(modalOpen, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Users</h1>
        <p>Manage users • roles • status • slide-down create/edit</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="download" @click="exportCSV">Export</VaButton>
        <!-- <VaButton color="success" icon="add" @click="openModal('create')">New User</VaButton> -->
        <VaButton
            color="success"
            icon="add"
            @click="$router.push({ name: 'admin.setting.create' })"
            >
            New User
        </VaButton>
      </div>
    </div>

    <!-- stats -->
    <div class="stats">
      <div class="stat">
        <div class="k">Total</div>
        <div class="v">{{ rows.length }}</div>
      </div>
      <div class="stat ok">
        <div class="k">Active</div>
        <div class="v">{{ rows.filter(x => x.status === 'active').length }}</div>
      </div>
      <div class="stat warn">
        <div class="k">Suspended</div>
        <div class="v">{{ rows.filter(x => x.status === 'suspended').length }}</div>
      </div>
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search username / name / email / phone..." />
      <VaSelect v-model="role" :options="roleOptions" label="Role" />
      <VaSelect v-model="status" :options="['', 'active', 'inactive', 'suspended']" label="Status" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Newest', value: 'newest' },
          { text: 'Oldest', value: 'oldest' },
          { text: 'Name A-Z', value: 'name' },
          { text: 'Username', value: 'username' },
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
              <th>User</th>
              <th>Contact</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Last Login</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="6" class="empty">No users found.</td>
            </tr>

            <tr v-for="u in filtered" :key="u.user_id">
              <td>
                <div class="who">
                  <div class="avatar">
                    {{ (fullName(u) || "U").slice(0, 1).toUpperCase() }}
                  </div>
                  <div>
                    <div class="main">{{ fullName(u) }}</div>
                    <div class="sub">@{{ u.username }}</div>
                  </div>
                </div>
              </td>

              <td>
                <div class="main">{{ u.email }}</div>
                <div class="sub">{{ u.phone || "-" }}</div>
              </td>

              <td>
                <div class="chips">
                  <span v-for="r in (u.roles || [])" :key="r" class="chip soft">
                    {{ label(r) }}
                  </span>
                  <span v-if="!u.roles || u.roles.length === 0" class="chip">-</span>
                </div>
              </td>

              <td>
                <span class="pill" :class="u.status">{{ label(u.status) }}</span>
              </td>

              <td class="mono">{{ u.last_login || "-" }}</td>

              <td class="right">
                <div class="btns">
                  <VaButton size="small" preset="secondary" @click="openModal('view', u)">View</VaButton>
                  <VaButton size="small" color="primary" @click="openModal('edit', u)">Edit</VaButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="modalOpen" class="m-wrap" @click="closeModal">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">
                {{
                  mode === "create" ? "Create User" : mode === "edit" ? "Edit User" : "User Details"
                }}
              </div>
              <div class="m-sub">
                {{ mode === "view" ? (selected?.username || "-") : (form.username || "New User") }}
              </div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeModal">Close</VaButton>
          </header>

          <section class="m-body">
            <!-- VIEW -->
            <div v-if="mode === 'view' && selected" class="viewGrid">
              <div class="card">
                <div class="t">User</div>
                <div class="big">{{ fullName(selected) }}</div>
                <div class="muted">@{{ selected.username }}</div>
              </div>

              <div class="card">
                <div class="t">Contact</div>
                <div class="line"><b>Email:</b> {{ selected.email }}</div>
                <div class="line"><b>Phone:</b> {{ selected.phone || "-" }}</div>
              </div>

              <div class="card">
                <div class="t">Status</div>
                <span class="pill" :class="selected.status">{{ label(selected.status) }}</span>
                <div class="muted mt">Created: {{ selected.created_at || "-" }}</div>
              </div>

              <div class="card wide">
                <div class="t">Roles</div>
                <div class="chips">
                  <span v-for="r in (selected.roles || [])" :key="r" class="chip soft">{{ label(r) }}</span>
                  <span v-if="!selected.roles || selected.roles.length === 0" class="chip">-</span>
                </div>
              </div>
            </div>

            <!-- CREATE / EDIT (slideDown) -->
            <div v-else ref="formWrapRef" class="formWrap">
              <div class="formGrid">
                <VaInput v-model="form.username" label="Username *" placeholder="ex: reception01" />
                <VaInput v-model="form.email" label="Email *" placeholder="ex: user@mail.com" />

                <VaInput v-model="form.first_name" label="First Name *" />
                <VaInput v-model="form.last_name" label="Last Name *" />

                <VaInput v-model="form.phone" label="Phone" placeholder="ex: 012345678" />

                <VaSelect
                  v-model="form.status"
                  :options="['active', 'inactive', 'suspended']"
                  label="Status"
                />

                <VaSelect
                  v-model="form.roles"
                  :options="roleAllOptions"
                  label="Roles"
                  multiple
                />

                <VaInput v-model="form.profile_image" label="Profile Image URL" placeholder="https://..." />

                <div class="summary wide">
                  <div>
                    <div class="t">Preview</div>
                    <div class="main">
                      {{ (form.first_name || '-') }} {{ (form.last_name || '') }}
                      <span class="muted"> • @{{ form.username || '-' }}</span>
                    </div>
                  </div>
                  <div class="chips">
                    <span v-for="r in form.roles" :key="r" class="chip soft">{{ label(r) }}</span>
                    <span v-if="!form.roles.length" class="chip">No roles</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="closeModal">Cancel</VaButton>

            <template v-if="mode === 'view'">
              <VaButton color="primary" @click="openModal('edit', selected)">Edit</VaButton>
            </template>

            <template v-else-if="mode === 'create'">
              <VaButton color="success" icon="save" :disabled="!canSave" @click="saveCreate">Save</VaButton>
            </template>

            <template v-else>
              <VaButton color="success" icon="save" :disabled="!canSave" @click="saveEdit">Save Changes</VaButton>
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
@media (max-width: 760px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
.stat {
  border: 1px solid #eef2f6;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
}
.stat .k {
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
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
.stat.warn .v {
  color: #854d0e;
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
  .filters {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 520px) {
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
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;
  font-size: 12px;
  color: #334155;
  white-space: nowrap;
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

/* user cell */
.who {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #0f172a;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
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

/* status pill */
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
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #475569;
}
.pill.suspended {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
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
.card {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fbfcfe;
  padding: 14px;
}
.card.wide {
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
.line {
  margin: 6px 0 0;
}
.muted {
  color: #64748b;
  font-weight: 800;
}
.mt {
  margin-top: 8px;
}

/* form */
.formWrap {
  display: none; /* jQuery slideDown target */
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
.summary {
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.summary.wide {
  grid-column: 1 / -1;
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
