import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table/cell'
import { TableHeader } from '@tiptap/extension-table/header'
import { TableRow } from '@tiptap/extension-table/row'

// 扩展表格能力
const CustomTable = Table.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: 'umo-node-table',
      },
      allowTableNodeSelection: true,
      resizable: true,
    }
  },
})

/**
 * 生成单边样式解析配置
 * @param {string} side 方向 top / right / bottom / left
 * @param {boolean} isColor 是否是 *-color 单独颜色属性
 * @returns 配置对象 { default, parseHTML, renderHTML }
 */
const sides = ['top', 'right', 'bottom', 'left']
const borderConfig = {}
const createBorderPropConfig = (side, isColor = false) => {
  const propName = isColor ? `border-${side}-color` : `border-${side}`
  const fieldKey = isColor
    ? `border${side.charAt(0).toUpperCase() + side.slice(1)}Color`
    : `border${side.charAt(0).toUpperCase() + side.slice(1)}`
  return {
    default: null,
    parseHTML: (element) => {
      const inlineStyle = element.getAttribute('style') || ''
      // 正则：匹配属性名: 任意空格 + 捕获值直到分号结束，忽略大小写
      const reg = new RegExp(`${propName}\\s*:\\s*([^;]+)`, 'i')
      const match = inlineStyle.match(reg)
      return match ? match[1].trim() : null
    },
    renderHTML: (data) => {
      const value = data[fieldKey]
      if (!value) return {}
      return {
        style: `${propName}: ${value}`,
      }
    },
  }
}
// 1. 生成 borderTop / borderRight / borderBottom / borderLeft 简写属性
sides.forEach((side) => {
  const key = `border${side.charAt(0).toUpperCase() + side.slice(1)}`
  borderConfig[key] = createBorderPropConfig(side, false)
})

// 2. 生成 borderTopColor / borderRightColor / borderBottomColor / borderLeftColor 单色属性
sides.forEach((side) => {
  const key = `border${side.charAt(0).toUpperCase() + side.slice(1)}Color`
  borderConfig[key] = createBorderPropConfig(side, true)
})

// 扩展单元格
const TableCellOptions = {
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: (element) => element.getAttribute('align') || null,
        renderHTML: ({ align }) => ({ align }),
      },
      background: {
        default: null,
        parseHTML: (element) => {
          const style = element.getAttribute('style') || ''
          const match = style.match(/background(?:-color)?:\s*([^;]+)/i)
          return match ? match[1].trim() : null
        },
        renderHTML: ({ background }) => {
          return background ? { style: `background-color: ${background}` } : {}
        },
      },
      color: {
        default: null,
        parseHTML: (element) => {
          const style = element.getAttribute('style') || ''
          const match = style.match(/(?<!background-)color:\s*([^;]+)/i)
          if (style.includes('background-color')) return null
          return match ? match[1].trim() : null
        },
        renderHTML: ({ color }) => {
          return color ? { style: `color: ${color}` } : {}
        },
      },
      ...borderConfig,
    }
  },
}

const CustomTableHeader = TableHeader.extend(TableCellOptions)
const CustomTableCell = TableCell.extend(TableCellOptions)

export {
  CustomTable as Table,
  CustomTableCell as TableCell,
  CustomTableHeader as TableHeader,
  TableRow,
}
