import {pgTable, text, timestamp, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import type {Columns} from './common';
import {CommonColumn} from './common';


const ArticleDraftTableName = 'ArticleDraft'
const ArticleDraftColumns: Columns = {
    [CommonColumn.Id]: varchar('id', {length: 32}).primaryKey(),
    Title: varchar('title', {length: 255}).notNull(),
    Content: text(),
    Cover: varchar('cover', {length: 255}),
    ModuleCode: varchar('module_code', {length: 50}),
    CategoryCode: varchar('category_code', {length: 50}),
    Hot: varchar('hot', {length: 1}).default('N'),
    Public: varchar('public', {length: 1}).default('Y'),
    [CommonColumn.CreatedAt]: timestamp('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    [CommonColumn.UpdatedAt]: timestamp('updated_at')
        .default(sql`CURRENT_TIMESTAMP`)
}

const ArticleDraft = pgTable(ArticleDraftTableName, ArticleDraftColumns);

export {
    ArticleDraftTableName,
    ArticleDraftColumns
}

export default ArticleDraft;
