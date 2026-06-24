export const iframeCodeFn = (page, options, container) => {
  const getStylesHtml = () => {
    return Array.from(document.querySelectorAll('link, style'))
      .map((item) => item.outerHTML)
      .join('')
  }

  const getPlyrSprite = () => {
    return document.querySelector('#sprite-plyr')?.innerHTML || ''
  }

  const getContentHtml = () => {
    const originalContent =
      document.querySelector(`${container} .umo-page-content`)?.outerHTML || ''
    return prepareEchartsForPrint(originalContent)
  }
  const prepareEchartsForPrint = (htmlContent) => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    const charts = tempDiv.querySelectorAll('.umo-node-echarts-body')
    for (const chartElement of charts) {
      const chartInstance = echarts.getInstanceByDom(chartElement)
      if (chartInstance) {
        const imgData = chartInstance.getDataURL({
          type: 'png', // 可以是'png'或'jpeg'
          pixelRatio: 2, // 提高分辨率，默认是1//分辨率太高会慢
          backgroundColor: '#fff', // 背景颜色，默认是透明
        })
        const imgElement = document.createElement('img')
        imgElement.src = imgData
        imgElement.style.width = '100%' // 确保图片宽度适合容器，根据实际情况调整
        if (chartElement && chartElement.parentNode) {
          chartElement.parentNode.replaceChild(imgElement, chartElement)
        }
      }
    }
    return tempDiv.innerHTML
  }

  const defaultLineHeight = $computed(
    () => options.value.dicts?.lineHeights.find((item) => item.default)?.value,
  )

  const genIframeCode = () => {
    const { orientation, size, margin, background } = page.value
    return `
      <!DOCTYPE html>
      <html lang="zh-CN" theme-mode="${options.value.theme}">
      <head>
        <title>${options.value.document?.title}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${getStylesHtml()}
        <style>
        html{
          margin: 0;
          padding: 0;
          overflow: visible;
        }
        body{
          margin: 0;
          padding: 0;
          background-color: ${background};
          -webkit-print-color-adjust: exact;
        }
        .umo-editor-container{
          background-color: ${background} !important;
        }
        .umo-page-content{
          transform: scale(1) !important;
          overflow: hidden;
        }
        @page {
          size: ${orientation === 'portrait' ? size?.width : size?.height}cm ${orientation === 'portrait' ? size?.height : size?.width}cm;
          padding: ${margin?.top}cm 0 ${margin?.bottom}cm;
          margin: 0;
          background-color: ${background};
        }
        @page:first {
          padding-top: 0;
        }
        @page:last {
          padding-bottom: 0;
          page-break-after: avoid;
        }
        </style>
      </head>
      <body class="is-print">
        <div id="sprite-plyr" style="display: none;">
        ${getPlyrSprite()}
        </div>
        <div class="umo-editor-container" style="line-height: ${defaultLineHeight};" aria-expanded="false">
          <div class="tiptap umo-editor" translate="no">
            ${getContentHtml()}
          </div>
        </div>
        <script>
          document.addEventListener("DOMContentLoaded", (event) => {
            const observer = new MutationObserver(mutations => {
              mutations.forEach(mutation => {
                if (mutation.removedNodes) {
                  Array.from(mutation.removedNodes).forEach(node => {
                    if (node?.classList?.contains('umo-page-watermark')) {
                      location.reload();
                    }
                  });
                }
              });
            });
          });
        </script>
      </body>
      </html>`
    /* eslint-enable */
  }

  return genIframeCode
}
