<template>
  <div class="space-y-6">
    <PageToolbar
      eyebrow="Roster"
      title="Student Directory"
      description="Search, filter, and manage every enrolled student before syncing with the backend API."
    >
      <template #filters>
        <input
          v-model="search"
          type="search"
          placeholder="Search by name"
          class="h-11 rounded-2xl border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <select
          v-model="classFilter"
          class="h-11 rounded-2xl border border-border bg-surface px-3 text-sm"
        >
          <option
            v-for="className in classOptions"
            :key="className"
            :value="className"
          >
            {{ className === 'All' ? 'All Classes' : 'Class ' + className }}
          </option>
        </select>
        <select
          v-model="sectionFilter"
          class="h-11 rounded-2xl border border-border bg-surface px-3 text-sm"
        >
          <option
            v-for="sectionName in sectionOptions"
            :key="sectionName"
            :value="sectionName"
          >
            {{
              sectionName === 'All' ? 'All Sections' : 'Section ' + sectionName
            }}
          </option>
        </select>
      </template>
    </PageToolbar>

    <StudentList
      :students="students"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @change-page="(next) => (page = next)"
    />
  </div>
</template>

<script lang="ts" setup>
const {
  students,
  total,
  page,
  pageSize,
  search,
  classFilter,
  sectionFilter,
  classOptions,
  sectionOptions,
} = useStudents();
</script>
