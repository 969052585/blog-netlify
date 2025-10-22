import {pgTable, serial, timestamp, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import {CommonColumn} from './common.js';

const CategoryTableName = 'category';
const CategoryColumns = {
  [CommonColumn.Id]: serial('id').primaryKey(),
  Name: varchar('name', { length: 100 }),
  Code: varchar('code', { length: 50 }).unique(),
  ModuleCode: varchar('module_code', { length: 50 }).notNull(),
  [CommonColumn.CreatedAt]: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  [CommonColumn.UpdatedAt]: timestamp('updated_at')
      .default(sql`CURRENT_TIMESTAMP`)
};

const Category = pgTable(CategoryTableName, CategoryColumns);

export {
  CategoryTableName,
  CategoryColumns
};

export default Category;