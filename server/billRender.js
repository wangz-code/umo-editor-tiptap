/*
 * @Author: wangqz
 * @Date: 2026-06-23
 * @LastEditTime: 2026-06-23
 * @Description: content
 */
import { JSDOM } from 'jsdom'

/**
 * 填充变量
 * @param {*} tplHtml
 * @param {*} headData
 * @param {*} goodsList
 * @returns
 */
export function renderBillTemplate(tplHtml, headData, goodsList) {
  const dom = new JSDOM(tplHtml)
  const { document } = dom.window

  let goodsTplTr = null
  let tableHeaderTr = null
  const emptyTrArr = []
  const allTr = document.querySelectorAll('tr')

  // 遍历区分表头、商品模板行、空占位行
  for (const tr of allTr) {
    const trInner = tr.innerHTML
    // 匹配商品模板行
    if (
      trInner.includes('$[spmx.brandname]') ||
      trInner.includes('$[spmx.goodsname]')
    ) {
      goodsTplTr = tr
    }
    // 匹配你的表头文字，精准定位表头行
    else if (
      trInner.includes('品牌/商品名称') &&
      trInner.includes('规格型号')
    ) {
      tableHeaderTr = tr
    }
    // 收集空白占位行
    else {
      const text = tr.textContent.trim()
      if (text === '') {
        emptyTrArr.push(tr)
      }
    }
  }

  // 容错兜底
  if (!goodsTplTr || !tableHeaderTr) return tplHtml
  const tbody = goodsTplTr.closest('tbody')
  if (!tbody) return tplHtml

  // 删除原始模板行、所有空白占位行
  goodsTplTr.remove()
  emptyTrArr.forEach((tr) => tr.remove())

  // 循环插入：在表头后面依次追加商品行
  let insertAnchor = tableHeaderTr
  goodsList.forEach((item) => {
    const newTr = goodsTplTr.cloneNode(true)
    let trHtml = newTr.innerHTML

    trHtml = trHtml
      .replace(/\$\[spmx\.brandname\]/g, item.brandname ?? '')
      .replace(/\$\[spmx\.goodsname\]/g, item.goodsname ?? '')
      .replace(/\$\[spmx\.standard\]/g, item.standard ?? '')
      .replace(/\$\[spmx\.model\]/g, item.model ?? '')
      .replace(/\$\[spmx\.actprice\]/g, item.actprice ?? '')
      .replace(/\$\[spmx\.qty\]/g, item.qty ?? '')
      .replace(/\$\[spmx\.amount\]/g, item.amount ?? '')

    newTr.innerHTML = trHtml
    insertAnchor.after(newTr)
    insertAnchor = newTr
  })

  // ========== 修复样式丢失核心：序列化整个完整HTML，包含head所有样式 ==========
  let finalHtml = dom.serialize()

  // 变量映射配置
  const variableMap = {
    billno: headData.billno ?? '',
    custname: headData.custname ?? '',
    custtelephone: headData.custtelephone ?? '',
    shopsname: headData.shopsname ?? '',
    createmobilephone: headData.createmobilephone ?? '',
    billdate: headData.billdate ?? '',
    deliverydatestr: headData.deliverydatestr ?? '',
    deliverystylename: headData.deliverystylename ?? '',
    deliveryyaddress: headData.deliveryyaddress ?? '',
    address: headData.address ?? '',
    printcount: headData.printcount ?? '',
  }

  // 全局统一替换模板变量，不会破坏base64内容
  finalHtml = finalHtml.replace(/\$\[([^\]]+)\]/g, (matched, varName) => {
    return variableMap[varName] ?? ''
  })

  return finalHtml
}

export const fillDemoData = (html) => {
  // 2. 业务数据
  const billHead = {
    billno: 'DD202606230001',
    custname: 'XX商贸有限公司',
    custtelephone: '13800138000',
    shopsname: '供货门店',
    createmobilephone: '13900139000',
    billdate: '2026-06-23',
    deliverydatestr: '2026-06-26',
    deliverystylename: '送货上门',
    deliveryyaddress: '浙江省杭州市余杭区未来科技城文一西路 1500 号',
    address: '上海市浦东新区张江高科技园区博云路 6 号',
    printcount: '1',
    cashrecord: '支付宝',
  }
  const goodsList = [
    {
      brandname: '华为',
      goodsname: 'Mate 60 Pro',
      standard: '国行',
      model: '12+512G',
      actprice: '6999',
      qty: '2',
      amount: '13998',
    },
    {
      brandname: '小米',
      goodsname: '小米14',
      standard: '全网通',
      model: '16+1TB',
      actprice: '4299',
      qty: '1',
      amount: '4299',
    },
    {
      brandname: '小米',
      goodsname: '小米14',
      standard: '全网通',
      model: '16+1TB',
      actprice: '4299',
      qty: '1',
      amount: '4299',
    },
    {
      brandname: '小米',
      goodsname: '小米14',
      standard: '全网通',
      model: '16+1TB',
      actprice: '4299',
      qty: '1',
      amount: '4299',
    },
  ]

  // 渲染得到填充完毕的内存HTML字符串
  const finalHtml = renderBillTemplate(html, billHead, goodsList)
  return finalHtml
}
