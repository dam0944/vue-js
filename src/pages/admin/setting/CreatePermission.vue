<script setup>
import { reactive, computed, watchEffect } from "vue"
import { useRouter, useRoute } from "vue-router"
import { setting_permission } from "@/data/setting/permission"

const router = useRouter()
const route = useRoute()

// ✅ if permissionId exists => edit mode
const permissionId = computed(() => {
  const v = route.params.permissionId
  return v ? Number(v) : null
})
const isEdit = computed(() => !!permissionId.value)

const moduleOptions = [
  "dashboard",
  "pos",
  "billing",
  "reservations",
  "rooms",
  "guests",
  "housekeeping",
  "reports",
  "settings",
]
const actionOptions = ["view", "create", "update", "delete", "assign", "approve", "export", "manage"]

const form = reactive({
  permission_name: "",
  display_name: "",
  module: "",
  action: "",
  description: "",
  is_active: true,
})

// auto load data when edit
watchEffect(() => {
  if (!isEdit.value) {
    // create mode - reset
    form.permission_name = ""
    form.display_name = ""
    form.module = ""
    form.action = ""
    form.description = ""
    form.is_active = true
    return
  }

  const found = setting_permission.find((p) => p.permission_id === permissionId.value)
  if (!found) return

  form.permission_name = found.permission_name || ""
  form.display_name = found.display_name || ""
  form.module = found.module || ""
  form.action = found.action || ""
  form.description = found.description || ""
  form.is_active = !!found.is_active
})

const canSave = computed(() => {
  return (
    String(form.permission_name).trim() &&
    String(form.display_name).trim() &&
    String(form.module).trim() &&
    String(form.action).trim()
  )
})

const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")

function submit() {
  if (!canSave.value) return alert("Please fill Permission Name, Display Name, Module and Action.")

  const payload = {
    permission_name: form.permission_name.trim(),
    display_name: form.display_name.trim(),
    module: form.module.trim(),
    action: form.action.trim(),
    description: (form.description || "").trim(),
    is_active: !!form.is_active,
  }

  if (isEdit.value) {
    console.log("UPDATE permission", permissionId.value, payload)
    alert("Updated (demo).")
  } else {
    console.log("CREATE permission", payload)
    alert("Created (demo).")
  }

  router.push({ name: "admin.settings.permissions" })
}

function reset() {
  if (isEdit.value) {
    // reload original
    const found = setting_permission.find((p) => p.permission_id === permissionId.value)
    if (!found) return
    form.permission_name = found.permission_name || ""
    form.display_name = found.display_name || ""
    form.module = found.module || ""
    form.action = found.action || ""
    form.description = found.description || ""
    form.is_active = !!found.is_active
  } else {
    form.permission_name = ""
    form.display_name = ""
    form.module = ""
    form.action = ""
    form.description = ""
    form.is_active = true
  }
}
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>{{ isEdit ? "Edit Permission" : "Create Permission" }}</h1>
        <p>One form for create + edit</p>
      </div>

      <div class="headActions">
        <VaButton preset="secondary" icon="arrow_back" @click="$router.back()">Back</VaButton>
        <VaButton preset="secondary" icon="refresh" @click="reset">Reset</VaButton>
        <VaButton color="success" icon="save" :disabled="!canSave" @click="submit">
          {{ isEdit ? "Save Changes" : "Save Permission" }}
        </VaButton>
      </div>
    </div>

    <div class="grid">
      <!-- form -->
      <VaCard class="card">
        <div class="cardHead">
          <div class="title">Permission Information</div>
          <div class="hint">Fields with * are required</div>
        </div>

        <div class="formGrid">
          <VaInput v-model="form.permission_name" label="Permission Name *" placeholder="ex: manage_users" />
          <VaInput v-model="form.display_name" label="Display Name *" placeholder="ex: Manage Users" />

          <VaSelect v-model="form.module" :options="moduleOptions" label="Module *" />
          <VaSelect v-model="form.action" :options="actionOptions" label="Action *" />

          <VaTextarea v-model="form.description" class="wide" label="Description" :max-rows="4" />

          <div class="switchWrap wide">
            <div class="sw">
              <div>
                <div class="swTitle">Active</div>
                <div class="swHint">Enable permission for roles</div>
              </div>
              <VaSwitch v-model="form.is_active" />
            </div>
          </div>

          <div class="actions wide">
            <VaButton preset="secondary" @click="$router.back()">Cancel</VaButton>
            <VaButton color="success" icon="save" :disabled="!canSave" @click="submit">
              {{ isEdit ? "Save Changes" : "Save Permission" }}
            </VaButton>
          </div>
        </div>
      </VaCard>

      <!-- preview -->
      <VaCard class="card side">
        <div class="cardHead">
          <div class="title">Quick Preview</div>
          <div class="hint">What you will save</div>
        </div>

        <div class="preview">
          <div class="row"><div class="k">Permission</div><div class="v">{{ form.permission_name || "-" }}</div></div>
          <div class="row"><div class="k">Display</div><div class="v">{{ form.display_name || "-" }}</div></div>
          <div class="row"><div class="k">Module</div><div class="v"><span class="pill soft">{{ label(form.module) }}</span></div></div>
          <div class="row"><div class="k">Action</div><div class="v"><span class="pill">{{ label(form.action) }}</span></div></div>
          <div class="row"><div class="k">Status</div><div class="v">
            <span class="pill" :class="form.is_active ? 'ok' : 'danger'">{{ form.is_active ? "ACTIVE" : "INACTIVE" }}</span>
          </div></div>

          <div class="hr"></div>

          <div class="k">Description</div>
          <div class="note">{{ form.description || "-" }}</div>
        </div>
      </VaCard>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 20px 24px; background: #f6f8fb; min-height: 100vh; }
.head { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
.head h1 { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; }
.head p { margin: 6px 0 0; font-size: 13px; color: #475569; }
.headActions { display: inline-flex; gap: 10px; flex-wrap: wrap; }

.grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 14px; }
@media (max-width: 980px){ .grid{ grid-template-columns: 1fr; } }

.card { border-radius: 14px; border: 1px solid #eef2f6; box-shadow: 0 10px 24px rgba(15,23,42,.08); overflow: hidden; }
.cardHead { padding: 14px 16px; border-bottom: 1px solid #eef2f6; background: #fbfcfe; display:flex; justify-content:space-between; align-items:baseline; gap: 10px; }
.title { font-weight: 900; color: #0f172a; }
.hint { font-size: 12px; color: #64748b; font-weight: 800; }

.formGrid { padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 760px){ .formGrid{ grid-template-columns: 1fr; } }
.wide { grid-column: 1 / -1; }

.switchWrap { border: 1px solid #eef2f6; background: #fbfcfe; border-radius: 14px; padding: 12px; }
.sw { display:flex; justify-content:space-between; align-items:center; gap: 12px; }
.swTitle { font-weight: 900; color: #0f172a; font-size: 12px; }
.swHint { margin-top: 2px; font-size: 12px; color: #64748b; font-weight: 800; }

.actions { display:flex; justify-content:flex-end; gap: 10px; }

.preview { padding: 16px; }
.row { display:flex; justify-content:space-between; gap: 10px; padding: 8px 0; }
.k { font-size: 12px; color: #64748b; font-weight: 900; }
.v { font-size: 12px; font-weight: 900; color: #0f172a; text-align:right; }
.hr { height: 1px; background: #eef2f6; margin: 10px 0; }
.note { font-size: 12px; color: #334155; font-weight: 800; line-height: 1.5; background:#fbfcfe; border:1px solid #eef2f6; border-radius: 12px; padding: 10px 12px; }

.pill { display:inline-flex; align-items:center; padding: 6px 10px; border-radius: 999px; font-size: 11px; font-weight: 900; border:1px solid #e2e8f0; background:#f8fafc; color:#334155; }
.pill.soft { background:#f1f5f9; }
.pill.ok { background:#dcfce7; border-color:#bbf7d0; color:#166534; }
.pill.danger { background:#fee2e2; border-color:#fecaca; color:#991b1b; }

:deep(.va-input__container), :deep(.va-select__container), :deep(.va-textarea__container) {
  border-radius: 10px; background: #f9fafb;
}
:deep(.va-button){ border-radius: 10px; font-weight: 800; }
</style>
