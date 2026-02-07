<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Settings · Roles & Permissions</h1>
        <p class="subtitle">
          Control what each staff role can access. Assign permissions by module.
        </p>
      </div>

      <div class="header-actions">
        <VaInput
          v-model="roleSearch"
          class="control"
          placeholder="Search role..."
          clearable
        >
          <template #prependInner>
            <VaIcon name="search" color="primary" />
          </template>
        </VaInput>

        <VaButton color="primary" @click="openCreate">
          <VaIcon name="add" class="mr-1" />
          New Role
        </VaButton>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid">
      <!-- Left: Roles -->
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">Roles</div>
          <VaChip size="small" square color="secondary">
            {{ filteredRoles.length }}
          </VaChip>
        </div>

        <div class="role-list">
          <button
            v-for="r in filteredRoles"
            :key="r.role_id"
            class="role-item"
            :class="{ active: selectedRoleId === r.role_id }"
            @click="selectRole(r.role_id)"
          >
            <div class="role-top">
              <div class="role-name">
                {{ r.role_name }}
                <VaChip
                  v-if="!r.is_active"
                  size="small"
                  square
                  color="danger"
                  class="ml-2"
                >
                  inactive
                </VaChip>
              </div>

              <VaIcon
                :name="selectedRoleId === r.role_id ? 'chevron_right' : 'chevron_right'"
                color="secondary"
              />
            </div>

            <div class="role-desc">{{ r.description }}</div>

            <div class="role-meta">
              <span class="pill">{{ r.role_code }}</span>
              <span class="dot"></span>
              <span class="muted">
                {{ countRolePermissions(r) }} permissions
              </span>
            </div>
          </button>

          <div v-if="!filteredRoles.length" class="empty">
            No roles found.
          </div>
        </div>
      </div>

      <!-- Right: Permissions Matrix -->
      <div class="panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">Permissions</div>
            <div class="muted small">
              Selected role: <b>{{ selectedRole?.role_name || "-" }}</b>
            </div>
          </div>

          <div class="panel-actions">
            <VaSelect
              v-model="moduleFilter"
              :options="moduleOptions"
              class="control"
              size="small"
              label="Module"
            />
            <VaInput
              v-model="permSearch"
              class="control"
              size="small"
              placeholder="Search permission..."
              clearable
            >
              <template #prependInner>
                <VaIcon name="tune" color="primary" />
              </template>
            </VaInput>

            <VaButton preset="secondary" @click="openEdit" :disabled="!selectedRole">
              Edit Role
            </VaButton>
          </div>
        </div>

        <!-- Owner full access -->
        <div v-if="selectedRole?.permissions?.includes('*')" class="owner-box">
          <VaIcon name="verified" color="primary" />
          <div>
            <div class="owner-title">Full Access Enabled</div>
            <div class="owner-sub">
              This role has <b>all permissions</b>. (permissions: <code>*</code>)
            </div>
          </div>
        </div>

        <div v-else class="perm-area">
          <div v-if="!selectedRole" class="empty big">
            Select a role to manage permissions.
          </div>

          <div v-else class="perm-groups">
            <div
              v-for="(group, module) in groupedFilteredPermissions"
              :key="module"
              class="perm-group"
            >
              <div class="perm-group-head">
                <div class="module-title">{{ module }}</div>

                <div class="group-actions">
                  <VaButton
                    size="small"
                    preset="secondary"
                    @click="toggleModule(module, true)"
                  >
                    Select all
                  </VaButton>
                  <VaButton
                    size="small"
                    preset="secondary"
                    @click="toggleModule(module, false)"
                  >
                    Clear
                  </VaButton>
                </div>
              </div>

              <div class="perm-list">
                <label
                  v-for="p in group"
                  :key="p.key"
                  class="perm-item"
                >
                  <VaCheckbox
                    :model-value="hasPermission(p.key)"
                    @update:modelValue="setPermission(p.key, $event)"
                  />
                  <div class="perm-text">
                    <div class="perm-label">{{ p.label }}</div>
                    <div class="perm-key">{{ p.key }}</div>
                  </div>
                </label>
              </div>
            </div>

            <div v-if="!filteredPermissions.length" class="empty">
              No permissions match your filter.
            </div>
          </div>

          <div v-if="selectedRole" class="footer">
            <div class="muted small">
              Changes are currently <b>local only</b> (static data). Connect API later.
            </div>

            <div class="footer-actions">
              <VaButton preset="secondary" @click="resetRolePermissions">
                Reset
              </VaButton>
              <VaButton color="primary" @click="saveRolePermissions">
                Save Changes
              </VaButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <VaModal
      v-model="modal.open"
      size="small"
      hide-default-actions
    >
      <div class="modal">
        <div class="modal-head">
          <div>
            <div class="modal-title">
              {{ modal.mode === "create" ? "Create Role" : "Edit Role" }}
            </div>
            <div class="muted small">
              Basic role info (permissions managed in the right panel).
            </div>
          </div>
          <VaButton preset="secondary" size="small" @click="modal.open = false">
            Close
          </VaButton>
        </div>

        <div class="modal-body">
          <VaInput v-model="modal.form.role_name" label="Role Name" />
          <VaInput v-model="modal.form.role_code" label="Role Code (UPPERCASE)" />
          <VaTextarea
            v-model="modal.form.description"
            label="Description"
            autosize
          />
          <div class="row">
            <VaSwitch v-model="modal.form.is_active" label="Active" />
            <VaSwitch v-model="modal.form.full_access" label="Full Access (*)" />
          </div>
        </div>

        <div class="modal-actions">
          <VaButton preset="secondary" @click="modal.open = false">Cancel</VaButton>
          <VaButton color="primary" @click="submitRole">
            {{ modal.mode === "create" ? "Create" : "Update" }}
          </VaButton>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { roles as rolesData } from "@/data/setting/roles"
import { permission as permissionsData } from "@/data/setting/permission"
import { useToast } from "vuestic-ui"

const { init: toast } = useToast()

/** local copy (static demo) */
const roles = ref(structuredClone(rolesData))

const selectedRoleId = ref(roles.value?.[0]?.role_id ?? null)
const roleSearch = ref("")

const permSearch = ref("")
const moduleFilter = ref("All")

/** Role selection */
const selectedRole = computed(() =>
  roles.value.find(r => r.role_id === selectedRoleId.value) || null
)

function selectRole(id) {
  selectedRoleId.value = id
}

/** Left: role search */
const filteredRoles = computed(() => {
  const q = roleSearch.value.trim().toLowerCase()
  if (!q) return roles.value
  return roles.value.filter(r =>
    r.role_name.toLowerCase().includes(q) ||
    String(r.role_code).toLowerCase().includes(q)
  )
})

function countRolePermissions(role) {
  if (!role?.permissions) return 0
  return role.permissions.includes("*") ? permissionsData.length : role.permissions.length
}

/** Modules options */
const moduleOptions = computed(() => {
  const modules = Array.from(new Set(permissionsData.map(p => p.module))).sort()
  return ["All", ...modules]
})

/** Filter permissions list */
const filteredPermissions = computed(() => {
  const q = permSearch.value.trim().toLowerCase()
  const mod = moduleFilter.value

  return permissionsData.filter(p => {
    const matchModule = mod === "All" ? true : p.module === mod
    const matchSearch = !q
      ? true
      : p.label.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)

    return matchModule && matchSearch
  })
})

/** Group permissions by module */
const groupedFilteredPermissions = computed(() => {
  const groups = {}
  for (const p of filteredPermissions.value) {
    if (!groups[p.module]) groups[p.module] = []
    groups[p.module].push(p)
  }
  return groups
})

/** Permission setters (safe) */
function hasPermission(key) {
  if (!selectedRole.value) return false
  const perms = selectedRole.value.permissions || []
  if (perms.includes("*")) return true
  return perms.includes(key)
}

function setPermission(key, checked) {
  const role = selectedRole.value
  if (!role) return

  // If full access => ignore individual toggles
  if ((role.permissions || []).includes("*")) return

  role.permissions = Array.isArray(role.permissions) ? role.permissions : []

  if (checked) {
    if (!role.permissions.includes(key)) role.permissions.push(key)
  } else {
    role.permissions = role.permissions.filter(p => p !== key)
  }
}

function toggleModule(module, checked) {
  const role = selectedRole.value
  if (!role) return
  if ((role.permissions || []).includes("*")) return

  const keys = permissionsData.filter(p => p.module === module).map(p => p.key)
  for (const k of keys) setPermission(k, checked)
}

/** Footer actions */
function resetRolePermissions() {
  const role = selectedRole.value
  if (!role) return
  const original = rolesData.find(r => r.role_id === role.role_id)
  if (!original) return

  role.permissions = structuredClone(original.permissions)
  toast({ message: "Reset to original (static) permissions.", color: "secondary" })
}

function saveRolePermissions() {
  toast({ message: "Saved (static demo). Connect API later.", color: "primary" })
}

/** Modal: create/edit role */
const modal = ref({
  open: false,
  mode: "create", // create | edit
  form: {
    role_name: "",
    role_code: "",
    description: "",
    is_active: true,
    full_access: false,
  },
})

function openCreate() {
  modal.value.mode = "create"
  modal.value.form = {
    role_name: "",
    role_code: "",
    description: "",
    is_active: true,
    full_access: false,
  }
  modal.value.open = true
}

function openEdit() {
  if (!selectedRole.value) return
  modal.value.mode = "edit"
  modal.value.form = {
    role_name: selectedRole.value.role_name,
    role_code: selectedRole.value.role_code,
    description: selectedRole.value.description,
    is_active: !!selectedRole.value.is_active,
    full_access: (selectedRole.value.permissions || []).includes("*"),
  }
  modal.value.open = true
}

function submitRole() {
  const f = modal.value.form

  if (!f.role_name.trim() || !f.role_code.trim()) {
    toast({ message: "Role Name and Role Code are required.", color: "danger" })
    return
  }

  if (modal.value.mode === "create") {
    const newId = Math.max(...roles.value.map(r => r.role_id)) + 1

    roles.value.unshift({
      role_id: newId,
      role_name: f.role_name.trim(),
      role_code: f.role_code.trim().toUpperCase(),
      description: f.description.trim(),
      is_active: f.is_active,
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      permissions: f.full_access ? ["*"] : [],
    })

    selectedRoleId.value = newId
    toast({ message: "Role created (static).", color: "primary" })
  } else {
    const role = selectedRole.value
    if (!role) return

    role.role_name = f.role_name.trim()
    role.role_code = f.role_code.trim().toUpperCase()
    role.description = f.description.trim()
    role.is_active = f.is_active

    // toggle full access
    if (f.full_access) {
      role.permissions = ["*"]
    } else if ((role.permissions || []).includes("*")) {
      role.permissions = []
    }

    toast({ message: "Role updated (static).", color: "primary" })
  }

  modal.value.open = false
}
</script>

<style scoped>
.page{
  min-height: 100vh;
  background: #fff;
  padding: 18px;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
}

.header{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:14px;
  padding: 6px 4px 16px;
  border-bottom: 1px solid rgba(2,6,23,.06);
}

.title{
  margin:0;
  font-size: 20px;
  font-weight: 950;
  color:#0f172a;
}
.subtitle{
  margin:6px 0 0;
  font-size: 13px;
  color:#64748b;
}

.header-actions{
  display:flex;
  align-items:center;
  gap:10px;
  flex-wrap: wrap;
}

.control{ min-width: 200px; }

.grid{
  margin-top: 16px;
  display:grid;
  grid-template-columns: 360px 1fr;
  gap: 14px;
}

.panel{
  border-radius: 14px;
  border: 1px solid rgba(2,6,23,.06);
  background: #fff;
  box-shadow: 0 8px 20px rgba(2,6,23,.05); /* small clean shadow */
  overflow: hidden;
}

.panel-head{
  padding: 12px 12px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  border-bottom: 1px solid rgba(2,6,23,.06);
}
.panel-title{
  font-weight: 900;
  color:#0f172a;
}
.panel-actions{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap: wrap;
}
.small{ font-size: 12px; }
.muted{ color:#64748b; }

/* Roles list */
.role-list{
  padding: 10px;
  display:grid;
  gap: 10px;
}
.role-item{
  text-align:left;
  background: #fff;
  border: 1px solid rgba(2,6,23,.06);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.role-item:hover{
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(2,6,23,.06);
}
.role-item.active{
  border-color: rgba(14,165,233,.45);
  box-shadow: 0 10px 20px rgba(14,165,233,.12);
}

.role-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}
.role-name{
  font-weight: 900;
  color:#0f172a;
  display:flex;
  align-items:center;
  gap:8px;
}
.role-desc{
  margin-top: 6px;
  font-size: 12px;
  color:#64748b;
}
.role-meta{
  margin-top: 10px;
  display:flex;
  align-items:center;
  gap:8px;
  font-size: 12px;
}
.pill{
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(2,6,23,.08);
  color:#0f172a;
  background:#fff;
}
.dot{
  width:4px;
  height:4px;
  border-radius: 999px;
  background: rgba(100,116,139,.5);
}

/* Permissions area */
.perm-area{
  padding: 12px;
}
.perm-groups{
  display:grid;
  gap: 12px;
}
.perm-group{
  border: 1px solid rgba(2,6,23,.06);
  border-radius: 12px;
  padding: 12px;
}
.perm-group-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  margin-bottom: 10px;
}
.module-title{
  font-weight: 900;
  color:#0f172a;
}
.group-actions{
  display:flex;
  gap:8px;
  flex-wrap: wrap;
}
.perm-list{
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.perm-item{
  display:flex;
  gap:10px;
  align-items:flex-start;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(2,6,23,.06);
  background: #fff;
}
.perm-text{ min-width: 0; }
.perm-label{
  font-weight: 800;
  color:#0f172a;
  font-size: 13px;
}
.perm-key{
  font-size: 11px;
  color:#64748b;
  margin-top: 2px;
}

/* Owner full access */
.owner-box{
  margin: 12px;
  border: 1px solid rgba(14,165,233,.25);
  background: rgba(14,165,233,.06);
  border-radius: 12px;
  padding: 12px;
  display:flex;
  gap:10px;
  align-items:flex-start;
}
.owner-title{
  font-weight: 950;
  color:#0f172a;
}
.owner-sub{
  font-size: 12px;
  color:#64748b;
}
.owner-sub code{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-weight: 800;
}

/* Footer */
.footer{
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(2,6,23,.06);
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap: 12px;
  flex-wrap: wrap;
}
.footer-actions{
  display:flex;
  gap:10px;
}

.empty{
  padding: 14px;
  text-align:center;
  color:#64748b;
}
.empty.big{
  padding: 30px 12px;
  border: 1px dashed rgba(2,6,23,.10);
  border-radius: 12px;
}

/* Modal */
.modal{
  padding: 14px;
}
.modal-head{
  display:flex;
  justify-content:space-between;
  gap: 10px;
  align-items:flex-start;
  margin-bottom: 12px;
}
.modal-title{
  font-weight: 950;
  color:#0f172a;
}
.modal-body{
  display:grid;
  gap: 12px;
}
.row{
  display:flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items:center;
}
.modal-actions{
  margin-top: 14px;
  display:flex;
  justify-content:flex-end;
  gap: 10px;
}

/* Responsive */
@media (max-width: 1100px){
  .grid{ grid-template-columns: 1fr; }
  .control{ min-width: 220px; }
  .perm-list{ grid-template-columns: 1fr; }
}
</style>
