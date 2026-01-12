/**
 * AI配置和集成模块
 * 支持多种AI服务提供商
 */

const AIConfig = {
  // 当前使用的AI提供商: 'openai', 'claude', 'gemini', 'local', 'mock'
  provider: 'mock',

  // API配置
  apiKeys: {
    openai: '',
    claude: '',
    gemini: ''
  },

  // API端点
  endpoints: {
    openai: 'https://api.openai.com/v1/chat/completions',
    claude: 'https://api.anthropic.com/v1/messages',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    local: 'http://localhost:11434/api/generate' // Ollama本地模型
  },

  // 模型配置
  models: {
    openai: 'gpt-3.5-turbo',
    claude: 'claude-3-sonnet-20240229',
    gemini: 'gemini-pro',
    local: 'llama2'
  },

  // 请求参数
  requestConfig: {
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 30000 // 30秒超时
  }
};

/**
 * AI服务类
 */
class AIService {
  constructor(config) {
    this.config = config;
  }

  /**
   * 统一的AI请求接口
   * @param {string} prompt - 提示词
   * @param {string} systemPrompt - 系统提示词
   * @returns {Promise<string>} AI生成的内容
   */
  async generate(prompt, systemPrompt = '') {
    const provider = this.config.provider;

    // 如果是mock模式,返回模拟数据
    if (provider === 'mock') {
      return this.mockGenerate(prompt);
    }

    try {
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(prompt, systemPrompt);
        case 'claude':
          return await this.generateWithClaude(prompt, systemPrompt);
        case 'gemini':
          return await this.generateWithGemini(prompt, systemPrompt);
        case 'local':
          return await this.generateWithLocal(prompt, systemPrompt);
        default:
          throw new Error(`不支持的AI提供商: ${provider}`);
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      throw error;
    }
  }

  /**
   * OpenAI API调用
   */
  async generateWithOpenAI(prompt, systemPrompt) {
    const apiKey = this.config.apiKeys.openai;
    if (!apiKey) {
      throw new Error('请先配置OpenAI API Key');
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(this.config.endpoints.openai, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: this.config.models.openai,
        messages: messages,
        temperature: this.config.requestConfig.temperature,
        max_tokens: this.config.requestConfig.maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API错误: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Claude API调用
   */
  async generateWithClaude(prompt, systemPrompt) {
    const apiKey = this.config.apiKeys.claude;
    if (!apiKey) {
      throw new Error('请先配置Claude API Key');
    }

    const response = await fetch(this.config.endpoints.claude, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.models.claude,
        max_tokens: this.config.requestConfig.maxTokens,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API错误: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Gemini API调用
   */
  async generateWithGemini(prompt, systemPrompt) {
    const apiKey = this.config.apiKeys.gemini;
    if (!apiKey) {
      throw new Error('请先配置Gemini API Key');
    }

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const url = `${this.config.endpoints.gemini}?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: this.config.requestConfig.temperature,
          maxOutputTokens: this.config.requestConfig.maxTokens
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API错误: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * 本地模型调用 (Ollama)
   */
  async generateWithLocal(prompt, systemPrompt) {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const response = await fetch(this.config.endpoints.local, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.models.local,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: this.config.requestConfig.temperature
        }
      })
    });

    if (!response.ok) {
      throw new Error(`本地模型错误: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }

  /**
   * Mock模式 - 返回模拟数据
   */
  mockGenerate(prompt) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('这是模拟生成的内容。请配置真实的AI API以获得智能生成结果。');
      }, 500);
    });
  }
}

/**
 * PRD专用AI提示词模板
 */
const PRDPrompts = {
  // 需求背景生成
  background: (keywords) => ({
    system: '你是一位专业的产品经理,擅长撰写产品需求文档。请根据用户提供的关键词,生成结构化的需求背景、目标和预期收益。',
    user: `请根据以下关键词生成需求背景:
关键词: ${keywords}

请按以下格式输出:
**背景:**
[描述当前存在的问题和痛点]

**目标:**
[列出期望达成的目标,使用bullet points]

**预期收益:**
[列出预期带来的收益,使用bullet points]`
  }),

  // 用户故事生成
  userStory: (role, action, benefit) => ({
    system: '你是一位专业的产品经理,擅长编写用户故事和使用场景。',
    user: `请生成用户故事和使用场景:
用户角色: ${role}
用户操作: ${action}
期望收益: ${benefit}

请按以下格式输出:
**用户故事:**
[标准用户故事格式]

**使用场景:**
[列出3个典型使用场景]`
  }),

  // 功能拆解
  featureDecompose: (description) => ({
    system: '你是一位专业的产品经理,擅长将高层需求拆解为详细的功能点,并按优先级分类。',
    user: `请将以下需求拆解为详细功能点,并按P0/P1/P2优先级分类:
需求描述: ${description}

请按以下格式输出:
**P0 (必须有):**
• [核心功能1]
• [核心功能2]

**P1 (重要):**
• [重要功能1]
• [重要功能2]

**P2 (优化项):**
• [优化功能1]
• [优化功能2]`
  }),

  // 交互流程生成
  interactionFlow: (context) => ({
    system: '你是一位专业的产品经理,擅长设计交互流程和页面结构。',
    user: `请生成交互流程说明:
${context ? `功能背景: ${context}` : '请生成标准的交互流程说明'}

请按以下格式输出:
**页面结构:**
[描述页面布局]

**交互流程:**
[列出详细的交互步骤]

**状态变化:**
[描述不同状态]

**异常处理:**
[列出异常场景的处理方式]`
  }),

  // 数据字典生成
  dataDict: (fields) => ({
    system: '你是一位专业的产品经理,擅长定义数据字段和数据结构。',
    user: `请为以下字段生成数据字典:
字段列表:
${fields}

请按以下格式输出Markdown表格:
| 字段名 | 类型 | 长度 | 必填 | 校验规则 | 说明 |
|--------|------|------|------|----------|------|
[为每个字段生成一行]`
  }),

  // 异常场景生成
  exceptions: (scenario) => ({
    system: '你是一位专业的产品经理,擅长识别和处理异常场景。',
    user: `请为以下功能场景生成异常处理说明:
功能场景: ${scenario}

请按以下分类输出:
**文件异常:**
[列出文件相关的异常]

**数据异常:**
[列出数据相关的异常]

**系统异常:**
[列出系统相关的异常]

**权限异常:**
[列出权限相关的异常]`
  }),

  // 验收标准生成
  acceptance: (features) => ({
    system: '你是一位专业的产品经理,擅长制定验收标准和测试要点。',
    user: `请为以下功能列表生成验收标准:
功能列表:
${features}

请按以下格式输出:
**功能验收:**
[为每个功能生成验收标准]

**性能验收:**
[列出性能要求]

**体验验收:**
[列出用户体验验收标准]`
  })
};

// 导出配置和服务
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIConfig, AIService, PRDPrompts };
}
