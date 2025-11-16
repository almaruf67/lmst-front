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
            <th class="px-6 py-4">Class</th>
            <th class="px-6 py-4">Section</th>
            <th class="px-6 py-4">Attendance</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border text-sm">
          <tr
            v-for="student in students"
            :key="student.id"
            class="hover:bg-surface-muted transition-colors duration-150"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                  :style="{ backgroundColor: student.avatarColor }"
                >
                  {{ student.initials }}
                </div>
                <div>
                  <p class="font-semibold text-foreground">
                    {{ student.name }}
                  </p>
                  <p class="text-xs text-foreground-muted">
                    {{ student.studentId }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 font-medium text-foreground">
              {{ student.className }}
            </td>
            <td class="px-6 py-4 text-foreground-muted">
              {{ student.section }}
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="h-2 w-20 rounded-full bg-surface-muted overflow-hidden"
                >
                  <div
                    class="h-2 rounded-full bg-primary"
                    :style="{ width: `${student.attendancePercentage}%` }"
                  />
                </div>
                <span class="font-medium text-foreground w-12"
                  >{{ student.attendancePercentage }}%</span
                >
              </div>
            </td>
            <td class="px-6 py-4">
              <span :class="statusBadgeClass(student.status)">
                {{ student.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button class="btn-secondary text-xs px-3 py-1.5">View</button>
            </td>
          </tr>
          <tr v-if="students.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-foreground-muted">
              No students found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer
      class="flex items-center justify-between border-t border-border bg-surface-muted px-6 py-3 text-sm"
    >
      <span class="text-foreground-muted"
        >Page {{ page }} · Showing {{ students.length }} of {{ total }}</span
      >
      <div class="flex items-center gap-2">
        <button
          class="btn-secondary text-xs px-3 py-1.5"
          :disabled="page === 1"
          @click="changePage(page - 1)"
        >
          ← Prev
        </button>
        <button
          class="btn-secondary text-xs px-3 py-1.5"
          :disabled="page === totalPages"
          @click="changePage(page + 1)"
        >
          Next →
        </button>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
type StudentItem = {
  id: number;
  name: string;
  initials: string;
  studentId: string;
  className: string;
  section: string;
  attendancePercentage: number;
  status: 'Present' | 'Absent' | 'Late';
  avatarColor: string;
};

const props = defineProps<{
  students: StudentItem[];
  total: number;
  page: number;
  pageSize: number;
}>();
const emit = defineEmits<{ (e: 'change-page', page: number): void }>();

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.pageSize))
);

const statusBadgeClass = (status: StudentItem['status']) => {
  if (status === 'Present') return 'badge-success';
  if (status === 'Late') return 'badge-warning';
  return 'badge-danger';
};

const changePage = (next: number) => {
  emit('change-page', Math.min(Math.max(next, 1), totalPages.value));
};
</script>
