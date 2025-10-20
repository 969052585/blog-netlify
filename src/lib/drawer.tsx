import type {VNode, VNodeArrayChildren} from "vue";
import {createApp, defineComponent, getCurrentInstance, onMounted, onUnmounted, ref} from "vue";
import {X} from 'lucide-vue-next'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/lib/registry/new-york/ui/drawer'
import {isFunction} from "lodash-es";

type RawChildren = string | number | boolean | VNode | VNodeArrayChildren | (() => any);

function get(value?: RawChildren) {
    if (isFunction(value)) return value()
    return value
}

type  Props = {
    title: RawChildren,
    class?: string,
    outsideClosable?: boolean
    ok?: Function,
    cancel?: Function,
    cancelText?: string,
    okText?: string
    description?: RawChildren,
    content?: RawChildren
    header?: RawChildren
    footer?: RawChildren
    direction?: 'top' | 'bottom' | 'left' | 'right'
}

export function drawer(props: Props) {
    const el = document.createElement("div");
    document.body.prepend(el);
    let close: Function
    const App = defineComponent({
        name: "DrawerApp",
        setup() {
            const drawer = getCurrentInstance()
            const open = ref(false)
            onUnmounted(() => el.remove())
            onMounted(() => open.value = true);
            close = () => {
                open.value = false
                drawer && drawer.appContext.app.unmount()
            }

            const handleOkClick = async () => {
                await props.ok!();
                close()
            };
            const handleCancelClick = async () => {
                await props.ok!();
                close()
            };
            return () => (
                <Drawer
                    direction={props.direction || 'bottom'}
                    open={open.value}
                    fixed={true}
                    dismissible={true}
                    onUpdate:open={(value: boolean) => open.value = value}
                >
                    <DrawerContent>
                        <DrawerHeader class="flex justify-between">
                            <div>
                                <DrawerTitle>{get(props.title)}</DrawerTitle>
                                <DrawerDescription>{get(props.description)}</DrawerDescription>
                            </div>
                            <DrawerClose onClick={close}>
                                <X/>
                            </DrawerClose>
                        </DrawerHeader>
                        <div class='flex-1 min-h-0 min-w-0'>
                            {props.content}
                        </div>
                        <DrawerFooter class={{'p-1': !props.footer}}>
                            {props.footer}
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            );
        }
    });
    createApp(App).mount(el);
    return {close}
}