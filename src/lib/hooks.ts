import {customRef, defineComponent,onMounted, onUnmounted, ref} from "vue";
import type {Slot} from 'vue'
import {isFunction} from "lodash-es";

const useBoolean = (initialValue = false) => {
    const state = customRef((track, trigger) => {
        let value = initialValue;
        return {
            get() {
                track();
                return value;
            },
            set(newValue) {
                value = newValue;
                trigger();
            }
        };
    });

    return {
        value: state,
        toggle: () => {
            state.value = !state.value;
        },
        setTrue: () => {
            state.value = true;
        },
        setFalse: () => {
            state.value = false;
        },
        isTrue: () => {
            return state.value;
        },
        isFalse: () => {
            return !state.value;
        },
    };
};


function useKeyboardEvent<K extends keyof Pick<HTMLElementEventMap, "keydown" | "keypress" | "keyup">>(
    type: K,
    listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any,
    options: Record<string, any> = {}
) {
    let input = document.querySelector('input[data-keyboard-listener]') as HTMLInputElement;
    if (!input) {
        input = document.createElement("input");
        input.setAttribute('data-keyboard-listener', 'true');
        input.setAttribute('tabindex', '1');
        input.style.position = 'fixed'
        input.style.bottom = '5px'
        input.style.left = '5px'
        input.style.zIndex = '1000'
        input.style.outline = '1px solid red'
        document.body.append(input);
    }

    window.removeEventListener(type, listener);
    window.addEventListener(type, listener);
    let listeners = (parseInt(input.getAttribute('data-listeners') || '0') || 0) + 1
    input.setAttribute('data-listeners', String(listeners));
    if (isFunction(options.before)) options.before()
    input.focus()
    return () => {
        input.removeEventListener(type, listener);
        let listeners = (parseInt(input.getAttribute('data-listeners') || '1') || 0) - 1
        input.setAttribute('data-listeners', String(listeners));
        if (input.getAttribute('data-listeners') === '0') {
            input.remove();
        }
    };
}


const TAB_MANAGER_CHANNEL = 'tab-manager-channel';
const TAB_REGISTRY_KEY = 'tab-registry';

// 初始化标签注册表
function initTabRegistry() {
    if (!localStorage.getItem(TAB_REGISTRY_KEY)) {
        localStorage.setItem(TAB_REGISTRY_KEY, JSON.stringify({}));
    }
}

// 获取当前标签页的唯一ID
function getTabId(name = '_blank') {
    // 查找已存在的同名标签页的 tabId
    const registry = JSON.parse(localStorage.getItem(TAB_REGISTRY_KEY) || '{}');
    const existingTab = Object.entries(registry).find(([_, tab]) => tab.name === name);

    if (existingTab) {
        // 如果找到已存在的同名标签页，复用其 tabId
        return existingTab[0];
    }

    // 如果没有找到，生成新的 tabId
    let tabId = sessionStorage.getItem('tabId');
    if (!tabId) {
        tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        sessionStorage.setItem('tabId', tabId);
    }
    return tabId;
}

// 注册标签页
function registerTab(url, name) {
    const tabId = getTabId(name);
    const registry = JSON.parse(localStorage.getItem(TAB_REGISTRY_KEY) || '{}');

    registry[tabId] = {
        url,
        name,
        lastActive: Date.now(),
        isActive: true
    };

    localStorage.setItem(TAB_REGISTRY_KEY, JSON.stringify(registry));
    return tabId;
}

// 注销标签页
function unregisterTab(tabId) {
    const registry = JSON.parse(localStorage.getItem(TAB_REGISTRY_KEY) || '{}');
    if (registry[tabId]) {
        registry[tabId].isActive = false;
        localStorage.setItem(TAB_REGISTRY_KEY, JSON.stringify(registry));
    }
}

// 查找标签页
function findTabByName(name) {
    const registry = JSON.parse(localStorage.getItem(TAB_REGISTRY_KEY) || '{}');
    return Object.values(registry).find(tab => tab.name === name && tab.isActive);
}

/**
 * 标签页管理 Hook
 * @param {string} url - 标签页的URL
 * @param {string} [name="_blank"] - 标签页的名称
 * @returns {{ open: Function, focus: Function, isOpen: Ref<boolean> }}
 */
function useTabManager(url: string, name = '_blank') {
    const tabReference = ref(null);
    const isOpen = ref(false);
    const tabId = getTabId();
    let channel;
    let interval;
    let isRegistered = ref(false); // 跟踪标签页是否已注册

    onMounted(() => {
        initTabRegistry();

        // 监听标签页关闭事件
        window.addEventListener('beforeunload', () => {
            if (isRegistered.value) {
                unregisterTab(tabId);
            }
        });

        // 监听来自其他标签页的消息
        channel = new BroadcastChannel(TAB_MANAGER_CHANNEL);

        channel.onmessage = (event) => {
            const {type, payload, sourceTabId} = event.data;

            // 忽略自己发送的消息
            if (sourceTabId === tabId) return;

            if (type === 'OPEN' && payload.name === name) {
                // 如果收到打开相同名称标签页的消息，且当前标签页匹配
                if (name === '_blank') {
                    // 特殊处理：_blank 总是新标签页
                    return;
                }

                // 只有已注册的标签页才处理URL更新
                if (isRegistered.value) {
                    // 更新当前标签页URL
                    if (payload.url !== url) {
                        window.location.href = payload.url;
                    }

                    // 聚焦当前标签页
                    window.focus();
                }
            } else if (type === 'FOCUS' && payload.name === name) {
                // 如果收到聚焦相同名称标签页的消息
                if (isRegistered.value) {
                    window.focus();
                }
            }
        };

        // 定期检查标签页状态
        interval = setInterval(() => {
            if (tabReference.value) {
                isOpen.value = !tabReference.value.closed;

                // 标签页意外关闭的情况
                if (tabReference.value.closed) {
                    if (isRegistered.value) {
                        unregisterTab(tabId);
                        isRegistered.value = false;
                    }
                    tabReference.value = null;
                }
            } else {
                // 检查本地存储中是否有活跃的同名标签
                const activeTab = findTabByName(name);
                isOpen.value = !!activeTab;
            }
        }, 1000);
    });

    onUnmounted(() => {
        if (isRegistered.value) {
            unregisterTab(tabId);
        }

        // 清理资源
        if (channel) {
            channel.close();
        }

        clearInterval(interval);
    });

    // 打开或聚焦标签页
    const open = (newUrl = url) => {
        // 检查是否已存在同名标签页
        const existingTab = findTabByName(name);
        if (existingTab && existingTab.url === newUrl) {
            // 标签页已存在且URL相同，直接聚焦
            const channel = new BroadcastChannel(TAB_MANAGER_CHANNEL);
            channel.postMessage({
                type: 'FOCUS',
                payload: {name},
                sourceTabId: tabId
            });
            channel.close();
            // 尝试使用 window.open 聚焦
            const win = window.open((tabReference.value ? '' : newUrl), name);
            if (win && !win.closed) {
                win.focus();
                tabReference.value = win;
                isOpen.value = true;

                // 如果这是首次打开，注册标签页
                if (!isRegistered.value) {
                    registerTab(newUrl, name);
                    isRegistered.value = true;
                }
            }
        } else {
            // 标签页不存在或URL不同，打开新的或更新现有标签页
            const channel = new BroadcastChannel(TAB_MANAGER_CHANNEL);
            channel.postMessage({
                type: 'OPEN',
                payload: {name, url: newUrl},
                sourceTabId: tabId
            });
            channel.close();

            // 使用 window.open 打开/更新标签页
            const win = window.open(newUrl, name);
            if (win && !win.closed) {
                tabReference.value = win;
                isOpen.value = true;

                // 注册新标签页
                registerTab(newUrl, name);
                isRegistered.value = true;
            }
        }
    };

    return {open, isOpen};
}


function createTemplateHook() {
    let render: Slot;

    const DefineTemplate = defineComponent((_, {slots}) => {
        render = slots.default!
        return () => null
    });

    const UseTemplate = (props: Record<string, any>) => {
        if (render) return render(props)
    };

    return [DefineTemplate, UseTemplate];
}

export {useBoolean, createTemplateHook, useTabManager, useKeyboardEvent}