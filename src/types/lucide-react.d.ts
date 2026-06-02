// Type declarations for lucide-react v0.487.0
// The package ships without bundled type definitions, so we declare them here.
// Based on the dynamic.d.ts shipped with the package.

import 'lucide-react'

declare module 'lucide-react' {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'

  type SVGAttributes = Partial<SVGProps<SVGSVGElement>>
  type ElementAttributes = RefAttributes<SVGSVGElement> & SVGAttributes

  interface LucideProps extends ElementAttributes {
    size?: string | number
    absoluteStrokeWidth?: boolean
  }

  type LucideIcon = ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >

  // --- Icons used across the project ---
  export const Activity: LucideIcon
  export const AlertCircle: LucideIcon
  export const ArrowLeft: LucideIcon
  export const ArrowRight: LucideIcon
  export const BarChart3: LucideIcon
  export const Bot: LucideIcon
  export const Brain: LucideIcon
  export const Briefcase: LucideIcon
  export const Camera: LucideIcon
  export const CheckIcon: LucideIcon
  export const ChevronDownIcon: LucideIcon
  export const ChevronLeft: LucideIcon
  export const ChevronRight: LucideIcon
  export const ChevronRightIcon: LucideIcon
  export const CircleIcon: LucideIcon
  export const ClipboardList: LucideIcon
  export const Clock: LucideIcon
  export const Code: LucideIcon
  export const Copy: LucideIcon
  export const Cpu: LucideIcon
  export const Database: LucideIcon
  export const Download: LucideIcon
  export const Droplets: LucideIcon
  export const Edit: LucideIcon
  export const FileCode: LucideIcon
  export const FileText: LucideIcon
  export const FolderTree: LucideIcon
  export const GitBranch: LucideIcon
  export const Globe: LucideIcon
  export const GripVerticalIcon: LucideIcon
  export const Headphones: LucideIcon
  export const Heart: LucideIcon
  export const Layers: LucideIcon
  export const LayoutDashboard: LucideIcon
  export const Link: LucideIcon
  export const Loader2: LucideIcon
  export const Mail: LucideIcon
  export const MapPin: LucideIcon
  export const Megaphone: LucideIcon
  export const MessageCircle: LucideIcon
  export const MessageSquare: LucideIcon
  export const Mic: LucideIcon
  export const Minus: LucideIcon
  export const MinusIcon: LucideIcon
  export const MoreHorizontal: LucideIcon
  export const Palette: LucideIcon
  export const PanelLeftIcon: LucideIcon
  export const Paperclip: LucideIcon
  export const Phone: LucideIcon
  export const PhoneForwarded: LucideIcon
  export const Plug: LucideIcon
  export const Plus: LucideIcon
  export const RefreshCw: LucideIcon
  export const RotateCcw: LucideIcon
  export const Save: LucideIcon
  export const ScrollText: LucideIcon
  export const SearchIcon: LucideIcon
  export const Send: LucideIcon
  export const Settings: LucideIcon
  export const Settings2: LucideIcon
  export const Smartphone: LucideIcon
  export const Sparkles: LucideIcon
  export const Star: LucideIcon
  export const Target: LucideIcon
  export const Trash2: LucideIcon
  export const Type: LucideIcon
  export const Upload: LucideIcon
  export const User: LucideIcon
  export const Users: LucideIcon
  export const WifiOff: LucideIcon
  export const WrapText: LucideIcon
  export const Wrench: LucideIcon
  export const X: LucideIcon
  export const XIcon: LucideIcon
  export const Zap: LucideIcon

  // Dynamic icon creation
  export function createLucideIcon(name: string, iconNode: unknown): LucideIcon
}
