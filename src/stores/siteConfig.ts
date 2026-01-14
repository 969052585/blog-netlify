// @ts-nocheck
import {markRaw, reactive} from "vue";
import * as api from "@/lib/api";
import {groupBy, keyBy, mapValues} from "lodash-es";
import {useTabManager} from "@/lib/hooks";
import {toast} from "vue-sonner";

// 所有类型定义保持不变（省略，和之前一致）
type ModuleGroup = {
    label?: string;
    values: Module[];
};
type Module = {
    Id: number;
    Name: string;
    Code: string;
    CreatedAt: string;
    Description: string;
    Path: string;
    Public: "Y" | "N" | null;
    Hot: "Y" | "N";
    UpdatedAt: string | null;
};
type Comment = {
    Id: number;
    ArticleId: number;
    Avatar: string;
    Nick: string;
    Content: string;
    AuditStatus: "Y" | "N" | null;
    LikeCount: number;
    ParentId: number;
    CreatedAt: string;
};
type Article = {
    Id: number;
    Name: string;
    Title: string;
    Code: string;
    CreatedAt: string;
    Description: string;
    Cover: string;
    Content: string;
    ModuleCode: Module["Code"];
    CategoryCode: Category["Code"];
    Path: string;
    Public: "Y" | "N" | null;
    Hot: "Y" | "N";
    Year: number;
    Month: number;
    UpdatedAt: string | null;
};
type ArticleDraft = Omit<Article, "Id"> & {
    Id: string;
};
type ArticleTag = {
    Id: number;
    TagCode: Tag["Code"];
    ArticleId: string;
    CreatedAt: string;
};
type Page = {
    current: number;
    size: number;
    totalPage?: number;
    total?: number;
};
type Statistics<T extends any = { [Name: string]: number }> = {
    CategoryArticle: T;
    YearArticle: T;
};
type Category = {
    Id: number;
    Name: string;
    Code: string;
    ModuleCode: Module["Code"];
    CreatedAt: string;
    UpdatedAt: string | null;
};
type Tag = {
    Id: number;
    Name: string;
    Code: string;
    CreatedAt: string;
    UpdatedAt: string | null;
};
type ArticleStats = {
    Id: number;
    Like: number;
    Share: number;
    Comment: number,
    Collection: number,
    Download: number,
    Read: number
};
type CheckedModule = Module["Code"];
type CheckedQuery = Record<keyof Pick<Article, "Year" | "CategoryCode">, any>;

function useSiteConfig() {
    // 1. 定义统一的响应式状态（包含所有数据）
    const state = reactive({
        // 数据状态
        user: {} as NetlifyUser,
        stats: {} as ArticleStats,
        page: {current: 1, size: 6} as Page,
        modules: [
            {values: [{Id: 0, Name: "全站", Code: "全站"}]},
            {label: "公开", values: []},
            {label: "私密", values: []},
        ] as ModuleGroup[],
        categories: [] as Category[],
        moduleCategories: {} as Record<Module["Code"], Category[]>,
        articles: undefined as Article[] | undefined,
        articleDrafts: undefined as ArticleDraft[] | undefined,
        tags: [] as Tag[],
        checkModule: undefined as CheckedModule | undefined,
        checkedQuery: {Year: "", CategoryCode: ""} as CheckedQuery,
        statistics: {YearArticle: {}, CategoryArticle: {}} as Statistics,

        // 先占位方法（后续赋值）
        getUser: () => {
        },
        logout: async () => {
        },
        login: () => {
        },
        openLoginPage: () => {
        },
        setCheckedModule: (value: CheckedModule) => {
        },
        addCategory: async (category: Partial<Category>) => {
        },
        loadPageArticles: async () => {
        },
        loadArticleDrafts: async () => {
        },
        addTag: async (tag: Partial<Tag>) => {
        },
        loadModuleCategories: async (moduleCode: Module["Code"]) => {
        },
        loadCategories: async () => {
        },
        loadModule: async () => {
        },
        loadTags: async () => {
        },
        loadStatistics: async (model: string, field: string) => {
        },
    });

    // 2. 定义所有方法（内部操作 state）
    function getUser() {
        if (import.meta.env.SSR) return;
        if (window === void 0) return;
        if (window.netlifyIdentity === void 0) return;

        const clearUser = () => (state.user = {} as NetlifyUser);
        const setUser = (u: NetlifyUser) => {
            state.user = markRaw(u) as NetlifyUser;
            window.netlifyIdentity!.close();
            toast.success((u.user_metadata!.full_name || "") + "登录成功");
        };
        window.netlifyIdentity.off("logout", clearUser);
        window.netlifyIdentity.off("login", setUser);
        window.netlifyIdentity.on("logout", clearUser);
        window.netlifyIdentity.on("login", setUser);
        window.netlifyIdentity.init({logo: false});
        let u = window.netlifyIdentity.currentUser();
        if (u) state.user = markRaw(u);
    }

    async function logout() {
        await window.netlifyIdentity!.logout();
        toast.success("退出登录成功");
    }

    function login() {
        window.netlifyIdentity!.open("login");
    }

    function openLoginPage() {
        useTabManager("/login", "登录").open();
    }

    function setCheckedModule(value: CheckedModule) {
        if (state.checkModule === value) return;
        state.checkModule = value;
        state.page.current = 1;
        state.loadPageArticles().then(() => void 0); // 调用 state 上的方法
    }

    async function addCategory(category: Partial<Category>) {
        await api.add("Category", category);
    }

    async function loadPageArticles() {
        let articleQuery = {} as Record<string, any>;
        if (state.checkModule) {
            articleQuery["ModuleCode"] = state.checkModule;
        }
        for (let key in state.checkedQuery) {
            const value = state.checkedQuery[key as keyof CheckedQuery];
            if (value) articleQuery[key] = value;
        }
        let response = await api.page("Article", {
            current: state.page.current,
            size: state.page.size,
        }, articleQuery, {orderBy: ["-Hot", "-UpdatedAt", "-CreatedAt"]}) as {
            page: Page;
            list: Article[];
        };
        Object.assign(state.page, response.page);
        state.articles = markRaw(response.list);
    }

    async function loadArticleDrafts() {
        let list = await api.list("ArticleDraft", {}, {orderBy: ["-CreatedAt"]}) as ArticleDraft[];
        state.articleDrafts = markRaw(list);
    }

    async function addTag(tag: Partial<Tag>) {
        await api.add("Tag", tag);
    }

    async function loadModuleCategories(moduleCode: Module["Code"]) {
        if (!moduleCode) throw new Error("分类模块编码不能为空");
        let list = await api.list<Category>("Category", {ModuleCode: moduleCode});
        state.categories = markRaw(list);
        state.moduleCategories[moduleCode] = markRaw(list);
    }

    async function loadCategories() {
        let list = await api.list<Category>("Category", {});
        state.categories = markRaw(list);
    }

    async function loadModule() {
        const list = await api.all<Array<Module>>(`Module`);
        let 全站 = list.find((item) => item.Id === 0);
        if (全站) state.modules[0].values[0] = markRaw(全站);
        const group = groupBy(list, "Public") as { Y: Module[]; N: Module[] };
        state.modules[1].values = markRaw(group.Y || []);
        state.modules[2].values = markRaw(group.N || []);
    }

    async function loadTags() {
        const list = await api.all<Array<Tag>>(`Tag`);
        state.tags = markRaw(list);
    }

    async function loadStatistics(model: string, field: string) {
        const list = await api.statistics(model, field) as { Name: string; Count: number }[];
        if (field.endsWith("Code")) field = field.replace("Code", "");
        field = field + model;
        const keyArticles = keyBy(list, "Name");
        // @ts-ignore
        state.statistics[field] = mapValues(keyArticles, "Count");
    }

    // 3. 将方法挂载到 state 上
    state.getUser = getUser;
    state.logout = logout;
    state.login = login;
    state.openLoginPage = openLoginPage;
    state.setCheckedModule = setCheckedModule;
    state.addCategory = addCategory;
    state.loadPageArticles = loadPageArticles;
    state.loadArticleDrafts = loadArticleDrafts;
    state.addTag = addTag;
    state.loadModuleCategories = loadModuleCategories;
    state.loadCategories = loadCategories;
    state.loadModule = loadModule;
    state.loadTags = loadTags;
    state.loadStatistics = loadStatistics;

    // 4. 直接返回响应式的 state 对象
    return state;
}

// 更新类型定义（匹配 state 结构）
interface SiteConfig extends ReturnType<typeof useSiteConfig> {
}

type Store = SiteConfig;

// 导出类型
export type {
    ArticleTag,
    ArticleStats,
    CheckedModule,
    ModuleGroup,
    Module,
    Store,
    Category,
    Tag,
    ArticleDraft,
    Article,
};

// 导出实例
export default useSiteConfig() as Store;