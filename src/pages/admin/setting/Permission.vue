<script setup>
import { ref, computed, nextTick, watch } from "vue"
import $ from "jquery"
import { setting_permission as seed } from "@/data/setting/permission"

// table data
const rows = ref(seed.map((x) => ({ ...x })))

// filters
const q = ref("")
const moduleF = ref("")
const activeF = ref("")
const sort = ref("module")

const safe = (v) => (v ?? "").toString().toLowerCase()
const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-")

const moduleOptions = computed(() => {
  const s = new Set()
  rows.value.forEach((r) => s.add(r.module || ""))
  return ["", ...Array.from(s).filter(Boolean)]
})

const filtered = computed(() => {
  const key = safe(q.value)

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.permission_name).includes(key) ||
      safe(r.display_name).includes(key) ||
      safe(r.module).includes(key) ||
      safe(r.action).includes(key)

    const okModule = !moduleF.value || r.module === moduleF.value
    const okActive =
      activeF.value === ""
        ? true
        : Boolean(r.is_active) === (activeF.value === "active")

    return hit && okModule && okActive
  })

  if (sort.value === "module") list.sort((a, b) => safe(a.module).localeCompare(safe(b.module)))
  if (sort.value === "name") list.sort((a, b) => safe(a.display_name).localeCompare(safe(b.display_name)))
  if (sort.value === "roles_desc") list.sort((a, b) => (b.total_roles || 0) - (a.total_roles || 0))
  if (sort.value === "newest") list.sort((a, b) => (b.permission_id || 0) - (a.permission_id || 0))

  return list
})

const stats = computed(() => {
  const total = rows.value.length
  const active = rows.value.filter((r) => r.is_active).length
  const modules = new Set(rows.value.map((r) => r.module).filter(Boolean)).size
  return { total, active, modules }
})

// ---------- slideDown modal (VIEW ONLY) ----------
const modalOpen = ref(false)
const selected = ref(null)
const panelRef = ref(null)

function slideDownPanel() {
  nextTick(() => {
    const el = panelRef.value
    if (!el) return
    $(el).stop(true, true).css("display", "none").slideDown(240)
  })
}
function slideUpPanel(cb) {
  const el = panelRef.value
  if (!el) return cb?.()
  $(el).stop(true, true).slideUp(200, () => cb?.())
}

function openView(r) {
  selected.value = r
  modalOpen.value = true
  slideDownPanel()
}

function closeModal() {
  slideUpPanel(() => {
    modalOpen.value = false
    selected.value = null
  })
}

function toggleActive(r) {
  const idx = rows.value.findIndex((x) => x.permission_id === r.permission_id)
  if (idx === -1) return
  rows.value[idx].is_active = !rows.value[idx].is_active
}

function resetFilters() {
  q.value = ""
  moduleF.value = ""
  activeF.value = ""
  sort.value = "module"
}

// lock scroll
watch(modalOpen, (v) => (document.body.style.overflow = v ? "hidden" : ""))
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Permission Settings</h1>
        <p>Permissions table • filter • view details (slideDown) • create/edit in one form page</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="refresh" @click="resetFilters">Reset</VaButton>

        <!-- create goes to one form page -->
        <VaButton
          color="success"
          icon="add"
          @click="$router.push({ name: 'admin.setting.permission.create' })"
        >
          New Permission
        </VaButton>
      </div>
    </div>

    <!-- summary -->
    <div class="stats">
      <div class="stat">
        <div class="k">Total Permissions</div>
        <div class="v">{{ stats.total }}</div>
      </div>
      <div class="stat ok">
        <div class="k">Active</div>
        <div class="v">{{ stats.active }}</div>
      </div>
      <div class="stat blue">
        <div class="k">Modules</div>
        <div class="v">{{ stats.modules }}</div>
      </div>
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search name / display / module / action..." />
      <VaSelect v-model="moduleF" :options="moduleOptions" label="Module" />
      <VaSelect v-model="activeF" :options="['', 'active', 'inactive']" label="Status" />
      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Module', value: 'module' },
          { text: 'Name', value: 'name' },
          { text: 'Most Roles', value: 'roles_desc' },
          { text: 'Newest', value: 'newest' },
        ]"
        text-by="text"
        value-by="value"
        label="Sort"
      />
    </VaCard>

    <!-- table -->
    <VaCard class="tableCard">
      <div class="tableWrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Permission</th>
              <th>Module</th>
              <th>Action</th>
              <th>Description</th>
              <th class="center">Roles</th>
              <th class="center">Status</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="empty">No permissions found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.permission_id">
              <td>
                <div class="main">{{ r.display_name }}</div>
                <div class="sub mono">{{ r.permission_name }}</div>
              </td>

              <td>
                <span class="pill soft">{{ label(r.module) }}</span>
              </td>

              <td>
                <span class="pill">{{ label(r.action) }}</span>
              </td>

              <td>
                <div class="desc">{{ r.description || "-" }}</div>
              </td>

              <td class="center">
                <span class="pill blue">{{ r.total_roles ?? 0 }}</span>
              </td>

              <td class="center">
                <span class="pill" :class="r.is_active ? 'ok' : 'danger'">
                  {{ r.is_active ? "ACTIVE" : "INACTIVE" }}
                </span>
              </td>

              <td class="right">
                <div class="btns">
                  <VaButton size="small" preset="secondary" @click="openView(r)">View</VaButton>

                  <!-- ✅ Edit goes to the same form page -->
                  <VaButton
                    size="small"
                    color="primary"
                    @click="$router.push({
                      name: 'admin.settings.permissions.edit',
                      params: { permissionId: r.permission_id }
                    })"
                  >
                    Edit
                  </VaButton>

                  <VaButton
                    size="small"
                    :color="r.is_active ? 'danger' : 'success'"
                    preset="secondary"
                    @click="toggleActive(r)"
                  >
                    {{ r.is_active ? "Disable" : "Enable" }}
                  </VaButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- VIEW ONLY modal / slideDown panel -->
    <Teleport to="body">
      <div v-if="modalOpen" class="overlay" @click="closeModal">
        <div class="drawer" @click.stop>
          <header class="drawerHead">
            <div>
              <div class="drawerTitle">Permission Details</div>
              <div class="drawerSub">{{ selected?.display_name || "-" }}</div>
            </div>

            <VaButton preset="secondary" icon="close" @click="closeModal">Close</VaButton>
          </header>

          <section class="drawerBody">
            <!-- jQuery slideDown target -->
            <div ref="panelRef" class="drawerInner">
              <div v-if="selected" class="viewGrid">
                <div class="box">
                  <div class="t">Display Name</div>
                  <div class="big">{{ selected.display_name }}</div>
                  <div class="muted mono">{{ selected.permission_name }}</div>
                </div>

                <div class="box">
                  <div class="t">Module / Action</div>
                  <div class="chips">
                    <span class="pill soft">{{ label(selected.module) }}</span>
                    <span class="pill">{{ label(selected.action) }}</span>
                  </div>
                  <div class="muted">Roles using it: <b>{{ selected.total_roles ?? 0 }}</b></div>
                </div>

                <div class="box wide">
                  <div class="t">Description</div>
                  <div class="note">{{ selected.description || "-" }}</div>
                </div>

                <div class="box wide">
                  <div class="t">Status</div>
                  <span class="pill" :class="selected.is_active ? 'ok' : 'danger'">
                    {{ selected.is_active ? "ACTIVE" : "INACTIVE" }}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <footer class="drawerFoot">
            <VaButton preset="secondary" @click="closeModal">Close</VaButton>

            <!-- ✅ Optional: quick edit from view -->
            <VaButton
              color="primary"
              :disabled="!selected?.permission_id"
              @click="$router.push({
                name: 'admin.settings.permissions.edit',
                params: { permissionId: selected.permission_id }
              })"
            >
              Edit
            </VaButton>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* keep your existing styles - this is minimal safe base */
.page { padding: 20px 24px; background: #f6f8fb; min-height: 100vh; }

.head { display:flex; justify-content:space-between; align-items:flex-start; gap:14px; margin-bottom:14px; }
.head h1 { font-size:22px; font-weight:900; color:#0f172a; margin:0; }
.head p { margin:6px 0 0; font-size:13px; color:#475569; }
.headBtns { display:inline-flex; gap:10px; flex-wrap:wrap; }

.stats { display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin: 10px 0 14px; }
@media (max-width: 900px){ .stats{ grid-template-columns: 1fr; } }
.stat{ background:#fff; border:1px solid #eef2f6; border-radius:14px; padding:12px 14px; box-shadow: 0 8px 20px rgba(15,23,42,.06); }
.stat .k{ font-size:12px; color:#64748b; font-weight:900; }
.stat .v{ margin-top:4px; font-size:20px; font-weight:900; color:#0f172a; }
.stat.ok{ background:#fbfffb; border-color:#dcfce7; }
.stat.blue{ background:#fbfdff; border-color:#dbeafe; }

.filters{ background:#fff; border:1px solid #eef2f6; border-radius:14px; box-shadow: 0 8px 20px rgba(15,23,42,.06);
  padding:14px; display:grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap:12px; margin-bottom:14px; }
@media (max-width: 900px){ .filters{ grid-template-columns: 1fr; } }

.tableCard{ border-radius:14px; border:1px solid #eef2f6; box-shadow: 0 10px 24px rgba(15,23,42,.08); }
.tableWrap{ overflow-x:auto; }
.tbl{ width:100%; border-collapse:collapse; background:#fff; }
.tbl th{ text-align:left; padding:12px 14px; font-size:12px; color:#475569; border-bottom:1px solid #eef2f6; background:#fbfcfe; white-space:nowrap; }
.tbl td{ padding:12px 14px; border-bottom:1px solid #f1f5f9; vertical-align:top; }
.tbl tr:hover td{ background:#fafcff; }

.right{ text-align:right; }
.center{ text-align:center; }
.main{ font-weight:900; color:#0f172a; font-size:13px; }
.sub{ margin-top:4px; font-size:12px; color:#64748b; }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.desc{ font-size:12px; color:#334155; font-weight:800; }
.empty{ text-align:center; padding:20px !important; font-weight:800; color:#64748b; }

.pill{ display:inline-flex; align-items:center; padding:6px 10px; border-radius:999px; font-size:11px; font-weight:900;
  border:1px solid #e2e8f0; background:#f8fafc; color:#334155; }
.pill.soft{ background:#f1f5f9; }
.pill.blue{ background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; }
.pill.ok{ background:#dcfce7; border-color:#bbf7d0; color:#166534; }
.pill.danger{ background:#fee2e2; border-color:#fecaca; color:#991b1b; }

.btns{ display:inline-flex; gap:8px; justify-content:flex-end; flex-wrap:wrap; }

/* Drawer */
.overlay{ position:fixed; inset:0; z-index:99999; background: rgba(15,23,42,.45); display:grid; place-items:center; padding:18px; }
.drawer{ width:min(980px, 100%); max-height:95vh; background:#fff; border-radius:16px; border:1px solid #eef2f6;
  box-shadow: 0 30px 90px rgba(15,23,42,.22); overflow:hidden; }
.drawerHead{ padding:14px 16px; border-bottom:1px solid #eef2f6; background:#fbfcfe; display:flex; justify-content:space-between; align-items:center; gap:12px; }
.drawerTitle{ font-size:16px; font-weight:900; color:#0f172a; }
.drawerSub{ margin-top:2px; font-size:12px; color:#64748b; font-weight:800; }
.drawerBody{ padding:16px; overflow:auto; max-height: calc(92vh - 118px); }
.drawerFoot{ padding:14px 16px; border-top:1px solid #eef2f6; display:flex; justify-content:flex-end; gap:10px; background:#fff; }

/* view grid */
.viewGrid{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
@media (max-width: 760px){ .viewGrid{ grid-template-columns:1fr; } }
.box{ border:1px solid #eef2f6; border-radius:14px; background:#fbfcfe; padding:14px; }
.box.wide{ grid-column: 1 / -1; }
.t{ font-size:12px; color:#64748b; font-weight:800; margin-bottom:8px; }
.big{ font-size:18px; font-weight:900; color:#0f172a; }
.muted{ color:#64748b; font-weight:800; }
.note{ font-size:12px; color:#334155; font-weight:800; line-height:1.5; }

/* jQuery slide target */
.drawerInner{ display:none; }

:deep(.va-input__container), :deep(.va-select__container) { border-radius:10px; background:#f9fafb; }
:deep(.va-button){ border-radius:10px; font-weight:800; }
</style>
