import {pgTable, serial, text, timestamp, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import {CommonColumn} from './common.js';

const TableTableName = 'tables';
const TableColumns = {
  [CommonColumn.Id]: serial('id').primaryKey(),
  Code: varchar('code', { length: 50 }),
  Name: varchar('name', { length: 100 }),
  Description: text(),
  [CommonColumn.CreatedAt]: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  // [CommonColumn.UpdatedAt]: timestamp('updated_at')
  // .default(sql`CURRENT_TIMESTAMP`)
};

const Table = pgTable(TableTableName, TableColumns);

export {
  TableTableName,
  TableColumns
};

export default Table;