export interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
  icon?: string
  label?: string
}

export type SidebarNavItem = NavItem & {
  items?: SidebarNavItem[]
}

export type NavItemWithChildren = NavItem & {
  items?: NavItemWithChildren[]
}

interface DocsConfig {
  mainNav: NavItem[]
  sidebarNav: SidebarNavItem[]
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: '首页',
      href: '/?module=全站',
    },
    {
      title: '后端',
      href: '/backend/',
    },
    {
      title: 'Docs',
      href: '/docs/introduction',
    },
    {
      title: 'Themes',
      href: '/themes',
    },
    {
      title: 'Examples',
      href: '/examples/mail',
    },
    {
      title: 'Blocks',
      href: '/blocks',
    },
    {
      title: 'GitHub',
      href: 'https://github.com/radix-vue/shadcn-vue',
      external: true,
    },
  ],
  sidebarNav: [
    {
      title: '相关',
      items: [

      ],
    },
  ],
}

interface Example {
  name: string
  href: string
  label?: string
  code: string
}
export const examples: Example[] = [
  {
    name: 'Mail',
    href: '/examples/mail',
    code: 'https://github.com/radix-vue/shadcn-vue/tree/dev/apps/web/src/examples/mail',
  },
  {
    name: 'Dashboard',
    href: '/examples/dashboard',
    code: 'https://github.com/radix-vue/shadcn-vue/tree/dev/apps/web/src/examples/dashboard',
  },
  {
    name: 'Cards',
    href: '/examples/cards',
    code: 'https://github.com/radix-vue/shadcn-vue/tree/dev/apps/web/src/examples/cards',
  },
  // {
  // name: "Tasks",
  // href: "/examples/tasks",
  // label: "New",
  // code: "https://github.com/radix-vue/shadcn-vue/tree/dev/apps/web/src/examples/tasks"
  // },
  {
    name: 'Playground',
    href: '/examples/playground',
    code: 'https://github.com/radix-vue/shadcn-vue/tree/dev/apps/web/src/examples/playground',
  },
  {
    name: 'Music',
    href: '/examples/music',
    code: 'https://github.com/radix-vue/shadcn-vue/tree/dev/apps/web/src/examples/music',
  },
  {
    name: 'Authentication',
    href: '/examples/authentication',
    code: 'https://github.com/radix-vue/shadcn-vue/tree/dev/apps/web/src/examples/authentication',
  },
  {
    name: 'Forms',
    href: '/examples/forms',
    code: 'https://github.com/radix-vue/shadcn-vue/tree/dev/apps/web/src/routes/examples/forms',
  },
]
