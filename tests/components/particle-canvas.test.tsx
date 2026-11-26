/**
 * @file particle-canvas.test.tsx
 * @description 粒子背景画布单元测试(85×4 门禁冲刺)
 *   覆盖:创建粒子规模钳制、动画循环(脉冲/鼠标引力/环绕/连线)、
 *   鼠标追踪、resize 重算、主题开关挂载门控、ctx 缺失早退、卸载清理。
 *   注:组件为 React.memo 且无 props——运行时主题切换不会触发重渲染,
 *   关闭态仅能经全新挂载覆盖(与生产行为一致)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-27
 * @tags P2,testing,components,canvas,gate85
 */

import { cleanup, render } from '@testing-library/react'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ParticleCanvas } from '@/app/components/particle-canvas'

// useApp 桩:绕开完整 AppProvider(本组件只消费 theme 两个字段)
const useAppMock = vi.hoisted(() =>
  vi.fn((): { theme: { dataFlowEnabled: boolean; neonIntensity: number } } => ({
    theme: { dataFlowEnabled: true, neonIntensity: 80 },
  })),
)

vi.mock('@/app/components/app-context', () => ({
  useApp: () => useAppMock(),
}))

/** 2D 上下文桩:记录调用即覆盖绘图语句,无需真实像素 */
function makeCtxStub() {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    globalAlpha: 1,
    lineWidth: 1,
  }
}

const ctxStub = makeCtxStub()
// spy 全文件仅创建一次;beforeEach 只清历史 + 重设实现(避免 restore 周期互相干扰)
const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect')

const RECT_800x600 = {
  width: 800,
  height: 600,
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  bottom: 600,
  right: 800,
  toJSON: () => ({}),
} as DOMRect

beforeEach(() => {
  useAppMock.mockReset()
  useAppMock.mockReturnValue({ theme: { dataFlowEnabled: true, neonIntensity: 80 } })
  ctxStub.setTransform.mockClear()
  ctxStub.clearRect.mockClear()
  getContextSpy.mockClear()
  getContextSpy.mockImplementation(() => ctxStub as unknown as CanvasRenderingContext2D)
  rectSpy.mockClear()
  rectSpy.mockReturnValue(RECT_800x600)
})

afterEach(() => {
  cleanup()
})

afterAll(() => {
  getContextSpy.mockRestore()
  rectSpy.mockRestore()
})

async function runFrames(ms: number): Promise<void> {
  // setup.ts 将 RAF 桩为 setTimeout(0),真实计时器推进若干帧
  await new Promise((resolve) => setTimeout(resolve, ms))
}

describe('ParticleCanvas — 渲染门控', () => {
  it('dataFlowEnabled=true 时挂载 canvas 并运行动画循环', async () => {
    const { container } = render(<ParticleCanvas />)
    expect(container.querySelector('canvas')).not.toBeNull()
    await runFrames(60)
    // 动画至少跑过一帧:清屏被调用
    expect(ctxStub.clearRect).toHaveBeenCalled()
    expect(getContextSpy).toHaveBeenCalled()
  })

  it('dataFlowEnabled=false 时不渲染 canvas(挂载门控)', () => {
    useAppMock.mockReturnValue({ theme: { dataFlowEnabled: false, neonIntensity: 80 } })
    const { container } = render(<ParticleCanvas />)
    expect(container.querySelector('canvas')).toBeNull()
  })

  it('canvas.getContext 返回 null 时静默早退(无动画循环)', async () => {
    getContextSpy.mockImplementation(() => null)
    const { container } = render(<ParticleCanvas />)
    expect(container.querySelector('canvas')).not.toBeNull()
    await runFrames(30)
    expect(ctxStub.clearRect).not.toHaveBeenCalled()
  })
})

describe('ParticleCanvas — 动画循环细节', () => {
  it('鼠标移动/离开事件被追踪且不影响动画运行', async () => {
    const { container } = render(<ParticleCanvas />)
    const canvas = container.querySelector('canvas') as HTMLCanvasElement
    await runFrames(30)
    ctxStub.clearRect.mockClear()

    canvas.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 400, clientY: 300, bubbles: true }),
    )
    await runFrames(80) // 鼠标引力 + 鼠标连线分支
    canvas.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    await runFrames(40)

    expect(ctxStub.clearRect.mock.calls.length).toBeGreaterThan(0)
  })

  it('resize 事件触发重算(创建粒子 + setTransform)', async () => {
    render(<ParticleCanvas />)
    await runFrames(30)
    ctxStub.setTransform.mockClear()

    window.dispatchEvent(new Event('resize'))
    await runFrames(30)

    expect(ctxStub.setTransform).toHaveBeenCalled()
  })

  it('卸载后动画循环停止(cancelAnimationFrame 清理)', async () => {
    const { unmount } = render(<ParticleCanvas />)
    await runFrames(30)
    unmount()
    ctxStub.clearRect.mockClear()
    await runFrames(40)
    expect(ctxStub.clearRect).not.toHaveBeenCalled()
  })

  it('低强度霓虹(neonIntensity 边界)不崩溃', async () => {
    useAppMock.mockReturnValue({ theme: { dataFlowEnabled: true, neonIntensity: 0 } })
    render(<ParticleCanvas />)
    await runFrames(40)
    expect(ctxStub.clearRect).toHaveBeenCalled()
  })

  it('粒子规模钳制:小面积父容器仍产出最少 15 个粒子(经 arc 绘制节点验证)', async () => {
    rectSpy.mockReturnValue({ ...RECT_800x600, width: 40, height: 40 })
    render(<ParticleCanvas />)
    await runFrames(40)
    // 40*40*0.000035≈0.06 → 钳到 MIN 15;每粒子每帧 2 次 arc(节点+辉光)≥30
    expect(ctxStub.arc.mock.calls.length).toBeGreaterThanOrEqual(30)
  })
})
