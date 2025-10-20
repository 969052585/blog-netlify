import {drawer as raw} from './drawer'

export function drawer(url: string, title = '') {
    raw({
        title,
        direction: "right",
        content: <iframe  class="max-h-full h-full min-w-[70vw] w-fit" src={url}/>
    })
}