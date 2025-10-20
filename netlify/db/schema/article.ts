import {integer, pgTable, serial, text, timestamp, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import type {Columns} from './common';
import {CommonColumn} from './common';


const ArticleTableName = 'article'
const ArticleColumns: Columns = {
    [CommonColumn.Id]: serial('id').primaryKey(),
    Year: integer().notNull()
        .default(sql`EXTRACT(YEAR FROM CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai')`),
    Month: integer().notNull()
        .default(sql`EXTRACT(MONTH FROM CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai')`),
    Title: varchar('title', {length: 255}).notNull(),
    Content: text(),
    Cover: varchar('cover', {length: 255}),
    ModuleCode: varchar('module_code', {length: 50}),
    CategoryCode: varchar('category_code', {length: 50}),
    Hot: varchar('is_hot', {length: 1}).default('N'),
    Public: varchar('is_public', {length: 1}).default('Y'),
    [CommonColumn.CreatedAt]: timestamp('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    [CommonColumn.UpdatedAt]: timestamp('updated_at')
        .default(sql`CURRENT_TIMESTAMP`)
}

const Article = pgTable(ArticleTableName, ArticleColumns);

export {
    ArticleTableName,
    ArticleColumns
}

export default Article;
