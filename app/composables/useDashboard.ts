import { computed, onMounted, ref } from 'vue';

import { useApi } from '~/composables/useApi';
import { resolveApiErrorMessage } from '~/utils/http';

export type DashboardSummary = {
  date: string;
  total: number;
  totals_by_status: Record<string, number>;
  present_percentage: number;
  weekly_trend?: Array<{
    date: string;
    total: number;
    totals_by_status: Record<string, number>;
  }>;
  chart?: {
    labels: string[];
    datasets: Array<Record<string, unknown>>;
  };
};

export type MonthlyAttendanceReport = {
  filters: {
    month: string;
    class_name: string | null;
    section: string | null;
  };
  summary: {
    total_records: number;
    totals_by_status: Record<string, number>;
  };
  daily_totals: Record<string, number>;
};

export const useDashboard = () => {
  const api = useApi();

  const summary = ref<DashboardSummary | null>(null);
  const summaryLoading = ref(false);
  const summaryError = ref<string | null>(null);

  const reportMonth = ref(new Date().toISOString().slice(0, 7));
  const monthlyReport = ref<MonthlyAttendanceReport | null>(null);
  const reportLoading = ref(false);
  const reportError = ref<string | null>(null);
  const exportError = ref<string | null>(null);
  const exporting = ref(false);

  const loadSummary = async () => {
    summaryLoading.value = true;
    summaryError.value = null;

    try {
      const response = await api.get('/dashboard/summary');
      summary.value = (response.data?.data ??
        response.data) as DashboardSummary;
    } catch (cause) {
      summaryError.value = resolveApiErrorMessage(
        cause,
        'Unable to load dashboard summary'
      );
      console.error('Failed to fetch dashboard summary', cause);
    } finally {
      summaryLoading.value = false;
    }
  };

  const loadMonthlyReport = async () => {
    reportLoading.value = true;
    reportError.value = null;

    try {
      const response = await api.get('/reports/attendance/monthly', {
        params: { month: reportMonth.value },
      });
      monthlyReport.value = (response.data?.data ??
        response.data) as MonthlyAttendanceReport;
    } catch (cause) {
      reportError.value = resolveApiErrorMessage(
        cause,
        'Unable to load monthly attendance report'
      );
      console.error('Failed to fetch monthly report', cause);
    } finally {
      reportLoading.value = false;
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadSummary(), loadMonthlyReport()]);
  };

  const exportMonthlyReport = async () => {
    exporting.value = true;
    exportError.value = null;

    try {
      const response = await api.get('/reports/attendance/monthly', {
        params: { month: reportMonth.value, format: 'csv' },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type:
          (response.headers?.['content-type'] as string | undefined) ??
          'text/csv;charset=utf-8',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const targetMonth = reportMonth.value.replace(/-/g, '_');
      link.download = `attendance_report_${targetMonth}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (cause) {
      exportError.value = resolveApiErrorMessage(
        cause,
        'Unable to export report'
      );
      console.error('Failed to export monthly report', cause);
    } finally {
      exporting.value = false;
    }
  };

  onMounted(() => {
    refreshAll();
  });

  const statusTotals = computed(() => summary.value?.totals_by_status ?? {});

  const highlightCards = computed(() => {
    const totals = statusTotals.value;
    return [
      {
        label: 'Students Marked',
        value: summary.value?.total ?? 0,
        subtext: 'Attendance captured today',
      },
      {
        label: 'Present',
        value: totals.present ?? 0,
        subtext: 'Students on time',
      },
      {
        label: 'Late',
        value: totals.late ?? 0,
        subtext: 'Need gentle follow-up',
      },
      {
        label: 'Absent',
        value: totals.absent ?? 0,
        subtext: 'Guardians to notify',
      },
    ];
  });

  const weeklyChart = computed(() => {
    if (!summary.value?.chart) {
      return { labels: [], datasets: [] };
    }

    const palette: Record<
      string,
      { borderColor: string; backgroundColor: string }
    > = {
      present: {
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
      },
      late: {
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
      },
      absent: {
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.15)',
      },
    };

    return {
      labels: summary.value.chart.labels,
      datasets: summary.value.chart.datasets.map((dataset) => {
        const label = String(
          (dataset.label as string | undefined) ?? ''
        ).toLowerCase();
        const fallback = palette[label] ?? {
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
        };

        return {
          tension: 0.4,
          borderColor: fallback.borderColor,
          backgroundColor: fallback.backgroundColor,
          ...dataset,
        };
      }),
    };
  });

  const monthlyStatusBreakdown = computed(() => {
    const summaryBlock = monthlyReport.value?.summary;

    if (!summaryBlock) {
      return [] as Array<{ label: string; value: number; percentage: number }>;
    }

    const totals = summaryBlock.totals_by_status ?? {};
    const totalRecords = summaryBlock.total_records || 1;

    return Object.entries(totals).map(([status, value]) => {
      const label = status.charAt(0).toUpperCase() + status.slice(1);

      return {
        label,
        value,
        percentage: Math.round(((value ?? 0) / totalRecords) * 100),
      };
    });
  });

  const monthlyTotals = computed(() => monthlyReport.value?.daily_totals ?? {});

  return {
    summary,
    summaryLoading,
    summaryError,
    reportMonth,
    monthlyReport,
    reportLoading,
    reportError,
    exporting,
    exportError,
    highlightCards,
    weeklyChart,
    monthlyStatusBreakdown,
    monthlyTotals,
    loadSummary,
    loadMonthlyReport,
    refreshAll,
    exportMonthlyReport,
  };
};
