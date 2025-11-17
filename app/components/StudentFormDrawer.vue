<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex-1 bg-black/30" @click="handleClose" />
        <section
          class="relative flex w-full max-w-2xl flex-col border-l border-border bg-surface p-6 shadow-2xl"
        >
          <header class="mb-6 space-y-1">
            <p
              class="text-xs font-semibold uppercase tracking-wide text-foreground-muted"
            >
              {{ isEdit ? 'Update Student' : 'Create Student' }}
            </p>
            <h2 class="text-2xl font-bold text-foreground">
              {{ isEdit ? `Edit ${form.name || 'student'}` : 'New Student' }}
            </h2>
            <p class="text-sm text-foreground-muted">
              Manage roster data, class assignments, and primary teacher
              directly from the drawer.
            </p>
          </header>

          <form class="flex flex-1 flex-col" @submit.prevent="handleSubmit">
            <div class="flex-1 space-y-4 overflow-y-auto pr-1">
              <div class="grid gap-4 md:grid-cols-2">
                <label class="flex flex-col gap-1 text-sm text-foreground">
                  Full name
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    placeholder="Student name"
                    class="rounded-xl border border-border bg-background px-3 py-2"
                  />
                </label>
                <label class="flex flex-col gap-1 text-sm text-foreground">
                  Student ID
                  <input
                    v-model="form.studentCode"
                    type="text"
                    required
                    placeholder="STU-0001"
                    class="rounded-xl border border-border bg-background px-3 py-2"
                  />
                </label>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="flex flex-col gap-1 text-sm text-foreground">
                  Class
                  <select
                    v-model="form.className"
                    required
                    class="rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <option value="" disabled>Select class</option>
                    <option
                      v-for="className in normalizedClassOptions"
                      :key="className"
                      :value="className"
                    >
                      Class {{ className }}
                    </option>
                  </select>
                </label>
                <label class="flex flex-col gap-1 text-sm text-foreground">
                  Section
                  <select
                    v-model="form.section"
                    class="rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <option value="">Unassigned</option>
                    <option
                      v-for="section in normalizedSectionOptions"
                      :key="section"
                      :value="section"
                    >
                      Section {{ section }}
                    </option>
                  </select>
                </label>
              </div>

              <label class="flex flex-col gap-1 text-sm text-foreground">
                Primary teacher
                <select
                  v-model.number="form.primaryTeacherId"
                  class="rounded-xl border border-border bg-background px-3 py-2"
                >
                  <option :value="null">No teacher assigned</option>
                  <option
                    v-for="teacher in teacherOptions"
                    :key="teacher.id"
                    :value="teacher.id"
                  >
                    {{ teacher.name }}
                    <template v-if="teacher.class_name">
                      — Class {{ teacher.class_name
                      }}{{ teacher.section ? `-${teacher.section}` : '' }}
                    </template>
                  </option>
                </select>
              </label>

              <label class="flex flex-col gap-1 text-sm text-foreground">
                Notes
                <textarea
                  v-model="form.notes"
                  rows="3"
                  placeholder="Medical info, guardians, or other context"
                  class="rounded-xl border border-border bg-background px-3 py-2"
                />
              </label>

              <label class="flex flex-col gap-1 text-sm text-foreground">
                Photo
                <input
                  ref="photoInput"
                  type="file"
                  accept="image/png,image/jpeg"
                  class="rounded-xl border border-border bg-background px-3 py-2"
                  @change="handlePhotoChange"
                />
                <span class="text-xs text-foreground-muted"
                  >Optional JPG or PNG up to 2 MB.</span
                >
              </label>

              <div
                v-if="photoPreview"
                class="flex items-center gap-3 rounded-xl border border-border bg-surface-muted px-3 py-2"
              >
                <img
                  :src="photoPreview"
                  alt="Selected preview"
                  class="h-12 w-12 rounded-full object-cover"
                />
                <button
                  type="button"
                  class="text-xs font-semibold text-primary"
                  @click="clearPhoto"
                >
                  Remove photo
                </button>
              </div>

              <div
                v-if="showUploadProgress"
                class="space-y-2 rounded-xl border border-border bg-surface-muted px-3 py-2"
              >
                <div
                  class="flex items-center justify-between text-xs font-semibold text-foreground-muted"
                >
                  <span>Uploading photo…</span>
                  <span>{{ normalizedProgress }}%</span>
                </div>
                <div class="h-2 rounded-full bg-border/60">
                  <div
                    class="h-full rounded-full bg-primary transition-[width] duration-200"
                    :style="{ width: `${normalizedProgress}%` }"
                  />
                </div>
              </div>

              <div
                v-else-if="showUploadComplete"
                class="rounded-xl border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"
              >
                Processing upload…
              </div>
            </div>

            <div
              v-if="error"
              class="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {{ error }}
            </div>

            <footer
              class="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end"
            >
              <button
                type="button"
                class="btn-secondary h-11 px-5 text-sm font-semibold"
                @click="handleClose"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn-primary h-11 px-6 text-sm font-semibold"
                :disabled="loading"
              >
                {{
                  loading
                    ? 'Saving…'
                    : isEdit
                    ? 'Update Student'
                    : 'Create Student'
                }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';

import type { StudentListItem } from '~/composables/useStudents';

const props = defineProps<{
  open: boolean;
  loading?: boolean;
  error?: string | null;
  initial?: StudentListItem | null;
  classOptions: string[];
  sectionOptions: string[];
  teacherOptions: Array<{
    id: number;
    name: string;
    class_name?: string | null;
    section?: string | null;
  }>;
  uploadProgress?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (
    e: 'submit',
    payload: {
      name: string;
      student_id: string;
      class_name: string;
      section: string | null;
      notes: string | null;
      primary_teacher_id: number | null;
      photo?: File | null;
    }
  ): void;
}>();

const INITIAL_OPTION = 'All';

const form = reactive({
  name: '',
  studentCode: '',
  className: '',
  section: '',
  primaryTeacherId: null as number | null,
  notes: '',
});

const photoFile = ref<File | null>(null);
const photoPreview = ref<string | null>(null);
const photoInput = ref<HTMLInputElement | null>(null);
const normalizedProgress = computed(() => {
  const value = props.uploadProgress ?? 0;
  return Math.min(100, Math.max(0, Math.round(value)));
});
const showUploadProgress = computed(
  () =>
    props.loading &&
    normalizedProgress.value > 0 &&
    normalizedProgress.value < 100
);
const showUploadComplete = computed(
  () => props.loading && normalizedProgress.value === 100
);

const normalizedClassOptions = computed(() =>
  props.classOptions.filter((option) => option && option !== INITIAL_OPTION)
);
const normalizedSectionOptions = computed(() =>
  props.sectionOptions.filter((option) => option && option !== INITIAL_OPTION)
);

const resetForm = () => {
  form.name = '';
  form.studentCode = '';
  form.className = '';
  form.section = '';
  form.primaryTeacherId = null;
  form.notes = '';
  photoFile.value = null;
  photoPreview.value = null;
  if (photoInput.value) {
    photoInput.value.value = '';
  }
};

const hydrateForm = () => {
  resetForm();

  if (props.initial) {
    form.name = props.initial.name ?? '';
    form.studentCode = props.initial.studentCode ?? '';
    form.className = props.initial.className ?? '';
    form.section = props.initial.section ?? '';
    form.primaryTeacherId = props.initial.primaryTeacherId ?? null;
    form.notes = props.initial.notes ?? '';
  }

  if (!form.className && normalizedClassOptions.value.length > 0) {
    form.className = normalizedClassOptions.value[0] ?? '';
  }
};

watch(
  () => props.open,
  (open) => {
    if (open) {
      hydrateForm();
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

watch(
  () => props.initial,
  () => {
    if (props.open) {
      hydrateForm();
    }
  }
);

watch(normalizedClassOptions, (options) => {
  if (!form.className && options.length > 0) {
    form.className = options[0] ?? '';
  }
});

watch(normalizedSectionOptions, (options) => {
  if (form.section && !options.includes(form.section)) {
    form.section = '';
  }
});

const isEdit = computed(() => Boolean(props.initial));

const handleClose = () => emit('close');

const handlePhotoChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    clearPhoto();
    return;
  }

  if (photoPreview.value) {
    URL.revokeObjectURL(photoPreview.value);
  }

  photoFile.value = file;
  photoPreview.value = URL.createObjectURL(file);
};

const clearPhoto = () => {
  photoFile.value = null;
  if (photoPreview.value) {
    URL.revokeObjectURL(photoPreview.value);
    photoPreview.value = null;
  }
  if (photoInput.value) {
    photoInput.value.value = '';
  }
};

onBeforeUnmount(() => {
  if (photoPreview.value) {
    URL.revokeObjectURL(photoPreview.value);
  }
});

const handleSubmit = () => {
  emit('submit', {
    name: form.name.trim(),
    student_id: form.studentCode.trim(),
    class_name: form.className,
    section: form.section || null,
    notes: form.notes.trim() || null,
    primary_teacher_id: form.primaryTeacherId ?? null,
    photo: photoFile.value ?? undefined,
  });
};
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateX(10%);
}
</style>
