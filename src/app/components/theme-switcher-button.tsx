/**
 * Full-size theme switcher toggle button.
 * Displays current theme label and animated icon; switches between
 * cyberpunk and liquid glass modes on click.
 */
import { Droplets, Palette } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { useThemeSwitcher } from './theme-switcher-context';

export function ThemeSwitcherButton() {
  const { theme, toggleTheme } = useThemeSwitcher();
  const isCyberpunk = theme === 'cyberpunk';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isCyberpunk ? '切换到液态玻璃主题' : '切换到赛博朋克主题'}
      style={{
        background: isCyberpunk 
          ? 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,212,255,0.1))'
          : 'linear-gradient(135deg, rgba(0,255,135,0.15), rgba(6,182,212,0.1))',
        border: `1px solid ${isCyberpunk ? 'rgba(0,240,255,0.3)' : 'rgba(0,255,135,0.3)'}`,
        borderRadius: '12px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: isCyberpunk ? '#00f0ff' : '#00ff87',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: isCyberpunk
          ? '0 0 20px rgba(0,240,255,0.15)'
          : '0 0 20px rgba(0,255,135,0.15)',
      }}
    >
      {/* 图标切换动画 */}
      <AnimatePresence mode="wait">
        {isCyberpunk ? (
          <motion.div
            key="cyberpunk"
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Palette className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div
            key="liquid"
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Droplets className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主题名称 */}
      <span className="text-xs font-medium tracking-wider">
        {isCyberpunk ? 'Cyberpunk' : 'Liquid Glass'}
      </span>

      {/* 主题标签 */}
      <span
        className="text-[9px] px-2 py-0.5 rounded-full"
        style={{
          background: isCyberpunk 
            ? 'rgba(0,240,255,0.1)' 
            : 'rgba(0,255,135,0.1)',
          border: `1px solid ${isCyberpunk ? 'rgba(0,240,255,0.2)' : 'rgba(0,255,135,0.2)'}`,
        }}
      >
        {isCyberpunk ? '赛博朋克' : '液态玻璃'}
      </span>

      {/* 悬停光晕 */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: isCyberpunk
            ? 'radial-gradient(circle at center, rgba(0,240,255,0.1), transparent 70%)'
            : 'radial-gradient(circle at center, rgba(0,255,135,0.1), transparent 70%)',
        }}
      />
    </motion.button>
  );
}

/**
 * Compact theme switcher button for the header bar.
 * Shows a minimal icon-only toggle with tooltip.
 */
export function ThemeSwitcherButtonCompact() {
  const { theme, toggleTheme } = useThemeSwitcher();
  const isCyberpunk = theme === 'cyberpunk';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={isCyberpunk ? '切换到液态玻璃主题' : '切换到赛博朋克主题'}
      style={{
        background: isCyberpunk 
          ? 'rgba(0,240,255,0.1)' 
          : 'rgba(0,255,135,0.1)',
        border: `1px solid ${isCyberpunk ? 'rgba(0,240,255,0.3)' : 'rgba(0,255,135,0.3)'}`,
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isCyberpunk ? '#00f0ff' : '#00ff87',
        transition: 'all 0.3s ease',
        boxShadow: isCyberpunk
          ? '0 0 15px rgba(0,240,255,0.2)'
          : '0 0 15px rgba(0,255,135,0.2)',
      }}
    >
      <AnimatePresence mode="wait">
        {isCyberpunk ? (
          <motion.div
            key="cyberpunk"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Palette className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="liquid"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Droplets className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}