#!/bin/bash

# YYC³ Color Migration Script
# 将赛博朋克三色系统统一为青色调

echo "🎨 开始颜色迁移..."
echo "================================"

# 定义颜色映射
declare -A COLOR_MAP
COLOR_MAP["#ff00ff"]="#00d4ff"  # 品红 → 浅蓝青
COLOR_MAP["#ffff00"]="#00ffcc"  # 黄色 → 青绿色  
COLOR_MAP["#00ff41"]="#00ffc8"  # 绿色 → 成功青绿
COLOR_MAP["#ff8c00"]="#41ffdd"  # 橙色 → 高亮青绿

# 定义需要处理的文件
FILES=(
  "src/app/components/cyberpunk-standalone.tsx"
  "src/app/components/chat-interface.tsx"
  "src/app/components/neon-card.tsx"
  "src/app/components/app-context.tsx"
  "src/app/components/smart-form-system.tsx"
  "src/app/components/number-database-page.tsx"
  "src/app/components/customer-care-page.tsx"
)

# 备份文件
echo "📦 备份原始文件..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/"
    echo "  ✓ 备份: $file"
  fi
done

echo ""
echo "🔄 开始替换颜色..."

# 执行替换
for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "  ⚠️  文件不存在: $file"
    continue
  fi
  
  echo "  处理: $file"
  
  for old_color in "${!COLOR_MAP[@]}"; do
    new_color="${COLOR_MAP[$old_color]}"
    
    # 替换普通颜色值
    sed -i "s/${old_color}/${new_color}/g" "$file" 2>/dev/null || \
      sed -i '' "s/${old_color}/${new_color}/g" "$file" 2>/dev/null
    
    # 替换rgba格式 (255,0,255) → (0,212,255)
    if [ "$old_color" == "#ff00ff" ]; then
      sed -i 's/rgba(255,0,255,/rgba(0,212,255,/g' "$file" 2>/dev/null || \
        sed -i '' 's/rgba(255,0,255,/rgba(0,212,255,/g' "$file" 2>/dev/null
      sed -i 's/rgba(255, 0, 255,/rgba(0, 212, 255,/g' "$file" 2>/dev/null || \
        sed -i '' 's/rgba(255, 0, 255,/rgba(0, 212, 255,/g' "$file" 2>/dev/null
    fi
    
    # 替换rgba格式 (255,255,0) → (0,255,204)
    if [ "$old_color" == "#ffff00" ]; then
      sed -i 's/rgba(255,255,0,/rgba(0,255,204,/g' "$file" 2>/dev/null || \
        sed -i '' 's/rgba(255,255,0,/rgba(0,255,204,/g' "$file" 2>/dev/null
      sed -i 's/rgba(255, 255, 0,/rgba(0, 255, 204,/g' "$file" 2>/dev/null || \
        sed -i '' 's/rgba(255, 255, 0,/rgba(0, 255, 204,/g' "$file" 2>/dev/null
    fi
  done
  
  echo "    ✓ 完成"
done

echo ""
echo "✅ 颜色迁移完成!"
echo "================================"
echo "备份位置: $BACKUP_DIR"
echo ""
echo "📝 修改摘要:"
echo "  #ff00ff → #00d4ff (品红 → 浅蓝青)"
echo "  #ffff00 → #00ffcc (黄色 → 青绿色)"
echo "  #00ff41 → #00ffc8 (绿色 → 成功青绿)"
echo "  #ff8c00 → #41ffdd (橙色 → 高亮青绿)"
echo ""
echo "💡 提示: 如需恢复，请从 $BACKUP_DIR 目录复制文件"
