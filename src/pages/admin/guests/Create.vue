<script setup>
import { ref, reactive, computed } from "vue"
import { useRouter } from "vue-router"
import { guests as seed } from "@/data/guest/guests"

const router = useRouter()

// simulate DB
const localGuests = ref(seed.map((x) => ({ ...x })))

const form = reactive({
  guest_number: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  id_type: "National ID",
  id_number: "",
  nationality: "Cambodian",
  date_of_birth: "",
  gender: "male",
  address: "",
  city: "Phnom Penh",
  country: "Cambodia",
  postal_code: "12000",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
  is_blacklisted: false,
  blacklist_reason: "",
})

const errors = reactive({
  first_name: "",
  last_name: "",
  phone: "",
  blacklist_reason: "",
})

function makeGuestNumber(nextId) {
  return `G-${String(nextId).padStart(6, "0")}`
}

const nextGuestNumber = computed(() => {
  const nextId = Math.max(...localGuests.value.map((g) => g.guest_id || 0), 0) + 1
  return makeGuestNumber(nextId)
})

function validate() {
  errors.first_name = form.first_name.trim() ? "" : "First name is required"
  errors.last_name = form.last_name.trim() ? "" : "Last name is required"
  errors.phone = form.phone.trim() ? "" : "Phone is required"

  if (form.is_blacklisted) {
    errors.blacklist_reason = form.blacklist_reason.trim()
      ? ""
      : "Blacklist reason is required"
  } else {
    errors.blacklist_reason = ""
  }

  return !errors.first_name && !errors.last_name && !errors.phone && !errors.blacklist_reason
}

function pad(n) {
  return String(n).padStart(2, "0")
}
function nowTs() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:00`
}

function save() {
  if (!validate()) return

  const nextId = Math.max(...localGuests.value.map((g) => g.guest_id || 0), 0) + 1
  const ts = nowTs()

  localGuests.value.unshift({
    guest_id: nextId,
    guest_number: form.guest_number.trim() || nextGuestNumber.value,
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    id_type: form.id_type,
    id_number: form.id_number.trim(),
    nationality: form.nationality.trim(),
    date_of_birth: form.date_of_birth || null,
    gender: form.gender,
    address: form.address.trim(),
    city: form.city.trim(),
    country: form.country.trim(),
    postal_code: form.postal_code.trim(),
    emergency_contact_name: form.emergency_contact_name.trim(),
    emergency_contact_phone: form.emergency_contact_phone.trim(),
    notes: form.notes.trim(),
    is_blacklisted: !!form.is_blacklisted,
    blacklist_reason: form.is_blacklisted ? form.blacklist_reason.trim() || "Blacklisted" : null,
    created_at: ts,
    updated_at: ts,
  })

  router.push("/admin/guests")
}

function cancel() {
  router.push("/admin/guests")
}

const genderOptions = [
  { text: "Male", value: "male" },
  { text: "Female", value: "female" },
  { text: "Other", value: "other" },
  { text: "Prefer not to say", value: "prefer_not_to_say" },
]

const idTypeOptions = ["National ID", "Passport", "Driver License"]
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto px-7 py-6">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900">Create Guest</h1>
          <p class="mt-1 text-sm font-semibold text-slate-500">
            Quick registration for Guesthouse
          </p>
        </div>

        <div class="flex gap-2">
          <VaButton preset="secondary" @click="cancel">Cancel</VaButton>
          <VaButton color="success" icon="save" @click="save">Save Guest</VaButton>
        </div>
      </div>

      <!-- Form grid -->
      <div class="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Basic -->
        <VaCard class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-black text-slate-900">Basic Info</div>
              <div class="mt-1 text-xs font-extrabold text-slate-500">
                Required: First name, Last name, Phone
              </div>
            </div>

            <div class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">
              Next: {{ nextGuestNumber }}
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <VaInput
              v-model="form.guest_number"
              label="Guest Number"
              :placeholder="nextGuestNumber"
              class="sm:col-span-2"
            />

            <VaInput v-model="form.first_name" label="First Name *" :error="!!errors.first_name" :error-messages="errors.first_name" />
            <VaInput v-model="form.last_name" label="Last Name *" :error="!!errors.last_name" :error-messages="errors.last_name" />

            <VaInput v-model="form.phone" label="Phone *" :error="!!errors.phone" :error-messages="errors.phone" />
            <VaInput v-model="form.email" label="Email" placeholder="optional" />

            <VaSelect
              v-model="form.gender"
              label="Gender"
              :options="genderOptions"
              text-by="text"
              value-by="value"
            />

            <VaInput v-model="form.date_of_birth" type="date" label="Date of Birth" />
          </div>
        </VaCard>

        <!-- Identity + Location -->
        <VaCard class="p-5">
          <div class="text-sm font-black text-slate-900">Identity & Location</div>

          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <VaSelect v-model="form.id_type" label="ID Type" :options="idTypeOptions" />
            <VaInput v-model="form.id_number" label="ID Number" />

            <VaInput v-model="form.nationality" label="Nationality" />
            <VaInput v-model="form.postal_code" label="Postal Code" />

            <VaInput v-model="form.address" label="Address" class="sm:col-span-2" />
            <VaInput v-model="form.city" label="City" />
            <VaInput v-model="form.country" label="Country" />
          </div>
        </VaCard>

        <!-- Emergency + Notes + Blacklist -->
        <VaCard class="p-5 lg:col-span-2">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="text-sm font-black text-slate-900">Emergency & Notes</div>
              <div class="mt-1 text-xs font-extrabold text-slate-500">
                Optional, but helpful for service.
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-sm font-extrabold text-slate-700">Blacklisted</span>
              <VaSwitch v-model="form.is_blacklisted" />
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <VaInput v-model="form.emergency_contact_name" label="Emergency Contact Name" />
            <VaInput v-model="form.emergency_contact_phone" label="Emergency Contact Phone" />

            <VaTextarea v-model="form.notes" label="Notes" class="sm:col-span-2" :max-rows="3" />

            <VaInput
              v-if="form.is_blacklisted"
              v-model="form.blacklist_reason"
              label="Blacklist Reason *"
              class="sm:col-span-2"
              :error="!!errors.blacklist_reason"
              :error-messages="errors.blacklist_reason"
            />
          </div>

          <!-- Preview strip -->
          <div class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            <div class="text-xs font-extrabold text-slate-500">Preview</div>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-700">
                {{ form.guest_number || nextGuestNumber }}
              </span>
              <span class="text-sm font-black text-slate-900">
                {{ (form.first_name || "First") }} {{ (form.last_name || "Last") }}
              </span>
              <span class="text-xs font-extrabold text-slate-500">•</span>
              <span class="text-sm font-extrabold text-slate-700">{{ form.phone || "Phone" }}</span>

              <span
                class="rounded-full border px-3 py-1 text-xs font-black"
                :class="form.is_blacklisted
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'"
              >
                {{ form.is_blacklisted ? "BLACKLISTED" : "ACTIVE" }}
              </span>
            </div>
          </div>
        </VaCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Small polish for Vuestic + Tailwind */
:deep(.va-input__container),
:deep(.va-select__container),
:deep(.va-textarea__container) {
  border-radius: 12px;
  background: #f8fafc;
}
:deep(.va-button) {
  border-radius: 12px;
  font-weight: 800;
}
</style>
