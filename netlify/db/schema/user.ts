import {pgTable, serial, integer, text, timestamp, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import type {Columns} from './common';
import {CommonColumn} from './common';


const UserTableName = 'users'
const UserColumns: Columns = {
    [CommonColumn.Id]: serial('id').primaryKey(),
    Name: varchar('name', {length: 100}),
    Email: varchar('email', {length: 255}),
    Password: varchar('password', {length: 255}),
    Department: varchar('department', {length: 100}),
    EmployeeType: varchar('employee_type', {length: 50}),
    ProbationStart: timestamp('probation_start'),
    ProbationEnd: timestamp('probation_end'),
    ProbationDuration: varchar('probation_duration', {length: 50}),
    ProtocolStart: timestamp('protocol_start'),
    ProtocolEnd: timestamp('protocol_end'),
    Address: text(),
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
