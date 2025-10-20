import {PgColumnBuilderBase} from "drizzle-orm/pg-core/columns/common";

type Columns<T extends PgColumnBuilderBase = any> = Record<string, T>

enum CommonColumn {
    CreatedAt = "CreatedAt",
    UpdatedAt = "UpdatedAt",
    Id = "Id",
}

export {
    CommonColumn
}

export type {
    Columns
}