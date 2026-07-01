/**
 * 浏览器端 MediaPipe Face Detection（CDN 按需加载），用于监考离屏/无人/多人检测。
 */
let faceDetector = null
let monitorTimer = null
let lastState = 'OK'

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('加载 MediaPipe 失败'))
    document.head.appendChild(s)
  })
}

export async function initFaceDetector() {
  if (faceDetector) return faceDetector
  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js')
  const FaceDetection = window.FaceDetection
  if (!FaceDetection) {
    throw new Error('FaceDetection 未就绪')
  }
  faceDetector = new FaceDetection({
    locateFile: file =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
  })
  faceDetector.setOptions({
    model: 'short',
    minDetectionConfidence: 0.5
  })
  await faceDetector.initialize()
  return faceDetector
}

function classifyFaces(faces, videoEl) {
  if (!faces || faces.length === 0) {
    return { state: 'NO_FACE', detail: '未检测到人脸' }
  }
  if (faces.length > 1) {
    return { state: 'MULTIPLE_FACES', detail: `检测到 ${faces.length} 张人脸` }
  }
  const box = faces[0].boundingBox
  if (!box || !videoEl) {
    return { state: 'OK', detail: '' }
  }
  const vw = videoEl.videoWidth || 640
  const vh = videoEl.videoHeight || 480
  const cx = (box.xCenter || 0) * vw
  const cy = (box.yCenter || 0) * vh
  const marginX = vw * 0.22
  const marginY = vh * 0.22
  if (cx < marginX || cx > vw - marginX || cy < marginY || cy > vh - marginY) {
    return { state: 'FACE_AWAY', detail: '人脸偏离画面中心' }
  }
  return { state: 'OK', detail: '' }
}

/**
 * @param {HTMLVideoElement} videoEl
 * @param {{ onStateChange?: (state: string, detail?: string) => void }} callbacks
 */
export function startFaceMonitor(videoEl, callbacks = {}) {
  stopFaceMonitor()
  if (!faceDetector || !videoEl) return
  const onStateChange = callbacks.onStateChange || (() => {})
  monitorTimer = setInterval(async () => {
    if (!videoEl.videoWidth) return
    try {
      await faceDetector.send({ image: videoEl })
      const results = faceDetector._lastResults || { detections: [] }
      const faces = results.detections || []
      const { state, detail } = classifyFaces(faces, videoEl)
      if (state !== lastState) {
        if (state === 'OK' && lastState !== 'OK') {
          onStateChange('FACE_RETURN', '人脸已恢复')
        } else if (state !== 'OK') {
          onStateChange(state, detail)
        }
        lastState = state
      }
    } catch (e) {
      /* 单帧失败忽略 */
    }
  }, 2000)
  faceDetector.onResults(results => {
    faceDetector._lastResults = results
  })
}

export function stopFaceMonitor() {
  if (monitorTimer) {
    clearInterval(monitorTimer)
    monitorTimer = null
  }
  lastState = 'OK'
}
