/**
 * @file index.ts
 * @description Unified export index for UI primitives
 *   2026-08-19 精简:P1 死代码清理后仅保留有消费者或配套单测的基础组件
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags ui, components, export
 */

export { Button } from '@/shared/ui/button'
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
export { Input } from '@/shared/ui/input'
export { Textarea } from '@/shared/ui/textarea'
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
export { Badge } from '@/shared/ui/badge'
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
export { Label } from '@/shared/ui/label'
export { Progress } from '@/shared/ui/progress'
export { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
export { Toaster } from '@/shared/ui/sonner'
export { useToast } from '@/shared/ui/use-toast'
export { cn } from '@/shared/ui/utils'
