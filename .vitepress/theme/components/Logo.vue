<script setup lang="ts">
import {siteConfig} from '../config/site'
import {CodeXml} from 'lucide-vue-next'
</script>

<template>
  <a href="/" class="mr-4 md:mr-2 lg:mr-6 flex items-center lg:space-x1 xl:space-x-2">
    <CodeXml class="h-6 w-6 hover:rotate-180 transition-transform"/>
    <span class="font-bold">
      {{ siteConfig.name }}
    </span>
  </a>
</template>
