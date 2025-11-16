<template>
  <div class="flex min-h-screen w-full bg-surface text-foreground">
    <div
      class="hidden flex-1 flex-col justify-between bg-linear-to-br from-primary to-primary/70 p-10 text-primary-foreground lg:flex"
    >
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.3em] opacity-75">
          LMST
        </p>
        <h1 class="mt-4 text-4xl font-bold leading-tight">
          Learning Management &amp; Attendance Platform
        </h1>
        <p class="mt-3 max-w-md text-base text-primary-foreground/80">
          Track attendance, manage rosters, and understand classroom health with
          a single unified workspace.
        </p>
      </div>
      <div
        class="rounded-2xl bg-white/10 p-6 text-sm text-primary-foreground/90 shadow-2xl backdrop-blur"
      >
        <p class="font-semibold">What you can do</p>
        <ul class="mt-2 space-y-1 text-primary-foreground/80">
          <li>• Bulk attendance recording with smart defaults.</li>
          <li>• Real-time dashboards for admin &amp; teachers.</li>
          <li>• Automated monthly summaries and alerts.</li>
        </ul>
      </div>
    </div>
    <div
      class="flex w-full flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:max-w-xl lg:px-12"
    >
      <slot />
    </div>
  </div>
</template>
