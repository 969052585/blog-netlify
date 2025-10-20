<script setup lang="ts">
import type {TableOfContents, TableOfContentsItem} from '../types/docs'
import {buttonVariants} from '@/lib/registry/default/ui/button'
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/lib/registry/default/ui/collapsible'
import {ScrollArea} from '@/lib/registry/default/ui/scroll-area'
import {onContentUpdated} from 'vitepress'
import {inject, onMounted, onUnmounted, provide, ref, shallowRef} from 'vue'
import CarbonAds from '../components/CarbonAds.vue'
import TableOfContentTree from './TableOfContentTree.vue'
import type {Article} from "@/stores/siteConfig";
import store from '@/stores/articleStore'
import {debounce} from "lodash-es";
import {isElementInViewport} from "@/lib/utils";

defineProps<{
  showCarbonAds?: boolean
}>()

const headers = shallowRef<TableOfContents>()

function getHeadingsWithHierarchy(divId: string, cancel: Function) {
  const div = document.querySelector(divId)
  if (!div)
    return {items: []}
  cancel()
  const headings: HTMLHeadingElement[] = Array.from(
      div.querySelectorAll('h2, h3'),
  )
  const hierarchy: TableOfContents = {items: []}
  let currentLevel: TableOfContentsItem | undefined

  headings.forEach((heading: HTMLHeadingElement) => {
    const level = Number.parseInt(heading.tagName.charAt(1))
    if (!heading.id) {
      const newId = heading.textContent
          ?.replaceAll(/[^a-z0-9 ]/gi, '')
          .replaceAll(' ', '-')
          .toLowerCase()
      heading.id = `${newId}`
    }

    const item: TableOfContentsItem = {
      title: heading.textContent || '',
      url: `#${heading.id}`,
      items: [],
    }

    if (level === 2) {
      hierarchy.items.push(item)
      currentLevel = item
    } else if (level === 3 && currentLevel?.items) {
      currentLevel.items.push(item)
    } else {
      hierarchy.items.push(item)
    }
  })
  return hierarchy
}

const elementsInViewport = ref<string[]>([])

provide("elementsInViewport", elementsInViewport)

const checkElementInViewport = debounce(() => {
  let nodes = document.querySelectorAll('.vditor-preview .vditor-reset h2[id],.vditor-preview .vditor-reset h3[id]');
  let oldValue = elementsInViewport.value
  let res: string[] = []
  nodes.forEach(el => {
    if (isElementInViewport({el})) res.push('#' + el.id)
  })
  if (res.length) {
    elementsInViewport.value = res
    return
  }
  elementsInViewport.value = [oldValue[0]]
}, 500)
onMounted(() => {
  window.addEventListener('scroll', checkElementInViewport)
})
onUnmounted(() => {
  window.removeEventListener('scroll', checkElementInViewport)
})

onContentUpdated(() => {
  let timer: any
  timer = setInterval(() => {
    headers.value = getHeadingsWithHierarchy('#vditor > div.vditor-content > div.vditor-preview > div.vditor-reset', () => clearInterval(timer))
  }, 1000)
})

</script>

<template>
  <div class="hidden xl:block">
    <ScrollArea id="article-outline" orientation="vertical" class="h-[calc(100vh-6.5rem)] z-30 md:block overflow-y-auto" type="hover">
      <div class="space-y-2">
        <p class="font-medium sticky top-0 border-b-2 bg-background">
          大纲 {{ store.article.Title }}
        </p>
        <TableOfContentTree :tree="headers" :level="1"/>
        <CarbonAds v-if="showCarbonAds"/>
      </div>
    </ScrollArea>
  </div>

  <div class="block xl:hidden mb-6">
    <Collapsible>
      <CollapsibleTrigger :class="buttonVariants({ variant: 'outline' })">
        On This Page
      </CollapsibleTrigger>
      <CollapsibleContent class="text-sm mt-4 border-l pl-4">
        <TableOfContentTree :tree="headers" :level="1"/>
      </CollapsibleContent>
    </Collapsible>
  </div>
</template>
