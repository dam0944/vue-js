<script setup>
import { ref, computed, reactive, nextTick, watch, onMounted } from "vue"
import $ from "jquery"
import { room_type } from "@/data/room/room_type"

/* local data (simulate DB) */
const types = ref(room_type.map((x) => ({ ...x })))

/* filters */
const q = ref("")
const status = ref("")
const sort = ref("name")
const statusOptions = ["", "active", "inactive"]

const safe = (v) => (v ?? "").toString().toLowerCase()

const filtered = computed(() => {
  const key = safe(q.value)
  let list = types.value.filter((t) => {
    const hit =
      !key ||
      safe(t.type_name).includes(key) ||
      safe(t.bed_type).includes(key) ||
      String(t.max_guest || "").includes(key)

    const okStatus = !status.value || t.status === status.value
    return hit && okStatus
  })

  if (sort.value === "name") list.sort((a, b) => (a.type_name || "").localeCompare(b.type_name || ""))
  if (sort.value === "priceNight") list.sort((a, b) => Number(b.price_night || 0) - Number(a.price_night || 0))
  if (sort.value === "maxGuest") list.sort((a, b) => Number(b.max_guest || 0) - Number(a.max_guest || 0))

  return list
})

/* modal */
const modalOpen = ref(false)
const modalMode = ref("view") // view | create | edit
const selected = ref(null)
const formWrapRef = ref(null)

/* form */
const form = reactive({
  room_type_id: null,
  type_name: "",
  bed_type: "Queen",
  max_guest: 2,
  room_size_sqm: 18,
  price_hour: 5,
  price_night: 20,
  status: "active",
  features: [],
  image: "",
})

const bedOptions = ["Single", "Twin", "Queen", "King", "2 Queen"]
const featureText = ref("")

function addFeature() {
  const v = featureText.value.trim()
  if (!v) return
  if (!form.features.includes(v)) form.features.push(v)
  featureText.value = ""
}
function removeFeature(i) {
  form.features.splice(i, 1)
}

function resetForm() {
  form.room_type_id = null
  form.type_name = ""
  form.bed_type = "Queen"
  form.max_guest = 2
  form.room_size_sqm = 18
  form.price_hour = 5
  form.price_night = 20
  form.status = "active"
  form.features = ["Air Conditioner", "Private Bathroom", "Free WiFi"]
  form.image = ""
}

/* ✅ jQuery slideDown (top → bottom) */
function slideFormDown() {
  nextTick(() => {
    const el = formWrapRef.value
    if (!el) return
    $(el).stop(true, true).css("display", "none").slideDown(260)
  })
}
function slideFormUp(cb) {
  const el = formWrapRef.value
  if (!el) return cb?.()
  $(el).stop(true, true).slideUp(200, () => cb?.())
}

/* open/close */
function openView(t) {
  modalMode.value = "view"
  selected.value = t
  modalOpen.value = true
}

function openCreate() {
  modalMode.value = "create"
  selected.value = null
  resetForm()
  modalOpen.value = true
  slideFormDown()
}

function openEdit(t) {
  modalMode.value = "edit"
  selected.value = t

  form.room_type_id = t.room_type_id
  form.type_name = t.type_name
  form.bed_type = t.bed_type
  form.max_guest = Number(t.max_guest || 2)
  form.room_size_sqm = Number(t.room_size_sqm || 18)
  form.price_hour = Number(t.price_hour || 0)
  form.price_night = Number(t.price_night || 0)
  form.status = t.status || "active"
  form.features = Array.isArray(t.features) ? [...t.features] : []
  form.image = t.image || ""

  modalOpen.value = true
  slideFormDown()
}

function closeModal() {
  if (modalMode.value === "create" || modalMode.value === "edit") {
    slideFormUp(() => {
      modalOpen.value = false
      selected.value = null
    })
  } else {
    modalOpen.value = false
    selected.value = null
  }
}

/* save */
function saveCreate() {
  if (!form.type_name) return alert("Type name is required.")

  const nextId = Math.max(...types.value.map((x) => x.room_type_id || 0), 0) + 1
  types.value.unshift({
    room_type_id: nextId,
    type_name: form.type_name,
    bed_type: form.bed_type,
    max_guest: Number(form.max_guest),
    room_size_sqm: Number(form.room_size_sqm),
    price_hour: Number(form.price_hour),
    price_night: Number(form.price_night),
    status: form.status,
    features: [...form.features],
    image: form.image || "",
  })

  closeModal()
}

function saveEdit() {
  const idx = types.value.findIndex((x) => x.room_type_id === form.room_type_id)
  if (idx === -1) return closeModal()

  types.value.splice(idx, 1, {
    ...types.value[idx],
    type_name: form.type_name,
    bed_type: form.bed_type,
    max_guest: Number(form.max_guest),
    room_size_sqm: Number(form.room_size_sqm),
    price_hour: Number(form.price_hour),
    price_night: Number(form.price_night),
    status: form.status,
    features: [...form.features],
    image: form.image || "",
  })

  closeModal()
}

const money = (n) => `$ ${Number(n || 0).toFixed(2)}`

/* init + lock scroll */
onMounted(() => {
  if (formWrapRef.value) $(formWrapRef.value).hide()
})
watch(modalOpen, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>Room Types</h1>
        <p>Manage guesthouse room types (price/hour & price/night)</p>
      </div>

      <div class="headActions">
        <VaButton preset="secondary" icon="refresh" @click="q = ''; status = ''; sort = 'name'">
          Reset
        </VaButton>
        <VaButton color="success" icon="add" @click="openCreate">
          Add Room Type
        </VaButton>
      </div>
    </div>

    <!-- Filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search type name / bed / guest..." />
      <VaSelect v-model="status" :options="statusOptions" label="Status" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Name', value: 'name' },
          { text: 'Price/Night (High)', value: 'priceNight' },
          { text: 'Max Guest (High)', value: 'maxGuest' },
        ]"
        label="Sort"
        text-by="text"
        value-by="value"
      />
    </VaCard>

    <!-- Grid -->
    <div class="grid">
      <div v-if="filtered.length === 0" class="emptyCard">
        No room types found.
      </div>

      <div v-for="t in filtered" :key="t.room_type_id" class="typeCard">
        <div class="imgBox">
          <img v-if="t.image" :src="t.image" class="img" />
          <div v-else class="imgEmpty">No Photo</div>
        </div>

        <div class="cardBody">
          <div class="titleRow">
            <div class="title">{{ t.type_name }}</div>
            <span class="pill" :class="'st-' + t.status">{{ t.status.toUpperCase() }}</span>
          </div>

          <div class="meta">
            <div><span class="k">Bed:</span> <b>{{ t.bed_type }}</b></div>
            <div><span class="k">Max:</span> <b>{{ t.max_guest }}</b></div>
            <div><span class="k">Size:</span> <b>{{ t.room_size_sqm }} m²</b></div>
          </div>

          <div class="prices">
            <div class="priceBox">
              <div class="k">Hour</div>
              <div class="v">{{ money(t.price_hour) }}</div>
            </div>
            <div class="priceBox">
              <div class="k">Night</div>
              <div class="v night">{{ money(t.price_night) }}</div>
            </div>
          </div>

          <div class="feat" v-if="t.features?.length">
            <span v-for="f in t.features.slice(0, 4)" :key="f" class="chip">{{ f }}</span>
            <span v-if="t.features.length > 4" class="chip more">+{{ t.features.length - 4 }}</span>
          </div>

          <div class="btns">
            <VaButton size="small" preset="secondary" @click="openView(t)">View</VaButton>
            <VaButton size="small" color="primary" @click="openEdit(t)">Edit</VaButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="modalOpen" class="m-backdrop" @click="closeModal">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">
                {{
                  modalMode === "view"
                    ? "Room Type Details"
                    : modalMode === "create"
                    ? "Create Room Type"
                    : "Edit Room Type"
                }}
              </div>
              <div class="m-sub">
                {{
                  modalMode === "view"
                    ? selected?.type_name || "-"
                    : "Fill room type information"
                }}
              </div>
            </div>

            <VaButton preset="secondary" icon="close" @click="closeModal">Close</VaButton>
          </header>

          <section class="m-body">
            <!-- VIEW -->
            <div v-if="modalMode === 'view'" class="viewGrid">
              <div class="vCard wide">
                <div class="vImg">
                  <img v-if="selected?.image" :src="selected.image" class="img" />
                  <div v-else class="imgEmpty">No Photo</div>
                </div>
              </div>

              <div class="vCard">
                <div class="k">Type</div>
                <div class="v big">{{ selected?.type_name }}</div>
                <div class="sub">Status: <b>{{ selected?.status }}</b></div>
              </div>

              <div class="vCard">
                <div class="k">Details</div>
                <div class="v">Bed: <b>{{ selected?.bed_type }}</b></div>
                <div class="sub">Max guest: <b>{{ selected?.max_guest }}</b> • Size: <b>{{ selected?.room_size_sqm }} m²</b></div>
              </div>

              <div class="vCard">
                <div class="k">Pricing</div>
                <div class="v">Hour: <b>{{ money(selected?.price_hour) }}</b></div>
                <div class="sub">Night: <b>{{ money(selected?.price_night) }}</b></div>
              </div>

              <div class="vCard wide">
                <div class="k">Features</div>
                <div class="feat">
                  <span v-for="f in (selected?.features || [])" :key="f" class="chip">{{ f }}</span>
                  <span v-if="(selected?.features || []).length === 0" class="sub">No features.</span>
                </div>
              </div>
            </div>

            <!-- CREATE / EDIT (jQuery slideDown) -->
            <div v-else ref="formWrapRef" class="formWrap">
              <div class="formTop">
                <div class="formTitle">{{ modalMode === "create" ? "Create Room Type" : "Edit Room Type" }}</div>
                <div class="formSub">Form slides down from top → bottom</div>
              </div>

              <div class="formGrid">
                <VaInput v-model="form.type_name" label="Type Name *" placeholder="Standard Room" />
                <VaSelect v-model="form.status" :options="['active', 'inactive']" label="Status" />

                <VaSelect v-model="form.bed_type" :options="bedOptions" label="Bed Type" />
                <VaInput v-model="form.max_guest" type="number" label="Max Guest" />

                <VaInput v-model="form.room_size_sqm" type="number" label="Room Size (sqm)" />
                <VaInput v-model="form.price_hour" type="number" label="Price / Hour" />
                <VaInput v-model="form.price_night" type="number" label="Price / Night" />

                <VaInput v-model="form.image" label="Image URL (optional)" placeholder="https://..." />

                <!-- Features editor -->
                <div class="wide">
                  <div class="featEditor">
                    <div class="featHead">
                      <div class="featTitle">Features</div>
                      <div class="featSub">Add common items (AC, WiFi, hot shower...)</div>
                    </div>

                    <div class="featRow">
                      <VaInput v-model="featureText" placeholder="Type feature and press Add" />
                      <VaButton preset="secondary" icon="add" @click="addFeature">Add</VaButton>
                    </div>

                    <div class="featList">
                      <span v-for="(f, i) in form.features" :key="f + i" class="chip removable">
                        {{ f }}
                        <button class="x" type="button" @click="removeFeature(i)">×</button>
                      </span>

                      <div v-if="form.features.length === 0" class="sub">
                        No features yet.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Summary -->
                <div class="summaryBox wide">
                  <div>
                    <div class="k">Preview</div>
                    <div class="v">
                      <b>{{ form.type_name || "—" }}</b> • {{ form.bed_type }} • Max {{ form.max_guest }}
                    </div>
                  </div>
                  <div class="right">
                    <div class="k">Price</div>
                    <div class="v">{{ money(form.price_hour) }}/h • {{ money(form.price_night) }}/night</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="closeModal">Cancel</VaButton>

            <template v-if="modalMode === 'view'">
              <VaButton color="primary" @click="openEdit(selected)">Edit</VaButton>
            </template>

            <template v-else-if="modalMode === 'create'">
              <VaButton color="success" @click="saveCreate">Save</VaButton>
            </template>

            <template v-else>
              <VaButton color="success" @click="saveEdit">Save Changes</VaButton>
            </template>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page { padding: 18px; background: #f6f8fb; min-height: 100vh; }

/* header */
.head { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:12px; }
.head h1 { margin:0; font-size:22px; font-weight:900; color:#0f172a; }
.head p { margin:6px 0 0; font-size:13px; font-weight:700; color:#64748b; }
.headActions { display:flex; gap:10px; flex-wrap:wrap; }

/* filters */
.filters{
  background:#fff; border:1px solid #eef2f6; border-radius:14px; box-shadow:0 8px 20px rgba(15,23,42,.06);
  padding:14px; display:grid; grid-template-columns:2fr 1fr 1fr; gap:12px; margin-bottom:14px;
}
@media (max-width: 860px){ .filters{ grid-template-columns:1fr; } }

/* grid cards */
.grid{
  display:grid;
  grid-template-columns:repeat(4, minmax(0, 1fr));
  gap:14px;
}
@media (max-width: 1050px){ .grid{ grid-template-columns:repeat(2, 1fr);} }
@media (max-width: 680px){ .grid{ grid-template-columns:1fr;} }

.emptyCard{
  grid-column:1 / -1;
  background:#fff;
  border:1px dashed #cbd5e1;
  border-radius:16px;
  padding:22px;
  text-align:center;
  font-weight:900;
  color:#64748b;
}

.typeCard{
  background:#fff;
  border:1px solid #eef2f6;
  border-radius:16px;
  box-shadow:0 10px 24px rgba(15,23,42,.08);
  overflow:hidden;
  display:flex;
  flex-direction:column;
}
.imgBox{
  height:160px;
  background:#f8fafc;
  border-bottom:1px solid #eef2f6;
  overflow:hidden;
  display:grid;
  place-items:center;
}
.img{ width:100%; height:100%; object-fit:cover; }
.imgEmpty{ font-size:12px; font-weight:900; color:#94a3b8; }

.cardBody{ padding:14px; display:flex; flex-direction:column; gap:10px; }
.titleRow{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.title{ font-size:16px; font-weight:900; color:#0f172a; }

.pill{
  display:inline-flex; align-items:center; padding:6px 10px; border-radius:999px;
  font-size:11px; font-weight:900; border:1px solid #e2e8f0; background:#f8fafc; color:#334155;
}
.st-active{ background:#ecfdf5; border-color:#bbf7d0; color:#166534; }
.st-inactive{ background:#fff1f2; border-color:#fecdd3; color:#9f1239; }

.meta{ display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; font-size:12px; color:#334155; }
.meta .k{ color:#64748b; font-weight:800; }

.prices{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.priceBox{ border:1px solid #eef2f6; background:#fbfcfe; border-radius:14px; padding:10px; }
.priceBox .k{ font-size:11px; font-weight:900; color:#64748b; }
.priceBox .v{ margin-top:2px; font-size:14px; font-weight:900; color:#0f172a; }
.priceBox .v.night{ color:#1d4ed8; }

.feat{ display:flex; flex-wrap:wrap; gap:8px; }
.chip{
  padding:6px 10px; border-radius:999px; font-size:11px; font-weight:900;
  background:#f1f5f9; border:1px solid #e2e8f0; color:#334155;
}
.chip.more{ background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; }

.btns{ display:flex; gap:8px; justify-content:flex-end; margin-top:2px; }

/* modal */
.m-backdrop{
  position:fixed; inset:0; background:rgba(15,23,42,.45); z-index:99999;
  display:grid; place-items:center; padding:16px;
}
.m{
  width:min(980px,100%); background:#fff; border-radius:16px; border:1px solid #eef2f6;
  box-shadow:0 30px 90px rgba(15,23,42,.22); overflow:hidden;
}
.m-head{
  padding:14px 16px; border-bottom:1px solid #eef2f6; background:#fbfcfe;
  display:flex; justify-content:space-between; align-items:center; gap:12px;
}
.m-title{ font-size:16px; font-weight:900; color:#0f172a; }
.m-sub{ margin-top:2px; font-size:12px; color:#64748b; font-weight:700; }
.m-body{ padding:16px; max-height:72vh; overflow:auto; }
.m-foot{ padding:14px 16px; border-top:1px solid #eef2f6; display:flex; justify-content:flex-end; gap:10px; }

/* view */
.viewGrid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width: 760px){ .viewGrid{ grid-template-columns:1fr; } }
.vCard{ border:1px solid #eef2f6; background:#fbfcfe; border-radius:16px; padding:14px; }
.vCard.wide{ grid-column:1 / -1; }
.vCard .k{ font-size:12px; font-weight:900; color:#64748b; }
.vCard .v{ margin-top:6px; font-weight:900; color:#0f172a; }
.vCard .v.big{ font-size:20px; }
.vCard .sub{ margin-top:4px; font-size:12px; font-weight:700; color:#64748b; }
.vImg{ height:240px; border-radius:14px; overflow:hidden; border:1px solid #eef2f6; background:#f8fafc; display:grid; place-items:center; }

/* form slide wrapper */
.formWrap{ display:none; } /* IMPORTANT for slideDown */
.formTop{
  padding:12px 12px 6px;
  border:1px solid #eef2f6;
  border-radius:16px;
  background:#fbfcfe;
  margin-bottom:12px;
}
.formTitle{ font-size:14px; font-weight:900; color:#0f172a; }
.formSub{ margin-top:3px; font-size:12px; font-weight:700; color:#64748b; }

.formGrid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width: 760px){ .formGrid{ grid-template-columns:1fr; } }
.wide{ grid-column:1 / -1; }

.featEditor{ border:1px solid #eef2f6; background:#fff; border-radius:16px; padding:12px; }
.featHead{ margin-bottom:8px; }
.featTitle{ font-size:13px; font-weight:900; color:#0f172a; }
.featSub{ margin-top:2px; font-size:12px; font-weight:700; color:#64748b; }
.featRow{ display:flex; gap:10px; align-items:flex-end; margin:10px 0; }
.featList{ display:flex; flex-wrap:wrap; gap:8px; }
.chip.removable{ display:inline-flex; align-items:center; gap:8px; }
.x{
  border:none; background:transparent; font-weight:900; cursor:pointer;
  width:18px; height:18px; line-height:18px; text-align:center; border-radius:999px;
  color:#334155;
}
.x:hover{ background:#e2e8f0; }

.summaryBox{
  border:1px dashed #cbd5e1;
  background:#f8fafc;
  border-radius:16px;
  padding:12px 14px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
}
.summaryBox .k{ font-size:12px; font-weight:900; color:#64748b; }
.summaryBox .v{ margin-top:4px; font-size:13px; font-weight:900; color:#0f172a; }
.summaryBox .right{ text-align:right; }

/* Vuestic polish */
:deep(.va-input__container),
:deep(.va-select__container),
:deep(.va-textarea__container){ border-radius:12px; background:#f9fafb; }
:deep(.va-button){ border-radius:12px; font-weight:900; }
</style>
