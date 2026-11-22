import { useApiHealth, type ApiStatus } from './hooks/useApiHealth'

const STATUS_COLOR: Record<ApiStatus, string> = {
  checking: 'bg-yellow-500',
  online: 'bg-green-500',
  offline: 'bg-red-500',
}

function App() {
  const apiStatus = useApiHealth()

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center relative">
      <h1 className="text-6xl font-bold text-foreground">template</h1>
      <div role="status" aria-live="polite" aria-label={`API Status: ${apiStatus}`} className="absolute bottom-8 flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full backdrop-blur-sm">
        <span aria-hidden="true" className={`w-3 h-3 rounded-full ${STATUS_COLOR[apiStatus]} animate-pulse`} />
        <span className="text-sm text-muted-foreground font-medium">API Status</span>
      </div>
    </main>
  )
}

export default App
