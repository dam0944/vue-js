<!-- src/pages/admin/guests/GuestForm.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <VaIcon name="person" color="secondary" />
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
              {{ isEdit ? "Edit Guest" : "Create Guest" }}
            </h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">Fields follow your <b>guests</b> table (Vuestic UI, clean style).</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="router.push('/admin/guests')">
            Back
          </VaButton>

          <VaButton color="primary" class="rounded-2xl font-extrabold" :disabled="saving || !canSave" @click="save">
            <VaIcon :name="saving ? 'autorenew' : 'save'" class="mr-1" />
            {{ saving ? "Saving..." : isEdit ? "Update" : "Save" }}
          </VaButton>
        </div>
      </div>

      <!-- Skeleton -->
      <VaCard v-if="loading" class="soft-card mt-4 rounded-2xl">
        <VaCardContent class="p-4">
          <div class="space-y-3">
            <div class="h-10 animate-pulse rounded-2xl bg-slate-100"></div>
            <div class="h-10 animate-pulse rounded-2xl bg-slate-100"></div>
            <div class="h-10 animate-pulse rounded-2xl bg-slate-100"></div>
            <div class="h-40 animate-pulse rounded-2xl bg-slate-100"></div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Form -->
      <div v-else class="mt-4 grid gap-4">
        <VaCard class="soft-card rounded-2xl">
          <VaCardContent class="p-4 sm:p-5">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <!-- guest_number -->
              <VaInput
                v-model.trim="form.guest_number"
                class="ctrl"
                label="Guest Number"
                placeholder="G-000001"
                clearable
              />

              <!-- vip_status -->
              <VaSelect
                v-model="form.vip_status"
                class="ctrl"
                label="VIP Status"
                :options="vipOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />

              <!-- first_name -->
              <VaInput
                v-model.trim="form.first_name"
                class="ctrl"
                label="First Name *"
                placeholder="First name"
                :error="!!errors.first_name"
                :error-messages="errors.first_name ? [errors.first_name] : []"
              />

              <!-- last_name -->
              <VaInput
                v-model.trim="form.last_name"
                class="ctrl"
                label="Last Name *"
                placeholder="Last name"
                :error="!!errors.last_name"
                :error-messages="errors.last_name ? [errors.last_name] : []"
              />

              <!-- phone -->
              <VaInput
                v-model.trim="form.phone"
                class="ctrl"
                label="Phone *"
                placeholder="010xxxxxx"
                :error="!!errors.phone"
                :error-messages="errors.phone ? [errors.phone] : []"
              />

              <!-- email -->
              <VaInput
                v-model.trim="form.email"
                class="ctrl"
                label="Email"
                placeholder="email@example.com"
                clearable
              />

              <!-- nationality -->
              <VaInput
                v-model.trim="form.nationality"
                class="ctrl"
                label="Nationality"
                placeholder="Cambodian"
                clearable
              />

              <!-- loyalty_tier -->
              <VaSelect
                v-model="form.loyalty_tier"
                class="ctrl"
                label="Loyalty Tier"
                :options="tierOptions"
                :text-by="(o) => o.text"
                :value-by="(o) => o.value"
              />

              <!-- address -->
              <div class="sm:col-span-2">
                <VaTextarea
                  v-model.trim="form.address"
                  class="ctrl"
                  label="Address"
                  :min-rows="3"
                  placeholder="Address"
                />
              </div>

              <!-- notes -->
              <div class="sm:col-span-2">
                <VaTextarea
                  v-model.trim="form.notes"
                  class="ctrl"
                  label="Notes"
                  :min-rows="4"
                  placeholder="Notes"
                />
              </div>
            </div>

            <div class="mt-5 h-px bg-slate-100"></div>

            <div class="mt-4 text-xs text-slate-500">
              Demo now (static). Later connect:
              <b>{{ isEdit ? "PUT/PATCH /guests/:id" : "POST /guests" }}</b>
              using your DB columns.
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Toast -->
        <div
          v-if="toast"
          class="rounded-2xl px-4 py-3 text-sm font-extrabold"
          :class="toast.type === 'success' ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'"
        >
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import { guests as seedGuests } from "@/data/guest/guests"

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const toast = ref(null)

const isEdit = computed(() => !!route.params.id)

const vipOptions = [
  { text: "Normal", value: 0 },
  { text: "VIP", value: 1 },
]

const tierOptions = [
  { text: "none", value: "none" },
  { text: "bronze", value: "bronze" },
  { text: "silver", value: "silver" },
  { text: "gold", value: "gold" },
  { text: "platinum", value: "platinum" },
]

// DB columns (subset used by your UI; still aligns with guests table)
const form = reactive({
  guest_id: null,
  guest_number: "",
  first_name: "",
  last_name: "",
  full_name_khmer: "",
  email: "",
  phone: "",
  phone_secondary: "",
  nationality: "Cambodian",
  loyalty_tier: "none",
  vip_status: 0,
  address: "",
  city: "",
  country: "",
  notes: "",
})

const errors = reactive({
  first_name: "",
  last_name: "",
  phone: "",
})

function setToast(type, message) {
  toast.value = { type, message }
  setTimeout(() => (toast.value = null), 2000)
}

function validate() {
  errors.first_name = ""
  errors.last_name = ""
  errors.phone = ""

  if (!String(form.first_name || "").trim()) errors.first_name = "First name is required"
  if (!String(form.last_name || "").trim()) errors.last_name = "Last name is required"
  if (!String(form.phone || "").trim()) errors.phone = "Phone is required"

  return !errors.first_name && !errors.last_name && !errors.phone
}

const canSave = computed(() => validateSilent())

function validateSilent() {
  if (!String(form.first_name || "").trim()) return false
  if (!String(form.last_name || "").trim()) return false
  if (!String(form.phone || "").trim()) return false
  return true
}

// load edit (static)
onMounted(() => {
  if (!isEdit.value) return
  loading.value = true

  setTimeout(() => {
    const id = Number(route.params.id)
    const found = (seedGuests || []).find((x) => Number(x.guest_id) === id)

    if (!found) {
      loading.value = false
      setToast("error", "Guest not found (static data).")
      return
    }

    Object.assign(form, JSON.parse(JSON.stringify(found)))
    loading.value = false
  }, 450)
})

// keep vip_status numeric for DB tinyint style
watchEffect(() => {
  form.vip_status = Number(form.vip_status || 0)
})

async function save() {
  if (!validate()) return setToast("error", "Please fill required fields.")

  saving.value = true
  try {
    // Here is the payload that matches your guests table columns (subset)
    const payload = JSON.parse(JSON.stringify(form))

    if (isEdit.value) {
      // TODO: await api.put(`/api/guests/${route.params.id}`, payload)
      console.log("UPDATE guests WHERE guest_id =", route.params.id, payload)
      setToast("success", "Updated (demo). Check console.")
    } else {
      // TODO: await api.post(`/api/guests`, payload)
      console.log("CREATE guests:", payload)
      setToast("success", "Created (demo). Check console.")
    }

    setTimeout(() => router.push("/admin/guests"), 600)
  } catch (e) {
    setToast("error", "Save failed.")
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

/* light shadow only (same system look) */
.soft-card {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}

/* Vuestic controls: soft slate input */
:deep(.ctrl .va-input-wrapper__container),
:deep(.ctrl .va-select__anchor),
:deep(.ctrl .va-textarea__container) {
  background: rgb(241 245 249) !important;
  border: 0 !important;
  border-radius: 16px !important;
  min-height: 44px !important;
}
:deep(.ctrl .va-input-wrapper__container:focus-within),
:deep(.ctrl .va-select__anchor:focus-within),
:deep(.ctrl .va-textarea__container:focus-within) {
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08) !important;
}
</style>
