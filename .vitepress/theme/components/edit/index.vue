<script setup lang="tsx">
import type {WatchHandle} from "vue";
import {computed, h, markRaw, onMounted, onUnmounted, reactive, ref, watchEffect} from "vue";
import {difference} from 'lodash-es'
import Vditor from 'vditor'
import {type ColumnDef} from '@tanstack/vue-table'
import {ChevronDown, ChevronUp, FileCheck, Plus} from 'lucide-vue-next'
import {createOptions} from './config'
import {Button} from "@/lib/registry/new-york/ui/button";
import {Input} from "@/lib/registry/new-york/ui/input";
import {useData} from 'vitepress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/lib/registry/new-york/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/lib/registry/new-york/ui/select'
import {TagsInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText} from '@/lib/registry/new-york/ui/tags-input'
import {Switch} from "@/lib/registry/new-york/ui/switch";
import type {Article, ArticleDraft, ArticleTag, Category, Tag} from '@/stores/siteConfig'
import site from '@/stores/siteConfig'
import {dialog} from '@/lib/dialog'
import {drawer} from '@/lib/drawer'
import {toast} from "vue-sonner";
import * as api from "@/lib/api";
import DataTable from '@/examples/tasks/components/DataTable.vue'
import {omit} from "lodash-es";

const defaultState = {
  draftId: '' as string | number,
  editorMounted: false,
  addTagLoading: false,
  codeTheme: "",
  category: null as unknown as Pick<Category, "Name" | "Code" | "ModuleCode">,
  tag: null as unknown as Pick<Tag, "Name" | "Code">,
  tagCodes: [] as string[],
  oldTagCodes: [] as string[],
  article: {
    Title: "",
    Content: "",
    Cover: "",
    Id: null as unknown as number,
    ModuleCode: "",
    CategoryCode: "",
    Hot: "N",
    Public: "Y"
  } as Article,
  editor: null as unknown as Vditor,
  contentLength: 0,
  settingShow: false
}

type State = typeof defaultState

async function republish() {
  await api.update("Article", state.article)
  const ArticleId = state.article.Id;
  let tags = await api.list<ArticleTag>("ArticleTag", {
    ArticleId,
    "TagCode.in": Array.from(new Set([...state.oldTagCodes, ...state.tagCodes])),
  }) as ArticleTag[]
  const removeCodes = difference(state.oldTagCodes, state.tagCodes)
  const removeIds = tags.filter(({TagCode}) => removeCodes.includes(TagCode)).map(({Id}) => Id)
  if (removeIds.length) {
    await api.remove("ArticleTag", removeIds)
  }
  const newCodes = difference(state.tagCodes, state.oldTagCodes)
  if (newCodes.length) {
    const articleCodes = newCodes.map(TagCode => ({TagCode, ArticleId}));
    await api.add("ArticleTag", articleCodes)
    state.oldTagCodes = Array.from(state.tagCodes)
  }
  toast.success("文章更新发布成功")
}


function saveDraft() {
  let Id: string | number = state.draftId
  if (!Id) {
    Id = new Date().getTime()
  }
  (async () => {
    await api[state.draftId ? "update" : 'add']("ArticleDraft", Object.assign({}, state.article, {Id}))
    toast("草稿保存成功")
  })()
}

async function onKeyDown(e: KeyboardEvent) {
  e.preventDefault()
  if (!e.ctrlKey) return
  if ("KeyO" !== e.code && "KeyS" !== e.code) return;
  "KeyO" === e.code && await openDraftDialog()
  "KeyS" === e.code && await saveDraft()
}

async function publishClick() {
  if (state.article.Id) return republish()
  const {Id: ArticleId} = await api.add<{ Id: number }>("Article", state.article)
  state.article.Id = ArticleId
  if (state.tagCodes.length) {
    const articleCodes = state.tagCodes.map(TagCode => ({TagCode, ArticleId}));
    await api.add("ArticleTag", articleCodes)
    state.oldTagCodes = Array.from(state.tagCodes)
  }
  toast.success("文章发布成功")
}


function openChange(open: boolean) {
  open && window.addEventListener("keydown", onKeyDown)
  !open && window.removeEventListener("keydown", onKeyDown)
}


function addCategoryClick() {
  state.category = {
    ModuleCode: state.article.ModuleCode,
    Name: "",
    Code: ""
  }
  dialog({
    title: '添加新分类', description: '添加一个新的分类到模块中',
    ok: async () => {
      if (!state.category.Code) state.category.Code = state.category.Name
      await site.addCategory(state.category)
      await site.loadModuleCategories(state.category.ModuleCode)
    },
    cancel: () => {

    },
    content: <>
      <div class="flex items-center gap-2">
        <div class="flex-none text-secondary-foreground/60">模块编码:</div>
        <Input
            modelValue={state.category.ModuleCode}
            disabled={true}
        />
      </div>
      <div class="flex items-center gap-2">
        <div class="flex-none text-secondary-foreground/60">分类编码:</div>
        <Input
            modelValue={state.category.Code}
            onUpdate:modelValue={(value) => state.category.Code = value as string}
            placeholder="请输入分类编码"
        />
      </div>
      <div class="flex items-center gap-2">
        <div class="flex-none text-secondary-foreground/60">分类名称:</div>
        <Input
            modelValue={state.category.Name}
            onUpdate:modelValue={(value) => state.category.Name = value as string}
            placeholder="请输入分类名称"
        />
      </div>
    </>
  })
}

let editorThemeWatcher: WatchHandle


onMounted(async () => {
  editorThemeWatcher = watchEffect(() => {
    if (!state.editor || !done.value) return
    state.editor.setTheme(isDark.value ? 'dark' : 'classic',
        isDark.value ? 'dark' : 'light',
        isDark.value ? 'default-light' : 'default-dark')
  })
  const menu = document.getElementById("draft_menu");
  console.log("menu...", menu)
  await Promise.all([site.loadTags(), site.loadModule()])

})

const {isDark} = useData()
const done = ref(false)

const state = reactive<State>(defaultState)


function setCodeTheme(theme: string) {
  theme = `${theme}-${isDark.value ? 'light' : 'dark'}`
  state.editor.setTheme(isDark.value ? 'dark' : 'classic',
      isDark.value ? 'dark' : 'light', theme)
}

const vditorOptions = createOptions({setTheme: setCodeTheme, editor: () => state.editor! as Vditor})

async function tagInputEnter() {
  if (!state.tag.Name) return toast.warning("标签名称不能为空")
  if (!state.tag.Code) state.tag.Code = state.tag.Name
  state.addTagLoading = true
  await site.addTag(state.tag).finally(() => state.addTagLoading = false)
  await site.loadTags()
  // 添加这个新的tag
  state.tagCodes.push(state.tag.Code)
  state.tag = {} as any
}

const length = ref(0)
const settingShow = ref(false)
const observer = ref<MutationObserver>()
// 可选的
const optionalTags = computed(() => site.tags.value.filter(({Code}) => !state.tagCodes.includes(Code)))

onMounted(() => {
  if (import.meta.env.SSR) return

  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  state.editor = new Vditor('vditor', {
    input: (value: string) => {
      state.article.Content = value;
    },
    upload: {
      /*
      url	上传 url，为空则不会触发上传相关事件	''
      max	上传文件最大 Byte	10 * 1024 * 1024
      linkToImgUrl	剪切板中包含图片地址时，使用此 url 重新上传	''
      linkToImgCallback(responseText: string)	图片地址上传回调	-
      linkToImgFormat(responseText: string): string	对图片地址上传的返回值进行格式化	-
      success(editor: HTMLPreElement, msg: string)	上传成功回调	-
      error(msg: string)	上传失败回调	-
      token	CORS 上传验证，头为 X-Upload-Token	-
      withCredentials	跨站点访问控制	false
      headers	请求头设置	-
      filename(name: string): string	文件名安全处理	name => name.replace(/\W/g, '')
      accept	文件上传类型，同 input accept	-
      validate(files: File[]) => string | boolean	校验，成功时返回 true 否则返回错误信息	-
      handler(files: File[]) => string | null | Promise | Promise	自定义上传，当发生错误时返回错误信息	-
      format(files: File[], responseText: string): string	对服务端返回的数据进行转换，以满足内置的数据结构	-
      file(files: File[]): File[] | Promise<File[]>	将上传的文件处理后再返回	-
      setHeaders(): { [key: string]: string }	上传前使用返回值设置头	-
      extraData: { [key: string]: string | Blob }	为 FormData 添加额外的参数	-
      multiple	上传文件是否为多个	true
      fieldName	上传字段名称	'file[]'
      renderLinkDest?(vditor: IVditor, node: ILuteNode, entering: boolean): [string, number]	处理剪贴板中的图片地址
       */
      accept: "image/*",
      multiple: true,
      async handler(files: File[]): string | Promise<string> | Promise<null> | null {
        function fileToBase64(file: File) {
          return new Promise((resolve, reject) => {
            // 1. 创建 FileReader 实例
            const reader = new FileReader();

            // 2. 读取文件完成时的回调
            reader.onload = (event) => {
              state.editor.insertValue(`![${file.name}](${event.target.result})`);
              resolve(event.target.result);
            };

            // 3. 读取失败时的回调
            reader.onerror = (error) => {
              console.error(`文件读取失败：${error.message}`)
              reject(new Error(`文件读取失败：${error.message}`));
            };

            // 4. 以 DataURL 格式读取文件（自动编码为 Base64）
            reader.readAsDataURL(file);
          });
        }
        await Promise.all(files.map(fileToBase64))
      }
    },
    ...vditorOptions,
    mode: "wysiwyg",
    after: () => {
      done.value = true
      setTimeout(() => setCodeTheme('a11y'), 1000)
      observer.value = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            // 查找目标元素
            let div = document.querySelector('div.vditor-content div:is(.vditor-wysiwyg, .vditor-ir) > pre.vditor-reset')
            if (!div) return length.value = 0
            length.value = div.textContent!.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').length
          }
        }
      });

      const config = {childList: true, subtree: true};

      window["editor"] = state.editor

      observer.value.observe(document.getElementById("vditor")!, config);

      setTimeout(() => {
        const settingObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            settingShow.value = entry.isIntersecting
          });
          ``
        }, {
          root: null,
          rootMargin: '0px 0px 52px 0px',
          threshold: 0
        } as any);

        settingObserver.observe(document.getElementById('setting')!);
      }, 2000)


    },
  })
})

async function onCoverChange(e: Event) {
  let file = (e.target as EventTarget & { files: File[] })!.files[0]
  if (!file) return
  state.article.Cover = await function (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }(file) as string
}

const scrollToBottom = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  })
}


async function openDraftDialog() {
  let close: Function
  let isDraft = ref(true)
  const columns: ColumnDef<ArticleDraft | Article>[] = [
    {
      id: 'index',
      header: "序号",
      cell: ({row}) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
      size: 50,
      enableResizing: true
    },
    {
      accessorKey: 'Title',
      header: "标题",
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'CreatedAt',
      header: "创建时间",
      enableSorting: true,
      enableHiding: false,
    },
    {
      header: "操作",
      cell: ({row: {original}}) => {
        return [h(Button, {
          variant: 'link',
          onClick: function () {
            state.draftId = original.Id as string
            let article: Article | Omit<ArticleDraft, "Id"> = original
            if (isDraft.value) article = omit(article as ArticleDraft, "Id")
            state.article = article as Article
            state.editor.setValue(original.Content)
            close()
          }
        }, () => '继续编辑'),
          h(Button, {
            variant: 'link',
            onClick: async function () {
              await api.remove("ArticleDraft", original.Id as unknown as number)
              await load()
            }
          }, () => '删除'),
        ]
      }
    },
  ]
  let list = ref<(ArticleDraft | Article)[]>([])

  async function load() {
    list.value = markRaw(await api.list(isDraft.value ? "ArticleDraft" : "Article", {}) as (ArticleDraft | Article)[])
  }

  const typeName = computed(() => isDraft.value && '草稿' || '历史文章')
  await load()
  close = drawer({
    direction: 'right',
    title: () => '选择' + typeName.value,
    description: () => '你可以选择' + typeName.value + '并进行重新编辑等操作',
    content:
        <DataTable fix-header class="max-h-full h-full" columns={columns} data={list}>
          {{
            toolbar: (props) => (
                <div class="relative w-full flex items-center gap-1 focus-within:px-0.5">
                  <Select
                      modelValue={String(isDraft.value)}
                      onUpdate:modelValue={(value: string) => {
                        isDraft.value = value === 'true';
                        load();
                      }}
                  >
                    <SelectTrigger class="flex items-center justify-center px-2 w-fit">
                      <SelectValue placeholder="选择类型"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">草稿</SelectItem>
                      <SelectItem value="false">历史文章</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="输入标题搜索"/>
                </div>
            )
          }}
        </DataTable>
  }).close
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

function onTagSelectOpen(open: boolean) {
  if (open)
    state.tag = {} as any
}

function onPaste(e: ClipboardEvent) {
  const clipboardData = e.clipboardData || window.clipboardData;
  if (clipboardData.items) {
    for (let i = 0; i < clipboardData.items.length; i++) {
      const item = clipboardData.items[i];
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = function (event) {
            state.article.Cover = event.target!.result as string;
          };
          reader.readAsDataURL(blob);
        }
        break;
      }
    }
  }
}

function onMouseEnter(e: MouseEvent) {
  e.target!.focus()
}


function onMouseEvent(e: MouseEvent, withFocus = false) {
  if ('mouseenter' === e.type && withFocus) e.target!.focus()
  if ('mouseleave' === e.type && withFocus) e.target!.blur()
}


onUnmounted(() => {
  if (editorThemeWatcher) editorThemeWatcher()
  if (observer.value) observer.value.disconnect()
})
</script>

<template>
  <button class="hidden" id="hidden">隐藏按钮</button>
  <div id="title" class="relative text-[32px] flex items-center justify-center">
      <textarea
          v-model="state.article.Title"
          class="w-full p-2 pb-0 pt-3 resize-none outline-none border-b border-primary/20 focus:border-b-2 focus:border-primary transition-colors focus:outline-none peer bg-inherit"
          required rows="1"></textarea>
    <label
        for="username"
        class="absolute pointer-events-none peer-focus:hidden peer-valid:hidden p-2 pb-0 left-0 top-0 text-primary/50 cursor-text peer-focus:text-xs peer-valid:text-xs peer-focus:pb-0 peer-valid:pb-0 peer-valid:-top-1.5 peer-focus:-top-1.5 transition-all"
    >
      请输入标题（最多 100 个字）
    </label>
    <label
        for="username"
        class="absolute hidden peer-focus:block peer-valid:block p-2 pb-0 left-0 top-0 text-secondary-foreground cursor-text peer-focus:text-xs peer-valid:text-xs peer-focus:pb-0 peer-valid:pb-0 peer-valid:-top-1.5 peer-focus:-top-1.5 transition-all peer-focus:text-primary"
    >
      标题
    </label>
  </div>


  <article vaul-drawer-wrapper id="vditor">
  </article>


  <div id="setting" class="w-fit h-fit border-t mb-[52px] px-4 pb-1.5 opacity-75 mx-auto">
    <div class="text-[17px] w-full leading-[61px]">发布设置</div>
    <div class="text-[15px] w-full  leading-[38px] flex gap-4 items-start mb-1.5">
      <label class="pl-2">文章封面</label>
      <div class="text-sm flex flex-col gap-1 text-secondary-foreground/75">
        <div
            class="relative flex items-center justify-center w-[150px] h-[100px] rounded-xl border focus-within:border-2 border-dashed border-muted-foreground/80 transition-colors group-hover/dropzone:border-cyan-500/50"
            :class="{'border-none': Boolean(state.article.Cover)}"
        >
          <input
              @paste="onPaste"
              @mouseenter="e => onMouseEvent(e,true)"
              @mouseleave="e => onMouseEvent(e,true)"
              type="file"
              @change="onCoverChange"
              class="absolute peer inset-0 z-1 h-full w-full cursor-pointer opacity-0"
              multiple="false"
              accept="image/*"
          />
          <img v-if="state.article.Cover" :src="state.article.Cover" alt="文章封面"
               class="h-full w-full pointer-events-none"/>
          <div v-else class="flex peer-focus:hidden items-center pointer-events-none">
            <Plus :size="20"/>
            添加文章封面
          </div>
          <div
              class="absolute inset-0 items-center justify-center bg-background/60 hidden peer-focus:flex pointer-events-none">
            粘贴或点击上传
          </div>
        </div>
        图片上传格式支持 JPEG、JPG、PNG
      </div>
    </div>
    <div class="text-[15px] w-full  leading-[38px] flex gap-4 items-start mb-1.5">
      <label class="pl-2">所属模块</label>
      <Select @update:model-value="site.loadModuleCategories" v-model="state.article.ModuleCode">
        <SelectTrigger class="w-[280px]">
          <SelectValue placeholder="选择模块"/>
        </SelectTrigger>
        <SelectContent class="px-1">
          <SelectGroup>
            <SelectLabel>{{ site.modules.value[1].label }}</SelectLabel>
            <SelectItem v-for="(item, index) in site.modules.value[1].values" :key="index" :value="item.Code">
              {{ item.Name }}
            </SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>{{ site.modules.value[2].label }}</SelectLabel>
            <SelectItem v-for="(item, index) in site.modules.value[2].values" :key="index" :value="item.Code">
              {{ item.Name }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
    <div v-if="state.article.ModuleCode" class="text-[15px] w-full  leading-[38px] flex gap-4 items-center mb-1.5">
      <label class="pl-2">模块分类</label>
      <Select v-model:model-value="state.article.CategoryCode">
        <SelectTrigger class="w-[280px]">
          <SelectValue placeholder="请选择分类"/>
        </SelectTrigger>
        <SelectContent>
          <div class="min-h-12 text-secondary-foreground/50 flex items-center justify-center"
               v-if="!site.categories.value.length">
            暂无数据
          </div>
          <SelectItem v-else v-for="(category,i) in site.categories.value" :key="i" :value="category.Code">
            {{ category.Name }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Button variant="link" class="opacity-80" @click="() => addCategoryClick()" size="xs">
        添加新分类
      </Button>
    </div>
    <div class="text-[15px] w-full  leading-[38px] flex gap-4 items-start mb-1.5">
      <label class="pl-2">标签设置</label>


      <TagsInput class="border-none pl-0" v-model="state.tagCodes">
        <TagsInputItem class="h-7"
                       v-for="tag in site.tags.value.filter(({Code}) => state.tagCodes.includes(Code))"
                       :key="tag.Code" :value="tag.Name">
          <TagsInputItemText/>
          <TagsInputItemDelete/>
        </TagsInputItem>

        <Select v-if="!state.addTagLoading"
                @update:model-value="(value: Tag['Code']) => state.tagCodes.push(value)"
                @update:open="onTagSelectOpen">
          <SelectTrigger class="w-[120px]">
            <SelectValue placeholder="添加标签"/>
          </SelectTrigger>
          <SelectContent>
            <Input v-model="state.tag.Name" @keyup.enter="tagInputEnter" v-if="state.tag" placeholder="输入新标签名称"/>
            <SelectItem :key="i" v-for="(tag, i) in optionalTags" :value="tag.Code">
              {{ tag.Name }}
            </SelectItem>
            <div class="min-h-12 text-secondary-foreground/50 flex items-center justify-center"
                 v-if="!optionalTags.length">
              暂无更多
            </div>
          </SelectContent>
        </Select>
      </TagsInput>

    </div>
    <div class="text-[15px] w-full  leading-[38px] flex gap-4 items-start">
      <label class="pl-2">其他设置</label>
      <div class="flex flex-row items-center justify-between rounded-lg border p-4 space-y-2 gap-2">
        <div class="space-y-0.5">
          <div class="text-base">
            是否热门
          </div>
          <div class="text-sm text-muted-foreground">
            设置为热门将会在展示的时候添加热门图标
          </div>
        </div>
        <Switch :checked="'Y' ===state.article.Hot" @update:checked="state.article.Hot = $event ? 'Y':'N'"/>
      </div>
      <div class="flex flex-row items-center justify-between rounded-lg border p-4 space-y-2 gap-2">
        <div class="space-y-0.5">
          <div class="text-base">
            是否公开
          </div>
          <div class="text-sm text-muted-foreground">
            公开的文章可以被其他人看到
          </div>
        </div>
        <Switch :checked="'Y' ===state.article.Public" @update:checked="state.article.Public = $event ? 'Y':'N'"/>
      </div>
    </div>
  </div>


  <footer id="footer"
          class="w-full h-[52px] fixed bottom-0 border border-t-gray-300 flex justify-center items-center gap-8 bg-background">
    <div v-if="settingShow" @click="scrollToTop" class="text-muted-foreground text-lg flex items-center cursor-pointer">
      回到顶部
      <ChevronUp/>
    </div>
    <div @click="scrollToBottom" v-else class="text-muted-foreground text-lg flex items-center cursor-pointer">发布设置
      <ChevronDown/>
    </div>

    <div class="text-muted-foreground text-lg flex items-center">
      字数: {{ length }}
    </div>

    <div class="text-muted-foreground text-lg flex items-center">
      Markdown 语法识别中
    </div>

    <DropdownMenu @update:open="openChange">
      <DropdownMenuTrigger as-child>
        <Button variant="outline"
                class="dark:bg-foreground/25 hover:scale-105 transition-transform">
          <FileCheck/>
          草稿
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem @click="saveDraft">
          <span>保存</span>
          <DropdownMenuShortcut>CTRL + S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem @click="openDraftDialog">
          <span>打开</span>
          <DropdownMenuShortcut>CTRL + O</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>


    <Button variant="outline" class="dark:bg-foreground/25 hover:scale-105 transition-transform">预览</Button>
    <Button @click="publishClick" class="hover:scale-110 transition-transform">{{
        state.article.Id && '更新'
      }}发布
    </Button>
  </footer>
</template>

<style lang="css">
@import "./index.css";
</style>