import { ref, computed, watch } from 'vue'
import { listMockStudents } from '~/utils/mock/students'
import type { MockStudent } from '~/utils/mock/students'

export type StudentItem = MockStudent

export const useStudents = () => {
    const loading = ref(true)
    const error = ref<string | null>(null)
    const students = ref<StudentItem[]>([])
    const search = ref('')
    const classFilter = ref('All')
    const sectionFilter = ref('All')
    const page = ref(1)
    const pageSize = ref(8)

    const fetchStudents = async () => {
        loading.value = true
        error.value = null
        try {
            students.value = await listMockStudents()
        } catch (fetchError) {
            error.value = 'Unable to load students'
            console.error(fetchError)
        } finally {
            loading.value = false
        }
    }

    const filtered = computed(() => {
        return students.value.filter((student) => {
            const matchesSearch = student.name.toLowerCase().includes(search.value.toLowerCase())
            const matchesClass = classFilter.value === 'All' || student.className === classFilter.value
            const matchesSection = sectionFilter.value === 'All' || student.section === sectionFilter.value
            return matchesSearch && matchesClass && matchesSection
        })
    })

    const paginated = computed(() => {
        const start = (page.value - 1) * pageSize.value
        return filtered.value.slice(start, start + pageSize.value)
    })

    const total = computed(() => filtered.value.length)

    const classOptions = computed(() => {
        const unique = new Set(students.value.map((student) => student.className))
        return ['All', ...unique]
    })

    const sectionOptions = computed(() => {
        const unique = new Set(students.value.map((student) => student.section))
        return ['All', ...unique]
    })

    watch([search, classFilter, sectionFilter, pageSize], () => {
        page.value = 1
    })

    onMounted(fetchStudents)

    return {
        loading,
        error,
        students: paginated,
        total,
        page,
        pageSize,
        search,
        classFilter,
        sectionFilter,
        refresh: fetchStudents,
        classOptions,
        sectionOptions
    }
}
