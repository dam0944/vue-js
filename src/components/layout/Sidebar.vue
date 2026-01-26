<script setup>
import { ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const menu = [
  { title: "Dashboard", icon: "dashboard", to: "/admin/dashboard" },

  // MAIN WORKFLOW

  {
    title: "POS / Cashier",
    icon: "point_of_sale",
    children: [
      { title: "Room POS", icon: "shopping_cart", to: "/admin/pos" },
      { title: "POS History", icon: "receipt_long", to: "/admin/pos/history" },
      { title: "Daily Closing", icon: "fact_check", to: "/admin/pos/closing" },
    ],
  },

  {
    title: "Front Desk",
    icon: "support_agent",
    children: [
      { title: "Room Status Board", icon: "grid_view", to: "/admin/frontdesk/rooms-status", star: true },

      { title: "Quick Book (Walk-in)", icon: "person_add_alt_1", to: "/admin/frontdesk/quick-book" },

      { title: "Check-in", icon: "how_to_reg", to: "/admin/frontdesk/checkin" },
      { title: "Check-out", icon: "logout", to: "/admin/frontdesk/checkout" },

      { title: "In-House Guests", icon: "badge", to: "/admin/frontdesk/in-house" },
    ],
  },


  // RESERVATIONS (future bookings)
  {
    title: "Reservations",
    icon: "event",
    children: [
      { title: "All Bookings", icon: "list_alt", to: "/admin/reservations" },
      { title: "New Booking", icon: "add_box", to: "/admin/reservations/create" },
      { title: "Calendar", icon: "calendar_month", to: "/admin/reservations/calendar" },
      { title: "Cancellations", icon: "cancel", to: "/admin/reservations/cancellations" },
      { title: "No-Shows", icon: "person_off", to: "/admin/reservations/no-shows" },
    ],
  },

  // ROOMS
  {
    title: "Rooms",
    icon: "meeting_room",
    children: [
      { title: "All Rooms", icon: "bed", to: "/admin/rooms" },
      { title: "Room Types", icon: "category", to: "/admin/rooms/types" },
      { title: "Room Images", icon: "image", to: "/admin/rooms/images" },
      { title: "Room Keys", icon: "vpn_key", to: "/admin/rooms/keys" },
      { title: "Maintenance", icon: "build", to: "/admin/rooms/maintenance" },
    ],
  },

  // GUESTS
  {
    title: "Guests",
    icon: "person",
    children: [
      { title: "All Guests", icon: "groups", to: "/admin/guests" },
      { title: "Add New Guest", icon: "person_add", to: "/admin/guests/create" },
      { title: "Guest Documents", icon: "folder", to: "/admin/guests/documents" },
      { title: "VIP Guests", icon: "star", to: "/admin/guests/vip" },
    ],
  },

  // BILLING (accountant back office)
  {
    title: "Billing",
    icon: "request_quote",
    children: [
      { title: "Invoices", icon: "receipt", to: "/admin/billing/invoices" },
      { title: "Payments", icon: "payments", to: "/admin/billing/payments" },
      { title: "Deposits", icon: "account_balance_wallet", to: "/admin/billing/deposits" },
      { title: "Extra Charges", icon: "add_circle", to: "/admin/billing/extra-charges" },
      { title: "Refunds", icon: "currency_exchange", to: "/admin/billing/refunds" },
    ],
  },

  // HOUSEKEEPING
  {
    title: "Housekeeping",
    icon: "cleaning_services",
    children: [
      { title: "Today's Tasks", icon: "task_alt", to: "/admin/housekeeping/today" },
      { title: "All Tasks", icon: "list", to: "/admin/housekeeping/tasks" },
      { title: "Assign Task", icon: "assignment_ind", to: "/admin/housekeeping/assign" },
    ],
  },

  // REPORTS
  {
    title: "Reports",
    icon: "bar_chart",
    children: [
      { title: "Daily Report", icon: "today", to: "/admin/reports/daily" },
      { title: "Monthly Report", icon: "date_range", to: "/admin/reports/monthly" },
      { title: "Occupancy Report", icon: "pie_chart", to: "/admin/reports/occupancy" },
      { title: "Revenue Report", icon: "attach_money", to: "/admin/reports/revenue" },
      { title: "Payment Methods", icon: "payment", to: "/admin/reports/payment-methods" },
    ],
  },

  // SETTINGS
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
];


const isExactActive = (target) => route.path === target
const isSectionActive = (base) => route.path.startsWith(base)
const isGroupActive = (item) => item.children?.some((c) => isSectionActive(c.to))

const getActiveGroupTitle = () => {
  const group = menu.find((m) => m.children?.some((c) => isSectionActive(c.to)))
  return group?.title || ""
}

const openGroup = ref(getActiveGroupTitle())

watch(() => route.path, () => {
  openGroup.value = getActiveGroupTitle()
})

const toggleGroup = (title) => {
  openGroup.value = openGroup.value === title ? "" : title
}

const go = async (target) => {
  if (route.path === target) return
  router.push(target)
}
</script>

<template>
  <VaSidebar class="sidebar">
    <div class="brand-section">
    
    </div>

    <div class="sidebar-scroll">
      <VaAccordion>
        <template v-for="item in menu" :key="item.to || item.title">
          <VaCollapse
            v-if="item.children"
            :model-value="openGroup === item.title"
            body-color="transparent"
          >
            <template #header>
              <VaSidebarItem
                class="menu-item"
                :active="isGroupActive(item)"
                @click="toggleGroup(item.title)"
              >
                <VaSidebarItemContent class="menu-content">
                  <VaIcon :name="item.icon" class="menu-icon" />
                  <VaSidebarItemTitle class="menu-title">{{ item.title }}</VaSidebarItemTitle>
                  <VaSpacer />
                  <VaIcon 
                    :name="openGroup === item.title ? 'expand_less' : 'expand_more'" 
                    size="small" 
                    class="menu-caret" 
                  />
                </VaSidebarItemContent>
              </VaSidebarItem>
            </template>

            <template #body>
              <div class="submenu-container">
                <VaSidebarItem
                  v-for="c in item.children"
                  :key="c.to"
                  class="submenu-item"
                  :active="isExactActive(c.to)"
                  @click="go(c.to)"
                >
                  <VaSidebarItemContent class="submenu-content">
                    <VaIcon :name="c.icon" size="18px" class="submenu-icon" />
                    <VaSidebarItemTitle class="submenu-title">{{ c.title }}</VaSidebarItemTitle>
                    <VaSpacer />
                    <span v-if="c.star" class="star-badge">PIN</span>
                  </VaSidebarItemContent>
                </VaSidebarItem>
              </div>
            </template>
          </VaCollapse>

          <VaSidebarItem
            v-else
            class="menu-item"
            :active="isExactActive(item.to)"
            @click="go(item.to)"
          >
            <VaSidebarItemContent class="menu-content">
              <VaIcon :name="item.icon" class="menu-icon" />
              <VaSidebarItemTitle class="menu-title">{{ item.title }}</VaSidebarItemTitle>
            </VaSidebarItemContent>
          </VaSidebarItem>
        </template>
      </VaAccordion>
    </div>
  </VaSidebar>
</template>

<style scoped>
/* ===== 1. Sidebar Foundation & Scrollbar Removal ===== */
.sidebar {
  top: 0;
  height: 100vh;
  background: #f8fafc; /* Slightly off-white for better depth */
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
}

/* Deep selection to kill Vuestic's internal scrollbars */
:deep(.va-sidebar__menu),
:deep(.va-collapse__body),
:deep(.va-sidebar__container) {
  overflow: hidden !important;
}

.sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 1rem 2rem 1rem;
  scrollbar-width: none; /* Firefox */
}

.sidebar-scroll::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* ===== 2. Brand Section ===== */
.brand-section {
  padding: 2rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-box {
  background: #2563eb;
  color: white;
  font-weight: 800;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 0.7rem;
}

.brand-name {
  font-weight: 700;
  color: #0f172a;
  font-size: 1.2rem;
}

/* ===== 3. Interaction Styles (No Hover Background) ===== */
.menu-item, .submenu-item {
  margin-bottom: 6px;
  border-radius: 12px !important;
  transition: all 0.2s ease;
  background: transparent !important; /* Force transparent background */
}

/* Remove hover background and add shadow instead */
.menu-item:hover, .submenu-item:hover {
  background: transparent !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.menu-content, .submenu-content {
  padding: 0.75rem 0.85rem !important;
}

.menu-title { font-weight: 600; color: #475569; }
.menu-icon { color: #94a3b8; font-size: 1.3rem; }

/* ===== 4. Active States (High Contrast) ===== */

/* Parent Active */
.menu-item[active="true"] {
  background: #2563eb !important; /* Solid blue background */
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
}

.menu-item[active="true"] .menu-title,
.menu-item[active="true"] .menu-icon,
.menu-item[active="true"] .menu-caret {
  color: #ffffff !important; /* White text on blue */
}

/* Submenu Active Child */
.submenu-item[active="true"] {
  background: #2563eb !important;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}

.submenu-item[active="true"] .submenu-title,
.submenu-item[active="true"] .submenu-icon {
  color: #ffffff !important;
}

/* ===== 5. Tree Styling ===== */
.submenu-container {
  margin-left: 1.5rem;
  padding-left: 0.5rem;
  border-left: 1.5px solid #e2e8f0;
  margin-bottom: 12px;
}

.submenu-title { font-size: 0.9rem; color: #64748b; font-weight: 500; }
.submenu-icon { color: #94a3b8; }

.star-badge {
  background: #fef3c7;
  color: #d97706;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.menu-caret { color: #cbd5e1; }
</style>