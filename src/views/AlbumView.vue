<template>
  <div>
    <div class="back-btn" @click="goBack">← 返回记录列表</div>

    <!-- 用户信息头部 -->
    <div class="user-header" v-if="userInfo">
      <img
        :src="userInfo.avatar"
        :alt="userInfo.u_name"
        class="user-header-avatar"
        @error="handleAvatarError"
      />
      <div class="user-header-info">
        <h3>{{ userInfo.u_name }}</h3>
        <div class="user-stats">
          <div class="user-stat">
            <span>🆔</span>
            <span
              >UID: <strong>{{ uid }}</strong></span
            >
          </div>
          <div class="user-stat">
            <span>🖼️</span>
            <span
              >共 <strong>{{ total }}</strong> 张</span
            >
          </div>
          <div class="user-stat">
            <span>🎬</span>
            <span
              >视频 <strong>{{ videoCount }}</strong> 个</span
            >
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <!-- 工具栏 -->
      <div class="album-toolbar">
        <div class="album-stats">
          <div class="stat-item">
            <span class="stat-value">{{ albumList.length }}</span>
            <span class="stat-label">当前页</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ total }}</span>
            <span class="stat-label">总数量</span>
          </div>
        </div>

        <div class="download-section">
          <el-button
            type="success"
            size="large"
            :loading="downloading"
            :disabled="albumList.length === 0"
            @click="downloadAll"
            style="font-weight: 600"
          >
            <span v-if="!downloading">📦 打包下载当前页</span>
            <span v-else>下载中...</span>
          </el-button>

          <div class="download-progress" v-if="downloadProgress > 0">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: downloadProgress + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ downloadProgress }}%</span>
          </div>
        </div>
      </div>

      <!-- 相册网格 -->
      <div
        class="album-grid"
        v-loading="loading"
        element-loading-text="加载中..."
      >
        <div
          v-for="(item, index) in albumList"
          :key="item.id"
          class="album-item"
          @click="openPreview(index)"
        >
          <template v-if="item.pic_type === 'pic'">
            <div v-if="!item.loaded" class="image-placeholder">
              <div class="placeholder-spinner"></div>
            </div>
            <img
              :src="item.minio_url"
              :alt="'图片' + item.id"
              loading="lazy"
              @load="handleImageLoad(item)"
              @error="handleImageError(item)"
              :style="{
                opacity: item.loaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }"
            />
          </template>
          <template v-else-if="item.pic_type === 'video'">
            <video
              :src="item.minio_video || item.minio_url"
              preload="metadata"
              @loadeddata="handleImageLoad(item)"
            />
            <div class="video-badge">🎬 视频</div>
            <div class="play-icon"></div>
          </template>
          <template v-else>
            <div v-if="!item.loaded" class="image-placeholder">
              <div class="placeholder-spinner"></div>
            </div>
            <img
              :src="item.minio_url"
              :alt="'图片' + item.id"
              loading="lazy"
              @load="handleImageLoad(item)"
              @error="handleImageError(item)"
              :style="{
                opacity: item.loaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }"
            />
            <div class="video-badge" v-if="item.minio_video">🎬 含视频</div>
          </template>

          <div class="album-item-index">{{ index + 1 }}</div>

          <!-- 操作按钮 -->
          <div class="item-actions" @click.stop>
            <el-button type="primary" size="small" @click="openEditModal(item)">
              ✏️
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="openBatchEditModal(item)"
            >
              📝
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDeleteItem(item)"
            >
              🗑️
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
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

      <div v-if="!loading && albumList.length === 0" class="empty-state">
        <div class="empty-icon">🖼️</div>
        <div class="empty-title">暂无相册内容</div>
        <div class="empty-desc">该用户还没有上传任何图片或视频</div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <div v-if="showPreview" class="preview-modal" @click.self="closePreview">
      <button class="close-btn" @click="closePreview">×</button>

      <button
        class="nav-btn prev-btn"
        @click.stop="prevImage"
        v-if="albumList.length > 1"
      >
        ‹
      </button>
      <button
        class="nav-btn next-btn"
        @click.stop="nextImage"
        v-if="albumList.length > 1"
      >
        ›
      </button>

      <div class="preview-content">
        <img
          v-if="currentItem && currentItem.pic_type === 'pic'"
          :src="currentItem.minio_url"
          :key="'pic-' + currentItem.id"
        />
        <video
          v-else-if="
            currentItem &&
            (currentItem.pic_type === 'video' || currentItem.minio_video)
          "
          :src="currentItem.minio_video || currentItem.minio_url"
          controls
          autoplay
          :key="'video-' + currentItem.id"
        />
        <img
          v-else-if="currentItem"
          :src="currentItem.minio_url"
          :key="'other-' + currentItem.id"
        />
      </div>

      <div class="preview-counter">
        {{ currentIndex + 1 }} / {{ albumList.length }}
        <span
          v-if="currentItem?.pic_type === 'video' || currentItem?.minio_video"
          style="margin-left: 8px"
          >🎬</span
        >
      </div>

      <!-- 缩略图导航 -->
      <div class="thumbnail-nav" v-if="albumList.length > 1">
        <div
          v-for="(item, index) in albumList"
          :key="item.id"
          class="thumbnail-item"
          :class="{ active: index === currentIndex }"
          @click="currentIndex = index"
        >
          <img
            v-if="item.pic_type === 'pic'"
            :src="item.minio_url"
            :alt="'缩略图' + index"
          />
          <video v-else :src="item.minio_video || item.minio_url" />
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div
      class="edit-modal"
      v-if="showEditModal"
      @click.self="showEditModal = false"
    >
      <div class="edit-modal-content">
        <div class="edit-modal-header">
          <h3>✏️ 编辑图片</h3>
          <button class="close-btn" @click="showEditModal = false">×</button>
        </div>
        <div class="edit-modal-body">
          <div class="edit-image-preview">
            <img
              v-if="editItem.pic_type === 'pic' || !editItem.minio_video"
              :src="editItem.minio_url"
              :alt="'图片' + editItem.id"
            />
            <video
              v-else
              :src="editItem.minio_video || editItem.minio_url"
              controls
            />
            <div class="edit-image-info">
              <span class="info-label">ID:</span>
              <span class="info-value">{{ editItem.id }}</span>
            </div>
          </div>
          <el-form :model="editForm" label-width="100px">
            <el-form-item label="提示词">
              <el-input
                v-model="editForm.prompt"
                type="textarea"
                :rows="4"
                placeholder="请输入提示词"
              />
            </el-form-item>
            <el-form-item label="负面提示">
              <el-input
                v-model="editForm.na_prompt"
                type="textarea"
                :rows="3"
                placeholder="请输入负面提示"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="edit-modal-footer">
          <el-button @click="showEditModal = false">取消</el-button>
          <el-button type="primary" @click="handleEdit">保存</el-button>
        </div>
      </div>
    </div>

    <!-- 修改记录弹窗 -->
    <div
      class="edit-modal"
      v-if="showRecordModal"
      @click.self="showRecordModal = false"
    >
      <div class="edit-modal-content record-modal-content">
        <div class="edit-modal-header">
          <h3>📝 修改记录</h3>
          <button class="close-btn" @click="showRecordModal = false">×</button>
        </div>
        <div class="edit-modal-body">
          <div v-loading="recordLoading" class="record-images-grid">
            <div
              v-for="(image, index) in recordImages"
              :key="index"
              class="record-image-item"
            >
              <img
                :src="image.minio_url"
                :alt="'修改记录' + index"
                @click="openRecordPreview(index)"
              />
              <button
                class="record-delete-btn"
                @click.stop="deleteRecordFromGrid(index)"
              >
                ×
              </button>
            </div>
            <div
              v-if="!recordLoading && recordImages.length === 0"
              class="empty-records"
            >
              <div class="empty-icon">📭</div>
              <div class="empty-text">暂无修改记录</div>
            </div>
          </div>
        </div>
        <div class="edit-modal-footer">
          <el-button @click="showRecordModal = false">关闭</el-button>
        </div>
      </div>
    </div>

    <!-- 修改记录预览弹窗 -->
    <div
      v-if="showRecordPreview"
      class="preview-modal"
      @click.self="closeRecordPreview"
    >
      <button class="close-btn" @click="closeRecordPreview">×</button>
      <button
        class="nav-btn prev-btn"
        @click.stop="prevRecordImage"
        v-if="recordImages.length > 1"
      >
        ‹
      </button>
      <button
        class="nav-btn next-btn"
        @click.stop="nextRecordImage"
        v-if="recordImages.length > 1"
      >
        ›
      </button>
      <div class="preview-content">
        <img
          :src="recordImages[currentRecordIndex]?.minio_url"
          :key="currentRecordIndex"
        />
      </div>
      <div class="preview-counter">
        {{ currentRecordIndex + 1 }} / {{ recordImages.length }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getAlbumList,
  getRecords,
  updateAlbum,
  deleteAlbum,
  getUpdateRecord,
  deleteRecord,
} from "../api";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ElMessage, ElMessageBox } from "element-plus";

const route = useRoute();
const router = useRouter();
const uid = route.params.uid;

const albumList = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(12);
const total = ref(0);
const userInfo = ref(null);
const jumpPageNum = ref(1);

const showPreview = ref(false);
const currentIndex = ref(0);

const downloading = ref(false);
const downloadProgress = ref(0);

const showEditModal = ref(false);
const showRecordModal = ref(false);

const editItem = ref({});
const editForm = ref({
  id: null,
  prompt: "",
  na_prompt: "",
});

const recordImages = ref([]);
const recordLoading = ref(false);

const showRecordPreview = ref(false);
const currentRecordIndex = ref(0);

const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

const currentItem = computed(() => albumList.value[currentIndex.value]);

const videoCount = computed(() => {
  return albumList.value.filter(
    (item) => item.pic_type === "video" || item.minio_video,
  ).length;
});

// 加载相册
const loadAlbum = async () => {
  loading.value = true;
  try {
    const res = await getAlbumList(uid, page.value, pageSize.value);
    if (res.data.code === 200) {
      albumList.value = res.data.data.list.map((item) => ({
        ...item,
        loaded: false,
      }));
      total.value = res.data.data.total;
    }
  } catch (error) {
    console.error("加载相册失败:", error);
    ElMessage.error("加载相册失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await getRecords(1, 100);
    if (res.data.code === 200) {
      const user = res.data.data.list.find((item) => item.uid === uid);
      if (user) {
        userInfo.value = user;
      }
    }
  } catch (error) {
    console.error("加载用户信息失败:", error);
  }
};

// 分页
const changePage = (newPage) => {
  page.value = newPage;
  loadAlbum();
};

const jumpToPage = () => {
  if (jumpPageNum.value >= 1 && jumpPageNum.value <= totalPages.value) {
    changePage(jumpPageNum.value);
    jumpPageNum.value = 1;
  }
};

// 返回
const goBack = () => {
  router.push("/records");
};

// 图片加载完成
const handleImageLoad = (item) => {
  item.loaded = true;
};

// 图片加载错误
const handleImageError = (item) => {
  item.loaded = true;
  item.error = true;
};

// 预览
const openPreview = (index) => {
  currentIndex.value = index;
  showPreview.value = true;
  document.body.style.overflow = "hidden";
};

const closePreview = () => {
  showPreview.value = false;
  document.body.style.overflow = "";
};

// 打开编辑弹窗
const openEditModal = (item) => {
  editItem.value = item;
  editForm.value = {
    id: item.id,
    prompt: item.prompt || "",
    na_prompt: item.na_prompt || "",
  };
  showEditModal.value = true;
};

// 打开批量编辑弹窗
const openBatchEditModal = async (item) => {
  recordLoading.value = true;
  showRecordModal.value = true;
  try {
    const res = await getUpdateRecord(item.id);
    if (res.data.code === 200) {
      recordImages.value = res.data.data || [];
    } else {
      ElMessage.error(res.data.msg || "获取修改记录失败");
    }
  } catch (error) {
    console.error("获取修改记录失败:", error);
    ElMessage.error("网络错误，请稍后重试");
  } finally {
    recordLoading.value = false;
  }
};

// 打开修改记录预览
const openRecordPreview = (index) => {
  currentRecordIndex.value = index;
  showRecordPreview.value = true;
  document.body.style.overflow = "hidden";
};

// 关闭修改记录预览
const closeRecordPreview = () => {
  showRecordPreview.value = false;
  document.body.style.overflow = "";
};

// 上一张修改记录图片
const prevRecordImage = () => {
  if (currentRecordIndex.value > 0) {
    currentRecordIndex.value--;
  } else {
    currentRecordIndex.value = recordImages.value.length - 1;
  }
};

// 下一张修改记录图片
const nextRecordImage = () => {
  if (currentRecordIndex.value < recordImages.value.length - 1) {
    currentRecordIndex.value++;
  } else {
    currentRecordIndex.value = 0;
  }
};

// 从网格中删除修改记录
const deleteRecordFromGrid = (index) => {
  const image = recordImages.value[index];
  if (!image) return;

  ElMessageBox.confirm(`确定要删除这张修改记录吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await deleteRecord(image.id);
        if (res.data.code === 200) {
          ElMessage.success(res.data.msg || "✅ 删除成功");
          recordImages.value.splice(index, 1);
        } else {
          ElMessage.error(res.data.msg || "删除失败");
        }
      } catch (error) {
        console.error("删除失败:", error);
        ElMessage.error("网络错误，请稍后重试");
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

// 处理编辑
const handleEdit = async () => {
  try {
    const res = await updateAlbum(editForm.value);
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg || "✅ 编辑成功");
      showEditModal.value = false;
      const item = albumList.value.find((i) => i.id === editForm.value.id);
      if (item) {
        item.prompt = editForm.value.prompt;
        item.na_prompt = editForm.value.na_prompt;
      }
    } else {
      ElMessage.error(res.data.msg || "编辑失败");
    }
  } catch (error) {
    console.error("编辑失败:", error);
    ElMessage.error("网络错误，请稍后重试");
  }
};

// 处理删除单个图片
const handleDeleteItem = (item) => {
  ElMessageBox.confirm(`确定要删除这张图片吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await deleteAlbum(item.id);
        if (res.data.code === 200) {
          ElMessage.success(res.data.msg || "✅ 删除成功");
          const index = albumList.value.findIndex((i) => i.id === item.id);
          if (index !== -1) {
            albumList.value.splice(index, 1);
            total.value--;
            if (albumList.value.length === 0 && page.value > 1) {
              page.value--;
              await loadAlbum();
            }
          }
        } else {
          ElMessage.error(res.data.msg || "删除失败");
        }
      } catch (error) {
        console.error("删除失败:", error);
        ElMessage.error("网络错误，请稍后重试");
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = albumList.value.length - 1;
  }
};

const nextImage = () => {
  if (currentIndex.value < albumList.value.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
};

// 键盘事件
const handleKeydown = (e) => {
  if (showPreview.value) {
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "Escape") closePreview();
  } else if (showRecordPreview.value) {
    if (e.key === "ArrowLeft") prevRecordImage();
    if (e.key === "ArrowRight") nextRecordImage();
    if (e.key === "Escape") closeRecordPreview();
  }
};

// 下载全部
const downloadAll = async () => {
  if (albumList.value.length === 0) return;

  downloading.value = true;
  downloadProgress.value = 0;

  const zip = new JSZip();
  const folder = zip.folder(`weibo_${uid}_${Date.now()}`);

  const totalItems = albumList.value.length;
  let completed = 0;

  try {
    for (const item of albumList.value) {
      try {
        // 下载图片
        const imgResponse = await fetch(item.minio_url);
        const imgBlob = await imgResponse.blob();
        const ext = item.minio_url.split(".").pop().split("?")[0] || "jpg";
        folder.file(`${item.pid}.${ext}`, imgBlob);

        // 如果有视频，也下载视频
        if (item.minio_video) {
          const videoResponse = await fetch(item.minio_video);
          const videoBlob = await videoResponse.blob();
          const videoExt =
            item.minio_video.split(".").pop().split("?")[0] || "mp4";
          folder.file(`${item.pid}_video.${videoExt}`, videoBlob);
        }
      } catch (err) {
        console.error(`下载失败: ${item.pid}`, err);
      }

      completed++;
      downloadProgress.value = Math.round((completed / totalItems) * 100);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `weibo_album_${uid}.zip`);

    ElMessage.success("✅ 下载完成！");
  } catch (error) {
    console.error("打包下载失败:", error);
    ElMessage.error("下载失败，请重试");
  } finally {
    downloading.value = false;
    downloadProgress.value = 0;
  }
};

const handleAvatarError = (e) => {
  e.target.src =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MiIgaGVpZ2h0PSI3MiIgdmlld0JveD0iMCAwIDcyIDcyIj48Y2lyY2xlIGN4PSIzNiIgY3k9IjM2IiByPSIzNiIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjM2IiB5PSI0NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2EwYWVjMCIgZm9udC1zaXplPSIyNCI+8J+RpDwvdGV4dD48L3N2Zz4=";
};

onMounted(() => {
  loadAlbum();
  loadUserInfo();
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.item-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  gap: 4px;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.15s ease;
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
  z-index: 10;
}

.album-item:hover .item-actions {
  opacity: 1;
}

.item-actions .el-button {
  flex: 1;
  padding: 6px 8px;
  font-size: 14px;
  min-width: auto;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  z-index: 1;
}

.placeholder-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
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

.edit-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.record-modal-content {
  max-width: 900px;
}

.record-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
  min-height: 200px;
}

.record-image-item {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-secondary);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.record-delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(244, 67, 54, 0.9);
  border: none;
  font-size: 20px;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 10;
  opacity: 0;
}

.record-image-item:hover .record-delete-btn {
  opacity: 1;
}

.record-delete-btn:hover {
  background: rgba(220, 53, 69, 1);
  transform: scale(1.1);
}

.record-image-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.record-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-records {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-records .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-records .empty-text {
  font-size: 16px;
}

/* 修改记录预览弹窗样式 */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
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

.preview-content {
  max-width: 90%;
  max-height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-content img {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  z-index: 1;
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

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  font-size: 32px;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 10;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.preview-counter {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  backdrop-filter: blur(8px);
  z-index: 20;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.edit-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.edit-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.edit-modal-body {
  padding: 24px;
}

.edit-image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.edit-image-preview img,
.edit-image-preview video {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.edit-image-info {
  margin-top: 12px;
  font-size: 14px;
}

.info-label {
  color: var(--text-muted);
  margin-right: 8px;
}

.info-value {
  font-weight: 600;
  color: var(--text-primary);
}

.batch-edit-info {
  text-align: center;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 24px;
  font-size: 14px;
}

.batch-edit-info strong {
  color: var(--primary-color);
  font-size: 18px;
}

.edit-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}
</style>
