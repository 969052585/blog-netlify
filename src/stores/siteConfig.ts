import {markRaw} from "vue";
import type {Reactive, Ref} from "@vue/reactivity";
import {reactive, ref} from "@vue/reactivity";
import * as api from "@/lib/api";
import {groupBy, keyBy, mapValues} from "lodash-es";
import {useTabManager} from "@/lib/hooks";
import {toast} from "vue-sonner";


type ModuleGroup = {
    label?: string
    values: Module[]
}
type Module = {
    Id: number,
    Name: string,
    Code: string,
    CreatedAt: string
    Description: string,
    Path: string,
    Public: "Y" | "N" | null,
    Hot: "Y" | "N",
    UpdatedAt: string | null
}

type Article = {
    Id: number,
    Name: string,
    Title: string,
    Code: string,
    CreatedAt: string
    Description: string,
    Cover: string,
    Content: string,
    ModuleCode: Module["Code"],
    CategoryCode: Category["Code"],
    Path: string,
    Public: "Y" | "N" | null,
    Hot: "Y" | "N",
    Year: number,
    Month: number,
    UpdatedAt: string | null
}

type ArticleDraft = Omit<Article, "Id"> & {
    Id: string,
}

type ArticleTag = {
    Id: number,
    TagCode: Tag['Code'],
    ArticleId: string,
    CreatedAt: string
}

type Page = {
    current: number,
    size: number,
    totalPage?: number,
    total?: number,
}

type Statistics<T extends any = {
    [Name: string]: number
}> = {
    CategoryArticle: T,
    YearArticle: T
}

type Category = {
    Id: number
    Name: string
    Code: string
    ModuleCode: Module["Code"]
    CreatedAt: string
    UpdatedAt: string | null
}

type Tag = {
    Id: number
    Name: string
    Code: string
    CreatedAt: string
    UpdatedAt: string | null
}

type CheckedModule = Module["Code"]
type CheckedQuery = Record<keyof Pick<Article, "Year" | "CategoryCode">, any>


function useSiteConfig() {
    const user = ref({} as NetlifyUser)

    const categories = ref<Category[]>([])
    const checkModule = ref<CheckedModule>()
    const checkedQuery = reactive<CheckedQuery>({Year: '', CategoryCode: ''})
    const page = reactive<Page>({current: 1, size: 3})
    const statistics = reactive<Statistics>({YearArticle: {}, CategoryArticle: {}})
    const articles = ref<Article[]>()
    const articleDrafts = ref<ArticleDraft[]>()
    const tags = ref<Tag[]>([])
    const moduleCategories = ref<Record<Module["Code"], Category[]>>({})
    const modules = ref([{
        values: [{
            "Id": 0,
            "Name": "全站",
            "Code": "全站"
        }]
    }, {
        label: "公开",
        values: []
    }, {
        label: "私密",
        values: []
    }] as ModuleGroup[])

    function getUser() {
        if (import.meta.env.SSR) return
        if (window === void 0) return
        if (window.netlifyIdentity === void 0) return

        const clearUser = () => user.value = {} as NetlifyUser
        const setUser = (u: NetlifyUser) => {
            user.value = markRaw(u) as NetlifyUser
            window.netlifyIdentity!.close()
            toast.success((u.user_metadata!.full_name || '') + "登录成功")
        }
        window.netlifyIdentity.off("logout", clearUser)
        window.netlifyIdentity.off("login", setUser)
        window.netlifyIdentity.on("logout", clearUser)
        window.netlifyIdentity.on("login", setUser)
        window.netlifyIdentity.init({logo: false})
        // window.netlifyIdentity.refresh()
        let u = window.netlifyIdentity.currentUser()
        if (u) user.value = markRaw(u)
    }

    async function logout() {
        await window.netlifyIdentity!.logout()
        toast.success("退出登录成功")
    }

    function login() {
        window.netlifyIdentity!.open('login')
    }


    function setCheckedModule(value: CheckedModule) {
        if (checkModule.value === value) return
        checkModule.value = value
        page.current = 1
        // bus.emit("CheckedModuleChange", value)
        loadPageArticles().then(() => void 0)
    }

    async function addCategory(category: Partial<Category>) {
        await api.add("Category", category)
    }

    function openLoginPage() {
        useTabManager("/login", "登录").open()
    }

    async function loadPageArticles() {
        let articleQuery = {} as Record<string, any>
        if (checkModule.value) {
            articleQuery["ModuleCode"] = checkModule.value
        }
        for (let key in checkedQuery) {
            const value = checkedQuery[key as keyof CheckedQuery]
            if (value) articleQuery[key] = value
        }
        let response = await api.page("Article", {
            current: page.current,
            size: page.size
        }, articleQuery, {orderBy: ["-Hot", '-UpdatedAt', '-CreatedAt']}) as { page: Page, list: Article[] }
        Object.assign(page, response.page);
        articles.value = markRaw(response.list)
    }

    async function loadArticleDrafts() {
        let list = await api.list("ArticleDraft", {}, {orderBy: ['-CreatedAt']}) as ArticleDraft[]
        articleDrafts.value = markRaw(list)
    }

    async function addTag(tag: Partial<Tag>) {
        await api.add("Tag", tag)
    }

    async function loadModuleCategories(moduleCode: Module["Code"]) {
        if (!moduleCode) throw new Error("分类模块编码不能为空")
        let list = await api.list<Category>("Category", {ModuleCode: moduleCode})
        categories.value = markRaw(list)
        moduleCategories.value[moduleCode] = markRaw(list)
    }

    async function loadCategories() {
        let list = await api.list<Category>("Category", {})
        categories.value = markRaw(list)
    }

    async function loadModule() {
        const list = await api.all<Array<Module>>(`Module`)
        let 全站 = list.find(item => item.Id === 0)
        if (全站) modules.value[0].values[0] = markRaw(全站)
        const group = groupBy(list, "Public") as {
            Y: Module[],
            N: Module[]
        }
        modules.value[1].values = markRaw(group.Y || [])
        modules.value[2].values = markRaw(group.N || [])
    }

    async function loadTags() {
        tags.value = await api.all<Array<Tag>>(`Tag`)
    }

    async function loadStatistics(model: string, field: string) {
        const list = await api.statistics(model, field) as { Name: string, Count: number }[]
        if (field.endsWith("Code")) field = field.replace("Code", "")
        field = field + model
        const keyArticles = keyBy(list, "Name");
        // @ts-ignore
        statistics[field] = mapValues(keyArticles, "Count");
    }

    return {
        user,
        getUser,
        page,
        articleDrafts,
        checkModule,
        tags,
        openLoginPage,
        statistics,
        setCheckedModule,
        articles,
        loadTags,
        logout,
        login,
        modules,
        addTag,
        checkedQuery,
        categories,
        addCategory,
        loadStatistics,
        loadCategories,
        loadPageArticles,
        moduleCategories,
        loadArticleDrafts,
        loadModule,
        loadModuleCategories
    }
}

interface SiteConfig {
    user: Ref<NetlifyUser>;
    page: Reactive<Page>;
    getUser: () => Promise<void>;
    logout: () => Promise<void>;
    login: () => Promise<void>;
    articleDrafts: Ref<ArticleDraft[] | undefined>;
    checkModule: Ref<CheckedModule | undefined>;
    tags: Ref<Tag[] | undefined>;
    openLoginPage: () => void;
    statistics: Reactive<Statistics>;
    setCheckedModule: (value: CheckedModule) => void;
    articles: Ref<Article[] | undefined>;
    loadTags: () => Promise<void>;
    modules: Ref<ModuleGroup[]>;
    addTag: (tag: Partial<Tag>) => Promise<void>;
    checkedQuery: Reactive<CheckedQuery>;
    categories: Ref<Category[]>;
    addCategory: (category: Partial<Category>) => Promise<void>;
    loadStatistics: (model: string, field: string) => Promise<void>;
    loadCategories: () => Promise<void>;
    loadPageArticles: () => Promise<void>;
    moduleCategories: Ref<Record<Module["Code"], Category[]>>;
    loadArticleDrafts: () => Promise<void>;
    loadModule: () => Promise<void>;
    loadModuleCategories: (moduleCode: Module["Code"]) => Promise<void>;
}

type Store = SiteConfig

export type {
    ArticleTag,
    CheckedModule,
    ModuleGroup,
    Module,
    Store,
    Category,
    Tag,
    ArticleDraft,
    Article
}


export default useSiteConfig() as Store