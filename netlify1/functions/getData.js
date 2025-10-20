// netlify/functions/getData.js

// 导入自定义工具函数
import { generateComplexRandomString } from '../../utils/random.js';

// 使用 ES 模块的导出语法
export const handler = async (event, context) => {
  // 生成当前时间
  const now = new Date();
  const time = now.toISOString();

  // 使用自定义工具函数生成随机串
  const randomString = generateComplexRandomString(20);

  // 构建响应
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify({
      time: time,
      randomString: randomString,
      message: '使用了自定义依赖生成的随机串'
    })
  };
};