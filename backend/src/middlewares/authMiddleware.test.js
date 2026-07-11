import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAdmin } from './authMiddleware';
import admin from 'firebase-admin';

// Simula (mock) o SDK do Firebase Admin para não bater no banco real durante os testes
vi.mock('firebase-admin', () => ({
  default: {
    auth: () => ({
      verifyIdToken: vi.fn(),
    }),
  },
}));

// Mock da lista de admins permitidos (deve coincidir com o configurado no seu middleware)
const MOCK_ADMIN_UID = 'admin_uid_123';

describe('Middleware de Segurança: requireAdmin', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  it('deve barrar a requisição com 401 se o cabeçalho de Autorização estiver ausente', async () => {
    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token de autenticação não fornecido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve barrar com 403 se o usuário estiver logado mas não for um Administrador listado', async () => {
    req.headers.authorization = 'Bearer token_valido_comum';
    
    // Simula o Firebase descriptografando um usuário comum legítimo
    admin.auth().verifyIdToken.mockResolvedValue({ uid: 'usuario_comum_456' });

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Acesso negado. Você não é um administrador.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar a função next() e autorizar o acesso se o UID estiver na lista de Admins', async () => {
    req.headers.authorization = `Bearer token_admin_secreto`;
    
    // Simula o Firebase descriptografando o UID do Administrador
    admin.auth().verifyIdToken.mockResolvedValue({ uid: MOCK_ADMIN_UID });

    await requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
