<!--
 * @Author: wangqz
 * @Date: 2026-06-18
 * @LastEditTime: 2026-06-23
 * @Description: content
-->
<template>
  <menus-button
    ico="file-pdf"
    :text="t('print.previewPdf')"
    huge
    @menu-click="previewPDF"
  />
</template>

<script setup>
import { h } from 'vue'
import PDFObject from 'pdfobject'
const editor = inject('editor')
const container = inject('container')
const getIframeCode = inject('getIframeCode')

const generatePdf = async (htmlContent, options = {}) => {
  try {
    const response = await fetch('/api/htmlGenPdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        format: options.format || 'A4',
        printBackground:
          options.printBackground !== undefined
            ? options.printBackground
            : true,
        margin: options.margin || {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px',
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`PDF generation failed: ${response.status} ${errorText}`)
    }
    return response.blob()
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('生成PDF失败，请查看控制台错误信息')
    throw error
  }
}

// 生成html => dompdf.js => pdfobject 预览
const previewPDF = async () => {
  useMessage('loading', {
    attach: container,
    content: t('print.previewPdf'),
    closeBtn: true,
  })
  editor.value?.commands.blur()
  const iframeCode = getIframeCode()

  const blob = await generatePdf(iframeCode)
  const pdfurl = URL.createObjectURL(blob)
  const uniqueId = `pre-pdf-${Date.now()}`
  useAlert({
    attach: container,
    theme: 'info',
    width: '800px',
    footer: false,
    header: t('print.previewPdf'),
    body: () => {
      return h('div', { id: uniqueId, style: 'width:100%;height:800px;' }, '')
    },
    onOpened() {
      MessagePlugin.closeAll()
      PDFObject.embed(pdfurl, `#${uniqueId}`, {})
    },
    onClosed() {
      URL.revokeObjectURL(pdfurl)
    },
  })
}
</script>
