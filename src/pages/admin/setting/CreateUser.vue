<script setup>
import { ref, reactive, computed, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

/* -------------------- form (matches your users table) -------------------- */
const form = reactive({
  username: "",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
  status: "active",
  roles: [], // role_name list for UI (admin/manager/reception/housekeeping)
})

const roleOptions = ["admin", "manager", "reception", "housekeeping"]

/* -------------------- profile image upload + preview -------------------- */
const previewUrl = ref("")
const imageFile = ref(null)

function revokePreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ""
}

function onPickImage(files) {
  const f = files?.[0]
  if (!f) return

  // revoke old blob url
  revokePreview()

  imageFile.value = f
  previewUrl.value = URL.createObjectURL(f)
}

function removeImage() {
  revokePreview()
  imageFile.value = null
}

/* -------------------- validation -------------------- */
const canSave = computed(() => {
  return (
    form.username.trim() &&
    form.email.trim() &&
    form.password.trim() &&
    form.first_name.trim() &&
    form.last_name.trim()
  )
})

/* -------------------- submit (demo, ready for API) -------------------- */
function submit() {
  if (!canSave.value) {
    alert("Please fill all required fields (*).")
    return
  }

  // ✅ payload for Laravel API (multipart, supports image upload)
  const fd = new FormData()
  fd.append("username", form.username)
  fd.append("email", form.email)
  fd.append("password", form.password)
  fd.append("first_name", form.first_name)
  fd.append("last_name", form.last_name)
  fd.append("phone", form.phone || "")
  fd.append("status", form.status)
  fd.append("roles", JSON.stringify(form.roles)) // or send role_ids from API later
  if (imageFile.value) fd.append("profile_image", imageFile.value)

  // Demo output
  console.log("Create user FormData:")
  for (const [k, v] of fd.entries()) console.log(k, v)

  alert("Saved (demo). Check console.\nNext: connect API endpoint.")
  router.push({ name: "admin.settings.users" }) // change to your users list route
}

function reset() {
  form.username = ""
  form.email = ""
  form.password = ""
  form.first_name = ""
  form.last_name = ""
  form.phone = ""
  form.status = "active"
  form.roles = []
  removeImage()
}

onBeforeUnmount(() => revokePreview())
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Create User</h1>
        <p>Create new staff account • roles • status • profile photo</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="arrow_back" @click="$router.back()">
          Back
        </VaButton>
        <VaButton preset="secondary" icon="refresh" @click="reset">
          Reset
        </VaButton>
        <VaButton color="success" icon="save" :disabled="!canSave" @click="submit">
          Save User
        </VaButton>
      </div>
    </div>

    <div class="grid">
      <!-- LEFT: Form -->
      <VaCard class="card">
        <div class="cardHead">
          <div class="title">User Information</div>
          <div class="hint">Fields with * are required</div>
        </div>

        <!-- photo upload -->
        <div class="photoRow">
          <div class="avatarBox">
            <img v-if="previewUrl" :src="previewUrl" class="avatarImg" alt="Profile preview" />
            <div v-else class="avatarEmpty">
              No Photo
            </div>
          </div>

          <div class="uploadBox">
            <div class="uploadTitle">Profile Photo</div>
            <div class="uploadHint">PNG/JPG/WEBP • Recommended 400x400</div>

            <VaFileUpload
              dropzone
              :file-types="['image/png', 'image/jpeg', 'image/jpg', 'image/webp']"
              @file-added="onPickImage"
              @file-removed="removeImage"
            />

            <div class="uploadActions">
              <VaButton
                v-if="previewUrl"
                preset="secondary"
                size="small"
                icon="delete"
                @click="removeImage"
              >
                Remove
              </VaButton>
            </div>
          </div>
        </div>

        <!-- form fields -->
        <div class="formGrid">
          <VaInput v-model="form.username" label="Username *" placeholder="ex: reception01" />
          <VaInput v-model="form.email" type="email" label="Email *" placeholder="user@mail.com" />

          <VaInput v-model="form.password" type="password" label="Password *" placeholder="••••••••" />

          <VaInput v-model="form.first_name" label="First Name *" />
          <VaInput v-model="form.last_name" label="Last Name *" />

          <VaInput v-model="form.phone" label="Phone" placeholder="012345678" />

          <VaSelect
            v-model="form.status"
            :options="['active','inactive','suspended']"
            label="Status"
          />

          <VaSelect
            v-model="form.roles"
            :options="roleOptions"
            label="Roles"
            multiple
          />

          <VaTextarea
            class="wide"
            label="Notes (optional)"
            :max-rows="3"
            placeholder="Internal note about this user..."
          />
        </div>

        <div class="actions">
          <VaButton preset="secondary" @click="$router.back()">Cancel</VaButton>
          <VaButton color="success" icon="save" :disabled="!canSave" @click="submit">
            Save User
          </VaButton>
        </div>
      </VaCard>

      <!-- RIGHT: Preview -->
      <VaCard class="card side">
        <div class="cardHead">
          <div class="title">Preview</div>
          <div class="hint">What you will save</div>
        </div>

        <div class="preview">
          <div class="previewAvatar">
            <img v-if="previewUrl" :src="previewUrl" class="previewImg" alt="Preview" />
            <div v-else class="previewEmpty">
              {{ (form.first_name || form.username || "U").slice(0, 1).toUpperCase() }}
            </div>
          </div>

          <div class="row">
            <div class="k">Username</div>
            <div class="v">@{{ form.username || "-" }}</div>
          </div>

          <div class="row">
            <div class="k">Name</div>
            <div class="v">
              {{ (form.first_name || "-") }} {{ (form.last_name || "") }}
            </div>
          </div>

          <div class="row">
            <div class="k">Email</div>
            <div class="v">{{ form.email || "-" }}</div>
          </div>

          <div class="row">
            <div class="k">Phone</div>
            <div class="v">{{ form.phone || "-" }}</div>
          </div>

          <div class="row">
            <div class="k">Status</div>
            <div class="v">
              <span class="pill" :class="`st-${form.status}`">{{ form.status }}</span>
            </div>
          </div>

          <div class="row">
            <div class="k">Roles</div>
            <div class="v chips">
              <span v-for="r in form.roles" :key="r" class="chip">
                {{ r.toUpperCase() }}
              </span>
              <span v-if="!form.roles.length" class="chip soft">None</span>
            </div>
          </div>

          <div class="hr"></div>

          <div class="tipTitle">Quick Tips</div>
          <ul class="tips">
            <li>Use <b>reception</b> for front desk.</li>
            <li>Use <b>housekeeping</b> for cleaning staff.</li>
            <li>Use <b>manager</b> for reports + operations.</li>
            <li>Use <b>admin</b> for full system control.</li>
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
.headBtns {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
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
  padding: 16px;
}
.card.side {
  position: sticky;
  top: 14px;
  height: fit-content;
}

.cardHead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
  gap: 12px;
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

/* photo upload row */
.photoRow {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 14px;
  margin-bottom: 14px;
  align-items: start;
}
@media (max-width: 760px) {
  .photoRow {
    grid-template-columns: 1fr;
  }
}

.avatarBox {
  width: 160px;
  height: 160px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #fbfcfe;
  overflow: hidden;
  display: grid;
  place-items: center;
}
.avatarImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatarEmpty {
  font-weight: 900;
  color: #64748b;
}

.uploadBox {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  padding: 12px;
  background: #fff;
}
.uploadTitle {
  font-weight: 900;
  color: #0f172a;
}
.uploadHint {
  font-size: 12px;
  color: #64748b;
  margin: 4px 0 10px;
  font-weight: 800;
}
.uploadActions {
  margin-top: 10px;
}

/* form grid */
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

.actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

/* preview */
.preview {
  display: grid;
  gap: 10px;
}
.previewAvatar {
  width: 88px;
  height: 88px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #fbfcfe;
  overflow: hidden;
  display: grid;
  place-items: center;
}
.previewImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.previewEmpty {
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.k {
  font-size: 12px;
  color: #64748b;
  font-weight: 900;
}
.v {
  font-weight: 900;
  color: #0f172a;
  text-align: right;
}

.hr {
  height: 1px;
  background: #eef2f6;
  margin: 8px 0;
}

.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  font-size: 11px;
  font-weight: 900;
  color: #334155;
}
.chip.soft {
  background: #f8fafc;
}

.pill {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 11px;
  font-weight: 900;
}
.pill.st-active {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #166534;
}
.pill.st-inactive {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #334155;
}
.pill.st-suspended {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}

/* Quick tips styling */
.tipTitle {
  font-weight: 900;
  color: #0f172a;
  margin-top: 6px;
}
.tips {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  font-weight: 700;
  font-size: 13px;
}
.tips li {
  margin: 6px 0;
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
