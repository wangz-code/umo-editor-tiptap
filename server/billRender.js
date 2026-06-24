/*
 * @Author: wangqz
 * @Date: 2026-06-23
 * @LastEditTime: 2026-06-24
 * @Description: UMO购货单模板变量填充渲染
 */
import { JSDOM } from 'jsdom'

/**
 * 填充购货单模板变量、循环商品明细行
 * @param {string} tplHtml 原始模板HTML
 * @param {object} headData 单据头部变量数据
 * @param {Array} goodsList 商品明细数组
 * @returns {string} 填充完成完整HTML
 */
export function renderBillTemplate(tplHtml, headData, goodsList) {
  const dom = new JSDOM(tplHtml)
  const { document } = dom.window

  let goodsTplTr = null
  let tableHeaderTr = null
  const emptyTrArr = []
  const allTr = document.querySelectorAll('tr')

  // 遍历区分：表头行、商品模板行、空白占位行
  for (const tr of allTr) {
    const trInner = tr.innerHTML
    // 匹配新版商品明细占位变量 $[umo.xxx]
    if (
      trInner.includes('$[umo.goodsname]') ||
      trInner.includes('$[umo.model]') ||
      trInner.includes('$[umo.actprice]') ||
      trInner.includes('$[umo.qty]') ||
      trInner.includes('$[umo.amount]')
    ) {
      goodsTplTr = tr
    }
    // 匹配新版表头文字：商品名称、规格型号、零售价、数量、金额
    else if (
      trInner.includes('商品名称') &&
      trInner.includes('规格型号') &&
      trInner.includes('零售价') &&
      trInner.includes('数量') &&
      trInner.includes('金额')
    ) {
      tableHeaderTr = tr
    }
    // 收集纯空白占位行，后续删除
    else {
      const text = tr.textContent.trim()
      if (text === '') {
        emptyTrArr.push(tr)
      }
    }
  }

  // 兜底容错，找不到关键行直接返回原模板
  if (!goodsTplTr || !tableHeaderTr) return tplHtml
  const tbody = goodsTplTr.closest('tbody')
  if (!tbody) return tplHtml

  // 删除模板原始行、所有空白占位行
  goodsTplTr.remove()
  emptyTrArr.forEach((tr) => tr.remove())

  // 循环生成商品明细行，插入表头下方
  let insertAnchor = tableHeaderTr
  goodsList.forEach((item) => {
    const newTr = goodsTplTr.cloneNode(true)
    let trHtml = newTr.innerHTML

    // 替换单行商品 $[umo.xxx] 变量
    trHtml = trHtml
      .replace(/\$\[umo\.goodsname\]/g, item.goodsname ?? '')
      .replace(/\$\[umo\.model\]/g, item.model ?? '')
      .replace(/\$\[umo\.actprice\]/g, item.actprice ?? '')
      .replace(/\$\[umo\.qty\]/g, item.qty ?? '')
      .replace(/\$\[umo\.amount\]/g, item.amount ?? '')

    newTr.innerHTML = trHtml
    insertAnchor.after(newTr)
    insertAnchor = newTr
  })

  // 序列化完整HTML（保留全部样式、head样式不丢失）
  let finalHtml = dom.serialize()

  // 【新版变量映射，全部 umo. 前缀】
  const variableMap = {
    'umo.billno': headData.billno ?? '',
    // 购货方信息
    'umo.custname': headData.custname ?? '',
    'umo.custtelephone': headData.custtelephone ?? '',
    // 供货方信息
    'umo.shopsname': headData.shopsname ?? '',
    'umo.createmobilephone': headData.createmobilephone ?? '',
    // 日期
    'umo.billdate': headData.billdate ?? '',
    'umo.deliverydatestr': headData.deliverydatestr ?? '',
    // 新增合计、付款字段
    'umo.actamountCN': headData.actamountCN ?? '',
    'umo.prepaidamtCN': headData.prepaidamtCN ?? '',
    'umo.prepaidamt': headData.prepaidamt ?? ''
  }

  // 全局正则替换所有 $[xxx] 变量
  finalHtml = finalHtml.replace(/\$\[([^\]]+)\]/g, (matched, varName) => {
    return variableMap[varName] ?? ''
  })

  return finalHtml
}

/**
 * 测试填充示例数据（可用于调试）
 * @param {string} html 原始模板HTML
 * @returns {string} 填充后HTML
 */
export const fillDemoData = (html) => {
  // 头部变量（适配umo前缀所有字段）
  const billHead = {
     billno: 'A1001010100',
    // 购货方
    custname: 'XX商贸有限公司',
    custtelephone: '13800138000',
    // 供货方
    shopsname: '供货门店',
    createmobilephone: '13900139000',
    // 日期
    billdate: '2026-06-23',
    deliverydatestr: '2026-06-26',
    // 金额字段
    actamountCN: '壹万捌仟贰佰玖拾柒元整',
    prepaidamtCN: '壹万元整',
    prepaidamt: '10000.00'
  }

  // 商品明细（仅保留当前表格需要字段）
  const goodsList = [
    {
      goodsname: 'Mate 60 Pro',
      model: '12+512G',
      actprice: '6999',
      qty: '2',
      amount: '13998',
    },
    {
      goodsname: '小米14',
      model: '16+1TB',
      actprice: '4299',
      qty: '1',
      amount: '4299',
    },
    {
      goodsname: '小米14',
      model: '16+1TB',
      actprice: '4299',
      qty: '1',
      amount: '4299',
    },
  ]

  const finalHtml = renderBillTemplate(html, billHead, goodsList)
  return finalHtml
}