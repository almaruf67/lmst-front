import { computed, onMounted, ref, watch } from 'vue';

import { useApi } from '~/composables/useApi';
import { useAttendanceStore, type AttendanceStatus } from '~/stores/attendance';
import { resolveApiErrorMessage } from '~/utils/http';

type ApiStudent = {
  id: number;
  name: string;
  student_id: string;
  class_name?: string | null;
  section?: string | null;
};

type StudentsResponse = {
  students?: ApiStudent[];
  meta?: {
    current_page?: number;
    last_page?: number;
  };
};

type DashboardSummary = {
  date: string;
  total: number;
  totals_by_status: Record<AttendanceStatus, number>;
  present_percentage: number;
  weekly_trend?: Record<string, number>;
};

type MonthlyReport = {
  filters: {
    month: string;
    class_name: string | null;
    section: string | null;
  };
  summary: {
    total_records: number;
    totals_by_status: Record<AttendanceStatus, number>;
  };
  daily_totals: Record<string, number>;
};

const defaultSummary: Record<AttendanceStatus, number> = {
  present: 0,
  absent: 0,
  late: 0,
};

export const useAttendance = () => {
  const api = useApi();
  const store = useAttendanceStore();

  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedStudents = ref<number[]>([]);
  const saving = ref(false);
  const actionError = ref<string | null>(null);
  const actionSuccess = ref<string | null>(null);

  const dashboardSummary = ref<DashboardSummary | null>(null);
  const summaryLoading = ref(false);
  const summaryError = ref<string | null>(null);

  const reportMonth = ref<string>(new Date().toISOString().slice(0, 7));
  const monthlyReport = ref<MonthlyReport | null>(null);
  const reportLoading = ref(false);
  const reportError = ref<string | null>(null);

  const fetchStudentsPage = async (page = 1): Promise<StudentsResponse> => {
    const response = await api.get('/students', {
      params: {
        page,
        per_page: 200,
      },
    });

    return (response.data?.data ?? response.data) as StudentsResponse;
  };

  const loadRecords = async () => {
    loading.value = true;
    error.value = null;

    try {
      let page = 1;
      let lastPage = 1;
      const roster: ApiStudent[] = [];

      do {
        const payload = await fetchStudentsPage(page);
        roster.push(...(payload.students ?? []));
        lastPage = payload.meta?.last_page ?? 1;
        page += 1;
      } while (page <= lastPage);

      const data = roster.map((student) => ({
        id: student.id,
        name: student.name,
        className: student.class_name ?? null,
        section: student.section ?? null,
        status: 'present' as AttendanceStatus,
      }));

      store.setRecords(data);
    } catch (cause) {
      error.value = resolveApiErrorMessage(
        cause,
        'Unable to load students for attendance'
      );
      console.error('Failed to load attendance roster', cause);
    } finally {
      loading.value = false;
    }
  };

  const buildFilterMatch = (
    recordClass: string | null,
    recordSection: string | null
  ) => {
    const matchesClass =
      store.selectedClass === 'All' || recordClass === store.selectedClass;
    const matchesSection =
      store.selectedSection === 'All' ||
      recordSection === store.selectedSection;
    return matchesClass && matchesSection;
  };

  const filteredRecords = computed(() => {
    return store.records.filter((record) =>
      buildFilterMatch(record.className, record.section)
    );
  });

  const toggleSelection = (studentId: number) => {
    if (selectedStudents.value.includes(studentId)) {
      selectedStudents.value = selectedStudents.value.filter(
        (id) => id !== studentId
      );
    } else {
      selectedStudents.value = [...selectedStudents.value, studentId];
    }
  };

  const selectAllVisible = () => {
    selectedStudents.value = filteredRecords.value.map((record) => record.id);
  };

  const clearSelection = () => {
    selectedStudents.value = [];
  };

  const markStatus = (studentId: number, status: AttendanceStatus) => {
    store.updateRecord(studentId, status);
  };

  const bulkMarkStatus = (status: AttendanceStatus) => {
    store.bulkUpdate(selectedStudents.value, status);
    clearSelection();
  };

  const loadDashboardSummary = async () => {
    summaryLoading.value = true;
    summaryError.value = null;

    try {
      const response = await api.get('/dashboard/summary');
      dashboardSummary.value = (response.data?.data ??
        response.data) as DashboardSummary;
    } catch (cause) {
      summaryError.value = resolveApiErrorMessage(
        cause,
        'Unable to load dashboard summary'
      );
      console.error('Failed to load attendance dashboard summary', cause);
    } finally {
      summaryLoading.value = false;
    }
  };

  const loadMonthlyReport = async () => {
    reportLoading.value = true;
    reportError.value = null;

    const params: Record<string, string> = {
      month: reportMonth.value,
    };

    if (store.selectedClass !== 'All') {
      params.class_name = store.selectedClass;
    }

    if (store.selectedSection !== 'All') {
      params.section = store.selectedSection;
    }

    try {
      const response = await api.get('/reports/attendance/monthly', { params });
      monthlyReport.value = (response.data?.data ??
        response.data) as MonthlyReport;
    } catch (cause) {
      reportError.value = resolveApiErrorMessage(
        cause,
        'Unable to load monthly attendance report'
      );
      console.error('Failed to load monthly report', cause);
    } finally {
      reportLoading.value = false;
    }
  };

  const saveAttendance = async () => {
    saving.value = true;
    actionError.value = null;
    actionSuccess.value = null;

    try {
      const payload = {
        attendance_date: store.date,
        records: store.records.map((record) => ({
          student_id: record.id,
          status: record.status,
        })),
      };

      await api.post('/attendance/bulk', payload);
      actionSuccess.value = 'Attendance saved successfully';

      await Promise.all([loadDashboardSummary(), loadMonthlyReport()]);
    } catch (cause) {
      actionError.value = resolveApiErrorMessage(
        cause,
        'Unable to save attendance'
      );
      console.error('Failed to save attendance', cause);
    } finally {
      saving.value = false;
    }
  };

  const summaryTotals = computed(
    () => dashboardSummary.value?.totals_by_status ?? store.statusSummary
  );
  const summaryPercentage = computed(
    () =>
      dashboardSummary.value?.present_percentage ?? store.attendancePercentage
  );
  const monthlyTotals = computed(
    () => monthlyReport.value?.summary.totals_by_status ?? defaultSummary
  );
  const monthlyTotalRecords = computed(
    () => monthlyReport.value?.summary.total_records ?? 0
  );

  watch(
    () => [store.selectedClass, store.selectedSection],
    () => {
      if (!loading.value) {
        loadMonthlyReport();
      }
    }
  );

  watch(reportMonth, () => {
    loadMonthlyReport();
  });

  onMounted(async () => {
    await loadRecords();
    await Promise.all([loadDashboardSummary(), loadMonthlyReport()]);
  });

  return {
    loading,
    error,
    store,
    filteredRecords,
    selectedStudents,
    summaryTotals,
    summaryPercentage,
    monthlyReport,
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
    refresh: loadRecords,
    loadMonthlyReport,
  };
};
