import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import mitt from 'mitt'

type Events = {
  CheckedModuleChange: string
  Unauthorized: unknown
}

export const bus = mitt<Events>()
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value
    = typeof updaterOrValue === 'function'
      ? updaterOrValue(ref.value)
      : updaterOrValue
}


export function getQuery(key: string) {
  if (import.meta.env.SSR) return ''
  return new URLSearchParams(location.search).get(key) || ''
}

export function isElementInViewport({selector, el}: {selector?: string, el?: Element}) {
  if (!el) el = document.querySelector(selector as string) as Element
  if (!el) return false
  const rect = el.getBoundingClientRect();
  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
