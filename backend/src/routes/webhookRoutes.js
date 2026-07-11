import "dotenv/config"; // 👈 Adicione este import no topo de cada arquivo de rotas que usa o Stripe
import { Router } from "express";
import express from "express";
import admin from "firebase-admin";
import { db } from "../config/firebaseAdmin.js";
import { stripe } from "../config/stripe.js"; // 👈 Importa a instância já configurada e segura
import { Timestamp } from "firebase-admin/firestore";
// No topo do seu server.js, importe o serviço:
import { sendOrderConfirmationEmail } from "../services/emailService.js";

// Inicialização segura com fallback para evitar quebras de compilação
const router = Router();

// Passamos o express.raw exclusivamente para essa sub-rota
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test";

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        let finalOrderData = null;

        await db.runTransaction(async (transaction) => {
          const lineItems = await stripe.checkout.sessions.listLineItems(
            session.id,
          );
          const orderItemsSnapshot = [];
          const userId = session?.metadata?.userId;

          for (const item of lineItems.data) {
            const productsRef = db.collection("products");
            const productQuery = await productsRef
              .where("stripePriceId", "==", item.price.id)
              .get();

            if (productQuery.empty) {
              throw new Error(
                `Produto com preço Stripe ${item.price.id} não encontrado no banco.`,
              );
            }

            const productDoc = productQuery.docs[0];
            const productData = productDoc.data();
            const productRef = productDoc.ref;

            const currentStock = productData.stock || 0;
            const purchasedQuantity = item.quantity;
            const newStock = currentStock - purchasedQuantity;

            if (newStock < 0) {
              throw new Error(
                `Estoque insuficiente para o produto ${productData.name} durante o processamento.`,
              );
            }

            transaction.update(productRef, { stock: newStock });

            orderItemsSnapshot.push({
              productId: productDoc.id,
              name: productData.name,
              priceAtPurchase: item.amount_total,
              quantity: purchasedQuantity,
              imageThumbnail: productData.images?.[0] || "",
            });
          }

          finalOrderData = {
            items: orderItemsSnapshot,
            totalAmount: session.amount_total,
            shippingAddress: shippingAddress,
          };

          const shippingDetails = session.shipping_details;
          const shippingAddress = {
            city: shippingDetails?.address?.city || "",
            country: shippingDetails?.address?.country || "",
            line1: shippingDetails?.address?.line1 || "",
            line2: shippingDetails?.address?.line2 || null,
            postalCode: shippingDetails?.address?.postal_code || "",
            state: shippingDetails?.address?.state || "",
          };

          const orderRef = db.collection("orders").doc();
          const orderData = {
            userId: session.metadata.userId,
            stripeSessionId: session.id,
            items: orderItemsSnapshot,
            totalAmount: session.amount_total,
            status: "paid",
            shippingAddress: shippingAddress,
            createdAt: admin.firestore.Timestamp.now(),
          };

          transaction.set(orderRef, orderData);

          //🔥 ESTRATÉGIA DE LOG DE AUDITORIA (Coleção 'transaction_logs')
          // Este documento registra dados imutáveis da transação financeira para relatórios e estornos
          const logRef = db
            .collection("transaction_logs")
            .doc(`log_${session.id}`);
          const transactionLogData = {
            logId: `log_${session.id}`,
            orderId: orderRef.id,
            userId: session.metadata.userId,
            stripeSessionId: session.id,
            stripeCustomerId: session.customer || null,
            paymentIntentId: session.payment_intent || null,
            amountReceived: session.amount_total, // Valor bruto recebido em centavos
            currency: session.currency || "brl",
            customerEmail: session.customer_details?.email || null,
            paymentStatus: session.payment_status, // Ex: "paid"
            environment: process.env.NODE_ENV || "development", // Identifica se foi teste ou produção
            ipAddress:
              req.headers["x-forwarded-for"] ||
              req.socket.remoteAddress ||
              "unknown",
            loggedAt: Timestamp.now(), // Data exata do processamento do log
          };

          // Salva o log de auditoria na mesma transação atômica do banco
          transaction.set(logRef, transactionLogData);

          // 3. Limpa o carrinho do usuário
          const cartRef = db.collection("carts").doc(session.metadata.userId);
          transaction.delete(cartRef);

          console.log(
            `✅ Pedido ${orderRef.id} e Log Financeiro log_${session.id} gravados com sucesso!`,
          );
        });

        // 🔥 WEBHOOK SALVOU COM SUCESSO? DISPARA O E-MAIL LOGO ABAIXO:
        if (finalOrderData && session.customer_details?.email) {
          const customerEmail = session.customer_details.email;
          const customerName =
            session.customer_details.name || "Cliente GlowStack";

          // Executa de forma assíncrona sem travar a resposta do webhook para o Stripe
          sendOrderConfirmationEmail(
            customerEmail,
            customerName,
            finalOrderData,
          );
        }
      } catch (error) {
        console.error(
          "❌ Erro crítico ao processar transação e gerar log do pedido:",
          error,
        );
        return res.status(500).json({
          message: "Erro ao processar baixa de pedido e registrar log.",
        });
      }
    }

    // 🔥 CENÁRIO B: Sessão do Stripe Expirada ou Cancelada pelo Cliente
    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const userId = session.metadata.userId;

      console.log(
        `⚠️ Alerta: A sessão de checkout ${session.id} expirou ou foi cancelada pelo usuário ${userId}.`,
      );

      try {
        // Executa uma transação no banco para registrar o cancelamento automático
        await db.runTransaction(async (transaction) => {
          // 1. Buscamos se existe algum pedido registrado como pendente para essa sessão
          const ordersRef = db.collection("orders");
          const orderQuery = await ordersRef
            .where("stripeSessionId", "==", session.id)
            .get();

          if (!orderQuery.empty) {
            const orderDoc = orderQuery.docs[0];

            // Atualiza o status do pedido para cancelado no Firestore da GlowStack
            transaction.update(orderDoc.ref, {
              status: "cancelled",
              cancelledAt: Timestamp.now(),
            });

            console.log(
              `❌ Pedido ${orderDoc.id} atualizado para status: CANCELADO.`,
            );
          }

          // 2. LOG DE AUDITORIA DE FALHA (Coleção 'transaction_logs')
          // Registramos o log de cancelamento para controle administrativo e análise de conversão
          const logRef = db
            .collection("transaction_logs")
            .doc(`log_failed_${session.id}`);
          transaction.set(logRef, {
            logId: `log_failed_${session.id}`,
            stripeSessionId: session.id,
            userId: userId || "",
            amountAttempted: session.amount_total,
            paymentStatus: "expired_or_cancelled",
            environment: process.env.NODE_ENV || "development",
            loggedAt: Timestamp.now(),
          });
        });

        console.log(
          `✅ Log de falha gerado com sucesso para a sessão: ${session.id}`,
        );
      } catch (error) {
        console.error(
          "❌ Erro ao processar o webhook de cancelamento/expiração:",
          error,
        );
        return res
          .status(500)
          .json({ message: "Erro ao processar expiração de sessão." });
      }
    }

    // Avisa o Stripe que recebemos o evento com sucesso
    return res.status(200).json({ received: true });
  },
);

export default router;
