export const FILTER_CONFIG_DEFINITIONS = {
  basic: [
    {
      id: 'billType',
      label: '类型',
      type: 'select',
      group: 'primary',
      order: 1,
      options: [
        { value: '', text: '全部类型' },
        { value: '出库+快递(YC)', text: '出库+快递(YC)' },
        { value: '出库+快递(TMS)', text: '出库+快递(TMS)' },
        { value: '仓储费', text: '仓储费' },
        { value: '快递赔付', text: '快递赔付' },
        { value: '库内赔付(错发)', text: '库内赔付(错发)' },
        { value: '库内赔付(丢件)', text: '库内赔付(丢件)' },
        { value: '库内赔付(其他)', text: '库内赔付(其他)' },
        { value: '其他', text: '其他' },
        { value: '充值', text: '充值' },
        { value: '费用调整', text: '费用调整' }
      ],
      defaultVisible: true,
      defaultValue: '出库+快递(YC)'
    },
    {
      id: 'billMonth',
      label: '账单月',
      type: 'month',
      group: 'primary',
      order: 2,
      defaultVisible: true
    },
    {
      id: 'voyagePeriod',
      label: '航期',
      type: 'month',
      group: 'primary',
      order: 3,
      defaultVisible: true
    },
    {
      id: 'customerCode',
      label: '客户代码',
      type: 'select',
      group: 'primary',
      order: 4,
      options: [
        { value: '', text: '全部' },
        { value: 'ZJJS', text: 'ZJJS' },
        { value: 'ZJHW', text: 'ZJHW' },
        { value: 'ZJWL', text: 'ZJWL' }
      ],
      defaultVisible: true
    },
    {
      id: 'customerService',
      label: '客服',
      type: 'select',
      group: 'secondary',
      order: 5,
      options: [
        { value: '', text: '全部' },
        { value: '李四', text: '李四' },
        { value: '钱七', text: '钱七' },
        { value: '吴十', text: '吴十' }
      ],
      defaultVisible: true
    },
    {
      id: 'operateTimeRange',
      label: '操作时间',
      type: 'daterange',
      group: 'secondary',
      order: 6,
      defaultVisible: true
    }
  ]
};

export const ITEMS_PER_PAGE = 10;

export const BILL_STATUS = {
  PENDING: '待获取',
  PROCESSING: '处理中',
  COMPLETED: '已完成',
  FAILED: '失败'
};

export const BILL_TYPE_HEADERS = {
  '出库+快递(YC)': [
    { key: 'billNo', label: '账单号', width: '120px' },
    { key: 'billMonth', label: '账单月', width: '100px' },
    { key: 'voyagePeriod', label: '航期', width: '100px' },
    { key: 'customerCode', label: '客户代码', width: '100px' },
    { key: 'sales', label: '销售', width: '80px' },
    { key: 'customerService', label: '客服', width: '80px' },
    { key: 'billType', label: '账单类型', width: '120px' },
    { key: 'amount', label: '账单金额', width: '100px', align: 'right' },
    { key: 'status', label: '账单状态', width: '100px' },
    { key: 'operator', label: '操作人', width: '80px' },
    { key: 'operateTime', label: '操作时间', width: '140px' },
    { key: 'remark', label: '账单备注', width: '150px' }
  ]
};

export const MODAL_TABLE_CONFIG = {
  '出库+快递(YC)': {
    headers: [
      { key: 'outboundNo', label: '出库单号', width: '140px' },
      { key: 'trackingNo', label: '快递单号', width: '140px' },
      { key: 'warehouse', label: '仓库', width: '80px' },
      { key: 'customerCode', label: '客户代码', width: '100px' },
      { key: 'voyagePeriod', label: '航期', width: '100px' },
      { key: 'weight', label: '重量(KG)', width: '100px', align: 'right' },
      { key: 'volume', label: '体积(CBM)', width: '100px', align: 'right' },
      { key: 'fee', label: '费用', width: '100px', align: 'right' }
    ],
    searchFields: [
      { id: 'outboundNo', label: '出库单号', type: 'text' },
      { id: 'trackingNo', label: '快递单号', type: 'text' }
    ]
  }
};