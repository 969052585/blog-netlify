import {integer, pgTable, serial, timestamp, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import type {Columns} from './common';
import {CommonColumn} from './common';

const TouristTableName = 'tourist'
const TouristColumns: Columns = {
    [CommonColumn.Id]: serial('id').primaryKey(),
    // 访问年份（对齐article的Year字段逻辑）
    Year: integer().notNull()
        .default(sql`EXTRACT(YEAR FROM CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai')`),
    // 访问月份（对齐article的Month字段逻辑）
    Month: integer().notNull()
        .default(sql`EXTRACT(MONTH FROM CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Shanghai')`),
    // 访客IP地址
    Ip: varchar('ip', {length: 50}).notNull(),
    // 设备类型（PC/MOBILE/TABLET/OTHER）
    DeviceType: varchar('device_type', {length: 20}).default('OTHER'),
    // 浏览器类型（Chrome/Firefox/Safari等）
    Browser: varchar('browser', {length: 50}),
    // 操作系统（Windows/macOS/Android/iOS等）
    Os: varchar('os', {length: 50}),
    // 访问来源（直接访问/搜索引擎/外链/小程序等）
    Source: varchar('source', {length: 50}).default('DIRECT'),
    // 访问页面路径
    PagePath: varchar('page_path', {length: 255}).notNull(),
    // 停留时长（秒）
    StayTime: integer().default(0),
    // 是否首次访问（Y/N）
    FirstVisit: varchar('is_first_visit', {length: 1}).default('Y'),
    [CommonColumn.CreatedAt]: timestamp('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    [CommonColumn.UpdatedAt]: timestamp('updated_at')
        .default(sql`CURRENT_TIMESTAMP`)
}

const Tourist = pgTable(TouristTableName, TouristColumns);

export {
    TouristTableName,
    TouristColumns
}

export default Tourist;