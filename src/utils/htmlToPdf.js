// 导出页面为PDF格式
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'

/**
 * Vue 插件：在原型上挂载 getPdf，将 #pdfDom 区域导出为图片或 PDF。
 * 依赖组件 data：htmlTitle（文件名）、downType（true 为图片，false 为 pdf）。
 */
export default {
  /**
   * @param {import('vue').default} Vue Vue 构造函数
   * @param {object} [options] 预留插件选项
   */
  install(Vue, options) {
    /**
     * 截取 DOM 为 canvas，再导出图片或分页 PDF。
     * @this {Vue} 调用页面的 Vue 实例
     */
    Vue.prototype.getPdf = function() {
      var title = this.htmlTitle
      var type = this.downType
      var htmlID = document.getElementById('pdfDom')
      html2Canvas(htmlID, {
        allowTaint: true,
        dpi: window.devicePixelRatio * 4,
        scale: 4,
        useCORS: true
      }).then(function(canvas) {
        const contentWidth = canvas.width
        const contentHeight = canvas.height

        const pageHeight = contentWidth / 592.28 * 841.89
        let leftHeight = contentHeight
        let position = 0
        const imgWidth = 592.28
        const imgHeight = 592.28 / contentWidth * contentHeight
        const pageData = canvas.toDataURL('image/jpeg', 1.0)

        if (type) {
          const el = document.createElement('a')
          el.href = pageData
          el.download = title
          const event = new MouseEvent('click')
          el.dispatchEvent(event)
        } else {
          const PDF = new JsPDF('l', 'pt', 'a4')
          if (leftHeight < pageHeight) {
            PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
          } else {
            while (leftHeight > 0) {
              PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
              leftHeight -= pageHeight
              position -= 841.89
              if (leftHeight > 0) {
                PDF.addPage()
              }
            }
          }
          PDF.save(title + '.pdf')
        }
      })
    }
  }
}
