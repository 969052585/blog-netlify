import path from 'node:path'
import {transformerMetaWordHighlight} from '@shikijs/transformers'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import Icons from 'unplugin-icons/vite'
import vueJsx from "@vitejs/plugin-vue-jsx";
import {visualizer} from 'rollup-plugin-visualizer';
import {defineConfig} from 'vitepress'

import {siteConfig} from './theme/config/site'
import CodeWrapperPlugin from './theme/plugins/codewrapper'
import ComponentPreviewPlugin from './theme/plugins/previewer'
import type {HeadConfig} from 'vitepress'

const icon = 'data:image/svg+xml;charset=utf-8,%3Csvg%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpolyline%20points%3D%2216%2018%2022%2012%2016%206%22%20%2F%3E%0A%20%20%3Cpolyline%20points%3D%228%206%202%2012%208%2018%22%20%2F%3E%0A%3C%2Fsvg%3E%0A'
// const serverProxy = {
//     target: 'http://127.0.0.1:9999',
//     changeOrigin: true,
//     configure: (proxy, options) => {
//         // proxy will be an instance of 'http-proxy'
//     },
// }

const head = [
    ['script', {src: 'https://identity.netlify.com/v1/netlify-identity-widget.js', defer: true }],
    ['link', {rel: 'icon', type: 'image/x-icon', href: icon}],
    ['link', {rel: 'shortcut icon', href: icon}],
    ['link', {rel: 'apple-touch-icon', href: icon}],
    ['link', {rel: 'manifest', href: '/site.webmanifest'}],
    ['meta', {name: 'theme-color', media: '(prefers-color-scheme: light)', content: 'white'}],
    ['meta', {name: 'theme-color', media: '(prefers-color-scheme: dark)', content: 'black'}],

    ['meta', {name: 'creator', content: 'Leo Song'}],
    ['meta', {name: 'theme-color', content: '#41b883'}],
    ['meta', {name: 'og:type', content: 'website'}],
    ['meta', {name: 'og:locale', content: 'en'}],
    ['meta', {name: 'og:site_name', content: siteConfig.name}],
    ['meta', {name: 'og:image', content: siteConfig.ogImage}],
    ['meta', {name: 'twitter:image', content: siteConfig.ogImage}],
] as HeadConfig[]
// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: siteConfig.name,
    titleTemplate: ':title - ' + siteConfig.name,
    description: siteConfig.description,
    head,

    sitemap: {
        hostname: 'https://www.shadcn-vue.com',
        transformItems(items) {
            return items.filter(item => !item.url.includes('migration'))
        },
    },

    lastUpdated: true,
    themeConfig: {
        search: {
            provider: 'local',
        },
        editLink: {
            pattern: 'https://github.com/radix-vue/shadcn-vue/tree/dev/apps/web/src/:path',
            text: 'Edit this page on GitHub',
        },
        carbonAds: {
            code: 'CW7DK27U',
            placement: 'wwwshadcn-vuecom',
        },
    },
    srcDir: path.resolve(__dirname, '../src'),
    markdown: {
        codeTransformers: [
            transformerMetaWordHighlight(),
        ],
        config(md) {
            md.use(ComponentPreviewPlugin)
            md.use(CodeWrapperPlugin)
        },
    },
    rewrites: {
        'content/(.*)': '(.*)',
    },
    vite: {
        build: {
            chunkSizeWarningLimit: 700,
            sourcemap: false,
            minify: 'esbuild', // 或 esbuild
            esbuild: {
                drop: ['console', 'debugger'] // 移除 console 和 debugger
            },
            rollupOptions: {
                external: [
                    // 'vditor',
                    // 'vue',
                    // '@vue/compiler-sfc'
                ],
                cache: true,
                output: {
                    globals: {
                        vditor: 'Vditor',
                        // vue: 'Vue',
                        '@vue/compiler-sfc': 'VueCompilerSFC'
                    },
                    compact: true,
                    manualChunks: function (id, meta) {
                        if (id.includes('compiler-sfc')) return  'vue-compiler-sfc'
                        if (id.includes('shikijs')) {
                            if (!id.includes('@shikijs/langs')) return 'shikijs'
                            let arr = id.split('shikijs/langs/dist/')
                            let name = arr[1].split('.')[0]
                            if (name !== 'typescript') name = 'langs'
                            return `shikijs-${name}`
                        }

                        function extractPackageName(path) {
                            let a: string = path.split('node_modules')[2]
                            a = a.replaceAll(/\/(.*?)\/.*/g, "$1")
                            a = a.replace('@', '')
                            return a
                        }

                        if (id.includes('node_modules')) {
                            const name = extractPackageName(id);
                            if (name.startsWith('d3-') || ["elkjs",
                                "kdbush",
                                "leaflet",
                                "maplibre-gl",
                                "supercluster",
                                "three",
                                "vue-demi",
                                "topojson-client",
                                "tslib"].includes(name)) return null
                            return name;
                        }
                        return null;
                    }
                }
            }
        },
        server: {
            port: 9000,
        //     proxy: {
        //         '/netlify': serverProxy,
        //         '/image': serverProxy,
        //         '/auth': serverProxy,
        //         '/api': serverProxy,
        //         '/sys': serverProxy,
        //         '/file': serverProxy,
        //     }
        },
        css: {
            postcss: {
                plugins: [
                    tailwind() as any,
                    autoprefixer(),
                ],
            },
        },
        plugins: [
            Icons({compiler: 'vue3', autoInstall: true}) as any,
            vueJsx(),
            // visualizer({
            //     open: false, // 打包后自动打开分析图
            //     filename: 'visualizer.html', // 分析图生成的文件名
            //     gzipSize: true, // 显示 gzip 压缩大小
            //     brotliSize: true, // 显示 brotli 压缩大小
            // }),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '../src'),
            },
        },
    },
})
