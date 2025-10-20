<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

<template>
  <nav
    :class="cn('flex items-center space-x-4 lg:space-x-6 mx-6', $attrs.class ?? '')"
  >
    <a
      href="/examples/dashboard"
      class="text-sm font-medium transition-colors hover:text-primary"
    >
      Overview
    </a>
    <a
      href="/examples/dashboard"
      class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      Customers
    </a>
    <a
      href="/examples/dashboard"
      class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      Products
    </a>
    <a
      href="#setting"
      class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      设置
    </a>
  </nav>
</template>
