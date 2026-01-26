<!-- RoomListPage.vue -->
<script setup>
import { ref, computed, reactive, nextTick, watch, onMounted } from "vue"
import $ from "jquery"
import { room_list } from "@/data/room/room_list"

const rooms = ref(room_list.map((x) => ({ ...x })))

/* ---------------- Filters ---------------- */
const q = ref("")
const floor = ref("")
const type = ref("")
const status = ref("")
const sort = ref("number")

const safe = (v) => (v ?? "").toString().toLowerCase()

const floorOptions = computed(() => {
  const s = new Set(rooms.value.map((r) => r.floor))
  return ["", ...Array.from(s).sort((a, b) => Number(a) - Number(b))]
})

const typeOptions = computed(() => {
  const s = new Set(rooms.value.map((r) => r.type).filter(Boolean))
  return ["", ...Array.from(s)]
})

const statusOptions = ["", "active", "maintenance", "disabled"]

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rooms.value.filter((r) => {
    const hit =
      !key ||
      safe(r.number).includes(key) ||
      safe(r.type).includes(key) ||
      safe(r.bed).includes(key)

    const okFloor = !floor.value || String(r.floor) === String(floor.value)
    const okType = !type.value || r.type === type.value
    const okStatus = !status.value || r.status === status.value

    return hit && okFloor && okType && okStatus
  })

  if (sort.value === "number")
    list.sort((a, b) => (a.number || "").localeCompare(b.number || ""))
  if (sort.value === "floor") list.sort((a, b) => Number(a.floor) - Number(b.floor))
  if (sort.value === "priceNight")
    list.sort((a, b) => Number(b.priceNight || 0) - Number(a.priceNight || 0))

  return list
})

/* ---------------- Summary ---------------- */
const stats = computed(() => {
  const all = rooms.value
  const count = (st) => all.filter((x) => x.status === st).length
  return {
    total: all.length,
    active: count("active"),
    maintenance: count("maintenance"),
    disabled: count("disabled"),
  }
})

/* ---------------- Modal ---------------- */
const modalOpen = ref(false)
const modalMode = ref("view") // view | create | edit
const selected = ref(null)

// jQuery slide container ref
const formWrapRef = ref(null)

/* ---------------- Form model ---------------- */
const form = reactive({
  id: null,
  floor: 1,
  number: "",
  type: "Standard",
  bed: "Queen",
  maxGuest: 2,
  priceHour: 5,
  priceNight: 20,
  status: "active",
})

/* ---------------- ✅ jQuery slideDown (top → bottom) ---------------- */
function slideFormDown() {
  nextTick(() => {
    const el = formWrapRef.value
    if (!el) return
    // ✅ force hidden first to always animate from top
    $(el).stop(true, true).css("display", "none").slideDown(260)
  })
}

function slideFormUp(cb) {
  const el = formWrapRef.value
  if (!el) {
    cb?.()
    return
  }
  $(el).stop(true, true).slideUp(200, () => cb?.())
}

/* ---------------- Open / Close ---------------- */
function openView(r) {
  modalMode.value = "view"
  selected.value = r
  modalOpen.value = true
}

function openCreate() {
  modalMode.value = "create"
  selected.value = null

  // reset form
  form.id = null
  form.floor = 1
  form.number = ""
  form.type = "Standard"
  form.bed = "Queen"
  form.maxGuest = 2
  form.priceHour = 5
  form.priceNight = 20
  form.status = "active"

  modalOpen.value = true
  slideFormDown()
}

function openEdit(r) {
  modalMode.value = "edit"
  selected.value = r

  // load form
  form.id = r.id
  form.floor = r.floor
  form.number = r.number
  form.type = r.type
  form.bed = r.bed
  form.maxGuest = r.maxGuest
  form.priceHour = r.priceHour
  form.priceNight = r.priceNight
  form.status = r.status

  modalOpen.value = true
  slideFormDown()
}

function closeModal() {
  // slideUp only for create/edit
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

/* ---------------- Save Create/Edit ---------------- */
function saveCreate() {
  if (!form.number) return alert("Room number is required!")

  const nextId = Math.max(...rooms.value.map((x) => x.id || 0), 0) + 1
  rooms.value.unshift({
    id: nextId,
    floor: Number(form.floor),
    number: form.number,
    type: form.type,
    bed: form.bed,
    maxGuest: Number(form.maxGuest),
    priceHour: Number(form.priceHour),
    priceNight: Number(form.priceNight),
    status: form.status,
  })

  closeModal()
}

function saveEdit() {
  const idx = rooms.value.findIndex((x) => x.id === form.id)
  if (idx === -1) return closeModal()

  rooms.value.splice(idx, 1, {
    ...rooms.value[idx],
    floor: Number(form.floor),
    number: form.number,
    type: form.type,
    bed: form.bed,
    maxGuest: Number(form.maxGuest),
    priceHour: Number(form.priceHour),
    priceNight: Number(form.priceNight),
    status: form.status,
  })

  closeModal()
}

/* ---------------- Init + lock scroll ---------------- */
onMounted(() => {
  // keep form hidden at start so slideDown always works
  if (formWrapRef.value) $(formWrapRef.value).hide()
})

watch(modalOpen, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>Room List</h1>
        <p>Guesthouse rooms • Create/Edit uses jQuery slideDown (top → bottom)</p>
      </div>

      <div class="headActions">
        <VaButton preset="secondary" icon="download">Export</VaButton>
        <VaButton color="success" icon="add" @click="openCreate">Add Room</VaButton>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary">
      <div class="sCard">
        <div class="k">Total Rooms</div>
        <div class="v">{{ stats.total }}</div>
      </div>
      <div class="sCard ok">
        <div class="k">Active</div>
        <div class="v">{{ stats.active }}</div>
      </div>
      <div class="sCard warn">
        <div class="k">Maintenance</div>
        <div class="v">{{ stats.maintenance }}</div>
      </div>
      <div class="sCard danger">
        <div class="k">Disabled</div>
        <div class="v">{{ stats.disabled }}</div>
      </div>
    </div>

    <!-- Filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search room number / type / bed..." />
      <VaSelect v-model="floor" :options="floorOptions" label="Floor" />
      <VaSelect v-model="type" :options="typeOptions" label="Type" />
      <VaSelect v-model="status" :options="statusOptions" label="Status" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Room Number', value: 'number' },
          { text: 'Floor', value: 'floor' },
          { text: 'Price/Night (High)', value: 'priceNight' },
        ]"
        label="Sort"
        text-by="text"
        value-by="value"
      />
    </VaCard>

    <!-- Table -->
    <VaCard class="tableCard">
      <div class="tableWrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Room</th>
              <th>Type</th>
              <th>Bed</th>
              <th>Max</th>
              <th>Price/Hour</th>
              <th>Price/Night</th>
              <th>Status</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="8" class="empty">No rooms found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.id">
              <td>
                <div class="main">Room {{ r.number }}</div>
                <div class="sub">Floor {{ r.floor }}</div>
              </td>

              <td><div class="main">{{ r.type }}</div></td>
              <td>{{ r.bed }}</td>
              <td>{{ r.maxGuest }}</td>
              <td>$ {{ r.priceHour }}</td>
              <td>$ {{ r.priceNight }}</td>

              <td>
                <span class="badge" :class="'st-' + r.status">
                  {{ r.status.toUpperCase() }}
                </span>
              </td>

              <td class="right">
                <div class="btns">
                  <VaButton size="small" preset="secondary" @click="openView(r)">View</VaButton>
                  <VaButton size="small" color="primary" @click="openEdit(r)">Edit</VaButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="modalOpen" class="m-backdrop" @click="closeModal">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">
                {{
                  modalMode === "view"
                    ? "Room Details"
                    : modalMode === "create"
                    ? "Create Room"
                    : "Edit Room"
                }}
              </div>
              <div class="m-sub">
                {{
                  modalMode === "view"
                    ? `Room ${selected?.number || ""}`
                    : "Fill room information"
                }}
              </div>
            </div>

            <VaButton preset="secondary" icon="close" @click="closeModal">Close</VaButton>
          </header>

          <section class="m-body">
            <!-- VIEW -->
            <div v-if="modalMode === 'view'" class="viewGrid">
              <div class="vCard">
                <div class="k">Room</div>
                <div class="v big">Room {{ selected?.number }}</div>
                <div class="sub">Floor {{ selected?.floor }}</div>
              </div>

              <div class="vCard">
                <div class="k">Type</div>
                <div class="v">{{ selected?.type }}</div>
                <div class="sub">Bed: {{ selected?.bed }}</div>
              </div>

              <div class="vCard">
                <div class="k">Pricing</div>
                <div class="v">Hour: $ {{ selected?.priceHour }}</div>
                <div class="sub">Night: $ {{ selected?.priceNight }}</div>
              </div>

              <div class="vCard">
                <div class="k">Status</div>
                <div class="v">
                  <span class="badge" :class="'st-' + selected?.status">
                    {{ (selected?.status || "").toUpperCase() }}
                  </span>
                </div>
                <div class="sub">Max guest: {{ selected?.maxGuest }}</div>
              </div>
            </div>

            <!-- CREATE / EDIT (slideDown) -->
            <div v-else ref="formWrapRef" class="formWrap">
              <div class="formTop">
                <div class="formTitle">{{ modalMode === "create" ? "Create Room" : "Edit Room" }}</div>
                <div class="formSub">jQuery slideDown from top → bottom</div>
              </div>

              <div class="formGrid">
                <VaInput v-model="form.number" label="Room Number *" placeholder="ex: 101" />
                <VaSelect v-model="form.floor" :options="[1,2,3,4,5]" label="Floor" />

                <VaSelect
                  v-model="form.type"
                  :options="['Standard','Deluxe','Family','VIP']"
                  label="Room Type"
                />
                <VaSelect
                  v-model="form.bed"
                  :options="['Queen','King','Twin','2 Queen']"
                  label="Bed"
                />

                <VaInput v-model="form.maxGuest" type="number" label="Max Guest" />
                <VaInput v-model="form.priceHour" type="number" label="Price / Hour" />
                <VaInput v-model="form.priceNight" type="number" label="Price / Night" />

                <VaSelect
                  v-model="form.status"
                  :options="['active','maintenance','disabled']"
                  label="Status"
                />

                <div class="summaryBox">
                  <div>
                    <div class="k">Preview</div>
                    <div class="v">
                      Room <b>{{ form.number || "—" }}</b> • Floor <b>{{ form.floor }}</b>
                    </div>
                  </div>
                  <div class="right">
                    <div class="k">Price</div>
                    <div class="v">${{ form.priceHour }}/h • ${{ form.priceNight }}/night</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="closeModal">Cancel</VaButton>

            <template v-if="modalMode === 'create'">
              <VaButton color="success" @click="saveCreate">Save</VaButton>
            </template>

            <template v-else-if="modalMode === 'edit'">
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

/* summary cards */
.summary { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:12px; }
@media (max-width: 900px){ .summary{ grid-template-columns:repeat(2,1fr);} }
@media (max-width: 520px){ .summary{ grid-template-columns:1fr;} }
.sCard{ background:#fff; border:1px solid #e5eaf2; border-radius:14px; padding:12px 14px; box-shadow:0 10px 22px rgba(15,23,42,.06); }
.sCard .k{ font-size:12px; font-weight:900; color:#64748b; }
.sCard .v{ margin-top:4px; font-size:20px; font-weight:900; color:#0f172a; }
.sCard.ok{ background:#ecfdf5; border-color:#bbf7d0; }
.sCard.warn{ background:#fff7ed; border-color:#fed7aa; }
.sCard.danger{ background:#fff1f2; border-color:#fecdd3; }

/* filters */
.filters{
  background:#fff; border:1px solid #eef2f6; border-radius:14px; box-shadow:0 8px 20px rgba(15,23,42,.06);
  padding:14px; display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr; gap:12px; margin-bottom:14px;
}
@media (max-width: 1000px){ .filters{ grid-template-columns:1fr 1fr; } }
@media (max-width: 520px){ .filters{ grid-template-columns:1fr; } }

/* table */
.tableCard{ border-radius:14px; border:1px solid #eef2f6; box-shadow:0 10px 24px rgba(15,23,42,.08); }
.tableWrap{ overflow-x:auto; }
.tbl{ width:100%; border-collapse:collapse; background:#fff; }
.tbl th{ padding:12px 14px; font-size:12px; text-align:left; color:#64748b; border-bottom:1px solid #eef2f6; background:#fbfcfe; white-space:nowrap; }
.tbl td{ padding:12px 14px; border-bottom:1px solid #f1f5f9; vertical-align:top; }
.tbl tr:hover td{ background:#fafcff; }
.right{ text-align:right; }
.main{ font-weight:900; font-size:13px; color:#0f172a; }
.sub{ margin-top:4px; font-size:12px; font-weight:700; color:#64748b; }
.empty{ text-align:center; padding:18px !important; font-weight:900; color:#64748b; }
.btns{ display:inline-flex; gap:8px; justify-content:flex-end; flex-wrap:wrap; }

/* badge */
.badge{
  display:inline-flex; align-items:center; padding:6px 10px; border-radius:999px;
  font-size:11px; font-weight:900; border:1px solid #e2e8f0; background:#f8fafc; color:#334155;
}
.st-active{ background:#ecfdf5; border-color:#bbf7d0; color:#166534; }
.st-maintenance{ background:#fff7ed; border-color:#fed7aa; color:#9a3412; }
.st-disabled{ background:#fff1f2; border-color:#fecdd3; color:#9f1239; }

/* modal */
.m-backdrop{
  position:fixed; inset:0; background:rgba(15,23,42,.45); z-index:99999;
  display:grid; place-items:center; padding:16px;
}
.m{
  width:min(860px,100%); background:#fff; border-radius:16px; border:1px solid #eef2f6;
  box-shadow:0 30px 90px rgba(15,23,42,.22); overflow:hidden;
}
.m-head{
  padding:14px 16px; border-bottom:1px solid #eef2f6; background:#fbfcfe;
  display:flex; justify-content:space-between; align-items:center; gap:12px;
}
.m-title{ font-size:16px; font-weight:900; color:#0f172a; }
.m-sub{ margin-top:2px; font-size:12px; color:#64748b; font-weight:700; }
.m-body{ padding:16px; max-height:70vh; overflow:auto; }
.m-foot{ padding:14px 16px; border-top:1px solid #eef2f6; display:flex; justify-content:flex-end; gap:10px; }

/* view cards */
.viewGrid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width:720px){ .viewGrid{ grid-template-columns:1fr; } }
.vCard{ border:1px solid #eef2f6; background:#fbfcfe; border-radius:14px; padding:14px; }
.v{ margin-top:6px; font-weight:900; color:#0f172a; }
.v.big{ font-size:20px; }

/* ✅ form slide wrapper */
.formWrap { display: none; } /* IMPORTANT: jQuery slideDown needs hidden */
.formTop{
  padding:12px 12px 6px;
  border:1px solid #eef2f6;
  border-radius:14px;
  background:#fbfcfe;
  margin-bottom:12px;
}
.formTitle{ font-size:14px; font-weight:900; color:#0f172a; }
.formSub{ margin-top:3px; font-size:12px; font-weight:700; color:#64748b; }

.formGrid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width:720px){ .formGrid{ grid-template-columns:1fr; } }

.summaryBox{
  grid-column:1 / -1;
  border:1px dashed #cbd5e1;
  background:#f8fafc;
  border-radius:14px;
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
:deep(.va-select__container){ border-radius:10px; background:#f9fafb; }
:deep(.va-button){ border-radius:10px; font-weight:800; }
</style>
