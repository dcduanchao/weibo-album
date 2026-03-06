<template>
  <div class="grok-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">🎨 Grok 图片生成</h1>
        <p class="page-subtitle">使用 Grok AI 生成图片</p>
      </div>
    </div>

    <div class="card">
      <div class="form-section">
        <div class="form-group">
          <label class="form-label"
            >Prompt <span class="required">*</span></label
          >
          <el-input
            v-model="prompt"
            type="textarea"
            :rows="6"
            placeholder="输入描述你想要生成的图片内容..."
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label"
              >图片数量 <span class="required">*</span></label
            >
            <el-input-number v-model="n" :min="1" :max="5" placeholder="2" />
          </div>

          <div class="form-group">
            <label class="form-label">宽高比</label>
            <el-select v-model="aspect_ratio" placeholder="选择宽高比">
              <el-option label="1:1" value="1:1" />
              <el-option label="3:4" value="3:4" />
              <el-option label="4:3" value="4:3" />
              <el-option label="9:16" value="9:16" />
              <el-option label="16:9" value="16:9" />
              <el-option label="2:3" value="2:3" />
              <el-option label="3:2" value="3:2" />
              <el-option label="9:19.5" value="9:19.5" />
              <el-option label="19.5:9" value="19.5:9" />
              <el-option label="9:20" value="9:20" />
              <el-option label="20:9" value="20:9" />
              <el-option label="1:2" value="1:2" />
              <el-option label="2:1" value="2:1" />
              <el-option label="auto" value="auto" />
            </el-select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">质量</label>
            <el-select v-model="quality" placeholder="选择质量">
              <el-option label="low" value="low" />
              <el-option label="medium" value="medium" />
              <el-option label="high" value="high" />
            </el-select>
          </div>

          <div class="form-group">
            <label class="form-label">分辨率</label>
            <el-select v-model="resolution" placeholder="选择分辨率">
              <el-option label="1k" value="1k" />
              <el-option label="2k" value="2k" />
            </el-select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">模型</label>
          <el-select v-model="model" placeholder="选择模型">
            <el-option
              label="grok-imagine-image-pro"
              value="grok-imagine-image-pro"
            />
            <el-option label="grok-imagine-image" value="grok-imagine-image" />
          </el-select>
        </div>

        <div class="form-actions">
          <el-button @click="resetForm" :disabled="loading">重置</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            ✨ 生成图片
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

const prompt = ref("");
const n = ref(2);
const aspect_ratio = ref("");
const quality = ref("");
const resolution = ref("");
const model = ref("grok-imagine-image-pro");
const loading = ref(false);

const handleSubmit = async () => {
  if (!prompt.value.trim()) {
    ElMessage.warning("请输入 Prompt");
    return;
  }

  loading.value = true;

  try {
    const params = {
      type: 0,
      prompt: prompt.value,
      n: n.value,
      response_format: "url",
      model: model.value,
    };

    if (aspect_ratio.value) {
      params.aspect_ratio = aspect_ratio.value;
    }
    if (quality.value) {
      params.quality = quality.value;
    }
    if (resolution.value) {
      params.resolution = resolution.value;
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
  prompt.value = "";
  n.value = 2;
  aspect_ratio.value = "";
  quality.value = "";
  resolution.value = "";
  model.value = "grok-imagine-image-pro";
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
