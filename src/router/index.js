import { createRouter, createWebHistory } from "vue-router"

/* ─── Layouts ───────────────────────────────────────────────── */
import AuthLayout      from "@/layouts/AuthLayout.vue"
import DashboardLayout from "@/layouts/DashboardLayout.vue"
import PosLayout       from "@/layouts/PosLayout.vue"

/* ─── Auth ──────────────────────────────────────────────────── */
import Login         from "@/pages/auth/Login.vue"
import Forgot        from "@/pages/auth/Forgot.vue"
import ResetPassword from "@/pages/auth/ResetPassword.vue"
import OTP           from "@/pages/auth/OTP.vue"

/* ─── Frontdesk ─────────────────────────────────────────────── */
import RoomStatus          from "@/pages/admin/frontdesk/RoomStatus.vue"
import QueckBook           from "@/pages/admin/frontdesk/QueckBook.vue"
import FrontdeskCheckin    from "@/pages/admin/frontdesk/frontdeskCheckin.vue"
import FrontdeskCheckout   from "@/pages/admin/frontdesk/FrontdeskCheckout.vue"
import FrontdeskInHouse    from "@/pages/admin/frontdesk/FrontdeskInHouse.vue"

/* ─── Rooms ─────────────────────────────────────────────────── */
import RoomView              from "@/pages/admin/rooms/RoomView.vue"
import RoomFormView          from "@/pages/admin/rooms/RoomFormView.vue"
import RoomTypes             from "@/pages/admin/rooms/RoomTypes.vue"
import RoomCreateType        from "@/pages/admin/rooms/RoomCreateType.vue"
import RoomFeatures          from "@/pages/admin/rooms/RoomFeatures.vue"
import RoomRate              from "@/pages/admin/rooms/RoomRate.vue"
import RoomImage             from "@/pages/admin/rooms/RoomImage.vue"
import RoomKeys              from "@/pages/admin/rooms/RoomKeys.vue"
import RoomKeyCreate         from "@/pages/admin/rooms/RoomKeyCreate.vue"
import RoomMaintenance       from "@/pages/admin/rooms/RoomMaintenance.vue"
import RoomMaintenanceForm   from "@/pages/admin/rooms/RoomMaintenanceForm.vue"

/* ─── Guests ────────────────────────────────────────────────── */
import GuestList            from "@/pages/admin/guests/GuestList.vue"
import GuestForm            from "@/pages/admin/guests/GuestForm.vue"
import GuestDocumentForm    from "@/pages/admin/guests/GuestDocumentForm.vue"
import GuestDocumentsList   from "@/pages/admin/guests/GuestDocumentsList.vue"
import GuestVip             from "@/pages/admin/guests/GuestVip.vue"
import InHouse              from "@/pages/admin/guests/InHouse.vue"
import GuestHistory         from "@/pages/admin/guests/GuestHistory.vue"
import GuestPreference      from "@/pages/admin/guests/GuestPreference.vue"

/* ─── Housekeeping ──────────────────────────────────────────── */
import Housekeeping_Task         from "@/pages/admin/housekeeping/Housekeeping_Task.vue"
import Housekeeping_Today        from "@/pages/admin/housekeeping/Housekeeping_Today.vue"
import CreateHouse_Task          from "@/pages/admin/housekeeping/CreateHouse_Task.vue"
import Housekeeping_Calender     from "@/pages/admin/housekeeping/Housekeeping_Calender.vue"
import Housekeeping_Checklist    from "@/pages/admin/housekeeping/housekeeping_Checklist.vue"
import Housekeeping_Performance  from "@/pages/admin/housekeeping/Housekeeping_Performance.vue"
import Housekeeping_StaffTasks   from "@/pages/admin/housekeeping/Housekeeping_StaffTasks.vue"

/* ─── Reservations ──────────────────────────────────────────── */
import AllBooking                from "@/pages/admin/reservation/AllBooking.vue"
import Calender                  from "@/pages/admin/reservation/Calender.vue"
import Checkin_Checkout          from "@/pages/admin/reservation/Checkin_Checkout.vue"
import Availability              from "@/pages/admin/reservation/Availability.vue"
import Cancellations             from "@/pages/admin/reservation/Cancellations.vue"
import ReservationCreate         from "@/pages/admin/reservation/ReservationCreate.vue"
import ReservationsNoShowsData   from "@/pages/admin/reservation/ReservationsNoShowsData.vue"

/* ─── Billing ───────────────────────────────────────────────── */
import DailySale        from "@/pages/admin/billding/DailySale.vue"
import Invoices         from "@/pages/admin/billding/Invoices.vue"
import InvoiceFormView  from "@/pages/admin/billding/InvoiceFormView.vue"
import Deposits         from "@/pages/admin/billding/Deposits.vue"
import DepositsShow     from "@/pages/admin/billding/DepositsShow.vue"
import Transactions     from "@/pages/admin/billding/Transactions.vue"
import PaymentForm      from "@/pages/admin/billding/PaymentForm.vue"
import PaymentList      from "@/pages/admin/billding/PaymentList.vue"

/* ─── Reports ───────────────────────────────────────────────── */
import Occupancy  from "@/pages/admin/reports/Occupancy.vue"
import Revenue    from "@/pages/admin/reports/Revenue.vue"
import RoomSale   from "@/pages/admin/reports/RoomSale.vue"
import Guests     from "@/pages/admin/reports/Guests.vue"

/* ─── Settings ──────────────────────────────────────────────── */
import User             from "@/pages/admin/setting/User.vue"
import CreateUser       from "@/pages/admin/setting/CreateUser.vue"
import Role             from "@/pages/admin/setting/Role.vue"
import CreateRole       from "@/pages/admin/setting/CreateRole.vue"
import Permission       from "@/pages/admin/setting/Permission.vue"
import CreatePermission from "@/pages/admin/setting/CreatePermission.vue"
import PaymentMethod    from "@/pages/admin/setting/PaymentMethod.vue"
import General          from "@/pages/admin/setting/General.vue"

/* ─── POS ───────────────────────────────────────────────────── */
import Index            from "@/pages/pos/Index.vue"
import CustomerView     from "@/pages/pos/CustomerView.vue"
import PosHistory       from "@/pages/pos/PosHistory.vue"
import PosHistoryView   from "@/pages/pos/PosHistoryView.vue"
import PosClosingData   from "@/pages/pos/PosClosingData.vue"

/* ─── Other ─────────────────────────────────────────────────── */
import Analysis     from "@/pages/admin/Analysis.vue"
import NotFoundView from "@/pages/NotFoundView.vue"

/* ─── Routes ────────────────────────────────────────────────── */
const routes = [

  // ── Auth ─────────────────────────────────────────────────────
  {
    path: "/",
    component: AuthLayout,
    children: [
      { path: "",       name: "login", component: Login },
      { path: "forgot", name: "forgot", component: Forgot },
      { path: "otp",    name: "otp",    component: OTP },
      { path: "reset",  name: "reset",  component: ResetPassword },
    ],
  },

  // ── Dashboard ────────────────────────────────────────────────
  {
    path: "/admin",
    component: DashboardLayout,
    children: [

      // Dashboard
      { path: "dashboard", name: "dashboard", component: Analysis },

      // ── Frontdesk ──────────────────────────────────────────
      { path: "frontdesk/rooms-status", name: "admin.frontdesk.rooms-status", component: RoomStatus },
      { path: "frontdesk/quick-book",   name: "admin.frontdesk.quick-book",   component: QueckBook },
      { path: "frontdesk/checkin",      name: "admin.frontdesk.checkin",      component: FrontdeskCheckin },
      { path: "frontdesk/checkout",     name: "admin.frontdesk.checkout",     component: FrontdeskCheckout },
      { path: "frontdesk/in-house",     name: "admin.frontdesk.in-house",     component: FrontdeskInHouse },

      // ── Rooms ──────────────────────────────────────────────
      { path: "rooms",               name: "admin.rooms",              component: RoomView },
      { path: "rooms/create",        name: "admin.rooms.create",       component: RoomFormView },
      { path: "rooms/types",         name: "admin.rooms.type",         component: RoomTypes },
      { path: "rooms/types/create",  name: "admin.rooms.create.type",  component: RoomCreateType },
      { path: "rooms/features",      name: "admin.rooms.features",     component: RoomFeatures },
      { path: "rooms/rates",         name: "admin.rooms.rates",        component: RoomRate },
      { path: "rooms/images",        name: "admin.rooms.images",       component: RoomImage },

      // Room Keys
      { path: "rooms/keys",              name: "admin.rooms.keys",        component: RoomKeys },
      { path: "rooms/keys/create",       name: "admin.rooms.keys.create", component: RoomKeyCreate },
      { path: "rooms/keys/edit/:key_id", name: "admin.rooms.keys.edit",   component: RoomKeyCreate, props: true },

      // Maintenance
      { path: "rooms/maintenance",        name: "admin.rooms.maintenance",      component: RoomMaintenance },
      { path: "rooms/maintenance/create", name: "admin.rooms.maintenance.form", component: RoomMaintenanceForm },

      // ── Guests ─────────────────────────────────────────────
      { path: "guests",              name: "admin.guests",        component: GuestList },
      { path: "guests/create",       name: "admin.guests.create", component: GuestForm },
      { path: "guests/:id/edit",     name: "admin.guests.edit",   component: GuestForm, props: true },
      { path: "guests/vip",          name: "admin.guests.vip",    component: GuestVip },
      { path: "guests/in-house",     name: "admin.guests.in-house",    component: InHouse },
      { path: "guests/history",      name: "admin.guests.history",     component: GuestHistory },
      { path: "guests/preferences",  name: "admin.guests.preferences", component: GuestPreference },

      // Guest Documents
      { path: "guests/documents",                                  name: "guest-documents-list",   component: GuestDocumentsList },
      { path: "guests/:guestId/documents/create",                  name: "guest-documents-create", component: GuestDocumentForm,  props: true },
      { path: "guests/:guestId/documents/:documentId/edit",        name: "guest-documents-edit",   component: GuestDocumentForm,  props: true },

      // ── Housekeeping ───────────────────────────────────────
      { path: "housekeeping",                        name: "admin.housekeeping",              component: Housekeeping_Task },
      { path: "housekeeping/today",                  name: "admin.housekeeping.today",        component: Housekeeping_Today },
      { path: "housekeeping/create",                 name: "admin.housekeeping.create",       component: CreateHouse_Task },
      { path: "housekeeping/calendar",               name: "admin.housekeeping.calender",     component: Housekeeping_Calender },
      { path: "housekeeping/checklist",              name: "admin.housekeeping.checklist",    component: Housekeeping_Checklist },
      { path: "housekeeping/performance",            name: "admin.housekeeping.performance",  component: Housekeeping_Performance },
      { path: "housekeeping/staff/:staffId/tasks",   name: "admin.housekeeping.staff.tasks",  component: Housekeeping_StaffTasks, props: true },

      // ── Reservations ───────────────────────────────────────
      { path: "reservations",               name: "admin.booking",          component: AllBooking },
      { path: "reservations/create",        name: "admin.booking.create",   component: ReservationCreate },
      { path: "reservations/calendar",      name: "admin.calendar",         component: Calender },
      { path: "reservations/checkin",       name: "admin.checkin",          component: Checkin_Checkout },
      { path: "reservations/availability",  name: "admin.availability",     component: Availability },
      { path: "reservations/cancellations", name: "admin.cancellations",    component: Cancellations },
      { path: "reservations/no-shows",      name: "admin.no-shows",         component: ReservationsNoShowsData },

      // ── Billing ────────────────────────────────────────────
      { path: "pos/transactions",  name: "admin.transactions",  component: Transactions },
      { path: "pos/daily-sales",   name: "admin.daily-sales",   component: DailySale },

      { path: "billing/invoices",                  name: "admin.invoices",          component: Invoices },
      { path: "billing/invoices/create",           name: "billing-invoices-create", component: InvoiceFormView },
      { path: "billing/invoices/:invoiceId/edit",  name: "billing-invoices-edit",   component: InvoiceFormView, props: true },

      { path: "billing/payments",        name: "billing-payments",        component: PaymentList },
      { path: "billing/payments/create", name: "billing-payments-create", component: PaymentForm },

      { path: "billing/deposits",              name: "admin.deposits",          component: Deposits },
      { path: "billing/deposits/:bookingId",   name: "billing-deposits-show",   component: DepositsShow, props: true },

      // ── Reports ────────────────────────────────────────────
      { path: "reports/occupancy",   name: "admin.reports.occupancy",  component: Occupancy },
      { path: "reports/revenue",     name: "admin.reports.revenue",    component: Revenue },
      { path: "reports/room-sales",  name: "admin.reports.room_sale",  component: RoomSale },
      { path: "reports/guests",      name: "admin.reports.guest",      component: Guests },

      // ── Settings ───────────────────────────────────────────
      { path: "settings/users",                          name: "admin.setting.users",               component: User },
      { path: "settings/create",                         name: "admin.setting.create",              component: CreateUser },
      { path: "settings/roles",                          name: "admin.setting.role",                component: Role },
      { path: "settings/create/role",                    name: "admin.setting.create.role",         component: CreateRole },
      { path: "settings/permissions",                    name: "admin.setting.permission",          component: Permission },
      { path: "settings/permissions/create",             name: "admin.setting.permission.create",   component: CreatePermission },
      { path: "settings/permissions/:permissionId/edit", name: "admin.settings.permissions.edit",   component: CreatePermission, props: true },
      { path: "settings/payment-methods",                name: "admin.settings.payment-methods",    component: PaymentMethod },
      { path: "settings/general",                        name: "admin.settings.general",            component: General },

      // ── POS (within admin layout) ──────────────────────────
      { path: "pos/history",      name: "admin.pos.history",       component: PosHistory },
      { path: "pos/history/:id",  name: "admin.pos.history.views", component: PosHistoryView, props: true },
      { path: "pos/closing",      name: "admin.pos.closing",       component: PosClosingData },
    ],
  },

  // ── POS Layout ─────────────────────────────────────────────
  {
    path: "/admin/pos",
    name: "admin.pos",
    component: PosLayout,
    children: [
      { path: "",         name: "admin.pos.index",    component: Index },
      { path: "customer", name: "admin.pos.customer", component: CustomerView },
    ],
  },

  // ── 404 ────────────────────────────────────────────────────//
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundView,
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