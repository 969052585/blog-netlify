<script setup lang="ts">
import {computed, onBeforeMount} from 'vue'
import {Card, CardContent, CardHeader, CardTitle,} from '@/lib/registry/new-york/ui/card'
import {FileArchive} from "lucide-vue-next";
import {cn} from "@/lib/utils";
import {buttonVariants} from "@/lib/registry/new-york/ui/button";
import site from "@/stores/siteConfig";

onBeforeMount(async () => {
  await Promise.all([site.loadStatistics("Article", "Year")])
})

const yearArticles = computed(() => {
  let years = Object.keys(site.statistics.YearArticle)
  if (!years.length) return []
  years.sort().reverse()
  return years.map(year => ({year, value: site.statistics.YearArticle[year]}))
})

function setCheckQuery(value: string) {
  const year = site.checkedQuery.Year
  if (year === value) site.checkedQuery.Year = ''
  else site.checkedQuery.Year = value
  site.page.current = 1
  site.loadPageArticles()
}

</script>

<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle class="justify-start flex items-center text-sm text-foreground/75">
        <FileArchive class="mr-0.5" :size="16"/>
        归档
      </CardTitle>
    </CardHeader>
    <CardContent class="flex flex-col">
      <div @click="setCheckQuery(year)" :key="year" v-for="({value,year}) in yearArticles"
           class="flex items-center justify-between rounded-md border-muted bg-popover hover:px-2 p-1 transition-all hover:scale-[1.02] hover:bg-accent hover:text-accent-foreground"
      >
        <div class="text-secondary-foreground">
          {{ year }}
        </div>
        <div
            :class="cn(buttonVariants({  size: 'xs',variant: 'outline' }), `bg-gray-200 dark:text-gray-800 dark:hover:text-gray-200`,
            year === site.checkedQuery.Year ?
            `bg-secondary-foreground text-secondary dark:bg-secondary
            dark:text-secondary-foreground border-secondary
             dark:border-secondary-foreground`: '')"
        >
          {{ value }}
        </div>
      </div>
    </CardContent>
  </Card>
</template>
