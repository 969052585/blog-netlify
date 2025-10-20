// utils/random.js

// 导入Node.js的crypto模块
import crypto from 'crypto';

export function generateComplexRandomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let result = '';
  const charsLength = chars.length;

  for (let i = 0; i < length; i++) {
    // 使用密码学安全的随机数生成器
    const randomIndex = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * charsLength);
    result += chars[randomIndex];
  }

  return result;
}