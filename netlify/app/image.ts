import {Context, Hono} from 'hono';
import {R} from '../common';

const app = new Hono();

app.get('/:idx', async (c: Context) => {
    const {idx} = c.req.param();
    const {images = []} = await fetch(`https://cn.bing.com/HPImageArchive.aspx?format=js&idx=${idx}&n=1&mkt=zh-CN`)
        .then(res => res.json())
    const [image] = images
    return c.json(R.okData(image));
});

export default app;
