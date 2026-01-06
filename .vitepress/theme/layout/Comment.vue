<template>
  <div class="max-w-4xl mx-auto py-8">
    <h3 class="text-xl font-semibold mb-6">全部评论 ({{ comments.length }})</h3>
    <div class="space-y-6">
      <!-- 评论项 -->
      <div v-for="comment in comments" :key="comment.id" class="bg-card p-4 rounded-lg shadow-sm">
        <div class="flex items-start">
          <!-- 用户头像 -->
          <img :src="comment.avatar" alt="用户头像" class="w-10 h-10 rounded-full object-cover mr-3">
          <div class="flex-1">
            <!-- 用户信息与评论内容 -->
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">{{ comment.username }}</h4>
              <span class="text-sm text-muted-foreground">{{ comment.time }}</span>
            </div>
            <p class="text-foreground mb-3">{{ comment.content }}</p>
            <!-- 交互按钮 -->
            <div class="flex items-center space-x-4 text-sm text-muted-foreground">
              <button class="flex items-center hover:text-foreground transition-colors">
                <Reply class="mr-1 h-4 w-4" />
                回复
              </button>
              <button class="flex items-center hover:text-foreground transition-colors">
                <Share2 class="mr-1 h-4 w-4" />
                分享
              </button>
              <button class="flex items-center hover:text-foreground transition-colors">
                <Heart class="mr-1 h-4 w-4" />
                <span class="ml-1">{{ comment.likes }}</span>
              </button>
            </div>
            <!-- 回复列表（若有） -->
            <div v-if="comment.replies && comment.replies.length" class="mt-4 pl-6 border-l-2 border-muted-foreground/10 space-y-3">
              <div v-for="reply in comment.replies" :key="reply.id" class="text-sm">
                <div class="flex items-center mb-1">
                  <span class="font-medium mr-2">{{ reply.replier }}</span>
                  <span class="text-muted-foreground">{{ reply.replyTime }}</span>
                </div>
                <p>{{ reply.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 加载更多 -->
    <div v-if="hasMore" class="mt-6 text-center">
      <button class="btn btn-outline btn-sm">展开更多回复</button>
    </div>
    <div v-else class="mt-6 text-center text-muted-foreground">
      暂时没有更多评论
    </div>
    <!-- 评论输入框（若需要可添加） -->
    <div class="mt-8">
      <h4 class="font-medium mb-3">添加评论</h4>
      <textarea class="w-full p-3 border border-muted-foreground/20 rounded-lg" rows="3" placeholder="分享你的看法..."></textarea>
      <button class="mt-3 btn btn-primary">发布评论</button>
    </div>
  </div>
</template>

<script setup>
import { Reply, Share2, Heart } from 'lucide-vue-next';

const comments = [
  {
    id: 1,
    avatar: 'https://picsum.photos/200/200?random=1',
    username: '奥德蕉拉香彪',
    time: '1小时前 · 北京',
    content: '切片分包呀，根据引用切片，还可以设置优先级。',
    likes: 0,
    replies: []
  },
  {
    id: 2,
    avatar: 'https://picsum.photos/200/200?random=2',
    username: 'cj',
    time: '1天前 · 浙江',
    content: '痛苦，不懂就不懂吧',
    likes: 0,
    replies: []
  },
  {
    id: 3,
    avatar: 'https://picsum.photos/200/200?random=3',
    username: 'lll',
    time: '1天前 · 天津',
    content: '只是啥课，免费吗',
    likes: 1,
    replies: []
  }
];

const hasMore = true;
</script>