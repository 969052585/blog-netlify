import type {Module} from "@/stores/siteConfig";
import {ref, defineComponent, provide} from 'vue'
import siteStore from "@/stores/siteConfig";
//
type ChangeModule = (m: Module) => void

//
enum ProvideKey {
    MODULE = "module",
    CHANGE_MODULE = "changeModule",
    LOAD_MODULE = "loadModule",
}


const Provider = defineComponent((props, ctx) => {
    const module = ref<Module>();
    const changeModule: ChangeModule = (m) => module.value = m
    provide(ProvideKey.MODULE, module)
    provide(ProvideKey.CHANGE_MODULE, changeModule)
    provide(ProvideKey.LOAD_MODULE, siteStore.loadModule)
    return () => ctx.slots.default?.({customProp: '8888'})
})

export type {
    ChangeModule,
}


export {ProvideKey, Provider}

