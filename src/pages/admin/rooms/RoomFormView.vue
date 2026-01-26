<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { property, rooms as dbRooms, roomTypes } from "@/data/index"

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const roomId = computed(() => Number(route.params.id || 0))

// simulate DB in-memory
const localRooms = ref(JSON.parse(JSON.stringify(dbRooms || [])))

const form = ref({
  // rooms table
  property_id: property?.property_id || 1,
  room_number: "",
  room_type_id: "",
  floor: 1,
  building: "",
  status: "available",

  // system managed (not editable)
  current_reservation_id: null,

  // optional ops fields
  last_cleaned: null,
  last_inspected: null,
  next_maintenance_date: "",
  condition_rating: "good",
  notes: "",

  // ✅ NEW (rooms.image_url)
  image_url: "",
})

const statusOptions = [
  "available",
  "occupied",
  "reserved",
  "cleaning",
  "maintenance",
  "out_of_order",
  "blocked",
]

const conditionOptions = ["excellent", "good", "fair", "poor"]

const typeOptions = computed(() =>
  (roomTypes || [])
    .filter((t) => t.status === "active")
    .map((t) => ({
      text: `${t.type_name} • ${t.bed_count ?? 1} bed • $${t.base_price ?? "-"}/night`,
      value: String(t.room_type_id),
    }))
)

function loadEdit() {
  if (!isEdit.value) return
  const found = localRooms.value.find((r) => Number(r.room_id) === roomId.value)
  if (!found) return

  form.value = {
    property_id: found.property_id ?? (property?.property_id || 1),
    room_number: found.room_number || "",
    room_type_id: String(found.room_type_id || ""),
    floor: Number(found.floor || 1),
    building: found.building || "",
    status: found.status || "available",
    current_reservation_id: found.current_reservation_id ?? null,
    last_cleaned: found.last_cleaned || null,
    last_inspected: found.last_inspected || null,
    next_maintenance_date: found.next_maintenance_date || "",
    condition_rating: found.condition_rating || "good",
    notes: found.notes || "",
    image_url: found.image_url || "",
  }
}

onMounted(loadEdit)

/** ✅ Upload image => store base64 in image_url for demo
 * In real backend: upload to server -> store returned URL in image_url
 */
function onImageChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith("image/")) {
    alert("Only image files allowed.")
    return
  }

  const reader = new FileReader()
  reader.onload = (ev) => {
    form.value.image_url = String(ev.target?.result || "")
  }
  reader.readAsDataURL(file)
  e.target.value = ""
}

function removeImage() {
  form.value.image_url = ""
}

function save() {
  if (!form.value.room_number.trim()) return alert("Room number is required.")
  if (!form.value.room_type_id) return alert("Room type is required.")

  const payload = {
    // rooms table fields
    property_id: Number(form.value.property_id),
    room_number: form.value.room_number.trim(),
    room_type_id: Number(form.value.room_type_id),
    floor: Number(form.value.floor || 1),
    building: (form.value.building || "").trim() || null,
    status: form.value.status,

    // optional ops
    last_cleaned: form.value.last_cleaned || null,
    last_inspected: form.value.last_inspected || null,
    next_maintenance_date: form.value.next_maintenance_date || null,
    condition_rating: form.value.condition_rating || "good",
    notes: (form.value.notes || "").trim() || null,

    // ✅ photo
    image_url: (form.value.image_url || "").trim() || null,

    // system managed
    current_reservation_id: form.value.current_reservation_id ?? null,
  }

  if (isEdit.value) {
    const idx = localRooms.value.findIndex((r) => Number(r.room_id) === roomId.value)
    if (idx !== -1) {
      localRooms.value[idx] = { ...localRooms.value[idx], ...payload, updated_at: new Date().toISOString() }
    }
  } else {
    const nextId =
      localRooms.value.length > 0
        ? Math.max(...localRooms.value.map((r) => Number(r.room_id))) + 1
        : 1

    localRooms.value.push({
      room_id: nextId,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  // go back to list
  router.push("/admin/rooms")
}

function cancel() {
  router.push("/admin/rooms")
}
</script>

<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 p-4 sm:p-6">
    <div class="mx-auto w-full max-w-5xl">
      <!-- Header -->
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <h1 class="text-xl font-extrabold text-slate-900">
            {{ isEdit ? "Edit Room" : "Create Room" }}
          </h1>
          <p class="text-sm text-slate-500">
            This form follows table: <b>rooms</b>
          </p>
        </div>

        <div class="flex gap-2">
          <VaButton preset="secondary" @click="cancel">Cancel</VaButton>
          <VaButton color="success" icon="save" @click="save">Save</VaButton>
        </div>
      </div>

      <!-- Form (no border/shadow, clean) -->
      <div class="rounded-2xl bg-white p-4 sm:p-6">
        <div class="grid gap-4 sm:grid-cols-2">
          <VaInput v-model="form.room_number" label="Room Number *" placeholder="101, 201..." />

          <VaSelect
            v-model="form.room_type_id"
            label="Room Type *"
            :options="typeOptions"
            text-by="text"
            value-by="value"
            placeholder="Select room type"
          />

          <VaInput v-model="form.floor" type="number" label="Floor" />
          <VaInput v-model="form.building" label="Building (optional)" placeholder="Main / A / B ..." />

          <VaSelect v-model="form.status" label="Room Status" :options="statusOptions" />
          <VaSelect v-model="form.condition_rating" label="Condition Rating" :options="conditionOptions" />

          <VaInput v-model="form.next_maintenance_date" type="date" label="Next Maintenance Date" />

          <!-- Photo -->
          <div class="sm:col-span-2">
            <div class="text-sm font-bold text-slate-900">Room Photo</div>
            <div class="mt-1 text-xs text-slate-500">
              Saved to <b>rooms.image_url</b>. (Base64 for demo, URL in real backend)
            </div>

            <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div class="h-32 w-full overflow-hidden rounded-2xl bg-slate-100 sm:h-28 sm:w-56">
                <img
                  v-if="form.image_url"
                  :src="form.image_url"
                  class="h-full w-full object-cover"
                  alt="room photo"
                />
                <div v-else class="grid h-full w-full place-items-center text-sm font-bold text-slate-400">
                  No Image
                </div>
              </div>

              <div class="flex gap-2">
                <label class="cursor-pointer">
                  <input type="file" accept="image/*" class="hidden" @change="onImageChange" />
                  <VaButton preset="secondary" icon="photo">Upload</VaButton>
                </label>

                <VaButton
                  v-if="form.image_url"
                  preset="secondary"
                  color="danger"
                  icon="delete"
                  @click="removeImage"
                >
                  Remove
                </VaButton>
              </div>
            </div>
          </div>

          <div class="sm:col-span-2">
            <VaTextarea v-model="form.notes" label="Notes" placeholder="Optional notes..." />
          </div>
        </div>

        <div class="mt-5 text-xs font-semibold text-slate-500">
          Not editable: <b>current_reservation_id</b>, timestamps. These are system-managed.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* make vuestic inputs soft like Tailwind */
:deep(.va-input__container),
:deep(.va-select__container),
:deep(.va-textarea__container) {
  border-radius: 16px;
  background: #f8fafc;
}
:deep(.va-button) {
  border-radius: 14px;
  font-weight: 900;
}
</style>
