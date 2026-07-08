import type { ChatRequestMessage, ChatResponse, Citation } from '../types/chat';

const MOCK_KB: Array<{
  keywords: RegExp;
  answer: string;
  citations: Citation[];
}> = [
  {
    keywords: /截单|入库.*时间|几点/,
    answer:
      '**美国仓标准件入库**的最晚截单时间为 **工作日 14:00**（美国当地时区）。\n\n请在截单前完成系统提交，逾期的入库单将顺延至下一工作日处理。',
    citations: [
      {
        docTitle: '美国仓入库操作规范',
        section: '3.2 截单时间表',
        excerpt: '标准件入库最晚截单：工作日 14:00（当地时区）。',
      },
    ],
  },
  {
    keywords: /英国.*德国|德国.*英国|退货.*周期|周期.*区别/,
    answer:
      '**英国仓**退货处理周期一般为 **5–7 个工作日**；**德国仓**一般为 **7–10 个工作日**（含质检环节）。\n\n两国流程均包含：收货 → 质检 → 上架或销毁。',
    citations: [
      {
        docTitle: '欧洲仓退货处理 SOP',
        section: '4.1 各国时效对比',
        excerpt: '英国仓 5–7 个工作日；德国仓 7–10 个工作日。',
      },
    ],
  },
  {
    keywords: /德国.*质检|质检标准/,
    answer:
      '**德国仓退货质检**主要包括：外箱完整性、SKU 匹配、外观瑕疵分级。\n\n- A 级：可直接上架\n- B 级：需商家确认后处理\n- 不合格：隔离并 48 小时内通知商家',
    citations: [
      {
        docTitle: '欧洲仓退货处理 SOP',
        section: '3.2 德国仓质检标准',
        excerpt: '德国仓质检含外箱、SKU、外观分级；不合格品需隔离并在 48 小时内反馈。',
      },
    ],
  },
  {
    keywords: /超过.*7.*天|7.*天.*处理|超期.*退货/,
    answer:
      '德国仓退货若 **超过 7 个工作日**仍未闭环，系统将自动标记为异常并：\n\n1. 通知商家与客服\n2. 货物转入隔离区\n3. 需主管审批后续处理方式（退回/销毁/特批上架）',
    citations: [
      {
        docTitle: '欧洲仓退货处理 SOP',
        section: '3.4 超期异常处理',
        excerpt: '超过 7 个工作日未闭环，自动升级异常并隔离货物。',
      },
    ],
  },
  {
    keywords: /超期库存|180|计费/,
    answer:
      '**超期库存**定义为库龄 **≥ 180 天**的在库商品。自第 181 天起按阶梯费率计费，具体费率见计费规则附录。\n\n（与 90 天库龄预警不同，90 天仅为预警，不计费。）',
    citations: [
      {
        docTitle: '海外仓计费规则说明',
        section: '3.3 超期库存计费',
        excerpt: '超期库存：库龄 ≥ 180 天；第 181 天起阶梯计费。',
      },
    ],
  },
  {
    keywords: /禁运|德国仓.*类别/,
    answer:
      '**德国仓禁运品主要类别**包括：易燃易爆品、未申报液体、无合规文件的电池、仿牌商品、无资质食品等。\n\n带电产品需 CE 认证及 UN38.3 报告。',
    citations: [
      {
        docTitle: '禁运品与合规清单',
        section: '2.2 德国仓禁运类别',
        excerpt: '禁运：易燃易爆、液体、电池、仿牌、无资质食品；带电需 CE + UN38.3。',
      },
    ],
  },
  {
    keywords: /FBA.*退货|退货入库.*流程/,
    answer:
      '**FBA 退货入库标准流程**：\n\n1. 创建退货单\n2. 仓库收货登记\n3. 质检分类\n4. 上架或销毁\n\n标准时效 **5–7 个工作日**。',
    citations: [
      {
        docTitle: 'FBA 退货入库 SOP',
        section: '2.0 标准流程',
        excerpt: '流程：创建退货单 → 收货 → 质检 → 上架/销毁；时效 5–7 工作日。',
      },
    ],
  },
];

const REFUSAL_PATTERNS = [/库存多少|总库存|实时/, /创建.*入库单|帮我.*下单/];

function inferQuery(messages: ChatRequestMessage[]): string {
  const last = messages[messages.length - 1]?.content ?? '';
  const prev = messages.slice(-4, -1);

  const isShortFollowUp = last.length <= 20 && /^(那|还有|继续|超过|德国|英国)/.test(last);
  if (!isShortFollowUp || prev.length === 0) return last;

  const context = prev
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => m.content.slice(0, 120))
    .join(' ');

  if (/德国|质检/.test(last) && /德国|退货/.test(context)) {
    return '德国仓的退货质检标准是什么？';
  }
  if (/7.*天|超过/.test(last) && /德国|退货/.test(context)) {
    return '德国仓退货超过 7 天还没处理完怎么办？';
  }
  if (/换.*话题|超期/.test(last)) {
    return last;
  }

  return `${context} ${last}`;
}

function findMockResponse(query: string): ChatResponse | null {
  for (const item of MOCK_KB) {
    if (item.keywords.test(query)) {
      return { content: item.answer, citations: item.citations };
    }
  }
  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Mock 流式聊天；后续可替换为真实 /api/chat SSE */
export async function streamChat(
  messages: ChatRequestMessage[],
  onChunk: (partial: string) => void,
): Promise<ChatResponse> {
  const query = inferQuery(messages);

  await sleep(400 + Math.random() * 300);

  if (REFUSAL_PATTERNS.some((p) => p.test(query))) {
    const content =
      query.includes('库存')
        ? '这个我还查不到呢～**实时库存**需要登录 WMS 查看，我只能回答文档里的规范问题。'
        : '抱歉，我目前只能**解答知识库里的规范**，还不能帮你直接创建入库单哦。';
    for (const ch of content) {
      onChunk(ch);
      await sleep(18);
    }
    return { content, citations: [], refused: true };
  }

  const matched = findMockResponse(query);
  const response: ChatResponse = matched ?? {
    content:
      '唔…知识库里暂时没找到相关规定。你可以换个说法试试，或查阅文档中心联系值班同学～',
    citations: [],
    refused: true,
  };

  for (const ch of response.content) {
    onChunk(ch);
    await sleep(14 + Math.random() * 10);
  }

  return response;
}

export const EXAMPLE_QUESTIONS = [
  '你好，你能帮我做什么？',
  '新建一个费用管理的价卡查询列表页原型',
  '查看所有归档的原型',
];
