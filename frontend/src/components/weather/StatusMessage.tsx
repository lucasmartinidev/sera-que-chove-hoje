import { Button } from '@/components/ui/button'

type StatusMessageProps = {
  message: string | null
  busy: boolean
  error: boolean
  onRetry?: () => void
}

export function StatusMessage({ message, busy, error, onRetry }: StatusMessageProps) {
  if (message === null) return null
  return (
    <div aria-busy={busy} aria-live={error ? 'assertive' : 'polite'} className={`mt-5 flex flex-wrap items-center justify-between gap-3 border-y py-3 text-sm ${error ? 'border-destructive/40 text-destructive' : 'border-border text-muted-foreground'}`} role={error ? 'alert' : 'status'}>
      <p>{message}</p>
      {busy && <div aria-hidden="true" className="flex gap-2"><span className="h-2 w-20 animate-pulse rounded bg-secondary" /><span className="h-2 w-12 animate-pulse rounded bg-secondary" /></div>}
      {onRetry && <Button onClick={onRetry} size="sm" type="button" variant="outline">Tentar novamente</Button>}
    </div>
  )
}
