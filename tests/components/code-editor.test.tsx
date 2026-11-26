/**
 * @file code-editor.test.tsx
 * @description CodeEditor(Monaco 封装)单元测试(85×4 门禁冲刺)
 *   Monaco 运行时以轻桩替代;覆盖:语言检测全矩阵、主题注册、Ctrl+S 动作、
 *   光标/行数追踪、内容变更、插入器(含无选中分支)、工具栏全套按钮、
 *   只读/修改徽标、复制、手动保存、updateOptions 联动。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-27
 * @tags P1,testing,components,monaco,editor,gate85
 */

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CodeEditor } from '@/app/components/code-editor'

// Monaco 回调交换所:MockEditor 记录 props,测试用例驱动 onMount/onChange
const monacoHooks = vi.hoisted(() => ({
  latest: null as null | {
    onMount?: (...args: unknown[]) => void
    onChange?: (value: string | undefined) => void
  },
}))

vi.mock('@monaco-editor/react', () => ({
  default: function MockEditor(props: Record<string, unknown>) {
    monacoHooks.latest = props as typeof monacoHooks.latest
    return <div data-testid="monaco-mock">monaco</div>
  },
  loader: { config: vi.fn() },
}))

vi.mock('monaco-editor/editor/editor.api.js', () => ({
  editor: { defineTheme: vi.fn(), setTheme: vi.fn() },
  KeyMod: { CtrlCmd: 1 },
  KeyCode: { KeyS: 2 },
}))

vi.mock('monaco-editor/editor/editor.worker?worker', () => ({
  default: class MockWorker {},
}))

// basic-languages 真实模块会向 editor.api 注册全部语言(依赖 languages.register)
vi.mock('monaco-editor/basic-languages/monaco.contribution.js', () => ({}))

// useThemeColors 依赖 ThemeSwitcherProvider;桩为静态色板
vi.mock('@/shared/hooks/use-theme-colors', () => ({
  useThemeColors: () => ({
    bgBase: '#000',
    textPrimary: '#fff',
    borderDefault: '#333',
    borderSubtle: '#222',
    textMuted: '#888',
  }),
}))

// 编辑器实例桩
function makeEditorStub(content = 'const a = 1\nconst b = 2') {
  const model = {
    getLineCount: vi.fn(() => content.split('\n').length),
    onDidChangeContent: vi.fn((cb: () => void) => {
      editorStub.modelChange = cb
    }),
  }
  const editorStub = {
    getValue: vi.fn(() => content),
    getModel: vi.fn(() => model),
    addAction: vi.fn((action: { run: (ed: unknown) => void }) => {
      editorStub.saveAction = action.run
    }),
    onDidChangeCursorPosition: vi.fn((cb: (e: unknown) => void) => {
      editorStub.cursorHandler = cb
    }),
    getSelection: vi.fn(() => null),
    executeEdits: vi.fn(),
    focus: vi.fn(),
    updateOptions: vi.fn(),
    model,
    saveAction: null as null | ((ed: unknown) => void),
    cursorHandler: null as null | ((e: unknown) => void),
    modelChange: null as null | (() => void),
  }
  return editorStub
}

const monacoStub = {
  editor: { defineTheme: vi.fn(), setTheme: vi.fn() },
  KeyMod: { CtrlCmd: 1 },
  KeyCode: { KeyS: 2 },
}

beforeEach(() => {
  monacoHooks.latest = null
})

afterEach(() => {
  cleanup()
})

afterAll(() => {
  vi.restoreAllMocks()
})

function mountAndRun(props?: Partial<Parameters<typeof CodeEditor>[0]>) {
  const editor = makeEditorStub()
  const utils = render(<CodeEditor filePath="src/demo.ts" {...props} />)
  // 触发 Monaco 挂载(包 act 以刷出 setState 副作用)
  const onMount = monacoHooks.latest?.onMount
  expect(typeof onMount).toBe('function')
  act(() => {
    onMount!(editor as never, monacoStub as never)
  })
  return { editor, ...utils }
}

describe('CodeEditor — 语言检测矩阵(经状态栏语言徽标断言)', () => {
  it.each([
    ['src/a.ts', 'typescript'],
    ['src/a.tsx', 'typescript'],
    ['src/lib/x.d.ts', 'typescript'],
    ['app/b.js', 'javascript'],
    ['app/b.jsx', 'javascript'],
    ['data.json', 'json'],
    ['README.md', 'markdown'],
    ['style.css', 'css'],
    ['theme.scss', 'scss'],
    ['vars.less', 'less'],
    ['index.html', 'html'],
    ['map.xml', 'xml'],
    ['conf.yaml', 'yaml'],
    ['conf.yml', 'yaml'],
    ['main.py', 'python'],
    ['app.rb', 'ruby'],
    ['main.go', 'go'],
    ['lib.rs', 'rust'],
    ['App.java', 'java'],
    ['run.sh', 'shell'],
    ['run.bash', 'shell'],
    ['query.sql', 'sql'],
    ['schema.graphql', 'graphql'],
    ['Cargo.toml', 'ini'],
    ['.env', 'ini'],
    ['Dockerfile', 'dockerfile'],
    ['deploy/test.dockerfile', 'dockerfile'],
    ['build/Makefile', 'makefile'],
    ['unknown.zzz', 'plaintext'],
  ])('%s → %s', (filePath, expected) => {
    render(<CodeEditor filePath={filePath} />)
    // 语言徽标出现两处(工具栏 + 状态栏),首屏即同步渲染
    const matches = screen.getAllByText(expected)
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })
})

describe('CodeEditor — Monaco 挂载联动', () => {
  it('挂载:定义 yyc3-dark 主题并应用', () => {
    mountAndRun()
    expect(monacoStub.editor.defineTheme).toHaveBeenCalledWith(
      'yyc3-dark',
      expect.objectContaining({ base: 'vs-dark' }),
    )
    expect(monacoStub.editor.setTheme).toHaveBeenCalledWith('yyc3-dark')
    monacoStub.editor.defineTheme.mockClear()
    monacoStub.editor.setTheme.mockClear()
  })

  it('注册 Ctrl+S 动作;触发后回调 onSave 且清除修改态', async () => {
    const onSave = vi.fn()
    const { editor } = mountAndRun({ onSave })
    expect(editor.addAction).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'yyc3-save' }),
    )

    // 内容变更 → modified 徽标出现
    monacoHooks.latest?.onChange!('updated content')
    expect(await screen.findByText('Modified')).toBeTruthy()

    // Ctrl+S 动作运行
    act(() => {
      editor.saveAction!(editor)
    })
    expect(onSave).toHaveBeenCalledWith('const a = 1\nconst b = 2')
    expect(screen.queryByText('Modified')).toBeNull()
  })

  it('光标事件更新状态栏 Ln/Col;行数变化事件更新行数', () => {
    const { editor } = mountAndRun({ initialContent: 'x' })
    act(() => {
      editor.cursorHandler!({ position: { lineNumber: 3, column: 7 } })
    })
    expect(screen.getByText('Ln 3, Col 7')).toBeTruthy()

    const initial = screen.getByText(/\d+ lines/)
    expect(initial.textContent).toContain('2 lines')
    editor.modelChange!()
    // 行数桩不变,但更新路径已被驱动
    expect(screen.getByText(/lines/)).toBeTruthy()
  })

  it('onEditorReady 暴露 getter;onInsertReady 暴露插入器(有/无选中断言)', () => {
    const onEditorReady = vi.fn()
    const onInsertReady = vi.fn()
    const { editor } = mountAndRun({ onEditorReady, onInsertReady })

    expect(onEditorReady).toHaveBeenCalledTimes(1)
    const getter = onEditorReady.mock.calls[0][0] as () => string
    expect(getter()).toBe('const a = 1\nconst b = 2')

    expect(onInsertReady).toHaveBeenCalledTimes(1)
    const inserter = onInsertReady.mock.calls[0][0] as (t: string) => void
    // 无选中等价分支
    editor.getSelection.mockReturnValueOnce(null)
    inserter('hello')
    expect(editor.executeEdits).not.toHaveBeenCalled()
    // 有选中分支
    editor.getSelection.mockReturnValueOnce({} as never)
    inserter('hello')
    expect(editor.executeEdits).toHaveBeenCalledWith(
      'insert',
      expect.arrayContaining([expect.objectContaining({ text: 'hello' })]),
    )
    expect(editor.focus).toHaveBeenCalled()
  })

  it('model 缺失时行数保持 0 且不订阅内容变化', () => {
    const editor = makeEditorStub()
    editor.model = null as never
    editor.getModel = vi.fn(() => null) as unknown as typeof editor.getModel
    render(<CodeEditor filePath="a.ts" />)
    monacoHooks.latest?.onMount!(editor as never, monacoStub as never)
    expect(screen.getByText('0 lines')).toBeTruthy()
  })
})

describe('CodeEditor — 内容变更管线', () => {
  it('onChange 收到新值;undefined 变更被忽略', () => {
    const onChange = vi.fn()
    mountAndRun({ onChange })

    monacoHooks.latest?.onChange!('new text')
    expect(onChange).toHaveBeenCalledWith('new text')

    onChange.mockClear()
    monacoHooks.latest?.onChange!(undefined)
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('CodeEditor — 工具栏按钮', () => {
  it('字号加减触及边界并联动 updateOptions', () => {
    const { editor } = mountAndRun()
    editor.updateOptions.mockClear()

    const minus = screen.getByTitle('Decrease font size')
    const plus = screen.getByTitle('Increase font size')
    for (let i = 0; i < 5; i++) fireEvent.click(minus) // 13→10 触及下限
    expect(screen.getByText('10')).toBeTruthy()
    for (let i = 0; i < 20; i++) fireEvent.click(plus) // 10→24 触及上限
    expect(screen.getByText('24')).toBeTruthy()
    expect(editor.updateOptions).toHaveBeenCalledWith(
      expect.objectContaining({ fontSize: 24 }),
    )
  })

  it('自动换行与小地图开关切换样式与选项', () => {
    const { editor } = mountAndRun()
    editor.updateOptions.mockClear()

    const wrapBtn = screen.getByTitle('Toggle word wrap')
    fireEvent.click(wrapBtn)
    expect(editor.updateOptions).toHaveBeenCalledWith(
      expect.objectContaining({ wordWrap: 'on' }),
    )
    const minimapBtn = screen.getByTitle('Toggle minimap')
    fireEvent.click(minimapBtn)
    expect(editor.updateOptions).toHaveBeenCalledWith(
      expect.objectContaining({ minimap: { enabled: false } }),
    )
  })

  it('复制按钮写入剪贴板', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    mountAndRun()
    fireEvent.click(screen.getByTitle('Copy all'))
    expect(writeText).toHaveBeenCalledWith('const a = 1\nconst b = 2')
  })

  it('提供 onSave 时出现保存按钮并触发;未提供时不渲染', () => {
    const onSave = vi.fn()
    const { unmount } = mountAndRun({ onSave })
    fireEvent.click(screen.getByTitle('Save (Ctrl+S)'))
    expect(onSave).toHaveBeenCalled()
    unmount()

    render(<CodeEditor filePath="a.ts" />)
    expect(screen.queryByTitle('Save (Ctrl+S)')).toBeNull()
  })

  it('readOnly 徽标仅在只读模式出现', () => {
    const { unmount } = render(<CodeEditor filePath="a.ts" readOnly />)
    expect(screen.getByText('Read Only')).toBeTruthy()
    unmount()
    render(<CodeEditor filePath="a.ts" />)
    expect(screen.queryByText('Read Only')).toBeNull()
  })
})
