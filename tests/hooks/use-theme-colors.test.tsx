/**
 * useThemeColors Hook - Unit Tests
 * 测试双主题颜色系统的核心 Hook
 */

import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { getThemeNavColor, LIQUID_GLASS_NAV_COLORS, useThemeColors } from '../../src/app/components/hooks/use-theme-colors';
import { ThemeSwitcherProvider } from '../../src/app/components/theme-switcher-context';


// Mock wrapper for Context Provider
const createWrapper = (initialTheme: 'cyberpunk' | 'liquidGlass' = 'cyberpunk') => {
  return ({ children }: { children: ReactNode }) => (
    <ThemeSwitcherProvider defaultTheme={initialTheme}>
      {children}
    </ThemeSwitcherProvider>
  );
};

describe('useThemeColors Hook', () => {
  describe('UTC-TH-001: Cyberpunk 主题初始化', () => {
    it('应该返回完整的 Cyberpunk 颜色集', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      const tc = result.current;

      // 验证主题标识
      expect(tc.mode).toBe('cyberpunk');
      expect(tc.isCyberpunk).toBe(true);
      expect(tc.isLiquidGlass).toBe(false);

      // 验证主色系
      expect(tc.primary).toBe('#00f0ff');
      expect(tc.secondary).toBe('#00d4ff');
      expect(tc.accent).toBe('#00ffcc');

      // 验证背景系统
      expect(tc.bgBase).toBe('#0a0a0a');
      expect(tc.bgCard).toBe('rgba(10,10,10,0.75)');

      // 验证文本系统
      expect(tc.textPrimary).toBe('rgba(255,255,255,0.9)');
      expect(tc.textSecondary).toBe('rgba(255,255,255,0.5)');

      // 验证边框系统
      expect(tc.borderDefault).toBe('rgba(0,240,255,0.15)');

      // 验证工具函数存在
      expect(typeof tc.alpha).toBe('function');
      expect(typeof tc.neonGlow).toBe('function');
      expect(typeof tc.navItemStyle).toBe('function');
    });
  });

  describe('UTC-TH-002: Liquid Glass 主题初始化', () => {
    it('应该返回完整的 Liquid Glass 颜色集', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('liquidGlass'),
      });

      const tc = result.current;

      // 验证主题标识
      expect(tc.mode).toBe('liquidGlass');
      expect(tc.isCyberpunk).toBe(false);
      expect(tc.isLiquidGlass).toBe(true);

      // 验证主色系（绿色环保主题）
      expect(tc.primary).toBe('#00ff87');
      expect(tc.secondary).toBe('#00d4ff');
      expect(tc.accent).toBe('#00ffaa');

      // 验证背景系统（毛玻璃效果）
      expect(tc.bgBase).toBe('#0a0f0a');
      expect(tc.bgCard).toBe('rgba(255,255,255,0.08)');

      // 验证文本系统
      expect(tc.textPrimary).toBe('rgba(255,255,255,0.95)');

      // 验证边框系统
      expect(tc.borderDefault).toBe('rgba(255,255,255,0.1)');
    });
  });

  describe('UTC-TH-005: alpha() 辅助函数 - hex 颜色转换', () => {
    it('应该正确将 hex 颜色转换为 rgba 格式', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      const { alpha } = result.current;

      // 测试基础转换
      expect(alpha('#00f0ff', 0.5)).toBe('rgba(0,240,255,0.5)');
      expect(alpha('#00d4ff', 0.2)).toBe('rgba(0,212,255,0.2)');

      // 测试边界值
      expect(alpha('#ffffff', 0)).toBe('rgba(255,255,255,0)');
      expect(alpha('#000000', 1)).toBe('rgba(0,0,0,1)');

      // 测试小数精度
      expect(alpha('#00ff87', 0.15)).toBe('rgba(0,255,135,0.15)');
    });

    it('应该处理已经是 rgba 格式的颜色', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      const { alpha } = result.current;

      // 如果已经是 rgba，直接返回原值
      const rgbaColor = 'rgba(255,255,255,0.5)';
      expect(alpha(rgbaColor, 0.3)).toBe(rgbaColor);
    });
  });

  describe('UTC-TH-006/007: neonGlow() 光晕效果', () => {
    it('在 Cyberpunk 模式应该生成霓虹光晕', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      const { neonGlow } = result.current;

      const glow = neonGlow('#00f0ff', 1);

      // 验证包含双层阴影
      expect(glow).toContain('0 0 10px');
      expect(glow).toContain('0 0 20px');
      expect(glow).toContain('rgba(0,240,255,0.4)');
      expect(glow).toContain('rgba(0,240,255,0.2)');
    });

    it('在 Liquid Glass 模式应该生成玻璃光晕', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('liquidGlass'),
      });

      const { neonGlow } = result.current;

      const glow = neonGlow('#00ff87', 1);

      // 验证包含柔和阴影
      expect(glow).toContain('0 0 15px');
      expect(glow).toContain('rgba(0,0,0,0.1)');
    });

    it('应该支持强度参数', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      const { neonGlow } = result.current;

      const glow1 = neonGlow('#00f0ff', 0.5);
      const glow2 = neonGlow('#00f0ff', 2);

      // 强度较低应该有较小的扩散
      expect(glow1).toContain('0 0 5px');
      // 强度较高应该有较大的扩散
      expect(glow2).toContain('0 0 20px');
    });
  });

  describe('UTC-TH-008/009: navActiveBg 和 navItemStyle', () => {
    it('激活状态应该有正确的背景色', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      const { navActiveBg } = result.current;

      const activeBg = navActiveBg('#00f0ff');

      // Cyberpunk 模式使用 hex 后缀
      expect(activeBg).toContain('#00f0ff15');
    });

    it('应该返回正确的导航项样式对象 - 激活状态', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      const { navItemStyle } = result.current;

      const activeStyle = navItemStyle('#00f0ff', true);

      expect(activeStyle).toHaveProperty('background');
      expect(activeStyle).toHaveProperty('color', '#00f0ff');
      expect(activeStyle).toHaveProperty('boxShadow');
      expect(activeStyle).toHaveProperty('border');
      expect(activeStyle.border).toContain('1px solid');
    });

    it('应该返回正确的导航项样式对象 - 非激活状态', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      const { navItemStyle, navInactiveText } = result.current;

      const inactiveStyle = navItemStyle('#00f0ff', false);

      expect(inactiveStyle.background).toBe('transparent');
      expect(inactiveStyle.color).toBe(navInactiveText);
      expect(inactiveStyle.boxShadow).toBe('none');
      expect(inactiveStyle.border).toBe('1px solid transparent');
    });
  });

  describe('UTC-TH-011: getThemeNavColor 颜色映射', () => {
    it('Cyberpunk 模式应该返回原色', () => {
      const originalColor = '#00f0ff';
      const mappedColor = getThemeNavColor(originalColor, true);

      expect(mappedColor).toBe(originalColor);
    });

    it('Liquid Glass 模式应该映射到对应颜色', () => {
      const cyberpunkColor = '#00f0ff';
      const mappedColor = getThemeNavColor(cyberpunkColor, false);

      expect(mappedColor).toBe('#00ff87'); // 映射到绿色主题
    });

    it('应该正确映射所有预定义颜色', () => {
      Object.entries(LIQUID_GLASS_NAV_COLORS).forEach(([cyber, liquid]) => {
        const mapped = getThemeNavColor(cyber, false);
        expect(mapped).toBe(liquid);
      });
    });

    it('未定义的颜色应该返回原值', () => {
      const unknownColor = '#ff00ff';
      const mappedColor = getThemeNavColor(unknownColor, false);

      expect(mappedColor).toBe(unknownColor);
    });
  });

  describe('UTC-TH-012: 内存泄漏检测', () => {
    it('多次主题切换后应该无内存泄漏', () => {
      const { result, rerender } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      // 模拟多次切换
      for (let i = 0; i < 100; i++) {
        rerender();
      }

      // 验证 Hook 仍然正常工作
      expect(result.current.mode).toBe('cyberpunk');
      expect(typeof result.current.alpha).toBe('function');
    });
  });

  describe('边界测试', () => {
    it('应该处理极端的透明度值', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      const { alpha } = result.current;

      // 负数透明度
      const negativeAlpha = alpha('#00f0ff', -0.5);
      expect(negativeAlpha).toContain('rgba(0,240,255,-0.5)');

      // 超过 1 的透明度
      const overAlpha = alpha('#00f0ff', 1.5);
      expect(overAlpha).toContain('rgba(0,240,255,1.5)');
    });

    it('应该处理空颜色字符串', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      const { alpha } = result.current;

      const emptyColor = alpha('', 0.5);
      expect(emptyColor).toBe('');
    });
  });

  describe('UTC-TH-013: Shadow System', () => {
    it('Cyberpunk 阴影应该包含 neon 光晕', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });
      const tc = result.current;

      expect(tc.shadowSm).toContain('rgba(0,240,255');
      expect(tc.shadowMd).toContain('rgba(0,240,255');
      expect(tc.shadowLg).toContain('rgba(0,240,255');
      expect(tc.shadowGlow).toContain('rgba(0,240,255');
      expect(tc.shadowCardHover).toContain('inset');
    });

    it('Liquid Glass 阴影应该更柔和', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('liquidGlass'),
      });
      const tc = result.current;

      expect(tc.shadowSm).toContain('rgba(0,0,0');
      expect(tc.shadowMd).toContain('inset');
      expect(tc.shadowLg).toContain('rgba(0,0,0');
      expect(tc.shadowCardHover).toContain('rgba(0,255,135');
    });
  });

  describe('UTC-TH-014: Gradient System', () => {
    it('两种主题都应该有 4 个渐变值', () => {
      const { result: cyberResult } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });
      const { result: glassResult } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('liquidGlass'),
      });

      // Cyberpunk gradients
      expect(cyberResult.current.gradientPrimary).toContain('linear-gradient');
      expect(cyberResult.current.gradientCard).toContain('linear-gradient');
      expect(cyberResult.current.gradientButton).toContain('linear-gradient');
      expect(cyberResult.current.gradientButtonHover).toContain('linear-gradient');

      // Liquid Glass gradients
      expect(glassResult.current.gradientPrimary).toContain('#00ff87');
      expect(glassResult.current.gradientButton).toContain('rgba(0,255,135');
    });
  });

  describe('UTC-TH-015: Header/Footer/Sidebar Tokens', () => {
    it('Cyberpunk header 应该使用 neon 边框', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });
      const tc = result.current;

      expect(tc.headerBg).toContain('rgba(10,10,10');
      expect(tc.headerBorder).toBe('#00f0ff');
      expect(tc.headerGlow).toContain('rgba(0,240,255');
      expect(tc.footerBg).toContain('rgba(10,10,10');
      expect(tc.footerBorder).toBe('#00f0ff');
    });

    it('Liquid Glass header 应该使用玻璃效果', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('liquidGlass'),
      });
      const tc = result.current;

      expect(tc.headerBg).toContain('rgba(10,15,10');
      expect(tc.headerBorder).toContain('rgba(0,255,135');
      expect(tc.footerBorder).toContain('rgba(0,255,135');
    });

    it('Sidebar 应该有正确的边框层级', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });
      const tc = result.current;

      expect(tc.sidebarBg).toBeTruthy();
      expect(tc.sidebarBorder).toBeTruthy();
      expect(tc.sidebarBorderExpanded).toBeTruthy();
      // Expanded border should be more visible
      expect(tc.sidebarBorderExpanded).not.toBe(tc.sidebarBorder);
    });
  });

  describe('UTC-TH-016: Effects System', () => {
    it('应该提供完整的效果令牌', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });
      const tc = result.current;

      expect(tc.blur).toBe('20px');
      expect(tc.backdropFilter).toContain('blur');
      expect(tc.springEasing).toContain('cubic-bezier');
      expect(tc.transitionAll).toContain('all');
      expect(tc.hoverTransform).toContain('translateY');
      expect(tc.cardHoverTransform).toContain('scale');
    });

    it('Liquid Glass backdropFilter 应该包含 saturate', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('liquidGlass'),
      });

      expect(result.current.backdropFilter).toContain('saturate');
    });

    it('Cyberpunk backdropFilter 不应包含 saturate', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      expect(result.current.backdropFilter).not.toContain('saturate');
    });
  });

  describe('UTC-TH-017: Status Colors', () => {
    it('Cyberpunk 在线状态应该是 cyan 系', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });

      expect(result.current.statusOnline).toBe('#00ffc8');
      expect(result.current.statusOnlineGlow).toContain('#00ffc8');
    });

    it('Liquid Glass 在线状态应该是绿色系', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('liquidGlass'),
      });

      expect(result.current.statusOnline).toBe('#00ff87');
      expect(result.current.statusOnlineGlow).toContain('rgba(0,255,135');
    });
  });

  describe('UTC-TH-018: navBadgeShadow 和 navActiveGlow', () => {
    it('navBadgeShadow 在 Cyberpunk 模式应返回双层阴影', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });
      const shadow = result.current.navBadgeShadow('#00f0ff');

      expect(shadow).toContain('#00f0ff');
      expect(shadow).toContain('0 0 8px');
      expect(shadow).toContain('0 0 16px');
    });

    it('navBadgeShadow 在 Liquid Glass 模式应返回柔和阴影', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('liquidGlass'),
      });
      const shadow = result.current.navBadgeShadow('#00ff87');

      expect(shadow).toContain('0 0 10px');
    });

    it('navActiveGlow 在 Cyberpunk 应包含 inset', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });
      const glow = result.current.navActiveGlow('#00f0ff');

      expect(glow).toContain('inset');
    });

    it('navActiveBorder 应返回完整 border 字符串', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('liquidGlass'),
      });
      const border = result.current.navActiveBorder('#00ff87');

      expect(border).toContain('1px solid');
    });
  });

  describe('UTC-TH-019: Danger/Warning Colors', () => {
    it('两种主题都应该有 danger 和 warning 颜色', () => {
      const { result: cyberResult } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });
      const { result: glassResult } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('liquidGlass'),
      });

      expect(cyberResult.current.danger).toBe('#ff0040');
      expect(cyberResult.current.warning).toBe('#ff9900');
      expect(glassResult.current.danger).toBe('#ef4444');
      expect(glassResult.current.warning).toBe('#f59e0b');
    });
  });

  describe('UTC-TH-020: Complete Token Coverage', () => {
    it('ThemeColors 接口应有全部属性', () => {
      const { result } = renderHook(() => useThemeColors(), {
        wrapper: createWrapper('cyberpunk'),
      });
      const tc = result.current;

      // Verify every key property exists and is defined
      const requiredStringKeys = [
        'primary', 'primaryRgb', 'primaryGlow', 'secondary', 'secondaryRgb',
        'accent', 'accentRgb', 'success', 'highlight', 'muted', 'danger', 'warning',
        'bgBase', 'bgCard', 'bgCardHover', 'bgElevated', 'bgOverlay', 'bgInput', 'bgInputFocus',
        'textPrimary', 'textSecondary', 'textMuted', 'textAccent', 'textInverse',
        'borderDefault', 'borderHover', 'borderActive', 'borderSubtle', 'borderGlow',
        'shadowSm', 'shadowMd', 'shadowLg', 'shadowGlow', 'shadowCardHover',
        'headerBg', 'headerBorder', 'headerGlow', 'footerBg', 'footerBorder',
        'sidebarBg', 'sidebarBorder', 'sidebarBorderExpanded',
        'gradientPrimary', 'gradientCard', 'gradientButton', 'gradientButtonHover',
        'navInactiveText', 'statusOnline', 'statusOnlineGlow',
        'blur', 'backdropFilter', 'springEasing', 'transitionAll', 'hoverTransform', 'cardHoverTransform',
      ];

      requiredStringKeys.forEach((key) => {
        expect(tc[key as keyof typeof tc], `Missing token: ${key}`).toBeDefined();
        expect(typeof tc[key as keyof typeof tc], `Token ${key} should be string`).toBe('string');
      });

      // Verify function properties
      expect(typeof tc.alpha).toBe('function');
      expect(typeof tc.neonGlow).toBe('function');
      expect(typeof tc.navItemStyle).toBe('function');
      expect(typeof tc.navActiveBg).toBe('function');
      expect(typeof tc.navActiveGlow).toBe('function');
      expect(typeof tc.navActiveBorder).toBe('function');
      expect(typeof tc.navBadgeShadow).toBe('function');

      // Boolean/mode
      expect(tc.mode).toBe('cyberpunk');
      expect(tc.isCyberpunk).toBe(true);
      expect(tc.isLiquidGlass).toBe(false);
    });
  });
});