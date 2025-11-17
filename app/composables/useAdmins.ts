import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { useApi } from '~/composables/useApi';
import type {
  ApiUser,
  ManagedUser,
  PaginatedMeta,
  PaginatedUsersResponse,
} from '~/types/users';
import { resolveApiErrorMessage } from '~/utils/http';

export const mapApiUser = (user: ApiUser): ManagedUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  userType: user.user_type,
  phone: user.phone ?? null,
  employeeCode: user.employee_code ?? null,
  className: user.class_name ?? null,
  section: user.section ?? null,
  subjectSpecialization: user.subject_specialization ?? null,
  qualification: user.qualification ?? null,
  dateOfJoining: user.date_of_joining ?? null,
  emergencyContactName: user.emergency_contact_name ?? null,
  emergencyContactPhone: user.emergency_contact_phone ?? null,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

export type AdminPayload = {
  name: string;
  email: string;
  phone?: string | null;
  employee_code?: string | null;
  password?: string;
};

const buildDefaultMeta = (): PaginatedMeta => ({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
});

export const useAdmins = () => {
  const api = useApi();

  const loading = ref(false);
  const error = ref<string | null>(null);
  const admins = ref<ApiUser[]>([]);
  const managedAdmins = computed(() => admins.value.map(mapApiUser));

  const page = ref(1);
  const pageSize = ref(10);
  const search = ref('');
  const meta = ref<PaginatedMeta>(buildDefaultMeta());

  const total = computed(() => meta.value.total ?? admins.value.length ?? 0);
  const totalPages = computed(() => Math.max(1, meta.value.last_page ?? 1));

  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  let requestId = 0;

  const buildParams = () => ({
    page: page.value,
    per_page: pageSize.value,
    search: search.value.trim() || undefined,
  });

  const fetchAdmins = async () => {
    requestId += 1;
    const currentRequest = requestId;
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/admins', { params: buildParams() });
      if (currentRequest !== requestId) {
        return;
      }

      const payload = (response.data?.data ??
        response.data) as PaginatedUsersResponse;
      admins.value = payload.users ?? [];
      const pagination = payload.meta ?? {};
      meta.value = {
        current_page: pagination.current_page ?? page.value,
        last_page: pagination.last_page ?? totalPages.value,
        per_page: pagination.per_page ?? pageSize.value,
        total: pagination.total ?? admins.value.length,
      };
    } catch (cause) {
      if (currentRequest !== requestId) {
        return;
      }

      error.value = resolveApiErrorMessage(cause, 'Unable to load admins');
      console.error('Failed to load admins', cause);
    } finally {
      if (currentRequest === requestId) {
        loading.value = false;
      }
    }
  };

  const refresh = () => fetchAdmins();

  const scheduleSearch = () => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    searchTimer = setTimeout(() => {
      fetchAdmins();
    }, 350);
  };

  watch(search, () => {
    page.value = 1;
    scheduleSearch();
  });

  watch(page, (next, previous) => {
    if (next !== previous) {
      fetchAdmins();
    }
  });

  watch(pageSize, (next, previous) => {
    if (next !== previous) {
      page.value = 1;
      fetchAdmins();
    }
  });

  onMounted(fetchAdmins);
  onBeforeUnmount(() => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
  });

  const createAdmin = async (payload: AdminPayload) => {
    await api.post('/admins', payload);
    await fetchAdmins();
  };

  const updateAdmin = async (id: number, payload: Partial<AdminPayload>) => {
    await api.put(`/admins/${id}`, payload);
    await fetchAdmins();
  };

  const deleteAdmin = async (id: number) => {
    await api.delete(`/admins/${id}`);
    await fetchAdmins();
  };

  return {
    admins: managedAdmins,
    rawAdmins: admins,
    loading,
    error,
    page,
    pageSize,
    search,
    meta,
    total,
    totalPages,
    refresh,
    createAdmin,
    updateAdmin,
    deleteAdmin,
  };
};
