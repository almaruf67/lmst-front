<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex-1 bg-black/40" @click="handleClose" />
        <div
          class="relative flex w-full max-w-xl flex-col border-l border-border bg-surface p-6 shadow-2xl"
        >
          <header class="mb-6 space-y-1">
            <p
              class="text-xs font-semibold uppercase tracking-wide text-foreground-muted"
            >
              {{ isEdit ? 'Update' : 'Create' }} {{ typeLabel }}
            </p>
            <h2 class="text-2xl font-bold text-foreground">
              {{ isEdit ? `Edit ${typeLabel}` : `New ${typeLabel}` }}
            </h2>
            <p class="text-sm text-foreground-muted">
              {{
                type === 'admin'
                  ? 'Admins can manage every setting across LMST.'
                  : 'Teachers need class and section assignments before they can record attendance.'
              }}
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
                    placeholder="Jane Doe"
                    class="rounded-xl border border-border bg-background px-3 py-2"
                  />
                </label>
                <label class="flex flex-col gap-1 text-sm text-foreground">
                  Email address
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="name@school.edu"
                    class="rounded-xl border border-border bg-background px-3 py-2"
                  />
                </label>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="flex flex-col gap-1 text-sm text-foreground">
                  Phone
                  <input
                    v-model="form.phone"
                    type="tel"
                    placeholder="Optional"
                    class="rounded-xl border border-border bg-background px-3 py-2"
                  />
                </label>
                <label class="flex flex-col gap-1 text-sm text-foreground">
                  Employee code
                  <input
                    v-model="form.employee_code"
                    type="text"
                    :required="type === 'teacher'"
                    placeholder="EMP-001"
                    class="rounded-xl border border-border bg-background px-3 py-2"
                  />
                </label>
              </div>

              <label class="flex flex-col gap-1 text-sm text-foreground">
                Password
                <input
                  v-model="form.password"
                  type="password"
                  :required="!isEdit"
                  minlength="8"
                  placeholder="••••••••"
                  class="rounded-xl border border-border bg-background px-3 py-2"
                />
                <span class="text-xs text-foreground-muted">
                  {{
                    isEdit
                      ? 'Leave blank to keep the current password.'
                      : 'Password must be at least 8 characters.'
                  }}
                </span>
              </label>

              <template v-if="type === 'teacher'">
                <div class="grid gap-4 md:grid-cols-2">
                  <label class="flex flex-col gap-1 text-sm text-foreground">
                    Class assignment
                    <select
                      v-model="form.class_name"
                      required
                      class="rounded-xl border border-border bg-background px-3 py-2"
                    >
                      <option value="" disabled>Select a class</option>
                      <option
                        v-for="className in teacherClassOptions"
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
                      required
                      class="rounded-xl border border-border bg-background px-3 py-2"
                    >
                      <option value="" disabled>Select a section</option>
                      <option
                        v-for="section in teacherSectionOptions"
                        :key="section"
                        :value="section"
                      >
                        Section {{ section }}
                      </option>
                    </select>
                  </label>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <label class="flex flex-col gap-1 text-sm text-foreground">
                    Subject specialization
                    <input
                      v-model="form.subject_specialization"
                      type="text"
                      placeholder="Mathematics"
                      class="rounded-xl border border-border bg-background px-3 py-2"
                    />
                  </label>
                  <label class="flex flex-col gap-1 text-sm text-foreground">
                    Qualification
                    <input
                      v-model="form.qualification"
                      type="text"
                      placeholder="B.Ed"
                      class="rounded-xl border border-border bg-background px-3 py-2"
                    />
                  </label>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <label class="flex flex-col gap-1 text-sm text-foreground">
                    Date of joining
                    <input
                      v-model="form.date_of_joining"
                      type="date"
                      class="rounded-xl border border-border bg-background px-3 py-2"
                    />
                  </label>
                  <label class="flex flex-col gap-1 text-sm text-foreground">
                    Emergency contact name
                    <input
                      v-model="form.emergency_contact_name"
                      type="text"
                      placeholder="Guardian name"
                      class="rounded-xl border border-border bg-background px-3 py-2"
                    />
                  </label>
                </div>

                <label class="flex flex-col gap-1 text-sm text-foreground">
                  Emergency contact phone
                  <input
                    v-model="form.emergency_contact_phone"
                    type="tel"
                    placeholder="Contact number"
                    class="rounded-xl border border-border bg-background px-3 py-2"
                  />
                </label>
              </template>
            </div>

            <div
              v-if="error"
              class="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {{ error }}
            </div>

            <div
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
                  loading ? 'Saving…' : isEdit ? 'Update user' : 'Create user'
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import type { ManagedUser } from '~/types/users';

const props = defineProps<{
  open: boolean;
  type: 'admin' | 'teacher';
  loading?: boolean;
  error?: string | null;
  initial?: ManagedUser | null;
  classOptions?: string[];
  sectionOptions?: string[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: Record<string, unknown>): void;
}>();

const form = reactive({
  name: '',
  email: '',
  phone: '',
  employee_code: '',
  password: '',
  class_name: '',
  section: '',
  subject_specialization: '',
  qualification: '',
  date_of_joining: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
});

const resetForm = () => {
  form.name = '';
  form.email = '';
  form.phone = '';
  form.employee_code = '';
  form.password = '';
  form.class_name = '';
  form.section = '';
  form.subject_specialization = '';
  form.qualification = '';
  form.date_of_joining = '';
  form.emergency_contact_name = '';
  form.emergency_contact_phone = '';
};

const hydrateForm = () => {
  resetForm();

  if (props.initial) {
    form.name = props.initial.name ?? '';
    form.email = props.initial.email ?? '';
    form.phone = props.initial.phone ?? '';
    form.employee_code = props.initial.employeeCode ?? '';
    form.class_name = props.initial.className ?? '';
    form.section = props.initial.section ?? '';
    form.subject_specialization = props.initial.subjectSpecialization ?? '';
    form.qualification = props.initial.qualification ?? '';
    form.date_of_joining = props.initial.dateOfJoining ?? '';
    form.emergency_contact_name = props.initial.emergencyContactName ?? '';
    form.emergency_contact_phone = props.initial.emergencyContactPhone ?? '';
  }
};

const teacherClassOptions = computed(() =>
  (props.classOptions ?? []).filter((option) => option && option !== 'All')
);
const teacherSectionOptions = computed(() =>
  (props.sectionOptions ?? []).filter((option) => option && option !== 'All')
);

const ensureTeacherDefaults = () => {
  if (props.type !== 'teacher') {
    return;
  }

  if (!form.class_name && teacherClassOptions.value.length > 0) {
    form.class_name = teacherClassOptions.value[0];
  }

  if (!form.section && teacherSectionOptions.value.length > 0) {
    form.section = teacherSectionOptions.value[0];
  }
};

watch(
  () => [props.initial, props.type, props.open],
  () => {
    if (props.open) {
      hydrateForm();
      ensureTeacherDefaults();
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

watch(
  () => [teacherClassOptions.value, teacherSectionOptions.value],
  () => {
    ensureTeacherDefaults();
  }
);

const isEdit = computed(() => Boolean(props.initial));
const typeLabel = computed(() =>
  props.type === 'admin' ? 'Administrator' : 'Teacher'
);

const handleClose = () => emit('close');

const handleSubmit = () => {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || null,
    employee_code: form.employee_code.trim() || undefined,
  };

  if (form.password.trim()) {
    payload.password = form.password.trim();
  }

  if (props.type === 'teacher') {
    Object.assign(payload, {
      employee_code: form.employee_code.trim(),
      class_name: form.class_name,
      section: form.section,
      subject_specialization: form.subject_specialization.trim() || null,
      qualification: form.qualification.trim() || null,
      date_of_joining: form.date_of_joining || null,
      emergency_contact_name: form.emergency_contact_name.trim() || null,
      emergency_contact_phone: form.emergency_contact_phone.trim() || null,
    });
  }

  emit('submit', payload);
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
