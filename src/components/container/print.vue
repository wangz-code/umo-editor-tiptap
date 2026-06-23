<template>
  <iframe ref="iframeRef" class="umo-print-iframe" :srcdoc="iframeCode" />
</template>

<script setup>

const container = inject('container')
const editor = inject('editor')
const printing = inject('printing')
const exportFile = inject('exportFile')
const getIframeCode = inject('getIframeCode')

const iframeRef = $ref(null)
let iframeCode = $ref('')

const printPage = () => {
  editor.value?.commands.blur()
  iframeCode = getIframeCode()

  const dialog = useConfirm({
    attach: container,
    theme: 'info',
    header: printing.value ? t('print.title') : t('export.pdf.title'),
    body: printing.value ? t('print.message') : t('export.pdf.message'),
    confirmBtn: printing.value ? t('print.confirm') : t('export.pdf.confirm'),
    onConfirm() {
      dialog.destroy()
      setTimeout(() => {
        if (iframeRef && iframeRef.contentWindow) {
          iframeRef.contentWindow.print()
        }
      }, 300)
    },
    onClosed() {
      printing.value = false
      exportFile.value.pdf = false
    },
  })
}

watch(
  () => [printing.value, exportFile.value.pdf],
  (value) => {
    if (!value[0] && !value[1]) {
      return
    }
    printPage()
  },
)

</script>

<style lang="less" scoped>
.umo-print-iframe {
  position: absolute;
  width: 0;
  height: 0;
  border: none;
  overflow: auto;
}
</style>
