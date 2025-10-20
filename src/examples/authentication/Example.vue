<script setup lang="ts">
import {buttonVariants} from '@/lib/registry/new-york/ui/button'
import {cn} from '@/lib/utils'
import UserAuthForm from './components/UserAuthForm.vue'
import BingImage from "./components/BingImage.vue";
</script>

<template>
  <div class="md:hidden">
    <VPImage
        alt="Authentication"
        width="1280"
        height="1214" class="block" :image="{
        dark: '/examples/authentication-dark.png',
        light: '/examples/authentication-light.png',
      }"
    />
  </div>

  <div
      class="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
    <a
        href="javascript:void 0"
        :class="cn(
        buttonVariants({ variant: 'ghost' }),
        'absolute right-4 top-4 md:right-8 md:top-8',
      )"
    >
      注册
    </a>
    <div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
      <div class="absolute inset-0 bg-zinc-900"/>
      <BingImage/>
    </div>
    <div class="lg:p-8">
      <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div class="flex flex-col space-y-2 text-center">
          <h1 class="text-2xl font-semibold tracking-tight">
            登录后台
          </h1>
          <p class="text-sm text-muted-foreground">
            邮箱登录，管理你的网站信息
          </p>
        </div>
        <UserAuthForm/>
        <p class="hidden px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our
          <a
              href="/terms"
              class="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </a>
          and
          <a
              href="/privacy"
              class="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </a>
          .
        </p>


      </div>
    </div>
  </div>
</template>

<style>
.head_cont {
  vertical-align: middle;
  line-height: 39px;
  white-space: nowrap;
  position: relative;
  flex-direction: row;
  display: flex;
  margin-right: auto
}

.head_cont .scope_cont, .head_cont .logo_cont {
  display: inline-block
}

.head_cont .logo_cont {
  width: 154px;
  height: 24px
}

.head_cont .scope_cont {
  margin-left: 72px
}

.head_cont .logo {
  position: absolute;
  width: 154px;
  height: 24px;
  transform: scale(1.16);
  filter: drop-shadow(0 0 24px rgba(0, 0, 0, .45))
}

@media screen and (max-width: 349px) {
  .head_cont .logo {
    width: 77px;
    height: 12px
  }
}

.head_cont .logo .squares .top_l {
  fill: #f26522
}

.head_cont .logo .squares .top_r {
  fill: #8dc63f
}

.head_cont .logo .squares .bom_l {
  fill: #00aeef
}

.head_cont .logo .squares .bom_r {
  fill: #ffc20e
}

.head_cont .logo .ms_text, .head_cont .logo .b_text {
  fill: #fff
}

.head_cont .logo.logo_click {
  cursor: pointer
}
</style>
