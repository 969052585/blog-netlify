import {reactive} from "vue";
import type {Article} from "./siteConfig";
import {getQuery} from "@/lib/utils";
import * as api from "@/lib/api";


function useArticleStore() {
    const article = reactive({} as Article)
    const relatedArticles = reactive<SidebarNavItem<Article>>({title: "相关文章", items: []})
    const articleCollection = reactive<SidebarNavItem<Article>>({title: "合集", items: []})
    // 相关文章
    const setArticle = (value: Article) => Object.assign(article, value)
    const loadArticle = async () => {
        let Id = getQuery('Id')
        let article = await api.one<Article>("Article", Id)
        setArticle(article)
    }

    return {
        article,
        setArticle,
        loadArticle,
        sidebarNavItems: [relatedArticles,articleCollection]
    }
}

type Store = ReturnType<typeof useArticleStore>

interface NavItem {
    title: string
    href?: string
    disabled?: boolean
    external?: boolean
    icon?: string
    label?: string
}

type SidebarNavItem<T> = NavItem & {
    items: T[]
}

export type {
    Store,
    NavItem,
    SidebarNavItem
}


export default useArticleStore() as Store