<script setup lang="ts">
import {markRaw, onMounted, ref} from "vue";
import Search from "./components/Search.vue";
import ModuleSwitcher from "./components/ModuleSwitcher.vue";
import UserNav from "./components/UserNav.vue";
import {Loader} from "lucide-vue-next";
import {Provider} from './Provider'

const innerPages = {
  overview: "概览",
  customize: "自定义",
  setting: "设置"
}

type InnerPageKeys = keyof typeof innerPages


interface State {
  page: InnerPageKeys,
  loading: boolean,
  component: any
}


const loadComponent = async (pageKey: InnerPageKeys) => {
  try {
    state.value.loading = true
    const page = await import(`./inner-page/${pageKey}.vue`)
        .finally(() => state.value.loading = false);
    state.value.component = markRaw(page.default);
    state.value.page = pageKey
  } catch (error) {
    console.error('组件加载失败:', error);
  }
};

const state = ref<State>({
  page: 'overview',
  loading: false,
  component: null
})






onMounted(() => {
  loadComponent('overview')
})



</script>

<template>
  <Provider>
    <template #default="{customProp}">
      <div class="md:hidden">
        <VPImage
            alt="Dashboard"
            width="1280"
            height="1214" class="block" :image="{
        dark: '/examples/dashboard-dark.png',
        light: '/examples/dashboard-light.png',
      }"
        />
      </div>

      <div class="hidden flex-col md:flex">
        <div class="border-b">
          <div class="flex h-16 items-center px-4">
            <ModuleSwitcher/>

            <nav
                class="flex items-center space-x-4 lg:space-x-6 mx-6"
            >
              <a v-for="([page,name]) in Object.entries(innerPages)" :key="page" href="javascript:void 0"
                 @click="loadComponent(page as InnerPageKeys)"
                 class="text-sm font-medium transition-colors hover:text-primary"
                 :class="{'text-muted-foreground': state.page !== page}">
                {{ name }}
              </a>
            </nav>

            <div class="ml-auto flex items-center space-x-4">
              <Search/>
              <UserNav/>
            </div>
          </div>
        </div>
        <div v-if="state.loading" class="h-full min-h-[300px] flex items-center justify-center">
          <Loader class="size-10 text-muted-foreground animate-spin"/>
        </div>
        <component :is="state.component" v-else/>
      </div>
    </template>
  </Provider>
</template>
