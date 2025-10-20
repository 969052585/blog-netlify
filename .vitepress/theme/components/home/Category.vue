<script setup lang="ts">
import {Card, CardContent, CardHeader, CardTitle,} from '@/lib/registry/new-york/ui/card'
import {LayoutPanelLeft} from "lucide-vue-next";
import {onBeforeMount} from "vue";
import site from '@/stores/siteConfig'
import {cn} from "@/lib/utils";


onBeforeMount(async () => {
  await Promise.all([
    site.loadCategories(),
    site.loadStatistics("Article", "CategoryCode"),
  ])
})

function setCheckQuery(value: string) {
  const categoryCode = site.checkedQuery.CategoryCode
  if (categoryCode === value) site.checkedQuery.CategoryCode = ''
  else site.checkedQuery.CategoryCode = value
  site.page.current = 1
  site.loadPageArticles()
}

</script>

<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle class="justify-start flex items-center text-sm text-foreground/75">
        <LayoutPanelLeft class="mr-0.5" :size="16"/>
        分类
      </CardTitle>
    </CardHeader>
    <CardContent class="flex flex-col">
      <div @click="setCheckQuery(category.Code)"
           v-for="(category) in site.categories.value.filter(item => Boolean(item.Name))"
           :key="`${category.ModuleCode}_${category.Code}`"
           :class="cn(`flex items-center hover:scale-[1.02] hover:px-2 transition-all
          justify-between rounded-md  border-muted bg-popover p-1 hover:bg-accent
          hover:text-accent-foreground peer-data-[state=checked]:border-primary
          [&:has([data-state=checked])]:border-primary`,
          site.checkedQuery.CategoryCode === category.Code && 'bg-primary/10 text-primary/80 hover:bg-primary/20 px-2' || '')"
      >
        <div>
          {{ category.Name}}
        </div>
        <div class="text-base">{{ site.statistics.CategoryArticle[category.Code] }}</div>
      </div>
    </CardContent>

  </Card>
</template>
