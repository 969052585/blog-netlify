<script setup lang="ts">
import {Card, CardContent, CardHeader, CardTitle,} from '@/lib/registry/new-york/ui/card'
import {FileText} from "lucide-vue-next";
import * as api from '@/lib/api'
import {markRaw, onBeforeMount, ref} from 'vue'
import type {Article} from "@/stores/siteConfig";

const articles = ref<Article[]>([])

onBeforeMount(async () => {
  let list = await api.list<Article>("Article", {},{limit: 5,fields: ["Id","Title","CreatedAt"], orderBy: ['-CreatedAt']})
  articles.value = markRaw(list)
})
</script>

<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle class="justify-start flex items-center text-sm text-foreground/75">
        <FileText class="mr-0.5" size="16"/>
        最近文章
      </CardTitle>
    </CardHeader>
    <CardContent class="flex flex-col">
      <div v-for="(article, i) in articles" :key="i">
        <div class="text-muted-foreground text-xs">
          {{article.CreatedAt}}
        </div>
        <a :href="`/article?Id=${article.Id}`" class="text-base text-wrap line-clamp-2 hover:line-clamp-3 rounded-md whitespace-break-spaces  w-full border-muted bg-popover p-1 hover:first-letter:text-2xl transition-all hover:bg-accent hover:text-accent-foreground">
          {{article.Title}}
        </a>
      </div>
    </CardContent>
  </Card>
</template>
