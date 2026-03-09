1. pnpm add -D drizzle-orm drizzle-kit
2. drizzle-kit  generate

dev context
```json
{
  done: [Function: bound ],
  fail: [Function: bound ],
  succeed: [Function: bound ],
  getRemainingTimeInMillis: [Function: bound ],
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'handler',
  functionVersion: '1.0',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:838135647525:function:handler:1.0',
  memoryLimitInMB: '4227',
  awsRequestId: '3e3c69c2-4183-6503-a531-c157dc55edc7',
  logGroupName: 'Group name',
  logStreamName: 'Stream name',
  identity: null,
  clientContext: {
    identity: {
      url: 'https://netlify-dev-locally-emulated-identity.netlify.app/.netlify/identity',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb3VyY2UiOiJuZXRsaWZ5IGRldiIsInRlc3REYXRhIjoiTkVUTElGWV9ERVZfTE9DQUxMWV9FTVVMQVRFRF9JREVOVElUWSJ9
.2eSDqUOZAOBsx39FHFePjYj12k0LrxldvGnlvDu3GMI'
    },
    user: { email: '969052585@qq.com', exp: 1768410508 },
    custom: {
      netlify: 'eyJpZGVudGl0eSI6eyJ1cmwiOiJodHRwczovL25ldGxpZnktZGV2LWxvY2FsbHktZW11bGF0ZWQtaWRlbnRpdHkubmV0bGlmeS5hcHAvLm5ldGxpZnkvaWRlbnRpdHkiLCJ0b2t
lbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUp6YjNWeVkyVWlPaUp1WlhSc2FXWjVJR1JsZGlJc0luUmxjM1JFWVhSaElqb2lUa1ZVVEVsR1dWOUVSVlpmVEU5RFFVeE
1XVjlGVFZWTVFWUkZSRjlKUkVWT1ZFbFVXU0o5LjJlU0RxVU9aQU9Cc3gzOUZIRmVQallqMTJrMExyeGxkdkdubHZEdTNHTUkifSwidXNlciI6eyJlbWFpbCI6Ijk2OTA1MjU4NUBxcS5jb20iLCJle
HAiOjE3Njg0MTA1MDh9fQ=='
    }
  },
  _stopped: false,
  __lambdaLocal: { onInvocationEnd: undefined }
}
```

```sql
-- 重置ID
-- 1. 查看当前表的最大 ID
SELECT MAX(id) FROM "article";

-- 2. 重置自增序列（替换 <max_id> 为上一步查到的最大值，比如 100）
-- 若 id 是 serial 类型
ALTER SEQUENCE article_id_seq RESTART WITH <max_id> + 1;

-- 若 id 是 identity 类型（PostgreSQL 10+）
ALTER TABLE "article" ALTER COLUMN id RESTART WITH <max_id> + 1;
```