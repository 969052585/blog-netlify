import {EntityQueryWrapper, ID, Limit, OrmResult, PageReq, PageResp, QueryBody} from '../types';
import {isObjectLike, map, max, omit, size} from 'lodash-es';
import {count, sql, SQL} from 'drizzle-orm';
import * as conditions from 'drizzle-orm/sql/expressions/conditions';
import type {BinaryOperator} from 'drizzle-orm/sql/expressions/conditions';
import {asc, desc} from 'drizzle-orm/sql/expressions/select';
import type {CreatePgSelectFromBuilderMode} from 'drizzle-orm/pg-core/query-builders/select.types';
import {BusinessError} from './error';
import {pgTable} from 'drizzle-orm/pg-core';
import DB from '../db'
import {CommonColumn} from "../db/schema/common";
import * as console from "console";

const now = sql`now() AT TIME ZONE 'Asia/Shanghai'`;
type MapperFun<T> = (ctx: OrmResult<T>) => Promise<void>
type PgTable = ReturnType<typeof pgTable>


type ChangeResult = {
    Count: number
}

type DeleteResult = ChangeResult
type UpdateResult = ChangeResult

type InsertResult<T> = {
    Id: number | string,
    data: T | T[]
} & ChangeResult

export type PgSelect = CreatePgSelectFromBuilderMode<'db', any, any, any>

function parseQueryKey(key: string): [string, BinaryOperator] {
    const match = key.match(/(.+?)(\.\w+)/);
    let field = key;
    let op = conditions.eq;
    if (match) {
        field = match[1] as string;
        op =
            '.in' === match[2] ? conditions.inArray :
                conditions[match[2].slice(1)];
    }
    return [field, op];
}

type QueryOptions = {
    model?: ReturnType<typeof pgTable>,
    fields?: Array<string> | Record<string, any>,
    query?: EntityQueryWrapper,
    limit?: Limit,
    orderBy?: Array<string>
}

function buildQuery({
                        model,
                        fields = [],
                        query = {},
                        orderBy = [],
                        limit = null,
                    }: QueryOptions) {
    const db = DB.getInstance();
    if (!db) throw Error('db为空');
    if (!model) throw Error('model为空');
    // select fields from model
    let sql = db.select().from(model) as PgSelect;
    if (isObjectLike(fields) && !Array.isArray(fields)) {
        sql = db.select(fields!).from(model);
    } else if (Array.isArray(fields) && fields?.length) {
        sql = db.select(fields.reduce<Record<string, any>>((result, field) => ({
            ...result,
            [field]: model[field]
        }), {})).from(model);
    }
    // where
    let where: ReturnType<BinaryOperator>[] = []
    for (let key in query) {
        const [field, operator] = parseQueryKey(key);
        where.push(operator(model[field], query![key]));
    }
    sql.where(() => conditions.and(...where))
    // order
    let orders: SQL[] = []
    for (let order of (orderBy || [])) {
        let field = order.replace('-', '');
        if (order.startsWith('-')) orders.push(desc(model[field]));
        else orders.push(asc(model[field]));
    }
    sql.orderBy(() => orders)
    if (limit) sql.limit(limit)
    return sql;
}


export class Orm {
    public static queryOne<T extends PgTable = PgTable>(model: T, query: ID | EntityQueryWrapper): MapperFun<T> {
        return async function (ctx: OrmResult<T>) {
            if (!isObjectLike(query)) query = {Id: query};
            let sql = buildQuery({query: query as EntityQueryWrapper, model}).limit(1);
            let data: T = await sql.execute().then(([data]) => data).catch((e: Error) => {
                ctx.error = e.message;
                ctx.stack = e.stack;
            });
            if (!data)
                throw new BusinessError('查询数据不存在');
            ctx.data = data;
        };
    }


    public static exist<T extends PgTable = PgTable>(model: T, query: ID | EntityQueryWrapper): MapperFun<T> {
        return async function (ctx: OrmResult<boolean>) {
            if (!isObjectLike(query)) query = {Id: query};
            let countSql = buildQuery({model, fields: {count: count()}, query});
            let [result] = await countSql.execute()
                .catch((e: Error) => {
                    ctx.error = e.message;
                    ctx.stack = e.stack;
                });
            if (!result) return;
            const rows = result.count as number;
            ctx.data = rows > 0;
        };
    }

    public static queryList<T extends PgTable = PgTable>(model: T,
                                                         query: EntityQueryWrapper = {},
                                                         options: Pick<QueryBody, 'fields' | 'orderBy' | 'limit'> = {}): MapperFun<T> {
        return async function (ctx: OrmResult<T>) {
            const {fields, orderBy, limit} = options;
            const db = DB.getInstance();
            let sql = buildQuery({limit, model, query, fields, orderBy});
            let list = await sql.execute()
                .catch((e: Error) => {
                    ctx.error = e.message;
                    ctx.stack = e.stack;
                });

            ctx.list = list as Array<T>;
        };
    }

    public static queryPage<T extends PgTable = PgTable, P extends PageResp>(model: T,
                                                                             query: EntityQueryWrapper,
                                                                             page: Partial<PageResp> & Required<PageReq> = {
                                                                                 current: 1,
                                                                                 size: 15
                                                                             },
                                                                             options: Pick<QueryBody, 'fields' | 'orderBy'> = {}): MapperFun<T> {
        return async function (ctx: OrmResult<T, P>) {
            const db = DB.getInstance();
            let rows: number = 0;

            let countSql = buildQuery({model, fields: {count: count()}, query});
            let [result] = await countSql.execute()
                .catch((e: Error) => {
                    ctx.error = e.message;
                    ctx.stack = e.stack;
                });
            if (!result) return;
            rows = result.count as number;
            const limit = page.size;
            const offset = page.size * (page.current - 1);

            const {fields, orderBy} = options;
            let sql = buildQuery({model, fields, query, orderBy}).limit(limit).offset(offset);
            // console.log('page sql is ', sql.toSQL());
            const list = await sql.execute()
                .catch((e: Error) => {
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

            ctx.list = list as T[];
            ctx.page = page as P;
            ctx.data = {page, list} as Required<Pick<OrmResult<T, P>, 'list' | 'page'>>;
        };
    }

    public static insert<T extends PgTable = PgTable, R extends InsertResult<T> = InsertResult<T>>(model: T, data: Array<T> | T): MapperFun<R> {
        return async function (ctx) {
            const db = DB.getInstance();
            if (!Array.isArray(data)) data = [data];
            if (model[CommonColumn.CreatedAt]) {
                (data as Array<T>).forEach(data => data[CommonColumn.CreatedAt] = now);
            }
            let sql = db.insert(model).values(data).returning();
            console.log('insert sql: ', sql.toSQL());
            const pg = await sql.execute();
            let result = { } as R
            if (Array.isArray(pg)) {
                result.Id = max(map(pg,"Id"))
                result.Count = size(pg)
            }
            result.data = pg
            ctx.data = result;
        };
    }

    public static update<T extends PgTable = PgTable, R extends UpdateResult = UpdateResult>(model: T, data: T): MapperFun<R> {
        return async function (ctx) {
            const db = DB.getInstance();
            if (model[CommonColumn.UpdatedAt]) {
                ([data] as Array<T>).forEach(data => data[CommonColumn.UpdatedAt] = now);
            }
            let sql = db.update(model)
                .set(omit(data, CommonColumn.Id))
                .where(conditions.eq(model[CommonColumn.Id], data[CommonColumn.Id]));
            console.log('update sql: ', sql.toSQL());
            const pg = await sql.execute();
            let result = {} as R;
            result.Count = pg;
            ctx.data = result;
        };
    }

    public static delete<T extends PgTable = PgTable, Id = string | number, R extends DeleteResult = DeleteResult>(model: T, data: Array<Id> | Id): MapperFun<any> {
        return async function (ctx) {
            if (!Array.isArray(data)) data = [data];
            const db = DB.getInstance();
            let sql = db.delete(model).where(conditions.inArray(model[CommonColumn.Id], data));
            console.log('delete sql: ', sql.toSQL());
            const pg = await sql.execute();
            let result = {} as R;
            result.Count = pg;
            ctx.data = result;
        };
    }

}
