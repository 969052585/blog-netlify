<script setup lang="ts">
import type {Table} from '@tanstack/vue-table'
import type {Task} from '../data/schema'
import {Button} from '@/lib/registry/new-york/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/registry/new-york/ui/select'
import ChevronLeftIcon from '~icons/radix-icons/chevron-left'
import ChevronRightIcon from '~icons/radix-icons/chevron-right'

import DoubleArrowLeftIcon from '~icons/radix-icons/double-arrow-left'
import DoubleArrowRightIcon from '~icons/radix-icons/double-arrow-right'

interface DataTablePaginationProps {
  table: Table<Task>
}

defineProps<DataTablePaginationProps>()
</script>

<template>
  <div class="flex items-center justify-between focus-within:px-0.5">
    <div class="flex-1 text-sm text-muted-foreground">
      <span v-if="table.getFilteredSelectedRowModel().rows.length">
        {{ table.getFilteredSelectedRowModel().rows.length }} of
        {{ table.getFilteredRowModel().rows.length }} row(s) selected.
      </span>
    </div>
    <div class="flex items-center space-x-6 lg:space-x-8">
      <div v-if="table.getPageCount()>1" class="flex w-[100px] items-center justify-center text-sm font-medium">
        第 {{ table.getState().pagination.pageIndex + 1 }} 页/共 {{ table.getPageCount() }} 页
      </div>
      <div class="flex items-center space-x-2">
        <p class="text-sm font-medium">
          每页
        </p>
        <Select
            :model-value="`${table.getState().pagination.pageSize}`"
            @update:model-value="table.setPageSize"
        >
          <SelectTrigger class="h-8 w-fit">
            <SelectValue :placeholder="`${table.getState().pagination.pageSize}`"/>
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem v-for="pageSize in [10, 20, 30, 40, 50]" :key="pageSize" :value="`${pageSize}`">
              {{ pageSize }}条
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div v-if="table.getPageCount()>1" class="flex items-center space-x-2">
        <Button
            variant="outline"
            class="hidden h-8 w-8 p-0 lg:flex"
            :disabled="!table.getCanPreviousPage()"
            @click="table.setPageIndex(0)"
        >
          <span class="sr-only">Go to first page</span>
          <DoubleArrowLeftIcon class="h-4 w-4"/>
        </Button>
        <Button
            variant="outline"
            class="h-8 w-8 p-0"
            :disabled="!table.getCanPreviousPage()"
            @click="table.previousPage()"
        >
          <span class="sr-only">Go to previous page</span>
          <ChevronLeftIcon class="h-4 w-4"/>
        </Button>
        <Button
            variant="outline"
            class="h-8 w-8 p-0"
            :disabled="!table.getCanNextPage()"
            @click="table.nextPage()"
        >
          <span class="sr-only">Go to next page</span>
          <ChevronRightIcon class="h-4 w-4"/>
        </Button>
        <Button
            variant="outline"
            class="hidden h-8 w-8 p-0 lg:flex"
            :disabled="!table.getCanNextPage()"
            @click="table.setPageIndex(table.getPageCount() - 1)"
        >
          <span class="sr-only">Go to last page</span>
          <DoubleArrowRightIcon class="h-4 w-4"/>
        </Button>
      </div>
    </div>
  </div>
</template>
