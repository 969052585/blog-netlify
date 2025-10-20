import dotenv from "dotenv";
import * as console from "console";
import {isString} from "lodash-es";
import type {Handler} from "../types";
import App from "../app";

interface Supplier<T> {
    (): T;
}

interface SingleInstanceConstructor<T> {
    getInstance(): T;
}

export function createSingleInstance<T>(supplier: Supplier<T>): SingleInstanceConstructor<T> {
    return class SingleInstance {
        private static instance: T;

        public static getInstance(): T {
            if (!SingleInstance.instance) {
                SingleInstance.instance = supplier();
            }
            return SingleInstance.instance;
        }
    };
}


function useLimitedFun<F extends Function, P = Parameters<F>, R = ReturnType<F>>(
    origin: F,
    max = 1
): F {
    let count = 0;
    let result: R;
    return (function (...args) {
        if (count >= max) return result
        result = origin(...args);
        count++;
        return result;
    }) as F
}

export const loadEnv = useLimitedFun(() => {
    console.log("🏁 loadEnv start...")
    let result = dotenv.config({debug: true, override: true})
    console.log("✅ loadEnv end...",result.parsed)
    return result
})


export class ServerResponse {
    static OK = 200;
    static FAIL = 400;
    private readonly code: number;
    private msg?: string;
    private data?: any;

    constructor<T>({ code, msg, data }: { code: number, msg?: string, data?: T }) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    public isOk() {
        return ServerResponse.OK === this.code;
    }

    public isFail() {
        return ServerResponse.FAIL === this.code;
    }

    public static ok<T>(msg?: string, data?: T) {
        return new ServerResponse({ code: ServerResponse.OK, msg, data });
    }

    public static okMsg<T>(msg?: string) {
        return new ServerResponse({ code: ServerResponse.OK, msg });
    }

    public static okData<T>(data?: T) {
        return new ServerResponse({ code: ServerResponse.OK, data });
    }

    public static fail<T>(msg?: string, data?: T) {
        if (isString(data)) data = (data as string).split("\n") as T
        return new ServerResponse({ code: ServerResponse.FAIL, msg, data });
    }

    public static failMsg<T>(msg?: string) {
        return new ServerResponse({ code: ServerResponse.FAIL, msg });
    }

    public static failData<T>(data?: T) {
        return new ServerResponse({ code: ServerResponse.FAIL, data });
    }
}

export class R extends ServerResponse {}




/**
 * Netlify 函数处理程序
 * 将 Netlify Lambda 事件转换为标准 Request 对象并调用 Hono 应用
 *
 * @param event 结合了 Request 和 HandlerEvent 的事件对象，包含请求信息和 Netlify 特定上下文
 * @returns Promise<HandlerResponse> 标准的 Netlify 响应对象
 */
export const handler: Handler = async (event) => {
    try {
        // 将 Netlify event 转换为标准 Request 对象
        const request = createRequestFromEvent(event);

        // 调用 Hono 的 fetch 方法
        const response = await App.getInstance().fetch(request);

        // 将标准 Response 对象转换为 Netlify 期望的响应格式
        const responseBody = await response.text();

        return {
            statusCode: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseBody,
            isBase64Encoded: false
        };
    } catch (error) {
        console.error('API 处理错误:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};


/**
 * 将 Netlify Lambda 的 event 对象转换为标准的 Request 对象
 * @param event Netlify Lambda 的事件对象
 * @returns 标准的 Request 对象
 */
function createRequestFromEvent(event: any): Request {
    // 构建完整的 URL
    const host = event.headers.host;
    const path = event.path;
    const protocol = event.headers['x-forwarded-proto'] || 'http';
    const url = `${protocol}://${host}${path}`;

    // 创建 URLSearchParams 对象用于查询参数
    const searchParams = new URLSearchParams();
    if (event.queryStringParameters) {
        Object.entries(event.queryStringParameters).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, value);
            }
        });
    }

    // 如果有查询参数，添加到 URL 中
    let fullUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;

    // 创建 Request 对象
    const requestInit: RequestInit = {
        method: event.httpMethod || 'GET',
        headers: new Headers(),
    };

    // 添加请求头
    if (event.headers) {
        Object.entries(event.headers).forEach(([key, value]) => {
            if (value !== undefined) {
                requestInit.headers?.append(key, value.toString());
            }
        });
    }

    // 添加请求体（仅当方法不是 GET 或 HEAD 时）
    if (event.body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(requestInit.method)) {
        requestInit.body = event.body;
        // 如果请求体是 base64 编码的，需要解码
        if (event.isBase64Encoded) {
            requestInit.body = Buffer.from(event.body, 'base64').toString('utf8');
        }
    }

    fullUrl = fullUrl.replace("/functions","")

    return new Request(fullUrl, requestInit);
}
