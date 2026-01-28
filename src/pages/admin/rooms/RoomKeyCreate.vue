<!-- src/pages/admin/rooms/RoomKeyForm.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto ">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">{{ isEdit ? "edit" : "add" }}</span>
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
          <button
            class="rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-200"
            type="button"
            @click="router.back()"
          >
            Back
          </button>

          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-40"
            :disabled="!canSave"
            type="button"
            @click="submit"
          >
            <span class="material-icons mr-1 align-middle text-[18px]">save</span>
            {{ isEdit ? "Update" : "Save" }}
          </button>
        </div>
      </div>

      <!-- Not found -->
      <div v-if="isEdit && !found" class="mt-4 rounded-2xl bg-white p-6 text-center">
        <div class="text-slate-900 font-extrabold">Key not found</div>
        <div class="mt-1 text-sm text-slate-500">
          This key_id does not exist in your static data.
        </div>
        <button
          class="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
          type="button"
          @click="router.push('/rooms/keys')"
        >
          Back to list
        </button>
      </div>

      <!-- Form -->
      <section v-else class="mt-4 rounded-2xl bg-white p-4">
        <div class="grid gap-3 sm:grid-cols-2">
          <!-- room_id -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-bold text-slate-500">Room (room_id) *</label>
            <select
              v-model.number="form.room_id"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
            >
              <option disabled :value="0">Select room</option>
              <option v-for="r in rooms" :key="r.room_id" :value="r.room_id">
                Room {{ r.room_number }}
              </option>
            </select>
          </div>

          <!-- key_number -->
          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Key Number *</label>
            <input
              v-model.trim="form.key_number"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="101-A"
            />
          </div>

          <!-- key_type -->
          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Key Type *</label>
            <select
              v-model="form.key_type"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
            >
              <option value="physical">Physical</option>
              <option value="card">Card</option>
              <option value="code">Code</option>
              <option value="digital">Digital</option>
            </select>
          </div>

          <!-- status -->
          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Status *</label>
            <select
              v-model="form.status"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
            >
              <option value="available">Available</option>
              <option value="issued">Issued</option>
              <option value="lost">Lost</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>

          <!-- replacement_cost -->
          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Replacement Cost</label>
            <input
              v-model.number="form.replacement_cost"
              type="number"
              min="0"
              step="0.01"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
            />
          </div>

          <!-- issued_to_reservation_id -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-bold text-slate-500">Issued To Reservation ID</label>
            <input
              v-model.number="form.issued_to_reservation_id"
              type="number"
              min="0"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="reservation_id"
            />
            <div class="mt-1 text-[11px] text-slate-500">
              If status = <b>issued</b>, reservation_id should be filled.
            </div>
          </div>

          <!-- issued_at -->
          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Issued At</label>
            <input
              v-model.trim="form.issued_at"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="YYYY-MM-DD HH:mm:ss"
            />
          </div>

          <!-- returned_at -->
          <div>
            <label class="mb-1 block text-xs font-bold text-slate-500">Returned At</label>
            <input
              v-model.trim="form.returned_at"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="YYYY-MM-DD HH:mm:ss"
            />
          </div>

          <!-- notes -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-bold text-slate-500">Notes</label>
            <textarea
              v-model.trim="form.notes"
              rows="3"
              class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="Any notes..."
            />
          </div>

          <!-- Quick actions -->
          <div class="sm:col-span-2 grid gap-2 sm:grid-cols-2">
            <button
              class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-200 disabled:opacity-40"
              type="button"
              :disabled="form.status !== 'issued'"
              @click="markReturned"
            >
              Mark Returned (Available)
            </button>

            <button
              class="rounded-2xl bg-rose-100 px-4 py-3 text-sm font-extrabold text-rose-700 hover:bg-rose-200"
              type="button"
              @click="form.status='lost'"
            >
              Mark Lost
            </button>
          </div>
        </div>

        <div class="mt-3 text-[11px] text-slate-500">
          Demo now (static). Later connect:
          <b>{{ isEdit ? "PUT/PATCH room_keys" : "POST room_keys" }}</b>
        </div>
      </section>

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

// flatten static
function flatten(data) {
  const rooms = (data || []).map((r) => ({ room_id: r.room_id, room_number: r.room_number }))
  const keys = []
  for (const r of data || []) {
    for (const k of r.keys || []) {
      keys.push({
        key_id: k.key_id,
        room_id: r.room_id,
        key_number: k.key_number,
        key_type: k.key_type,
        status: k.status,
        issued_to_reservation_id: k.issued_to_reservation_id ?? null,
        issued_at: k.issued_at ?? null,
        returned_at: k.returned_at ?? null,
        replacement_cost: Number(k.replacement_cost ?? 0),
        notes: k.notes ?? "",
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
  issued_at: null,
  returned_at: null,
  replacement_cost: 5.0,
  notes: "",
})

// ✅ Load existing data when edit
watchEffect(() => {
  if (!isEdit.value) return
  if (!foundKey.value) return
  Object.assign(form, JSON.parse(JSON.stringify(foundKey.value)))
})

// ✅ Small auto rules based on status
watchEffect(() => {
  if (form.status !== "issued") {
    // If not issued, clear reservation id (optional rule)
    // comment this out if you want keep value
    form.issued_to_reservation_id = null
  }
})

// validate
const canSave = computed(() => {
  if (!found.value) return false
  if (!form.room_id || !form.key_number || !form.key_type || !form.status) return false
  if (form.status === "issued" && !form.issued_to_reservation_id) return false
  return true
})

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
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function markReturned() {
  form.status = "available"
  form.returned_at = nowStamp()
  form.issued_to_reservation_id = null
  showToast("Returned (demo).")
}

function submit() {
  if (!canSave.value) return

  if (isEdit.value) {
    // ✅ UPDATE condition
    console.log("UPDATE room_keys WHERE key_id =", keyId.value, JSON.parse(JSON.stringify(form)))
    showToast("Updated (demo). Check console.")
  } else {
    // ✅ CREATE condition
    console.log("CREATE room_keys:", JSON.parse(JSON.stringify(form)))
    showToast("Created (demo). Check console.")
  }

  setTimeout(() => router.push("/rooms/keys"), 600)
}
</script>
