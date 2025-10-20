<script setup lang="ts">
import {Card, CardContent, CardHeader, CardTitle} from '@/lib/registry/new-york/ui/card'
import {buttonVariants} from '@/lib/registry/new-york/ui/button'
import {Tags} from "lucide-vue-next";
import {cn} from "@/lib/utils";
import site from '@/stores/siteConfig'
import {onMounted} from "vue";

onMounted(() => {
  site.loadTags()
})
</script>

<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle class="justify-start flex items-center text-sm text-foreground/75">
        <Tags class="mr-0.5 -scale-x-90" size="16"/>
        标签
      </CardTitle>
    </CardHeader>
    <CardContent class="flex flex-wrap gap-2">
      <div
          v-for="tag in site.tags.value"
          :key="tag.Code"
          :class="cn(buttonVariants({  size: 'xs',variant: 'outline' }), `hover:scale-105 transition-all bg-gray-200 dark:text-gray-800 dark:hover:text-gray-200`)">
        {{ tag.Name }}
      </div>
    </CardContent>
  </Card>
</template>
