// @ts-nocheck
import {Hono} from 'hono';
import type {JwtVariables} from 'hono/jwt';
import {Orm} from "../common/orm";
import Article from "../db/schema/article";
import {OrmResult} from "../types";
import {R} from "../common";
import {useBearerAuth} from "./middleware";
import {asc, desc} from 'drizzle-orm/sql/expressions/select';
import * as conditions from 'drizzle-orm/sql/expressions/conditions';
import {count} from "drizzle-orm";

type Variables = JwtVariables
const app = new Hono<{ Variables: Variables }>();

// 获取当前用户邮箱
function getCurrentUserEmail(c: any): string | null {
    return c.req.header()["x-user"] || null;
}

// 分页查询文章接口（支持登录状态过滤）
app.post("/page", async (c) => {
    console.log('===== 收到 /a/page 请求 =====');
    const {query: queryBody, page, ...options} = await c.req.json();
    console.log('请求参数:', { queryBody, page, options });
    
    const userEmail = getCurrentUserEmail(c);
    console.log('当前用户邮箱:', userEmail);
    
    const result = {};
    
    if (userEmail) {
        // 已登录：查询公开文章 OR 当前用户的文章
        const db = (await import('../db')).default.getInstance();
        if (!db) throw Error('db 为空');
        
        // 构建分页查询
        const limit = page.size || 15;
        const offset = page.size * (page.current - 1);
        
        // 先查询总数
        let countSql = db.select({count: count()}).from(Article);
        let countWhereConditions: any[] = [];
        
        // 处理查询条件（排除 Public 和 Email）
        for (let key in queryBody) {
            if (key !== 'Public' && key !== 'Email') {
                countWhereConditions.push(conditions.eq(Article[key], queryBody[key]));
            }
        }
        
        // OR 条件：Public='Y' OR Email=userEmail
        const orCondition = conditions.or(
            conditions.eq(Article["Public"], 'Y'),
            conditions.eq(Article["Email"], userEmail)
        );
        
        if (countWhereConditions.length > 0) {
            countSql.where(() => conditions.and(...countWhereConditions, orCondition));
        } else {
            countSql.where(orCondition);
        }
        
        const countResult = await countSql.execute();
        console.log('总数查询结果:', countResult);
        const total = countResult[0]?.count || 0;
        
        // 查询数据
        let dataSql = db.select().from(Article);
        
        if (countWhereConditions.length > 0) {
            dataSql.where(() => conditions.and(...countWhereConditions, orCondition));
        } else {
            dataSql.where(orCondition);
        }
        
        // 处理排序
        if (options.orderBy) {
            const orders = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy];
            const orderConditions: any[] = [];
            for (let order of orders) {
                let field = order.replace('-', '');
                if (order.startsWith('-')) orderConditions.push(desc(Article[field]));
                else orderConditions.push(asc(Article[field]));
            }
            dataSql.orderBy(() => orderConditions);
        }
        
        console.log('数据查询 SQL:', dataSql.toSQL());
        const list = await dataSql.limit(limit).offset(offset).execute();
        console.log('数据查询结果:', list);
        
        // 计算分页信息
        const totalPage = Math.ceil(total / limit);
        const pageInfo = {
            current: page.current,
            size: page.size,
            total,
            totalPage,
            isFirst: page.current === 1,
            isLast: page.current === totalPage,
            hasNext: page.current !== totalPage,
            hasPre: page.current !== 1,
        };
        
        console.log('返回数据:', {list, page: pageInfo});
        return c.json(R.okData({list, page: pageInfo}));
    } else {
        // 未登录：只查询公开文章
        const articleQuery = {...queryBody, Public: 'Y'};
        console.log('未登录，查询公开文章，查询条件:', articleQuery);
        await Orm.queryPage(Article, articleQuery, page, options)(result);
        const {data, stack, meta, error} = result as OrmResult;
        console.log('未登录查询结果:', {data, stack, meta, error});
        return c.json(data ? R.okData(data) : R.fail(error, stack || meta));
    }
})

useBearerAuth(app)

app.put("/", async (c) => {
    const data = await c.req.json();
    const result = {};
    await Orm.update(Article, data)(result);
    const {data: updateResult, stack, meta, error} = result as OrmResult;
    return c.json(updateResult ? R.okData(updateResult) : R.fail(error, stack || meta));
})

app.post("/", async (c) => {
    const data = await c.req.json();
    // 自动设置文章作者邮箱
    const userEmail = getCurrentUserEmail(c);
    if (userEmail && !data.Email) {
        data.Email = userEmail;
    }
    const result = {};
    await Orm.insert(Article, data)(result);
    const {data: insertResult, stack, meta, error} = result as OrmResult;
    return c.json(insertResult ? R.okData(insertResult) : R.fail(error, stack || meta));
})

export default app;
