<template>
  <div class="comfyui-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">🎨 ComfyUI 编辑图片</h1>
        <p class="page-subtitle">使用 ComfyUI 编辑和优化图片</p>
      </div>
    </div>

    <div class="card">
      <div class="form-section">
        <div class="form-group">
          <label class="form-label">上传图片</label>
          <el-upload
            class="upload-component"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-change="handleFileChange"
            accept="image/*"
            drag
          >
            <div class="upload-content" v-if="!imageUrl">
              <div class="upload-icon">📁</div>
              <div class="upload-text">点击或拖拽上传图片</div>
              <div class="upload-hint">支持 JPG、PNG、WEBP 格式</div>
            </div>
            <img v-else :src="imageUrl" class="uploaded-preview" />
          </el-upload>
        </div>

        <div class="form-group">
          <label class="form-label">Prompt（正向提示词）</label>
          <el-input
            v-model="prompt"
            type="textarea"
            :rows="6"
            placeholder="输入正向提示词，描述你想要的效果..."
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
            ✨ 开始处理
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { comfyuiEdit } from "../api";

const imageUrl = ref("");
const imageFile = ref(null);
const prompt = ref("");
const naPrompt = ref("");
const loading = ref(false);

const beforeUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isImage) {
    ElMessage.error("只能上传图片文件！");
    return false;
  }
  if (!isLt10M) {
    ElMessage.error("图片大小不能超过 10MB！");
    return false;
  }
  return true;
};

const handleFileChange = (file) => {
  if (file.raw) {
    imageFile.value = file.raw;
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl.value = e.target.result;
    };
    reader.readAsDataURL(file.raw);
  }
};

const handleSubmit = async () => {
  if (!imageFile.value) {
    ElMessage.warning("请先上传图片");
    return;
  }
  if (!prompt.value.trim()) {
    ElMessage.warning("请输入 Prompt");
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();
    formData.append("image", imageFile.value);
    formData.append("prompt", prompt.value);
    formData.append("na_prompt", naPrompt.value);

    const res = await comfyuiEdit(formData);

    if (res.data.code === 200) {
      ElMessage.success("✅ 提交成功，请在编辑列表中查看处理结果");
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
  imageUrl.value = "";
  imageFile.value = null;
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
  margin-bottom: 24px;
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
  color: var(--text-primary);
}

.upload-component {
  width: 100%;
}

.upload-content {
  padding: 60px 20px;
  text-align: center;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.upload-component:hover .upload-content {
  border-color: var(--primary-color);
  background: rgba(64, 158, 255, 0.05);
}

.upload-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: var(--text-muted);
}

.uploaded-preview {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
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
