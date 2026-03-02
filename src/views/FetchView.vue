<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">🚀 抓取微博相册</h1>
        <p class="page-subtitle">输入用户UID，一键抓取微博相册内容</p>
      </div>
    </div>

    <div class="card">
      <div class="input-group">
        <div class="input-wrapper">
          <label class="input-label">用户 UID</label>
          <el-input
            v-model="uid"
            placeholder="请输入微博用户UID"
            class="uid-input"
            size="large"
            clearable
            @keyup.enter="handleFetch"
          >
            <template #prefix>
              <span style="font-size: 16px;">👤</span>
            </template>
          </el-input>
        </div>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          @click="handleFetch"
          style="padding: 12px 32px; font-weight: 600;"
        >
          <span v-if="!loading">🎯 开始抓取</span>
          <span v-else>抓取中...</span>
        </el-button>
      </div>

      <el-alert
        v-if="message"
        :title="message"
        :type="messageType"
        show-icon
        :closable="true"
        @close="message = ''"
        style="margin-top: 20px;"
      />

      <div class="tip-box">
        <h4>💡 使用说明</h4>
        <ul>
          <li><strong>获取UID：</strong>打开微博用户主页，URL中的数字即为UID（如：weibo.com/u/<strong>1234567890</strong>）</li>
          <li><strong>抓取时间：</strong>根据相册数量，抓取可能需要几秒到几分钟</li>
          <li><strong>查看结果：</strong>抓取完成后，前往「抓取记录」查看并下载相册</li>
        </ul>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div style="margin-top: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
      <div class="card" style="cursor: pointer; transition: all 0.3s;" @click="$router.push('/records')">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
            📋
          </div>
          <div>
            <h3 style="margin: 0 0 4px 0; font-size: 16px; color: var(--text-primary);">查看抓取记录</h3>
            <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">浏览已抓取的用户相册</p>
          </div>
        </div>
      </div>
      
      <div class="card" style="opacity: 0.7;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
            📊
          </div>
          <div>
            <h3 style="margin: 0 0 4px 0; font-size: 16px; color: var(--text-primary);">批量下载</h3>
            <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">支持打包下载全部图片</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { fetchAlbum } from '../api'
import { ElMessage } from 'element-plus'

const uid = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref('success')

const handleFetch = async () => {
  if (!uid.value.trim()) {
    ElMessage.warning('请输入用户UID')
    return
  }

  loading.value = true
  message.value = ''

  try {
    const res = await fetchAlbum(uid.value.trim())
    if (res.data.code === 200) {
      message.value = '✅ 抓取任务已提交，请稍后在「抓取记录」中查看结果'
      messageType.value = 'success'
      uid.value = ''
    } else {
      message.value = res.data.msg || '抓取失败，请稍后重试'
      messageType.value = 'error'
    }
  } catch (error) {
    console.error('抓取失败:', error)
    message.value = '❌ 网络错误，请检查网络连接后重试'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>
