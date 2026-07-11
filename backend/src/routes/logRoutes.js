import { Router } from 'express';
import { db } from '../config/firebaseAdmin.js';
import { Timestamp } from 'firebase-admin/firestore';

const router = Router();

router.post('/logs/error', async (req, res) => {
  const { message, stack, component, userId, platform } = req.body;

  // Garante que pelo menos a mensagem do erro exista
  if (!message) {
    return res.status(400).json({ message: 'Dados do relatório de erro incompletos.' });
  }

  try {
    const errorRef = db.collection('system_errors').doc();
    
    const errorLogData = {
      logId: errorRef.id,
      message: message,
      stack: stack || 'Sem stack trace disponível',
      componentName: component || 'Backend / Desconhecido',
      userId: userId || 'Visitante Anônimo',
      platform: platform || 'Web/API Backend',
      environment: process.env.NODE_ENV || 'production',
      // Captura metadados do navegador ou origem da requisição
      userAgent: req.headers['user-agent'] || 'unknown',
      loggedAt: Timestamp.now()
    };

    await errorRef.set(errorLogData);
    
    // Alerta visual no terminal do servidor de produção
    console.error(`🚨 [LOG DE ERRO REGISTRADO]: ${message} no componente ${component}`);

    return res.status(201).json({ success: true, logId: errorRef.id });
  } catch (error) {
    console.error('❌ Falha catastrófica ao tentar gravar log de erro no Firestore:', error);
    return res.status(500).json({ message: 'Erro interno ao processar telemetria.' });
  }
});

export default router;
