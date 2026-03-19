import {pgTable, serial, integer, boolean, timestamp, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import type {Columns} from './common';
import {CommonColumn} from './common';


const UserTableName = 'users'
const UserColumns: Columns = {
    [CommonColumn.Id]: serial('id').primaryKey(),
    Name: varchar('name', {length: 100}),
    Email: varchar('email', {length: 255}),
    Admin: boolean('admin').default(false),
    Password: varchar('password', {length: 255}),
    Status: integer(),
    Salt: varchar('salt', {length: 255}),
    [CommonColumn.CreatedAt]: timestamp('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    [CommonColumn.UpdatedAt]: timestamp('updated_at')
        .default(sql`CURRENT_TIMESTAMP`)
}

const User = pgTable(UserTableName, UserColumns);

export {
    UserTableName,
    UserColumns
}

export default User;
