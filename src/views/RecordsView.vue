<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">📋 抓取记录</h1>
        <p class="page-subtitle">查看已抓取的用户相册记录</p>
      </div>
      <el-button type="primary" @click="loadRecords" :loading="loading">
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
          <span class="stat-value">{{ records.length }}</span>
          <span class="stat-label">当前页</span>
        </div>
      </div>

      <el-table
        :data="records"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{
          background: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          fontWeight: '600',
        }"
      >
        <el-table-column prop="id" label="记录ID" width="100" align="center">
          <template #default="{ row }">
            <span style="font-weight: 600; color: var(--primary-color)"
              >#{{ row.id }}</span
            >
          </template>
        </el-table-column>
        <el-table-column prop="uid" label="用户UID" width="160" align="center">
          <template #default="{ row }">
            <code
              style="
                background: var(--bg-secondary);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
                color: var(--text-primary);
              "
              @click="openWeiboProfile(row.uid)"
              @mouseenter="
                $event.target.style.background = 'var(--primary-color)';
                $event.target.style.color = '#fff';
              "
              @mouseleave="
                $event.target.style.background = 'var(--bg-secondary)';
                $event.target.style.color = 'var(--text-primary)';
              "
              >{{ row.uid }}</code
            >
          </template>
        </el-table-column>
        <el-table-column label="用户信息" min-width="240">
          <template #default="{ row }">
            <div class="user-info">
              <img
                :src="row.avatar"
                :alt="row.u_name"
                class="user-avatar"
                @error="handleAvatarError"
              />
              <div>
                <div class="user-name">{{ row.u_name || "未知用户" }}</div>
                <div style="font-size: 12px; color: var(--text-muted)">
                  微博用户
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <div style="display: flex; gap: 8px; justify-content: center">
              <el-button type="primary" size="small" @click="viewAlbum(row)">
                🖼️ 相册
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="incrementalFetch(row)"
                :loading="row._fetching"
              >
                🔄 增量
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

      <div v-if="!loading && records.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">暂无抓取记录</div>
        <div class="empty-desc">前往「抓取」页面，输入用户UID开始抓取</div>
        <el-button
          type="primary"
          style="margin-top: 20px"
          @click="$router.push('/')"
        >
          去抓取
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getRecords, fetchAlbum } from "../api";
import { ElMessage } from "element-plus";

const router = useRouter();
const records = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const jumpPageNum = ref(1);

const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

const loadRecords = async () => {
  loading.value = true;
  try {
    const res = await getRecords(page.value, pageSize.value);
    if (res.data.code === 200) {
      records.value = res.data.data.list.map((item) => ({
        ...item,
        _fetching: false,
      }));
      total.value = res.data.data.total;
    }
  } catch (error) {
    console.error("加载记录失败:", error);
  } finally {
    loading.value = false;
  }
};

const changePage = (newPage) => {
  page.value = newPage;
  loadRecords();
};

const jumpToPage = () => {
  if (jumpPageNum.value >= 1 && jumpPageNum.value <= totalPages.value) {
    changePage(jumpPageNum.value);
    jumpPageNum.value = 1;
  }
};

const viewAlbum = (row) => {
  router.push(`/album/${row.uid}`);
};

const openWeiboProfile = (uid) => {
  window.open(`https://weibo.com/u/${uid}`, "_blank");
};

// 增量抓取
const incrementalFetch = async (row) => {
  row._fetching = true;
  try {
    const res = await fetchAlbum(row.uid);
    if (res.data.code === 200) {
      ElMessage.success(`✅ ${row.u_name} 增量抓取任务已提交`);
    } else {
      ElMessage.error(res.data.msg || "增量抓取失败");
    }
  } catch (error) {
    console.error("增量抓取失败:", error);
    ElMessage.error("网络错误，请稍后重试");
  } finally {
    row._fetching = false;
  }
};

const handleAvatarError = (e) => {
  e.target.src =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NCIgaGVpZ2h0PSI0NCIgdmlld0JveD0iMCAwIDQ0IDQ0Ij48Y2lyY2xlIGN4PSIyMiIgY3k9IjIyIiByPSIyMiIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjIyIiB5PSIyOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2EwYWVjMCIgZm9udC1zaXplPSIxOCI+8J+RpDwvdGV4dD48L3N2Zz4=";
};

onMounted(() => {
  loadRecords();
});
</script>
