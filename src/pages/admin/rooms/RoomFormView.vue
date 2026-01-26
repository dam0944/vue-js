<script setup>
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { rooms as dbRooms, roomTypes } from "@/data/index"

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const roomId = computed(() => Number(route.params.id))

// local editable copy (simulate DB)
const localRooms = ref(JSON.parse(JSON.stringify(dbRooms)))

const form = ref({
  room_number: "",
  floor: 1,
  room_type_id: "",
  status: "available",
  notes: "",
  image: null, // ✅ NEW: store base64 image
})

const statusOptions = [
  "available",
  "occupied",
  "reserved",
  "maintenance",
  "out_of_order",
  "cleaning",
]

// load existing on edit
if (isEdit.value) {
  const found = localRooms.value.find((r) => Number(r.room_id) === roomId.value)
  if (found) {
    form.value = {
      room_number: found.room_number,
      floor: found.floor,
      room_type_id: String(found.room_type_id),
      status: found.status,
      notes: found.notes || "",
      image: found.image || null, // ✅ load photo if exists
    }
  }
}

const typeOptions = computed(() =>
  roomTypes
    .filter((t) => t.status === "active")
    .map((t) => ({ text: t.type_name, value: String(t.room_type_id) }))
)

/* ✅ image upload (base64) */
function onImageChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith("image/")) {
    alert("Only image files allowed.")
    return
  }

  const reader = new FileReader()
  reader.onload = (ev) => {
    form.value.image = ev.target.result // base64 string
  }
  reader.readAsDataURL(file)

  // allow re-upload same file next time
  e.target.value = ""
}

function removeImage() {
  form.value.image = null
}

const save = () => {
  if (!form.value.room_number || !form.value.room_type_id) {
    alert("Room number and room type are required.")
    return
  }

  if (isEdit.value) {
    const idx = localRooms.value.findIndex((r) => Number(r.room_id) === roomId.value)
    if (idx !== -1) {
      localRooms.value[idx] = {
        ...localRooms.value[idx],
        room_number: form.value.room_number,
        floor: Number(form.value.floor),
        room_type_id: Number(form.value.room_type_id),
        status: form.value.status,
        notes: form.value.notes,
        image: form.value.image, // ✅ save image
      }
    }
  } else {
    const nextId = Math.max(...localRooms.value.map((r) => r.room_id)) + 1
    localRooms.value.push({
      room_id: nextId,
      room_number: form.value.room_number,
      floor: Number(form.value.floor),
      room_type_id: Number(form.value.room_type_id),
      status: form.value.status,
      notes: form.value.notes,
      image: form.value.image, // ✅ save image
      last_cleaned: null,
    })
  }

  router.push("/admin/rooms")
}

const cancel = () => router.push("/admin/rooms")
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>{{ isEdit ? "Edit Room" : "Add Room" }}</h1>
        <p>Data follows table: <b>rooms</b></p>
      </div>

      <div class="actions">
        <VaButton preset="secondary" @click="cancel">Cancel</VaButton>
        <VaButton color="success" icon="save" @click="save">Save</VaButton>
      </div>
    </div>

    <VaCard class="card">
      <div class="grid">
        <VaInput v-model="form.room_number" label="Room Number *" placeholder="101, 201..." />
        <VaInput v-model="form.floor" type="number" label="Floor" placeholder="1" />

        <VaSelect
          v-model="form.room_type_id"
          label="Room Type *"
          :options="typeOptions"
          text-by="text"
          value-by="value"
          placeholder="Select type"
        />

        <VaSelect v-model="form.status" label="Status" :options="statusOptions" />

        <!-- ✅ Room Photo Upload -->
        <div class="photoWrap">
          <div class="photoHead">
            <div class="photoTitle">Room Photo</div>
            <div class="photoSub">Upload one photo for this room</div>
          </div>

          <div class="photoRow">
            <div class="previewBox">
              <img v-if="form.image" :src="form.image" class="previewImg" />
              <div v-else class="previewEmpty">No image</div>
            </div>

            <div class="photoBtns">
              <label class="fileBtn">
                <input type="file" accept="image/*" class="hidden" @change="onImageChange" />
                <VaButton preset="secondary" icon="photo" size="small">Upload Photo</VaButton>
              </label>

              <VaButton
                v-if="form.image"
                preset="secondary"
                color="danger"
                icon="delete"
                size="small"
                @click="removeImage"
              >
                Remove
              </VaButton>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="notes">
          <VaTextarea v-model="form.notes" label="Notes" placeholder="Optional notes..." />
        </div>
      </div>

      <div class="hint">
        * Room type info (price, bed, size, amenities) comes from <b>room_types</b>
      </div>
    </VaCard>
  </div>
</template>

<style scoped>
.page {
  padding: 24px;
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
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
}

.head p {
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.card {
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  padding: 18px;
  background: #fff;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 860px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

/* Photo section */
.photoWrap {
  grid-column: 1 / -1;
  border: 1px solid #eef2f6;
  background: #fbfcfe;
  border-radius: 16px;
  padding: 14px;
}

.photoHead {
  margin-bottom: 10px;
}

.photoTitle {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}

.photoSub {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.photoRow {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.previewBox {
  width: 190px;
  height: 130px;
  border-radius: 14px;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
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
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
}

.photoBtns {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hidden {
  display: none;
}

.fileBtn {
  cursor: pointer;
}

.notes {
  grid-column: 1 / -1;
}

.hint {
  margin-top: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

/* Vuestic polish */
:deep(.va-input__container),
:deep(.va-select__container),
:deep(.va-textarea__container) {
  border-radius: 12px;
  background: #f9fafb;
}

:deep(.va-button) {
  border-radius: 12px;
  font-weight: 900;
}
</style>
