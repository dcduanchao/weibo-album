<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">📝 ComfyUI 编辑列表</h1>
        <p class="page-subtitle">查看 ComfyUI 图片编辑记录</p>
      </div>
      <el-button type="primary" @click="loadList" :loading="loading">
        🔄 刷新
      </el-button>
    </div>

    <div class="card">
      <!-- 统计信息 -->
      <div
        v-if="total > 0"
        style="
          display: flex;
          gap: 32px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        "
      >
        <div class="stat-item">
          <span class="stat-value">{{ total }}</span>
          <span class="stat-label">总记录数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ list.length }}</span>
          <span class="stat-label">当前页</span>
        </div>
      </div>

      <el-table
        :data="list"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{
          background: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          fontWeight: '600',
        }"
      >
        <el-table-column prop="id" label="ID" width="100" align="center">
          <template #default="{ row }">
            <span style="font-weight: 600; color: var(--primary-color)"
              >#{{ row.id }}</span
            >
          </template>
        </el-table-column>
        <el-table-column prop="prompt" label="Prompt" min-width="200">
          <template #default="{ row }">
            <div class="prompt-cell">
              <el-tooltip
                :content="row.prompt"
                placement="top"
                :show-after="200"
              >
                <div class="text-ellipsis">
                  {{ row.prompt }}
                </div>
              </el-tooltip>
              <el-button
                type="primary"
                size="small"
                link
                @click="copyText(row.prompt)"
                class="copy-btn"
              >
                📋
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="na_prompt" label="Na_Prompt" min-width="150">
          <template #default="{ row }">
            <div class="prompt-cell">
              <el-tooltip
                :content="row.na_prompt"
                placement="top"
                :show-after="200"
              >
                <div class="text-ellipsis">
                  {{ row.na_prompt }}
                </div>
              </el-tooltip>
              <el-button
                type="primary"
                size="small"
                link
                @click="copyText(row.na_prompt)"
                class="copy-btn"
              >
                📋
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="原图" width="120" align="center">
          <template #default="{ row }">
            <el-image
              :src="row.img_url"
              :preview-src-list="[row.img_url]"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 8px"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column label="参考图" width="150" align="center">
          <template #default="{ row }">
            <div
              v-if="row.ref_url && row.ref_url.length > 0"
              class="ref-images"
            >
              <el-image
                v-for="(url, index) in row.ref_url.slice(0, 3)"
                :key="index"
                :src="url"
                :preview-src-list="row.ref_url"
                :initial-index="index"
                fit="cover"
                style="
                  width: 40px;
                  height: 40px;
                  border-radius: 4px;
                  margin: 2px;
                "
                preview-teleported
              />
              <span v-if="row.ref_url.length > 3" class="ref-more">
                +{{ row.ref_url.length - 3 }}
              </span>
            </div>
            <span v-else class="no-ref">无</span>
          </template>
        </el-table-column>
        <el-table-column label="编辑后" width="120" align="center">
          <template #default="{ row }">
            <el-image
              :src="row.minio_url"
              :preview-src-list="[row.minio_url]"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 8px"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <div style="display: flex; gap: 8px; justify-content: center">
              <el-button type="primary" size="small" @click="viewDetail(row)">
                👁️ 查看
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                🗑️ 删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="total > 0">
        <el-button
          class="page-btn"
          :disabled="page === 1"
          @click="changePage(page - 1)"
        >
          ← 上一页
        </el-button>
        <span class="page-info">
          第 <strong>{{ page }}</strong> 页 / 共
          <strong>{{ totalPages }}</strong> 页
        </span>
        <el-button
          class="page-btn"
          :disabled="page >= totalPages"
          @click="changePage(page + 1)"
        >
          下一页 →
        </el-button>
        <div class="jump-page">
          <span>跳转至</span>
          <el-input-number
            v-model="jumpPageNum"
            :min="1"
            :max="totalPages"
            :controls="false"
            size="small"
            style="width: 70px; margin: 0 8px"
            @keyup.enter="jumpToPage"
          />
          <span>页</span>
          <el-button
            type="primary"
            size="small"
            @click="jumpToPage"
            style="margin-left: 8px"
          >
            确定
          </el-button>
        </div>
      </div>
    </div>

    <!-- 查看详情弹窗 -->
    <div
      class="preview-modal"
      v-if="showPreview"
      @click.self="showPreview = false"
    >
      <button class="close-btn" @click="showPreview = false">×</button>
      <div class="preview-content">
        <div class="compare-container">
          <div class="compare-item">
            <div class="compare-label">原图</div>
            <img :src="currentItem.img_url" alt="原图" />
          </div>
          <div class="compare-divider">→</div>
          <div class="compare-item">
            <div class="compare-label">编辑后</div>
            <img :src="currentItem.minio_url" alt="编辑后" />
          </div>
        </div>
        <div
          v-if="currentItem.ref_url && currentItem.ref_url.length > 0"
          class="ref-section"
        >
          <div class="ref-title">
            参考图（{{ currentItem.ref_url.length }}张）
          </div>
          <div class="ref-grid">
            <el-image
              v-for="(url, index) in currentItem.ref_url"
              :key="index"
              :src="url"
              :preview-src-list="currentItem.ref_url"
              :initial-index="index"
              fit="cover"
              class="ref-image"
              preview-teleported
            />
          </div>
        </div>
      </div>
      <div class="preview-info">
        <div class="info-item">
          <span class="info-label">ID：</span>
          <span class="info-value">#{{ currentItem.id }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Prompt：</span>
          <span class="info-value">{{ currentItem.prompt }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Na_Prompt：</span>
          <span class="info-value">{{ currentItem.na_prompt }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getComfyuiEditList, deleteComfyuiEdit } from "../api";

const loading = ref(false);
const list = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const jumpPageNum = ref(1);
const showPreview = ref(false);
const currentItem = ref({});

const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

const loadList = async () => {
  loading.value = true;
  try {
    const res = await getComfyuiEditList(page.value, pageSize.value);
    if (res.data.code === 200) {
      list.value = (res.data.data.list || []).map((item) => ({
        ...item,
        ref_url: parseRefUrl(item.ref_url),
      }));
      total.value = res.data.data.total || 0;
    } else {
      ElMessage.error(res.data.msg || "加载失败");
    }
  } catch (error) {
    console.error("加载失败:", error);
    ElMessage.error("网络错误，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const parseRefUrl = (refUrl) => {
  // console.log("原始 ref_url:", refUrl, "类型:", typeof refUrl);
  if (!refUrl) return [];
  if (Array.isArray(refUrl)) {
    // console.log("已经是数组，长度:", refUrl.length);
    return refUrl;
  }
  if (typeof refUrl === "string") {
    try {
      const parsed = JSON.parse(refUrl);
      // console.log("JSON解析后:", parsed, "是数组:", Array.isArray(parsed));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // console.log("JSON解析失败，尝试正则提取");
      const urlRegex = /http[^\s\]]+/g;
      const urls = refUrl.match(urlRegex) || [];
      // console.log("正则提取结果:", urls);
      return urls;
    }
  }
  return [];
};

const changePage = (newPage) => {
  page.value = newPage;
  loadList();
};

const jumpToPage = () => {
  if (jumpPageNum.value >= 1 && jumpPageNum.value <= totalPages.value) {
    changePage(jumpPageNum.value);
    jumpPageNum.value = 1;
  }
};

const copyText = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage.success("✅ 已复制到剪贴板");
    })
    .catch(() => {
      ElMessage.error("❌ 复制失败，请手动复制");
    });
};

const viewDetail = (item) => {
  currentItem.value = item;
  showPreview.value = true;
};

const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条编辑记录吗？ID: #${item.id}`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    const res = await deleteComfyuiEdit(item.id);

    if (res.data.code === 200) {
      ElMessage.success("删除成功");
      loadList();
    } else {
      ElMessage.error(res.data.msg || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("网络错误，请稍后重试");
    }
  }
};

const getStatusType = (status) => {
  const statusMap = {
    completed: "success",
    processing: "warning",
    failed: "danger",
    pending: "info",
  };
  return statusMap[status] || "info";
};

const getStatusText = (status) => {
  const statusMap = {
    completed: "已完成",
    processing: "处理中",
    failed: "失败",
    pending: "等待中",
  };
  return statusMap[status] || status;
};

onMounted(() => {
  loadList();
});
</script>

<style scoped>
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
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.prompt-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.copy-btn {
  padding: 4px 8px;
  font-size: 14px;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.copy-btn:hover {
  opacity: 1;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.page-btn {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.25s ease;
  font-weight: 500;
  color: var(--text-secondary);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(102, 126, 234, 0.05);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  color: var(--text-secondary);
  font-size: 14px;
  padding: 0 16px;
}

.jump-page {
  display: flex;
  align-items: center;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 14px;
}

.jump-page span {
  white-space: nowrap;
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  font-size: 32px;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preview-content {
  max-width: 1200px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.compare-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 32px;
  flex-direction: row;
}

.compare-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.compare-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.compare-item img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.compare-divider {
  font-size: 48px;
  color: var(--primary-color);
  font-weight: 700;
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-label {
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 100px;
}

.info-value {
  color: var(--text-primary);
  flex: 1;
}

.ref-images {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.ref-more {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
}

.no-ref {
  color: var(--text-muted);
  font-size: 13px;
}

.ref-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.ref-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.ref-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.ref-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.ref-image:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
  }

  .jump-page {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    width: 100%;
    justify-content: center;
    margin-top: 12px;
  }

  .preview-content {
    width: 98%;
    padding: 16px;
    max-height: 98vh;
  }

  .compare-container {
    flex-direction: column;
    gap: 24px;
  }

  .compare-divider {
    transform: rotate(90deg);
    font-size: 32px;
  }

  .compare-item img {
    max-height: 45vh;
    width: 100%;
  }

  .compare-label {
    font-size: 14px;
  }

  .preview-info {
    gap: 12px;
  }

  .info-item {
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    min-width: auto;
    font-size: 13px;
  }

  .info-value {
    font-size: 13px;
  }

  .close-btn {
    top: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .el-table {
    font-size: 12px;
  }

  .el-table .el-table__cell {
    padding: 8px 4px;
  }

  .el-table .el-table__header th {
    padding: 8px 4px;
  }

  .el-table-column--selection .cell {
    padding-left: 8px;
    padding-right: 8px;
  }

  .el-button--small {
    padding: 4px 8px;
    font-size: 12px;
  }

  .el-image {
    width: 50px !important;
    height: 50px !important;
  }

  .el-table .el-table__body-wrapper {
    overflow-x: auto;
  }

  .el-table {
    display: block;
  }

  .el-table::before {
    height: 0;
  }
}
</style>
