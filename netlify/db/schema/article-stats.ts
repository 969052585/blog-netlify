import {integer, pgTable, timestamp, uniqueIndex} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import type {Columns} from './common';
import {CommonColumn} from './common';

// 文章操作统计表名
const ArticleStatsTableName = 'ArticleStats';

// 文章操作统计字段定义
const ArticleStatsColumns: Columns = {
    // 主键ID
    [CommonColumn.Id]: integer('id')
        .notNull()
        .primaryKey(),
    // 收藏数（默认0）
    Like: integer('like').notNull().default(0),
    // 分享数（默认0）
    Share: integer('share').notNull().default(0),
    // 评论数（默认0）
    Comment: integer('comment').notNull().default(0),
    // 合集数（默认0）
    Collection: integer('collection').notNull().default(0),
    // 下载量（默认0）
    Download: integer('download').notNull().default(0),
    // 阅读量（可选扩展，按需添加）
    Read: integer('read').notNull().default(0),
    // 创建时间（与原表一致）
    [CommonColumn.CreatedAt]: timestamp('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    // 更新时间（与原表一致）
    [CommonColumn.UpdatedAt]: timestamp('updated_at')
        .default(sql`CURRENT_TIMESTAMP`)
};

// 创建表并添加唯一索引（确保一篇文章只有一条统计记录）
const ArticleStats = pgTable(
    ArticleStatsTableName,
    ArticleStatsColumns,
    (table) => ({
        // 给article_id加唯一索引，避免重复统计
        articleIdUnique: uniqueIndex('idx_article_stats_id').on(table.Id),
        // 可选：添加外键约束，确保article_id在文章表中存在（增强数据完整性）
        // 注意：需要确保PostgreSQL支持外键，且文章表已存在
        // articleIdForeign: foreignKey({
        //     columns: [table.ArticleId],
        //     foreignColumns: [Article[CommonColumn.Id]],
        //     name: 'fk_article_operation_stats_article_id'
        // })
    })
);

export {
    ArticleStatsTableName,
    ArticleStatsColumns
};

export default ArticleStats;