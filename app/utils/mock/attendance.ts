import type { AttendanceRecord, AttendanceStatus } from '~/stores/attendance'
import { listMockStudents } from './students'

export const listMockAttendance = async (): Promise<AttendanceRecord[]> => {
    const students = await listMockStudents()
    return students.map((student, index) => {
        const status: AttendanceStatus = index % 5 === 0 ? 'late' : index % 7 === 0 ? 'absent' : 'present'
        return {
            id: student.id,
            studentId: student.studentId,
            name: student.name,
            className: student.className,
            section: student.section,
            status
        }
    })
}
