# Smart Form System 批量颜色替换规则

## 字段颜色映射表

### 原颜色 → 新颜色
| 原颜色 | 新颜色 | 替换范围 |
|--------|--------|----------|
| `#ff00ff` | `#00d4ff` | 字段color属性、品红引用 |
| `#ffff00` | `#00ffcc` | 字段color属性、黄色引用 |
| `#00ff41` | `#00ffc8` | 字段color属性、绿色引用 |
| `#ff8c00` | `#41ffdd` | 字段color属性、橙色引用 |

## 需要替换的代码模式

### 1. 模板主颜色 (已完成)
```typescript
✅ "customer-intake" color: "#ff00ff" → "#00d4ff"
✅ "call-report" color: "#ffff00" → "#00ffcc"  
✅ "ai-task-config" color: "#00ff41" → "#00ffc8"
⏳ 统计卡片颜色待替换
⏳ fieldTypeInfo颜色待替换
```

### 2. 字段颜色属性
```typescript
// 客户录入表字段
color: "#ff00ff" → color: "#00d4ff"
color: "#ffff00" → color: "#00ffcc"
color: "#00ff41" → color: "#00ffc8"

// 呼叫报告字段
color: "#ffff00" → color: "#00ffcc"  
color: "#00ff41" → color: "#00ffc8"
color: "#ff00ff" → color: "#00d4ff"
color: "#ff8c00" → color: "#41ffdd"

// 满意度调研字段
color: "#ffff00" → color: "#00ffcc"
color: "#00ff41" → color: "#00ffc8"
color: "#ff00ff" → color: "#00d4ff"

// AI任务配置字段
color: "#00ff41" → color: "#00ffc8"
color: "#ffff00" → color: "#00ffcc"
color: "#ff8c00" → color: "#41ffdd"
color: "#ff00ff" → color: "#00d4ff"
```

### 3. fieldTypeInfo色彩
```typescript
// 原代码
export const fieldTypeInfo: Record<FieldType, { label: string; icon: typeof Type; color: string }> = {
  text: { label: "文本", icon: Type, color: "#00f0ff" },      // 保持
  textarea: { label: "多行文本", icon: AlignLeft, color: "#00f0ff" },  // 保持
  number: { label: "数字", icon: Hash, color: "#ffff00" },    // 改
  select: { label: "下拉选择", icon: List, color: "#ff00ff" },  // 改
  radio: { label: "单选", icon: CheckCircle2, color: "#ff00ff" },  // 改
  checkbox: { label: "多选", icon: Check, color: "#00ff41" },   // 改
  toggle: { label: "开关", icon: ToggleLeft, color: "#ff8c00" },  // 改
  slider: { label: "滑块", icon: Sliders, color: "#00f0ff" },   // 保持
  date: { label: "日期", icon: Calendar, color: "#ffff00" },   // 改
  rating: { label: "评分", icon: Star, color: "#ffff00" },     // 改
  file: { label: "文件", icon: Upload, color: "#ff8c00" },     // 改
};

// 替换后
export const fieldTypeInfo: Record<FieldType, { label: string; icon: typeof Type; color: string }> = {
  text: { label: "文本", icon: Type, color: "#00f0ff" },
  textarea: { label: "多行文本", icon: AlignLeft, color: "#00f0ff" },
  number: { label: "数字", icon: Hash, color: "#00ffcc" },
  select: { label: "下拉选择", icon: List, color: "#00d4ff" },
  radio: { label: "单选", icon: CheckCircle2, color: "#00d4ff" },
  checkbox: { label: "多选", icon: Check, color: "#00ffc8" },
  toggle: { label: "开关", icon: ToggleLeft, color: "#41ffdd" },
  slider: { label: "滑块", icon: Sliders, color: "#00f0ff" },
  date: { label: "日期", icon: Calendar, color: "#00ffcc" },
  rating: { label: "评分", icon: Star, color: "#00ffcc" },
  file: { label: "文件", icon: Upload, color: "#41ffdd" },
};
```

### 4. 统计卡片颜色
```typescript
// 原代码
{ label: "表单模板", value: `${allTemplates.length}`, icon: ClipboardList, color: "#ff8c00", sub: `...` },
{ label: "累计提交", value: `${submissionCount}`, icon: Send, color: "#00ff41", sub: "已保存" },
{ label: "AI 辅助率", value: "94.2%", icon: Brain, color: "#ff00ff", sub: "智能补全" },
{ label: "校验通过", value: "99.8%", icon: CheckCircle2, color: "#00f0ff", sub: "数据质量" },

// 替换后
{ label: "表单模板", value: `${allTemplates.length}`, icon: ClipboardList, color: "#41ffdd", sub: `...` },
{ label: "累计提交", value: `${submissionCount}`, icon: Send, color: "#00ffc8", sub: "已保存" },
{ label: "AI 辅助率", value: "94.2%", icon: Brain, color: "#00d4ff", sub: "智能补全" },
{ label: "校验通过", value: "99.8%", icon: CheckCircle2, color: "#00f0ff", sub: "数据质量" },
```

### 5. NeonCard 边框颜色
```typescript
// 原代码
<NeonCard color="#ff8c00" hoverable={false}>

// 替换后
<NeonCard color="#41ffdd" hoverable={false}>
```

### 6. AI辅助badge颜色
```typescript
// 原代码
<span className="text-[9px] px-2 py-0.5 rounded-full" 
  style={{ background: "rgba(255,0,255,0.08)", color: "#ff00ff", border: "1px solid rgba(255,0,255,0.2)" }}>

// 替换后
<span className="text-[9px] px-2 py-0.5 rounded-full" 
  style={{ background: "rgba(0,212,255,0.08)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)" }}>
```

### 7. AI提示样式
```typescript
// 原代码
background: "rgba(255,0,255,0.06)",
border: "1px solid rgba(255,0,255,0.15)",
color: "#ff00ff",

// 替换后
background: "rgba(0,212,255,0.06)",
border: "1px solid rgba(0,212,255,0.15)",
color: "#00d4ff",
```

### 8. Rating星星颜色
```typescript
// 原代码
color: star <= (value || 0) ? "#ffff00" : "rgba(255,255,255,0.08)",
fill: star <= (value || 0) ? "#ffff00" : "transparent",
filter: star <= (value || 0) ? "drop-shadow(0 0 6px rgba(255,255,0,0.5))" : "none",

// 替换后
color: star <= (value || 0) ? "#00ffcc" : "rgba(255,255,255,0.08)",
fill: star <= (value || 0) ? "#00ffcc" : "transparent",
filter: star <= (value || 0) ? "drop-shadow(0 0 6px rgba(0,255,204,0.5))" : "none",
```

## 批量替换命令 (使用find/replace)

### 精确字段颜色替换
```bash
# 客户录入表字段 - 品红改青色
color: "#ff00ff" → color: "#00d4ff"  (15处)

# 字段-黄色改青绿
color: "#ffff00" → color: "#00ffcc"  (8处)

# 字段-绿色改成功青绿
color: "#00ff41" → color: "#00ffc8"  (7处)

# 字段-橙色改高亮青绿
color: "#ff8c00" → color: "#41ffdd"  (4处)
```

### RGBA值批量替换
```bash
# 品红 RGBA
rgba(255,0,255,0.08) → rgba(0,212,255,0.08)
rgba(255,0,255,0.06) → rgba(0,212,255,0.06)
rgba(255,0,255,0.12) → rgba(0,212,255,0.12)
rgba(255,0,255,0.04) → rgba(0,212,255,0.04)
rgba(255,0,255,0.15) → rgba(0,212,255,0.15)
rgba(255,0,255,0.2) → rgba(0,212,255,0.2)
rgba(255,0,255,0.25) → rgba(0,212,255,0.25)
rgba(255,0,255,0.4) → rgba(0,212,255,0.4)

# 黄色 RGBA
rgba(255,255,0,0.5) → rgba(0,255,204,0.5)
```

## 验证清单

- [ ] 模板主颜色 (3个模板)
- [ ] 字段color属性 (~30个字段)
- [ ] fieldTypeInfo色彩定义 (11个类型)
- [ ] 统计卡片颜色 (4个卡片)
- [ ] NeonCard边框颜色
- [ ] AI辅助badge样式
- [ ] AI提示弹窗样式
- [ ] Rating评分星星颜色
- [ ] 所有RGBA值统一

## 预期结果

完成后整个智能表单系统将统一使用青色调色系：
- **主青色** #00f0ff (保持)
- **浅蓝青** #00d4ff (替代品红)
- **青绿色** #00ffcc (替代黄色)
- **成功青绿** #00ffc8 (替代绿色)
- **高亮青绿** #41ffdd (替代橙色)
- **危险红** #ff0040 (仅保留错误提示)
