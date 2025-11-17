<template>
  <div class="space-y-6">
    <PageToolbar
      eyebrow="Attendance"
      title="Daily Attendance"
      description="Mark attendance in bulk, preview percentages, and sync later with the API."
    >
      <template #filters>
        <select
          v-model="store.selectedClass"
          class="h-11 rounded-2xl border border-(--color-border) bg-(--color-surface) px-3 text-sm"
          :disabled="loading"
        >
          <option value="All">All Classes</option>
          <option v-for="cls in classOptions" :key="cls" :value="cls">
            Class {{ cls }}
          </option>
        </select>
        <select
          v-model="store.selectedSection"
          class="h-11 rounded-2xl border border-(--color-border) bg-(--color-surface) px-3 text-sm"
          :disabled="loading"
        >
          <option value="All">All Sections</option>
          <option
            v-for="section in sectionOptions"
            :key="section"
            :value="section"
          >
            Section {{ section }}
          </option>
        </select>
      </template>
      <template #actions>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="status in statusActions"
              :key="status.value"
              type="button"
              class="h-11 rounded-2xl border px-4 text-sm font-semibold"
              :class="status.buttonClass"
              :disabled="loading || saving || !filteredRecords.length"
              @click="bulkMarkStatus(status.value)"
            >
              {{ status.label }}
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <label class="text-sm text-(--color-foreground-muted)">
              Date
              <input
                v-model="store.date"
                type="date"
                class="ml-2 h-11 rounded-2xl border border-(--color-border) bg-(--color-surface) px-3"
                :disabled="saving"
              />
            </label>
            <button
              type="button"
              class="btn-primary h-11 px-5 text-sm font-semibold"
              :disabled="saving || loading || !store.records.length"
              @click="saveAttendance"
            >
              {{ saving ? 'Saving…' : 'Save Attendance' }}
            </button>
          </div>
        </div>
      </template>
    </PageToolbar>

    <div
      v-if="error"
      class="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ error }}
    </div>

    <div
      v-if="summaryError"
      class="rounded-2xl border border-amber-300/40 bg-amber-100/40 px-4 py-3 text-sm text-amber-900"
    >
      {{ summaryError }}
    </div>

    <div
      v-if="reportError"
      class="rounded-2xl border border-amber-300/40 bg-amber-100/40 px-4 py-3 text-sm text-amber-900"
    >
      {{ reportError }}
    </div>

    <div
      v-if="actionError"
      class="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ actionError }}
    </div>

    <div
      v-if="actionSuccess"
      class="rounded-2xl border border-emerald-300/40 bg-emerald-100/40 px-4 py-3 text-sm text-emerald-900"
    >
      {{ actionSuccess }}
    </div>

    <section class="card-surface space-y-4 p-5">
      <div class="flex flex-wrap items-center gap-4">
        <div>
          <p class="text-xs uppercase text-(--color-foreground-muted)">
            Monthly Records
          </p>
          <p class="text-3xl font-semibold">{{ monthlyTotalRecords }}</p>
          <p class="text-sm text-(--color-foreground-muted)">
            {{ reportMonthLabel }}
          </p>
        </div>
        <label class="ml-auto text-sm text-(--color-foreground-muted)">
          Month
          <input
            v-model="reportMonth"
            type="month"
            class="ml-2 h-11 rounded-2xl border border-(--color-border) bg-(--color-surface) px-3"
            :disabled="reportLoading"
          />
        </label>
      </div>
      <div class="grid gap-4 sm:grid-cols-3">
        <article class="rounded-2xl border border-(--color-border) p-4">
          <p class="text-xs uppercase text-(--color-foreground-muted)">
            Present
          </p>
          <p class="text-2xl font-semibold">{{ monthlyTotals.present }}</p>
        </article>
        <article class="rounded-2xl border border-(--color-border) p-4">
          <p class="text-xs uppercase text-(--color-foreground-muted)">
            Absent
          </p>
          <p class="text-2xl font-semibold">{{ monthlyTotals.absent }}</p>
        </article>
        <article class="rounded-2xl border border-(--color-border) p-4">
          <p class="text-xs uppercase text-(--color-foreground-muted)">Late</p>
          <p class="text-2xl font-semibold">{{ monthlyTotals.late }}</p>
        </article>
      </div>
      <p v-if="reportLoading" class="text-sm text-(--color-foreground-muted)">
        Loading monthly report…
      </p>
    </section>

    <div class="card-surface border border-(--color-border)">
      <div
        class="flex flex-wrap items-center gap-3 border-b border-(--color-border) px-4 py-3 text-sm"
      >
        <button
          class="rounded-full border border-(--color-border) px-3 py-1"
          :disabled="!filteredRecords.length"
          @click="selectAllVisible"
        >
          Select visible
        </button>
        <button
          class="rounded-full border border-(--color-border) px-3 py-1"
          :disabled="!selectedStudents.length"
          @click="clearSelection"
        >
          Clear
        </button>
        <span class="text-(--color-foreground-muted)">
          {{ selectedStudents.length }} selected
        </span>
        <span v-if="loading" class="text-(--color-foreground-muted)">
          Loading roster…
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-(--color-border) text-sm">
          <thead>
            <tr
              class="text-left text-xs uppercase tracking-wide text-(--color-foreground-muted)"
            >
              <th class="px-4 py-3">
                <input type="checkbox" @change="handleHeaderSelection" />
              </th>
              <th class="px-4 py-3">Student</th>
              <th class="px-4 py-3">Class</th>
              <th class="px-4 py-3">Section</th>
              <th class="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-(--color-border)">
            <tr v-for="record in filteredRecords" :key="record.id">
              <td class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedStudents.includes(record.id)"
                  @change="toggleSelection(record.id)"
                />
              </td>
              <td class="px-4 py-3 font-medium">{{ record.name }}</td>
              <td class="px-4 py-3">{{ record.className ?? '—' }}</td>
              <td class="px-4 py-3">{{ record.section ?? '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button
                    v-for="status in statusActions"
                    :key="status.value"
                    class="rounded-full border px-3 py-1 text-xs font-semibold"
                    :class="[
                      status.pillClass,
                      record.status === status.value
                        ? 'border-(--color-primary) bg-(--color-primary)/20 text-(--color-primary)'
                        : 'border-(--color-border) text-(--color-foreground-muted)',
                    ]"
                    :disabled="saving"
                    @click="markStatus(record.id, status.value)"
                  >
                    {{ status.shortLabel }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AttendanceStatus } from '~/stores/attendance';

const {
  loading,
  error,
  store,
  filteredRecords,
  selectedStudents,
  summaryTotals,
  summaryPercentage,
  monthlyTotals,
  monthlyTotalRecords,
  reportMonth,
  reportLoading,
  reportError,
  summaryLoading,
  summaryError,
  saving,
  actionError,
  actionSuccess,
  toggleSelection,
  selectAllVisible,
  clearSelection,
  markStatus,
  bulkMarkStatus,
  saveAttendance,
} = useAttendance();

const classOptions = computed(() => {
  const unique = new Set(
    store.records
      .map((record) => record.className)
      .filter((value): value is string => Boolean(value))
  );
  return Array.from(unique);
});

const sectionOptions = computed(() => {
  const unique = new Set(
    store.records
      .map((record) => record.section)
      .filter((value): value is string => Boolean(value))
  );
  return Array.from(unique);
});

const reportMonthLabel = computed(() => {
  if (!reportMonth.value) {
    return '';
  }

  const date = new Date(`${reportMonth.value}-01T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
});

const statusActions = [
  {
    label: 'Mark Present',
    shortLabel: 'P',
    value: 'present',
    buttonClass: 'border-(--color-primary)/40 text-(--color-primary)',
    pillClass: '',
  },
  {
    label: 'Mark Late',
    shortLabel: 'L',
    value: 'late',
    buttonClass: 'border-(--color-warning)/40 text-(--color-warning)',
    pillClass: '',
  },
  {
    label: 'Mark Absent',
    shortLabel: 'A',
    value: 'absent',
    buttonClass: 'border-(--color-danger)/40 text-(--color-danger)',
    pillClass: '',
  },
] satisfies Array<{
  label: string;
  shortLabel: string;
  value: AttendanceStatus;
  buttonClass: string;
  pillClass: string;
}>;

const handleHeaderSelection = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    selectAllVisible();
  } else {
    clearSelection();
  }
};
</script>
