<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">🎨 Grok 生成列表</h1>
        <p class="page-subtitle">查看 Grok 图片和视频生成记录</p>
      </div>
      <el-button type="primary" @click="loadList" :loading="loading">
        🔄 刷新
      </el-button>
    </div>

    <div class="card">
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
        <el-table-column prop="id" label="ID" width="80" align="center">
          <template #default="{ row }">
            <span style="font-weight: 600; color: var(--primary-color)"
              >#{{ row.id }}</span
            >
          </template>
        </el-table-column>

        <el-table-column label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.opr_type)">
              {{ getTypeText(row.opr_type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Prompt" min-width="300">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px">
              <div
                style="
                  flex: 1;
                  max-width: 400px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                "
              >
                <el-tooltip :content="row.prompt" placement="top">
                  {{ row.prompt }}
                </el-tooltip>
              </div>
              <el-button
                type="primary"
                size="small"
                @click="copyUrl(row.prompt)"
                style="flex-shrink: 0"
              >
                📋
              </el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="生成结果" min-width="400">
          <template #default="{ row }">
            <div class="result-images">
              <div
                v-for="(item, index) in parseUrlInfos(row.url_infos)"
                :key="index"
                class="result-item"
              >
                <img
                  v-if="row.opr_type !== 2"
                  :src="item.minio_url"
                  alt="result"
                  class="result-image"
                  @click="previewImage(item.minio_url)"
                />
                <video
                  v-else
                  :src="item.minio_url"
                  class="result-video"
                  @click="previewVideo(item.minio_url)"
                />
                <el-button
                  type="primary"
                  size="small"
                  @click="copyUrl(item.url)"
                  class="copy-btn"
                >
                  📋 复制URL
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="备注" min-width="200">
          <template #default="{ row }">
            <div
              style="
                max-width: 300px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: var(--text-secondary);
              "
            >
              {{ row.remakes || "-" }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row.id)"
              :loading="row._deleting"
            >
              🗑️ 删除
            </el-button>
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

      <div v-if="!loading && list.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">暂无生成记录</div>
        <div class="empty-desc">前往 Grok 页面开始生成图片或视频</div>
      </div>
    </div>

    <el-image-viewer
      v-if="previewImageUrl"
      :url-list="[previewImageUrl]"
      :initial-index="0"
      @close="previewImageUrl = ''"
    />

    <el-dialog
      v-model="showVideoPreview"
      title="视频预览"
      :width="dialogWidth"
      :fullscreen="isMobile"
      center
      @close="closeVideoPreview"
    >
      <video
        v-if="previewVideoUrl"
        :src="previewVideoUrl"
        style="width: 100%; display: block; margin: 0 auto"
        controls
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { getGrokList, deleteGrok } from "../api";
import { ElMessage, ElMessageBox } from "element-plus";

const list = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const jumpPageNum = ref(1);
const previewImageUrl = ref("");
const previewVideoUrl = ref("");
const showVideoPreview = ref(false);
const isMobile = ref(window.innerWidth < 768);

const dialogWidth = computed(() => {
  return isMobile.value ? "90%" : "60%";
});

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
};

const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

const loadList = async () => {
  loading.value = true;
  try {
    const res = await getGrokList(page.value, pageSize.value);
    if (res.data.code === 200) {
      list.value = res.data.data.list;
      total.value = res.data.data.total;
    }
  } catch (error) {
    console.error("加载列表失败:", error);
    ElMessage.error("加载失败，请稍后重试");
  } finally {
    loading.value = false;
  }
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

const getTypeText = (type) => {
  const typeMap = {
    0: "生成图片",
    1: "编辑图片",
    2: "生成视频",
  };
  return typeMap[type] || "未知";
};

const getTypeTagType = (type) => {
  const typeMap = {
    0: "primary",
    1: "warning",
    2: "success",
  };
  return typeMap[type] || "info";
};

const parseUrlInfos = (urlInfos) => {
  if (!urlInfos) return [];
  try {
    return JSON.parse(urlInfos);
  } catch (e) {
    console.error("解析 url_infos 失败:", e);
    return [];
  }
};

const copyUrl = async (url) => {
  if (!url) {
    ElMessage.error("URL为空，无法复制");
    return;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      ElMessage.success("✅ 已复制到剪贴板");
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        ElMessage.success("✅ 已复制到剪贴板");
      } catch (err) {
        console.error("复制失败:", err);
        ElMessage.error("复制失败，请手动复制");
      }

      document.body.removeChild(textArea);
    }
  } catch (error) {
    console.error("复制失败:", error);
    ElMessage.error("复制失败，请手动复制");
  }
};

const previewImage = (url) => {
  previewImageUrl.value = url;
};

const previewVideo = (url) => {
  previewVideoUrl.value = url;
  showVideoPreview.value = true;
};

const closeVideoPreview = () => {
  showVideoPreview.value = false;
  previewVideoUrl.value = "";
};

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm("确定要删除这条记录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    console.log("取消删除");
    return;
  }

  loading.value = true;
  try {
    const res = await deleteGrok(id);
    if (res.data.code === 200) {
      ElMessage.success("✅ 删除成功");
      loadList();
    } else {
      ElMessage.error(res.data.msg || "删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
    ElMessage.error("删除失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadList();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
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
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.page-btn {
  padding: 8px 16px;
}

.page-info {
  font-size: 14px;
  color: var(--text-secondary);
}

.jump-page {
  display: flex;
  align-items: center;
  margin-left: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-muted);
}

.result-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.result-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid var(--border-color);
}

.result-image:hover {
  transform: scale(1.1);
  border-color: var(--primary-color);
}

.result-video {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid var(--border-color);
}

.result-video:hover {
  transform: scale(1.1);
  border-color: var(--primary-color);
}

.copy-btn {
  font-size: 12px;
  padding: 4px 8px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .card {
    padding: 16px;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }

  .jump-page {
    margin-left: 0;
  }

  .result-images {
    justify-content: center;
  }
}
</style>
