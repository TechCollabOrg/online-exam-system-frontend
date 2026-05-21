<!--
 * @Author: st 2946594574@qq.com
 * @Date: 2024-03-04 10:55:05
 * @LastEditors: yangiiiiii 14122140+yangiiiiiii@user.noreply.gitee.com
 * @LastEditTime: 2024-05-20 09:07:35
 * @FilePath: \com-project\src\views\login\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="login-container">
    <el-form
      ref="registerForm"
      :model="registerForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">注册</h3>
      </div>

      <el-form-item prop="userName">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="registerForm.userName"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>
      <el-form-item prop="realName">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="realName"
          v-model="registerForm.realName"
          placeholder="真实姓名"
          name="realName"
          type="text"
          tabindex="2"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="roleId" label-width="0">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-select
          v-model="registerForm.roleId"
          class="role-select"
          placeholder="注册身份"
          tabindex="3"
        >
          <el-option label="学生" :value="1" />
          <el-option label="教师" :value="2" />
          <el-option label="管理员" :value="3" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="needInviteCode" prop="inviteCode">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          v-model="registerForm.inviteCode"
          placeholder="邀请码（教师/管理员必填）"
          name="inviteCode"
          type="text"
          tabindex="4"
          auto-complete="off"
        />
      </el-form-item>
      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="registerForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          tabindex="5"
          auto-complete="on"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-form-item prop="checkedPassword">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="checkedPasswordType"
          ref="checkedPassword"
          v-model="registerForm.checkedPassword"
          :type="checkedPasswordType"
          placeholder="确认密码"
          name="checkedPassword"
          tabindex="6"
          auto-complete="on"
        />
        <span class="show-pwd" @click="showPwd2">
          <svg-icon
            :icon-class="checkedPasswordType === 'password' ? 'eye' : 'eye-open'"
          />
        </span>
      </el-form-item>

      <div class="captcha-row">
        <el-form-item prop="code" class="captcha-form-item">
          <span class="svg-container">
            <svg-icon icon-class="code" />
          </span>
          <el-input
            ref="code"
            v-model="registerForm.code"
            class="captcha-input"
            placeholder="验证码"
            name="code"
            type="text"
            tabindex="7"
            auto-complete="off"
            spellcheck="false"
            autocorrect="off"
            autocapitalize="off"
            @keyup.enter.native="registerFn"
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
      <div class="auth-alt-row">
        <router-link class="auth-alt-link" to="/login">返回登录</router-link>
      </div>

      <el-button
        :loading="loading"
        type="primary"
        style="width: 100%; margin-bottom: 30px"
        @click="registerFn"
      >注册</el-button>
    </el-form>
    <!-- 添加备案信息 -->
    <div v-if="icpNumber" class="icp-info">
      <a :href="icpLink" target="_blank">{{ icpNumber }}</a>
    </div>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { verifyCode, register, fetchCaptchaJson } from '@/api/user'
import { Message } from 'element-ui'
import { Encrypt } from '@/utils/Secret'
export default {
  name: 'Register',
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
    const validateRealName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入真实姓名'))
      } else {
        callback()
      }
    }
    const validateCheckedPassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入验证码'))
      } else {
        callback()
      }
    }
    const validateRoleId = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择注册身份'))
      } else {
        callback()
      }
    }
    const validateInviteCode = (rule, value, callback) => {
      const roleId = this.registerForm.roleId
      if (roleId === 2 || roleId === 3) {
        if (!value || !String(value).trim()) {
          callback(new Error('教师或管理员注册须填写邀请码'))
          return
        }
      }
      callback()
    }
    return {
      icpNumber: process.env.VUE_APP_ICP_NUMBER,
      icpLink: process.env.VUE_APP_ICP_LINK,
      registerForm: {
        userName: '',
        password: '',
        realName: '',
        roleId: 1,
        inviteCode: '',
        checkedPassword: '',
        code: ''
      },
      loginRules: {
        userName: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        realName: [{ required: true, trigger: 'blur', validator: validateRealName }],
        roleId: [{ required: true, trigger: 'change', validator: validateRoleId }],
        inviteCode: [{ validator: validateInviteCode, trigger: 'blur' }],
        checkedPassword: [{ required: true, trigger: 'blur', validator: validateCheckedPassword }],
        code: [{ required: true, trigger: 'blur', validator: validateCode }]
      },
      loading: false,
      passwordType: 'password',
      checkedPasswordType: 'password',
      redirect: undefined,
      captchaId: '',
      captchaDataUrl: '',
      captchaLoading: false
    }
  },
  computed: {
    needInviteCode() {
      return this.registerForm.roleId === 2 || this.registerForm.roleId === 3
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    },
    'registerForm.roleId'() {
      if (!this.needInviteCode) {
        this.registerForm.inviteCode = ''
      }
      if (this.$refs.registerForm) {
        this.$refs.registerForm.clearValidate('inviteCode')
      }
    }
  },
  created() {
    this.getVerify()
  },
  methods: {
    registerFn() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          verifyCode({ code: this.registerForm.code, captchaId: this.captchaId }).then((res) => {
            if (res.code === 1) {
              const registerData = {
                userName: this.registerForm.userName,
                realName: this.registerForm.realName,
                roleId: this.registerForm.roleId,
                password: Encrypt(this.registerForm.password),
                checkedPassword: Encrypt(this.registerForm.checkedPassword),
                captchaId: this.captchaId
              }
              if (this.needInviteCode) {
                registerData.inviteCode = String(this.registerForm.inviteCode).trim().toUpperCase()
              }
              register(registerData).then((res2) => {
                if (res2.code) {
                  Message({
                    message: res2.msg,
                    type: 'success',
                    duration: 5 * 1000
                  })
                  this.$router.push({ path: '/login' })
                } else {
                  this.getVerify()
                  Message({
                    message: res2.msg,
                    type: 'error',
                    duration: 5 * 1000
                  })
                }
              }).catch(() => {
                this.getVerify()
                Message({
                  message: '注册失败，请重试',
                  type: 'error',
                  duration: 5 * 1000
                })
              })
            } else {
              this.getVerify()
              Message({
                message: res.msg || '验证码验证失败',
                type: 'error',
                duration: 5 * 1000
              })
            }
          }).catch(() => {
            this.getVerify()
            Message({
              message: '验证码验证失败',
              type: 'error',
              duration: 5 * 1000
            })
          })
        } else {
          Message({
            message: '请填写完整的注册信息',
            type: 'warning',
            duration: 5 * 1000
          })
        }
      })
    },
    getVerify() {
      this.captchaLoading = true
      this.captchaDataUrl = ''
      fetchCaptchaJson()
        .then((res) => {
          if (res.code === 1 && res.data && res.data.imageBase64) {
            this.captchaId = res.data.captchaId
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
    showPwd2() {
      if (this.checkedPasswordType === 'password') {
        this.checkedPasswordType = ''
      } else {
        this.checkedPasswordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.checkedPassword.focus()
      })
    }
  }
}
</script>
