# 客户关怀页面主题适配 - 快速修复补丁

## 🔧 问题
`customer-care-page.tsx` 第193行使用了错误的变量名 `themeMode`，应该是 `theme`

## ✅ 修复步骤

### 步骤1: 修复变量名（第193行）
```typescript
// ❌ 错误
const { themeMode } = useThemeSwitcher();

// ✅ 正确
const { theme } = useThemeSwitcher();
```

### 步骤2: 在第187行之前添加主题辅助函数
```typescript
// ==========================================
// Theme Helper Function
// ==========================================

const getThemeClasses = (theme: ThemeMode) => {
  if (theme === 'liquidGlass') {
    return {
      container: 'bg-transparent',
      header: 'border-b border-white/10 backdrop-blur-md bg-white/5',
      searchContainer: 'glass-card p-6',
      searchInput: 'input-liquid w-full pl-11 pr-4 py-3',
      filterSelect: 'input-liquid w-full px-4 py-3 appearance-none',
      tableContainer: 'glass-card overflow-hidden',
      tableHeader: 'backdrop-blur-sm bg-white/5',
      tableRow: 'hover:bg-white/5 transition-all duration-300',
      textPrimary: 'text-white',
      textSecondary: 'text-white/70',
      textMuted: 'text-white/50',
      textIcon: 'text-white/60',
    };
  }
  
  // Cyberpunk theme (default)
  return {
    container: 'bg-[#0a0a0a]',
    header: 'border-[#00f0ff]/30 bg-[#0f0f0f]/80',
    searchContainer: 'rounded-xl bg-[#0f0f0f]/50 border border-[#00f0ff]/20 p-4',
    searchInput: 'w-full pl-11 pr-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333]',
    filterSelect: 'w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] appearance-none',
    tableContainer: 'rounded-xl bg-[#0f0f0f]/50 border border-[#00f0ff]/20',
    tableHeader: 'bg-[#1a1a1a] border-b border-[#00f0ff]/20',
    tableRow: 'hover:bg-[#1a1a1a]/50',
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    textIcon: 'text-gray-400',
  };
};
```

### 步骤3: 在组件中使用（第197行后添加）
```typescript
  // Get theme-specific classes
  const tc = getThemeClasses(theme);
```

### 步骤4: 修改JSX的className引用

#### 页面容器（第273行）
```typescript
// ❌ 原代码
<div className="h-full flex flex-col bg-[#0a0a0a] text-gray-100 overflow-hidden">

// ✅ 修复后
<div className={`h-full flex flex-col ${tc.container} ${tc.textPrimary} overflow-hidden`}>
```

#### 头部（第276行）
```typescript
// ❌ 原代码
<header className="shrink-0 border-b border-[#00f0ff]/30 bg-[#0f0f0f]/80 backdrop-blur-sm">

// ✅ 修复后
<header className={`shrink-0 ${tc.header} backdrop-blur-sm`}>
```

#### 搜索容器（第413行）
```typescript
// ❌ 原代码
<div className="rounded-xl bg-[#0f0f0f]/50 border border-[#00f0ff]/20 p-4">

// ✅ 修复后
<div className={tc.searchContainer}>
```

#### 搜索输入框（第417-424行）
```typescript
// ❌ 原代码
<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
<input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder={t("care.searchPlaceholder")}
  className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-[#00f0ff] transition-colors"
/>

// ✅ 修复后
<Search className={`absolute left-3 top-1/2 -translate-y-1/2 size-5 ${tc.textIcon}`} />
<input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder={t("care.searchPlaceholder")}
  className={`${tc.searchInput} ${tc.textPrimary} placeholder:text-white/40 focus:outline-none ${theme === 'liquidGlass' ? '' : 'focus:border-[#00f0ff]'} transition-all`}
/>
```

#### 筛选下拉框（第429-441和445-456行）
```typescript
// ❌ 原代码
<Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
<select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-gray-100 focus:outline-none focus:border-[#00f0ff] transition-colors appearance-none"
>

// ✅ 修复后
<Filter className={`absolute left-3 top-1/2 -translate-y-1/2 size-5 ${tc.textIcon} pointer-events-none`} />
<select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className={`${tc.filterSelect} pl-11 pr-4 ${tc.textPrimary} focus:outline-none ${theme === 'liquidGlass' ? '' : 'focus:border-[#00f0ff]'} transition-all`}
>
```

```typescript
// 等级筛选（第445-456行）
// ❌ 原代码
<select
  value={levelFilter}
  onChange={(e) => setLevelFilter(e.target.value)}
  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] text-gray-100 focus:outline-none focus:border-[#00f0ff] transition-colors appearance-none"
>

// ✅ 修复后
<select
  value={levelFilter}
  onChange={(e) => setLevelFilter(e.target.value)}
  className={`${tc.filterSelect} ${tc.textPrimary} focus:outline-none ${theme === 'liquidGlass' ? '' : 'focus:border-[#00f0ff]'} transition-all`}
>
```

#### 结果计数（第462行）
```typescript
// ❌ 原代码
<span className="text-gray-400">

// ✅ 修复后
<span className={tc.textMuted}>
```

#### 表格容器（第481行）
```typescript
// ❌ 原代码
<div className="rounded-xl bg-[#0f0f0f]/50 border border-[#00f0ff]/20 overflow-hidden">

// ✅ 修复后
<div className={tc.tableContainer}>
```

#### 表头（第484行）
```typescript
// ❌ 原代码
<thead className="bg-[#1a1a1a] border-b border-[#00f0ff]/20">

// ✅ 修复后
<thead className={tc.tableHeader}>
```

#### 表格行（第517-519行）
```typescript
// ❌ 原代码
<tr
  key={customer.id}
  className="hover:bg-[#1a1a1a]/50 transition-colors group"
>

// ✅ 修复后
<tr
  key={customer.id}
  className={`${tc.tableRow} group`}
>
```

#### 文本颜色修复（多处）
```typescript
// 姓名（第526行）
// ❌ text-gray-100
// ✅ {tc.textPrimary}

// 公司（第532行）
// ❌ text-gray-300
// ✅ {tc.textSecondary}

// 电话（第538行）
// ❌ text-gray-300
// ✅ {tc.textSecondary}

// 图标（第533, 539行）
// ❌ text-gray-500
// ✅ {tc.textMuted}

// 时钟图标（第563行）
// ❌ text-gray-400
// ✅ {tc.textMuted}

// 负责人（第570行）
// ❌ text-gray-300
// ✅ {tc.textSecondary}
```

## 📝 完整修改清单

- [ ] 第18行: 添加 `import { useThemeSwitcher, type ThemeMode } from "./theme-switcher-context";`
- [ ] 第187行前: 添加 `getThemeClasses()` 函数
- [ ] 第193行: 修复 `themeMode` → `theme`
- [ ] 第197行后: 添加 `const tc = getThemeClasses(theme);`
- [ ] 第273行: 修复页面容器类名
- [ ] 第276行: 修复头部类名
- [ ] 第413行: 修复搜索容器类名
- [ ] 第417行: 修复搜索图标类名
- [ ] 第418-424行: 修复搜索输入框类名
- [ ] 第429行: 修复筛选图标类名
- [ ] 第430-441行: 修复状态筛选框类名
- [ ] 第445-456行: 修复等级筛选框类名
- [ ] 第462行: 修复结果计数类名
- [ ] 第481行: 修复表格容器类名
- [ ] 第484行: 修复表头类名
- [ ] 第517-519行: 修复表格行类名
- [ ] 第526, 532, 538, 563, 570行: 修复文本颜色类名

## ⚡ 快速命令行修复（如果支持）

```bash
# 替换 themeMode 为 theme
sed -i 's/themeMode/theme/g' /src/app/components/customer-care-page.tsx
```

## ✅ 验证步骤

1. 切换到液态玻璃主题
2. 打开客户关怀中心
3. 检查搜索输入框是否显示毛玻璃效果
4. 检查筛选下拉框是否显示毛玻璃效果
5. 检查表格是否显示毛玻璃效果
6. 测试搜索和筛选功能
7. 切换回赛博朋克主题验证正常

---

由于文件较大，建议分步骤实施，优先修复：
1. 变量名错误（第193行）
2. 添加主题辅助函数
3. 修复搜索/筛选区域（最显眼）
4. 修复表格显示
5. 修复其他细节
