# YYC³ 测试快速参考卡

> 📋 常用测试命令和代码片段速查表

---

## 🚀 快速命令

### 基础测试

```bash
# 运行所有测试
pnpm test

# 监听模式（开发时）
pnpm test:watch

# UI 界面
pnpm test:ui

# 覆盖率报告
pnpm test:coverage

# 运行特定文件
pnpm test path/to/test.ts
```

### E2E 测试

```bash
# 运行所有 E2E
pnpm test:e2e

# UI 模式
pnpm test:e2e:ui

# 调试模式
pnpm test:e2e:debug

# 特定浏览器
pnpm test:e2e --project=chromium
```

---

## 📝 常用代码片段

### 1. 基础组件测试模板

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('应该渲染', () => {
    render(<YourComponent />);
    expect(screen.getByText('内容')).toBeInTheDocument();
  });
});
```

### 2. Hook 测试模板

```typescript
import { renderHook, act } from '@testing-library/react';
import { useYourHook } from './useYourHook';

it('应该正确更新状态', () => {
  const { result } = renderHook(() => useYourHook());
  
  act(() => {
    result.current.update('new value');
  });
  
  expect(result.current.value).toBe('new value');
});
```

### 3. 用户交互测试

```typescript
import userEvent from '@testing-library/user-event';

it('应该响应点击', async () => {
  const user = userEvent.setup();
  render(<Button />);
  
  await user.click(screen.getByRole('button'));
  
  expect(screen.getByText('Clicked')).toBeInTheDocument();
});
```

### 4. 异步测试

```typescript
import { waitFor } from '@testing-library/react';

it('应该加载数据', async () => {
  render(<AsyncComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### 5. 主题测试模板

```typescript
const TestWrapper = ({ theme, children }) => (
  <ThemeSwitcherProvider defaultTheme={theme}>
    {children}
  </ThemeSwitcherProvider>
);

describe.each(['cyberpunk', 'liquidGlass'])('主题: %s', (theme) => {
  it('应该正确渲染', () => {
    render(<Component />, { wrapper: () => <TestWrapper theme={theme} /> });
    // 断言...
  });
});
```

### 6. E2E 测试模板

```typescript
import { test, expect } from '@playwright/test';

test('功能描述', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="button"]');
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

---

## 🎯 常用断言

### Testing Library

```typescript
// 存在性
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// 可见性
expect(element).toBeVisible();
expect(element).not.toBeVisible();

// 文本内容
expect(element).toHaveTextContent('text');
expect(element).toContainHTML('<span>text</span>');

// 属性
expect(element).toHaveAttribute('attr', 'value');
expect(element).toHaveClass('classname');
expect(element).toHaveStyle({ color: 'red' });

// 表单
expect(input).toHaveValue('value');
expect(checkbox).toBeChecked();
expect(select).toHaveDisplayValue('Option 1');
```

### Vitest

```typescript
// 基础
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// 数字
expect(num).toBeGreaterThan(5);
expect(num).toBeLessThan(10);
expect(num).toBeCloseTo(0.3, 5);

// 字符串
expect(str).toContain('substring');
expect(str).toMatch(/regex/);

// 数组/对象
expect(arr).toContain(item);
expect(arr).toHaveLength(3);
expect(obj).toHaveProperty('key', 'value');

// 异常
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('Error message');

// 异步
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

### Playwright

```typescript
// 元素状态
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();

// 内容
await expect(locator).toHaveText('text');
await expect(locator).toContainText('text');
await expect(locator).toHaveValue('value');

// 属性
await expect(locator).toHaveAttribute('attr', 'value');
await expect(locator).toHaveClass('classname');

// 页面
await expect(page).toHaveURL('url');
await expect(page).toHaveTitle('title');

// 数量
await expect(locator).toHaveCount(5);
```

---

## 🔍 常用查询

### Testing Library

```typescript
// By Role（推荐）
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /username/i });

// By Label Text
screen.getByLabelText('Username');

// By Placeholder
screen.getByPlaceholderText('Enter text');

// By Text
screen.getByText('Hello World');
screen.getByText(/hello/i);

// By TestId
screen.getByTestId('custom-element');

// 变体
getBy...     // 找不到会报错
queryBy...   // 找不到返回 null
findBy...    // 异步查询（返回 Promise）

// 多个元素
getAllBy...
queryAllBy...
findAllBy...
```

### Playwright

```typescript
// 基础选择器
page.locator('css selector');
page.locator('[data-testid="id"]');
page.locator('text=Submit');
page.locator('button:has-text("Submit")');

// Role 选择器
page.getByRole('button', { name: 'Submit' });
page.getByRole('textbox', { name: 'Username' });

// 语义选择器
page.getByText('Hello');
page.getByLabel('Username');
page.getByPlaceholder('Search');
page.getByTestId('custom');
```

---

## 🛠️ Mock 常用模式

### Mock 函数

```typescript
import { vi } from 'vitest';

// 创建 Mock
const mockFn = vi.fn();

// Mock 返回值
mockFn.mockReturnValue(42);
mockFn.mockReturnValueOnce(1).mockReturnValueOnce(2);

// Mock 异步
mockFn.mockResolvedValue('success');
mockFn.mockRejectedValue(new Error('fail'));

// 验证调用
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
```

### Mock 模块

```typescript
// Mock 整个模块
vi.mock('./module', () => ({
  exportedFunction: vi.fn(),
}));

// Partial Mock
vi.mock('./module', async () => {
  const actual = await vi.importActual('./module');
  return {
    ...actual,
    specificFunction: vi.fn(),
  };
});
```

### Mock 浏览器 API

```typescript
// localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ data: 'mock' }),
  })
) as any;

// matchMedia
window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));
```

---

## ⏱️ 定时器控制

```typescript
import { vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('定时器测试', () => {
  const callback = vi.fn();
  setTimeout(callback, 1000);
  
  // 快进时间
  vi.advanceTimersByTime(1000);
  
  expect(callback).toHaveBeenCalled();
});

// 也可以
vi.runAllTimers();        // 运行所有定时器
vi.runOnlyPendingTimers(); // 只运行当前 pending 的
```

---

## 🎨 主题测试快捷方式

```typescript
// 双主题参数化测试
const themes = [
  { name: 'cyberpunk', primary: '#00f0ff' },
  { name: 'liquidGlass', primary: '#00ff87' },
];

describe.each(themes)('$name 主题', ({ name, primary }) => {
  it('应该有正确的主色', () => {
    // 测试代码...
  });
});
```

---

## 📊 覆盖率阈值

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    },
  },
});
```

---

## 🐛 调试技巧

### Vitest 调试

```typescript
// 使用 screen.debug()
import { screen } from '@testing-library/react';

it('调试测试', () => {
  render(<Component />);
  screen.debug(); // 打印当前 DOM
});

// 使用 console.log
console.log(screen.getByTestId('element').textContent);
```

### Playwright 调试

```typescript
// 使用 page.pause()
await page.pause(); // 暂停执行，打开调试器

// 查看截图
await page.screenshot({ path: 'screenshot.png' });

// 查看页面内容
console.log(await page.content());
```

---

## ✅ 测试检查清单

```bash
# 提交前运行
□ pnpm test          # 单元测试通过
□ pnpm test:coverage # 覆盖率达标
□ pnpm test:e2e      # E2E 测试通过
□ npm run lint       # Lint 通过
```

---

## 📚 常用文档链接

- [完整测试用例](/TEST_SUITES.md)
- [测试执行指南](/TESTING_GUIDE.md)
- [测试代码示例](/TESTING_EXAMPLES.md)
- [实施总结](/TESTING_IMPLEMENTATION_SUMMARY.md)

---

**快速参考版本**: v1.0.0  
**打印友好**: 适合打印/贴在墙上 😊
