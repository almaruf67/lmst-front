import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { mapApiUser } from '~/composables/useAdmins';
import { useApi } from '~/composables/useApi';
import type {
  ApiUser,
  PaginatedMeta,
  PaginatedUsersResponse,
} from '~/types/users';
import { resolveApiErrorMessage } from '~/utils/http';

export type TeacherPayload = {
  name: string;
  email: string;
  phone?: string | null;
  employee_code: string;
  class_name: string;
  section: string;
  password?: string;
  subject_specialization?: string | null;
  qualification?: string | null;
  date_of_joining?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
};

const INITIAL_OPTION = 'All';

const buildDefaultMeta = (): PaginatedMeta => ({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
});

export const useTeachers = () => {
  const api = useApi();

  const loading = ref(false);
  const error = ref<string | null>(null);
  const teachers = ref<ApiUser[]>([]);
  const managedTeachers = computed(() => teachers.value.map(mapApiUser));

  const page = ref(1);
  const pageSize = ref(10);
  const search = ref('');
  const meta = ref<PaginatedMeta>(buildDefaultMeta());

  const classFilter = ref<string>(INITIAL_OPTION);
  const sectionFilter = ref<string>(INITIAL_OPTION);
  const classOptions = ref<string[]>([INITIAL_OPTION]);
  const sectionOptions = ref<string[]>([INITIAL_OPTION]);
  const optionsLoading = ref(false);
  const optionsError = ref<string | null>(null);

  const total = computed(() => meta.value.total ?? teachers.value.length ?? 0);
  const totalPages = computed(() => Math.max(1, meta.value.last_page ?? 1));

  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  let requestId = 0;

  const buildParams = () => ({
    page: page.value,
    per_page: pageSize.value,
    search: search.value.trim() || undefined,
    class_name:
      classFilter.value !== INITIAL_OPTION ? classFilter.value : undefined,
    section:
      sectionFilter.value !== INITIAL_OPTION ? sectionFilter.value : undefined,
  });

  const fetchTeachers = async () => {
    requestId += 1;
    const currentRequest = requestId;
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/teachers', { params: buildParams() });
      if (currentRequest !== requestId) {
        return;
      }

      const payload = (response.data?.data ??
        response.data) as PaginatedUsersResponse;
      teachers.value = payload.users ?? [];
      const pagination = payload.meta ?? {};
      meta.value = {
        current_page: pagination.current_page ?? page.value,
        last_page: pagination.last_page ?? totalPages.value,
        per_page: pagination.per_page ?? pageSize.value,
        total: pagination.total ?? teachers.value.length,
      };
    } catch (cause) {
      if (currentRequest !== requestId) {
        return;
      }

      error.value = resolveApiErrorMessage(cause, 'Unable to load teachers');
      console.error('Failed to load teachers', cause);
    } finally {
      if (currentRequest === requestId) {
        loading.value = false;
      }
    }
  };

  const refresh = () => fetchTeachers();

  const scheduleSearch = () => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    searchTimer = setTimeout(() => {
      fetchTeachers();
    }, 350);
  };

  watch(search, () => {
    page.value = 1;
    scheduleSearch();
  });

  const handleFilterChange = () => {
    page.value = 1;
    fetchTeachers();
  };

  watch(classFilter, handleFilterChange);
  watch(sectionFilter, handleFilterChange);

  watch(page, (next, previous) => {
    if (next !== previous) {
      fetchTeachers();
    }
  });

  watch(pageSize, (next, previous) => {
    if (next !== previous) {
      page.value = 1;
      fetchTeachers();
    }
  });

  const fetchClassroomOptions = async () => {
    optionsLoading.value = true;
    optionsError.value = null;

    try {
      const response = await api.get('/teachers/options');
      const payload = (response.data?.data ?? response.data) as {
        classes?: string[];
        sections?: string[];
      };

      const nextClasses = Array.from(new Set(payload.classes ?? [])).sort(
        (a, b) => a.localeCompare(b, undefined, { numeric: true })
      );
      const nextSections = Array.from(new Set(payload.sections ?? [])).sort();

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

  onMounted(() => {
    fetchTeachers();
    fetchClassroomOptions();
  });

  onBeforeUnmount(() => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
  });

  const createTeacher = async (payload: TeacherPayload) => {
    await api.post('/teachers', payload);
    await fetchTeachers();
  };

  const updateTeacher = async (
    id: number,
    payload: Partial<TeacherPayload>
  ) => {
    await api.put(`/teachers/${id}`, payload);
    await fetchTeachers();
  };

  const deleteTeacher = async (id: number) => {
    await api.delete(`/teachers/${id}`);
    await fetchTeachers();
  };

  return {
    teachers: managedTeachers,
    rawTeachers: teachers,
    loading,
    error,
    page,
    pageSize,
    search,
    meta,
    total,
    totalPages,
    refresh,
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
  };
};
