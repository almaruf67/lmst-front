<template>
  <div class="space-y-6">
    <PageToolbar
      eyebrow="Roster"
      title="Student Directory"
      description="Live data from the LMST API with filters, pagination, and teacher scoping."
    >
      <template #filters>
        <input
          v-model="search"
          type="search"
          placeholder="Search by name or ID"
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
        <select
          v-model.number="pageSize"
          class="h-11 rounded-2xl border border-border bg-surface px-3 text-sm"
        >
          <option :value="10">10 / page</option>
          <option :value="20">20 / page</option>
          <option :value="50">50 / page</option>
        </select>
      </template>
      <template #actions>
        <button
          type="button"
          class="btn-secondary h-11 px-5 text-sm font-semibold"
          :disabled="loading"
          @click="refresh()"
        >
          Refresh
        </button>
      </template>
    </PageToolbar>

    <div
      v-if="error"
      class="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ error }}
    </div>

    <StudentList
      :students="students"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :loading="loading"
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
  loading,
  error,
  refresh,
} = useStudents();
</script>
