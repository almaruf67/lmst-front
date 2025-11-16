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
        >
          <option value="All">All Classes</option>
          <option v-for="cls in classOptions" :key="cls" :value="cls">
            Class {{ cls }}
          </option>
        </select>
        <select
          v-model="store.selectedSection"
          class="h-11 rounded-2xl border border-(--color-border) bg-(--color-surface) px-3 text-sm"
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
        <div class="flex gap-2">
          <button
            v-for="status in statusActions"
            :key="status.value"
            class="h-11 rounded-2xl border px-4 text-sm font-semibold"
            :class="status.buttonClass"
            @click="bulkMarkStatus(status.value)"
          >
            {{ status.label }}
          </button>
        </div>
      </template>
    </PageToolbar>

    <section class="toolbar-grid">
      <article class="card-surface p-5">
        <p class="text-xs uppercase text-(--color-foreground-muted)">Present</p>
        <p class="text-3xl font-semibold">{{ store.statusSummary.present }}</p>
      </article>
      <article class="card-surface p-5">
        <p class="text-xs uppercase text-(--color-foreground-muted)">Absent</p>
        <p class="text-3xl font-semibold">{{ store.statusSummary.absent }}</p>
      </article>
      <article class="card-surface p-5">
        <p class="text-xs uppercase text-(--color-foreground-muted)">Late</p>
        <p class="text-3xl font-semibold">{{ store.statusSummary.late }}</p>
      </article>
      <article class="card-surface flex flex-col justify-between p-5">
        <div>
          <p class="text-xs uppercase text-(--color-foreground-muted)">
            Completion
          </p>
          <p class="text-3xl font-semibold">
            {{ store.attendancePercentage }}%
          </p>
        </div>
        <div class="mt-4 h-2 rounded-full bg-(--color-surface-muted)">
          <div
            class="h-2 rounded-full bg-(--color-primary)"
            :style="{ width: `${store.attendancePercentage}%` }"
          ></div>
        </div>
      </article>
    </section>

    <div class="card-surface border border-(--color-border)">
      <div
        class="flex flex-wrap items-center gap-3 border-b border-(--color-border) px-4 py-3 text-sm"
      >
        <button
          class="rounded-full border border-(--color-border) px-3 py-1"
          @click="selectAllVisible"
        >
          Select visible
        </button>
        <button
          class="rounded-full border border-(--color-border) px-3 py-1"
          @click="clearSelection"
        >
          Clear
        </button>
        <span class="text-(--color-foreground-muted)"
          >{{ selectedStudents.length }} selected</span
        >
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-(--color-border) text-sm">
          <thead>
            <tr
              class="text-left text-xs uppercase tracking-wide text-(--color-foreground-muted)"
            >
              <th class="px-4 py-3">
                <input type="checkbox" @change="selectAllVisible" />
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
                  :checked="selectedStudents.includes(record.studentId)"
                  @change="toggleSelection(record.studentId)"
                />
              </td>
              <td class="px-4 py-3 font-medium">{{ record.name }}</td>
              <td class="px-4 py-3">{{ record.className }}</td>
              <td class="px-4 py-3">{{ record.section }}</td>
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
                    @click="markStatus(record.studentId, status.value)"
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
  store,
  filteredRecords,
  selectedStudents,
  toggleSelection,
  selectAllVisible,
  clearSelection,
  markStatus,
  bulkMarkStatus,
} = useAttendance();

const classOptions = computed(() => {
  const unique = new Set(store.records.map((record) => record.className));
  return Array.from(unique);
});

const sectionOptions = computed(() => {
  const unique = new Set(store.records.map((record) => record.section));
  return Array.from(unique);
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
</script>
