/**
 * 入库费规则数据 - 本地预览（无fetch依赖）
 * 数据来源：data/inbound-fee-rule-data.json
 */
const inboundFeeRuleData = {
  "categories": [
    {
      "id": "cat_1",
      "name": "卸货费（整柜）",
      "feeGroup": "入库",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_1_1",
          "name": "卸柜费",
          "parentId": "cat_1",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_1_1_1",
              "feeItem": "卸货费",
              "unit": "柜",
              "pricingRules": [
                { "spec": "20GP", "price": 300.0, "remark": "最多700个纸箱，超出部分，0.3/箱" },
                { "spec": "40HQ", "price": 450.0, "remark": "最多1000纸箱以内，超出部分，0.3/箱" },
                { "spec": "45HQ", "price": 500.0, "remark": "最多1200纸箱以内，超出部分，0.3/箱" }
              ],
              "calculationExample": "客户入库一个40HQ到美国海外仓，共1500箱，20个SKU，超过45公斤共100箱，所产生的费用为：\n卸柜费：450+(1500-1000)*0.3\n超额重：100*1\nSKU超额费：(20-5)*10",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "updater": "admin",
              "updateTime": "2025-07-22 10:00:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_2",
      "name": "卸货费（散货）",
      "feeGroup": "入库",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_2_1",
          "name": "卸货费",
          "parentId": "cat_2",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_2_1_1",
              "feeItem": "卸货费",
              "unit": "托",
              "pricingRules": [
                { "spec": "标准托盘", "price": 25.0, "remark": "标准尺寸托盘" },
                { "spec": "欧标托盘", "price": 30.0, "remark": "欧洲标准托盘" },
                { "spec": "美标托盘", "price": 35.0, "remark": "美国标准托盘" },
                { "spec": "定制托盘", "price": 40.0, "remark": "非标准尺寸托盘" }
              ],
              "calculationExample": "客户入库10个标准托盘：\n卸货费：25 × 10 = 250元",
              "level": 3, "type": "rule", "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "updater": "admin", "updateTime": "2025-07-22 16:00:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_3",
      "name": "附加费（整柜）-SKU 超量费",
      "feeGroup": "入库",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_3_1",
          "name": "入库附加费",
          "parentId": "cat_3",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_3_1_1",
              "feeItem": "入库附加费",
              "subCategory": "SKU超量费",
              "unit": "个",
              "tierPricing": [
                { "start": 0, "end": 5, "price": 0 },
                { "start": 6, "end": 10, "price": 10 },
                { "start": 11, "end": 20, "price": 8 },
                { "start": 21, "end": 999999, "price": 5 }
              ],
              "condition": "此费用以SKU数量为维度进行收取，超过免费数量后按阶梯价格收费",
              "calculationExample": "若SKU数量为20个：\n前5个免费\n第6-10个：5个 × 10元 = 50元\n第11-20个：10个 × 8元 = 80元\n总计：50 + 80 = 130元",
              "level": 3, "type": "rule", "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "updater": "admin", "updateTime": "2025-07-22 10:30:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_4",
      "name": "附加费（散货）-SKU 超量费",
      "feeGroup": "入库",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_4_1",
          "name": "入库附加费",
          "parentId": "cat_4",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_4_1_1",
              "feeItem": "入库附加费",
              "subCategory": "SKU超量费",
              "unit": "个",
              "tierPricing": [
                { "start": 0, "end": 5, "price": 0 },
                { "start": 6, "end": 10, "price": 10 },
                { "start": 11, "end": 20, "price": 8 },
                { "start": 21, "end": 999999, "price": 5 }
              ],
              "condition": "此费用以SKU数量为维度进行收取，超过免费数量后按阶梯价格收费",
              "calculationExample": "若SKU数量为20个：\n前5个免费\n第6-10个：5个 × 10元 = 50元\n第11-20个：10个 × 8元 = 80元\n总计：50 + 80 = 130元",
              "level": 3, "type": "rule", "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "updater": "admin", "updateTime": "2025-07-22 10:30:00"
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "version": "4.0",
    "description": "入库费规则树形结构数据 - 包含卸货费（整柜）、卸货费（散货）、附加费（整柜）-SKU 超量费、附加费（散货）-SKU 超量费四大分类",
    "lastUpdated": "2026-06-09",
    "totalCategories": 4,
    "totalOperations": 4,
    "totalRules": 4
  }
};
