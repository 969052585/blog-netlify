<script setup lang="ts">
import {Button} from '@/lib/registry/new-york/ui/button'
import {Input} from '@/lib/registry/new-york/ui/input'
import {Label} from '@/lib/registry/new-york/ui/label'

import {cn} from '@/lib/utils'
import LucideSpinner from '~icons/lucide/loader-2'
import GitHubLogo from '~icons/radix-icons/github-logo'
import {reactive,ref} from 'vue'
import {CircleArrowRight, Loader} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {useRouter} from "vitepress";
const $router = useRouter()
const state = reactive({
  checkLoading: false,
  checkPass: false,
  user: {
    email: '',
    password: ''
  }
})

function check() {
  if (import.meta.env.SSR) return
  state.checkLoading = true
  fetch(`/auth/check/${state.user.email}`)
      .then(res => res.json())
      .then(({code,msg}) => {
        if (code !== 200) return toast.warning(msg)
        state.checkPass = true
      }).finally(() => state.checkLoading = false)
}

function login() {
  if (import.meta.env.SSR) return
  fetch(     `/auth/login`,{
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(state.user)
  })
      .then(res => res.json())
      .then(({data: token,code,msg}) => {
        if (code !== 200) return toast.warning(msg)
        //
        localStorage.setItem("X-TOKEN",token)
        localStorage.setItem("X-USER",state.user.email)
        toast.success("登录成功")
        if(window.opener) window.close()
        setTimeout(() =>   $router.go("/dashboard"), 500)
      })
}

const isLoading = ref(false)

async function onSubmit(event: Event) {
  event.preventDefault()
  isLoading.value = true

  setTimeout(() => {
    isLoading.value = false
  }, 3000)
}
</script>
<template>
  <div :class="cn('grid gap-6', $attrs.class ?? '')">
    <form @submit="onSubmit">
      <div class="grid gap-2">
        <div class="relative w-full max-w-sm items-center">
          <Label class="sr-only" for="email">
            Email
          </Label>
          <Input id="email"
                 placeholder="用户名/手机号/邮箱"
                 type="text"
                 auto-capitalize="none"
                 v-model.trim="state.user.email"
                 auto-complete="email"
                 auto-correct="off"
                 class="pr-10"
                 :disabled="isLoading"/>
          <span v-if="!state.checkPass" class="absolute end-0 inset-y-0 flex items-center justify-center px-2">
            <Loader v-if="state.checkLoading" class="size-6 text-muted-foreground animate-spin"/>
            <CircleArrowRight v-else  @keydown.enter="check" @click="check" class="size-6 text-muted-foreground"/>
          </span>
        </div>
        <div v-if="state.checkPass" class="relative w-full max-w-sm items-center">
          <Label class="sr-only" for="email">
            Email
          </Label>
          <Input id="password"
                 autofocus
                 placeholder="密码"
                 type="password"
                 auto-capitalize="none"
                 v-model="state.user.password"
                 auto-complete="password"
                 auto-correct="off"
                 :disabled="isLoading"/>
        </div>

        <Button @click="login" v-if="state.checkPass" :disabled="isLoading">
          <LucideSpinner v-if="isLoading" class="mr-2 h-4 w-4 animate-spin"/>
          登 录
        </Button>
      </div>
    </form>
    <div class="relative hidden">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t"/>
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>
    </div>
    <Button variant="outline" class="hidden" type="button" :disabled="isLoading">
      <LucideSpinner v-if="isLoading" class="mr-2 h-4 w-4 animate-spin"/>
      <GitHubLogo v-else class="mr-2 h-4 w-4"/>
      GitHub
    </Button>
  </div>
</template>
