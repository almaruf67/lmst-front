import { afterEach, beforeEach } from 'vitest';
import {
  computed,
  effectScope,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  reactive,
  readonly,
  ref,
  shallowReactive,
  shallowRef,
  toRef,
  toValue,
  watch,
  watchEffect,
} from 'vue';

Object.assign(globalThis, {
  computed,
  effectScope,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  reactive,
  readonly,
  ref,
  shallowReactive,
  shallowRef,
  toRef,
  toValue,
  watch,
  watchEffect,
});

beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
