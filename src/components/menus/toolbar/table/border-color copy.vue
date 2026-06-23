<!--
 * @Author: wangqz
 * @Date: 2026-06-23
 * @LastEditTime: 2026-06-23
 * @Description: content
-->
<template>
  <menus-button
    ico="table"
    :text="t('table.borderColor')"
    menu-type="popup"
    huge
    :disabled="!editor?.can().setCellAttribute('borderColor', '')"
    :popup-visible="popupVisible"
    @toggle-popup="togglePopup"
  >
    <template #content>
      <!-- <t-space> -->
      <div>{{ t('table.cellBorderColor.cell') }}</div>
      <picker-color default-color="" @change="cellBorderColorChange" />
      <!-- </t-space> -->
      <!-- <t-divider size="5px" />
			<t-space direction="vertical">
				<div v-for="item in options">
					<t-space>
						<div>{{ item.label }}</div>
						<t-popup :attach="container" trigger="click" placement="right-bottom">
							<t-tag theme="primary" :color="item.color">{{ item.color }}</t-tag>
							<template #content>
								<t-card>
									<picker-color default-color="" @change="borderColorChange($event, item)" />
								</t-card>
							</template>
						</t-popup>
					</t-space>
				</div>
			</t-space> -->
    </template>
  </menus-button>
</template>

<script setup>
import { onMounted } from 'vue'

const emits = defineEmits(['change'])

const { popupVisible, togglePopup } = usePopup()
const editor = inject('editor')
const defaultColor = '#000'
const options = [
  {
    value: 'borderTop',
    label: t('table.cellBorderColor.top'),
    color: defaultColor,
  },
  {
    value: 'borderBottom',
    label: t('table.cellBorderColor.bottom'),
    color: defaultColor,
  },
  {
    value: 'borderLeft',
    label: t('table.cellBorderColor.left'),
    color: defaultColor,
  },
  {
    value: 'borderRight',
    label: t('table.cellBorderColor.right'),
    color: defaultColor,
  },
]

const setCellAttribute = (key, value) => {
  editor.value?.chain().focus().setCellAttribute(key, value).run()
}

const cellBorderColorChange = (color) => {
  popupVisible.value = false
  const borderColor = color === '' ? null : color
  for (const opt of options) {
    setCellAttribute(`${opt.value}Color`, borderColor)
  }
}

const borderColorChange = (color, record) => {
  record.color = color
  const borderColor = color === '' ? null : color
  setCellAttribute(`${record.value}Color`, borderColor)
}

onMounted(() => {
  console.log('editor.value log==>', editor.value)

  window.editor = editor.value
})
</script>
