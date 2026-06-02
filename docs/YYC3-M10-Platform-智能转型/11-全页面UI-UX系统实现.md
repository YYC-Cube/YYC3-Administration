# 第十一章：UI/UX全页面系统实现

## 11.1 全局设计系统实现

### 11.1.1 色彩系统深度定义

```scss
// styles/theme/_colors.scss
// 主色调定义 - 禁用纯黑，使用深灰色替代
$color-black: #1a1a1a !default;
$color-near-black: #2d3748 !default;

// 功能分类色彩系统
$color-system: (
  // 智能菜单服务 - 蓝紫色系
  menu: (
    primary: #6366f1,
    secondary: #818cf8,
    light: #c7d2fe,
    dark: #4f46e5,
    accent: #a5b4fc,
    border: #6366f1,
    shadow: rgba(99, 102, 241, 0.3),
    gradient: linear-gradient(135deg, #6366f1 0%, #818cf8 100%)
  ),
  
  // 智能表单服务 - 绿色系
  form: (
    primary: #10b981,
    secondary: #34d399,
    light: #a7f3d0,
    dark: #059669,
    accent: #6ee7b7,
    border: #10b981,
    shadow: rgba(16, 185, 129, 0.3),
    gradient: linear-gradient(135deg, #10b981 0%, #34d399 100%)
  ),
  
  // 知识图谱服务 - 橙色系
  knowledge: (
    primary: #f59e0b,
    secondary: #fbbf24,
    light: #fde68a,
    dark: #d97706,
    accent: #fcd34d,
    border: #f59e0b,
    shadow: rgba(245, 158, 11, 0.3),
    gradient: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)
  ),
  
  // AI服务 - 粉色系
  ai: (
    primary: #ec4899,
    secondary: #f472b6,
    light: #fbcfe8,
    dark: #db2777,
    accent: #f9a8d4,
    border: #ec4899,
    shadow: rgba(236, 72, 153, 0.3),
    gradient: linear-gradient(135deg, #ec4899 0%, #f472b6 100%)
  ),
  
  // 数据服务 - 青色系
  data: (
    primary: #06b6d4,
    secondary: #22d3ee,
    light: #a5f3fc,
    dark: #0891b2,
    accent: #67e8f9,
    border: #06b6d4,
    shadow: rgba(6, 182, 212, 0.3),
    gradient: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)
  ),
  
  // 系统服务 - 灰色系
  system: (
    primary: #6b7280,
    secondary: #9ca3af,
    light: #e5e7eb,
    dark: #4b5563,
    accent: #d1d5db,
    border: #6b7280,
    shadow: rgba(107, 114, 128, 0.3),
    gradient: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)
  )
);

// 文本颜色系统
$text-colors: (
  primary: #1a1a1a,
  secondary: #4b5563,
  tertiary: #6b7280,
  disabled: #9ca3af,
  inverse: #ffffff,
  
  // 功能文本颜色
  menu: #6366f1,
  form: #10b981,
  knowledge: #f59e0b,
  ai: #ec4899,
  data: #06b6d4,
  system: #6b7280,
  
  // 交互状态
  hover: #1e40af,
  active: #1e3a8a,
  focus: #3b82f6,
  visited: #7c3aed
);

// 背景颜色系统
$background-colors: (
  primary: #ffffff,
  secondary: #f8fafc,
  tertiary: #f1f5f9,
  overlay: rgba(0, 0, 0, 0.5),
  
  // 功能背景
  menu: rgba(99, 102, 241, 0.1),
  form: rgba(16, 185, 129, 0.1),
  knowledge: rgba(245, 158, 11, 0.1),
  ai: rgba(236, 72, 153, 0.1),
  data: rgba(6, 182, 212, 0.1),
  system: rgba(107, 114, 128, 0.1)
);

// 边框颜色系统
$border-colors: (
  light: #e5e7eb,
  default: #d1d5db,
  dark: #9ca3af,
  focus: #3b82f6,
  
  // 功能边框
  menu: #c7d2fe,
  form: #a7f3d0,
  knowledge: #fde68a,
  ai: #fbcfe8,
  data: #a5f3fc,
  system: #e5e7eb
);

// 阴影系统
$shadows: (
  sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05),
  default: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06),
  md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06),
  lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05),
  xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04),
  
  // 彩色阴影
  menu: 0 4px 6px -1px rgba(99, 102, 241, 0.3),
  form: 0 4px 6px -1px rgba(16, 185, 129, 0.3),
  knowledge: 0 4px 6px -1px rgba(245, 158, 11, 0.3),
  ai: 0 4px 6px -1px rgba(236, 72, 153, 0.3),
  data: 0 4px 6px -1px rgba(6, 182, 212, 0.3),
  system: 0 4px 6px -1px rgba(107, 114, 128, 0.3)
);

// Mixins 用于色彩应用
@mixin apply-theme($theme) {
  @if map-has-key($color-system, $theme) {
    $theme-colors: map-get($color-system, $theme);
    
    --color-primary: #{map-get($theme-colors, primary)};
    --color-secondary: #{map-get($theme-colors, secondary)};
    --color-light: #{map-get($theme-colors, light)};
    --color-dark: #{map-get($theme-colors, dark)};
    --color-accent: #{map-get($theme-colors, accent)};
    --color-border: #{map-get($theme-colors, border)};
    --color-shadow: #{map-get($theme-colors, shadow)};
    --gradient: #{map-get($theme-colors, gradient)};
  }
}

@mixin text-color($type: primary) {
  @if map-has-key($text-colors, $type) {
    color: map-get($text-colors, $type);
  } @else {
    color: map-get($text-colors, primary);
  }
}

@mixin bg-color($type: primary) {
  @if map-has-key($background-colors, $type) {
    background-color: map-get($background-colors, $type);
  } @else {
    background-color: map-get($background-colors, primary);
  }
}

@mixin border-color($type: default) {
  @if map-has-key($border-colors, $type) {
    border-color: map-get($border-colors, $type);
  } @else {
    border-color: map-get($border-colors, default);
  }
}

@mixin shadow($type: default) {
  @if map-has-key($shadows, $type) {
    box-shadow: map-get($shadows, $type);
  } @else {
    box-shadow: map-get($shadows, default);
  }
}

// 功能类生成器
@each $name, $colors in $color-system {
  .theme-#{$name} {
    @include apply-theme($name);
  }
  
  .text-#{$name} {
    color: map-get($colors, primary) !important;
  }
  
  .bg-#{$name} {
    background-color: map-get($colors, primary) !important;
  }
  
  .border-#{$name} {
    border-color: map-get($colors, primary) !important;
  }
  
  .shadow-#{$name} {
    box-shadow: 0 4px 6px -1px map-get($colors, shadow) !important;
  }
}

```text

### 11.1.2 智能导航栏组件

```plaintext
<!-- components/navigation/IntelligentNavBar.vue -->
<template>
  <div class="intelligent-nav-bar" :class="`theme-${currentTheme}`">
    <!-- 功能分类菜单栏 -->
    <div class="function-category-bar">
      <div class="category-container">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          :class="{ active: currentCategory === category.id }"
          @click="switchCategory(category.id)"
          @mouseenter="handleCategoryHover(category)"
        >
          <div class="category-icon">
            <i :class="category.icon"></i>
          </div>
          <span class="category-name">{{ category.name }}</span>
          <div class="category-indicator"></div>
        </div>
      </div>
      
      <!-- 用户操作区 -->
      <div class="user-actions">
        <div class="search-box">
          <i class="icon-search"></i>
          <input
            type="text"
            placeholder="智能搜索..."
            v-model="searchQuery"
            @focus="showSearchSuggestions = true"
          />
          <transition name="slide-down">
            <div
              v-if="showSearchSuggestions && searchQuery"
              class="search-suggestions"
            >
              <div
                v-for="suggestion in searchSuggestions"
                :key="suggestion.id"
                class="suggestion-item"
                @click="handleSuggestionSelect(suggestion)"
              >
                <i :class="suggestion.icon"></i>
                <span>{{ suggestion.text }}</span>
              </div>
            </div>
          </transition>
        </div>
        
        <div class="user-menu">
          <div class="user-avatar" @click="toggleUserMenu">
            <img :src="user.avatar" :alt="user.name" />
          </div>
          <transition name="slide-down">
            <div v-if="showUserMenu" class="user-dropdown">
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-role">{{ user.role }}</div>
              </div>
              <div class="menu-items">
                <div
                  v-for="item in userMenuItems"
                  :key="item.id"
                  class="menu-item"
                  @click="handleUserMenuClick(item)"
                >
                  <i :class="item.icon"></i>
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    
    <!-- 面包屑导航栏 -->
    <div class="breadcrumb-bar">
      <div class="breadcrumb-container">
        <nav class="breadcrumb">
          <span
            v-for="(item, index) in breadcrumbs"
            :key="item.path"
            class="breadcrumb-item"
          >
            <span
              v-if="index === breadcrumbs.length - 1"
              class="breadcrumb-current"
            >
              {{ item.name }}
            </span>
            <router-link
              v-else
              :to="item.path"
              class="breadcrumb-link"
            >
              {{ item.name }}
            </router-link>
            <span
              v-if="index < breadcrumbs.length - 1"
              class="breadcrumb-separator"
            >
              <i class="icon-chevron-right"></i>
            </span>
          </span>
        </nav>
        
        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button
            v-for="action in quickActions"
            :key="action.id"
            class="quick-action-btn"
            :class="`theme-${action.theme}`"
            @click="handleQuickAction(action)"
          >
            <i :class="action.icon"></i>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 上下文提示 -->
    <transition name="fade">
      <div
        v-if="contextHint"
        class="context-hint"
        :class="`theme-${contextHint.theme}`"
      >
        <i :class="contextHint.icon"></i>
        <span>{{ contextHint.message }}</span>
        <button class="hint-close" @click="closeContextHint">
          <i class="icon-close"></i>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Props
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

// 路由相关
const route = useRoute()
const router = useRouter()

// 响应式数据
const currentCategory = ref('menu')
const searchQuery = ref('')
const showSearchSuggestions = ref(false)
const showUserMenu = ref(false)
const contextHint = ref(null)

// 功能分类数据
const categories = ref([
  {
    id: 'menu',
    name: '智能菜单',
    icon: 'icon-layout',
    theme: 'menu',
    path: '/intelligent-menu'
  },
  {
    id: 'form',
    name: '智能表单',
    icon: 'icon-form',
    theme: 'form',
    path: '/intelligent-form'
  },
  {
    id: 'knowledge',
    name: '知识图谱',
    icon: 'icon-brain',
    theme: 'knowledge',
    path: '/knowledge-graph'
  },
  {
    id: 'ai',
    name: 'AI服务',
    icon: 'icon-ai',
    theme: 'ai',
    path: '/ai-services'
  },
  {
    id: 'data',
    name: '数据服务',
    icon: 'icon-database',
    theme: 'data',
    path: '/data-services'
  },
  {
    id: 'system',
    name: '系统管理',
    icon: 'icon-settings',
    theme: 'system',
    path: '/system'
  }
])

// 搜索建议
const searchSuggestions = computed(() => {
  if (!searchQuery.value) return []
  
  const query = searchQuery.value.toLowerCase()
  const allSuggestions = [
    { id: 1, text: '创建新菜单', icon: 'icon-plus', type: 'menu', path: '/intelligent-menu/create' },
    { id: 2, text: '设计表单模板', icon: 'icon-form', type: 'form', path: '/intelligent-form/templates' },
    { id: 3, text: '知识图谱搜索', icon: 'icon-search', type: 'knowledge', path: '/knowledge-graph/search' },
    { id: 4, text: 'AI模型管理', icon: 'icon-ai', type: 'ai', path: '/ai-services/models' },
    { id: 5, text: '数据看板', icon: 'icon-chart', type: 'data', path: '/data-services/dashboard' }
  ]
  
  return allSuggestions.filter(suggestion => 
    suggestion.text.toLowerCase().includes(query)
  )
})

// 用户菜单项
const userMenuItems = ref([
  { id: 1, label: '个人设置', icon: 'icon-user', action: 'profile' },
  { id: 2, label: '消息中心', icon: 'icon-bell', action: 'notifications' },
  { id: 3, label: '使用统计', icon: 'icon-chart', action: 'statistics' },
  { id: 4, label: '帮助文档', icon: 'icon-help', action: 'help' },
  { id: 5, label: '退出登录', icon: 'icon-logout', action: 'logout' }
])

// 快捷操作
const quickActions = ref([
  { id: 1, label: '新建', icon: 'icon-plus', theme: 'menu', action: 'create' },
  { id: 2, label: '导入', icon: 'icon-upload', theme: 'form', action: 'import' },
  { id: 3, label: '导出', icon: 'icon-download', theme: 'data', action: 'export' },
  { id: 4, label: '刷新', icon: 'icon-refresh', theme: 'system', action: 'refresh' }
])

// 计算属性
const currentTheme = computed(() => {
  return currentCategory.value
})

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(record => record.meta?.breadcrumb)
  return matched.map(record => ({
    name: record.meta.breadcrumb,
    path: record.path
  }))
})

// 方法
const switchCategory = (categoryId) => {
  currentCategory.value = categoryId
  const category = categories.value.find(c => c.id === categoryId)
  if (category) {
    router.push(category.path)
  }
  showContextHint({
    message: `已切换到${category?.name}功能`,
    theme: categoryId,
    icon: 'icon-check'
  })
}

const handleCategoryHover = (category) => {
  // 悬停效果处理
}

const handleSuggestionSelect = (suggestion) => {
  router.push(suggestion.path)
  showSearchSuggestions.value = false
  searchQuery.value = ''
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleUserMenuClick = (item) => {
  switch (item.action) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      handleLogout()
      break
    // 其他操作处理
  }
  showUserMenu.value = false
}

const handleQuickAction = (action) => {
  // 处理快捷操作
  console.log('Quick action:', action)
}

const showContextHint = (hint) => {
  contextHint.value = hint
  setTimeout(() => {
    closeContextHint()
  }, 3000)
}

const closeContextHint = () => {
  contextHint.value = null
}

const handleLogout = () => {
  // 退出登录逻辑
  console.log('Logout')
}

const handleClickOutside = (event) => {
  const userMenu = document.querySelector('.user-menu')
  const searchBox = document.querySelector('.search-box')
  
  if (userMenu && !userMenu.contains(event.target)) {
    showUserMenu.value = false
  }
  
  if (searchBox && !searchBox.contains(event.target)) {
    showSearchSuggestions.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // 根据当前路由设置分类
  const currentPath = route.path
  const matchedCategory = categories.value.find(category => 
    currentPath.startsWith(category.path)
  )
  if (matchedCategory) {
    currentCategory.value = matchedCategory.id
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
@import '@/styles/theme/colors';

.intelligent-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  
  // 功能分类菜单栏
  .function-category-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
    padding: 0 24px;
    border-bottom: 1px solid map-get($border-colors, light);
    
    .category-container {
      display: flex;
      gap: 8px;
      
      .category-item {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-right: 3px solid transparent;
        
        &:hover {
          background: rgba(99, 102, 241, 0.05);
          border-right-color: var(--color-primary);
          
          .category-indicator {
            opacity: 1;
            transform: scaleX(1);
          }
        }
        
        &.active {
          background: var(--color-light);
          border-right-color: var(--color-primary);
          
          .category-name {
            color: var(--color-primary);
            font-weight: 600;
          }
          
          .category-icon {
            color: var(--color-primary);
          }
        }
        
        .category-icon {
          font-size: 18px;
          color: map-get($text-colors, secondary);
          transition: color 0.3s ease;
        }
        
        .category-name {
          @include text-color(secondary);
          font-weight: 500;
          transition: color 0.3s ease;
        }
        
        .category-indicator {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-primary);
          opacity: 0;
          transform: scaleX(0);
          transition: all 0.3s ease;
        }
      }
    }
    
    .user-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .search-box {
        position: relative;
        
        input {
          width: 280px;
          padding: 8px 12px 8px 36px;
          border: 1px solid map-get($border-colors, default);
          border-radius: 20px;
          @include text-color(primary);
          transition: all 0.3s ease;
          
          &:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          
          &::placeholder {
            @include text-color(tertiary);
          }
        }
        
        .icon-search {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          @include text-color(tertiary);
        }
        
        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid map-get($border-colors, default);
          border-radius: 8px;
          margin-top: 4px;
          @include shadow(md);
          z-index: 1001;
          
          .suggestion-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            
            &:hover {
              background: map-get($background-colors, secondary);
            }
            
            i {
              @include text-color(secondary);
            }
            
            span {
              @include text-color(primary);
            }
          }
        }
      }
      
      .user-menu {
        position: relative;
        
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.3s ease;
          
          &:hover {
            border-color: var(--color-primary);
          }
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        
        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 240px;
          background: white;
          border: 1px solid map-get($border-colors, default);
          border-radius: 8px;
          margin-top: 8px;
          @include shadow(lg);
          z-index: 1001;
          
          .user-info {
            padding: 16px;
            border-bottom: 1px solid map-get($border-colors, light);
            
            .user-name {
              @include text-color(primary);
              font-weight: 600;
              margin-bottom: 4px;
            }
            
            .user-role {
              @include text-color(secondary);
              font-size: 14px;
            }
          }
          
          .menu-items {
            padding: 8px 0;
            
            .menu-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 16px;
              cursor: pointer;
              transition: background-color 0.2s ease;
              
              &:hover {
                background: map-get($background-colors, secondary);
                
                i, span {
                  color: var(--color-primary);
                }
              }
              
              i {
                @include text-color(secondary);
                transition: color 0.2s ease;
              }
              
              span {
                @include text-color(primary);
                transition: color 0.2s ease;
              }
            }
          }
        }
      }
    }
  }
  
  // 面包屑导航栏
  .breadcrumb-bar {
    height: 48px;
    padding: 0 24px;
    border-bottom: 3px solid var(--color-primary);
    background: map-get($background-colors, secondary);
    
    .breadcrumb-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .breadcrumb-link {
            @include text-color(secondary);
            text-decoration: none;
            transition: color 0.2s ease;
            
            &:hover {
              @include text-color(menu);
            }
          }
          
          .breadcrumb-current {
            @include text-color(primary);
            font-weight: 600;
          }
          
          .breadcrumb-separator {
            @include text-color(tertiary);
            font-size: 12px;
          }
        }
      }
      
      .quick-actions {
        display: flex;
        gap: 8px;
        
        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          border-color: var(--color-border);
          @include text-color(primary);
          
          &:hover {
            background: var(--color-light);
            transform: translateY(-1px);
            @include shadow(menu);
          }
          
          i {
            font-size: 14px;
          }
          
          span {
            font-size: 14px;
            font-weight: 500;
          }
        }
      }
    }
  }
  
  // 上下文提示
  .context-hint {
    position: fixed;
    top: 120px;
    right: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: white;
    border-left: 4px solid var(--color-primary);
    border-radius: 8px;
    @include shadow(md);
    z-index: 999;
    
    i {
      color: var(--color-primary);
    }
    
    span {
      @include text-color(primary);
      font-weight: 500;
    }
    
    .hint-close {
      margin-left: 8px;
      background: none;
      border: none;
      cursor: pointer;
      @include text-color(tertiary);
      
      &:hover {
        @include text-color(primary);
      }
    }
  }
}

// 过渡动画
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

```text

## 11.2 智能功能卡片系统

### 11.2.1 卡片组件工厂

```plaintext
<!-- components/cards/CardFactory.vue -->
<template>
  <component
    :is="cardComponent"
    v-bind="cardProps"
    @action="handleCardAction"
  />
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => [
      'statistic',
      'action',
      'data',
      'chart',
      'list',
      'progress',
      'status',
      'ai'
    ].includes(value)
  },
  theme: {
    type: String,
    default: 'system',
    validator: (value) => [
      'menu', 'form', 'knowledge', 'ai', 'data', 'system'
    ].includes(value)
  },
  data: {
    type: Object,
    required: true
  },
  config: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['action'])

// 卡片组件映射
const cardComponents = {
  statistic: () => import('./StatisticCard.vue'),
  action: () => import('./ActionCard.vue'),
  data: () => import('./DataCard.vue'),
  chart: () => import('./ChartCard.vue'),
  list: () => import('./ListCard.vue'),
  progress: () => import('./ProgressCard.vue'),
  status: () => import('./StatusCard.vue'),
  ai: () => import('./AICard.vue')
}

// 计算属性
const cardComponent = computed(() => {
  return cardComponents[props.type]
})

const cardProps = computed(() => ({
  theme: props.theme,
  data: props.data,
  config: props.config
}))

// 方法
const handleCardAction = (action) => {
  emit('action', action)
}
</script>

```text

```plaintext
<!-- components/cards/StatisticCard.vue -->
<template>
  <div class="statistic-card" :class="`theme-${theme}`">
    <div class="card-header">
      <div class="header-content">
        <div class="title-section">
          <i :class="data.icon" class="card-icon"></i>
          <div class="title-group">
            <h3 class="card-title">{{ data.title }}</h3>
            <p class="card-subtitle" v-if="data.subtitle">
              {{ data.subtitle }}
            </p>
          </div>
        </div>
        <div class="header-actions" v-if="data.actions">
          <button
            v-for="action in data.actions"
            :key="action.id"
            class="action-btn"
            @click="handleAction(action)"
          >
            <i :class="action.icon"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div class="card-body">
      <div class="statistic-content">
        <div class="main-value">
          <span class="value">{{ formattedValue }}</span>
          <span class="unit" v-if="data.unit">{{ data.unit }}</span>
        </div>
        
        <div class="comparison" v-if="data.comparison">
          <div class="trend" :class="data.comparison.trend">
            <i :class="trendIcon"></i>
            <span class="trend-value">
              {{ Math.abs(data.comparison.value) }}%
            </span>
          </div>
          <span class="comparison-label">{{ data.comparison.label }}</span>
        </div>
      </div>
      
      <div class="progress-container" v-if="data.progress">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${data.progress.percentage}%` }"
          ></div>
        </div>
        <div class="progress-label">
          <span>{{ data.progress.label }}</span>
          <span>{{ data.progress.percentage }}%</span>
        </div>
      </div>
    </div>
    
    <div class="card-footer" v-if="data.footer">
      <div class="footer-content">
        <span class="footer-text">{{ data.footer.text }}</span>
        <button
          v-if="data.footer.action"
          class="footer-btn"
          @click="handleAction(data.footer.action)"
        >
          {{ data.footer.action.label }}
          <i :class="data.footer.action.icon"></i>
        </button>
      </div>
    </div>
    
    <!-- 装饰元素 -->
    <div class="card-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-wave"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  theme: {
    type: String,
    default: 'system'
  },
  data: {
    type: Object,
    required: true
  },
  config: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['action'])

// 计算属性
const formattedValue = computed(() => {
  const value = props.data.value
  if (typeof value === 'number') {
    return new Intl.NumberFormat().format(value)
  }
  return value
})

const trendIcon = computed(() => {
  const trend = props.data.comparison?.trend
  return trend === 'up' ? 'icon-trend-up' : 'icon-trend-down'
})

// 方法
const handleAction = (action) => {
  emit('action', action)
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme/colors';

.statistic-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 24px;
  overflow: hidden;
  border-bottom: 4px solid var(--color-border);
  transition: all 0.3s ease;
  @include shadow(default);
  
  &:hover {
    transform: translateY(-4px);
    @include shadow(lg);
    
    .card-decoration .decoration-wave {
      transform: translateX(0);
    }
  }
  
  .card-header {
    margin-bottom: 20px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      
      .title-section {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .card-icon {
          font-size: 24px;
          color: var(--color-primary);
          background: var(--color-light);
          padding: 8px;
          border-radius: 8px;
        }
        
        .title-group {
          .card-title {
            @include text-color(primary);
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 4px 0;
          }
          
          .card-subtitle {
            @include text-color(secondary);
            font-size: 14px;
            margin: 0;
          }
        }
      }
      
      .header-actions {
        display: flex;
        gap: 4px;
        
        .action-btn {
          background: none;
          border: none;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          @include text-color(tertiary);
          
          &:hover {
            background: var(--color-light);
            @include text-color(primary);
          }
        }
      }
    }
  }
  
  .card-body {
    .statistic-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 16px;
      
      .main-value {
        .value {
          @include text-color(primary);
          font-size: 32px;
          font-weight: 700;
          line-height: 1;
        }
        
        .unit {
          @include text-color(secondary);
          font-size: 16px;
          font-weight: 500;
          margin-left: 4px;
        }
      }
      
      .comparison {
        text-align: right;
        
        .trend {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 2px;
          
          &.up {
            @include text-color(form);
          }
          
          &.down {
            @include text-color(ai);
          }
          
          i {
            font-size: 14px;
          }
          
          .trend-value {
            font-size: 14px;
            font-weight: 600;
          }
        }
        
        .comparison-label {
          @include text-color(tertiary);
          font-size: 12px;
        }
      }
    }
    
    .progress-container {
      .progress-bar {
        height: 6px;
        background: map-get($border-colors, light);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 8px;
        
        .progress-fill {
          height: 100%;
          background: var(--gradient);
          border-radius: 3px;
          transition: width 1s ease-in-out;
        }
      }
      
      .progress-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        span {
          @include text-color(secondary);
          font-size: 12px;
        }
      }
    }
  }
  
  .card-footer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid map-get($border-colors, light);
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .footer-text {
        @include text-color(secondary);
        font-size: 14px;
      }
      
      .footer-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        background: none;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        @include text-color(primary);
        font-size: 14px;
        
        &:hover {
          background: var(--color-light);
          color: var(--color-primary);
        }
      }
    }
  }
  
  .card-decoration {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
    overflow: hidden;
    
    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
      
      &.circle-1 {
        width: 80px;
        height: 80px;
        background: var(--color-primary);
        top: -20px;
        right: -20px;
      }
      
      &.circle-2 {
        width: 40px;
        height: 40px;
        background: var(--color-secondary);
        bottom: 20px;
        right: 40px;
      }
    }
    
    .decoration-wave {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--gradient);
      transform: translateX(-100%);
      transition: transform 0.6s ease;
    }
  }
}
</style>

```text

### 11.2.2 卡片网格布局系统

```plaintext
<!-- components/layout/CardGridSystem.vue -->
<template>
  <div class="card-grid-system">
    <!-- 布局选择器 -->
    <div class="layout-controls" v-if="showControls">
      <div class="layout-options">
        <button
          v-for="layout in layoutOptions"
          :key="layout.id"
          class="layout-btn"
          :class="{ active: currentLayout === layout.id }"
          @click="switchLayout(layout.id)"
        >
          <i :class="layout.icon"></i>
          <span>{{ layout.name }}</span>
        </button>
      </div>
      
      <div class="view-options">
        <button
          class="view-btn"
          :class="{ active: cardView === 'grid' }"
          @click="cardView = 'grid'"
        >
          <i class="icon-grid"></i>
        </button>
        <button
          class="view-btn"
          :class="{ active: cardView === 'list' }"
          @click="cardView = 'list'"
        >
          <i class="icon-list"></i>
        </button>
      </div>
    </div>
    
    <!-- 卡片网格 -->
    <div
      class="cards-container"
      :class="[
        `layout-${currentLayout}`,
        `view-${cardView}`,
        `theme-${currentTheme}`
      ]"
    >
      <template v-if="cardView === 'grid'">
        <!-- 网格布局 -->
        <div
          v-for="(row, rowIndex) in gridRows"
          :key="rowIndex"
          class="card-row"
        >
          <div
            v-for="card in row"
            :key="card.id"
            class="card-cell"
            :class="`span-${card.span || 1}`"
          >
            <CardFactory
              :type="card.type"
              :theme="card.theme || currentTheme"
              :data="card.data"
              :config="card.config"
              @action="handleCardAction"
            />
          </div>
        </div>
      </template>
      
      <template v-else>
        <!-- 列表布局 -->
        <div class="card-list">
          <div
            v-for="card in cards"
            :key="card.id"
            class="card-list-item"
          >
            <CardFactory
              :type="card.type"
              :theme="card.theme || currentTheme"
              :data="card.data"
              :config="card.config"
              @action="handleCardAction"
            />
          </div>
        </div>
      </template>
    </div>
    
    <!-- 空状态 -->
    <div v-if="!cards.length" class="empty-state">
      <div class="empty-icon">
        <i class="icon-inbox"></i>
      </div>
      <h3 class="empty-title">暂无数据</h3>
      <p class="empty-description">当前没有可显示的内容</p>
      <button class="empty-action" @click="handleEmptyAction">
        <i class="icon-plus"></i>
        <span>创建新内容</span>
      </button>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-circle"></div>
      </div>
      <p class="loading-text">加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CardFactory from '@/components/cards/CardFactory.vue'

// Props
const props = defineProps({
  cards: {
    type: Array,
    default: () => []
  },
  theme: {
    type: String,
    default: 'system'
  },
  layout: {
    type: String,
    default: 'balanced'
  },
  showControls: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['action', 'layout-change', 'empty-action'])

// 响应式数据
const currentLayout = ref(props.layout)
const cardView = ref('grid')
const isMounted = ref(false)

// 布局选项
const layoutOptions = ref([
  {
    id: 'compact',
    name: '紧凑布局',
    icon: 'icon-layout-compact',
    columns: 4
  },
  {
    id: 'balanced',
    name: '平衡布局',
    icon: 'icon-layout-balanced',
    columns: 3
  },
  {
    id: 'spacious',
    name: '宽松布局',
    icon: 'icon-layout-spacious',
    columns: 2
  },
  {
    id: 'focus',
    name: '焦点布局',
    icon: 'icon-layout-focus',
    columns: 1
  }
])

// 计算属性
const currentTheme = computed(() => props.theme)

const gridRows = computed(() => {
  if (cardView.value !== 'grid') return []
  
  const layout = layoutOptions.value.find(l => l.id === currentLayout.value)
  const columns = layout?.columns || 3
  
  const rows = []
  let currentRow = []
  
  props.cards.forEach((card, index) => {
    const cardSpan = card.span || 1
    
    // 如果当前行放不下这个卡片，开始新的一行
    const currentRowSpan = currentRow.reduce((sum, c) => sum + (c.span || 1), 0)
    if (currentRowSpan + cardSpan > columns) {
      rows.push(currentRow)
      currentRow = [card]
    } else {
      currentRow.push(card)
    }
    
    // 如果是最后一个卡片，把当前行加入rows
    if (index === props.cards.length - 1) {
      rows.push(currentRow)
    }
  })
  
  return rows
})

// 方法
const switchLayout = (layoutId) => {
  currentLayout.value = layoutId
  emit('layout-change', layoutId)
}

const handleCardAction = (action) => {
  emit('action', action)
}

const handleEmptyAction = () => {
  emit('empty-action')
}

// 生命周期
onMounted(() => {
  isMounted.value = true
})
</script>

<style lang="scss" scoped>
@import '@/styles/theme/colors';

.card-grid-system {
  min-height: 400px;
  
  // 布局控制
  .layout-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px 0;
    border-bottom: 1px solid map-get($border-colors, light);
    
    .layout-options {
      display: flex;
      gap: 8px;
      
      .layout-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border: 1px solid map-get($border-colors, default);
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
        @include text-color(secondary);
        
        &:hover {
          border-color: var(--color-primary);
          @include text-color(primary);
        }
        
        &.active {
          background: var(--color-light);
          border-color: var(--color-primary);
          @include text-color(primary);
          font-weight: 500;
        }
        
        i {
          font-size: 16px;
        }
        
        span {
          font-size: 14px;
        }
      }
    }
    
    .view-options {
      display: flex;
      gap: 4px;
      border: 1px solid map-get($border-colors, default);
      border-radius: 8px;
      overflow: hidden;
      
      .view-btn {
        padding: 8px 12px;
        background: white;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        @include text-color(tertiary);
        
        &:hover {
          background: map-get($background-colors, secondary);
          @include text-color(primary);
        }
        
        &.active {
          background: var(--color-primary);
          color: white;
        }
        
        i {
          font-size: 16px;
        }
      }
    }
  }
  
  // 卡片容器
  .cards-container {
    transition: all 0.3s ease;
    
    // 网格布局
    &.view-grid {
      .card-row {
        display: grid;
        gap: 24px;
        margin-bottom: 24px;
        
        // 紧凑布局
        &.layout-compact {
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }
        
        // 平衡布局
        &.layout-balanced {
          grid-template-columns: repeat(3, 1fr);
        }
        
        // 宽松布局
        &.layout-spacious {
          grid-template-columns: repeat(2, 1fr);
        }
        
        // 焦点布局
        &.layout-focus {
          grid-template-columns: 1fr;
        }
        
        .card-cell {
          &.span-2 {
            grid-column: span 2;
          }
          
          &.span-3 {
            grid-column: span 3;
          }
          
          &.span-4 {
            grid-column: span 4;
          }
        }
      }
    }
    
    // 列表布局
    &.view-list {
      .card-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        
        .card-list-item {
          transition: transform 0.2s ease;
          
          &:hover {
            transform: translateX(4px);
          }
        }
      }
    }
  }
  
  // 空状态
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    text-align: center;
    
    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: map-get($background-colors, secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      
      i {
        font-size: 32px;
        @include text-color(tertiary);
      }
    }
    
    .empty-title {
      @include text-color(primary);
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    
    .empty-description {
      @include text-color(secondary);
      font-size: 16px;
      margin: 0 0 24px 0;
      max-width: 400px;
    }
    
    .empty-action {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      
      &:hover {
        background: var(--color-dark);
        transform: translateY(-2px);
        @include shadow(md);
      }
    }
  }
  
  // 加载状态
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
    
    .loading-spinner {
      margin-bottom: 16px;
      
      .spinner-circle {
        width: 40px;
        height: 40px;
        border: 3px solid map-get($border-colors, light);
        border-top: 3px solid var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
    
    .loading-text {
      @include text-color(secondary);
      font-size: 16px;
      margin: 0;
    }
  }
}

// 动画
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

```text

## 11.3 全局弹窗自治系统

### 11.3.1 弹窗管理器实现

```typescript
// composables/useModalManager.ts
import { ref, computed, reactive, onUnmounted } from 'vue'

export interface ModalConfig {
  id: string
  component: any
  props?: Record<string, any>
  events?: Record<string, Function>
  options?: ModalOptions
}

export interface ModalOptions {
  title?: string
  width?: string | number
  height?: string | number
  theme?: string
  closable?: boolean
  maskClosable?: boolean
  showClose?: boolean
  showHeader?: boolean
  showFooter?: boolean
  customClass?: string
  zIndex?: number
  animation?: string
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
}

export interface ModalInstance {
  id: string
  component: any
  props: Record<string, any>
  events: Record<string, Function>
  options: ModalOptions
  visible: boolean
  zIndex: number
}

class ModalManager {
  private modals = reactive<Map<string, ModalInstance>>(new Map())
  private zIndexBase = 2000
  private activeModals: string[] = []

  // 打开弹窗
  open(config: ModalConfig): string {
    const { id, component, props = {}, events = {}, options = {} } = config
    
    // 如果弹窗已存在，先关闭
    if (this.modals.has(id)) {
      this.close(id)
    }

    const zIndex = this.zIndexBase + this.modals.size
    
    const modalInstance: ModalInstance = {
      id,
      component,
      props,
      events,
      options: {
        theme: 'system',
        closable: true,
        maskClosable: true,
        showClose: true,
        showHeader: true,
        showFooter: false,
        width: '600px',
        position: 'center',
        animation: 'scale',
        ...options
      },
      visible: true,
      zIndex
    }

    this.modals.set(id, modalInstance)
    this.activeModals.push(id)
    
    // 阻止背景滚动
    this.updateBodyScroll()
    
    return id
  }

  // 关闭弹窗
  close(id: string): void {
    const modal = this.modals.get(id)
    if (modal) {
      modal.visible = false
      
      // 延迟移除，等待动画完成
      setTimeout(() => {
        this.modals.delete(id)
        this.activeModals = this.activeModals.filter(modalId => modalId !== id)
        this.updateBodyScroll()
      }, 300)
    }
  }

  // 关闭所有弹窗
  closeAll(): void {
    this.modals.forEach(modal => {
      modal.visible = false
    })
    
    setTimeout(() => {
      this.modals.clear()
      this.activeModals = []
      this.updateBodyScroll()
    }, 300)
  }

  // 更新弹窗属性
  update(id: string, updates: Partial<ModalInstance>): void {
    const modal = this.modals.get(id)
    if (modal) {
      Object.assign(modal, updates)
    }
  }

  // 获取弹窗实例
  get(id: string): ModalInstance | undefined {
    return this.modals.get(id)
  }

  // 获取所有弹窗
  getAll(): ModalInstance[] {
    return Array.from(this.modals.values())
  }

  // 获取可见弹窗数量
  getVisibleCount(): number {
    return this.activeModals.length
  }

  // 是否有弹窗显示
  hasVisible(): boolean {
    return this.activeModals.length > 0
  }

  // 更新body滚动状态
  private updateBodyScroll(): void {
    const hasModals = this.hasVisible()
    document.body.style.overflow = hasModals ? 'hidden' : ''
  }

  // 获取下一个zIndex
  private getNextZIndex(): number {
    return this.zIndexBase + this.modals.size + 1
  }
}

// 全局弹窗管理器实例
const modalManager = new ModalManager()

// Vue composable
export function useModalManager() {
  const modals = computed(() => modalManager.getAll())
  const hasVisibleModals = computed(() => modalManager.hasVisible())
  const visibleCount = computed(() => modalManager.getVisibleCount())

  // 打开弹窗
  const openModal = (config: ModalConfig): string => {
    return modalManager.open(config)
  }

  // 关闭弹窗
  const closeModal = (id: string): void => {
    modalManager.close(id)
  }

  // 关闭所有弹窗
  const closeAllModals = (): void => {
    modalManager.closeAll()
  }

  // 更新弹窗
  const updateModal = (id: string, updates: Partial<ModalInstance>): void => {
    modalManager.update(id, updates)
  }

  // 获取弹窗
  const getModal = (id: string): ModalInstance | undefined => {
    return modalManager.get(id)
  }

  // 预定义弹窗类型
  const modalTypes = {
    confirm: (config: {
      title?: string
      content: string
      theme?: string
      confirmText?: string
      cancelText?: string
      onConfirm?: () => void
      onCancel?: () => void
    }) => {
      return openModal({
        id: `confirm-${Date.now()}`,
        component: () => import('@/components/modals/ConfirmModal.vue'),
        props: {
          title: config.title || '确认操作',
          content: config.content,
          theme: config.theme || 'system',
          confirmText: config.confirmText || '确认',
          cancelText: config.cancelText || '取消'
        },
        events: {
          confirm: config.onConfirm,
          cancel: config.onCancel
        },
        options: {
          width: '400px',
          showFooter: true
        }
      })
    },

    alert: (config: {
      title?: string
      content: string
      theme?: string
      buttonText?: string
      onClose?: () => void
    }) => {
      return openModal({
        id: `alert-${Date.now()}`,
        component: () => import('@/components/modals/AlertModal.vue'),
        props: {
          title: config.title || '提示',
          content: config.content,
          theme: config.theme || 'system',
          buttonText: config.buttonText || '知道了'
        },
        events: {
          close: config.onClose
        },
        options: {
          width: '400px',
          showFooter: true
        }
      })
    },

    form: (config: {
      title: string
      formComponent: any
      formProps?: Record<string, any>
      theme?: string
      width?: string
      onSubmit?: (data: any) => void
      onCancel?: () => void
    }) => {
      return openModal({
        id: `form-${Date.now()}`,
        component: () => import('@/components/modals/FormModal.vue'),
        props: {
          title: config.title,
          formComponent: config.formComponent,
          formProps: config.formProps || {},
          theme: config.theme || 'system'
        },
        events: {
          submit: config.onSubmit,
          cancel: config.onCancel
        },
        options: {
          width: config.width || '600px',
          showFooter: true
        }
      })
    },

    drawer: (config: {
      title?: string
      component: any
      props?: Record<string, any>
      theme?: string
      position?: 'left' | 'right' | 'top' | 'bottom'
      size?: string
      onClose?: () => void
    }) => {
      return openModal({
        id: `drawer-${Date.now()}`,
        component: config.component,
        props: config.props || {},
        events: {
          close: config.onClose
        },
        options: {
          title: config.title,
          theme: config.theme || 'system',
          position: config.position || 'right',
          width: config.size || '400px',
          showHeader: true,
          showClose: true,
          maskClosable: true
        }
      })
    }
  }

  onUnmounted(() => {
    closeAllModals()
  })

  return {
    modals,
    hasVisibleModals,
    visibleCount,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    getModal,
    modalTypes
  }
}

```text

### 11.3.2 智能弹窗容器

```plaintext
<!-- components/modals/ModalContainer.vue -->
<template>
  <Teleport to="body">
    <transition-group name="modal-fade">
      <div
        v-for="modal in visibleModals"
        :key="modal.id"
        class="modal-overlay"
        :style="{ zIndex: modal.zIndex }"
        @click.self="handleMaskClick(modal)"
      >
        <div
          class="modal-container"
          :class="[
            `theme-${modal.options.theme}`,
            `position-${modal.options.position}`,
            `animation-${modal.options.animation}`,
            modal.options.customClass
          ]"
          :style="modalStyle(modal)"
        >
          <!-- 弹窗头部 -->
          <div
            v-if="modal.options.showHeader"
            class="modal-header"
          >
            <div class="header-content">
              <h3 class="modal-title">
                <i
                  v-if="modal.options.theme"
                  :class="themeIcon(modal.options.theme)"
                  class="title-icon"
                ></i>
                {{ modal.options.title }}
              </h3>
              
              <div class="header-actions">
                <button
                  v-if="modal.options.showClose"
                  class="close-btn"
                  @click="closeModal(modal.id)"
                >
                  <i class="icon-close"></i>
                </button>
              </div>
            </div>
            
            <!-- 进度条 -->
            <div
              v-if="modal.props.progress !== undefined"
              class="progress-bar"
            >
              <div
                class="progress-fill"
                :style="{ width: `${modal.props.progress}%` }"
              ></div>
            </div>
          </div>
          
          <!-- 弹窗内容 -->
          <div class="modal-content">
            <component
              :is="modal.component"
              v-bind="modal.props"
              v-on="modal.events"
            />
          </div>
          
          <!-- 弹窗底部 -->
          <div
            v-if="modal.options.showFooter"
            class="modal-footer"
          >
            <slot name="footer" :modal="modal">
              <div class="footer-actions">
                <button
                  class="btn-secondary"
                  @click="handleCancel(modal)"
                >
                  取消
                </button>
                <button
                  class="btn-primary"
                  :class="`theme-${modal.options.theme}`"
                  @click="handleConfirm(modal)"
                >
                  确认
                </button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </transition-group>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useModalManager } from '@/composables/useModalManager'
import type { ModalInstance } from '@/composables/useModalManager'

const { modals, closeModal } = useModalManager()

// 计算属性
const visibleModals = computed(() => {
  return modals.value.filter(modal => modal.visible)
})

// 方法
const handleMaskClick = (modal: ModalInstance) => {
  if (modal.options.maskClosable && modal.options.closable) {
    closeModal(modal.id)
  }
}

const modalStyle = (modal: ModalInstance) => {
  const style: Record<string, string> = {}
  
  if (modal.options.width) {
    style.width = typeof modal.options.width === 'number' 
      ? `${modal.options.width}px` 
      : modal.options.width
  }
  
  if (modal.options.height) {
    style.height = typeof modal.options.height === 'number'
      ? `${modal.options.height}px`
      : modal.options.height
  }
  
  return style
}

const themeIcon = (theme: string) => {
  const icons: Record<string, string> = {
    menu: 'icon-layout',
    form: 'icon-form',
    knowledge: 'icon-brain',
    ai: 'icon-ai',
    data: 'icon-database',
    system: 'icon-settings'
  }
  return icons[theme] || 'icon-circle'
}

const handleCancel = (modal: ModalInstance) => {
  if (modal.events.cancel) {
    modal.events.cancel()
  }
  closeModal(modal.id)
}

const handleConfirm = (modal: ModalInstance) => {
  if (modal.events.confirm) {
    modal.events.confirm()
  } else {
    closeModal(modal.id)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme/colors';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  .modal-container {
    background: white;
    border-radius: 12px;
    border-bottom: 4px solid var(--color-border);
    @include shadow(xl);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    overflow: hidden;
    
    // 位置变体
    &.position-center {
      margin: auto;
    }
    
    &.position-top {
      align-self: flex-start;
      margin-top: 20px;
    }
    
    &.position-bottom {
      align-self: flex-end;
      margin-bottom: 20px;
    }
    
    &.position-left {
      align-self: flex-start;
      margin-left: 20px;
    }
    
    &.position-right {
      align-self: flex-end;
      margin-right: 20px;
    }
    
    // 动画变体
    &.animation-scale {
      animation: modal-scale 0.3s ease;
    }
    
    &.animation-slide {
      animation: modal-slide 0.3s ease;
    }
    
    &.animation-fade {
      animation: modal-fade 0.3s ease;
    }
    
    // 弹窗头部
    .modal-header {
      padding: 24px 24px 0;
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        .modal-title {
          @include text-color(primary);
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          
          .title-icon {
            color: var(--color-primary);
            font-size: 20px;
          }
        }
        
        .header-actions {
          .close-btn {
            background: none;
            border: none;
            padding: 6px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            @include text-color(tertiary);
            
            &:hover {
              background: map-get($background-colors, secondary);
              @include text-color(primary);
            }
            
            i {
              font-size: 18px;
            }
          }
        }
      }
      
      .progress-bar {
        height: 3px;
        background: map-get($border-colors, light);
        border-radius: 2px;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: var(--gradient);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
      }
    }
    
    // 弹窗内容
    .modal-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      
      // 自定义滚动条
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: map-get($background-colors, secondary);
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: map-get($border-colors, default);
        border-radius: 3px;
        
        &:hover {
          background: map-get($border-colors, dark);
        }
      }
    }
    
    // 弹窗底部
    .modal-footer {
      padding: 0 24px 24px;
      
      .footer-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        
        .btn-secondary {
          padding: 10px 20px;
          border: 1px solid map-get($border-colors, default);
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          @include text-color(secondary);
          font-weight: 500;
          
          &:hover {
            border-color: map-get($border-colors, dark);
            @include text-color(primary);
          }
        }
        
        .btn-primary {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background: var(--color-primary);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          
          &:hover {
            background: var(--color-dark);
            transform: translateY(-1px);
            @include shadow(menu);
          }
        }
      }
    }
  }
}

// 动画定义
@keyframes modal-scale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes modal-slide {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes modal-fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

// 过渡组动画
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from {
  opacity: 0;
}

.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-move {
  transition: transform 0.3s ease;
}
</style>

```text

### 11.3.3 预定义弹窗组件

```plaintext
<!-- components/modals/ConfirmModal.vue -->
<template>
  <div class="confirm-modal">
    <div class="modal-icon" :class="`theme-${theme}`">
      <i class="icon-help-circle"></i>
    </div>
    
    <div class="modal-content">
      <h3 class="content-title" v-if="title">{{ title }}</h3>
      <div class="content-text">
        {{ content }}
      </div>
    </div>
    
    <div class="modal-actions">
      <button class="btn-cancel" @click="handleCancel">
        {{ cancelText }}
      </button>
      <button class="btn-confirm" :class="`theme-${theme}`" @click="handleConfirm">
        {{ confirmText }}
      </button>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  title: String,
  content: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    default: 'system'
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})

// Emits
const emit = defineEmits(['confirm', 'cancel'])

// 方法
const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style lang="scss" scoped>
@import '@/styles/theme/colors';

.confirm-modal {
  text-align: center;
  padding: 8px;
  
  .modal-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    background: var(--color-light);
    
    i {
      font-size: 32px;
      color: var(--color-primary);
    }
  }
  
  .modal-content {
    margin-bottom: 24px;
    
    .content-title {
      @include text-color(primary);
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 12px 0;
    }
    
    .content-text {
      @include text-color(secondary);
      font-size: 16px;
      line-height: 1.5;
    }
  }
  
  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    
    .btn-cancel {
      padding: 10px 24px;
      border: 1px solid map-get($border-colors, default);
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      @include text-color(secondary);
      font-weight: 500;
      
      &:hover {
        border-color: map-get($border-colors, dark);
        @include text-color(primary);
      }
    }
    
    .btn-confirm {
      padding: 10px 24px;
      border: none;
      border-radius: 8px;
      background: var(--color-primary);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      
      &:hover {
        background: var(--color-dark);
        transform: translateY(-1px);
        @include shadow(menu);
      }
    }
  }
}
</style>

```text

```plaintext
<!-- components/modals/FormModal.vue -->
<template>
  <div class="form-modal">
    <div class="form-content">
      <component
        :is="formComponent"
        v-bind="formProps"
        ref="formRef"
        @submit="handleFormSubmit"
        @cancel="handleFormCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  formComponent: {
    type: Object,
    required: true
  },
  formProps: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['submit', 'cancel'])

// 模板引用
const formRef = ref()

// 方法
const handleFormSubmit = (formData) => {
  emit('submit', formData)
}

const handleFormCancel = () => {
  emit('cancel')
}

// 暴露方法给父组件
defineExpose({
  getFormData: () => formRef.value?.getFormData?.(),
  validate: () => formRef.value?.validate?.(),
  reset: () => formRef.value?.reset?.()
})
</script>

<style lang="scss" scoped>
.form-modal {
  .form-content {
    min-height: 200px;
  }
}
</style>

```text

---

## 🎯 UI/UX系统实现总结

基于"五高五标五化"核心理念，我们设计了完整的UI/UX系统：

### 🌈 高标准建设体现

- 色彩系统：6大功能分类色彩体系，禁用纯黑
- 边框设计：功能分类菜单栏右边线3px，面包屑导航下边线3px，卡片分区下边线4px
- 阴影效果：彩色阴影增强视觉层次和交互感

### ⚡ 高效率运营体现

- 组件工厂：统一的卡片组件生成系统
- 布局系统：多种网格布局模式，支持响应式
- 弹窗管理：统一的弹窗生命周期管理

### 🎨 高质量服务体现

- 交互反馈：悬停颜色变化、动画过渡效果
- 视觉一致性：同一功能分类色彩统一
- 无障碍设计：良好的对比度和可访问性

### 🔧 智能化实现体现

- 主题系统：动态主题切换能力
- 布局自适应：智能卡片网格布局
- 弹窗自洽：弹窗堆叠管理和z-index自动计算

### 🌐 生态化整合体现

- 设计系统：完整的色彩、字体、间距规范
- 组件生态：可复用的UI组件库
- 交互模式：统一的用户交互体验
这一UI/UX系统为智枢服务化平台提供了美观、一致、高效的用户界面，完全符合现代化企业级应用的设计标准。
——————————
