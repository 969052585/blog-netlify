import * as components from './components'
import DocsLayout from './layout/DocsLayout.vue'
import ExamplesLayout from './layout/ExamplesLayout.vue'
import ArticleLayout from './layout/ArticleLayout.vue'
// https://vitepress.dev/guide/custom-theme
import Layout from './layout/MainLayout.vue'
import './style.css'
import './styles/vp-doc.css'
import './styles/shiki.css'
import './styles/themes.css'

if (typeof window !== 'undefined') {
  import('@micro-zoe/micro-app').then(module => {
    module.default.start({
      plugins: {
        modules: {
          'appname-vue3': [
            {
              loader(code,url) {
                if (process.env.NODE_ENV === 'development') {
                  console.log(code,"8888")
                  // 这里 /basename/ 需要和子应用vite.config.js中base的配置保持一致
                  code = code.replace(/(from|import)(\s*['"])(\/child\/vite\/)/g, all => {
                    return all.replace('/child/vite/', 'http://localhost:4007/child/vite/')
                  })
                }

                return code
              }
            }
          ],
        }
      }
    });
    // @ts-ignore
    window["eventCenterForAppNameVite"] = new module.EventCenterForMicroApp("appname-vue3")
  });
}
export default {
  Layout,
  enhanceApp({ app }) {
    // ...
    app.component('docs', DocsLayout)
    app.component('examples', ExamplesLayout)
    app.component('ArticleLayout', ArticleLayout)

    for (const component of Object.keys(components))
      app.component(component, components[component])
  },
}
