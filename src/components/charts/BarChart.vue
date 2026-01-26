<template>
  <div class="rounded-2xl bg-white p-4 sm:p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-slate-500 mt-1">{{ subtitle }}</p>
      </div>

      <div v-if="showPeriodSwitch" class="inline-flex rounded-xl bg-slate-100 p-1">
        <button
          @click="$emit('update:period', '7days')"
          class="px-3 py-1.5 text-sm font-medium rounded-lg transition"
          :class="period === '7days' ? 'bg-white text-slate-900' : 'text-slate-600 hover:text-slate-900'"
        >
          7 Days
        </button>
        <button
          @click="$emit('update:period', 'month')"
          class="px-3 py-1.5 text-sm font-medium rounded-lg transition"
          :class="period === 'month' ? 'bg-white text-slate-900' : 'text-slate-600 hover:text-slate-900'"
        >
          This Month
        </button>
      </div>
    </div>

    <div class="h-[320px] w-full">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps({
  title: { type: String, default: "Bar Chart" },
  subtitle: { type: String, default: "" },

  labels: { type: Array, required: true }, // ["Jan 1", "Jan 2"]
  values: { type: Array, required: true }, // [120, 90]

  period: { type: String, default: "7days" }, // just for UI
  showPeriodSwitch: { type: Boolean, default: false },
});

defineEmits(["update:period"]);

const canvasRef = ref(null);
let chart = null;

function renderChart() {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: props.labels,
      datasets: [
        {
          label: "Revenue",
          data: props.values,
          borderWidth: 0,
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              const v = ctx.parsed.y || 0;
              return `$${Number(v).toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => `$${v}`,
          },
          grid: { color: "rgba(148,163,184,0.25)" },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  });
}

onMounted(renderChart);

watch(
  () => [props.labels, props.values],
  () => renderChart(),
  { deep: true }
);

onBeforeUnmount(() => {
  if (chart) chart.destroy();
});
</script>
