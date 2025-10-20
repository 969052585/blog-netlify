// .vitepress/config.mts
import path from "node:path";
import { transformerMetaWordHighlight } from "file:///D:/blog9690/node_modules/.pnpm/@shikijs+transformers@1.29.2/node_modules/@shikijs/transformers/dist/index.mjs";
import autoprefixer from "file:///D:/blog9690/node_modules/.pnpm/autoprefixer@10.4.21_postcss@8.5.6/node_modules/autoprefixer/lib/autoprefixer.js";
import tailwind from "file:///D:/blog9690/node_modules/.pnpm/tailwindcss@3.4.17/node_modules/tailwindcss/lib/index.js";
import Icons from "file:///D:/blog9690/node_modules/.pnpm/unplugin-icons@0.19.3_@vue+compiler-sfc@3.5.19/node_modules/unplugin-icons/dist/vite.js";
import vueJsx from "file:///D:/blog9690/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.2._638b7e49a2dafc72c11f23bb2179e9ed/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import { defineConfig } from "file:///D:/blog9690/node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_99f5bb6a5684309dba19207aa273a584/node_modules/vitepress/dist/node/index.js";

// .vitepress/theme/config/site.ts
var siteConfig = {
  name: "\u5199\u4EE3\u7801\u3082\u7528\u5238",
  url: "https://969052585.pages.dev",
  ogImage: "https://shadcn-vue.com/og.png",
  description: "\u7A0B\u5E8F\u5458\u4E13\u5C5E\u7684\u5B9E\u7528\u5DE5\u5177\u4E0E\u8D44\u6E90\u805A\u5408\u5E73\u53F0\uFF0C\u63D0\u4F9B\u4EE3\u7801\u5DE5\u5177\u3001\u5F00\u53D1\u6280\u5DE7\u3001\u8D44\u6E90\u4F18\u60E0\u7B49\u5B9E\u7528\u5185\u5BB9\uFF0C\u52A9\u529B\u5F00\u53D1\u8005\u9AD8\u6548\u7F16\u7801\u3001\u964D\u4F4E\u5F00\u53D1\u6210\u672C\uFF0C\u8BA9\u5199\u4EE3\u7801\u4E5F\u80FD\u50CF\u7528\u4F18\u60E0\u5238\u4E00\u6837\u7701\u5FC3\u7701\u529B\u3002",
  links: {
    twitter: "https://twitter.com/huntabyte",
    github: "https://github.com/huntabyte/shadcn-vue",
    shadTwitter: "https://twitter.com/shadcn",
    shadGithub: "https://github.com/shadcn/ui"
  },
  keywords: "\u5199\u4EE3\u7801\u3082\u7528\u5238, \u7A0B\u5E8F\u5458\u5DE5\u5177, \u5F00\u53D1\u8D44\u6E90, \u4EE3\u7801\u6280\u5DE7, \u7F16\u7A0B\u4F18\u60E0, \u9AD8\u6548\u7F16\u7801, \u5F00\u53D1\u8005\u5DE5\u5177, \u7F16\u7A0B\u8D44\u6E90\u805A\u5408"
};

// .vitepress/theme/plugins/codewrapper.ts
function codewrapper_default(md) {
  const defaultFenceRenderer = md.renderer.rules.fence;
  if (!defaultFenceRenderer)
    return;
  md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const isAllowedExtension = token.info.includes("vue") || token.info.includes("astro") || token.info.includes("ts");
    if (token && token.tag === "code" && isAllowedExtension) {
      return `<CodeWrapper>${defaultFenceRenderer(tokens, idx, options, env, self)}</CodeWrapper>`;
    }
    return defaultFenceRenderer(tokens, idx, options, env, self);
  };
}

// .vitepress/theme/plugins/utils.ts
import { baseParse } from "file:///D:/blog9690/node_modules/.pnpm/@vue+compiler-core@3.5.19/node_modules/@vue/compiler-core/index.js";
function isUndefined(v) {
  return v === void 0 || v === null;
}
function getPropsMap(attrs) {
  const map = {};
  for (const { name, value, exp, arg } of attrs) {
    if (name === "bind") {
      if (!isUndefined(arg?.content))
        map[arg.content] = JSON.parse(exp.content);
      continue;
    }
    if (isUndefined(value?.content) || value?.content === "")
      map[name] = true;
    else if (["true", "false"].includes(value?.content || ""))
      map[name] = value?.content === "true";
    else
      map[name] = value?.content;
  }
  return map;
}
function parseProps(content) {
  const ast = baseParse(content);
  const demoElement = ast.children[0];
  return getPropsMap(demoElement.props);
}

// .vitepress/theme/plugins/previewer.ts
function previewer_default(md) {
  function addRenderRule(type) {
    const defaultRender = md.renderer.rules[type];
    md.renderer.rules[type] = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const content = token.content.trim();
      if (!content.match(/^<ComponentPreview\s/) || !content.endsWith("/>"))
        return defaultRender(tokens, idx, options, env, self);
      const props = parseProps(content);
      const { attrs } = props;
      const demoScripts = `<ComponentPreview ${attrs ?? ""} v-bind='${JSON.stringify(props)}'></ComponentPreview>`.trim();
      return demoScripts;
    };
  }
  addRenderRule("html_block");
  addRenderRule("html_inline");
}

// .vitepress/config.mts
var __vite_injected_original_dirname = "D:\\blog9690\\.vitepress";
var icon = "data:image/svg+xml;charset=utf-8,%3Csvg%0A%20%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%0A%20%20width%3D%2224%22%0A%20%20height%3D%2224%22%0A%20%20viewBox%3D%220%200%2024%2024%22%0A%20%20fill%3D%22none%22%0A%20%20stroke%3D%22currentColor%22%0A%20%20stroke-width%3D%222%22%0A%20%20stroke-linecap%3D%22round%22%0A%20%20stroke-linejoin%3D%22round%22%0A%3E%0A%20%20%3Cpolyline%20points%3D%2216%2018%2022%2012%2016%206%22%20%2F%3E%0A%20%20%3Cpolyline%20points%3D%228%206%202%2012%208%2018%22%20%2F%3E%0A%3C%2Fsvg%3E%0A";
var config_default = defineConfig({
  title: siteConfig.name,
  titleTemplate: ":title - " + siteConfig.name,
  description: siteConfig.description,
  head: [
    ["link", { rel: "icon", type: "image/x-icon", href: icon }],
    ["link", { rel: "shortcut icon", href: icon }],
    ["link", { rel: "apple-touch-icon", href: icon }],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    ["meta", { name: "theme-color", media: "(prefers-color-scheme: light)", content: "white" }],
    ["meta", { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "black" }],
    ["meta", { name: "creator", content: "Leo Song" }],
    ["meta", { name: "theme-color", content: "#41b883" }],
    ["meta", { name: "og:type", content: "website" }],
    ["meta", { name: "og:locale", content: "en" }],
    ["meta", { name: "og:site_name", content: siteConfig.name }],
    ["meta", { name: "og:image", content: siteConfig.ogImage }],
    ["meta", { name: "twitter:image", content: siteConfig.ogImage }]
  ],
  sitemap: {
    hostname: "https://www.shadcn-vue.com",
    transformItems(items) {
      return items.filter((item) => !item.url.includes("migration"));
    }
  },
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: "local"
    },
    editLink: {
      pattern: "https://github.com/radix-vue/shadcn-vue/tree/dev/apps/web/src/:path",
      text: "Edit this page on GitHub"
    },
    carbonAds: {
      code: "CW7DK27U",
      placement: "wwwshadcn-vuecom"
    }
  },
  srcDir: path.resolve(__vite_injected_original_dirname, "../src"),
  markdown: {
    codeTransformers: [
      transformerMetaWordHighlight()
    ],
    config(md) {
      md.use(previewer_default);
      md.use(codewrapper_default);
    }
  },
  rewrites: {
    "content/(.*)": "(.*)"
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 700,
      sourcemap: false,
      minify: "esbuild",
      // 或 esbuild
      esbuild: {
        drop: ["console", "debugger"]
        // 移除 console 和 debugger
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
            vditor: "Vditor",
            // vue: 'Vue',
            "@vue/compiler-sfc": "VueCompilerSFC"
          },
          compact: true,
          manualChunks: function(id, meta) {
            if (id.includes("compiler-sfc")) return "vue-compiler-sfc";
            if (id.includes("shikijs")) {
              if (!id.includes("@shikijs/langs")) return "shikijs";
              let arr = id.split("shikijs/langs/dist/");
              let name = arr[1].split(".")[0];
              if (name !== "typescript") name = "langs";
              return `shikijs-${name}`;
            }
            function extractPackageName(path2) {
              let a = path2.split("node_modules")[2];
              a = a.replaceAll(/\/(.*?)\/.*/g, "$1");
              a = a.replace("@", "");
              return a;
            }
            if (id.includes("node_modules")) {
              const name = extractPackageName(id);
              if (name.startsWith("d3-") || [
                "elkjs",
                "kdbush",
                "leaflet",
                "maplibre-gl",
                "supercluster",
                "three",
                "vue-demi",
                "topojson-client",
                "tslib"
              ].includes(name)) return null;
              return name;
            }
            return null;
          }
        }
      }
    },
    server: {
      port: 9e3
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
          tailwind(),
          autoprefixer()
        ]
      }
    },
    plugins: [
      Icons({ compiler: "vue3", autoInstall: true }),
      vueJsx()
      // visualizer({
      //     open: false, // 打包后自动打开分析图
      //     filename: 'visualizer.html', // 分析图生成的文件名
      //     gzipSize: true, // 显示 gzip 压缩大小
      //     brotliSize: true, // 显示 brotli 压缩大小
      // }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "../src")
      }
    }
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9jb25maWcubXRzIiwgIi52aXRlcHJlc3MvdGhlbWUvY29uZmlnL3NpdGUudHMiLCAiLnZpdGVwcmVzcy90aGVtZS9wbHVnaW5zL2NvZGV3cmFwcGVyLnRzIiwgIi52aXRlcHJlc3MvdGhlbWUvcGx1Z2lucy91dGlscy50cyIsICIudml0ZXByZXNzL3RoZW1lL3BsdWdpbnMvcHJldmlld2VyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcYmxvZzk2OTBcXFxcLnZpdGVwcmVzc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcYmxvZzk2OTBcXFxcLnZpdGVwcmVzc1xcXFxjb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9ibG9nOTY5MC8udml0ZXByZXNzL2NvbmZpZy5tdHNcIjtpbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnXG5pbXBvcnQge3RyYW5zZm9ybWVyTWV0YVdvcmRIaWdobGlnaHR9IGZyb20gJ0BzaGlraWpzL3RyYW5zZm9ybWVycydcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSAnYXV0b3ByZWZpeGVyJ1xuaW1wb3J0IHRhaWx3aW5kIGZyb20gJ3RhaWx3aW5kY3NzJ1xuaW1wb3J0IEljb25zIGZyb20gJ3VucGx1Z2luLWljb25zL3ZpdGUnXG5pbXBvcnQgdnVlSnN4IGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWUtanN4XCI7XG5pbXBvcnQge3Zpc3VhbGl6ZXJ9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcic7XG5pbXBvcnQge2RlZmluZUNvbmZpZ30gZnJvbSAndml0ZXByZXNzJ1xuXG5pbXBvcnQge3NpdGVDb25maWd9IGZyb20gJy4vdGhlbWUvY29uZmlnL3NpdGUnXG5pbXBvcnQgQ29kZVdyYXBwZXJQbHVnaW4gZnJvbSAnLi90aGVtZS9wbHVnaW5zL2NvZGV3cmFwcGVyJ1xuaW1wb3J0IENvbXBvbmVudFByZXZpZXdQbHVnaW4gZnJvbSAnLi90aGVtZS9wbHVnaW5zL3ByZXZpZXdlcidcblxuY29uc3QgaWNvbiA9ICdkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtOCwlM0NzdmclMEElMjAlMjB4bWxucyUzRCUyMmh0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyMiUwQSUyMCUyMHdpZHRoJTNEJTIyMjQlMjIlMEElMjAlMjBoZWlnaHQlM0QlMjIyNCUyMiUwQSUyMCUyMHZpZXdCb3glM0QlMjIwJTIwMCUyMDI0JTIwMjQlMjIlMEElMjAlMjBmaWxsJTNEJTIybm9uZSUyMiUwQSUyMCUyMHN0cm9rZSUzRCUyMmN1cnJlbnRDb2xvciUyMiUwQSUyMCUyMHN0cm9rZS13aWR0aCUzRCUyMjIlMjIlMEElMjAlMjBzdHJva2UtbGluZWNhcCUzRCUyMnJvdW5kJTIyJTBBJTIwJTIwc3Ryb2tlLWxpbmVqb2luJTNEJTIycm91bmQlMjIlMEElM0UlMEElMjAlMjAlM0Nwb2x5bGluZSUyMHBvaW50cyUzRCUyMjE2JTIwMTglMjAyMiUyMDEyJTIwMTYlMjA2JTIyJTIwJTJGJTNFJTBBJTIwJTIwJTNDcG9seWxpbmUlMjBwb2ludHMlM0QlMjI4JTIwNiUyMDIlMjAxMiUyMDglMjAxOCUyMiUyMCUyRiUzRSUwQSUzQyUyRnN2ZyUzRSUwQSdcbi8vIGNvbnN0IHNlcnZlclByb3h5ID0ge1xuLy8gICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6OTk5OScsXG4vLyAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuLy8gICAgIGNvbmZpZ3VyZTogKHByb3h5LCBvcHRpb25zKSA9PiB7XG4vLyAgICAgICAgIC8vIHByb3h5IHdpbGwgYmUgYW4gaW5zdGFuY2Ugb2YgJ2h0dHAtcHJveHknXG4vLyAgICAgfSxcbi8vIH1cblxuLy8gaHR0cHM6Ly92aXRlcHJlc3MuZGV2L3JlZmVyZW5jZS9zaXRlLWNvbmZpZ1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICB0aXRsZTogc2l0ZUNvbmZpZy5uYW1lLFxuICAgIHRpdGxlVGVtcGxhdGU6ICc6dGl0bGUgLSAnICsgc2l0ZUNvbmZpZy5uYW1lLFxuICAgIGRlc2NyaXB0aW9uOiBzaXRlQ29uZmlnLmRlc2NyaXB0aW9uLFxuICAgIGhlYWQ6IFtcbiAgICAgICAgWydsaW5rJywge3JlbDogJ2ljb24nLCB0eXBlOiAnaW1hZ2UveC1pY29uJywgaHJlZjogaWNvbn1dLFxuICAgICAgICBbJ2xpbmsnLCB7cmVsOiAnc2hvcnRjdXQgaWNvbicsIGhyZWY6IGljb259XSxcbiAgICAgICAgWydsaW5rJywge3JlbDogJ2FwcGxlLXRvdWNoLWljb24nLCBocmVmOiBpY29ufV0sXG4gICAgICAgIFsnbGluaycsIHtyZWw6ICdtYW5pZmVzdCcsIGhyZWY6ICcvc2l0ZS53ZWJtYW5pZmVzdCd9XSxcbiAgICAgICAgWydtZXRhJywge25hbWU6ICd0aGVtZS1jb2xvcicsIG1lZGlhOiAnKHByZWZlcnMtY29sb3Itc2NoZW1lOiBsaWdodCknLCBjb250ZW50OiAnd2hpdGUnfV0sXG4gICAgICAgIFsnbWV0YScsIHtuYW1lOiAndGhlbWUtY29sb3InLCBtZWRpYTogJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyayknLCBjb250ZW50OiAnYmxhY2snfV0sXG5cbiAgICAgICAgWydtZXRhJywge25hbWU6ICdjcmVhdG9yJywgY29udGVudDogJ0xlbyBTb25nJ31dLFxuICAgICAgICBbJ21ldGEnLCB7bmFtZTogJ3RoZW1lLWNvbG9yJywgY29udGVudDogJyM0MWI4ODMnfV0sXG4gICAgICAgIFsnbWV0YScsIHtuYW1lOiAnb2c6dHlwZScsIGNvbnRlbnQ6ICd3ZWJzaXRlJ31dLFxuICAgICAgICBbJ21ldGEnLCB7bmFtZTogJ29nOmxvY2FsZScsIGNvbnRlbnQ6ICdlbid9XSxcbiAgICAgICAgWydtZXRhJywge25hbWU6ICdvZzpzaXRlX25hbWUnLCBjb250ZW50OiBzaXRlQ29uZmlnLm5hbWV9XSxcbiAgICAgICAgWydtZXRhJywge25hbWU6ICdvZzppbWFnZScsIGNvbnRlbnQ6IHNpdGVDb25maWcub2dJbWFnZX1dLFxuICAgICAgICBbJ21ldGEnLCB7bmFtZTogJ3R3aXR0ZXI6aW1hZ2UnLCBjb250ZW50OiBzaXRlQ29uZmlnLm9nSW1hZ2V9XSxcbiAgICBdLFxuXG4gICAgc2l0ZW1hcDoge1xuICAgICAgICBob3N0bmFtZTogJ2h0dHBzOi8vd3d3LnNoYWRjbi12dWUuY29tJyxcbiAgICAgICAgdHJhbnNmb3JtSXRlbXMoaXRlbXMpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtcy5maWx0ZXIoaXRlbSA9PiAhaXRlbS51cmwuaW5jbHVkZXMoJ21pZ3JhdGlvbicpKVxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBsYXN0VXBkYXRlZDogdHJ1ZSxcbiAgICB0aGVtZUNvbmZpZzoge1xuICAgICAgICBzZWFyY2g6IHtcbiAgICAgICAgICAgIHByb3ZpZGVyOiAnbG9jYWwnLFxuICAgICAgICB9LFxuICAgICAgICBlZGl0TGluazoge1xuICAgICAgICAgICAgcGF0dGVybjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9yYWRpeC12dWUvc2hhZGNuLXZ1ZS90cmVlL2Rldi9hcHBzL3dlYi9zcmMvOnBhdGgnLFxuICAgICAgICAgICAgdGV4dDogJ0VkaXQgdGhpcyBwYWdlIG9uIEdpdEh1YicsXG4gICAgICAgIH0sXG4gICAgICAgIGNhcmJvbkFkczoge1xuICAgICAgICAgICAgY29kZTogJ0NXN0RLMjdVJyxcbiAgICAgICAgICAgIHBsYWNlbWVudDogJ3d3d3NoYWRjbi12dWVjb20nLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgc3JjRGlyOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vc3JjJyksXG4gICAgbWFya2Rvd246IHtcbiAgICAgICAgY29kZVRyYW5zZm9ybWVyczogW1xuICAgICAgICAgICAgdHJhbnNmb3JtZXJNZXRhV29yZEhpZ2hsaWdodCgpLFxuICAgICAgICBdLFxuICAgICAgICBjb25maWcobWQpIHtcbiAgICAgICAgICAgIG1kLnVzZShDb21wb25lbnRQcmV2aWV3UGx1Z2luKVxuICAgICAgICAgICAgbWQudXNlKENvZGVXcmFwcGVyUGx1Z2luKVxuICAgICAgICB9LFxuICAgIH0sXG4gICAgcmV3cml0ZXM6IHtcbiAgICAgICAgJ2NvbnRlbnQvKC4qKSc6ICcoLiopJyxcbiAgICB9LFxuICAgIHZpdGU6IHtcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNzAwLFxuICAgICAgICAgICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICAgICAgICAgIG1pbmlmeTogJ2VzYnVpbGQnLCAvLyBcdTYyMTYgZXNidWlsZFxuICAgICAgICAgICAgZXNidWlsZDoge1xuICAgICAgICAgICAgICAgIGRyb3A6IFsnY29uc29sZScsICdkZWJ1Z2dlciddIC8vIFx1NzlGQlx1OTY2NCBjb25zb2xlIFx1NTQ4QyBkZWJ1Z2dlclxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogW1xuICAgICAgICAgICAgICAgICAgICAvLyAndmRpdG9yJyxcbiAgICAgICAgICAgICAgICAgICAgLy8gJ3Z1ZScsXG4gICAgICAgICAgICAgICAgICAgIC8vICdAdnVlL2NvbXBpbGVyLXNmYydcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZGl0b3I6ICdWZGl0b3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdnVlOiAnVnVlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdAdnVlL2NvbXBpbGVyLXNmYyc6ICdWdWVDb21waWxlclNGQydcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGFjdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWFudWFsQ2h1bmtzOiBmdW5jdGlvbiAoaWQsIG1ldGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnY29tcGlsZXItc2ZjJykpIHJldHVybiAgJ3Z1ZS1jb21waWxlci1zZmMnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3NoaWtpanMnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaWQuaW5jbHVkZXMoJ0BzaGlraWpzL2xhbmdzJykpIHJldHVybiAnc2hpa2lqcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXJyID0gaWQuc3BsaXQoJ3NoaWtpanMvbGFuZ3MvZGlzdC8nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gYXJyWzFdLnNwbGl0KCcuJylbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmFtZSAhPT0gJ3R5cGVzY3JpcHQnKSBuYW1lID0gJ2xhbmdzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgc2hpa2lqcy0ke25hbWV9YFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBleHRyYWN0UGFja2FnZU5hbWUocGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhOiBzdHJpbmcgPSBwYXRoLnNwbGl0KCdub2RlX21vZHVsZXMnKVsyXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgPSBhLnJlcGxhY2VBbGwoL1xcLyguKj8pXFwvLiovZywgXCIkMVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgPSBhLnJlcGxhY2UoJ0AnLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGV4dHJhY3RQYWNrYWdlTmFtZShpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnZDMtJykgfHwgW1wiZWxranNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZGJ1c2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsZWFmbGV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFwbGlicmUtZ2xcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdXBlcmNsdXN0ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aHJlZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZ1ZS1kZW1pXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wb2pzb24tY2xpZW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHNsaWJcIl0uaW5jbHVkZXMobmFtZSkpIHJldHVybiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2VydmVyOiB7XG4gICAgICAgICAgICBwb3J0OiA5MDAwLFxuICAgICAgICAvLyAgICAgcHJveHk6IHtcbiAgICAgICAgLy8gICAgICAgICAnL25ldGxpZnknOiBzZXJ2ZXJQcm94eSxcbiAgICAgICAgLy8gICAgICAgICAnL2ltYWdlJzogc2VydmVyUHJveHksXG4gICAgICAgIC8vICAgICAgICAgJy9hdXRoJzogc2VydmVyUHJveHksXG4gICAgICAgIC8vICAgICAgICAgJy9hcGknOiBzZXJ2ZXJQcm94eSxcbiAgICAgICAgLy8gICAgICAgICAnL3N5cyc6IHNlcnZlclByb3h5LFxuICAgICAgICAvLyAgICAgICAgICcvZmlsZSc6IHNlcnZlclByb3h5LFxuICAgICAgICAvLyAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjc3M6IHtcbiAgICAgICAgICAgIHBvc3Rjc3M6IHtcbiAgICAgICAgICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgICAgICAgICAgIHRhaWx3aW5kKCkgYXMgYW55LFxuICAgICAgICAgICAgICAgICAgICBhdXRvcHJlZml4ZXIoKSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgICAgSWNvbnMoe2NvbXBpbGVyOiAndnVlMycsIGF1dG9JbnN0YWxsOiB0cnVlfSkgYXMgYW55LFxuICAgICAgICAgICAgdnVlSnN4KCksXG4gICAgICAgICAgICAvLyB2aXN1YWxpemVyKHtcbiAgICAgICAgICAgIC8vICAgICBvcGVuOiBmYWxzZSwgLy8gXHU2MjUzXHU1MzA1XHU1NDBFXHU4MUVBXHU1MkE4XHU2MjUzXHU1RjAwXHU1MjA2XHU2NzkwXHU1NkZFXG4gICAgICAgICAgICAvLyAgICAgZmlsZW5hbWU6ICd2aXN1YWxpemVyLmh0bWwnLCAvLyBcdTUyMDZcdTY3OTBcdTU2RkVcdTc1MUZcdTYyMTBcdTc2ODRcdTY1ODdcdTRFRjZcdTU0MERcbiAgICAgICAgICAgIC8vICAgICBnemlwU2l6ZTogdHJ1ZSwgLy8gXHU2NjNFXHU3OTNBIGd6aXAgXHU1MzhCXHU3RjI5XHU1OTI3XHU1QzBGXG4gICAgICAgICAgICAvLyAgICAgYnJvdGxpU2l6ZTogdHJ1ZSwgLy8gXHU2NjNFXHU3OTNBIGJyb3RsaSBcdTUzOEJcdTdGMjlcdTU5MjdcdTVDMEZcbiAgICAgICAgICAgIC8vIH0pLFxuICAgICAgICBdLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL3NyYycpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9LFxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcYmxvZzk2OTBcXFxcLnZpdGVwcmVzc1xcXFx0aGVtZVxcXFxjb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGJsb2c5NjkwXFxcXC52aXRlcHJlc3NcXFxcdGhlbWVcXFxcY29uZmlnXFxcXHNpdGUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2Jsb2c5NjkwLy52aXRlcHJlc3MvdGhlbWUvY29uZmlnL3NpdGUudHNcIjtleHBvcnQgY29uc3Qgc2l0ZUNvbmZpZyA9IHtcbiAgbmFtZTogJ1x1NTE5OVx1NEVFM1x1NzgwMVx1MzA4Mlx1NzUyOFx1NTIzOCcsXG4gIHVybDogJ2h0dHBzOi8vOTY5MDUyNTg1LnBhZ2VzLmRldicsXG4gIG9nSW1hZ2U6ICdodHRwczovL3NoYWRjbi12dWUuY29tL29nLnBuZycsXG4gIGRlc2NyaXB0aW9uOiAnXHU3QTBCXHU1RThGXHU1NDU4XHU0RTEzXHU1QzVFXHU3Njg0XHU1QjlFXHU3NTI4XHU1REU1XHU1MTc3XHU0RTBFXHU4RDQ0XHU2RTkwXHU4MDVBXHU1NDA4XHU1RTczXHU1M0YwXHVGRjBDXHU2M0QwXHU0RjlCXHU0RUUzXHU3ODAxXHU1REU1XHU1MTc3XHUzMDAxXHU1RjAwXHU1M0QxXHU2MjgwXHU1REU3XHUzMDAxXHU4RDQ0XHU2RTkwXHU0RjE4XHU2MEUwXHU3QjQ5XHU1QjlFXHU3NTI4XHU1MTg1XHU1QkI5XHVGRjBDXHU1MkE5XHU1MjlCXHU1RjAwXHU1M0QxXHU4MDA1XHU5QUQ4XHU2NTQ4XHU3RjE2XHU3ODAxXHUzMDAxXHU5NjREXHU0RjRFXHU1RjAwXHU1M0QxXHU2MjEwXHU2NzJDXHVGRjBDXHU4QkE5XHU1MTk5XHU0RUUzXHU3ODAxXHU0RTVGXHU4MEZEXHU1MENGXHU3NTI4XHU0RjE4XHU2MEUwXHU1MjM4XHU0RTAwXHU2ODM3XHU3NzAxXHU1RkMzXHU3NzAxXHU1MjlCXHUzMDAyJyxcbiAgbGlua3M6IHtcbiAgICB0d2l0dGVyOiAnaHR0cHM6Ly90d2l0dGVyLmNvbS9odW50YWJ5dGUnLFxuICAgIGdpdGh1YjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9odW50YWJ5dGUvc2hhZGNuLXZ1ZScsXG4gICAgc2hhZFR3aXR0ZXI6ICdodHRwczovL3R3aXR0ZXIuY29tL3NoYWRjbicsXG4gICAgc2hhZEdpdGh1YjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9zaGFkY24vdWknLFxuICB9LFxuICBrZXl3b3JkczogJ1x1NTE5OVx1NEVFM1x1NzgwMVx1MzA4Mlx1NzUyOFx1NTIzOCwgXHU3QTBCXHU1RThGXHU1NDU4XHU1REU1XHU1MTc3LCBcdTVGMDBcdTUzRDFcdThENDRcdTZFOTAsIFx1NEVFM1x1NzgwMVx1NjI4MFx1NURFNywgXHU3RjE2XHU3QTBCXHU0RjE4XHU2MEUwLCBcdTlBRDhcdTY1NDhcdTdGMTZcdTc4MDEsIFx1NUYwMFx1NTNEMVx1ODAwNVx1NURFNVx1NTE3NywgXHU3RjE2XHU3QTBCXHU4RDQ0XHU2RTkwXHU4MDVBXHU1NDA4Jyxcbn1cblxuZXhwb3J0IGNvbnN0IGFubm91bmNlbWVudENvbmZpZyA9IHtcbiAgaWNvbjogJ1x1MjcyOCcsXG4gIHRpdGxlOiAnRXh0ZW5kZWQ6IEF1dG8gRm9ybSwgQ2hhcnRzJyxcbiAgbGluazogJy9kb2NzL2NvbXBvbmVudHMvYXV0by1mb3JtLmh0bWwnLFxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxibG9nOTY5MFxcXFwudml0ZXByZXNzXFxcXHRoZW1lXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGJsb2c5NjkwXFxcXC52aXRlcHJlc3NcXFxcdGhlbWVcXFxccGx1Z2luc1xcXFxjb2Rld3JhcHBlci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovYmxvZzk2OTAvLnZpdGVwcmVzcy90aGVtZS9wbHVnaW5zL2NvZGV3cmFwcGVyLnRzXCI7aW1wb3J0IHR5cGUgeyBNYXJrZG93blJlbmRlcmVyIH0gZnJvbSAndml0ZXByZXNzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAobWQ6IE1hcmtkb3duUmVuZGVyZXIpIHtcbiAgY29uc3QgZGVmYXVsdEZlbmNlUmVuZGVyZXIgPSBtZC5yZW5kZXJlci5ydWxlcy5mZW5jZVxuICBpZiAoIWRlZmF1bHRGZW5jZVJlbmRlcmVyKVxuICAgIHJldHVyblxuXG4gIG1kLnJlbmRlcmVyLnJ1bGVzLmZlbmNlID0gZnVuY3Rpb24gKHRva2VucywgaWR4LCBvcHRpb25zLCBlbnYsIHNlbGYpIHtcbiAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgY29kZSBibG9ja1xuICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2lkeF1cbiAgICBjb25zdCBpc0FsbG93ZWRFeHRlbnNpb24gPSAodG9rZW4uaW5mby5pbmNsdWRlcygndnVlJykgfHwgdG9rZW4uaW5mby5pbmNsdWRlcygnYXN0cm8nKSB8fCB0b2tlbi5pbmZvLmluY2x1ZGVzKCd0cycpKVxuICAgIGlmICh0b2tlbiAmJiB0b2tlbi50YWcgPT09ICdjb2RlJyAmJiBpc0FsbG93ZWRFeHRlbnNpb24pIHtcbiAgICAgIC8vIFdyYXAgdGhlIGNvZGUgYmxvY2sgaW4gQ29kZVdyYXBwZXJcbiAgICAgIHJldHVybiBgPENvZGVXcmFwcGVyPiR7ZGVmYXVsdEZlbmNlUmVuZGVyZXIodG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiwgc2VsZil9PC9Db2RlV3JhcHBlcj5gXG4gICAgfVxuXG4gICAgLy8gSWYgbm90IGEgY29kZSBibG9jaywgcmV0dXJuIHRoZSBkZWZhdWx0IHJlbmRlcmluZ1xuICAgIHJldHVybiBkZWZhdWx0RmVuY2VSZW5kZXJlcih0b2tlbnMsIGlkeCwgb3B0aW9ucywgZW52LCBzZWxmKVxuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXGJsb2c5NjkwXFxcXC52aXRlcHJlc3NcXFxcdGhlbWVcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcYmxvZzk2OTBcXFxcLnZpdGVwcmVzc1xcXFx0aGVtZVxcXFxwbHVnaW5zXFxcXHV0aWxzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9ibG9nOTY5MC8udml0ZXByZXNzL3RoZW1lL3BsdWdpbnMvdXRpbHMudHNcIjsvLyBDcmVkaXQgdG8gQGhhaXJ5ZiBodHRwczovL2dpdGh1Yi5jb20vaGFpcnlmL21hcmtkb3duLWl0LXZpdGVwcmVzcy1kZW1vXG5cbmltcG9ydCB0eXBlIHsgQXR0cmlidXRlTm9kZSwgRWxlbWVudE5vZGUgfSBmcm9tICdAdnVlL2NvbXBpbGVyLWNvcmUnXG5pbXBvcnQgeyBiYXNlUGFyc2UgfSBmcm9tICdAdnVlL2NvbXBpbGVyLWNvcmUnXG5cbmV4cG9ydCBpbnRlcmZhY2UgR2VuZXJhdGVPcHRpb25zIHtcbiAgYXR0cnM/OiBzdHJpbmdcbiAgcHJvcHM6IFJlY29yZDxzdHJpbmcsIGFueT5cbiAgcGF0aDogc3RyaW5nXG4gIGNvZGU6IHN0cmluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNVbmRlZmluZWQodjogYW55KTogdiBpcyB1bmRlZmluZWQge1xuICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IG51bGxcbn1cblxuZnVuY3Rpb24gZ2V0UHJvcHNNYXAoYXR0cnM6IGFueVtdKSB7XG4gIGNvbnN0IG1hcDogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9XG4gIGZvciAoY29uc3QgeyBuYW1lLCB2YWx1ZSwgZXhwLCBhcmcgfSBvZiBhdHRycykge1xuICAgIGlmIChuYW1lID09PSAnYmluZCcpIHtcbiAgICAgIGlmICghaXNVbmRlZmluZWQoYXJnPy5jb250ZW50KSlcbiAgICAgICAgbWFwW2FyZy5jb250ZW50XSA9IEpTT04ucGFyc2UoZXhwLmNvbnRlbnQpXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZiAoaXNVbmRlZmluZWQodmFsdWU/LmNvbnRlbnQpIHx8IHZhbHVlPy5jb250ZW50ID09PSAnJylcbiAgICAgIG1hcFtuYW1lXSA9IHRydWVcbiAgICBlbHNlIGlmIChbJ3RydWUnLCAnZmFsc2UnXS5pbmNsdWRlcyh2YWx1ZT8uY29udGVudCB8fCAnJykpXG4gICAgICBtYXBbbmFtZV0gPSB2YWx1ZT8uY29udGVudCA9PT0gJ3RydWUnXG4gICAgZWxzZVxuICAgICAgbWFwW25hbWVdID0gdmFsdWU/LmNvbnRlbnRcbiAgfVxuICByZXR1cm4gbWFwXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVByb3BzKGNvbnRlbnQ6IHN0cmluZykge1xuICBjb25zdCBhc3QgPSBiYXNlUGFyc2UoY29udGVudClcbiAgY29uc3QgZGVtb0VsZW1lbnQgPSBhc3QuY2hpbGRyZW5bMF0gYXMgRWxlbWVudE5vZGVcblxuICByZXR1cm4gZ2V0UHJvcHNNYXAoZGVtb0VsZW1lbnQucHJvcHMgYXMgQXR0cmlidXRlTm9kZVtdKVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxibG9nOTY5MFxcXFwudml0ZXByZXNzXFxcXHRoZW1lXFxcXHBsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGJsb2c5NjkwXFxcXC52aXRlcHJlc3NcXFxcdGhlbWVcXFxccGx1Z2luc1xcXFxwcmV2aWV3ZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2Jsb2c5NjkwLy52aXRlcHJlc3MvdGhlbWUvcGx1Z2lucy9wcmV2aWV3ZXIudHNcIjtpbXBvcnQgdHlwZSB7IE1hcmtkb3duUmVuZGVyZXIgfSBmcm9tICd2aXRlcHJlc3MnXG5pbXBvcnQgeyBwYXJzZVByb3BzIH0gZnJvbSAnLi91dGlscydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG1kOiBNYXJrZG93blJlbmRlcmVyKSB7XG4gIGZ1bmN0aW9uIGFkZFJlbmRlclJ1bGUodHlwZTogc3RyaW5nKSB7XG4gICAgY29uc3QgZGVmYXVsdFJlbmRlciA9IG1kLnJlbmRlcmVyLnJ1bGVzW3R5cGVdXG4gICAgbWQucmVuZGVyZXIucnVsZXNbdHlwZV0gPSAodG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiwgc2VsZikgPT4ge1xuICAgICAgY29uc3QgdG9rZW4gPSB0b2tlbnNbaWR4XVxuICAgICAgY29uc3QgY29udGVudCA9IHRva2VuLmNvbnRlbnQudHJpbSgpXG4gICAgICBpZiAoIWNvbnRlbnQubWF0Y2goL148Q29tcG9uZW50UHJldmlld1xccy8pIHx8ICFjb250ZW50LmVuZHNXaXRoKCcvPicpKVxuICAgICAgICByZXR1cm4gZGVmYXVsdFJlbmRlciEodG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiwgc2VsZilcblxuICAgICAgY29uc3QgcHJvcHMgPSBwYXJzZVByb3BzKGNvbnRlbnQpXG4gICAgICBjb25zdCB7IGF0dHJzIH0gPSBwcm9wc1xuICAgICAgY29uc3QgZGVtb1NjcmlwdHMgPSBgPENvbXBvbmVudFByZXZpZXcgJHthdHRycyA/PyAnJ30gdi1iaW5kPScke0pTT04uc3RyaW5naWZ5KHByb3BzKX0nPjwvQ29tcG9uZW50UHJldmlldz5gLnRyaW0oKVxuICAgICAgcmV0dXJuIGRlbW9TY3JpcHRzXG4gICAgfVxuICB9XG4gIGFkZFJlbmRlclJ1bGUoJ2h0bWxfYmxvY2snKVxuICBhZGRSZW5kZXJSdWxlKCdodG1sX2lubGluZScpXG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtQLE9BQU8sVUFBVTtBQUNuUSxTQUFRLG9DQUFtQztBQUMzQyxPQUFPLGtCQUFrQjtBQUN6QixPQUFPLGNBQWM7QUFDckIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sWUFBWTtBQUVuQixTQUFRLG9CQUFtQjs7O0FDUG1RLElBQU0sYUFBYTtBQUFBLEVBQy9TLE1BQU07QUFBQSxFQUNOLEtBQUs7QUFBQSxFQUNMLFNBQVM7QUFBQSxFQUNULGFBQWE7QUFBQSxFQUNiLE9BQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxVQUFVO0FBQ1o7OztBQ1ZlLFNBQVIsb0JBQWtCLElBQXNCO0FBQzdDLFFBQU0sdUJBQXVCLEdBQUcsU0FBUyxNQUFNO0FBQy9DLE1BQUksQ0FBQztBQUNIO0FBRUYsS0FBRyxTQUFTLE1BQU0sUUFBUSxTQUFVLFFBQVEsS0FBSyxTQUFTLEtBQUssTUFBTTtBQUVuRSxVQUFNLFFBQVEsT0FBTyxHQUFHO0FBQ3hCLFVBQU0scUJBQXNCLE1BQU0sS0FBSyxTQUFTLEtBQUssS0FBSyxNQUFNLEtBQUssU0FBUyxPQUFPLEtBQUssTUFBTSxLQUFLLFNBQVMsSUFBSTtBQUNsSCxRQUFJLFNBQVMsTUFBTSxRQUFRLFVBQVUsb0JBQW9CO0FBRXZELGFBQU8sZ0JBQWdCLHFCQUFxQixRQUFRLEtBQUssU0FBUyxLQUFLLElBQUksQ0FBQztBQUFBLElBQzlFO0FBR0EsV0FBTyxxQkFBcUIsUUFBUSxL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
