import { defineStore } from 'pinia';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: number;
  name: string;
  className: string | null;
  section: string | null;
  status: AttendanceStatus;
}

const summaryTemplate: Record<AttendanceStatus, number> = {
  present: 0,
  absent: 0,
  late: 0,
};

export const useAttendanceStore = defineStore('attendance', () => {
  const date = ref<string>(new Date().toISOString().slice(0, 10));
  const records = ref<AttendanceRecord[]>([]);
  const selectedClass = ref<string>('All');
  const selectedSection = ref<string>('All');

  const totalCount = computed(() =>
    records.value.length === 0 ? 1 : records.value.length
  );
  const statusSummary = computed(() => {
    return records.value.reduce(
      (acc, record) => {
        acc[record.status] += 1;
        return acc;
      },
      { ...summaryTemplate }
    );
  });

  const attendancePercentage = computed(() => {
    const presentCount = statusSummary.value.present;
    return Math.round((presentCount / totalCount.value) * 100);
  });

  const setRecords = (payload: AttendanceRecord[]) => {
    records.value = payload;
  };

  const updateRecord = (studentId: number, status: AttendanceStatus) => {
    records.value = records.value.map((record) =>
      record.id === studentId ? { ...record, status } : record
    );
  };

  const bulkUpdate = (studentIds: number[], status: AttendanceStatus) => {
    records.value = records.value.map((record) =>
      studentIds.includes(record.id) ? { ...record, status } : record
    );
  };

  return {
    date,
    records,
    selectedClass,
    selectedSection,
    statusSummary,
    attendancePercentage,
    setRecords,
    updateRecord,
    bulkUpdate,
  };
});
