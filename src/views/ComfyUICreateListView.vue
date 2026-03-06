<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">📋 ComfyUI 生成列表</h1>
        <p class="page-subtitle">查看 ComfyUI 图片生成记录</p>
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
        <el-table-column label="生成的图片" width="120" align="center">
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
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDelete(row)">
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getComfyuiCreateList, deleteComfyuiEdit } from "../api";

const loading = ref(false);
const list = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const jumpPageNum = ref(1);

const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

const loadList = async () => {
  loading.value = true;
  try {
    const res = await getComfyuiCreateList(page.value, pageSize.value);
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
  console.log("原始 ref_url:", refUrl, "类型:", typeof refUrl);
  if (!refUrl) return [];
  if (Array.isArray(refUrl)) {
    console.log("已经是数组，长度:", refUrl.length);
    return refUrl;
  }
  if (typeof refUrl === "string") {
    try {
      const parsed = JSON.parse(refUrl);
      console.log("JSON解析后:", parsed, "是数组:", Array.isArray(parsed));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.log("JSON解析失败，尝试正则提取");
      const urlRegex = /http[^\s\]]+/g;
      const urls = refUrl.match(urlRegex) || [];
      console.log("正则提取结果:", urls);
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

const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条生成记录吗？ID: #${item.id}`,
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
</style>
