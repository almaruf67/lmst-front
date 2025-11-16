<template>
  <div
    class="card-surface border border-border rounded-lg overflow-hidden shadow-sm"
  >
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-border">
        <thead
          class="bg-surface-muted text-left text-xs font-bold uppercase tracking-wider text-foreground-muted"
        >
          <tr>
            <th class="px-6 py-4">Student</th>
            <th class="px-6 py-4">Student ID</th>
            <th class="px-6 py-4">Class / Section</th>
            <th class="px-6 py-4">Primary Teacher</th>
            <th class="px-6 py-4">Last Updated</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border text-sm">
          <template v-if="loading">
            <tr
              v-for="index in 6"
              :key="`skeleton-${index}`"
              class="animate-pulse"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-surface-muted" />
                  <div class="space-y-2">
                    <div class="h-3 w-32 rounded-full bg-surface-muted" />
                    <div class="h-2 w-20 rounded-full bg-surface-muted" />
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="h-3 w-24 rounded-full bg-surface-muted" />
              </td>
              <td class="px-6 py-4">
                <div class="h-3 w-20 rounded-full bg-surface-muted" />
              </td>
              <td class="px-6 py-4">
                <div class="h-3 w-28 rounded-full bg-surface-muted" />
              </td>
              <td class="px-6 py-4">
                <div class="h-3 w-24 rounded-full bg-surface-muted" />
              </td>
              <td class="px-6 py-4 text-right">
                <div class="ml-auto h-8 w-16 rounded-full bg-surface-muted" />
              </td>
            </tr>
          </template>
          <template v-else>
            <tr
              v-for="student in students"
              :key="student.id"
              class="hover:bg-surface-muted transition-colors duration-150"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="relative h-10 w-10">
                    <img
                      v-if="student.photoUrl"
                      :src="student.photoUrl"
                      :alt="student.name"
                      class="h-10 w-10 rounded-full object-cover ring-2 ring-surface"
                    />
                    <div
                      v-else
                      class="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                      :style="{ backgroundColor: student.accentColor }"
                    >
                      {{ student.initials }}
                    </div>
                  </div>
                  <div>
                    <p class="font-semibold text-foreground">
                      {{ student.name }}
                    </p>
                    <p class="text-xs text-foreground-muted">
                      Updated {{ formatRelative(student.updatedAt) }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 font-mono text-sm text-foreground">
                {{ student.studentCode }}
              </td>
              <td class="px-6 py-4">
                <p class="font-medium text-foreground">
                  {{ student.className ? `Class ${student.className}` : '—' }}
                </p>
                <p class="text-xs text-foreground-muted">
                  {{
                    student.section
                      ? `Section ${student.section}`
                      : 'Unassigned'
                  }}
                </p>
              </td>
              <td class="px-6 py-4 text-foreground">
                {{ student.primaryTeacher ?? 'Not assigned' }}
              </td>
              <td class="px-6 py-4 text-foreground-muted">
                {{ formatAbsolute(student.updatedAt) }}
              </td>
              <td class="px-6 py-4 text-right">
                <button class="btn-secondary text-xs px-3 py-1.5">View</button>
              </td>
            </tr>
            <tr v-if="students.length === 0">
              <td
                colspan="6"
                class="px-6 py-8 text-center text-foreground-muted"
              >
                No students found
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <footer
      class="flex flex-wrap items-center gap-4 border-t border-border bg-surface-muted px-6 py-3 text-sm"
    >
      <span class="text-foreground-muted">
        <template v-if="total > 0">
          Showing {{ rangeStart }}-{{ rangeEnd }} of {{ total }}
        </template>
        <template v-else> Waiting for records… </template>
      </span>
      <div class="flex flex-1 items-center justify-end gap-2">
        <button
          class="btn-secondary text-xs px-3 py-1.5"
          :disabled="page === 1 || loading"
          @click="changePage(page - 1)"
        >
          ← Prev
        </button>
        <button
          class="btn-secondary text-xs px-3 py-1.5"
          :disabled="page >= totalPages || loading"
          @click="changePage(page + 1)"
        >
          Next →
        </button>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import type { StudentListItem } from '~/composables/useStudents';

const props = defineProps<{
  students: StudentListItem[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
}>();
const emit = defineEmits<{ (e: 'change-page', page: number): void }>();

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.pageSize))
);
const rangeStart = computed(() => {
  if (!props.total) {
    return 0;
  }
  return (props.page - 1) * props.pageSize + 1;
});
const rangeEnd = computed(() => {
  if (!props.total) {
    return 0;
  }
  return Math.min(props.page * props.pageSize, props.total);
});

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: 'auto',
});
const absoluteFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const formatRelative = (value: string | null) => {
  if (!value) {
    return 'recently';
  }

  const updated = new Date(value).getTime();
  if (Number.isNaN(updated)) {
    return 'recently';
  }

  const diffMs = updated - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return relativeFormatter.format(diffDays, 'day');
};

const formatAbsolute = (value: string | null) => {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return absoluteFormatter.format(parsed);
};

const changePage = (next: number) => {
  const safePage = Math.min(Math.max(next, 1), totalPages.value);
  emit('change-page', safePage);
};

const loading = computed(() => props.loading ?? false);
</script>
