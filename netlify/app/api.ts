import {Context, Hono} from 'hono';
import {R} from '../common';
import {Orm, PgSelect} from '../common/orm';
import {OrmResult, QueryBody} from '../types';
import type {JwtVariables} from 'hono/jwt';
import {useBearerAuth} from "./middleware";
import * as schema from '../db/schema';
import DB from "../db";
import {count} from "drizzle-orm";

type Variables = JwtVariables
const app = new Hono<{ Variables: Variables }>();

const listHandler = async (c: Context) => {
    const {model, query, ...options} = await c.req.json() as QueryBody;
    const result = {};
    await Orm.queryList(schema[model], query, options)(result);
    const {list, stack, meta, error} = result as OrmResult;
    return c.json(list ? R.okData(list) : R.fail(error, stack || meta));
};

// 查询列表
app.post('/list', listHandler)
app.post('/select', listHandler);

// 根据Id查询
app.get('/:model/:id', async (c: Context) => {
    const {model, id} = c.req.param();
    const result = {};
    await Orm.queryOne(schema[model], id)(result);
    const {data, stack,  error} = result as OrmResult;
    return c.json(data ? R.okData(data) : R.fail(error, stack));
});


// 查询所有
app.get('/:model', async (c: Context) => {
    const {model} = c.req.param();
    const result = {};
    await Orm.queryList(schema[model])(result);
    const {list, stack, meta, error} = result as OrmResult;
    return c.json(list ? R.okData(list) : R.fail(error, stack || meta));
});

// 查询分页
app.post('/page', async (c: Context) => {
    const {model, query, page, ...options} = await c.req.json() as QueryBody;
    const result = {};
    await Orm.queryPage(schema[model], query, page, options)(result);
    const {data, stack, meta, error} = result as OrmResult;
    return c.json(data ? R.okData(data) : R.fail(error, stack || meta));
});


// 分组统计
app.get('/statistics/:model/:field', async (c: Context) => {
    const {model, field} = c.req.param();
    if (!schema[model]) return c.json(R.failMsg("模型不存在"))
    if (!schema[model][field]) return c.json(R.failMsg("字段不存在"))
    const db = DB.getInstance();
    let sql = db.select({
        Name: schema[model][field],
        Count: count(),
    }).from(schema[model]) as PgSelect
    // sql.where(() => and(
    // 	ne(schema[model][field], ''),
    // 	isNotNull(schema[model][field])
    // ))
    sql.groupBy(schema[model][field])
    let d1 = await sql.execute()
    return c.json(R.okData(d1))
});

useBearerAuth(app)

// 新增
app.post('/:model', async (c: Context) => {
    const {model} = c.req.param();
    const data = await c.req.json();
    const result = {};
    await Orm.insert(schema[model], data)(result);
    const {data: insertResult, stack, meta, error} = result as OrmResult;
    return c.json(insertResult ? R.okData(insertResult) : R.fail(error, stack || meta));
})





app.put('/:model', async (c: Context) => {
    const {model} = c.req.param();
    const data = await c.req.json();
    const result = {};
    await Orm.update(schema[model], data)(result);
    const {data: updateResult, stack, meta, error} = result as OrmResult;
    return c.json(updateResult ? R.okData(updateResult) : R.fail(error, stack || meta));
});


// 删除
app.delete('/:model/:id?', async (c) => {
    const {model, id} = c.req.param();
    let ids = [] as Array<string | number>;
    try {
        ids = await c.req.json();
    } catch (e) {}
    if (id) ids.push(id);
    const result = {}
    await Orm.delete(schema[model], ids)(result)
    const {data: deleteResult, stack, meta, error} = result as OrmResult;
    return c.json(deleteResult ? R.okData(deleteResult) : R.fail(error, stack || meta));
});

export default app;
