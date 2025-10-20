<script setup lang="ts">
import {Button} from '@/lib/registry/new-york/ui/button'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from '@/lib/registry/new-york/ui/card'
import {Label} from '@/lib/registry/new-york/ui/label'
import {CodeXml} from "lucide-vue-next";
import {siteConfig} from "../../config/site";
import site from "@/stores/siteConfig";
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex flex-col items-center">
        <CodeXml class="h-6 w-6 hover:rotate-180 transition-transform"/>
        <div>{{ siteConfig.name }}</div>
      </CardTitle>
      <CardDescription class="text-center">
        主动深挖、顺应趋势、重构关系、点滴积累
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-6">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <Label
              for="card"
              class="flex flex-col  items-center justify-between rounded-md  border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div class="text-base hover:font-bold">
              {{ Object.values(site.statistics.CategoryArticle).reduce((a,b) => a+b,0)}}
            </div>
            <div class="text-secondary-foreground">
              文章
            </div>
          </Label>
        </div>
        <div>
          <Label
              for="paypal"
              class="flex flex-col items-center justify-between rounded-md  border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div class="text-base hover:font-bold">{{site.categories.value.length}}</div>
            <div class="text-secondary-foreground">
              分类
            </div>
          </Label>
        </div>
        <div>
          <Label
              for="apple"
              class="flex flex-col items-center justify-between rounded-md  border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div class="text-base hover:font-bold">{{site.tags.value.length}}</div>
            <div class="text-secondary-foreground">
              标签
            </div>
          </Label>
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button class="w-full">
        收藏网站
      </Button>
    </CardFooter>
  </Card>
</template>
