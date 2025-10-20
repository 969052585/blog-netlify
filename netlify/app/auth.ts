import crypto from 'crypto';
import {Context, Hono} from 'hono';
import {Orm} from '../common/orm';
import {User} from '../db/schema';
import {isString, isObject} from 'lodash-es'
import {R} from '../common';

import type {OrmResult} from '../types'

import {sign} from 'hono/jwt';
import {UserVerifyTimeMap} from "./constant";

const app = new Hono();


class AuthDto {
    email: string;
    password: string;
}

export const encrypt = (value: string, salt: string) =>
    crypto.pbkdf2Sync(value, salt, 1000, 18, 'sha256').toString('hex');

app.post('/login', async (c: Context & { env: Env }) => {
    let {email, password = ''} = await c.req.json() as AuthDto;
    password = password.trim();
    const result = {};
    await Orm.queryOne(User, {Email: email})(c.env.DB, result);
    const {data: userInfo, stack, meta, error} = result as OrmResult;
    if (!userInfo) return c.json(R.fail(error, stack || meta));
    if (encrypt(password, userInfo.Salt) !== userInfo.Password) return c.json(R.failMsg('用户名或密码不正确'));
    let exp = 3600
    if (isString(c.env.JWT_CONFIG)) {
        exp = JSON.parse(c.env.JWT_CONFIG).exp
    } else if (isObject(c.env.JWT_CONFIG)) {
        exp = c.env.JWT_CONFIG.exp
    }
    const expiration = Math.floor(new Date().getTime() / 1000) + exp
    const token = await sign({
        email,
        exp: expiration
    }, c.env.JWT_SECRET);
    await c.env.TOKEN.put(email, token, {expiration});
    const time = new Date().getTime();
    UserVerifyTimeMap.getInstance().set(email, time);
    c.res.headers.append("LAST-VERIFY-TIME", String(time))
    c.res.headers.append("EXPIRE-TIME", String(expiration * 1000))
    return c.json(R.okData(token));
});

app.get('/check/:email', async (c: Context) => {
    const {email} = c.req.param()
    const result = {};
    await Orm.exist(User, {Email: email})(result);
    const {data: exist, stack, meta, error} = result as OrmResult<boolean>;
    if (exist) return c.json(R.okData())
    return c.json(R.failMsg("用户不存在"));
});


export default app;
