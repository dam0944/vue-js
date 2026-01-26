<template>
  <div class="rounded-2xl bg-white p-4 sm:p-5">
    <div class="flex items-start justify-between gap-4 mb-4">
      <div>
        <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-slate-500 mt-1">{{ subtitle }}</p>
      </div>

      <div v-if="centerText" class="text-xs text-slate-500">
        Center: <span class="font-semibold text-slate-900">{{ centerText }}</span>
      </div>
    </div>

    <div class="h-[280px] w-full">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const props = defineProps({
  title: { type: String, default: "Doughnut Chart" },
  subtitle: { type: String, default: "" },

  labels: { type: Array, required: true }, // ["Occupied", "Available"]
  values: { type: Array, required: true }, // [7, 3]
  colors: { type: Array, default: () => ["#16a34a", "#2563eb", "#f59e0b", "#ef4444"] },

  cutout: { type: [String, Number], default: "65%" },
  centerText: { type: String, default: "" }, // "70%" or "10 rooms"
});

const canvasRef = ref(null);
let chart = null;

// Plugin: center text
const centerTextPlugin = {
  id: "centerTextPlugin",
  afterDraw(c) {
    if (!props.centerText) return;
    const { ctx, chartArea } = c;
    if (!chartArea) return;

    const x = (chartArea.left + chartArea.right) / 2;
    const y = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 22px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(props.centerText, x, y);
    ctx.restore();
  },
};

function renderChart() {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    plugins: [centerTextPlugin],
    data: {
      labels: props.labels,
      datasets: [
        {
          data: props.values,
          backgroundColor: props.colors.slice(0, props.values.length),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: props.cutout,
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, boxWidth: 10 },
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const label = ctx.label || "";
              const value = ctx.parsed || 0;
              return `${label}: ${value}`;
            },
          },
        },
      },
    },
  });
}

onMounted(renderChart);

watch(
  () => [props.labels, props.values, props.colors, props.centerText, props.cutout],
  () => renderChart(),
  { deep: true }
);

onBeforeUnmount(() => {
  if (chart) chart.destroy();
});
</script>
