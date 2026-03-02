<template>
  <div class="app-container">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">📸</span>
          <span>微博相册抓取</span>
        </div>
        <button class="mobile-menu-btn" @click="toggleMenu">
          {{ showMobileMenu ? "✕" : "☰" }}
        </button>
        <nav class="nav-menu" :class="{ show: showMobileMenu }">
          <router-link
            to="/"
            class="nav-item"
            :class="{ active: $route.path === '/' }"
            @click="closeMenu"
          >
            🚀 抓取
          </router-link>
          <router-link
            to="/records"
            class="nav-item"
            :class="{ active: $route.path === '/records' }"
            @click="closeMenu"
          >
            📋 抓取记录
          </router-link>
        </nav>
        <div class="user-section">
          <template v-if="isLoggedIn">
            <div class="user-info" @click="toggleUserMenu">
              <img
                :src="userInfo.avatar"
                :alt="userInfo.username"
                class="user-avatar"
              />
              <span class="user-name">{{ userInfo.username }}</span>
              <span class="dropdown-arrow">▼</span>
              <div class="user-dropdown" :class="{ show: showUserMenu }">
                <div class="dropdown-item">
                  <span class="dropdown-label">用户名</span>
                  <span class="dropdown-value">{{ userInfo.username }}</span>
                </div>
                <div class="dropdown-item">
                  <span class="dropdown-label">邮箱</span>
                  <span class="dropdown-value">{{ userInfo.email }}</span>
                </div>
                <div class="dropdown-item">
                  <span class="dropdown-label">角色</span>
                  <span class="dropdown-value">{{ userInfo.role }}</span>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item logout" @click="logout">
                  🚪 退出登录
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <el-button
              type="primary"
              size="small"
              @click="showLoginModal = true"
            >
              🔐 登录
            </el-button>
          </template>
        </div>
      </div>
    </header>
    <main class="main-content">
      <router-view />
    </main>

    <div
      class="login-modal"
      v-if="showLoginModal"
      @click.self="showLoginModal = false"
    >
      <div class="login-modal-content">
        <div class="login-modal-header">
          <h3>🔐 用户登录</h3>
          <button class="close-btn" @click="showLoginModal = false">×</button>
        </div>
        <div class="login-modal-body">
          <el-form :model="loginForm" label-width="80px">
            <el-form-item label="用户名">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
              />
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="login-modal-footer">
          <el-button @click="showLoginModal = false">取消</el-button>
          <el-button type="primary" @click="handleLogin">登录</el-button>
        </div>
      </div>
    </div>

    <footer
      style="
        text-align: center;
        padding: 24px;
        color: var(--text-muted);
        font-size: 13px;
      "
    >
      © 2026 微博相册抓取工具 | 仅供学习交流使用
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const showMobileMenu = ref(false);
const showUserMenu = ref(false);
const showLoginModal = ref(false);
const isLoggedIn = ref(false);

const userInfo = ref({
  username: "",
  email: "",
  avatar: "",
  role: "",
});

const loginForm = ref({
  username: "",
  password: "",
});

const toggleMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const closeMenu = () => {
  showMobileMenu.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogin = () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    alert("请输入用户名和密码");
    return;
  }

  isLoggedIn.value = true;
  userInfo.value = {
    username: loginForm.value.username,
    email: `${loginForm.value.username}@example.com`,
    avatar:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzY2N2VlMiIvPjx0ZXh0IHg9IjIwIiB5PSIyNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiPueahOaWhzwvdGV4dD48L3N2Zz4=",
    role: "管理员",
  };

  loginForm.value = {
    username: "",
    password: "",
  };
  showLoginModal.value = false;
};

const logout = () => {
  isLoggedIn.value = false;
  userInfo.value = {
    username: "",
    email: "",
    avatar: "",
    role: "",
  };
  showUserMenu.value = false;
};

const handleClickOutside = (event) => {
  const userInfoElement = document.querySelector(".user-info");
  if (userInfoElement && !userInfoElement.contains(event.target)) {
    showUserMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.25);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-name {
  color: white;
  font-size: 14px;
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  transition: transform 0.25s ease;
}

.user-info:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 8px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.25s ease;
  z-index: 1000;
}

.user-dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
  font-size: 14px;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.dropdown-label {
  color: var(--text-muted);
  font-size: 12px;
}

.dropdown-value {
  font-weight: 500;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 8px 0;
}

.dropdown-item.logout {
  color: #f56c6c;
  cursor: pointer;
  justify-content: center;
}

.dropdown-item.logout:hover {
  background: #fef0f0;
}

.login-modal {
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

.login-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
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

.login-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.login-modal-header h3 {
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

.login-modal-body {
  padding: 24px;
}

.login-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}
</style>
