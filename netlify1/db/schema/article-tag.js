import {pgTable, serial, timestamp, varchar} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import {CommonColumn} from './common.js';

const ArticleTagTableName = 'ArticleTag';
const ArticleTagColumns = {
    [CommonColumn.Id]: serial('id').primaryKey(),
    TagCode: varchar('tag_code', {length: 50}).notNull(),
    ArticleId: varchar('article_id', {length: 32}).notNull(),
    [CommonColumn.CreatedAt]: timestamp('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
};

const ArticleTag = pgTable(ArticleTagTableName, ArticleTagColumns);

export {
    ArticleTagTableName,
    ArticleTagColumns
};

export default ArticleTag;