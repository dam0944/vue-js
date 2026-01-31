<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">person</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
              {{ isEdit ? "Edit Guest" : "Create Guest" }}
            </h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">Clean form (no border/shadow).</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <RouterLink
            to="/admin/guests"
            class="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Back
          </RouterLink>

          <button
            type="button"
            class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            @click="save"
          >
            {{ isEdit ? "Update" : "Save" }}
          </button>
        </div>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="mt-4 space-y-3 rounded-2xl bg-white p-4">
        <div class="h-10 animate-pulse rounded-xl bg-slate-100"></div>
        <div class="h-10 animate-pulse rounded-xl bg-slate-100"></div>
        <div class="h-10 animate-pulse rounded-xl bg-slate-100"></div>
        <div class="h-40 animate-pulse rounded-xl bg-slate-100"></div>
      </div>

      <!-- Form (flat card background only) -->
      <div v-else class="mt-4 grid grid-cols-1 gap-4">
        <div class="rounded-2xl bg-white p-4 sm:p-5">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Guest Number">
              <input v-model="form.guest_number" class="input" placeholder="G-000001" />
            </Field>

            <Field label="VIP Status">
              <select v-model="form.vip_status" class="input">
                <option :value="0">Normal</option>
                <option :value="1">VIP</option>
              </select>
            </Field>

            <Field label="First Name" required>
              <input v-model="form.first_name" class="input" placeholder="First name" />
            </Field>

            <Field label="Last Name" required>
              <input v-model="form.last_name" class="input" placeholder="Last name" />
            </Field>

            <Field label="Phone" required>
              <input v-model="form.phone" class="input" placeholder="010xxxxxx" />
            </Field>

            <Field label="Email">
              <input v-model="form.email" class="input" placeholder="email@example.com" />
            </Field>

            <Field label="Nationality">
              <input v-model="form.nationality" class="input" placeholder="Cambodian" />
            </Field>

            <Field label="Loyalty Tier">
              <select v-model="form.loyalty_tier" class="input">
                <option value="none">none</option>
                <option value="bronze">bronze</option>
                <option value="silver">silver</option>
                <option value="gold">gold</option>
                <option value="platinum">platinum</option>
              </select>
            </Field>

            <Field label="Address" class="sm:col-span-2">
              <textarea v-model="form.address" class="input min-h-[90px]" placeholder="Address"></textarea>
            </Field>

            <Field label="Notes" class="sm:col-span-2">
              <textarea v-model="form.notes" class="input min-h-[110px]" placeholder="Notes"></textarea>
            </Field>
          </div>

          <!-- light separator -->
          <div class="mt-5 h-px bg-slate-100"></div>

          <div class="mt-4 text-xs text-slate-500">
            Fields follow your <code class="rounded bg-slate-100 px-1">guests</code> table.
          </div>
        </div>

        <div v-if="toast" class="rounded-2xl px-4 py-3 text-sm font-bold"
          :class="toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-900'
            : 'bg-rose-50 text-rose-900'"
        >
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { guests as seedGuests } from "@/data/guest/guests"

// const Field = (props, { slots }) => {
//   return (
//     <label class={["block", props.class || ""].join(" ")}>
//       <div class="text-xs font-bold text-slate-600">
//         {props.label}{props.required ? <span class="text-rose-600"> *</span> : null}
//       </div>
//       <div class="mt-1">{slots.default?.()}</div>
//     </label>
//   )
// }

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const toast = ref(null)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  guest_id: null,
  guest_number: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  nationality: "Cambodian",
  loyalty_tier: "none",
  vip_status: 0,
  address: "",
  notes: "",
})

function setToast(type, message) {
  toast.value = { type, message }
  setTimeout(() => (toast.value = null), 2000)
}

function validate() {
  if (!String(form.first_name || "").trim()) return "First name is required"
  if (!String(form.last_name || "").trim()) return "Last name is required"
  if (!String(form.phone || "").trim()) return "Phone is required"
  return null
}

onMounted(() => {
  if (!isEdit.value) return
  loading.value = true

  setTimeout(() => {
    const id = Number(route.params.id)
    const found = seedGuests.find(x => Number(x.guest_id) === id)
    if (!found) {
      loading.value = false
      setToast("error", "Guest not found (static data).")
      return
    }
    Object.assign(form, JSON.parse(JSON.stringify(found)))
    loading.value = false
  }, 450)
})

function save() {
  const err = validate()
  if (err) return setToast("error", err)

  setToast("success", isEdit.value ? "Updated (demo)" : "Created (demo)")
  setTimeout(() => router.push("/admin/guests"), 600)
}
</script>

<style scoped>
/* NO border, NO shadow */
.input {
  width: 100%;
  border-radius: 0.75rem;
  background: rgb(241 245 249);
  padding: 0.6rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
}
.input:focus {
  background: rgb(226 232 240);
}
</style>
