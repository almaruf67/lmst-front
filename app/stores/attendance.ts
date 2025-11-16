import { defineStore } from 'pinia'

export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface AttendanceRecord {
    id: number
    studentId: string
    name: string
    className: string
    section: string
    status: AttendanceStatus
}

export const useAttendanceStore = defineStore('attendance', () => {
    const date = ref<string>(new Date().toISOString().slice(0, 10))
    const records = ref<AttendanceRecord[]>([])
    const selectedClass = ref<string>('All')
    const selectedSection = ref<string>('All')

    const totalCount = computed(() => records.value.length || 1)
    const statusSummary = computed(() => {
        return records.value.reduce(
            (acc, record) => {
                acc[record.status] += 1
                return acc
            },
            { present: 0, absent: 0, late: 0 } satisfies Record<AttendanceStatus, number>
        )
    })

    const attendancePercentage = computed(() => {
        const presentCount = statusSummary.value.present
        return Math.round((presentCount / totalCount.value) * 100)
    })

    const setRecords = (payload: AttendanceRecord[]) => {
        records.value = payload
    }

    const updateRecord = (studentId: string, status: AttendanceStatus) => {
        records.value = records.value.map((record) =>
            record.studentId === studentId ? { ...record, status } : record
        )
    }

    const bulkUpdate = (studentIds: string[], status: AttendanceStatus) => {
        records.value = records.value.map((record) =>
            studentIds.includes(record.studentId) ? { ...record, status } : record
        )
    }

    return {
        date,
        records,
        selectedClass,
        selectedSection,
        statusSummary,
        attendancePercentage,
        setRecords,
        updateRecord,
        bulkUpdate
    }
})
