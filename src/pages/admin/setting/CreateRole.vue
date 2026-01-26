<script setup>
import { reactive, computed } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

//form matches your DB table: roles
const form = reactive({
  role_name: "",
  display_name: "",
  description: "",
  is_system_role: false,
  is_active: true,
})

const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")

const canSave = computed(() => {
  return String(form.role_name).trim() && String(form.display_name).trim()
})

function submit() {
  if (!canSave.value) return alert("Role Name and Display Name are required.")

  // ✅ demo payload matches DB columns
  const payload = {
    role_name: form.role_name.trim(),
    display_name: form.display_name.trim(),
    description: form.description.trim(),
    is_system_role: !!form.is_system_role,
    is_active: !!form.is_active,
  }

  console.log("create role payload", payload)
  alert("Saved (demo). Check console.")

  // after save -> go back to roles list page (adjust route name if you use another)
  router.push({ name: "admin.settings.roles" }) // ✅ change this route name to your real route
}

function reset() {
  form.role_name = ""
  form.display_name = ""
  form.description = ""
  form.is_system_role = false
  form.is_active = true
}
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Create Role</h1>
        <p>Roles table • clean form • required fields highlighted</p>
      </div>

      <div class="headActions">
        <VaButton preset="secondary" icon="arrow_back" @click="$router.back()">
          Back
        </VaButton>
        <VaButton preset="secondary" icon="refresh" @click="reset">
          Reset
        </VaButton>
        <VaButton color="success" icon="save" :disabled="!canSave" @click="submit">
          Save Role
        </VaButton>
      </div>
    </div>

    <div class="grid">
      <!-- Left: form -->
      <VaCard class="card">
        <div class="cardHead">
          <div class="title">Role Information</div>
          <div class="hint">Fields with * are required</div>
        </div>

        <div class="formGrid">
          <VaInput
            v-model="form.role_name"
            label="Role Name *"
            placeholder="ex: housekeeping"
          />

          <VaInput
            v-model="form.display_name"
            label="Display Name *"
            placeholder="ex: Housekeeping Staff"
          />

          <VaTextarea
            v-model="form.description"
            class="wide"
            label="Description"
            :max-rows="4"
            placeholder="Example: Manage room cleaning and maintenance tasks..."
          />

          <div class="switchWrap wide">
            <div class="sw">
              <div>
                <div class="swTitle">System Role</div>
                <div class="swHint">Use only for roles like Admin</div>
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

          <div class="actions wide">
            <VaButton preset="secondary" @click="$router.back()">Cancel</VaButton>
            <VaButton color="success" icon="save" :disabled="!canSave" @click="submit">
              Save Role
            </VaButton>
          </div>
        </div>
      </VaCard>

      <!-- Right: preview + tips -->
      <VaCard class="card side">
        <div class="cardHead">
          <div class="title">Quick Preview</div>
          <div class="hint">What you will save</div>
        </div>

        <div class="preview">
          <div class="row">
            <div class="k">Role Name</div>
            <div class="v mono">{{ form.role_name || "-" }}</div>
          </div>

          <div class="row">
            <div class="k">Display Name</div>
            <div class="v">{{ form.display_name || "-" }}</div>
          </div>

          <div class="row">
            <div class="k">Type</div>
            <div class="v">
              <span class="pill" :class="form.is_system_role ? 'sys' : 'std'">
                {{ form.is_system_role ? "SYSTEM" : "CUSTOM" }}
              </span>
            </div>
          </div>

          <div class="row">
            <div class="k">Status</div>
            <div class="v">
              <span class="pill" :class="form.is_active ? 'active' : 'inactive'">
                {{ form.is_active ? "ACTIVE" : "INACTIVE" }}
              </span>
            </div>
          </div>

          <div class="hr"></div>

          <div class="k">Description</div>
          <div class="note">{{ form.description || "-" }}</div>
        </div>

        <div class="tips">
          <div class="tipTitle">Quick Tips</div>
          <ul>
            <li><b>Role Name</b> should be lowercase and unique.</li>
            <li><b>Display Name</b> is for UI (easy to read).</li>
            <li>Only mark <b>System Role</b> for Admin/Super Admin.</li>
          </ul>
        </div>
      </VaCard>
    </div>
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
.headActions {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
}

.grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 14px;
}
@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  border-radius: 14px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.cardHead {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}
.title {
  font-weight: 900;
  color: #0f172a;
}
.hint {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}

.formGrid {
  padding: 16px;
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

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preview {
  padding: 16px;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
}
.k {
  font-size: 12px;
  color: #64748b;
  font-weight: 900;
}
.v {
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
  text-align: right;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}
.hr {
  height: 1px;
  background: #eef2f6;
  margin: 10px 0;
}
.note {
  font-size: 12px;
  color: #334155;
  font-weight: 800;
  line-height: 1.5;
  background: #fbfcfe;
  border: 1px solid #eef2f6;
  border-radius: 12px;
  padding: 10px 12px;
}

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

/* Tips */
.tips {
  margin: 0 16px 16px;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px;
}
.tipTitle {
  font-size: 12px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 8px;
}
.tips ul {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  font-weight: 800;
  font-size: 12px;
}
.tips li {
  margin: 6px 0;
}

/* Vuestic polish */
:deep(.va-input__container),
:deep(.va-textarea__container) {
  border-radius: 10px;
  background: #f9fafb;
}
:deep(.va-button) {
  border-radius: 10px;
  font-weight: 800;
}
</style>
