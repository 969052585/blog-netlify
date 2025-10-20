import {pgTable, serial, timestamp, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import type {Columns} from './common';
import {CommonColumn} from './common';


const TagTableName = 'tag'
const TagColumns: Columns = {
  [CommonColumn.Id]: serial('id').primaryKey(),
  Name: varchar('name', { length: 100 }),
  Code: varchar('code', { length: 50 }).unique(),
  [CommonColumn.CreatedAt]: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  [CommonColumn.UpdatedAt]: timestamp('updated_at')
      .default(sql`CURRENT_TIMESTAMP`)
}

const Tag = pgTable(TagTableName, TagColumns);

export {
  TagTableName,
  TagColumns
}

export default Tag;
