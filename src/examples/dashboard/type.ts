export const settingNavBarItems = [
    {
        title: '基础信息',
        value: 'basic',
    },
    {
        title: '权限',
        value: 'permission',
    },
    {
        title: '其他',
        value: 'other',
    }
] as const


export type SettingNavBarKey = typeof settingNavBarItems[number]['value']