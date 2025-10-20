export class UserVerifyTimeMap {
    static instance;
    map = {};

    // 私有构造函数防止外部实例化
    constructor() {}

    // 获取单例实例
    static getInstance() {
        if (!UserVerifyTimeMap.instance) {
            UserVerifyTimeMap.instance = new UserVerifyTimeMap();
        }
        return UserVerifyTimeMap.instance;
    }

    // 获取map副本
    getMap() {
        return Object.assign({}, this.map);
    }

    // 设置值
    set(username, time) {
        this.map[username] = time;
    }

    // 获取值
    get(username) {
        return this.map[username];
    }
}
export function createUserVerifyTime() {
    let map = {}
    return {
        get map() {
            return Object.assign({}, map)
        },
        set(username, time) {
            map[username] = time;
        },
        get(username) {
            return map[username];
        },
    }
}