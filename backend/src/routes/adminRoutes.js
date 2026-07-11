import "dotenv/config"; // 👈 Adicione este import no topo de cada arquivo de rotas que usa o Stripe
import admin from 'firebase-admin';
import { Router } from "express";
import { db } from "../config/firebaseAdmin.js";
import { requireAdmin } from "../middlewares/authMiddleware.js";
import { Timestamp } from "firebase-admin/firestore";
import { stripe } from "../config/stripe.js"; // 👈 Importa a instância já configurada e segura

const router = Router();

// ROTA ADMIN: Atualizar estoque do produto de maquiagem
router.put("/admin/products/:id", requireAdmin, async (req, res) => {
  const productId = req.params.id;
  const { stock } = req.body;

  // Validações básicas de formato
  if (stock === undefined || stock < 0) {
    return res.status(400).json({
      message:
        "A quantidade em estoque deve ser um número maior ou igual a zero.",
    });
  }

  try {
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res
        .status(404)
        .json({ message: "Produto de maquiagem não encontrado." });
    }

    // Executa a atualização no Firestore
    await productRef.update({
      stock: Number(stock),
    });

    return res
      .status(200)
      .json({ message: "Produto atualizado com sucesso pelo administrador!" });
  } catch (error) {
    console.error("Erro ao atualizar produto via admin:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao salvar dados do produto." });
  }
});

// CADASTRAR NOVOS PRODUTOS

// com upload de imagem pelo painel do Admin
// Ela criará o produto no Stripe em tempo real usando a API deles e salvará
// o espelho completo com os IDs gerados no Firestore.

router.post("/products", requireAdmin, async (req, res) => {
  const { name, description, price, imageUrl, category, stock } = req.body;

  // Validação básica dos campos obrigatórios
  if (
    !name ||
    !description ||
    !price ||
    !imageUrl ||
    !category ||
    stock === undefined
  ) {
    return res
      .status(400)
      .json({ message: "Por favor, preencha todos os campos obrigatórios." });
  }

  try {
    const priceInCents = Number(price);

    // 1. Cria o Produto diretamente no catálogo do Stripe
    const stripeProduct = await stripe.products.create({
      name: name,
      description: description,
      images: [imageUrl],
    });

    // 2. Cria o Preço Avulso associado a esse produto no Stripe
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: priceInCents,
      currency: "brl",
    });

    // 3. Salva a estrutura completa e espelhada no Firestore da GlowStack
    const productRef = db.collection("products").doc(); // Gera ID automático no Firebase
    const newProductData = {
      name,
      description,
      price: priceInCents,
      stripePriceId: stripePrice.id, // ID gerado pelo Stripe
      stripeProductId: stripeProduct.id, // ID gerado pelo Stripe
      images: [imageUrl], // Array de URLs do Firebase Storage
      category,
      stock: Number(stock),
      rating: 5.0, // Novo produto começa com nota máxima
      createdAt: admin.firestore.Timestamp.now(),
    };

    await productRef.set(newProductData);

    return res.status(201).json({
      message:
        "Novo produto de maquiagem cadastrado com sucesso no Firebase e no Stripe!",
      productId: productRef.id,
    });
  } catch (error) {
    console.error("Erro ao cadastrar novo produto via admin:", error);
    return res.status(500).json({ message: "Erro interno ao criar produto.", error: error.message });
  }
});

// ROTA ADMIN: Atualização Completa do Produto (UPDATE)
router.put("/products/update/:id", requireAdmin, async (req, res) => {
  const productId = req.params.id;
  const { name, description, price, imageUrl, category, stock } = req.body;

  if (!name || !description || !price || !category || stock === undefined) {
    return res.status(400).json({ message: "Campos obrigatórios ausentes." });
  }

  try {
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    const currentData = productDoc.data();
    const priceInCents = Number(price);

    // Se o preço ou nome mudou, atualizamos no Stripe para manter os dados espelhados
    if (name !== currentData.name || priceInCents !== currentData.price) {
      await stripe.products.update(currentData.stripeProductId, { name: name });

      // Se o preço mudou, criamos um novo ID de preço no Stripe (eles são imutáveis)
      if (priceInCents !== currentData.price) {
        const newStripePrice = await stripe.prices.create({
          product: currentData.stripeProductId,
          unit_amount: priceInCents,
          currency: "brl",
        });
        req.body.stripePriceId = newStripePrice.id;
      }
    }

    // Atualiza o documento no Firestore
    await productRef.update({
      name,
      description,
      price: priceInCents,
      images: imageUrl ? [imageUrl] : currentData.images,
      category,
      stock: Number(stock),
      stripePriceId: req.body.stripePriceId || currentData.stripePriceId,
    });

    return res.status(200).json({ message: "Produto atualizado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar produto.", error: error.message });
  }
});

// ROTA ADMIN: Exclusão Física no Firebase + Arquivamento no Stripe (DELETE)
router.delete("/products/:id", requireAdmin, async (req, res) => {
  const productId = req.params.id;

  try {
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    const currentData = productDoc.data();

    // Desativa o produto no Stripe para que ele suma do catálogo de checkout
    await stripe.products.update(currentData.stripeProductId, {
      active: false,
    });

    // Deleta fisicamente o produto do Firestore da GlowStack
    await productRef.delete();

    return res.status(200).json({ message: "Produto removido com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao deletar produto.", error: error.message});
  }
});

router.get("/billing/dashboard", requireAdmin, async (req, res) => {
  try {
    // 1. Busca todos os logs de transação com status de sucesso ('paid')
    const logsRef = db.collection("transaction_logs");
    const snapshot = await logsRef.where("paymentStatus", "==", "paid").get();

    if (snapshot.empty) {
      return res.status(200).json({
        totalRevenue: 0,
        totalSalesCount: 0,
        averageTicket: 0,
        recentTransactions: [],
      });
    }

    let totalRevenueInCents = 0;
    const recentTransactions = [];

    // 2. Itera sobre os logs para calcular o faturamento de forma linear
    snapshot.forEach((doc) => {
      const data = doc.data();
      totalRevenueInCents += data.amountReceived;

      // Monta um mini snapshot das últimas transações para exibir no gráfico/painel
      recentTransactions.push({
        logId: data.logId,
        orderId: data.orderId,
        customerEmail: data.customerEmail,
        amount: data.amountReceived,
        date: data.loggedAt?.toDate().toLocaleDateString("pt-BR") || "",
      });
    });

    const totalSalesCount = snapshot.size;
    // Calcula o ticket médio em centavos de forma segura
    const averageTicketInCents =
      totalSalesCount > 0
        ? Math.round(totalRevenueInCents / totalSalesCount)
        : 0;

    // 3. Retorna os indicadores compilados e prontos para o React renderizar
    return res.status(200).json({
      totalRevenue: totalRevenueInCents, // Valor bruto retornado em centavos
      totalSalesCount: totalSalesCount,
      averageTicket: averageTicketInCents,
      // Retorna apenas as 5 transações mais recentes no payload
      recentTransactions: recentTransactions.slice(0, 5),
    });
  } catch (error) {
    console.error("Erro ao calcular faturamento administrativo:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao processar relatório financeiro.", error: error.message});
  }
});

export default router;
