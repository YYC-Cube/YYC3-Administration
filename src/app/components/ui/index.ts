/**
 * @file index.ts
 * @description Unified export index for UI primitives
 *   2026-08-19 精简:P1 死代码清理后仅保留有消费者或配套单测的基础组件
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags ui, components, export
 */

export { Button } from './button'
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
export { Input } from './input'
export { Textarea } from './textarea'
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'
export { Badge } from './badge'
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
export { Label } from './label'
export { Progress } from './progress'
export { Avatar, AvatarFallback, AvatarImage } from './avatar'
export { Toaster } from './sonner'
export { useToast } from './use-toast'
export { cn } from './utils'
