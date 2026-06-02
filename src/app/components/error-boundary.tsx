import { AlertCircle, RefreshCw } from 'lucide-react'
import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  name?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            {this.props.name ? `${this.props.name} 加载失败` : '页面加载失败'}
          </h3>
          <p className="text-sm text-gray-400 mb-4 max-w-md">
            {this.state.error?.message || '发生了未知错误'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              bg-red-500/10 text-red-400 border border-red-500/20
              hover:bg-red-500/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
