import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app'; // Importação modular explícita
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// 1. Garante a resolução correta de caminhos absolutos no ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Aponta para o arquivo JSON na mesma pasta deste script
const keyPath = path.join(__dirname, 'glowstack-e5313-firebase-adminsdk-fbsvc-6a6e4b54c0.json');

// Validação visual para te ajudar a debugar se o arquivo sumir
if (!fs.existsSync(keyPath)) {
  console.error(`❌ ERRO: O arquivo de credenciais não foi encontrado no caminho esperado:\n👉 ${keyPath}\n\nCertifique-se de colocar o arquivo JSON baixado do Firebase nessa mesma pasta com o nome exatamente igual.`);
  process.exit(1);
}

// 3. Carrega e inicializa o Firebase com o certificado explícito
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
console.log("⚡ Firebase Admin conectado com sucesso via Certificado!");

// 2. Massa de Dados Fictícios (Mock Data)
// ⚠️ ATENÇÃO: Substitua os campos stripePriceId e stripeProductId pelos IDs REAIS 
// criados no seu painel do Stripe (Produtos > Adicionar Produto), senão o Checkout falhará.
const makeupProducts = [
  {
    name: "Batom Matte Velvet - Rose Luxury",
    description: "Acabamento matte aveludado de altíssima fixação. Não resseca os lábios e entrega cor intensa desde a primeira passada.",
    price: 5990, // R$ 59,90 (sempre em centavos)
    stripePriceId: "price_1Qxyz... Substitua pelo seu ID do Stripe", 
    stripeProductId: "prod_1Qxyz... Substitua pelo seu ID do Stripe",
    images: ["https://unsplash.com"],
    category: "labios",
    stock: 15,
    rating: 4.8,
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    name: "Base Fluida Serum - Glow Radiance",
    description: "Base de cobertura média construível com infusão de ácido hialurônico. Deixa a pele com aspecto natural, luminoso e saudável.",
    price: 8990, // R$ 89,90
    stripePriceId: "price_1Qabc... Substitua pelo seu ID do Stripe",
    stripeProductId: "prod_1Qabc... Substitua pelo seu ID do Stripe",
    images: ["https://unsplash.com"],
    category: "pele",
    stock: 8,
    rating: 4.9,
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    name: "Paleta de Sombras - Cosmic Eyes",
    description: "9 tons ultra pigmentados entre mattes aveludados e cintilantes multidimensionais. Perfeita para looks do dia a dia ou grandes eventos.",
    price: 12490, // R$ 124,90
    stripePriceId: "price_1Qdef... Substitua pelo seu ID do Stripe",
    stripeProductId: "prod_1Qdef... Substitua pelo seu ID do Stripe",
    images: ["https://unsplash.com"],
    category: "olhos",
    stock: 5,
    rating: 4.7,
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    name: "Sérum Hidratante - Primer Glow",
    description: "O segredo para a maquiagem durar o dia todo. Hidrata profundamente, minimiza poros e deixa um viço radiante ideal para receber a base.",
    price: 7490, // R$ 74,90
    stripePriceId: "price_1Qghi... Substitua pelo seu ID do Stripe",
    stripeProductId: "prod_1Qghi... Substitua pelo seu ID do Stripe",
    images: ["https://unsplash.com"],
    category: "skincare",
    stock: 20,
    rating: 4.6,
    createdAt: admin.firestore.Timestamp.now()
  }
];

// 3. Função de Execução do Seed
const seedDatabase = async () => {
  console.log('✨ Iniciando injeção de produtos na GlowStack...');
  const productsRef = db.collection('products');

  try {
    for (const product of makeupProducts) {
      // Usamos add() para que o Firebase gere um ID automático para o documento do produto
      const docRef = await productsRef.add(product);
      console.log(`✅ Produto adicionado com sucesso: "${product.name}" (ID: ${docRef.id})`);
    }
    console.log('🚀 Todos os produtos de maquiagem foram injetados com sucesso!');
  } catch (error) {
    console.error('❌ Erro crítico ao injetar dados no Firestore:', error);
  } finally {
    process.exit(); // Encerra a execução do processo Node
  }
};

// Dispara a execução do script
seedDatabase();
