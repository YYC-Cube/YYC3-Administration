'use client'

import { useCallback } from 'react'
import { toast as sonnerToast } from 'sonner'

export type ToastType = 'info' | 'success' | 'error' | 'warning'

export interface ToastConfig {
  duration?: number
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  action?: {
    label: string
    onClick: () => void
  }
}

const DEFAULT_CONFIG: ToastConfig = {
  duration: 4000,
}

export function useToast() {
  const toast = useCallback((type: ToastType, message: string, config: ToastConfig = {}) => {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config }
    const options: Parameters<typeof sonnerToast.success>[1] = {
      duration: mergedConfig.duration,
      action: mergedConfig.action
        ? {
            label: mergedConfig.action.label,
            onClick: mergedConfig.action.onClick,
          }
        : undefined,
    }

    switch (type) {
      case 'success':
        sonnerToast.success(message, options)
        break
      case 'error':
        sonnerToast.error(message, options)
        break
      case 'warning':
        sonnerToast.warning(message, options)
        break
      case 'info':
      default:
        sonnerToast.info(message, options)
        break
    }
  }, [])

  const success = useCallback(
    (message: string, config?: ToastConfig) => toast('success', message, config),
    [toast],
  )

  const error = useCallback(
    (message: string, config?: ToastConfig) => toast('error', message, config),
    [toast],
  )

  const warning = useCallback(
    (message: string, config?: ToastConfig) => toast('warning', message, config),
    [toast],
  )

  const info = useCallback(
    (message: string, config?: ToastConfig) => toast('info', message, config),
    [toast],
  )

  const loading = useCallback((message: string) => {
    return sonnerToast.loading(message)
  }, [])

  const dismiss = useCallback((id?: string | number) => {
    sonnerToast.dismiss(id)
  }, [])

  const dismissAll = useCallback(() => {
    sonnerToast.dismiss()
  }, [])

  return {
    toast,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    dismissAll,
  }
}

export type ToastReturn = ReturnType<typeof useToast>
