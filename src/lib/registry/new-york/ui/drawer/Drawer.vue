<script lang="ts" setup>
import type {DrawerRootEmits, DrawerRootProps} from 'vaul-vue'
import {useForwardPropsEmits} from 'radix-vue'
import {DrawerRoot} from 'vaul-vue'
import {provide} from "vue";

const props = withDefaults(defineProps<DrawerRootProps>(), {
  shouldScaleBackground: true,
})

const emits = defineEmits<DrawerRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
provide("direction", props.direction)
</script>

<template>
  <DrawerRoot v-bind="forwarded">
    <slot/>
  </DrawerRoot>
</template>
