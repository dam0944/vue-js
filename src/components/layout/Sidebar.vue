<!-- src/components/layout/AdminSidebar.vue -->
<script setup>
import { ref, computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

const MENU = [
  { title: "Dashboard", icon: "dashboard", to: "/admin/dashboard" },

  // FRONT DESK = room booking + check-in/out (your PosRooms.vue should be here)
  {
    title: "Front Desk",
    icon: "support_agent",
    children: [
      { title: "Room Status", icon: "grid_view", to: "/admin/frontdesk/rooms-status", pin: true },
      { title: "Walk-in Booking", icon: "event_available", to: "/admin/frontdesk/quick-book" },
      { title: "Check-in", icon: "how_to_reg", to: "/admin/frontdesk/checkin" },
      { title: "Check-out", icon: "logout", to: "/admin/frontdesk/checkout" },
      { title: "In-House Guests", icon: "badge", to: "/admin/frontdesk/in-house" },
    ],
  },

  // RESERVATIONS = manage bookings (from front desk + from Flutter app later)
  {
    title: "Reservations",
    icon: "event",
    children: [
      { title: "All Reservations", icon: "list_alt", to: "/admin/reservations" },
      { title: "New Reservation", icon: "add_box", to: "/admin/reservations/create" },
      { title: "Calendar", icon: "calendar_month", to: "/admin/reservations/calendar" },
      { title: "Cancellations", icon: "cancel", to: "/admin/reservations/cancellations" }, // optional
      { title: "No-Shows", icon: "person_off", to: "/admin/reservations/no-shows" }, // optional
    ],
  },

  // POS = sell items/services (minibar/laundry/restaurant later)
  {
    title: "POS",
    icon: "point_of_sale",
    children: [
      { title: "Sell Items / Services", icon: "shopping_cart", to: "/admin/pos" }, 
      { title: "POS Orders", icon: "receipt_long", to: "/admin/pos/history" },
      { title: "Daily Closing", icon: "fact_check", to: "/admin/pos/closing" },
    ],
  },

  {
    title: "Rooms",
    icon: "meeting_room",
    children: [
      { title: "All Rooms", icon: "bed", to: "/admin/rooms" },
      { title: "Room Types", icon: "category", to: "/admin/rooms/types" },
      { title: "Room Images", icon: "image", to: "/admin/rooms/images" },
    ],
  },

  {
    title: "Guests",
    icon: "person",
    children: [
      { title: "All Guests", icon: "groups", to: "/admin/guests" },
      { title: "Add New Guest", icon: "person_add", to: "/admin/guests/create" },
      { title: "Documents (Upload)", icon: "folder", to: "/admin/guests/documents" }, // passport photo upload
      { title: "VIP Guests", icon: "star", to: "/admin/guests/vip" }, // optional
    ],
  },

  {
    title: "Billing",
    icon: "request_quote",
    children: [
      { title: "Invoices", icon: "receipt", to: "/admin/billing/invoices" },
      { title: "Payments", icon: "payments", to: "/admin/billing/payments" },
      { title: "Deposits", icon: "account_balance_wallet", to: "/admin/billing/deposits" },
      { title: "Extra Charges", icon: "add_circle", to: "/admin/billing/extra-charges" }, // optional
      { title: "Refunds", icon: "currency_exchange", to: "/admin/billing/refunds" }, // optional
    ],
  },

  {
    title: "Housekeeping",
    icon: "cleaning_services",
    children: [
      { title: "Today's Tasks", icon: "task_alt", to: "/admin/housekeeping/today" },
      { title: "All Tasks", icon: "list", to: "/admin/housekeeping/tasks" },
      { title: "Assign Task", icon: "assignment_ind", to: "/admin/housekeeping/assign" },
    ],
  },

  {
    title: "Reports",
    icon: "bar_chart",
    children: [
      { title: "Daily Report", icon: "today", to: "/admin/reports/daily" },
      { title: "Monthly Report", icon: "date_range", to: "/admin/reports/monthly" },
      { title: "Occupancy", icon: "pie_chart", to: "/admin/reports/occupancy" },
      { title: "Revenue", icon: "attach_money", to: "/admin/reports/revenue" },
      { title: "Payment Methods", icon: "payment", to: "/admin/reports/payment-methods" },
    ],
  },

  {
    title: "Settings",
    icon: "settings",
    children: [
      { title: "Property Settings", icon: "home_work", to: "/admin/settings/property" },
      { title: "Users", icon: "manage_accounts", to: "/admin/settings/users" },
      { title: "Roles & Permissions", icon: "admin_panel_settings", to: "/admin/settings/roles" },
      { title: "Payment Methods", icon: "credit_card", to: "/admin/settings/payment-methods" },
      { title: "System Config", icon: "tune", to: "/admin/settings/config" },
      { title: "Audit Logs", icon: "history", to: "/admin/settings/audit" },
    ],
  },
]

// ─── Props / Emits ───────────────────────────────────────────
const props = defineProps({
  collapsed: { type: Boolean, default: false },
})
const emit = defineEmits(["update:collapsed"])

// ─── Router ──────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()

// ─── Sidebar Collapse State ───────────────────────────────────
const isCollapsed = computed({
  get: () => props.collapsed,
  set: (val) => emit("update:collapsed", val),
})

// ─── Active Group Tracking ───────────────────────────────────
function findActiveGroup() {
  return MENU.find((m) => m.children?.some((c) => route.path.startsWith(c.to)))?.title ?? ""
}
const openGroup = ref(findActiveGroup())

watch(
  () => props.collapsed,
  (collapsed) => {
    if (collapsed) openGroup.value = ""
  }
)

router.afterEach(() => {
  if (!props.collapsed) openGroup.value = findActiveGroup()
})

function toggleGroup(title) {
  if (props.collapsed) return
  openGroup.value = openGroup.value === title ? "" : title
}

// ─── Navigation ──────────────────────────────────────────────
function go(target) {
  if (route.path !== target) router.push(target)
}
function isActive(to) {
  return route.path === to
}
function isGroupOpen(title) {
  return openGroup.value === title && !props.collapsed
}
function isGroupActive(item) {
  return item.children?.some((c) => route.path.startsWith(c.to)) ?? false
}

// ─── Tooltip for Collapsed State ─────────────────────────────
function getTooltip(item) {
  if (!props.collapsed) return ""
  return item.title
}

// ─── Search (optional) ───────────────────────────────────────
const q = ref("")
const filteredMenu = computed(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return MENU

  return MENU.map((m) => {
    if (!m.children) return m.title.toLowerCase().includes(query) ? m : null
    const children = m.children.filter((c) => c.title.toLowerCase().includes(query))
    if (m.title.toLowerCase().includes(query) || children.length) return { ...m, children }
    return null
  }).filter(Boolean)
})
</script>

<template>
  <VaSidebar
    class="sidebar"
    :class="{ 'sidebar-collapsed': isCollapsed }"
    :width="isCollapsed ? '72px' : '250px'"
  >
    <!-- Menu -->
    <div class="sidebar-scroll">
      <VaAccordion>
        <template v-for="item in filteredMenu" :key="item.to || item.title">
          <!-- Group -->
          <VaCollapse
            v-if="item.children"
            :model-value="isGroupOpen(item.title)"
            body-color="transparent"
            class="group"
          >
            <template #header>
              <VaSidebarItem
                class="menu-item"
                :active="isGroupActive(item)"
                @click="toggleGroup(item.title)"
                v-tooltip="getTooltip(item)"
              >
                <VaSidebarItemContent class="item-content">
                  <VaIcon :name="item.icon" class="item-icon" />

                  <VaSidebarItemTitle v-if="!isCollapsed" class="item-title">
                    {{ item.title }}
                  </VaSidebarItemTitle>

                  <VaSpacer v-if="!isCollapsed" />

                  <VaBadge
                    v-if="item.badge && !isCollapsed"
                    :text="item.badge"
                    color="danger"
                    class="item-badge"
                  />

                  <VaIcon
                    v-if="!isCollapsed"
                    :name="isGroupOpen(item.title) ? 'expand_less' : 'expand_more'"
                    size="small"
                    class="item-caret"
                  />
                </VaSidebarItemContent>
              </VaSidebarItem>
            </template>

            <template #body>
              <div v-if="!isCollapsed" class="submenu">
                <VaSidebarItem
                  v-for="child in item.children"
                  :key="child.to"
                  class="submenu-item"
                  :active="isActive(child.to)"
                  @click="go(child.to)"
                >
                  <VaSidebarItemContent class="item-content submenu-content">
                    <VaIcon :name="child.icon" size="18px" class="item-icon submenu-icon" />

                    <VaSidebarItemTitle class="item-title submenu-title">
                      {{ child.title }}
                    </VaSidebarItemTitle>

                    <VaSpacer />

                    <VaBadge
                      v-if="child.badge"
                      :text="child.badge"
                      color="danger"
                      size="small"
                      class="item-badge"
                    />

                    <span v-if="child.pin" class="pin-badge">PIN</span>
                  </VaSidebarItemContent>
                </VaSidebarItem>
              </div>
            </template>
          </VaCollapse>

          <!-- Single item -->
          <VaSidebarItem
            v-else
            class="menu-item"
            :active="isActive(item.to)"
            @click="go(item.to)"
            v-tooltip="getTooltip(item)"
          >
            <VaSidebarItemContent class="item-content">
              <VaIcon :name="item.icon" class="item-icon" />

              <VaSidebarItemTitle v-if="!isCollapsed" class="item-title">
                {{ item.title }}
              </VaSidebarItemTitle>

              <VaSpacer v-if="!isCollapsed" />

              <VaBadge
                v-if="item.badge && !isCollapsed"
                :text="item.badge"
                color="danger"
                class="item-badge"
              />
            </VaSidebarItemContent>
          </VaSidebarItem>
        </template>
      </VaAccordion>
    </div>

    <!-- Footer -->
    <div class="sidebar-footer" v-if="!isCollapsed">
      <div class="footer-hint">v1.0 • Modern style</div>
    </div>
  </VaSidebar>
</template>

<style scoped>
/* Modernize-ish, clean, minimal shadow */
.sidebar {
  top: 0;
  height: 100vh;
  background: #ffffff !important;
  border-right: 1px solid #eef2f7;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  transition: width 0.28s ease;
}

:deep(.va-sidebar),
:deep(.va-sidebar__content),
:deep(.va-sidebar__container) {
  background: #ffffff !important;
}

/* ✅ Hide scrollbar everywhere, keep scroll working */
:deep(.va-sidebar__content) {
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
}
:deep(.va-sidebar__content::-webkit-scrollbar) {
  width: 0;
  height: 0;
}

.sidebar-collapsed {
  width: 72px !important;
}

/* Scroll body (your menu list) */
.sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 10px 16px;

  /* ✅ hide scrollbar (Firefox) */
  scrollbar-width: none;
}

/* ✅ hide scrollbar (Chrome/Edge/Safari) */
.sidebar-scroll::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
.sidebar-scroll::-webkit-scrollbar-thumb {
  background: transparent;
}

/* Shared item */
.item-content {
  padding: 10px 12px !important;
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-collapsed .item-content {
  justify-content: center;
  padding: 10px !important;
}

.item-icon {
  color: #94a3b8;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.item-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-caret {
  color: #cbd5e1;
  flex-shrink: 0;
}

/* Top-level */
.menu-item {
  margin-bottom: 6px;
  border-radius: 14px !important;
  background: transparent !important;
  transition: background 0.18s ease, transform 0.18s ease;
}

.menu-item:hover {
  background: #f8fafc !important;
}

.menu-item[active="true"] {
  background: #eef6ff !important;
}

.menu-item[active="true"] .item-title {
  color: #0f172a !important;
}

.menu-item[active="true"] .item-icon {
  color: #2563eb !important;
}

/* Submenu */
.submenu {
  margin: 4px 0 10px 12px;
  padding-left: 10px;
  border-left: 1px solid #eef2f7;
}

.submenu-item {
  margin-bottom: 4px;
  border-radius: 12px !important;
  background: transparent !important;
}

.submenu-item:hover {
  background: #f8fafc !important;
}

.submenu-content {
  padding: 9px 10px !important;
}

.submenu-title {
  font-size: 0.85rem;
  color: #475569;
  font-weight: 650;
}

.submenu-item[active="true"] {
  background: #eaf2ff !important;
}

.submenu-item[active="true"] .submenu-title,
.submenu-item[active="true"] .submenu-icon {
  color: #2563eb !important;
}

/* Badges */
.item-badge {
  flex-shrink: 0;
}
.pin-badge {
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.62rem;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 6px;
  flex-shrink: 0;
}

/* Footer */
.sidebar-footer {
  padding: 10px 14px;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
}
.footer-hint {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
  }
  .sidebar-collapsed {
    transform: translateX(-100%);
  }
}
</style>
