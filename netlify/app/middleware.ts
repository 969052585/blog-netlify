import {type Context, Hono} from "hono";
import {bearerAuth} from "hono/bearer-auth";

async function verifyToken(_: string, c: Context) {
    const header = c.req.header();
    if (!header) return false
    // let user = header["x-user"]
    let exp = header["x-exp"]
    if (exp.length === 10) exp+="000";
    c.res.headers.append("EXP-TIME", String(exp))
    return Number(exp) > new Date().getTime();
}

export function useBearerAuth(app: Hono<any>) {
    app.use(
        '*',
        bearerAuth({verifyToken})
    );
}
