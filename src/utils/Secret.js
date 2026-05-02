import CryptoJS from 'crypto-js'

const KEY = CryptoJS.enc.Utf8.parse('63eeac68cf074c8c')
const IV = CryptoJS.enc.Utf8.parse('63eeac68cf074c8c')

/**
 * AES(CBC/ZeroPadding) 加密，默认内置 KEY/IV，也可传入自定义密钥与向量。
 * @param {string} word 明文
 * @param {string} [keyStr] 可选密钥字符串（UTF-8）
 * @param {string} [ivStr] 可选 IV 字符串（UTF-8）
 * @returns {string} Base64 密文
 */
export function Encrypt(word, keyStr, ivStr) {
  let key = KEY
  let iv = IV
  if (keyStr) {
    key = CryptoJS.enc.Utf8.parse(keyStr)
    iv = CryptoJS.enc.Utf8.parse(ivStr)
  }
  const srcs = CryptoJS.enc.Utf8.parse(word)
  var encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding
  })
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
}

/**
 * AES(CBC/ZeroPadding) 解密。
 * @param {string} word Base64 密文
 * @param {string} [keyStr] 可选密钥
 * @param {string} [ivStr] 可选 IV
 * @returns {string} UTF-8 明文
 */
export function Decrypt(word, keyStr, ivStr) {
  let key = KEY
  let iv = IV

  if (keyStr) {
    key = CryptoJS.enc.Utf8.parse(keyStr)
    iv = CryptoJS.enc.Utf8.parse(ivStr)
  }

  const base64 = CryptoJS.enc.Base64.parse(word)
  const src = CryptoJS.enc.Base64.stringify(base64)

  const decrypt = CryptoJS.AES.decrypt(src, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding
  })

  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
  return decryptedStr.toString()
}
