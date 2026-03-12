/**
 * RAG系统核心引擎
 * 负责知识库管理、自然语言处理、检索匹配和推荐
 */

class RagEngine {
  constructor() {
    this.knowledgeBase = {
      components: [],
      templates: [],
      designSpecs: [],
      historicalPrototypes: []
    };
    this.embeddings = new Map();
    this.initialize();
  }

  /**
   * 初始化RAG引擎
   */
  async initialize() {
    await this.loadKnowledgeBase();
    console.log('RAG引擎初始化完成');
  }

  /**
   * 加载知识库
   */
  async loadKnowledgeBase() {
    try {
      // 加载组件库
      const components = await this.loadDirectory('.trae/rag-system/knowledge-base/components');
      this.knowledgeBase.components = components;

      // 加载模板库
      const templates = await this.loadDirectory('.trae/rag-system/knowledge-base/templates');
      this.knowledgeBase.templates = templates;

      // 加载设计规范
      const designSpecs = await this.loadDirectory('.trae/rag-system/knowledge-base/design-specs');
      this.knowledgeBase.designSpecs = designSpecs;

      // 加载历史原型
      const historicalPrototypes = await this.loadDirectory('.trae/rag-system/knowledge-base/historical-prototypes');
      this.knowledgeBase.historicalPrototypes = historicalPrototypes;

      console.log('知识库加载完成:', {
        components: this.knowledgeBase.components.length,
        templates: this.knowledgeBase.templates.length,
        designSpecs: this.knowledgeBase.designSpecs.length,
        historicalPrototypes: this.knowledgeBase.historicalPrototypes.length
      });
    } catch (error) {
      console.error('加载知识库失败:', error);
    }
  }

  /**
   * 加载目录中的文件
   */
  async loadDirectory(directory) {
    const files = [];
    try {
      // 这里使用模拟数据，实际项目中应该使用文件系统API
      // 模拟加载Markdown文件
      const mockFiles = this.getMockFiles(directory);
      for (const file of mockFiles) {
        const content = await this.loadFile(file.path);
        files.push({
          id: file.id,
          name: file.name,
          path: file.path,
          content: content,
          type: file.type,
          tags: file.tags,
          lastModified: new Date()
        });
      }
    } catch (error) {
      console.error('加载目录失败:', error);
    }
    return files;
  }

  /**
   * 加载文件内容
   */
  async loadFile(filePath) {
    // 模拟文件加载
    // 实际项目中应该使用fetch或fs.readFile
    return `# 模拟文件内容

这是${filePath}的模拟内容`;
  }

  /**
   * 获取模拟文件数据
   */
  getMockFiles(directory) {
    const mockData = {
      '.trae/rag-system/knowledge-base/components': [
        {
          id: 'component-button',
          name: '按钮组件',
          path: '.trae/rag-system/knowledge-base/components/buttons.md',
          type: 'component',
          tags: ['按钮', '基础组件', '表单']
        },
        {
          id: 'component-form',
          name: '表单组件',
          path: '.trae/rag-system/knowledge-base/components/forms.md',
          type: 'component',
          tags: ['表单', '复合组件', '数据输入']
        }
      ],
      '.trae/rag-system/knowledge-base/templates': [
        {
          id: 'template-list-page',
          name: '列表页面模板',
          path: '.trae/rag-system/knowledge-base/templates/list-page.md',
          type: 'template',
          tags: ['列表', '页面模板', '数据展示']
        }
      ],
      '.trae/rag-system/knowledge-base/design-specs': [
        {
          id: 'design-system',
          name: '设计系统规范',
          path: '.trae/rag-system/knowledge-base/design-specs/design-system.md',
          type: 'design-spec',
          tags: ['设计规范', '系统规范', '设计系统']
        }
      ],
      '.trae/rag-system/knowledge-base/historical-prototypes': []
    };

    return mockData[directory] || [];
  }

  /**
   * 搜索知识库
   */
  search(query, options = {}) {
    const {
      type = 'all',
      limit = 10,
      threshold = 0.5
    } = options;

    const results = [];

    // 搜索组件
    if (type === 'all' || type === 'component') {
      this.knowledgeBase.components.forEach(component => {
        const score = this.calculateSimilarity(query, component);
        if (score >= threshold) {
          results.push({
            ...component,
            score,
            category: 'component'
          });
        }
      });
    }

    // 搜索模板
    if (type === 'all' || type === 'template') {
      this.knowledgeBase.templates.forEach(template => {
        const score = this.calculateSimilarity(query, template);
        if (score >= threshold) {
          results.push({
            ...template,
            score,
            category: 'template'
          });
        }
      });
    }

    // 搜索设计规范
    if (type === 'all' || type === 'design-spec') {
      this.knowledgeBase.designSpecs.forEach(spec => {
        const score = this.calculateSimilarity(query, spec);
        if (score >= threshold) {
          results.push({
            ...spec,
            score,
            category: 'design-spec'
          });
        }
      });
    }

    // 搜索历史原型
    if (type === 'all' || type === 'prototype') {
      this.knowledgeBase.historicalPrototypes.forEach(prototype => {
        const score = this.calculateSimilarity(query, prototype);
        if (score >= threshold) {
          results.push({
            ...prototype,
            score,
            category: 'prototype'
          });
        }
      });
    }

    // 排序并限制结果数量
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /**
   * 计算相似度
   */
  calculateSimilarity(query, item) {
    // 简单的相似度计算
    // 实际项目中应该使用向量相似度计算
    const queryLower = query.toLowerCase();
    let score = 0;

    // 标题匹配
    if (item.name.toLowerCase().includes(queryLower)) {
      score += 0.5;
    }

    // 标签匹配
    if (item.tags) {
      item.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          score += 0.2;
        }
      });
    }

    // 内容匹配（简化版）
    if (item.content && item.content.toLowerCase().includes(queryLower)) {
      score += 0.3;
    }

    return score;
  }

  /**
   * 获取推荐
   */
  getRecommendations(context, limit = 5) {
    const recommendations = [];

    // 基于上下文推荐组件
    this.knowledgeBase.components.forEach(component => {
      const score = this.calculateContextSimilarity(context, component);
      if (score > 0) {
        recommendations.push({
          ...component,
          score,
          category: 'component',
          reason: '基于上下文推荐'
        });
      }
    });

    // 基于上下文推荐模板
    this.knowledgeBase.templates.forEach(template => {
      const score = this.calculateContextSimilarity(context, template);
      if (score > 0) {
        recommendations.push({
          ...template,
          score,
          category: 'template',
          reason: '基于上下文推荐'
        });
      }
    });

    // 排序并限制结果数量
    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, limit);
  }

  /**
   * 计算上下文相似度
   */
  calculateContextSimilarity(context, item) {
    // 基于上下文的相似度计算
    let score = 0;

    // 上下文关键词匹配
    const contextKeywords = this.extractKeywords(context);
    const itemKeywords = this.extractKeywords(item.name + ' ' + (item.tags?.join(' ') || ''));

    contextKeywords.forEach(keyword => {
      if (itemKeywords.includes(keyword)) {
        score += 0.2;
      }
    });

    return score;
  }

  /**
   * 提取关键词
   */
  extractKeywords(text) {
    // 简单的关键词提取
    // 实际项目中应该使用更复杂的NLP技术
    const stopWords = ['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
    return text.toLowerCase()
      .replace(/[.,?!;:]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.includes(word));
  }

  /**
   * 生成响应
   */
  generateResponse(query, results) {
    if (results.length === 0) {
      return {
        content: '抱歉，没有找到相关的设计资源。请尝试使用更具体的关键词搜索。',
        type: 'error'
      };
    }

    const response = {
      content: '',
      type: 'success',
      results: results
    };

    // 生成响应内容
    response.content = `找到 ${results.length} 个相关资源：\n\n`;

    results.forEach((result, index) => {
      let categoryName = '';
      switch (result.category) {
        case 'component':
          categoryName = '组件';
          break;
        case 'template':
          categoryName = '模板';
          break;
        case 'design-spec':
          categoryName = '设计规范';
          break;
        case 'prototype':
          categoryName = '历史原型';
          break;
      }

      response.content += `${index + 1}. [${categoryName}] ${result.name} (相似度: ${(result.score * 100).toFixed(1)}%)\n`;
      if (result.tags && result.tags.length > 0) {
        response.content += `   标签: ${result.tags.join(', ')}\n`;
      }
      response.content += `   路径: ${result.path}\n\n`;
    });

    return response;
  }

  /**
   * 处理用户查询
   */
  async processQuery(query, options = {}) {
    try {
      // 搜索知识库
      const results = this.search(query, options);

      // 生成响应
      const response = this.generateResponse(query, results);

      return response;
    } catch (error) {
      console.error('处理查询失败:', error);
      return {
        content: '处理查询时出现错误，请稍后重试。',
        type: 'error'
      };
    }
  }

  /**
   * 添加新资源到知识库
   */
  addResource(resource) {
    switch (resource.type) {
      case 'component':
        this.knowledgeBase.components.push(resource);
        break;
      case 'template':
        this.knowledgeBase.templates.push(resource);
        break;
      case 'design-spec':
        this.knowledgeBase.designSpecs.push(resource);
        break;
      case 'prototype':
        this.knowledgeBase.historicalPrototypes.push(resource);
        break;
      default:
        console.warn('未知资源类型:', resource.type);
    }
  }

  /**
   * 获取知识库统计信息
   */
  getStatistics() {
    return {
      totalResources: this.knowledgeBase.components.length +
        this.knowledgeBase.templates.length +
        this.knowledgeBase.designSpecs.length +
        this.knowledgeBase.historicalPrototypes.length,
      components: this.knowledgeBase.components.length,
      templates: this.knowledgeBase.templates.length,
      designSpecs: this.knowledgeBase.designSpecs.length,
      historicalPrototypes: this.knowledgeBase.historicalPrototypes.length
    };
  }
}

// 导出RAG引擎
export default RagEngine;