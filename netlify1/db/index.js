import process from 'process';
import {Pool} from '@neondatabase/serverless';
import {drizzle} from 'drizzle-orm/neon-serverless';

import {createSingleInstance, loadEnv} from '../common/index.js';

const DB = createSingleInstance(() => {
    loadEnv();
    //@ts-ignore
    const pool = new Pool({connectionString: process.env.NETLIFY_DATABASE_URL});
    //@ts-ignore
    let db = drizzle({client: pool});
    console.debug('✅ DB SingleInstance created!');
    return db;
});

export default DB;