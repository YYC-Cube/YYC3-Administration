# YYC³ 测试执行指南

> **YYC³ AI Marketing Automation Terminal - Testing Guide**  
> 快速开始测试，确保代码质量

---

## 📦 安装测试依赖

首先安装所有必需的测试依赖：

```bash
# 安装 Vitest 和 Testing Library
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# 安装覆盖率工具
pnpm add -D @vitest/coverage-c8

# 安装 Playwright
pnpm add -D @playwright/test

# 安装 Playwright 浏览器
pnpm exec playwright install
```

---

## 🚀 快速开始

### 1. 运行所有单元测试

```bash
pnpm test
```

### 2. 运行单元测试（监听模式）

```bash
pnpm test:watch
```

### 3. 运行单元测试（带 UI 界面）

```bash
pnpm test:ui
```

### 4. 生成覆盖率报告

```bash
pnpm test:coverage
```

### 5. 运行 E2E 测试

```bash
# 运行所有 E2E 测试
pnpm test:e2e

# 运行 E2E 测试（带 UI 界面）
pnpm test:e2e:ui

# 运行特定浏览器的 E2E 测试
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit
```

### 6. 运行特定测试文件

```bash
# 单元测试
pnpm test tests/hooks/use-theme-colors.test.ts

# E2E 测试
pnpm test:e2e tests/e2e/chat-workflow.spec.ts
```

---

## 📝 package.json 脚本配置

将以下脚本添加到 `package.json` 的 `scripts` 部分：

```json
{
  "scripts": {
    "build": "vite build",
    
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    
    "test:all": "pnpm test && pnpm test:e2e",
    "test:ci": "pnpm test:coverage && pnpm test:e2e --reporter=github"
  }
}
```

---

## 📂 项目测试结构

```
yyc3-project/
├── tests/
│   ├── setup.ts                    # Vitest 全局配置
│   ├── hooks/                      # Hook 单元测试
│   │   ├── use-theme-colors.test.ts
│   │   ├── use-app.test.ts
│   │   └── use-i18n.test.ts
│   ├── components/                 # 组件测试
│   │   ├── neon-card.test.tsx
│   │   ├── glitch-text.test.tsx
│   │   ├── chat-interface.test.tsx
│   │   └── dashboard-page.test.tsx
│   ├── integration/                # 集成测试
│   │   ├── theme-system.test.tsx
│   │   └── i18n-system.test.tsx
│   └── e2e/                        # E2E 测试
│       ├── chat-workflow.spec.ts
│       ├── contact-management.spec.ts
│       ├── theme-switching.spec.ts
│       └── navigation.spec.ts
├── vitest.config.ts                # Vitest 配置
├── playwright.config.ts            # Playwright 配置
├── TEST_SUITES.md                  # 测试用例文档
└── TESTING_GUIDE.md                # 本文档
```

---

## 🎯 测试最佳实践

### 1. 测试命名规范

```typescript
describe('组件/功能名称', () => {
  describe('测试场景分组', () => {
    it('应该做什么 / should do something', () => {
      // 测试代码
    });
  });
});
```

### 2. AAA 模式（Arrange-Act-Assert）

```typescript
it('应该正确切换主题', () => {
  // Arrange - 准备测试数据和环境
  const { result } = renderHook(() => useThemeColors(), {
    wrapper: createWrapper('cyberpunk'),
  });

  // Act - 执行操作
  act(() => {
    result.current.switchTheme('liquidGlass');
  });

  // Assert - 验证结果
  expect(result.current.mode).toBe('liquidGlass');
});
```

### 3. 使用 data-testid 标识元素

```tsx
// 组件中
<div data-testid="chat-interface">
  <input data-testid="chat-input" />
  <button data-testid="chat-send-button">发送</button>
</div>

// 测试中
const input = screen.getByTestId('chat-input');
const button = screen.getByTestId('chat-send-button');
```

### 4. Mock 外部依赖

```typescript
import { vi } from 'vitest';

// Mock API 调用
vi.mock('./api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'mock data' })),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;
```

---

## 📊 覆盖率报告

### 查看覆盖率报告

运行测试后，打开生成的 HTML 报告：

```bash
# 生成覆盖率报告
pnpm test:coverage

# 打开 HTML 报告
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

### 覆盖率目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| Statements | ≥ 80% | 语句覆盖率 |
| Branches | ≥ 80% | 分支覆盖率 |
| Functions | ≥ 80% | 函数覆盖率 |
| Lines | ≥ 80% | 行覆盖率 |

---

## 🐛 调试测试

### 1. Vitest 调试

**方法 1: 使用 Vitest UI**

```bash
pnpm test:ui
```

打开 UI 界面后，可以：
- 查看测试结果
- 单独运行/调试某个测试
- 查看错误堆栈

**方法 2: 使用 console.log**

```typescript
it('调试测试', () => {
  const result = someFunction();
  console.log('Result:', result);
  expect(result).toBe(expected);
});
```

**方法 3: 使用 VS Code 调试器**

在 `.vscode/launch.json` 添加配置：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest Tests",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test", "--run"],
      "console": "integratedTerminal"
    }
  ]
}
```

### 2. Playwright 调试

**方法 1: 使用 Debug 模式**

```bash
pnpm test:e2e:debug
```

这会打开 Playwright Inspector，可以：
- 单步执行测试
- 查看页面截图
- 检查元素选择器

**方法 2: 使用 Headed 模式**

```bash
pnpm test:e2e:headed
```

在有界面的浏览器中运行测试，可以看到实际操作。

**方法 3: 使用 Trace Viewer**

```bash
# 运行测试（失败时自动保存 trace）
pnpm test:e2e

# 查看 trace
pnpm exec playwright show-trace trace.zip
```

---

## 🔄 CI/CD 集成

### GitHub Actions 示例

在 `.github/workflows/test.yml` 创建工作流：

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## 🎨 测试主题系统

由于项目有双主题系统，测试时需要特别注意：

### 1. 测试两种主题

```typescript
describe.each([
  ['cyberpunk', '#00f0ff'],
  ['liquidGlass', '#00ff87'],
])('主题: %s', (theme, primaryColor) => {
  it(`应该在 ${theme} 主题下正确渲染`, () => {
    const { result } = renderHook(() => useThemeColors(), {
      wrapper: createWrapper(theme as any),
    });
    
    expect(result.current.primary).toBe(primaryColor);
  });
});
```

### 2. 测试主题切换

```typescript
it('应该支持主题切换', () => {
  const { result, rerender } = renderHook(() => useThemeColors(), {
    wrapper: createWrapper('cyberpunk'),
  });
  
  expect(result.current.isCyberpunk).toBe(true);
  
  // 切换主题
  rerender({ theme: 'liquidGlass' });
  
  expect(result.current.isLiquidGlass).toBe(true);
});
```

---

## 📈 持续监控

### 1. 测试执行时间监控

```bash
# 查看慢速测试
pnpm test -- --reporter=verbose
```

### 2. 覆盖率趋势

使用 Codecov 或 Coveralls 跟踪覆盖率变化。

### 3. E2E 测试稳定性

监控 E2E 测试的失败率和重试率。

---

## 🆘 常见问题

### Q1: 测试报错 "Cannot find module"

**解决方案**:
```bash
# 清理缓存
pnpm vitest --clearCache

# 重新安装依赖
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Q2: E2E 测试超时

**解决方案**:
```typescript
// 增加超时时间
test('长时间操作', async ({ page }) => {
  test.setTimeout(120000); // 2分钟
  // ...
});
```

### Q3: Mock 不生效

**解决方案**:
```typescript
// 确保 Mock 在 import 之前
vi.mock('./module');
import { useModule } from './module';

// 或使用 vi.doMock
vi.doMock('./module', () => ({
  useModule: vi.fn(),
}));
```

### Q4: 快照测试失败

**解决方案**:
```bash
# 更新快照
pnpm test -u

# 或针对特定文件
pnpm test tests/components/neon-card.test.tsx -u
```

---

## 📚 学习资源

- [Vitest 官方文档](https://vitest.dev/)
- [Testing Library 指南](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright 文档](https://playwright.dev/)
- [测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## ✅ 测试检查清单

在提交 PR 前，确保：

- [ ] 所有单元测试通过
- [ ] 覆盖率达到 80%+
- [ ] 新功能有对应测试
- [ ] E2E 测试通过（至少 chromium）
- [ ] 无测试警告
- [ ] 代码通过 Lint 检查
- [ ] 双主题都测试过

---

**文档版本**: v1.0.0  
**最后更新**: 2026-03-15  
**维护者**: YYC³ Test Engineering Team

---

## 🎉 开始测试吧！

```bash
# 一键运行所有测试
pnpm test:all
```

祝测试顺利！🚀
