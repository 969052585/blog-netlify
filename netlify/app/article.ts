// @ts-nocheck
import {Hono} from 'hono';
import type {JwtVariables} from 'hono/jwt';
import {Orm} from "../common/orm";
import Article from "../db/schema/article";
import {OrmResult} from "../types";
import {R} from "../common";

type Variables = JwtVariables
const app = new Hono<{ Variables: Variables }>();

app.put("/", async (c) => {
    const data = await c.req.json();
    const result = {};
    await Orm.update(Article, data)(result);
    const {data: updateResult, stack, meta, error} = result as OrmResult;
    return c.json(updateResult ? R.okData(updateResult) : R.fail(error, stack || meta));
})

app.post("/", async (c) => {
    const data = await c.req.json();
    const result = {};
    await Orm.insert(Article, data)(result);
    const {data: insertResult, stack, meta, error} = result as OrmResult;
    return c.json(insertResult ? R.okData(insertResult) : R.fail(error, stack || meta));
})

export default app;
