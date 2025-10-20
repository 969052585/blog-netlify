import App from '../app/index.js'
import {generateComplexRandomString} from '../../utils/random.js';
import {loadEnv} from "../common/index.js";
import process from "process";

/**
 * 将 Netlify Lambda 的 event 对象转换为标准的 Request 对象
 * @param {Object} event Netlify Lambda 的事件对象
 * @returns {Request} 标准的 Request 对象
 */
function createRequestFromEvent(event) {
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
    const requestInit = {
        method: event.httpMethod || 'GET',
        headers: new Headers(),
    };

    // 添加请求头
    if (event.headers) {
        Object.entries(event.headers).forEach(([key, value]) => {
            if (value !== undefined) {
                requestInit.headers.append(key, value.toString());
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

/**
 * Netlify 函数处理程序
 * 将 Netlify Lambda 事件转换为标准 Request 对象并调用 Hono 应用
 *
 * @param {Object} event 事件对象，包含请求信息和 Netlify 特定上下文
 * @returns {Promise<Object>} 标准的 Netlify 响应对象
 */
export const handler = async (event) => {
    try {
        loadEnv()
        // 将 Netlify event 转换为标准 Request 对象
        const request = createRequestFromEvent(event);
        console.log(request,event,process.env.NETLIFY,"request")



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