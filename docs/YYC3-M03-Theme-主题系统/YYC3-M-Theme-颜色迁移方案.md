# YYC³ 颜色系统迁移计划

## 目标
将赛博朋克风格从三色霓虹系统（青+品红+黄）简化为统一的青色调系统

## 颜色映射规则

| 旧颜色 | 用途 | 新颜色 | 说明 |
|--------|------|--------|------|
| `#00f0ff` | 主青色 | `#00f0ff` | 保持不变 |
| `#ff00ff` | 品红色 | `#00d4ff` | 浅蓝青 |
| `#ffff00` | 黄色 | `#00ffcc` | 青绿色 |
| `#00ff41` | 绿色 | `#00ffc8` | 成功青绿 |
| `#ff8c00` | 橙色 | `#41ffdd` | 高亮青绿 |
| `#ff0040` | 红色 | `#008b9d` | 暗青色（或保留red用于警告） |

## 渐变替换规则

| 旧渐变 | 新渐变 |
|--------|--------|
| `linear-gradient(135deg, #00f0ff, #ff00ff)` | `linear-gradient(135deg, #00f0ff, #00d4ff)` |
| `linear-gradient(90deg, #00f0ff, #ff00ff)` | `linear-gradient(90deg, #00f0ff, #00d4ff)` |
| `linear-gradient(90deg, #ff00ff, #ffff00)` | `linear-gradient(90deg, #00d4ff, #00ffcc)` |
| `linear-gradient(135deg, rgba(255,0,255,0.15), rgba(0,240,255,0.15))` | `linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,240,255,0.15))` |

## 透明度替换规则

| 旧透明度 | 新透明度 |
|----------|----------|
| `rgba(255,0,255,0.X)` | `rgba(0,212,255,0.X)` |
| `#ff00ffXX` | `#00d4ffXX` |
| `rgba(255,255,0,0.X)` | `rgba(0,255,204,0.X)` |
| `#ffff00XX` | `#00ffccXX` |

## 已完成修改

### 1. 配置文件
- ✅ 创建 `/src/app/config/cyber-colors.ts` - 统一颜色配置

### 2. cyberpunk-standalone.tsx
- ✅ navItems 导航项颜色
- ✅ sidebarPersonal 个人菜单颜色
- ✅ tools 工具列表颜色
- ✅ workflowNodes 工作流节点颜色
- ✅ insightMetrics 洞察指标颜色
- ⏳ 待修改：CLM客户生命周期颜色
- ⏳ 待修改：AI Call呼叫系统颜色
- ⏳ 待修改：Forms表单系统颜色
- ⏳ 待修改：内联样式中的颜色

### 3. chat-interface.tsx
- ⏳ 待修改：消息气泡颜色
- ⏳ 待修改：按钮hover颜色
- ⏳ 待修改：输入框边框颜色

### 4. neon-card.tsx
- ⏳ 待修改：默认颜色参数

### 5. app-context.tsx
- ⏳ 待修改：exportable datasets颜色

## 批量替换命令（仅供参考）

```bash
# 品红色 → 浅蓝青
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/#ff00ff/#00d4ff/g' {} +

# 黄色 → 青绿色
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/#ffff00/#00ffcc/g' {} +

# 绿色 → 成功青绿
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/#00ff41/#00ffc8/g' {} +

# 橙色 → 高亮青绿
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/#ff8c00/#41ffdd/g' {} +
```

## 注意事项

1. **保留红色** - #ff0040 用于警告/危险操作，可考虑保留或改为暗青 #008b9d
2. **渐变处理** - 确保渐变从亮到暗或从饱和到不饱和的视觉层次
3. **可访问性** - 确保文本对比度符合 WCAG AA 标准
4. **hover状态** - 统一使用 #00d0df（深青）作为hover色
5. **发光效果** - box-shadow/text-shadow 中的颜色也需同步替换
