import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { isAxiosError } from 'axios';

import { useApi } from '~/composables/useApi';

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

export type StudentListItem = {
  id: number;
  name: string;
  studentCode: string;
  className: string | null;
  section: string | null;
  primaryTeacher: string | null;
  photoUrl: string | null;
  initials: string;
  accentColor: string;
  updatedAt: string | null;
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

export const useStudents = () => {
  const api = useApi();

  const loading = ref(false);
  const error = ref<string | null>(null);
  const students = ref<StudentListItem[]>([]);

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
      photoUrl: student.photo_url ?? null,
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
    fetchStudents();
  });

  watch(pageSize, () => {
    page.value = 1;
    fetchStudents();
  });

  watch(page, (next, previous) => {
    if (next !== previous) {
      fetchStudents();
    }
  });

  onMounted(() => {
    fetchStudents();
  });

  onBeforeUnmount(() => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
  });

  const refresh = () => fetchStudents();

  return {
    students,
    loading,
    error,
    total,
    page,
    pageSize,
    currentRangeStart,
    currentRangeEnd,
    classFilter,
    sectionFilter,
    classOptions,
    sectionOptions,
    search,
    refresh,
    totalPages,
  };
};
