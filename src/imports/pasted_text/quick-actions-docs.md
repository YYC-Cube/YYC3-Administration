Your Role & Expertise

You are an experienced AI interaction specialist who specializes in:
- **Smart Operations**: Intelligent code refactoring, automated text processing, smart content transformation
- **Developer Experience**: One-click actions, keyboard shortcuts, context-aware operations
- **AI Integration**: AI-powered code analysis, intelligent suggestions, automated optimizations
- **Clipboard Management**: Smart clipboard history, multi-format copying, paste intelligence
- **Code Operations**: Refactoring, formatting, optimization, documentation generation
- **Text Processing**: Smart text transformation, content summarization, format conversion
- **Best Practices**: User experience optimization, performance enhancement, workflow efficiency

### Code Standards

**IMPORTANT**: Please ensure all generated code files follow the team requirements specified in: `guidelines/YYC3-Code-header.md`

All code files must include proper file headers with:
- @file: File name/path
- @description: Clear description of file purpose
- @author: YanYuCloudCube Team <admin@0379.email>
- @version: Semantic version (v1.0.0)
- @created: Creation date (YYYY-MM-DD)
- @updated: Last update date (YYYY-MM-DD)
- @status: File status (draft/dev/test/stable/deprecated)
- @license: License type
- @copyright: Copyright notice
- @tags: Relevant tags for categorization

---

## 📋 文档信息

| 字段 | 内容 |
|------|------|
| @file | P1-核心功能/YYC3-P1-AI-一键操作交互.md |
| @description | 文档、代码、文本类的一键操作交互功能设计和实现，包含复制、替换、优化等智能操作 |
| @author | YanYuCloudCube Team <admin@0379.email> |
| @version | v1.0.0 |
| @created | 2026-03-17 |
| @updated | 2026-03-17 |
| @status | stable |
| @license | MIT |
| @copyright | Copyright (c) 2026 YanYuCloudCube Team |
| @tags P1,AI,quick-actions,interaction |

---

## 🎯 功能目标

实现智能一键操作交互系统，包括：
- ✅ 智能代码操作（复制、替换、优化）
- ✅ 文档一键处理（格式化、转换、导出）
- ✅ 文本智能操作（摘要、翻译、改写）
- ✅ AI辅助操作（解释、重构、生成测试）
- ✅ 上下文感知操作
- ✅ 批量操作支持

---

## 🏗️ 架构设计

### 1. 功能架构

```
QuickActions/
├── CodeActions            # 代码操作
├── DocumentActions       # 文档操作
├── TextActions           # 文本操作
├── AIActions             # AI辅助操作
├── ClipboardManager      # 剪贴板管理
└── ContextAwareActions   # 上下文感知操作
```

### 2. 数据流

```
User Selection (用户选择)
    ↓ Context Analysis
Action Engine (操作引擎)
    ↓ AI Processing
AI Provider (AI提供商)
    ↓ Action Execution
Result (结果)
    ↓ Feedback
User (用户)
```

---

## 💾 核心类型定义

### 操作类型

```typescript
// src/types/actions.ts

/**
 * 操作类型
 */
export type ActionType =
  | 'copy'
  | 'replace'
  | 'refactor'
  | 'optimize'
  | 'format'
  | 'convert'
  | 'summarize'
  | 'translate'
  | 'rewrite'
  | 'explain'
  | 'test-generate'
  | 'document-generate';

/**
 * 操作目标类型
 */
export type ActionTarget = 'code' | 'text' | 'document' | 'file';

/**
 * 操作状态
 */
export type ActionStatus = 'idle' | 'processing' | 'success' | 'error';

/**
 * 操作接口
 */
export interface Action {
  /** 操作 ID */
  id: string;
  /** 操作类型 */
  type: ActionType;
  /** 操作目标 */
  target: ActionTarget;
  /** 操作标题 */
  title: string;
  /** 操作描述 */
  description?: string;
  /** 操作图标 */
  icon?: string;
  /** 操作快捷键 */
  shortcut?: string;
  /** 是否需要AI */
  requiresAI: boolean;
  /** 是否可用 */
  isAvailable: boolean;
  /** 操作状态 */
  status: ActionStatus;
  /** 操作结果 */
  result?: any;
  /** 错误信息 */
  error?: string;
}

/**
 * 操作上下文
 */
export interface ActionContext {
  /** 选中的内容 */
  selection: {
    text: string;
    startLine?: number;
    endLine?: number;
    startColumn?: number;
    endColumn?: number;
  };
  /** 文件信息 */
  file?: {
    path: string;
    name: string;
    language: string;
    content: string;
  };
  /** 编辑器信息 */
  editor?: {
    cursorPosition: { line: number; column: number };
    selectionRange?: { start: number; end: number };
  };
  /** 项目信息 */
  project?: {
    path: string;
    name: string;
  };
}

/**
 * 操作配置
 */
export interface ActionConfig {
  /** 操作类型 */
  type: ActionType;
  /** 操作参数 */
  params?: Record<string, any>;
  /** 是否使用AI */
  useAI?: boolean;
  /** AI模型 */
  aiModel?: string;
  /** AI温度 */
  temperature?: number;
  /** 最大tokens */
  maxTokens?: number;
}

/**
 * 剪贴板历史项
 */
export interface ClipboardHistoryItem {
  /** 历史项 ID */
  id: string;
  /** 内容 */
  content: string;
  /** 内容类型 */
  type: 'text' | 'code' | 'image';
  /** 复制时间 */
  copiedAt: number;
  /** 来源文件 */
  sourceFile?: string;
  /** 内容语言 */
  language?: string;
  /** 内容大小 */
  size: number;
}
```

---

## 💻 代码操作

### 智能代码操作服务

```typescript
// src/services/actions/CodeActions.ts
import { aiProviderManager } from '../../ai/AIProviderManager';
import type { Action, ActionContext, ActionConfig } from '@/types/actions';

/**
 * 代码操作服务类
 */
export class CodeActionsService {
  /**
   * 复制代码
   */
  async copyCode(context: ActionContext): Promise<void> {
    const { selection } = context;

    if (!selection.text) {
      throw new Error('No code selected');
    }

    // 复制到剪贴板
    await this.copyToClipboard(selection.text);

    // 添加到剪贴板历史
    await this.addToClipboardHistory({
      content: selection.text,
      type: 'code',
      language: context.file?.language,
      sourceFile: context.file?.path,
    });
  }

  /**
   * 复制代码为Markdown
   */
  async copyCodeAsMarkdown(context: ActionContext): Promise<void> {
    const { selection, file } = context;

    if (!selection.text) {
      throw new Error('No code selected');
    }

    const language = file?.language || 'text';
    const markdown = `\`\`\`${language}\n${selection.text}\n\`\`\``;

    await this.copyToClipboard(markdown);

    await this.addToClipboardHistory({
      content: markdown,
      type: 'text',
      sourceFile: context.file?.path,
    });
  }

  /**
   * 复制代码为HTML
   */
  async copyCodeAsHTML(context: ActionContext): Promise<void> {
    const { selection, file } = context;

    if (!selection.text) {
      throw new Error('No code selected');
    }

    const language = file?.language || 'text';
    const html = `<pre><code class="language-${language}">${this.escapeHTML(selection.text)}</code></pre>`;

    await this.copyToClipboard(html);

    await this.addToClipboardHistory({
      content: html,
      type: 'text',
      sourceFile: context.file?.path,
    });
  }

  /**
   * 替换代码
   */
  async replaceCode(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection, file } = context;

    if (!selection.text) {
      throw new Error('No code selected');
    }

    if (!config.useAI) {
      // 简单替换
      return config.params?.replacement || '';
    }

    // AI辅助替换
    const prompt = this.buildReplacePrompt(
      selection.text,
      file?.language || 'text',
      config.params
    );

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert programmer. Replace code according to instructions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.3,
      maxTokens: config.maxTokens || 2048,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 重构代码
   */
  async refactorCode(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection, file } = context;

    if (!selection.text) {
      throw new Error('No code selected');
    }

    const prompt = this.buildRefactorPrompt(
      selection.text,
      file?.language || 'text',
      config.params
    );

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code refactoring specialist. Improve code quality and maintainability.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.5,
      maxTokens: config.maxTokens || 4096,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 优化代码
   */
  async optimizeCode(
    context: ActionContext,
    config: ActionConfig
  ): Promise<{ optimizedCode: string; explanation: string }> {
    const { selection, file } = context;

    if (!selection.text) {
      throw new Error('No code selected');
    }

    const prompt = this.buildOptimizePrompt(
      selection.text,
      file?.language || 'text',
      config.params
    );

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code optimizer. Optimize code for better performance and readability.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.5,
      maxTokens: config.maxTokens || 4096,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return this.parseOptimizationResponse(response.content);
  }

  /**
   * 格式化代码
   */
  async formatCode(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection, file } = context;

    if (!selection.text) {
      throw new Error('No code selected');
    }

    if (!config.useAI) {
      // 使用Prettier格式化
      return this.formatWithPrettier(selection.text, file?.language);
    }

    // AI辅助格式化
    const prompt = this.buildFormatPrompt(
      selection.text,
      file?.language || 'text',
      config.params
    );

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code formatter. Format code according to best practices.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.1,
      maxTokens: config.maxTokens || 2048,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 生成测试代码
   */
  async generateTests(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection, file } = context;

    if (!selection.text) {
      throw new Error('No code selected');
    }

    const prompt = this.buildTestGenerationPrompt(
      selection.text,
      file?.language || 'text',
      config.params
    );

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert test engineer. Generate comprehensive test cases.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.5,
      maxTokens: config.maxTokens || 4096,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 生成文档
   */
  async generateDocumentation(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection, file } = context;

    if (!selection.text) {
      throw new Error('No code selected');
    }

    const prompt = this.buildDocumentationPrompt(
      selection.text,
      file?.language || 'text',
      config.params
    );

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical writer. Generate clear and comprehensive documentation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.5,
      maxTokens: config.maxTokens || 4096,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 构建替换提示词
   */
  private buildReplacePrompt(
    code: string,
    language: string,
    params?: Record<string, any>
  ): string {
    let prompt = `Language: ${language}\n\n`;
    prompt += `Original Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;

    if (params?.instructions) {
      prompt += `Instructions:\n${params.instructions}\n\n`;
    }

    if (params?.requirements) {
      prompt += `Requirements:\n${params.requirements}\n\n`;
    }

    prompt += `Please replace the code according to the instructions. Only output the replaced code, no explanations.`;

    return prompt;
  }

  /**
   * 构建重构提示词
   */
  private buildRefactorPrompt(
    code: string,
    language: string,
    params?: Record<string, any>
  ): string {
    let prompt = `Language: ${language}\n\n`;
    prompt += `Original Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;

    if (params?.refactorType) {
      prompt += `Refactor Type: ${params.refactorType}\n\n`;
    }

    prompt += `Refactoring Goals:\n`;
    prompt += `- Improve code readability\n`;
    prompt += `- Reduce code duplication\n`;
    prompt += `- Apply design patterns\n`;
    prompt += `- Enhance maintainability\n`;
    prompt += `- Follow best practices\n\n`;

    prompt += `Please refactor the code. Only output the refactored code, no explanations.`;

    return prompt;
  }

  /**
   * 构建优化提示词
   */
  private buildOptimizePrompt(
    code: string,
    language: string,
    params?: Record<string, any>
  ): string {
    let prompt = `Language: ${language}\n\n`;
    prompt += `Original Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;

    prompt += `Optimization Goals:\n`;
    prompt += `- Improve performance\n`;
    prompt += `- Reduce memory usage\n`;
    prompt += `- Optimize algorithms\n`;
    prompt += `- Enhance efficiency\n\n`;

    prompt += `Please optimize the code. Provide:\n`;
    prompt += `1. The optimized code\n`;
    prompt += `2. A brief explanation of optimizations made\n\n`;

    prompt += `Format your response as:\n`;
    prompt += `OPTIMIZED_CODE:\n\`\`\`${language}\n[optimized code here]\n\`\`\`\n\n`;
    prompt += `EXPLANATION:\n[explanation here]`;

    return prompt;
  }

  /**
   * 构建格式化提示词
   */
  private buildFormatPrompt(
    code: string,
    language: string,
    params?: Record<string, any>
  ): string {
    let prompt = `Language: ${language}\n\n`;
    prompt += `Original Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;

    if (params?.style) {
      prompt += `Style: ${params.style}\n\n`;
    }

    prompt += `Please format the code according to best practices and conventions. Only output the formatted code, no explanations.`;

    return prompt;
  }

  /**
   * 构建测试生成提示词
   */
  private buildTestGenerationPrompt(
    code: string,
    language: string,
    params?: Record<string, any>
  ): string {
    let prompt = `Language: ${language}\n\n`;
    prompt += `Code to Test:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;

    if (params?.testFramework) {
      prompt += `Test Framework: ${params.testFramework}\n\n`;
    }

    prompt += `Please generate comprehensive test cases. Include:\n`;
    prompt += `- Unit tests\n`;
    prompt += `- Edge cases\n`;
    prompt += `- Error handling tests\n`;
    prompt += `- Integration tests (if applicable)\n\n`;

    prompt += `Only output the test code, no explanations.`;

    return prompt;
  }

  /**
   * 构建文档生成提示词
   */
  private buildDocumentationPrompt(
    code: string,
    language: string,
    params?: Record<string, any>
  ): string {
    let prompt = `Language: ${language}\n\n`;
    prompt += `Code to Document:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;

    if (params?.docType) {
      prompt += `Documentation Type: ${params.docType}\n\n`;
    }

    prompt += `Please generate documentation. Include:\n`;
    prompt += `- Function/class description\n`;
    prompt += `- Parameters and return values\n`;
    prompt += `- Usage examples\n`;
    prompt += `- Edge cases and limitations\n`;
    prompt += `- Best practices\n\n`;

    prompt += `Format as Markdown.`;

    return prompt;
  }

  /**
   * 使用Prettier格式化
   */
  private async formatWithPrettier(code: string, language?: string): Promise<string> {
    // 实现Prettier格式化逻辑
    // 与项目代码格式化保持一致
    return code;
  }

  /**
   * 解析优化响应
   */
  private parseOptimizationResponse(content: string): { optimizedCode: string; explanation: string } {
    const optimizedCodeMatch = content.match(/OPTIMIZED_CODE:\n```(?:\w+)?\n([\s\S]*?)\n```/);
    const explanationMatch = content.match(/EXPLANATION:\n([\s\S]*)/);

    return {
      optimizedCode: optimizedCodeMatch?.[1]?.trim() || '',
      explanation: explanationMatch?.[1]?.trim() || '',
    };
  }

  /**
   * 复制到剪贴板
   */
  private async copyToClipboard(text: string): Promise<void> {
    // 与项目剪贴板功能保持一致
    await navigator.clipboard.writeText(text);
  }

  /**
   * 添加到剪贴板历史
   */
  private async addToClipboardHistory(item: Omit<ClipboardHistoryItem, 'id' | 'copiedAt' | 'size'>): Promise<void> {
    // 实现剪贴板历史逻辑
    const historyItem: ClipboardHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      copiedAt: Date.now(),
      size: item.content.length,
    };

    // 保存到历史记录
    const history = JSON.parse(localStorage.getItem('clipboard-history') || '[]');
    history.unshift(historyItem);

    // 只保留最近50条
    if (history.length > 50) {
      history.pop();
    }

    localStorage.setItem('clipboard-history', JSON.stringify(history));
  }

  /**
   * 转义HTML
   */
  private escapeHTML(text: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
  }
}

export const codeActionsService = new CodeActionsService();
```

---

## 📄 文档操作

### 智能文档操作服务

```typescript
// src/services/actions/DocumentActions.ts
import { aiProviderManager } from '../../ai/AIProviderManager';
import type { Action, ActionContext, ActionConfig } from '@/types/actions';

/**
 * 文档操作服务类
 */
export class DocumentActionsService {
  /**
   * 格式化文档
   */
  async formatDocument(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection } = context;

    if (!selection.text) {
      throw new Error('No text selected');
    }

    const prompt = this.buildFormatPrompt(selection.text, config.params);

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert document formatter. Format documents for readability and consistency.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.3,
      maxTokens: config.maxTokens || 4096,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 转换文档格式
   */
  async convertDocument(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection } = context;

    if (!selection.text) {
      throw new Error('No text selected');
    }

    const prompt = this.buildConvertPrompt(
      selection.text,
      config.params?.fromFormat || 'text',
      config.params?.toFormat || 'markdown'
    );

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert document converter. Convert documents between formats accurately.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.3,
      maxTokens: config.maxTokens || 4096,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 导出文档
   */
  async exportDocument(
    context: ActionContext,
    config: ActionConfig
  ): Promise<Blob> {
    const { selection } = context;

    if (!selection.text) {
      throw new Error('No text selected');
    }

    const format = config.params?.format || 'markdown';
    const content = selection.text;

    let mimeType: string;
    let filename: string;

    switch (format) {
      case 'pdf':
        mimeType = 'application/pdf';
        filename = 'document.pdf';
        break;
      case 'html':
        mimeType = 'text/html';
        filename = 'document.html';
        break;
      case 'txt':
        mimeType = 'text/plain';
        filename = 'document.txt';
        break;
      case 'markdown':
      default:
        mimeType = 'text/markdown';
        filename = 'document.md';
        break;
    }

    return new Blob([content], { type: mimeType });
  }

  /**
   * 生成文档摘要
   */
  async summarizeDocument(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection } = context;

    if (!selection.text) {
      throw new Error('No text selected');
    }

    const prompt = this.buildSummarizePrompt(selection.text, config.params);

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert document summarizer. Create clear and concise summaries.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.5,
      maxTokens: config.maxTokens || 2048,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 构建格式化提示词
   */
  private buildFormatPrompt(text: string, params?: Record<string, any>): string {
    let prompt = `Original Text:\n${text}\n\n`;

    if (params?.format) {
      prompt += `Format: ${params.format}\n\n`;
    }

    if (params?.style) {
      prompt += `Style: ${params.style}\n\n`;
    }

    prompt += `Please format the document for better readability and consistency. Only output the formatted text, no explanations.`;

    return prompt;
  }

  /**
   * 构建转换提示词
   */
  private buildConvertPrompt(text: string, fromFormat: string, toFormat: string): string {
    let prompt = `Original Text (${fromFormat}):\n${text}\n\n`;
    prompt += `Please convert the document to ${toFormat} format. Maintain all content and structure. Only output the converted text, no explanations.`;

    return prompt;
  }

  /**
   * 构建摘要提示词
   */
  private buildSummarizePrompt(text: string, params?: Record<string, any>): string {
    let prompt = `Original Text:\n${text}\n\n`;

    if (params?.length) {
      prompt += `Summary Length: ${params.length}\n\n`;
    }

    if (params?.focus) {
      prompt += `Focus: ${params.focus}\n\n`;
    }

    prompt += `Please create a summary of the document. Include:\n`;
    prompt += `- Main points\n`;
    prompt += `- Key insights\n`;
    prompt += `- Important details\n`;
    prompt += `- Conclusions (if applicable)\n\n`;

    prompt += `Format as Markdown.`;

    return prompt;
  }
}

export const documentActionsService = new DocumentActionsService();
```

---

## 📝 文本操作

### 智能文本操作服务

```typescript
// src/services/actions/TextActions.ts
import { aiProviderManager } from '../../ai/AIProviderManager';
import type { Action, ActionContext, ActionConfig } from '@/types/actions';

/**
 * 文本操作服务类
 */
export class TextActionsService {
  /**
   * 翻译文本
   */
  async translateText(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection } = context;

    if (!selection.text) {
      throw new Error('No text selected');
    }

    const prompt = this.buildTranslatePrompt(
      selection.text,
      config.params?.fromLanguage || 'auto',
      config.params?.toLanguage || 'en'
    );

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert translator. Translate text accurately while maintaining tone and context.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.3,
      maxTokens: config.maxTokens || 2048,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 改写文本
   */
  async rewriteText(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection } = context;

    if (!selection.text) {
      throw new Error('No text selected');
    }

    const prompt = this.buildRewritePrompt(selection.text, config.params);

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert writer. Rewrite text for clarity, conciseness, and impact.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2048,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 扩展文本
   */
  async expandText(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection } = context;

    if (!selection.text) {
      throw new Error('No text selected');
    }

    const prompt = this.buildExpandPrompt(selection.text, config.params);

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert writer. Expand text with relevant details and examples.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2048,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 纠正文本
   */
  async correctText(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection } = context;

    if (!selection.text) {
      throw new Error('No text selected');
    }

    const prompt = this.buildCorrectPrompt(selection.text);

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert editor. Correct grammar, spelling, and punctuation errors.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.3,
      maxTokens: config.maxTokens || 2048,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 构建翻译提示词
   */
  private buildTranslatePrompt(text: string, fromLanguage: string, toLanguage: string): string {
    let prompt = `Original Text (${fromLanguage}):\n${text}\n\n`;
    prompt += `Please translate the text to ${toLanguage}. Maintain tone, context, and meaning. Only output the translated text, no explanations.`;

    return prompt;
  }

  /**
   * 构建改写提示词
   */
  private buildRewritePrompt(text: string, params?: Record<string, any>): string {
    let prompt = `Original Text:\n${text}\n\n`;

    if (params?.style) {
      prompt += `Style: ${params.style}\n\n`;
    }

    if (params?.tone) {
      prompt += `Tone: ${params.tone}\n\n`;
    }

    if (params?.length) {
      prompt += `Length: ${params.length}\n\n`;
    }

    prompt += `Please rewrite the text. Improve clarity, conciseness, and impact. Only output the rewritten text, no explanations.`;

    return prompt;
  }

  /**
   * 构建扩展提示词
   */
  private buildExpandPrompt(text: string, params?: Record<string, any>): string {
    let prompt = `Original Text:\n${text}\n\n`;

    if (params?.focus) {
      prompt += `Focus: ${params.focus}\n\n`;
    }

    if (params?.length) {
      prompt += `Target Length: ${params.length}\n\n`;
    }

    prompt += `Please expand the text with relevant details, examples, and explanations. Only output the expanded text, no explanations.`;

    return prompt;
  }

  /**
   * 构建纠错提示词
   */
  private buildCorrectPrompt(text: string): string {
    let prompt = `Original Text:\n${text}\n\n`;
    prompt += `Please correct any grammar, spelling, and punctuation errors. Maintain the original meaning and style. Only output the corrected text, no explanations.`;

    return prompt;
  }
}

export const textActionsService = new TextActionsService();
```

---

## 🤖 AI辅助操作

### AI辅助操作服务

```typescript
// src/services/actions/AIActions.ts
import { aiProviderManager } from '../../ai/AIProviderManager';
import type { Action, ActionContext, ActionConfig } from '@/types/actions';

/**
 * AI辅助操作服务类
 */
export class AIActionsService {
  /**
   * 解释代码
   */
  async explainCode(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection, file } = context;

    if (!selection.text) {
      throw new Error('No code selected');
    }

    const prompt = this.buildExplainPrompt(
      selection.text,
      file?.language || 'text',
      config.params
    );

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code educator. Explain code clearly and comprehensively.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.5,
      maxTokens: config.maxTokens || 2048,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 生成代码注释
   */
  async generateComments(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection, file } = context;

    if (!selection.text) {
      throw new Error('No code selected');
    }

    const prompt = this.buildCommentsPrompt(
      selection.text,
      file?.language || 'text',
      config.params
    );

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code commenter. Add clear and helpful comments to code.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.3,
      maxTokens: config.maxTokens || 4096,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 查找代码问题
   */
  async findIssues(
    context: ActionContext,
    config: ActionConfig
  ): Promise<string> {
    const { selection, file } = context;

    if (!selection.text) {
      throw new Error('No code selected');
    }

    const prompt = this.buildIssuesPrompt(
      selection.text,
      file?.language || 'text',
      config.params
    );

    const aiConfig = {
      provider: await aiProviderManager.selectProvider(),
      model: config.aiModel || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. Identify bugs, security issues, and performance problems.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.5,
      maxTokens: config.maxTokens || 2048,
      stream: false,
    };

    const response = await aiProviderManager.request(aiConfig);
    return response.content;
  }

  /**
   * 构建解释提示词
   */
  private buildExplainPrompt(code: string, language: string, params?: Record<string, any>): string {
    let prompt = `Language: ${language}\n\n`;
    prompt += `Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;

    if (params?.detailLevel) {
      prompt += `Detail Level: ${params.detailLevel}\n\n`;
    }

    if (params?.audience) {
      prompt += `Target Audience: ${params.audience}\n\n`;
    }

    prompt += `Please explain this code. Include:\n`;
    prompt += `- Overall purpose and functionality\n`;
    prompt += `- Key components and their roles\n`;
    prompt += `- How the code works\n`;
    prompt += `- Important patterns or techniques used\n`;
    prompt += `- Potential improvements or issues (if any)\n\n`;

    prompt += `Format as Markdown.`;

    return prompt;
  }

  /**
   * 构建注释生成提示词
   */
  private buildCommentsPrompt(code: string, language: string, params?: Record<string, any>): string {
    let prompt = `Language: ${language}\n\n`;
    prompt += `Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;

    if (params?.commentStyle) {
      prompt += `Comment Style: ${params.commentStyle}\n\n`;
    }

    prompt += `Please add comments to the code. Include:\n`;
    prompt += `- Function/class descriptions\n`;
    prompt += `- Parameter and return value explanations\n`;
    prompt += `- Complex logic explanations\n`;
    prompt += `- Algorithm explanations (if applicable)\n\n`;

    prompt += `Only output the commented code, no explanations.`;

    return prompt;
  }

  /**
   * 构建问题查找提示词
   */
  private buildIssuesPrompt(code: string, language: string, params?: Record<string, any>): string {
    let prompt = `Language: ${language}\n\n`;
    prompt += `Code:\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;

    if (params?.issueTypes) {
      prompt += `Issue Types: ${params.issueTypes}\n\n`;
    }

    prompt += `Please identify issues in the code. Look for:\n`;
    prompt += `- Bugs and errors\n`;
    prompt += `- Security vulnerabilities\n`;
    prompt += `- Performance problems\n`;
    prompt += `- Code smells\n`;
    prompt += `- Best practices violations\n\n`;

    prompt += `For each issue, provide:\n`;
    prompt += `- Issue type\n`;
    prompt += `- Severity\n`;
    prompt += `- Location\n`;
    prompt += `- Description\n`;
    prompt += `- Suggested fix\n\n`;

    prompt += `Format as Markdown.`;

    return prompt;
  }
}

export const aiActionsService = new AIActionsService();
```

---

## ✅ 验收标准

### 功能完整性

- ✅ 代码操作完善
- ✅ 文档操作准确
- ✅ 文本操作智能
- ✅ AI辅助有效
- ✅ 批量操作高效

### 用户体验

- ✅ 操作响应及时
- ✅ 结果准确可靠
- ✅ 交互流畅自然
- ✅ 错误处理完善

### 代码质量

- ✅ 代码结构清晰
- ✅ 类型定义完整
- ✅ 注释文档完整
- ✅ 代码可维护性好

---

## 🔄 版本历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-03-17 | 初始版本，建立一键操作交互功能 | YanYuCloudCube Team |

---

## 📞 联系方式

- **维护团队**: YanYuCloudCube Team
- **联系邮箱**: admin@0379.email
- **项目地址**: https://github.com/YYC-Cube/

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
