<!-- src/pages/admin/rooms/RoomKeyForm.vue
  ✅ Vuestic UI version
  ✅ Follow DB table room_keys fields:
     key_id (edit only), room_id, key_number, key_type, status,
     issued_to_reservation_id, issued_at, returned_at, replacement_cost, notes
-->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto w-full">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <VaIcon :name="isEdit ? 'edit' : 'add'" color="secondary" />
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
              {{ isEdit ? "Edit Room Key" : "Create Room Key" }}
            </h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Table: <b>room_keys</b>
            <span v-if="isEdit"> • key_id: <b>{{ keyId }}</b></span>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <VaButton preset="secondary" class="rounded-2xl font-extrabold" @click="router.back()">
            Back
          </VaButton>

          <VaButton color="primary" class="rounded-2xl font-extrabold" :disabled="!canSave" @click="submit">
            <VaIcon name="save" class="mr-1" />
            {{ isEdit ? "Update" : "Save" }}
          </VaButton>
        </div>
      </div>

      <!-- Not found -->
      <VaCard v-if="isEdit && !found" class="soft-card mt-4 rounded-2xl">
        <VaCardContent class="p-6 text-center">
          <div class="text-slate-900 font-extrabold">Key not found</div>
          <div class="mt-1 text-sm text-slate-500">This key_id does not exist in your static data.</div>
          <VaButton color="primary" class="mt-4 rounded-2xl font-extrabold" @click="router.push('/rooms/keys')">
            Back to list
          </VaButton>
        </VaCardContent>
      </VaCard>

      <!-- Form -->
      <VaCard v-else class="soft-card mt-4 rounded-2xl">
        <VaCardContent class="p-4">
          <div class="grid gap-3 sm:grid-cols-2">
            <!-- room_id -->
            <VaSelect
              v-model.number="form.room_id"
              class="ctrl sm:col-span-2"
              label="Room (room_id) *"
              :options="roomOptions"
              :text-by="(o) => o.text"
              :value-by="(o) => o.value"
              :error="!!errors.room_id"
              :error-messages="errors.room_id ? [errors.room_id] : []"
            />

            <!-- key_number -->
            <VaInput
              v-model.trim="form.key_number"
              class="ctrl"
              label="Key Number *"
              placeholder="101-A"
              :error="!!errors.key_number"
              :error-messages="errors.key_number ? [errors.key_number] : []"
            />

            <!-- key_type -->
            <VaSelect
              v-model="form.key_type"
              class="ctrl"
              label="Key Type *"
              :options="keyTypeOptions"
              :text-by="(o) => o.text"
              :value-by="(o) => o.value"
              :error="!!errors.key_type"
              :error-messages="errors.key_type ? [errors.key_type] : []"
            />

            <!-- status -->
            <div class="sm:col-span-2">
              <div class="mb-1 text-xs font-bold text-slate-500">Status *</div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="s in statusList"
                  :key="s"
                  type="button"
                  class="status-pill"
                  :class="form.status === s ? statusPillActive(s) : statusPillIdle(s)"
                  @click="form.status = s"
                >
                  {{ pretty(s) }}
                </button>
              </div>
              <div v-if="errors.status" class="mt-1 text-xs font-extrabold text-rose-600">{{ errors.status }}</div>
            </div>

            <!-- replacement_cost -->
            <VaInput
              v-model.number="form.replacement_cost"
              class="ctrl"
              type="number"
              min="0"
              step="0.01"
              label="Replacement Cost"
            />

            <!-- issued_to_reservation_id -->
            <VaInput
              v-model.number="form.issued_to_reservation_id"
              class="ctrl sm:col-span-2"
              type="number"
              min="0"
              label="Issued To Reservation ID"
              placeholder="reservation_id"
              :error="!!errors.issued_to_reservation_id"
              :error-messages="errors.issued_to_reservation_id ? [errors.issued_to_reservation_id] : []"
            />
            <div class="sm:col-span-2 -mt-2 text-[11px] text-slate-500">
              If status = <b>issued</b>, reservation_id should be filled.
            </div>

            <!-- issued_at -->
            <VaInput
              v-model.trim="form.issued_at"
              class="ctrl"
              label="Issued At"
              placeholder="YYYY-MM-DD HH:mm:ss"
            />

            <!-- returned_at -->
            <VaInput
              v-model.trim="form.returned_at"
              class="ctrl"
              label="Returned At"
              placeholder="YYYY-MM-DD HH:mm:ss"
            />

            <!-- notes -->
            <VaTextarea
              v-model.trim="form.notes"
              class="ctrl sm:col-span-2"
              label="Notes"
              :min-rows="3"
              placeholder="Any notes..."
            />

            <!-- Quick actions -->
            <div class="sm:col-span-2 grid gap-2 sm:grid-cols-2">
              <VaButton
                preset="secondary"
                class="rounded-2xl font-extrabold"
                :disabled="form.status !== 'issued'"
                @click="markReturned"
              >
                Mark Returned (Available)
              </VaButton>

              <VaButton
                color="danger"
                preset="secondary"
                class="rounded-2xl font-extrabold"
                @click="form.status = 'lost'"
              >
                Mark Lost
              </VaButton>
            </div>
          </div>

          <div class="mt-3 text-[11px] text-slate-500">
            Demo now (static). Later connect:
            <b>{{ isEdit ? "PUT/PATCH room_keys" : "POST room_keys" }}</b>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Toast -->
      <div
        v-if="toast"
        class="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-3 text-white"
      >
        <div class="flex items-start gap-2">
          <span class="material-icons text-[18px]">info</span>
          <div class="text-sm font-bold">{{ toast }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import { roomKeysData } from "@/data/room/roomKeysData"

const route = useRoute()
const router = useRouter()

// mode
const keyId = computed(() => Number(route.params.key_id || 0))
const isEdit = computed(() => !!route.params.key_id)

/**
 * Accept legacy grouped static data:
 * roomKeysData = [{ room_id, room_number, keys:[{...room_keys columns...}] }]
 */
function flatten(data) {
  const rooms = (data || []).map((r) => ({ room_id: Number(r.room_id), room_number: String(r.room_number) }))
  const keys = []
  for (const r of data || []) {
    for (const k of r.keys || []) {
      keys.push({
        key_id: Number(k.key_id),
        room_id: Number(r.room_id),
        key_number: String(k.key_number || ""),
        key_type: String(k.key_type || "physical"),
        status: String(k.status || "available"),
        issued_to_reservation_id: k.issued_to_reservation_id ?? null,
        issued_at: k.issued_at ?? null,
        returned_at: k.returned_at ?? null,
        replacement_cost: Number(k.replacement_cost ?? 0),
        notes: String(k.notes ?? ""),
      })
    }
  }
  return { rooms, keys }
}

const { rooms: roomsList, keys: keysList } = flatten(roomKeysData)
const rooms = computed(() => roomsList)

const foundKey = computed(() => keysList.find((x) => x.key_id === keyId.value) || null)
const found = computed(() => !isEdit.value || !!foundKey.value)

// form (DB columns except key_id)
const form = reactive({
  room_id: 0,
  key_number: "",
  key_type: "physical",
  status: "available",
  issued_to_reservation_id: null,
  issued_at: "",
  returned_at: "",
  replacement_cost: 5.0,
  notes: "",
})

// load existing when edit
watchEffect(() => {
  if (!isEdit.value) return
  if (!foundKey.value) return
  const copy = JSON.parse(JSON.stringify(foundKey.value))
  Object.assign(form, copy)
  // ensure strings for inputs
  form.issued_at = copy.issued_at ?? ""
  form.returned_at = copy.returned_at ?? ""
})

// small auto rules
watchEffect(() => {
  if (form.status !== "issued") {
    // clear reservation id when not issued (optional rule)
    form.issued_to_reservation_id = null
  }
  if (form.status === "available" && !form.returned_at && (form.issued_at || "").length) {
    // keep returned empty unless user clicks Mark Returned
  }
})

// Vuestic select options
const roomOptions = computed(() => [
  { text: "Select room", value: 0, disabled: true },
  ...rooms.value.map((r) => ({ text: `Room ${r.room_number}`, value: r.room_id })),
])

const keyTypeOptions = [
  { text: "Physical", value: "physical" },
  { text: "Card", value: "card" },
  { text: "Code", value: "code" },
  { text: "Digital", value: "digital" },
]

const statusList = ["available", "issued", "lost", "damaged"]

// validation
const errors = reactive({
  room_id: "",
  key_number: "",
  key_type: "",
  status: "",
  issued_to_reservation_id: "",
})

function validate() {
  errors.room_id = ""
  errors.key_number = ""
  errors.key_type = ""
  errors.status = ""
  errors.issued_to_reservation_id = ""

  if (!found.value) return false
  if (!form.room_id) errors.room_id = "Room is required"
  if (!form.key_number) errors.key_number = "Key number is required"
  if (!form.key_type) errors.key_type = "Key type is required"
  if (!form.status) errors.status = "Status is required"

  if (form.status === "issued" && !form.issued_to_reservation_id) {
    errors.issued_to_reservation_id = "Reservation ID is required when status is Issued"
  }

  return (
    !errors.room_id &&
    !errors.key_number &&
    !errors.key_type &&
    !errors.status &&
    !errors.issued_to_reservation_id
  )
}

const canSave = computed(() => validate())

// toast
const toast = ref("")
let t = null
function showToast(m) {
  toast.value = m
  clearTimeout(t)
  t = setTimeout(() => (toast.value = ""), 2000)
}

function nowStamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`
}

function markReturned() {
  form.status = "available"
  form.returned_at = nowStamp()
  form.issued_to_reservation_id = null
  showToast("Returned (demo).")
}

function submit() {
  if (!validate()) return showToast("Please fill required fields.")

  const payload = JSON.parse(JSON.stringify(form))

  if (isEdit.value) {
    console.log("UPDATE room_keys WHERE key_id =", keyId.value, payload)
    showToast("Updated (demo). Check console.")
  } else {
    console.log("CREATE room_keys:", payload)
    showToast("Created (demo). Check console.")
  }

  setTimeout(() => router.push("/rooms/keys"), 600)
}

function pretty(s) {
  if (!s) return "-"
  return String(s).replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())
}

function statusPillActive(s) {
  // active (selected)
  switch (s) {
    case "available":
      return "bg-emerald-600 text-white"
    case "issued":
      return "bg-blue-600 text-white"
    case "lost":
      return "bg-rose-600 text-white"
    case "damaged":
      return "bg-amber-600 text-white"
    default:
      return "bg-slate-900 text-white"
  }
}
function statusPillIdle(s) {
  // idle (not selected)
  switch (s) {
    case "available":
      return "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
    case "issued":
      return "bg-blue-50 text-blue-800 hover:bg-blue-100"
    case "lost":
      return "bg-rose-50 text-rose-800 hover:bg-rose-100"
    case "damaged":
      return "bg-amber-50 text-amber-800 hover:bg-amber-100"
    default:
      return "bg-slate-100 text-slate-800 hover:bg-slate-200"
  }
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

/* light shadow only */
.soft-card {
  border: none !important;
  box-shadow: 0 6px 18px rgba(2, 8, 23, 0.06) !important;
  background: #fff !important;
}

/* Vuestic controls like soft inputs */
:deep(.ctrl .va-input-wrapper__container),
:deep(.ctrl .va-select__anchor),
:deep(.ctrl .va-textarea__container) {
  background: rgb(241 245 249) !important; /* slate-100 */
  border: 0 !important;
  border-radius: 16px !important;
  min-height: 44px !important;
}
:deep(.ctrl .va-input-wrapper__container:focus-within),
:deep(.ctrl .va-select__anchor:focus-within),
:deep(.ctrl .va-textarea__container:focus-within) {
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08) !important;
}

/* status pills */
.status-pill {
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  transition: 0.15s ease;
}
</style>
