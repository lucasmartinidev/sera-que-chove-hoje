type LogContext = Record<string, unknown>;
type LogLevel = 'info' | 'warn' | 'error';

function errorContext(error: unknown): LogContext {
  if (error instanceof Error) {
    return { error: error.message, stack: error.stack };
  }
  return { error: String(error) };
}

function writeLog(level: LogLevel, message: string, context: LogContext = {}): void {
  const output = JSON.stringify({
    ...context,
    timestamp: new Date().toISOString(),
    level,
    message,
  });
  if (level === 'error') {
    console.error(output);
    return;
  }
  console.log(output);
}

export const logger = {
  info(message: string, context?: LogContext): void {
    writeLog('info', message, context);
  },
  warn(message: string, context?: LogContext): void {
    writeLog('warn', message, context);
  },
  error(message: string, error?: unknown, context?: LogContext): void {
    writeLog('error', message, error === undefined ? context : { ...errorContext(error), ...context });
  },
};
