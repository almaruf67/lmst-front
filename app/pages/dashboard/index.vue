<template>
  <div class="space-y-6">
    <PageToolbar
      eyebrow="Overview"
      title="Attendance Overview"
      description="Live insight into today’s attendance health and urgent actions."
    >
      <template #actions>
        <div class="flex items-center gap-3">
          <input
            v-model="reportMonth"
            type="month"
            class="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm"
            aria-label="Select report month"
          />
          <button
            class="btn-secondary h-11 px-5 text-sm font-semibold"
            :disabled="exporting"
            @click="exportMonthlyReport"
          >
            <span v-if="exporting">Exporting…</span>
            <span v-else>Download Report</span>
          </button>
        </div>
      </template>
    </PageToolbar>

    <div
      v-if="summaryError"
      class="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ summaryError }}
    </div>

    <section class="toolbar-grid">
      <article
        v-for="highlight in highlightCards"
        :key="highlight.label"
        class="card-surface border border-border p-5"
      >
        <p class="text-xs uppercase text-foreground-muted">
          {{ highlight.label }}
        </p>
        <p class="text-3xl font-semibold">
          <span
            v-if="summaryLoading"
            class="inline-block animate-pulse rounded-full bg-surface-muted px-6 py-3"
          />
          <span v-else>{{ highlight.value }}</span>
        </p>
        <p class="text-xs text-foreground-muted">
          {{ highlight.subtext }}
        </p>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-3">
      <article class="card-surface border border-border p-6 xl:col-span-2">
        <header class="mb-6 flex flex-wrap items-center gap-4">
          <div>
            <p class="text-xs uppercase text-foreground-muted">Weekly Trend</p>
            <h3 class="text-xl font-semibold">{{ formattedReportMonth }}</h3>
          </div>
          <div
            class="ml-auto flex items-center gap-3 text-xs text-foreground-muted"
          >
            <span class="flex items-center gap-1">
              <span class="h-3 w-3 rounded-full bg-primary" /> Present
            </span>
            <span class="flex items-center gap-1">
              <span class="h-3 w-3 rounded-full bg-amber-500" /> Late
            </span>
            <span class="flex items-center gap-1">
              <span class="h-3 w-3 rounded-full bg-rose-500" /> Absent
            </span>
          </div>
        </header>

        <AttendanceTrendChart
          :labels="weeklyChart.labels"
          :datasets="weeklyChart.datasets"
          :loading="summaryLoading"
        />

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div
            v-for="status in monthlyStatusBreakdown"
            :key="status.label"
            class="rounded-2xl border border-border p-4"
          >
            <div
              class="flex items-center justify-between text-sm font-semibold"
            >
              <span>{{ status.label }}</span>
              <span>{{ status.value }}</span>
            </div>
            <div class="mt-3 h-2 rounded-full bg-surface-muted">
              <div
                class="h-2 rounded-full"
                :class="statusColor(status.label)"
                :style="{ width: `${status.percentage}%` }"
              />
            </div>
            <p class="mt-2 text-xs text-foreground-muted">
              {{ status.percentage }}% of records
            </p>
          </div>
        </div>
      </article>

      <NotificationCenter
        :notifications="notifications"
        :loading="notificationsLoading"
        :error="notificationsError"
        :selected-ids="selectedIds"
        :unread-count="unreadCount"
        :priority-counts="priorityCounts"
        @refresh="fetchNotifications"
        @toggle-select="toggleSelection"
        @mark-selected="markSelectedAsRead"
        @mark-all="markAllAsRead"
        @mark-single="markNotificationAsRead"
      />
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <article class="card-surface border border-border p-6">
        <header class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase text-foreground-muted">Daily Capture</p>
            <h3 class="text-xl font-semibold">{{ formattedReportMonth }}</h3>
          </div>
          <span class="text-sm text-foreground-muted">
            {{ monthlyTotalsList.length }} days tracked
          </span>
        </header>
        <div class="mt-6 space-y-3">
          <div
            v-for="entry in monthlyTotalsList"
            :key="entry.date"
            class="flex items-center gap-4 rounded-2xl border border-border px-4 py-3"
          >
            <div class="w-24 text-sm font-semibold">
              {{ formatDate(entry.date) }}
            </div>
            <div class="flex-1">
              <div class="h-2 rounded-full bg-surface-muted">
                <div
                  class="h-2 rounded-full bg-primary"
                  :style="{ width: `${entry.percentage}%` }"
                />
              </div>
            </div>
            <div class="w-16 text-right text-sm font-semibold">
              {{ entry.total }}
            </div>
          </div>
        </div>
      </article>

      <article class="card-surface border border-border p-6">
        <header class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase text-foreground-muted">System Alerts</p>
            <h3 class="text-xl font-semibold">Latest Failures</h3>
          </div>
          <button
            class="text-sm font-semibold text-primary"
            type="button"
            @click="refreshAll"
          >
            Refresh
          </button>
        </header>
        <p class="mt-4 text-sm text-foreground-muted">
          Hook into backend `AttendanceRecordedNotification` streams. Alerts
          roll into the notification center and emit toasts globally.
        </p>
        <div
          v-if="reportError"
          class="mt-4 rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {{ reportError }}
        </div>
        <div
          v-if="exportError"
          class="mt-4 rounded-2xl border border-amber-600/40 bg-amber-100 px-4 py-3 text-sm text-amber-900"
        >
          {{ exportError }}
        </div>
      </article>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';

const {
  summaryError,
  summaryLoading,
  highlightCards,
  weeklyChart,
  monthlyStatusBreakdown,
  monthlyTotals,
  reportMonth,
  reportError,
  exporting,
  exportError,
  refreshAll,
  loadMonthlyReport,
  exportMonthlyReport,
} = useDashboard();

const {
  notifications,
  loading: notificationsLoading,
  error: notificationsError,
  unreadCount,
  priorityCounts,
  selectedIds,
  toggleSelection,
  fetchNotifications,
  markSelectedAsRead,
  markAllAsRead,
  markNotificationAsRead,
} = useNotificationCenter();

watch(reportMonth, () => {
  loadMonthlyReport();
});

const formattedReportMonth = computed(() => {
  const date = new Date(`${reportMonth.value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return reportMonth.value;
  }

  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
});

const monthlyTotalsList = computed(() => {
  const entries = Object.entries(monthlyTotals.value);
  const totalMax = Math.max(...entries.map(([, total]) => Number(total)), 1);

  return entries
    .map(([date, total]) => ({
      date,
      total: Number(total),
      percentage: Math.round((Number(total) / totalMax) * 100),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
});

const statusColor = (label: string) => {
  const normalized = label.toLowerCase();

  if (normalized.startsWith('present')) {
    return 'bg-primary';
  }

  if (normalized.startsWith('late')) {
    return 'bg-amber-500';
  }

  if (normalized.startsWith('absent')) {
    return 'bg-rose-500';
  }

  return 'bg-blue-500';
};

const formatDate = (input: string) => {
  const date = new Date(`${input}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};
</script>
