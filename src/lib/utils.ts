// @ts-nocheck
import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import mitt from 'mitt'

type Events = {
  CheckedModuleChange: string
  Unauthorized: unknown
}

export const bus = mitt<Events>()
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value
    = typeof updaterOrValue === 'function'
      ? updaterOrValue(ref.value)
      : updaterOrValue
}


const mimeTypes = {
    'txt': 'text/plain',
    'json': 'application/json',
    'csv': 'text/csv',
    'xml': 'application/xml',
    'html': 'text/html',
    'js': 'application/javascript',
    'css': 'text/css',
    'md': 'text/markdown'
};

export function downloadTextAsFile(content: string | any, fileName: string, mimeType?: keyof typeof mimeTypes) {
    // 步骤1：处理参数，确保内容是字符串类型
    const textContent = typeof content === 'string' ? content : String(content);

    // 步骤2：MIME类型映射表（覆盖常见格式）


    // 步骤3：自动推断MIME类型
    if (!mimeType) {
        const ext = fileName.split('.').pop().toLowerCase();
        mimeType = mimeTypes[ext] || 'text/plain'; // 默认纯文本
    }

    try {
        // 步骤4：创建Blob对象（二进制大对象）存储文本
        const blob = new Blob([textContent], { type: mimeType });

        // 步骤5：创建下载链接
        const downloadLink = document.createElement('a');
        // 生成临时URL指向Blob对象
        downloadLink.href = URL.createObjectURL(blob);
        // 设置下载文件名
        downloadLink.download = fileName;

        // 步骤6：触发下载（兼容隐藏元素的点击）
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // 步骤7：清理资源
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href); // 释放Blob URL资源
    } catch (error) {
        console.error('文件下载失败：', error);
        alert('文件下载失败，请稍后重试！');
    }
}

export function hasQuery(key: string) {
    if (import.meta.env.SSR) return ''
    return new URLSearchParams(location.search).has(key)
}

export function getQuery(key: string) {
  if (import.meta.env.SSR) return ''
  return new URLSearchParams(location.search).get(key) || ''
}

export function isElementInViewport({selector, el}: {selector?: string, el?: Element}) {
  if (!el) el = document.querySelector(selector as string) as Element
  if (!el) return false
  const rect = el.getBoundingClientRect();
  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
