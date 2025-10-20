import type {HandlerCallback, HandlerEvent, HandlerResponse} from '@netlify/functions/dist/main';

/**
 * 客户端地理位置信息对象
 */
interface Geo {
    /** 城市名称 */
    city?: string;
    /** 国家信息 */
    country?: {
        /** 国家ISO 3166代码 */
        code?: string;
        /** 国家名称 */
        name?: string;
    };
    /** 纬度 */
    latitude?: number;
    /** 经度 */
    longitude?: number;
    /** 国家分区（如省份、州）信息 */
    subdivision?: {
        /** 分区ISO 3166代码 */
        code?: string;
        /** 分区名称 */
        name?: string;
    };
    /** 时区 */
    timezone?: string;
    /** 邮政编码（格式因地区而异） */
    postalCode?: string;
}

/**
 * Cookie操作接口
 */
interface Cookies {
    /**
     * 读取指定名称的cookie
     * @param name - cookie名称
     * @returns cookie值（不存在则返回undefined）
     */
    get(name: string): string | undefined;

    /**
     * 设置cookie
     * 遵循CookieStore.set web标准
     * @param options - cookie设置选项
     */
    set(
        options: string | {
            name: string;
            value: string;
            expires?: Date | number;
            domain?: string;
            path?: string;
            secure?: boolean;
            sameSite?: 'strict' | 'lax' | 'none';
        }
    ): void;

    /**
     * 删除指定cookie
     * 遵循CookieStore.delete web标准
     * @param nameOrOptions - cookie名称或删除选项
     */
    delete(
        nameOrOptions: string | {
            name: string;
            domain?: string;
            path?: string;
        }
    ): void;
}

/**
 * Netlify部署信息对象
 */
interface Deploy {
    /** 部署上下文（如production、staging、dev等） */
    context: string;
    /** 部署唯一ID */
    id: string;
    /** 是否为当前已发布的部署 */
    published: boolean;
}

/**
 * Netlify团队账户信息
 */
interface Account {
    /** 团队唯一ID */
    id: string;
}

/**
 * 服务器元数据信息
 */
interface Server {
    /** 部署运行的区域代码（如us-east-1、dev等） */
    region: string;
}

/**
 * 站点元数据信息
 */
interface Site {
    /** 站点唯一ID */
    id: string;
    /** 站点名称（Netlify子域名） */
    name: string;
    /** 站点主URL（可能是自定义域名或本地开发地址） */
    url: string;
}

/**
 * 功能标志接口（实际类型可能根据Netlify内部实现有所不同）
 */
interface Flags {
    [key: string]: any;
}

/**
 * 完整的Netlify Context对象类型
 * 基于实际运行时环境补充
 */
export interface Context0 {
    /** 团队账户信息 */
    account: Account;

    /** Cookie操作接口 */
    cookies: Cookies;

    /** 部署信息 */
    deploy: Deploy;

    /** 功能标志 */
    flags: Flags;

    /** 请求路径（可能为undefined） */
    path?: string;

    /** 客户端地理位置数据 */
    geo: Geo;

    /** 客户端IP地址 */
    ip: string;

    /** 将数据序列化为JSON响应的工具函数 */
    json: (data: any) => Promise<Response>;

    /** 日志输出函数 */
    log: (...args: any[]) => void;

    /** 调用下一个中间件或处理程序的函数 */
    next: () => Promise<void>;

    /** 函数路径参数（如/pets/:name中的参数） */
    params: Record<string, string>;

    /** Netlify请求唯一ID */
    requestId: string;

    /** 重写请求到其他路径的函数 */
    rewrite: (path: string) => Promise<Response>;

    /** 服务器元数据 */
    server: Server;

    /** 站点元数据 */
    site: Site;

    /** 请求的URL对象 */
    url: URL;

    /**
     * 延长函数执行时间，直到Promise完成
     * 不会阻塞对客户端的响应发送
     * @param promise - 需要等待完成的Promise
     */
    waitUntil(promise: Promise<unknown>): void;
}


/**
 * 整合Hono Context的处理函数类型
 */
export interface Handler<
    ResponseType extends HandlerResponse = HandlerResponse,
    C extends Context0 = Context0
> {
    (
        event: Request & HandlerEvent & {requestId:string},
        context: C,
        callback?: HandlerCallback<ResponseType>
    ): void | Promise<ResponseType>;
}

interface Condition {
    field: string;
    operator: string;
    value: any;
}

type Nullable<T> = T | null | undefined;
export type Table = string;
export type Sql = string;
export type Offset = Nullable<number>;
export type Limit = Nullable<number>;
export type EntityQueryWrapper = Record<string, any>;
export type Entity = Record<string, any>;
export type Column = string;
export type ID = string | number;
export type IDS = Array<ID>;
export type Order = {
    column: Column,
    sort: 'DESC' | 'ASC'
};
export type Columns = Array<Column>;
export type PageReq = {
    current: number,
    size: number,
};
export type PageResp = PageReq & {
    current: number,
    size: number,
    total: number,
    totalPage: number,
    hasNext: boolean,
    hasPre: boolean,
    isFirst: boolean,
    isLast: boolean,
};

export interface QueryBody {
    model: Table;
    query?: EntityQueryWrapper,
    fields?: Columns,
    orderBy?: Array<string>,
    offset?: Offset,
    limit?: Limit,
    page?: PageReq
}

export interface MutationBody {
    model: Table;
    data?: Array<Entity>;
    entity?: Entity;
}

export interface DeleteBody {
    model: Table;
    ids: IDS;
}

type SqlReturn = {
    sql: string,
    params: unknown[],
    raw: string
}


export interface OrmResult<T = any, P = any> {
    list?: Array<T>,
    data?: T | Required<Pick<OrmResult<T, P>, 'list' | 'page'>>,
    page?: P
    error?: string
    stack?: string | string[]
}