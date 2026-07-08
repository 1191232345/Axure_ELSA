# 岛民知识助手 · 聊天 Demo

个人作品集 Demo：多轮海外仓知识问答（当前为 **Mock RAG**，可替换真实 API）。

## 启动

```bash
cd demo
npm install
npm run dev
```

浏览器打开 http://localhost:5174

## 功能

- 多轮对话（localStorage 持久化会话）
- 流式 Mock 回答
- 引用来源 Collapse 展开
- 示例问题一键提问
- 拒答演示（问「今天美国仓总库存多少？」）

## 推荐 Demo 脚本

1. 点击「英国仓和德国仓退货周期有什么区别？」
2. 追问：「那德国仓的质检标准呢？」
3. 再追问：「超过 7 天还没处理完怎么办？」

## 技术栈

- React 18 + Vite + TypeScript
- [animal-island-ui](https://github.com/guokaigdg/animal-island-ui)

## 下一步

将 `src/services/mockChat.ts` 替换为真实 `/api/chat` SSE 接口即可对接 RAG 后端。
