<script setup lang="ts">
import type {WatchHandle} from "vue";
import {markRaw, onMounted, onUnmounted, reactive, watchEffect} from "vue";
import Vditor from "vditor";
import {get} from 'lodash-es'
import {useData} from "vitepress";
import store from '@/stores/articleStore'

const {isDark} = useData()

function setCodeTheme(theme: string) {
  theme = `${theme}-${isDark.value ? 'light' : 'dark'}`
  state.editor.setTheme(isDark.value ? 'dark' : 'classic',
      isDark.value ? 'dark' : 'light', theme)
}

let editorThemeWatcher: WatchHandle
const defaultState = {
  editor: null as unknown as Vditor,
  done: false
}
type State = typeof defaultState
const state = reactive<State>(defaultState)
onMounted(async () => {
  await store.loadArticle()
  state.editor = markRaw(new Vditor('vditor', {
    value: store.article.Content,
    height: 'auto',
    minHeight: 0,
    cache: {
      enable: false,
    },
    preview: {
      delay: 0,
      hljs: {
        lineNumber: true
      }
    },
    after: () => {
      state.done = true
      let btn = get(state.editor, 'vditor.toolbar.elements.preview.lastChild') as HTMLElement
      if (btn) btn.click()
      setTimeout(() => {
        setCodeTheme('a11y')
      }, 1000)
      editorThemeWatcher = watchEffect(() => {
        if (!state.editor || !state.done) return
        state.editor.setTheme(isDark.value ? 'dark' : 'classic',
            isDark.value ? 'dark' : 'light',
            isDark.value ? 'a11y-light' : 'a11y-dark')
      })
      let vditor = document.getElementById('vditor')!
      vditor.classList.remove('pending')
    },
  }))
})

onUnmounted(() => {
  if (editorThemeWatcher) editorThemeWatcher()
})
</script>

<template>
  <div id="vditor" :class="{pending: !state.done}" class="content-preview"/>
</template>

<style lang="css">
@import "../edit/index.css";

.vditor-toolbar, .vditor-preview__action {
  display: none;
}

.vditor-content {
  min-height: 0;
}

.pending {
  border: unset;
}

.pending .vditor-preview > .vditor-reset {
  padding: unset;
}

.content-preview .vditor-preview {
  background: unset ;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1)
}
</style>