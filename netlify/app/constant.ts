export class UserVerifyTimeMap {
    private static instance: UserVerifyTimeMap;
    private map: Record<string, number> = {};

    // 私有构造函数防止外部实例化
    private constructor() {}

    // 获取单例实例
    public static getInstance(): UserVerifyTimeMap {
        if (!UserVerifyTimeMap.instance) {
            UserVerifyTimeMap.instance = new UserVerifyTimeMap();
        }
        return UserVerifyTimeMap.instance;
    }

    // 获取map副本
    public getMap() {
        return Object.assign({}, this.map);
    }

    // 设置值
    public set(username: string, time: number) {
        this.map[username] = time;
    }

    // 获取值
    public get(username: string) {
        return this.map[username];
    }
}
export function createUserVerifyTime() {
    let map: Record<string, number> = {}
    return {
        get map() {
            return Object.assign({}, map)
        },
        set(username: string, time: number) {
            map[username] = time;
        },
        get(username: string) {
            return map[username];
        },
    }
}

