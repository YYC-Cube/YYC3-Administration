/**
 * @file use-toast.tsx
 * @description YYC³ Toast notification utility — thin wrapper around `sonner`
 *   providing semantic helpers (success, error, warning, info) with
 *   consistent styling, auto-dismiss durations, and action support.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags ux,toast,notifications
 */

import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { toast } from 'sonner'

// ==========================================
// Types
// ==========================================

interface ToastOptions {
  /** Duration in ms (default: 4000 for success, 6000 for error) */
  duration?: number
  /** Action button label */
  actionLabel?: string
  /** Action callback */
  onAction?: () => void
  /** Show dismiss button (default: true) */
  dismissible?: boolean
}

// ==========================================
// Semantic Toast Helpers
// ==========================================

/** Show a success toast with a checkmark icon */
export function toastSuccess(message: string, description?: string, opts?: ToastOptions) {
  return toast.success(message, {
    description,
    duration: opts?.duration ?? 4000,
    icon: <CheckCircle2 className="w-4 h-4" />,
    action:
      opts?.actionLabel && opts.onAction
        ? { label: opts.actionLabel, onClick: opts.onAction }
        : undefined,
  })
}

/** Show an error toast with an alert icon */
export function toastError(message: string, description?: string, opts?: ToastOptions) {
  return toast.error(message, {
    description,
    duration: opts?.duration ?? 6000,
    icon: <AlertCircle className="w-4 h-4" />,
    action:
      opts?.actionLabel && opts.onAction
        ? { label: opts.actionLabel, onClick: opts.onAction }
        : undefined,
  })
}

/** Show a warning toast */
export function toastWarning(message: string, description?: string, opts?: ToastOptions) {
  return toast.warning(message, {
    description,
    duration: opts?.duration ?? 5000,
    icon: <AlertTriangle className="w-4 h-4" />,
    action:
      opts?.actionLabel && opts.onAction
        ? { label: opts.actionLabel, onClick: opts.onAction }
        : undefined,
  })
}

/** Show an info toast */
export function toastInfo(message: string, description?: string, opts?: ToastOptions) {
  return toast.info(message, {
    description,
    duration: opts?.duration ?? 4000,
    icon: <Info className="w-4 h-4" />,
    action:
      opts?.actionLabel && opts.onAction
        ? { label: opts.actionLabel, onClick: opts.onAction }
        : undefined,
  })
}

/** Show a loading toast that can be resolved/rejected */
export function toastLoading(message: string) {
  return toast.loading(message, {
    icon: <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />,
  })
}

/** Resolve a loading toast as success */
export function toastResolveSuccess(id: string | number, message: string, description?: string) {
  toast.success(message, {
    id,
    description,
    icon: <CheckCircle2 className="w-4 h-4" />,
  })
}

/** Resolve a loading toast as error */
export function toastResolveError(id: string | number, message: string, description?: string) {
  toast.error(message, {
    id,
    description,
    icon: <AlertCircle className="w-4 h-4" />,
  })
}

/** Dismiss a specific toast */
export function toastDismiss(id: string | number) {
  toast.dismiss(id)
}

/** Dismiss all toasts */
export function toastDismissAll() {
  toast.dismiss()
}

// Re-export the raw toast for flexibility
export { toast }
