<script setup>
import { ref, computed, reactive, nextTick, watch, onMounted } from "vue"
import $ from "jquery"
import { room_features as seed } from "@/data/room/room_features"

/* local data (simulate DB) */
const features = ref(seed.map((x) => ({ ...x })))

/* filters */
const q = ref("")
const category = ref("")
const sort = ref("name")

const safe = (v) => (v ?? "").toString().toLowerCase()

const categoryOptions = computed(() => {
  const s = new Set(features.value.map((f) => f.category).filter(Boolean))
  return ["", ...Array.from(s).sort((a, b) => a.localeCompare(b))]
})

const filtered = computed(() => {
  const key = safe(q.value)
  let list = features.value.filter((f) => {
    const hit =
      !key ||
      safe(f.name).includes(key) ||
      safe(f.icon).includes(key) ||
      safe(f.category).includes(key)

    const okCat = !category.value || f.category === category.value
    return hit && okCat
  })

  if (sort.value === "name") list.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
  if (sort.value === "category") list.sort((a, b) => (a.category || "").localeCompare(b.category || ""))
  if (sort.value === "newest") list.sort((a, b) => (b.feature_id || 0) - (a.feature_id || 0))

  return list
})

/* stats */
const stats = computed(() => {
  const total = features.value.length
  const cats = new Set(features.value.map((f) => f.category).filter(Boolean)).size
  return { total, cats }
})

/* modal */
const modalOpen = ref(false)
const modalMode = ref("view") // view | create | edit
const selected = ref(null)
const formWrapRef = ref(null)

/* form */
const form = reactive({
  feature_id: null,
  name: "",
  icon: "check",
  category: "comfort",
})

const iconExamples = [
  "wifi",
  "ac_unit",
  "tv",
  "shower",
  "bathtub",
  "kitchen",
  "local_parking",
  "balcony",
  "security",
  "videocam",
  "smoke_free",
  "table_bar",
  "location_city",
  "elevator",
  "check",
]

function resetForm() {
  form.feature_id = null
  form.name = ""
  form.icon = "check"
  form.category = "comfort"
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
function openView(f) {
  modalMode.value = "view"
  selected.value = f
  modalOpen.value = true
}

function openCreate() {
  modalMode.value = "create"
  selected.value = null
  resetForm()
  modalOpen.value = true
  slideFormDown()
}

function openEdit(f) {
  modalMode.value = "edit"
  selected.value = f

  form.feature_id = f.feature_id
  form.name = f.name
  form.icon = f.icon || "check"
  form.category = f.category || "comfort"

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
  if (!form.name.trim()) return alert("Feature name is required.")

  const nextId = Math.max(...features.value.map((x) => x.feature_id || 0), 0) + 1
  features.value.unshift({
    feature_id: nextId,
    name: form.name.trim(),
    icon: form.icon,
    category: form.category,
  })
  closeModal()
}

function saveEdit() {
  const idx = features.value.findIndex((x) => x.feature_id === form.feature_id)
  if (idx === -1) return closeModal()

  features.value.splice(idx, 1, {
    ...features.value[idx],
    name: form.name.trim(),
    icon: form.icon,
    category: form.category,
  })
  closeModal()
}

/* utils */
const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")

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
        <h1>Room Features</h1>
        <p>Manage feature list used in room types (AC, WiFi, Shower...)</p>
      </div>

      <div class="headActions">
        <VaButton preset="secondary" icon="refresh" @click="q=''; category=''; sort='name'">
          Reset
        </VaButton>
        <VaButton color="success" icon="add" @click="openCreate">
          Add Feature
        </VaButton>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary">
      <div class="sCard">
        <div class="k">Total Features</div>
        <div class="v">{{ stats.total }}</div>
      </div>
      <div class="sCard ok">
        <div class="k">Categories</div>
        <div class="v">{{ stats.cats }}</div>
      </div>
      <div class="sCard hint">
        <div class="k">Tip</div>
        <div class="v2">Use simple names for staff (WiFi, AC, Shower)</div>
      </div>
    </div>

    <!-- Filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search feature / icon / category..." />
      <VaSelect v-model="category" :options="categoryOptions" label="Category" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Name', value: 'name' },
          { text: 'Category', value: 'category' },
          { text: 'Newest', value: 'newest' },
        ]"
        label="Sort"
        text-by="text"
        value-by="value"
      />
    </VaCard>

    <!-- Grid -->
    <div class="grid">
      <div v-if="filtered.length === 0" class="emptyCard">
        No room features found.
      </div>

      <div v-for="f in filtered" :key="f.feature_id" class="featCard">
        <div class="iconBox">
          <VaIcon :name="f.icon || 'check'" />
        </div>

        <div class="body">
          <div class="topRow">
            <div class="name">{{ f.name }}</div>
            <span class="pill">{{ label(f.category) }}</span>
          </div>

          <div class="sub">Icon: <b class="mono">{{ f.icon || "-" }}</b></div>

          <div class="btns">
            <VaButton size="small" preset="secondary" @click="openView(f)">View</VaButton>
            <VaButton size="small" color="primary" @click="openEdit(f)">Edit</VaButton>
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
                    ? "Feature Details"
                    : modalMode === "create"
                    ? "Create Feature"
                    : "Edit Feature"
                }}
              </div>
              <div class="m-sub">
                {{
                  modalMode === "view"
                    ? selected?.name || "-"
                    : "Form slides down from top → bottom"
                }}
              </div>
            </div>

            <VaButton preset="secondary" icon="close" @click="closeModal">Close</VaButton>
          </header>

          <section class="m-body">
            <!-- VIEW -->
            <div v-if="modalMode === 'view'" class="viewGrid">
              <div class="vCard wide">
                <div class="bigRow">
                  <div class="bigIcon">
                    <VaIcon :name="selected?.icon || 'check'" size="large" />
                  </div>
                  <div>
                    <div class="bigName">{{ selected?.name }}</div>
                    <div class="bigSub">Category: <b>{{ label(selected?.category) }}</b></div>
                  </div>
                </div>
              </div>

              <div class="vCard">
                <div class="k">Icon Name</div>
                <div class="v mono">{{ selected?.icon || "-" }}</div>
                <div class="sub">Used by VaIcon / Material icons</div>
              </div>

              <div class="vCard">
                <div class="k">Category</div>
                <div class="v">{{ label(selected?.category) }}</div>
                <div class="sub">Used for filter + grouping</div>
              </div>
            </div>

            <!-- CREATE / EDIT (jQuery slideDown) -->
            <div v-else ref="formWrapRef" class="formWrap">
              <div class="formTop">
                <div class="formTitle">{{ modalMode === "create" ? "Create Feature" : "Edit Feature" }}</div>
                <div class="formSub">Clean, quick form for staff</div>
              </div>

              <div class="formGrid">
                <VaInput v-model="form.name" label="Feature Name *" placeholder="Free WiFi" />

                <VaSelect
                  v-model="form.category"
                  :options="['comfort','bathroom','connectivity','entertainment','facility','safety','policy','view','workspace']"
                  label="Category"
                />

                <VaSelect
                  v-model="form.icon"
                  :options="iconExamples"
                  label="Icon"
                />

                <div class="preview wide">
                  <div class="k">Preview</div>
                  <div class="previewRow">
                    <div class="previewIcon">
                      <VaIcon :name="form.icon || 'check'" />
                    </div>
                    <div>
                      <div class="pvName">{{ form.name || "Feature name..." }}</div>
                      <div class="pvSub">{{ label(form.category) }}</div>
                    </div>
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

/* summary */
.summary { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:12px; }
@media (max-width: 900px){ .summary{ grid-template-columns:1fr; } }
.sCard{ background:#fff; border:1px solid #e5eaf2; border-radius:14px; padding:12px 14px; box-shadow:0 10px 22px rgba(15,23,42,.06); }
.sCard .k{ font-size:12px; font-weight:900; color:#64748b; }
.sCard .v{ margin-top:4px; font-size:20px; font-weight:900; color:#0f172a; }
.sCard.ok{ background:#ecfdf5; border-color:#bbf7d0; }
.sCard.hint{ background:#eff6ff; border-color:#bfdbfe; }
.sCard .v2{ margin-top:6px; font-size:13px; font-weight:900; color:#0f172a; }

/* filters */
.filters{
  background:#fff; border:1px solid #eef2f6; border-radius:14px; box-shadow:0 8px 20px rgba(15,23,42,.06);
  padding:14px; display:grid; grid-template-columns:2fr 1fr 1fr; gap:12px; margin-bottom:14px;
}
@media (max-width: 860px){ .filters{ grid-template-columns:1fr; } }

/* grid cards */
.grid{
  display:grid;
  grid-template-columns:repeat(3, minmax(0, 1fr));
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

.featCard{
  background:#fff;
  border:1px solid #eef2f6;
  border-radius:16px;
  box-shadow:0 10px 24px rgba(15,23,42,.08);
  overflow:hidden;
  display:flex;
  gap:12px;
  padding:14px;
}

.iconBox{
  width:46px; height:46px;
  border-radius:14px;
  background:#f8fafc;
  border:1px solid #eef2f6;
  display:grid;
  place-items:center;
  flex: 0 0 auto;
}

.body{ flex:1; display:flex; flex-direction:column; gap:8px; }
.topRow{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.name{ font-size:15px; font-weight:900; color:#0f172a; }

.pill{
  display:inline-flex; align-items:center; padding:6px 10px; border-radius:999px;
  font-size:11px; font-weight:900; border:1px solid #e2e8f0; background:#f8fafc; color:#334155;
}
.sub{ font-size:12px; font-weight:700; color:#64748b; }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; }

.btns{ display:flex; gap:8px; justify-content:flex-end; margin-top:4px; }

/* modal */
.m-backdrop{
  position:fixed; inset:0; background:rgba(15,23,42,.45); z-index:99999;
  display:grid; place-items:center; padding:16px;
}
.m{
  width:min(900px,100%); background:#fff; border-radius:16px; border:1px solid #eef2f6;
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
.vCard .sub{ margin-top:4px; font-size:12px; font-weight:700; color:#64748b; }

.bigRow{ display:flex; align-items:center; gap:12px; }
.bigIcon{
  width:54px; height:54px; border-radius:16px; background:#fff;
  border:1px solid #eef2f6; display:grid; place-items:center;
}
.bigName{ font-size:18px; font-weight:900; color:#0f172a; }
.bigSub{ margin-top:2px; font-size:12px; font-weight:700; color:#64748b; }

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

.preview{
  border:1px dashed #cbd5e1;
  background:#f8fafc;
  border-radius:16px;
  padding:12px 14px;
}
.previewRow{ display:flex; gap:12px; align-items:center; margin-top:6px; }
.previewIcon{
  width:40px; height:40px; border-radius:14px; background:#fff;
  border:1px solid #eef2f6; display:grid; place-items:center;
}
.pvName{ font-weight:900; color:#0f172a; }
.pvSub{ margin-top:2px; font-size:12px; font-weight:700; color:#64748b; }

/* Vuestic polish */
:deep(.va-input__container),
:deep(.va-select__container){ border-radius:12px; background:#f9fafb; }
:deep(.va-button){ border-radius:12px; font-weight:900; }
</style>
