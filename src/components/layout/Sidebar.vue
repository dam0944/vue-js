<script setup>
import { ref, computed } from "vue"
import { useRoute, useRouter } from "vue-router"

// ─── Menu Definition ─────────────────────────────────────────
const MENU = [
  {
    title: "Dashboard",
    icon: "dashboard",
    to: "/admin/dashboard",
  },
  {
    title: "POS / Cashier",
    icon: "point_of_sale",
    children: [
      { title: "Room POS",       icon: "shopping_cart",  to: "/admin/pos" },
      { title: "POS History",    icon: "receipt_long",   to: "/admin/pos/history" },
      { title: "Daily Closing",  icon: "fact_check",     to: "/admin/pos/closing" },
    ],
  },
  {
    title: "Front Desk",
    icon: "support_agent",
    children: [
      { title: "Room Status Board",   icon: "grid_view",          to: "/admin/frontdesk/rooms-status",  pin: true },
      { title: "Quick Book (Walk-in)", icon: "person_add_alt_1",  to: "/admin/frontdesk/quick-book" },
      { title: "Check-in",            icon: "how_to_reg",         to: "/admin/frontdesk/checkin" },
      { title: "Check-out",           icon: "logout",             to: "/admin/frontdesk/checkout" },
      { title: "In-House Guests",     icon: "badge",              to: "/admin/frontdesk/in-house" },
    ],
  },
  {
    title: "Reservations",
    icon: "event",
    children: [
      { title: "All Bookings",   icon: "list_alt",       to: "/admin/reservations" },
      { title: "New Booking",    icon: "add_box",        to: "/admin/reservations/create" },
      { title: "Calendar",       icon: "calendar_month", to: "/admin/reservations/calendar" },
      { title: "Cancellations",  icon: "cancel",         to: "/admin/reservations/cancellations" },
      { title: "No-Shows",       icon: "person_off",     to: "/admin/reservations/no-shows" },
    ],
  },
  {
    title: "Rooms",
    icon: "meeting_room",
    children: [
      { title: "All Rooms",    icon: "bed",       to: "/admin/rooms" },
      { title: "Room Types",   icon: "category",  to: "/admin/rooms/types" },
      { title: "Room Images",  icon: "image",     to: "/admin/rooms/images" },
      { title: "Room Keys",    icon: "vpn_key",   to: "/admin/rooms/keys" },
      { title: "Maintenance",  icon: "build",     to: "/admin/rooms/maintenance" },
    ],
  },
  {
    title: "Guests",
    icon: "person",
    children: [
      { title: "All Guests",       icon: "groups",  to: "/admin/guests" },
      { title: "Add New Guest",    icon: "person_add", to: "/admin/guests/create" },
      { title: "Guest Documents",  icon: "folder",  to: "/admin/guests/documents" },
      { title: "VIP Guests",       icon: "star",    to: "/admin/guests/vip" },
    ],
  },
  {
    title: "Billing",
    icon: "request_quote",
    children: [
      { title: "Invoices",       icon: "receipt",                  to: "/admin/billing/invoices" },
      { title: "Payments",       icon: "payments",                 to: "/admin/billing/payments" },
      { title: "Deposits",       icon: "account_balance_wallet",   to: "/admin/billing/deposits" },
      { title: "Extra Charges",  icon: "add_circle",               to: "/admin/billing/extra-charges" },
      { title: "Refunds",        icon: "currency_exchange",        to: "/admin/billing/refunds" },
    ],
  },
  {
    title: "Housekeeping",
    icon: "cleaning_services",
    children: [
      { title: "Today's Tasks",  icon: "task_alt",       to: "/admin/housekeeping/today" },
      { title: "All Tasks",      icon: "list",           to: "/admin/housekeeping/tasks" },
      { title: "Assign Task",    icon: "assignment_ind", to: "/admin/housekeeping/assign" },
    ],
  },
  {
    title: "Reports",
    icon: "bar_chart",
    children: [
      { title: "Daily Report",    icon: "today",          to: "/admin/reports/daily" },
      { title: "Monthly Report",  icon: "date_range",     to: "/admin/reports/monthly" },
      { title: "Occupancy",       icon: "pie_chart",      to: "/admin/reports/occupancy" },
      { title: "Revenue",         icon: "attach_money",   to: "/admin/reports/revenue" },
      { title: "Payment Methods", icon: "payment",        to: "/admin/reports/payment-methods" },
    ],
  },
  {
    title: "Settings",
    icon: "settings",
    children: [
      { title: "Property Settings",    icon: "home_work",             to: "/admin/settings/property" },
      { title: "Users",                icon: "manage_accounts",       to: "/admin/settings/users" },
      { title: "Roles & Permissions",  icon: "admin_panel_settings",  to: "/admin/settings/roles" },
      { title: "Payment Methods",      icon: "credit_card",           to: "/admin/settings/payment-methods" },
      { title: "System Config",        icon: "tune",                  to: "/admin/settings/config" },
      { title: "Audit Logs",           icon: "history",               to: "/admin/settings/audit" },
    ],
  },
]

// ─── Router ──────────────────────────────────────────────────
const route  = useRoute()
const router = useRouter()

// ─── Active Group Tracking ───────────────────────────────────
// Derives which group is open based on the current route,
// then allows manual toggle on top of that.
function findActiveGroup() {
  return MENU.find((m) => m.children?.some((c) => route.path.startsWith(c.to)))?.title ?? ""
}

const openGroup = ref(findActiveGroup())

// Keep the sidebar in sync when navigating via back/forward buttons
// or external links — no need for a manual watcher on every click.

router.afterEach(() => {
  openGroup.value = findActiveGroup()
})

function toggleGroup(title) {
  openGroup.value = openGroup.value === title ? "" : title
}

// ─── Navigation ──────────────────────────────────────────────
function go(target) {
  if (route.path !== target) router.push(target)
}

// ─── State Helpers (used in template) ────────────────────────
function isActive(to)     { return route.path === to }
function isGroupOpen(title) { return openGroup.value === title }
function isGroupActive(item) {
  return item.children?.some((c) => route.path.startsWith(c.to)) ?? false
}
</script>

<template>
  <VaSidebar class="sidebar">

    <!-- Brand -->
    <div class="brand">
      <slot name="brand" />
    </div>

    <!-- Menu -->
    <div class="sidebar-scroll">
      <VaAccordion>
        <template v-for="item in MENU" :key="item.to || item.title">

          <!-- ── Group (has children) ──────────────────────── -->
          <VaCollapse
            v-if="item.children"
            :model-value="isGroupOpen(item.title)"
            body-color="transparent"
          >
            <template #header>
              <VaSidebarItem
                class="menu-item"
                :active="isGroupActive(item)"
                @click="toggleGroup(item.title)"
              >
                <VaSidebarItemContent class="item-content">
                  <VaIcon :name="item.icon" class="item-icon" />
                  <VaSidebarItemTitle class="item-title">{{ item.title }}</VaSidebarItemTitle>
                  <VaSpacer />
                  <VaIcon
                    :name="isGroupOpen(item.title) ? 'expand_less' : 'expand_more'"
                    size="small"
                    class="item-caret"
                  />
                </VaSidebarItemContent>
              </VaSidebarItem>
            </template>

            <template #body>
              <div class="submenu">
                <VaSidebarItem
                  v-for="child in item.children"
                  :key="child.to"
                  class="submenu-item"
                  :active="isActive(child.to)"
                  @click="go(child.to)"
                >
                  <VaSidebarItemContent class="item-content submenu-content">
                    <VaIcon :name="child.icon" size="18px" class="item-icon submenu-icon" />
                    <VaSidebarItemTitle class="item-title submenu-title">{{ child.title }}</VaSidebarItemTitle>
                    <VaSpacer />
                    <span v-if="child.pin" class="pin-badge">PIN</span>
                  </VaSidebarItemContent>
                </VaSidebarItem>
              </div>
            </template>
          </VaCollapse>

          <!-- ── Single item (no children) ─────────────────── -->
          <VaSidebarItem
            v-else
            class="menu-item"
            :active="isActive(item.to)"
            @click="go(item.to)"
          >
            <VaSidebarItemContent class="item-content">
              <VaIcon :name="item.icon" class="item-icon" />
              <VaSidebarItemTitle class="item-title">{{ item.title }}</VaSidebarItemTitle>
            </VaSidebarItemContent>
          </VaSidebarItem>

        </template>
      </VaAccordion>
    </div>

  </VaSidebar>
</template>

<style scoped>
/* ─── 1. Sidebar Shell ──────────────────────────────────────── */
.sidebar {
  top: 0;
  height: 100vh;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
}

/* Kill Vuestic's internal scrollbars */
:deep(.va-sidebar__menu),
:deep(.va-collapse__body),
:deep(.va-sidebar__container) {
  overflow: hidden !important;
}

/* ─── 2. Scrollable Body ────────────────────────────────────── */
.sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 1rem 2rem;
  scrollbar-width: none;
}
.sidebar-scroll::-webkit-scrollbar { display: none; }

/* ─── 3. Brand Slot ─────────────────────────────────────────── */
.brand {
  padding: 1.75rem 1.25rem 1rem;
}

/* ─── 4. Shared Item Layout ─────────────────────────────────── */
.item-content {
  padding: 0.7rem 0.85rem !important;
  display: flex;
  align-items: center;
}

.item-icon  { color: #94a3b8; font-size: 1.25rem; flex-shrink: 0; }
.item-title { font-size: 0.875rem; font-weight: 600; color: #475569; }
.item-caret { color: #cbd5e1; flex-shrink: 0; }

/* ─── 5. Top-Level Items ────────────────────────────────────── */
.menu-item {
  margin-bottom: 4px;
  border-radius: 12px !important;
  background: transparent !important;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.menu-item:hover {
  background: transparent !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Active parent group → solid blue */
.menu-item[active="true"] {
  background: #2563eb !important;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
}
.menu-item[active="true"] .item-title,
.menu-item[active="true"] .item-icon,
.menu-item[active="true"] .item-caret {
  color: #fff !important;
}

/* ─── 6. Submenu Tree ───────────────────────────────────────── */
.submenu {
  margin-left: 1.5rem;
  padding-left: 0.5rem;
  border-left: 1.5px solid #e2e8f0;
  margin-bottom: 8px;
}

.submenu-item {
  margin-bottom: 3px;
  border-radius: 10px !important;
  background: transparent !important;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.submenu-item:hover {
  background: transparent !important;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.07);
}

.submenu-content { padding: 0.6rem 0.75rem !important; }
.submenu-icon    { color: #94a3b8; }
.submenu-title   { font-size: 0.85rem; color: #64748b; font-weight: 500; }

/* Active child → solid blue */
.submenu-item[active="true"] {
  background: #2563eb !important;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}
.submenu-item[active="true"] .submenu-title,
.submenu-item[active="true"] .submenu-icon {
  color: #fff !important;
}

/* ─── 7. PIN Badge ──────────────────────────────────────────── */
.pin-badge {
  background: #fef3c7;
  color: #d97706;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}
</style>