/**
 * YYC³ Liquid Glass Theme Wrapper
 * 液态玻璃主题包装器 - 根据当前主题自动切换视觉风格。
 * 在 cyberpunk 模式下直接透传子组件，在 liquidGlass 模式下
 * 注入浮动光晕背景层和 CSS 变量覆盖。
 */

import { type ReactNode, useEffect } from 'react';

import { useThemeSwitcher } from './theme-switcher-context';

interface LiquidGlassWrapperProps {
  children: ReactNode;
}

/**
 * Theme-aware wrapper that injects liquid glass background effects.
 * In cyberpunk mode, renders children as-is; in liquidGlass mode,
 * injects floating glow orbs and CSS variable overrides into the DOM.
 *
 * @param children - Application content to wrap.
 */
export function LiquidGlassWrapper({ children }: LiquidGlassWrapperProps) {
  const { theme } = useThemeSwitcher();

  // 根据主题动态添加/移除粒子和光晕
  useEffect(() => {
    if (theme === 'liquidGlass') {
      // 添加液态背景光晕
      const glowContainer = document.getElementById('liquid-glow-container');
      if (!glowContainer) {
        const container = document.createElement('div');
        container.id = 'liquid-glow-container';
        container.className = 'liquid-background';
        container.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 20% 30%, rgba(0, 255, 135, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 60% 20%, rgba(0, 255, 170, 0.08) 0%, transparent 50%);
          background-size: 200% 200%;
          animation: liquidFlow 15s ease-in-out infinite;
        `;

        // 添加3个光晕元素
        for (let i = 1; i <= 3; i++) {
          const glow = document.createElement('div');
          glow.className = `liquid-glow glow-${i}`;
          container.appendChild(glow);
        }

        // 添加粒子
        for (let i = 0; i < 20; i++) {
          const particle = document.createElement('div');
          particle.className = `particle particle-${['sm', 'md', 'lg'][i % 3]}`;
          particle.style.cssText = `
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 10}s;
          `;
          container.appendChild(particle);
        }

        document.body.appendChild(container);
      }
    } else {
      // 移除液态背景
      const glowContainer = document.getElementById('liquid-glow-container');
      if (glowContainer) {
        glowContainer.remove();
      }
    }

    return () => {
      // 清理
      const glowContainer = document.getElementById('liquid-glow-container');
      if (glowContainer) {
        glowContainer.remove();
      }
    };
  }, [theme]);

  if (theme === 'cyberpunk') {
    // 赛博朋克主题：直接渲染原组件
    return <>{children}</>;
  }

  // 液态玻璃主题：添加主题类名包装器
  return (
    <div className="liquid-glass-theme-wrapper" style={{ position: 'relative', zIndex: 1 }}>
      {children}
    </div>
  );
}

/**
 * A glassmorphism or neomorphism card component for the Liquid Glass theme.
 * Falls back to a standard container when the cyberpunk theme is active.
 */
interface LiquidCardProps {
  children: ReactNode;
  variant?: 'glass' | 'neo';
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}

export function LiquidCard({ 
  children, 
  variant = 'glass', 
  hoverable = true,
  className = '',
  onClick 
}: LiquidCardProps) {
  const { theme } = useThemeSwitcher();

  if (theme === 'cyberpunk') {
    // 赛博朋克主题：返回原样式
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    );
  }

  // 液态玻璃主题：应用新样式
  const cardClass = variant === 'glass' ? 'glass-card' : 'neo-card';
  const hoverClass = hoverable ? '' : 'pointer-events-none';

  return (
    <div 
      className={`${cardClass} ${hoverClass} ${className} spring-enter`}
      onClick={onClick}
      style={{
        padding: '24px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Theme-aware button component.
 * Applies liquid glass gradient styling in liquidGlass mode
 * and cyberpunk neon border styling in cyberpunk mode.
 */
interface LiquidButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function LiquidButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: LiquidButtonProps) {
  const { theme } = useThemeSwitcher();

  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '12px' },
    md: { padding: '12px 24px', fontSize: '14px' },
    lg: { padding: '16px 32px', fontSize: '16px' },
  };

  const variantStyles = {
    primary: theme === 'liquidGlass' 
      ? { className: 'btn-liquid' }
      : { 
          background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,212,255,0.1))',
          border: '1px solid rgba(0,240,255,0.3)',
          color: '#00f0ff',
        },
    secondary: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.7)',
    },
    ghost: {
      background: 'transparent',
      border: 'none',
      color: 'rgba(255,255,255,0.6)',
    },
  };

  if (theme === 'cyberpunk') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        style={{
          ...sizeStyles[size],
          ...(typeof variantStyles[variant] === 'object' && 'background' in variantStyles[variant] 
            ? variantStyles[variant] 
            : {}),
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {children}
      </button>
    );
  }

  // 液态玻璃主题
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variant === 'primary' ? 'btn-liquid' : ''} ${className}`}
      style={{
        ...sizeStyles[size],
        ...(variant !== 'primary' && typeof variantStyles[variant] === 'object' && 'background' in variantStyles[variant]
          ? variantStyles[variant]
          : {}),
        borderRadius: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

/**
 * Theme-aware text input component.
 * Applies glassmorphism focus glow in liquidGlass mode
 * and neon border focus effect in cyberpunk mode.
 */
interface LiquidInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}

export function LiquidInput({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  className = '',
}: LiquidInputProps) {
  const { theme } = useThemeSwitcher();

  if (theme === 'cyberpunk') {
    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        style={{
          background: 'rgba(10,10,10,0.6)',
          border: '1px solid rgba(0,240,255,0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          color: 'white',
          width: '100%',
          transition: 'all 0.3s ease',
        }}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`input-liquid ${className}`}
      style={{
        padding: '12px 16px',
        width: '100%',
      }}
    />
  );
}