<script setup lang="ts">
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/lib/registry/default/ui/form'
import {Separator} from "@/lib/registry/new-york/ui/separator";
import SidebarNav from "./SettingSidebarNav.vue";
import {inject, provide, ref, customRef} from "vue";
import {Button} from '@/lib/registry/new-york/ui/button'
import {Input} from '@/lib/registry/new-york/ui/input'
import type {Module, Store} from "@/stores/siteConfig";
import type {SettingNavBarKey} from '../type'
import {toTypedSchema} from "@vee-validate/zod";
import {ProvideKey} from "../Provider";
import * as z from "zod";
import {Bug} from "lucide-vue-next";
import {useForm} from 'vee-validate'
import {Textarea} from '@/lib/registry/new-york/ui/textarea'
import * as api from "@/lib/api";
import {useBoolean} from "@/lib/hooks";
import {Switch} from "@/lib/registry/new-york/ui/switch";
import {toast} from "vue-sonner";


const active = ref<SettingNavBarKey>("basic")
const debug = useBoolean(false)

provide("active", active)

const module = inject<Module>(ProvideKey.MODULE)
const loadModule = inject<Store["loadModule"]>(ProvideKey.LOAD_MODULE)

async function change(module: Module) {
  await api.update("Module", module)
  toast.success("修改成功")
  await loadModule?.()
}


async function removeModule(module: Module) {
  await api.remove("Module", module.Id)
  toast.success("删除成功")
  await loadModule?.()
  // 重新加载页面的状态但不刷新路由
}

const moduleFormSchema = toTypedSchema(z.object({
  Id: z.number().optional(),
  Code: z.string({
    message: "模块编码不能为空",
  }),
  Name: z
      .string({
        message: "模块名称不能为空"
      }),
  Description: z.string().max(160, {message: '描述信息最多支持160个文字'}).nullish(),
}))

const {handleSubmit, resetForm} = useForm({
  validationSchema: moduleFormSchema,
  initialValues: {
    ...module
  },
})

const onSubmit = handleSubmit((values) => {
  change(values as Module)
})

</script>

<template>
  <p style="background: #333; color: white" :class="{'hidden': debug.isFalse()}">数据：{{ module }} 菜单：{{ active }}</p>
  <div class="md:hidden">
    <VPImage
        alt="Forms"
        width="1280"
        height="1214" class="block" :image="{
        dark: '/examples/forms-dark.png',
        light: '/examples/forms-light.png',
      }"
    />
  </div>
  <div class="hidden space-y-6 p-10 pb-16 md:block">
    <div class="space-y-0.5 flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold tracking-tight flex items-center gap-1">
          模块设置
          <Bug @click="debug.toggle" :size="20" :class="{
          'text-secondary-foreground/50': debug.isFalse(),
          'text-secondary-foreground/80': debug.isTrue(),
        }"/>
        </h2>
        <p class="text-muted-foreground">
          设置模块信息和开放性
        </p>
      </div>
      <Button @click="removeModule(module!)" v-if="active === 'other' && module!.Id !== 0" >
        删除
      </Button>
      <Button v-if="active !== 'other'" @click="change(module!)">
        保存
      </Button>
    </div>
    <Separator class="my-6"/>
    <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside class="-mx-4 lg:w-1/5">
        <SidebarNav v-model="active"/>
      </aside>
      <div class="flex-1 lg:max-w-2xl">
        <div v-if="active === 'basic'" class="space-y-6">
          <form v-if="module" class="space-y-8" @submit="onSubmit">
            <FormField v-model="module.Id" v-slot="{ componentField }" name="Id">
              <FormItem>
                <FormLabel>模块Id</FormLabel>
                <FormControl>
                  <Input type="number" disabled v-bind="componentField"/>
                </FormControl>
                <FormMessage/>
              </FormItem>
            </FormField>
            <FormField v-model="module.Code" v-slot="{ componentField }" name="Code">
              <FormItem>
                <FormLabel>模块编码</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="请输入模块编码" v-bind="componentField"/>
                </FormControl>
                <FormDescription>
                  模块编码用于页面查询和数据关联，请保持其值唯一。
                </FormDescription>
                <FormMessage/>
              </FormItem>
            </FormField>
            <FormField v-model="module.Name" v-slot="{ componentField }" name="Name">
              <FormItem>
                <FormLabel>模块名称</FormLabel>
                <FormControl>
                  <Input :disabled="!module.Id" type="text" placeholder="请输入模块名称" v-bind="componentField"/>
                </FormControl>
                <FormDescription>
                  模块名称将会展示在导航中，可点击跳转具体页面。
                </FormDescription>
                <FormMessage/>
              </FormItem>
            </FormField>

            <FormField v-model="module.Description" v-slot="{ componentField }" name="Description">
              <FormItem>
                <FormLabel>描述信息</FormLabel>
                <FormControl>
                  <Textarea placeholder="请输入描述信息" v-bind="componentField"/>
                </FormControl>
                <FormDescription>
                  写点什么描述一下你的模块吧。
                </FormDescription>
                <FormMessage/>
              </FormItem>
            </FormField>
          </form>
        </div>
        <div v-if="active === 'permission'" class="space-y-6">
          <div class="flex flex-row items-center justify-between rounded-lg border p-4 space-y-2 gap-2">
            <div class="space-y-0.5">
              <div class="text-base">
                是否热门
              </div>
              <div class="text-sm text-muted-foreground">
                设置为热门将会在展示的时候添加热门图标
              </div>
            </div>
            <Switch :checked="module!.Hot === 'Y'"
                    @update:checked="(bool: boolean) => module!.Hot = bool && 'Y' || 'N'"/>
          </div>
          <div class="flex flex-row items-center justify-between rounded-lg border p-4 space-y-2 gap-2">
            <div class="space-y-0.5">
              <div class="text-base">
                是否公开
              </div>
              <div class="text-sm text-muted-foreground">
                公开的文章可以被其他人看到
              </div>
            </div>
            <Switch :checked="module!.Public === 'Y'"
                    @update:checked="(bool: boolean) => module!.Public = bool && 'Y' || 'N'"/>
          </div>
        </div>
        <div v-if="active === 'other'" class="space-y-6">
          模块创建时间： {{module!.CreatedAt}}
          <br>
          最后更新时间：{{module!.UpdatedAt}}
        </div>
      </div>
    </div>
  </div>
</template>
