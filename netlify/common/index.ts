// @ts-nocheck
import dotenv from "dotenv";
import * as console from "console";
import {isString} from "lodash-es";
import type {Handler} from "../types";
import App from "../app";
export * from './system'

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


function useLimitedFun<F extends (...args: any) => any>(
    origin: F,
    max = 1
): F {
    let count = 0;
    let result: ReturnType<F>;
    return function (...args: Parameters<F>): ReturnType<F> {
        if (count >= max) return result!;
        result = origin(...args);
        count++;
        return result;
    } as F; // 类型断言，确认返回类型与F一致
}

export const loadEnv = useLimitedFun(() => {
    // console.log("🏁 loadEnv start...")
    let result = dotenv.config({debug: true, override: true})
    // console.log("✅ loadEnv end...", result.parsed)
    return result
})


export class ServerResponse<T = any> {
    static OK = 200;
    static FAIL = 400;
    private readonly code: number;
    private msg?: string;
    private data?: any;

    constructor({code, msg, data}: { code: number, msg?: string, data?: T }) {
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
        return new ServerResponse({code: ServerResponse.OK, msg, data});
    }

    public static okMsg(msg?: string) {
        return new ServerResponse({code: ServerResponse.OK, msg});
    }

    public static okData<T>(data?: T) {
        return new ServerResponse({code: ServerResponse.OK, data});
    }

    public static fail<T>(msg?: string, data?: T) {
        if (isString(data)) data = (data as string).split("\n") as T
        return new ServerResponse({code: ServerResponse.FAIL, msg, data});
    }

    public static failMsg(msg?: string) {
        return new ServerResponse({code: ServerResponse.FAIL, msg});
    }

    public static failData<T>(data?: T) {
        return new ServerResponse({code: ServerResponse.FAIL, data});
    }
}

export class R extends ServerResponse {
}


/**
 * Netlify 函数处理程序
 * 将 Netlify Lambda 事件转换为标准 Request 对象并调用 Hono 应用
 *
 * @param event 结合了 Request 和 HandlerEvent 的事件对象，包含请求信息和 Netlify 特定上下文
 * @param context
 * @returns Promise<HandlerResponse> 标准的 Netlify 响应对象
 */
export const handler: Handler = async (event,context: {clientContext:ClientContext}) => {
    try {
        // 将 Netlify event 转换为标准 Request 对象
        const request = createRequestFromEvent(event,context.clientContext);

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
            body: JSON.stringify({error: 'Internal Server Error'})
        };
    }
};


interface User {
    email?: string,
    exp?: number
}

interface ClientContext {
    user?: User
}
/**
 * 将 Netlify Lambda 的 event 对象转换为标准的 Request 对象
 * @param event Netlify Lambda 的事件对象
 * @param context 上下文
 * @returns 标准的 Request 对象
 */
function createRequestFromEvent(event: any, context: ClientContext): Request {
    // 1. 构建完整 URL（修复：保留协议正确性，处理无 x-forwarded-proto 的情况）
    const host = event.headers.host;
    const path = event.path;
    const protocol = event.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
    const url = `${protocol}://${host}${path}`;

    // 2. 处理查询参数（无问题）
    const searchParams = new URLSearchParams();
    if (event.queryStringParameters) {
        Object.entries(event.queryStringParameters).forEach(([key, value]) => {
            if (value !== undefined) searchParams.append(key, value as string);
        });
    }
    const queryStr = searchParams.toString();
    let fullUrl = queryStr ? `${url}?${queryStr}` : url;

    // 3. 构建 RequestInit 基础配置（无问题）
    const requestInit: RequestInit = {
        method: event.httpMethod || 'GET',
        headers: new Headers(),
        // 关键：添加 mode 确保 CORS 兼容性（Netlify 环境需显式配置）
        mode: 'cors',
        // 关键：保留凭证信息（如 cookie，可选，根据需求调整）
        credentials: 'same-origin'
    };

    // 4. 处理请求头（修复：兼容 multiValueHeaders，避免重复/丢失头信息）
    const headers = event.multiValueHeaders || event.headers;
    if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
            if (value === undefined) return;
            const values = Array.isArray(value) ? value : [value.toString()];
            values.forEach(val => requestInit.headers?.append(key, val));
        });
        const user = context.user || {}
        requestInit.headers?.append("X-USER",user.email ?? '')
        requestInit.headers?.append("X-EXP",user.exp ?? 0)
    }

    if (event.body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(requestInit.method!)) {
        const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
        const isMultipart = contentType.includes('multipart/form-data');

        if (event.isBase64Encoded) {

            const buffer = Buffer.from(event.body, 'base64');

            if (isMultipart) {
                requestInit.body = buffer.buffer;
            } else {
                try {
                    requestInit.body = buffer.toString('utf8');
                } catch (e) {
                    requestInit.body = buffer.buffer;
                }
            }
        } else {
            requestInit.body = event.body;
        }
    }

    fullUrl = fullUrl.replace('/functions', '');

    return new Request(fullUrl, requestInit);
}
