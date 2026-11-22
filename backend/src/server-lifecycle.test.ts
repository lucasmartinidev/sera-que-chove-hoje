import type { Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerGracefulShutdown, SHUTDOWN_TIMEOUT_MS } from './server-lifecycle';

function createSignalTarget(): { target: Pick<NodeJS.Process, 'once'>; emit: (signal: NodeJS.Signals) => void } {
  const handlers = new Map<NodeJS.Signals, () => void>();
  const target = {
    once: (signal: NodeJS.Signals, handler: () => void) => {
      handlers.set(signal, handler);
      return target as unknown as NodeJS.Process;
    },
  };
  return { target: target as Pick<NodeJS.Process, 'once'>, emit: (signal) => handlers.get(signal)?.() };
}

describe('registerGracefulShutdown', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    process.exitCode = 0;
  });

  it('TU-23 fecha o servidor uma única vez ao receber sinais repetidos', () => {
    vi.useFakeTimers();
    const close = vi.fn((callback?: (error?: Error) => void) => callback?.());
    const signals = createSignalTarget();
    registerGracefulShutdown({ close } as unknown as Pick<Server, 'close'>, signals.target);
    signals.emit('SIGTERM');
    signals.emit('SIGINT');
    expect(close).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('TU-24 registra falha quando o fechamento HTTP falha', () => {
    const close = vi.fn((callback?: (error?: Error) => void) => callback?.(new Error('close failed')));
    const signals = createSignalTarget();
    registerGracefulShutdown({ close } as unknown as Pick<Server, 'close'>, signals.target);
    signals.emit('SIGTERM');
    expect(process.exitCode).toBe(1);
  });

  it('TU-25 força encerramento quando o fechamento excede o prazo', () => {
    vi.useFakeTimers();
    const close = vi.fn((_callback?: (error?: Error) => void) => undefined);
    const signals = createSignalTarget();
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    registerGracefulShutdown({ close } as unknown as Pick<Server, 'close'>, signals.target);
    signals.emit('SIGTERM');
    vi.advanceTimersByTime(SHUTDOWN_TIMEOUT_MS);
    expect(exit).toHaveBeenCalledWith(1);
  });
});
