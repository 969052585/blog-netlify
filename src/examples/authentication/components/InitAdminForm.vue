<script setup lang="ts">
import {Button} from '@/lib/registry/new-york/ui/button'
import {Input} from '@/lib/registry/new-york/ui/input'
import {Label} from '@/lib/registry/new-york/ui/label'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/lib/registry/new-york/ui/card'
import {reactive, ref} from '@vue/reactivity'
import {toast} from 'vue-sonner'
import LucideSpinner from '~icons/lucide/loader-2'
import {useRouter} from 'vitepress'


const $router = useRouter()
const isLoading = ref(false)

interface InitForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const props = defineProps<{
  success: () => void
}>()

const state = reactive<InitForm>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

function validateForm(): boolean {
  if (!state.name.trim()) {
    toast.warning('请输入姓名')
    return false
  }
  if (!state.email.trim()) {
    toast.warning('请输入邮箱')
    return false
  }
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(state.email)) {
    toast.warning('请输入有效的邮箱地址')
    return false
  }
  if (!state.password) {
    toast.warning('请设置密码')
    return false
  }
  if (state.password.length < 6) {
    toast.warning('密码长度至少 6 位')
    return false
  }
  if (state.password !== state.confirmPassword) {
    toast.warning('两次输入的密码不一致')
    return false
  }
  return true
}

async function onSubmit(event: Event) {
  event.preventDefault()
  
  if (!validateForm()) return
  
  isLoading.value = true
  
  try {
    const response = await fetch('/functions/auth/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: state.name,
        email: state.email,
        password: state.password,
        admin: true
      })
    })
    
    const result = await response.json()
    
    if (result.code !== 200) {
      toast.warning(result.msg || '初始化失败')
      return
    }
    
    toast.success('初始化成功！即将跳转到登录页面')

    setTimeout(() => {
      props.success()
    }, 1500)
  } catch (error) {
    console.error('初始化失败:', error)
    toast.error('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Card class="w-full max-w-md">
    <CardHeader>
      <div class="text-center">
        <CardTitle class="text-2xl font-bold">初始化后台管理账号</CardTitle>
        <CardDescription class="mt-2">
          创建第一个管理员账号，用于管理后台系统
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent>
      <form @submit="onSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="name">姓名</Label>
          <Input
            id="name"
            v-model="state.name"
            placeholder="请输入您的姓名"
            :disabled="isLoading"
            auto-complete="name"
          />
        </div>
        
        <div class="space-y-2">
          <Label for="email">邮箱</Label>
          <Input
            id="email"
            v-model="state.email"
            type="email"
            placeholder="请输入邮箱地址"
            :disabled="isLoading"
            auto-complete="email"
          />
        </div>
        <div class="space-y-2">
          <Label for="password">密码</Label>
          <Input
            id="password"
            v-model="state.password"
            type="password"
            placeholder="请设置密码（至少 6 位）"
            :disabled="isLoading"
            auto-complete="new-password"
          />
        </div>
        
        <div class="space-y-2">
          <Label for="confirmPassword">确认密码</Label>
          <Input
            id="confirmPassword"
            v-model="state.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :disabled="isLoading"
            auto-complete="new-password"
          />
        </div>
        
        <div class="pt-2">
          <Button type="submit" class="w-full" :disabled="isLoading">
            <LucideSpinner v-if="isLoading" class="mr-2 h-4 w-4 animate-spin"/>
            {{ isLoading ? '创建中...' : '创建管理员账号' }}
          </Button>
        </div>
        
        <p class="text-xs text-muted-foreground text-center mt-4">
          此操作将创建系统第一个管理员账号，请妥善保管您的登录信息
        </p>
      </form>
    </CardContent>
  </Card>
</template>
