import { ref, computed } from 'vue'
import { useAttendanceStore, type AttendanceStatus } from '~/stores/attendance'
import { listMockAttendance } from '~/utils/mock/attendance'

export const useAttendance = () => {
    const store = useAttendanceStore()
    const loading = ref(false)
    const error = ref<string | null>(null)
    const selectedStudents = ref<string[]>([])

    const loadRecords = async () => {
        loading.value = true
        error.value = null
        try {
            const data = await listMockAttendance()
            store.setRecords(data)
        } catch (cause) {
            error.value = 'Unable to load attendance records'
            console.error(cause)
        } finally {
            loading.value = false
        }
    }

    const filteredRecords = computed(() => {
        return store.records.filter((record) => {
            const matchesClass = store.selectedClass === 'All' || record.className === store.selectedClass
            const matchesSection = store.selectedSection === 'All' || record.section === store.selectedSection
            return matchesClass && matchesSection
        })
    })

    const toggleSelection = (studentId: string) => {
        if (selectedStudents.value.includes(studentId)) {
            selectedStudents.value = selectedStudents.value.filter((id) => id !== studentId)
        } else {
            selectedStudents.value = [...selectedStudents.value, studentId]
        }
    }

    const selectAllVisible = () => {
        selectedStudents.value = filteredRecords.value.map((record) => record.studentId)
    }

    const clearSelection = () => {
        selectedStudents.value = []
    }

    const markStatus = (studentId: string, status: AttendanceStatus) => {
        store.updateRecord(studentId, status)
    }

    const bulkMarkStatus = (status: AttendanceStatus) => {
        store.bulkUpdate(selectedStudents.value, status)
        clearSelection()
    }

    onMounted(loadRecords)

    return {
        loading,
        error,
        store,
        filteredRecords,
        selectedStudents,
        toggleSelection,
        selectAllVisible,
        clearSelection,
        markStatus,
        bulkMarkStatus,
        refresh: loadRecords
    }
}
