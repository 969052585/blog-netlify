<script setup lang="ts">
import type {TableOfContentsItem} from '../types/docs'
import {cn, isElementInViewport} from '@/lib/utils'
import {useRoute} from 'vitepress'
import {debounce} from 'lodash-es'
import {inject, onMounted, onUnmounted, ref, watch} from 'vue'

withDefaults(defineProps<{
  level: number
  tree: TableOfContentsItem
}>(), {
  level: 1,
  tree: () => ({
    items: [],
  }),
})

const route = useRoute()
const hash = ref('')

function setHash() {
  hash.value = location.hash
}

const elementsInViewport = inject<string[]>('elementsInViewport')


onMounted(() => {
  window.addEventListener('hashchange', setHash)
  setHash()
})
onUnmounted(() => {
  window.removeEventListener('hashchange', setHash)
})
watch(() => route.path, () => {
  setHash()
})
</script>

<template>
  <ul :class="cn('m-0 list-none', { 'pl-4': level !== 1 })">
    <template v-if="tree.items?.length">
      <li v-for="item in tree.items" :key="item.title" class="mt-0 pt-2">
        <a
            :href="item.url"
            :class="
            cn('inline-block no-underline transition-all hover:text-foreground',
               (hash === item.url || elementsInViewport!.includes(item.url!))
                 ? 'font-medium text-foreground scale-[1.02]'
                 : 'text-muted-foreground')"
        >{{ item.title }}
          <span v-if="elementsInViewport!.includes(item.url!)"
                class="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                阅读中
              </span>
        </a>

        <TableOfContentTree v-if="item.items?.length" :tree="item" :level="level + 1"/>
      </li>
    </template>
  </ul>
</template>
