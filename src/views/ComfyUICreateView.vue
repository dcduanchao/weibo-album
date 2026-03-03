<template>
  <div class="comfyui-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">🎨 ComfyUI 生成图片</h1>
        <p class="page-subtitle">使用 ComfyUI 生成新图片</p>
      </div>
    </div>

    <div class="card">
      <div class="form-section">
        <div class="form-group">
          <label class="form-label">Prompt（正向提示词）</label>
          <el-input
            v-model="prompt"
            type="textarea"
            :rows="6"
            placeholder="输入正向提示词，描述你想要生成的图片..."
          />
        </div>

        <div class="form-group">
          <label class="form-label">Na_Prompt（反向提示词）</label>
          <el-input
            v-model="naPrompt"
            type="textarea"
            :rows="4"
            placeholder="输入反向提示词，描述你不想要的效果..."
          />
        </div>

        <div class="form-actions">
          <el-button @click="resetForm" :disabled="loading">重置</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            ✨ 开始生成
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { comfyuiCreate } from "../api";

const prompt = ref("");
const naPrompt = ref("");
const loading = ref(false);

const handleSubmit = async () => {
  if (!prompt.value.trim()) {
    ElMessage.warning("请输入 Prompt");
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();
    formData.append("prompt", prompt.value);
    formData.append("na_prompt", naPrompt.value);

    const res = await comfyuiCreate(formData);

    if (res.data.code === 200) {
      ElMessage.success("✅ 提交成功，请在生成列表中查看处理结果");
      resetForm();
    } else {
      ElMessage.error(res.data.msg || "提交失败");
    }
  } catch (error) {
    console.error("提交失败:", error);
    ElMessage.error("网络错误，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  prompt.value = "";
  naPrompt.value = "";
};
</script>

<style scoped>
.comfyui-container {
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

.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.form-actions .el-button {
  flex: 1;
}
</style>
