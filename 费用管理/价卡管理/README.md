# 价卡管理系统

## 目录结构

```
费用管理/价卡管理/
├── index.html                    # 价卡管理主页面(列表展示)
├── package-create.html           # 创建价卡页面(旧版本,已废弃)
├── package-edit.html             # 编辑价卡页面
├── warehouse-fee.html            # 维护库内费用页面
├── express-fee.html              # 维护快递费用页面
├── other-fee.html                # 维护其他费用页面
├── css/
│   └── styles.css                # 全局样式文件
├── js/
│   ├── state.js                  # 全局状态管理
│   ├── data-service.js           # 数据服务(加载/保存)
│   ├── package-list.js           # 价卡列表逻辑
│   ├── modal-create-package.js   # 新增价卡弹窗逻辑
│   ├── modal-logic-description.js# 逻辑说明弹窗逻辑
│   ├── fee-maintenance-common.js # 费用维护公共逻辑
│   ├── warehouse-fee.js          # 库内费用维护逻辑
│   ├── express-fee.js            # 快递费用维护逻辑
│   ├── other-fee.js              # 其他费用维护逻辑
│   ├── fee-data.js               # 费用数据管理
│   ├── fee-table.js              # 费用表格渲染
│   ├── package-form.js           # 价卡表单逻辑
│   ├── discount-calculator.js    # 折扣计算逻辑
│   ├── tier-discount-logic.js    # 阶梯折扣逻辑
│   ├── tier-discount-ui.js       # 阶梯折扣UI
│   ├── modal-standard-discount.js# 标准折扣弹窗
│   ├── modal-tier-discount.js    # 阶梯折扣弹窗
│   └── utils.js                  # 工具函数
└── data/
    ├── fee-categories-data.js    # 费用分类数据
    ├── package-data.json         # 价卡数据存储
    └── inbound-fee-rule-data.json# 入库费规则数据
```

## 核心模块说明

### 1. 页面模块

#### index.html - 价卡管理主页面
- **功能**: 价卡列表展示、筛选、新增、查看、编辑、删除
- **特点**:
  - 新增价卡改为弹窗模式,自动填写默认名称和描述
  - 操作列包含三个维护按钮:维护库内费用、快递费用、其他费用
  - 逻辑说明弹窗展示详细业务逻辑
- **引用模块**:
  - modal-create-package.js (新增弹窗逻辑)
  - modal-logic-description.js (逻辑说明弹窗)
  - package-list.js (列表渲染和操作)

#### warehouse-fee.html - 维护库内费用页面
- **功能**: 管理价卡的库内费用项
- **费用类型**: 卸货费(整柜/散货)、仓储费、其他库内费用
- **引用模块**:
  - fee-maintenance-common.js (公共逻辑)
  - warehouse-fee.js (页面逻辑)

#### express-fee.html - 维护快递费用页面
- **功能**: 管理价卡的快递费用项
- **费用类型**: 快递配送费、快递渠道费、配送附加费
- **引用模块**:
  - fee-maintenance-common.js (公共逻辑)
  - express-fee.js (页面逻辑)

#### other-fee.html - 维护其他费用页面
- **功能**: 管理价卡的其他费用项
- **费用类型**: 增值服务费、操作费、其他杂费
- **引用模块**:
  - fee-maintenance-common.js (公共逻辑)
  - other-fee.js (页面逻辑)

### 2. JavaScript 模块

#### 核心模块
- **state.js**: 全局状态管理,维护AppState对象
- **data-service.js**: 数据加载和保存服务,负责localStorage交互
- **utils.js**: 工具函数集合

#### 弹窗模块
- **modal-create-package.js**: 新增价卡弹窗,自动填写默认名称(如新价卡001)
- **modal-logic-description.js**: 逻辑说明弹窗,支持Tab切换展示不同逻辑模块

#### 费用维护模块
- **fee-maintenance-common.js**: 费用维护公共逻辑
  - 提供公共方法:获取价卡ID、加载价卡数据、格式化折扣文本、保存费用项等
  - 减少三个维护页面的代码重复
- **warehouse-fee.js**: 库内费用维护页面逻辑
- **express-fee.js**: 快递费用维护页面逻辑
- **other-fee.js**: 其他费用维护页面逻辑

#### 折扣计算模块
- **discount-calculator.js**: 折扣计算核心逻辑
- **tier-discount-logic.js**: 阶梯折扣业务逻辑
- **tier-discount-ui.js**: 阶梯折扣UI渲染

#### 费用表格模块
- **fee-table.js**: 费用表格渲染和管理
- **package-form.js**: 价卡表单验证和提交

## 数据流说明

### 价卡数据结构
```javascript
{
  id: Number,              // 价卡ID(时间戳)
  name: String,            // 价卡名称
  description: String,     // 价卡描述
  feeItems: Array,         // 费用项列表
  createdBy: String,       // 创建人
  createdAt: String,       // 创建时间
  updatedBy: String,       // 更新人
  updatedAt: String        // 更新时间
}
```

### 费用项数据结构
```javascript
{
  feeGroup: String,        // 费用组(入库/快递/其他)
  feeGroupName: String,    // 费用组名称
  feeType: String,         // 费用类型ID
  feeTypeName: String,     // 费用类型名称
  unit: String,            // 计费单位
  unitPrice: Number,       // 单价
  discountType: String,    // 折扣方式(none/percentage/fixed/fixed_price)
  discountValue: Number,   // 折扣值
  expectedAmount: Number,  // 预计金额
  remark: String           // 备注
}
```

## 业务逻辑说明

### 新增价卡流程
1. 点击"新增价卡"按钮打开弹窗
2. 自动填写价卡名称(新价卡001、新价卡002...自动递增)
3. 自动填写价卡描述(默认"请填写价卡描述")
4. 用户可修改名称和描述后保存
5. 创建空价卡(费用项列表为空)

### 维护费用流程
1. 在价卡列表点击对应的维护按钮
2. 进入费用维护页面,展示当前价卡名称
3. 查看已有费用项或新增费用项
4. 点击编辑按钮配置费用项详情(待实现)
5. 保存后费用项更新到价卡,返回列表页

### 费用分类逻辑
- **库内费用**: feeGroup='入库' 或 '仓储'
- **快递费用**: feeGroup='快递' 或 '配送'
- **其他费用**: 不属于库内和快递的费用项

## 文件大小控制

为确保代码可维护性,所有文件控制在300行以内:

### 已重构文件
- index.html: 从742行优化到~600行(逻辑说明弹窗内容较长,为静态展示数据)
- warehouse-fee.html: 从347行优化到199行 ✅
- express-fee.html: 从347行优化到199行 ✅
- other-fee.html: 从355行优化到200行 ✅
- package-edit.html: 从253行优化到210行 ✅ (移除折扣配置部分,只保留基本信息)

### 新增独立JS文件
- modal-create-package.js: 86行
- modal-logic-description.js: 58行
- fee-maintenance-common.js: 73行
- warehouse-fee.js: 85行
- express-fee.js: 83行
- other-fee.js: 110行

## 技术栈

- **前端框架**: Tailwind CSS
- **图标库**: Font Awesome 6.4.0
- **数据存储**: localStorage
- **模块化**: 纯JavaScript模块化设计

## 开发注意事项

1. **数据一致性**: 费用项保存时需确保不覆盖其他费用组的费用项
2. **命名规范**: 文件命名使用小写+连字符,JS变量使用驼峰命名
3. **行数限制**: 单个文件不超过300行,超过需拆分
4. **公共逻辑**: 多个页面共用的逻辑需提取到公共模块
5. **新增弹窗**: 使用modal-overlay和modal-container样式,确保弹窗正常显示
6. **编辑页面**: 只编辑价卡基本信息(名称和描述),费用项通过维护页面管理

## 更新历史

### 2026-07-03 更新
1. **修复新增弹窗问题**: 添加modal-container CSS样式定义
2. **优化编辑页面**:
   - 移除折扣配置部分,只保留基本信息编辑
   - 添加费用维护提示信息
   - 显示完整的创建和更新信息
   - 新增initEditBasicInfo和saveBasicInfo函数
3. **文件大小优化**: package-edit.html从253行优化到210行

## 未来优化方向

1. 实现费用项编辑弹窗,支持详细配置
2. 添加费用项数据验证和错误提示
3. 实现批量操作功能
4. 添加费用项导入导出功能
5. 优化移动端响应式体验