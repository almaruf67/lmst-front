<template>
    <div class="space-y-6">
        <PageToolbar eyebrow="Overview" title="Attendance Overview"
            description="Snapshot of today’s attendance health before connecting to the live API.">
            <template #actions>
                <button class="h-11 rounded-2xl border border-(--color-border) px-5 text-sm font-semibold">
                    Download Report
                </button>
            </template>
        </PageToolbar>

        <section class="toolbar-grid">
            <article v-for="highlight in highlightCards" :key="highlight.label"
                class="card-surface border border-(--color-border) p-5">
                <p class="text-xs uppercase text-(--color-foreground-muted)">{{ highlight.label }}</p>
                <p class="text-3xl font-semibold">{{ highlight.value }}</p>
                <p class="text-xs text-(--color-foreground-muted)">{{ highlight.subtext }}</p>
            </article>
        </section>

        <section class="grid gap-6 lg:grid-cols-3">
            <article class="card-surface border border-(--color-border) p-6 lg:col-span-2">
                <header class="mb-4 flex items-center justify-between">
                    <div>
                        <p class="text-xs uppercase text-(--color-foreground-muted)">Monthly Attendance</p>
                        <h3 class="text-xl font-semibold">{{ currentMonth }}</h3>
                    </div>
                    <button class="rounded-full border border-(--color-border) px-4 py-1 text-sm">Export</button>
                </header>
                <div class="space-y-4">
                    <div v-for="point in monthlyTrend" :key="point.label" class="flex items-center gap-4">
                        <div class="w-14 text-sm text-(--color-foreground-muted)">{{ point.label }}</div>
                        <div class="h-3 flex-1 rounded-full bg-(--color-surface-muted)">
                            <div class="h-3 rounded-full bg-(--color-primary)" :style="{ width: `${point.present}%` }">
                            </div>
                        </div>
                        <div class="w-12 text-right text-sm font-semibold">{{ point.present }}%</div>
                    </div>
                </div>
            </article>

            <article class="card-surface border border-(--color-border) p-6">
                <h3 class="text-lg font-semibold">Upcoming Tasks</h3>
                <ul class="mt-4 space-y-3 text-sm">
                    <li v-for="task in tasks" :key="task">
                        <div
                            class="flex items-center justify-between rounded-2xl border border-(--color-border) px-3 py-2">
                            <span>{{ task }}</span>
                            <span class="text-xs text-(--color-foreground-muted)">Later</span>
                        </div>
                    </li>
                </ul>
            </article>
        </section>
    </div>
</template>

<script lang="ts" setup>
import { listMockAttendance } from '~/utils/mock/attendance'
import { listMockStudents } from '~/utils/mock/students'

const highlightCards = ref([
    { label: 'Students', value: 0, subtext: 'Active across all classes' },
    { label: 'Present Today', value: 0, subtext: 'Marked as present' },
    { label: 'Late', value: 0, subtext: 'Need follow-up' },
    { label: 'Absent', value: 0, subtext: 'Notify guardians' }
])

const monthlyTrend = ref<{ label: string; present: number }[]>([])
const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

const tasks = ['Sync LMS data', 'Review absent list', 'Publish monthly report']

onMounted(async () => {
    const [students, attendance] = await Promise.all([listMockStudents(), listMockAttendance()])
    highlightCards.value = [
        { label: 'Students', value: students.length, subtext: 'Active across all classes' },
        { label: 'Present Today', value: attendance.filter((r) => r.status === 'present').length, subtext: 'Marked as present' },
        { label: 'Late', value: attendance.filter((r) => r.status === 'late').length, subtext: 'Need follow-up' },
        { label: 'Absent', value: attendance.filter((r) => r.status === 'absent').length, subtext: 'Notify guardians' }
    ]

    monthlyTrend.value = Array.from({ length: 6 }).map((_, index) => {
        const label = new Date(new Date().setMonth(new Date().getMonth() - (5 - index)))
            .toLocaleString('default', { month: 'short' })
        return {
            label,
            present: 60 + Math.round(Math.random() * 35)
        }
    })
})
</script>
