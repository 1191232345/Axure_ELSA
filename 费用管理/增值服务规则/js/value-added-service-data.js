/**
 * 增值服务规则数据 - 本地预览（无fetch依赖）
 * 数据来源：PART4 增值业务（全部采用阶梯收费模式）
 */
const valueAddedServiceData = {
  "categories": [
    {
      "id": "cat_1",
      "name": "退货入库",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_1_1",
          "name": "退货入库费",
          "parentId": "cat_1",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_1_1_1",
              "feeItem": "退货入库费",
              "unit": "票",
              "tierPricing": [
                { "start": 0, "end": 10, "price": 5.0 },
                { "start": 10, "end": 30, "price": 8.0 },
                { "start": 30, "end": 60, "price": 12.0 },
                { "start": 60, "end": 999999, "price": 18.0 }
              ],
              "condition": "按毛重分档计费，单位：KG",
              "calculationExample": "客户退货入库一票货物，毛重25KG：\n费用：8元/KG × 25KG = 200元\n（落在10-30KG档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 09:00:00",
              "updater": "admin",
              "updateTime": "2025-07-22 09:00:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_2",
      "name": "商品上架",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_2_1",
          "name": "上架服务费",
          "parentId": "cat_2",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_2_1_1",
              "feeItem": "商品上架费",
              "subCategory": "单件/箱货物上架",
              "unit": "件",
              "tierPricing": [
                { "start": 0, "end": 50, "price": 2.0 },
                { "start": 50, "end": 200, "price": 1.8 },
                { "start": 200, "end": 500, "price": 1.5 },
                { "start": 500, "end": 999999, "price": 1.2 }
              ],
              "calculationExample": "客户需上架100件标准货物：\n费用：1.8元/件 × 100 = 180元\n（落在50-200件档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 09:15:00",
              "updater": "admin",
              "updateTime": "2025-07-22 09:15:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_3",
      "name": "仓储费",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_3_1",
          "name": "未上架仓储费",
          "parentId": "cat_3",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_3_1_1",
              "feeItem": "仓储费",
              "subCategory": "未上架仓储",
              "unit": "天",
              "tierPricing": [
                { "start": 0, "end": 7, "price": 0.5 },
                { "start": 7, "end": 15, "price": 0.4 },
                { "start": 15, "end": 30, "price": 0.3 },
                { "start": 30, "end": 999999, "price": 0.2 }
              ],
              "condition": "仅针对未完成上架操作的货物，存放天数越长单价越低",
              "calculationExample": "货物在仓库未上架存放10天：\n仓储费：0.4元/天 × 10 = 4元\n（落在7-15天档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 09:30:00",
              "updater": "admin",
              "updateTime": "2025-07-22 09:30:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_4",
      "name": "产品销毁费",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_4_1",
          "name": "销毁服务费",
          "parentId": "cat_4",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_4_1_1",
              "feeItem": "产品销毁费",
              "unit": "次",
              "tierPricing": [
                { "start": 0, "end": 50, "price": 50.0 },
                { "start": 50, "end": 100, "price": 80.0 },
                { "start": 100, "end": 500, "price": 120.0 },
                { "start": 500, "end": 999999, "price": 180.0 }
              ],
              "condition": "按重量分档（LB），每次销毁操作收费",
              "calculationExample": "销毁一批重量为60LB的货物：\n销毁费：80元（落在50-100LB档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 09:45:00",
              "updater": "admin",
              "updateTime": "2025-07-22 09:45:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_5",
      "name": "拆托",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_5_1",
          "name": "拆托服务费",
          "parentId": "cat_5",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_5_1_1",
              "feeItem": "拆托费",
              "unit": "托",
              "tierPricing": [
                { "start": 0, "end": 10, "price": 15.0 },
                { "start": 10, "end": 50, "price": 20.0 },
                { "start": 50, "end": 100, "price": 18.0 },
                { "start": 100, "end": 999999, "price": 16.0 }
              ],
              "calculationExample": "客户需要拆托20个标准托盘：\n拆托费：20元 × 20 = 400元\n（落在10-50托档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 10:00:00",
              "updater": "admin",
              "updateTime": "2025-07-22 10:00:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_6",
      "name": "开箱费",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_6_1",
          "name": "开箱服务费",
          "parentId": "cat_6",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_6_1_1",
              "feeItem": "开箱费",
              "unit": "箱",
              "tierPricing": [
                { "start": 0, "end": 10, "price": 3.0 },
                { "start": 10, "end": 50, "price": 2.5 },
                { "start": 50, "end": 100, "price": 2.0 },
                { "start": 100, "end": 999999, "price": 1.8 }
              ],
              "calculationExample": "客户要求开箱20个标准箱子：\n开箱费：2.5元/箱 × 20 = 50元\n（落在10-50箱档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 10:15:00",
              "updater": "admin",
              "updateTime": "2025-07-22 10:15:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_7",
      "name": "封箱费",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_7_1",
          "name": "封箱服务费",
          "parentId": "cat_7",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_7_1_1",
              "feeItem": "封箱费",
              "subCategory": "重新封箱（不取出）",
              "unit": "箱",
              "tierPricing": [
                { "start": 0, "end": 10, "price": 2.0 },
                { "start": 10, "end": 50, "price": 1.8 },
                { "start": 50, "end": 100, "price": 1.5 },
                { "start": 100, "end": 999999, "price": 1.3 }
              ],
              "calculationExample": "重新封箱20箱（不取出货物）：\n封箱费：1.8元/箱 × 20 = 36元\n（落在10-50箱档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 10:30:00",
              "updater": "admin",
              "updateTime": "2025-07-22 10:30:00"
            },
            {
              "id": "rule_7_1_2",
              "feeItem": "封箱费",
              "subCategory": "取出+装箱+重新封箱",
              "unit": "箱",
              "tierPricing": [
                { "start": 0, "end": 10, "price": 5.0 },
                { "start": 10, "end": 50, "price": 4.5 },
                { "start": 50, "end": 100, "price": 4.0 },
                { "start": 100, "end": 999999, "price": 3.5 }
              ],
              "condition": "仅限一箱一件，一箱多件费用另确认",
              "calculationExample": "取出货物后重新装箱封箱20箱（一箱一件）：\n封箱费：4.5元/箱 × 20 = 90元\n（落在10-50箱档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 10:35:00",
              "updater": "admin",
              "updateTime": "2025-07-22 10:35:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_8",
      "name": "拍照服务",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_8_1",
          "name": "拍照服务费",
          "parentId": "cat_8",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_8_1_1",
              "feeItem": "拍照服务费",
              "subCategory": "产品拍照（外箱）",
              "unit": "张",
              "tierPricing": [
                { "start": 0, "end": 10, "price": 2.0 },
                { "start": 10, "end": 50, "price": 1.5 },
                { "start": 50, "end": 100, "price": 1.2 },
                { "start": 100, "end": 999999, "price": 1.0 }
              ],
              "calculationExample": "拍摄产品外箱照片30张：\n拍照费：1.5元/张 × 30 = 45元\n（落在10-50张档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 10:45:00",
              "updater": "admin",
              "updateTime": "2025-07-22 10:45:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_9",
      "name": "丈量过磅",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_9_1",
          "name": "丈量过磅费",
          "parentId": "cat_9",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_9_1_1",
              "feeItem": "丈量过磅费",
              "unit": "次",
              "tierPricing": [
                { "start": 0, "end": 10, "price": 5.0 },
                { "start": 10, "end": 50, "price": 4.5 },
                { "start": 50, "end": 100, "price": 4.0 },
                { "start": 100, "end": 999999, "price": 3.5 }
              ],
              "calculationExample": "对20件货物进行标准丈量过磅：\n费用：4.5元/次 × 20 = 90元\n（落在10-50次档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 11:00:00",
              "updater": "admin",
              "updateTime": "2025-07-22 11:00:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_10",
      "name": "打绷带",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_10_1",
          "name": "打绷带服务费",
          "parentId": "cat_10",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_10_1_1",
              "feeItem": "打绷带费",
              "unit": "次",
              "tierPricing": [
                { "start": 0, "end": 10, "price": 15.0 },
                { "start": 10, "end": 50, "price": 14.0 },
                { "start": 50, "end": 100, "price": 13.0 },
                { "start": 100, "end": 999999, "price": 12.0 }
              ],
              "calculationExample": "打绷带20次（含人工+材料）：\n费用：14元/次 × 20 = 280元\n（落在10-50次档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 11:15:00",
              "updater": "admin",
              "updateTime": "2025-07-22 11:15:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_11",
      "name": "纸箱费",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_11_1",
          "name": "纸箱采购费",
          "parentId": "cat_11",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_11_1_1",
              "feeItem": "纸箱费",
              "unit": "个",
              "tierPricing": [
                { "start": 0, "end": 10, "price": 5.0 },
                { "start": 10, "end": 50, "price": 4.0 },
                { "start": 50, "end": 200, "price": 3.5 },
                { "start": 200, "end": 999999, "price": 3.0 }
              ],
              "calculationExample": "采购纸箱30个：\n纸箱费：4元/个 × 30 = 120元\n（落在10-50个档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 11:30:00",
              "updater": "admin",
              "updateTime": "2025-07-22 11:30:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_12",
      "name": "退货标签制作费",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_12_1",
          "name": "标签制作费",
          "parentId": "cat_12",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_12_1_1",
              "feeItem": "退货标签制作费",
              "unit": "张",
              "tierPricing": [
                { "start": 0, "end": 10, "price": 2.0 },
                { "start": 10, "end": 50, "price": 1.5 },
                { "start": 50, "end": 100, "price": 1.2 },
                { "start": 100, "end": 999999, "price": 1.0 }
              ],
              "calculationExample": "制作标准退货标签20张：\n费用：1.5元/张 × 20 = 30元\n（落在10-50张档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 11:45:00",
              "updater": "admin",
              "updateTime": "2025-07-22 11:45:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_13",
      "name": "检验/修理费",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_13_1",
          "name": "检验修理费",
          "parentId": "cat_13",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_13_1_1",
              "feeItem": "检验/修理费",
              "unit": "次",
              "tierPricing": [
                { "start": 0, "end": 10, "price": 30.0 },
                { "start": 10, "end": 50, "price": 28.0 },
                { "start": 50, "end": 100, "price": 25.0 },
                { "start": 100, "end": 999999, "price": 22.0 }
              ],
              "condition": "具体费用待定，暂按阶梯收费模式设置",
              "level": 3,
              "type": "rule",
              "publishStatus": "draft",
              "validityPeriod": "待定",
              "creator": "admin",
              "createTime": "2025-07-22 12:00:00",
              "updater": "admin",
              "updateTime": "2025-07-22 12:00:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_14",
      "name": "其他增值服务",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_14_1",
          "name": "其他服务费",
          "parentId": "cat_14",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_14_1_1",
              "feeItem": "其他增值服务费",
              "subCategory": "人工费",
              "unit": "小时",
              "tierPricing": [
                { "start": 0, "end": 2, "price": 55.0 },
                { "start": 2, "end": 4, "price": 52.0 },
                { "start": 4, "end": 8, "price": 48.0 },
                { "start": 8, "end": 999999, "price": 45.0 }
              ],
              "calculationExample": "额外服务耗时3小时：\n人工费：52元/小时 × 3 = 156元\n（落在2-4小时档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 12:15:00",
              "updater": "admin",
              "updateTime": "2025-07-22 12:15:00"
            }
          ]
        }
      ]
    },
    {
      "id": "cat_15",
      "name": "异常订单处理",
      "feeGroup": "增值服务",
      "level": 1,
      "type": "category",
      "expanded": true,
      "children": [
        {
          "id": "sub_15_1",
          "name": "异常处理费",
          "parentId": "cat_15",
          "level": 2,
          "type": "operation",
          "expanded": true,
          "children": [
            {
              "id": "rule_15_1_1",
              "feeItem": "异常订单处理费",
              "subCategory": "快递售后服务",
              "unit": "次",
              "tierPricing": [
                { "start": 0, "end": 5, "price": 25.0 },
                { "start": 5, "end": 20, "price": 22.0 },
                { "start": 20, "end": 50, "price": 20.0 },
                { "start": 50, "end": 999999, "price": 18.0 }
              ],
              "calculationExample": "处理10次标准异常订单：\n费用：22元/次 × 10 = 220元\n（落在5-20次档位）",
              "level": 3,
              "type": "rule",
              "publishStatus": "published",
              "validityPeriod": "2025-01-01 至 2026-12-31",
              "creator": "admin",
              "createTime": "2025-07-22 12:30:00",
              "updater": "admin",
              "updateTime": "2025-07-22 12:30:00"
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "version": "2.0",
    "description": "增值服务规则树形结构数据 - 全部采用阶梯收费模式（tierPricing），包含退货入库、商品上架、仓储费、产品销毁费、拆托、开箱费、封箱费、拍照服务、丈量过磅、打绷带、纸箱费、退货标签制作费、检验/修理费、其他增值服务、异常订单处理等分类",
    "lastUpdated": "2026-06-11",
    "totalCategories": 15,
    "totalOperations": 15,
    "totalRules": 17,
    "pricingMode": "tier-pricing"
  }
};
