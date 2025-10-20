import {isObjectLike, map, max, omit, size} from 'lodash-es';
import {count, sql} from 'drizzle-orm';
import * as conditions from 'drizzle-orm/sql/expressions/conditions';
import {asc, desc} from 'drizzle-orm/sql/expressions/select';
import {BusinessError} from './error.js';
import DB from '../db/index.js';
import {CommonColumn} from '../db/schema/common.js';
import * as console from 'console';

const now = sql`now() AT TIME ZONE 'Asia/Shanghai'`;

/**
 * 解析查询键，提取字段名和操作符
 * @param {string} key - 查询键
 * @returns {[string, Function]} - 字段名和操作符
 */
function parseQueryKey(key) {
    const match = key.match(/(.+?)(\.\w+)/);
    let field = key;
    let op = conditions.eq;
    if (match) {
        field = match[1];
        op = '.in' === match[2] ? conditions.inArray : conditions[match[2].slice(1)];
    }
    return [field, op];
}

/**
 * 构建查询语句
 * @param {Object} options - 查询选项
 * @param {Object} options.model - 数据模型
 * @param {Array|Object} options.fields - 要查询的字段
 * @param {Object} options.query - 查询条件
 * @param {Array} options.orderBy - 排序字段
 * @param {number} options.limit - 限制数量
 * @returns {Object} - 查询对象
 */
function buildQuery({
    model,
    fields = [],
    query = {},
    orderBy = [],
    limit = null,
}) {
    const db = DB.getInstance();
    if (!db) throw Error('db为空');
    if (!model) throw Error('model为空');
    // select fields from model
    let sqlQuery = db.select().from(model);
    if (isObjectLike(fields) && !Array.isArray(fields)) {
        sqlQuery = db.select(fields).from(model);
    } else if (Array.isArray(fields) && fields.length) {
        sqlQuery = db.select(fields.reduce((result, field) => ({
            ...result,
            [field]: model[field]
        }), {})).from(model);
    }
    // where
    let where = [];
    for (let key in query) {
        const [field, operator] = parseQueryKey(key);
        where.push(operator(model[field], query[key]));
    }
    sqlQuery.where(() => conditions.and(...where));
    // order
    let orders = [];
    for (let order of (orderBy || [])) {
        let field = order.replace('-', '');
        if (order.startsWith('-')) orders.push(desc(model[field]));
        else orders.push(asc(model[field]));
    }
    sqlQuery.orderBy(() => orders);
    if (limit) sqlQuery.limit(limit);
    return sqlQuery;
}

/**
 * 数据库ORM操作类
 */
export class Orm {
    /**
     * 查询单个记录
     * @param {Object} model - 数据模型
     * @param {number|string|Object} query - 查询条件或ID
     * @returns {Function} - 处理查询结果的函数
     */
    static queryOne(model, query) {
        return async function (ctx) {
            if (!isObjectLike(query)) query = {Id: query};
            let sqlQuery = buildQuery({query, model}).limit(1);
            let data = await sqlQuery.execute()
                .then(([data]) => data)
                .catch((e) => {
                    ctx.error = e.message;
                    ctx.stack = e.stack;
                });
            if (!data)
                throw new BusinessError('查询数据不存在');
            ctx.data = data;
        };
    }

    /**
     * 查询列表
     * @param {Object} model - 数据模型
     * @param {Object} query - 查询条件
     * @param {Object} options - 额外选项
     * @returns {Function} - 处理查询结果的函数
     */
    static queryList(model, query = {}, options = {}) {
        return async function (ctx) {
            const {fields, orderBy, limit} = options;
            let sqlQuery = buildQuery({limit, model, query, fields, orderBy});
            let list = await sqlQuery.execute()
                .catch((e) => {
                    ctx.error = e.message;
                    ctx.stack = e.stack;
                });

            ctx.list = list;
        };
    }

    /**
     * 分页查询
     * @param {Object} model - 数据模型
     * @param {Object} query - 查询条件
     * @param {Object} page - 分页参数
     * @param {Object} options - 额外选项
     * @returns {Function} - 处理查询结果的函数
     */
    static queryPage(model, query, page = {
        current: 1,
        size: 15
    }, options = {}) {
        return async function (ctx) {
            let rows = 0;

            let countSql = buildQuery({model, fields: {count: count()}, query});
            let [result] = await countSql.execute()
                .catch((e) => {
                    ctx.error = e.message;
                    ctx.stack = e.stack;
                });
            if (!result) return;
            rows = result.count;
            const limit = page.size;
            const offset = page.size * (page.current - 1);

            const {fields, orderBy} = options;
            let sqlQuery = buildQuery({model, fields, query, orderBy}).limit(limit).offset(offset);
            // console.log('page sql is ', sqlQuery.toSQL());
            const list = await sqlQuery.execute()
                .catch((e) => {
                    ctx.error = e.message;
                    ctx.stack = e.stack;
                });
            if (!list) return;

            page.isFirst = page.current === 1;
            page.total = rows;

            let totalPage = Number((page.total / page.size).toFixed(0));
            if (page.total % page.size !== 0) totalPage += 1;
            page.totalPage = totalPage;

            page.isFirst = page.current === 1;
            page.isLast = page.current === page.totalPage;

            page.hasNext = page.current !== page.totalPage;
            page.hasPre = page.current !== 1;

            ctx.list = list;
            ctx.page = page;
            ctx.data = {page, list};
        };
    }

    /**
     * 插入数据
     * @param {Object} model - 数据模型
     * @param {Object|Array} data - 要插入的数据
     * @returns {Function} - 处理插入结果的函数
     */
    static insert(model, data) {
        return async function (ctx) {
            const db = DB.getInstance();
            if (!Array.isArray(data)) data = [data];
            if (model[CommonColumn.CreatedAt]) {
                data.forEach(item => item[CommonColumn.CreatedAt] = now);
            }
            let sqlQuery = db.insert(model).values(data).returning();
            console.log('insert sql: ', sqlQuery.toSQL());
            const pg = await sqlQuery.execute();
            let result = {};
            if (Array.isArray(pg)) {
                result.Id = max(map(pg, "Id"));
                result.Count = size(pg);
            }
            result.data = pg;
            ctx.data = result;
        };
    }

    /**
     * 更新数据
     * @param {Object} model - 数据模型
     * @param {Object} data - 要更新的数据
     * @returns {Function} - 处理更新结果的函数
     */
    static update(model, data) {
        return async function (ctx) {
            const db = DB.getInstance();
            if (model[CommonColumn.UpdatedAt]) {
                [data].forEach(item => item[CommonColumn.UpdatedAt] = now);
            }
            let sqlQuery = db.update(model)
                .set(omit(data, CommonColumn.Id))
                .where(conditions.eq(model[CommonColumn.Id], data[CommonColumn.Id]));
            console.log('update sql: ', sqlQuery.toSQL());
            const pg = await sqlQuery.execute();
            let result = {};
            result.Count = pg;
            ctx.data = result;
        };
    }

    /**
     * 删除数据
     * @param {Object} model - 数据模型
     * @param {Array|number|string} data - 要删除的ID或ID数组
     * @returns {Function} - 处理删除结果的函数
     */
    static delete(model, data) {
        return async function (ctx) {
            if (!Array.isArray(data)) data = [data];
            const db = DB.getInstance();
            let sqlQuery = db.delete(model).where(conditions.inArray(model[CommonColumn.Id], data));
            console.log('delete sql: ', sqlQuery.toSQL());
            const pg = await sqlQuery.execute();
            let result = {};
            result.Count = pg;
            ctx.data = result;
        };
    }
}