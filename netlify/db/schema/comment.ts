import {pgTable, serial, integer, text, timestamp, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import type {Columns} from './common';
import {CommonColumn} from './common';
import Article from "./article";

const CommentTableName = 'comment'
const CommentColumns: Columns = {
    [CommonColumn.Id]: serial('id').primaryKey(),
    ArticleId: integer('article_id')
        .notNull()
        .references(() => Article[CommonColumn.Id], {
            onDelete: 'cascade', // 文章删除时，关联的评论也删除
            onUpdate: 'cascade'  // 文章ID更新时，评论的article_id同步更新
        }),
    Commenter: varchar('commenter', {length: 100}).notNull(),
    Content: text('content').notNull(),
    AuditStatus: varchar('audit_status', {length: 1}).default('N'),
    // 可选：点赞数
    LikeCount: integer('like_count').default(0),

    // 可选：回复父ID（用于评论回复功能，null表示根评论）
    ParentId: integer('parent_id').references(() => Comment[CommonColumn.Id], {
        onDelete: 'cascade' // 父评论删除时，子回复也删除
    }),
    [CommonColumn.CreatedAt]: timestamp('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    // [CommonColumn.UpdatedAt]: timestamp('updated_at')
    // .default(sql`CURRENT_TIMESTAMP`)
}

const Comment = pgTable(CommentTableName, CommentColumns);

export {
    CommentTableName,
    CommentColumns
}

export default Comment;
