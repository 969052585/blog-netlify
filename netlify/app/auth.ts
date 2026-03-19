//@ts-nocheck

import crypto from 'crypto';
import {Context, Hono} from 'hono';
import {Orm} from '../common/orm';
import {User} from '../db/schema';
import {isObject, isString} from 'lodash-es'
import {R,System} from '../common';

import type {OrmResult} from '../types'

import {sign} from 'hono/jwt';
import {UserVerifyTimeMap} from "./constant";
import process from "process";


const app = new Hono();

class AuthDto {
    email: string;
    password: string;
}

export const encrypt = (value: string, salt: string) =>
    crypto.pbkdf2Sync(value, salt, 1000, 18, 'sha256').toString('hex');




app.post("/init", async (c: Context) => {
    if (System.getInstance().init) return c.json(R.fail('系统已被初始化'));
    try {
        const checkResult = {};
        await Orm.exist(User, {Admin: true})(checkResult);
        const {data: exist} = checkResult as OrmResult<boolean>;

        if (exist) {
            System.getInstance().init = true
            return c.json(R.failMsg('管理员账号已存在，请直接登录'));
        }
        const {name, email, password} = await c.req.json();

        if (!email || !password || !name) {
            return c.json(R.failMsg('请填写完整信息'));
        }

        const emailCheckResult = {};
        await Orm.exist(User, {Email: email})(emailCheckResult);
        const {data: emailExist} = emailCheckResult as OrmResult<boolean>;

        if (emailExist) {
            return c.json(R.failMsg('该邮箱已被使用'));
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const encryptedPassword = encrypt(password, salt);

        const insertResult = {};
        await Orm.insert(User, {
            Name: name,
            Email: email,
            Password: encryptedPassword,
            Salt: salt,
            Admin: true,
            Status: 1
        })(insertResult);

        const {data, error, stack, meta} = insertResult as OrmResult;

        if (!data) {
            console.error('创建管理员失败:', error, stack, meta);
            return c.json(R.fail(error || '创建失败'));
        }
        System.getInstance().init = true
        return c.json(R.okData({id: data.id, email}));
    } catch (error) {
        console.error('初始化管理员账号异常:', error);
        return c.json(R.failMsg('系统错误，请稍后重试'));
    }
});

app.post('/login', async (c: Context) => {
    let {email, password = ''} = await c.req.json() as AuthDto;
    password = password.trim();
    const result = {};
    await Orm.queryOne(User, {Email: email})(result);
    const {data: userInfo, stack, meta, error} = result as OrmResult;
    if (!userInfo) return c.json(R.fail(error, stack || meta));
    if (encrypt(password, userInfo.Salt) !== userInfo.Password) return c.json(R.failMsg('用户名或密码不正确'));
    let exp = 3600
    if (isString(process.env.JWT_CONFIG)) {
        exp = JSON.parse(process.env.JWT_CONFIG).exp
    } else if (isObject(process.env.JWT_CONFIG)) {
        exp = process.env.JWT_CONFIG.exp
    }
    const expiration = Math.floor(new Date().getTime() / 1000) + exp
    const token = await sign({
        email,
        exp: expiration
    }, process.env.JWT_SECRET);
    // await c.env.TOKEN.put(email, token, {expiration});
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


// 核心函数：从 Header 生成游客 ID
const generateGuestId = (req) => {
    // 1. 提取 Header 核心字段（处理空值，避免 undefined）
    const userAgent = req.header()['user-agent'] || 'unknown_ua';
    const ip = req.header()['x-forwarded-for'] || req.ip || 'unknown_ip';
    const acceptLang = req.header()['accept-language'] || 'unknown_lang';
    const secChUa = req.header()['sec-ch-ua'] || ''; // 可选字段，空值不影响

    console.log("generateGuestId", userAgent, ip, acceptLang, secChUa)

    // 2. 拼接特征字符串（按固定顺序，避免顺序不同导致哈希结果不同）
    const featureStr = `${userAgent}|${ip}|${acceptLang}|${secChUa}`;

    // 3. 哈希处理（SHA256 比 MD5 更安全，结果转 16 进制）
    const hash = crypto.createHash('sha256')
        .update(featureStr, 'utf8')
        .digest('hex')
        .toUpperCase();

    // 4. 生成最终游客 ID（取前16位，加前缀，缩短长度且唯一）
    return `guest_${hash.substring(0, 16)}`;
};

app.get('/session', async (c: Context) => {
    const header = c.req.header();

    console.log("session", generateGuestId(c.req))
    return c.json({});
});


export default app;
