<template>
  <div class="space-y-6">
    <PageToolbar
      eyebrow="Roster"
      title="Student Directory"
      description="Live data from the LMST API with filters, pagination, and teacher scoping."
    >
      <template #filters>
        <input
          v-model="search"
          type="search"
          placeholder="Search by name or ID"
          class="h-11 rounded-2xl border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <select
          v-model="classFilter"
          class="h-11 rounded-2xl border border-border bg-surface px-3 text-sm"
        >
          <option
            v-for="className in classOptions"
            :key="className"
            :value="className"
          >
            {{ className === 'All' ? 'All Classes' : 'Class ' + className }}
          </option>
        </select>
        <select
          v-model="sectionFilter"
          class="h-11 rounded-2xl border border-border bg-surface px-3 text-sm"
        >
          <option
            v-for="sectionName in sectionOptions"
            :key="sectionName"
            :value="sectionName"
          >
            {{
              sectionName === 'All' ? 'All Sections' : 'Section ' + sectionName
            }}
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
          class="btn-primary h-11 px-5 text-sm font-semibold"
          :disabled="actionLoading"
          @click="openCreateDrawer"
        >
          New Student
        </button>
        <button
          type="button"
          class="btn-secondary h-11 px-5 text-sm font-semibold"
          :disabled="loading"
          @click="refresh()"
        >
          Refresh
        </button>
        <button
          type="button"
          class="btn-secondary h-11 px-5 text-sm font-semibold"
          :disabled="exporting || loading"
          @click="downloadCsv"
        >
          <span v-if="exporting" class="inline-flex items-center gap-2">
            <span
              class="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Exporting…
          </span>
          <span v-else>Export CSV</span>
        </button>
        <div ref="columnMenuRef" class="relative">
          <button
            type="button"
            class="btn-secondary h-11 px-4 text-sm font-semibold"
            @click.stop="toggleColumnMenu"
          >
            Columns
          </button>
          <div
            v-if="showColumnMenu"
            class="absolute right-0 z-20 mt-2 w-60 rounded-2xl border border-border bg-surface p-3 shadow-lg"
          >
            <p
              class="mb-3 text-xs font-semibold uppercase text-foreground-muted"
            >
              Toggle Columns
            </p>
            <label
              v-for="option in columnOptions"
              :key="option.key"
              class="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm hover:bg-surface-muted"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                :checked="visibleColumns.includes(option.key)"
                :disabled="
                  visibleColumns.length === 1 &&
                  visibleColumns[0] === option.key
                "
                @change.stop="toggleColumn(option.key)"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>
      </template>
    </PageToolbar>

    <div
      v-if="activeFilters.length"
      class="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface-muted/60 px-4 py-3 text-sm"
    >
      <span class="text-foreground-muted">Active filters:</span>
      <button
        v-for="chip in activeFilters"
        :key="chip.key"
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-surface px-3 py-1 text-sm text-foreground"
        @click="chip.onClear()"
      >
        <span>{{ chip.label }}</span>
        <span class="text-xs text-foreground-muted">✕</span>
      </button>
      <button
        type="button"
        class="ml-auto text-xs font-semibold uppercase tracking-wide text-primary"
        @click="clearAllFilters"
      >
        Clear all
      </button>
    </div>

    <div
      v-if="error"
      class="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ error }}
    </div>

    <div
      v-if="exportError"
      class="rounded-2xl border border-amber-300/40 bg-amber-100/40 px-4 py-3 text-sm text-amber-900"
    >
      {{ exportError }}
    </div>

    <div
      v-if="actionError"
      class="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ actionError }}
    </div>

    <StudentList
      :students="students"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :loading="loading"
      :action-loading="actionLoading"
      :columns="columnVisibility"
      @change-page="(next) => (page = next)"
      @edit-student="openEditDrawer"
      @delete-student="confirmDelete"
    />

    <StudentFormDrawer
      :open="drawerOpen"
      :loading="actionLoading"
      :error="formError"
      :initial="editingStudent"
      :class-options="classOptions"
      :section-options="sectionOptions"
      :teacher-options="teacherOptions"
      :upload-progress="uploadProgress"
      @close="closeDrawer"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script lang="ts" setup>
import type {
  StudentListItem,
  StudentPayload,
  UpdateStudentPayload,
} from '~/composables/useStudents';
import { resolveApiErrorMessage } from '~/utils/http';

const studentsApi = useStudents();

const {
  students,
  total,
  page,
  pageSize,
  search,
  classFilter,
  sectionFilter,
  classOptions,
  sectionOptions,
  loading,
  error,
  actionLoading,
  actionError,
  refresh,
  currentParams,
  hydrateFromQuery,
  resetFilters,
  teacherOptions,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadProgress,
} = studentsApi;

const route = useRoute();
const router = useRouter();
const api = useApi();
const suppressQuerySync = ref(false);
const drawerOpen = ref(false);
const editingStudent = ref<StudentListItem | null>(null);
const formError = ref<string | null>(null);

const columnOptions = [
  { key: 'studentId', label: 'Student ID' },
  { key: 'classSection', label: 'Class & Section' },
  { key: 'primaryTeacher', label: 'Primary Teacher' },
  { key: 'lastUpdated', label: 'Last Updated' },
] as const;

const visibleColumns = ref(columnOptions.map((option) => option.key));
const showColumnMenu = ref(false);
const columnMenuRef = ref<HTMLElement | null>(null);

const toggleColumnMenu = () => {
  showColumnMenu.value = !showColumnMenu.value;
};

const toggleColumn = (key: (typeof columnOptions)[number]['key']) => {
  if (visibleColumns.value.includes(key)) {
    if (visibleColumns.value.length === 1) {
      return;
    }

    visibleColumns.value = visibleColumns.value.filter(
      (column) => column !== key
    );
    return;
  }

  visibleColumns.value = [...visibleColumns.value, key];
};

const handleDocumentClick = (event: MouseEvent) => {
  if (!columnMenuRef.value) {
    return;
  }

  if (!columnMenuRef.value.contains(event.target as Node)) {
    showColumnMenu.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleDocumentClick));
onBeforeUnmount(() =>
  document.removeEventListener('click', handleDocumentClick)
);

const columnVisibility = computed(() => ({
  studentId: visibleColumns.value.includes('studentId'),
  classSection: visibleColumns.value.includes('classSection'),
  primaryTeacher: visibleColumns.value.includes('primaryTeacher'),
  lastUpdated: visibleColumns.value.includes('lastUpdated'),
}));

const normalizeRouteQuery = (
  query: Record<string, string | string[] | null | undefined>
) => {
  const normalized: Record<string, string> = {};

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0 && value[0]) {
        normalized[key] = value[0];
      }
    } else if (typeof value === 'string' && value.length > 0) {
      normalized[key] = value;
    }
  });

  return normalized;
};

const buildQueryFromState = () => {
  const query: Record<string, string> = {};
  const trimmedSearch = search.value.trim();

  if (trimmedSearch.length > 0) {
    query.search = trimmedSearch;
  }

  if (classFilter.value !== 'All') {
    query.class = classFilter.value;
  }

  if (sectionFilter.value !== 'All') {
    query.section = sectionFilter.value;
  }

  if (page.value > 1) {
    query.page = String(page.value);
  }

  if (![10, 20, 50].includes(pageSize.value)) {
    query.per_page = String(pageSize.value);
  } else if (pageSize.value !== 10) {
    query.per_page = String(pageSize.value);
  }

  return query;
};

const queriesEqual = (a: Record<string, string>, b: Record<string, string>) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  return Array.from(keys).every((key) => (a[key] ?? '') === (b[key] ?? ''));
};

const syncRouteQuery = () => {
  const nextQuery = buildQueryFromState();
  const currentQuery = normalizeRouteQuery(
    route.query as Record<string, string | string[]>
  );

  if (!queriesEqual(nextQuery, currentQuery)) {
    router.replace({ query: nextQuery });
  }
};

watch(
  () => ({
    search: search.value,
    class: classFilter.value,
    section: sectionFilter.value,
    page: page.value,
    per_page: pageSize.value,
  }),
  () => {
    if (suppressQuerySync.value) {
      return;
    }

    syncRouteQuery();
  }
);

watch(
  () => route.query,
  (next) => {
    const normalized = normalizeRouteQuery(
      next as Record<string, string | string[]>
    );
    const target = buildQueryFromState();

    if (!queriesEqual(normalized, target)) {
      suppressQuerySync.value = true;
      hydrateFromQuery({
        search: normalized.search,
        class: normalized.class,
        section: normalized.section,
        page: normalized.page,
        per_page: normalized.per_page,
      });
      suppressQuerySync.value = false;
    }
  }
);

onMounted(() => {
  const normalized = normalizeRouteQuery(
    route.query as Record<string, string | string[]>
  );
  suppressQuerySync.value = true;
  hydrateFromQuery({
    search: normalized.search,
    class: normalized.class,
    section: normalized.section,
    page: normalized.page,
    per_page: normalized.per_page,
  });
  suppressQuerySync.value = false;
});

const activeFilters = computed(() => {
  const chips: Array<{ key: string; label: string; onClear: () => void }> = [];
  const trimmedSearch = search.value.trim();

  if (trimmedSearch.length > 0) {
    chips.push({
      key: 'search',
      label: `Search: “${trimmedSearch}”`,
      onClear: () => {
        search.value = '';
      },
    });
  }

  if (classFilter.value !== 'All') {
    chips.push({
      key: 'class',
      label: `Class ${classFilter.value}`,
      onClear: () => {
        classFilter.value = 'All';
      },
    });
  }

  if (sectionFilter.value !== 'All') {
    chips.push({
      key: 'section',
      label: `Section ${sectionFilter.value}`,
      onClear: () => {
        sectionFilter.value = 'All';
      },
    });
  }

  return chips;
});

const clearAllFilters = () => {
  resetFilters();
};

const openCreateDrawer = () => {
  editingStudent.value = null;
  formError.value = null;
  actionError.value = null;
  drawerOpen.value = true;
};

const openEditDrawer = (student: StudentListItem) => {
  editingStudent.value = student;
  formError.value = null;
  actionError.value = null;
  drawerOpen.value = true;
};

const closeDrawer = () => {
  drawerOpen.value = false;
  editingStudent.value = null;
  formError.value = null;
};

const handleFormSubmit = async (payload: StudentPayload) => {
  formError.value = null;
  actionError.value = null;

  try {
    if (editingStudent.value) {
      await updateStudent(
        editingStudent.value.id,
        payload as UpdateStudentPayload
      );
    } else {
      await createStudent(payload);
    }
    closeDrawer();
  } catch (cause) {
    formError.value = resolveApiErrorMessage(
      cause,
      editingStudent.value
        ? 'Unable to update student'
        : 'Unable to create student'
    );
    console.error('Failed to save student', cause);
    actionError.value = null;
  }
};

const exporting = ref(false);
const exportError = ref<string | null>(null);

const sanitizedParams = (params: Record<string, unknown>) => {
  const cleaned: Record<string, string | number> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    cleaned[key] = value as string | number;
  });

  return cleaned;
};

const downloadCsv = async () => {
  exporting.value = true;
  exportError.value = null;

  try {
    const response = await api.get('/students', {
      params: {
        ...sanitizedParams(currentParams.value),
        format: 'csv',
      },
      responseType: 'blob',
      headers: {
        Accept: 'text/csv',
      },
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (cause) {
    console.error('Failed to export students CSV', cause);
    exportError.value =
      'Unable to export students right now. Please try again after the export endpoint is available.';
  } finally {
    exporting.value = false;
  }
};

const confirmDelete = async (student: StudentListItem) => {
  const confirmed = window.confirm(
    `Delete ${student.name}? This cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  actionError.value = null;

  try {
    await deleteStudent(student.id);
  } catch (cause) {
    actionError.value = resolveApiErrorMessage(
      cause,
      'Unable to delete student'
    );
    console.error('Failed to delete student', cause);
  }
};
</script>
