import {reactive} from "vue";
import type {Article, ArticleStats} from "./siteConfig";
import {getQuery} from "@/lib/utils";
import * as api from "@/lib/api";


const _stats: ArticleStats = {
    Id: 0,
    Download: 0,
    Like: 0,
    Share: 0,
    Comment: 0,
    Collection: 0,
    Read: 0
}

function useArticleStore() {
    const article = reactive({} as Article)
    const stats = reactive<ArticleStats>({..._stats})

    const relatedArticles = reactive<SidebarNavItem<Article>>({title: "相关文章", items: []})
    const articleCollection = reactive<SidebarNavItem<Article>>({title: "合集", items: []})
    // 相关文章
    const setArticle = (value: Article) => Object.assign(article, value)
    const loadArticle = async () => {
        let Id = getQuery('Id')
        let article = await api.one<Article>("Article", Id)
        setArticle(article)
        loadStats(Id)
    }

    async function loadStats(Id: string) {
        const exist = await api.exist("ArticleStats", Id)
        let value: ArticleStats = {..._stats}
        if (!exist) {
            value.Id = Id as unknown as number
            await api.add("ArticleStats",value)
        }
        value = await api.one<ArticleStats>("ArticleStats", Id)
        Object.assign(stats, value)
    }

    return {
        article,
        stats,
        setArticle,
        loadArticle,
        sidebarNavItems: [relatedArticles, articleCollection]
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