<script setup lang="ts">
import {ScrollArea} from "@/lib/registry/default/ui/scroll-area";
import TableOfContent from "../components/TableOfContent.vue";
import {useData} from "vitepress";
import {
  Clock1,
  Clock10,
  Clock11,
  Clock12,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9, FileText
} from 'lucide-vue-next'
import store from '@/stores/articleStore'
import {Card, CardContent, CardHeader, CardTitle} from "@/lib/registry/new-york/ui/card";
import type {Article} from '@/stores/siteConfig'

const Clock = [
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12
]

function getClock(n: string) {
  let i = Number(n)
  i = i % 12;
  return Clock[i]
}

const {frontmatter} = useData()

// <!--  <div class="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">-->
</script>

<template>

  <div
      class="container flex-1 items-start md:grid md:grid-cols-[minmax(0,1fr)] md:gap-6 lg:grid-cols-[minmax(0,1fr)] lg:gap-10">
    <aside v-if="false"
           class="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block overflow-y-auto"
    >
      <ScrollArea orientation="vertical" class="relative overflow-hidden h-full py-6 pr-6 lg:py-8" :type="'auto'">
        <div class="w-full flex flex-col gap-2">
          <Card v-for="item in store.sidebarNavItems" :key="item.title">
            <CardHeader class="pb-2">
              <CardTitle class="justify-start flex items-center text-sm text-foreground/75">
                {{ item.title }}
              </CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col">
              <div v-for="(article, _) in item.items as Article[]" :key="article.Title">
                <div class="text-muted-foreground text-xs">
                  {{ (article.CreatedAt || '').substring(0, 19).replace("T", " ") }}
                </div>
                <a :href="`/article?Id=${article.Id}`"
                   class="text-base text-wrap line-clamp-2 hover:line-clamp-3 rounded-md whitespace-break-spaces  w-full border-muted bg-popover p-1 hover:first-letter:text-2xl transition-all hover:bg-accent hover:text-accent-foreground">
                  {{ article.Title }}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </aside>
    <main class="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
      <div class="mx-auto w-full min-w-0">
        <div class="block xl:hidden">
          <TableOfContent/>
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-center space-x-4">
            <h1 class="scroll-m-20 text-4xl font-bold tracking-tight">
              {{ store.article.Title }}
            </h1>
            <span v-if="false"
                  class="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                {{ frontmatter.label }}
              </span>
          </div>
          <p v-if="store.article.CreatedAt" class="flex items-center justify-center text-muted-foreground border-b-2">
            <component :is="getClock(store.article.CreatedAt.substring(11, 13))" class="h-4 w-4 mr-1"/>
            {{ (store.article.CreatedAt || '').substring(0, 19).replace("T", " ") }}创建
          </p>
        </div>
        <slot/>
      </div>

      <div class="hidden text-sm xl:block">
        <div class="sticky top-16 -mt-10 h-[calc(100vh-3.5rem)] overflow-hidden pt-6">
          <TableOfContent show-carbon-ads/>
        </div>
      </div>
    </main>
  </div>
</template>
