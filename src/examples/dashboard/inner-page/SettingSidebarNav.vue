<script setup lang="ts">
import {Button} from '@/lib/registry/new-york/ui/button'
import {cn} from '@/lib/utils'
import {inject} from "vue";
import type {SettingNavBarKey} from '../type'
import {settingNavBarItems} from '../type'
import type {Module} from "@/stores/siteConfig";
import {ProvideKey} from "@/examples/dashboard/Provider";

defineProps({
  modelValue: String
})
defineEmits({
  'update:modelValue': (value) => {
    return typeof value === 'string';
  }
})

const active = inject<SettingNavBarKey>("active")
const module = inject<Module>(ProvideKey.MODULE)
</script>

<template>
  <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
    <Button
        v-for="item in settingNavBarItems"
        :key="item.title"
        as="a"
        @click="$emit('update:modelValue',item.value)"
        href="javascript:void 0"
        variant="ghost"
        :class="cn(
        'w-full text-left justify-start',
        active === item.value && 'bg-muted hover:bg-muted',
        item.value === 'permission' && module!.Id === 0 && 'hidden'
      )"
    >
      {{ item.title }}
    </Button>
  </nav>
</template>
