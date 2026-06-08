/**
 * 入库费规则数据 - 本地预览（无fetch依赖）
 * 数据来源：data/inbound-fee-rule-data.json
 */
const inboundFeeRuleData = {
  "categories": [
    {
      "id": "cat_1",
      "name": "整柜入库",
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
        },
        {
          "id": "sub_1_2",
          "name": "入库附加费",
          "parentId": "cat_1",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_1_2_1",
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
            },
            {
              "id": "rule_1_2_2",
              "feeItem": "入库附加费",
              "subCategory": "超重费",
              "unit": "箱",
              "tierPricing": [
                { "start": 35, "end": 45, "price": 0.5 },
                { "start": 45, "end": 999999, "price": 1.0 }
              ],
              "condition": "单箱重量超过35kg时收取超重费，按重量阶梯计费",
              "calculationExample": "若单箱重量为50kg：\n超重费：1.0元/箱",
              "level": 3, "type": "rule", "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "updater": "admin", "updateTime": "2025-07-22 11:00:00"
            },
            {
              "id": "rule_1_2_3",
              "feeItem": "入库附加费",
              "subCategory": "清单费",
              "unit": "票",
              "tierPricing": [
                { "start": 0, "end": 100, "price": 50 },
                { "start": 101, "end": 500, "price": 80 },
                { "start": 501, "end": 999999, "price": 120 }
              ],
              "condition": "需要提供详细清单服务时收取，按货物数量阶梯计费",
              "calculationExample": "若货物数量为300件：\n清单费：80元/票",
              "level": 3, "type": "rule", "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "updater": "admin", "updateTime": "2025-07-22 11:30:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_3",
      "name": "托盘入库",
      "feeGroup": "入库",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_3_1",
          "name": "卸货费",
          "parentId": "cat_3",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_3_1_1",
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
        },
        {
          "id": "sub_3_2",
          "name": "入库附加费",
          "parentId": "cat_3",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_3_2_1",
              "feeItem": "入库附加费",
              "subCategory": "拆拖",
              "unit": "托",
              "tierPricing": [
                { "start": 0, "end": 5, "price": 20 },
                { "start": 6, "end": 20, "price": 18 },
                { "start": 21, "end": 50, "price": 15 },
                { "start": 51, "end": 999999, "price": 12 }
              ],
              "condition": "需要拆除托盘包装时收取，按托盘数量阶梯计费",
              "calculationExample": "若拆拖30个托盘：\n前5个：5 × 20 = 100元\n第6-20个：15 × 18 = 270元\n第21-30个：10 × 15 = 150元\n总计：520元",
              "level": 3, "type": "rule", "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "updater": "admin", "updateTime": "2025-07-22 16:30:00"
            },
            {
              "id": "rule_3_2_2",
              "feeItem": "入库附加费",
              "subCategory": "分货",
              "unit": "件",
              "tierPricing": [
                { "start": 0, "end": 200, "price": 0.8 },
                { "start": 201, "end": 500, "price": 0.6 },
                { "start": 501, "end": 1000, "price": 0.5 },
                { "start": 1001, "end": 999999, "price": 0.4 }
              ],
              "condition": "托盘货物需要按SKU分拣时收取，按件数阶梯计费",
              "calculationExample": "若分货800件：\n前200件：200 × 0.8 = 160元\n第201-500件：300 × 0.6 = 180元\n第501-800件：300 × 0.5 = 150元\n总计：490元",
              "level": 3, "type": "rule", "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "updater": "admin", "updateTime": "2025-07-22 17:00:00"
            },
            {
              "id": "rule_3_2_3",
              "feeItem": "入库附加费",
              "subCategory": "超重",
              "unit": "托",
              "tierPricing": [
                { "start": 500, "end": 800, "price": 10 },
                { "start": 801, "end": 1200, "price": 15 },
                { "start": 1201, "end": 999999, "price": 20 }
              ],
              "condition": "单托重量超过500kg时收取超重费，按重量阶梯计费",
              "calculationExample": "若单托重量为1000kg：\n超重费：15元/托",
              "level": 3, "type": "rule", "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "updater": "admin", "updateTime": "2025-07-22 17:30:00"
            },
            {
              "id": "rule_3_2_4",
              "feeItem": "入库附加费",
              "subCategory": "清点",
              "unit": "件",
              "tierPricing": [
                { "start": 0, "end": 100, "price": 0.3 },
                { "start": 101, "end": 500, "price": 0.25 },
                { "start": 501, "end": 1000, "price": 0.2 },
                { "start": 1001, "end": 999999, "price": 0.15 }
              ],
              "condition": "需要清点货物数量时收取，按件数阶梯计费",
              "calculationExample": "若清点600件货物：\n前100件：100 × 0.3 = 30元\n第101-500件：400 × 0.25 = 100元\n第501-600件：100 × 0.2 = 20元\n总计：150元",
              "level": 3, "type": "rule", "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "updater": "admin", "updateTime": "2025-07-22 18:00:00"
            },
            {
              "id": "rule_3_2_5",
              "feeItem": "入库附加费",
              "subCategory": "SKU超重费",
              "unit": "个",
              "tierPricing": [
                { "start": 0, "end": 5, "price": 0 },
                { "start": 6, "end": 15, "price": 20 },
                { "start": 16, "end": 30, "price": 15 },
                { "start": 31, "end": 999999, "price": 10 }
              ],
              "condition": "托盘入库SKU数量超过免费数量时收取，按阶梯价格计费",
              "calculationExample": "若SKU数量为25个：\n前5个免费\n第6-15个：10个 × 20元 = 200元\n第16-25个：10个 × 15元 = 150元\n总计：350元",
              "level": 3, "type": "rule", "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "updater": "admin", "updateTime": "2025-07-22 18:30:00"
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "version": "3.2",
    "description": "入库费规则树形结构数据 - 包含整柜入库、托盘入库两大分类",
    "lastUpdated": "2026-06-08",
    "totalCategories": 2,
    "totalOperations": 4,
    "totalRules": 9
  }
};
