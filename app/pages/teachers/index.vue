<template>
  <div class="space-y-6">
    <PageToolbar
      eyebrow="Faculty"
      title="Teachers"
      description="Assign classes, manage credentials, and handle teacher CRUD from the LMST API."
    >
      <template #filters>
        <input
          v-model="search"
          type="search"
          placeholder="Search teachers"
          class="h-11 rounded-2xl border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <select
          v-model="classFilter"
          class="h-11 rounded-2xl border border-border bg-surface px-3 text-sm"
          :disabled="optionsLoading"
        >
          <option
            v-for="className in classOptions"
            :key="`class-${className}`"
            :value="className"
          >
            {{ className === 'All' ? 'All Classes' : `Class ${className}` }}
          </option>
        </select>
        <select
          v-model="sectionFilter"
          class="h-11 rounded-2xl border border-border bg-surface px-3 text-sm"
          :disabled="optionsLoading"
        >
          <option
            v-for="section in sectionOptions"
            :key="`section-${section}`"
            :value="section"
          >
            {{ section === 'All' ? 'All Sections' : `Section ${section}` }}
          </option>
        </select>
        <select
          v-model.number="pageSize"
          class="h-11 rounded-2xl border border-border bg-surface px-3 text-sm"
        >
          <option :value="10">10 / page</option>
          <option :value="20">20 / page</option>
          <option :value="50">50 / page</option>
        </select>
      </template>
      <template #actions>
        <button
          type="button"
          class="btn-secondary h-11 px-4 text-sm font-semibold"
          :disabled="optionsLoading"
          @click="fetchClassroomOptions()"
        >
          Refresh Options
        </button>
        <button
          type="button"
          class="btn-primary h-11 px-5 text-sm font-semibold"
          @click="openCreateDrawer()"
        >
          Add Teacher
        </button>
      </template>
    </PageToolbar>

    <div
      v-if="error"
      class="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ error }}
    </div>

    <div
      v-if="optionsError"
      class="rounded-2xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      {{ optionsError }}
    </div>

    <div
      v-if="actionError"
      class="rounded-2xl border border-amber-300/40 bg-amber-100/60 px-4 py-3 text-sm text-amber-900"
    >
      {{ actionError }}
    </div>

    <section
      class="card-surface border border-border rounded-2xl overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-border text-sm">
          <thead
            class="bg-surface-muted text-left text-xs font-bold uppercase tracking-wider text-foreground-muted"
          >
            <tr>
              <th class="px-6 py-4">Teacher</th>
              <th class="px-6 py-4">Class / Section</th>
              <th class="px-6 py-4">Email</th>
              <th class="px-6 py-4">Employee Code</th>
              <th class="px-6 py-4">Phone</th>
              <th class="px-6 py-4">Joined</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <template v-if="loading">
              <tr
                v-for="index in 6"
                :key="`teacher-skeleton-${index}`"
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
                  <div class="h-3 w-36 rounded-full bg-surface-muted" />
                </td>
                <td class="px-6 py-4">
                  <div class="h-3 w-24 rounded-full bg-surface-muted" />
                </td>
                <td class="px-6 py-4">
                  <div class="h-3 w-24 rounded-full bg-surface-muted" />
                </td>
                <td class="px-6 py-4">
                  <div class="h-3 w-20 rounded-full bg-surface-muted" />
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="ml-auto h-8 w-16 rounded-full bg-surface-muted" />
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="teacher in teacherRows"
                :key="teacher.id"
                class="transition hover:bg-surface-muted/70"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                      :style="{ backgroundColor: teacher.accentColor }"
                    >
                      {{ teacher.initials }}
                    </div>
                    <div>
                      <p class="font-semibold text-foreground">
                        {{ teacher.name }}
                      </p>
                      <p class="text-xs text-foreground-muted">
                        {{ teacher.subjectSpecialization || 'General' }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="font-medium text-foreground">
                    {{ teacher.classSectionLabel }}
                  </p>
                  <p class="text-xs text-foreground-muted">
                    {{ teacher.sectionLabel }}
                  </p>
                </td>
                <td class="px-6 py-4 font-mono text-sm text-foreground">
                  {{ teacher.email }}
                </td>
                <td class="px-6 py-4 text-foreground">
                  {{ teacher.employeeCode ?? '—' }}
                </td>
                <td class="px-6 py-4 text-foreground">
                  {{ teacher.phone ?? '—' }}
                </td>
                <td class="px-6 py-4 text-foreground-muted">
                  {{ teacher.joinedLabel }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="inline-flex gap-2">
                    <button
                      type="button"
                      class="btn-secondary px-3 py-1 text-xs"
                      @click="openEditDrawer(teacher)"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="btn-secondary px-3 py-1 text-xs text-destructive"
                      @click="confirmDelete(teacher)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="teacherRows.length === 0">
                <td
                  colspan="7"
                  class="px-6 py-10 text-center text-foreground-muted"
                >
                  No teachers match the current filters.
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
        <div class="ml-auto flex items-center gap-2">
          <button
            class="btn-secondary text-xs px-3 py-1.5"
            :disabled="page === 1 || loading"
            @click="page = Math.max(1, page - 1)"
          >
            ← Prev
          </button>
          <button
            class="btn-secondary text-xs px-3 py-1.5"
            :disabled="page >= totalPages || loading"
            @click="page = Math.min(totalPages, page + 1)"
          >
            Next →
          </button>
        </div>
      </footer>
    </section>

    <UserFormDrawer
      :open="drawerOpen"
      type="teacher"
      :initial="editingTeacher"
      :loading="formLoading"
      :error="formError"
      :class-options="classOptions"
      :section-options="sectionOptions"
      @close="closeDrawer"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import { useTeachers } from '~/composables/useTeachers';
import type { TeacherPayload } from '~/composables/useTeachers';
import type { ManagedUser } from '~/types/users';
import { resolveApiErrorMessage } from '~/utils/http';

const {
  teachers,
  loading,
  error,
  page,
  pageSize,
  search,
  total,
  totalPages,
  classFilter,
  sectionFilter,
  classOptions,
  sectionOptions,
  optionsLoading,
  optionsError,
  fetchClassroomOptions,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = useTeachers();

const actionError = ref<string | null>(null);
const drawerOpen = ref(false);
const editingTeacher = ref<ManagedUser | null>(null);
const formError = ref<string | null>(null);
const formLoading = ref(false);

const colorPalette = [
  '#6366F1',
  '#0EA5E9',
  '#22C55E',
  '#F97316',
  '#EC4899',
  '#06B6D4',
] as const;

const formatDate = (value: string | null) => {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(parsed);
};

const teacherRows = computed(() =>
  teachers.value.map((teacher) => {
    const initials =
      teacher.name
        .split(' ')
        .filter(Boolean)
        .map((chunk) => chunk[0]?.toUpperCase())
        .join('')
        .slice(0, 2) || 'LW';

    const accentColor =
      colorPalette[teacher.id % colorPalette.length] ?? colorPalette[0];

    const classSectionLabel = teacher.className
      ? `Class ${teacher.className}`
      : 'Unassigned';

    const sectionLabel = teacher.section
      ? `Section ${teacher.section}`
      : teacher.className
      ? 'No section'
      : 'Assign a class';

    return {
      ...teacher,
      initials,
      accentColor,
      classSectionLabel,
      sectionLabel,
      joinedLabel: formatDate(teacher.dateOfJoining),
    };
  })
);

const rangeStart = computed(() => {
  if (total.value === 0) {
    return 0;
  }

  return (page.value - 1) * pageSize.value + 1;
});

const rangeEnd = computed(() => {
  if (total.value === 0) {
    return 0;
  }

  return Math.min(page.value * pageSize.value, total.value);
});

const openCreateDrawer = () => {
  editingTeacher.value = null;
  formError.value = null;
  drawerOpen.value = true;
};

const openEditDrawer = (teacher: ManagedUser) => {
  editingTeacher.value = teacher;
  formError.value = null;
  drawerOpen.value = true;
};

const closeDrawer = () => {
  drawerOpen.value = false;
  editingTeacher.value = null;
  formError.value = null;
};

const handleFormSubmit = async (payload: Record<string, unknown>) => {
  formLoading.value = true;
  formError.value = null;
  actionError.value = null;

  try {
    if (editingTeacher.value) {
      await updateTeacher(
        editingTeacher.value.id,
        payload as Partial<TeacherPayload>
      );
    } else {
      await createTeacher(payload as TeacherPayload);
    }
    closeDrawer();
  } catch (cause) {
    formError.value = resolveApiErrorMessage(
      cause,
      editingTeacher.value
        ? 'Unable to update teacher'
        : 'Unable to create teacher'
    );
  } finally {
    formLoading.value = false;
  }
};

const confirmDelete = async (teacher: ManagedUser) => {
  const confirmed = window.confirm(
    `Delete ${teacher.name}? This cannot be undone.`
  );
  if (!confirmed) {
    return;
  }

  actionError.value = null;

  try {
    await deleteTeacher(teacher.id);
  } catch (cause) {
    actionError.value = resolveApiErrorMessage(
      cause,
      'Unable to delete teacher'
    );
    console.error('Failed to delete teacher', cause);
  }
};
</script>
