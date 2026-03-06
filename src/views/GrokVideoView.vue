<template>
  <div class="grok-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">🎬 Grok 视频生成</h1>
        <p class="page-subtitle">使用 Grok AI 生成视频</p>
      </div>
    </div>

    <div class="card">
      <div class="form-section">
        <div class="form-group">
          <label class="form-label">参考图URL</label>
          <el-input
            v-model="imageUrl"
            placeholder="输入参考图URL地址（可选）"
          />
        </div>

        <div class="form-group">
          <label class="form-label"
            >Prompt <span class="required">*</span></label
          >
          <el-input
            v-model="prompt"
            type="textarea"
            :rows="6"
            placeholder="输入描述你想要生成的视频内容..."
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label"
              >时长（秒） <span class="required">*</span></label
            >
            <el-input-number
              v-model="duration"
              :min="1"
              :max="15"
              placeholder="8"
            />
          </div>

          <div class="form-group">
            <label class="form-label">宽高比</label>
            <el-select v-model="aspect_ratio" placeholder="选择宽高比">
              <el-option label="1:1" value="1:1" />
              <el-option label="16:9" value="16:9" />
              <el-option label="9:16" value="9:16" />
              <el-option label="4:3" value="4:3" />
              <el-option label="3:4" value="3:4" />
              <el-option label="3:2" value="3:2" />
              <el-option label="2:3" value="2:3" />
            </el-select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">分辨率</label>
          <el-select v-model="resolution" placeholder="选择分辨率">
            <el-option label="480p" value="480p" />
            <el-option label="720p" value="720p" />
          </el-select>
        </div>

        <div class="form-actions">
          <el-button @click="resetForm" :disabled="loading">重置</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            ✨ 生成视频
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { grokGen } from "../api";

const imageUrl = ref("");
const prompt = ref("");
const duration = ref(8);
const aspect_ratio = ref("");
const resolution = ref("");
const loading = ref(false);

const handleSubmit = async () => {
  if (!prompt.value.trim()) {
    ElMessage.warning("请输入 Prompt");
    return;
  }

  loading.value = true;

  try {
    const params = {
      type: 2,
      prompt: prompt.value,
      duration: duration.value,
      model: "grok-imagine-video",
    };

    if (aspect_ratio.value) {
      params.aspect_ratio = aspect_ratio.value;
    }
    if (resolution.value) {
      params.resolution = resolution.value;
    }
    if (imageUrl.value.trim()) {
      params.image = {
        url: imageUrl.value,
      };
    }

    const res = await grokGen(params);

    if (res.data.code === 200) {
      ElMessage.success("✅ 提交成功");
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
  prompt.value = "";
  duration.value = 8;
  aspect_ratio.value = "";
  resolution.value = "";
};
</script>

<style scoped>
.grok-container {
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

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.required {
  color: #f56c6c;
  margin-left: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.form-actions .el-button {
  flex: 1;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
