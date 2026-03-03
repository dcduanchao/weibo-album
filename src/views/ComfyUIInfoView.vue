<template>
  <div class="comfyui-info-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">ℹ️ ComfyUI 信息</h1>
        <p class="page-subtitle">ComfyUI 服务管理和信息查看</p>
      </div>
    </div>

    <div class="card">
      <div class="info-section">
        <h2 class="section-title">🔧 服务管理</h2>

        <div class="action-card">
          <div class="action-info">
            <div class="action-icon">🔄</div>
            <div class="action-details">
              <h3 class="action-title">重启按钮</h3>
              <p class="action-desc">重启 ComfyUI 的按钮服务</p>
            </div>
          </div>
          <el-button
            type="primary"
            @click="handleReboot"
            :loading="rebooting"
            size="large"
          >
            {{ rebooting ? "重启中..." : "重启按钮" }}
          </el-button>
        </div>
      </div>

      <div class="info-section">
        <h2 class="section-title">📊 服务状态</h2>

        <div class="status-card">
          <div class="status-item">
            <span class="status-label">服务状态</span>
            <el-tag :type="statusType" size="large">
              {{ statusText }}
            </el-tag>
          </div>
          <div class="status-item">
            <span class="status-label">最后更新</span>
            <span class="status-value">{{ lastUpdate }}</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h2 class="section-title">📝 使用说明</h2>

        <div class="info-card">
          <div class="info-item">
            <div class="info-icon">✏️</div>
            <div class="info-content">
              <h4>编辑图片</h4>
              <p>上传图片并输入提示词，对图片进行编辑处理</p>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">🎨</div>
            <div class="info-content">
              <h4>生成图片</h4>
              <p>输入提示词，生成全新的图片</p>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">📋</div>
            <div class="info-content">
              <h4>查看记录</h4>
              <p>查看所有编辑和生成的历史记录</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { rebootComfyui } from "../api";

const rebooting = ref(false);
const statusType = ref("success");
const statusText = ref("运行中");
const lastUpdate = ref(new Date().toLocaleString());

const handleReboot = async () => {
  try {
    rebooting.value = true;
    const res = await rebootComfyui();

    if (res.data.code === 200) {
      ElMessage.success("✅ 按钮重启成功");
      lastUpdate.value = new Date().toLocaleString();
    } else {
      ElMessage.error(res.data.msg || "重启失败");
    }
  } catch (error) {
    console.error("重启失败:", error);
    ElMessage.error("网络错误，请稍后重试");
  } finally {
    rebooting.value = false;
  }
};
</script>

<style scoped>
.comfyui-info-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
}

.card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.info-section {
  margin-bottom: 40px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: 12px;
  gap: 24px;
}

.action-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.action-icon {
  font-size: 48px;
}

.action-details {
  flex: 1;
}

.action-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.action-desc {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
}

.status-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.status-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.status-value {
  font-size: 14px;
  color: var(--text-primary);
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  align-items: flex-start;
}

.info-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.info-content p {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .action-card {
    flex-direction: column;
    align-items: stretch;
  }

  .action-info {
    width: 100%;
  }

  .el-button {
    width: 100%;
  }

  .info-item {
    flex-direction: column;
    text-align: center;
  }

  .info-icon {
    margin-bottom: 8px;
  }
}
</style>
