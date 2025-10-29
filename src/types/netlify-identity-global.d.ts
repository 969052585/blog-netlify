// netlify-identity-global.d.ts
declare global {
    // 初始化选项类型
    interface InitOptions {
        // 挂载的容器（如 '#some-query-selector'）
        container?: string | undefined;
        // 身份服务端点的绝对 URL（特殊场景下使用）
        APIUrl?: string | undefined;
        // 是否显示 Netlify  Logo
        logo?: boolean | undefined;
        // 初始语言
        locale?: string | undefined;
        // 姓名输入框的自定义占位符
        namePlaceholder?: string | undefined;
    }

    // 令牌类型
    interface Token {
        access_token: string;
        expires_at: string | number;
        expires_in: string | number;
        refresh_token: string;
        token_type: string;
    }

    // 用户信息类型
    interface NetlifyUser {
        api: {
            _sameOrigin?: boolean | undefined;
            apiURL: string;
            defaultHeaders: {
                [header: string]: string | string[] | undefined;
            };
        };
        app_metadata: {
            provider: string;
            roles: string[];
        };
        aud: string;
        audience?: any;
        confirmed_at: string;
        created_at: string;
        updated_at: string;
        invited_at: string;
        recovery_sent_at: string;
        email: string;
        id: string;
        role: string;
        token?: Token | undefined;
        url: string;
        user_metadata: {
            avatar_url?: string;
            full_name?: string;
        } | null;
    }

    // 全局暴露的 netlifyIdentity 对象
    interface NetlifyIdentity {
        /** 初始化身份验证组件 */
        init(opts?: InitOptions): void;
        /** 打开登录弹窗（可指定默认标签页：登录/注册） */
        open(tabName?: "signup" | "login"): void;
        /** 关闭登录弹窗 */
        close(): void;
        /** 获取当前登录用户 */
        currentUser(): User | null;
        /** 监听事件（初始化、登录、登出等） */
        on(event: "init", cb: (user: User | null) => void): void;
        on(event: "login", cb: (user: User) => void): void;
        on(event: "logout" | "open" | "close", cb: () => void): void;
        on(event: "error", cb: (err: Error) => void): void;
        /** 移除事件监听 */
        off(event: "init", cb?: (user: User | null) => void): void;
        off(event: "login", cb?: (user: User) => void): void;
        off(event: "logout" | "open" | "close", cb?: () => void): void;
        off(event: "error", cb?: (err: Error) => void): void;
        /** 登出当前用户（返回 Promise 或 undefined） */
        logout(): Promise<void> | undefined;
        /** 设置当前语言 */
        setLocale(locale: string): void;
        /** 刷新用户的 JWT 令牌 */
        refresh(force?: boolean): Promise<string>;
    }

    interface Window {
        netlifyIdentity?: NetlifyIdentity;
    }
}

// 确保文件被视为模块（TypeScript 要求）
export {};