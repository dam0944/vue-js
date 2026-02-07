import { createRouter, createWebHistory } from "vue-router"

/* ─── Layouts (keep these eager loaded) ──────────────────────── */
import AuthLayout      from "@/layouts/AuthLayout.vue"
import DashboardLayout from "@/layouts/DashboardLayout.vue"
import PosLayout       from "@/layouts/PosLayout.vue"

/* ─── Routes ────────────────────────────────────────────────── */
const routes = [

  // ── Auth ─────────────────────────────────────────────────────
  {
    path: "/",
    component: AuthLayout,
    children: [
      { path: "",       name: "login",  component: () => import("@/pages/auth/Login.vue") },
      { path: "forgot", name: "forgot", component: () => import("@/pages/auth/Forgot.vue") },
      { path: "otp",    name: "otp",    component: () => import("@/pages/auth/OTP.vue") },
      { path: "reset",  name: "reset",  component: () => import("@/pages/auth/ResetPassword.vue") },
    ],
  },

  // ── Dashboard ────────────────────────────────────────────────
  {
    path: "/admin",
    component: DashboardLayout,
    children: [

      // Dashboard
      { path: "dashboard", name: "dashboard", component: () => import("@/pages/admin/Analysis.vue") },

      // ── Frontdesk ──────────────────────────────────────────
      { path: "frontdesk/rooms-status", name: "admin.frontdesk.rooms-status", component: () => import("@/pages/admin/frontdesk/RoomStatus.vue") },
      { path: "frontdesk/quick-book",   name: "admin.frontdesk.quick-book",   component: () => import("@/pages/admin/frontdesk/QueckBook.vue") },
      { path: "frontdesk/checkin",      name: "admin.frontdesk.checkin",      component: () => import("@/pages/admin/frontdesk/FrontdeskCheckin.vue") },
      { path: "frontdesk/checkout",     name: "admin.frontdesk.checkout",     component: () => import("@/pages/admin/frontdesk/FrontdeskCheckout.vue") },
      { path: "frontdesk/in-house",     name: "admin.frontdesk.in-house",     component: () => import("@/pages/admin/frontdesk/FrontdeskInHouse.vue") },

      // ── Rooms ──────────────────────────────────────────────
      { path: "rooms",               name: "admin.rooms",              component: () => import("@/pages/admin/rooms/RoomView.vue") },
      { path: "rooms/create",        name: "admin.rooms.create",       component: () => import("@/pages/admin/rooms/RoomFormView.vue") },
      { path: "rooms/types",         name: "admin.rooms.type",         component: () => import("@/pages/admin/rooms/RoomTypes.vue") },
      { path: "rooms/types/create",  name: "admin.rooms.create.type",  component: () => import("@/pages/admin/rooms/RoomCreateType.vue") },
      { path: "rooms/features",      name: "admin.rooms.features",     component: () => import("@/pages/admin/rooms/RoomFeatures.vue") },
      { path: "rooms/rates",         name: "admin.rooms.rates",        component: () => import("@/pages/admin/rooms/RoomRate.vue") },
      { path: "rooms/images",        name: "admin.rooms.images",       component: () => import("@/pages/admin/rooms/RoomImage.vue") },

      // Room Keys
      { path: "rooms/keys",              name: "admin.rooms.keys",        component: () => import("@/pages/admin/rooms/RoomKeys.vue") },
      { path: "rooms/keys/create",       name: "admin.rooms.keys.create", component: () => import("@/pages/admin/rooms/RoomKeyCreate.vue") },
      { path: "rooms/keys/edit/:key_id", name: "admin.rooms.keys.edit",   component: () => import("@/pages/admin/rooms/RoomKeyCreate.vue"), props: true },

      // Maintenance
      { path: "rooms/maintenance",        name: "admin.rooms.maintenance",      component: () => import("@/pages/admin/rooms/RoomMaintenance.vue") },
      { path: "rooms/maintenance/create", name: "admin.rooms.maintenance.form", component: () => import("@/pages/admin/rooms/RoomMaintenanceForm.vue") },

      // ── Guests ─────────────────────────────────────────────
      { path: "guests",              name: "admin.guests",        component: () => import("@/pages/admin/guests/GuestList.vue") },
      { path: "guests/create",       name: "admin.guests.create", component: () => import("@/pages/admin/guests/GuestForm.vue") },
      { path: "guests/:id/edit",     name: "admin.guests.edit",   component: () => import("@/pages/admin/guests/GuestForm.vue"), props: true },
      { path: "guests/vip",          name: "admin.guests.vip",    component: () => import("@/pages/admin/guests/GuestVip.vue") },
      { path: "guests/in-house",     name: "admin.guests.in-house",    component: () => import("@/pages/admin/guests/InHouse.vue") },
      { path: "guests/history",      name: "admin.guests.history",     component: () => import("@/pages/admin/guests/GuestHistory.vue") },
      { path: "guests/preferences",  name: "admin.guests.preferences", component: () => import("@/pages/admin/guests/GuestPreference.vue") },

      // Guest Documents
      { path: "guests/documents",                                  name: "guest-documents-list",   component: () => import("@/pages/admin/guests/GuestDocumentsList.vue") },
      { path: "guests/:guestId/documents/create",                  name: "guest-documents-create", component: () => import("@/pages/admin/guests/GuestDocumentForm.vue"),  props: true },
      { path: "guests/:guestId/documents/:documentId/edit",        name: "guest-documents-edit",   component: () => import("@/pages/admin/guests/GuestDocumentForm.vue"),  props: true },

      // ── Housekeeping ───────────────────────────────────────
      { path: "housekeeping/today",                  name: "housekeeping-today",              component: () => import("@/pages/admin/housekeeping/Housekeeping_Today.vue") },
      { path: "housekeeping/create",                 name: "housekeeping-create",             component: () => import("@/pages/admin/housekeeping/HousekeepingForm.vue") },
      { path: "housekeeping/:taskId/edit",           name: "housekeeping-edit",               component: () => import("@/pages/admin/housekeeping/HousekeepingForm.vue") },

      { path: "housekeeping/tasks",                  name: "admin.housekeeping.tasks",        component: () => import("@/pages/admin/housekeeping/Housekeeping_Task.vue") },
      { path: "housekeeping/create",                 name: "admin.housekeeping.create",       component: () => import("@/pages/admin/housekeeping/CreateHouse_Task.vue") },
      { path: "housekeeping/calendar",               name: "admin.housekeeping.calender",     component: () => import("@/pages/admin/housekeeping/Housekeeping_Calender.vue") },
      { path: "housekeeping/checklist",              name: "admin.housekeeping.checklist",    component: () => import("@/pages/admin/housekeeping/housekeeping_Checklist.vue") },
      { path: "housekeeping/performance",            name: "admin.housekeeping.performance",  component: () => import("@/pages/admin/housekeeping/Housekeeping_Performance.vue") },
      { path: "housekeeping/staff/:staffId/tasks",   name: "admin.housekeeping.staff.tasks",  component: () => import("@/pages/admin/housekeeping/Housekeeping_StaffTasks.vue"), props: true },

      { path: "housekeeping/assign",        name: "housekeeping-assign",    component: () => import("@/pages/admin/housekeeping/HousekeepingAssign.vue") },

      // ── Reservations ───────────────────────────────────────
      { path: "reservations",               name: "admin.booking",          component: () => import("@/pages/admin/reservation/AllBooking.vue") },
      { path: "reservations/create",        name: "admin.booking.create",   component: () => import("@/pages/admin/reservation/ReservationCreate.vue") },
      { path: "reservations/calendar",      name: "admin.calendar",         component: () => import("@/pages/admin/reservation/Calender.vue") },
      { path: "reservations/checkin",       name: "admin.checkin",          component: () => import("@/pages/admin/reservation/Checkin_Checkout.vue") },
      { path: "reservations/availability",  name: "admin.availability",     component: () => import("@/pages/admin/reservation/Availability.vue") },
      { path: "reservations/cancellations", name: "admin.cancellations",    component: () => import("@/pages/admin/reservation/Cancellations.vue") },
      { path: "reservations/no-shows",      name: "admin.no-shows",         component: () => import("@/pages/admin/reservation/ReservationsNoShowsData.vue") },

      // ── Billing ────────────────────────────────────────────
      { path: "pos/transactions",  name: "admin.transactions",  component: () => import("@/pages/admin/billding/Transactions.vue") },
      { path: "pos/daily-sales",   name: "admin.daily-sales",   component: () => import("@/pages/admin/billding/DailySale.vue") },

      { path: "billing/invoices",                  name: "admin.invoices",          component: () => import("@/pages/admin/billding/Invoices.vue") },
      { path: "billing/invoices/create",           name: "billing-invoices-create", component: () => import("@/pages/admin/billding/InvoiceFormView.vue") },
      { path: "billing/invoices/:invoiceId/edit",  name: "billing-invoices-edit",   component: () => import("@/pages/admin/billding/InvoiceFormView.vue"), props: true },

      { path: "billing/payments",        name: "billing-payments",        component: () => import("@/pages/admin/billding/PaymentList.vue") },
      { path: "billing/payments/create", name: "billing-payments-create", component: () => import("@/pages/admin/billding/PaymentForm.vue") },

      { path: "billing/deposits",              name: "admin.deposits",          component: () => import("@/pages/admin/billding/Deposits.vue") },
      { path: "billing/deposits/:bookingId",   name: "billing-deposits-show",   component: () => import("@/pages/admin/billding/DepositsShow.vue"), props: true },

      { path: "billing/extra-charges",                name: "admin.extra-charges",                 component: () => import("@/pages/admin/billding/ExtraChargesList.vue") },
      { path: "billing/extra-charges/create",         name: "admin.billing-extra-charges-create",  component: () => import("@/pages/admin/billding/ExtraChargeForm.vue") },
      { path: "billing/extra-charges/:chargeId/edit", name: "admin.billing-extra-charges-edit",    component: () => import("@/pages/admin/billding/ExtraChargeForm.vue"), props: true },

      { path: "billing/refunds",                 name: "billing-refunds",         component: () => import("@/pages/admin/billding/RefundsList.vue") },
      { path: "billing/refunds/create",          name: "billing-refunds-create",  component: () => import("@/pages/admin/billding/RefundForm.vue") },
      { path: "billing/refunds/:refundId/edit",  name: "billing-refunds-edit",    component: () => import("@/pages/admin/billding/RefundForm.vue"), props: true },

      // ── Reports ────────────────────────────────────────────
      { path: "reports/daily",            name: "reports.dailys",                 component: () => import("@/pages/admin/reports/ReportDaily.vue") },
      { path: "reports/monthly",          name: "reports.monthlys",               component: () => import("@/pages/admin/reports/ReportsMonthly.vue") },
      { path: "reports/occupancy",        name: "admin.reports.occupancy",        component: () => import("@/pages/admin/reports/Occupancy.vue") },    
      { path: "reports/revenue",          name: "admin.reports.revenue",          component: () => import("@/pages/admin/reports/Revenue.vue") },
      { path: "reports/payment-methods",  name: "admin.reports.payment-methods",  component: () => import("@/pages/admin/reports/ReportsPaymentMethods.vue") },
      { path: "reports/room-sales",       name: "admin.reports.room_sale",        component: () => import("@/pages/admin/reports/RoomSale.vue") },
      { path: "reports/guests",           name: "admin.reports.guest",            component: () => import("@/pages/admin/reports/Guests.vue") },

      // ── Settings ───────────────────────────────────────────
      { path: "settings/users",                          name: "admin.setting.users",               component: () => import("@/pages/admin/setting/User.vue") },
      { path: "settings/create",                         name: "admin.setting.create",              component: () => import("@/pages/admin/setting/CreateUser.vue") },
      { path: "settings/roles",                          name: "admin.setting.role",                component: () => import("@/pages/admin/setting/Role.vue") },
      { path: "settings/create/role",                    name: "admin.setting.create.role",         component: () => import("@/pages/admin/setting/CreateRole.vue") },
      { path: "settings/permissions",                    name: "admin.setting.permission",          component: () => import("@/pages/admin/setting/Permission.vue") },
      { path: "settings/permissions/create",             name: "admin.setting.permission.create",   component: () => import("@/pages/admin/setting/CreatePermission.vue") },
      { path: "settings/permissions/:permissionId/edit", name: "admin.settings.permissions.edit",   component: () => import("@/pages/admin/setting/CreatePermission.vue"), props: true },
      { path: "settings/payment-methods",                name: "admin.settings.payment-methods",    component: () => import("@/pages/admin/setting/PaymentMethod.vue") },
      { path: "settings/property",                       name: "admin.settings.property",           component: () => import("@/pages/admin/setting/SettingsProperty.vue") },
      { path: "settings/config",                         name: "admin.settings.config",             component: () => import("@/pages/admin/setting/SettingsConfig.vue") },
      { path: "settings/audit",                          name: "admin.settings.audit",              component: () => import("@/pages/admin/setting/SettingsAudit.vue") },

      // ── POS (within admin layout) ──────────────────────────
      { path: "pos/history",      name: "admin.pos.history",       component: () => import("@/pages/pos/PosHistory.vue") },
      { path: "pos/history/:id",  name: "admin.pos.history.views", component: () => import("@/pages/pos/PosHistoryView.vue"), props: true },
      { path: "pos/closing",      name: "admin.pos.closing",       component: () => import("@/pages/pos/PosClosingData.vue") },
    ],
  },

  // ── POS Layout ─────────────────────────────────────────────
  {
    path: "/admin/pos",
    name: "admin.pos",
    component: PosLayout,
    children: [
      { path: "",         name: "admin.pos.index",    component: () => import("@/pages/pos/Index.vue") },
      { path: "customer", name: "admin.pos.customer", component: () => import("@/pages/pos/CustomerView.vue") },
    ],
  },

  // ── 404 ────────────────────────────────────────────────────
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/NotFoundView.vue"),
    meta: { title: "404 - Page Not Found" },
  },
]

/* ─── Router ────────────────────────────────────────────────── */
const router = createRouter({
  history: createWebHistory(),
  routes,
})

/* ─── Global Guard: Page Title ──────────────────────────────── */
router.beforeEach((to, _from, next) => {
  document.title = to.meta?.title || "Guesthouse management system"
  next()
})

export default router