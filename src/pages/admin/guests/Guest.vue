<script setup>
import { ref, computed, reactive, nextTick, watch } from "vue"
import $ from "jquery"
import { guests as seed } from "@/data/guest/guests"

const guests = ref(seed.map((x) => ({ ...x })))

// ---------------- Filters ----------------
const q = ref("")
const status = ref("") // active | blacklisted | ""
const gender = ref("") // male | female | other | ""
const sort = ref("newest")

const safe = (v) => (v ?? "").toString().toLowerCase()
const fullName = (g) => [g?.first_name, g?.last_name].filter(Boolean).join(" ") || "-"

const filtered = computed(() => {
  const key = safe(q.value)

  let list = guests.value.filter((g) => {
    const hit =
      !key ||
      safe(g.guest_number).includes(key) ||
      safe(fullName(g)).includes(key) ||
      safe(g.phone).includes(key) ||
      safe(g.email).includes(key) ||
      safe(g.nationality).includes(key) ||
      safe(g.id_number).includes(key)

    const okStatus =
      !status.value ||
      (status.value === "active" && !g.is_blacklisted) ||
      (status.value === "blacklisted" && g.is_blacklisted)

    const okGender = !gender.value || safe(g.gender) === safe(gender.value)

    return hit && okStatus && okGender
  })

  if (sort.value === "newest") list.sort((a, b) => (b.guest_id || 0) - (a.guest_id || 0))
  if (sort.value === "oldest") list.sort((a, b) => (a.guest_id || 0) - (b.guest_id || 0))
  if (sort.value === "name") list.sort((a, b) => fullName(a).localeCompare(fullName(b)))
  if (sort.value === "phone") list.sort((a, b) => safe(a.phone).localeCompare(safe(b.phone)))

  return list
})

// ---------------- Stats ----------------
const stats = computed(() => {
  const total = guests.value.length
  const blacklisted = guests.value.filter((g) => g.is_blacklisted).length
  const active = total - blacklisted
  return { total, active, blacklisted }
})

function badgeClass(g) {
  return g?.is_blacklisted
    ? "border-rose-200 bg-rose-50 text-rose-800"
    : "border-emerald-200 bg-emerald-50 text-emerald-800"
}

// ---------------- View (Vuestic Modal UI) ----------------
const viewOpen = ref(false)
const selected = ref(null)

function openView(g) {
  selected.value = g
  viewOpen.value = true
}
function closeView() {
  viewOpen.value = false
  selected.value = null
}

// ---------------- SlideDown Create/Edit (Vuestic Panel) ----------------
const slideOpen = ref(false)
const slideMode = ref("create") // create | edit
const slidePanelRef = ref(null)

// ---------------- Form ----------------
const form = reactive({
  guest_id: null,
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
  state: "",
  country: "Cambodia",
  postal_code: "12000",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
  is_blacklisted: false,
  blacklist_reason: "",
})

const idTypeOptions = ["National ID", "Passport", "Driver License"]
const genderOptions = [
  { text: "Male", value: "male" },
  { text: "Female", value: "female" },
  { text: "Other", value: "other" },
  { text: "Prefer not to say", value: "prefer_not_to_say" },
]

function makeGuestNumber(nextId) {
  return `G-${String(nextId).padStart(6, "0")}`
}

function resetForm() {
  const nextId = Math.max(...guests.value.map((g) => g.guest_id || 0), 0) + 1
  form.guest_id = null
  form.guest_number = makeGuestNumber(nextId)
  form.first_name = ""
  form.last_name = ""
  form.email = ""
  form.phone = ""
  form.id_type = "National ID"
  form.id_number = ""
  form.nationality = "Cambodian"
  form.date_of_birth = ""
  form.gender = "male"
  form.address = ""
  form.city = "Phnom Penh"
  form.state = ""
  form.country = "Cambodia"
  form.postal_code = "12000"
  form.emergency_contact_name = ""
  form.emergency_contact_phone = ""
  form.notes = ""
  form.is_blacklisted = false
  form.blacklist_reason = ""
}

function fillFormFromGuest(g) {
  form.guest_id = g.guest_id
  form.guest_number = g.guest_number
  form.first_name = g.first_name || ""
  form.last_name = g.last_name || ""
  form.email = g.email || ""
  form.phone = g.phone || ""
  form.id_type = g.id_type || "National ID"
  form.id_number = g.id_number || ""
  form.nationality = g.nationality || "Cambodian"
  form.date_of_birth = g.date_of_birth || ""
  form.gender = g.gender || "male"
  form.address = g.address || ""
  form.city = g.city || "Phnom Penh"
  form.state = g.state || ""
  form.country = g.country || "Cambodia"
  form.postal_code = g.postal_code || "12000"
  form.emergency_contact_name = g.emergency_contact_name || ""
  form.emergency_contact_phone = g.emergency_contact_phone || ""
  form.notes = g.notes || ""
  form.is_blacklisted = !!g.is_blacklisted
  form.blacklist_reason = g.blacklist_reason || ""
}

// ---- jQuery animation (top->bottom) ----
function slideDownPanel() {
  nextTick(() => {
    const el = slidePanelRef.value
    if (!el) return
    $(el).stop(true, true).hide().slideDown(260)
  })
}
function slideUpPanel(cb) {
  const el = slidePanelRef.value
  if (!el) return cb?.()
  $(el).stop(true, true).slideUp(200, () => cb?.())
}

function openCreate() {
  slideMode.value = "create"
  resetForm()
  slideOpen.value = true
  slideDownPanel()
}

function openEdit(g) {
  slideMode.value = "edit"
  selected.value = g
  fillFormFromGuest(g)
  slideOpen.value = true
  slideDownPanel()
}

function closeSlide() {
  slideUpPanel(() => {
    slideOpen.value = false
  })
}

// ---------------- Save ----------------
function saveCreate() {
  if (!form.first_name.trim() || !form.last_name.trim() || !form.phone.trim()) {
    alert("First name, Last name, and Phone are required.")
    return
  }

  const nextId = Math.max(...guests.value.map((g) => g.guest_id || 0), 0) + 1
  const now = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:00`

  guests.value.unshift({
    guest_id: nextId,
    guest_number: form.guest_number || makeGuestNumber(nextId),
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
    state: form.state.trim(),
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

  closeSlide()
}

function saveEdit() {
  const idx = guests.value.findIndex((x) => x.guest_id === form.guest_id)
  if (idx === -1) return closeSlide()

  const now = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:00`

  const old = guests.value[idx]
  guests.value.splice(idx, 1, {
    ...old,
    guest_number: form.guest_number,
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
    state: form.state.trim(),
    country: form.country.trim(),
    postal_code: form.postal_code.trim(),
    emergency_contact_name: form.emergency_contact_name.trim(),
    emergency_contact_phone: form.emergency_contact_phone.trim(),
    notes: form.notes.trim(),
    is_blacklisted: !!form.is_blacklisted,
    blacklist_reason: form.is_blacklisted ? form.blacklist_reason.trim() || "Blacklisted" : null,
    updated_at: ts,
  })

  closeSlide()
}

// lock scroll
watch(slideOpen, (v) => (document.body.style.overflow = v ? "hidden" : ""))
watch(viewOpen, (v) => (document.body.style.overflow = v ? "hidden" : document.body.style.overflow))
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto px-7 py-6">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900">Guests</h1>
          <p class="mt-1 text-sm font-semibold text-slate-500">
            Guest directory • VIP notes • Blacklist control
          </p>
        </div>

        <div class="flex gap-2">
          <VaButton preset="secondary" @click="q=''; status=''; gender=''; sort='newest'">Reset</VaButton>
          <VaButton color="success" icon="add" @click="openCreate">Add Guest</VaButton>
        </div>
      </div>

      <!-- Stats -->
      <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <VaCard class="p-4">
          <div class="text-xs font-extrabold text-slate-500">Total Guests</div>
          <div class="mt-1 text-2xl font-black text-slate-900">{{ stats.total }}</div>
        </VaCard>

        <VaCard class="p-4 border border-emerald-200 bg-emerald-50">
          <div class="text-xs font-extrabold text-emerald-700">Active</div>
          <div class="mt-1 text-2xl font-black text-emerald-900">{{ stats.active }}</div>
        </VaCard>

        <VaCard class="p-4 border border-rose-200 bg-rose-50">
          <div class="text-xs font-extrabold text-rose-700">Blacklisted</div>
          <div class="mt-1 text-2xl font-black text-rose-900">{{ stats.blacklisted }}</div>
        </VaCard>
      </div>

      <!-- Filters -->
      <VaCard class="mt-4 p-4">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div class="md:col-span-2">
            <VaInput v-model="q" label="Search" placeholder="Guest no, name, phone, email, ID..." />
          </div>

          <VaSelect
            v-model="status"
            label="Status"
            :options="[
              { text: 'All', value: '' },
              { text: 'Active', value: 'active' },
              { text: 'Blacklisted', value: 'blacklisted' },
            ]"
            text-by="text"
            value-by="value"
          />

          <VaSelect
            v-model="gender"
            label="Gender"
            :options="[
              { text: 'All', value: '' },
              { text: 'Male', value: 'male' },
              { text: 'Female', value: 'female' },
              { text: 'Other', value: 'other' },
            ]"
            text-by="text"
            value-by="value"
          />

          <VaSelect
            v-model="sort"
            label="Sort"
            :options="[
              { text: 'Newest', value: 'newest' },
              { text: 'Oldest', value: 'oldest' },
              { text: 'Name', value: 'name' },
              { text: 'Phone', value: 'phone' },
            ]"
            text-by="text"
            value-by="value"
          />
        </div>
      </VaCard>

      <!-- Table -->
      <VaCard class="mt-4 p-0 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-slate-50">
              <tr class="text-left text-xs font-black uppercase tracking-wide text-slate-500">
                <th class="px-4 py-3">Guest</th>
                <th class="px-4 py-3">Contact</th>
                <th class="px-4 py-3">Nationality</th>
                <th class="px-4 py-3">ID</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr v-if="filtered.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-sm font-extrabold text-slate-500">
                  No guests found.
                </td>
              </tr>

              <tr v-for="g in filtered" :key="g.guest_id" class="hover:bg-slate-50">
                <td class="px-4 py-3">
                  <div class="text-sm font-black text-slate-900">{{ fullName(g) }}</div>
                  <div class="mt-1 text-xs font-extrabold text-slate-500">
                    {{ g.guest_number }} • {{ (g.gender || "-").toUpperCase() }}
                  </div>
                </td>

                <td class="px-4 py-3">
                  <div class="text-sm font-semibold text-slate-800">{{ g.phone || "-" }}</div>
                  <div class="mt-1 text-xs font-extrabold text-slate-500">{{ g.email || "-" }}</div>
                </td>

                <td class="px-4 py-3">
                  <div class="text-sm font-semibold text-slate-800">{{ g.nationality || "-" }}</div>
                  <div class="mt-1 text-xs font-extrabold text-slate-500">
                    {{ g.city || "-" }}, {{ g.country || "-" }}
                  </div>
                </td>

                <td class="px-4 py-3">
                  <div class="text-sm font-semibold text-slate-800">{{ g.id_type || "-" }}</div>
                  <div class="mt-1 text-xs font-extrabold text-slate-500">{{ g.id_number || "-" }}</div>
                </td>

                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-black"
                    :class="badgeClass(g)"
                  >
                    {{ g.is_blacklisted ? "BLACKLISTED" : "ACTIVE" }}
                  </span>
                </td>

                <td class="px-4 py-3 text-right">
                  <div class="inline-flex flex-wrap justify-end gap-2">
                    <VaButton size="small" preset="secondary" @click="openView(g)">View</VaButton>
                    <VaButton size="small" color="primary" @click="openEdit(g)">Edit</VaButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </VaCard>
    </div>

    <!-- ===================== VIEW MODAL ===================== -->
    <Teleport to="body">
      <div v-if="viewOpen" class="m-wrap" @click="closeView">
        <VaCard class="m" @click.stop>
          <div class="m-head">
            <div>
              <div class="m-title">Guest Details</div>
              <div class="m-sub">{{ selected?.guest_number }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeView">Close</VaButton>
          </div>

          <div class="m-body">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2" v-if="selected">
              <VaCard class="p-4">
                <div class="text-xs font-extrabold text-slate-500">Name</div>
                <div class="mt-1 text-lg font-black text-slate-900">{{ fullName(selected) }}</div>
                <div class="mt-1 text-xs font-extrabold text-slate-500">
                  Phone: {{ selected?.phone || "-" }} • Email: {{ selected?.email || "-" }}
                </div>
              </VaCard>

              <VaCard class="p-4">
                <div class="text-xs font-extrabold text-slate-500">Status</div>
                <div class="mt-2">
                  <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-black" :class="badgeClass(selected)">
                    {{ selected?.is_blacklisted ? "BLACKLISTED" : "ACTIVE" }}
                  </span>
                </div>
                <div v-if="selected?.is_blacklisted && selected?.blacklist_reason" class="mt-2 text-xs font-semibold text-rose-700">
                  Reason: {{ selected.blacklist_reason }}
                </div>
              </VaCard>
            </div>
          </div>

          <div class="m-foot">
            <VaButton preset="secondary" @click="closeView">Close</VaButton>
            <VaButton color="primary" @click="closeView(); openEdit(selected)">Edit</VaButton>
          </div>
        </VaCard>
      </div>
    </Teleport>

    <!-- ===================== CREATE/EDIT SLIDE DOWN PANEL ===================== -->
    <Teleport to="body">
      <div v-show="slideOpen" class="slide-overlay" @click="closeSlide">
        <div ref="slidePanelRef" class="slide-panel" @click.stop>
          <div class="slide-head">
            <div>
              <div class="slide-title">{{ slideMode === "create" ? "Create Guest" : "Edit Guest" }}</div>
              <div class="slide-sub">{{ form.guest_number }}</div>
            </div>

            <div class="flex gap-2">
              <VaButton preset="secondary" @click="closeSlide">Cancel</VaButton>
              <VaButton color="success" icon="save" @click="slideMode === 'create' ? saveCreate() : saveEdit()">
                Save
              </VaButton>
            </div>
          </div>

          <div class="slide-body">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <VaCard class="p-4">
                <div class="mb-3 text-sm font-black text-slate-900">Basic</div>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <VaInput v-model="form.guest_number" label="Guest No." />
                  <VaInput v-model="form.phone" label="Phone *" />
                  <VaInput v-model="form.first_name" label="First Name *" />
                  <VaInput v-model="form.last_name" label="Last Name *" />
                  <VaInput class="sm:col-span-2" v-model="form.email" label="Email" />
                  <VaSelect
                    v-model="form.gender"
                    label="Gender"
                    :options="genderOptions"
                    text-by="text"
                    value-by="value"
                  />
                  <VaInput v-model="form.date_of_birth" label="Date of birth" type="date" />
                </div>
              </VaCard>

              <VaCard class="p-4">
                <div class="mb-3 text-sm font-black text-slate-900">Identity & Location</div>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <VaSelect v-model="form.id_type" label="ID Type" :options="idTypeOptions" />
                  <VaInput v-model="form.id_number" label="ID Number" />
                  <VaInput v-model="form.nationality" label="Nationality" />
                  <VaInput v-model="form.postal_code" label="Postal Code" />
                  <VaInput class="sm:col-span-2" v-model="form.address" label="Address" />
                  <VaInput v-model="form.city" label="City" />
                  <VaInput v-model="form.country" label="Country" />
                </div>
              </VaCard>

              <VaCard class="p-4 lg:col-span-2">
                <div class="mb-3 text-sm font-black text-slate-900">Emergency + Notes</div>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <VaInput v-model="form.emergency_contact_name" label="Emergency Contact" />
                  <VaInput v-model="form.emergency_contact_phone" label="Emergency Phone" />
                  <VaTextarea class="sm:col-span-2" v-model="form.notes" label="Notes" :max-rows="3" />

                  <VaCard class="sm:col-span-2 p-4 bg-slate-50 border border-slate-200">
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <div class="text-sm font-black text-slate-900">Blacklist</div>
                        <div class="text-xs font-extrabold text-slate-500">Block guest from booking if needed</div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-extrabold text-slate-700">Blacklisted</span>
                        <VaSwitch v-model="form.is_blacklisted" />
                      </div>
                    </div>

                    <div v-if="form.is_blacklisted" class="mt-3">
                      <VaInput v-model="form.blacklist_reason" label="Reason *" placeholder="Reason..." />
                    </div>
                  </VaCard>
                </div>
              </VaCard>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* view modal */
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
  width: min(900px, 100%);
  max-height: 92vh;
  overflow: hidden;
}
.m-head {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  max-height: calc(92vh - 120px);
}
.m-foot {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  background: #fff;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* slide overlay */
.slide-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.45);
  overflow: auto;
}

/* IMPORTANT: jQuery controls display */
.slide-panel {
  display: none;
  /* width: min(1100px, 100%); */
  width: 99%;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #eef2f6;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}

.slide-head {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.slide-title {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.slide-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}
.slide-body {
  padding: 16px;
}
</style>
