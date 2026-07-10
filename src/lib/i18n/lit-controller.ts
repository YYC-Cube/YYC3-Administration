/**
 * file lit-controller.ts
 * description Lit 响应式控制器 (requires `lit` package — install if needed)
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * module @yyc3/i18n-core
 * author YanYuCloudCube Team <admin@0379.email>
 * version 2.3.0
 * created 2026-04-24
 * updated 2026-04-24
 * status active
 * tags [module]
 *
 * copyright YanYuCloudCube Team
 * license MIT
 *
 * brief Lit 响应式控制器
 */
import { i18n } from './engine'

import type { ReactiveController, ReactiveControllerHost } from 'lit'

export class I18nController implements ReactiveController {
  private host: ReactiveControllerHost
  private unsubscribe?: () => void

  constructor(host: ReactiveControllerHost) {
    this.host = host
    this.host.addController(this)
  }

  hostConnected() {
    this.unsubscribe = i18n.subscribe(() => {
      this.host.requestUpdate()
    })
  }

  hostDisconnected() {
    this.unsubscribe?.()
  }
}
