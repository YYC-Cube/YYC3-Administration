# YYC³ 测试代码示例大全

> 涵盖各种测试场景的实用代码示例

---

## 📑 目录

1. [Hooks 测试示例](#hooks-测试示例)
2. [组件测试示例](#组件测试示例)
3. [集成测试示例](#集成测试示例)
4. [E2E 测试示例](#e2e-测试示例)
5. [Mock 技巧](#mock-技巧)
6. [异步测试](#异步测试)
7. [主题系统测试](#主题系统测试)

---

## 1. Hooks 测试示例

### 1.1 基础 Hook 测试

```typescript
// tests/hooks/use-app.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApp, AppProvider } from '@/app/components/app-context';
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('useApp Hook', () => {
  it('应该返回默认状态', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    expect(result.current.activePage).toBe('dashboard');
    expect(result.current.appMode).toBe('standalone');
  });

  it('应该正确切换页面', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    act(() => {
      result.current.setActivePage('chat');
    });
    
    expect(result.current.activePage).toBe('chat');
  });

  it('应该正确切换应用模式', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    act(() => {
      result.current.setAppMode('widget');
    });
    
    expect(result.current.appMode).toBe('widget');
  });
});
```

### 1.2 带依赖的 Hook 测试

```typescript
// tests/hooks/use-i18n.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useI18n, I18nProvider } from '@/app/components/i18n-context';
import { ReactNode } from 'react';

const createWrapper = (initialLang: 'zh' | 'en' = 'zh') => {
  return ({ children }: { children: ReactNode }) => (
    <I18nProvider defaultLanguage={initialLang}>
      {children}
    </I18nProvider>
  );
};

describe('useI18n Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('应该使用默认语言', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: createWrapper('zh'),
    });
    
    expect(result.current.language).toBe('zh');
  });

  it('应该正确切换语言', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: createWrapper('zh'),
    });
    
    act(() => {
      result.current.setLanguage('en');
    });
    
    expect(result.current.language).toBe('en');
  });

  it('应该正确翻译文本', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: createWrapper('zh'),
    });
    
    const translated = result.current.t('nav.dashboard');
    expect(translated).toBe('数据驾驶舱');
  });

  it('不存在的键应该返回键名', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: createWrapper('zh'),
    });
    
    const translated = result.current.t('non.existent.key');
    expect(translated).toBe('non.existent.key');
  });

  it('应该持久化语言选择', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: createWrapper('zh'),
    });
    
    act(() => {
      result.current.setLanguage('en');
    });
    
    expect(localStorage.getItem('yyc_language')).toBe('en');
  });
});
```

---

## 2. 组件测试示例

### 2.1 基础组件测试

```typescript
// tests/components/glitch-text.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlitchText } from '@/app/components/glitch-text';
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeSwitcherProvider defaultTheme="cyberpunk">
    {children}
  </ThemeSwitcherProvider>
);

describe('GlitchText Component', () => {
  it('应该渲染文本内容', () => {
    render(
      <TestWrapper>
        <GlitchText>Hello World</GlitchText>
      </TestWrapper>
    );
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('应该应用故障效果类名', () => {
    const { container } = render(
      <TestWrapper>
        <GlitchText>Glitch</GlitchText>
      </TestWrapper>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('glitch');
  });

  it('应该支持自定义 className', () => {
    const { container } = render(
      <TestWrapper>
        <GlitchText className="custom-class">Text</GlitchText>
      </TestWrapper>
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('custom-class');
  });
});
```

### 2.2 交互式组件测试

```typescript
// tests/components/theme-switcher-button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSwitcherButtonCompact } from '@/app/components/theme-switcher-button';
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context';

describe('ThemeSwitcherButton Component', () => {
  it('应该显示当前主题图标', () => {
    render(
      <ThemeSwitcherProvider defaultTheme="cyberpunk">
        <ThemeSwitcherButtonCompact />
      </ThemeSwitcherProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('点击应该切换主题', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeSwitcherProvider defaultTheme="cyberpunk">
        <ThemeSwitcherButtonCompact />
      </ThemeSwitcherProvider>
    );
    
    const button = screen.getByRole('button');
    
    // 点击切换
    await user.click(button);
    
    // 验证主题已切换（通过检查 localStorage 或其他方式）
    expect(localStorage.getItem('yyc_theme')).toBe('liquidGlass');
  });

  it('应该支持键盘操作', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeSwitcherProvider defaultTheme="cyberpunk">
        <ThemeSwitcherButtonCompact />
      </ThemeSwitcherProvider>
    );
    
    const button = screen.getByRole('button');
    button.focus();
    
    // 按 Enter 键
    await user.keyboard('{Enter}');
    
    expect(localStorage.getItem('yyc_theme')).toBe('liquidGlass');
  });
});
```

### 2.3 复杂业务组件测试

```typescript
// tests/components/contact-book.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactBook } from '@/app/components/contact-book';
import { ContactsProvider } from '@/app/components/contacts-context';
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context';
import { I18nProvider } from '@/app/components/i18n-context';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeSwitcherProvider defaultTheme="cyberpunk">
    <I18nProvider>
      <ContactsProvider>
        {children}
      </ContactsProvider>
    </I18nProvider>
  </ThemeSwitcherProvider>
);

describe('ContactBook Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('应该渲染联系人列表', async () => {
    render(
      <AllProviders>
        <ContactBook />
      </AllProviders>
    );
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText(/联系人/i)).toBeInTheDocument();
    });
  });

  it('应该支持搜索联系人', async () => {
    const user = userEvent.setup();
    
    render(
      <AllProviders>
        <ContactBook />
      </AllProviders>
    );
    
    // 找到搜索框
    const searchInput = screen.getByPlaceholderText(/搜索/i);
    
    // 输入搜索关键词
    await user.type(searchInput, '张三');
    
    // 验证搜索结果
    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
    });
  });

  it('应该支持添加联系人', async () => {
    const user = userEvent.setup();
    
    render(
      <AllProviders>
        <ContactBook />
      </AllProviders>
    );
    
    // 点击"添加"按钮
    const addButton = screen.getByText(/添加/i);
    await user.click(addButton);
    
    // 填写表单
    await user.type(screen.getByLabelText(/姓名/i), '李四');
    await user.type(screen.getByLabelText(/电话/i), '13800138000');
    
    // 提交
    const submitButton = screen.getByText(/保存/i);
    await user.click(submitButton);
    
    // 验证新联系人出现
    await waitFor(() => {
      expect(screen.getByText('李四')).toBeInTheDocument();
    });
  });

  it('应该支持删除联系人', async () => {
    const user = userEvent.setup();
    
    render(
      <AllProviders>
        <ContactBook />
      </AllProviders>
    );
    
    // 等待联系人加载
    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
    });
    
    // 点击删除按钮
    const deleteButton = screen.getAllByRole('button', { name: /删除/i })[0];
    await user.click(deleteButton);
    
    // 确认删除
    const confirmButton = screen.getByText(/确认/i);
    await user.click(confirmButton);
    
    // 验证联系人已删除
    await waitFor(() => {
      expect(screen.queryByText('张三')).not.toBeInTheDocument();
    });
  });
});
```

---

## 3. 集成测试示例

### 3.1 主题系统集成测试

```typescript
// tests/integration/theme-system.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context';
import { NeonCard } from '@/app/components/neon-card';
import { ThemeSwitcherButtonCompact } from '@/app/components/theme-switcher-button';

describe('主题系统集成测试', () => {
  it('主题切换应该影响所有组件', async () => {
    const user = userEvent.setup();
    
    const { container } = render(
      <ThemeSwitcherProvider defaultTheme="cyberpunk">
        <div>
          <ThemeSwitcherButtonCompact />
          <NeonCard>测试卡片</NeonCard>
        </div>
      </ThemeSwitcherProvider>
    );
    
    // 获取初始主题下的卡片样式
    const card = screen.getByText('测试卡片').parentElement;
    const initialStyle = window.getComputedStyle(card!);
    
    // 点击主题切换按钮
    const themeButton = screen.getByRole('button');
    await user.click(themeButton);
    
    // 获取切换后的卡片样式
    const newStyle = window.getComputedStyle(card!);
    
    // 验证样式发生了变化
    expect(initialStyle.backgroundColor).not.toBe(newStyle.backgroundColor);
  });

  it('主题切换后应该持久化', async () => {
    const user = userEvent.setup();
    
    const { rerender } = render(
      <ThemeSwitcherProvider defaultTheme="cyberpunk">
        <ThemeSwitcherButtonCompact />
      </ThemeSwitcherProvider>
    );
    
    // 切换主题
    await user.click(screen.getByRole('button'));
    
    // 验证 localStorage
    expect(localStorage.getItem('yyc_theme')).toBe('liquidGlass');
    
    // 重新渲染（模拟页面刷新）
    rerender(
      <ThemeSwitcherProvider>
        <ThemeSwitcherButtonCompact />
      </ThemeSwitcherProvider>
    );
    
    // 验证主题保持
    expect(localStorage.getItem('yyc_theme')).toBe('liquidGlass');
  });
});
```

### 3.2 国际化集成测试

```typescript
// tests/integration/i18n-system.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@/app/components/i18n-context';
import { CyberpunkStandalone } from '@/app/components/cyberpunk-standalone';
import { AppProvider } from '@/app/components/app-context';

describe('国际化系统集成测试', () => {
  it('切换语言应该更新所有文本', async () => {
    const user = userEvent.setup();
    
    render(
      <AppProvider>
        <I18nProvider defaultLanguage="zh">
          <CyberpunkStandalone onSwitchMode={() => {}} />
        </I18nProvider>
      </AppProvider>
    );
    
    // 验证中文文本
    expect(screen.getByText('数据驾驶舱')).toBeInTheDocument();
    
    // 切换到英文（假设有语言切换按钮）
    const langButton = screen.getByRole('button', { name: /语言/i });
    await user.click(langButton);
    await user.click(screen.getByText(/English/i));
    
    // 验证英文文本
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

---

## 4. E2E 测试示例

### 4.1 导航测试

```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('导航系统', () => {
  test('应该能够在各页面间切换', async ({ page }) => {
    await page.goto('/');
    
    // 点击 AI 聊天
    await page.click('[data-nav-id="chat"]');
    await expect(page).toHaveURL('/chat');
    
    // 点击仪表盘
    await page.click('[data-nav-id="dashboard"]');
    await expect(page).toHaveURL('/');
    
    // 点击号码库
    await page.click('[data-nav-id="contacts"]');
    await expect(page).toHaveURL('/contacts');
  });

  test('应该支持快捷键导航', async ({ page }) => {
    await page.goto('/');
    
    // 按 Cmd+K 打开命令面板
    await page.keyboard.press('Meta+K');
    
    // 验证命令面板打开
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
    
    // 搜索页面
    await page.fill('[data-testid="command-search"]', 'chat');
    
    // 按 Enter 跳转
    await page.keyboard.press('Enter');
    
    // 验证跳转成功
    await expect(page).toHaveURL('/chat');
  });
});
```

### 4.2 表单提交测试

```typescript
// tests/e2e/form-submission.spec.ts
import { test, expect } from '@playwright/test';

test.describe('表单提交', () => {
  test('应该能够提交智能表单', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-nav-id="forms"]');
    
    // 填写表单
    await page.fill('[name="name"]', '测试用户');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="phone"]', '13800138000');
    
    // 选择下拉选项
    await page.selectOption('[name="category"]', 'A类客户');
    
    // 勾选复选框
    await page.check('[name="agree"]');
    
    // 提交表单
    await page.click('button[type="submit"]');
    
    // 验证提交成功
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('提交成功');
  });

  test('应该验证必填项', async ({ page }) => {
    await page.goto('/forms');
    
    // 直接点击提交（不填写）
    await page.click('button[type="submit"]');
    
    // 验证错误提示
    await expect(page.locator('[data-testid="error-name"]')).toContainText('请输入姓名');
  });
});
```

---

## 5. Mock 技巧

### 5.1 Mock API 调用

```typescript
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('API 调用测试', () => {
  it('应该正确处理成功响应', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'success' }),
    });
    
    const result = await fetchData();
    expect(result).toEqual({ data: 'success' });
  });

  it('应该正确处理错误响应', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });
    
    await expect(fetchData()).rejects.toThrow();
  });
});
```

### 5.2 Mock localStorage

```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
```

### 5.3 Mock 定时器

```typescript
import { vi } from 'vitest';

describe('定时器测试', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该在延迟后执行', () => {
    const callback = vi.fn();
    setTimeout(callback, 1000);
    
    expect(callback).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(1000);
    
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

---

## 6. 异步测试

### 6.1 Promise 测试

```typescript
describe('异步操作', () => {
  it('应该等待 Promise 完成', async () => {
    const result = await asyncFunction();
    expect(result).toBe('success');
  });

  it('应该处理 Promise 拒绝', async () => {
    await expect(failingAsyncFunction()).rejects.toThrow('Error message');
  });
});
```

### 6.2 waitFor 测试

```typescript
import { waitFor } from '@testing-library/react';

it('应该等待元素出现', async () => {
  render(<AsyncComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  }, { timeout: 3000 });
});
```

---

## 7. 主题系统测试

### 7.1 参数化测试两种主题

```typescript
describe.each([
  { theme: 'cyberpunk', primary: '#00f0ff' },
  { theme: 'liquidGlass', primary: '#00ff87' },
])('主题: $theme', ({ theme, primary }) => {
  it(`应该在 ${theme} 主题下有正确的主色`, () => {
    const { result } = renderHook(() => useThemeColors(), {
      wrapper: createWrapper(theme as any),
    });
    
    expect(result.current.primary).toBe(primary);
  });
});
```

### 7.2 快照测试主题样式

```typescript
it('Cyberpunk 主题快照', () => {
  const { container } = render(
    <ThemeSwitcherProvider defaultTheme="cyberpunk">
      <NeonCard>测试</NeonCard>
    </ThemeSwitcherProvider>
  );
  
  expect(container).toMatchSnapshot();
});

it('Liquid Glass 主题快照', () => {
  const { container } = render(
    <ThemeSwitcherProvider defaultTheme="liquidGlass">
      <NeonCard>测试</NeonCard>
    </ThemeSwitcherProvider>
  );
  
  expect(container).toMatchSnapshot();
});
```

---

**祝测试顺利！** 🚀
