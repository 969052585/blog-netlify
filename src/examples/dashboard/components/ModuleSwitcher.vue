<script setup lang="ts">
import {Avatar, AvatarFallback, AvatarImage,} from '@/lib/registry/new-york/ui/avatar'
import {toast} from 'vue-sonner'
import {Button} from '@/lib/registry/new-york/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/lib/registry/new-york/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/lib/registry/new-york/ui/dialog'

import {Input} from '@/lib/registry/new-york/ui/input'
import {Label} from '@/lib/registry/new-york/ui/label'
import {Popover, PopoverContent, PopoverTrigger,} from '@/lib/registry/new-york/ui/popover'

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/lib/registry/new-york/ui/select'
import {cn} from '@/lib/utils'
import CaretSortIcon from '~icons/radix-icons/caret-sort'
import CheckIcon from '~icons/radix-icons/check'
import PlusCircledIcon from '~icons/radix-icons/plus-circled'
import {inject, onBeforeMount, ref} from 'vue'
import * as api from '@/lib/api'
import type {Module} from '@/stores/siteConfig'
import siteConfig from '@/stores/siteConfig'
import type {ChangeModule} from "../Provider";
import {ProvideKey} from "../Provider";

const {modules, loadModule} = siteConfig

const changeModule = inject<ChangeModule>(ProvideKey.CHANGE_MODULE)
const module = inject<Module>(ProvideKey.MODULE)

/*重复代码 loadModule*/
// const modules = [{
//   values: [{
//     "Id": 0,
//     "Name": "全站"
//   }]
// }, {
//   label: "公开",
//   values: []
// }, {
//   label: "私有",
//   values: []
// }]


const open = ref(false)

const state = ref({
  modules,
  module: null as unknown as Module,
  showNewDialog: false,
})

async function addModule() {
  await api.add(`Module`, state.value.module)
  state.value.showNewDialog = false
  state.value.module = null as unknown as Module
  toast.success("模块添加成功")
  await loadModule()
}

// async function loadModule() {
//   const list = await api.all<Array<Module>>(`Module`)
//   const group = groupBy(list, "Public")
//   state.value.modules[1].values = group.Y
//   state.value.modules[2].values = group.N
// }

onBeforeMount(async () => {
  await loadModule()
  changeModule!(modules.value[0].values[0])
})



const filter = (list, name) => {
  return list.filter(i => i.toLowerCase()?.includes(name))
}
</script>

<template>
  <Dialog v-model:open="state.showNewDialog">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
            v-if="module"
            variant="outline"
            role="combobox"
            aria-expanded="open"
            aria-label="Select a team"
            :class="cn('w-[200px] justify-between', $attrs.class ?? '')"
        >
          <Avatar class="mr-2 h-5 w-5">
            <AvatarImage
                :src="`https://avatar.vercel.sh/${module.Name}.png`"
                :alt="module.Name"
            />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          {{ module.Name }}
          <CaretSortIcon class="ml-auto h-4 w-4 shrink-0 opacity-50"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[200px] p-0">
        <Command :filter-function="filter">
          <CommandList>
            <CommandInput placeholder="搜索模块"/>
            <CommandEmpty>没有搜索到模块.</CommandEmpty>
            <CommandGroup v-for="module in modules" :key="module.label" :heading="module.label">
              <CommandItem
                  v-for="item in module.values"
                  :key="item.Id"
                  :value="item.Name"
                  class="text-sm"
                  @select="() => {
                  changeModule!(item)
                  open = false
                }"
              >
                <Avatar class="mr-2 h-5 w-5">
                  <AvatarImage
                      :src="`https://avatar.vercel.sh/${item.Name}.png`"
                      :alt="item.Name"
                      class="grayscale"
                  />
                  <AvatarFallback>暂无图标</AvatarFallback>
                </Avatar>
                {{ item.Name }}
                <CheckIcon
                    :class="cn('ml-auto h-4 w-4',
                             module.Id === item.Id
                               ? 'opacity-100'
                               : 'opacity-0',
                  )"
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
          <CommandSeparator/>
          <CommandList>
            <CommandGroup>
              <DialogTrigger as-child>
                <CommandItem
                    value="create-team"
                    @select="() => {
                    open = false
                    state.showNewDialog = true
                    state.module = {} as Module
                  }"
                >
                  <PlusCircledIcon class="mr-2 h-5 w-5"/>
                  添加模块
                </CommandItem>
              </DialogTrigger>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>添加模块</DialogTitle>
        <DialogDescription>
          添加一个新的模块到你的网站
        </DialogDescription>
      </DialogHeader>
      <div v-if="state.module" class="space-y-4 py-2 pb-4">
        <div class="space-y-2">
          <Label for="name">模块名称</Label>
          <Input v-model="state.module.Name" id="name" placeholder="输入模块名称"/>
        </div>
        <div class="space-y-2">
          <Label for="plan">模块属性</Label>
          <Select v-model="state.module.Public">
            <SelectTrigger>
              <SelectValue placeholder="选择模块属性"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Y">
                <span class="font-medium">公开</span> -
                <span class="text-muted-foreground">
                    所有人可见
                  </span>
              </SelectItem>
              <SelectItem value="N">
                <span class="font-medium">私有</span> -
                <span class="text-muted-foreground">
                    仅自己可见
                  </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="state.showNewDialog = false">
          取消
        </Button>
        <Button @click="addModule" type="submit">
          添加
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
