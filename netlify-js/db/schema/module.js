import {pgTable, serial, text, timestamp, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import {CommonColumn} from './common.js';

const ModuleTableName = 'module';
const ModuleColumns = {
    [CommonColumn.Id]: serial('id').primaryKey(),
    Name: varchar('name', {length: 100}).notNull(),
    Path: varchar('path', {length: 255}),
    Code: varchar('code', {length: 50}).unique(),
    Description: text(),
    Public: varchar('is_public', {length: 1}).default('Y'), // Y公开 N不公开
    Hot: varchar('is_hot', {length: 1}).default('N'), // Y公开 N不公开
    [CommonColumn.CreatedAt]: timestamp('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    [CommonColumn.UpdatedAt]: timestamp('updated_at')
        .default(sql`CURRENT_TIMESTAMP`)
};

const Module = pgTable(ModuleTableName, ModuleColumns);

export {
    ModuleTableName,
    ModuleColumns
};

export default Module;