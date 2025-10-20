import process from "process";
import {Pool} from '@neondatabase/serverless';
import {drizzle} from 'drizzle-orm/neon-serverless';

import {createSingleInstance, loadEnv} from '../common'

const DB = createSingleInstance(() => {
    loadEnv()
    //@ts-ignore
    const pool = new Pool({connectionString: process.env.NETLIFY_DATABASE_URL});
    //@ts-ignore
    let DB = drizzle({client: pool})
    console.debug("✅ DB SingleInstance created!")
    return DB
});

export default DB