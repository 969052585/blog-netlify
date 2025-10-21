import {Context, Hono} from 'hono';
import type {JwtVariables} from 'hono/jwt';

type Variables = JwtVariables
const app = new Hono<{ Variables: Variables }>();

// app.use(
// 	'*',
// 	bearerAuth({ verifyToken })
// );


// 上传
app.post('/upload', async (c: Context) => {
	const form = await c.req.formData()
	console.log(form,"form")
	let file = form.get("file") as File
	let bufferArray = await file.bytes();
	let buffer = Buffer.from(bufferArray);
	let base64 = `data:${file.type};base64,${buffer.toString('base64')}`
	return c.json({name: file.name, url: base64, type: file.type});
});


export default app;
