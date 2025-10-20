import {toast} from 'vue-sonner'
import {bus} from './utils'
import {isString} from 'lodash-es'
import {reactive} from "vue";

type AxiosInstanceFun = (input: RequestInfo | URL, init?: RequestInit) => Promise<any>

type AxiosInstance = AxiosInstanceFun & {
    get: <T extends any = any>(url: string) => Promise<T>
    put: <T extends any = any>(url: string, data: any) => Promise<T>
    post: <T extends any = any>(url: string, data: any) => Promise<T>
    delete: <T extends any = any>(url: string, data?: any) => Promise<T>
}

export class ApiDataMap {
    private static instance: ApiDataMap;
    private map = reactive({
        "LAST-VERIFY-TIME": null
    } as Record<string, any>);

    // 私有构造函数防止外部实例化
    private constructor() {
    }

    // 获取单例实例
    public static getInstance(): ApiDataMap {
        if (!ApiDataMap.instance) {
            ApiDataMap.instance = new ApiDataMap();
        }
        return ApiDataMap.instance;
    }

    // 设置值
    public set(key: string, value: number) {
        this.map[key] = value;
    }

    // 获取值
    public get(key?: string) {
        if (!key) return this.map
        return this.map[key];
    }

    public remove(key: string) {
        this.map[key] = null;
    }
}

function newAxiosInstance() {
    const axios: AxiosInstanceFun = async function (url: RequestInfo | URL, options?: RequestInit) {
        let NETLIFY_URL_PREFIX = "/functions"
        let resolve, reject;
        const promise = new Promise<any>((_resolve, _reject) => {
            resolve = _resolve
            reject = _reject
        })
        options = options || {};
        let headers = (options.headers || {}) as Record<string, any>
        // 先从store取
        let token = localStorage["X-TOKEN"]
        if (token) headers['Authorization'] = 'Bearer ' + token;
        let user = localStorage["X-USER"]
        if (user) headers["X-USER"] = user;
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'
        options.headers = headers
        let urlString = url as string
        if (isString(urlString) && urlString.startsWith("/") && !urlString.startsWith(NETLIFY_URL_PREFIX))
            url = NETLIFY_URL_PREFIX + url
        const response = await fetch(url, options)
        const key = "LAST-VERIFY-TIME"
        let lastVerifyTime: string | number | null = response.headers.get(key)
        if (!lastVerifyTime) ApiDataMap.getInstance().remove(key)
        lastVerifyTime = Number(lastVerifyTime)
        let now = new Date().getTime();
        if (now - lastVerifyTime > 1000 * 60 * 60 * 6) ApiDataMap.getInstance().remove(key)
        else ApiDataMap.getInstance().set(key, lastVerifyTime)
        try {
            const resp = await response.json()
            const {msg, code, data} = resp
            if (200 === code) {
                resolve!(data)
                return promise
            }
            msg && toast.error(msg)
            reject!(msg)
        } catch (e) {
            reject!(e)
        }
        if (401 === response.status) bus.emit("Unauthorized")
        return promise
    }
    Object.defineProperties(axios, {
        "get": {
            writable: false,
            value: function (url: string) {
                return axios(url)
            }
        },
        "post": {
            writable: false,
            value: function <T extends any = any>(url: string, data: T) {
                return axios(url, {
                    method: "post",
                    body: JSON.stringify(data)
                })
            }
        },
        "put": {
            writable: false,
            value: function <T extends any = any>(url: string, data: T) {
                return axios(url, {
                    method: "put",
                    body: JSON.stringify(data)
                })
            }
        },
        "delete": {
            writable: false,
            value: function (url: string, data?: any) {
                return axios(url, {
                    method: "delete",
                    ...(data ? {
                        body: JSON.stringify(data)
                    } : {})
                })
            }
        }
    })
    return axios as AxiosInstance
}

type Query<T extends Record<string, any>> = {
    [K in keyof T as K extends string ? K | `${K}.eq` | `${K}.gte` | `${K}.lte` | `${K}.lt` | `${K}.gt` | `${K}.ne` | `${K}.in` | `${K}.between` : never]?: any;
}


export const add: AxiosInstance['post'] = (model, data) => axios.post(`/api/${model}`, data)
export const page = (model: string, page: any, query: any, options: any = {}) => axios.post(`/api/page`, {
    model,
    page,
    query, ...options
})
export const all: AxiosInstance['get'] = (model) => axios.get(`/api/${model}`)
export const statistics = (model: string, field: string) => axios.get(`/api/statistics/${model}/${field}`)
export const list = <T extends Record<string, any>>(model: string, query: Query<T>, options = {}) => axios.post<T[]>(`/api/list`, {
    model,
    query,
    ...options,
})

export const one = <T extends Record<string, any>>(model: string, id: string) => axios.get<T>(`/api/${model}/${id}`)
export const update: AxiosInstance['put'] = (model, data) => axios.put(`/api/${model}`, data)
export const remove = (model: string, id: number | number[]) => Array.isArray(id) ? axios.delete(`/api/${model}`, id) : axios.delete(`/api/${model}/${id}`)

const axios = newAxiosInstance()

export default axios
