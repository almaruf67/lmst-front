<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="space-y-8">
      <PageToolbar
        eyebrow="Account"
        title="Profile"
        description="Manage your personal details, avatar, and password to keep your LMST account secure."
      />

      <div
        v-if="loadError"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-200"
      >
        {{ loadError }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] lg:gap-8">
        <div class="space-y-6">
          <section
            class="card-surface rounded-2xl border border-border p-6 shadow-md"
          >
            <header class="mb-6 space-y-1">
              <p
                class="text-xs font-semibold uppercase tracking-wider text-foreground-muted"
              >
                Profile Information
              </p>
              <h2 class="text-2xl font-semibold text-foreground">
                Edit Profile
              </h2>
              <p class="text-sm text-foreground-muted">
                Update your personal information so the rest of the team sees
                the latest details.
              </p>
            </header>

            <form class="space-y-5" @submit.prevent="submitPersonalForm">
              <div class="grid gap-5 md:grid-cols-2">
                <div class="space-y-2">
                  <label
                    for="first_name"
                    class="text-sm font-medium text-foreground"
                  >
                    First Name
                    <span class="text-destructive">*</span>
                  </label>
                  <input
                    id="first_name"
                    v-model="personalForm.first_name"
                    type="text"
                    :disabled="personalSaving || loadingProfile"
                    :class="[
                      'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2',
                      personalErrors.first_name
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                        : 'border-border focus:border-primary focus:ring-primary/30',
                    ]"
                    placeholder="Admin"
                    maxlength="255"
                    aria-required="true"
                    @input="clearPersonalError('first_name')"
                  />
                  <p
                    v-if="personalErrors.first_name"
                    class="text-xs text-destructive"
                  >
                    {{ personalErrors.first_name }}
                  </p>
                </div>

                <div class="space-y-2">
                  <label
                    for="last_name"
                    class="text-sm font-medium text-foreground"
                  >
                    Last Name
                    <span class="text-destructive">*</span>
                  </label>
                  <input
                    id="last_name"
                    v-model="personalForm.last_name"
                    type="text"
                    :disabled="personalSaving || loadingProfile"
                    :class="[
                      'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2',
                      personalErrors.last_name
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                        : 'border-border focus:border-primary focus:ring-primary/30',
                    ]"
                    placeholder="User"
                    maxlength="255"
                    aria-required="true"
                    @input="clearPersonalError('last_name')"
                  />
                  <p
                    v-if="personalErrors.last_name"
                    class="text-xs text-destructive"
                  >
                    {{ personalErrors.last_name }}
                  </p>
                </div>
              </div>

              <div class="grid gap-5 md:grid-cols-2">
                <div class="space-y-2">
                  <label
                    for="email"
                    class="text-sm font-medium text-foreground"
                  >
                    Email Address
                    <span class="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    v-model="personalForm.email"
                    type="email"
                    :disabled="personalSaving || loadingProfile"
                    :class="[
                      'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2',
                      personalErrors.email
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                        : 'border-border focus:border-primary focus:ring-primary/30',
                    ]"
                    placeholder="admin@example.com"
                    maxlength="255"
                    aria-required="true"
                    @input="clearPersonalError('email')"
                  />
                  <p
                    v-if="personalErrors.email"
                    class="text-xs text-destructive"
                  >
                    {{ personalErrors.email }}
                  </p>
                </div>

                <div class="space-y-2">
                  <label for="phone" class="text-sm font-medium text-foreground"
                    >Phone Number</label
                  >
                  <input
                    id="phone"
                    v-model="personalForm.phone"
                    type="tel"
                    :disabled="personalSaving || loadingProfile"
                    :class="[
                      'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2',
                      personalErrors.phone
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                        : 'border-border focus:border-primary focus:ring-primary/30',
                    ]"
                    placeholder="01700000000"
                    maxlength="20"
                    @input="clearPersonalError('phone')"
                  />
                  <p class="text-xs text-foreground-muted">
                    Optional. Visible to administrators on attendance reports.
                  </p>
                  <p
                    v-if="personalErrors.phone"
                    class="text-xs text-destructive"
                  >
                    {{ personalErrors.phone }}
                  </p>
                </div>
              </div>

              <div v-if="showClassroomFields" class="grid gap-5 md:grid-cols-2">
                <div class="space-y-2">
                  <label
                    for="class_name"
                    class="text-sm font-medium text-foreground"
                    >Class Assignment</label
                  >
                  <input
                    id="class_name"
                    v-model="personalForm.class_name"
                    type="text"
                    :disabled="personalSaving || loadingProfile"
                    :class="[
                      'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2',
                      personalErrors.class_name
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                        : 'border-border focus:border-primary focus:ring-primary/30',
                    ]"
                    placeholder="Grade 5"
                    maxlength="100"
                    @input="clearPersonalError('class_name')"
                  />
                  <p class="text-xs text-foreground-muted">
                    Optional. Helps admins route classroom-specific
                    notifications.
                  </p>
                  <p
                    v-if="personalErrors.class_name"
                    class="text-xs text-destructive"
                  >
                    {{ personalErrors.class_name }}
                  </p>
                </div>

                <div class="space-y-2">
                  <label
                    for="section"
                    class="text-sm font-medium text-foreground"
                    >Section</label
                  >
                  <input
                    id="section"
                    v-model="personalForm.section"
                    type="text"
                    :disabled="personalSaving || loadingProfile"
                    :class="[
                      'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2',
                      personalErrors.section
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                        : 'border-border focus:border-primary focus:ring-primary/30',
                    ]"
                    placeholder="Section A"
                    maxlength="100"
                    @input="clearPersonalError('section')"
                  />
                  <p class="text-xs text-foreground-muted">
                    Optional. 100 characters max.
                  </p>
                  <p
                    v-if="personalErrors.section"
                    class="text-xs text-destructive"
                  >
                    {{ personalErrors.section }}
                  </p>
                </div>
              </div>

              <div
                v-if="personalApiError"
                class="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {{ personalApiError }}
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  class="btn-secondary h-11 px-6 text-sm font-semibold"
                  :disabled="personalSaving || loadingProfile"
                  @click="resetPersonalForm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn-primary h-11 px-6 text-sm font-semibold"
                  :disabled="personalSaving || loadingProfile"
                >
                  {{ personalSaving ? 'Saving…' : 'Update Profile' }}
                </button>
              </div>
            </form>
          </section>

          <section
            class="card-surface rounded-2xl border border-border p-6 shadow-md"
          >
            <header class="mb-6 space-y-1">
              <p
                class="text-xs font-semibold uppercase tracking-wider text-foreground-muted"
              >
                Change Password
              </p>
              <h2 class="text-2xl font-semibold text-foreground">Security</h2>
              <p class="text-sm text-foreground-muted">
                Update your password to keep your account secure. Minimum 8
                characters.
              </p>
            </header>

            <form class="space-y-4" @submit.prevent="submitPasswordForm">
              <div class="space-y-2">
                <label
                  for="current_password"
                  class="text-sm font-medium text-foreground"
                >
                  Current Password
                  <span class="text-destructive">*</span>
                </label>
                <input
                  id="current_password"
                  v-model="passwordForm.current_password"
                  type="password"
                  autocomplete="current-password"
                  :disabled="passwordSaving"
                  :class="[
                    'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2',
                    passwordErrors.current_password
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                      : 'border-border focus:border-primary focus:ring-primary/30',
                  ]"
                  @input="clearPasswordError('current_password')"
                />
                <p
                  v-if="passwordErrors.current_password"
                  class="text-xs text-destructive"
                >
                  {{ passwordErrors.current_password }}
                </p>
              </div>

              <div class="space-y-2">
                <label
                  for="password"
                  class="text-sm font-medium text-foreground"
                >
                  New Password
                  <span class="text-destructive">*</span>
                </label>
                <input
                  id="password"
                  v-model="passwordForm.password"
                  type="password"
                  autocomplete="new-password"
                  minlength="8"
                  maxlength="255"
                  :disabled="passwordSaving"
                  :class="[
                    'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2',
                    passwordErrors.password
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                      : 'border-border focus:border-primary focus:ring-primary/30',
                  ]"
                  @input="clearPasswordError('password')"
                />
                <p
                  v-if="passwordErrors.password"
                  class="text-xs text-destructive"
                >
                  {{ passwordErrors.password }}
                </p>
              </div>

              <div class="space-y-2">
                <label
                  for="password_confirmation"
                  class="text-sm font-medium text-foreground"
                >
                  Confirm New Password
                  <span class="text-destructive">*</span>
                </label>
                <input
                  id="password_confirmation"
                  v-model="passwordForm.password_confirmation"
                  type="password"
                  autocomplete="new-password"
                  :disabled="passwordSaving"
                  :class="[
                    'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2',
                    passwordErrors.password_confirmation
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                      : 'border-border focus:border-primary focus:ring-primary/30',
                  ]"
                  @input="clearPasswordError('password_confirmation')"
                />
                <p
                  v-if="passwordErrors.password_confirmation"
                  class="text-xs text-destructive"
                >
                  {{ passwordErrors.password_confirmation }}
                </p>
              </div>

              <div
                v-if="passwordApiError"
                class="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {{ passwordApiError }}
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  class="btn-secondary h-11 px-6 text-sm font-semibold"
                  :disabled="passwordSaving"
                  @click="resetPasswordForm"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  class="btn-primary h-11 px-6 text-sm font-semibold"
                  :disabled="passwordSaving"
                >
                  {{ passwordSaving ? 'Updating…' : 'Change Password' }}
                </button>
              </div>
            </form>
          </section>
        </div>

        <section
          class="card-surface flex flex-col items-center gap-4 rounded-2xl border border-border p-6 text-center shadow-md lg:self-start"
        >
          <div class="w-full text-left">
            <p
              class="text-xs font-semibold uppercase tracking-wider text-foreground-muted"
            >
              Profile Image
            </p>
            <h2 class="text-xl font-semibold text-foreground">
              Update your photo
            </h2>
            <p class="text-sm text-foreground-muted">
              Upload a clear square image (PNG/JPG/WEBP/AVIF) up to 2 MB.
            </p>
          </div>

          <div
            class="flex h-28 w-28 items-center justify-center rounded-full border border-border bg-gradient-to-br from-primary/10 to-primary/30 text-2xl font-semibold text-primary"
          >
            <img
              v-if="displayAvatar"
              :src="displayAvatar"
              alt="Profile avatar"
              class="h-full w-full rounded-full object-cover"
            />
            <span v-else>{{ initialsValue }}</span>
          </div>

          <div>
            <p class="text-base font-semibold text-foreground">
              {{ profile?.name || '—' }}
            </p>
            <p class="text-sm text-foreground-muted capitalize">
              {{ userRoleLabel }}
            </p>
          </div>

          <input
            ref="avatarInput"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            class="sr-only"
            @change="handleAvatarChange"
          />

          <button
            type="button"
            class="btn-primary px-5 py-2 text-sm font-semibold"
            :disabled="avatarSaving"
            @click="chooseAvatarFile"
          >
            {{ avatarSaving ? 'Uploading…' : 'Change Image' }}
          </button>

          <p class="text-xs text-foreground-muted">
            Allowed file types: png, jpg, jpeg, webp, avif.
            <br />
            Maximum size: 2 MB.
          </p>
          <p v-if="avatarError" class="text-xs text-destructive">
            {{ avatarError }}
          </p>
          <p v-if="avatarApiError" class="text-xs text-destructive">
            {{ avatarApiError }}
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';
import { storeToRefs } from 'pinia';

import { useProfile } from '~/composables/useProfile';
import { useAuthStore, type AuthUser } from '~/stores/auth';
import { useNotificationStore } from '~/stores/notifications';
import { resolveApiErrorMessage } from '~/utils/http';

type PersonalFormShape = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  class_name: string;
  section: string;
};

type PasswordFormShape = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { profile, avatarUrl, initials } = storeToRefs(authStore);
const { fetchProfile, updateProfile, updateAvatar, updatePassword } =
  useProfile();

const loadingProfile = ref(true);
const loadError = ref<string | null>(null);

const personalForm = reactive<PersonalFormShape>({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  class_name: '',
  section: '',
});

const personalErrors = reactive<Record<keyof PersonalFormShape, string | null>>(
  {
    first_name: null,
    last_name: null,
    email: null,
    phone: null,
    class_name: null,
    section: null,
  }
);
const personalApiError = ref<string | null>(null);
const personalSaving = ref(false);

const passwordForm = reactive<PasswordFormShape>({
  current_password: '',
  password: '',
  password_confirmation: '',
});

const passwordErrors = reactive<Record<keyof PasswordFormShape, string | null>>(
  {
    current_password: null,
    password: null,
    password_confirmation: null,
  }
);
const passwordApiError = ref<string | null>(null);
const passwordSaving = ref(false);

const avatarInput = ref<HTMLInputElement | null>(null);
const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);
const avatarError = ref<string | null>(null);
const avatarApiError = ref<string | null>(null);
const avatarSaving = ref(false);

let objectUrl: string | null = null;

const releasePreviewUrl = () => {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
};

const hydratePersonalForm = (user: AuthUser | null | undefined) => {
  if (!user) {
    return;
  }

  const fullName = (user.name ?? '').trim();
  if (fullName.length === 0) {
    personalForm.first_name = '';
    personalForm.last_name = '';
  } else {
    const [first, ...rest] = fullName.split(/\s+/);
    personalForm.first_name = first ?? '';
    personalForm.last_name = rest.join(' ');
  }

  personalForm.email = user.email ?? '';
  personalForm.phone = user.phone ?? '';
  personalForm.class_name = user.class_name ?? '';
  personalForm.section = user.section ?? '';
};

watch(
  profile,
  (user) => {
    if (user) {
      hydratePersonalForm(user);
      loadError.value = null;
      loadingProfile.value = false;
    }
  },
  { immediate: true }
);
const loadProfile = async () => {
  const shouldBlockUi = !profile.value;

  if (shouldBlockUi) {
    loadingProfile.value = true;
  }

  loadError.value = null;

  try {
    const user = await fetchProfile();
    hydratePersonalForm(user);
  } catch (cause) {
    loadError.value = resolveApiErrorMessage(
      cause,
      'Unable to load profile information'
    );
  } finally {
    if (shouldBlockUi) {
      loadingProfile.value = false;
    }
  }
};

onMounted(() => {
  loadProfile();
});

onBeforeUnmount(() => {
  releasePreviewUrl();
});

const resetPersonalForm = () => {
  hydratePersonalForm(profile.value ?? null);
  resetPersonalErrors();
  personalApiError.value = null;
};

const showClassroomFields = computed(
  () => profile.value?.user_type === 'teacher'
);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clearPersonalError = (field: keyof PersonalFormShape) => {
  personalErrors[field] = null;
};

const clearPasswordError = (field: keyof PasswordFormShape) => {
  passwordErrors[field] = null;
};

const resetPersonalErrors = () => {
  (Object.keys(personalErrors) as Array<keyof PersonalFormShape>).forEach(
    (key) => {
      personalErrors[key] = null;
    }
  );
};

const validatePersonalForm = (): boolean => {
  resetPersonalErrors();
  personalApiError.value = null;

  let valid = true;

  const trimmedFirst = personalForm.first_name.trim();
  if (!trimmedFirst) {
    personalErrors.first_name = 'First name is required.';
    valid = false;
  } else if (trimmedFirst.length > 255) {
    personalErrors.first_name = 'First name must be at most 255 characters.';
    valid = false;
  }

  const trimmedLast = personalForm.last_name.trim();
  if (!trimmedLast) {
    personalErrors.last_name = 'Last name is required.';
    valid = false;
  } else if (trimmedLast.length > 255) {
    personalErrors.last_name = 'Last name must be at most 255 characters.';
    valid = false;
  }

  const trimmedEmail = personalForm.email.trim();
  if (!trimmedEmail) {
    personalErrors.email = 'Email is required.';
    valid = false;
  } else if (trimmedEmail.length > 255) {
    personalErrors.email = 'Email must be at most 255 characters.';
    valid = false;
  } else if (!emailPattern.test(trimmedEmail)) {
    personalErrors.email = 'Enter a valid email address.';
    valid = false;
  }

  const optionalFields: Array<{
    key: keyof PersonalFormShape;
    value: string;
    max: number;
    label: string;
  }> = [{ key: 'phone', value: personalForm.phone, max: 20, label: 'Phone' }];

  if (showClassroomFields.value) {
    optionalFields.push(
      {
        key: 'class_name',
        value: personalForm.class_name,
        max: 100,
        label: 'Class',
      },
      {
        key: 'section',
        value: personalForm.section,
        max: 100,
        label: 'Section',
      }
    );
  }

  optionalFields.forEach(({ key, value, max, label }) => {
    const trimmed = value.trim();
    if (trimmed.length > max) {
      personalErrors[key] = `${label} must be at most ${max} characters.`;
      valid = false;
    } else {
      personalErrors[key] = null;
    }
  });

  if (!showClassroomFields.value) {
    personalErrors.class_name = null;
    personalErrors.section = null;
  }

  return valid;
};

const buildPersonalPayload = () => {
  const fullName = [
    personalForm.first_name.trim(),
    personalForm.last_name.trim(),
  ]
    .filter(Boolean)
    .join(' ');

  const payload = {
    name: fullName,
    email: personalForm.email.trim(),
    phone: personalForm.phone.trim() || null,
    class_name: personalForm.class_name.trim() || null,
    section: personalForm.section.trim() || null,
  };

  if (!showClassroomFields.value) {
    payload.class_name = null;
    payload.section = null;
  }

  return payload;
};

const submitPersonalForm = async () => {
  if (personalSaving.value) {
    return;
  }

  if (!validatePersonalForm()) {
    return;
  }

  personalSaving.value = true;
  personalApiError.value = null;

  try {
    const updated = await updateProfile(buildPersonalPayload());
    hydratePersonalForm(updated);
    notificationStore.push({
      variant: 'success',
      title: 'Profile updated',
      message: 'Personal information saved successfully.',
    });
  } catch (cause) {
    personalApiError.value = resolveApiErrorMessage(
      cause,
      'Unable to update profile'
    );
  } finally {
    personalSaving.value = false;
  }
};

const resetPasswordForm = () => {
  passwordForm.current_password = '';
  passwordForm.password = '';
  passwordForm.password_confirmation = '';
  resetPasswordErrors();
  passwordApiError.value = null;
};

const allowedAvatarTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);
const maxAvatarBytes = 2 * 1024 * 1024;

const chooseAvatarFile = () => {
  avatarInput.value?.click();
};

const resetAvatarSelection = () => {
  avatarFile.value = null;
  avatarError.value = null;
  avatarApiError.value = null;
  avatarPreview.value = null;
  releasePreviewUrl();
  if (avatarInput.value) {
    avatarInput.value.value = '';
  }
};

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0] ?? null;

  avatarError.value = null;
  avatarApiError.value = null;

  if (!file) {
    resetAvatarSelection();
    return;
  }

  const extensionMatch = file.name.match(/\.(jpg|jpeg|png|webp|avif)$/i);
  if (!allowedAvatarTypes.has(file.type) && !extensionMatch) {
    avatarError.value = 'Choose a JPG, PNG, WEBP, or AVIF image.';
    avatarFile.value = null;
    releasePreviewUrl();
    avatarPreview.value = null;
    return;
  }

  if (file.size > maxAvatarBytes) {
    avatarError.value = 'Image must be 2 MB or smaller.';
    avatarFile.value = null;
    releasePreviewUrl();
    avatarPreview.value = null;
    return;
  }

  avatarFile.value = file;
  releasePreviewUrl();
  objectUrl = URL.createObjectURL(file);
  avatarPreview.value = objectUrl;

  void submitAvatar();
};

const submitAvatar = async () => {
  if (!avatarFile.value) {
    avatarError.value = 'Select an image to upload.';
    return;
  }

  avatarSaving.value = true;
  avatarApiError.value = null;

  try {
    const updated = await updateAvatar(avatarFile.value);
    hydratePersonalForm(updated);
    resetAvatarSelection();
    notificationStore.push({
      variant: 'success',
      title: 'Avatar updated',
      message: 'Your profile photo was updated.',
    });
  } catch (cause) {
    avatarApiError.value = resolveApiErrorMessage(
      cause,
      'Unable to update profile photo'
    );
  } finally {
    avatarSaving.value = false;
  }
};

const resetPasswordErrors = () => {
  (Object.keys(passwordErrors) as Array<keyof PasswordFormShape>).forEach(
    (key) => {
      passwordErrors[key] = null;
    }
  );
};

const validatePasswordForm = (): boolean => {
  resetPasswordErrors();
  passwordApiError.value = null;

  let valid = true;

  if (!passwordForm.current_password.trim()) {
    passwordErrors.current_password = 'Enter your current password.';
    valid = false;
  }

  if (!passwordForm.password) {
    passwordErrors.password = 'Enter a new password.';
    valid = false;
  } else if (passwordForm.password.length < 8) {
    passwordErrors.password = 'Password must be at least 8 characters.';
    valid = false;
  } else if (passwordForm.password.length > 255) {
    passwordErrors.password = 'Password must be under 256 characters.';
    valid = false;
  }

  if (!passwordForm.password_confirmation) {
    passwordErrors.password_confirmation = 'Confirm your new password.';
    valid = false;
  } else if (passwordForm.password_confirmation !== passwordForm.password) {
    passwordErrors.password_confirmation = 'Passwords do not match.';
    valid = false;
  }

  return valid;
};

const submitPasswordForm = async () => {
  if (passwordSaving.value) {
    return;
  }

  if (!validatePasswordForm()) {
    return;
  }

  passwordSaving.value = true;
  passwordApiError.value = null;

  try {
    await updatePassword({
      current_password: passwordForm.current_password,
      password: passwordForm.password,
      password_confirmation: passwordForm.password_confirmation,
    });
    notificationStore.push({
      variant: 'success',
      title: 'Password updated',
      message: 'Sign in again on other devices to use the new password.',
    });
    passwordForm.current_password = '';
    passwordForm.password = '';
    passwordForm.password_confirmation = '';
  } catch (cause) {
    passwordApiError.value = resolveApiErrorMessage(
      cause,
      'Unable to update password'
    );
  } finally {
    passwordSaving.value = false;
  }
};

const displayAvatar = computed(
  () => avatarPreview.value ?? avatarUrl.value ?? null
);
const initialsValue = computed(() => initials.value || 'LM');
const userRoleLabel = computed(() => {
  const role = profile.value?.user_type ?? '';
  if (!role) {
    return 'user';
  }

  const mapping: Record<string, string> = {
    admin: 'Administrator',
    teacher: 'Teacher',
    student: 'Student',
  };

  return mapping[role] ?? role;
});
</script>
