import dotenv from 'dotenv';
import * as console from 'console';
import {isString} from 'lodash-es';

/**
 * 创建单例实例的构造函数
 * @template T
 * @param {Function} supplier - 提供实例的函数
 * @returns {Object} 包含getInstance方法的对象
 */
export function createSingleInstance(supplier) {
    return class SingleInstance {
        static instance;

        static getInstance() {
            if (!SingleInstance.instance) {
                SingleInstance.instance = supplier();
            }
            return SingleInstance.instance;
        }
    };
}

/**
 * 限制函数调用次数的装饰器
 * @template F
 * @param {F} origin - 原始函数
 * @param {number} max - 最大调用次数
 * @returns {F} 包装后的函数
 */
function useLimitedFun(origin, max = 1) {
    let count = 0;
    let result;
    return function(...args) {
        if (count >= max) return result;
        result = origin(...args);
        count++;
        return result;
    };
}

export const loadEnv = useLimitedFun(() => {
    console.log('🏁 loadEnv start...');
    let result = dotenv.config({ debug: true, override: true });
    console.log('✅ loadEnv end...', result.parsed);
    return result;
});

/**
 * 服务器响应类
 */
export class ServerResponse {
    static OK = 200;
    static FAIL = 400;

    constructor({ code, msg, data }) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    isOk() {
        return ServerResponse.OK === this.code;
    }

    isFail() {
        return ServerResponse.FAIL === this.code;
    }

    static ok(msg, data) {
        return new ServerResponse({ code: ServerResponse.OK, msg, data });
    }

    static okMsg(msg) {
        return new ServerResponse({ code: ServerResponse.OK, msg });
    }

    static okData(data) {
        return new ServerResponse({ code: ServerResponse.OK, data });
    }

    static fail(msg, data) {
        if (isString(data)) data = data.split('\n');
        return new ServerResponse({ code: ServerResponse.FAIL, msg, data });
    }

    static failMsg(msg) {
        return new ServerResponse({ code: ServerResponse.FAIL, msg });
    }

    static failData(data) {
        return new ServerResponse({ code: ServerResponse.FAIL, data });
    }
}

export class R extends ServerResponse {}