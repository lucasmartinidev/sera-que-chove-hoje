import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createApp: vi.fn(),
  listen: vi.fn(),
  registerGracefulShutdown: vi.fn(),
  loggerInfo: vi.fn(),
}));

vi.mock('./app', () => ({ createApp: mocks.createApp }));
vi.mock('./config', () => ({ config: { port: 3010 } }));
vi.mock('./logger', () => ({ logger: { info: mocks.loggerInfo } }));
vi.mock('./server-lifecycle', () => ({ registerGracefulShutdown: mocks.registerGracefulShutdown }));

describe('backend entrypoint', () => {
  it('registra o servidor na porta configurada e o shutdown gracioso', async () => {
    const server = {};
    mocks.listen.mockImplementation((_port: number, callback: () => void) => {
      callback();
      return server;
    });
    mocks.createApp.mockReturnValue({ listen: mocks.listen });
    await import('./index');
    expect(mocks.listen).toHaveBeenCalledWith(3010, expect.any(Function));
    expect(mocks.loggerInfo).toHaveBeenCalledWith('Servidor iniciado na porta 3010');
    expect(mocks.registerGracefulShutdown).toHaveBeenCalledWith(server);
  });
});
