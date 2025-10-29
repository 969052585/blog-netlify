<script setup lang="ts">
import {Button} from '@/lib/registry/default/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/lib/registry/default/ui/command'
import {Dialog, DialogContent} from '@/lib/registry/default/ui/dialog'
import {Toaster as DefaultToaster} from '@/lib/registry/default/ui/toast'
import {Toaster as NewYorkSonner} from '@/lib/registry/new-york/ui/sonner'
import {Toaster as NewYorkToaster} from '@/lib/registry/new-york/ui/toast'
import {TooltipProvider} from '@/lib/registry/new-york/ui/tooltip'
import UserNav from './UserNav.vue'

import {useConfigStore} from '@/stores/config'
import {useMagicKeys, useToggle} from '@vueuse/core'
import Circle from '~icons/radix-icons/circle'

import {FileIcon} from '@radix-icons/vue'
import RadixIconsGithubLogo from '~icons/radix-icons/github-logo'
import RadixIconsMoon from '~icons/radix-icons/moon'
import RadixIconsSun from '~icons/radix-icons/sun'
import {Content, useData, useRoute, useRouter} from 'vitepress'
import {computed, getCurrentInstance, onMounted, ref, watch} from 'vue'
import Kbd from '../components/Kbd.vue'
import Logo from '../components/Logo.vue'
import MobileNav from '../components/MobileNav.vue'
import {Toaster} from '@/lib/registry/default/ui/sonner'

import ThemePopover from '../components/ThemePopover.vue'
import {docsConfig, type NavItem} from '../config/docs'
import {toast} from 'vue-sonner'
import type {Module} from '@/stores/siteConfig'
import site from '@/stores/siteConfig'
import {bus, getQuery} from '@/lib/utils'
import {ApiDataMap} from "@/lib/api";
import {createTemplateHook} from '@/lib/hooks'


const {radius, theme} = useConfigStore()
// Whenever the component is mounted, update the document class list
onMounted(() => {
  document.documentElement.style.setProperty('--radius', `${radius.value}rem`)
  document.documentElement.classList.add(`theme-${theme.value}`)
  bus.on("Unauthorized", site.openLoginPage)
  site.loadModule()
  checkLogin()
  site.setCheckedModule(getQuery('module'))
})

const {frontmatter, isDark} = useData()
const [DefineNavMenu, UseNavMenu] = createTemplateHook()
const $route = useRoute()
const $router = useRouter()

function checkLogin() {
  if (!import.meta.env.SSR) return;
  const requireAuth = $route.data.frontmatter.auth
  if (!requireAuth) return
  const title = $route.data.frontmatter.title
  console.log(`页面 ${title} requireAuth.`)
  if (localStorage.getItem("X-TOKEN")) return;
  toast.warning("登录状态已过期, 请重新登录", {position: "top-right"})
  setTimeout(site.openLoginPage, 500)
}


const toggleDark = useToggle(isDark)


const links = [
  {
    name: 'GitHub',
    href: 'https://gitee.com/szh9690/blog-netlify',
    icon: RadixIconsGithubLogo,
  },
  // {
  //   name: 'X',
  //   href: 'https://x.com',
  //   icon: TablerBrandX,
  // },
]


const isOpen = ref(false)
const {Meta_K, Ctrl_K} = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey))
      e.preventDefault()
  },
})

watch([Meta_K, Ctrl_K], (v) => {
  if (v[0] || v[1])
    isOpen.value = true
})

function handleSelectModule(module: Module) {
  site.setCheckedModule(module.Code)
  history.pushState({}, '', `/?module=${module.Code}`)
  isOpen.value = false
}

watch(() => $route.path, (n) => {
  // @ts-expect-error View Transition API not supported by all the browser yet
  if (document.startViewTransition) {
    // @ts-expect-error View Transition API not supported by all the browser yet
    document.startViewTransition(() => {
      console.log('soft navigating to: ', n)
    })
  }
})

function log() {
  console.log(ApiDataMap.getInstance().getMap())
}
</script>

<template>
  <TooltipProvider>
    <Toaster/>
    <div vaul-drawer-wrapper v-if="$route.data.frontmatter.layout === false">
      <Content :key="$route.path"/>
    </div>
    <div vaul-drawer-wrapper v-else class="flex min-h-screen flex-col bg-background">
      <header class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border">
        <div
            class="container flex h-14 max-w-screen-2xl items-center"
        >
          <div class="mr-4 md:mr-1 hidden md:flex">
            <Logo/>

            <nav v-if="false"
                 class="flex items-center max-lg:space-x-4 space-x-6 text-sm font-medium"
            >
              <a
                  v-for="route in [docsConfig.mainNav[0]]"
                  :key="route.title"
                  :href="route.href"
                  :target="route.external ? '_target' : void 0"
                  class="transition-colors hover:text-foreground/80 text-foreground/60"
                  :class="{
                  'font-semibold !text-foreground': $route.path === `${route.href}.html` || $route.path === `${route.href}`,
                  'hidden lg:block': route?.href?.includes('github'),
                }"
              >
                {{ route.title }}
              </a>
            </nav>
            <nav
                class="flex items-center max-lg:space-x-4 space-x-6 text-sm font-medium"
            >
              <DefineNavMenu v-slot="{modules}">
                <a
                    v-for="module in modules as Module[]"
                    :key="module.Code"
                    @click="() => {
                    $router.go( module.Code &&`/?module=${encodeURIComponent(module.Code)}` || '/')
                    site.setCheckedModule(module.Code)
                  }"
                    href="javascript:void 0"
                    class="transition-colors hover:text-foreground/80 text-foreground/60"
                    :class="{
                  'font-semibold !text-foreground': site.checkModule.value === module.Code
                }"
                >
                  {{ module.Name }}
                </a>
              </DefineNavMenu>
              <UseNavMenu :modules="[{Code: '',Name: '首页'}]"/>
              <UseNavMenu :modules="site.modules.value[1].values"/>
              <UseNavMenu v-if="ApiDataMap.getInstance().get()[`LAST-VERIFY-TIME`]"
                          :modules="site.modules.value[2].values"/>
            </nav>
          </div>
          <MobileNav/>

          <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div class="w-full flex-1 md:w-auto md:flex-none">
              <Button
                  variant="outline"
                  class="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
                  @click="isOpen = true"
              >
                <span class="hidden lg:inline-flex">搜索文章或教程</span>
                <span class="inline-flex lg:hidden">搜索...</span>
                <Kbd
                    class="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span class="text-xs">CTRL</span>+<span class="text-xs">K</span>
                </Kbd>
              </Button>
            </div>

            <nav class="flex items-center">
              <ThemePopover/>
              <Button
                  v-for="link in links"
                  :key="link.name"
                  as="a"
                  class="w-9 h-9"
                  :href="link.href" target="_blank"
                  :variant="'ghost'"
                  :size="'icon'"
              >
                <component :is="link.icon" class="w-5 h-5"/>
              </Button>


              <ClientOnly>
                <Button
                    class="w-9 h-9"
                    aria-label="Toggle dark mode"
                    :variant="'ghost'"
                    :size="'icon'"
                    @click="toggleDark()"
                >
                  <component
                      :is="isDark ? RadixIconsSun : RadixIconsMoon"
                      class="w-5 h-5 text-foreground"
                  />
                </Button>
                <UserNav/>
              </ClientOnly>

            </nav>
          </div>
        </div>
      </header>

      <div class="flex-1  bg-background">
        <Transition name="fade" mode="out-in">
          <component :is="'docs'" v-if="$route.path.includes('docs')">
            <Transition name="fade" mode="out-in">
              <Content :key="$route.path"/>
            </Transition>
          </component>
          <component :is="'examples'" v-else-if="$route.path.includes('examples')">
            <Transition name="fade" mode="out-in">
              <Content :key="$route.path"/>
            </Transition>
          </component>
          <component :is="'ArticleLayout'" v-else-if="$route.path.includes('article')">
            <Transition name="fade" mode="out-in">
              <Content :key="$route.path"/>
            </Transition>
          </component>
          <component :is="frontmatter.layout" v-else-if="frontmatter.layout">
            <slot/>
          </component>
          <main v-else :class="{'container': !frontmatter.home}">
            <Transition name="fade" mode="out-in">
              <Content :key="$route.path"/>
            </Transition>
          </main>
        </Transition>
      </div>

      <footer v-if="false" class="py-6 md:px-8 md:py-0">
        <div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div class="text-center text-sm leading-loose text-muted-foreground md:text-left">
            <span class="inline-block">
              Built and designed by
              <a
                  href="https://twitter.com/shadcn"
                  target="_blank"
                  class="underline underline-offset-4 font-bold decoration-foreground"
              >
                shadcn
              </a>
            </span>
            <span class="ml-0.5"> . </span>
            <span class="inline-block ml-2">
              Ported to Vue by
              <a
                  href="https://github.com/unovue"
                  target="_blank"
                  class="underline underline-offset-4 font-bold decoration-foreground"
              >
                Radix Vue
              </a>
            </span>
            <span class="ml-0.5"> . </span>
            <span class="inline-block ml-2">
              The code source is available on
              <a
                  href="https://github.com/unovue/shadcn-vue"
                  target="_blank"
                  class="underline underline-offset-4 font-bold decoration-foreground"
              >
                GitHub
              </a>
            </span>
          </div>
        </div>
      </footer>

      <Dialog v-model:open="isOpen">
        <DialogContent class="p-0">
          <Command>
            <CommandInput placeholder="输入标题或命令"/>
            <CommandEmpty>
              No results found.
            </CommandEmpty>
            <CommandList
                @escape-key-down=" isOpen = false"
            >
              <CommandGroup heading="分类">
                <CommandItem
                    v-for="(module,i) in [...site.modules.value[1].values,
                    //...site.modules.value[2].values
                  ] as Module[]"
                    :key="module.Code"
                    :heading="module.Code"
                    :value="module.Code"
                    class="py-3"
                    @select="handleSelectModule(module)"
                >
                  <FileIcon class="mr-2 h-5 w-5"/>
                  <span>{{ module.Name }}</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator/>
              <CommandGroup heading="主题">
                <CommandItem
                    value="light-theme"
                    class="py-3"
                    @select="
                    () => {
                      isDark = false;
                      isOpen = false;
                    }
                  "
                >
                  <RadixIconsSun class="mr-2 h-5 w-5"/>
                  <span>亮色主题</span>
                </CommandItem>
                <CommandItem
                    value="dark-theme"
                    class="py-3"
                    @select="
                    () => {
                      isDark = true;
                      isOpen = false;
                    }
                  "
                >
                  <RadixIconsMoon class="mr-2 h-5 w-5"/>
                  <span>暗色主题</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
      <DefaultToaster/>
      <NewYorkSonner class="pointer-events-auto" :theme="'system'"/>
      <NewYorkToaster/>
    </div>
  </TooltipProvider>
</template>
