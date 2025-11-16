export type MockStudent = {
    id: number
    name: string
    initials: string
    studentId: string
    className: string
    section: string
    attendancePercentage: number
    status: 'Present' | 'Absent' | 'Late'
    avatarColor: string
}

const palette = ['#6366F1', '#0EA5E9', '#22C55E', '#F97316', '#EC4899'] as const
const sections = ['A', 'B', 'C'] as const

const seedStudents: MockStudent[] = Array.from({ length: 24 }).map((_, index) => {
    const className = `${Math.floor(index / 6) + 5}`
    const section = sections[index % sections.length] ?? 'A'
    const attendancePercentage = 60 + (index * 7) % 35
    const status = attendancePercentage > 85 ? 'Present' : attendancePercentage > 70 ? 'Late' : 'Absent'

    const name = `Student ${index + 1}`
    const initials = name
        .split(' ')
        .map((part) => part.at(0))
        .join('')

    return {
        id: index + 1,
        name,
        initials,
        studentId: `STU-${1000 + index}`,
        className,
        section,
        attendancePercentage,
        status,
        avatarColor: palette[index % palette.length] ?? '#6366F1'
    }
})

export const listMockStudents = async (): Promise<MockStudent[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return seedStudents
}
