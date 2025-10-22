import {Hono} from 'hono';
import {R} from '../common/index.js';
import {Orm} from '../common/orm.js';
import {useBearerAuth} from './middleware.js';
import * as schema from '../db/schema/index.js';
import DB from '../db/index.js';
import {count} from 'drizzle-orm';

const app = new Hono();

const listHandler = async (c) => {
    const {model, query, ...options} = await c.req.json();
    const result = {};
    await Orm.queryList(schema[model], query, options)(result);
    const {list, stack, meta, error} = result;
    return c.json(list ? R.okData(list) : R.fail(error, stack || meta));
};

// 查询列表
app.post('/list', listHandler);
app.post('/select', listHandler);

// 根据Id查询
app.get('/:model/:id', async (c) => {
    const {model, id} = c.req.param();
    const result = {};
    await Orm.queryOne(schema[model], id)(result);
    const {data, stack, error} = result;
    return c.json(data ? R.okData(data) : R.fail(error, stack));
});


// 查询所有
app.get('/:model', async (c) => {
    console.log(c.req.url,"0000")
    const {model} = c.req.param();
    const result = {};
    await Orm.queryList(schema[model])(result);
    const {list, stack, meta, error} = result;
    return c.json(list ? R.okData(list) : R.fail(error, stack || meta));
});

// 查询分页
app.post('/page', async (c) => {
    const {model, query, page, ...options} = await c.req.json();
    const result = {};
    await Orm.queryPage(schema[model], query, page, options)(result);
    const {data, stack, meta, error} = result;
    return c.json(data ? R.okData(data) : R.fail(error, stack || meta));
});


// 分组统计
app.get('/statistics/:model/:field', async (c) => {
    const {model, field} = c.req.param();
    if (!schema[model]) return c.json(R.failMsg('模型不存在'));
    if (!schema[model][field]) return c.json(R.failMsg('字段不存在'));
    const db = DB.getInstance();
    let sql = db.select({
        Name: schema[model][field],
        Count: count(),
    }).from(schema[model]);
    // sql.where(() => and(
    // 	ne(schema[model][field], ''),
    // 	isNotNull(schema[model][field])
    // ))
    sql.groupBy(schema[model][field]);
    let d1 = await sql.execute();
    return c.json(R.okData(d1));
});

useBearerAuth(app);

// 新增
app.post('/:model', async (c) => {
    const {model} = c.req.param();
    const data = await c.req.json();
    const result = {};
    await Orm.insert(schema[model], data)(result);
    const {data: insertResult, stack, meta, error} = result;
    return c.json(insertResult ? R.okData(insertResult) : R.fail(error, stack || meta));
});



app.put('/:model', async (c) => {
    const {model} = c.req.param();
    const data = await c.req.json();
    const result = {};
    await Orm.update(schema[model], data)(result);
    const {data: updateResult, stack, meta, error} = result;
    return c.json(updateResult ? R.okData(updateResult) : R.fail(error, stack || meta));
});


// 删除
app.delete('/:model/:id?', async (c) => {
    const {model, id} = c.req.param();
    let ids = [];
    try {
        ids = await c.req.json();
    } catch (e) {}
    if (id) ids.push(id);
    const result = {};
    await Orm.delete(schema[model], ids)(result);
    const {data: deleteResult, stack, meta, error} = result;
    return c.json(deleteResult ? R.okData(deleteResult) : R.fail(error, stack || meta));
});

export default app;