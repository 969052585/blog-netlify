// @ts-nocheck
import {Hono} from 'hono';
import type {JwtVariables} from 'hono/jwt';

type Variables = JwtVariables
const app = new Hono<{ Variables: Variables }>();

app.put("/", async (c) => {
    console.log(":ccc",  await c.req.json())
    return c.json({})
})

export default app;
