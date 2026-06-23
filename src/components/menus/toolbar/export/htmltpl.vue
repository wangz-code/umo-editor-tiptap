<!--
 * @Author: wangqz
 * @Date: 2026-06-23
 * @LastEditTime: 2026-06-23
 * @Description: content
-->
<template>
  <menus-button ico="html5" text="HTML模板" huge @menu-click="saveHtmlFile" />
</template>

<script setup>
import { saveAs } from 'file-saver'

const editor = inject('editor')
const options = inject('options')
const getIframeCode = inject('getIframeCode')


const saveHtmlFile = () => {
  if (!editor.value) {
    return
  }
  const blob = new Blob([getIframeCode({isTemplate:true})], {
    type: 'text/html;charset=utf-8',
  })
  const { title } = options.value.document
  const filename =
    title !== '' ? options.value.document?.title : t('document.untitled')
  saveAs(blob, `${filename}.html`)
}
</script>
