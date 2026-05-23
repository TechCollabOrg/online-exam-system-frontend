<template>
  <div class="navbar">
    <div class="navbar-topbar">
      <hamburger
        :is-active="sidebar.opened"
        class="hamburger-container"
        @toggleClick="toggleSideBar"
      />

      <breadcrumb class="breadcrumb-container" />

      <div class="right-menu">
        <el-button
          type="primary"
          plain
          size="small"
          class="client-download-btn"
          @click="goStudentClient"
        >
          <i class="el-icon-download" />
          学生端下载
        </el-button>
        <el-dropdown class="avatar-container" trigger="click">
          <div class="avatar-wrapper">
            <img v-if="navbarAvatar" :src="navbarAvatar" class="user-avatar" alt="">
            <div v-else class="user-avatar user-avatar--placeholder">
              <i class="el-icon-user-solid" />
            </div>
            <i class="el-icon-caret-bottom" />
          </div>
          <el-dropdown-menu slot="dropdown" class="user-dropdown">
            <router-link to="/myself">
              <el-dropdown-item> 个人中心 </el-dropdown-item>
            </router-link>
            <router-link to="/change-password">
              <el-dropdown-item> 修改密码</el-dropdown-item>
            </router-link>

            <el-dropdown-item divided @click.native="logout">
              <span style="display: block">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="navbar-tags">
      <template v-for="(item,index) in tags">
        <el-tag
          v-if="item.title"
          :key="index"
          closable
          disable-transitions
          class="navbar-tag"
          :class="{ 'navbar-tag--active': item.checked }"
          @click="$router.push(item.path)"
          @close="handleTagClose(item)"
        >
          {{ item.title }}
        </el-tag>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { getToken } from '@/utils/auth'
import { parseJwt } from '@/utils/jwtUtils'
import { resolveMediaUrl } from '@/utils/resolveMediaUrl'
import { disconnectWebSocket } from '@/utils/websocket'
export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      user: {}

    }
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'tags']),
    navbarAvatar() {
      const raw = (this.avatar || (this.user && this.user.avatar) || '').trim()
      const resolved = resolveMediaUrl(raw)
      return (resolved || raw).trim()
    }
  },
  created() {
    this.decode()
  },
  methods: {
    handleTagClose(item) {
      if (this.$route.path === item.path) {
        this.$store.commit('menu/REMOVE_TAG', item)
        const tags = this.$store.state.menu.tags
        if (tags.length > 0) {
          this.$router.push(tags[tags.length - 1].path).then(() => {
            window.location.reload()
          })
        }
      } else {
        this.$store.commit('menu/REMOVE_TAG', item)
      }
    },
    decode() {
      const token = getToken()
      const user = parseJwt(token)
      this.user = JSON.parse(user.userInfo)
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    goStudentClient() {
      this.$router.push('/student-client')
    },
    async logout() {
      try {
        await this.$store.dispatch('user/logout')
      } catch (e) {
        // 后端登出失败时仍清理本地会话，避免卡在已登录态
        await this.$store.dispatch('user/resetToken')
        this.$store.dispatch('logoutUser')
        disconnectWebSocket()
      } finally {
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  overflow: hidden;
  position: relative;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

  .navbar-topbar {
    width: 100%;
    height: 56px;
    display: flex;
    align-items: center;
    box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06);
  }

  .hamburger-container {
    line-height: 56px;
    height: 56px;
    float: none;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: background 0.2s;
    -webkit-tap-highlight-color: transparent;
    color: #475569;

    &:hover {
      background: rgba(59, 130, 246, 0.1);
      color: #0f172a;
    }
  }

  .breadcrumb-container {
    flex: 1;
    min-width: 0;
    line-height: 56px;
    float: none;
    padding-left: 8px;
  }

  .navbar-tags {
    width: 100%;
    min-height: 44px;
    padding: 6px 12px 10px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    background: linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%);
    border-top: 1px solid rgba(226, 232, 240, 0.9);
  }

  .navbar-tag {
    background-color: #fff !important;
    border-color: #e2e8f0 !important;
    color: #334155 !important;
    border-radius: 8px !important;
    height: 30px !important;
    line-height: 28px !important;
    padding: 0 12px !important;
    font-size: 12px !important;
    border-width: 1px !important;
    margin-left: 0 !important;
    transition: border-color 0.2s, box-shadow 0.2s, color 0.2s;

    &:hover {
      border-color: #93c5fd !important;
      color: #0f172a !important;
    }
  }

  .navbar-tag--active {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
    border-color: transparent !important;
    color: #fff !important;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);

    &:hover {
      border-color: transparent !important;
      color: #fff !important;
    }
  }

  .right-menu {
    float: none;
    margin-left: auto;
    height: 56px;
    line-height: 56px;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #64748b;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(59, 130, 246, 0.1);
        }
      }
    }

    .client-download-btn {
      margin-right: 12px;
    }

    .avatar-container {
      margin-right: 24px;

      .avatar-wrapper {
        margin-top: 0;
        position: relative;
        display: flex;
        align-items: center;

        .user-avatar {
          cursor: pointer;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 2px solid rgba(59, 130, 246, 0.28);
          object-fit: cover;
        }

        .user-avatar--placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #dbeafe, #f1f5f9);
          color: #64748b;
          font-size: 20px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -18px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: #94a3b8;
        }
      }
    }
  }
}
</style>
