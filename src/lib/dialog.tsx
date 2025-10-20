import type {VNode, VNodeArrayChildren} from "vue";
import {createApp, defineComponent, h, onMounted, getCurrentInstance, onUnmounted, ref} from "vue";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/lib/registry/default/ui/dialog'
import {Button} from "@/lib/registry/new-york/ui/button";


type RawChildren = string | number | boolean | VNode | VNodeArrayChildren | (() => any);

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
}

export function dialog(props: Props) {
    const el = document.createElement("dialog");
    document.body.prepend(el);
    const App = defineComponent({
        name: "DialogApp",
        setup() {
            const dialog = getCurrentInstance()
            const open = ref(false)
            onUnmounted(() => el.remove())
            onMounted(() => open.value = true);
            const close = () => {
                open.value = false
                dialog && dialog.appContext.app.unmount()
            }

            const handleOkClick = async () => {
                await props.ok!();
                close()
            };
            const handleCancelClick = async () => {
                await props.ok!();
                close()
            };
            // return () => h(Dialog, {
            //     open: open.value,
            //     'onUpdate:open': (value: boolean) => open.value = value
            // }, () => [
            //     h(DialogContent, {
            //         class: props.class,
            //         'onEscapeKeyDown': (event) => !props.outsideClosable && event.preventDefault(),
            //         'onInteractOutside': (event) => !props.outsideClosable && event.preventDefault(),
            //     }, () => [
            //         h(DialogHeader, {}, () => [
            //             h(DialogTitle, {}, () => props.title),
            //             h(DialogDescription, {}, () => props.description),
            //         ]),
            //         props.content,
            //         h(DialogFooter, {}, () => [
            //             props.cancel && h(Button, {variant: "outline",onClick: handleOkClick}, () => props.cancelText || '取消'),
            //             props.ok && h(Button, {onClick: handleOkClick}, () => props.okText || '提交'),
            //         ])
            //     ]),
            // ]);

            return () => (
                <Dialog
                    open={open.value}
                    onUpdate:open={(value: boolean) => open.value = value}
                >
                    <DialogContent
                        class={props.class}
                        onEscapeKeyDown={(event) => !props.outsideClosable && event.preventDefault()}
                        onInteractOutside={(event) => !props.outsideClosable && event.preventDefault()}
                    >
                        <DialogHeader>
                            <DialogTitle>{props.title}</DialogTitle>
                            <DialogDescription>{props.description}</DialogDescription>
                        </DialogHeader>
                        {props.content}
                        <DialogFooter>
                            {props.cancel && (
                                <Button variant="outline" onClick={handleCancelClick}>
                                    {props.cancelText || '取消'}
                                </Button>
                            )}
                            {props.ok && (
                                <Button onClick={handleOkClick}>
                                    {props.okText || '提交'}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            );
        }
    });

    createApp(App).mount(el);
}