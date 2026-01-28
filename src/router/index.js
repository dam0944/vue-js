import { createRouter, createWebHistory } from "vue-router"

/* Master layouts */
import AuthLayout from "@/layouts/AuthLayout.vue"
import DashboardLayout from "@/layouts/DashboardLayout.vue"
import PosLayout from "@/layouts/PosLayout.vue"
import PosHistory from "@/pages/pos/PosHistory.vue"

/* Auth pages */
import Login from "@/pages/auth/Login.vue"
import Forgot from "@/pages/auth/Forgot.vue"
// import OTP from "@/pages/auth/OTP.vue"
import ResetPassword from "@/pages/auth/ResetPassword.vue"

/* Admin pages */
import RoomView from "@/pages/admin/rooms/RoomView.vue"
import RoomFormView from "@/pages/admin/rooms/RoomFormView.vue"
// import RoomTypes from "@/pages/admin/rooms/RoomTypes.vue"
// import RoomStatus from "@/pages/admin/rooms/RoomStatus.vue"
import AllBooking from "@/pages/admin/reservation/AllBooking.vue"
import Calender from "@/pages/admin/reservation/Calender.vue"
import Checkin_Checkout from "@/pages/admin/reservation/Checkin_Checkout.vue"
import Availability from "@/pages/admin/reservation/Availability.vue"
import Cancellations from "@/pages/admin/reservation/Cancellations.vue" 
import DailySale from "@/pages/admin/billding/DailySale.vue"
import Invoices from "@/pages/admin/billding/Invoices.vue"
import Deposits from "@/pages/admin/billding/Deposits.vue"
import Transactions from "@/pages/admin/billding/Transactions.vue"
import RoomFeatures from "@/pages/admin/rooms/RoomFeatures.vue"
import RoomRate from "@/pages/admin/rooms/RoomRate.vue"
import Guest from "@/pages/admin/guests/Guest.vue"
import Create from "@/pages/admin/guests/Create.vue"
import InHouse from "@/pages/admin/guests/InHouse.vue"
import GuestHistory from "@/pages/admin/guests/GuestHistory.vue"
import GuestPreference from "@/pages/admin/guests/GuestPreference.vue"
import Housekeeping_Task from "@/pages/admin/housekeeping/Housekeeping_Task.vue"
import Housekeeping_Today from "@/pages/admin/housekeeping/Housekeeping_Today.vue"
import CreateHouse_Task from "@/pages/admin/housekeeping/CreateHouse_Task.vue"
import Index from "@/pages/pos/Index.vue"
import Housekeeping_Calender from "@/pages/admin/housekeeping/Housekeeping_Calender.vue"
import Housekeeping_Checklist from "@/pages/admin/housekeeping/housekeeping_Checklist.vue"
import Housekeeping_Performance from "@/pages/admin/housekeeping/Housekeeping_Performance.vue"
import Housekeeping_StaffTasks from "@/pages/admin/housekeeping/Housekeeping_StaffTasks.vue"
import Occupancy from "@/pages/admin/reports/Occupancy.vue"
import Revenue from "@/pages/admin/reports/Revenue.vue"
import RoomSale from "@/pages/admin/reports/RoomSale.vue"
import Guests from "@/pages/admin/reports/Guests.vue"
import User from "@/pages/admin/setting/User.vue"
import CreateUser from "@/pages/admin/setting/CreateUser.vue"
import Role from "@/pages/admin/setting/Role.vue"
import Permission from "@/pages/admin/setting/Permission.vue"
import CreateRole from "@/pages/admin/setting/CreateRole.vue"
import CreatePermission from "@/pages/admin/setting/CreatePermission.vue"
import PaymentMethod from "@/pages/admin/setting/PaymentMethod.vue"
import General from "@/pages/admin/setting/General.vue"
import Analysis from "@/pages/admin/Analysis.vue"
import CustomerView from "@/pages/pos/CustomerView.vue"
import OTP from "@/pages/auth/OTP.vue"
import PosHistoryView from "@/pages/pos/PosHistoryView.vue"
import PosClosingData from "@/pages/pos/PosClosingData.vue"
import NotFoundView from "@/pages/NotFoundView.vue"
import RoomStatus from "@/pages/admin/frontdesk/RoomStatus.vue"
import QueckBook from "@/pages/admin/frontdesk/QueckBook.vue"
import FrontdeskCheckin from "@/pages/admin/frontdesk/frontdeskCheckin.vue"
import FrontdeskCheckout from "@/pages/admin/frontdesk/FrontdeskCheckout.vue"
import FrontdeskInHouse from "@/pages/admin/frontdesk/FrontdeskInHouse.vue"
import ReservationCreate from "@/pages/admin/reservation/ReservationCreate.vue"
import ReservationsNoShowsData from "@/pages/admin/reservation/ReservationsNoShowsData.vue"
import RoomCreateType from "@/pages/admin/rooms/RoomCreateType.vue"
import RoomTypes from "@/pages/admin/rooms/RoomTypes.vue"
import RoomImage from "@/pages/admin/rooms/RoomImage.vue"
// import RoomKeys from "@/pages/admin/rooms/RoomKeys.vue"
import RoomKeys from "@/pages/admin/rooms/RoomKeys.vue"
import RoomKeyCreate from "@/pages/admin/rooms/RoomKeyCreate.vue"
import RoomMaintenance from "@/pages/admin/rooms/RoomMaintenance.vue"
import RoomMaintenanceForm from "@/pages/admin/rooms/RoomMaintenanceForm.vue"
// import RoomStatus from "@/pages/admin/rooms/RoomStatus.vue"

const routes = [ 

  // Auth Routes
  {
    path: "/",
    component: AuthLayout,  
    children: [
      { path: "", name: "login", component: Login },
      { path: "forgot", name: "forgot", component: Forgot },
      { path: "/otp", name: "otp", component: OTP},
      { path: "reset", name: "reset", component: ResetPassword },
    ],
  },
  
  // Dashboard Routes
  {
    path: "/admin",
    component: DashboardLayout,
    children: [
      {
       path:"dashboard",
       name: '  dashboard',
       component:Analysis,
      },
      {
        path:"pos/history",  // This creates /admin/pos/history
        name: 'admin.pos.history',
        component:PosHistory,
      },
      {
        path:"pos/history/:id",
        name: 'admin.pos.history.views',
        component:PosHistoryView,
      },
      {
        path:"pos/closing",
        name: 'admin.pos.closing',
        component:PosClosingData,
      },
      {
        path:"frontdesk/rooms-status",
        name:"admin.frontdesk.rooms-status",
        component:RoomStatus,
      },
       {
        path:"frontdesk/quick-book",
        name:"admin.frontdesk.quick-book",
        component:QueckBook,
      },
      {
        path:"frontdesk/checkin",
        name:"admin.frontdesk.checkin",
        component:FrontdeskCheckin,
      },
      {
        path:"frontdesk/checkout",
        name:"admin.frontdesk.checkout",
        component:FrontdeskCheckout,
      },
      {
        path:"frontdesk/in-house",
        name:"admin.frontdesk.in-house",
        component:FrontdeskInHouse,
      },

      /* Rooms */
      {
        path: "rooms",
        name: "admin.rooms",
        component: RoomView,
      },
      {
        path: "rooms/create",
        name: "admin.rooms.create",
        component: RoomFormView,
      },
      {
        path: "rooms/status",
        name: "admin.rooms.status",
        component: RoomStatus,
      },
      {
        path: "rooms/types",
        name: "admin.rooms.type",
        component: RoomTypes,
      },
      {
        path: "/create/room/types",
        name: "admin.rooms.create.type",
        component: RoomCreateType,
      },
      {
        path: "rooms/features",
        name: "admin.rooms.features",
        component: RoomFeatures,
      },
      {
        path: "rooms/rates",
        name: "admin.rooms.rates",
        component: RoomRate,
      },

      {
        path:"rooms/images",
        name:"admin.rooms.images",
        component:RoomImage,
      },
      {
        path:"rooms/keys",
        name:"admin.rooms.keys",
        component:RoomKeys,
      },
      {
        path: "/rooms/keys/create",
        name:"admin.rooms.create",
        component:RoomKeyCreate,
      },
      { 
        path: "/rooms/keys/edit/:key_id",
        name:"admin.rooms.edit",
        component:RoomKeyCreate,
      },
      { 
        path: "rooms/maintenance",
        name:"admin.rooms.maintenance",
        component:RoomMaintenance,
      },
      { 
        path: "/rooms/maintenance/create",
        name:"admin.rooms.maintenance.form",
        component:RoomMaintenanceForm,
      },
      /* Guests*/
      { 
        path: "guests",
        name: "admin.guests",
        component: Guest,
      },
      {
        path: "guests/create",
        name: "admin.guests.create",
        component: Create,
      },
      {
        path: "guests/in-house",
        name: "admin.guests.in-house",
        component: InHouse,
      },
      {
        path: "guests/history",
        name: "admin.guests.history",
        component: GuestHistory,
      },
      {
        path: "guests/preferences",
        name: "admin.guests.preferences",
        component: GuestPreference,
      },

      /* housekeeping */
      {
        path:"housekeeping",
        name:"admin.housekeeping",
        component:Housekeeping_Task,
      },
      {
        path:"housekeeping/today",
        name:"admin.housekeeping.today",
        component:Housekeeping_Today,
      },
      {
        path:"housekeeping/create",
        name:"admin.housekeeping.create",
        component:CreateHouse_Task,
      },
      {
        path:"housekeeping/calendar",
        name:"admin.housekeeping.calender",
        component:Housekeeping_Calender,
      },
      {
        path:"housekeeping/checklist",
        name:"admin.housekeeping.checklist",
        component:Housekeeping_Checklist,
      },
      {
        path:"housekeeping/performance",
        name:"admin.housekeeping.performance",
        component:Housekeeping_Performance,
      },
      {
        path: "housekeeping/staff/:staffId/tasks",
        name: "admin.housekeeping.staff.tasks",
        component: Housekeeping_StaffTasks,
      },

      /* Reservations */
      {
        path: "reservations",
        name: "admin.booking",
        component: AllBooking,
      },
      {
        path:"reservations/create",
        name:"admin.booking.create",
        component:ReservationCreate,
      },
      {
        path: "reservations/calendar",
        name: "admin.calendar",
        component: Calender,
      },
      {
        path: "reservations/checkin",
        name: "admin.checkin",
        component: Checkin_Checkout,
      },
      {
        path: "reservations/availability",
        name: "admin.availability",
        component: Availability,
      },
      {
        path: "reservations/cancellations",
        name: "admin.cancellations",
        component: Cancellations,
      },
      {
        path: "reservations/no-shows",
        name: "admin.no-shows",
        component: ReservationsNoShowsData,
      },

      /* Billing */
      {
        path: "pos/transactions",
        name: "admin.transactions",
        component: Transactions,
      },
      {
        path: "pos/daily-sales",
        name: "admin.daily-sales",
        component: DailySale,
      },
      {
        path: "billing/invoices",
        name: "admin.invoices",
        component: Invoices,
      },
      {
        path: "billing/deposits",
        name: "admin.deposits",
        component: Deposits,
      },

      // report router
      {
        path:"reports/occupancy",
        name:"admin.reports.occupancy",
        component:Occupancy,
      },
      {
        path:"reports/revenue",
        name:"admin.reports.revenue",
        component:Revenue,
      },
      {
        path:"reports/room-sales",
        name:"admin.reports.room_sale",
        component:RoomSale,
      },
      {
        path:"reports/guests",
        name:"admin.reports.guest",
        component:Guests,
      },

      // setting route
      {
        path:"settings/users",
        name:"admin.setting.users",
        component:User,
      },
      {
        path:"settings/create",
        name:"admin.setting.create",
        component:CreateUser,
      },
      {
        path:"settings/roles",
        name:"admin.setting.role",
        component:Role,
      },
      {
        path:"settings/create/role",
        name:"admin.setting.create.role", 
        component:CreateRole,
      },
      {
        path:"settings/permissions",
        name:"admin.setting.permission",
        component:Permission,
      },
      {
        path:"settings/permissions/create",
        name:"admin.setting.permission.create",
        component:CreatePermission,
      },
      {
        path: "settings/permissions/:permissionId/edit",
        name: "admin.settings.permissions.edit",
        component:CreatePermission,
      },
      {
        path: "settings/payment-methods",
        name: "admin.settings.payment-methods",
        component:PaymentMethod,
      },
      {
        path:"settings/general",
        name:"admin.settings.general",
        component:General,
      },
    ],
  },
  {
    path:"/admin/pos",
    name:"admin.pos",
    component:PosLayout,
    children:[
      {
        path:"",
        name:"admin.pos.index",
        component:Index,
      },
      {
        path:"customer",
        name:"admin.pos.customer",
        component:CustomerView,
      },
    ] 
  },

  // 404 Not Found Route - MUST BE LAST!
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundView,
    meta: { title: "404 - Page Not Found" }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Optional: Update page title based on route meta
router.beforeEach((to, from, next) => {
  document.title = to.meta?.title || 'Guesthouse management system'
  next()
})

export default router