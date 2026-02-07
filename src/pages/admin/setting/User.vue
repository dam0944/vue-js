<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="head-left">
        <h1 class="title">Settings · Users</h1>
        <p class="subtitle">Manage staff accounts, roles, status, and access by property.</p>
      </div>

      <div class="head-right">
        <VaButton color="primary" preset="primary" @click="openCreate">
          <VaIcon name="person_add" class="mr-2" />
          New User
        </VaButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <VaInput
        v-model="q"
        class="control"
        placeholder="Search name, email, username, phone..."
        clearable
      >
        <template #prependInner>
          <VaIcon name="search" color="primary" />
        </template>
      </VaInput>

      <VaSelect
        v-model="status"
        class="control"
        label="Status"
        :options="statusOptions"
        text-by="text"
        value-by="value"
        clearable
      />

      <VaSelect
        v-model="position"
        class="control"
        label="Position"
        :options="positionOptions"
        text-by="text"
        value-by="value"
        clearable
      />

      <VaSelect
        v-model="property"
        class="control"
        label="Property Access"
        :options="propertyOptions"
        text-by="text"
        value-by="value"
        clearable
      />

      <VaButton preset="secondary" color="primary" @click="resetFilters">
        Reset
      </VaButton>
    </div>

    <!-- Summary line -->
    <div class="meta">
      <div class="meta-left">
        <VaChip color="primary" square size="small">{{ filtered.length }}</VaChip>
        <span class="meta-text">users found</span>
      </div>

      <div class="meta-right">
        <VaButton preset="secondary" color="primary" @click="toggleCompact">
          <VaIcon :name="compact ? 'view_agenda' : 'view_list'" class="mr-2" />
          {{ compact ? "Comfort" : "Compact" }}
        </VaButton>
      </div>
    </div>

    <!-- Table -->
    <VaDataTable
      class="table"
      :items="filtered"
      :columns="columns"
      :per-page="8"
      striped
      hoverable
    >
      <!-- avatar + name -->
      <template #cell(name)="{ rowData }">
        <div class="name-cell">
          <VaAvatar :src="rowData.profile_image" size="36px" />
          <div class="name-block">
            <div class="name">
              {{ rowData.first_name }} {{ rowData.last_name }}
              <VaChip v-if="rowData.property_id === null" size="small" square color="primary" class="ml-2">
                ALL
              </VaChip>
            </div>
            <div class="sub">
              @{{ rowData.username }} · {{ rowData.email }}
            </div>
          </div>
        </div>
      </template>

      <!-- status -->
      <template #cell(status)="{ value }">
        <VaChip :color="statusColor(value)" size="small" square>
          {{ value }}
        </VaChip>
      </template>

      <!-- position -->
      <template #cell(position)="{ value }">
        <VaChip color="secondary" size="small" square>
          {{ value }}
        </VaChip>
      </template>

      <!-- property -->
      <template #cell(property_id)="{ value }">
        <span class="muted">
          {{ value === null ? "All properties" : `Property #${value}` }}
        </span>
      </template>

      <!-- security -->
      <template #cell(security)="{ rowData }">
        <div class="sec">
          <span class="muted">Failed:</span>
          <b class="num">{{ rowData.failed_login_attempts }}</b>

          <span class="dot"></span>

          <span class="muted">Locked:</span>
          <b class="num">{{ rowData.account_locked_until ? "Yes" : "No" }}</b>

          <span v-if="rowData.must_change_password" class="dot"></span>
          <VaChip
            v-if="rowData.must_change_password"
            size="small"
            square
            color="warning"
          >
            Must Change Password
          </VaChip>
        </div>
      </template>

      <!-- actions -->
      <template #cell(actions)="{ rowData }">
        <div class="row-actions" :class="{ compact }">
          <VaButton preset="secondary" color="primary" size="small" @click="openEdit(rowData)">
            <VaIcon name="edit" class="mr-1" />
            Edit
          </VaButton>
          <VaButton preset="secondary" color="danger" size="small" @click="softDelete(rowData)">
            <VaIcon name="delete" class="mr-1" />
            Disable
          </VaButton>
        </div>
      </template>
    </VaDataTable>

    <!-- Create/Edit Modal -->
    <VaModal
      v-model="modal"
      size="large"
      hide-default-actions
      :title="formMode === 'create' ? 'Create User' : 'Edit User'"
    >
      <div class="modal-body">
        <div class="form-grid">
          <VaInput v-model="form.username" label="Username" placeholder="e.g. receptionist01" />
          <VaInput v-model="form.email" label="Email" placeholder="name@example.com" />

          <VaInput v-model="form.first_name" label="First Name" placeholder="First name" />
          <VaInput v-model="form.last_name" label="Last Name" placeholder="Last name" />

          <VaInput v-model="form.phone" label="Phone" placeholder="+855..." />
          <VaInput v-model="form.employee_id" label="Employee ID" placeholder="EMP-001" />

          <VaSelect
            v-model="form.position"
            label="Position"
            :options="positionOptions"
            text-by="text"
            value-by="value"
          />

          <VaSelect
            v-model="form.status"
            label="Status"
            :options="statusOptions"
            text-by="text"
            value-by="value"
          />

          <VaSelect
            v-model="form.property_id"
            label="Property Access"
            :options="propertyOptions"
            text-by="text"
            value-by="value"
          />

          <VaInput
            v-model="form.profile_image"
            label="Profile Image URL"
            placeholder="https://..."
          />
        </div>

        <div class="toggles">
          <VaSwitch v-model="form.must_change_password" label="Must change password on next login" />
        </div>
      </div>

      <div class="modal-actions">
        <VaButton preset="secondary" color="primary" @click="closeModal">Cancel</VaButton>
        <VaButton color="primary" preset="primary" @click="saveUser">
          {{ formMode === "create" ? "Create" : "Save Changes" }}
        </VaButton>
      </div>
    </VaModal>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { users as seed } from "@/data/setting/user"

// local editable list (static demo)
const users = ref(seed.map(u => ({ ...u })))

/** Filters */
const q = ref("")
const status = ref(null)
const position = ref(null)
const property = ref(null)
const compact = ref(false)

const statusOptions = [
  { text: "Active", value: "active" },
  { text: "Inactive", value: "inactive" },
  { text: "Suspended", value: "suspended" },
]

const positionOptions = [
  { text: "Owner", value: "owner" },
  { text: "Manager", value: "manager" },
  { text: "Receptionist", value: "receptionist" },
  { text: "Housekeeping", value: "housekeeping" },
  { text: "Accountant", value: "accountant" },
  { text: "Maintenance", value: "maintenance" },
]

const propertyOptions = [
  { text: "All properties", value: null },
  { text: "Property #1", value: 1 },
  { text: "Property #2", value: 2 },
]

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()

  return users.value.filter((u) => {
    const matchesQuery = !query
      ? true
      : [
          u.first_name,
          u.last_name,
          u.username,
          u.email,
          u.phone,
          u.employee_id,
        ]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(query))

    const matchesStatus = !status.value ? true : u.status === status.value
    const matchesPosition = !position.value ? true : u.position === position.value

    // property filter: null means “All properties”
    const matchesProperty =
      property.value === null
        ? true
        : u.property_id === property.value

    return matchesQuery && matchesStatus && matchesPosition && matchesProperty
  })
})

/** Table columns */
const columns = computed(() => [
  { key: "name", label: "User", sortable: false },
  { key: "phone", label: "Phone" },
  { key: "position", label: "Position" },
  { key: "status", label: "Status" },
  { key: "property_id", label: "Property" },
  { key: "security", label: "Security", sortable: false },
  { key: "actions", label: "", width: compact.value ? "180px" : "220px", sortable: false },
])

/** Color helpers */
function statusColor(s) {
  if (s === "active") return "success"
  if (s === "inactive") return "secondary"
  return "danger"
}

/** UI actions */
function resetFilters() {
  q.value = ""
  status.value = null
  position.value = null
  property.value = null
}

function toggleCompact() {
  compact.value = !compact.value
}

/** Modal create/edit */
const modal = ref(false)
const formMode = ref("create") // create | edit
const editId = ref(null)

const blank = () => ({
  user_id: null,
  property_id: null,
  username: "",
  email: "",
  password_hash: "$2y$10$staticDemoHash",
  first_name: "",
  last_name: "",
  phone: "",
  profile_image: "",
  status: "active",
  employee_id: "",
  position: "receptionist",
  failed_login_attempts: 0,
  last_failed_login: null,
  account_locked_until: null,
  password_changed_at: null,
  must_change_password: false,
  last_login: null,
  last_login_ip: null,
  created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
  updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
  deleted_at: null,
})

const form = ref(blank())

function openCreate() {
  formMode.value = "create"
  editId.value = null
  form.value = blank()
  modal.value = true
}

function openEdit(row) {
  formMode.value = "edit"
  editId.value = row.user_id
  form.value = { ...row }
  modal.value = true
}

function closeModal() {
  modal.value = false
}

function saveUser() {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ")
  form.value.updated_at = now

  if (formMode.value === "create") {
    const nextId = Math.max(0, ...users.value.map((u) => u.user_id || 0)) + 1
    users.value.unshift({
      ...form.value,
      user_id: nextId,
      created_at: now,
    })
  } else {
    const idx = users.value.findIndex((u) => u.user_id === editId.value)
    if (idx !== -1) users.value[idx] = { ...form.value }
  }

  modal.value = false
}

/** “Disable” = soft delete style (matches deleted_at pattern) */
function softDelete(row) {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ")
  const idx = users.value.findIndex((u) => u.user_id === row.user_id)
  if (idx === -1) return

  users.value[idx] = {
    ...users.value[idx],
    status: "inactive",
    deleted_at: now,
    updated_at: now,
  }
}
</script>

<style scoped>
/* White background, clean, not too many colors */
.page {
  background: #ffffff;
  min-height: 100vh;
  padding: 18px;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
}

/* Header */
.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(2, 6, 23, 0.06);
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #64748b;
}

.head-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Filters row */
.filters {
  display: grid;
  grid-template-columns: 1.6fr 0.7fr 0.7fr 0.8fr auto;
  gap: 10px;
  padding: 14px 0 10px;
}

.control {
  min-width: 140px;
}

/* Meta */
.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 8px 0 12px;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meta-text {
  color: #64748b;
  font-size: 13px;
}

/* Table */
.table {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(2, 6, 23, 0.06);
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.06); /* little shadow */
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.name-block {
  display: grid;
  gap: 2px;
  min-width: 220px;
}

.name {
  font-weight: 900;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sub {
  font-size: 12px;
  color: #64748b;
}

.muted {
  color: #64748b;
  font-size: 13px;
}

.sec {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.num {
  color: #0f172a;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.5);
}

/* actions */
.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.row-actions.compact {
  gap: 6px;
}

/* Modal */
.modal-body {
  padding: 6px 2px 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.toggles {
  padding-top: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(2, 6, 23, 0.06);
}

/* Responsive */
@media (max-width: 980px) {
  .filters {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .name-block {
    min-width: unset;
  }
}
</style>
