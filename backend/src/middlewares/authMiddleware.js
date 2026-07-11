import admin from 'firebase-admin';

// LISTA DE ADMINS PERMITIDOS: Cole aqui o seu UID gerado no Firebase Auth
const ADMIN_UIDS = ['nxmdPzshUdWxknipWgtj2eYcFXs2'];

// Middleware de Segurança para verificar se a requisição é de um Admin real
export const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // O Firebase Admin descriptografa o token JWT enviado pelo React
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Valida se o UID do token está na nossa lista de administradores
    if (!ADMIN_UIDS.includes(decodedToken.uid)) {
      return res.status(403).json({ message: 'Acesso negado. Você não é um administrador.' });
    }

    req.user = decodedToken;
    next(); // Permite que a requisição prossiga para a rota
  } catch (error) {
    console.error('Erro ao verificar token do admin:', error);
    return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
  }
};
