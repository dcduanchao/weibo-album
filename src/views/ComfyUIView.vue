<template>
  <div class="comfyui-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">🎨 ComfyUI 编辑图片</h1>
        <p class="page-subtitle">使用 ComfyUI 编辑和优化图片</p>
      </div>
      <el-radio-group v-model="editMode" size="large">
        <el-radio-button label="single">单图编辑</el-radio-button>
        <el-radio-button label="multiple">多图编辑</el-radio-button>
      </el-radio-group>
    </div>

    <div class="card">
      <div class="form-section">
        <div class="form-group">
          <label class="form-label">
            上传图片
            <span v-if="editMode === 'multiple'" class="upload-hint">
              (1张主图 + 3张副图,图片尺寸最好相同且不要过大，)
            </span>
          </label>

          <el-upload
            v-if="editMode === 'single'"
            class="upload-component"
            :show-file-list="false"
            :auto-upload="false"
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

          <div v-else class="multiple-upload-section">
            <div class="upload-subsection">
              <label class="subsection-label">主图（1张）</label>
              <el-upload
                class="upload-component"
                :show-file-list="false"
                :auto-upload="false"
                :before-upload="beforeUploadMain"
                :on-change="handleMainFileChange"
                accept="image/*"
                drag
              >
                <div class="upload-content-small" v-if="!mainImageUrl">
                  <div class="upload-icon-small">📁</div>
                  <div class="upload-text-small">上传主图</div>
                </div>
                <img
                  v-else
                  :src="mainImageUrl"
                  class="uploaded-preview-small"
                />
              </el-upload>
            </div>

            <div class="upload-subsection">
              <label class="subsection-label">副图（最多3张）</label>
              <div class="secondary-upload-container">
                <el-upload
                  class="upload-component-small"
                  :show-file-list="false"
                  :auto-upload="false"
                  :before-upload="beforeUploadSecondary"
                  :on-change="handleSecondaryFileChange"
                  accept="image/*"
                  drag
                  multiple
                >
                  <div class="upload-content-small">
                    <div class="upload-icon-small">📁</div>
                    <div class="upload-text-small">上传副图</div>
                    <div class="upload-hint-small">最多3张</div>
                  </div>
                </el-upload>

                <div
                  v-if="secondaryImages.length > 0"
                  class="image-preview-grid-small"
                >
                  <div
                    v-for="(file, index) in secondaryImages"
                    :key="index"
                    class="image-preview-item-small"
                  >
                    <img :src="file.url" :alt="`副图${index + 1}`" />
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      @click="removeSecondaryImage(index)"
                      class="remove-btn-small"
                    >
                      ×
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

const editMode = ref("single");
const imageUrl = ref("");
const imageFile = ref(null);
const mainImageUrl = ref("");
const mainImageFile = ref(null);
const secondaryImages = ref([]);
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

const beforeUploadMain = (file) => {
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

const beforeUploadSecondary = (file) => {
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
  if (secondaryImages.value.length >= 3) {
    ElMessage.warning("副图最多只能上传3张！");
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

const handleMainFileChange = (file) => {
  if (file.raw) {
    mainImageFile.value = file.raw;
    const reader = new FileReader();
    reader.onload = (e) => {
      mainImageUrl.value = e.target.result;
    };
    reader.readAsDataURL(file.raw);
  }
};

const handleSecondaryFileChange = (file) => {
  if (file.raw) {
    if (secondaryImages.value.length >= 3) {
      ElMessage.warning("副图最多只能上传3张！");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      secondaryImages.value.push({
        file: file.raw,
        url: e.target.result,
      });
    };
    reader.readAsDataURL(file.raw);
  }
};

const removeSecondaryImage = (index) => {
  secondaryImages.value.splice(index, 1);
};

const handleSubmit = async () => {
  if (editMode.value === "single") {
    if (!imageFile.value) {
      ElMessage.warning("请先上传图片");
      return;
    }
  } else {
    if (!mainImageFile.value) {
      ElMessage.warning("请先上传主图");
      return;
    }
    if (secondaryImages.value.length === 0) {
      ElMessage.warning("请至少上传一张副图");
      return;
    }
  }

  if (!prompt.value.trim()) {
    ElMessage.warning("请输入 Prompt");
    return;
  }

  loading.value = true;

  try {
    const formData = new FormData();

    if (editMode.value === "single") {
      formData.append("image", imageFile.value);
    } else {
      formData.append("image", mainImageFile.value);
      secondaryImages.value.forEach((item, index) => {
        formData.append(`image${index + 2}`, item.file);
      });
    }

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
  mainImageUrl.value = "";
  mainImageFile.value = null;
  secondaryImages.value = [];
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
  gap: 16px;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
}

.multiple-upload-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-subsection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subsection-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
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

.upload-multiple-content {
  padding: 40px 20px;
  text-align: center;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.upload-component:hover .upload-content,
.upload-component:hover .upload-multiple-content {
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

.upload-content-small {
  padding: 40px 20px;
  text-align: center;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.upload-icon-small {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text-small {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.upload-hint-small {
  font-size: 12px;
  color: var(--text-muted);
}

.uploaded-preview-small {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
}

.secondary-upload-container {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.upload-component-small {
  flex-shrink: 0;
  width: 200px;
}

.upload-component-small .upload-content-small {
  padding: 30px 16px;
}

.upload-component-small .upload-icon-small {
  font-size: 36px;
  margin-bottom: 8px;
}

.upload-component-small .upload-text-small {
  font-size: 14px;
  margin-bottom: 4px;
}

.upload-component-small .upload-hint-small {
  font-size: 11px;
}

.image-preview-grid-small {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  flex: 1;
}

.image-preview-item-small {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.image-preview-item-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn-small {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  min-height: 20px;
  padding: 0;
  font-size: 16px;
  line-height: 1;
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
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .secondary-upload-container {
    flex-direction: column;
  }

  .upload-component-small {
    width: 100%;
  }

  .image-preview-grid-small {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
  }
}
</style>
