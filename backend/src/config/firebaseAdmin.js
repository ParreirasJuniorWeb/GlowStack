import { initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin'; // 👈 Importa o objeto padrão completo
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';

let serviceAccount;

// 1. Carga segura das credenciais em produção (Render)
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (parseError) {
    console.error("❌ ERRO CRÍTICO: Falha ao converter string do ENV em JSON válido.");
    process.exit(1);
  }
} else {
  // 2. Lógica local assíncrona corrigida para ES Modules utilizando dynamic import()
  try {
    // Carrega os módulos de forma assíncrona dinamicamente
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const keyPath = path.join(__dirname, '../../glowstack-e5313-firebase-adminsdk-fbsvc-6a6e4b54c0.json');

    if (fs.existsSync(keyPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    } else {
      throw new Error("Arquivo 'glowstack-e5313-firebase-adminsdk-fbsvc-6a6e4b54c0.json' ausente em ambiente local.");
    }
  } catch (localError) {
    console.error("❌ ERRO CRÍTICO NA CARGA LOCAL DO FIREBASE:", localError.message);
    process.exit(1);
  }
}

// 3. Inicialização e exportação segura do Singleton do Firestore
initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = getFirestore();
console.log("⚡ Firebase Admin conectado com sucesso no ambiente atual!");
