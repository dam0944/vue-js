<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50">
    <div class="mx-auto w-full px-4 sm:px-6 py-6">

      <!-- Header -->
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p class="text-slate-600 mt-1">{{ currentDate }}</p>
        </div>

        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-700 text-sm">
          <span class="material-icons text-base text-slate-500">apartment</span>
          {{ metrics.totalRooms }} Rooms
        </div>
      </div>
      
      <!-- TOP 3 KPI GRID (Clean Green Border Style) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <!-- Rooms Overview -->
        <div class="rounded-2xl border border-green-600 bg-white p-5 relative">
          <span class="material-icons absolute right-4 top-4 text-green-600 opacity-20 text-[60px]">
            meeting_room
          </span>

          <div class="text-sm font-semibold text-slate-700">Rooms Overview</div>
          <div class="text-xs text-slate-500 mt-1">Live status today</div>

          <div class="grid grid-cols-3 gap-3 mt-5">
            <div>
              <div class="text-xs text-slate-500">Total</div>
              <div class="text-2xl font-bold text-slate-900">{{ metrics.totalRooms }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500">Occupied</div>
              <div class="text-2xl font-bold text-slate-900">{{ metrics.occupiedRooms }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500">Available</div>
              <div class="text-2xl font-bold text-slate-900">{{ metrics.availableRooms }}</div>
            </div>
          </div>

          <div class="mt-5">
            <div class="flex justify-between text-xs text-slate-500 mb-1">
              <span>Occupancy</span>
              <span class="font-semibold text-slate-900">{{ metrics.occupancyRate }}%</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-600"
                :style="{ width: metrics.occupancyRate + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Today Movement -->
        <div class="rounded-2xl border border-green-600 bg-white p-5 relative">
          <span class="material-icons absolute right-4 top-4 text-green-600 opacity-20 text-[60px]">
            swap_horiz
          </span>

          <div class="text-sm font-semibold text-slate-700">Today Movement</div>
          <div class="text-xs text-slate-500 mt-1">Arrivals & Departures</div>

          <div class="grid grid-cols-3 gap-3 mt-5">
            <div>
              <div class="text-xs text-slate-500">Check-ins</div>
              <div class="text-2xl font-bold text-slate-900">{{ metrics.checkInsToday }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500">Check-outs</div>
              <div class="text-2xl font-bold text-slate-900">{{ metrics.checkOutsToday }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500">Pending</div>
              <div class="text-2xl font-bold text-slate-900">{{ metrics.pendingCheckouts }}</div>
            </div>
          </div>
        </div>

        <!-- Revenue Summary -->
        <div class="rounded-2xl border border-green-600 bg-white p-5 relative">
          <span class="material-icons absolute right-4 top-4 text-green-600 opacity-20 text-[60px]">
            payments
          </span>

          <div class="text-sm font-semibold text-slate-700">Revenue Summary</div>
          <div class="text-xs text-slate-500 mt-1">Cashflow quick view</div>

          <div class="grid grid-cols-2 gap-3 mt-5">
            <div>
              <div class="text-xs text-slate-500">Today</div>
              <div class="text-2xl font-bold text-slate-900">${{ metrics.revenue.toFixed(2) }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500">This Month</div>
              <div class="text-2xl font-bold text-slate-900">${{ month.totalRevenue.toFixed(0) }}</div>
            </div>
          </div>
        </div>

      </div>


      <!-- ONLY 2 CHARTS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DoughnutChart
          title="Room Status"
          subtitle="Occupied / Available / Cleaning / Maintenance"
          :labels="doughnutLabels"
          :values="doughnutValues"
          :colors="doughnutColors"
          cutout="68%"
          :centerText="`${metrics.occupancyRate}%`"
        />

        <BarChart
          title="Revenue"
          subtitle="Daily revenue"
          :labels="barLabels"
          :values="barValues"
          :period="period"
          :showPeriodSwitch="true"
          @update:period="period = $event"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref, defineComponent, h } from "vue";
import DoughnutChart from "@/components/charts/DoughnutChart.vue";
import BarChart from "@/components/charts/BarChart.vue";

import {
  dashboardMetrics,
  roomStatusBreakdown,
  revenueChart7Days,
  revenueChartMonth,
} from "@/data/dashboardData.js";

// Date
const currentDate = computed(() =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
);

// Static metrics
const metrics = dashboardMetrics.today;
const month = dashboardMetrics.thisMonth;

// Doughnut: Room Status
const doughnutLabels = computed(() =>
  roomStatusBreakdown.map((x) => x.status.replaceAll("_", " "))
);
const doughnutValues = computed(() => roomStatusBreakdown.map((x) => x.count));
const doughnutColors = ["#16a34a", "#2563eb", "#f59e0b", "#ef4444"];

// Bar: Revenue
const period = ref("7days");
const chartData = computed(() => (period.value === "month" ? revenueChartMonth : revenueChart7Days));

const barLabels = computed(() =>
  chartData.value.map((x) =>
    new Date(x.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  )
);

const barValues = computed(() => chartData.value.map((x) => x.revenue));

// KPI card component (simple)
const KpiCard = defineComponent({
  name: "KpiCard",
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    icon: { type: String, default: "dashboard" },
    accent: { type: String, default: "bg-slate-900" },
  },
  setup(props, { slots }) {
    return () =>
      h("div", { class: ["relative overflow-hidden rounded-2xl text-white p-5", props.accent] }, [
        h("span", { class: "material-icons absolute right-4 bottom-2 text-[92px] opacity-15" }, props.icon),
        h("div", { class: "relative z-10" }, [
          h("div", { class: "text-sm font-semibold" }, props.title),
          props.subtitle ? h("div", { class: "text-xs opacity-90 mt-1" }, props.subtitle) : null,
          slots.default?.(),
        ]),
      ]);
  },
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
</style>
