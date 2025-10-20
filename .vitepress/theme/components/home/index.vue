<script setup lang="ts">
import SiteOverview from './SiteOverview.vue'
import Category from './Category.vue'
import Tag from './Tag.vue'
import RecentArticle from './RecentArticle.vue'
import Archive from './Archive.vue'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/lib/registry/new-york/ui/card";
import {CalendarClock} from "lucide-vue-next";
import {Button} from "@/lib/registry/new-york/ui/button";
import {bus} from '@/lib/utils'
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from '@/lib/registry/new-york/ui/pagination'
import {onMounted, watch, onBeforeMount,onBeforeUnmount,ref} from "vue";
import site from "@/stores/siteConfig";
import {buttonVariants} from "@/lib/registry/default/ui/button";

onBeforeMount(() => {
  bus.on("CheckedModuleChange", site.loadPageArticles)
})

onBeforeUnmount(() => {
  bus.off("CheckedModuleChange")
})
function extractPlainTextFromMarkdown(markdown: string) {
  // 移除标题本身（包括标记）
  let text = markdown.replace(/^(#+)\s.*$/gm, '');
  // 移除加粗、斜体标记
  text = text.replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2');
  // 移除删除线标记
  text = text.replace(/~~(.*?)~~/g, '$1');
  // 移除链接标记
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // 移除图片标记
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  // 移除列表标记
  text = text.replace(/^([\*\-\+]|\d+\.)\s/gm, '');
  // 移除代码块标记
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`([^`]+)`/g, '$1');
  // 移除引用标记
  text = text.replace(/^>\s/gm, '');
  // 移除水平线标记
  text = text.replace(/^-{3,}$/gm, '');
  // 移除 HTML 标签
  text = text.replace(/<[^>]*>/g, '');
  return text;
}
</script>
<template>
  <div class="flex flex-wrap">
    <!-- 左侧栏 -->
    <div class="w-full hidden md:block md:w-1/4 py-4 h-fit sticky top-12">
      <SiteOverview/>
      <Category class="mt-2"/>
      <Tag class="mt-2"/>
    </div>
    <!-- 中间内容区 -->
    <div class="w-full md:w-2/4 p-4 ">
      <Card v-for="(article,i) in site.articles.value" :key="i" :class="{'mt-2': i > 0}">
        <CardContent v-if="article.Cover" class="p-0">
          <img alt="图片" class="w-full max-h-[300px]" :src="article.Cover">
        </CardContent>
        <CardHeader class="p-4 pb-0">
          <CardTitle class="text-foreground/80 hover:text-foreground cursor-pointer">
            {{ article.Title }}
          </CardTitle>
          <CardDescription class="text-muted-foreground line-clamp-2 hover:line-clamp-3">
            {{ extractPlainTextFromMarkdown(article.Content) }}
          </CardDescription>
        </CardHeader>

        <CardFooter class="flex justify-between items-center p-4 pt-0 pb-2">
          <div class="text-muted-foreground/80 flex items-center">
            <CalendarClock class="mr-1 " :size="16"/>
            {{ article.UpdatedAt || article.CreatedAt }} · {{
              site.categories.value
                  .find(item => item.Code === article.CategoryCode && item.ModuleCode === article.ModuleCode)?.Name
            }}
          </div>
          <a :href="`/article?Id=${article.Id}`" :class="buttonVariants({ variant: 'link'})" class="text-secondary-foreground/85">阅读</a>
        </CardFooter>
      </Card>
      <Pagination v-if="site.page.total! > site.page.size" v-model:page="site.page.current" @update:page="site.loadPageArticles" class="mt-2 w-fit ml-auto"
                  v-slot="{page,pageCount}" :show-edges="false"
                  :items-per-page="site.page.size" :total="site.page.total" :sibling-count="2">
        <PaginationList v-slot="{ items }" class="flex items-center gap-1">
          <PaginationFirst v-if="page !== 1"/>
          <PaginationPrev v-if="page !== 1"/>
          <template v-for="(item, index) in items">
            <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
              <Button class="w-10 h-10 p-0" :variant="item.value === page ? 'default' : 'outline'">
                {{ item.value }}
              </Button>
            </PaginationListItem>
            <PaginationEllipsis v-else :key="item.type" :index="index"/>
          </template>
          <PaginationNext v-if="page !== pageCount"/>
          <PaginationLast v-if="page !== pageCount"/>
        </PaginationList>
      </Pagination>
    </div>
    <!-- 右侧栏 -->
    <div class="w-full hidden md:block md:w-1/4 py-4 h-fit sticky top-12">
      <RecentArticle/>
      <Archive class="mt-2"/>
    </div>
  </div>
</template>
