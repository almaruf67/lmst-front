import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { isAxiosError, type AxiosProgressEvent } from 'axios';

import { useApi } from '~/composables/useApi';
import { resolveApiErrorMessage } from '~/utils/http';

type ApiStudent = {
  id: number;
  name: string;
  student_id: string;
  class_name?: string | null;
  section?: string | null;
  photo_url?: string | null;
  primary_teacher?: {
    id?: number;
    name?: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type PaginatedMeta = {
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
};

type StudentsResponse = {
  students?: ApiStudent[];
  meta?: PaginatedMeta;
};

type ClassroomOptionsResponse = {
  classes?: string[];
  sections?: string[];
};

type TeacherOption = {
  id: number;
  name: string;
  class_name?: string | null;
  section?: string | null;
};

export type StudentListItem = {
  id: number;
  name: string;
  studentCode: string;
  className: string | null;
  section: string | null;
  primaryTeacher: string | null;
  primaryTeacherId: number | null;
  photoUrl: string | null;
  initials: string;
  accentColor: string;
  updatedAt: string | null;
  notes: string | null;
};

const colorPalette = [
  '#6366F1',
  '#0EA5E9',
  '#22C55E',
  '#F97316',
  '#EC4899',
  '#06B6D4',
] as const;

const INITIAL_OPTION = 'All';

export type StudentPayload = {
  name: string;
  student_id: string;
  class_name: string;
  section?: string | null;
  notes?: string | null;
  primary_teacher_id?: number | null;
  photo?: File | null;
};

export type UpdateStudentPayload = Partial<StudentPayload> & {
  name?: string;
  student_id?: string;
};

export const useStudents = () => {
  const api = useApi();

  const loading = ref(false);
  const error = ref<string | null>(null);
  const students = ref<StudentListItem[]>([]);
  const actionLoading = ref(false);
  const actionError = ref<string | null>(null);

  const classFilter = ref<string>(INITIAL_OPTION);
  const sectionFilter = ref<string>(INITIAL_OPTION);
  const search = ref<string>('');
  const page = ref(1);
  const pageSize = ref(10);
  const meta = ref<PaginatedMeta>({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });
  const classOptions = ref<string[]>([INITIAL_OPTION]);
  const sectionOptions = ref<string[]>([INITIAL_OPTION]);
  const endpointPreference = ref<'all' | 'mine'>('all');
  const autoFetchPaused = ref(false);
  const optionsLoading = ref(false);
  const optionsError = ref<string | null>(null);
  const teacherOptionsLoading = ref(false);
  const teacherOptionsError = ref<string | null>(null);
  const teacherOptions = ref<TeacherOption[]>([]);
  const uploadProgress = ref(0);

  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  let requestId = 0;

  const total = computed(() => meta.value.total ?? 0);
  const totalPages = computed(() => Math.max(1, meta.value.last_page ?? 1));

  const currentRangeStart = computed(() => {
    if (total.value === 0) {
      return 0;
    }

    return (page.value - 1) * pageSize.value + 1;
  });

  const currentRangeEnd = computed(() => {
    if (total.value === 0) {
      return 0;
    }

    return Math.min(page.value * pageSize.value, total.value);
  });

  const transformStudent = (student: ApiStudent): StudentListItem => {
    const initials = student.name
      ? student.name
          .split(' ')
          .filter(Boolean)
          .map((part) => part[0]?.toUpperCase())
          .join('')
          .slice(0, 2)
      : 'ST';

    const paletteIndex = student.id % colorPalette.length;
    const accentColor = colorPalette[paletteIndex] ?? colorPalette[0];

    return {
      id: student.id,
      name: student.name,
      studentCode: student.student_id,
      className: student.class_name ?? null,
      section: student.section ?? null,
      primaryTeacher: student.primary_teacher?.name ?? null,
      primaryTeacherId: student.primary_teacher?.id ?? null,
      photoUrl: student.photo_url ?? null,
      notes: (student as { notes?: string | null })?.notes ?? null,
      initials: initials || 'ST',
      accentColor,
      updatedAt: student.updated_at ?? student.created_at ?? null,
    };
  };

  const syncFilterOptions = (payload: ApiStudent[]): void => {
    const nextClasses = new Set(classOptions.value);
    const nextSections = new Set(sectionOptions.value);

    payload.forEach((student) => {
      if (student.class_name) {
        nextClasses.add(student.class_name);
      }
      if (student.section) {
        nextSections.add(student.section);
      }
    });

    classOptions.value = Array.from(nextClasses).sort((a, b) => {
      if (a === INITIAL_OPTION) return -1;
      if (b === INITIAL_OPTION) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });

    sectionOptions.value = Array.from(nextSections).sort((a, b) => {
      if (a === INITIAL_OPTION) return -1;
      if (b === INITIAL_OPTION) return 1;
      return a.localeCompare(b);
    });
  };

  const buildParams = () => {
    return {
      page: page.value,
      per_page: pageSize.value,
      search: search.value.trim() || undefined,
      class_name:
        classFilter.value !== INITIAL_OPTION ? classFilter.value : undefined,
      section:
        sectionFilter.value !== INITIAL_OPTION
          ? sectionFilter.value
          : undefined,
    };
  };

  const resolveEndpoint = () =>
    endpointPreference.value === 'all' ? '/students' : '/my-students';

  const currentParams = computed(() => buildParams());

  const fetchStudents = async () => {
    requestId += 1;
    const currentRequest = requestId;
    loading.value = true;
    error.value = null;

    try {
      const endpoint = resolveEndpoint();
      const response = await api.get(endpoint, {
        params: buildParams(),
      });

      if (currentRequest !== requestId) {
        return;
      }

      const payload = (response.data?.data ??
        response.data) as StudentsResponse;
      const rawStudents = payload.students ?? [];
      students.value = rawStudents.map(transformStudent);
      syncFilterOptions(rawStudents);

      const pagination = payload.meta ?? {};
      meta.value = {
        current_page: pagination.current_page ?? page.value,
        last_page: pagination.last_page ?? totalPages.value,
        per_page: pagination.per_page ?? pageSize.value,
        total: pagination.total ?? rawStudents.length,
      };
    } catch (cause) {
      if (
        isAxiosError(cause) &&
        cause.response?.status === 403 &&
        endpointPreference.value === 'all'
      ) {
        endpointPreference.value = 'mine';
        await fetchStudents();
        return;
      }

      const message = isAxiosError(cause)
        ? cause.response?.data?.message ?? 'Unable to load students'
        : 'Unable to load students';

      error.value = message;
      console.error('Failed to load students', cause);
    } finally {
      if (currentRequest === requestId) {
        loading.value = false;
      }
    }
  };

  const scheduleSearch = () => {
    if (autoFetchPaused.value) {
      return;
    }

    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    searchTimer = setTimeout(() => {
      fetchStudents();
    }, 350);
  };

  watch(search, () => {
    page.value = 1;
    scheduleSearch();
  });

  watch([classFilter, sectionFilter], () => {
    page.value = 1;
    if (autoFetchPaused.value) {
      return;
    }

    fetchStudents();
  });

  watch(pageSize, () => {
    page.value = 1;
    if (autoFetchPaused.value) {
      return;
    }

    fetchStudents();
  });

  watch(page, (next, previous) => {
    if (next !== previous) {
      if (autoFetchPaused.value) {
        return;
      }

      fetchStudents();
    }
  });

  onMounted(() => {
    fetchStudents();
    fetchClassroomOptions();
    fetchTeacherOptions();
  });

  onBeforeUnmount(() => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
  });

  const refresh = () => fetchStudents();

  const hydrateFromQuery = (
    params: Partial<
      Record<'search' | 'class' | 'section' | 'page' | 'per_page', string>
    >
  ) => {
    autoFetchPaused.value = true;

    if (typeof params.search === 'string') {
      search.value = params.search;
    }

    if (typeof params.class === 'string' && params.class.length > 0) {
      classFilter.value = params.class;
    }

    if (typeof params.section === 'string' && params.section.length > 0) {
      sectionFilter.value = params.section;
    }

    if (typeof params.page === 'string') {
      const parsedPage = Number.parseInt(params.page, 10);
      if (!Number.isNaN(parsedPage) && parsedPage > 0) {
        page.value = parsedPage;
      }
    }

    if (typeof params.per_page === 'string') {
      const parsedSize = Number.parseInt(params.per_page, 10);
      if (!Number.isNaN(parsedSize) && parsedSize > 0) {
        pageSize.value = parsedSize;
      }
    }

    autoFetchPaused.value = false;
    fetchStudents();
  };

  const resetFilters = () => {
    autoFetchPaused.value = true;
    search.value = '';
    classFilter.value = INITIAL_OPTION;
    sectionFilter.value = INITIAL_OPTION;
    page.value = 1;
    autoFetchPaused.value = false;
    fetchStudents();
  };

  const fetchClassroomOptions = async () => {
    optionsLoading.value = true;
    optionsError.value = null;

    try {
      const response = await api.get('/teachers/options');
      const payload = (response.data?.data ??
        response.data) as ClassroomOptionsResponse;
      const nextClasses = Array.from(new Set(payload.classes ?? [])).sort(
        (a, b) => a.localeCompare(b, undefined, { numeric: true })
      );
      const nextSections = Array.from(new Set(payload.sections ?? [])).sort(
        (a, b) => a.localeCompare(b)
      );

      classOptions.value = [INITIAL_OPTION, ...nextClasses];
      sectionOptions.value = [INITIAL_OPTION, ...nextSections];
    } catch (cause) {
      optionsError.value = resolveApiErrorMessage(
        cause,
        'Unable to load classroom options'
      );
      console.error('Failed to load classroom options', cause);
    } finally {
      optionsLoading.value = false;
    }
  };

  const fetchTeacherOptions = async () => {
    teacherOptionsLoading.value = true;
    teacherOptionsError.value = null;

    try {
      const response = await api.get('/teachers', {
        params: {
          per_page: 100,
        },
      });

      const payload = (response.data?.data ?? response.data) as {
        users?: Array<{
          id: number;
          name: string;
          class_name?: string | null;
          section?: string | null;
        }>;
      };

      teacherOptions.value = (payload.users ?? []).map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        class_name: teacher.class_name ?? null,
        section: teacher.section ?? null,
      }));
    } catch (cause) {
      teacherOptionsError.value = resolveApiErrorMessage(
        cause,
        'Unable to load teacher options'
      );
      console.error('Failed to load teacher options', cause);
    } finally {
      teacherOptionsLoading.value = false;
    }
  };

  const trackUploadProgress = (event: AxiosProgressEvent) => {
    if (!event.total) {
      uploadProgress.value = 100;
      return;
    }

    uploadProgress.value = Math.round((event.loaded / event.total) * 100);
  };

  const resetUploadProgress = () => {
    uploadProgress.value = 0;
  };

  const buildFormData = (payload: Record<string, unknown>): FormData => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      if (value === null) {
        formData.append(key, '');
        return;
      }

      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      formData.append(key, String(value));
    });

    return formData;
  };

  const createStudent = async (payload: StudentPayload) => {
    actionLoading.value = true;
    actionError.value = null;
    resetUploadProgress();

    try {
      const formData = buildFormData(payload);
      await api.post('/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: trackUploadProgress,
      });
      await fetchStudents();
    } catch (cause) {
      actionError.value = resolveApiErrorMessage(
        cause,
        'Unable to create student'
      );
      console.error('Failed to create student', cause);
      throw cause;
    } finally {
      actionLoading.value = false;
      resetUploadProgress();
    }
  };

  const updateStudent = async (id: number, payload: UpdateStudentPayload) => {
    actionLoading.value = true;
    actionError.value = null;
    resetUploadProgress();

    try {
      const formData = buildFormData(payload);
      formData.append('_method', 'PUT');
      await api.post(`/students/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: trackUploadProgress,
      });
      await fetchStudents();
    } catch (cause) {
      actionError.value = resolveApiErrorMessage(
        cause,
        'Unable to update student'
      );
      console.error('Failed to update student', cause);
      throw cause;
    } finally {
      actionLoading.value = false;
      resetUploadProgress();
    }
  };

  const deleteStudent = async (id: number) => {
    actionLoading.value = true;
    actionError.value = null;

    try {
      await api.delete(`/students/${id}`);
      await fetchStudents();
    } catch (cause) {
      actionError.value = resolveApiErrorMessage(
        cause,
        'Unable to delete student'
      );
      console.error('Failed to delete student', cause);
      throw cause;
    } finally {
      actionLoading.value = false;
    }
  };

  return {
    students,
    loading,
    error,
    actionLoading,
    actionError,
    total,
    page,
    pageSize,
    currentRangeStart,
    currentRangeEnd,
    classFilter,
    sectionFilter,
    classOptions,
    sectionOptions,
    teacherOptions,
    optionsLoading,
    optionsError,
    teacherOptionsLoading,
    teacherOptionsError,
    uploadProgress,
    search,
    refresh,
    totalPages,
    currentParams,
    hydrateFromQuery,
    resetFilters,
    fetchClassroomOptions,
    fetchTeacherOptions,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};
