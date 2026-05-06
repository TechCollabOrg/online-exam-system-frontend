<!--
 * @Author: st 2946594574@qq.com
 * @Date: 2024-03-04 10:55:05
 * @LastEditors: yangiiiiii 14122140+yangiiiiiii@user.noreply.gitee.com
 * @LastEditTime: 2024-05-16 15:13:43
 * @FilePath: \com-project\src\views\login\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">登录</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          tabindex="2"
          auto-complete="on"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <!-- STU-01：记住登录状态（令牌 Cookie 延长保存，非明文存密码） -->
      <el-form-item>
        <el-checkbox v-model="loginForm.rememberMe">记住我（7 天内免重复登录）</el-checkbox>
      </el-form-item>

      <div class="captcha-row">
        <el-form-item prop="code" class="captcha-form-item">
          <span class="svg-container">
            <svg-icon icon-class="code" />
          </span>
          <el-input
            ref="codeInput"
            v-model="loginForm.code"
            class="captcha-input"
            placeholder="验证码"
            name="code"
            type="text"
            tabindex="3"
            auto-complete="off"
            spellcheck="false"
            autocorrect="off"
            autocapitalize="off"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
        <div
          class="captcha-panel"
          title="点击刷新验证码"
          role="button"
          @click="getVerify"
        >
          <img
            v-show="captchaDataUrl"
            ref="captchaImg"
            :src="captchaDataUrl"
            class="captcha-img"
            alt=""
          >
          <span v-show="!captchaDataUrl && captchaLoading" class="captcha-panel-text">加载中…</span>
          <span v-show="!captchaDataUrl && !captchaLoading" class="captcha-panel-text">点击加载</span>
        </div>
      </div>
      <div
        v-if="enableRegister"
        style="
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 20px;
        "
      >
        <router-link style="color: #66b1ff" to="/register"> 立即注册 </router-link>
      </div>
      <el-form-item>
        <el-button
          :loading="loading"
          type="primary"
          style="width: 100%"
          @click.native.prevent="handleLogin"
        >登录</el-button>
      </el-form-item>

    </el-form>
    <!-- 添加备案信息 -->
    <div v-if="icpNumber" class="icp-info">
      <a :href="icpLink" target="_blank">{{ icpNumber }}</a>
    </div>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { getTokenInfo } from '@/utils/jwtUtils'
import { verifyCode, fetchCaptchaJson } from '@/api/user'
import { Message } from 'element-ui'
import { Encrypt } from '@/utils/Secret'
export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: '',
        code: '',
        rememberMe: false
      },
      enableRegister: process.env.VUE_APP_ENABLE_REGISTER === 'true',
      icpNumber: process.env.VUE_APP_ICP_NUMBER,
      icpLink: process.env.VUE_APP_ICP_LINK,
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        code: [{ required: true, trigger: 'blur', message: '请输入验证码' }]
      },
      loading: false,
      passwordType: 'password',
      /** 与后端 captchaId 对应，校验时一并提交 */
      captchaId: '',
      /** data:image/png;base64,...（后端 Hutool 为 PNG） */
      captchaDataUrl: '',
      captchaLoading: false
      // redirect: undefined,
    }
  },
  computed: {
    redirect() {
      return this.$route.query.redirect || '/index' // 如果没有 redirect 参数，默认跳转到首页
    }
  },
  // watch: {
  //   $route: {
  //     handler: function (route) {
  //       this.redirect = route.query && route.query.redirect;
  //     },
  //     immediate: true,
  //   },
  // },
  created() {
    // 尽早请求验证码，与 DOM 渲染并行，dev 首屏更快出现图片
    this.getVerify()
  },
  mounted() {
    this.$nextTick(() => {
      const u = this.$refs.username
      if (u && typeof u.focus === 'function') {
        u.focus()
      }
    })
  },
  methods: {
    getVerify() {
      this.captchaLoading = true
      this.captchaDataUrl = ''
      fetchCaptchaJson()
        .then((res) => {
          if (res.code === 1 && res.data && res.data.imageBase64) {
            this.captchaId = res.data.captchaId
            // Hutool 5.x AbstractCaptcha 固定写出 PNG，误用 image/jpeg 会导致图片无法显示、排版异常
            this.captchaDataUrl = 'data:image/png;base64,' + res.data.imageBase64
          } else {
            this.captchaId = ''
            this.captchaDataUrl = ''
          }
        })
        .catch(() => {
          this.captchaId = ''
          this.captchaDataUrl = ''
        })
        .finally(() => {
          this.captchaLoading = false
        })
    },

    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      if (this.loading) {
        return
      }
      if (!this.captchaId) {
        this.$message.warning('请等待验证码加载完成后再登录')
        return
      }
      this.loading = true
      // 必须先通过表单校验再调 verifyCode：否则验证码会先被消费，校验失败时第二次点击会提示验证码已过期
      this.$refs.loginForm.validate((valid) => {
        if (!valid) {
          this.loading = false
          return
        }
        verifyCode({ code: this.loginForm.code, captchaId: this.captchaId })
          .then((res) => {
            if (res.code !== 1) {
              this.loading = false
              this.loginForm.code = ''
              this.getVerify()
              this.$message({ type: 'info', message: res.msg })
              return
            }
            const loginData = {
              username: this.loginForm.username,
              password: Encrypt(this.loginForm.password),
              rememberMe: this.loginForm.rememberMe,
              captchaId: this.captchaId
            }
            this.$store
              .dispatch('user/login', loginData)
              .then(() =>
                this.$store.dispatch('user/getInfo').catch(() => {
                  // 登录已成功；资料接口失败不阻断进入系统，顶栏头像由布局内再次 getInfo 补偿
                })
              )
              .then(() => {
                this.$store.commit('menu/CLOSE_SIDEBAR')
                const userInfo = getTokenInfo(this.$store.getters.token)
                this.$store.dispatch('loginUser', { id: userInfo.id })
                this.loading = false
                this.$router.push(this.redirect || '/index')
              })
              .catch((error) => {
                this.getVerify()
                const msg =
                  (error && error.msg) ||
                  (error && error.message) ||
                  (error && error.response && error.response.data && error.response.data.msg) ||
                  '登录失败'
                Message.error(msg)
                this.loading = false
              })
          })
          .catch(() => {
            this.loading = false
            this.loginForm.code = ''
            this.getVerify()
          })
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
    .el-input {
      display: inline-block;
      height: 47px;
      width: 85%;
      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;
        &:-webkit-autofill {
          box-shadow: 0 0 0px 1000px $bg inset !important;
          -webkit-text-fill-color: $cursor !important;
        }
      }
    }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .captcha-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px 16px;
  }

  .captcha-form-item {
    margin-bottom: 0;
    flex: 1;
    min-width: 0;
  }

  .captcha-input {
    width: 300px;
    max-width: 100%;
  }

  .captcha-panel {
    width: 148px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    box-sizing: border-box;
  }

  .captcha-img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .captcha-panel-text {
    font-size: 12px;
    color: $dark_gray;
    padding: 0 8px;
    text-align: center;
    line-height: 1.3;
  }
  .but {
    width: 220px;
    height: 39px;
    color: #fff;
    background-color: #409eff;
    border-color: #409eff;
    /* border: 1px solid; */
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 4px;
    font-weight: 500;
    text-align: center;
    font-family: sans-serif;
    padding-top: 10px;
  }
  .icp-info {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;

    a {
      color: $dark_gray;
      font-size: 12px;
      text-decoration: none;

      &:hover {
        color: $light_gray;
        text-decoration: underline;
      }
    }
  }
}
</style>
