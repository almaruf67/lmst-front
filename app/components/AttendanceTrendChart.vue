<template>
  <div class="relative">
    <canvas ref="canvasRef" class="w-full" />
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center rounded-2xl bg-surface/70 text-sm text-foreground-muted"
    >
      Loading chart…
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Chart } from 'chart.js/auto';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  labels: string[];
  datasets: Array<Record<string, unknown>>;
  loading?: boolean;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
};

const renderChart = () => {
  if (!canvasRef.value) {
    return;
  }

  const hasData = props.labels.length > 0 && props.datasets.length > 0;
  if (!hasData) {
    destroyChart();
    return;
  }

  destroyChart();

  chartInstance = new Chart(canvasRef.value, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: props.datasets.map((dataset) => ({
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 4,
        ...dataset,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.2)',
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
          },
        },
        tooltip: {
          intersect: false,
          mode: 'index',
        },
      },
    },
  });
};

onMounted(() => {
  renderChart();
});

watch(
  () => [props.labels, props.datasets],
  () => {
    renderChart();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  destroyChart();
});
</script>
