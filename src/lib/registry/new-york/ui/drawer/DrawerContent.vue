<script lang="ts" setup>
import type {DialogContentEmits, DialogContentProps} from 'radix-vue'
import type {HtmlHTMLAttributes} from 'vue'
import {cn} from '@/lib/utils'
import {useForwardPropsEmits} from 'radix-vue'
import {DrawerContent, DrawerPortal} from 'vaul-vue'
import DrawerOverlay from './DrawerOverlay.vue'
import {inject, computed} from "vue";
import type {DrawerRootProps} from 'vaul-vue'

const props = defineProps<DialogContentProps & { class?: HtmlHTMLAttributes['class'] }>()
const emits = defineEmits<DialogContentEmits>()

const forwarded = useForwardPropsEmits(props, emits)
const direction = inject<DrawerRootProps['direction']>("direction")

</script>

<template>
  <DrawerPortal>
    <DrawerOverlay/>
    <DrawerContent
        v-bind="forwarded" :class="cn(
        'fixed z-50 flex rounded-t-[10px] border bg-background gap-2',
        props.class,
        direction === 'right' && 'right-0 pr-2 h-full overflow-y-scroll overflow-x-hidden bottom-0 flex-row',
        direction === 'left' && 'left-0 pl-2 h-full w-fit max-w-none bottom-0 flex-row-reverse',
        direction === 'bottom' && 'left-0 px-2 w-full bottom-0 flex-col',
        direction === 'top' && 'top-0 w-full px-2 flex-col-reverse',
      )"
    >
      <div :class="cn(
          ' rounded-full bg-muted hover:bg-foreground/40',
          direction === 'bottom' && 'mx-auto mt-2 h-2 w-[100px] cursor-ns-resize',
          direction === 'top' && 'mx-auto mb-2 h-2 w-[100px] cursor-ns-resize',
          direction === 'left' && 'my-auto mr-2 w-2 h-[100px] cursor-ew-resize',
          direction === 'right' && 'my-auto ml-2 w-2 h-[100px] cursor-ew-resize',
      )"/>
      <main class="flex max-h-screen max-w-screen overflow-hidden" :class="{
        'flex-col': direction === 'right' || direction === 'left',
        'flex-row': direction === 'top' || direction === 'bottom',
      }">
        <slot/>
      </main>
    </DrawerContent>
  </DrawerPortal>
</template>
