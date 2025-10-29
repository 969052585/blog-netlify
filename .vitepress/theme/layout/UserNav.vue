<script setup lang="ts">
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/lib/registry/default/ui/avatar'
import {Button} from '@/lib/registry/new-york/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/lib/registry/new-york/ui/dropdown-menu'
import site from '@/stores/siteConfig'
import {onMounted, ref} from "vue";

onMounted(() => {
  setTimeout(site.getUser, 500)
})

const open = ref(false)
</script>

<template>
  <DropdownMenu v-model:open="open" @update:open="v => {
    if(v && !site.user.value.id) {
      open = false
    }
  }">
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="relative h-8 w-8 rounded-full">
        <Avatar v-if="site.user.value.id" class="h-9 w-9">
          <AvatarImage :src="site.user.value.user_metadata.avatar_url" alt="用户"/>
          <AvatarFallback>用户</AvatarFallback>
        </Avatar>
        <Avatar v-else @click="site.login" class="h-9 w-9">
          <AvatarImage src="/avatars/02.png" alt="用户"/>
          <AvatarFallback>用户</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent v-if="site.user.value.id" class="w-56" align="end">
      <DropdownMenuLabel class="font-normal flex">
        <div class="flex flex-col space-y-1">
          <p class="text-sm font-medium leading-none">
            {{ site.user.value.user_metadata?.full_name }}
          </p>
          <p @click="" class="text-xs leading-none text-muted-foreground">
            {{ site.user.value.email }}
          </p>
        </div>
      </DropdownMenuLabel>
<!--      <DropdownMenuSeparator/>-->
<!--      <DropdownMenuGroup>-->
<!--        <DropdownMenuItem>-->
<!--          菜单1-->
<!--          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>-->
<!--        </DropdownMenuItem>-->
<!--        <DropdownMenuItem>-->
<!--          菜单2-->
<!--          <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>-->
<!--        </DropdownMenuItem>-->
<!--        <DropdownMenuItem>-->
<!--          菜单3-->
<!--          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>-->
<!--        </DropdownMenuItem>-->
<!--        <DropdownMenuItem>菜单4</DropdownMenuItem>-->
<!--      </DropdownMenuGroup>-->
      <DropdownMenuSeparator/>
      <DropdownMenuItem @click="site.logout">
        退出
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
