import {Context, Hono} from "hono";
import {verify} from 'hono/jwt';
import {bearerAuth} from "hono/bearer-auth";
import {UserVerifyTimeMap} from './constant'

async function verifyToken(token: string, c: Context) {
    let JWT_SECRET = "2222"
    const payload = await verify(token, JWT_SECRET);
    const {email} = payload
    if (!email) return true
    let time = new Date().getTime()
    UserVerifyTimeMap.getInstance().set(email as string, time)
    c.res.headers.append("LAST-VERIFY-TIME", String(time))
    return true;
}

export function useBearerAuth(app: Hono<any>) {
    app.use(
        '*',
        bearerAuth({verifyToken})
    );
}
