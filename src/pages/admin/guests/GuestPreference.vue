<script setup>
import { ref, computed, nextTick, watch } from "vue"
import $ from "jquery"
import { guestPreferences as seed } from "@/data/guest/guestPreferences"
import GuestPreferenceForm from "@/components/guest/GuestPreferenceForm.vue"
// import GuestPreferenceForm from "@/components/guest/GuestPreferenceForm.vue"

const rows = ref(seed.map((x) => ({ ...x })))

// ---------------- Filters ----------------
const q = ref("")
const roomType = ref("")
const floorPref = ref("")
const nonSmoking = ref("")
const sort = ref("newest")

const safe = (v) => (v ?? "").toString().toLowerCase()
const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")

const roomTypeOptions = computed(() => {
  const s = new Set()
  rows.value.forEach((r) => s.add(r.room_preferences?.preferred_room_type || ""))
  return ["", ...Array.from(s).filter(Boolean)]
})
const floorPrefOptions = ["", "low_floor", "mid_floor", "high_floor"]

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.guest_name).includes(key) ||
      safe(r.room_preferences?.preferred_room_type).includes(key) ||
      safe(r.food_preferences?.allergies).includes(key)

    const okType = !roomType.value || r.room_preferences?.preferred_room_type === roomType.value
    const okFloor = !floorPref.value || r.room_preferences?.floor_preference === floorPref.value

    const okNonSmoking =
      nonSmoking.value === ""
        ? true
        : Boolean(r.room_preferences?.non_smoking) === (nonSmoking.value === "yes")

    return hit && okType && okFloor && okNonSmoking
  })

  if (sort.value === "newest") list.sort((a, b) => (b.preference_id || 0) - (a.preference_id || 0))
  if (sort.value === "oldest") list.sort((a, b) => (a.preference_id || 0) - (b.preference_id || 0))
  if (sort.value === "guest") list.sort((a, b) => safe(a.guest_name).localeCompare(safe(b.guest_name)))

  return list
})

// ---------------- View modal ----------------
const viewOpen = ref(false)
const selected = ref(null)
function openView(r) {
  selected.value = r
  viewOpen.value = true
}
function closeView() {
  viewOpen.value = false
  selected.value = null
}

// ---------------- SlideDown create/edit ----------------
const slideOpen = ref(false)
const slideMode = ref("create") // create | edit
const slidePanelRef = ref(null)
const currentRow = ref(null)

function blankPreference() {
  const nextId = Math.max(...rows.value.map((x) => x.preference_id || 0), 0) + 1
  return {
    preference_id: null,
    guest_id: null,
    guest_name: "",
    room_preferences: {
      preferred_room_type: "",
      floor_preference: "mid_floor",
      quiet_room: false,
      non_smoking: true,
      near_elevator: false,
    },
    bedding_preferences: {
      bed_type: "queen",
      extra_pillow: false,
      extra_blanket: false,
    },
    service_preferences: {
      daily_cleaning: true,
      wake_up_call: false,
      late_checkout: false,
      preferred_checkin_time: "14:00",
    },
    food_preferences: {
      breakfast_included: false,
      vegetarian: false,
      halal_food: false,
      allergies: "None",
    },
    special_notes: "",
    _nextIdHint: nextId, // just for create (not required)
  }
}

function slideDownPanel() {
  nextTick(() => {
    const el = slidePanelRef.value
    if (!el) return
    $(el).stop(true, true).hide().slideDown(260, () => {
      window.dispatchEvent(new Event("resize"))
    })
  })
}
function slideUpPanel(cb) {
  const el = slidePanelRef.value
  if (!el) return cb?.()
  $(el).stop(true, true).slideUp(200, () => cb?.())
}

function openCreate() {
  slideMode.value = "create"
  currentRow.value = blankPreference()
  slideOpen.value = true
  slideDownPanel()
}
function openEdit(r) {
  slideMode.value = "edit"
  currentRow.value = JSON.parse(JSON.stringify(r)) // deep copy
  slideOpen.value = true
  slideDownPanel()
}
function closeSlide() {
  slideUpPanel(() => {
    slideOpen.value = false
    currentRow.value = null
  })
}

// ---------------- Save handlers (from form) ----------------
function saveFromForm(payload) {
  if (!payload.guest_name?.trim()) {
    alert("Guest name is required.")
    return
  }

  if (slideMode.value === "create") {
    const nextId = Math.max(...rows.value.map((x) => x.preference_id || 0), 0) + 1
    rows.value.unshift({
      ...payload,
      preference_id: nextId,
      guest_name: payload.guest_name.trim(),
    })
  } else {
    const idx = rows.value.findIndex((x) => x.preference_id === payload.preference_id)
    if (idx !== -1) rows.value.splice(idx, 1, payload)
  }

  closeSlide()
}

// lock scroll
watch([slideOpen, viewOpen], ([s, v]) => {
  document.body.style.overflow = s || v ? "hidden" : ""
})
</script>

<template>
  <div class="page">
    <div class="head">
      <div>
        <h1>Guest Preferences</h1>
        <p>Filters • badges • view modal • create/edit slideDown panel</p>
      </div>

      <VaButton color="success" icon="add" @click="openCreate">New Preference</VaButton>
    </div>

    <!-- Filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search guest / room type / allergies..." />
      <VaSelect v-model="roomType" :options="roomTypeOptions" label="Preferred Type" />
      <VaSelect v-model="floorPref" :options="floorPrefOptions" label="Floor Pref" />
      <VaSelect v-model="nonSmoking" :options="['', 'yes', 'no']" label="Non-Smoking" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Newest', value: 'newest' },
          { text: 'Oldest', value: 'oldest' },
          { text: 'Guest A-Z', value: 'guest' },
        ]"
        text-by="text"
        value-by="value"
        label="Sort"
      />
    </VaCard>

    <!-- Table -->
    <VaCard class="tableCard">
      <div class="tableWrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room Pref</th>
              <th>Bed</th>
              <th>Service</th>
              <th>Food</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="6" class="empty">No preferences found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.preference_id">
              <td>
                <div class="main">{{ r.guest_name }}</div>
                <div class="sub">ID: {{ r.guest_id ?? "-" }}</div>
              </td>

              <td>
                <div class="chips">
                  <span class="chip">{{ r.room_preferences?.preferred_room_type || "-" }}</span>
                  <span class="chip soft">{{ label(r.room_preferences?.floor_preference) }}</span>
                  <span v-if="r.room_preferences?.quiet_room" class="chip ok">QUIET</span>
                  <span v-if="r.room_preferences?.non_smoking" class="chip ok">NON-SMOKE</span>
                  <span v-if="r.room_preferences?.near_elevator" class="chip warn">NEAR LIFT</span>
                </div>
              </td>

              <td>
                <div class="chips">
                  <span class="chip">{{ label(r.bedding_preferences?.bed_type) }}</span>
                  <span v-if="r.bedding_preferences?.extra_pillow" class="chip soft">EXTRA PILLOW</span>
                  <span v-if="r.bedding_preferences?.extra_blanket" class="chip soft">EXTRA BLANKET</span>
                </div>
              </td>

              <td>
                <div class="chips">
                  <span v-if="r.service_preferences?.daily_cleaning" class="chip ok">DAILY CLEAN</span>
                  <span v-if="r.service_preferences?.wake_up_call" class="chip warn">WAKE-UP</span>
                  <span v-if="r.service_preferences?.late_checkout" class="chip warn">LATE OUT</span>
                  <span class="chip soft">IN: {{ r.service_preferences?.preferred_checkin_time || "-" }}</span>
                </div>
              </td>

              <td>
                <div class="chips">
                  <span v-if="r.food_preferences?.breakfast_included" class="chip ok">BREAKFAST</span>
                  <span v-if="r.food_preferences?.vegetarian" class="chip soft">VEG</span>
                  <span v-if="r.food_preferences?.halal_food" class="chip soft">HALAL</span>
                  <span
                    class="chip"
                    :class="(r.food_preferences?.allergies || 'None') !== 'None' ? 'danger' : ''"
                  >
                    Allergy: {{ r.food_preferences?.allergies || "None" }}
                  </span>
                </div>
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

    <!-- VIEW MODAL -->
    <Teleport to="body">
      <div v-if="viewOpen" class="m-wrap" @click.self="closeView">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">Preference Details</div>
              <div class="m-sub">{{ selected?.guest_name || "-" }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeView">Close</VaButton>
          </header>

          <section class="m-body">
            <div v-if="selected" class="viewGrid">
              <div class="card">
                <div class="t">Room Preferences</div>
                <div class="chips">
                  <span class="chip">{{ selected.room_preferences?.preferred_room_type }}</span>
                  <span class="chip soft">{{ label(selected.room_preferences?.floor_preference) }}</span>
                  <span v-if="selected.room_preferences?.quiet_room" class="chip ok">QUIET</span>
                  <span v-if="selected.room_preferences?.non_smoking" class="chip ok">NON-SMOKE</span>
                  <span v-if="selected.room_preferences?.near_elevator" class="chip warn">NEAR LIFT</span>
                </div>
              </div>

              <div class="card">
                <div class="t">Bedding</div>
                <div class="chips">
                  <span class="chip">{{ label(selected.bedding_preferences?.bed_type) }}</span>
                  <span v-if="selected.bedding_preferences?.extra_pillow" class="chip soft">EXTRA PILLOW</span>
                  <span v-if="selected.bedding_preferences?.extra_blanket" class="chip soft">EXTRA BLANKET</span>
                </div>
              </div>

              <div class="card">
                <div class="t">Service</div>
                <div class="chips">
                  <span v-if="selected.service_preferences?.daily_cleaning" class="chip ok">DAILY CLEAN</span>
                  <span v-if="selected.service_preferences?.wake_up_call" class="chip warn">WAKE-UP</span>
                  <span v-if="selected.service_preferences?.late_checkout" class="chip warn">LATE OUT</span>
                  <span class="chip soft">IN: {{ selected.service_preferences?.preferred_checkin_time }}</span>
                </div>
              </div>

              <div class="card">
                <div class="t">Food</div>
                <div class="chips">
                  <span v-if="selected.food_preferences?.breakfast_included" class="chip ok">BREAKFAST</span>
                  <span v-if="selected.food_preferences?.vegetarian" class="chip soft">VEG</span>
                  <span v-if="selected.food_preferences?.halal_food" class="chip soft">HALAL</span>
                  <span
                    class="chip"
                    :class="(selected.food_preferences?.allergies || 'None') !== 'None' ? 'danger' : ''"
                  >
                    Allergy: {{ selected.food_preferences?.allergies || "None" }}
                  </span>
                </div>
              </div>

              <div class="card wide" v-if="selected.special_notes">
                <div class="t">Special Notes</div>
                <div class="note">{{ selected.special_notes }}</div>
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="closeView">Close</VaButton>
            <VaButton color="primary" @click="closeView(); openEdit(selected)">Edit</VaButton>
          </footer>
        </div>
      </div>
    </Teleport>

    <!-- CREATE/EDIT SLIDE PANEL -->
    <Teleport to="body">
      <div v-show="slideOpen" class="slideOverlay" @click.self="closeSlide">
        <div ref="slidePanelRef" class="slidePanel">
          <div class="slideHead">
            <div>
              <div class="m-title">{{ slideMode === "create" ? "Create Preference" : "Edit Preference" }}</div>
              <div class="m-sub">{{ currentRow?.guest_name || "—" }}</div>
            </div>

            <div class="slideActions">
              <VaButton preset="secondary" @click="closeSlide">Cancel</VaButton>
              <VaButton color="success" icon="save" @click="$refs.prefFormRef?.submit?.()">Save</VaButton>
            </div>
          </div>

          <div class="slideBody">
            <GuestPreferenceForm
              ref="prefFormRef"
              :mode="slideMode"
              :value="currentRow"
              :room-type-options="roomTypeOptions.filter(Boolean)"
              @submit="saveFromForm"
              @cancel="closeSlide"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page { padding: 20px 24px; background: #f6f8fb; min-height: 100vh; }

.head { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
.head h1 { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; }
.head p { margin: 6px 0 0; font-size: 13px; color: #475569; }

/* filters + table (same as your style) */
.filters{
  background:#fff;border:1px solid #eef2f6;border-radius:14px;
  box-shadow:0 8px 20px rgba(15,23,42,.06);
  padding:14px;display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;
  gap:12px;margin-bottom:14px;
}
@media (max-width:1000px){ .filters{ grid-template-columns:1fr 1fr; } }
@media (max-width:520px){ .filters{ grid-template-columns:1fr; } }

.tableCard{ border-radius:14px;border:1px solid #eef2f6; box-shadow:0 10px 24px rgba(15,23,42,.08); }
.tableWrap{ overflow-x:auto; }
.tbl{ width:100%; border-collapse:collapse; background:#fff; }
.tbl th{ text-align:left;padding:12px 14px;font-size:12px;color:#475569;border-bottom:1px solid #eef2f6;background:#fbfcfe;white-space:nowrap; }
.tbl td{ padding:12px 14px;border-bottom:1px solid #f1f5f9;vertical-align:top; }
.tbl tr:hover td{ background:#fafcff; }

.right{ text-align:right; }
.main{ font-weight:900;color:#0f172a;font-size:13px; }
.sub{ margin-top:4px;font-size:12px;color:#64748b; }
.empty{ text-align:center;padding:20px !important;font-weight:800;color:#64748b; }

.btns{ display:inline-flex; gap:8px; justify-content:flex-end; flex-wrap:wrap; }

/* chips */
.chips{ display:flex; gap:6px; flex-wrap:wrap; }
.chip{ display:inline-flex; align-items:center; padding:6px 10px; border-radius:999px; font-size:11px; font-weight:900;
  border:1px solid #e2e8f0;background:#f8fafc;color:#334155; }
.chip.soft{ background:#f1f5f9; }
.chip.ok{ background:#dcfce7;border-color:#bbf7d0;color:#166534; }
.chip.warn{ background:#fef9c3;border-color:#fde68a;color:#854d0e; }
.chip.danger{ background:#fee2e2;border-color:#fecaca;color:#991b1b; }

/* view modal */
.m-wrap{ position:fixed; inset:0; z-index:99999; background:rgba(15,23,42,.45); display:grid; place-items:center; padding:18px; }
.m{ width:min(980px,100%); max-height:95vh; background:#fff; border-radius:16px; border:1px solid #eef2f6;
  box-shadow:0 30px 90px rgba(15,23,42,.22); overflow:hidden; }
.m-head{ padding:14px 16px;border-bottom:1px solid #eef2f6;background:#fbfcfe; display:flex; justify-content:space-between; align-items:center; gap:12px; }
.m-title{ font-size:16px;font-weight:900;color:#0f172a; }
.m-sub{ margin-top:2px;font-size:12px;color:#64748b; }
.m-body{ padding:16px; overflow:auto; max-height:calc(92vh - 118px); }
.m-foot{ padding:14px 16px;border-top:1px solid #eef2f6; display:flex; justify-content:flex-end; gap:10px;background:#fff; }
.viewGrid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width:760px){ .viewGrid{ grid-template-columns:1fr; } }
.card{ border:1px solid #eef2f6;border-radius:14px;background:#fbfcfe;padding:14px; }
.card.wide{ grid-column:1/-1; }
.t{ font-size:12px;color:#64748b;font-weight:800;margin-bottom:8px; }
.note{ font-weight:800;color:#0f172a; }

/* slide panel */
.slideOverlay{ position:fixed; inset:0; z-index:99999; background:rgba(15,23,42,.45); overflow:auto; }
.slidePanel{
  display:none; /* IMPORTANT for jQuery */
  width:min(1100px,100%);
  margin:0 auto;
  background:#fff;
  border:1px solid #eef2f6;
  box-shadow:0 30px 90px rgba(15,23,42,.22);
  border-radius:0 0 16px 16px;
  overflow:hidden;
}
.slideHead{
  padding:14px 16px;border-bottom:1px solid #eef2f6;background:#fbfcfe;
  display:flex; justify-content:space-between; align-items:center; gap:12px;
}
.slideActions{ display:inline-flex; gap:10px; }
.slideBody{ padding:16px; max-height:calc(100vh - 140px); overflow:auto; }

/* IMPORTANT: make vuestic dropdown visible above overlay */
:deep(.va-dropdown__content),
:deep(.va-popover__content) {
  z-index: 100000 !important;
}

/* Vuestic polish */
:deep(.va-input__container),
:deep(.va-select__container),
:deep(.va-textarea__container){
  border-radius:10px;background:#f9fafb;
}
:deep(.va-button){ border-radius:10px; font-weight:800; }
</style>
